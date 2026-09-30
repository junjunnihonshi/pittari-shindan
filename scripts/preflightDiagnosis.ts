/**
 * 公開前の軽量確認。対象の診断だけを全到達可能パターンで実行し、PASS / WARN / ERROR と主要な数字だけを表示する。
 *
 *   npm run diagnosis:preflight -- <id>                … 登録済みの診断を確認
 *   npm run diagnosis:preflight -- <id> --details      … WARN / ERROR の項目だけ内訳も表示
 *   npm run diagnosis:preflight -- <id> --file <path>  … 任意の診断ファイルを確認
 *
 * ERROR（終了コード1。公開しない）：validate エラー・eligibility 違反・予算超過の通常ランキング混入・順位と相性%の矛盾・理由文の矛盾
 * WARN（公開は止めない。気になるときだけ --details で確認）：
 *   1位0回の商品 / 1商品の1位占有率30%以上 / 1位60%未満が20%以上 / ID順 tieBreak が10%以上 / supplements が30%以上
 * 集計は scripts/lib/diagnosisStats.ts（npm run diagnosis:validate と共通）。
 */
import { runDiagnosis } from '../src/engine/diagnosisEngine.ts'
import { analyzeDiagnosis, loadDiagnosis, parseTargetArgs, type DiagnosisStats, type ErrorKind } from './lib/diagnosisStats.ts'

/** WARN の目安（割合は 0〜1） */
const WARN = { concentration: 0.3, lowMatch: 0.2, idTie: 0.1, supplements: 0.3 }

type Level = 'PASS' | 'WARN' | 'ERROR'

async function main() {
  const args = process.argv.slice(2)
  const details = args.includes('--details')
  const { id, file } = parseTargetArgs(args, 'npm run diagnosis:preflight -- <id> [--details] [--file <path>]')
  const d = await loadDiagnosis(id, file)
  const s = analyzeDiagnosis(d, runDiagnosis)
  const n = s.count
  const pct = (v: number) => `${((v / n) * 100).toFixed(1)}%`
  const short = (pid: string) => pid.replace(`${d.id}-`, '')
  const products = d.products.filter((p) => p.enabled)

  const lines: { level: Level; text: string; detail?: () => string[] }[] = []
  const errorLine = (kinds: ErrorKind[], label: string) => {
    const errs = s.errors.filter((e) => kinds.includes(e.kind))
    lines.push({ level: errs.length ? 'ERROR' : 'PASS', text: errs.length ? `${label} ${errs.length}件` : label, detail: () => errs.slice(0, 10).map((e) => e.message) })
  }

  // ERROR
  errorLine(['data'], `validate ${n} patterns`)
  errorLine(['eligibility'], 'eligibility')
  errorLine(['budget'], 'budget limits')
  errorLine(['order'], 'rank order / match %')
  errorLine(['reason'], 'reason text')

  // WARN
  const zero = products.filter((p) => !s.top1.has(p.id))
  lines.push({
    level: zero.length ? 'WARN' : 'PASS',
    text: zero.length ? `never first ${zero.map((p) => short(p.id)).join(', ')}` : 'never first none',
    detail: () => zero.map((p) => `${short(p.id)} ${p.name}：TOP3 ${s.top3.get(p.id) ?? 0}回`),
  })
  const [maxId, maxTop] = [...s.top1].sort((a, b) => b[1] - a[1])[0] ?? ['-', 0]
  lines.push({
    level: maxTop / n >= WARN.concentration ? 'WARN' : 'PASS',
    text: `first-place concentration max ${pct(maxTop)} (${short(maxId)})`,
    detail: () => topAnswers(s, (v) => v.top1.get(maxId) ?? 0, `${short(maxId)} が1位になる割合`),
  })
  lines.push({
    level: s.lowMatch / n >= WARN.lowMatch ? 'WARN' : 'PASS',
    text: `low-match (<60%) ${pct(s.lowMatch)} / <20% ${s.under20}`,
    detail: () => topAnswers(s, (v) => v.lowMatch, '1位60%未満の割合'),
  })
  lines.push({
    level: s.ties.id / n >= WARN.idTie ? 'WARN' : 'PASS',
    text: `ID tie-break ${pct(s.ties.id)} (${s.ties.id})`,
    detail: () => [...s.idPairs].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k.replaceAll(`${d.id}-`, '')}：${v}件`),
  })
  lines.push({
    level: s.withSupplements / n >= WARN.supplements ? 'WARN' : 'PASS',
    text: `supplements ${pct(s.withSupplements)}`,
    detail: () => topAnswers(s, (v) => v.supplements, '別枠が出る割合'),
  })

  for (const l of lines) {
    console.log(`${l.level.padEnd(5)} ${l.text}`)
    if (details && l.level !== 'PASS' && l.detail) for (const t of l.detail()) console.log(`        ${t}`)
  }
  // 商品ごとの 1位 / TOP3 は1行にまとめる（詳細は diagnosis:validate と同じ）
  console.log(`      first ${products.map((p) => `${short(p.id)}:${s.top1.get(p.id) ?? 0}`).join(' ')}`)
  console.log(`      top3  ${products.map((p) => `${short(p.id)}:${s.top3.get(p.id) ?? 0}`).join(' ')}`)
  const hasWarn = lines.some((l) => l.level === 'WARN')
  const hasError = lines.some((l) => l.level === 'ERROR')
  if (hasWarn && !details && !hasError) console.log(`（WARN の内訳：npm run diagnosis:preflight -- ${id} --details）`)
  if (hasError) {
    if (!details) for (const e of s.errors.slice(0, 5)) console.error(`  ✖ ${e.message}`)
    process.exit(1)
  }
}

/** 回答（質問=選択肢）ごとに、指定した件数の割合が高いものを上から並べる */
function topAnswers(s: DiagnosisStats, pick: (v: DiagnosisStats['byAnswer'] extends Map<string, infer V> ? V : never) => number, label: string): string[] {
  return [...s.byAnswer]
    .map(([k, v]) => ({ k, rate: pick(v) / v.total, count: pick(v), total: v.total }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 6)
    .map((x) => `${label}：${x.k} ${(x.rate * 100).toFixed(1)}%（${x.count}/${x.total}）`)
}

main().catch((e: Error) => {
  console.error(`✖ ${e.message}`)
  process.exit(1)
})

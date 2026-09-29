/**
 * 1つの診断だけを全到達可能パターンで検証する（公開前の確認用。npm run check と同じ確認＋理由文・条件の詳細確認）。
 *
 *   npm run diagnosis:validate -- <id>                … 登録済み（src/data/diagnoses/index.ts）の診断を検証
 *   npm run diagnosis:validate -- <id> --file <path>  … 任意の診断ファイルを検証（生成の動作確認用）
 *
 * 問題が0件なら要約だけを表示し、問題があれば内容を最大10件表示して終了コード1で終わる。
 */
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { diagnoses } from '../src/data/diagnoses/index.ts'
import { validateDiagnoses } from '../src/data/validate.ts'
import { runDiagnosis, type DiagnosisResult } from '../src/engine/diagnosisEngine.ts'
import { scoreQuestion } from '../src/engine/scoring.ts'
import type { Answers, Diagnosis, Question } from '../src/types/diagnosis.ts'
import { checkPatterns, combinations } from './lib/diagnosisChecks.ts'

type Row = DiagnosisResult['results'][number]

/** 理由文の矛盾：「よく合っている」に挙げた回答の一致度が 0.8 未満、「やや差がある」に挙げた回答の一致度が 0.5 以上 */
function reasonProblems(r: Row): string[] {
  const out: string[] = []
  const [main, weakPart] = r.reason.split('一方で')
  const quoted = [...main.matchAll(/「([^」]+)」/g)].map((m) => m[1])
  for (const q of quoted) {
    const b = r.breakdown.find((b) => b.answerSummary === q)
    if (!b || b.score < 0.8) out.push(`理由文の矛盾（${r.product.id}：「${q}」の一致度が低い）`)
  }
  if (/よく合って|比較的合って/.test(main) && quoted.length === 0) out.push(`理由文の矛盾（${r.product.id}：根拠の回答がない）`)
  const weak = weakPart?.match(/「([^」]+)」（([^）]+)）/)
  if (weak) {
    const b = r.breakdown.find((b) => b.label === weak[1])
    if (!b || b.score >= 0.5) out.push(`理由文の矛盾（${r.product.id}：「${weak[1]}」は差がない）`)
  }
  return out
}

/** 完全同点の決着方法（tieBreak の段階）：質問の一致度 → 評価値 → 商品ID */
function tieStage(d: Diagnosis, a: Answers, x: Row, y: Row): 'question' | 'value' | 'id' {
  const used = d.questions.filter((q) => (q.options.find((o) => o.id === a[q.id])?.effects.length ?? 0) > 0)
  if (used.some((q) => scoreQuestion(q, a[q.id], x.product) !== scoreQuestion(q, a[q.id], y.product))) return 'question'
  const raw = (p: Row['product']) =>
    used
      .flatMap((q: Question) => q.options.find((o) => o.id === a[q.id])!.effects)
      .map((e) => (e.type === 'custom' || e.type === 'equals' || e.attr === 'priceRange' ? '' : String(p.attributes[e.attr])))
      .join('|')
  return raw(x.product) !== raw(y.product) ? 'value' : 'id'
}

async function load(id: string, file: string | undefined): Promise<Diagnosis> {
  if (!file) {
    const d = diagnoses.find((x) => x.id === id)
    if (!d) throw new Error(`診断「${id}」が src/data/diagnoses/index.ts に登録されていません`)
    return d
  }
  const mod = await import(pathToFileURL(path.resolve(file)).href)
  const d = Object.values(mod).find((v): v is Diagnosis => !!v && typeof v === 'object' && (v as Diagnosis).id === id)
  if (!d) throw new Error(`${file} に診断「${id}」がありません`)
  return d
}

async function main() {
  const args = process.argv.slice(2)
  const file = args.includes('--file') ? args[args.indexOf('--file') + 1] : undefined
  const id = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--file')
  if (!id) throw new Error('使い方: npm run diagnosis:validate -- <id> [--file <path>]')
  const d = await load(id, file)

  const errors: string[] = validateDiagnoses([d]).map((p) => `データ：${p}`)
  // 既存の確認（結果件数・スコア・条件外の混在・%の並び・別枠の構成）
  const base = checkPatterns(d, runDiagnosis)
  errors.push(...base.failures.map((f) => `${f.message} ${JSON.stringify(f.answers)}`))

  const top1 = new Map<string, number>()
  const top3 = new Map<string, number>()
  let lt20 = 0
  const ties = { question: 0, value: 0, id: 0 }
  for (const a of combinations(d)) {
    const r = runDiagnosis(d, a)
    const shown = [...r.ranked, ...r.supplements]
    const selected = d.questions.map((q) => q.options.find((o) => o.id === a[q.id])).filter((o) => !!o)
    const elig = selected.flatMap((o) => (o.eligibility ? [o.eligibility].flat() : []))
    const limits = selected.flatMap((o) => (o.maxPriceRange !== undefined ? [o.maxPriceRange] : []))
    const limit = limits.length ? Math.min(...limits) : Infinity
    const fail = (m: string) => errors.push(`${m} ${JSON.stringify(a)}`)
    // 条件・予算：通常ランキングの商品が本当に条件を満たすか（エンジンの判定とは別に商品データから確認）
    for (const x of r.ranked) {
      if (elig.some((e) => x.product.attributes[e.attr] !== e.value)) fail(`eligibility違反（${x.product.id}）`)
      if (x.product.priceRange > limit) fail(`予算違反（${x.product.id}）`)
    }
    const top = r.ranked[0] ?? r.supplements[0]
    const inLimitExists = d.products.some((p) => p.enabled && p.priceRange <= limit && !elig.some((e) => p.attributes[e.attr] !== e.value))
    if (top && inLimitExists && top.product.priceRange > limit) fail(`予算違反（予算内の商品があるのに1位が予算超え：${top.product.id}）`)
    // 相性%の不整合：表示用の%がスコアと一致しない
    for (const x of r.results) if (x.matchPercent !== Math.round(x.score * 100)) fail(`相性%の不整合（${x.product.id}）`)
    for (const x of shown) for (const m of reasonProblems(x)) fail(m)
    if (!top) continue
    top1.set(top.product.id, (top1.get(top.product.id) ?? 0) + 1)
    for (const x of shown.slice(0, 3)) top3.set(x.product.id, (top3.get(x.product.id) ?? 0) + 1)
    if (top.matchPercent < 20) lt20++
    const [x1, x2] = r.ranked.length >= 2 ? r.ranked : shown
    if (x1 && x2 && x1.score === x2.score) ties[tieStage(d, a, x1, x2)]++
  }

  const n = base.count
  const pct = (v: number) => `${v}（${((v / n) * 100).toFixed(1)}%）`
  const counts = (m: Map<string, number>) =>
    d.products.filter((p) => p.enabled).map((p) => `${p.id.replace(`${d.id}-`, '')}:${m.get(p.id) ?? 0}`).join(' ')
  console.log(`${d.name}（${d.id}）`)
  console.log(`全パターン: ${n} / エラー: ${errors.length}`)
  console.log(`1位回数: ${counts(top1)}`)
  console.log(`TOP3回数: ${counts(top3)}`)
  console.log(`20%未満: ${pct(lt20)} / 60%未満: ${pct(base.lowMatch)} / supplements: ${pct(base.withSupplements)}`)
  console.log(`tieBreak: ${ties.question + ties.value + ties.id}（質問の一致度 ${ties.question}・評価値 ${ties.value}・商品ID ${ties.id}）`)
  if (errors.length) {
    for (const e of errors.slice(0, 10)) console.error(`  ✖ ${e}`)
    if (errors.length > 10) console.error(`  … ほか ${errors.length - 10} 件`)
    process.exit(1)
  }
}

main().catch((e: Error) => {
  console.error(`✖ ${e.message}`)
  process.exit(1)
})

/**
 * 1つの診断だけを全到達可能パターンで検証する（公開前の確認用。npm run check と同じ確認＋理由文・条件の詳細確認）。
 *
 *   npm run diagnosis:validate -- <id>                … 登録済み（src/data/diagnoses/index.ts）の診断を検証
 *   npm run diagnosis:validate -- <id> --file <path>  … 任意の診断ファイルを検証（生成の動作確認用）
 *
 * 問題が0件なら要約だけを表示し、問題があれば内容を最大10件表示して終了コード1で終わる。
 * 集計は scripts/lib/diagnosisStats.ts（npm run diagnosis:preflight と共通）。
 */
import { runDiagnosis } from '../src/engine/diagnosisEngine.ts'
import { analyzeDiagnosis, loadDiagnosis, parseTargetArgs } from './lib/diagnosisStats.ts'

async function main() {
  const { id, file } = parseTargetArgs(process.argv.slice(2), 'npm run diagnosis:validate -- <id> [--file <path>]')
  const d = await loadDiagnosis(id, file)
  const s = analyzeDiagnosis(d, runDiagnosis)

  const n = s.count
  const pct = (v: number) => `${v}（${((v / n) * 100).toFixed(1)}%）`
  const counts = (m: Map<string, number>) =>
    d.products.filter((p) => p.enabled).map((p) => `${p.id.replace(`${d.id}-`, '')}:${m.get(p.id) ?? 0}`).join(' ')
  console.log(`${d.name}（${d.id}）`)
  console.log(`全パターン: ${n} / エラー: ${s.errors.length}`)
  console.log(`1位回数: ${counts(s.top1)}`)
  console.log(`TOP3回数: ${counts(s.top3)}`)
  console.log(`20%未満: ${pct(s.under20)} / 60%未満: ${pct(s.lowMatch)} / supplements: ${pct(s.withSupplements)}`)
  console.log(`tieBreak: ${s.ties.question + s.ties.value + s.ties.id}（質問の一致度 ${s.ties.question}・評価値 ${s.ties.value}・商品ID ${s.ties.id}）`)
  if (s.errors.length) {
    for (const e of s.errors.slice(0, 10)) console.error(`  ✖ ${e.message}`)
    if (s.errors.length > 10) console.error(`  … ほか ${s.errors.length - 10} 件`)
    process.exit(1)
  }
}

main().catch((e: Error) => {
  console.error(`✖ ${e.message}`)
  process.exit(1)
})

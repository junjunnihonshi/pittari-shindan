/**
 * 診断データの動作確認スクリプト（npm run check）
 * 全診断について「ありうる全ての回答の組み合わせ」で診断を実行し、
 * エラーが出ないこと・結果が表示されること・データに問題がないことを確認します。
 * （確認の中身は scripts/lib/diagnosisChecks.ts。公開ワークフローと共通）
 *
 *   npm run check                      … 全診断の入力チェック＋全診断の全パターン
 *   npm run check -- --only a,b        … 全診断の入力チェック＋指定した診断だけ全パターン
 *                                        （公開ワークフローの高速モード用。ほかの診断は依存ファイルのハッシュ一致で結果不変を確認済みの場合に使う）
 */
import { diagnoses } from '../src/data/diagnoses/index.ts'
import { validateDiagnoses } from '../src/data/validate.ts'
import { runDiagnosis } from '../src/engine/diagnosisEngine.ts'
import { checkPatterns } from './lib/diagnosisChecks.ts'

const args = process.argv.slice(2)
const only = args.includes('--only') ? new Set((args[args.indexOf('--only') + 1] ?? '').split(',').filter(Boolean)) : null
if (only) {
  const unknown = [...only].filter((id) => !diagnoses.some((d) => d.id === id))
  if (!only.size || unknown.length) {
    console.error(`✖ --only の診断IDが正しくありません：${unknown.join(', ') || '（空）'}`)
    process.exit(1)
  }
}

let failed = false
// 入力チェックは常に全診断（軽い処理なので省略しない）
const problems = validateDiagnoses(diagnoses)
for (const p of problems) console.warn('⚠', p)
if (problems.length) failed = true

console.log(`診断数: ${diagnoses.length} / 商品数: ${diagnoses.reduce((n, d) => n + d.products.length, 0)}` + (only ? `（全パターンは ${[...only].join(', ')} のみ）` : ''))
for (const d of diagnoses.filter((x) => !only || only.has(x.id))) {
  const report = checkPatterns(d, runDiagnosis)
  for (const f of report.failures) console.error(`✖ ${d.id}: ${f.message}`, f.answers)
  if (report.failures.length) failed = true
  console.log(
    `✔ ${d.name.padEnd(12, '　')} 質問${d.questions.length}問 商品${d.products.length}件 回答パターン${report.count}通り` +
      (report.neverTop.length ? `（1位にならない商品: ${report.neverTop.join(', ')}）` : ''),
  )
}
process.exit(failed ? 1 : 0)

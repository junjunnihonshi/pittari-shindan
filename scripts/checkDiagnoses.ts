/**
 * 診断データの動作確認スクリプト（npm run check）
 * 全診断について「ありうる全ての回答の組み合わせ」で診断を実行し、
 * エラーが出ないこと・結果が表示されること・データに問題がないことを確認します。
 * （確認の中身は scripts/lib/diagnosisChecks.ts。公開ワークフローと共通）
 */
import { diagnoses } from '../src/data/diagnoses/index.ts'
import { validateDiagnoses } from '../src/data/validate.ts'
import { runDiagnosis } from '../src/engine/diagnosisEngine.ts'
import { checkPatterns } from './lib/diagnosisChecks.ts'

let failed = false
const problems = validateDiagnoses(diagnoses)
for (const p of problems) console.warn('⚠', p)
if (problems.length) failed = true

console.log(`診断数: ${diagnoses.length} / 商品数: ${diagnoses.reduce((n, d) => n + d.products.length, 0)}`)
for (const d of diagnoses) {
  const report = checkPatterns(d, runDiagnosis)
  for (const f of report.failures) console.error(`✖ ${d.id}: ${f.message}`, f.answers)
  if (report.failures.length) failed = true
  console.log(
    `✔ ${d.name.padEnd(12, '　')} 質問${d.questions.length}問 商品${d.products.length}件 回答パターン${report.count}通り` +
      (report.neverTop.length ? `（1位にならない商品: ${report.neverTop.join(', ')}）` : ''),
  )
}
process.exit(failed ? 1 : 0)

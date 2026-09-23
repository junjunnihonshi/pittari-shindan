/**
 * 診断データの動作確認スクリプト（npm run check）
 * 全診断について「ありうる全ての回答の組み合わせ」で診断を実行し、
 * エラーが出ないこと・結果が表示されること・データに問題がないことを確認します。
 */
import { diagnoses } from '../src/data/diagnoses/index.ts'
import { validateDiagnoses } from '../src/data/validate.ts'
import { runDiagnosis } from '../src/engine/diagnosisEngine.ts'
import type { Answers, Diagnosis } from '../src/types/diagnosis.ts'

function* combinations(d: Diagnosis, i = 0, acc: Answers = {}): Generator<Answers> {
  if (i === d.questions.length) return yield { ...acc }
  const q = d.questions[i]
  for (const o of q.options) yield* combinations(d, i + 1, { ...acc, [q.id]: o.id })
}

let failed = false
const problems = validateDiagnoses(diagnoses)
for (const p of problems) console.warn('⚠', p)
if (problems.length) failed = true

console.log(`診断数: ${diagnoses.length} / 商品数: ${diagnoses.reduce((n, d) => n + d.products.length, 0)}`)
for (const d of diagnoses) {
  let count = 0
  const topCount = new Map<string, number>()
  for (const answers of combinations(d)) {
    count++
    const { results } = runDiagnosis(d, answers)
    if (results.length < Math.min(3, d.products.filter((p) => p.enabled).length)) {
      console.error(`✖ ${d.id}: 結果件数が不足`, answers)
      failed = true
    }
    if (results.some((r) => !(r.matchPercent >= 0 && r.matchPercent <= 100) || !r.reason)) {
      console.error(`✖ ${d.id}: スコアまたは理由が不正`, answers)
      failed = true
    }
    const top = results[0]?.product.id
    if (top) topCount.set(top, (topCount.get(top) ?? 0) + 1)
  }
  const never = d.products.filter((p) => p.enabled && !topCount.has(p.id)).map((p) => p.id)
  console.log(
    `✔ ${d.name.padEnd(12, '　')} 質問${d.questions.length}問 商品${d.products.length}件 回答パターン${count}通り` +
      (never.length ? `（1位にならない商品: ${never.join(', ')}）` : ''),
  )
}
process.exit(failed ? 1 : 0)

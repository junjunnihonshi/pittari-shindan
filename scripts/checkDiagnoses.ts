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
    const { results, ranked, supplements } = runDiagnosis(d, answers)
    const fail = (msg: string) => {
      console.error(`✖ ${d.id}: ${msg}`, answers)
      failed = true
    }
    // 画面に出る件数（通常ランキング＋別枠の補完候補）が、商品数の範囲で3件そろっていること
    if (ranked.length + supplements.length < Math.min(3, d.products.filter((p) => p.enabled).length)) fail('結果件数が不足')
    if (results.some((r) => !(r.matchPercent >= 0 && r.matchPercent <= 100) || !r.reason)) fail('スコアまたは理由が不正')
    // 通常ランキングには条件（予算・適格条件）を満たす商品だけが入り、相性%は上の順位ほど高い（同点は可）
    if (ranked.some((r) => r.overBudget || r.ineligible)) fail('通常ランキングに条件外の商品が混在')
    if (ranked.some((r, i) => i > 0 && r.matchPercent > ranked[i - 1].matchPercent)) fail('通常ランキングで下の順位の相性%が上の順位より高い')
    // 補完候補は、通常ランキングが3件未満のときだけ、条件外の商品で構成される
    if (supplements.length > 0 && ranked.length >= 3) fail('通常ランキングが3件あるのに補完候補がある')
    if (supplements.some((r) => !r.overBudget && !r.ineligible)) fail('補完候補に条件を満たす商品が混在')
    const top = (ranked[0] ?? supplements[0])?.product.id
    if (top) topCount.set(top, (topCount.get(top) ?? 0) + 1)
  }
  const never = d.products.filter((p) => p.enabled && !topCount.has(p.id)).map((p) => p.id)
  console.log(
    `✔ ${d.name.padEnd(12, '　')} 質問${d.questions.length}問 商品${d.products.length}件 回答パターン${count}通り` +
      (never.length ? `（1位にならない商品: ${never.join(', ')}）` : ''),
  )
}
process.exit(failed ? 1 : 0)

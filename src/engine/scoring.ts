import type { Answers, Effect, Product, Question } from '../types/diagnosis.ts'

/** 差（5段階での距離）→ 一致度。差が 1 なら 0.7、2 なら 0.35 … */
const DISTANCE_SCORE = [1, 0.7, 0.35, 0.1, 0]
/** 商品側にその項目のデータがない場合の中立スコア */
const NEUTRAL = 0.5

function distanceScore(diff: number): number {
  const d = Math.min(Math.round(Math.abs(diff)), DISTANCE_SCORE.length - 1)
  return DISTANCE_SCORE[d]
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

/** 1 つのルールについて、商品がどれだけ合っているか（0〜1） */
export function scoreEffect(effect: Effect, product: Product): number {
  if (effect.type === 'custom') return clamp01(effect.score(product))

  const raw = effect.attr === 'priceRange' ? product.priceRange : product.attributes[effect.attr]
  if (raw === undefined) return NEUTRAL

  switch (effect.type) {
    case 'equals':
      return raw === effect.value ? 1 : 0
    case 'near':
      return typeof raw === 'number' ? distanceScore(raw - effect.value) : NEUTRAL
    case 'atLeast':
      if (typeof raw !== 'number') return NEUTRAL
      return raw >= effect.value ? 1 : distanceScore(effect.value - raw)
    case 'atMost':
      if (typeof raw !== 'number') return NEUTRAL
      return raw <= effect.value ? 1 : distanceScore(raw - effect.value)
  }
}

/** 1 つの質問について、回答と商品の一致度（0〜1）。採点対象外なら null */
export function scoreQuestion(question: Question, optionId: string | undefined, product: Product): number | null {
  const option = question.options.find((o) => o.id === optionId)
  if (!option || option.effects.length === 0) return null
  let total = 0
  let weights = 0
  for (const effect of option.effects) {
    const w = effect.weight ?? 1
    total += scoreEffect(effect, product) * w
    weights += w
  }
  return weights > 0 ? total / weights : null
}

export interface QuestionBreakdown {
  questionId: string
  label: string
  answerSummary: string
  weight: number
  /** 0〜1 */
  score: number
  /** 複数のルールを持つ回答で、満たしていないルールがある（一部だけ一致）。理由文の表現に使う */
  partial?: boolean
}

/** 全質問の重み付き平均でスコア（0〜1）と内訳を返す */
export function scoreProduct(questions: Question[], answers: Answers, product: Product) {
  const breakdown: QuestionBreakdown[] = []
  let total = 0
  let weights = 0
  for (const q of questions) {
    const s = scoreQuestion(q, answers[q.id], product)
    if (s === null) continue
    const option = q.options.find((o) => o.id === answers[q.id])!
    const w = Math.max(0, q.weight)
    total += s * w
    weights += w
    const partial = option.effects.length > 1 && option.effects.some((e) => scoreEffect(e, product) < 1)
    breakdown.push({
      questionId: q.id,
      label: q.shortLabel,
      answerSummary: option.summary ?? option.label,
      weight: w,
      score: s,
      ...(partial ? { partial } : {}),
    })
  }
  // 全問「こだわらない」の場合は全商品同点（0.7）として扱う
  const score = weights > 0 ? total / weights : 0.7
  return { score, breakdown }
}

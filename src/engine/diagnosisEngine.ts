import type { Answers, Diagnosis, Product } from '../types/diagnosis.ts'
import { scoreProduct, type QuestionBreakdown } from './scoring.ts'

export interface ProductResult {
  product: Product
  /** 0〜1 */
  score: number
  /** 相性（%表示用、0〜100） */
  matchPercent: number
  breakdown: QuestionBreakdown[]
  /** おすすめ理由の文章 */
  reason: string
}

export interface DiagnosisResult {
  diagnosisId: string
  results: ProductResult[]
}

/** 表示可能な商品だけを返す（enabled かつ カテゴリ一致） */
export function getAvailableProducts(diagnosis: Diagnosis): Product[] {
  return diagnosis.products.filter((p) => p.enabled && p.category === diagnosis.id)
}

/** 全問回答済みか */
export function isComplete(diagnosis: Diagnosis, answers: Answers): boolean {
  return diagnosis.questions.every((q) => q.options.some((o) => o.id === answers[q.id]))
}

/** 保存されていた回答から、現在の質問データに存在するものだけを残す */
export function sanitizeAnswers(diagnosis: Diagnosis, answers: unknown): Answers {
  if (!answers || typeof answers !== 'object') return {}
  const out: Answers = {}
  for (const q of diagnosis.questions) {
    const v = (answers as Record<string, unknown>)[q.id]
    if (typeof v === 'string' && q.options.some((o) => o.id === v)) out[q.id] = v
  }
  return out
}

const STRONG = 0.8
const WEAK = 0.5

/** 内訳からおすすめ理由の文章を組み立てる（AI不使用のテンプレート方式） */
export function buildReason(itemName: string, breakdown: QuestionBreakdown[]): string {
  const sorted = [...breakdown].sort((a, b) => b.weight * b.score - a.weight * a.score)
  const strong = sorted.filter((b) => b.score >= STRONG).slice(0, 3)
  const weak = sorted.filter((b) => b.score < WEAK).sort((a, b) => b.weight - a.weight).slice(0, 1)

  let text: string
  if (strong.length > 0) {
    const list = strong.map((b) => `「${b.answerSummary}」`).join('、')
    text = `${list}というご回答と、この${itemName}の特徴がよく合っているため、相性が高くなりました。`
  } else if (breakdown.length > 0) {
    text = `いずれの条件とも大きなズレがなく、全体のバランスで相性が高くなりました。`
  } else {
    text = `特にこだわりがないとのご回答だったため、幅広い人に使いやすいタイプとして表示しています。`
  }
  if (weak.length > 0) {
    text += `一方で「${weak[0].label}」（${weak[0].answerSummary}）の条件とはやや差があります。`
  }
  return text
}

/** 診断を実行し、相性の高い順に並べた結果を返す */
export function runDiagnosis(diagnosis: Diagnosis, answers: Answers): DiagnosisResult {
  const products = getAvailableProducts(diagnosis)
  const results = products.map((product, index) => {
    const { score: base, breakdown } = scoreProduct(diagnosis.questions, answers, product)
    let score = base
    if (diagnosis.scoring?.adjust) {
      try {
        score = diagnosis.scoring.adjust({ product, answers, score: base })
      } catch (e) {
        console.error('[diagnosis] scoring.adjust でエラーが発生しました', e)
        score = base
      }
    }
    score = Number.isFinite(score) ? Math.min(1, Math.max(0, score)) : 0
    return {
      index,
      product,
      score,
      matchPercent: Math.round(score * 100),
      breakdown,
      reason: buildReason(diagnosis.itemName, breakdown),
    }
  })
  // スコアが同じ場合はデータの登録順を維持
  results.sort((a, b) => b.score - a.score || a.index - b.index)
  return {
    diagnosisId: diagnosis.id,
    results: results.map(({ product, score, matchPercent, breakdown, reason }) => ({
      product,
      score,
      matchPercent,
      breakdown,
      reason,
    })),
  }
}

import type { AnswerOption, Answers, Diagnosis, Product, Question } from '../types/diagnosis.ts'
import { scoreProduct, type QuestionBreakdown } from './scoring.ts'

/** 通常ランキングに表示する件数 */
export const TOP_N = 3

export interface ProductResult {
  product: Product
  /** 0〜1 */
  score: number
  /** 相性（%表示用、0〜100） */
  matchPercent: number
  breakdown: QuestionBreakdown[]
  /** おすすめ理由の文章 */
  reason: string
  /** 上限条件（予算）を超えている */
  overBudget?: boolean
  /** 適格条件（例：コードレス）を満たしていない */
  ineligible?: boolean
  /** 別枠で表示するときのラベル（例：「予算を少し超えます」） */
  supplementLabels?: string[]
}

export interface DiagnosisResult {
  diagnosisId: string
  /** すべての商品（通常ランキングの候補 → 補完候補の順） */
  results: ProductResult[]
  /** 通常ランキング（条件をすべて満たす商品。最大 TOP_N 件。足りなければ少なくてもよい） */
  ranked: ProductResult[]
  /** 通常ランキングが TOP_N 件に満たないときだけ表示する補完候補（順位は付けない） */
  supplements: ProductResult[]
  /** 結果画面の上部に表示する説明（適格条件を選んだときなど） */
  notices: string[]
}

const OVER_BUDGET_LABEL = '予算を少し超えます'

/** 1位の相性がこの値（%）未満なら scoring.lowMatchNotice を表示する */
export const LOW_MATCH_PERCENT = 60

/** 1位（通常ランキングが空なら補完候補の先頭）の相性が低いときの説明を notices に加える */
function withLowMatchNotice(diagnosis: Diagnosis, notices: string[], top: ProductResult | undefined): string[] {
  const text = diagnosis.scoring?.lowMatchNotice
  return text && top && top.matchPercent < LOW_MATCH_PERCENT ? [...notices, text] : notices
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
export function buildReason(itemName: string, breakdown: QuestionBreakdown[], softenPartial = false): string {
  const sorted = [...breakdown].sort((a, b) => b.weight * b.score - a.weight * a.score)
  const strong = sorted.filter((b) => b.score >= STRONG).slice(0, 3)
  const weak = sorted.filter((b) => b.score < WEAK).sort((a, b) => b.weight - a.weight).slice(0, 1)

  let text: string
  // scoring.softenPartialReason が有効な診断では、複数条件の一部だけ一致した回答を「比較的合っています」と表現する
  const full = softenPartial ? strong.filter((b) => !b.partial) : strong
  const partial = softenPartial ? strong.filter((b) => b.partial) : []
  if (softenPartial && strong.length > 0) {
    const quote = (list: QuestionBreakdown[]) => list.map((b) => `「${b.answerSummary}」`).join('、')
    text = full.length > 0
      ? `${quote(full)}というご回答と、この${itemName}の特徴がよく合っているため、相性が高くなりました。${partial.length > 0 ? `また、${quote(partial)}の条件とも比較的合っています。` : ''}`
      : `${quote(partial)}というご回答と、この${itemName}の特徴が比較的合っているため、相性が高くなりました。`
  } else if (strong.length > 0) {
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

type ScoredResult = ProductResult & { index: number }

/**
 * 完全同点（未丸めのスコアが同じ）のときの比較（scoring.tieBreak: true の診断だけで使用）。
 * 1. 質問ごとの一致度（重みの大きい質問から。重みが同じなら質問の並び順）
 * 2. 選んだ回答で使われた評価項目の元の値（採点と同じ重みで平均。価格・true/false の項目は使わない）
 * 3. 商品ID
 */
function makeTieBreaker(questions: Question[], answers: Answers) {
  const order = questions
    .map((q, i) => ({ q, i, option: q.options.find((o) => o.id === answers[q.id]) }))
    .filter((x): x is { q: Question; i: number; option: AnswerOption } => !!x.option && x.option.effects.length > 0)
    .sort((a, b) => b.q.weight - a.q.weight || a.i - b.i)
  const questionScore = (r: ProductResult, qid: string) => r.breakdown.find((b) => b.questionId === qid)?.score
  const rawValue = (p: Product, option: AnswerOption): number | undefined => {
    let sum = 0
    let weights = 0
    for (const e of option.effects) {
      if (e.type === 'custom' || e.type === 'equals' || e.attr === 'priceRange') continue
      const v = p.attributes[e.attr]
      if (typeof v !== 'number') continue
      const w = e.weight ?? 1
      // atLeast は値が大きいほど、atMost は小さいほど、near は目標に近いほど良い
      sum += (e.type === 'near' ? -Math.abs(v - e.value) : e.type === 'atMost' ? -v : v) * w
      weights += w
    }
    return weights > 0 ? sum / weights : undefined
  }
  return (x: ScoredResult, y: ScoredResult): number => {
    if (x.score !== y.score) return y.score - x.score
    for (const { q } of order) {
      const sx = questionScore(x, q.id)
      const sy = questionScore(y, q.id)
      if (sx !== undefined && sy !== undefined && sx !== sy) return sy - sx
    }
    for (const { option } of order) {
      const vx = rawValue(x.product, option)
      const vy = rawValue(y.product, option)
      if (vx !== undefined && vy !== undefined && vx !== vy) return vy - vx
    }
    return x.product.id < y.product.id ? -1 : x.product.id > y.product.id ? 1 : 0
  }
}

/**
 * 適格条件・上限条件による並び替え（該当する設定がある診断だけで使用）。
 * 通常ランキングの候補（条件をすべて満たす）→ 適格条件は満たすが予算超え → 適格条件を満たさない（予算内）→ どちらも満たさない
 * の順に並べる。適格条件（例：コードレス）の方を予算より優先する。
 */
function applySelection(questions: Question[], answers: Answers, sorted: ScoredResult[]) {
  const selected = questions.map((q) => q.options.find((o) => o.id === answers[q.id])).filter((o): o is AnswerOption => !!o)
  const eligibilities = selected.flatMap((o) => (o.eligibility ? [o.eligibility].flat() : []))
  const limits = selected.flatMap((o) => (o.maxPriceRange !== undefined ? [o.maxPriceRange] : []))
  const limit = limits.length > 0 ? Math.min(...limits) : undefined

  const flagged = sorted.map((r) => {
    const ineligible = eligibilities.some((e) => r.product.attributes[e.attr] !== e.value)
    const overBudget = limit !== undefined && r.product.priceRange > limit
    const supplementLabels = [
      ...(overBudget ? [OVER_BUDGET_LABEL] : []),
      ...eligibilities.filter((e) => r.product.attributes[e.attr] !== e.value).map((e) => e.supplementLabel ?? '条件の一部を満たさない候補'),
    ]
    return { ...r, overBudget, ineligible, supplementLabels }
  })
  const tier = (r: { overBudget: boolean; ineligible: boolean }) => (r.ineligible ? 2 : 0) + (r.overBudget ? 1 : 0)
  // 安定ソートなので、同じ段の中ではスコア順（タイブレーク済み）が保たれる
  const ordered = [...flagged].sort((a, b) => tier(a) - tier(b))
  const ranked = ordered.filter((r) => tier(r) === 0).slice(0, TOP_N)
  const supplements = ranked.length < TOP_N ? ordered.filter((r) => tier(r) > 0).slice(0, TOP_N - ranked.length) : []
  const notices = eligibilities.flatMap((e) => (e.notice ? [e.notice] : []))
  return { ordered, ranked, supplements, notices }
}

/** 内部用の index を取り除く */
const strip = (r: ScoredResult): ProductResult => {
  const out: ProductResult & { index?: number } = { ...r }
  delete out.index
  return out
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
      reason: buildReason(diagnosis.itemName, breakdown, diagnosis.scoring?.softenPartialReason === true),
    }
  })
  // スコアが同じ場合：タイブレーク設定があればそれに従い、なければデータの登録順を維持（従来どおり）
  const byScore = diagnosis.scoring?.tieBreak
    ? makeTieBreaker(diagnosis.questions, answers)
    : (a: ScoredResult, b: ScoredResult) => b.score - a.score || a.index - b.index
  results.sort(byScore)

  // 適格条件・上限条件を持つ選択肢がある診断だけ、条件による並び替えをする
  const usesSelection = diagnosis.questions.some((q) => q.options.some((o) => o.eligibility || o.maxPriceRange !== undefined))
  if (!usesSelection) {
    const plain = results.map(({ product, score, matchPercent, breakdown, reason }) => ({ product, score, matchPercent, breakdown, reason }))
    return { diagnosisId: diagnosis.id, results: plain, ranked: plain.slice(0, TOP_N), supplements: [], notices: withLowMatchNotice(diagnosis, [], plain[0]) }
  }
  const { ordered, ranked, supplements, notices } = applySelection(diagnosis.questions, answers, results)
  return {
    diagnosisId: diagnosis.id,
    results: ordered.map(strip),
    ranked: ranked.map(strip),
    supplements: supplements.map(strip),
    notices: withLowMatchNotice(diagnosis, notices, ranked[0] ?? supplements[0]),
  }
}

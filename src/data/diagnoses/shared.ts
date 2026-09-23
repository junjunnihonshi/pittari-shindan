/**
 * 診断データ作成用の共通ヘルパー。
 * 各診断ファイル（pillow.ts など）から使います。診断そのものではないので index.ts の一覧には登録しません。
 */
import type { AnswerOption, Question } from '../../types/diagnosis.ts'

export interface BudgetBand {
  /** ボタンの文言（例: "15,000円以下"） */
  label: string
  /** おすすめ理由で使う短い表現（例: "予算15,000円以下"） */
  summary: string
}

/**
 * 予算の質問を作ります。
 * - bands の n 番目（1始まり）を選ぶと、priceRange が n 以下の商品を満点とし、超える商品を段階的に減点します
 *   （priceRange の意味は各診断の priceLabels と対応させてください）
 * - noLimitLabel の選択肢は「予算を問わない」扱いで、この質問は採点に使いません
 * - 選択肢IDは b1, b2, …, any で固定です（端末に保存された前回の回答と対応するため、変更しないでください）
 */
export function budgetQuestion({
  bands,
  noLimitLabel,
  weight,
  text = 'ご予算は？',
  asLimit = false,
}: {
  bands: BudgetBand[]
  noLimitLabel: string
  weight: number
  text?: string
  /**
   * true にすると、予算を「上限条件」として扱います。
   * 予算内の商品を通常ランキングの候補にし、足りないときだけ予算を超える商品を別枠に表示します。
   */
  asLimit?: boolean
}): Question {
  const options: AnswerOption[] = bands.map((band, i) => ({
    id: `b${i + 1}`,
    label: band.label,
    summary: band.summary,
    effects: [{ type: 'atMost', attr: 'priceRange', value: i + 1 }],
    ...(asLimit ? { maxPriceRange: i + 1 } : {}),
  }))
  options.push({ id: 'any', label: noLimitLabel, effects: [] })
  return { id: 'budget', text, shortLabel: '予算', weight, options }
}

/**
 * 楽天市場APIで商品候補を検索するときの条件（カテゴリごと）。
 * 検索キーワードや除外ワードを変えたい場合はここを編集してください。
 */
export interface RakutenPreset {
  /** 診断ID（src/data/diagnoses の id と同じ） */
  category: string
  /** 検索キーワード（1つずつ順番に検索し、商品コードで重複を除きます） */
  keywords: string[]
  /** 除外キーワード（スペース区切り） */
  ngKeyword?: string
  /** 並び順（楽天API の sort パラメータ） */
  sort: string
  /** 1キーワードあたりの取得件数（1〜30） */
  hits: number
  minPrice?: number
  maxPrice?: number
  /** priceRange（1〜5）を決める価格の境界（円）。例: [3000, 6000, 10000] → 〜3000円=1, 〜6000円=2 … */
  priceThresholds: number[]
}

export const presets: Record<string, RakutenPreset> = {
  pillow: {
    category: 'pillow',
    keywords: ['枕 横向き寝', '枕 仰向け', '枕 高さ調整', '枕 洗える', '枕 低反発', '枕 パイプ'],
    ngKeyword: 'カバー ケース 抱き枕 クッション ペット 子供用 ベビー',
    sort: '-reviewCount',
    hits: 10,
    minPrice: 1000,
    // src/data/diagnoses/pillow.ts の priceLabels に合わせる（〜3,000 / 〜6,000 / 〜10,000 / それ以上）
    priceThresholds: [3000, 6000, 10000],
  },
}

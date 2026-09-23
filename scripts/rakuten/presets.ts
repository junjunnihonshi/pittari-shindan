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
  /**
   * 1ショップあたりの候補の上限（任意）。
   * メーカー公式店などが検索上位を占めて、特定メーカーに候補が偏るのを防ぎます。
   * 同じショップの候補はレビュー件数の多い順に残します。
   */
  maxPerShop?: number
  /**
   * 候補JSONの productDraft.attributes に用意する評価項目（任意）。
   * 値は null で出力されるので、人が商品ページを確認して記入します。
   */
  attributeKeys?: string[]
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

  /**
   * 掃除機：家庭の床掃除に使う「メイン掃除機」の候補。
   * 本番候補はコードレススティック・コード式スティック・キャニスター。
   * ロボット掃除機・ハンディ掃除機は対象外なので、候補に混ざっていたら確認時に除外してください。
   * （「ハンディ」は“2WAYでハンディにもなるスティック”の商品名にも多く含まれるため、除外ワードにはしていません）
   */
  vacuum: {
    category: 'vacuum',
    // 特性の違う商品を拾えるよう、タイプ・方式・用途別に検索する（メーカー名は入れない）
    keywords: [
      'コードレス掃除機 スティック',
      '紙パック式 掃除機',
      'キャニスター掃除機',
      'コード式 スティック掃除機',
      'ペット 毛 掃除機',
      '軽量 コードレス掃除機',
      'サイクロン 掃除機 吸引力',
      '静音 掃除機',
    ],
    ngKeyword: 'ロボット 布団クリーナー 車用 交換用 互換 部品 中古 訳あり',
    sort: '-reviewCount',
    hits: 10,
    // 替えブラシ・フィルターなどの付属品を除くための下限
    minPrice: 5000,
    // 同じショップ（メーカー公式店など）からは最大3件まで
    maxPerShop: 3,
    // src/data/diagnoses/vacuum.ts の priceLabels に合わせる（〜15,000 / 〜30,000 / 〜50,000 / それ以上）
    priceThresholds: [15000, 30000, 50000],
    // vacuum.ts の評価項目（確認時に記入する）
    attributeKeys: [
      'type',
      'cordless',
      'dustbox',
      'suction',
      'lightness',
      'easyCare',
      'quiet',
      'flooring',
      'carpet',
      'hair',
      'petHair',
      'largeDebris',
      'largeHome',
      'stablePower',
    ],
  },
}

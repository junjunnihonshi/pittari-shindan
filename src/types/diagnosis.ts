/**
 * 診断サイト全体で使う型定義。
 * 新しい診断は、この型に沿ったデータファイルを 1 つ追加するだけで作れます。
 */

/** 商品のカテゴリ固有の評価値。数値は基本的に 1〜5 の 5 段階で表します。 */
export type AttrValue = number | boolean | string

/** 価格帯。1 が最も安く、数字が大きいほど高価格帯（診断ごとに priceLabels で意味を定義） */
export type PriceRange = 1 | 2 | 3 | 4 | 5

export interface Product {
  /** 一意なID（例: "pillow-001"）。一度公開したら変更しないでください */
  id: string
  /** 商品名 */
  name: string
  /** 診断ID（例: "pillow"） */
  category: string
  /** 商品の短い説明 */
  description: string
  /** 価格帯（1〜5） */
  priceRange: PriceRange
  /** 特徴（箇条書きで表示） */
  features: string[]
  /** 良い点 */
  pros: string[]
  /** 気になる点 */
  cons: string[]
  /** 向いている人 */
  recommendFor: string
  /** 注意点（未設定の場合は cons の内容を表示） */
  caution?: string
  /** Amazon のリンク（もしもアフィリエイトのURLなど）。空欄ならボタンは「準備中」 */
  amazonUrl?: string
  /** 楽天市場のリンク。空欄ならボタンは「準備中」 */
  rakutenUrl?: string
  /** Yahoo!ショッピングのリンク。空欄なら非表示 */
  yahooUrl?: string
  /** メーカー公式サイトのリンク。空欄なら非表示 */
  officialUrl?: string
  /** 商品画像のURL（権利上問題のない画像のみ）。空欄ならプレースホルダー表示 */
  imageUrl?: string
  /** false にすると診断結果に出なくなります */
  enabled: boolean
  /** true の場合「仮データ」ラベルを表示します。実商品に差し替えたら false にしてください */
  sample?: boolean
  /** カテゴリ固有の評価項目（スコアリングで使用） */
  attributes: Record<string, AttrValue>
}

/**
 * 回答が商品のどの項目にどう効くかを表すルール。
 * - near:    商品の値が value に近いほど高得点（例: 硬さ 4 を希望）
 * - atLeast: 商品の値が value 以上なら満点、足りないほど減点（例: 静音性 4 以上）
 * - atMost:  商品の値が value 以下なら満点、超えるほど減点（例: 予算）
 * - equals:  商品の値が value と一致すれば満点（例: 洗える = true）
 * - custom:  独自の計算（0〜1 を返す関数）
 */
export type Effect =
  | { type: 'near'; attr: string; value: number; weight?: number }
  | { type: 'atLeast'; attr: string; value: number; weight?: number }
  | { type: 'atMost'; attr: string; value: number; weight?: number }
  | { type: 'equals'; attr: string; value: AttrValue; weight?: number }
  | { type: 'custom'; score: (product: Product) => number; weight?: number }

export interface AnswerOption {
  /** 選択肢ID（質問内で一意） */
  id: string
  /** ボタンに表示する文言 */
  label: string
  /** 補足説明（任意） */
  description?: string
  /** おすすめ理由の文章で使う短い表現（例: "横向き寝が多い"）。未設定なら label を使用 */
  summary?: string
  /** スコアへの影響。空配列の場合「こだわらない」扱いでこの質問は採点から除外 */
  effects: Effect[]
}

export interface Question {
  /** 質問ID（診断内で一意） */
  id: string
  /** 質問文 */
  text: string
  /** 結果画面の内訳で使う短い名前（例: "寝姿勢"） */
  shortLabel: string
  /** 補足説明（任意） */
  help?: string
  /** 重み（重要度）。大きいほど結果への影響が大きい */
  weight: number
  options: AnswerOption[]
}

export interface GuideSection {
  heading: string
  body: string
  points?: string[]
}

export type CategoryGroupId = 'life' | 'kitchen' | 'beauty' | 'digital' | 'travel' | 'pet'

/** 回答: 質問ID → 選択肢ID */
export type Answers = Record<string, string>

export interface Diagnosis {
  /** 診断ID（商品データの category と一致させる） */
  id: string
  /** URLに使う文字列（/diagnosis/{slug}） */
  slug: string
  /** 診断名（例: "枕診断"） */
  name: string
  /** 商品ジャンル名（例: "枕"） */
  itemName: string
  /** トップページでの分類 */
  group: CategoryGroupId
  /** カードに表示する絵文字アイコン */
  icon: string
  /** カード用の短い説明 */
  shortDescription: string
  /** 診断ページ冒頭の説明 */
  intro: string
  /** SEO情報 */
  seo: {
    title: string
    description: string
    /** OGP画像（/ から始まるパス or 完全なURL）。未設定ならサイト共通画像 */
    ogImage?: string
  }
  /** 価格帯の表示ラベル（priceRange 1〜5 に対応） */
  priceLabels: Partial<Record<PriceRange, string>>
  questions: Question[]
  products: Product[]
  /** 「選び方」コンテンツ */
  guide: {
    title: string
    intro?: string
    sections: GuideSection[]
  }
  /** 結果画面に表示する注意書き（医療的な効果を断定しない旨など） */
  notice?: string
  /** カテゴリ独自のスコア補正（任意） */
  scoring?: {
    /** 0〜1 の基本スコアを受け取り、補正後のスコア（0〜1）を返す */
    adjust?: (args: { product: Product; answers: Answers; score: number }) => number
  }
  /** false にするとサイトから非表示になります */
  enabled?: boolean
}

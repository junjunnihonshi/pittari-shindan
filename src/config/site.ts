/**
 * サイト全体の基本設定。
 * 公開前に url と operator を必ず自分の情報に書き換えてください。
 */
export const site = {
  /** サイト名 */
  name: 'ぴったり診断ナビ',
  /** キャッチコピー */
  tagline: 'あなたに合う商品、30秒で見つけよう。',
  /** サイトの説明（トップページの meta description） */
  description:
    'いくつかの質問に答えるだけ。あなたの使い方や予算に合った日用品・家電・生活用品を無料で診断します。',
  /**
   * 公開URL（末尾の / は不要）。canonical・OGP・sitemap.xml に使われます。
   * 例: 'https://pittari-shindan.pages.dev' や独自ドメイン 'https://example.com'
   */
  url: 'https://pittari-shindan.pages.dev',
  /** サイト共通のOGP画像（public/ に置いた画像のパス。例: '/ogp.png'）。空ならOGP画像なし */
  ogImage: '',
  /** X(Twitter) のアカウント（@なし）。空なら出力しません */
  twitter: '',
  /** 運営者情報 */
  operator: {
    name: '（運営者名を入力してください）',
    /** お問い合わせ用メールアドレス。空なら表示しません */
    email: '',
    /** お問い合わせフォーム（Googleフォーム等）のURL。空なら「準備中」 */
    contactFormUrl: '',
  },
  /** 広告表記（ヘッダー直下に表示） */
  adNotice: '当サイトはアフィリエイト広告を利用しています。',
  /** 結果画面の価格・在庫に関する注意書き */
  priceNotice: '掲載情報は変更されている場合があります。最新情報は販売サイトをご確認ください。',
} as const

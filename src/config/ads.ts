/**
 * 広告枠の設定（忍者AdMax）。
 *
 * - 広告タグ本体は public/ad-frames/ 内の静的HTMLに書きます
 *   （AdMax のタグは document.write を使うため、React から直接 <script> を読み込むと表示されません）
 * - ここでは、どの枠を表示するか・枠のサイズ・上部の表記を管理します
 * - 広告を一時的に止めたいときは、枠の enabled を false にします
 */
export interface AdSlotConfig {
  /** 広告タグを置いた静的HTML（public/ からのパス） */
  src: string
  /** 広告のサイズ（AdMax で作成した広告枠のサイズと合わせる） */
  width: number
  height: number
  /** 広告の上に表示する小さな表記 */
  label: string
  /** false にすると表示しない */
  enabled: boolean
}

export const adSlots = {
  /** トップページ：診断カード一覧の下（300×250） */
  homeBelowCategories: {
    src: '/ad-frames/admax-home.html',
    width: 300,
    height: 250,
    label: '広告',
    enabled: true,
  },
  /** トップページ：PC幅（1500px以上）の中央コンテンツの左側（160×600・スクロールに追従） */
  homeSideLeft: {
    src: '/ad-frames/admax-home-left.html',
    width: 160,
    height: 600,
    label: '広告',
    enabled: true,
  },
  /** トップページ：PC幅（1500px以上）の中央コンテンツの右側（160×600・スクロールに追従） */
  homeSideRight: {
    src: '/ad-frames/admax-home-right.html',
    width: 160,
    height: 600,
    label: '広告',
    enabled: true,
  },
} satisfies Record<string, AdSlotConfig>

export type AdSlotId = keyof typeof adSlots

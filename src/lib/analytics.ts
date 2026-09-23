/**
 * イベント計測。
 * 現在はコンソール出力（開発時のみ）＋ Google Analytics (gtag) / Googleタグマネージャー (dataLayer) が
 * 読み込まれていれば自動で送信します。GA を導入する場合は index.html に計測タグを貼るだけでOKです。
 */
type EventParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

export function trackEvent(name: string, params: EventParams = {}) {
  try {
    if (import.meta.env.DEV) console.info('[track]', name, params)
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params)
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: name, ...params })
    }
  } catch {
    // 計測の失敗でサイトの動作を止めない
  }
}

/** 購入ボタンのクリック（どの診断・どの商品・どのショップか） */
export function trackAffiliateClick(params: { diagnosisId: string; productId: string; shop: string; rank: number }) {
  trackEvent('affiliate_click', {
    diagnosis_id: params.diagnosisId,
    product_id: params.productId,
    shop: params.shop,
    rank: params.rank,
  })
}

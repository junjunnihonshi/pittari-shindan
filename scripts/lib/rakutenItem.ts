/**
 * 楽天の商品ページ（item.rakuten.co.jp）から、価格・在庫を読み取る。
 * 公開前の最終確認（価格帯のずれ・売り切れの検出）に使う。APIキーは使わない。
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36'

export interface RakutenItemInfo {
  /** 商品ページのURL */
  url: string
  status: number
  /** ページに出ている税込価格（SKUごとの価格を含む） */
  prices: number[]
  /** SKUごとの在庫数（読み取れた分だけ） */
  quantities: number[]
  /** 全SKUが売り切れ表示 */
  soldOut: boolean
}

/** アフィリエイトURL（hb.afl.rakuten.co.jp）から商品ページのURLを取り出す */
export function itemUrlFromAffiliate(affiliateUrl: string): string | null {
  try {
    const pc = new URL(affiliateUrl).searchParams.get('pc')
    return pc && pc.startsWith('https://item.rakuten.co.jp/') ? pc : null
  } catch {
    return null
  }
}

export async function fetchRakutenItem(url: string): Promise<RakutenItemInfo> {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  const html = new TextDecoder('euc-jp').decode(Buffer.from(await res.arrayBuffer()))
  const prices = [...new Set([...html.matchAll(/"taxIncludedPrice":([\d.]+)/g)].map((m) => Math.round(Number(m[1]))))].filter((n) => n > 0)
  const quantities = [...html.matchAll(/\{"sku":"[^"]+","inventoryId":"[^"]*","quantity":(\d+)\}/g)].map((m) => Number(m[1]))
  const variantCount = new Set([...html.matchAll(/"variantId":"([^"]+)"/g)].map((m) => m[1])).size
  const soldOutCount = new Set([...html.matchAll(/"variantId":"([^"]+)","newPurchaseSku":\{"stockCondition":"sold-out"/g)].map((m) => m[1])).size
  const soldOut = (quantities.length > 0 && quantities.every((q) => q === 0)) || (variantCount > 0 && soldOutCount === variantCount)
  return { url, status: res.status, prices, quantities, soldOut }
}

/**
 * priceLabels（例：{1:'〜10,000円', 2:'10,000〜20,000円', …}）から価格帯の上限を取り出す。
 * 最後の価格帯は上限なし。返り値の i 番目は priceRange (i+1) の上限（円）。
 */
export function priceThresholdsFromLabels(labels: Partial<Record<number, string>>): number[] {
  const keys = Object.keys(labels).map(Number).sort((a, b) => a - b)
  return keys.slice(0, -1).map((k) => Math.max(...[...(labels[k] ?? '').matchAll(/[\d,]+/g)].map((m) => Number(m[0].replace(/,/g, '')))))
}

/** 価格からその価格帯（1〜）を求める */
export function priceRangeOf(price: number, thresholds: number[]): number {
  const i = thresholds.findIndex((t) => price <= t)
  return i === -1 ? thresholds.length + 1 : i + 1
}

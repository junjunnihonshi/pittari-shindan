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
  const buf = Buffer.from(await res.arrayBuffer())
  const html = new TextDecoder('euc-jp').decode(buf)
  let prices = [...new Set([...html.matchAll(/"taxIncludedPrice":([\d.]+)/g)].map((m) => Math.round(Number(m[1]))))].filter((n) => n > 0)
  if (!prices.length) prices = displayedTaxIncludedPrices(buf)
  const quantities = [...html.matchAll(/\{"sku":"[^"]+","inventoryId":"[^"]*","quantity":(\d+)\}/g)].map((m) => Number(m[1]))
  const variantCount = new Set([...html.matchAll(/"variantId":"([^"]+)"/g)].map((m) => m[1])).size
  const soldOutCount = new Set([...html.matchAll(/"variantId":"([^"]+)","newPurchaseSku":\{"stockCondition":"sold-out"/g)].map((m) => m[1])).size
  const soldOut = (quantities.length > 0 && quantities.every((q) => q === 0)) || (variantCount > 0 && soldOutCount === variantCount)
  return { url, status: res.status, prices, quantities, soldOut }
}

/**
 * taxIncludedPrice がないページ（楽天ブックスなど）の価格。商品価格の要素（itemprop="price"）の
 * 表示が「17,800円（税込）」のときだけ採用する（送料・ポイント・クーポンの数字は拾わない）。
 * 楽天ブックスは UTF-8 のため、ページが宣言する文字コードで読み直す。
 */
function displayedTaxIncludedPrices(buf: Buffer): number[] {
  const head = buf.subarray(0, 4096).toString('latin1')
  const html = new TextDecoder(/charset=["']?utf-8/i.test(head) ? 'utf-8' : 'euc-jp').decode(buf)
  const prices = new Set<number>()
  for (const m of html.matchAll(/itemprop="price" content="(\d+)">([\d,]+)<span[^>]*>円<\/span><\/span><span[^>]*>（税込）<\/span>/g)) {
    const shown = Number(m[2].replace(/,/g, ''))
    if (shown > 0 && shown === Number(m[1])) prices.add(shown)
  }
  return [...prices]
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

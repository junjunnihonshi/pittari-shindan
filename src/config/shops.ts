import type { Product } from '../types/diagnosis.ts'

/**
 * 購入ボタンとして表示するショップの一覧。
 * 新しいショップを追加するときは、ここに 1 行追加し、
 * src/types/diagnosis.ts の Product に同じ名前の項目を追加してください。
 */
export interface ShopDefinition {
  key: 'amazon' | 'rakuten' | 'yahoo' | 'official'
  /** 商品データの項目名 */
  field: 'amazonUrl' | 'rakutenUrl' | 'yahooUrl' | 'officialUrl'
  /** ボタンの文言 */
  label: string
  /** URL未設定時に「準備中」ボタンを表示するか（false なら非表示） */
  showWhenEmpty: boolean
}

export const shops: ShopDefinition[] = [
  { key: 'amazon', field: 'amazonUrl', label: 'Amazonで見る', showWhenEmpty: true },
  { key: 'rakuten', field: 'rakutenUrl', label: '楽天市場で見る', showWhenEmpty: true },
  { key: 'yahoo', field: 'yahooUrl', label: 'Yahoo!ショッピングで見る', showWhenEmpty: false },
  { key: 'official', field: 'officialUrl', label: '公式サイトで見る', showWhenEmpty: false },
]

/**
 * URLを安全な形に整えます。
 * - もしもアフィリエイトのリンクは "//af.moshimo.com/..." のように https: が省略されていることがあるので補完
 * - http(s) 以外（javascript: など）や空欄は無効として undefined を返す
 */
export function normalizeUrl(raw: string | undefined): string | undefined {
  if (!raw) return undefined
  let url = raw.trim()
  if (!url) return undefined
  if (url.startsWith('//')) url = `https:${url}`
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return undefined
    return parsed.toString()
  } catch {
    return undefined
  }
}

export function getShopUrl(product: Product, shop: ShopDefinition): string | undefined {
  return normalizeUrl(product[shop.field])
}

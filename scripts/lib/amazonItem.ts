/**
 * Amazon でだけ購入できる商品（楽天URL・公式ストアURLがなく、Amazon アソシエイトリンクだけがある商品）の公開前チェック。
 * 商品ページを開き、正しい商品・販売元・税込価格（送料込み）・在庫を確認する。確認できない項目は不合格にする（推測で合格にしない）。
 *
 * 商品データ（attributes）に次を書いておく：
 * - amazonAsin：リンク先の ASIN（amazonUrl の /dp/<ASIN> と一致すること）
 * - amazonModelToken：商品ページのタイトルに含まれるべき型番・モデル名（例："RIVER 3"）
 * - amazonSeller：販売元（メーカー公式ストアまたは Amazon.co.jp）
 * - priceYen：確認済みの税込購入価格（送料込み）。ページの価格と一致しなければ不合格（価格が変わったら再確認する）
 */
import type { Product } from '../../src/types/diagnosis.ts'
import { asinOf, isAmazonAssociateUrl } from './browserChecks.ts'
import { priceRangeOf } from './rakutenItem.ts'

export interface AmazonItemInfo {
  status: number
  captcha: boolean
  title: string
  price: number | null
  seller: string
  inStock: boolean
  freeShipping: boolean
}

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
const text = (html: string, re: RegExp) => {
  const m = html.match(re)
  return m ? m[1].replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() : ''
}

/** 楽天URL・公式ストアURLがなく、Amazon アソシエイトリンクだけで購入する商品か */
export function isAmazonOnlyProduct(p: Product): boolean {
  return !p.rakutenUrl && !p.officialUrl && Boolean(p.amazonUrl)
}

/** リンクの形式・ASIN・商品データの必須項目だけを確認する（公開ワークフローの最初の確認用。通信はしない） */
export function amazonOnlyDataProblems(p: Product): string[] {
  const a = p.attributes
  const problems: string[] = []
  if (!isAmazonAssociateUrl(p.amazonUrl ?? '')) problems.push('Amazon のリンクがアソシエイトの商品リンク（/dp/<ASIN>・このサイトのタグ）ではありません')
  else if (asinOf(p.amazonUrl!) !== a.amazonAsin) problems.push(`Amazon のリンクの ASIN（${asinOf(p.amazonUrl!)}）が商品データの amazonAsin（${String(a.amazonAsin)}）と一致しません`)
  if (typeof a.amazonModelToken !== 'string' || !a.amazonModelToken) problems.push('商品データに amazonModelToken（商品ページで確認する型番・モデル名）がありません')
  if (typeof a.amazonSeller !== 'string' || !a.amazonSeller) problems.push('商品データに amazonSeller（販売元）がありません')
  if (typeof a.priceYen !== 'number') problems.push('商品データに確認済みの価格（priceYen）がありません')
  return problems
}

export async function fetchAmazonItem(asin: string): Promise<AmazonItemInfo> {
  const res = await fetch(`https://www.amazon.co.jp/dp/${asin}`, { headers: { 'User-Agent': UA, 'Accept-Language': 'ja-JP,ja;q=0.9', Accept: 'text/html' } })
  const html = await res.text()
  const price = text(html, /id="corePrice(?:Display_desktop)?_feature_div"[\s\S]*?<span class="a-price-whole">([\s\S]*?)<\/span>/)
  const availability = text(html, /id="availability"[^>]*>([\s\S]*?)<\/div>/)
  const delivery = text(html, /id="mir-layout-DELIVERY_BLOCK"[^>]*>([\s\S]*?)<\/div>/)
  return {
    status: res.status,
    captcha: /captcha/i.test(html.slice(0, 20000)),
    title: text(html, /id="productTitle"[^>]*>([\s\S]*?)<\/span>/),
    price: price ? Number(price.replace(/[^\d]/g, '')) : null,
    seller:
      text(html, /id="sellerProfileTriggerId"[^>]*>([\s\S]*?)<\/a>/) ||
      text(html, /offer-display-feature-name="desktop-merchant-info"[\s\S]*?offer-display-feature-text-message"[^>]*>([\s\S]*?)<\/span>/),
    inStock: /在庫あり|通常.{0,12}以内に発送/.test(availability),
    freeShipping: /無料配送|配送料無料/.test(delivery),
  }
}

/** 商品ページの確認結果と商品データを照らし合わせる（問題がなければ空配列） */
export function amazonOnlyItemProblems(p: Product, info: AmazonItemInfo, thresholds: number[]): string[] {
  const a = p.attributes
  const norm = (s: string) => s.replace(/[\s\-‐－]/g, '').toLowerCase()
  const problems = amazonOnlyDataProblems(p)
  if (info.status !== 200 || info.captcha) return [...problems, `Amazon の商品ページを確認できません（${info.captcha ? '確認画面' : info.status}）`]
  if (!norm(info.title).includes(norm(String(a.amazonModelToken ?? '')))) problems.push(`Amazon の商品名に「${String(a.amazonModelToken)}」が含まれません（別商品の可能性）`)
  if (/セット|コンボ|ソーラーパネル付/.test(info.title)) problems.push('Amazon の商品がセット品の可能性があります')
  if (info.seller !== a.amazonSeller) problems.push(`Amazon の販売元（${info.seller || '不明'}）が確認済みの販売元（${String(a.amazonSeller)}）と違います`)
  if (!info.inStock) problems.push('Amazon で在庫を確認できません（在庫切れ・予約・入荷待ちの可能性）')
  if (!info.freeShipping) problems.push('Amazon で送料無料を確認できません（送料込みの価格を確定できません）')
  if (info.price === null) problems.push('Amazon の価格を読み取れません（購入ボタンがない可能性）')
  else {
    if (info.price !== a.priceYen) problems.push(`Amazon の価格（${info.price}円）が確認済みの価格（${String(a.priceYen)}円）と違います。価格を再確認してください`)
    if (priceRangeOf(info.price, thresholds) !== p.priceRange) problems.push(`Amazon の価格（${info.price}円）が価格帯 ${p.priceRange} と合いません`)
  }
  return problems
}

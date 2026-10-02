import { getShopUrl, shops } from '../config/shops.ts'
import { trackAffiliateClick } from '../lib/analytics.ts'
import type { Product } from '../types/diagnosis.ts'

interface Props {
  product: Product
  diagnosisId: string
  rank: number
}

export function ShopButtons({ product, diagnosisId, rank }: Props) {
  const items = shops
    .filter((shop) => shop.enabled)
    .map((shop) => ({ shop, url: getShopUrl(product, shop) }))
    // 公式サイトが購入先の商品（楽天未取扱い）には「準備中」ボタンを出さない
    .filter(({ shop, url }) => url || (shop.showWhenEmpty && !product.officialUrl))

  if (items.length === 0) return null

  return (
    <div className="shop-buttons">
      {items.map(({ shop, url }) =>
        url ? (
          <a
            key={shop.key}
            className={`shop-button shop-button--${shop.key}`}
            href={url}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            onClick={() => trackAffiliateClick({ diagnosisId, productId: product.id, shop: shop.key, rank })}
          >
            {shop.label}
            <span className="visually-hidden">（新しいタブで開きます）</span>
          </a>
        ) : (
          <span key={shop.key} className="shop-button is-disabled" aria-disabled="true">
            {shop.label.replace(/で見る$/, '')}：準備中
          </span>
        ),
      )}
    </div>
  )
}

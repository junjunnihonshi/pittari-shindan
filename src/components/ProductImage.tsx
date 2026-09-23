import { useState } from 'react'
import { normalizeUrl } from '../config/shops.ts'

export function ProductImage({ src, alt, icon }: { src?: string; alt: string; icon: string }) {
  const [failed, setFailed] = useState(false)
  const url = src?.startsWith('/') ? src : normalizeUrl(src)
  if (url && !failed) {
    return (
      <img
        className="product-image"
        src={url}
        alt={alt}
        loading="lazy"
        decoding="async"
        width={160}
        height={160}
        onError={() => setFailed(true)}
      />
    )
  }
  return (
    <div className="product-image product-image--placeholder" role="img" aria-label="商品画像は準備中です">
      <span aria-hidden="true">{icon}</span>
      <small>画像準備中</small>
    </div>
  )
}

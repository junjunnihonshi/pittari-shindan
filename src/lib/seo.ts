import { useEffect } from 'react'
import { buildHeadTags, type PageMeta } from '../config/seo.ts'

/**
 * ページ表示時に <title> と meta / canonical / OGP タグを更新する。
 * ビルド時に生成したタグにも data-seo が付いているので、ページ遷移のたびに入れ替わります。
 */
export function useSeo(meta: PageMeta) {
  const json = JSON.stringify(meta)
  useEffect(() => {
    const m = JSON.parse(json) as PageMeta
    document.title = m.title
    document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove())
    for (const { tag, attrs } of buildHeadTags(m)) {
      const el = document.createElement(tag)
      for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v)
      el.setAttribute('data-seo', '')
      document.head.appendChild(el)
    }
  }, [json])
}

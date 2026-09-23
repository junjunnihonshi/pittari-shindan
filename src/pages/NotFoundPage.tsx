import { notFoundMeta } from '../config/seo.ts'
import { Link } from '../components/Link.tsx'
import { useSeo } from '../lib/seo.ts'

export function NotFoundPage({ message }: { message?: string }) {
  useSeo(notFoundMeta)
  return (
    <div className="container page">
      <div className="empty-state">
        <p className="empty-state__code" aria-hidden="true">404</p>
        <h1>ページが見つかりません</h1>
        <p>{message ?? 'お探しのページは移動または削除された可能性があります。'}</p>
        <Link to="/" className="button button--primary">
          トップページへ戻る
        </Link>
      </div>
    </div>
  )
}

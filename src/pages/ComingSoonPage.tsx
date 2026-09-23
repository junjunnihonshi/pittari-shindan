import { comingSoonMeta } from '../config/seo.ts'
import { Link } from '../components/Link.tsx'
import { useSeo } from '../lib/seo.ts'
import type { Diagnosis } from '../types/diagnosis.ts'

/** 準備中（enabled: false）の診断のURLに直接アクセスされたときの表示 */
export function ComingSoonPage({ diagnosis }: { diagnosis: Diagnosis }) {
  useSeo(comingSoonMeta(diagnosis))
  return (
    <div className="container page">
      <div className="empty-state">
        <p className="empty-state__code" aria-hidden="true">
          {diagnosis.icon}
        </p>
        <h1>{diagnosis.name}は準備中です</h1>
        <p>現在、公開に向けて準備を進めています。公開まで今しばらくお待ちください。</p>
        <Link to="/#categories" className="button button--primary">
          公開中の診断を見る
        </Link>
      </div>
    </div>
  )
}

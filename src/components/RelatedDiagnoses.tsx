import { relatedDiagnoses } from '../config/relatedDiagnoses.ts'
import { diagnosisPath } from '../config/seo.ts'
import { getDiagnosisBySlug, isDiagnosisEnabled } from '../data/diagnoses/index.ts'
import { Link } from './Link.tsx'

/** 診断ページ下部の「関連する診断」（公開中の診断だけ・自分自身は除く） */
export function RelatedDiagnoses({ slug }: { slug: string }) {
  const items = (relatedDiagnoses[slug] ?? []).flatMap((r) => {
    const d = r.slug === slug ? undefined : getDiagnosisBySlug(r.slug)
    return d && isDiagnosisEnabled(d) ? [{ d, text: r.text }] : []
  })
  if (items.length === 0) return null
  return (
    <section className="related" aria-labelledby="related-title">
      <h2 id="related-title">関連する診断</h2>
      <ul className="related__list">
        {items.map(({ d, text }) => (
          <li key={d.id}>
            {/* 末尾 / なしは Cloudflare Pages で 308 リダイレクトになるため、canonical と同じ末尾 / ありでリンクする */}
            <Link to={`${diagnosisPath(d.slug)}/`} className="related__link">
              <span className="related__icon" aria-hidden="true">
                {d.icon}
              </span>
              <span className="related__body">
                <span className="related__name">{d.name}</span>
                <span className="related__text">{text}</span>
              </span>
              <span className="related__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

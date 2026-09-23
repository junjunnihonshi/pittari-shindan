import { diagnosisPath } from '../config/seo.ts'
import { Link } from './Link.tsx'
import type { Diagnosis } from '../types/diagnosis.ts'

export function DiagnosisCard({ diagnosis }: { diagnosis: Diagnosis }) {
  return (
    <Link to={diagnosisPath(diagnosis.slug)} className="diagnosis-card">
      <span className="diagnosis-card__icon" aria-hidden="true">
        {diagnosis.icon}
      </span>
      <span className="diagnosis-card__body">
        <span className="diagnosis-card__title">{diagnosis.name}</span>
        <span className="diagnosis-card__desc">{diagnosis.shortDescription}</span>
        <span className="diagnosis-card__meta">質問 {diagnosis.questions.length} 問</span>
      </span>
      <span className="diagnosis-card__arrow" aria-hidden="true">
        →
      </span>
    </Link>
  )
}

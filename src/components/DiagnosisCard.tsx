import { diagnosisPath } from '../config/seo.ts'
import { isDiagnosisEnabled } from '../data/diagnoses/index.ts'
import { Link } from './Link.tsx'
import type { Diagnosis } from '../types/diagnosis.ts'

export function DiagnosisCard({ diagnosis }: { diagnosis: Diagnosis }) {
  // 準備中の診断は、リンクではない要素で表示する（クリック・Tab移動・Enterでの遷移ができない）
  if (!isDiagnosisEnabled(diagnosis)) {
    return (
      <div className="diagnosis-card is-disabled">
        <span className="diagnosis-card__icon" aria-hidden="true">
          {diagnosis.icon}
        </span>
        <span className="diagnosis-card__body">
          <span className="diagnosis-card__title">
            {diagnosis.name}
            <span className="badge badge--soon">準備中</span>
          </span>
          <span className="diagnosis-card__desc">{diagnosis.shortDescription}</span>
        </span>
      </div>
    )
  }

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

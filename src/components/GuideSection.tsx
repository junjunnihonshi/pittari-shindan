import type { Diagnosis } from '../types/diagnosis.ts'

export function GuideSection({ guide }: { guide: Diagnosis['guide'] }) {
  if (!guide || guide.sections.length === 0) return null
  return (
    <section className="guide" aria-labelledby="guide-title">
      <h2 id="guide-title">{guide.title}</h2>
      {guide.intro && <p className="guide__intro">{guide.intro}</p>}
      {guide.sections.map((s) => (
        <div className="guide__item" key={s.heading}>
          <h3>{s.heading}</h3>
          {s.body && <p>{s.body}</p>}
          {s.points && s.points.length > 0 && (
            <ul>
              {s.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </section>
  )
}

import type { ProductResult } from '../engine/diagnosisEngine.ts'
import type { Diagnosis } from '../types/diagnosis.ts'
import { ProductImage } from './ProductImage.tsx'
import { ShopButtons } from './ShopButtons.tsx'

function matchLevel(score: number): { mark: string; text: string; className: string } {
  if (score >= 0.8) return { mark: '◎', text: 'よく合う', className: 'is-good' }
  if (score >= 0.5) return { mark: '○', text: '合う', className: 'is-ok' }
  return { mark: '△', text: '差あり', className: 'is-weak' }
}

interface Props {
  result: ProductResult
  rank: number
  diagnosis: Diagnosis
}

export function ResultCard({ result, rank, diagnosis }: Props) {
  const { product, matchPercent, reason, breakdown } = result
  const caution = product.caution ?? product.cons.join(' ')
  const priceLabel = diagnosis.priceLabels[product.priceRange]
  const headingId = `result-${product.id}`

  return (
    <article className={`result-card${rank === 1 ? ' result-card--first' : ''}`} aria-labelledby={headingId}>
      <div className="result-card__rank">
        相性順<span className="result-card__rank-num">{rank}</span>
      </div>

      <div className="result-card__head">
        <ProductImage src={product.imageUrl} alt={product.name} icon={diagnosis.icon} />
        <div className="result-card__title">
          <h3 id={headingId}>{product.name}</h3>
          {product.sample && <span className="badge badge--sample">仮データ</span>}
          {priceLabel && <p className="result-card__price">価格帯の目安：{priceLabel}</p>}
          <div className="match">
            <span className="match__label">あなたとの相性</span>
            <span className="match__value">
              {matchPercent}
              <small>%</small>
            </span>
            <div className="match__bar" aria-hidden="true">
              <div style={{ width: `${matchPercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      <p className="result-card__desc">{product.description}</p>

      <section className="result-card__section">
        <h4>おすすめ理由</h4>
        <p>{reason}</p>
      </section>

      {product.features.length > 0 && (
        <section className="result-card__section">
          <h4>特徴</h4>
          <ul className="tag-list">
            {product.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="result-card__section">
        <h4>向いている人</h4>
        <p>{product.recommendFor}</p>
      </section>

      {caution && (
        <section className="result-card__section result-card__section--caution">
          <h4>
            <span aria-hidden="true">⚠ </span>注意点
          </h4>
          <p>{caution}</p>
        </section>
      )}

      {breakdown.length > 0 && (
        <details className="breakdown">
          <summary>相性の内訳を見る</summary>
          <ul>
            {breakdown.map((b) => {
              const level = matchLevel(b.score)
              return (
                <li key={b.questionId} className={level.className}>
                  <span className="breakdown__label">{b.label}</span>
                  <span className="breakdown__answer">{b.answerSummary}</span>
                  <span className="breakdown__level">
                    <span aria-hidden="true">{level.mark} </span>
                    {level.text}
                  </span>
                </li>
              )
            })}
          </ul>
        </details>
      )}

      <ShopButtons product={product} diagnosisId={diagnosis.id} rank={rank} />
    </article>
  )
}

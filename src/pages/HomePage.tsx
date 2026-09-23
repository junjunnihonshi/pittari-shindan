import { useState } from 'react'
import { categoryGroups } from '../config/categories.ts'
import { diagnosisPath, staticPages } from '../config/seo.ts'
import { site } from '../config/site.ts'
import { DiagnosisCard } from '../components/DiagnosisCard.tsx'
import { diagnoses, getDiagnosisBySlug, isDiagnosisEnabled } from '../data/diagnoses/index.ts'
import { Link } from '../components/Link.tsx'
import { useSeo } from '../lib/seo.ts'
import { getRecentDiagnoses } from '../lib/storage.ts'
import type { Diagnosis } from '../types/diagnosis.ts'

export function HomePage() {
  useSeo(staticPages[0])
  // 準備中の診断は「最近使った診断」にも出さない
  const [recent] = useState(() =>
    getRecentDiagnoses()
      .map(getDiagnosisBySlug)
      .filter((d): d is Diagnosis => d !== undefined && isDiagnosisEnabled(d)),
  )

  const scrollToCategories = () => {
    const el = document.getElementById('categories')
    el?.scrollIntoView({ behavior: 'smooth' })
    el?.focus({ preventScroll: true })
  }

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <p className="hero__eyebrow">質問に答えるだけの無料診断</p>
          <h1 className="hero__title">
            あなたに合う商品、
            <br />
            30秒で見つけよう。
          </h1>
          <p className="hero__lead">いくつかの質問に答えるだけ。あなたの使い方や予算に合った商品を診断します。</p>
          <button type="button" className="button button--primary button--large" onClick={scrollToCategories}>
            商品を診断する
          </button>
          <ol className="steps" aria-label="診断の流れ">
            <li>
              <span className="steps__num">1</span>ジャンルを選ぶ
            </li>
            <li>
              <span className="steps__num">2</span>4〜6問に答える
            </li>
            <li>
              <span className="steps__num">3</span>相性順に3件表示
            </li>
          </ol>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="container section" aria-labelledby="recent-title">
          <h2 id="recent-title" className="section__title section__title--small">
            最近使った診断
          </h2>
          <ul className="chip-list">
            {recent.map((d) => (
              <li key={d.id}>
                <Link to={diagnosisPath(d.slug)} className="chip">
                  <span aria-hidden="true">{d.icon} </span>
                  {d.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id="categories" className="container section" tabIndex={-1} aria-labelledby="categories-title">
        <h2 id="categories-title" className="section__title">
          診断を選ぶ
        </h2>
        {categoryGroups.map((group) => {
          const items = diagnoses.filter((d) => d.group === group.id)
          if (items.length === 0) return null
          return (
            <div className="category-group" key={group.id}>
              <h3 className="category-group__title">{group.label}</h3>
              <div className="card-grid">
                {items.map((d) => (
                  <DiagnosisCard key={d.id} diagnosis={d} />
                ))}
              </div>
            </div>
          )
        })}
      </section>

      <section className="container section" aria-labelledby="about-title">
        <div className="info-box">
          <h2 id="about-title" className="section__title section__title--small">
            {site.name}の診断について
          </h2>
          <ul className="check-list">
            <li>人気ランキングではなく、あなたの回答と商品の特徴の「相性順」で表示します。</li>
            <li>回答内容はお使いの端末内だけで計算され、外部には送信されません。</li>
            <li>会員登録は不要。何度でも無料で診断できます。</li>
          </ul>
        </div>
      </section>
    </>
  )
}

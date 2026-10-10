import { useMemo, useState, type MouseEvent } from 'react'
import { categoryGroups } from '../config/categories.ts'
import { diagnosisPath, staticPages } from '../config/seo.ts'
import { site } from '../config/site.ts'
import { DiagnosisCard } from '../components/DiagnosisCard.tsx'
import { columnPath, columns } from '../data/columns/index.ts'
import { enabledDiagnoses, getDiagnosisBySlug, isDiagnosisEnabled } from '../data/diagnoses/index.ts'
import { Link } from '../components/Link.tsx'
import { matchesDiagnosis, toSearchWords } from '../lib/diagnosisSearch.ts'
import { useSeo } from '../lib/seo.ts'
import { getRecentDiagnoses } from '../lib/storage.ts'
import type { Diagnosis } from '../types/diagnosis.ts'

// 人気の診断（手動で選んだ順番に表示。準備中になった診断は出さない）
const popularSlugs = ['tv', 'washing-machine', 'rice-cooker', 'wireless-earbuds', 'mattress', 'vacuum']
const popularDiagnoses = popularSlugs.map(getDiagnosisBySlug).filter((d): d is Diagnosis => d !== undefined && isDiagnosisEnabled(d))
// 新着の診断：登録順（公開した順）の最後から6件
const newDiagnoses = enabledDiagnoses.slice(-6).reverse()
/** 選び方コラム：公開日の新しい順に最大3件 */
const latestColumns = [...columns].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, 3)
// 公開中の診断の質問数の範囲（「○〜○問に答える」の表示用）
const questionCounts = enabledDiagnoses.map((d) => d.questions.length)
const minQuestions = Math.min(...questionCounts)
const maxQuestions = Math.max(...questionCounts)

export function HomePage() {
  useSeo(staticPages[0])
  // 準備中の診断は「最近使った診断」にも出さない
  const [recent] = useState(() =>
    getRecentDiagnoses()
      .map(getDiagnosisBySlug)
      .filter((d): d is Diagnosis => d !== undefined && isDiagnosisEnabled(d)),
  )

  // 診断の検索。ビルド時のプリレンダリング（window なし）では検索バーを出さず、JavaScript 無効でも一覧はそのまま表示される
  const [canSearch] = useState(() => typeof window !== 'undefined')
  const [query, setQuery] = useState('')
  const words = useMemo(() => toSearchWords(query), [query])
  const searching = words.length > 0
  // 一覧・検索とも公開中の診断だけを表示する（準備中の診断は出さない）
  const visible = searching ? enabledDiagnoses.filter((d) => matchesDiagnosis(d, words)) : enabledDiagnoses

  // カテゴリへ移動。検索で絞り込み中ならいったん解除してから移動する
  const jumpToCategory = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!searching) return
    e.preventDefault()
    setQuery('')
    window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 0)
  }

  const scrollToCategories = () => {
    const el = document.getElementById('categories')
    el?.scrollIntoView({ behavior: 'smooth' })
    el?.focus({ preventScroll: true })
  }

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <p className="hero__eyebrow">あなたにぴったりの商品を、かんたん診断</p>
          <h1 className="hero__title">
            あなたに合う商品、
            <br />
            30秒で見つけよう。
          </h1>
          <p className="hero__lead">いくつかの質問に答えるだけ。あなたの使い方や予算に合った商品を診断します。</p>
          <p className="hero__stats">
            公開中 <strong>{enabledDiagnoses.length}</strong>診断
            <span className="hero__stats-note">すべて無料・会員登録不要</span>
          </p>
          <button type="button" className="button button--primary button--large" onClick={scrollToCategories}>
            商品を診断する
          </button>
          <ol className="steps" aria-label="診断の流れ">
            <li>
              <span className="steps__num">1</span>ジャンルを選ぶ
            </li>
            <li>
              <span className="steps__num">2</span>
              {minQuestions === maxQuestions ? `${maxQuestions}問に答える` : `${minQuestions}〜${maxQuestions}問に答える`}
            </li>
            <li>
              <span className="steps__num">3</span>相性順に3件表示
            </li>
          </ol>
        </div>
      </section>

      <div className="home-body">
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

        {popularDiagnoses.length > 0 && (
          <section className="container section" aria-labelledby="popular-title">
            <h2 id="popular-title" className="section__title">
              人気の診断
            </h2>
            <div className="card-grid card-grid--compact">
              {popularDiagnoses.map((d) => (
                <DiagnosisCard key={d.id} diagnosis={d} />
              ))}
            </div>
          </section>
        )}

        <section className="container section" aria-labelledby="new-title">
          <h2 id="new-title" className="section__title">
            新着の診断
          </h2>
          <div className="card-grid card-grid--compact">
            {newDiagnoses.map((d) => (
              <DiagnosisCard key={d.id} diagnosis={d} />
            ))}
          </div>
        </section>

        {latestColumns.length > 0 && (
          <section className="container section" aria-labelledby="column-home-title">
            <h2 id="column-home-title" className="section__title">
              選び方コラム
            </h2>
            <p className="column-home__lead">買う前に知っておきたいポイントを、わかりやすく解説しています。</p>
            <ul className="column-home__grid">
              {latestColumns.map((c) => (
                <li key={c.slug}>
                  <Link to={columnPath(c.slug)} className="diagnosis-card column-card">
                    <span className="diagnosis-card__body">
                      <span className="diagnosis-card__meta column-card__category">{c.category}</span>
                      <span className="diagnosis-card__title">{c.title}</span>
                      <span className="diagnosis-card__desc">{c.description}</span>
                      <span className="column-card__more">記事を読む →</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="column-home__more">
              <Link to="/column/">選び方コラムを見る →</Link>
              <Link to="/column/replacement/">家電の寿命・買い替え時期を見る →</Link>
            </p>
          </section>
        )}

        <section id="categories" className="container section" tabIndex={-1} aria-labelledby="categories-title">
          <h2 id="categories-title" className="section__title">
            診断を探す
          </h2>
          {canSearch && (
            <div className="search-box" role="search">
              <label htmlFor="diagnosis-search" className="visually-hidden">
                診断を検索
              </label>
              <span className="search-box__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <input
                id="diagnosis-search"
                type="search"
                className="search-box__input"
                placeholder="テレビ、炊飯器、イヤホン…"
                autoComplete="off"
                enterKeyHint="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setQuery('')
                }}
              />
              {query !== '' && (
                <button
                  type="button"
                  className="search-box__clear"
                  aria-label="検索を解除"
                  onClick={() => {
                    setQuery('')
                    document.getElementById('diagnosis-search')?.focus()
                  }}
                >
                  ×
                </button>
              )}
            </div>
          )}
          {canSearch && (
            <p className={searching && visible.length === 0 ? 'search-empty' : 'visually-hidden'} role="status">
              {searching ? (visible.length === 0 ? '該当する診断が見つかりませんでした。' : `${visible.length}件の診断が見つかりました`) : ''}
            </p>
          )}
          <nav className="category-jump" aria-label="カテゴリから探す">
            <ul className="chip-list">
              {categoryGroups
                .filter((group) => enabledDiagnoses.some((d) => d.group === group.id))
                .map((group) => (
                  <li key={group.id}>
                    <a href={`#category-${group.id}`} className="chip" onClick={(e) => jumpToCategory(e, `category-${group.id}`)}>
                      {group.label}
                    </a>
                  </li>
                ))}
            </ul>
          </nav>
          {categoryGroups.map((group) => {
            const items = visible.filter((d) => d.group === group.id)
            if (items.length === 0) return null
            return (
              <div className="category-group" id={`category-${group.id}`} key={group.id}>
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
      </div>
    </>
  )
}

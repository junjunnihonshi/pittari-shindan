/**
 * 選び方コラム（一覧・記事）。記事の内容は src/data/columns/ に書きます。
 */
import { Fragment, useMemo, useState } from 'react'
import { Link } from '../components/Link.tsx'
import { categoryGroups } from '../config/categories.ts'
import { columnListMeta, columnMeta, diagnosisPath } from '../config/seo.ts'
import { columnPath, columns, type Column } from '../data/columns/index.ts'
import { diagnoses, isDiagnosisEnabled } from '../data/diagnoses/index.ts'
import { parseColumnBody } from '../lib/columnBody.ts'
import { normalizeSearchText, toSearchWords } from '../lib/diagnosisSearch.ts'
import { useSeo } from '../lib/seo.ts'

function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  return `${y}年${m}月${d}日`
}

/** 一覧カード用の短い表示名（正式タイトルの「｜」より前）。title・H1・メタ情報は変えない */
function cardTitle(title: string): string {
  return title.split('｜')[0].trim() || title
}

/** カテゴリ名 → categoryGroups の id（カードのアクセント色に使う） */
const groupIdByLabel = new Map(categoryGroups.map((g) => [g.label, g.id]))

/** 検索対象：タイトル・説明文・カテゴリ名と、関連する診断の名前・検索用キーワード（ある場合） */
const searchTextBySlug = new Map(
  columns.map((c) => {
    const d = diagnoses.find((x) => x.id === c.relatedDiagnosisId)
    const parts = [c.title, c.shortTitle, c.description, c.category, d?.name, d?.itemName, ...(d?.searchKeywords ?? [])]
    return [c.slug, normalizeSearchText(parts.filter(Boolean).join(' '))]
  }),
)

const ALL = 'all'
const EMPTY_MESSAGE = '該当する記事がありません。検索条件を変更してください。'

export function ColumnListPage() {
  useSeo(columnListMeta)
  const list = useMemo(() => [...columns].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)), [])
  // カテゴリは既存の分類の順に、記事があるものだけを並べる（分類にないカテゴリ名は末尾に追加）
  const categories = useMemo(() => {
    const labels = [...categoryGroups.map((g) => g.label), ...list.map((c) => c.category)]
    return [...new Set(labels)]
      .map((label) => ({ label, count: list.filter((c) => c.category === label).length }))
      .filter((c) => c.count > 0)
  }, [list])

  // 絞り込み UI はブラウザでだけ表示する。プリレンダリング・JavaScript 無効時は全記事のリンクがそのまま並ぶ
  const [canFilter] = useState(() => typeof window !== 'undefined')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(ALL)
  const words = useMemo(() => toSearchWords(query), [query])
  const filtering = words.length > 0 || category !== ALL
  const visible = list.filter(
    (c) => (category === ALL || c.category === category) && words.every((w) => searchTextBySlug.get(c.slug)?.includes(w)),
  )
  const reset = () => {
    setQuery('')
    setCategory(ALL)
  }

  return (
    <div className="container page">
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <ol>
          <li>
            <Link to="/">トップ</Link>
          </li>
          <li aria-current="page">選び方コラム</li>
        </ol>
      </nav>
      <section className="column-list" aria-labelledby="column-list-title">
        <h1 id="column-list-title" className="column-list__title">
          選び方コラム
        </h1>
        <p className="column-list__lead">家電や暮らしの商品を選ぶときに知っておきたいポイントを、わかりやすく解説します。</p>
        <p className="column-list__count">
          公開中の記事：<strong>{list.length}</strong>本
        </p>
        {canFilter && (
          <div className="column-filter">
            <div className="search-box column-filter__search" role="search">
              <label htmlFor="column-search" className="visually-hidden">
                コラムを検索
              </label>
              <span className="search-box__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </span>
              <input
                id="column-search"
                type="search"
                className="search-box__input"
                placeholder="商品名・キーワードで探す"
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
                  aria-label="検索語を消す"
                  onClick={() => {
                    setQuery('')
                    document.getElementById('column-search')?.focus()
                  }}
                >
                  ×
                </button>
              )}
            </div>
            <div className="column-filter__cats" role="group" aria-label="カテゴリで絞り込む">
              {[{ label: 'すべて', value: ALL, count: list.length }, ...categories.map((c) => ({ ...c, value: c.label }))].map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className="column-filter__cat"
                  aria-pressed={category === c.value}
                  onClick={() => setCategory(c.value)}
                >
                  {c.label}
                  <span className="column-filter__cat-count">{c.count}</span>
                </button>
              ))}
            </div>
            <div className="column-filter__status">
              <p role="status">
                {filtering ? (
                  <>
                    <strong>{visible.length}</strong>件の記事が見つかりました
                  </>
                ) : (
                  <>
                    すべての記事（<strong>{list.length}</strong>件）を表示しています
                  </>
                )}
              </p>
              {filtering && (
                <button type="button" className="column-filter__reset" onClick={reset}>
                  条件をリセット
                </button>
              )}
            </div>
          </div>
        )}
        {visible.length > 0 ? (
          <ul className="column-grid">
            {visible.map((c) => (
              <li key={c.slug}>
                <Link to={columnPath(c.slug)} className="column-entry" data-group={groupIdByLabel.get(c.category)}>
                  <span className="column-entry__category">{c.category}</span>
                  <span className="column-entry__title">{cardTitle(c.title)}</span>
                  <span className="column-entry__desc">{c.description}</span>
                  <span className="column-entry__more">
                    選び方を読む <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="search-empty column-empty">
            <p>{EMPTY_MESSAGE}</p>
            <button type="button" className="button button--ghost" onClick={reset}>
              条件をリセット
            </button>
          </div>
        )}
      </section>
    </div>
  )
}

export function ColumnArticlePage({ column }: { column: Column }) {
  useSeo(columnMeta(column))
  const blocks = parseColumnBody(column.body)
  const toc = blocks.flatMap((b) => (b.type === 'h2' ? [b] : []))
  const firstH2 = blocks.findIndex((b) => b.type === 'h2')
  const diagnosis = diagnoses.find((d) => d.id === column.relatedDiagnosisId && isDiagnosisEnabled(d))
  const diagnosisUrl = diagnosis ? `${diagnosisPath(diagnosis.slug)}/` : undefined
  // 目次は <details> で折り畳める。初期 HTML では開いた状態（JavaScript 無効でも見える）、スマホのブラウザでは閉じて表示する
  const tocInitiallyOpen = typeof window === 'undefined' || !window.matchMedia('(max-width: 639px)').matches

  return (
    <div className="container page">
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <ol>
          <li>
            <Link to="/">トップ</Link>
          </li>
          <li>
            <Link to="/column/">選び方コラム</Link>
          </li>
          <li aria-current="page">{column.shortTitle}</li>
        </ol>
      </nav>
      <article className="prose column-article">
        <header className="column-article__header">
          <span className="diagnosis-card__meta column-card__category">{column.category}</span>
          <h1>{column.title}</h1>
          <p className="column-article__date">公開日：{formatDate(column.publishedAt)}</p>
        </header>
        {blocks.map((b, i) => {
          const before =
            i === firstH2 && toc.length > 0 ? (
              <nav className="column-toc" aria-label="この記事の目次">
                <details key={column.slug} open={tocInitiallyOpen}>
                  <summary className="column-toc__title">
                    この記事の目次<span className="column-toc__count">{toc.length}項目</span>
                  </summary>
                  <ol>
                    {toc.map((t) => (
                      <li key={t.id}>
                        <a href={`#${t.id}`}>{t.text}</a>
                      </li>
                    ))}
                  </ol>
                </details>
              </nav>
            ) : null
          let el
          switch (b.type) {
            case 'h2':
              el = <h2 id={b.id}>{b.text}</h2>
              break
            case 'h3':
              el = <h3>{b.text}</h3>
              break
            case 'ul':
              el = (
                <ul>
                  {b.items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )
              break
            case 'ol':
              el = (
                <ol>
                  {b.items.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
              )
              break
            case 'cta':
              el = diagnosisUrl ? (
                <p className="column-cta">
                  <Link to={diagnosisUrl} className="button button--primary column-cta__button">
                    {b.text}
                    <span aria-hidden="true">→</span>
                  </Link>
                </p>
              ) : null
              break
            default:
              el = <p>{b.text}</p>
          }
          return (
            <Fragment key={i}>
              {before}
              {el}
            </Fragment>
          )
        })}
      </article>
    </div>
  )
}

/**
 * 選び方コラム（一覧・記事）。記事の内容は src/data/columns/ に書きます。
 */
import { Fragment } from 'react'
import { Link } from '../components/Link.tsx'
import { columnListMeta, columnMeta, diagnosisPath } from '../config/seo.ts'
import { columnPath, columns, type Column } from '../data/columns/index.ts'
import { diagnoses, isDiagnosisEnabled } from '../data/diagnoses/index.ts'
import { parseColumnBody } from '../lib/columnBody.ts'
import { useSeo } from '../lib/seo.ts'

function formatDate(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  return `${y}年${m}月${d}日`
}

export function ColumnListPage() {
  useSeo(columnListMeta)
  const list = [...columns].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
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
        <ul className="column-list__items">
          {list.map((c) => (
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
              <nav className="column-toc" aria-labelledby="column-toc-title">
                <p id="column-toc-title" className="column-toc__title">
                  この記事でわかること
                </p>
                <ol>
                  {toc.map((t) => (
                    <li key={t.id}>
                      <a href={`#${t.id}`}>{t.text}</a>
                    </li>
                  ))}
                </ol>
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

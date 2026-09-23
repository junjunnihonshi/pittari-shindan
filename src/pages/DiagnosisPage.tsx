import { useEffect, useMemo, useRef, useState } from 'react'
import { GuideSection } from '../components/GuideSection.tsx'
import { ProgressBar } from '../components/ProgressBar.tsx'
import { QuestionStep } from '../components/QuestionStep.tsx'
import { ResultCard } from '../components/ResultCard.tsx'
import { diagnosisPath } from '../config/seo.ts'
import { site } from '../config/site.ts'
import { isComplete, runDiagnosis, sanitizeAnswers } from '../engine/diagnosisEngine.ts'
import { trackEvent } from '../lib/analytics.ts'
import { Link } from '../components/Link.tsx'
import { useSeo } from '../lib/seo.ts'
import { addRecentDiagnosis, clearSavedAnswers, getSavedAnswers, saveAnswers } from '../lib/storage.ts'
import type { Answers, Diagnosis } from '../types/diagnosis.ts'

type Phase = 'intro' | 'quiz' | 'done' | 'result'

/** 結果として表示する件数 */
const TOP_N = 3

export function DiagnosisPage({ diagnosis }: { diagnosis: Diagnosis }) {
  useSeo({
    path: diagnosisPath(diagnosis.slug),
    title: diagnosis.seo.title,
    description: diagnosis.seo.description,
    ogImage: diagnosis.seo.ogImage,
    ogType: 'article',
  })

  const { questions } = diagnosis
  const [phase, setPhase] = useState<Phase>('intro')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [saved, setSaved] = useState<Answers | null>(() => {
    const a = sanitizeAnswers(diagnosis, getSavedAnswers(diagnosis.slug))
    return isComplete(diagnosis, a) ? a : null
  })
  const panelRef = useRef<HTMLDivElement>(null)
  const resultHeadingRef = useRef<HTMLHeadingElement>(null)

  const result = useMemo(
    () => (phase === 'result' ? runDiagnosis(diagnosis, answers) : null),
    [phase, diagnosis, answers],
  )

  // 画面の切り替え時に診断エリアの先頭が見えるようにする
  useEffect(() => {
    const el = panelRef.current
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' })
    if (phase === 'result') resultHeadingRef.current?.focus({ preventScroll: true })
  }, [phase, step])

  const start = () => {
    setAnswers({})
    setStep(0)
    setPhase('quiz')
    addRecentDiagnosis(diagnosis.slug)
    trackEvent('diagnosis_start', { diagnosis_id: diagnosis.id })
  }

  const select = (optionId: string) => {
    const q = questions[step]
    setAnswers((prev) => ({ ...prev, [q.id]: optionId }))
    if (step < questions.length - 1) setStep(step + 1)
    else setPhase('done')
  }

  const back = () => {
    if (phase === 'done') setPhase('quiz')
    else if (step > 0) setStep(step - 1)
    else setPhase('intro')
  }

  const showResult = (a: Answers) => {
    setAnswers(a)
    setPhase('result')
    saveAnswers(diagnosis.slug, a)
    setSaved(a)
    trackEvent('diagnosis_complete', { diagnosis_id: diagnosis.id })
  }

  const restart = () => {
    clearSavedAnswers(diagnosis.slug)
    setSaved(null)
    start()
  }

  const top = result?.results.slice(0, TOP_N) ?? []
  const others = result?.results.slice(TOP_N) ?? []

  return (
    <div className="container page">
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <ol>
          <li>
            <Link to="/">ホーム</Link>
          </li>
          <li aria-current="page">{diagnosis.name}</li>
        </ol>
      </nav>

      <header className="diagnosis-header">
        <span className="diagnosis-header__icon" aria-hidden="true">
          {diagnosis.icon}
        </span>
        <h1>{diagnosis.name}</h1>
      </header>

      <div className="panel" ref={panelRef}>
        {questions.length === 0 ? (
          <div className="empty-state">
            <h2>この診断は準備中です</h2>
            <p>質問データが登録されていないため、現在ご利用いただけません。</p>
            <Link to="/" className="button button--primary">
              ほかの診断を見る
            </Link>
          </div>
        ) : phase === 'intro' ? (
          <div className="intro">
            <p className="intro__text">{diagnosis.intro}</p>
            <ul className="intro__meta">
              <li>質問 {questions.length} 問</li>
              <li>約30秒</li>
              <li>無料・登録不要</li>
            </ul>
            <button type="button" className="button button--primary button--large" onClick={start}>
              診断をはじめる
            </button>
            {saved && (
              <button type="button" className="button button--ghost" onClick={() => showResult(saved)}>
                前回の診断結果を見る
              </button>
            )}
          </div>
        ) : phase === 'quiz' ? (
          <>
            <ProgressBar current={step + 1} total={questions.length} />
            <QuestionStep
              question={questions[step]}
              selectedId={answers[questions[step].id]}
              onSelect={select}
              onBack={back}
              backLabel={step === 0 ? '説明に戻る' : '前の質問に戻る'}
            />
          </>
        ) : phase === 'done' ? (
          <>
            <ProgressBar current={questions.length} total={questions.length} />
            <div className="done">
              <p className="done__icon" aria-hidden="true">
                ✓
              </p>
              <h2>すべての質問に回答しました</h2>
              <button type="button" className="button button--primary button--large" onClick={() => showResult(answers)}>
                診断結果を見る
              </button>
              <button type="button" className="button button--ghost" onClick={back}>
                ← 最後の質問に戻る
              </button>
            </div>
          </>
        ) : (
          <section aria-labelledby="result-title">
            <h2 id="result-title" className="result-title" ref={resultHeadingRef} tabIndex={-1}>
              診断結果
            </h2>
            <p className="result-lead">
              あなたの回答と商品の特徴を照らし合わせ、<strong>相性の高い順</strong>
              に表示しています。人気や売上のランキングではありません。
            </p>

            <details className="answer-summary">
              <summary>あなたの回答を確認する</summary>
              <dl>
                {questions.map((q) => {
                  const option = q.options.find((o) => o.id === answers[q.id])
                  return (
                    <div key={q.id}>
                      <dt>{q.shortLabel}</dt>
                      <dd>{option?.label ?? '未回答'}</dd>
                    </div>
                  )
                })}
              </dl>
            </details>

            {top.length === 0 ? (
              <div className="empty-state">
                <h3>現在表示できる商品がありません</h3>
                <p>商品情報を準備中です。時間をおいて再度お試しください。</p>
              </div>
            ) : (
              <div className="result-list">
                {top.map((r, i) => (
                  <ResultCard key={r.product.id} result={r} rank={i + 1} diagnosis={diagnosis} />
                ))}
              </div>
            )}

            {others.length > 0 && (
              <details className="others">
                <summary>そのほかの候補（{others.length}件）</summary>
                <ol start={TOP_N + 1}>
                  {others.map((r) => (
                    <li key={r.product.id}>
                      <span>{r.product.name}</span>
                      <span className="others__score">相性 {r.matchPercent}%</span>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <div className="notes">
              <p>※ {site.priceNotice}</p>
              {diagnosis.notice && <p>※ {diagnosis.notice}</p>}
              <p>※ 相性スコアは回答内容と商品の特徴から機械的に計算した目安です。</p>
            </div>

            <div className="result-actions">
              <button type="button" className="button button--primary" onClick={restart}>
                もう一度診断する
              </button>
              <Link to="/#categories" className="button button--ghost">
                ほかの診断を見る
              </Link>
            </div>
          </section>
        )}
      </div>

      <GuideSection guide={diagnosis.guide} />
    </div>
  )
}

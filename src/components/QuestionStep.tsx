import { useEffect, useRef } from 'react'
import type { Question } from '../types/diagnosis.ts'

interface Props {
  question: Question
  selectedId?: string
  onSelect: (optionId: string) => void
  onBack: () => void
  backLabel: string
}

export function QuestionStep({ question, selectedId, onSelect, onBack, backLabel }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // 質問が切り替わったら見出しにフォーカス（キーボード・読み上げ利用者向け）
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
  }, [question.id])

  return (
    <div className="question">
      <h2 className="question__text" ref={headingRef} tabIndex={-1}>
        {question.text}
      </h2>
      {question.help && <p className="question__help">{question.help}</p>}
      <div className="question__options" role="group" aria-label={question.text}>
        {question.options.map((option) => {
          const selected = option.id === selectedId
          return (
            <button
              key={option.id}
              type="button"
              className={`option-button${selected ? ' is-selected' : ''}`}
              aria-pressed={selected}
              onClick={() => onSelect(option.id)}
            >
              <span className="option-button__check" aria-hidden="true">
                {selected ? '✓' : ''}
              </span>
              <span className="option-button__body">
                <span className="option-button__label">{option.label}</span>
                {option.description && <span className="option-button__desc">{option.description}</span>}
              </span>
            </button>
          )
        })}
      </div>
      <div className="question__nav">
        <button type="button" className="button button--ghost" onClick={onBack}>
          ← {backLabel}
        </button>
      </div>
    </div>
  )
}

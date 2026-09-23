export function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0
  return (
    <div className="progress">
      <p className="progress__label">
        質問 <strong>{current}</strong> / {total}
      </p>
      <div
        className="progress__track"
        role="progressbar"
        aria-label="診断の進み具合"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={`全${total}問中${current}問目`}
      >
        <div className="progress__fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

import type { Diagnosis } from '../types/diagnosis.ts'

/**
 * 診断ページの概要（この診断で確認すること・診断結果について）。
 * 質問の一覧は各診断の questions から作るため、診断ごとに実際の質問内容が表示されます。
 * プリレンダリングされるので、JavaScript を実行しない検索エンジンにも診断の内容が伝わります。
 */
export function DiagnosisOverview({ diagnosis }: { diagnosis: Diagnosis }) {
  const { questions } = diagnosis
  if (questions.length === 0) return null
  return (
    <section className="guide diagnosis-overview" aria-labelledby="overview-title">
      <h2 id="overview-title">この診断で確認すること</h2>
      <p className="guide__intro">{questions.length}問の質問で、次のことを確認します。</p>
      <ol className="diagnosis-overview__list">
        {questions.map((q) => (
          <li key={q.id}>
            <strong>{q.shortLabel}</strong>：{q.text}
          </li>
        ))}
      </ol>
      <h2 id="overview-result-title" className="diagnosis-overview__heading">
        診断結果について
      </h2>
      <ul className="diagnosis-overview__list">
        <li>回答内容と各商品の特徴を照合して相性を計算し、条件に合う候補を相性の高い順に上位3件まで表示します。</li>
        <li>人気ランキングや売上ランキングではなく、紹介料の有無で順位を変えることもありません。</li>
        <li>購入前には、販売サイトやメーカーの最新情報をご確認ください。</li>
      </ul>
    </section>
  )
}

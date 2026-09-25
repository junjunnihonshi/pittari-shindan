/**
 * 診断データの検証で共通に使う処理（npm run check と公開ワークフローで共有）。
 * - 全回答パターンの列挙
 * - 全パターンでの動作確認（結果件数・条件違反・%の並び・別枠の構成）
 * - 全パターンの結果の「スナップショット」（公開版との完全一致の比較用）
 */
import type { DiagnosisResult } from '../../src/engine/diagnosisEngine.ts'
import type { Answers, Diagnosis } from '../../src/types/diagnosis.ts'

/** 診断を実行する関数（公開版と作業中のエンジンを差し替えて比べられるよう、引数で受け取る） */
export type RunDiagnosis = (diagnosis: Diagnosis, answers: Answers) => DiagnosisResult

/** ありうる全ての回答の組み合わせ */
export function* combinations(d: Diagnosis, i = 0, acc: Answers = {}): Generator<Answers> {
  if (i === d.questions.length) return yield { ...acc }
  const q = d.questions[i]
  for (const o of q.options) yield* combinations(d, i + 1, { ...acc, [q.id]: o.id })
}

/** 1位（通常ランキングが空なら補完候補の先頭）の相性がこの値（%）未満なら「相性が低い」パターンとして数える */
const LOW_MATCH = 60

export interface PatternFailure {
  message: string
  answers: Answers
}

export interface PatternReport {
  /** 回答パターン数 */
  count: number
  /** 動作確認で見つかった問題（1件でもあれば不合格） */
  failures: PatternFailure[]
  /** 一度も1位にならない商品ID（参考情報） */
  neverTop: string[]
  /** 1位の相性が60%未満のパターン数 */
  lowMatch: number
  /** 補完候補（別枠）が出るパターン数 */
  withSupplements: number
}

/** 全パターンで診断を実行し、画面に出る結果が壊れていないかを確認する */
export function checkPatterns(d: Diagnosis, run: RunDiagnosis): PatternReport {
  const report: PatternReport = { count: 0, failures: [], neverTop: [], lowMatch: 0, withSupplements: 0 }
  const topCount = new Map<string, number>()
  const enabledCount = d.products.filter((p) => p.enabled).length
  for (const answers of combinations(d)) {
    report.count++
    const { results, ranked, supplements } = run(d, answers)
    const fail = (message: string) => report.failures.push({ message, answers })
    // 画面に出る件数（通常ランキング＋別枠の補完候補）が、商品数の範囲で3件そろっていること
    if (ranked.length + supplements.length < Math.min(3, enabledCount)) fail('結果件数が不足')
    if (results.some((r) => !(r.matchPercent >= 0 && r.matchPercent <= 100) || !r.reason)) fail('スコアまたは理由が不正')
    // 通常ランキングには条件（予算・適格条件）を満たす商品だけが入り、相性%は上の順位ほど高い（同点は可）
    if (ranked.some((r) => r.overBudget || r.ineligible)) fail('通常ランキングに条件外の商品が混在')
    if (ranked.some((r, i) => i > 0 && r.matchPercent > ranked[i - 1].matchPercent)) fail('通常ランキングで下の順位の相性%が上の順位より高い')
    // 補完候補は、通常ランキングが3件未満のときだけ、条件外の商品で構成される
    if (supplements.length > 0 && ranked.length >= 3) fail('通常ランキングが3件あるのに補完候補がある')
    if (supplements.some((r) => !r.overBudget && !r.ineligible)) fail('補完候補に条件を満たす商品が混在')
    const top = ranked[0] ?? supplements[0]
    if (top) {
      topCount.set(top.product.id, (topCount.get(top.product.id) ?? 0) + 1)
      if (top.matchPercent < LOW_MATCH) report.lowMatch++
    }
    if (supplements.length > 0) report.withSupplements++
  }
  report.neverTop = d.products.filter((p) => p.enabled && !topCount.has(p.id)).map((p) => p.id)
  return report
}

/**
 * 全パターンの結果（順位・相性%・スコア・理由・別枠・注意書き）を1つの文字列にまとめる。
 * 公開版と作業中で文字列が一致すれば、その診断の表示結果は完全に同じ。
 */
export function snapshot(d: Diagnosis, run: RunDiagnosis): string {
  const rows: unknown[] = []
  for (const answers of combinations(d)) {
    const r = run(d, answers)
    const pick = (list: DiagnosisResult['results']) =>
      list.map((y) => [y.product.id, y.matchPercent, y.score, y.reason, y.overBudget, y.ineligible, y.supplementLabels])
    rows.push([pick(r.ranked), pick(r.supplements), pick(r.results), r.notices])
  }
  return JSON.stringify(rows)
}

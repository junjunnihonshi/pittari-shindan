/**
 * 1つの診断を全到達可能パターンで実行し、公開前の確認に使う数字と問題を集計する
 * （npm run diagnosis:validate と npm run diagnosis:preflight で共有）。
 *
 * 問題（errors）は種類ごとに分ける：
 *   data        … 入力チェック（src/data/validate.ts）と既存の全パターン確認（checkPatterns）の失敗
 *   eligibility … 通常ランキングに適格条件を満たさない商品
 *   budget      … 通常ランキングに予算を超える商品／予算内の商品があるのに1位が予算超え
 *   order       … 相性%と順位の矛盾（下の順位の%が上より高い、表示%とスコアの不一致）
 *   reason      … 理由文の矛盾
 */
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { validateDiagnoses } from '../../src/data/validate.ts'
import type { DiagnosisResult, ProductResult } from '../../src/engine/diagnosisEngine.ts'
import { scoreQuestion } from '../../src/engine/scoring.ts'
import type { AnswerOption, Answers, Diagnosis } from '../../src/types/diagnosis.ts'
import { checkPatterns, combinations, type RunDiagnosis } from './diagnosisChecks.ts'

export type ErrorKind = 'data' | 'eligibility' | 'budget' | 'order' | 'reason'
export type TieStage = 'question' | 'value' | 'id'

export interface DiagnosisStats {
  count: number
  errors: { kind: ErrorKind; message: string }[]
  /** 商品ID → 1位回数・TOP3回数（表示される上位3件。別枠を含む） */
  top1: Map<string, number>
  top3: Map<string, number>
  lowMatch: number
  under20: number
  withSupplements: number
  /** 1位と2位が完全同点のときの決着段階 */
  ties: Record<TieStage, number>
  /** 詳細表示用：回答（質問ID=選択肢ID）ごとの 60%未満・別枠の件数と出現数、ID順で決まった商品の組 */
  byAnswer: Map<string, { total: number; lowMatch: number; supplements: number; top1: Map<string, number> }>
  idPairs: Map<string, number>
}

/** 理由文の矛盾：「よく合っている」に挙げた回答の一致度が 0.8 未満、「やや差がある」に挙げた回答の一致度が 0.5 以上 */
function reasonProblems(r: ProductResult): string[] {
  const out: string[] = []
  const [main, weakPart] = r.reason.split('一方で')
  const quoted = [...main.matchAll(/「([^」]+)」/g)].map((m) => m[1])
  for (const q of quoted) {
    const b = r.breakdown.find((b) => b.answerSummary === q)
    if (!b || b.score < 0.8) out.push(`理由文の矛盾（${r.product.id}：「${q}」の一致度が低い）`)
  }
  if (/よく合って|比較的合って/.test(main) && quoted.length === 0) out.push(`理由文の矛盾（${r.product.id}：根拠の回答がない）`)
  const weak = weakPart?.match(/「([^」]+)」（([^）]+)）/)
  if (weak) {
    const b = r.breakdown.find((b) => b.label === weak[1])
    if (!b || b.score >= 0.5) out.push(`理由文の矛盾（${r.product.id}：「${weak[1]}」は差がない）`)
  }
  return out
}

/**
 * 完全同点の決着段階。エンジンの tieBreak（src/engine/diagnosisEngine.ts の makeTieBreaker）と同じ順で判定する：
 * 質問ごとの一致度（重みの大きい質問から）→ 回答に使われた評価項目の元の値 → 商品ID
 */
export function tieStage(d: Diagnosis, a: Answers, x: ProductResult, y: ProductResult): TieStage {
  const order = d.questions
    .map((q, i) => ({ q, i, option: q.options.find((o) => o.id === a[q.id]) }))
    .filter((z): z is { q: Diagnosis['questions'][number]; i: number; option: AnswerOption } => !!z.option && z.option.effects.length > 0)
    .sort((p, q) => q.q.weight - p.q.weight || p.i - q.i)
  if (order.some(({ q }) => scoreQuestion(q, a[q.id], x.product) !== scoreQuestion(q, a[q.id], y.product))) return 'question'
  const raw = (p: ProductResult['product'], o: AnswerOption): number | undefined => {
    let sum = 0
    let weights = 0
    for (const e of o.effects) {
      if (e.type === 'custom' || e.type === 'equals' || e.attr === 'priceRange') continue
      const v = p.attributes[e.attr]
      if (typeof v !== 'number') continue
      const w = e.weight ?? 1
      sum += (e.type === 'near' ? -Math.abs(v - e.value) : e.type === 'atMost' ? -v : v) * w
      weights += w
    }
    return weights > 0 ? sum / weights : undefined
  }
  for (const { option } of order) {
    const vx = raw(x.product, option)
    const vy = raw(y.product, option)
    if (vx !== undefined && vy !== undefined && vx !== vy) return 'value'
  }
  return 'id'
}

/** 登録済みの診断（src/data/diagnoses/index.ts）か、--file で指定した診断ファイルから診断を読み込む */
export async function loadDiagnosis(id: string, file?: string): Promise<Diagnosis> {
  if (!file) {
    const { diagnoses } = await import('../../src/data/diagnoses/index.ts')
    const d = diagnoses.find((x) => x.id === id)
    if (!d) throw new Error(`診断「${id}」が src/data/diagnoses/index.ts に登録されていません`)
    return d
  }
  const mod = await import(pathToFileURL(path.resolve(file)).href)
  const d = Object.values(mod).find((v): v is Diagnosis => !!v && typeof v === 'object' && (v as Diagnosis).id === id)
  if (!d) throw new Error(`${file} に診断「${id}」がありません`)
  return d
}

/** コマンドライン引数から <id> と --file <path> を取り出す */
export function parseTargetArgs(args: string[], usage: string): { id: string; file?: string } {
  const file = args.includes('--file') ? args[args.indexOf('--file') + 1] : undefined
  const id = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--file')
  if (!id) throw new Error(`使い方: ${usage}`)
  return { id, file }
}

const inc = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1)

export function analyzeDiagnosis(d: Diagnosis, run: RunDiagnosis): DiagnosisStats {
  const errors: DiagnosisStats['errors'] = validateDiagnoses([d]).map((m) => ({ kind: 'data' as const, message: `データ：${m}` }))
  // 既存の確認（結果件数・スコア・条件外の混在・%の並び・別枠の構成）
  const base = checkPatterns(d, run)
  for (const f of base.failures) {
    const kind: ErrorKind = f.message.includes('相性%') ? 'order' : 'data'
    errors.push({ kind, message: `${f.message} ${JSON.stringify(f.answers)}` })
  }

  const stats: DiagnosisStats = {
    count: base.count,
    errors,
    top1: new Map(),
    top3: new Map(),
    lowMatch: base.lowMatch,
    under20: 0,
    withSupplements: base.withSupplements,
    ties: { question: 0, value: 0, id: 0 },
    byAnswer: new Map(),
    idPairs: new Map(),
  }
  for (const a of combinations(d)) {
    const r: DiagnosisResult = run(d, a)
    const shown = [...r.ranked, ...r.supplements]
    const selected = d.questions.map((q) => q.options.find((o) => o.id === a[q.id])).filter((o) => !!o)
    const elig = selected.flatMap((o) => (o.eligibility ? [o.eligibility].flat() : []))
    const limits = selected.flatMap((o) => (o.maxPriceRange !== undefined ? [o.maxPriceRange] : []))
    const limit = limits.length ? Math.min(...limits) : Infinity
    const fail = (kind: ErrorKind, m: string) => errors.push({ kind, message: `${m} ${JSON.stringify(a)}` })
    // 条件・予算：通常ランキングの商品が本当に条件を満たすか（エンジンの判定とは別に商品データから確認）
    for (const x of r.ranked) {
      if (elig.some((e) => x.product.attributes[e.attr] !== e.value)) fail('eligibility', `eligibility違反（${x.product.id}）`)
      if (x.product.priceRange > limit) fail('budget', `予算違反（${x.product.id}）`)
    }
    const top = r.ranked[0] ?? r.supplements[0]
    const inLimitExists = d.products.some((p) => p.enabled && p.priceRange <= limit && !elig.some((e) => p.attributes[e.attr] !== e.value))
    if (top && inLimitExists && top.product.priceRange > limit) fail('budget', `予算違反（予算内の商品があるのに1位が予算超え：${top.product.id}）`)
    // 相性%の不整合：表示用の%がスコアと一致しない
    for (const x of r.results) if (x.matchPercent !== Math.round(x.score * 100)) fail('order', `相性%の不整合（${x.product.id}）`)
    for (const x of shown) for (const m of reasonProblems(x)) fail('reason', m)
    if (!top) continue
    inc(stats.top1, top.product.id)
    for (const x of shown.slice(0, 3)) inc(stats.top3, x.product.id)
    if (top.matchPercent < 20) stats.under20++
    for (const q of d.questions) {
      const key = `${q.id}=${a[q.id]}`
      const s = stats.byAnswer.get(key) ?? { total: 0, lowMatch: 0, supplements: 0, top1: new Map() }
      s.total++
      if (top.matchPercent < 60) s.lowMatch++
      if (r.supplements.length) s.supplements++
      inc(s.top1, top.product.id)
      stats.byAnswer.set(key, s)
    }
    const [x1, x2] = r.ranked.length >= 2 ? r.ranked : shown
    if (x1 && x2 && x1.score === x2.score) {
      const stage = tieStage(d, a, x1, x2)
      stats.ties[stage]++
      if (stage === 'id') inc(stats.idPairs, `${x1.product.id} > ${x2.product.id}`)
    }
  }
  return stats
}

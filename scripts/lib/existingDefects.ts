/**
 * 画面確認で見つかった問題が「変更前から同じ状態の既存の不具合」かどうかの判定（公開ワークフロー用）。
 *
 * 次をすべて満たす場合だけ既存の不具合とする（それ以外は今回の変更で起きた可能性があるため公開を止める）：
 * - 対象（新しく公開する）診断ではない、ほかの診断の問題
 * - 画像を読み込めない問題で、どの商品の画像か分かっている
 * - その診断の結果に影響するファイルが比較先と同じ（依存ファイルのハッシュ一致）
 * - 読み込めない商品の画像URLが比較先と同じで、画像URL自体を直接取得しても画像が返らない（配信元の削除など外部の原因）
 */
import type { UiIssue } from './browserChecks.ts'

export interface ExistingDefectContext {
  targetId: string
  /** 結果に影響するファイルが比較先と同じ診断 */
  unchangedIds: Set<string>
  /** 作業中の商品画像URL（診断ID・商品名から） */
  currentImage: (diagnosisId: string, productName: string) => string | undefined
  /** 比較先の商品画像URL（診断ID → 商品名 → imageUrl） */
  baseImages: Map<string, Map<string, string>>
  /** 画像URLを直接取得して画像が返るか */
  imageLoads: (url: string) => Promise<boolean>
}

export async function isPreexistingImageIssue(i: UiIssue, ctx: ExistingDefectContext): Promise<boolean> {
  if (!i.diagnosisId || i.diagnosisId === ctx.targetId || !i.imageFailedProducts?.length || !ctx.unchangedIds.has(i.diagnosisId)) return false
  const before = ctx.baseImages.get(i.diagnosisId)
  if (!before) return false
  for (const name of i.imageFailedProducts) {
    const url = ctx.currentImage(i.diagnosisId, name)
    if (!url || before.get(name) !== url) return false
    if (await ctx.imageLoads(url)) return false
  }
  return true
}

export async function imageLoads(url: string): Promise<boolean> {
  const res = await fetch(url).catch(() => null)
  return Boolean(res && res.status === 200 && (res.headers.get('content-type') ?? '').startsWith('image/'))
}

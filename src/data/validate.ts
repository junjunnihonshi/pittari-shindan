import type { Diagnosis } from '../types/diagnosis.ts'

/**
 * 診断データの簡易チェック。
 * 開発時はブラウザのコンソール、ビルド時はターミナルに警告が表示されます。
 * （警告があってもサイトは壊れずに動作します）
 */
export function validateDiagnoses(list: Diagnosis[]): string[] {
  const problems: string[] = []
  const slugs = new Set<string>()
  const productIds = new Set<string>()

  for (const d of list) {
    const where = `[${d.id}]`
    if (!/^[a-z0-9-]+$/.test(d.slug)) problems.push(`${where} slug は半角英小文字・数字・ハイフンのみ使えます: "${d.slug}"`)
    if (slugs.has(d.slug)) problems.push(`${where} slug が重複しています: "${d.slug}"`)
    slugs.add(d.slug)

    if (d.questions.length === 0) problems.push(`${where} 質問が 1 つもありません`)
    const qIds = new Set<string>()
    for (const q of d.questions) {
      if (qIds.has(q.id)) problems.push(`${where} 質問IDが重複しています: "${q.id}"`)
      qIds.add(q.id)
      if (q.options.length < 2) problems.push(`${where} 質問 "${q.id}" の選択肢が 2 つ未満です`)
      const oIds = new Set<string>()
      for (const o of q.options) {
        if (oIds.has(o.id)) problems.push(`${where} 質問 "${q.id}" の選択肢IDが重複しています: "${o.id}"`)
        oIds.add(o.id)
      }
    }

    const enabled = d.products.filter((p) => p.enabled)
    if (enabled.length === 0) problems.push(`${where} 表示できる商品（enabled: true）がありません`)
    for (const p of d.products) {
      if (productIds.has(p.id)) problems.push(`${where} 商品IDが重複しています: "${p.id}"`)
      productIds.add(p.id)
      if (p.category !== d.id) problems.push(`${where} 商品 "${p.id}" の category が "${p.category}" になっています（"${d.id}" にしてください）`)
    }
  }
  return problems
}

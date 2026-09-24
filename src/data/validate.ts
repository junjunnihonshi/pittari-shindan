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
      if (!(p.priceRange in d.priceLabels)) problems.push(`${where} 商品 "${p.id}" の priceRange ${p.priceRange} に対応する priceLabels がありません`)
    }

    // 質問が参照する評価項目が、表示中の商品すべてに入っているか。
    // 入っていないと、その項目は黙って中立（0.5点）で採点されるため、打ち間違いや入力漏れに気づけるよう警告する
    const referenced = new Set<string>()
    for (const q of d.questions) {
      for (const o of q.options) {
        for (const e of o.effects) if (e.type !== 'custom' && e.attr !== 'priceRange') referenced.add(e.attr)
        // 適格条件で使う評価項目も対象
        for (const e of o.eligibility ? [o.eligibility].flat() : []) referenced.add(e.attr)
        if (o.eligibility && o.effects.length > 0) {
          problems.push(`${where} 質問 "${q.id}" の選択肢 "${o.id}" は適格条件を持つため、effects は空にしてください（採点しても差が付かないため）`)
        }
        if (o.maxPriceRange !== undefined && !(o.maxPriceRange in d.priceLabels)) {
          problems.push(`${where} 質問 "${q.id}" の選択肢 "${o.id}" の maxPriceRange ${o.maxPriceRange} に対応する priceLabels がありません`)
        }
      }
    }
    for (const attr of referenced) {
      const missing = enabled.filter((p) => !(attr in p.attributes)).map((p) => p.id)
      if (missing.length === enabled.length) {
        problems.push(`${where} 質問で使っている評価項目 "${attr}" が、どの商品の attributes にもありません（項目名の打ち間違いの可能性）`)
      } else if (missing.length > 0) {
        problems.push(`${where} 評価項目 "${attr}" が次の商品にありません（中立で採点されます）: ${missing.join(', ')}`)
      }
    }
  }
  return problems
}

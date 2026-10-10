/**
 * 選び方コラム同士の関連付け（記事ページ末尾の「関連する選び方コラム」に表示）。
 * 本文で触れている使い方・併用・共通の確認ポイントでつながる記事だけを並べる（件数合わせはしない）。
 * キーは記事の slug、値は関連記事の slug（表示順）。存在しない slug・自分自身・重複は表示時に除外する。
 */
import { columns, type Column } from './index.ts'

const related: Record<string, string[]> = {
  // キッチン
  'blender-how-to-choose': ['electric-pressure-cooker-how-to-choose', 'microwave-how-to-choose'],
  'hot-plate-how-to-choose': ['frying-pan-how-to-choose', 'electric-pressure-cooker-how-to-choose'],
  'frying-pan-how-to-choose': ['hot-plate-how-to-choose', 'electric-pressure-cooker-how-to-choose', 'air-fryer-how-to-choose', 'dishwasher-how-to-choose'],
  'air-fryer-how-to-choose': ['toaster-how-to-choose', 'microwave-how-to-choose', 'frying-pan-how-to-choose'],
  'toaster-how-to-choose': ['microwave-how-to-choose', 'air-fryer-how-to-choose', 'coffee-maker-how-to-choose'],
  'electric-kettle-how-to-choose': ['coffee-maker-how-to-choose'],
  'coffee-maker-how-to-choose': ['electric-kettle-how-to-choose', 'toaster-how-to-choose'],
  'dishwasher-how-to-choose': ['frying-pan-how-to-choose'],
  'microwave-how-to-choose': ['toaster-how-to-choose', 'air-fryer-how-to-choose'],
  'electric-pressure-cooker-how-to-choose': ['rice-cooker-how-to-choose', 'blender-how-to-choose', 'microwave-how-to-choose'],
  'rice-cooker-how-to-choose': ['electric-pressure-cooker-how-to-choose', 'microwave-how-to-choose'],
  'refrigerator-how-to-choose': ['washing-machine-how-to-choose', 'air-conditioner-how-to-choose'],
  // デジタル
  'bluetooth-speaker-how-to-choose': ['wireless-earbuds-how-to-choose', 'soundbar-how-to-choose'],
  'soundbar-how-to-choose': ['tv-how-to-choose', 'projector-how-to-choose', 'bluetooth-speaker-how-to-choose'],
  'projector-how-to-choose': ['tv-how-to-choose', 'soundbar-how-to-choose', 'monitor-how-to-choose'],
  'smartwatch-how-to-choose': ['wireless-earbuds-how-to-choose', 'mobile-battery-how-to-choose'],
  'monitor-how-to-choose': ['tv-how-to-choose', 'desk-chair-how-to-choose', 'tablet-how-to-choose'],
  'tablet-how-to-choose': ['mobile-battery-how-to-choose', 'wifi-router-how-to-choose', 'monitor-how-to-choose'],
  'mobile-battery-how-to-choose': ['tablet-how-to-choose', 'smartwatch-how-to-choose', 'wireless-earbuds-how-to-choose', 'suitcase-how-to-choose'],
  'printer-how-to-choose': ['wifi-router-how-to-choose', 'monitor-how-to-choose'],
  'wifi-router-how-to-choose': ['tablet-how-to-choose', 'tv-how-to-choose', 'printer-how-to-choose'],
  'wireless-earbuds-how-to-choose': ['bluetooth-speaker-how-to-choose', 'smartwatch-how-to-choose', 'mobile-battery-how-to-choose'],
  'tv-how-to-choose': ['soundbar-how-to-choose', 'projector-how-to-choose', 'monitor-how-to-choose'],
  // 美容・身だしなみ
  'shampoo-how-to-choose': ['hair-treatment-how-to-choose', 'hair-dryer-how-to-choose', 'body-soap-how-to-choose'],
  'hair-treatment-how-to-choose': ['shampoo-how-to-choose', 'hair-dryer-how-to-choose', 'hair-iron-how-to-choose'],
  'body-soap-how-to-choose': ['shower-head-how-to-choose', 'shampoo-how-to-choose'],
  'hair-iron-how-to-choose': ['hair-dryer-how-to-choose', 'hair-treatment-how-to-choose'],
  'electric-toothbrush-how-to-choose': ['mens-shaver-how-to-choose'],
  'mens-shaver-how-to-choose': ['electric-toothbrush-how-to-choose', 'hair-dryer-how-to-choose'],
  'hair-dryer-how-to-choose': ['hair-iron-how-to-choose', 'hair-treatment-how-to-choose', 'shampoo-how-to-choose'],
  // 暮らし
  'circulator-fan-how-to-choose': ['air-conditioner-how-to-choose', 'dehumidifier-how-to-choose', 'heater-how-to-choose'],
  'dehumidifier-how-to-choose': ['circulator-fan-how-to-choose', 'washing-machine-how-to-choose', 'air-conditioner-how-to-choose', 'humidifier-how-to-choose'],
  'shower-head-how-to-choose': ['body-soap-how-to-choose', 'shampoo-how-to-choose'],
  'pillow-how-to-choose': ['mattress-how-to-choose', 'electric-blanket-how-to-choose'],
  'desk-chair-how-to-choose': ['monitor-how-to-choose'],
  'electric-blanket-how-to-choose': ['heater-how-to-choose', 'mattress-how-to-choose'],
  'heater-how-to-choose': ['electric-blanket-how-to-choose', 'air-conditioner-how-to-choose', 'humidifier-how-to-choose'],
  'air-purifier-how-to-choose': ['humidifier-how-to-choose', 'dehumidifier-how-to-choose', 'air-conditioner-how-to-choose'],
  'humidifier-how-to-choose': ['air-purifier-how-to-choose', 'dehumidifier-how-to-choose', 'heater-how-to-choose'],
  'vacuum-how-to-choose': ['robot-vacuum-how-to-choose', 'air-purifier-how-to-choose'],
  'robot-vacuum-how-to-choose': ['vacuum-how-to-choose', 'air-purifier-how-to-choose'],
  'washing-machine-how-to-choose': ['dehumidifier-how-to-choose', 'refrigerator-how-to-choose'],
  'mattress-how-to-choose': ['pillow-how-to-choose', 'electric-blanket-how-to-choose'],
  'air-conditioner-how-to-choose': ['circulator-fan-how-to-choose', 'dehumidifier-how-to-choose', 'air-purifier-how-to-choose', 'heater-how-to-choose'],
  // 旅行
  'suitcase-how-to-choose': ['mobile-battery-how-to-choose'],
}

const bySlug = new Map(columns.map((c) => [c.slug, c]))

/** 関連記事（公開中の記事だけ。自分自身・重複を除く） */
export function getRelatedColumns(slug: string): Column[] {
  const slugs = [...new Set(related[slug] ?? [])].filter((s) => s !== slug)
  return slugs.map((s) => bySlug.get(s)).filter((c): c is Column => c !== undefined)
}

/** データの確認用：存在しない slug・自分自身・重複の一覧（ビルド時の検査に使う） */
export function findRelatedProblems(): string[] {
  const problems: string[] = []
  for (const [key, list] of Object.entries(related)) {
    if (!bySlug.has(key)) problems.push(`関連コラムのキー ${key} が存在しません`)
    if (new Set(list).size !== list.length) problems.push(`${key} の関連コラムに重複があります`)
    for (const s of list) {
      if (s === key) problems.push(`${key} が自分自身を関連コラムにしています`)
      else if (!bySlug.has(s)) problems.push(`${key} の関連コラム ${s} が存在しません`)
    }
  }
  return problems
}

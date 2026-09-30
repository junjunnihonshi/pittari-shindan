import { categoryGroups } from '../config/categories.ts'
import type { Diagnosis } from '../types/diagnosis.ts'

/**
 * 検索用に文字をそろえる：全角英数・半角カナ → NFKC、大文字 → 小文字、カタカナ → ひらがな。
 * 「ＢＲＵＮＯ」と「bruno」、「コーヒー」「こーひー」「ｺｰﾋｰ」を同じ文字列として比べられる。
 */
export function normalizeSearchText(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
}

/** 入力を空白で区切った検索語（そろえた後の文字列）。空なら絞り込みなし */
export function toSearchWords(query: string): string[] {
  return normalizeSearchText(query).split(/\s+/).filter(Boolean)
}

/** 診断名・ジャンル名・説明文・カテゴリ名・検索用キーワード（ある場合）に、検索語がすべて含まれるか */
export function matchesDiagnosis(d: Diagnosis, words: string[]): boolean {
  const category = categoryGroups.find((g) => g.id === d.group)?.label ?? ''
  const text = normalizeSearchText([d.name, d.itemName, d.shortDescription, d.intro, category, ...(d.searchKeywords ?? [])].join(' '))
  return words.every((w) => text.includes(w))
}

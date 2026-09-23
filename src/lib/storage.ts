/**
 * 端末内（localStorage）への保存。個人情報は保存しません。
 * - 最近使った診断
 * - 診断ごとの前回の回答
 */
import type { Answers } from '../types/diagnosis.ts'

const RECENT_KEY = 'pittari:recent'
const ANSWERS_KEY = 'pittari:answers'
const MAX_RECENT = 5

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // プライベートブラウズ等で保存できない場合は何もしない
  }
}

export function getRecentDiagnoses(): string[] {
  const list = read<unknown>(RECENT_KEY, [])
  return Array.isArray(list) ? list.filter((s): s is string => typeof s === 'string') : []
}

export function addRecentDiagnosis(slug: string) {
  const list = [slug, ...getRecentDiagnoses().filter((s) => s !== slug)].slice(0, MAX_RECENT)
  write(RECENT_KEY, list)
}

export function getSavedAnswers(slug: string): unknown {
  const all = read<Record<string, unknown>>(ANSWERS_KEY, {})
  return all && typeof all === 'object' ? all[slug] : undefined
}

export function saveAnswers(slug: string, answers: Answers) {
  const all = read<Record<string, unknown>>(ANSWERS_KEY, {})
  write(ANSWERS_KEY, { ...(all && typeof all === 'object' ? all : {}), [slug]: answers })
}

export function clearSavedAnswers(slug: string) {
  const all = read<Record<string, unknown>>(ANSWERS_KEY, {})
  if (all && typeof all === 'object' && slug in all) {
    delete all[slug]
    write(ANSWERS_KEY, all)
  }
}

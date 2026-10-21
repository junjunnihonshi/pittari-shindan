/**
 * 商品の最終チェック（画像・楽天URL・価格帯・在庫、Amazon のみの商品は商品名・販売元・価格・在庫・送料）の合格記録。
 *
 * dry-run の直後に公開する場合など、同じ商品データを短時間に何度も確認しないために使う。
 * - 記録するのは「問題なし」だった商品だけ。商品データ（全項目）と価格帯の区切りのハッシュが1文字でも違えば使わない
 * - 有効期限は既定 120 分（環境変数 PUBLISH_PRODUCT_CACHE_MINUTES で変更、0 で無効）。期限切れは確認し直す
 * - --recheck-products・--verify（本番の再確認）・--full では使わない
 *
 * 記録は .git の中（.git/pittari-publish/product-checks.json）に置くので、作業ツリーや commit には含まれない。
 */
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type { Product } from '../../src/types/diagnosis.ts'

const VERSION = 1
export const PRODUCT_CACHE_MINUTES = Number(process.env.PUBLISH_PRODUCT_CACHE_MINUTES ?? 120)

interface Entry {
  key: string
  checkedAt: string
}

function cachePath(root: string): string {
  const r = spawnSync('git', ['rev-parse', '--git-path', 'pittari-publish'], { cwd: root, encoding: 'utf8' })
  if (r.status !== 0) throw new Error('git rev-parse --git-path に失敗しました')
  return path.join(path.resolve(root, r.stdout.trim()), 'product-checks.json')
}

/** 商品データ全体と価格帯の区切りから作るキー（どれかが変われば別の商品として確認し直す） */
export function productKey(p: Product, thresholds: number[]): string {
  return createHash('sha256').update(JSON.stringify({ v: VERSION, p, thresholds })).digest('hex')
}

function load(root: string): Entry[] {
  try {
    const data = JSON.parse(fs.readFileSync(cachePath(root), 'utf8')) as { version: number; entries: Entry[] }
    return data.version === VERSION && Array.isArray(data.entries) ? data.entries : []
  } catch {
    return []
  }
}

/** 有効期限内の合格記録があれば確認した時刻を返す */
export function findPassed(root: string, key: string): string | null {
  if (!(PRODUCT_CACHE_MINUTES > 0)) return null
  const hit = load(root).find((e) => e.key === key)
  if (!hit) return null
  const age = Date.now() - Date.parse(hit.checkedAt)
  return age >= 0 && age < PRODUCT_CACHE_MINUTES * 60 * 1000 ? hit.checkedAt : null
}

/** 問題なしだった商品を記録する（期限切れの記録はここで捨てる） */
export function savePassed(root: string, keys: string[]) {
  if (!keys.length) return
  const now = new Date().toISOString()
  const limit = PRODUCT_CACHE_MINUTES * 60 * 1000
  const kept = load(root).filter((e) => !keys.includes(e.key) && Date.now() - Date.parse(e.checkedAt) < limit)
  const file = cachePath(root)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify({ version: VERSION, entries: [...kept, ...keys.map((key) => ({ key, checkedAt: now }))] }, null, 2))
}

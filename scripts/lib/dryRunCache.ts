/**
 * dry-run の検証結果の記録（公開ワークフローの軽量化用）。
 *
 * dry-run が最後まで成功したとき、そのときの作業ツリー全体の git tree ハッシュと HEAD を記録する。
 * 本番の公開で、作業ツリー・HEAD・Node.js のバージョンがすべて同じなら、
 * 重い検証（全パターン検証・公開中の診断との完全一致確認・enabled 切り替えでの結果不変）を再実行せずに済ませる。
 * 1文字でも違えば記録は無効（削除）になり、すべて再検証する。
 *
 * 記録は .git の中（.git/pittari-publish/）に置くので、作業ツリーや commit には含まれない。
 */
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const VERSION = 1

export interface Fingerprint {
  head: string
  /** 作業ツリー全体（.gitignore 対象を除く、未追跡ファイルも含む）の git tree ハッシュ */
  tree: string
  node: string
}

interface DryRunRecord extends Fingerprint {
  version: number
  id: string
  createdAt: string
  /** dry-run で確認した内容（表示用） */
  results: string[]
  checksum: string
}

function git(root: string, args: string[], env?: NodeJS.ProcessEnv): string {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', env: { ...process.env, ...env }, maxBuffer: 100 * 1024 * 1024 })
  if (r.status !== 0) throw new Error(`git ${args.join(' ')} が失敗しました: ${r.stderr}`)
  return r.stdout.trim()
}

/**
 * 今の作業ツリーの指紋。一時的な index ファイルに HEAD と作業ツリーの全変更を載せて tree を作る
 * （本物の index・作業ツリーには触れない）。
 */
export function fingerprint(root: string): Fingerprint {
  const index = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'pittari-index-')), 'index')
  try {
    const env = { GIT_INDEX_FILE: index }
    git(root, ['read-tree', 'HEAD'], env)
    git(root, ['add', '-A'], env)
    return { head: git(root, ['rev-parse', 'HEAD']), tree: git(root, ['write-tree'], env), node: process.version }
  } finally {
    fs.rmSync(path.dirname(index), { recursive: true, force: true })
  }
}

function recordPath(root: string, id: string): string {
  const dir = path.resolve(root, git(root, ['rev-parse', '--git-path', 'pittari-publish']))
  return path.join(dir, `dry-run-${id}.json`)
}

function checksumOf(record: Omit<DryRunRecord, 'checksum'>): string {
  return createHash('sha256').update(JSON.stringify(record)).digest('hex')
}

export function saveDryRun(root: string, id: string, fp: Fingerprint, results: string[]) {
  const body: Omit<DryRunRecord, 'checksum'> = { version: VERSION, id, ...fp, createdAt: new Date().toISOString(), results }
  const file = recordPath(root, id)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify({ ...body, checksum: checksumOf(body) }, null, 2))
}

export function clearDryRun(root: string, id: string) {
  fs.rmSync(recordPath(root, id), { force: true })
}

/**
 * 今の作業ツリーと一致する dry-run の記録を探す。
 * 一致すれば記録を返し、記録がない・壊れている・一致しない場合は理由を返す（一致しない記録は削除する）。
 */
export function findDryRun(root: string, id: string, fp: Fingerprint): { record: DryRunRecord } | { reason: string } {
  const file = recordPath(root, id)
  if (!fs.existsSync(file)) return { reason: 'dry-run の記録がありません' }
  const invalid = (reason: string) => {
    clearDryRun(root, id)
    return { reason: `dry-run の記録を無効にしました（${reason}）` }
  }
  let record: DryRunRecord
  try {
    record = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return invalid('記録を読み取れません')
  }
  const { checksum, ...body } = record
  if (!checksum || checksum !== checksumOf(body)) return invalid('記録のハッシュが一致しません')
  if (record.version !== VERSION || record.id !== id) return invalid('記録の形式が違います')
  if (record.head !== fp.head) return invalid('dry-run 後に HEAD が変わっています')
  if (record.tree !== fp.tree) return invalid('dry-run 後にファイルが変更されています')
  if (record.node !== fp.node) return invalid('dry-run 後に Node.js のバージョンが変わっています')
  return { record }
}

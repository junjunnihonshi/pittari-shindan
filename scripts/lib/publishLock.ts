/**
 * 公開ワークフローの二重起動の防止。
 *
 * .git/pittari-publish/lock.json を排他的に作成し、実行中のプロセスID・診断ID・開始時刻を書く。
 * - 既にロックがあり、そのプロセスが生きていれば起動しない（同じ診断でも別の診断でも、公開処理は同時に1つだけ）
 * - ロックを作ったプロセスが残っていなければ（異常終了の跡）、古いロックとして取り除いてから取り直す
 * - 終了時（正常・停止・中断・時間切れ）に解放する
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

interface LockInfo {
  pid: number
  id: string
  mode: string
  startedAt: string
}

function lockPath(root: string): string {
  const r = spawnSync('git', ['rev-parse', '--git-path', 'pittari-publish'], { cwd: root, encoding: 'utf8' })
  if (r.status !== 0) throw new Error('git rev-parse --git-path に失敗しました')
  return path.join(path.resolve(root, r.stdout.trim()), 'lock.json')
}

function alive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (e) {
    // EPERM は「存在するが権限がない」
    return (e as NodeJS.ErrnoException).code === 'EPERM'
  }
}

/** ロックを取る。取れなければ理由を返す（取れたら解放する関数を返す） */
export function acquireLock(root: string, id: string, mode: string): { release: () => void; note?: string } | { error: string } {
  const file = lockPath(root)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const info: LockInfo = { pid: process.pid, id, mode, startedAt: new Date().toISOString() }
  let note: string | undefined
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      fs.writeFileSync(file, JSON.stringify(info, null, 2), { flag: 'wx' })
      const release = () => {
        try {
          const now = JSON.parse(fs.readFileSync(file, 'utf8')) as LockInfo
          if (now.pid === process.pid) fs.rmSync(file, { force: true })
        } catch {
          // すでに無い
        }
      }
      return { release, note }
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'EEXIST') throw e
      let other: LockInfo | null
      try {
        other = JSON.parse(fs.readFileSync(file, 'utf8')) as LockInfo
      } catch {
        other = null
      }
      if (other && alive(other.pid)) {
        return { error: `別の公開処理が実行中です（${other.id}・${other.mode}・PID ${other.pid}・${other.startedAt} 開始）。終了を待ってください` }
      }
      // プロセスが残っていない＝前回の異常終了の跡
      note = `前回の公開処理のロックが残っていたため取り除きました（${other ? `${other.id}・PID ${other.pid}・${other.startedAt} 開始` : '内容を読めないロック'}）`
      fs.rmSync(file, { force: true })
    }
  }
  return { error: 'ロックを取得できませんでした' }
}

// ---------- 強制終了からの復旧 ----------
// enabled を書き換える直前に元の内容を .git/pittari-publish/restore-<id>.json に保存し、commit か元に戻した時点で消す。
// プロセスが強制終了された（終了処理が動かない）場合は、次回の起動時にこの記録から元に戻す。

interface RestoreRecord {
  file: string
  original: string
  flipped: string
}

function restorePath(root: string, id: string): string {
  return path.join(path.dirname(lockPath(root)), `restore-${id}.json`)
}

export function saveRestorePoint(root: string, id: string, file: string, original: string, flipped: string) {
  fs.writeFileSync(restorePath(root, id), JSON.stringify({ file, original, flipped } satisfies RestoreRecord))
}

export function clearRestorePoint(root: string, id: string) {
  fs.rmSync(restorePath(root, id), { force: true })
}

/**
 * 前回の強制終了で残った書き換えを元に戻す。戻した・確認したことを文で返す（何もなければ空配列）。
 * ファイルが「enabled を書き換えた直後の内容」のままの場合だけ戻す。それ以外の変更が加わっていれば、手で確認するよう停止理由を返す
 */
export function recoverInterrupted(root: string): { notes: string[]; error?: string } {
  const dir = path.dirname(lockPath(root))
  if (!fs.existsSync(dir)) return { notes: [] }
  const notes: string[] = []
  for (const name of fs.readdirSync(dir).filter((f) => /^restore-.+\.json$/.test(f))) {
    const recordFile = path.join(dir, name)
    let rec: RestoreRecord
    try {
      rec = JSON.parse(fs.readFileSync(recordFile, 'utf8')) as RestoreRecord
    } catch {
      return { notes, error: `復旧用の記録（${recordFile}）を読めません。対象の診断ファイルの enabled を git diff で確認してください` }
    }
    const target = path.join(root, rec.file)
    const now = fs.existsSync(target) ? fs.readFileSync(target, 'utf8') : null
    if (now === rec.flipped) {
      fs.writeFileSync(target, rec.original)
      notes.push(`前回の公開処理が途中で強制終了されていたため、${rec.file} を元の内容（enabled: false）に戻しました`)
    } else if (now === rec.original) notes.push(`前回の公開処理の復旧記録がありましたが、${rec.file} はすでに元の内容でした`)
    else return { notes, error: `前回の公開処理が途中で終了し、${rec.file} が書き換え後と異なる内容になっています。git diff で確認してから ${recordFile} を削除してください` }
    fs.rmSync(recordFile, { force: true })
  }
  return { notes }
}

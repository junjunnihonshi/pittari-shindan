/**
 * 変更内容から「どこまで検証すればよいか」を判定する（公開ワークフローの軽量化用）。
 *
 * 判定は、ファイル名ではなく「診断結果に影響するファイルの内容のハッシュ」で行う。
 * - 共通の計算部分（エンジン・型・共通の質問部品・入力チェック）の依存ファイル一式のハッシュ
 * - 診断ごとの依存ファイル一式（診断ファイル＋それが import するファイル）のハッシュ
 * を比較先（既定は HEAD）と作業中で比べ、変わった診断だけを全パターン検証の対象にする。
 *
 * 次の場合は必ず「全診断のフル検証」にする（迷ったら重い方）。
 * - 共通の計算部分が変わった／検証の仕組みやビルド設定が変わった
 * - 依存関係を解析できない（外部パッケージ・動的 import・ファイルの読み込み等）
 * - 判定ルールに当てはまらないファイルが変わった
 * - 診断ファイルと診断IDの対応が取れない／診断ファイルが削除された
 * - 診断の登録簿（index.ts）に「新しい診断の追加」以外の変更がある
 */
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const DIAGNOSES_DIR = 'src/data/diagnoses'
const REGISTRY = `${DIAGNOSES_DIR}/index.ts`

/**
 * 全診断の結果に影響する共通ファイル（ここから import されるファイルも自動で含める）。
 * ランキング・eligibility・tieBreak・supplements・予算上限などはすべてエンジン（diagnosisEngine.ts / scoring.ts）にある。
 */
export const SHARED_RESULT_FILES = [
  'src/engine/diagnosisEngine.ts', // 順位付け・eligibility・予算上限・別枠（supplements）・注意書き
  'src/engine/scoring.ts', // 採点（near / atLeast / atMost / equals / custom・tieBreak・相性%）
  'src/types/diagnosis.ts', // 共通スキーマ
  `${DIAGNOSES_DIR}/shared.ts`, // 共通の質問部品（予算の質問など）
  'src/data/validate.ts', // データの入力チェック
]

/** 変わったら全診断をフル検証するファイル（検証の仕組み・ビルドや実行環境の設定） */
const FULL_CHECK_PATTERNS = [
  /^scripts\/lib\//,
  /^scripts\/checkDiagnoses\.ts$/,
  /^scripts\/publishDiagnosis\.ts$/,
  /^package(-lock)?\.json$/,
  /^tsconfig[^/]*\.json$/,
  /^vite\.config\.[^/]+$/,
  /^eslint\.config\.[^/]+$/,
]

/** 画面・文章だけに影響するファイル（診断結果の計算には使われない。依存解析で結果に関わると分かったものは除く） */
const UI_PATTERNS = [
  /^src\/components\//,
  /^src\/pages\//,
  /^src\/lib\//,
  /^src\/config\//,
  /^src\/(App|main)\.tsx$/,
  /^src\/[^/]+\.css$/,
  /^public\//,
  /^index\.html$/,
  /^scripts\/seoPlugin\.ts$/,
]

/** 公開サイトにも診断結果にも影響しないファイル（説明文書・楽天の商品検索ツール） */
const NO_EFFECT_PATTERNS = [/^[^/]+\.md$/, /^docs\//, /^scripts\/rakuten\//, /^\.gitignore$/]

/** 依存解析で「中身を読まないと影響が分からない」とみなす書き方 */
const UNANALYZABLE = [/\bimport\s*\(/, /\brequire\s*\(/, /\bimport\.meta\b/, /\beval\s*\(/, /\bnew\s+Function\b/, /\bprocess\./, /\bfetch\s*\(/]

export interface ChangeScope {
  /** true なら全診断をフル検証する */
  full: boolean
  /** 全パターン検証が必要な診断ID（full のときは全診断） */
  changedIds: Set<string>
  /** ハッシュ一致で「結果に影響する変更がない」と確認できた診断ID */
  unchangedIds: Set<string>
  /** 新しく追加された診断ID */
  newIds: Set<string>
  /** 画面（共通UI・CSS・文章）に影響する変更があるか */
  uiChanged: boolean
  /** 比較先から変わったファイル */
  changedFiles: string[]
  /** 判定の理由（表示用） */
  reasons: string[]
}

/** ファイルの中身を読む関数（比較先の git の内容と作業中の内容を切り替える）。ファイルがなければ null */
type Reader = (file: string) => string | null

function gitRaw(root: string, args: string[]): { ok: boolean; out: string } {
  // 日本語などのファイル名を引用符・エスケープなしで受け取る
  const r = spawnSync('git', ['-c', 'core.quotepath=false', ...args], { cwd: root, encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 })
  return { ok: r.status === 0, out: r.stdout ?? '' }
}

const normalize = (text: string) => text.replace(/\r\n/g, '\n')

function workReader(root: string): Reader {
  return (file) => {
    const p = path.join(root, file)
    return fs.existsSync(p) && fs.statSync(p).isFile() ? normalize(fs.readFileSync(p, 'utf8')) : null
  }
}

function gitReader(root: string, ref: string): Reader {
  const cache = new Map<string, string | null>()
  return (file) => {
    if (!cache.has(file)) {
      const r = gitRaw(root, ['show', `${ref}:${file}`])
      cache.set(file, r.ok ? normalize(r.out) : null)
    }
    return cache.get(file)!
  }
}

class UnknownDependency extends Error {}

/** entry から import をたどった依存ファイル一式（解析できない書き方があれば UnknownDependency） */
function dependencyClosure(entries: string[], read: Reader): Set<string> {
  const seen = new Set<string>()
  const queue = [...entries]
  while (queue.length) {
    const file = queue.pop()!
    if (seen.has(file)) continue
    const text = read(file)
    if (text === null) throw new UnknownDependency(`${file} が見つかりません`)
    seen.add(file)
    const hit = UNANALYZABLE.find((re) => re.test(text))
    if (hit) throw new UnknownDependency(`${file} に依存関係を解析できない書き方（${hit.source}）があります`)
    const info = ts.preProcessFile(text, true, true)
    if (info.referencedFiles.length || info.typeReferenceDirectives.length || info.libReferenceDirectives.length || info.ambientExternalModules?.length) {
      throw new UnknownDependency(`${file} に参照ディレクティブや ambient module があります`)
    }
    for (const { fileName } of info.importedFiles) {
      if (!fileName.startsWith('./') && !fileName.startsWith('../')) throw new UnknownDependency(`${file} が外部モジュール「${fileName}」を読み込んでいます`)
      const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), fileName))
      if (!resolved.endsWith('.ts') || resolved.startsWith('..')) throw new UnknownDependency(`${file} の import「${fileName}」を解決できません`)
      queue.push(resolved)
    }
  }
  return seen
}

/** 依存ファイル一式のハッシュ（パスと中身の組を並べて sha256） */
function closureHash(files: Set<string>, read: Reader): string {
  const h = createHash('sha256')
  for (const f of [...files].sort()) h.update(`${f}\0${read(f)}\0`)
  return h.digest('hex')
}

/** 診断ファイルの一覧（index.ts・shared.ts 以外の src/data/diagnoses/*.ts） */
function diagnosisFilesAt(list: string[]): string[] {
  return list.filter((f) => /^src\/data\/diagnoses\/[^/]+\.ts$/.test(f) && f !== REGISTRY && !SHARED_RESULT_FILES.includes(f)).sort()
}

/** 診断ファイルの中の診断ID（`  id: '...',` の一覧。診断ファイルならちょうど1つ、補助ファイルなら0） */
function diagnosisIdsIn(text: string): string[] {
  return [...text.matchAll(/^ {2}id: '([^']+)',$/gm)].map((m) => m[1])
}

/**
 * 登録簿（index.ts）の変更が「新しい診断ファイルの import 行と配列への1行追加」だけかを確認する。
 * それ以外の変更（削除・並べ替え・処理の変更）があれば false。
 */
function registryOnlyAddsNew(baseText: string | null, workText: string | null, newFiles: string[]): boolean {
  if (baseText === null || workText === null) return false
  const names = new Set<string>()
  const importRe = /^import \{ (\w+) \} from '\.\/(\w+)\.ts'$/
  const kept = workText.split('\n').filter((line) => {
    const m = line.match(importRe)
    if (m && newFiles.includes(`${DIAGNOSES_DIR}/${m[2]}.ts`)) {
      names.add(m[1])
      return false
    }
    return true
  })
  const rest = kept.filter((line) => {
    const m = line.match(/^ {2}(\w+),$/)
    return !(m && names.has(m[1]))
  })
  return rest.join('\n') === baseText
}

/**
 * 比較先（ref）から作業中までの変更を調べ、検証範囲を決める。
 * @param diagnosisIds 作業中の診断データに登録されている診断ID（ファイルとの対応確認に使う）
 */
export function determineScope(root: string, ref: string, diagnosisIds: string[]): ChangeScope {
  const reasons: string[] = []
  const scope: ChangeScope = {
    full: false,
    changedIds: new Set(),
    unchangedIds: new Set(),
    newIds: new Set(),
    uiChanged: false,
    changedFiles: [],
    reasons,
  }
  const fallback = (reason: string): ChangeScope => {
    reasons.push(`フル検証：${reason}`)
    // 判定できないときは画面側も含めて最も重い確認にする
    return { ...scope, full: true, changedIds: new Set(diagnosisIds), unchangedIds: new Set(), uiChanged: true, reasons }
  }

  // 変更ファイル（比較先との差分＋git 管理外の新規ファイル）
  const diff = gitRaw(root, ['diff', '--name-only', '--no-renames', ref])
  const untracked = gitRaw(root, ['ls-files', '--others', '--exclude-standard'])
  const baseList = gitRaw(root, ['ls-tree', '-r', '--name-only', ref, '--', DIAGNOSES_DIR])
  if (!diff.ok || !untracked.ok || !baseList.ok) return fallback('git から変更範囲を取得できません')
  const changedFiles = [...new Set([...diff.out.split('\n'), ...untracked.out.split('\n')].map((l) => l.trim()).filter(Boolean))].sort()
  scope.changedFiles = changedFiles

  const readBase = gitReader(root, ref)
  const readWork = workReader(root)
  const workDiagFiles = diagnosisFilesAt(fs.readdirSync(path.join(root, DIAGNOSES_DIR)).map((f) => `${DIAGNOSES_DIR}/${f}`))
  const baseDiagFiles = diagnosisFilesAt(baseList.out.split('\n').map((l) => l.trim()))

  // 診断ファイルと診断IDの対応
  const removed = baseDiagFiles.filter((f) => !workDiagFiles.includes(f))
  if (removed.length) return fallback(`診断ファイルが削除されています（${removed.join(', ')}）`)
  // 診断IDが1つのファイルは診断ファイル、0のファイルは補助ファイル（どの診断が使うかは依存解析で判定）
  const idOfFile = new Map<string, string>()
  for (const f of workDiagFiles) {
    const ids = diagnosisIdsIn(readWork(f) ?? '')
    if (ids.length > 1) return fallback(`${f} の診断IDを特定できません（${ids.length} 個）`)
    if (ids.length === 1) idOfFile.set(f, ids[0])
  }
  for (const f of baseDiagFiles) {
    const baseIds = diagnosisIdsIn(readBase(f) ?? '')
    if ((baseIds[0] ?? null) !== (idOfFile.get(f) ?? null) || baseIds.length > 1) return fallback(`${f} の診断IDが比較先と一致しません`)
  }
  const fileIds = [...idOfFile.values()]
  if (new Set(fileIds).size !== fileIds.length || fileIds.length !== diagnosisIds.length || diagnosisIds.some((i) => !fileIds.includes(i))) {
    return fallback('診断データに登録された診断と診断ファイルの対応が取れません')
  }

  try {
    // 共通の計算部分
    const sharedWork = dependencyClosure(SHARED_RESULT_FILES, readWork)
    const sharedBase = dependencyClosure(SHARED_RESULT_FILES, readBase)
    const sharedFiles = new Set([...sharedWork, ...sharedBase])
    if (closureHash(sharedWork, readWork) !== closureHash(sharedBase, readBase)) {
      return fallback(`共通の計算部分が変わっています（${changedFiles.filter((f) => sharedFiles.has(f)).join(', ') || '依存ファイル'}）`)
    }

    // 診断ごとの依存ファイル
    const newFiles = workDiagFiles.filter((f) => !baseDiagFiles.includes(f) && idOfFile.has(f))
    const explained = new Set<string>([...sharedFiles])
    for (const f of workDiagFiles.filter((x) => idOfFile.has(x))) {
      const id = idOfFile.get(f)!
      const work = dependencyClosure([f], readWork)
      work.forEach((x) => explained.add(x))
      if (newFiles.includes(f)) {
        scope.changedIds.add(id)
        scope.newIds.add(id)
        reasons.push(`新しい診断：${id}（${f}）`)
        continue
      }
      const baseDeps = dependencyClosure([f], readBase)
      baseDeps.forEach((x) => explained.add(x))
      if (closureHash(work, readWork) === closureHash(baseDeps, readBase)) scope.unchangedIds.add(id)
      else {
        scope.changedIds.add(id)
        reasons.push(`変更された診断：${id}（${[...new Set([...work, ...baseDeps])].filter((x) => changedFiles.includes(x)).join(', ')}）`)
      }
    }

    // 登録簿（index.ts）
    if (changedFiles.includes(REGISTRY)) {
      if (!registryOnlyAddsNew(readBase(REGISTRY), readWork(REGISTRY), newFiles)) {
        return fallback('診断の登録簿（index.ts）に、新しい診断の追加以外の変更があります')
      }
      reasons.push('登録簿（index.ts）：新しい診断の追加のみ')
      explained.add(REGISTRY)
    }

    // 残りの変更ファイルを分類
    for (const f of changedFiles) {
      const isUi = UI_PATTERNS.some((re) => re.test(f))
      if (isUi) scope.uiChanged = true
      if (explained.has(f)) continue
      if (FULL_CHECK_PATTERNS.some((re) => re.test(f))) return fallback(`検証の仕組み・ビルド設定の変更（${f}）`)
      if (/^src\/(data|engine|types)\//.test(f)) return fallback(`診断結果に関わる場所の、依存関係が不明なファイル（${f}）`)
      if (isUi) continue
      if (NO_EFFECT_PATTERNS.some((re) => re.test(f))) continue
      return fallback(`判定ルールにないファイルの変更（${f}）`)
    }
    if (scope.uiChanged) reasons.push(`画面・文章の変更：${changedFiles.filter((f) => UI_PATTERNS.some((re) => re.test(f))).join(', ')}`)
  } catch (e) {
    if (e instanceof UnknownDependency) return fallback(`依存関係が不明（${e.message}）`)
    throw e
  }
  if (!reasons.length) reasons.push('診断結果・画面に影響する変更なし')
  return scope
}

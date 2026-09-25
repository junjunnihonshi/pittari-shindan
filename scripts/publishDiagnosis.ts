/**
 * 診断公開ワークフロー
 *
 *   npm run publish:diagnosis -- <diagnosis-id> [--message "コミットメッセージ"] [--allow <path>]...
 *   npm run publish:diagnosis -- <diagnosis-id> --dry-run   … 公開前の確認だけ（enabled は元に戻し、commit しない）
 *   npm run publish:diagnosis -- <diagnosis-id> --verify    … 公開済みの診断を再確認（ファイル変更・commit なし）
 *   --base <commit> … 回帰確認の比較先（既定は HEAD。ワークフロー自体の動作確認用）
 *
 * 1つでも失敗したらその時点で停止し、commit・push はしない（enabled を書き換えていれば元に戻す）。
 * 公開工程で変更するのは、対象診断の `enabled: false` → `true` の1行だけ（採点・質問・商品は変更しない）。
 *
 * 軽量化（品質・安全性は同じ）：
 * - 検証範囲は変更内容から自動判定する（scripts/lib/changeScope.ts）。
 *   対象診断は常に全パターン検証。ほかの診断は、結果に影響する依存ファイルのハッシュが比較先と同じなら再計算しない。
 *   共通の計算部分・検証の仕組みの変更や、判定できない変更があれば全診断をフル検証する。
 * - dry-run が成功した作業ツリーのまま公開する場合は、重い検証を再利用する（scripts/lib/dryRunCache.ts）。
 * - 画面確認は対象診断とトップページが中心。共通UIが変わったときだけ、既存の診断も確認する。
 */
import { spawnSync, spawn, type ChildProcess } from 'node:child_process'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { site } from '../src/config/site.ts'
import { validateDiagnoses } from '../src/data/validate.ts'
import type { Diagnosis } from '../src/types/diagnosis.ts'
import { checkDiagnosisPages, checkTopPage, DEFAULT_WIDTHS, launchBrowser, representativePatterns, type UiIssue } from './lib/browserChecks.ts'
import { determineScope, type ChangeScope } from './lib/changeScope.ts'
import { checkPatterns, snapshot, type RunDiagnosis } from './lib/diagnosisChecks.ts'
import { clearDryRun, findDryRun, fingerprint, saveDryRun } from './lib/dryRunCache.ts'
import { loadFromGit, loadFromWorkingTree } from './lib/gitHead.ts'
import { fetchRakutenItem, itemUrlFromAffiliate, priceRangeOf, priceThresholdsFromLabels } from './lib/rakutenItem.ts'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIAGNOSES_DIR = 'src/data/diagnoses'
/** 対象診断のファイル以外で、公開の commit に含めてよいファイル（楽天の検索条件は診断作成時に一緒に追加するため） */
const DEFAULT_ALLOWED = ['scripts/rakuten/presets.ts']
const PREVIEW_PORT = 4179
const DEPLOY_TIMEOUT_MS = 10 * 60 * 1000
/** 画面確認の代表的な幅（スマホ・PC） */
const REPRESENTATIVE_WIDTHS = [390, 1280]
/** 対象以外の診断を画面確認するときの代表パターン数 */
const OTHER_DIAGNOSIS_PATTERNS = 2

// ---------- 引数 ----------
const args = process.argv.slice(2)
const id = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--message' && args[args.indexOf(a) - 1] !== '--allow' && args[args.indexOf(a) - 1] !== '--base')
const dryRun = args.includes('--dry-run')
const verifyOnly = args.includes('--verify')
const message = args.includes('--message') ? args[args.indexOf('--message') + 1] : undefined
const base = args.includes('--base') ? args[args.indexOf('--base') + 1] : 'HEAD'
const extraAllowed = args.flatMap((a, i) => (a === '--allow' && args[i + 1] ? [args[i + 1]] : []))

// ---------- 表示・停止 ----------
class StopError extends Error {}
const summary: string[] = []
let stepNo = 0
function step(title: string) {
  stepNo++
  console.log(`\n[${stepNo}] ${title}`)
}
function ok(text: string) {
  console.log(`   ✔ ${text}`)
  summary.push(text)
}
function stop(text: string): never {
  throw new StopError(text)
}

// ---------- コマンド実行 ----------
/** コマンドを実行し、標準出力をそのまま返す（失敗したら停止） */
function shRaw(cmd: string, cmdArgs: string[], opts: { input?: string; quiet?: boolean } = {}): string {
  // npm は「npm run …」から起動されたときの npm 本体（npm_execpath）を node で直接実行する（Windows でもシェルを使わない）
  const npmCli = process.env.npm_execpath
  const [exe, exeArgs] = cmd === 'npm' && npmCli ? [process.execPath, [npmCli, ...cmdArgs]] : [cmd, cmdArgs]
  const r = spawnSync(exe, exeArgs, { cwd: ROOT, input: opts.input, encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 })
  if (r.status !== 0) {
    if (!opts.quiet) console.error(r.stdout, r.stderr)
    stop(`${cmd} ${cmdArgs.join(' ')} が失敗しました`)
  }
  return r.stdout
}
const sh = (cmd: string, cmdArgs: string[], opts: { input?: string; quiet?: boolean } = {}) => shRaw(cmd, cmdArgs, opts).trim()
const git = (...a: string[]) => sh('git', a)

/** 作業ツリーの変更ファイル（git status --porcelain。行頭の状態欄の空白を保つため、出力を切り詰めずに読む） */
function changedFiles(): string[] {
  return shRaw('git', ['status', '--porcelain'])
    .split('\n')
    .filter((l) => l.length > 3)
    .map((l) => l.slice(3).trim().replace(/^"|"$/g, ''))
}

/** 変更ファイルごとの中身のハッシュ（実行中に別の変更が加わっていないかの確認用） */
function fileStates(): Map<string, string> {
  const states = new Map<string, string>()
  for (const f of changedFiles()) {
    const p = path.join(ROOT, f)
    states.set(f, fs.existsSync(p) && fs.statSync(p).isFile() ? createHash('sha256').update(fs.readFileSync(p)).digest('hex') : 'なし')
  }
  return states
}

// ---------- 診断データの読み込み ----------
/** 作業中の診断データを読み込む（毎回コピーから読み込むので、enabled を書き換えた後も最新になる） */
const tempDirs: (() => void)[] = []
async function loadWorking(): Promise<{ diagnoses: Diagnosis[]; run: RunDiagnosis }> {
  const loaded = await loadFromWorkingTree(ROOT)
  tempDirs.push(loaded.cleanup)
  return { diagnoses: loaded.diagnoses, run: loaded.runDiagnosis }
}

/** 診断IDから、その診断を定義しているファイル（src/data/diagnoses/*.ts）を探す */
function findDiagnosisFile(diagnosisId: string): string {
  const files = fs.readdirSync(path.join(ROOT, DIAGNOSES_DIR)).filter((f) => f.endsWith('.ts') && f !== 'index.ts' && f !== 'shared.ts')
  const hits = files.filter((f) => new RegExp(`^  id: '${diagnosisId}',$`, 'm').test(fs.readFileSync(path.join(ROOT, DIAGNOSES_DIR, f), 'utf8')))
  if (hits.length !== 1) stop(`診断「${diagnosisId}」を定義するファイルが見つかりません（候補 ${hits.length} 件）`)
  return `${DIAGNOSES_DIR}/${hits[0]}`
}

// ---------- 確認処理 ----------
function checkPatternsOrStop(d: Diagnosis, run: RunDiagnosis) {
  const r = checkPatterns(d, run)
  if (r.failures.length) {
    for (const f of r.failures.slice(0, 5)) console.error('   ✖', f.message, JSON.stringify(f.answers))
    stop(`${d.name}：全パターン検証で ${r.failures.length} 件の問題があります`)
  }
  ok(`${d.name}：全${r.count}通りで問題なし（1位60%未満 ${r.lowMatch}件・別枠 ${r.withSupplements}件${r.neverTop.length ? `・1位にならない商品 ${r.neverTop.join(', ')}` : ''}）`)
}

/**
 * 公開中の診断が公開版（比較先）と同じ結果になるか。
 * 結果に影響する依存ファイルのハッシュが比較先と同じ診断は、再計算せず「一致」とする（full のときは全診断を再計算）。
 */
async function checkRegression(target: Diagnosis, includeTarget: boolean, scope: ChangeScope) {
  const head = await loadFromGit(ROOT, base)
  try {
    const { diagnoses, run } = await loadWorking()
    const published = head.diagnoses.filter((d) => d.enabled && (includeTarget || d.id !== target.id))
    const byHash = published.filter((d) => !scope.full && scope.unchangedIds.has(d.id))
    const recomputed = published.filter((d) => !byHash.includes(d))
    const changed: string[] = []
    for (const old of recomputed) {
      const now = diagnoses.find((d) => d.id === old.id)
      if (!now || snapshot(now, run) !== snapshot(old, head.runDiagnosis)) changed.push(old.name)
    }
    if (changed.length) stop(`公開中の診断の結果が公開版（HEAD）と変わっています：${changed.join('、')}`)
    const names = (list: Diagnosis[]) => list.map((d) => d.name.replace('診断', '')).join('・')
    ok(
      `公開中の${published.length}診断が公開版と一致` +
        (recomputed.length ? `（全パターン再計算で完全一致：${names(recomputed)}）` : '') +
        (byHash.length ? `（依存ファイルのハッシュ一致で再計算を省略：${names(byHash)}）` : ''),
    )
  } finally {
    head.cleanup()
  }
}

async function checkProductLinks(d: Diagnosis) {
  const thresholds = priceThresholdsFromLabels(d.priceLabels)
  const problems: string[] = []
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
  for (const p of d.products.filter((x) => x.enabled)) {
    const label = `${p.id}（${p.name}）`
    const rakutenUrl = p.rakutenUrl ?? ''
    if (!rakutenUrl.startsWith('https://hb.afl.rakuten.co.jp/')) problems.push(`${label}：楽天URLがアフィリエイトURLではありません`)
    if (rakutenUrl.includes('rafcid')) problems.push(`${label}：楽天URLに rafcid が含まれています`)
    const image = p.imageUrl ? await fetch(p.imageUrl).catch(() => null) : null
    if (!image || image.status !== 200 || !(image.headers.get('content-type') ?? '').startsWith('image/')) problems.push(`${label}：商品画像を読み込めません`)
    const redirect = rakutenUrl ? await fetch(rakutenUrl, { redirect: 'manual' }).catch(() => null) : null
    if (!redirect || redirect.status < 300 || redirect.status >= 400) problems.push(`${label}：楽天アフィリエイトURLが転送されません（${redirect?.status ?? '接続失敗'}）`)
    const itemUrl = itemUrlFromAffiliate(rakutenUrl)
    if (!itemUrl) {
      problems.push(`${label}：楽天URLから商品ページを特定できません`)
      continue
    }
    const item = await fetchRakutenItem(itemUrl).catch(() => null)
    if (!item || item.status !== 200) problems.push(`${label}：楽天の商品ページを開けません（${item?.status ?? '接続失敗'}）`)
    else {
      if (item.soldOut) problems.push(`${label}：楽天で売り切れです`)
      const ranges = item.prices.map((price) => priceRangeOf(price, thresholds))
      if (!item.prices.length) problems.push(`${label}：楽天の価格を読み取れません`)
      else if (!ranges.includes(p.priceRange)) problems.push(`${label}：楽天の価格（${item.prices.join('/')}円）が価格帯 ${p.priceRange}（${d.priceLabels[p.priceRange]}）と合いません`)
    }
    await sleep(700)
  }
  if (problems.length) {
    for (const m of problems) console.error('   ✖', m)
    stop(`商品の最終チェックで ${problems.length} 件の問題があります`)
  }
  ok(`商品${d.products.filter((x) => x.enabled).length}件：画像・楽天URL（rafcidなし・転送OK）・価格帯・在庫に問題なし`)
}

function checkBuiltSeo(d: Diagnosis) {
  const pageUrl = `${site.url}/diagnosis/${d.slug}`
  const sitemap = fs.readFileSync(path.join(ROOT, 'dist/sitemap.xml'), 'utf8')
  if (!sitemap.includes(`<loc>${pageUrl}</loc>`)) stop(`sitemap.xml に ${pageUrl} がありません`)
  const html = fs.readFileSync(path.join(ROOT, 'dist/diagnosis', d.slug, 'index.html'), 'utf8')
  if (!/<meta name="robots" content="index, follow"/.test(html)) stop('診断ページの robots が index, follow ではありません')
  if (!html.includes(`<link rel="canonical" href="${pageUrl}"`)) stop('診断ページの canonical が正しくありません')
  ok(`ビルド結果：sitemap に掲載・index, follow・canonical ${pageUrl}`)
}

/**
 * 画面確認。対象診断はトップカード＋代表パターン、others（共通UIの変更時や変更された既存診断）は代表数パターンだけ確認する。
 */
async function checkScreens(baseUrl: string, d: Diagnosis, run: RunDiagnosis, widths: number[], where: string, others: Diagnosis[] = []) {
  const browser = await launchBrowser()
  try {
    const patterns = representativePatterns(d, run)
    const issues: UiIssue[] = [...(await checkTopPage(browser, baseUrl, d, widths))]
    const pages = await checkDiagnosisPages(browser, baseUrl, d, run, patterns, widths)
    issues.push(...pages.issues)
    let otherScreens = 0
    for (const o of others) {
      issues.push(...(await checkTopPage(browser, baseUrl, o, REPRESENTATIVE_WIDTHS)))
      const r = await checkDiagnosisPages(browser, baseUrl, o, run, representativePatterns(o, run, OTHER_DIAGNOSIS_PATTERNS), REPRESENTATIVE_WIDTHS)
      issues.push(...r.issues)
      otherScreens += r.checked
    }
    if (issues.length) {
      for (const i of issues.slice(0, 10)) console.error(`   ✖ ${i.where}：${i.message}`)
      stop(`${where}の画面確認で ${issues.length} 件の問題があります`)
    }
    ok(
      `${where}の画面：${d.name}（トップカード＋代表${patterns.length}パターン × ${widths.join('/')}px・${pages.checked}画面）` +
        (others.length ? `＋既存${others.length}診断（${others.map((o) => o.name.replace('診断', '')).join('・')}・${otherScreens}画面）` : '') +
        'で表示一致・画像・楽天ボタン・横スクロールなし・文字切れなし・JSエラーなし',
    )
  } finally {
    await browser.close()
  }
}

/** ビルド結果（dist）をローカルで配信する */
async function startPreview(): Promise<ChildProcess> {
  const vite = path.join(ROOT, 'node_modules/vite/bin/vite.js')
  const child = spawn(process.execPath, [vite, 'preview', '--port', String(PREVIEW_PORT), '--strictPort'], { cwd: ROOT, stdio: 'ignore' })
  for (let i = 0; i < 60; i++) {
    const res = await fetch(`http://localhost:${PREVIEW_PORT}/`).catch(() => null)
    if (res?.ok) return child
    await new Promise((r) => setTimeout(r, 500))
  }
  child.kill()
  stop('ローカル確認用のサーバーを起動できませんでした')
}

async function waitForDeploy(d: Diagnosis) {
  const pageUrl = `${site.url}/diagnosis/${d.slug}`
  const start = Date.now()
  while (Date.now() - start < DEPLOY_TIMEOUT_MS) {
    const sitemap = await fetch(`${site.url}/sitemap.xml?t=${Date.now()}`).then((r) => r.text()).catch(() => '')
    if (sitemap.includes(`<loc>${pageUrl}</loc>`)) {
      ok(`本番に反映（${Math.round((Date.now() - start) / 1000)}秒後）：sitemap に ${pageUrl}`)
      return
    }
    await new Promise((r) => setTimeout(r, 15000))
  }
  stop('本番の sitemap に反映されません（10分待機）。Cloudflare Pages のデプロイ状況を確認してください')
}

async function checkProductionPages(target: Diagnosis, published: Diagnosis[]) {
  const pageUrl = `${site.url}/diagnosis/${target.slug}`
  const html = await fetch(`${pageUrl}/?t=${Date.now()}`).then((r) => r.text())
  if (!/<meta name="robots" content="index, follow"/.test(html)) stop('本番の診断ページの robots が index, follow ではありません')
  if (!html.includes(`<link rel="canonical" href="${pageUrl}"`)) stop('本番の診断ページの canonical が正しくありません')
  // アクセス解析のビーコン（画面確認では通信を差し替えるため、設置は HTML で確認する）：index.html と同じ数だけ入っていること
  const beacon = /static\.cloudflareinsights\.com\/beacon\.min\.js/g
  const expected = (fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').match(beacon) ?? []).length
  const topHtml = await fetch(`${site.url}/?t=${Date.now()}`).then((r) => r.text())
  for (const [name, text] of [['トップページ', topHtml], ['診断ページ', html]] as const) {
    const count = (text.match(beacon) ?? []).length
    if (count !== expected) stop(`本番の${name}のアクセス解析ビーコンが ${count} 件です（index.html では ${expected} 件）`)
  }
  const statuses = await Promise.all(published.map(async (d) => [d.name, (await fetch(`${site.url}/diagnosis/${d.slug}/`).catch(() => null))?.status ?? 0] as const))
  const bad = statuses.filter(([, s]) => s !== 200)
  if (bad.length) stop(`本番で開けない診断ページがあります：${bad.map(([n, s]) => `${n}(${s})`).join('、')}`)
  ok(`本番：index, follow・canonical OK／アクセス解析ビーコン ${expected} 件（トップ・診断ページ）／公開中の${statuses.length}診断ページがすべて200（HTTP確認）`)
}

// ---------- 本体 ----------
async function main() {
  if (!id) stop('診断IDを指定してください（例：npm run publish:diagnosis -- humidifier）')
  const mode = verifyOnly ? '公開済みの再確認' : dryRun ? '公開前の確認のみ（dry-run）' : '公開'
  console.log(`診断公開ワークフロー：${id}（${mode}）`)

  step('対象の診断と作業状態を確認')
  const file = findDiagnosisFile(id)
  const allowed = new Set([file, ...DEFAULT_ALLOWED, ...extraAllowed])
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD')
  if (base !== 'HEAD' && !dryRun && !verifyOnly) stop('--base は --dry-run か --verify と一緒に使ってください')
  if (!verifyOnly) {
    if (branch !== 'main') stop(`main ブランチで実行してください（現在：${branch}）`)
    git('fetch', 'origin', 'main')
    if (Number(git('rev-list', '--count', 'HEAD..origin/main')) > 0) stop('origin/main より遅れています。pull してから実行してください')
    const outside = changedFiles().filter((f) => !allowed.has(f))
    if (outside.length) stop(`公開対象以外の変更があります：${outside.join(', ')}（含める場合は --allow <path>）`)
  }
  // 実行中に別の変更が加わっていないかを後で確かめるため、開始時点の状態を記録する
  const startStates = fileStates()
  const startFingerprint = fingerprint(ROOT)
  let { diagnoses, run } = await loadWorking()
  const target = diagnoses.find((d) => d.id === id)
  if (!target) stop(`診断「${id}」が見つかりません`)
  const head = await loadFromGit(ROOT, base)
  const publishedAtHead = head.diagnoses.find((d) => d.id === id)?.enabled === true
  head.cleanup()
  if (verifyOnly) {
    if (!target.enabled || !publishedAtHead) stop('--verify は公開済み（enabled: true で commit 済み）の診断にだけ使えます')
  } else {
    if (target.enabled) stop('対象の診断はすでに enabled: true です（公開済みなら --verify を使ってください）')
    if (publishedAtHead) stop('公開版（HEAD）ではすでに公開されています')
  }
  const enabledProducts = target.products.filter((p) => p.enabled)
  if (target.products.some((p) => p.sample)) stop('仮商品（sample: true）が残っています')
  if (enabledProducts.length < 3) stop(`表示できる商品が ${enabledProducts.length} 件しかありません（3件以上必要）`)
  if (enabledProducts.some((p) => !p.rakutenUrl || !p.imageUrl)) stop('楽天URLまたは画像URLが空の商品があります')
  const problems = validateDiagnoses([target])
  if (problems.length) stop(`データの入力チェックで問題があります：${problems.join(' / ')}`)
  ok(`${target.name}（${file}）：実商品${enabledProducts.length}件・${verifyOnly ? '公開済み' : 'enabled: false'}・入力チェックOK`)

  step('検証範囲の判定（変更ファイルと依存ファイルのハッシュ）')
  const scope = determineScope(ROOT, base, diagnoses.map((d) => d.id))
  for (const r of scope.reasons) console.log(`   ・${r}`)
  // 対象診断は常に全パターン検証する。ほかは結果が変わりうる診断だけ（full のときは公開中の全診断）
  const patternTargets = diagnoses.filter((d) => d.id === id || (scope.changedIds.has(d.id) && (!scope.full || d.enabled)))
  // 画面確認の追加分：共通UIが変わったら公開中の全診断、そうでなければ結果が変わりうる公開中の診断だけ
  const screenOthers = (list: Diagnosis[]) => list.filter((d) => d.id !== id && d.enabled && (scope.uiChanged || scope.changedIds.has(d.id)))
  const level = scope.full ? '全診断をフル検証' : patternTargets.length > 1 ? '変更された診断のみ全パターン検証' : '対象診断のみ全パターン検証'
  ok(
    `検証範囲：${level}（${patternTargets.map((d) => d.name.replace('診断', '')).join('・')}）` +
      (scope.uiChanged ? '・画面に影響する変更あり（既存診断の画面も確認）' : ''),
  )

  // dry-run の結果の再利用（公開時のみ。作業ツリー・HEAD・Node.js が dry-run 成功時と完全一致する場合だけ）
  let reused = false
  if (dryRun) clearDryRun(ROOT, id)
  if (!dryRun && !verifyOnly) {
    const found = findDryRun(ROOT, id, startFingerprint)
    if ('record' in found) {
      reused = true
      ok(`dry-run（${found.record.createdAt}）の検証結果を再利用：作業ツリー（tree ${startFingerprint.tree.slice(0, 12)}）・HEAD・Node.js が完全一致`)
    } else console.log(`   ・${found.reason}。すべて検証します`)
  }

  step('全パターン検証')
  if (reused) ok('全パターン検証：dry-run で確認済みのため省略')
  else for (const d of patternTargets) checkPatternsOrStop(d, run)

  step('既存の公開診断の回帰確認（公開版との一致）')
  if (reused) ok('公開版との一致：dry-run で確認済みのため省略')
  else await checkRegression(target, verifyOnly, scope)

  step('商品の最終チェック（画像・楽天URL・価格帯・在庫）')
  await checkProductLinks(target)

  const original = fs.readFileSync(path.join(ROOT, file), 'utf8')
  const restore = () => {
    if (!verifyOnly && fs.readFileSync(path.join(ROOT, file), 'utf8') !== original) {
      fs.writeFileSync(path.join(ROOT, file), original)
      console.log(`   ↩ ${file} を元の内容（enabled: false）に戻しました`)
    }
  }
  let committed = false
  try {
    if (!verifyOnly) {
      step('enabled: true に変更')
      const matches = original.match(/^ {2}enabled: false,$/gm) ?? []
      if (matches.length !== 1) stop(`診断レベルの「enabled: false,」が1か所ではありません（${matches.length} か所）`)
      fs.writeFileSync(path.join(ROOT, file), original.replace(/^ {2}enabled: false,$/m, '  enabled: true,'))
      ;({ diagnoses, run } = await loadWorking())
      const now = diagnoses.find((d) => d.id === id)
      if (!now?.enabled) stop('enabled: true に切り替わっていません')
      if (!reused && snapshot(now, run) !== snapshot(target, run)) stop('enabled の変更で診断結果が変わりました')
      ok(`enabled: true（変更はこの1行のみ・全パターンの結果は変更前と同じ${reused ? '（dry-run で確認済み）' : ''}）`)
    }

    // build / lint / check は公開処理の中でここの1回だけ（公開直前の状態で実行する）
    step('build / lint / check')
    sh('npm', ['run', 'build'], { quiet: false })
    sh('npm', ['run', 'lint'], { quiet: false })
    sh('npm', ['run', 'check'], { quiet: false })
    ok('npm run build / lint / check すべて成功')

    step('sitemap・robots・canonical（ビルド結果）')
    checkBuiltSeo(diagnoses.find((d) => d.id === id)!)

    if (!verifyOnly) {
      step('ローカルでの画面確認（ビルド結果）')
      const preview = await startPreview()
      try {
        await checkScreens(`http://localhost:${PREVIEW_PORT}`, diagnoses.find((d) => d.id === id)!, run, REPRESENTATIVE_WIDTHS, 'ローカル', screenOthers(diagnoses))
      } finally {
        preview.kill()
      }

      step('変更ファイルの確認（git diff）')
      const changed = changedFiles()
      const outside = changed.filter((f) => !allowed.has(f))
      if (outside.length) stop(`公開対象以外のファイルが変更されています：${outside.join(', ')}`)
      const current = fs.readFileSync(path.join(ROOT, file), 'utf8')
      if (current !== original.replace(/^ {2}enabled: false,$/m, '  enabled: true,')) stop('対象ファイルに enabled 以外の変更が加わっています')
      const nowStates = fileStates()
      const touched = [...new Set([...startStates.keys(), ...nowStates.keys()])].filter((f) => f !== file && startStates.get(f) !== nowStates.get(f))
      if (touched.length) stop(`実行中にファイルが変更されています：${touched.join(', ')}`)
      ok(`commit 対象：${changed.join(', ')}`)

      if (dryRun) {
        restore()
        // 検証した作業ツリーのまま戻っていることを確かめてから、公開時に再利用できるよう記録する
        const endFingerprint = fingerprint(ROOT)
        if (endFingerprint.tree !== startFingerprint.tree || endFingerprint.head !== startFingerprint.head) {
          stop('dry-run の実行中に作業ツリーが変わりました（検証結果は記録しません）')
        }
        saveDryRun(ROOT, id, startFingerprint, summary)
        ok(`dry-run のため commit・push はしていません（検証結果を記録：tree ${startFingerprint.tree.slice(0, 12)}。このまま公開すれば重い検証を再利用します）`)
        return
      }

      step('commit')
      git('add', '--', ...changed)
      // メッセージは標準入力で渡す（改行や Co-Authored-By 行を含められる）
      sh('git', ['commit', '-F', '-'], { input: message ?? `Publish ${id} diagnosis` })
      committed = true
      clearDryRun(ROOT, id)
      ok(`commit ${git('rev-parse', '--short', 'HEAD')}：${(message ?? `Publish ${id} diagnosis`).split('\n')[0]}`)
    }
  } catch (e) {
    if (!committed) restore()
    throw e
  }

  if (!verifyOnly) {
    step('push')
    git('push', 'origin', 'main')
    ok('origin/main に push')
  }

  step('本番の確認（Cloudflare Pages）')
  const published = diagnoses.filter((d) => d.enabled)
  const current = diagnoses.find((d) => d.id === id)!
  if (!verifyOnly) await waitForDeploy(current)
  await checkProductionPages(current, published)
  // 通常は対象診断とトップページを代表幅（スマホ・PC）で確認。画面に影響する変更があるときは全幅＋既存診断も確認する
  await checkScreens(site.url, current, run, scope.uiChanged ? DEFAULT_WIDTHS : REPRESENTATIVE_WIDTHS, '本番', screenOthers(published))

  console.log(`\n✅ ${current.name}：${verifyOnly ? '再確認' : '公開'}完了 ${site.url}/diagnosis/${current.slug}`)
  for (const s of summary) console.log(`  ・${s}`)
}

async function run() {
  try {
    await main()
    for (const c of tempDirs) c()
  } catch (e) {
    for (const c of tempDirs) c()
    console.error(`\n✖ 停止：${(e as Error).message}`)
    if (!(e instanceof StopError)) console.error(e)
    console.error('commit・push はしていません（commit 済みの場合は上の表示を確認してください）')
    process.exit(1)
  }
}
void run()

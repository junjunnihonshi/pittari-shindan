/**
 * 仕様JSONから公開までを1回で行う（既存の正式な手順を順に呼ぶだけ。確認を省略・緩和する処理はない）。
 *
 *   npm run diagnosis:ship -- <id> --dry-run              … 生成・検証・公開前の確認まで（commit・push しない）
 *   npm run diagnosis:ship -- <id> --message "…"          … 公開（commit・push・本番確認まで）
 *   npm run diagnosis:ship -- <id> --full …               … 全体検証モードで公開ワークフローを実行
 *   npm run diagnosis:ship -- <id> --allow <path> …       … 公開の commit に含めるファイルを追加（例：共通部品の追加）
 *
 * 1. data/diagnosis-specs/<id>.json があることを確認
 * 2. 診断がまだ登録されていなければ npm run diagnosis:generate（登録済みなら生成しない＝手直しを上書きしない）
 * 3. npm run diagnosis:validate と npm run diagnosis:preflight（ERROR なら停止）
 * 4. npm run publish:diagnosis（仕様JSON・診断ファイル・index.ts を公開対象として許可。ほかの変更があれば公開ワークフローが停止する）
 * どれかが失敗したらその時点で停止する（自動での再実行はしない）。
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIAGNOSES_DIR = 'src/data/diagnoses'
const args = process.argv.slice(2)
const valueOf = (flag: string) => (args.includes(flag) ? args[args.indexOf(flag) + 1] : undefined)
const id = args.find((a, i) => !a.startsWith('--') && !['--message', '--allow'].includes(args[i - 1] ?? ''))
const passThrough = [
  ...(args.includes('--dry-run') ? ['--dry-run'] : []),
  ...(args.includes('--full') ? ['--full'] : []),
  ...(args.includes('--recheck-products') ? ['--recheck-products'] : []),
  ...args.flatMap((a, i) => (a === '--allow' && args[i + 1] ? ['--allow', args[i + 1]] : [])),
]
const message = valueOf('--message')

function fail(text: string): never {
  console.error(`\n✖ 停止（diagnosis:ship ${id ?? ''}）：${text}`)
  process.exit(1)
}

function npm(script: string, scriptArgs: string[]) {
  console.log(`\n▶ npm run ${script} -- ${scriptArgs.join(' ')}`)
  const npmCli = process.env.npm_execpath
  const [exe, exeArgs] = npmCli ? [process.execPath, [npmCli, 'run', script, '--', ...scriptArgs]] : ['npm', ['run', script, '--', ...scriptArgs]]
  const r = spawnSync(exe, exeArgs, { cwd: ROOT, stdio: 'inherit', shell: !npmCli })
  if (r.status !== 0) fail(`npm run ${script} が失敗しました（自動での再実行はしません。上の内容を確認してください）`)
}

function diagnosisFile(diagnosisId: string): string | null {
  const dir = path.join(ROOT, DIAGNOSES_DIR)
  const hits = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts' && f !== 'shared.ts')
    .filter((f) => new RegExp(`^  id: '${diagnosisId}',$`, 'm').test(fs.readFileSync(path.join(dir, f), 'utf8')))
  if (hits.length > 1) fail(`診断「${diagnosisId}」を定義するファイルが複数あります：${hits.join(', ')}`)
  return hits.length ? `${DIAGNOSES_DIR}/${hits[0]}` : null
}

if (!id) fail('診断IDを指定してください（例：npm run diagnosis:ship -- humidifier --dry-run）')
if (!/^[a-z0-9-]+$/.test(id)) fail(`診断IDの形式が正しくありません：${id}`)
const spec = `data/diagnosis-specs/${id}.json`
if (!fs.existsSync(path.join(ROOT, spec))) fail(`仕様JSON（${spec}）がありません`)
if (!args.includes('--dry-run') && !message) fail('公開には --message "コミットメッセージ" を指定してください（確認だけなら --dry-run）')

let file = diagnosisFile(id)
if (file) console.log(`・${id} はすでに ${file} にあります（生成はせず、そのまま検証します）`)
else {
  npm('diagnosis:generate', [id])
  file = diagnosisFile(id)
  if (!file) fail('生成後に診断ファイルが見つかりません')
}
npm('diagnosis:validate', [id])
npm('diagnosis:preflight', [id])
npm('publish:diagnosis', [id, '--allow', spec, '--allow', file, '--allow', `${DIAGNOSES_DIR}/index.ts`, ...passThrough, ...(message ? ['--message', message] : [])])

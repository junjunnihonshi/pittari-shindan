/**
 * 仕様JSON（data/diagnosis-specs/<id>.json）から診断ファイル（src/data/diagnoses/<name>.ts）を生成する。
 *
 *   npm run diagnosis:generate -- <id>                 … 生成して src/data/diagnoses/index.ts に登録
 *   npm run diagnosis:generate -- <id> --out <dir>     … 別の場所に生成（登録しない。動作確認用）
 *   npm run diagnosis:generate -- <id> --spec <path>   … 仕様JSONの場所を指定
 *
 * - 生成物は手書きの診断と同じ Diagnosis 型のデータ（エンジン・型は変更しない）。生成後は手で直してもよい
 * - 初回生成は必ず enabled: false（公開は npm run publish:diagnosis で行う）
 * - 同名ファイル・同じIDの診断がすでにあれば、上書きせずに停止する
 * - 参照ミス（存在しない評価項目・選択肢・質問など）は、ファイルを書く前にエラーにする
 *
 * 仕様JSONの形（Diagnosis 型とほぼ同じ。書き方の例：docs/templates/diagnosis-spec.example.json）
 * - title → name、description → intro、cardDescription → shortDescription（Diagnosis 型の名前でも書ける）
 * - 予算の質問は { "budget": { "text", "weight", "bands", "noLimitLabel", "asLimit" } } で budgetQuestion() を使う
 * - true / false の項目で「公式情報で確認できない」を中立（0.5）で採点するときは
 *   effect を { "type": "feature", "attr": "..." } にし、商品の値を true / false / "unknown" にする
 * - 別枠（supplements）はエンジンが eligibility・maxPriceRange から自動で作る（supplementLabel は eligibility に書く）
 */
import fs from 'node:fs'
import path from 'node:path'
import type { Diagnosis } from '../src/types/diagnosis.ts'
import { validateDiagnoses } from '../src/data/validate.ts'
import { budgetQuestion } from '../src/data/diagnoses/shared.ts'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIAGNOSES_DIR = path.join(ROOT, 'src/data/diagnoses')
const REGISTRY = path.join(DIAGNOSES_DIR, 'index.ts')
const EFFECT_TYPES = ['near', 'atLeast', 'atMost', 'equals', 'feature']
const GROUPS = ['life', 'kitchen', 'beauty', 'digital', 'travel', 'pet']

/** 仕様JSON（読み込み時点では型が決まらないため、checkSpec で中身を確認してから使う） */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Json = Record<string, any>

class SpecError extends Error {}

/** 仕様JSONを読み、表記ゆれ（title など）を Diagnosis 型の名前にそろえる */
function normalize(spec: Json): Json {
  const d: Json = { ...spec }
  d.name ??= spec.title
  d.intro ??= spec.description
  d.shortDescription ??= spec.cardDescription
  d.slug ??= spec.id
  for (const k of ['title', 'description', 'cardDescription', 'file', 'exportName']) delete d[k]
  // 省略された項目だけ後ろに補う（書いてある項目の並びは変えない）
  d.products = (spec.products ?? []).map((p: Json) => {
    const q = { ...p }
    q.category ??= spec.id
    q.amazonUrl ??= ''
    q.enabled ??= true
    return q
  })
  return d
}

/** 生成前のチェック（1件でもあれば停止）。validate.ts の警告もエラーとして扱う */
function checkSpec(d: Json): string[] {
  const errors: string[] = []
  const err = (m: string) => errors.push(m)
  for (const k of ['id', 'name', 'itemName', 'group', 'icon', 'shortDescription', 'intro', 'priceLabels', 'questions', 'products', 'guide']) {
    if (d[k] === undefined || d[k] === '') err(`必須項目「${k}」がありません`)
  }
  if (d.seo?.title === undefined || d.seo?.description === undefined) err('seo.title / seo.description がありません')
  if (d.group !== undefined && !GROUPS.includes(d.group)) err(`group「${d.group}」は ${GROUPS.join(' / ')} のいずれかにしてください`)
  if (!/^[a-z0-9-]+$/.test(d.id ?? '')) err(`id「${d.id}」は半角英小文字・数字・ハイフンのみ使えます`)
  if (d.scoring?.adjust !== undefined) err('scoring.adjust（関数）は仕様JSONでは使えません（必要なら生成後に手で追加）')
  const labels = new Set(Object.keys(d.priceLabels ?? {}).map(Number))

  // 商品：ID の重複・価格帯・評価値の型
  const products: Json[] = d.products ?? []
  const productIds = new Set<string>()
  const attrTypes = new Map<string, Set<string>>()
  for (const p of products) {
    if (!p.id) err('id のない商品があります')
    if (productIds.has(p.id)) err(`商品IDが重複しています: ${p.id}`)
    productIds.add(p.id)
    for (const k of ['name', 'description', 'features', 'pros', 'cons', 'recommendFor', 'attributes']) if (p[k] === undefined) err(`商品 ${p.id} に「${k}」がありません`)
    if (!labels.has(p.priceRange)) err(`商品 ${p.id} の priceRange ${p.priceRange} が priceLabels にありません`)
    for (const [k, v] of Object.entries(p.attributes ?? {})) {
      if (!['number', 'boolean', 'string'].includes(typeof v)) err(`商品 ${p.id} の評価項目「${k}」の値が数値・true/false・文字列ではありません`)
      attrTypes.set(k, (attrTypes.get(k) ?? new Set()).add(v === 'unknown' ? 'unknown' : typeof v))
    }
  }
  const enabled = products.filter((p) => p.enabled !== false)
  const hasAttr = (attr: string) => enabled.every((p) => attr in (p.attributes ?? {}))
  const missing = (attr: string) => enabled.filter((p) => !(attr in (p.attributes ?? {}))).map((p) => p.id)

  // 質問・選択肢：ID の重複・effect の参照先・eligibility・maxPriceRange・showWhen
  const questions: Json[] = d.questions ?? []
  const qIds: string[] = []
  const optionIds = new Map<string, string[]>()
  for (const q of questions) {
    if (q.budget) {
      const b = q.budget
      if (!Array.isArray(b.bands) || b.bands.length === 0) err('budget.bands がありません')
      else b.bands.forEach((_: unknown, i: number) => { if (!labels.has(i + 1)) err(`budget の ${i + 1} 番目の区分に対応する priceLabels がありません`) })
      if (qIds.includes('budget')) err('質問IDが重複しています: budget')
      qIds.push('budget')
      optionIds.set('budget', [...(b.bands ?? []).map((_: unknown, i: number) => `b${i + 1}`), 'any'])
      continue
    }
    const where = `質問 ${q.id}`
    for (const k of ['id', 'text', 'shortLabel', 'weight', 'options']) if (q[k] === undefined) err(`${where} に「${k}」がありません`)
    if (qIds.includes(q.id)) err(`質問IDが重複しています: ${q.id}`)
    const ids: string[] = []
    for (const o of q.options ?? []) {
      const ow = `${where} の選択肢 ${o.id}`
      if (ids.includes(o.id)) err(`${where} の選択肢IDが重複しています: ${o.id}`)
      ids.push(o.id)
      if (!Array.isArray(o.effects)) err(`${ow} に effects（配列）がありません`)
      for (const e of o.effects ?? []) {
        if (!EFFECT_TYPES.includes(e.type)) err(`${ow} の effect type「${e.type}」は使えません（${EFFECT_TYPES.join(' / ')}。独自の関数は生成後に手で追加）`)
        if (typeof e.attr !== 'string') err(`${ow} の effect に attr（評価項目名）がありません`)
        else if (e.attr !== 'priceRange') {
          if (!attrTypes.has(e.attr)) err(`${ow} が存在しない評価項目「${e.attr}」を参照しています`)
          else if (!hasAttr(e.attr)) err(`${ow} の評価項目「${e.attr}」が次の商品にありません: ${missing(e.attr).join(', ')}`)
        }
        if (['near', 'atLeast', 'atMost'].includes(e.type) && typeof e.value !== 'number') err(`${ow} の ${e.type} の value は数値にしてください`)
        if (['near', 'atLeast', 'atMost'].includes(e.type) && e.attr !== 'priceRange' && [...(attrTypes.get(e.attr) ?? [])].some((t) => t !== 'number')) {
          err(`${ow} の ${e.type} が数値でない評価項目「${e.attr}」を参照しています（中立は "unknown" ではなく 3）`)
        }
        if (e.type === 'equals' && attrTypes.get(e.attr)?.has('unknown')) err(`${ow} の equals が "unknown" を含む評価項目「${e.attr}」を参照しています（feature を使ってください）`)
        if (e.type === 'feature' && [...(attrTypes.get(e.attr) ?? [])].some((t) => t !== 'boolean' && t !== 'unknown')) err(`${ow} の feature は true / false / "unknown" の評価項目にだけ使えます（${e.attr}）`)
      }
      for (const el of o.eligibility ? [o.eligibility].flat() : []) {
        if (!attrTypes.has(el.attr)) err(`${ow} の eligibility が存在しない評価項目「${el.attr}」を参照しています`)
        else if (!hasAttr(el.attr)) err(`${ow} の eligibility の評価項目「${el.attr}」が次の商品にありません: ${missing(el.attr).join(', ')}`)
        if (el.value === 'unknown') err(`${ow} の eligibility の value に "unknown" は使えません`)
      }
      if (o.maxPriceRange !== undefined && !labels.has(o.maxPriceRange)) err(`${ow} の maxPriceRange ${o.maxPriceRange} が priceLabels にありません`)
      if (o.showWhen) {
        if (!qIds.includes(o.showWhen.question)) err(`${ow} の showWhen が前にない質問「${o.showWhen.question}」を参照しています`)
        else for (const ref of o.showWhen.options ?? []) if (!optionIds.get(o.showWhen.question)!.includes(ref)) err(`${ow} の showWhen が存在しない選択肢「${o.showWhen.question}.${ref}」を参照しています`)
      }
    }
    qIds.push(q.id)
    optionIds.set(q.id, ids)
  }
  if (products.length === 0) err('商品がありません')
  return errors
}

// ---------- TypeScript の生成（既存の診断ファイルと同じ書き方） ----------

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/
const str = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`

/** 値を TypeScript のリテラルにする。短いものは1行、長いものは複数行 */
function lit(v: unknown, indent: string): string {
  if (v === null || v === undefined) return 'undefined'
  if (typeof v === 'string') return str(v)
  if (typeof v !== 'object') return String(v)
  const inner = indent + '  '
  const items = Array.isArray(v)
    ? v.map((x) => lit(x, inner))
    : Object.entries(v as Json).filter(([, x]) => x !== undefined).map(([k, x]) => `${IDENT.test(k) ? k : str(k)}: ${lit(x, inner)}`)
  const [open, close] = Array.isArray(v) ? ['[', ']'] : ['{', '}']
  if (items.length === 0) return open + close
  const one = Array.isArray(v) ? `[${items.join(', ')}]` : `{ ${items.join(', ')} }`
  if (one.length + indent.length <= 150 && !one.includes('\n')) return one
  return `${open}\n${items.map((x) => `${inner}${x},`).join('\n')}\n${indent}${close}`
}

/** effect の配列（feature は helper 呼び出しにする） */
function effectsLit(effects: Json[], indent: string): string {
  if (effects.length === 0) return '[]'
  const items = effects.map((e) => (e.type === 'feature' ? `feature(${str(e.attr)}${e.weight !== undefined ? `, ${e.weight}` : ''})` : lit(e, indent + '  ')))
  const one = `[${items.join(', ')}]`
  return one.length <= 110 ? one : `[\n${items.map((x) => `${indent}  ${x},`).join('\n')}\n${indent}]`
}

function questionLit(q: Json, indent: string): string {
  if (q.budget) return `budgetQuestion(${lit(q.budget, indent)})`
  const i1 = indent + '  '
  const i2 = i1 + '  '
  const head = Object.entries(q).filter(([k]) => k !== 'options').map(([k, v]) => `${i1}${k}: ${lit(v, i1)},`)
  const options = (q.options as Json[]).map((o) => {
    const fields = Object.entries(o).map(([k, v]) => (k === 'effects' ? `effects: ${effectsLit(v as Json[], i2)}` : `${k}: ${lit(v, i2)}`))
    const one = `{ ${fields.join(', ')} }`
    return one.length + i2.length <= 150 && !one.includes('\n') ? `${i2}${one},` : `${i2}{\n${fields.map((f) => `${i2}  ${f},`).join('\n')}\n${i2}},`
  })
  return `{\n${head.join('\n')}\n${i1}options: [\n${options.join('\n')}\n${i1}],\n${indent}}`
}

function render(d: Json, exportName: string, outDir: string, specRel: string): string {
  const rel = (to: string) => {
    const r = path.relative(outDir, path.join(ROOT, to)).split(path.sep).join('/')
    return r.startsWith('.') ? r : `./${r}`
  }
  const usesFeature = d.questions.some((q: Json) => (q.options ?? []).some((o: Json) => o.effects.some((e: Json) => e.type === 'feature')))
  const usesBudget = d.questions.some((q: Json) => q.budget)
  const typeNames = ['Diagnosis', ...(usesFeature ? ['Effect'] : []), 'Product']
  const lines = [
    `import type { ${typeNames.join(', ')} } from '${rel('src/types/diagnosis.ts')}'`,
    ...(usesBudget ? [`import { budgetQuestion } from '${rel('src/data/diagnoses/shared.ts')}'`] : []),
    '',
    '/**',
    ` * ${d.name}`,
    ' *',
    ` * このファイルは ${specRel} から npm run diagnosis:generate で生成しました。`,
    ' * 仕様JSONを直して作り直す場合は、このファイルを削除してから生成し直してください（手で直してもかまいません）。',
    ' */',
    '',
  ]
  if (usesFeature) {
    lines.push(
      "/** true / false の項目の採点（'unknown' は中立 0.5。公式情報で確認できない機能を「なし」として減点しない） */",
      'function feature(attr: string, weight?: number): Effect {',
      "  return { type: 'custom', score: (p) => (p.attributes[attr] === true ? 1 : p.attributes[attr] === false ? 0 : 0.5), ...(weight !== undefined ? { weight } : {}) }",
      '}',
      '',
    )
  }
  lines.push(`const products: Product[] = ${lit(d.products, '')}`, '')
  const { questions, products: _p, enabled: _e, ...rest } = d
  void _p
  void _e
  const order = ['id', 'slug', 'name', 'itemName', 'group', 'icon', 'shortDescription', 'intro', 'searchKeywords', 'seo', 'priceLabels']
  const head = order.filter((k) => rest[k] !== undefined).map((k) => `  ${k}: ${lit(rest[k], '  ')},`)
  const tail = Object.keys(rest).filter((k) => !order.includes(k)).map((k) => `  ${k}: ${lit(rest[k], '  ')},`)
  lines.push(
    `export const ${exportName}: Diagnosis = {`,
    ...head,
    `  questions: [\n${(questions as Json[]).map((q) => `    ${questionLit(q, '    ')},`).join('\n')}\n  ],`,
    '  products,',
    ...tail,
    '  enabled: false,',
    '}',
    '',
  )
  return lines.join('\n')
}

/** 仕様から Diagnosis を組み立てる（生成前の validate.ts チェック用。feature は同じ採点の関数にする） */
function toDiagnosis(d: Json): Diagnosis {
  const feature = (attr: string, weight?: number) => ({ type: 'custom' as const, score: (p: Json) => (p.attributes[attr] === true ? 1 : p.attributes[attr] === false ? 0 : 0.5), ...(weight !== undefined ? { weight } : {}) })
  const questions = d.questions.map((q: Json) =>
    q.budget ? budgetQuestion(q.budget) : { ...q, options: q.options.map((o: Json) => ({ ...o, effects: o.effects.map((e: Json) => (e.type === 'feature' ? feature(e.attr, e.weight) : e)) })) },
  )
  return { ...d, questions, enabled: false } as Diagnosis
}

function camel(id: string): string {
  return id.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase())
}

function main() {
  const args = process.argv.slice(2)
  const opt = (name: string) => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined)
  const id = args.find((a, i) => !a.startsWith('--') && !['--out', '--spec'].includes(args[i - 1]))
  if (!id) throw new SpecError('使い方: npm run diagnosis:generate -- <id> [--out <dir>] [--spec <path>]')
  const specPath = path.resolve(ROOT, opt('--spec') ?? `data/diagnosis-specs/${id}.json`)
  if (!fs.existsSync(specPath)) throw new SpecError(`仕様JSONがありません: ${path.relative(ROOT, specPath)}`)
  const raw = JSON.parse(fs.readFileSync(specPath, 'utf8')) as Json
  if (raw.id !== id) throw new SpecError(`仕様JSONの id「${raw.id}」がコマンドの id「${id}」と違います`)

  const d = normalize(raw)
  const errors = checkSpec(d)
  if (errors.length === 0) errors.push(...validateDiagnoses([toDiagnosis(d)]))
  if (errors.length) throw new SpecError(`仕様JSONに ${errors.length} 件の問題があります（ファイルは作成していません）\n${errors.map((e) => `  ✖ ${e}`).join('\n')}`)

  const exportName = raw.exportName ?? camel(id)
  if (!IDENT.test(exportName)) throw new SpecError(`exportName「${exportName}」は変数名として使えません`)
  const outDir = opt('--out') ? path.resolve(ROOT, opt('--out')!) : DIAGNOSES_DIR
  const file = path.join(outDir, raw.file ?? `${exportName}.ts`)
  if (fs.existsSync(file)) throw new SpecError(`${path.relative(ROOT, file)} はすでにあります（上書きしません）`)
  const register = outDir === DIAGNOSES_DIR
  let registry = ''
  if (register) {
    registry = fs.readFileSync(REGISTRY, 'utf8')
    const existing = fs.readdirSync(DIAGNOSES_DIR).filter((f) => f.endsWith('.ts') && f !== 'index.ts' && f !== 'shared.ts')
    const dup = existing.find((f) => new RegExp(`^\\s*id: '${id}',\\s*$`, 'm').test(fs.readFileSync(path.join(DIAGNOSES_DIR, f), 'utf8')))
    if (dup) throw new SpecError(`診断「${id}」は ${dup} にすでにあります（上書きしません）`)
    if (new RegExp(`\\b${exportName}\\b`).test(registry)) throw new SpecError(`index.ts に「${exportName}」がすでにあります`)
  }

  fs.mkdirSync(outDir, { recursive: true })
  const specRel = path.relative(ROOT, specPath).split(path.sep).join('/')
  fs.writeFileSync(file, render(d, exportName, outDir, specRel))
  const fileRel = path.relative(ROOT, file).split(path.sep).join('/')
  console.log(`✔ ${fileRel} を生成しました（enabled: false）`)

  if (register) {
    // 登録簿に import と配列の1行を追加（既存の行は変更しない）
    const importLine = `import { ${exportName} } from './${path.basename(file)}'`
    const lines = registry.split('\n')
    const lastImport = lines.map((l) => l.startsWith('import ')).lastIndexOf(true)
    lines.splice(lastImport + 1, 0, importLine)
    const start = lines.findIndex((l) => l.startsWith('const allDiagnoses'))
    const end = lines.findIndex((l, i) => i > start && l.trim() === ']')
    lines.splice(end, 0, `  ${exportName},`)
    fs.writeFileSync(REGISTRY, lines.join('\n'))
    console.log('✔ src/data/diagnoses/index.ts に登録しました')
    console.log(`\n次の手順:\n  npm run diagnosis:validate -- ${id}`)
    console.log(`  npm run publish:diagnosis -- ${id} --dry-run --allow src/data/diagnoses/index.ts --allow ${specRel}`)
  }
}

try {
  main()
} catch (e) {
  if (!(e instanceof SpecError)) throw e
  console.error(`✖ ${e.message}`)
  process.exit(1)
}

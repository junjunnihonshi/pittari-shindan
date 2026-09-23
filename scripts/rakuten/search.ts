/**
 * 楽天市場商品検索API から商品候補を取得し、候補JSONとして保存するローカル専用ツール。
 *
 *   npm run rakuten:search -- pillow
 *   npm run rakuten:search -- pillow --keyword "枕 横向き" --hits 20
 *
 * - 認証情報は .env.local から読み込みます（ソースコードには書きません）
 * - 認証情報の値は画面・ログに出力しません
 * - src/data/diagnoses/*.ts は変更しません。結果は data/rakuten-candidates/ に保存され、
 *   人が確認してから診断データへ手動で採用します
 */
import fs from 'node:fs'
import path from 'node:path'
import { site } from '../../src/config/site.ts'
import { presets, type PricedKeyword, type RakutenPreset } from './presets.ts'

/** 楽天市場商品検索API（version: 2026-07-01） */
const ENDPOINT = 'https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701'
/** 連続リクエストの間隔（ミリ秒）。短すぎると 429 になります */
const REQUEST_INTERVAL_MS = 1500
const RETRY_WAIT_MS = 5000
const TIMEOUT_MS = 15000
const ROOT = path.resolve(import.meta.dirname, '../..')
const OUT_DIR = path.join(ROOT, 'data', 'rakuten-candidates')

class UserError extends Error {}

// ---------- 秘密情報の伏せ字 ----------
/** 画面表示から伏せる値（Application ID / Access Key / Affiliate ID） */
const displaySecrets: string[] = []
/** 保存ファイルからも伏せる値（Application ID / Access Key）。アフィリエイトURLには仕組み上 Affiliate ID が含まれるため対象外 */
const fileSecrets: string[] = []

function mask(text: string, values: string[]): string {
  let out = text
  for (const v of values) if (v) out = out.split(v).join('***')
  return out
}
const log = (msg: string) => console.log(mask(msg, displaySecrets))

// ---------- 引数 ----------
interface Options {
  category: string
  keywords?: string[]
  hits?: number
}

function parseArgs(argv: string[]): Options {
  const [category, ...rest] = argv
  if (!category || category.startsWith('-')) {
    throw new UserError(
      `カテゴリを指定してください。\n  例: npm run rakuten:search -- pillow\n  対応カテゴリ: ${Object.keys(presets).join(', ')}`,
    )
  }
  const opts: Options = { category }
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i]
    if (arg === '--keyword') {
      const v = rest[++i]
      if (!v) throw new UserError('--keyword の後に検索語を指定してください')
      opts.keywords = [v]
    } else if (arg === '--hits') {
      const n = Number(rest[++i])
      if (!Number.isInteger(n) || n < 1 || n > 30) throw new UserError('--hits は 1〜30 の整数で指定してください')
      opts.hits = n
    } else {
      throw new UserError(`不明なオプションです: ${arg}（使えるのは --keyword, --hits）`)
    }
  }
  return opts
}

// ---------- 認証情報 ----------
interface Credentials {
  applicationId: string
  accessKey: string
  affiliateId: string
  origin: string
}

function loadCredentials(): Credentials {
  const envPath = path.join(ROOT, '.env.local')
  if (!fs.existsSync(envPath)) {
    throw new UserError(
      '.env.local が見つかりません。\n  .env.example をコピーして .env.local を作成し、楽天ウェブサービスの値を入力してください。',
    )
  }
  process.loadEnvFile(envPath)
  const names = ['RAKUTEN_APPLICATION_ID', 'RAKUTEN_ACCESS_KEY', 'RAKUTEN_AFFILIATE_ID'] as const
  const missing = names.filter((n) => !process.env[n]?.trim())
  if (missing.length > 0) {
    throw new UserError(`.env.local に次の値が設定されていません: ${missing.join(', ')}`)
  }
  const creds: Credentials = {
    applicationId: process.env.RAKUTEN_APPLICATION_ID!.trim(),
    accessKey: process.env.RAKUTEN_ACCESS_KEY!.trim(),
    affiliateId: process.env.RAKUTEN_AFFILIATE_ID!.trim(),
    origin: (process.env.RAKUTEN_ORIGIN?.trim() || site.url).replace(/\/+$/, ''),
  }
  fileSecrets.push(creds.applicationId, creds.accessKey)
  displaySecrets.push(creds.applicationId, creds.accessKey, creds.affiliateId)
  return creds
}

// ---------- API ----------
interface RakutenItem {
  itemCode: string
  itemName: string
  itemPrice: number
  itemUrl: string
  affiliateUrl?: string
  itemCaption?: string
  catchcopy?: string
  shopName?: string
  shopCode?: string
  reviewAverage?: number
  reviewCount?: number
  availability?: number
  genreId?: string | number
  mediumImageUrls?: (string | { imageUrl: string })[]
}

interface SearchResponse {
  Items?: (RakutenItem | { Item: RakutenItem })[]
  error?: string
  error_description?: string
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function describeError(status: number, body: SearchResponse | null): string {
  const detail = body?.error ? `（${body.error}${body.error_description ? `: ${body.error_description}` : ''}）` : ''
  const authLike = /applicationId|accessKey|access_key|application_id|unauthorized|forbidden|referrer|origin/i.test(
    `${body?.error ?? ''} ${body?.error_description ?? ''}`,
  )
  if (status === 401 || status === 403 || (status === 400 && authLike)) {
    return (
      `認証エラーです（HTTP ${status}）${detail}\n` +
      '  ・.env.local の RAKUTEN_APPLICATION_ID / RAKUTEN_ACCESS_KEY が正しいか確認してください\n' +
      '  ・楽天ウェブサービスのアプリ設定の「許可されたWebサイト」と、送信している Origin が一致しているか確認してください\n' +
      '    （Origin は .env.local の RAKUTEN_ORIGIN、未設定なら src/config/site.ts の url）'
    )
  }
  if (status === 400) return `リクエストの指定に誤りがあります（HTTP 400）${detail}\n  scripts/rakuten/presets.ts のキーワードや価格条件を確認してください。`
  if (status === 429) return `リクエスト回数の上限に達しました（HTTP 429 Too Many Requests）${detail}\n  しばらく時間をおいてから再実行してください。`
  if (status === 500) return `楽天API側でエラーが発生しました（HTTP 500）${detail}\n  時間をおいて再実行してください。`
  if (status === 503) return `楽天APIがメンテナンス中または混雑しています（HTTP 503）${detail}\n  時間をおいて再実行してください。`
  return `楽天APIがエラーを返しました（HTTP ${status}）${detail}`
}

async function searchOnce(creds: Credentials, preset: RakutenPreset, query: PricedKeyword, hits: number): Promise<RakutenItem[]> {
  const { keyword } = query
  const params = new URLSearchParams({
    applicationId: creds.applicationId,
    affiliateId: creds.affiliateId,
    format: 'json',
    formatVersion: '2',
    keyword,
    hits: String(hits),
    sort: preset.sort,
    availability: '1',
    imageFlag: '1',
  })
  if (preset.ngKeyword) params.set('NGKeyword', preset.ngKeyword)
  // キーワードごとの価格条件があれば、プリセット全体の条件より優先する
  const minPrice = query.minPrice ?? preset.minPrice
  const maxPrice = query.maxPrice ?? preset.maxPrice
  if (minPrice) params.set('minPrice', String(minPrice))
  if (maxPrice) params.set('maxPrice', String(maxPrice))

  for (let attempt = 1; ; attempt++) {
    let res: Response
    try {
      res = await fetch(`${ENDPOINT}?${params}`, {
        headers: {
          // accessKey は URL ではなくヘッダーで送る
          accessKey: creds.accessKey,
          Origin: creds.origin,
          Referer: `${creds.origin}/`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      })
    } catch (e) {
      const reason = e instanceof Error && e.name === 'TimeoutError' ? 'タイムアウトしました' : 'ネットワークに接続できませんでした'
      throw new UserError(`楽天APIへの接続に失敗しました: ${reason}\n  インターネット接続を確認してください。`)
    }

    const body = (await res.json().catch(() => null)) as SearchResponse | null

    // 該当商品なしは 404 (not_found) で返る
    if (res.status === 404 || body?.error === 'not_found') return []
    // 429 は1回だけ待って再試行
    if (res.status === 429 && attempt === 1) {
      log(`  ⏳ HTTP 429（リクエスト過多）のため ${RETRY_WAIT_MS / 1000} 秒待って再試行します…`)
      await sleep(RETRY_WAIT_MS)
      continue
    }
    if (!res.ok || body?.error) throw new UserError(describeError(res.status, body))

    return (body?.Items ?? []).map((x) => ('Item' in x ? x.Item : x))
  }
}

// ---------- 候補データへの変換 ----------
function imageUrlsOf(item: RakutenItem): string[] {
  return (item.mediumImageUrls ?? [])
    .map((u) => (typeof u === 'string' ? u : u.imageUrl))
    .filter(Boolean)
    .map((u) => u.replace(/\?_ex=\d+x\d+$/, '?_ex=300x300'))
}

function priceRangeOf(price: number, thresholds: number[]): number {
  const idx = thresholds.findIndex((t) => price <= t)
  return Math.min(5, (idx === -1 ? thresholds.length : idx) + 1)
}

/**
 * 楽天APIが返すURLの rafcid（アプリID入りの計測用パラメータ）を取り除く。
 * アフィリエイトの成果判定には使われず（リダイレクト先は同じ）、公開サイトにアプリIDを出さないため。
 */
function stripRafcid(url: string | undefined): string {
  if (!url) return ''
  try {
    const u = new URL(url)
    u.searchParams.delete('rafcid')
    return u.toString()
  } catch {
    return url
  }
}

function toCandidate(item: RakutenItem, preset: RakutenPreset, queries: string[]) {
  const images = imageUrlsOf(item)
  const affiliateUrl = stripRafcid(item.affiliateUrl)
  return {
    source: 'rakuten',
    itemCode: item.itemCode,
    itemName: item.itemName,
    itemPrice: item.itemPrice,
    itemUrl: stripRafcid(item.itemUrl),
    affiliateUrl,
    imageUrl: images[0] ?? '',
    imageUrls: images,
    catchcopy: item.catchcopy ?? '',
    itemCaption: item.itemCaption ?? '',
    shopName: item.shopName ?? '',
    shopCode: item.shopCode ?? '',
    reviewAverage: item.reviewAverage ?? null,
    reviewCount: item.reviewCount ?? null,
    availability: item.availability ?? null,
    genreId: item.genreId != null ? String(item.genreId) : '',
    matchedQueries: queries,
    /** 人が確認して記入する欄 */
    review: { status: 'pending', adopt: false, notes: '' },
    /**
     * 診断商品に採用する場合の下書き（src/types/diagnosis.ts の Product 形式）。
     * id・説明・特徴・attributes などは、人が商品ページを確認して記入してください。
     */
    productDraft: {
      id: `${preset.category}-XXX`,
      name: item.itemName,
      category: preset.category,
      description: '',
      priceRange: priceRangeOf(item.itemPrice, preset.priceThresholds),
      features: [],
      pros: [],
      cons: [],
      recommendFor: '',
      amazonUrl: '',
      rakutenUrl: affiliateUrl,
      imageUrl: images[0] ?? '',
      enabled: false,
      sample: false,
      // プリセットに attributeKeys があれば、記入欄として null で用意する
      attributes: Object.fromEntries((preset.attributeKeys ?? []).map((key) => [key, null])),
    },
  }
}

// ---------- メイン ----------
async function main() {
  const opts = parseArgs(process.argv.slice(2))
  const preset = presets[opts.category]
  if (!preset) {
    throw new UserError(`カテゴリ "${opts.category}" は未対応です。対応カテゴリ: ${Object.keys(presets).join(', ')}`)
  }
  const creds = loadCredentials()
  const queries: PricedKeyword[] = (opts.keywords ?? preset.keywords).map((k) => (typeof k === 'string' ? { keyword: k } : k))
  const hits = opts.hits ?? preset.hits
  // 候補JSONに記録する検索条件（価格条件付きの検索は「キーワード（〜10000円）」の形で表す）
  const labelOf = (q: PricedKeyword) =>
    q.minPrice || q.maxPrice ? `${q.keyword}（${q.minPrice ?? ''}〜${q.maxPrice ?? ''}円）` : q.keyword
  const keywords = queries.map(labelOf)

  log(`楽天市場から「${preset.category}」の商品候補を検索します（${keywords.length} キーワード × 最大 ${hits} 件）`)

  const byCode = new Map<string, { item: RakutenItem; queries: string[] }>()
  for (const [i, query] of queries.entries()) {
    if (i > 0) await sleep(REQUEST_INTERVAL_MS)
    const keyword = labelOf(query)
    const items = await searchOnce(creds, preset, query, hits)
    log(`  🔍 「${keyword}」: ${items.length} 件`)
    for (const item of items) {
      const hit = byCode.get(item.itemCode)
      if (hit) hit.queries.push(keyword)
      else byCode.set(item.itemCode, { item, queries: [keyword] })
    }
  }

  if (byCode.size === 0) {
    throw new UserError(
      '商品が 0 件でした。\n  scripts/rakuten/presets.ts のキーワード・除外ワード（ngKeyword）・価格条件を見直してください。',
    )
  }

  let entries = [...byCode.values()]
  // 1ショップあたりの上限（特定メーカーの公式店などに候補が偏らないように）
  let droppedByShopLimit = 0
  if (preset.maxPerShop) {
    const perShop = new Map<string, number>()
    const sorted = [...entries].sort((a, b) => (b.item.reviewCount ?? 0) - (a.item.reviewCount ?? 0))
    const kept = new Set<string>()
    for (const e of sorted) {
      const shop = e.item.shopCode || e.item.shopName || '(不明)'
      const n = perShop.get(shop) ?? 0
      if (n < preset.maxPerShop) {
        perShop.set(shop, n + 1)
        kept.add(e.item.itemCode)
      }
    }
    droppedByShopLimit = entries.length - kept.size
    entries = entries.filter((e) => kept.has(e.item.itemCode))
  }

  const candidates = entries.map(({ item, queries }) => toCandidate(item, preset, queries))
  const missingAffiliate = candidates.filter((c) => !c.affiliateUrl).length

  const fetchedAt = new Date()
  const stamp = fetchedAt.toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '-')
  const dir = path.join(OUT_DIR, preset.category)
  fs.mkdirSync(dir, { recursive: true })
  const output = {
    meta: {
      category: preset.category,
      fetchedAt: fetchedAt.toISOString(),
      api: ENDPOINT,
      keywords,
      hitsPerKeyword: hits,
      sort: preset.sort,
      count: candidates.length,
      ...(preset.maxPerShop ? { maxPerShop: preset.maxPerShop, droppedByShopLimit } : {}),
      note:
        'これは楽天市場APIから取得した「候補」です。価格・在庫は取得時点のものです。' +
        '採用する商品は review.adopt を true にし、productDraft を確認・補完してから src/data/diagnoses に手動で追加してください。',
    },
    candidates,
  }
  const json = mask(JSON.stringify(output, null, 2), fileSecrets) + '\n'
  const file = path.join(dir, `${stamp}.json`)
  const latest = path.join(dir, 'latest.json')
  fs.writeFileSync(file, json)
  fs.writeFileSync(latest, json)

  log(`\n✅ ${candidates.length} 件の候補を保存しました（重複除外後）`)
  if (droppedByShopLimit > 0) {
    log(`   ※ 1ショップ ${preset.maxPerShop} 件までの上限により ${droppedByShopLimit} 件を除外しました（特定メーカーへの偏り防止）`)
  }
  log(`   ${path.relative(ROOT, file)}`)
  log(`   ${path.relative(ROOT, latest)}（最新の結果のコピー）`)
  if (missingAffiliate > 0) {
    log(`⚠ ${missingAffiliate} 件でアフィリエイトURLが取得できませんでした。RAKUTEN_AFFILIATE_ID を確認してください。`)
  }
  log(`\n次のステップ: JSON を開いて商品を確認し、採用するものを src/data/diagnoses/${preset.category} の診断ファイルへ手動で追加してください。`)
}

main().catch((e: unknown) => {
  const message = e instanceof UserError ? e.message : `予期しないエラーが発生しました: ${e instanceof Error ? e.message : String(e)}`
  console.error(mask(`\n❌ ${message}`, displaySecrets))
  process.exit(1)
})

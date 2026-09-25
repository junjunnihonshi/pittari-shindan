/// <reference lib="dom" />
/**
 * ブラウザ（Edge / Chrome をヘッドレスで起動）で画面を確認する。
 * - トップページ：診断カードがリンクになっていて「準備中」でないこと
 * - 診断ページ：代表パターンを実際に回答し、表示された順位・相性%・理由・別枠がエンジンの計算と一致すること
 * - 共通：横スクロール・文字切れ・カードのはみ出し・画像の読み込み・楽天ボタン・JSエラー
 */
import fs from 'node:fs'
import puppeteer, { type Browser, type Page } from 'puppeteer-core'
import type { Answers, Diagnosis } from '../../src/types/diagnosis.ts'
import { combinations, type RunDiagnosis } from './diagnosisChecks.ts'

export const DEFAULT_WIDTHS = [320, 390, 768, 1280]

/** ブラウザの実行ファイル（環境変数 PUBLISH_BROWSER_PATH で指定、なければよくある場所を探す） */
export function findBrowser(): string {
  const candidates = [
    process.env.PUBLISH_BROWSER_PATH,
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].filter((p): p is string => Boolean(p))
  const found = candidates.find((p) => fs.existsSync(p))
  if (!found) throw new Error('ブラウザが見つかりません。環境変数 PUBLISH_BROWSER_PATH に Edge か Chrome の実行ファイルを指定してください')
  return found
}

export function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({ executablePath: findBrowser(), headless: true })
}

/**
 * 画面確認に使う代表パターン（最大 max 件）。
 * 各質問の選択肢をずらしながら選んだパターンに加え、
 * 「1位が60%未満」「別枠が出る」「適格条件の説明が出る」パターンがあれば1件ずつ含める。
 */
export function representativePatterns(d: Diagnosis, run: RunDiagnosis, max = 7): Answers[] {
  const picked = new Map<string, Answers>()
  const add = (a: Answers | undefined) => {
    if (a && picked.size < max) picked.set(JSON.stringify(a), a)
  }
  let low: Answers | undefined
  let supp: Answers | undefined
  let notice: Answers | undefined
  for (const a of combinations(d)) {
    const r = run(d, a)
    const top = r.ranked[0] ?? r.supplements[0]
    if (!low && top && top.matchPercent < 60) low = a
    if (!supp && r.supplements.length > 0) supp = a
    if (!notice && r.notices.length > 0) notice = a
    if (low && supp && notice) break
  }
  add(low)
  add(supp)
  add(notice)
  const longest = Math.max(...d.questions.map((q) => q.options.length))
  for (let k = 0; k < longest * 2 && picked.size < max; k++) {
    add(Object.fromEntries(d.questions.map((q, qi) => [q.id, q.options[(k + qi) % q.options.length].id])))
  }
  return [...picked.values()]
}

export interface UiIssue {
  where: string
  message: string
}

/** アクセス解析（Cloudflare Web Analytics）の読み込み先。自動確認のアクセスを解析に記録しないよう、空の応答に差し替える */
const ANALYTICS_HOSTS = ['static.cloudflareinsights.com', 'cloudflareinsights.com']

/**
 * ページ内のエラー（JS例外・コンソールのエラー）を集める。
 * あわせてアクセス解析への通信を空の応答に差し替える（localhost では解析の送信が CORS で失敗してエラーになるため・
 * 自動確認のアクセスを本番の解析に含めないため）。ビーコンの設置自体は本番の HTML で確認する。
 */
async function collectErrors(page: Page): Promise<string[]> {
  const errors: string[] = []
  await page.setRequestInterception(true)
  page.on('request', (req) => {
    if (req.isInterceptResolutionHandled()) return
    if (ANALYTICS_HOSTS.includes(new URL(req.url()).hostname)) {
      // type="module" のスクリプトは CORS で読み込まれるため、許可ヘッダーを付ける
      void req.respond({ status: 200, contentType: 'application/javascript', headers: { 'Access-Control-Allow-Origin': '*' }, body: '' })
    } else void req.continue()
  })
  page.on('pageerror', (e) => errors.push(String(e)))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  return errors
}

/** 横スクロールの有無 */
const hasHorizontalScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)

/** トップページ：診断カードがリンクになっていて「準備中」ではないこと */
export async function checkTopPage(browser: Browser, baseUrl: string, d: Diagnosis, widths = DEFAULT_WIDTHS): Promise<UiIssue[]> {
  const issues: UiIssue[] = []
  for (const width of widths) {
    const page = await browser.newPage()
    const errors = await collectErrors(page)
    await page.setViewport({ width, height: 900, isMobile: width < 700, hasTouch: width < 700 })
    await page.goto(`${baseUrl}/?t=${Date.now()}`, { waitUntil: 'networkidle2' })
    const where = `トップ ${width}px`
    const card = await page.evaluate((slug) => {
      const a = [...document.querySelectorAll('a')].find((x) => x.getAttribute('href') === `/diagnosis/${slug}`)
      return a ? a.textContent?.replace(/\s+/g, ' ').trim() ?? '' : null
    }, d.slug)
    if (card === null) issues.push({ where, message: '診断カードがリンクになっていません（準備中のまま）' })
    else if (card.includes('準備中')) issues.push({ where, message: '診断カードに「準備中」が表示されています' })
    if (await hasHorizontalScroll(page)) issues.push({ where, message: '横スクロールが出ています' })
    if (errors.length) issues.push({ where, message: `JSエラー: ${errors.slice(0, 2).join(' / ')}` })
    await page.close()
  }
  return issues
}

/** 表示された1枚のカードの情報 */
interface CardView {
  name: string
  pct: number
  reason: string
  img: boolean
  buttons: string[]
  overflowX: boolean
}

/** 診断ページ：代表パターンを回答し、表示が計算結果と一致するかを確認する */
export async function checkDiagnosisPages(
  browser: Browser,
  baseUrl: string,
  d: Diagnosis,
  run: RunDiagnosis,
  patterns: Answers[],
  widths = DEFAULT_WIDTHS,
): Promise<{ issues: UiIssue[]; checked: number }> {
  const issues: UiIssue[] = []
  let checked = 0
  for (const width of widths) {
    for (const [pi, answers] of patterns.entries()) {
      const where = `診断 ${width}px パターン${pi + 1}`
      const page = await browser.newPage()
      const errors = await collectErrors(page)
      try {
        await page.setViewport({ width, height: 900, isMobile: width < 700, hasTouch: width < 700 })
        await page.evaluateOnNewDocument(() => {
          try {
            localStorage.clear()
          } catch {
            // 保存領域が使えない環境では何もしない
          }
        })
        await page.goto(`${baseUrl}/diagnosis/${d.slug}?t=${Date.now()}`, { waitUntil: 'networkidle2' })
        await page.click('.intro .button--primary')
        for (const q of d.questions) {
          const label = q.options.find((o) => o.id === answers[q.id])?.label ?? ''
          await page.waitForSelector('.option-button')
          const clicked = await page.evaluate((l) => {
            const b = [...document.querySelectorAll<HTMLElement>('.option-button')].find(
              (x) => x.querySelector('.option-button__label')?.textContent?.trim() === l,
            )
            b?.click()
            return Boolean(b)
          }, label)
          if (!clicked) throw new Error(`選択肢「${label}」が見つかりません`)
          await new Promise((r) => setTimeout(r, 150))
        }
        await page.waitForSelector('.done .button--primary')
        await page.click('.done .button--primary')
        await page.waitForSelector('.result-title')
        // 画像の遅延読み込みを進めるため、下までスクロールする
        for (let i = 0; i < 14; i++) {
          await page.evaluate(() => window.scrollBy(0, 600))
          await new Promise((r) => setTimeout(r, 180))
        }
        await new Promise((r) => setTimeout(r, 1000))
        const view = await page.evaluate(() => {
          const card = (c: Element) => {
            const rect = c.getBoundingClientRect()
            const image = c.querySelector('img')
            return {
              name: c.querySelector('h3')?.textContent?.trim() ?? '',
              pct: Number((c.querySelector('.match__value')?.firstChild?.textContent ?? '').trim()),
              reason:
                [...c.querySelectorAll('.result-card__section')]
                  .find((s) => s.querySelector('h4')?.textContent?.includes('おすすめ理由'))
                  ?.querySelector('p')
                  ?.textContent?.trim() ?? '',
              img: image ? image.complete && image.naturalWidth > 0 : false,
              buttons: [...c.querySelectorAll<HTMLAnchorElement>('a.shop-button')].map((a) => a.href),
              overflowX: rect.right > window.innerWidth + 1 || rect.left < -1,
            }
          }
          const texts = [...document.querySelectorAll('.result-card h3, .result-card p, .result-card li, .shop-button, .match__value')]
          return {
            ranked: [...document.querySelectorAll('.result-list:not(.supplements .result-list) > .result-card')].map(card),
            supplements: [...document.querySelectorAll('.supplements .result-card')].map(card),
            notices: [...document.querySelectorAll('.result-notice')].map((n) => n.textContent?.trim() ?? ''),
            clipped: texts.filter((e) => e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible').length,
          }
        })
        const expected = run(d, answers)
        const same = (shown: CardView[], exp: typeof expected.ranked) =>
          shown.length === exp.length &&
          shown.every((c, i) => c.name === exp[i].product.name && c.pct === exp[i].matchPercent && c.reason === exp[i].reason)
        if (!same(view.ranked, expected.ranked)) issues.push({ where, message: '通常ランキングの表示が計算結果と一致しません' })
        if (!same(view.supplements, expected.supplements)) issues.push({ where, message: '別枠の表示が計算結果と一致しません' })
        for (const n of expected.notices) if (!view.notices.includes(n)) issues.push({ where, message: `注意書きが表示されていません: ${n.slice(0, 30)}…` })
        const cards = [...view.ranked, ...view.supplements]
        if (cards.some((c) => !c.img)) issues.push({ where, message: '読み込めない商品画像があります' })
        if (cards.some((c) => c.buttons.length === 0 || c.buttons.some((h) => !h.startsWith('https://hb.afl.rakuten.co.jp/')))) {
          issues.push({ where, message: '楽天ボタンがない、またはアフィリエイトURLでないカードがあります' })
        }
        if (cards.some((c) => c.overflowX)) issues.push({ where, message: '画面からはみ出したカードがあります' })
        if (view.clipped > 0) issues.push({ where, message: `文字切れ ${view.clipped} 件` })
        if (await hasHorizontalScroll(page)) issues.push({ where, message: '横スクロールが出ています' })
        if (errors.length) issues.push({ where, message: `JSエラー: ${errors.slice(0, 2).join(' / ')}` })
        checked++
      } catch (e) {
        issues.push({ where, message: `画面操作に失敗しました: ${(e as Error).message}` })
      } finally {
        await page.close()
      }
    }
  }
  return { issues, checked }
}

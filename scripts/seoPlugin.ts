/**
 * ビルド時に以下を自動生成する Vite プラグイン。
 *   - ページごとの HTML（title / meta description / canonical / OGP 入り）
 *       dist/index.html, dist/diagnosis/pillow/index.html, dist/privacy/index.html …
 *   - dist/404.html（Cloudflare Pages が存在しないURLで返す404ページ）
 *   - dist/sitemap.xml
 *   - dist/robots.txt
 *   - トップページと公開中の診断ページの本文（プリレンダリング）
 *       src/entry-prerender.tsx でアプリの最初の表示内容を HTML にし、<div id="root"> の中に入れる。
 *       ブラウザでは main.tsx の createRoot が同じ内容で描き直す（hydration はしない）。
 * 検索エンジンやSNSが JavaScript を実行しなくても、正しいタイトルや説明文・本文を読み取れるようにするためのものです。
 */
import fs from 'node:fs'
import path from 'node:path'
import { createServer, type Plugin, type ResolvedConfig } from 'vite'
import { absoluteUrl, buildHeadTags, canonicalUrl, diagnosisPath, getAllPages, notFoundMeta, type PageMeta } from '../src/config/seo.ts'
import { diagnoses, enabledDiagnoses } from '../src/data/diagnoses/index.ts'
import { validateDiagnoses } from '../src/data/validate.ts'

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function renderHead(meta: PageMeta): string {
  return buildHeadTags(meta)
    .map(({ tag, attrs }) => {
      const a = Object.entries(attrs)
        .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
        .join(' ')
      return `<${tag} ${a} data-seo>`
    })
    .join('\n    ')
}

function renderPage(template: string, meta: PageMeta, body = ''): string {
  return template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
    .replace('<!--app-head-->', renderHead(meta))
    .replace('<div id="root"></div>', () => `<div id="root">${body}</div>`)
}

/** 本文をプリレンダリングするページ：トップページと公開中（enabled: true）の診断ページ */
function prerenderPaths(): string[] {
  return ['/', ...enabledDiagnoses.map((d) => diagnosisPath(d.slug))]
}

/** アプリの最初の表示内容を HTML にする（Vite の SSR 読み込みで TSX をそのまま実行する。ビルド時だけ使い、SSRサーバーは不要） */
async function prerender(root: string, paths: string[]): Promise<Map<string, string>> {
  const server = await createServer({
    root,
    configFile: path.join(root, 'vite.config.ts'),
    server: { middlewareMode: true, hmr: false },
    appType: 'custom',
    logLevel: 'error',
  })
  try {
    const { render } = (await server.ssrLoadModule('/src/entry-prerender.tsx')) as { render: (path: string) => string }
    return new Map(paths.map((p) => [p, render(p)]))
  } finally {
    await server.close()
  }
}

export function seoPlugin(): Plugin {
  let config: ResolvedConfig
  return {
    name: 'pittari-seo',
    apply: 'build',
    configResolved(c) {
      config = c
    },
    buildStart() {
      const problems = validateDiagnoses(diagnoses)
      for (const p of problems) this.warn(`[診断データ] ${p}`)
    },
    async closeBundle() {
      const outDir = path.resolve(config.root, config.build.outDir)
      const templatePath = path.join(outDir, 'index.html')
      if (!fs.existsSync(templatePath)) return
      const template = fs.readFileSync(templatePath, 'utf-8')
      const pages = getAllPages()
      const bodies = await prerender(config.root, prerenderPaths())

      for (const page of pages) {
        const file = page.path === '/' ? templatePath : path.join(outDir, page.path.slice(1), 'index.html')
        fs.mkdirSync(path.dirname(file), { recursive: true })
        fs.writeFileSync(file, renderPage(template, page, bodies.get(page.path)))
      }
      fs.writeFileSync(path.join(outDir, '404.html'), renderPage(template, notFoundMeta))

      const today = new Date().toISOString().slice(0, 10)
      const urls = pages
        .filter((p) => !p.noindex)
        .map(
          (p) =>
            `  <url>\n    <loc>${escapeHtml(canonicalUrl(p.path))}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${(p.priority ?? 0.5).toFixed(1)}</priority>\n  </url>`,
        )
        .join('\n')
      fs.writeFileSync(
        path.join(outDir, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      )
      fs.writeFileSync(path.join(outDir, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`)

      config.logger.info(`\n[seo] ${pages.length} ページのHTML（うち本文のプリレンダリング ${bodies.size} ページ）、404.html、sitemap.xml、robots.txt を生成しました`)
    },
  }
}

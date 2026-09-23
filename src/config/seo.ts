/**
 * ページごとのSEO情報（title / description / canonical / OGP）。
 * - 診断ページのSEO情報は各診断ファイル（src/data/diagnoses/*.ts）の seo に書きます。
 * - このファイルはトップページや固定ページの情報と、共通の組み立てルールを持ちます。
 * ビルド時にもこのファイルを使って、ページごとのHTML・sitemap.xml・robots.txt を生成します。
 */
import { enabledDiagnoses } from '../data/diagnoses/index.ts'
import type { Diagnosis } from '../types/diagnosis.ts'
import { site } from './site.ts'

export interface PageMeta {
  path: string
  /** <title>（サイト名は自動では付けません。そのまま使われます） */
  title: string
  description: string
  ogType?: 'website' | 'article'
  ogImage?: string
  /** true なら検索結果に表示させない（noindex） */
  noindex?: boolean
  /** sitemap.xml の優先度 */
  priority?: number
}

/** 固定ページの SEO 情報 */
export const staticPages: PageMeta[] = [
  {
    path: '/',
    title: `${site.name}｜${site.tagline}`,
    description: site.description,
    priority: 1.0,
  },
  { path: '/about', title: `運営者情報｜${site.name}`, description: `${site.name}の運営者情報です。`, priority: 0.3 },
  { path: '/privacy', title: `プライバシーポリシー｜${site.name}`, description: `${site.name}のプライバシーポリシーです。`, priority: 0.3 },
  { path: '/disclaimer', title: `免責事項｜${site.name}`, description: `${site.name}の免責事項です。`, priority: 0.3 },
  { path: '/contact', title: `お問い合わせ｜${site.name}`, description: `${site.name}へのお問い合わせ方法のご案内です。`, priority: 0.3 },
  { path: '/ads', title: `広告掲載について｜${site.name}`, description: `${site.name}における広告（アフィリエイトプログラム）の利用についてのご案内です。`, priority: 0.3 },
]

export const notFoundMeta: PageMeta = {
  path: '/404',
  title: `ページが見つかりません｜${site.name}`,
  description: 'お探しのページは見つかりませんでした。',
  noindex: true,
}

export function diagnosisPath(slug: string): string {
  return `/diagnosis/${slug}`
}

/** 準備中（enabled: false）の診断ページ。検索エンジンには載せない */
export function comingSoonMeta(d: Diagnosis): PageMeta {
  return {
    path: diagnosisPath(d.slug),
    title: `${d.name}（準備中）｜${site.name}`,
    description: `${d.name}は現在準備中です。`,
    noindex: true,
  }
}

/** サイト内の全ページ（404・準備中の診断を除く）。sitemap.xml とページ別HTMLの生成に使用 */
export function getAllPages(): PageMeta[] {
  return [
    ...staticPages,
    ...enabledDiagnoses.map<PageMeta>((d) => ({
      path: diagnosisPath(d.slug),
      title: d.seo.title,
      description: d.seo.description,
      ogImage: d.seo.ogImage,
      ogType: 'article',
      priority: 0.8,
    })),
  ]
}

export function findPageMeta(path: string): PageMeta | undefined {
  return getAllPages().find((p) => p.path === path)
}

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl
  const base = site.url.replace(/\/+$/, '')
  return `${base}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

/** <head> に入れるタグの一覧（ビルド時HTML生成・ブラウザでの更新の両方で使用） */
export function buildHeadTags(meta: PageMeta): { tag: 'meta' | 'link'; attrs: Record<string, string> }[] {
  const url = absoluteUrl(meta.path)
  const image = meta.ogImage || site.ogImage
  const tags: { tag: 'meta' | 'link'; attrs: Record<string, string> }[] = [
    { tag: 'meta', attrs: { name: 'description', content: meta.description } },
    { tag: 'meta', attrs: { name: 'robots', content: meta.noindex ? 'noindex, follow' : 'index, follow' } },
    { tag: 'meta', attrs: { property: 'og:title', content: meta.title } },
    { tag: 'meta', attrs: { property: 'og:description', content: meta.description } },
    { tag: 'meta', attrs: { property: 'og:type', content: meta.ogType ?? 'website' } },
    { tag: 'meta', attrs: { property: 'og:url', content: url } },
    { tag: 'meta', attrs: { property: 'og:site_name', content: site.name } },
    { tag: 'meta', attrs: { property: 'og:locale', content: 'ja_JP' } },
    { tag: 'meta', attrs: { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' } },
  ]
  if (!meta.noindex) tags.push({ tag: 'link', attrs: { rel: 'canonical', href: url } })
  if (image) tags.push({ tag: 'meta', attrs: { property: 'og:image', content: absoluteUrl(image) } })
  if (site.twitter) tags.push({ tag: 'meta', attrs: { name: 'twitter:site', content: `@${site.twitter}` } })
  return tags
}

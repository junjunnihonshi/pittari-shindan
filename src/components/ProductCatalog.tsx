import { catalogDisplayModel, catalogInitialCount, productCatalogSpecs, seriesListSpecUrlProductIds, type CatalogSpec } from '../config/productCatalog.ts'
import { normalizeUrl } from '../config/shops.ts'
import { getAvailableProducts } from '../engine/diagnosisEngine.ts'
import type { Diagnosis, Product } from '../types/diagnosis.ts'

const collator = new Intl.Collator('ja', { numeric: true, sensitivity: 'base' })
const attr = (p: Product, key: string) => (typeof p.attributes[key] === 'string' ? String(p.attributes[key]) : '')
/** 一覧に表示する型番・品番（表示専用の上書きがあればそれ、なければ商品データの exactSku） */
const displayModel = (p: Product) => catalogDisplayModel[p.id] ?? (attr(p, 'exactSku') !== 'unknown' ? attr(p, 'exactSku') : '')

/**
 * 一覧の並び順（メーカー別ラウンドロビン）。相性・スコア・アフィリエイト情報は使わない。
 * メーカー名順に並べたメーカーから1商品ずつ順に取り出し、全商品を並べ終えるまで繰り返す。
 * 同じメーカーの中は型番・品番順（同じなら商品ID順）。先頭が特定メーカーに固まらないようにするため
 */
function catalogOrder(products: Product[]): Product[] {
  const groups = new Map<string, Product[]>()
  for (const p of products) groups.set(attr(p, 'brand'), [...(groups.get(attr(p, 'brand')) ?? []), p])
  const brands = [...groups.keys()].sort((a, b) => collator.compare(a, b) || (a < b ? -1 : a > b ? 1 : 0))
  const queues = brands.map((b) => groups.get(b)!.sort((x, y) => collator.compare(displayModel(x), displayModel(y)) || (x.id < y.id ? -1 : x.id > y.id ? 1 : 0)))
  const out: Product[] = []
  for (let i = 0; out.length < products.length; i++) for (const q of queues) if (q[i]) out.push(q[i])
  return out
}

/**
 * 診断ページの「この診断で比較している商品」（診断の補足情報）。
 * - 診断で表示しうる商品（getAvailableProducts：enabled かつ同じ診断の商品）を表示する。相性・スコアは使わない
 * - 並び順はメーカー名順（同じメーカーは型番・品番順）の固定規則。最初の数件が推薦の上位に見えないよう、規則を本文にも書く
 * - 最初の catalogInitialCount 件だけ表示し、残りは <details> で開閉する（HTMLには全件を出力。JavaScript なしでも開閉できる）
 * - 仕様の値は商品データから読むだけで、表示する項目だけを src/config/productCatalog.ts で診断ごとに決める
 * - 価格帯は確認日をデータで管理していないため表示しない（診断結果の価格表示は変えない）
 */
export function ProductCatalog({ diagnosis }: { diagnosis: Diagnosis }) {
  const specs = productCatalogSpecs[diagnosis.id]
  if (!specs) return null
  const products = catalogOrder(getAvailableProducts(diagnosis))
  if (products.length === 0) return null
  const first = products.slice(0, catalogInitialCount)
  const rest = products.slice(catalogInitialCount)
  return (
    <section className="guide catalog" aria-labelledby="catalog-title">
      <h2 id="catalog-title">この診断で比較している商品</h2>
      <p className="guide__intro">
        診断では、次の{products.length}商品の中から、回答に合う候補を相性の高い順に表示します。
        この一覧は相性やおすすめの順位ではなく、掲載している商品と主な仕様の一覧です。並び順は、メーカー名順に並べた各メーカーから1商品ずつ順番に取り出したもので（同じメーカーの中は型番・品番順）、評価の高さとは関係ありません。仕様はメーカーが公表している情報をもとにしています。
      </p>
      <ul className="catalog__list">
        {first.map((p) => (
          <CatalogItem key={p.id} product={p} specs={specs} />
        ))}
      </ul>
      {rest.length > 0 && (
        <details className="catalog__more">
          <summary className="catalog__more-summary">残り{rest.length}商品を表示</summary>
          <ul className="catalog__list">
            {rest.map((p) => (
              <CatalogItem key={p.id} product={p} specs={specs} />
            ))}
          </ul>
        </details>
      )}
      <p className="catalog__note">価格や在庫は変動するため、購入前に販売サイトでご確認ください。仕様の最新情報はメーカーの公式サイトでご確認ください。</p>
    </section>
  )
}

function CatalogItem({ product: p, specs }: { product: Product; specs: CatalogSpec[] }) {
  // 商品名にメーカー名が含まれていない場合だけ、メーカー名を添える（「ケルヒャーケルヒャー…」のような重複を避ける）
  const brand = attr(p, 'brand') && !p.name.includes(attr(p, 'brand')) ? attr(p, 'brand') : ''
  const model = displayModel(p)
  const specUrl = normalizeUrl(attr(p, 'officialSpecUrl'))
  return (
    <li className="catalog__item">
      <h3 className="catalog__name">
        {brand && <span className="catalog__brand">{brand}</span>}
        {p.name}
      </h3>
      {model && <p className="catalog__model">型番・品番：{model}</p>}
      <dl className="catalog__specs">
        {specs.map((s) => (
          <div key={s.label}>
            <dt>{s.label}</dt>
            <dd>{s.value(p.attributes)}</dd>
          </div>
        ))}
      </dl>
      {specUrl && (
        <p className="catalog__source">
          <a href={specUrl} target="_blank" rel="noopener noreferrer">
            {seriesListSpecUrlProductIds.has(p.id) ? 'メーカー公式の製品情報（シリーズ一覧）' : 'メーカー公式の製品情報'}
            <span className="visually-hidden">（{p.name}・新しいタブで開きます）</span>
          </a>
        </p>
      )}
    </li>
  )
}

/**
 * 固定ページ（運営者情報・プライバシーポリシー・免責事項・お問い合わせ・広告掲載について）。
 * 文章を変更したい場合は、このファイルの該当箇所を書き換えてください。
 * 運営者名・メールアドレス等は src/config/site.ts で設定します。
 */
import type { ReactNode } from 'react'
import { findPageMeta } from '../config/seo.ts'
import { site } from '../config/site.ts'
import { normalizeUrl } from '../config/shops.ts'
import { Link } from '../components/Link.tsx'
import { useSeo } from '../lib/seo.ts'

/** 最終更新日（内容を変更したら書き換えてください） */
const UPDATED_AT = '2026年9月23日'

function StaticLayout({ path, title, children }: { path: string; title: string; children: ReactNode }) {
  useSeo(findPageMeta(path) ?? { path, title: `${title}｜${site.name}`, description: title })
  return (
    <div className="container page">
      <nav className="breadcrumb" aria-label="パンくずリスト">
        <ol>
          <li>
            <Link to="/">ホーム</Link>
          </li>
          <li aria-current="page">{title}</li>
        </ol>
      </nav>
      <article className="prose">
        <h1>{title}</h1>
        {children}
        <p className="prose__updated">最終更新日：{UPDATED_AT}</p>
      </article>
    </div>
  )
}

function ContactInfo() {
  const formUrl = normalizeUrl(site.operator.contactFormUrl)
  return (
    <>
      {formUrl ? (
        <p>
          <a className="button button--primary" href={formUrl} target="_blank" rel="noopener noreferrer">
            お問い合わせフォームを開く
            <span className="visually-hidden">（新しいタブで開きます）</span>
          </a>
        </p>
      ) : (
        <p>お問い合わせフォームは準備中です。</p>
      )}
      {site.operator.email && (
        <p>
          メールアドレス：<span className="nowrap">{site.operator.email}</span>
        </p>
      )}
    </>
  )
}

export function AboutPage() {
  return (
    <StaticLayout path="/about" title="運営者情報">
      <dl className="info-table">
        <div>
          <dt>サイト名</dt>
          <dd>{site.name}</dd>
        </div>
        <div>
          <dt>URL</dt>
          <dd>{site.url}</dd>
        </div>
        <div>
          <dt>運営者</dt>
          <dd>{site.operator.name}</dd>
        </div>
        <div>
          <dt>お問い合わせ</dt>
          <dd>
            <Link to="/contact">お問い合わせページ</Link>をご覧ください。
          </dd>
        </div>
      </dl>
      <h2>サイトについて</h2>
      <p>
        {site.name}
        は、いくつかの質問に答えるだけで、使い方や好み・予算に合いそうな日用品・家電・生活用品を探せる診断サイトです。
        診断結果は、回答内容と商品の特徴をもとにしたルールで機械的に計算しており、人気や売上のランキングではありません。
      </p>
    </StaticLayout>
  )
}

export function PrivacyPage() {
  return (
    <StaticLayout path="/privacy" title="プライバシーポリシー">
      <p>{site.name}（以下「当サイト」）は、利用者の個人情報の取り扱いについて、以下のとおり定めます。</p>

      <h2>診断の回答について</h2>
      <p>
        診断の回答内容と結果の計算は、利用者のブラウザ内で行われ、当サイトのサーバーへ送信されることはありません。
        「最近使った診断」や「前回の診断結果」を表示するため、回答内容を利用者の端末内（ブラウザのローカルストレージ）に保存する場合があります。
        これらには氏名やメールアドレスなどの個人情報は含まれません。ブラウザの設定から削除することができます。
      </p>

      <h2>アクセス解析ツールについて</h2>
      <p>
        当サイトでは、サービス向上のためにアクセス解析ツール（Google アナリティクス等）を利用する場合があります。
        これらのツールはCookie等を使用してトラフィックデータを収集することがありますが、個人を特定する情報は含まれません。
        Cookieの利用はブラウザの設定で無効にすることができます。
      </p>

      <h2>アフィリエイトプログラムについて</h2>
      <p>
        当サイトは、もしもアフィリエイト等のアフィリエイトプログラムに参加しています。
        リンク先の販売サイトでは、各事業者がCookie等を使用して情報を収集する場合があります。詳しくは各販売サイトのプライバシーポリシーをご確認ください。
      </p>

      <h2>お問い合わせで取得する情報</h2>
      <p>
        お問い合わせの際にご提供いただいたメールアドレス等の情報は、お問い合わせへの回答のためにのみ利用し、法令に基づく場合を除き第三者に提供することはありません。
      </p>

      <h2>本ポリシーの変更</h2>
      <p>当サイトは、必要に応じて本ポリシーを変更することがあります。変更後の内容は本ページに掲載した時点で効力を生じます。</p>
    </StaticLayout>
  )
}

export function DisclaimerPage() {
  return (
    <StaticLayout path="/disclaimer" title="免責事項">
      <h2>診断結果について</h2>
      <p>
        当サイトの診断結果は、回答内容と商品の特徴をもとに一定のルールで計算した目安であり、商品の品質・効果・利用者との適合を保証するものではありません。
        最終的な購入の判断は、販売サイトの商品情報をご確認のうえ、ご自身の責任で行ってください。
      </p>

      <h2>健康・医療に関する内容について</h2>
      <p>
        当サイトの情報は、睡眠・肌・髪・体の不調などの改善や治療を目的とするものではありません。
        体の痛みや症状がある場合は、医師などの専門家にご相談ください。ペットの健康については獣医師にご相談ください。
      </p>

      <h2>掲載情報について</h2>
      <p>
        商品の価格・在庫・仕様などの情報は、変更されている場合があります。最新の情報は各販売サイトでご確認ください。
        当サイトの情報の正確性には注意を払っておりますが、その内容を保証するものではありません。
      </p>

      <h2>損害等の責任について</h2>
      <p>
        当サイトの利用、または当サイトからリンクしている外部サイトの利用により生じたいかなる損害についても、当サイトは責任を負いかねます。
        外部サイトでの商品の購入に関するお問い合わせは、各販売事業者へお願いいたします。
      </p>
    </StaticLayout>
  )
}

export function ContactPage() {
  return (
    <StaticLayout path="/contact" title="お問い合わせ">
      <p>当サイトに関するお問い合わせは、以下よりお願いいたします。内容によってはお返事に時間がかかる場合や、お答えできない場合があります。</p>
      <ContactInfo />
      <p className="muted">※ 商品の購入・配送・返品等に関するお問い合わせは、各販売サイトへお願いいたします。</p>
    </StaticLayout>
  )
}

export function AdsPage() {
  return (
    <StaticLayout path="/ads" title="広告掲載について">
      <p className="callout">{site.adNotice}</p>
      <p>
        当サイトは、もしもアフィリエイト等のアフィリエイトプログラムを利用しています。
        診断結果に表示される「Amazonで見る」「楽天市場で見る」などのリンクから商品が購入された場合、当サイトに紹介料が支払われることがあります。
      </p>
      <p>
        紹介料の有無や金額によって診断結果の順位を変更することはありません。
        結果は回答内容と商品の特徴から計算した「相性順」で表示しています。
      </p>
      <p>商品の価格・在庫・配送等については、リンク先の各販売サイトでご確認ください。</p>
      <h2>広告掲載・タイアップのご相談</h2>
      <p>
        広告掲載に関するご相談は、<Link to="/contact">お問い合わせページ</Link>からご連絡ください。
      </p>
    </StaticLayout>
  )
}

/**
 * 固定ページ（運営者情報・プライバシーポリシー・免責事項・お問い合わせ・広告掲載について）。
 * 文章を変更したい場合は、このファイルの該当箇所を書き換えてください。
 * 運営者名・メールアドレス等は src/config/site.ts で設定します。
 */
import type { ReactNode } from 'react'
import { findPageMeta } from '../config/seo.ts'
import { hasContact, site } from '../config/site.ts'
import { normalizeUrl } from '../config/shops.ts'
import { Link } from '../components/Link.tsx'
import { useSeo } from '../lib/seo.ts'

/** 最終更新日（内容を変更したら書き換えてください）。個別に更新したページは StaticLayout の updatedAt で上書きします */
const UPDATED_AT = '2026年10月8日'

function StaticLayout({ path, title, updatedAt = UPDATED_AT, children }: { path: string; title: string; updatedAt?: string; children: ReactNode }) {
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
        <p className="prose__updated">最終更新日：{updatedAt}</p>
      </article>
    </div>
  )
}

function ContactInfo() {
  const formUrl = normalizeUrl(site.operator.contactFormUrl)
  return (
    <>
      {formUrl && (
        <p>
          <a className="button button--primary" href={formUrl} target="_blank" rel="noopener noreferrer">
            お問い合わせフォームを開く
            <span className="visually-hidden">（新しいタブで開きます）</span>
          </a>
        </p>
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
    <StaticLayout path="/about/" title="運営者情報" updatedAt="2026年10月26日">
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
        {hasContact && (
          <div>
            <dt>お問い合わせ</dt>
            <dd>
              <Link to="/contact/">お問い合わせページ</Link>をご覧ください。
            </dd>
          </div>
        )}
      </dl>
      <h2>サイトについて</h2>
      <p>
        {site.name}
        は、いくつかの質問に答えるだけで、使い方や好み・予算に合いそうな日用品・家電・生活用品を探せる診断サイトです。
        商品選びで迷ったときに、自分の条件に合う候補を短時間で絞り込めるようにすることを目的としています。
      </p>
      <p>
        診断結果は、回答内容と商品の特徴をもとにしたルールで機械的に計算した「相性順」で、人気や売上のランキングではありません。
        アフィリエイトリンクの有無や紹介料によって順位を変えることはありません。
      </p>

      <h2>診断で紹介する商品の選び方</h2>
      <p>
        診断で比較する商品は、原則として、メーカーの公式サイトで型番と主な仕様を確認できる製品のうち、
        国内の販売先（メーカー公式ストアや家電量販店など）で新品の取り扱いを確認できたものから選んでいます。
        型番・容量・色・セット内容などが一致する販売ページを確認できない商品や、並行輸入品・中古品しか見つからない商品は、診断の候補に表示しません。
      </p>

      <h2>情報源</h2>
      <p>
        商品の仕様は、メーカーの公式サイトに掲載されている製品情報・仕様表、取扱説明書など、メーカーが公表している情報をもとにしています。
        公式の情報で確認できなかった機能や仕様は、対応していないもの（または不明）として扱い、診断の必須条件には使いません。
      </p>

      <h2>販売情報（価格・在庫）の確認方法</h2>
      <p>
        購入先のリンクを掲載する際は、原則として楽天市場・Amazonの販売ページで、型番、販売元、税込価格、送料、在庫の表示を確認しています。
        価格はポイント還元やクーポンを含まない、確認時点の税込価格（送料を含む）を目安にしています。
      </p>
      <p>
        価格・在庫・販売元は日々変わるため、当サイトの表示と販売ページの内容が異なる場合があります。
        購入の前には、必ず販売ページで最新の情報をご確認ください。
      </p>

      <h2>診断の評価方法</h2>
      <p>
        各商品の特徴は、メーカーが公表している仕様をもとに、診断ごとに決めた評価項目について相対的に評価しています。
        当サイトで商品を購入・使用して行う実機テストの結果ではありません。
      </p>
      <p>
        診断によっては、回答の一部を「必須の条件」（予算の上限や、必要な機能など）として扱い、その条件を満たさない商品はおすすめに表示しません。
        その場合、条件に合う商品がなければ、該当する商品がないことと選んだ条件を表示します。
      </p>

      <h2>編集・更新の方針</h2>
      <p>
        掲載内容は運営者が作成・確認しています。
        新しい診断を公開するときや内容を見直すときに、仕様・販売情報を確認し、誤りや変更に気づいた場合は内容を修正します。
      </p>
    </StaticLayout>
  )
}

export function PrivacyPage() {
  return (
    <StaticLayout path="/privacy/" title="プライバシーポリシー" updatedAt="2026年10月26日">
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

      <h2>第三者配信の広告について</h2>
      <p>
        当サイトでは、第三者配信の広告サービス「忍者AdMax」を利用しているほか、「Google アドセンス」を利用する場合があります。
        Googleなどの広告配信事業者は、利用者の興味に応じた広告を表示するために、Cookie等を使用して当サイトや他のサイトへの過去のアクセスに関する情報を取得し、その情報に基づいて広告を配信する場合があります。
        当サイトが、氏名・メールアドレスなど利用者個人を特定できる情報を広告配信事業者に提供することはありません。
      </p>
      <p>
        Googleによるパーソナライズ広告は、
        <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer">
          Googleの広告設定
          <span className="visually-hidden">（新しいタブで開きます）</span>
        </a>
        で無効にしたり管理したりできます。Googleによるデータの利用については、
        <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
          Googleのサービスを使用するサイトやアプリから収集した情報のGoogleによる使用
          <span className="visually-hidden">（新しいタブで開きます）</span>
        </a>
        をご確認ください。
      </p>
      <p>
        Cookieはブラウザの設定で無効にすることができます。ただし、無効にした場合、一部の広告が正しく表示されないことがあります。
        広告配信事業者による情報の取り扱いについては、各事業者のプライバシーポリシーをご確認ください。
      </p>

      <h2>アフィリエイトプログラムについて</h2>
      <p>
        当サイトは、楽天アフィリエイト等のアフィリエイトプログラムに参加しています。
        リンク先の販売サイトでは、各事業者がCookie等を使用して情報を収集する場合があります。詳しくは各販売サイトのプライバシーポリシーをご確認ください。
      </p>
      <p>{site.amazonAssociateNotice}</p>

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
    <StaticLayout path="/disclaimer/" title="免責事項">
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
    <StaticLayout path="/contact/" title="お問い合わせ">
      {hasContact ? (
        <>
          <p>当サイトに関するお問い合わせは、以下よりお願いいたします。内容によってはお返事に時間がかかる場合や、お答えできない場合があります。</p>
          <ContactInfo />
        </>
      ) : (
        <p>現在、当サイトでは個別のお問い合わせの受付を行っていません。</p>
      )}
      <p className="muted">※ 商品の購入・配送・返品等に関するお問い合わせは、各販売サイトへお願いいたします。</p>
    </StaticLayout>
  )
}

export function AdsPage() {
  return (
    <StaticLayout path="/ads/" title="広告掲載について" updatedAt="2026年10月26日">
      <p className="callout">{site.adNotice}</p>
      <h2>アフィリエイトプログラム</h2>
      <p>
        当サイトは、楽天アフィリエイト等のアフィリエイトプログラムを利用しています。
        診断結果に表示される「Amazonで見る」「楽天市場で見る」などのリンクから商品が購入された場合、当サイトに紹介料が支払われることがあります。
      </p>
      <p>{site.amazonAssociateNotice}</p>
      <p>
        紹介料の有無や金額によって診断結果の順位を変更することはありません。
        結果は回答内容と商品の特徴から計算した「相性順」で表示しています。
      </p>
      <p>商品の価格・在庫・配送等については、リンク先の各販売サイトでご確認ください。</p>

      <h2>ディスプレイ広告</h2>
      <p>
        当サイトには、第三者配信の広告サービス「忍者AdMax」の広告枠を設置しています。
        広告枠は「広告」と表示した場所（トップページの診断一覧の下と、画面幅の広いパソコンでの画面の左右）にあり、広告が配信・表示される場合があります。
        また、第三者配信の広告サービス「Google アドセンス」を利用する場合があります。
      </p>
      <p>
        広告の内容は各広告配信事業者が配信するもので、当サイトが個別の広告を選んで掲載しているものではありません。
        広告の掲載によって、診断結果の内容や順位を変更することはありません。
      </p>
      <p>
        広告配信事業者によるCookie等の利用については、
        <Link to="/privacy/">プライバシーポリシー</Link>をご覧ください。
      </p>
      <h2>広告掲載・タイアップについて</h2>
      {hasContact ? (
        <p>
          広告掲載に関するご相談は、<Link to="/contact/">お問い合わせページ</Link>からご連絡ください。
        </p>
      ) : (
        <p>現在、個別の広告掲載・タイアップの受付は行っていません。</p>
      )}
    </StaticLayout>
  )
}

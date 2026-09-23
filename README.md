# ぴったり診断ナビ

> あなたに合う商品、30秒で見つけよう。

質問に答えるだけで、自分に合う日用品・家電・生活用品を見つけられる**診断型アフィリエイトサイト**です。

- カテゴリを選び、5問前後の質問に答えると、回答をもとに商品を採点し、**相性の高い順に上位3件**を表示します
- 「あなたとの相性（%）」「おすすめ理由」「特徴」「向いている人」「注意点」を表示します
- AI・有料API・外部DB・ログインは使いません。診断はすべてブラウザ内のルール計算で動きます
- 静的サイトとして **Cloudflare Pages に無料で公開**できます

---

## 目次

1. [使用技術](#1-使用技術)
2. [フォルダ構成](#2-フォルダ構成)
3. [開発方法（パソコンで動かす）](#3-開発方法パソコンで動かす)
4. [ビルド方法](#4-ビルド方法)
5. [Cloudflare Pages 公開方法](#5-cloudflare-pages-公開方法)
6. [公開前に必ず変更する設定](#6-公開前に必ず変更する設定)
7. [商品の追加・差し替え方法](#7-商品の追加差し替え方法)
8. [アフィリエイトURLの設定方法（もしもアフィリエイト）](#8-アフィリエイトurlの設定方法もしもアフィリエイト)
9. [診断の追加方法](#9-診断の追加方法)
10. [スコアリングの仕組み](#10-スコアリングの仕組み)
11. [SEO情報の変更方法](#11-seo情報の変更方法)
12. [クリック計測・Google Analytics](#12-クリック計測google-analytics)
13. [よくあるトラブル](#13-よくあるトラブル)

---

## 1. 使用技術

| 用途 | 技術 |
| --- | --- |
| 画面 | React 19 + TypeScript |
| ビルド | Vite |
| スタイル | 素の CSS（`src/index.css`） |
| データ | TypeScript ファイル（`src/data/diagnoses/*.ts`） |
| ルーティング | 自作の軽量ルーター（外部ライブラリなし） |
| 公開 | Cloudflare Pages（静的ホスティング・無料） |

実行時に読み込むライブラリは React だけです。

## 2. フォルダ構成

```
pittari-shindan/
├─ index.html                 … HTMLのひな形
├─ public/                    … そのまま公開されるファイル（favicon, _headers）
├─ scripts/
│   ├─ seoPlugin.ts           … ビルド時にページ別HTML・sitemap.xml・robots.txt・404.htmlを生成
│   └─ checkDiagnoses.ts      … 全診断を全回答パターンで動作確認（npm run check）
└─ src/
    ├─ config/
    │   ├─ site.ts            … ★サイト名・公開URL・運営者情報・広告表記
    │   ├─ seo.ts             … トップ・固定ページのSEO情報
    │   ├─ shops.ts           … 購入ボタン（Amazon / 楽天 / Yahoo! / 公式）の定義
    │   └─ categories.ts      … トップページのカテゴリ分類
    ├─ data/
    │   ├─ diagnoses/
    │   │   ├─ index.ts       … ★診断の登録簿（ここに追加すると全体に反映）
    │   │   ├─ pillow.ts      … ★枕診断（質問・商品・選び方）
    │   │   ├─ hairDryer.ts / vacuum.ts / fryingPan.ts / suitcase.ts
    │   │   ├─ mobileBattery.ts / deskChair.ts / showerHead.ts
    │   │   └─ humidifier.ts / pet.ts
    │   └─ validate.ts        … データの入力ミスチェック
    ├─ engine/
    │   ├─ scoring.ts         … 採点ロジック（共通）
    │   └─ diagnosisEngine.ts … 診断の実行・並び替え・おすすめ理由の生成（共通）
    ├─ components/            … 画面部品（カード、質問、進捗バー、結果カード など）
    ├─ pages/                 … ページ（トップ、診断、固定ページ、404）
    ├─ lib/                   … ルーター、SEOタグ更新、計測、localStorage
    └─ types/diagnosis.ts     … データの型（項目の説明つき）
```

★ の付いたファイルが、普段の運営で編集するファイルです。

## 3. 開発方法（パソコンで動かす）

### 準備（初回のみ）

1. [Node.js](https://nodejs.org/ja) の **LTS版（22 以上）** をインストール
2. ターミナル（Windows なら「PowerShell」）を開き、このフォルダへ移動
   ```bash
   cd C:\Users\あなたのユーザー名\pittari-shindan
   ```
3. 必要なライブラリをインストール
   ```bash
   npm install
   ```

### 起動方法

```bash
npm run dev
```

表示された `http://localhost:5173/` をブラウザで開くとサイトが表示されます。
ファイルを保存すると、ブラウザに自動で反映されます。止めるときはターミナルで `Ctrl + C`。

## 4. ビルド方法

```bash
npm run build     # 公開用ファイルを dist/ に作成（型チェック込み）
npm run preview   # 作成した dist/ をローカルで確認
npm run lint      # コードの書き方チェック
npm run check     # 全診断を全回答パターンで実行して動作確認
```

`npm run build` を実行すると `dist/` フォルダに以下が作られます。

- `index.html`、`diagnosis/pillow/index.html` など **ページごとのHTML**（title・description・canonical・OGP入り）
- `404.html`（存在しないURL用）
- `sitemap.xml`、`robots.txt`
- `assets/`（JavaScript・CSS）

## 5. Cloudflare Pages 公開方法

### ① GitHub にアップロード

1. [GitHub](https://github.com/) で新しいリポジトリを作成（Private でも可）
2. このフォルダで以下を実行（`あなたのID/リポジトリ名` は置き換え）
   ```bash
   git init
   git add .
   git commit -m "first commit"
   git branch -M main
   git remote add origin https://github.com/あなたのID/リポジトリ名.git
   git push -u origin main
   ```

### ② Cloudflare Pages と接続

1. [Cloudflare ダッシュボード](https://dash.cloudflare.com/) にログイン（無料アカウントでOK）
2. 「Workers & Pages」→「作成」→「Pages」→「Git に接続」
3. 先ほどのリポジトリを選択
4. ビルド設定を以下のように入力

   | 項目 | 値 |
   | --- | --- |
   | フレームワーク プリセット | `Vite`（または「なし」） |
   | ビルドコマンド | `npm run build` |
   | ビルド出力ディレクトリ | `dist` |
   | 環境変数（任意） | `NODE_VERSION` = `22` |

5. 「保存してデプロイ」→ 数分で `https://プロジェクト名.pages.dev` で公開されます

以降は GitHub に push するたびに自動で再公開されます。

### ③ 公開後にやること

1. 公開URLが決まったら `src/config/site.ts` の `url` をそのURLに変更して再度 push（canonical・sitemap に使われます）
2. [Google Search Console](https://search.google.com/search-console) にサイトを登録し、`https://あなたのURL/sitemap.xml` を送信
3. 独自ドメインを使う場合は Cloudflare Pages の「カスタムドメイン」から設定し、`site.ts` の `url` も合わせて変更

> 補足：`dist/404.html` があるため、存在しないURLには Cloudflare Pages が 404 ページを返します。
> `public/_headers` で JS/CSS に長期キャッシュを設定しています。

## 6. 公開前に必ず変更する設定

`src/config/site.ts` を開いて、以下を書き換えてください。

```ts
url: 'https://pittari-shindan.pages.dev',   // ← 実際の公開URL（末尾の / なし）
operator: {
  name: '（運営者名を入力してください）',     // ← 運営者名（屋号・ニックネーム可）
  email: '',                                   // ← 問い合わせ用メール（空なら非表示）
  contactFormUrl: '',                          // ← Googleフォーム等のURL（空なら「準備中」）
},
ogImage: '',                                   // ← SNS共有用画像（例: '/ogp.png'。public/ に置く）
```

固定ページ（プライバシーポリシー・免責事項など）の文章は `src/pages/StaticPages.tsx` にあります。
内容を変えたら同じファイル内の `UPDATED_AT`（最終更新日）も更新してください。

## 7. 商品の追加・差し替え方法

商品は各診断ファイル（例：`src/data/diagnoses/pillow.ts`）の `products: [ ... ]` の中にあります。

### 仮データを実在の商品に差し替える

現在の商品はすべて「商品A（仮）」のような**仮データ**です。1つずつ実際の商品情報に書き換えます。

```ts
{
  id: 'pillow-001',                 // 変更しない（重複しない英数字）
  name: '○○枕 高さ調整タイプ',      // ← 実際の商品名
  category: 'pillow',               // 変更しない（診断の id と同じ）
  description: '…',                 // ← 短い説明
  priceRange: 2,                    // ← 価格帯（1〜5。意味はファイル上部の priceLabels 参照）
  features: ['横向き寝向き', '高さ調整可能'],  // ← 特徴
  pros: ['…'],                      // ← 良い点
  cons: ['…'],                      // ← 気になる点
  recommendFor: '…',                // ← 向いている人
  caution: '…',                     // ← 注意点（省略すると cons を表示）
  amazonUrl: '',                    // ← 8章参照
  rakutenUrl: '',                   // ← 8章参照
  imageUrl: '',                     // ← 使用許諾のある画像URLのみ（空ならプレースホルダー）
  enabled: true,                    // ← false にすると非表示
  sample: true,                     // ← 実商品にしたら false に（「仮データ」ラベルが消えます）
  attributes: { back: 3, side: 5, stomach: 1, height: 4, firmness: 4, breathability: 3, adjustable: true, washable: true },
},
```

- **`attributes`（評価項目）が診断結果を決めます。** 各項目の意味はファイル冒頭のコメントに書いてあります（例：`firmness: 1 やわらかい 〜 5 かたい`）
- 商品を**追加**するときは、既存の商品 `{ ... },` をまるごとコピーして貼り付け、`id` を新しいもの（例：`pillow-007`）にして中身を書き換えます
- 商品を**一時的に隠す**ときは `enabled: false`
- 書き換え後に `npm run check` を実行すると、ID の重複などの入力ミスを確認できます

> ⚠ 商品説明には「治る」「改善する」「健康になる」など効果を断定する表現を書かないでください。
> ⚠ 商品画像は、アフィリエイトサービスが提供する画像や、使用許諾のある画像だけを使ってください。

## 8. アフィリエイトURLの設定方法（もしもアフィリエイト）

購入ボタンのリンクは、**各商品データの `amazonUrl` / `rakutenUrl` に貼るだけ**です。コード内に直接書く必要はありません。

1. [もしもアフィリエイト](https://af.moshimo.com/) で Amazon・楽天市場と提携
2. 「かんたんリンク」などで商品リンクを作成し、**リンクURL**（`https://af.moshimo.com/af/c/click?a_id=...` の部分）をコピー
   - HTMLタグ全体ではなく、`href="…"` の中身のURLだけを貼ってください
   - `//af.moshimo.com/...` のように `https:` が省略されていても自動で補完されます
3. 商品データに貼り付け

```ts
amazonUrl: 'https://af.moshimo.com/af/c/click?a_id=0000000&p_id=170&pc_id=185&pl_id=4062&url=https%3A%2F%2Fwww.amazon.co.jp%2Fdp%2FXXXXXXXXXX',
rakutenUrl: 'https://af.moshimo.com/af/c/click?a_id=0000000&p_id=54&pc_id=54&pl_id=616&url=https%3A%2F%2Fitem.rakuten.co.jp%2F...',
```

| 状態 | 表示 |
| --- | --- |
| URLあり | 「Amazonで見る」「楽天市場で見る」ボタン（新しいタブで開く・`rel="sponsored nofollow"` 付き） |
| URLが空 | 「Amazon：準備中」のようなグレーの表示（押せません） |
| 不正なURL（`http(s)` 以外） | 安全のため「準備中」扱い |

### Yahoo!ショッピング・公式サイトのリンク

`yahooUrl` / `officialUrl` を商品データに追加すればボタンが表示されます（空なら非表示）。

```ts
yahooUrl: 'https://…',
officialUrl: 'https://…',
```

### 新しいショップを追加したい場合

`src/config/shops.ts` の `shops` に1行追加し、`src/types/diagnosis.ts` の `Product` に同じ名前の項目を追加します。
ボタンの「準備中」表示の有無は `showWhenEmpty` で切り替えられます。

> Amazonアソシエイト・プログラムに直接参加する場合は、規約で定められた表記（「Amazonのアソシエイトとして…」）を
> `src/pages/StaticPages.tsx` の「広告掲載について」ページに追加してください。

## 9. 診断の追加方法

**診断設定ファイルを1つ作って、登録簿に1行追加するだけ**です。トップページのカード・URL（`/diagnosis/◯◯`）・sitemap.xml・ページ別HTMLは自動で作られます。

1. `src/data/diagnoses/pillow.ts` をコピーして、例えば `electricKettle.ts` を作成
2. 中身を書き換え
   - `id` と `slug`：半角英小文字とハイフン（例：`electric-kettle`）。URL は `/diagnosis/electric-kettle` になります
   - `name`、`itemName`、`icon`（絵文字）、`shortDescription`、`intro`
   - `group`：トップページの分類（`life` / `kitchen` / `beauty` / `digital` / `travel` / `pet`）
   - `seo`：title と description
   - `priceLabels`：価格帯 1〜5 の表示名
   - `questions`：質問（4〜6問がおすすめ）
   - `products`：商品（各商品の `category` は `id` と同じにする）
   - `guide`：選び方コンテンツ
   - `notice`：結果画面に出す注意書き（任意）
   - 変数名 `export const pillow` も `export const electricKettle` に変更
3. `src/data/diagnoses/index.ts` に2行追加
   ```ts
   import { electricKettle } from './electricKettle.ts'   // 上のほうに追加
   // …
   const allDiagnoses: Diagnosis[] = [
     pillow,
     // …
     electricKettle,   // ← 追加
   ]
   ```
4. `npm run check` と `npm run build` でエラーがないことを確認

分類（`group`）を新しく増やしたい場合は `src/config/categories.ts` と `src/types/diagnosis.ts` の `CategoryGroupId` に追加します。

## 10. スコアリングの仕組み

共通エンジン（`src/engine/`）が、どの診断でも同じ方法で採点します。

### 質問の書き方

```ts
{
  id: 'firmness',
  text: '好みの硬さは？',
  shortLabel: '硬さ',       // 結果の「相性の内訳」に表示
  weight: 25,               // ★重要度。大きいほど結果に強く影響
  options: [
    { id: 'soft', label: 'やわらかめ', summary: 'やわらかめが好み',
      effects: [{ type: 'near', attr: 'firmness', value: 2 }] },
    { id: 'any', label: 'こだわらない', effects: [] },   // 空 = この質問は採点しない
  ],
},
```

### ルール（effects）の種類

| type | 意味 | 例 |
| --- | --- | --- |
| `near` | 商品の値が `value` に近いほど高得点 | 硬さ 4 を希望 |
| `atLeast` | `value` 以上なら満点、足りないほど減点 | 静音性 4 以上 |
| `atMost` | `value` 以下なら満点、超えるほど減点 | 予算（`attr: 'priceRange'`） |
| `equals` | 値が一致すれば満点 | 洗える = `true`、方式 = `'steam'` |
| `custom` | 独自の計算関数（0〜1 を返す） | 複雑な条件 |

1つの選択肢に複数のルールを書くことができ、`weight` でルールごとの重みも付けられます。

### 計算方法

1. 各ルールで「一致度」を 0〜1 で計算（差が 1 段階なら 0.7、2 段階なら 0.35 …）
2. 質問ごとの一致度 × 質問の `weight` を合計し、重みの合計で割る
3. 100 を掛けて「あなたとの相性 ◯%」として表示
4. 一致度が高かった質問（0.8以上）から「おすすめ理由」の文章を自動で組み立て、差が大きい質問（0.5未満）があれば「一方で…」と補足

カテゴリ独自の補正が必要な場合は、診断ファイルに `scoring.adjust` を書けます。

```ts
scoring: {
  adjust: ({ product, answers, score }) => (answers.budget === 'b1' && product.priceRange >= 4 ? score * 0.8 : score),
},
```

## 11. SEO情報の変更方法

| ページ | 変更する場所 |
| --- | --- |
| 各診断ページ | 各診断ファイルの `seo: { title, description, ogImage }` |
| トップ・固定ページ | `src/config/seo.ts` の `staticPages` |
| サイト共通（サイト名・URL・OGP画像） | `src/config/site.ts` |
| 選び方コンテンツ | 各診断ファイルの `guide` |

- ビルド時に、ページごとの HTML へ `title` / `meta description` / `canonical` / OGP / `robots` が埋め込まれます
- `sitemap.xml` と `robots.txt` も自動生成されます（`site.ts` の `url` が使われます）
- 404 ページには `noindex` が付きます

## 12. クリック計測・Google Analytics

`src/lib/analytics.ts` の `trackEvent()` で計測しています。現在送っているイベントは次の3つです。

| イベント名 | タイミング | 内容 |
| --- | --- | --- |
| `diagnosis_start` | 診断開始 | `diagnosis_id` |
| `diagnosis_complete` | 結果表示 | `diagnosis_id` |
| `affiliate_click` | 購入ボタンのクリック | `diagnosis_id`（どの診断）、`product_id`（どの商品）、`shop`（どのショップ）、`rank`（何番目） |

- 開発中（`npm run dev`）はブラウザのコンソールに `[track]` と表示されます
- **Google Analytics 4** を使う場合は、GA の管理画面で表示される計測タグ（`gtag.js`）を `index.html` の `<head>` 内に貼るだけで、上記イベントが自動送信されます
- Googleタグマネージャー（`dataLayer`）にも対応しています
- GA を導入したら、プライバシーポリシーの記載内容も確認してください

## 13. よくあるトラブル

| 症状 | 対処 |
| --- | --- |
| `npm` が見つからない | Node.js をインストールし、ターミナルを開き直す |
| ビルドで型エラーが出る | エラーに表示されたファイル・行番号を確認。カンマ `,` や `'` の閉じ忘れが多いです |
| 商品が結果に出ない | `enabled: true` か、`category` が診断の `id` と一致しているかを確認 |
| 購入ボタンが「準備中」のまま | `amazonUrl` / `rakutenUrl` が `https://` または `//` で始まっているか確認 |
| 結果の順位が意図と違う | 商品の `attributes` の数値と、質問の `weight` を見直す。`npm run check` で全パターンを確認できます |

---

### 表示ルール（運営上の注意）

- 結果は「人気ランキング」ではなく「回答との相性順」として表示しています。「絶対おすすめ」「必ず買うべき」などの表現は使わないでください
- 医療・健康効果を断定する表現（治る・改善する・健康になる 等）は使わないでください
- 広告表記「当サイトはアフィリエイト広告を利用しています。」はヘッダー直下とフッターに表示されます（文言は `site.ts` の `adNotice`）

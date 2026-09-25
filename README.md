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
│   ├─ checkDiagnoses.ts      … 全診断を全回答パターンで動作確認（npm run check）
│   ├─ publishDiagnosis.ts    … 診断公開ワークフロー（npm run publish:diagnosis）
│   └─ lib/                   … check と公開ワークフローで共有する確認処理（全パターン検証・公開版との比較・楽天・画面確認）
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
npm run publish:diagnosis -- <診断ID>   # 診断の公開（確認→enabled:true→commit→push→本番確認を自動実行）
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
| URLあり | 「楽天市場で見る」ボタン（新しいタブで開く・`rel="sponsored nofollow"` 付き） |
| URLが空 | 「楽天市場：準備中」のグレーの表示（押せません） |
| 不正なURL（`http(s)` 以外） | 安全のため「準備中」扱い |

> **現在 Amazon のボタンは非表示です**（当面は楽天アフィリエイトのみ使用）。
> 商品データの `amazonUrl` はそのまま残せます。再表示するときは `src/config/shops.ts` の Amazon の行を `enabled: true` にしてください。

### Yahoo!ショッピング・公式サイトのリンク

`yahooUrl` / `officialUrl` を商品データに追加すればボタンが表示されます（空なら非表示）。

```ts
yahooUrl: 'https://…',
officialUrl: 'https://…',
```

### 新しいショップを追加したい場合

`src/config/shops.ts` の `shops` に1行追加し、`src/types/diagnosis.ts` の `Product` に同じ名前の項目を追加します。
ボタンの「準備中」表示の有無は `showWhenEmpty`、ショップ自体の表示・非表示は `enabled` で切り替えられます。

> Amazonアソシエイト・プログラムに直接参加する場合は、規約で定められた表記（「Amazonのアソシエイトとして…」）を
> `src/pages/StaticPages.tsx` の「広告掲載について」ページに追加してください。

### 楽天市場APIから商品候補を取得する（ローカル専用）

楽天市場商品検索API（`https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701`）から商品候補を取得し、
**確認用のJSON**として保存するツールです。サイト（ブラウザ）からは楽天APIを呼ばず、診断データも自動では書き換えません。現在は枕（`pillow`）のみ対応しています。

1. `.env.example` をコピーして `.env.local` を作り、楽天ウェブサービスの値を入力（`.env` で始まるファイルは Git に上がりません）
   ```
   RAKUTEN_APPLICATION_ID=…
   RAKUTEN_ACCESS_KEY=…
   RAKUTEN_AFFILIATE_ID=…
   ```
   - Windows のメモ帳で保存すると `.env.local.txt` になることがあります。その場合は `Rename-Item .env.local.txt .env.local` で名前を変更してください
   - 楽天のアプリ設定の「許可されたWebサイト」と送信元（Origin）が一致しないと 403 になります。Origin は `src/config/site.ts` の `url`、変えたい場合は `.env.local` に `RAKUTEN_ORIGIN=` を追加
2. 実行
   ```bash
   npm run rakuten:search -- pillow
   npm run rakuten:search -- pillow --keyword "枕 横向き" --hits 20   # キーワード・件数を指定
   ```
3. 保存先：`data/rakuten-candidates/pillow/日時.json` と `latest.json`（Git 管理外）
4. JSON を確認し、採用する商品の `productDraft` を参考に `src/data/diagnoses/pillow.ts` へ手動で追加（`attributes` や特徴は商品ページを見て記入）

- 検索キーワード・除外ワード・並び順は `scripts/rakuten/presets.ts` で変更できます
- 認証エラー（403 など）、429（1回だけ自動で再試行）、0件、500/503、通信エラーはそれぞれメッセージで案内します
- 認証情報の値は画面に表示されず、保存するJSONにも Application ID / Access Key は含まれません（アフィリエイトURLには仕組み上アフィリエイトIDが含まれます）

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

### 公開・準備中の切り替え（`enabled`）

各診断ファイルの最後にある `enabled` で、公開状態を切り替えます。

| 値 | トップページのカード | 診断ページ（URL直接アクセス） | sitemap.xml |
| --- | --- | --- | --- |
| `enabled: true` | クリックして診断できる | 診断できる | 掲載する |
| `enabled: false` | 「準備中」バッジ付きで薄く表示（クリック不可） | 「準備中です」と表示（検索エンジンに載せない） | 掲載しない |

現在公開しているのは枕診断だけです（ほかの9診断は `enabled: false`）。
掃除機診断は実商品10機種の登録まで完了していますが、まだ `enabled: false` です。

### 診断を公開する手順（`enabled: false` → `true`）

公開前後の確認は、公開ワークフローでまとめて自動実行できます。

```bash
npm run publish:diagnosis -- humidifier --dry-run   # まず確認だけ（enabled は元に戻し、commit しない）
npm run publish:diagnosis -- humidifier             # 公開（commit・push・本番確認まで）
npm run publish:diagnosis -- humidifier --verify    # 公開済みの診断を再確認（ファイル変更なし）
```

自動で行うこと（1つでも失敗したらその時点で停止し、commit・push はしません。enabled を書き換えていれば元に戻します）：

1. 対象の診断が `enabled: false`・実商品（仮商品なし）・入力チェックOKであること、main ブランチで origin より遅れていないこと、公開対象以外のファイルに変更がないこと
2. 変更内容から検証範囲を自動判定（下の「検証範囲の自動判定」）
3. 対象の診断を全回答パターンで検証（`npm run check` と同じ確認。検証範囲が広がった場合はその診断も）
4. 公開中の全診断が、公開版（HEAD）と同じ結果であること（結果に影響する依存ファイルのハッシュが同じ診断は再計算を省略、それ以外は全パターンで完全一致を確認）
5. 全商品の画像・楽天アフィリエイトURL（rafcid なし・転送）・楽天の価格が priceRange と合うこと・売り切れでないこと
6. `enabled: false` → `true`（公開工程で変更するのはこの1行だけ）
7. `npm run build` / `lint` / `check`（公開処理の中で1回だけ、公開直前の状態で実行）、`dist/sitemap.xml` への掲載・`index, follow`・canonical
8. ビルド結果をローカルで配信し、トップのカードと代表パターンの画面（390 / 1280px）を確認
9. 変更ファイルが対象の診断ファイル（と `scripts/rakuten/presets.ts`）だけで、実行中にほかの変更が加わっていないことを確認して commit → push
10. Cloudflare Pages の反映を待ち（本番 sitemap に載るまで最大10分）、本番の robots・canonical・アクセス解析ビーコン・公開中の全診断ページ（HTTP 200）を確認し、トップのカードと対象診断の代表パターンを 390 / 1280px で確認（表示が計算結果と一致・画像・楽天ボタン・横スクロール・文字切れ・JSエラー）

#### 検証範囲の自動判定

比較先（HEAD）からの変更を調べ、ファイル名ではなく「診断結果に影響するファイルの中身のハッシュ」で判定します（`scripts/lib/changeScope.ts`）。

| 変更内容 | 全パターン検証 | 画面確認 |
| --- | --- | --- |
| 新しい診断の追加だけ（診断ファイル＋`index.ts` への import・1行追加） | 対象診断のみ（既存診断はハッシュ一致を確認） | 対象診断＋トップ |
| 既存の個別診断のデータ（その診断だけが使う補助ファイルを含む） | 変更された診断のみ | 対象診断＋変更された診断 |
| 共通の計算部分（`src/engine/diagnosisEngine.ts`・`scoring.ts`・`src/types/diagnosis.ts`・`src/data/diagnoses/shared.ts`・`src/data/validate.ts` とその import 先） | 公開中の全診断 | 公開中の全診断 |
| 画面・CSS・文章だけ（`src/components`・`src/pages`・`src/lib`・`src/config`・CSS・`public`・`index.html`・`scripts/seoPlugin.ts`） | 再計算なし（build / lint / check のみ） | 公開中の全診断を 390 / 1280px（本番の対象診断は 320〜1280px の4幅） |
| 説明文書・楽天の検索ツール（`*.md`・`docs/`・`scripts/rakuten/`） | 再計算なし | 対象診断＋トップ |

次の場合は必ず全診断のフル検証（画面確認も全診断）にします：変更範囲を判定できない／依存関係を解析できない（外部パッケージ・動的 import など）／共通の計算部分・検証の仕組み（`scripts/lib`・`scripts/checkDiagnoses.ts`・`scripts/publishDiagnosis.ts`）・ビルド設定（`package.json`・`tsconfig`・`vite.config.ts`・`eslint.config.js`）の変更／判定ルールにないファイルの変更／診断ファイルの削除や診断IDの不一致／`index.ts` に新しい診断の追加以外の変更。

#### dry-run の結果の再利用

dry-run が最後まで成功すると、そのときの作業ツリー全体の git tree ハッシュと HEAD・Node.js のバージョンを `.git/pittari-publish/` に記録します（commit には含まれません）。続けて公開したときにこれらが完全に一致すれば、重い検証（全パターン検証・公開版との一致・enabled 切り替えで結果が変わらないこと）を再実行しません。ファイルが1文字でも変わっていたり、HEAD が変わっていたり、記録のハッシュが合わなかったりした場合は、記録を無効にしてすべて検証し直します。商品の最終チェック（在庫・価格）と build / lint / check・画面確認は公開時にも必ず実行します。

画面確認では、自動確認のアクセスをアクセス解析（Cloudflare Web Analytics）に含めないよう、解析への通信を空の応答に差し替えます。ビーコンが設置されていることは本番の HTML で確認します。

オプション：`--message "コミットメッセージ"`（既定は `Publish <ID> diagnosis`）、`--allow <path>`（ほかのファイルも commit に含める）、`--base <commit>`（比較先。ワークフロー自体の動作確認用）。
画面確認には Edge か Chrome を使います（見つからない場合は環境変数 `PUBLISH_BROWSER_PATH` で指定）。

自動化していないため、公開前に人が確認すること：

- 楽天の商品ページの型番・カラー・セット構成（別の型番が混ざっていないか）、セール価格の終了日
- 商品画像に販促文字（「◯%OFF」「ポイント◯倍」など）が大きく入っていないか
- 必要に応じて Google Search Console で sitemap を再送信

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

### 条件付きの並び順（適格条件・予算上限・補完候補）

「コードレスを選んだ人にはコードレスだけを勧める」「予算内の商品を必ず先に出す」のように、**点数だけでなく条件で並びを決めたい**ときの共通機能です。
掃除機診断（`src/data/diagnoses/vacuum.ts`）が実例です。使っていない診断（枕など）は、従来どおり相性の高い順に並ぶだけで、動作は変わりません。

| 設定 | 書く場所 | 働き |
| --- | --- | --- |
| `eligibility` | 選択肢 | 条件（例：`cordless: true`）を満たす商品だけを通常ランキングの候補にする（適格条件） |
| `maxPriceRange` | 選択肢 | `priceRange` がこの値以下の商品だけを通常ランキングの候補にする（予算の上限） |
| `scoring.tieBreak` | 診断 | 相性スコアが完全に同じ商品の並べ方を決める |
| `scoring.lowMatchNotice` | 診断 | 1位の相性が60%未満のときだけ、結果画面の上部に短い説明を出す（採点・順位・相性%は変わらない） |

**`eligibility`（適格条件）**

```ts
{
  id: 'cordless', label: 'コードレスを優先したい',
  effects: [],   // 適格条件を持つ選択肢は effects を空にする（全候補が条件を満たすので採点しても差が付かない）
  eligibility: {
    attr: 'cordless', value: true,
    notice: 'コードレスを優先した商品からおすすめを表示しています。',           // 結果画面の上部に出る説明（任意）
    supplementLabel: 'コードレスの候補が少ないため、コード式の商品を補完しています', // 条件外の商品を補完したときのラベル（任意）
  },
},
```

**`maxPriceRange`（予算の上限）**

予算の質問は `budgetQuestion()`（`src/data/diagnoses/shared.ts`）で作れます。`asLimit: true` を付けると、各選択肢に `maxPriceRange` が自動で入ります（`b1` → 1、`b2` → 2 …、「上限なし」の選択肢には付きません）。

```ts
budgetQuestion({
  bands: [
    { label: '15,000円以下', summary: '予算15,000円以下' },   // summary は「おすすめ理由」で使う短い表現
    { label: '15,000〜30,000円', summary: '予算15,000〜30,000円' },
    { label: '30,000〜50,000円', summary: '予算30,000〜50,000円' },
  ],
  noLimitLabel: '50,000円以上でもOK',
  weight: 17,
  asLimit: true,   // 付けないと、従来どおり「予算に近いほど高得点」の採点だけになる（枕はこちら）
})
```

**並び順の決まり方**

1. 条件ごとに商品を分ける：条件を満たす → 予算超え（`overBudget`） → 適格条件外（`ineligible`） → 両方外
   - 適格条件（例：コードレス）は予算より優先します
2. 同じグループの中は相性スコアの高い順
3. `tieBreak: true` のときは、完全同点の場合だけ ①質問ごとの一致度（重要度の高い質問から） → ②回答で使われた評価項目の元の値 → ③商品ID の順で並べます（価格・レビュー数・メーカー名は使いません）

**結果画面での表示（エンジンが返す値）**

| 値 | 意味 | 画面 |
| --- | --- | --- |
| `ranked` | 条件をすべて満たす商品（最大3件） | 「相性◯位」。条件に合う商品が2件なら2位まで |
| `supplements` | `ranked` が3件に満たないときだけ入る、条件外の補完候補 | 別枠「予算を少し超える候補」など。順位なしで「参考相性◯%」 |
| `notices` | 選んだ適格条件の説明文 | 結果の上部に表示 |
| `overBudget` | 商品が予算を超えている印 | ラベル「予算を少し超えます」 |
| `ineligible` | 商品が適格条件を満たさない印 | `supplementLabel` のラベル |

補完候補（`supplements`）は、通常ランキングとは点数の基準になる条件が違うため、相性%が通常ランキングより高く見えることがあります。そのため別枠に分けて、順位を付けずに表示しています。

**新しい診断で使うときの確認**

- `npm run check` が、全回答パターンで「通常ランキングに条件外の商品が入っていない」「通常ランキング内で相性%が逆転していない」「補完候補は条件外の商品だけ」を自動で確認します
- 条件に合う商品が少ない選択肢（例：掃除機の「15,000円以下」は2機種）では、補完候補が常に表示されます。商品を選ぶときに、各条件の商品数も確認してください
- 評価値は、結果の分布を整える目的で変更しないでください（採点基準を先に決め、その基準で採点します）

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

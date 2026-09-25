import type { Diagnosis, Product } from '../../types/diagnosis.ts'
import { budgetQuestion } from './shared.ts'

/**
 * シャワーヘッド診断
 *
 * 【対象範囲】家庭用の交換式シャワーヘッド。
 *   対象外：公式仕様を確認できない商品、業務用、シャワーヘッド以外が主体の商品、型番・仕様・楽天SKUを照合できない商品
 *
 * 商品の attributes（評価項目）。数値は 1〜5（採点基準：data/rakuten-candidates/shower-head/scoring-criteria.md）
 *   waterPressure : 水圧・浴び心地の強さ（公式の構造説明・数値・低水圧対応の明記で判定。レビューは使わない）
 *   waterSaving   : 節水（公式の節水率。比較対象・測定条件を記録）
 *   lightness     : 軽さ（ヘッド本体のみの公式重量）
 *   sprayVariety  : 水流の種類（公式の水流モード数。止水は数えない）
 *   convenience   : 便利機能（手元止水・角度調整・お手入れ構造・片手切替の数）
 * true / false の項目（有無のみ。効果の強弱は採点しない）
 *   fineBubble : ファインバブル（ウルトラファインバブル・マイクロバブルを含む）の発生を公式にうたっている
 *   stopButton : 手元止水ボタン・レバーがある
 * 価格帯（priceRange）は priceLabels を参照（1: 〜3,000円 / 2: 〜6,000円 / 3: 〜12,000円 / 4: 12,000円〜）。
 *
 * 【並び順のルール】（共通エンジンの設定）
 *   - Q6 予算：予算内の商品を通常ランキングの候補にする（上限条件）
 *   - 通常ランキングが3件に満たないときだけ、予算を超える商品を別枠に表示する
 *   - 相性スコアが完全に同じときは、回答に関係する一致度 → 評価値 → 商品ID の順で並べる（scoring.tieBreak）
 *
 * ファインバブル・美容・肌・髪への効果は採点せず、診断結果でも断定しない。
 *
 * 商品はメーカー公式情報で評価した実商品10機種（2026-09-25 確認）。根拠は data/rakuten-candidates/shower-head/product-evaluations.json。
 */

/** 取り付けできない水栓・給湯器（各メーカーの公式情報・取扱説明書より。2026-09-25 確認） */
const TAKAGI_CAUTION =
  'タカギの取扱説明書では、一時止水機能のないデッキ2ハンドルシャワー混合栓、バランス釜、樹脂製のシャワーエルボには取り付けできません。切替レバーで止水できない2ハンドル混合栓には別売の逆止弁アダプターが必要です。'
const SANEI_STOP_CAUTION = 'SANEIの公式情報では、一時止水機能のないツーバルブ混合栓とバランス釜には取り付けできません。'
const SANEI_MIST_CAUTION = 'SANEIの公式情報では、サーモ混合栓・シングルレバー混合栓用で、ツーバルブ混合栓とバランス釜には取り付けできません。'
const BALANCE_CAUTION_ARROMIC = 'アラミックの公式情報では、バランス釜には使用できません。'
const TKS_CAUTION = 'TKSの取扱説明書では、バランス釜には取り付けできません。リンナイ・ノーリツなど一部メーカーのシャワーにも取り付けできません。'
const IRIS_CAUTION =
  'アイリスオーヤマの公式情報では、一時止水機能のない2ハンドルシャワー混合水栓、バランス釜、樹脂製のシャワーエルボには取り付けできません。'
const REFA_CAUTION = 'ReFaの公式FAQでは、台所用瞬間湯沸器、バランス釜タイプのシャワーには使用できません。温泉水・井戸水も使用できません。'

/** 商品データ（実商品10機種。評価値はメーカー公式情報に基づく：data/rakuten-candidates/shower-head/product-evaluations.json、採点基準 v1） */
const products: Product[] = [
  {
    // タカギ キモチイイシャワピタWT JSB022 / 220g / 節水 約34%（当社製品JS115比）/ 手元止水 / 節水低水圧タイプ（推奨水圧0.05〜0.2MPa）/ 1,441円（シャワー単品SKU）（2026-09-25 確認）
    id: 'shower-head-101',
    name: 'タカギ キモチイイシャワピタWT JSB022',
    category: 'shower-head',
    description: '約0.3mmの細い水流で、水圧が低くても勢いをプラスできるとされる節水低水圧タイプのシャワーヘッド。手元のボタンで止水できます。',
    priceRange: 1,
    features: ['節水 約34%（当社製品比）', '低水圧タイプ（推奨水圧0.05MPa〜）', '手元止水ボタン', '本体 220g', '水流 1種類'],
    pros: ['価格が手頃', '水圧が低めの住まい向けの設計', '手元で止水できる'],
    cons: ['本体は220gで、軽さ重視の人には重めです', '水流の切り替えはありません'],
    recommendFor: '手頃な価格で、水圧の弱さ対策と手元止水を両立したい人',
    caution: TAKAGI_CAUTION,
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00ty6no.d8zue158.g00ty6no.d8zuf563/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ftakagi-official%2Fjsb022%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Ftakagi-official%2Fi%2F10000538%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/takagi-official/cabinet/jsb022_main002.jpg?_ex=300x300',
    enabled: true,
    attributes: { waterPressure: 4, waterSaving: 3, lightness: 2, sprayVariety: 1, convenience: 2, fineBubble: false, stopButton: true },
  },
  {
    // SANEI 節水ストップシャワーヘッド PS3230-80XA-MW2 / 120g / 節水率50%（SANEI基準・ストップボタン併用時）/ 手元止水 / 1,980円（2026-09-25 確認）
    id: 'shower-head-102',
    name: 'SANEI 節水ストップシャワーヘッド PS3230-80XA-MW2',
    category: 'shower-head',
    description: '薄型コンパクトな本体120gの節水シャワーヘッド。手元のストップボタンで止水できます。',
    priceRange: 1,
    features: ['本体 120g', '節水率 50%（ストップボタン併用時）', '手元止水ボタン', '水流 1種類'],
    pros: ['本体が軽い', '価格が手頃', '手元で止水できる'],
    cons: ['節水率はストップボタンを併用したときの値です', '水圧アップについての公式の記載はありません'],
    recommendFor: '手頃な価格で、軽くて手元止水もできるシャワーヘッドがほしい人',
    caution: SANEI_STOP_CAUTION,
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pw4vo.d8zuebe5.g00pw4vo.d8zuf95f/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkurashi-arl%2F4973987649004%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fkurashi-arl%2Fi%2F10025974%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/kurashi-arl/cabinet/sanei-suisen/4973987649004-91.jpg?_ex=300x300',
    enabled: true,
    attributes: { waterPressure: 2, waterSaving: 3, lightness: 4, sprayVariety: 1, convenience: 2, fineBubble: false, stopButton: true },
  },
  {
    // アラミック シルクシャワーシリーズ01 スタンダード SSS-01 / 本体139g / 節水 最大50%（当社比）/ 増圧（穴数189・穴径0.30mm）/ 止水なし / 3,828円（2026-09-25 確認）
    id: 'shower-head-103',
    name: 'アラミック シルクシャワーシリーズ01 スタンダード SSS-01',
    category: 'shower-head',
    description: 'ステンレス製の精密散水板（穴径0.30mm）で節水と増圧をうたうシャワーヘッド。本体139gと軽めです。',
    priceRange: 2,
    features: ['節水 最大50%（当社比）', '増圧（水圧の低い家庭向けと公式に記載）', '本体 139g', '散水板を外してお手入れ', '水流 1種類'],
    pros: ['本体が軽い', '節水と水圧の両方を重視した設計', '価格が手頃'],
    cons: ['手元止水ボタンはありません', '水流の切り替えはありません'],
    recommendFor: '手頃な価格で、節水しながら水圧の弱さも改善したい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00t3zto.d8zuee14.g00t3zto.d8zuf2f4/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Firisplaza-r%2F7270523%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Firisplaza-r%2Fi%2F10160046%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/irisplaza-r/cabinet/tasya115/7270523-y.jpg?_ex=300x300',
    enabled: true,
    attributes: { waterPressure: 4, waterSaving: 4, lightness: 4, sprayVariety: 1, convenience: 2, fineBubble: false, stopButton: false },
  },
  {
    // タカギ キモチイイバブルシャワピタ JSB023BW / 220g / 節水 約40%（当社製品JS115比）/ ウルトラファインバブル / 手元止水 / 4,378円（ホワイトSKU）（2026-09-25 確認）
    id: 'shower-head-104',
    name: 'タカギ キモチイイバブルシャワピタ JSB023BW',
    category: 'shower-head',
    description: 'ウルトラファインバブル機能を備えたシャワーヘッド。手元でバブルのON/OFFと止水ができます。',
    priceRange: 2,
    features: ['ファインバブル機能（ウルトラファインバブル）', '節水 約40%（当社製品比）', '手元止水ボタン', 'スクリーンを外して洗える', '本体 220g'],
    pros: ['ファインバブル機能付きとしては手頃な価格', '手元で止水できる'],
    cons: ['本体は220gで、軽さ重視の人には重めです', '水流の切り替えはありません（バブルのON/OFFのみ）'],
    recommendFor: '手頃な価格でファインバブル機能と手元止水を両方ほしい人',
    caution: TAKAGI_CAUTION,
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00ty6no.d8zue158.g00ty6no.d8zuf563/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ftakagi-official%2Fjsb023bw%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Ftakagi-official%2Fi%2F10000053%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/takagi-official/cabinet/sku/jsb023bw_sku001.jpg?_ex=300x300',
    enabled: true,
    attributes: { waterPressure: 2, waterSaving: 3, lightness: 2, sprayVariety: 1, convenience: 3, fineBubble: true, stopButton: true },
  },
  {
    // アラミック シルクシャワーシリーズ03 高節水 SSS-03 / 本体160g / 節水 50〜70%（当社比）/ 増圧 / 手元止水 / 5,401円（価格帯の境界付近）（2026-09-25 確認）
    id: 'shower-head-105',
    name: 'アラミック シルクシャワーシリーズ03 高節水 SSS-03',
    category: 'shower-head',
    description: '精密散水板で節水と増圧をうたうシャワーヘッドに、手元止水と水量調節を加えたモデル。本体は160gです。',
    priceRange: 2,
    features: ['節水 50〜70%（当社比・水量調節による）', '増圧（水圧の低い家庭向けと公式に記載）', '手元止水ボタン', '水量調節', '本体 160g'],
    pros: ['節水と水圧の両方を重視した設計', '手元で止水できる', '比較的軽い'],
    cons: ['水流の切り替えはありません（水量調節のみ）'],
    recommendFor: '節水・水圧・手元止水をバランスよく求める人',
    caution: BALANCE_CAUTION_ARROMIC,
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00r8mvo.d8zued00.g00r8mvo.d8zuf260/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fr-kojima%2F4967934602839%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fr-kojima%2Fi%2F11545278%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/r-kojima/cabinet/n0000001255/4967934602839_1.jpg?_ex=300x300',
    enabled: true,
    attributes: { waterPressure: 4, waterSaving: 4, lightness: 3, sprayVariety: 1, convenience: 3, fineBubble: false, stopButton: true },
  },
  {
    // SANEI ミストストップシャワーヘッド PS3062-80XA / 246g / 節水率50%（SANEI基準・ストップボタン併用時）/ ノーマル・ミストの2水流 / 手元止水 / 5,467円（価格帯の境界付近）（2026-09-25 確認）
    id: 'shower-head-106',
    name: 'SANEI ミストストップシャワーヘッド PS3062-80XA',
    category: 'shower-head',
    description: 'ノーマル水流とミスト水流を手元のレバーで切り替えられるシャワーヘッド。手元のストップボタンで止水できます。',
    priceRange: 2,
    features: ['水流 2種類（ノーマル・ミスト）', '手元レバーで水流切替', '手元止水ボタン', '節水率 50%（ストップボタン併用時）', '本体 246g'],
    pros: ['手頃な価格で水流を使い分けられる', '手元で止水できる'],
    cons: ['本体は246gと重めです', 'サーモ混合栓・シングルレバー混合栓用で、ツーバルブ混合栓には取り付けできません'],
    recommendFor: '手頃な価格で、ミストなど水流の使い分けと手元止水がほしい人',
    caution: SANEI_MIST_CAUTION,
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pw4vo.d8zuebe5.g00pw4vo.d8zuf95f/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkurashi-arl%2Fps3062-80xa%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fkurashi-arl%2Fi%2F10028060%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/kurashi-arl/cabinet/sanei-suisen/ps3062-80xa_02.jpg?_ex=300x300',
    enabled: true,
    attributes: { waterPressure: 2, waterSaving: 3, lightness: 2, sprayVariety: 2, convenience: 3, fineBubble: false, stopButton: true },
  },
  {
    // アラミック 3Dアースシャワー・ヘッドスパ 3D-B1A / 本体257g / 節水 約60%（当社比・2水流を同時間使用）/ 増圧 / 2水流 / 手元止水 / 角度調整 / 7,678円（2026-09-25 確認）
    id: 'shower-head-107',
    name: 'アラミック 3Dアースシャワー・ヘッドスパ 3D-B1A',
    category: 'shower-head',
    description: '勢いの強い「ヘッドスパ水流」と極細の「コンフォート水流」をワンノックで切り替えられるシャワーヘッド。ヘッドの角度を上下・左右に動かせます。',
    priceRange: 3,
    features: ['節水 約60%（当社比）', '水流 2種類（ワンノック切替）', '手元止水ボタン', 'ヘッドの角度調整（上下48°・左右360°）', '増圧（水圧の低い家庭向けと公式に記載）', '本体 257g'],
    pros: ['節水率が高い', '手元止水・角度調整・水流切替と機能が多い', '水圧の低い家庭向けの設計'],
    cons: ['本体は257gと重めです'],
    recommendFor: '節水と水圧を重視しつつ、手元止水や角度調整などの機能もほしい人',
    caution: BALANCE_CAUTION_ARROMIC,
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pwe4o.d8zuedf7.g00pwe4o.d8zufbe3/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Faichaku%2F65037100%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Faichaku%2Fi%2F10001553%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/aichaku/cabinet/photo/65037100.jpg?_ex=300x300',
    enabled: true,
    attributes: { waterPressure: 4, waterSaving: 5, lightness: 1, sprayVariety: 2, convenience: 4, fineBubble: false, stopButton: true },
  },
  {
    // ボリーナ ワイド TK-7007（公式限定カラー TK-7007-PA ワイドパール。仕様はTK-7007と共通）/ 140g / 節水 最大約50% / ウルトラファインバブル / 止水なし / 8,085円（2026-09-25 確認）
    id: 'shower-head-108',
    name: 'ボリーナ ワイド TK-7007（ワイドパール）',
    category: 'shower-head',
    description: '本体140gの軽量なウルトラファインバブルシャワーヘッド。シャワー板を外して清掃できます。',
    priceRange: 3,
    features: ['ファインバブル機能（ウルトラファインバブル）', '本体 140g', '節水 最大約50%', 'シャワー板を外して清掃', '水流 1種類'],
    pros: ['ファインバブル機能付きで本体が軽い'],
    cons: ['手元止水ボタンはありません', '水圧が極端に低い場所では勢いが弱くなる場合があります（推奨圧力0.15MPa以上）'],
    recommendFor: 'ファインバブル機能がほしく、軽さも重視したい人',
    caution: TKS_CAUTION,
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00s5lso.d8zued57.g00s5lso.d8zuf82d/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ftks01%2Ftk-7007-pa%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Ftks01%2Fi%2F10000175%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/tks01/cabinet/2023_newthum/wide-pearl/230927_wpearl_sum03.jpg?_ex=300x300',
    enabled: true,
    attributes: { waterPressure: 2, waterSaving: 3, lightness: 4, sprayVariety: 1, convenience: 2, fineBubble: true, stopButton: false },
  },
  {
    // アイリスオーヤマ MiCOLA SH-M01（シェルホワイト SH-M01-W）/ 約223g / 節水 最大50%（ミストクレンズ時）/ 3水流 / ウルトラファインバブル / 手元止水 / 9,080円（公式楽天店の画像はジェットモデルのため、SH-M01の画像のショップを選択）（2026-09-25 確認）
    id: 'shower-head-109',
    name: 'アイリスオーヤマ MiCOLA ウルトラファインバブル クレンジングシャワーヘッド SH-M01',
    category: 'shower-head',
    description: 'ウルトラファインバブル機能を備え、ミスト・バブル・ストレートの3つの水流を切り替えられるシャワーヘッド。手元で止水できます。',
    priceRange: 3,
    features: ['ファインバブル機能（ウルトラファインバブル）', '水流 3種類', '手元止水ボタン（完全止水ではありません）', '節水 最大50%（ミストクレンズ使用時）', '本体 約223g'],
    pros: ['ファインバブル機能と3種類の水流を両方使える', '手元で止水できる'],
    cons: ['本体は約223gと重めです', '価格はやや高めです'],
    recommendFor: 'ファインバブル機能に加えて、水流の使い分けや手元止水もほしい人',
    caution: IRIS_CAUTION,
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00uibmo.d8zue23e.g00uibmo.d8zuf654/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmizuwaonline%2F10125%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fmizuwaonline%2Fi%2F10000102%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/mizuwaonline/cabinet/10242255/12909737/12909739/imgrc0113120658.jpg?_ex=300x300',
    enabled: true,
    attributes: { waterPressure: 2, waterSaving: 3, lightness: 2, sprayVariety: 3, convenience: 2, fineBubble: true, stopButton: true },
  },
  {
    // ReFa FINE BUBBLE U（止水ボタンなしの「U」・ホワイト RS-BH-02A）/ 約300g / 節水 最大約49%（ミストモード時）/ 4水流 / ウルトラファインバブル / 30,000円（2026-09-25 確認）
    id: 'shower-head-110',
    name: 'ReFa FINE BUBBLE U（リファファインバブル U）',
    category: 'shower-head',
    description: 'ウルトラファインバブル機能を備え、4つの水流モードをスライドレバーで切り替えられるシャワーヘッド。',
    priceRange: 4,
    features: ['ファインバブル機能（ウルトラファインバブル）', '水流 4種類（スライドレバーで切替）', '節水 最大約49%（ミストモード使用時）', '本体 約300g'],
    pros: ['水流の種類が多い', 'ファインバブル機能付き'],
    cons: ['本体は約300gと重めです', '手元止水ボタンはありません（止水ボタン付きは別モデルのU+）', '価格は高めです'],
    recommendFor: 'ファインバブル機能と多くの水流の使い分けを重視し、予算に余裕がある人',
    caution: REFA_CAUTION,
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00r20go.d8zue0c2.g00r20go.d8zufe62/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmtgec-beauty%2F1579320101%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fmtgec-beauty%2Fi%2F10002177%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/mtgec-beauty/cabinet/refa/refa_fbu_p/imgrc0118795028.jpg?_ex=300x300',
    enabled: true,
    attributes: { waterPressure: 2, waterSaving: 3, lightness: 1, sprayVariety: 4, convenience: 2, fineBubble: true, stopButton: false },
  },
]

export const showerHead: Diagnosis = {
  id: 'shower-head',
  slug: 'shower-head',
  name: 'シャワーヘッド診断',
  itemName: 'シャワーヘッド',
  group: 'life',
  icon: '🚿',
  shortDescription: '水圧・節水・軽さ・水流の種類・手元止水・予算から、あなたに合うシャワーヘッドを診断。',
  intro:
    '家庭用の交換式シャワーヘッドを選ぶ診断です。一番重視すること、今のシャワーで気になること、水流の使い分け、手元止水、本体の重さ、予算の6つの質問から、あなたに合いそうなシャワーヘッドを相性順に表示します。',
  seo: {
    title: 'シャワーヘッド診断｜質問に答えてあなたに合うシャワーヘッドをチェック',
    description:
      'シャワーヘッドを無料診断。水圧・節水・軽さ・水流の種類・手元止水・予算など6つの質問に答えるだけで、メーカー公式の仕様をもとに、あなたに合う交換用シャワーヘッドが分かります。',
  },
  priceLabels: {
    1: '〜3,000円',
    2: '3,000〜6,000円',
    3: '6,000〜12,000円',
    4: '12,000円〜',
  },
  questions: [
    {
      id: 'priority',
      text: '一番重視することは？',
      shortLabel: '重視すること',
      weight: 24,
      options: [
        { id: 'pressure', label: '水圧', summary: '水圧を重視', effects: [{ type: 'atLeast', attr: 'waterPressure', value: 5 }] },
        { id: 'saving', label: '節水', summary: '節水を重視', effects: [{ type: 'atLeast', attr: 'waterSaving', value: 5 }] },
        { id: 'bubble', label: 'ファインバブル機能', summary: 'ファインバブル機能を希望', effects: [{ type: 'equals', attr: 'fineBubble', value: true }] },
        { id: 'light', label: '軽さ・扱いやすさ', summary: '軽さ・扱いやすさを重視', effects: [{ type: 'atLeast', attr: 'lightness', value: 5 }] },
        {
          id: 'multi',
          label: '多機能さ',
          summary: '多機能さを重視',
          effects: [
            { type: 'atLeast', attr: 'sprayVariety', value: 5 },
            { type: 'atLeast', attr: 'convenience', value: 5 },
          ],
        },
      ],
    },
    {
      id: 'concern',
      text: '今のシャワーで気になることは？',
      shortLabel: '気になること',
      weight: 16,
      options: [
        { id: 'weak', label: '水圧が弱い', summary: '今の水圧が弱い', effects: [{ type: 'atLeast', attr: 'waterPressure', value: 4 }] },
        { id: 'bill', label: '水道代が気になる', summary: '水道代が気になる', effects: [{ type: 'atLeast', attr: 'waterSaving', value: 4 }] },
        { id: 'heavy', label: 'ヘッドが重い', summary: '今のヘッドが重い', effects: [{ type: 'atLeast', attr: 'lightness', value: 4 }] },
        { id: 'none', label: '特に不満なし', effects: [] },
      ],
    },
    {
      id: 'spray',
      text: '水流（ストレート・ミストなど）の使い分けは？',
      shortLabel: '水流の使い分け',
      weight: 14,
      options: [
        { id: 'one', label: '1種類で十分', effects: [] },
        { id: 'few', label: '2〜3種類ほしい', summary: '水流を2〜3種類使い分けたい', effects: [{ type: 'atLeast', attr: 'sprayVariety', value: 2 }] },
        { id: 'many', label: '多くの水流を使い分けたい', summary: '多くの水流を使い分けたい', effects: [{ type: 'atLeast', attr: 'sprayVariety', value: 4 }] },
      ],
    },
    {
      id: 'stop',
      text: '手元で水を止められるボタン（手元止水）は？',
      shortLabel: '手元止水',
      help: '給湯器の種類によっては、手元止水の使用に注意が必要な場合があります。',
      weight: 14,
      options: [
        { id: 'want', label: '欲しい', summary: '手元止水が欲しい', effects: [{ type: 'equals', attr: 'stopButton', value: true }] },
        { id: 'without', label: 'ないほうがよい', summary: '手元止水はないほうがよい', effects: [{ type: 'equals', attr: 'stopButton', value: false }] },
        { id: 'any', label: 'こだわらない', effects: [] },
      ],
    },
    {
      id: 'weight',
      text: '本体の重さはどのくらい気にしますか？',
      shortLabel: '本体の重さ',
      weight: 12,
      options: [
        { id: 'light', label: '軽さをかなり重視', summary: '軽さをかなり重視', effects: [{ type: 'atLeast', attr: 'lightness', value: 4 }] },
        { id: 'normal', label: 'ほどほど', summary: '重すぎないものがいい', effects: [{ type: 'atLeast', attr: 'lightness', value: 3 }] },
        { id: 'any', label: '気にしない', effects: [] },
      ],
    },
    budgetQuestion({
      text: '予算は？',
      weight: 20,
      bands: [
        { label: '3,000円以下', summary: '予算3,000円以下' },
        { label: '6,000円以下', summary: '予算6,000円以下' },
        { label: '12,000円以下', summary: '予算12,000円以下' },
      ],
      // 「高価格の商品を希望する」ではなく「予算の上限を実質設けない」という意味。価格では採点しない
      noLimitLabel: '12,000円以上でもOK',
      // 予算は上限条件：予算内の商品を通常ランキングにし、足りないときだけ予算を超える商品を別枠に表示
      asLimit: true,
    }),
  ],
  products,
  // 完全同点の並べ方、一部だけ一致したときの理由文の表現、1位が60%未満のときの説明（既存診断と同じ）
  scoring: {
    tieBreak: true,
    softenPartialReason: true,
    lowMatchNotice: '条件をすべて満たす商品が少ないため、近い候補を表示しています。',
  },
  guide: {
    title: 'シャワーヘッドの選び方',
    intro: 'この診断は、家庭用の交換式シャワーヘッドを対象に、メーカー公式の仕様をもとに以下のポイントとあなたの回答を照らし合わせて相性を計算しています。',
    sections: [
      {
        heading: 'まずは取り付けできるか確認',
        body: 'シャワーヘッドは水栓メーカーによって接続部分の形が異なります。付属アダプターで対応している水栓メーカーと、使えない給湯器・水栓（バランス釜など）を、購入前に必ずメーカーの対応表で確認しましょう。',
      },
      {
        heading: '水圧と節水',
        body: '散水板の穴を小さくして節水するタイプは、水の勢いを強く感じやすい傾向があります。節水率はメーカーごとに比較対象や測定条件が違うため、数値は目安として比べましょう。',
      },
      {
        heading: '水流の種類・手元止水',
        body: '水流を切り替えられるタイプは、体を洗うときや浴室の掃除など使い分けができます。手元止水は給湯器の種類によって使用に注意が必要な場合があるため、取扱説明書を確認しましょう。',
      },
      {
        heading: '重さ',
        body: 'ヘッドが軽いほど、手に持ったときやフックに掛けるときの負担が小さくなります。この診断では、ホースやアダプターを含まないヘッド本体の重さで比べています。',
      },
      {
        heading: 'ファインバブル機能',
        body: 'ファインバブル（ウルトラファインバブル・マイクロバブル）機能は、この診断では機能の有無だけを扱い、肌や髪への効果は評価していません。',
      },
    ],
  },
  notice:
    '取り付けできるかどうかは、水栓や給湯器の種類によって変わります。購入前に必ずメーカーの対応表・取扱説明書をご確認ください。本診断は使い方や好みからシャワーヘッドの候補を探すためのもので、肌や髪、健康への効果を保証するものではありません。',
  enabled: true,
}

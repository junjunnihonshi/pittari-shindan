import type { Diagnosis, Product } from '../../types/diagnosis.ts'
import { budgetQuestion } from './shared.ts'

/**
 * スーツケース診断
 *
 * 【対象範囲】旅行用のキャスター付きハードタイプのスーツケース（キャリーケース）。
 *   対象外：ソフトタイプ（布製）、子ども用、アウトドア専用、トランク型インテリア、キャスターなしバッグ、ビジネスバッグ主体の商品
 *   ハードタイプに絞る理由：ソフトタイプは丈夫さを生地と骨組みで見る必要があり、シェル・補強・試験で見るハードタイプと同じ基準で比べられないため
 *
 * 商品の attributes（評価項目）。数値は 1〜5（採点基準：data/rakuten-candidates/suitcase/scoring-criteria.md）
 *   capacity   : 容量（メーカー公式のL表記。1: 40L以下 / 2: 41〜55L / 3: 56〜75L / 4: 76〜95L / 5: 96L以上）。大きいほど良いのではなく、旅行日数・荷物量との近さで採点する
 *   lightness  : 軽さ（公式重量を容量帯 S・M・L ごとの基準で判定。容量の違う商品を絶対重量だけで比べない）
 *   durability : 丈夫さ（公式の耐久試験・補強構造・2年以上の保証の数で判定。素材名だけでは加点しない）
 *   mobility   : キャスターの動かしやすさ・静かさ（8輪／4輪、具体的な構造、公式の試験・数値で判定。「静音」の表記だけでは加点しない）
 * true / false の項目（「あるとうれしい」好みとして加点する。非対応でもランキングから外さない）
 *   expandable   : 拡張機能
 *   frontOpen    : フロントオープン（前開き）
 *   wheelStopper : キャスターストッパー
 * 価格帯（priceRange）は priceLabels を参照（1: 〜15,000円 / 2: 〜30,000円 / 3: 〜50,000円 / 4: 50,000円〜）。
 *   区分はメーカー公式情報を確認できるハードタイプの価格相場（2〜9万円台に集中）に合わせて v1.1 で補正（商品分布を均等にする目的ではない）
 *
 * 機内持ち込みについて
 *   航空会社・座席数・重量で条件が異なるため、適格条件にも加点にも使わない（公式外寸は評価ファイルに記録する）。
 *   容量評価 1（40L以下）と大きく重なるため、採点は旅行日数・荷物量（容量）で行う。
 *
 * 【並び順のルール】（共通エンジンの設定）
 *   - Q6 予算：予算内の商品を通常ランキングの候補にする（上限条件。50,000円以上でもOK は上限なし）
 *   - 通常ランキングが3件に満たないときだけ、予算を少し超える商品を別枠に表示する
 *   - 相性スコアが完全に同じときは、回答に関係する一致度 → 評価値 → 商品ID の順で並べる（scoring.tieBreak）
 *
 * 商品はメーカー公式情報で評価した実商品9機種（2026-09-25 確認）。根拠は data/rakuten-candidates/suitcase/product-evaluations.json。
 */

/** 楽天の商品画像（300×300） */
const img = (path: string) => `https://thumbnail.image.rakuten.co.jp/@0_mall/${path}?_ex=300x300`
/** 機内持ち込みサイズの目安内の商品に表示する注意（「機内持ち込み可」とは断定しない） */
const CARRY_ON_CAUTION = '外寸は一般的な機内持ち込みサイズの目安内ですが、機内持ち込みの可否は航空会社・座席数・重量によって異なります。航空会社の規定を確認してください。'

/** 商品データ（実商品9機種。評価値はメーカー公式情報に基づく：data/rakuten-candidates/suitcase/product-evaluations.json、採点基準 v1.1） */
const products: Product[] = [
  {
    // LEGEND WALKER 5082 ファスナータイプ 60cm / 5082-60 / 5,540円（2026-09-25 確認。公式価格18,480円）
    // 楽天の出品は全色が同じJAN（公式の 5082-60-BK：4560136191882）で登録。型番・サイズは公式と一致
    id: 'suitcase-101',
    name: 'LEGEND WALKER 5082 ファスナータイプ 60cm',
    category: 'suitcase',
    description: 'ファスナーでマチを約5cm広げられる拡張機能付きのスーツケース。容量61L（拡張時72L）、重さ約3.8kgです。',
    priceRange: 1,
    features: ['容量 61L（拡張時72L）', '重さ 3.8kg', '拡張機能', 'コーナーパッド付き'],
    pros: ['手頃な価格', '帰りに荷物が増えても容量を広げられる', 'メーカー独自の品質基準（落下・キャスター走行などの試験）を適用'],
    cons: ['キャスターは4輪（ダブルキャスターではありません）', 'キャスターストッパーはありません'],
    recommendFor: '5〜7泊の旅行を手頃な価格で準備したい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00q4y5o.d8zue5a2.g00q4y5o.d8zufa1f/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmarienamaki%2Fw-5082-60%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fmarienamaki%2Fi%2F10002005%2F',
    imageUrl: img('marienamaki/cabinet/hardcase/5082/5082_thumb02.jpg'),
    enabled: true,
    attributes: { capacity: 3, lightness: 4, durability: 4, mobility: 2, expandable: true, frontOpen: false, wheelStopper: false },
  },
  {
    // LEGEND WALKER 5122 フレームタイプ 62cm / 5122-62 / 12,030円（2026-09-25 確認。公式価格29,480円）
    // 楽天SKUの色名は「ローズゴールド」だが JAN 4562131657172 は公式の 5122-62-CB（カーボン）。型番・サイズは一致
    id: 'suitcase-102',
    name: 'LEGEND WALKER 5122 フレームタイプ 62cm',
    category: 'suitcase',
    description: '開閉部が金属フレームのフレームタイプ。容量68L、ダブルキャスター（合計8輪）を備えた5〜7泊向けのスーツケースです。',
    priceRange: 1,
    features: ['容量 68L', '重さ 5.0kg', '金属フレーム', 'ダブルキャスター（8輪）'],
    pros: ['フレームタイプで開け閉めがしっかりしている', 'ダブルキャスターで安定して転がしやすい', 'メーカー独自の品質基準（落下・キャスター走行などの試験）を適用'],
    cons: ['同じ容量のファスナータイプより重めです（5.0kg）', '拡張機能・キャスターストッパーはありません'],
    recommendFor: '手頃な価格で、丈夫なフレームタイプを選びたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00q4y5o.d8zue5a2.g00q4y5o.d8zufa1f/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmarienamaki%2F10000106%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fmarienamaki%2Fi%2F10000106%2F',
    imageUrl: img('marienamaki/cabinet/off_thumbnail/12135450/5122_thumb_m.jpg'),
    enabled: true,
    attributes: { capacity: 3, lightness: 2, durability: 4, mobility: 4, expandable: false, frontOpen: false, wheelStopper: false },
  },
  {
    // innovator INV50 38L / INV50 / 23,980円（2026-09-25 確認）/ 外寸 55×35×25cm（3辺115cm）
    id: 'suitcase-103',
    name: 'innovator INV50 38L',
    category: 'suitcase',
    description: '前面から出し入れできるフロントスペースを備えた38Lのスーツケース。日乃本製の静音双輪キャスターとブレーキ機能付きです。',
    priceRange: 2,
    features: ['容量 38L', '重さ 3.3kg', 'フロントオープン', 'キャスターストッパー（ブレーキ）', 'HINOMOTO Lisof 双輪キャスター'],
    pros: ['前面からノートPCや荷物を出し入れできる', '静音の双輪キャスターで転がしやすい', 'メーカー2年保証'],
    cons: ['拡張機能はありません', '同じくらいの容量の軽量モデルよりやや重めです（3.3kg）'],
    recommendFor: '1〜2泊の旅行や出張で、移動中も荷物を出し入れしたい人',
    caution: CARRY_ON_CAUTION,
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pjcyo.d8zueff8.g00pjcyo.d8zuf9af/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fselection%2Finv50-2%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fselection%2Fi%2F10015011%2F',
    imageUrl: img('selection/cabinet/innovator-new/inv50-2_4.jpg'),
    enabled: true,
    attributes: { capacity: 1, lightness: 3, durability: 4, mobility: 4, expandable: false, frontOpen: true, wheelStopper: true },
  },
  {
    // innovator INV155 55L / INV155 / 25,080円（2026-09-25 確認）
    id: 'suitcase-104',
    name: 'innovator INV155 55L',
    category: 'suitcase',
    description: 'B4サイズが入るフロントポケットを備えた55Lのスーツケース。ポケットの仕切りを開けると大きく開き、日乃本製の静音双輪キャスターとブレーキ機能付きです。',
    priceRange: 2,
    features: ['容量 55L', '重さ 3.9kg', 'フロントオープン', 'キャスターストッパー（ブレーキ）', 'HINOMOTO Lisof 双輪キャスター'],
    pros: ['前面から荷物を出し入れできる', '静音の双輪キャスターで転がしやすい', 'メーカー2年保証'],
    cons: ['拡張機能はありません'],
    recommendFor: '3〜4泊の旅行や出張で、使い勝手のよい標準サイズを選びたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pjcyo.d8zueff8.g00pjcyo.d8zuf9af/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fselection%2Finv155%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fselection%2Fi%2F10016430%2F',
    imageUrl: img('selection/cabinet/innovator-new/inv155_4.jpg'),
    enabled: true,
    attributes: { capacity: 2, lightness: 4, durability: 4, mobility: 4, expandable: false, frontOpen: true, wheelStopper: true },
  },
  {
    // A.L.I MAX BOX フロントオープン 55L / ALI-8511-22 / 19,580円（2026-09-25 確認）
    id: 'suitcase-105',
    name: 'A.L.I MAX BOX フロントオープン 55L',
    category: 'suitcase',
    description: 'PC収納ポケットを備えたフロントオープンの55Lスーツケース。ダブルキャスターと前輪フットストッパー付きです。',
    priceRange: 2,
    features: ['容量 55L', '重さ 3.7kg', 'フロントオープン', 'キャスターストッパー（前輪）', 'ダブルキャスター'],
    pros: ['前面から荷物を出し入れできる', 'ストッパーで電車内や坂道でも止めておける', '機能のわりに手頃な価格'],
    cons: ['拡張機能はありません', '保証期間や耐久試験の情報は公式ページに記載がありません'],
    recommendFor: '手頃な価格で、フロントオープンとストッパーの両方が欲しい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pjcyo.d8zueff8.g00pjcyo.d8zuf9af/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fselection%2Fali-8511-22%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fselection%2Fi%2F10018726%2F',
    imageUrl: img('selection/cabinet/item57/ali-8511-22_1.jpg'),
    enabled: true,
    attributes: { capacity: 2, lightness: 4, durability: 2, mobility: 3, expandable: false, frontOpen: true, wheelStopper: true },
  },
  {
    // American Tourister インスタゴン スピナー69 エキスパンダブル / HJ4 / 21,450円（2026-09-25 確認。公式店35%OFFセール、通常33,000円でも価格帯2）
    id: 'suitcase-106',
    name: 'American Tourister インスタゴン スピナー69 エキスパンダブル',
    category: 'suitcase',
    description: '容量79L（拡張時87L）で重さ約3.9kgの大容量スーツケース。振動を軽減するサスペンションホイールと拡張機能を備えています。',
    priceRange: 2,
    features: ['容量 79L（拡張時87L）', '重さ 3.9kg', '拡張機能', 'サスペンションホイール'],
    pros: ['大容量のわりに軽い', '帰りに荷物が増えても容量を広げられる', 'メーカー保証（条件付き3年）'],
    cons: ['キャスターストッパーはありません', '大きいので電車や階段では扱いにくい場合があります'],
    recommendFor: '1週間程度の旅行で、軽くて大きめのスーツケースが欲しい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pz92o.d8zue838.g00pz92o.d8zuf2d2/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fsamsonite%2Fhj4-012%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fsamsonite%2Fi%2F10003094%2F',
    imageUrl: img('samsonite/cabinet/instagon/hj4-016_2.jpg'),
    enabled: true,
    attributes: { capacity: 4, lightness: 5, durability: 3, mobility: 2, expandable: true, frontOpen: false, wheelStopper: false },
  },
  {
    // Samsonite シーライト スピナー55 エキスパンダブル / 134679 / 34,999円（2026-09-25 確認）/ 外寸 55×40×20cm（3辺115cm、拡張時は奥行23cm）
    id: 'suitcase-107',
    name: 'Samsonite シーライト スピナー55 エキスパンダブル',
    category: 'suitcase',
    description: 'Curv（カーヴ）素材を使った重さ約2.1kgの小型スーツケース。容量36L（拡張時42L）で、ダブルホイールを備えています。',
    priceRange: 3,
    features: ['容量 36L（拡張時42L）', '重さ 2.1kg', '拡張機能', 'ダブルホイール'],
    pros: ['小型の中でもとても軽い', '帰りに荷物が増えても容量を広げられる', 'メーカー保証（条件付き10年）'],
    cons: ['キャスターストッパー・フロントオープンはありません', '拡張すると奥行きが増え、機内持ち込みサイズの目安を超えます'],
    recommendFor: '1〜2泊の旅行で、軽さを最優先したい人',
    caution: CARRY_ON_CAUTION,
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00ps5uo.d8zuef58.g00ps5uo.d8zufb88/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fglv%2Fsn9-bm%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fglv%2Fi%2F10100227%2F',
    imageUrl: img('glv/cabinet/allsix21/sn9-bm_1.jpg'),
    enabled: true,
    attributes: { capacity: 1, lightness: 5, durability: 3, mobility: 3, expandable: true, frontOpen: false, wheelStopper: false },
  },
  {
    // Samsonite シーライト スピナー75 / 122861 / 46,999円（2026-09-25 確認。50,000円の境界に注意）
    id: 'suitcase-108',
    name: 'Samsonite シーライト スピナー75',
    category: 'suitcase',
    description: 'Curv（カーヴ）素材を使った容量94Lの大型スーツケース。重さは約2.8kgで、ダブルホイールを備えています。',
    priceRange: 3,
    features: ['容量 94L', '重さ 2.8kg', 'ダブルホイール', 'Curv（カーヴ）素材'],
    pros: ['大容量なのにとても軽い', 'メーカー保証（条件付き10年）'],
    cons: ['拡張機能・キャスターストッパーはありません', '価格は高めです'],
    recommendFor: '長期の旅行で、大容量でも軽さを重視したい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00ry8xo.d8zued45.g00ry8xo.d8zuf2a6/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Falude%2Fk01372%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Falude%2Fi%2F10115915%2F',
    imageUrl: img('alude/cabinet/lpitem/samsonite03/k01372_1n.jpg'),
    enabled: true,
    attributes: { capacity: 4, lightness: 5, durability: 3, mobility: 3, expandable: false, frontOpen: false, wheelStopper: false },
  },
  {
    // PROTECA スタリアCXR 82L / 02353 / 82,500円（2026-09-25 確認）
    id: 'suitcase-109',
    name: 'PROTECA スタリアCXR 82L',
    category: 'suitcase',
    description: '日本製のプロテカの82Lスーツケース。サイレントキャスターとベアリング内蔵のベアロンホイール、キャスターストッパーを備えています。',
    priceRange: 4,
    features: ['容量 82L', '重さ 4.1kg', 'キャスターストッパー', 'サイレントキャスター＋ベアロンホイール', '日本製'],
    pros: ['メーカーの品質管理研究所で落下・キャスター走行などの試験を実施', 'メーカー製品保証10年', 'ストッパーで電車内や坂道でも止めておける'],
    cons: ['価格は高めです', '拡張機能はありません'],
    recommendFor: '長期の旅行や飛行機での預け入れが多く、丈夫さと保証を重視したい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00qlfdo.d8zue7f0.g00qlfdo.d8zuf920/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Face-store%2F02353%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Face-store%2Fi%2F10008103%2F',
    imageUrl: img('ace-store/cabinet/item2023/proteca/02353.jpg'),
    enabled: true,
    attributes: { capacity: 4, lightness: 5, durability: 4, mobility: 3, expandable: false, frontOpen: false, wheelStopper: true },
  },
]

/** 荷物の入れやすさ：フロントオープンと拡張機能の両方で満点、どちらか一方で 0.7 */
const packingEase = (p: Product) => {
  const n = Number(p.attributes.frontOpen === true) + Number(p.attributes.expandable === true)
  return n >= 2 ? 1 : n === 1 ? 0.7 : 0
}
/** 便利機能：拡張・フロントオープン・ストッパーのうち2つ以上で満点、1つで 0.7 */
const convenience = (p: Product) => {
  const n = Number(p.attributes.expandable === true) + Number(p.attributes.frontOpen === true) + Number(p.attributes.wheelStopper === true)
  return n >= 2 ? 1 : n === 1 ? 0.7 : 0
}

export const suitcase: Diagnosis = {
  id: 'suitcase',
  slug: 'suitcase',
  name: 'スーツケース診断',
  itemName: 'スーツケース',
  group: 'travel',
  icon: '🧳',
  shortDescription: '重視すること・旅行日数・移動スタイル・荷物量・便利機能・予算から、あなたに合うスーツケースを診断。',
  intro:
    '旅行用のハードタイプのスーツケースを選ぶ診断です。一番重視すること、旅行日数、移動スタイル、荷物量、便利機能、予算の6つの質問から、あなたに合いそうなスーツケースを相性順に表示します。',
  seo: {
    title: 'スーツケース診断｜質問に答えてあなたに合うスーツケースをチェック',
    description:
      'スーツケースを無料診断。軽さ・丈夫さ・キャスター・旅行日数・移動スタイル・拡張機能・フロントオープン・予算など6つの質問に答えるだけで、あなたに合うスーツケースが分かります。',
  },
  priceLabels: {
    1: '〜15,000円',
    2: '15,000〜30,000円',
    3: '30,000〜50,000円',
    4: '50,000円〜',
  },
  questions: [
    {
      id: 'priority',
      text: '一番重視することは？',
      shortLabel: '重視すること',
      weight: 22,
      options: [
        { id: 'light', label: '軽さ', summary: '軽さを重視', effects: [{ type: 'atLeast', attr: 'lightness', value: 5 }] },
        { id: 'tough', label: '丈夫さ', summary: '丈夫さを重視', effects: [{ type: 'atLeast', attr: 'durability', value: 5 }] },
        { id: 'mobility', label: 'キャスターの動かしやすさ・静かさ', summary: 'キャスターの動かしやすさ・静かさを重視', effects: [{ type: 'atLeast', attr: 'mobility', value: 5 }] },
        { id: 'packing', label: '荷物の入れやすさ', summary: '荷物の入れやすさを重視', effects: [{ type: 'custom', score: packingEase }] },
        { id: 'convenience', label: '便利機能', summary: '便利機能を重視', effects: [{ type: 'custom', score: convenience }] },
      ],
    },
    {
      id: 'nights',
      text: 'よく行く旅行の日数は？',
      shortLabel: '旅行日数',
      // 容量は旅行日数との近さで採点する（大容量ほど高得点にはしない）
      weight: 20,
      options: [
        { id: 'n1', label: '1〜2泊', summary: '1〜2泊の旅行', effects: [{ type: 'near', attr: 'capacity', value: 1 }] },
        { id: 'n3', label: '3〜4泊', summary: '3〜4泊の旅行', effects: [{ type: 'near', attr: 'capacity', value: 2 }] },
        { id: 'n5', label: '5〜7泊', summary: '5〜7泊の旅行', effects: [{ type: 'near', attr: 'capacity', value: 3 }] },
        { id: 'n8', label: '1週間以上', summary: '1週間以上の旅行', effects: [{ type: 'atLeast', attr: 'capacity', value: 4 }] },
      ],
    },
    {
      id: 'transport',
      text: '主な移動スタイルは？',
      shortLabel: '移動スタイル',
      weight: 14,
      options: [
        {
          id: 'train',
          label: '電車・徒歩が多い',
          summary: '電車・徒歩での移動が多い',
          // 階段や駅構内での持ち上げ・長い距離の走行を想定
          effects: [
            { type: 'atLeast', attr: 'mobility', value: 4 },
            { type: 'atLeast', attr: 'lightness', value: 4 },
          ],
        },
        // 預け入れを想定して丈夫さを見る。機内持ち込みの可否は航空会社ごとに異なるため採点しない
        { id: 'plane', label: '飛行機が多い', summary: '飛行機での移動が多い', effects: [{ type: 'atLeast', attr: 'durability', value: 4 }] },
        { id: 'car', label: '車移動が多い', effects: [] },
        { id: 'any', label: '特に決まっていない', effects: [] },
      ],
    },
    {
      id: 'amount',
      text: '荷物の量は？',
      shortLabel: '荷物量',
      // 旅行日数に対して一回り小さい／大きいサイズも候補になるよう、ゆるく加点する
      weight: 12,
      options: [
        { id: 'less', label: '少なめ', summary: '荷物は少なめ', effects: [{ type: 'atMost', attr: 'capacity', value: 2 }] },
        { id: 'normal', label: '普通', effects: [] },
        { id: 'more', label: '多め', summary: '荷物は多め', effects: [{ type: 'atLeast', attr: 'capacity', value: 3 }] },
      ],
    },
    {
      id: 'feature',
      text: 'あるとうれしい便利機能は？',
      shortLabel: '便利機能',
      // 便利機能は「あるとうれしい」好みとして加点する（非対応の商品もランキングから外さない）
      weight: 10,
      options: [
        { id: 'none', label: '特に不要', effects: [] },
        { id: 'expand', label: '拡張機能', summary: '拡張機能があるとうれしい', effects: [{ type: 'equals', attr: 'expandable', value: true }] },
        { id: 'front', label: 'フロントオープン', summary: 'フロントオープンがあるとうれしい', effects: [{ type: 'equals', attr: 'frontOpen', value: true }] },
        { id: 'stopper', label: 'キャスターストッパー', summary: 'キャスターストッパーがあるとうれしい', effects: [{ type: 'equals', attr: 'wheelStopper', value: true }] },
      ],
    },
    budgetQuestion({
      text: '予算は？',
      weight: 16,
      bands: [
        { label: '15,000円以下', summary: '予算15,000円以下' },
        { label: '30,000円以下', summary: '予算30,000円以下' },
        { label: '50,000円以下', summary: '予算50,000円以下' },
      ],
      // 「高価格の商品を希望する」ではなく「予算の上限を実質設けない」という意味。価格では採点しない
      noLimitLabel: '50,000円以上でもOK',
      // 予算は上限条件：予算内の商品を通常ランキングにし、足りないときだけ予算を少し超える商品を別枠に表示
      asLimit: true,
    }),
  ],
  products,
  // 完全同点の並べ方と、複数条件の回答で一部だけ一致したときの理由文の表現（モバイルバッテリー診断と同じ）
  scoring: {
    tieBreak: true,
    softenPartialReason: true,
    // 1位が60%未満のときだけ表示（採点・順位・相性%は変えない）
    lowMatchNotice: '条件をすべて満たす商品が少ないため、近い候補を表示しています。',
  },
  guide: {
    title: 'スーツケースの選び方',
    intro: 'この診断は、旅行用のハードタイプのスーツケースを対象に、メーカー公式の仕様をもとに以下のポイントとあなたの回答を照らし合わせて相性を計算しています。',
    sections: [
      {
        heading: '容量の目安',
        body: '旅行日数に合った容量を選ぶのが基本です。大きすぎると重く、移動もしにくくなります。',
        points: ['1〜2泊：40L以下', '3〜4泊：41〜55L', '5〜7泊：56〜75L', '1週間以上：76L以上'],
      },
      { heading: '軽さ', body: '容量が大きいほど重くなるため、同じくらいの容量の商品どうしで重さを比べましょう。電車や徒歩での移動が多いなら、軽さとキャスターの動かしやすさが大切です。' },
      { heading: '丈夫さ', body: '素材名だけでなく、フレームやコーナーの補強、メーカーの耐久試験、保証期間も確認しましょう。飛行機で預けることが多いなら、丈夫さを重視すると安心です。' },
      { heading: 'キャスター', body: 'ダブルキャスター（8輪）は安定して転がしやすい傾向があります。静かさは、キャスターの構造やメーカーの試験・数値で確認しましょう。' },
      { heading: '機内持ち込みサイズ', body: '機内持ち込みの条件は、航空会社や座席数によって異なります。キャスターやハンドルを含む3辺の合計と重量を、利用する航空会社で必ず確認しましょう。' },
      { heading: '便利機能', body: '拡張機能は帰りに荷物が増えるときに、フロントオープンは旅先で荷物を出し入れするときに、キャスターストッパーは電車内や坂道で便利です。' },
    ],
  },
  notice: '機内持ち込みの可否は、航空会社・座席数・重量などの条件によって異なります。ご利用の航空会社の規定を確認してください。',
  enabled: true,
}

import type { Diagnosis, Product } from '../../types/diagnosis.ts'
import { budgetQuestion } from './shared.ts'

/**
 * 電気毛布診断
 *
 * 【対象範囲】家庭用の電気毛布（掛け毛布・敷き毛布・掛け敷き兼用・ひざ掛け／肩掛け）。
 *   対象外：ホットカーペット、こたつ、電気あんか、USB給電の小物、電気なしの着る毛布、業務用、公式仕様を確認できない商品
 *
 * 商品の attributes（評価項目）。数値は 1〜5（採点基準：data/rakuten-candidates/electric-blanket/scoring-criteria.md）
 *   warmth      : 暖かさの目安（公式の最高設定時の表面温度。消費電力だけでは比べない）
 *   softness    : 肌触り（公式に明記された素材：両面起毛・ボアなど）
 *   washability : 洗いやすさ（洗濯機で丸洗い・コントローラーの取り外しが公式に明記されているか）
 *   ecoFeatures : 節電につながる機能の数（室温センサー・タイマー／自動オフなど。W数では判定しない）
 *   functions   : 機能性（タイマー・ダニ退治・室温センサー・細かな温度調節などの数）
 *   tempControl : 温度調節の細かさ（無段階・段階数。公式に段階数の記載がなければ 2）
 *   sizeRank    : サイズ（1 コンパクト / 2 標準 / 3 大きめ。用途ごとに公式の寸法で判定）
 * true / false の項目（公式の製品区分・仕様から機械的に決める）
 *   useKake / useShiki / useBoth / useLap : 掛け・敷き・掛け敷き兼用・ひざ掛けとして使える
 *   sizeStd / sizeLarge : 標準以上 / 大きめ
 *   machineWash / timer / mite / sensor : 洗濯機で丸洗い・タイマー（自動オフ）・ダニ退治・室温センサー
 *   lapWide : ひざ掛け・肩掛けで公式の長さが 140cm 以上（大判）
 * 価格帯（priceRange）は priceLabels を参照（1: 〜5,000円 / 2: 〜8,000円 / 3: 8,000円〜）。
 *   区分は公式確認した実商品の価格分布に合わせて採点基準 v1.1 で1回だけ見直したもの（結果を均等にする目的ではない）
 *
 * 【並び順のルール】（共通エンジンの設定）
 *   - Q1 使い方・Q2 サイズ：使えない組み合わせの商品を上位に出さないため、用途・サイズを適格条件（eligibility）にする
 *   - Q2 サイズの選択肢は Q1 で切り替える（掛け・敷き・兼用：コンパクト/標準/大きめ、ひざ掛け：コンパクト/大判）
 *   - Q7 予算：予算内の商品を通常ランキングの候補にする（上限条件）
 *   - 通常ランキングが3件に満たないときだけ、条件を満たさない商品を別枠に表示する
 *   - 相性スコアが完全に同じときは、回答に関係する一致度 → 評価値 → 商品ID の順で並べる（scoring.tieBreak）
 *
 * 商品はメーカー公式情報で評価した実商品11機種（2026-09-27 確認）。根拠は data/rakuten-candidates/electric-blanket/product-evaluations.json。
 */

/** 商品データ（実商品11機種。評価値はメーカー公式情報に基づく：data/rakuten-candidates/electric-blanket/product-evaluations.json、採点基準 v1） */
const products: Product[] = [
  {
    // 椙山紡織 電気敷毛布 ロングサイズ NA-08SL / 約180×85cm（1.53㎡・敷き） / 4,289円（2026-09-27 確認）
    id: 'electric-blanket-101',
    name: '椙山紡織 電気敷毛布 ロングサイズ NA-08SL',
    category: 'electric-blanket',
    description: '長さ180cmのロングサイズ電気敷毛布。ダニ退治と室温センサーを備えた日本製です。',
    priceRange: 1,
    features: ['敷き毛布 約180×85cm（ロング）', '表面温度 強 約52℃', 'ダニ退治', '室温センサー', '丸洗いOK', '頭寒足熱配線'],
    pros: ['手頃な価格でロングサイズ', '背の高い人や足元までしっかり敷ける'],
    cons: ['掛け毛布としては使えません', 'タイマーはありません', '洗濯機で洗えるかは公式ページに記載がありません'],
    recommendFor: '手頃な価格で、全身を敷いて暖めたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00qct7o.d8zue74f.g00qct7o.d8zuf85d/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fedenki%2Fed1148693%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fedenki%2Fi%2F18340029%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/edenki/cabinet/newimg0161/ed1148693.jpg?_ex=300x300',
    enabled: true,
    attributes: { warmth: 4, softness: 3, washability: 3, ecoFeatures: 2, functions: 3, tempControl: 2, sizeRank: 3, useKake: false, useShiki: true, useBoth: false, useLap: false, sizeStd: true, sizeLarge: true, machineWash: false, timer: false, mite: true, sensor: true, lapWide: false },
  },
  {
    // 椙山紡織 電気掛敷兼用毛布 NA-013K / 約188×130cm（2.44㎡） / 4,380円（2026-09-27 確認）
    id: 'electric-blanket-102',
    name: '椙山紡織 電気掛敷兼用毛布 NA-013K',
    category: 'electric-blanket',
    description: '掛けても敷いても使える188×130cmの電気毛布。ダニ退治と室温センサーを備えた日本製です。',
    priceRange: 1,
    features: ['掛け敷き兼用 約188×130cm', '表面温度 強 約52℃', 'ダニ退治', '室温センサー', '丸洗いOK', '頭寒足熱配線'],
    pros: ['手頃な価格で掛けても敷いても使える', '室温センサーで冷え込みに合わせて調節'],
    cons: ['タイマーはありません', '洗濯機で洗えるかは公式ページに記載がありません'],
    recommendFor: '手頃な価格で、掛け・敷きどちらにも使える定番の電気毛布がほしい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00qvevo.d8zue57a.g00qvevo.d8zufb66/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkadenrand%2F7117940%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fkadenrand%2Fi%2F10151727%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/kadenrand/cabinet/tasya21/7117940_1.jpg?_ex=300x300',
    enabled: true,
    attributes: { warmth: 4, softness: 3, washability: 3, ecoFeatures: 2, functions: 3, tempControl: 2, sizeRank: 2, useKake: true, useShiki: true, useBoth: true, useLap: false, sizeStd: true, sizeLarge: false, machineWash: false, timer: false, mite: true, sensor: true, lapWide: false },
  },
  {
    // 椙山紡織 電気ひざ掛け NA-055H / 約140×82cm（ひざ掛け） / 4,980円（2026-09-27 確認）
    id: 'electric-blanket-103',
    name: '椙山紡織 電気ひざ掛け NA-055H',
    category: 'electric-blanket',
    description: '140×82cmの大きめの電気ひざ掛け。肩に掛けても使え、ダニ退治と室温センサーを備えています。',
    priceRange: 1,
    features: ['ひざ掛け 約140×82cm', '表面温度 強 約52℃', 'ダニ退治', '室温センサー', '丸洗いOK'],
    pros: ['ひざ掛けとしては大判で肩掛けにも使いやすい', '室温センサー付き'],
    cons: ['寝具（掛け・敷き毛布）としての用途ではありません', 'タイマーはありません', '洗濯機で洗えるかは公式ページに記載がありません'],
    recommendFor: 'デスクやソファで、ひざから肩までしっかり暖めたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00q4jmo.d8zue02d.g00q4jmo.d8zuf7a0/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkaden-sakura%2F4582214083537%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fkaden-sakura%2Fi%2F10062144%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/kaden-sakura/cabinet/gazou07/na-055h-rt.jpg?_ex=300x300',
    enabled: true,
    attributes: { warmth: 4, softness: 3, washability: 3, ecoFeatures: 2, functions: 3, tempControl: 2, sizeRank: 1, useKake: false, useShiki: false, useBoth: false, useLap: true, sizeStd: false, sizeLarge: false, machineWash: false, timer: false, mite: true, sensor: true, lapWide: true },
  },
  {
    // ライフジョイ 電気ひざ掛け 120サイズ JPN121 / 約120×62cm / 4,990円（2026-09-27 確認）
    id: 'electric-blanket-104',
    name: 'ライフジョイ 電気ひざ掛け 120サイズ JPN121',
    category: 'electric-blanket',
    description: '120×62cmのコンパクトな電気ひざ掛け。コントローラーを外して洗濯機で洗えます。',
    priceRange: 1,
    features: ['ひざ掛け 約120×62cm', '表面温度 強 約40℃', '洗濯機で丸洗い可（コントローラーは外す）', 'ダニ退治', '質量 約0.7kg'],
    pros: ['洗濯機で洗える', '軽くて持ち運びやすい'],
    cons: ['楽天の商品ページで「約120cm×62cm」のSKUを選ぶ必要があります', '最高温度は約40℃と控えめです', 'タイマー・室温センサーはありません'],
    recommendFor: 'デスクワークや在宅勤務で、手軽に洗えるひざ掛けがほしい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00t1dwo.d8zueff3.g00t1dwo.d8zuf3b0/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Flifejoy-shop%2Fjbh161%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Flifejoy-shop%2Fi%2F10000093%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/lifejoy-shop/cabinet/13404851/imgrc0133863039.jpg?_ex=300x300',
    enabled: true,
    attributes: { warmth: 2, softness: 3, washability: 5, ecoFeatures: 1, functions: 2, tempControl: 2, sizeRank: 1, useKake: false, useShiki: false, useBoth: false, useLap: true, sizeStd: false, sizeLarge: false, machineWash: true, timer: false, mite: true, sensor: false, lapWide: false },
  },
  {
    // 椙山紡織 電気敷毛布 ロングサイズ ボア SB-SL104 / 約180×85cm（1.53㎡・敷き） / 5,800円（2026-09-27 確認）
    id: 'electric-blanket-105',
    name: '椙山紡織 電気敷毛布 ロングサイズ ボア SB-SL104',
    category: 'electric-blanket',
    description: '肌触りのよいボア生地を使った、長さ180cmのロングサイズ電気敷毛布。切り忘れ防止タイマー付きです。',
    priceRange: 2,
    features: ['敷き毛布 約180×85cm（ロング）', 'ボア生地', '切り忘れ防止タイマー', 'ダニ退治', '室温センサー', '表面温度 強 約52℃'],
    pros: ['ボア生地で肌触りがよい', 'タイマー・室温センサーなど機能が多い'],
    cons: ['掛け毛布としては使えません', '洗濯機で洗えるかは公式ページに記載がありません'],
    recommendFor: '肌触りのよい敷き毛布で、切り忘れも防ぎたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pii8o.d8zuea56.g00pii8o.d8zuf71a/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fakindo%2Fsb-sl104-be%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fakindo%2Fi%2F10208329%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/akindo/cabinet/l52/sb-sl104-be.jpg?_ex=300x300',
    enabled: true,
    attributes: { warmth: 4, softness: 5, washability: 3, ecoFeatures: 3, functions: 4, tempControl: 2, sizeRank: 3, useKake: false, useShiki: true, useBoth: false, useLap: false, sizeStd: true, sizeLarge: true, machineWash: false, timer: true, mite: true, sensor: true, lapWide: false },
  },
  {
    // ライフジョイ タイマー付電気掛け敷き毛布 JBK551G / 約188×130cm / 6,980円（2026-09-27 確認）
    id: 'electric-blanket-106',
    name: 'ライフジョイ タイマー付電気掛け敷き毛布 JBK551G',
    category: 'electric-blanket',
    description: '8時間で自動的に電源が切れる、掛け敷き兼用の電気毛布。コントローラーを外して洗濯機で洗えます。',
    priceRange: 2,
    features: ['掛け敷き兼用 約188×130cm', '8時間自動オフタイマー', '室温センサー', 'ダニ退治', '洗濯機で丸洗い可（コントローラーは外す）', '表面温度 強 約52℃'],
    pros: ['切り忘れを防ぐ自動オフ付き', '洗濯機で洗える'],
    cons: ['楽天の商品ページで「掛け敷き タイマー付」のSKUを選ぶ必要があります', 'タイマーの時間指定はできません（8時間で自動オフのみ）'],
    recommendFor: '掛け・敷き兼用で、洗いやすさと切り忘れ防止を両立したい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00t1dwo.d8zueff3.g00t1dwo.d8zuf3b0/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Flifejoy-shop%2Fjbs401%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Flifejoy-shop%2Fi%2F10000044%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/lifejoy-shop/cabinet/13404851/tmb_jbk551.jpg?_ex=300x300',
    enabled: true,
    attributes: { warmth: 4, softness: 3, washability: 5, ecoFeatures: 3, functions: 4, tempControl: 2, sizeRank: 2, useKake: true, useShiki: true, useBoth: true, useLap: false, sizeStd: true, sizeLarge: false, machineWash: true, timer: true, mite: true, sensor: true, lapWide: false },
  },
  {
    // コイズミ 電気肩ひざ掛け KDH-50237 / 約150×93cm（房含む） / 6,990円（2026-09-27 確認）
    id: 'electric-blanket-107',
    name: 'コイズミ 電気肩ひざ掛け KDH-50237',
    category: 'electric-blanket',
    description: '腕通しスリットとボタンで、羽織るようにも使える電気肩ひざ掛け。温度は無段階で調節できます。',
    priceRange: 2,
    features: ['肩ひざ掛け 約150×93cm', '無段階の温度調節', '腕通しスリット・ボタン付き', 'ダニ退治', '洗濯機で丸洗い可（コントローラーは外す）', '中央表面温度 約42℃'],
    pros: ['温度を細かく調節できる', '羽織って使えるので作業中も動きやすい'],
    cons: ['最高温度は約42℃と控えめです', 'タイマー・室温センサーはありません'],
    recommendFor: '在宅ワークやソファで、羽織りながら温度を細かく調節したい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00rdq6o.d8zue1a4.g00rdq6o.d8zufe76/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fcoconial%2Fkdh5087%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fcoconial%2Fi%2F10005378%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/coconial/cabinet/commodity/k/k3/kdh50237_800.jpg?_ex=300x300',
    enabled: true,
    attributes: { warmth: 2, softness: 3, washability: 5, ecoFeatures: 1, functions: 3, tempControl: 5, sizeRank: 1, useKake: false, useShiki: false, useBoth: false, useLap: true, sizeStd: false, sizeLarge: false, machineWash: true, timer: false, mite: true, sensor: false, lapWide: true },
  },
  {
    // 山善 電気敷毛布 フランネル YMS-F33P / 140×80cm（1.12㎡・敷き） / 7,980円（2026-09-27 確認）
    id: 'electric-blanket-108',
    name: '山善 電気敷毛布 フランネル YMS-F33P',
    category: 'electric-blanket',
    description: '表面はフランネル、裏面はもこもこのプードルタッチ仕上げの電気敷毛布。洗濯機で洗えます。',
    priceRange: 2,
    features: ['敷き毛布 140×80cm', '表面フランネル・裏面プードルタッチ', '表面温度 強 約53℃', 'ダニ退治', '手洗い・毛布洗い可能な洗濯機で洗濯可'],
    pros: ['両面起毛で肌触りがよい', '洗濯機で洗える'],
    cons: ['楽天の商品ページで「140×80cm・ブラウン」のSKUを選ぶ必要があります', 'タイマー・室温センサーはありません'],
    recommendFor: 'シングル布団に敷いて、ふわふわの肌触りを楽しみたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00tlfdo.d8zuefb3.g00tlfdo.d8zufad3/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fyamazenkaden%2Fxp702%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fyamazenkaden%2Fi%2F10002648%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/yamazenkaden/cabinet/main-img/020/main-xp702tg.jpg?_ex=300x300',
    enabled: true,
    attributes: { warmth: 4, softness: 5, washability: 4, ecoFeatures: 1, functions: 2, tempControl: 2, sizeRank: 2, useKake: false, useShiki: true, useBoth: false, useLap: false, sizeStd: true, sizeLarge: false, machineWash: true, timer: false, mite: true, sensor: false, lapWide: false },
  },
  {
    // 椙山紡織 プレミアムボア電気掛敷兼用毛布 ワイド SB20KW06 / 約190×140cm（2.66㎡） / 8,480円（2026-09-27 確認）
    id: 'electric-blanket-109',
    name: '椙山紡織 プレミアムボア電気掛敷兼用毛布 ワイド SB20KW06',
    category: 'electric-blanket',
    description: '190×140cmのワイドサイズで、ボア生地の電気掛敷兼用毛布。抗菌・防臭・静電気抑制の素材を使っています。',
    priceRange: 3,
    features: ['掛け敷き兼用 約190×140cm（ワイド）', 'プレミアムボア生地', '抗菌・防臭・静電気抑制の素材', '表面温度 強 約52℃'],
    pros: ['ワイドサイズで2人でも使いやすい', 'ボア生地で肌触りがよい'],
    cons: ['洗濯・タイマー・ダニ退治について公式ページに記載がありません', '質量が約2.5kgと重め'],
    recommendFor: 'ダブルサイズなど大きめの寝具で、肌触りのよい電気毛布を使いたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pii8o.d8zuea56.g00pii8o.d8zuf71a/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fakindo%2Fsb20kw06-gy%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fakindo%2Fi%2F10179482%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/akindo/cabinet/l29/sb20kw06-gy.jpg?_ex=300x300',
    enabled: true,
    attributes: { warmth: 4, softness: 5, washability: 1, ecoFeatures: 1, functions: 1, tempControl: 2, sizeRank: 3, useKake: true, useShiki: true, useBoth: true, useLap: false, sizeStd: true, sizeLarge: true, machineWash: false, timer: false, mite: false, sensor: false, lapWide: false },
  },
  {
    // コイズミ 電気掛敷毛布 快眠タイマー KDK-75258T / 約188×120cm（2.26㎡） / 8,778円（2026-09-27 確認）
    id: 'electric-blanket-110',
    name: 'コイズミ 電気掛敷毛布 快眠タイマー KDK-75258T',
    category: 'electric-blanket',
    description: '寝始めと寝起きに合わせて通電する快眠タイマー付きの電気掛敷毛布。室温センサーとダニ退治も備えています。',
    priceRange: 3,
    features: ['掛け敷き兼用 約188×120cm', '快眠タイマー（8時間オフ）・12時間自動オフ', '室温センサー', 'ダニ退治', '抗菌防臭加工', '洗濯機で丸洗い可（コントローラーは外す）', '中央表面温度 強 約53℃'],
    pros: ['タイマー・室温センサー・ダニ退治など機能が多い', '洗濯機で洗える'],
    cons: ['温度調節の段階数は公式ページに記載がありません'],
    recommendFor: '寝ている間の暖めすぎや切り忘れを防ぎたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00tit6o.d8zuebed.g00tit6o.d8zuf23f/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fksdenki%2F4981747085023%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fksdenki%2Fi%2F10517929%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/ksdenki/cabinet/images/23_5/4981747085023_5.jpg?_ex=300x300',
    enabled: true,
    attributes: { warmth: 4, softness: 3, washability: 5, ecoFeatures: 3, functions: 4, tempControl: 2, sizeRank: 2, useKake: true, useShiki: true, useBoth: true, useLap: false, sizeStd: true, sizeLarge: false, machineWash: true, timer: true, mite: true, sensor: true, lapWide: false },
  },
  {
    // テクノス 洗える掛敷毛布 大判セミダブル EM-8015 / 200×140cm（2.80㎡） / 4,980円（2026-09-27 確認）
    id: 'electric-blanket-111',
    name: 'テクノス 洗える掛敷毛布 大判セミダブル EM-8015',
    category: 'electric-blanket',
    description: '200×140cmの大判セミダブルサイズで、掛けても敷いても使える電気毛布。ダニ退治機能付きで、洗えます。',
    priceRange: 1,
    features: ['掛け敷き兼用 200×140cm（大判セミダブル）', '表面温度 50℃（強）', 'ダニ退治', '洗える毛布', '温度調節'],
    pros: ['手頃な価格で大判サイズ', '2人で使いやすい大きさ'],
    cons: ['タイマー・室温センサーはありません', '洗濯機で洗えるかは公式ページに記載がありません'],
    recommendFor: '手頃な価格で、大きめの掛け敷き兼用毛布がほしい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pme3o.d8zue49c.g00pme3o.d8zufc5b/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ftantan%2F3135582%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Ftantan%2Fi%2F13331455%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/tantan/cabinet/m003/135/3135582.jpg?_ex=300x300',
    enabled: true,
    attributes: { warmth: 4, softness: 3, washability: 3, ecoFeatures: 1, functions: 2, tempControl: 2, sizeRank: 3, useKake: true, useShiki: true, useBoth: true, useLap: false, sizeStd: true, sizeLarge: true, machineWash: false, timer: false, mite: true, sensor: false, lapWide: false },
  },
]

/** サイズの選択肢の表示条件（Q1 使い方の回答で切り替える） */
const BED = { question: 'use', options: ['kake', 'shiki', 'both'] }
const LAP = { question: 'use', options: ['lap'] }

export const electricBlanket: Diagnosis = {
  id: 'electric-blanket',
  slug: 'electric-blanket',
  name: '電気毛布診断',
  itemName: '電気毛布',
  group: 'life',
  icon: '🛌',
  shortDescription: '使い方・サイズ・重視点・温度調節・お手入れ・機能・予算から、あなたに合う電気毛布を診断。',
  intro:
    '家庭用の電気毛布を選ぶ診断です。使い方、サイズ、重視すること、温度調節、お手入れ、欲しい機能、予算の7つの質問から、あなたに合いそうな電気毛布・電気ひざ掛けを相性順に表示します。',
  seo: {
    title: '電気毛布おすすめ診断｜質問であなたに合う電気毛布をチェック',
    description:
      '掛け・敷き・ひざ掛けなどの使い方、サイズ、温度調節、お手入れ、予算から、あなたに合う電気毛布を診断します。',
  },
  priceLabels: {
    1: '〜5,000円',
    2: '5,000〜8,000円',
    3: '8,000円〜',
  },
  questions: [
    {
      id: 'use',
      text: '主な使い方は？',
      shortLabel: '使い方',
      // 使えない用途の商品を上位に出さないため、公式の製品区分を適格条件にする（採点には使わない）
      weight: 14,
      options: [
        {
          id: 'kake',
          label: '掛け毛布として',
          summary: '掛け毛布として使う',
          effects: [],
          eligibility: { attr: 'useKake', value: true, notice: '掛け毛布として使える電気毛布からおすすめを表示しています。', supplementLabel: '掛け毛布としては使えません' },
        },
        {
          id: 'shiki',
          label: '敷き毛布として',
          summary: '敷き毛布として使う',
          effects: [],
          eligibility: { attr: 'useShiki', value: true, notice: '敷き毛布として使える電気毛布からおすすめを表示しています。', supplementLabel: '敷き毛布としては使えません' },
        },
        {
          id: 'both',
          label: '掛けも敷きも（両用）',
          summary: '掛け・敷きの両方に使う',
          effects: [],
          eligibility: { attr: 'useBoth', value: true, notice: '掛け敷き兼用の電気毛布からおすすめを表示しています。', supplementLabel: '掛け敷き兼用ではありません' },
        },
        {
          id: 'lap',
          label: 'ひざ掛け・デスク用',
          summary: 'ひざ掛け・デスクで使う',
          effects: [],
          eligibility: { attr: 'useLap', value: true, notice: '電気ひざ掛け・肩掛けからおすすめを表示しています。', supplementLabel: 'ひざ掛け用ではありません' },
        },
      ],
    },
    {
      id: 'size',
      text: 'サイズは？',
      shortLabel: 'サイズ',
      help: '使い方に合わせたサイズの選択肢を表示しています。',
      weight: 12,
      options: [
        // 掛け・敷き・掛け敷き兼用のサイズ（標準・大きめは、その大きさ以上の商品に絞り込む）
        { id: 'compact', label: '1人用コンパクト', summary: 'コンパクトなものがいい', effects: [{ type: 'atMost', attr: 'sizeRank', value: 2 }], showWhen: BED },
        {
          id: 'standard',
          label: '標準（シングル布団など）',
          summary: '標準サイズがいい',
          effects: [],
          eligibility: { attr: 'sizeStd', value: true, notice: '標準サイズ以上の電気毛布からおすすめを表示しています。', supplementLabel: '標準サイズより小さめです' },
          showWhen: BED,
        },
        {
          id: 'large',
          label: '大きめ（ロング・ワイド）',
          summary: '大きめのサイズがいい',
          effects: [],
          eligibility: { attr: 'sizeLarge', value: true, notice: 'ロング・ワイドなど大きめの電気毛布からおすすめを表示しています。', supplementLabel: '大きめサイズではありません' },
          showWhen: BED,
        },
        // ひざ掛けのサイズ（どちらもひざ掛けとして使えるため、絞り込まずに相性で比べる）
        { id: 'lapSmall', label: 'コンパクト（ひざ用・120cm前後）', summary: 'コンパクトなひざ掛けがいい', effects: [{ type: 'equals', attr: 'lapWide', value: false }], showWhen: LAP },
        { id: 'lapWide', label: '大判（140cm以上・肩掛けにも）', summary: '大判のひざ掛けがいい', effects: [{ type: 'equals', attr: 'lapWide', value: true }], showWhen: LAP },
      ],
    },
    {
      id: 'priority',
      text: '一番重視することは？',
      shortLabel: '重視すること',
      weight: 22,
      options: [
        { id: 'warmth', label: '暖かさ', summary: '暖かさを重視', effects: [{ type: 'atLeast', attr: 'warmth', value: 4 }] },
        { id: 'soft', label: '肌触り', summary: '肌触りを重視', effects: [{ type: 'atLeast', attr: 'softness', value: 5 }] },
        { id: 'wash', label: '洗いやすさ', summary: '洗いやすさを重視', effects: [{ type: 'atLeast', attr: 'washability', value: 5 }] },
        { id: 'eco', label: '節電につながる機能', summary: '節電につながる機能を重視', effects: [{ type: 'atLeast', attr: 'ecoFeatures', value: 3 }] },
        { id: 'function', label: '機能性', summary: '機能性を重視', effects: [{ type: 'atLeast', attr: 'functions', value: 4 }] },
      ],
    },
    {
      id: 'temp',
      text: '温度調節はどのくらい細かくしたい？',
      shortLabel: '温度調節',
      weight: 10,
      options: [
        { id: 'simple', label: 'シンプルでよい', effects: [] },
        { id: 'fine', label: '細かく調節したい', summary: '温度を細かく調節したい', effects: [{ type: 'atLeast', attr: 'tempControl', value: 4 }] },
      ],
    },
    {
      id: 'care',
      text: 'お手入れで重視することは？',
      shortLabel: 'お手入れ',
      weight: 12,
      options: [
        { id: 'wash', label: '洗濯機で丸洗いしたい', summary: '洗濯機で丸洗いしたい', effects: [{ type: 'equals', attr: 'machineWash', value: true }] },
        { id: 'any', label: '特にこだわらない', effects: [] },
      ],
    },
    {
      id: 'feature',
      text: '欲しい機能は？',
      shortLabel: '欲しい機能',
      weight: 12,
      options: [
        { id: 'timer', label: 'タイマー・自動オフ', summary: 'タイマーが欲しい', effects: [{ type: 'equals', attr: 'timer', value: true }] },
        { id: 'mite', label: 'ダニ対策', summary: 'ダニ対策機能が欲しい', effects: [{ type: 'equals', attr: 'mite', value: true }] },
        { id: 'sensor', label: '室温センサー', summary: '室温センサーが欲しい', effects: [{ type: 'equals', attr: 'sensor', value: true }] },
        { id: 'any', label: '特になし', effects: [] },
      ],
    },
    budgetQuestion({
      text: '予算は？',
      weight: 14,
      bands: [
        { label: '5,000円以下', summary: '予算5,000円以下' },
        { label: '8,000円以下', summary: '予算8,000円以下' },
      ],
      // 「高価格の商品を希望する」ではなく「予算の上限を実質設けない」という意味。価格では採点しない
      noLimitLabel: '8,000円以上でもOK',
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
    title: '電気毛布の選び方',
    intro: 'この診断は、家庭用の電気毛布を対象に、メーカー公式の仕様をもとに以下のポイントとあなたの回答を照らし合わせて相性を計算しています。',
    sections: [
      {
        heading: '使い方で選ぶ',
        body: '電気毛布には、掛け専用・敷き専用・掛け敷き兼用・ひざ掛けがあります。敷き専用は掛け毛布としては使えないため、使い方に合った種類を選びましょう。',
      },
      {
        heading: 'サイズ',
        body: '敷き毛布は140×80cm前後、掛け敷き兼用は188×130cm前後が一般的です。背の高い人や2人で使う場合は、ロング・ワイドサイズも検討しましょう。',
      },
      {
        heading: '暖かさの目安',
        body: '暖かさは、メーカーが公表している最高設定時の表面温度を目安にしています。消費電力（W）は大きさによっても変わるため、この診断では消費電力だけで暖かさを比べていません。',
      },
      {
        heading: 'お手入れ',
        body: '洗濯機で洗える電気毛布でも、コントローラーを外す、毛布洗いができる洗濯機を使う、ドラム式は使えないなどの条件があります。洗う前に取扱説明書を確認しましょう。',
      },
      { heading: '機能', body: '切り忘れを防ぐ自動オフタイマー、ダニ退治、室温に合わせて調節する室温センサーなどの機能があります。必要な機能があるか確認しましょう。' },
    ],
  },
  notice:
    '表面温度・消費電力などはメーカーの公表値です。電気毛布は折りたたんだまま使わず、取扱説明書に沿って安全にお使いください。本診断は使い方や好みから電気毛布の候補を探すためのもので、暖かさや電気代を保証するものではありません。',
  enabled: true,
}

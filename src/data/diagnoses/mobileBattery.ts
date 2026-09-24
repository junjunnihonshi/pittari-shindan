import type { Diagnosis, Product } from '../../types/diagnosis.ts'
import { budgetQuestion } from './shared.ts'

/**
 * モバイルバッテリー診断
 *
 * 【対象範囲】日常的に持ち歩くモバイルバッテリー（スマートフォン・ワイヤレスイヤホン・タブレット、必要に応じてノートPC）。
 *   対象外：ポータブル電源、車載専用品、乾電池式、ソーラーチャージャー主体の商品、業務用の大型電源
 *
 * 商品の attributes（評価項目）。数値は 1〜5 で、大きいほどその点に優れています。
 *   capacity    : 容量（公称容量 mAh から判定）
 *   outputPower : 出力（1ポートあたりの最大出力 W から判定。充電の速さ・タブレット対応に使う）
 *   lightness   : 軽さ・持ち運びやすさ（公式の重量から判定。コンパクトさも重量で代表する）
 *   multiDevice : 複数機器の充電しやすさ（出力ポート数と同時充電の可否・合計出力から判定）
 * true / false の項目
 *   laptopOk     : ノートPCの充電に使える（USB-C 出力の条件は採点基準を参照）。Q2「ノートPCも充電したい」の適格条件
 *   builtInCable : ケーブルを内蔵している（Q1・Q5 の好みとして加点）
 *   wireless     : マグネット式・ワイヤレス充電に対応している（Q1・Q5 の好みとして加点）
 * 価格帯（priceRange）は priceLabels を参照（1: 〜3,000円 / 2: 〜6,000円 / 3: 〜10,000円 / 4: 10,000円〜）。
 *
 * 評価軸の整理（候補から統合したもの）
 *   - compactness（コンパクトさ）は lightness に統合（寸法の公表条件がメーカーごとに異なり、重量で代表できるため）
 *   - portFlexibility（ポートの種類）は multiDevice に統合
 *   - 便利機能（複数台同時充電・ケーブル内蔵・ワイヤレス）は「あるとうれしい」好みとして加点する（ランキングから外さない）
 *
 * 【並び順のルール】（共通エンジンの設定）
 *   - Q2「ノートPCも充電したい」だけは適格条件（eligibility）。ノートPCの充電に使えない商品は通常ランキングに出さない
 *   - Q6 予算：予算内の商品を通常ランキングの候補にする（上限条件。10,000円以上でもOK は上限なし）
 *   - 通常ランキングが3件に満たないときだけ、条件を満たさない商品を別枠に表示する
 *   - 相性スコアが完全に同じときは、回答に関係する一致度 → 評価値 → 商品ID の順で並べる（scoring.tieBreak）
 *
 * 商品はメーカー公式情報で評価した実商品10機種（2026-09-24 確認）。根拠は data/rakuten-candidates/mobile-battery/product-evaluations.json。
 */

/** 楽天の商品画像（300×300） */
const img = (path: string) => `https://thumbnail.image.rakuten.co.jp/@0_mall/${path}?_ex=300x300`
/** 楽天アフィリエイトURL（商品ページとスマホ版ページ） */
const rakuten = (id: string, shop: string, item: string, mobileId: string) =>
  `https://hb.afl.rakuten.co.jp/hgc/${id}/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2F${shop}%2F${item}%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2F${shop}%2Fi%2F${mobileId}%2F`
const AFL = { motteru: 'g00tzklo.d8zuefb1.g00tzklo.d8zuf3c4', anker: 'g00rr09o.d8zue50e.g00rr09o.d8zuf491', ecoflow: 'g00tzcjo.d8zue71c.g00tzcjo.d8zuf367', ugreen: 'g00u0fbo.d8zue39d.g00u0fbo.d8zuf4de' }
/** マグネット式ワイヤレス充電の対応機種の注意 */
const MAGNET_CAUTION = 'マグネット式ワイヤレス充電は、MagSafe・Qi2に対応したスマートフォンで使えます。お使いの機種が対応しているか確認してください。'

/** 商品データ（実商品10機種。評価値はメーカー公式情報に基づく） */
const products: Product[] = [
  {
    // MOTTERU mocolon 5,000mAh PD20W / MOT-MB5001-EC / 2,980円（2026-09-24 確認。3,000円の境界に注意）
    // 評価の根拠：data/rakuten-candidates/mobile-battery/product-evaluations.json（採点基準 scoring-criteria.md v1.1）
    id: 'mobile-battery-101',
    name: 'MOTTERU mocolon モバイルバッテリー 5,000mAh PD20W',
    category: 'mobile-battery',
    description: '重さ約98gの5,000mAhモバイルバッテリー。USB-C（最大20W）とUSB-Aの2ポートを備えています。',
    priceRange: 1,
    features: ['5,000mAh', 'USB-C 最大20W（USB PD）', '重さ 約98g', 'USB-C・USB-Aの2ポート'],
    pros: ['とても軽く、ポケットにも入れやすい', '2台同時に充電できる', '手頃な価格'],
    cons: ['容量は多くありません（5,000mAh）', '2台同時に使うと合計5V/3A出力になります'],
    recommendFor: '軽さを優先して、スマホの充電切れに備えたい人',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.motteru, 'motteru', 'mot-mb5001ec', '10000078'),
    imageUrl: img('motteru/cabinet/shouhin/mot-mb5001_thr1.jpg'),
    enabled: true,
    attributes: { capacity: 2, outputPower: 3, lightness: 5, multiDevice: 3, laptopOk: false, builtInCable: false, wireless: false },
  },
  {
    // MOTTERU モバイルバッテリー 10000mAh PD18W / MOT-MB10001 / 1,980円（2026-09-24 確認）
    id: 'mobile-battery-102',
    name: 'MOTTERU モバイルバッテリー 10,000mAh PD18W',
    category: 'mobile-battery',
    description: '10,000mAhで重さ約174gのコンパクトなモバイルバッテリー。USB-C（最大18W）とUSB-Aの2ポートです。',
    priceRange: 1,
    features: ['10,000mAh', 'USB-C 最大18W（USB PD）', '重さ 約174g', 'USB-C・USB-Aの2ポート'],
    pros: ['10,000mAhでも軽く持ち歩きやすい', '2台同時に充電できる', '手頃な価格'],
    cons: ['最大出力は18Wで、急速充電の速さは控えめです', '2台同時に使うと合計5V/3A出力になります'],
    recommendFor: '手頃な価格で、軽さと容量のバランスがよいものが欲しい人',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.motteru, 'motteru', 'mot-mb10001', '10000000'),
    imageUrl: img('motteru/cabinet/shouhin/mot-mb10001n_thr01.jpg'),
    enabled: true,
    attributes: { capacity: 3, outputPower: 2, lightness: 4, multiDevice: 3, laptopOk: false, builtInCable: false, wireless: false },
  },
  {
    // cheero Pocheri 5000mAh / CHE-126 / 2,980円（2026-09-24 確認。3,000円の境界に注意）
    // 予算3,000円以下の候補を3商品にするために追加（評価値は他商品と同じ採点基準 v1.1 で採点済み）
    id: 'mobile-battery-110',
    name: 'cheero Pocheri 5000mAh',
    category: 'mobile-battery',
    description: '重さ約104gのコンパクトな5,000mAhモバイルバッテリー。USB-C（最大18W）とUSB-Aの2ポートを備えています。',
    priceRange: 1,
    features: ['5,000mAh', 'USB-C 最大18W（USB PD）', '重さ 約104g', 'USB-C・USB-Aの2ポート'],
    pros: ['軽くて小さく、持ち歩きやすい', '2台同時に充電できる', '手頃な価格'],
    cons: ['容量は多くありません（5,000mAh）', '2台同時に使うと最大5V/3A出力になります'],
    recommendFor: '小さく軽いモバイルバッテリーを手頃な価格で選びたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00rf0no.d8zueefc.g00rf0no.d8zuf7cd/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fcheeromart%2Fche-126%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fcheeromart%2Fi%2F10000333%2F',
    imageUrl: img('cheeromart/cabinet/productshots/04831560/che-126.jpg'),
    enabled: true,
    attributes: { capacity: 2, outputPower: 2, lightness: 5, multiDevice: 3, laptopOk: false, builtInCable: false, wireless: false },
  },
  {
    // Anker Zolo Power Bank (20000mAh, 45W, Built-In USB-C) / A1689013 / 4,490円（9/30までのセール価格。公式の通常価格5,990円。6,000円の境界に注意）
    id: 'mobile-battery-103',
    name: 'Anker Zolo Power Bank (20000mAh, 45W, Built-In USB-C)',
    category: 'mobile-battery',
    description: '20,000mAhの大容量で、USB-Cケーブルを内蔵したモバイルバッテリー。USB-Cは最大45W出力です。',
    priceRange: 2,
    features: ['20,000mAh', 'USB-C 最大45W', 'USB-Cケーブル内蔵', '重さ 約365g'],
    pros: ['大容量で何度も充電できる', 'ケーブルを別に持ち歩かなくてよい', '内蔵ケーブル・USB-C・USB-Aの3出力'],
    cons: ['重さは約365gあります', '複数の機器を同時に充電すると合計15W出力になります'],
    recommendFor: '旅行や出張で、大容量とケーブル内蔵の手軽さを両立したい人',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.anker, 'anker', 'a1689-1', '10002534'),
    imageUrl: img('anker/cabinet/listing/product/a1689-1/a1689-1_sub_1.jpg'),
    enabled: true,
    attributes: { capacity: 5, outputPower: 4, lightness: 2, multiDevice: 4, laptopOk: true, builtInCable: true, wireless: false },
  },
  {
    // Anker Nano Power Bank (10000mAh, 45W, 巻取り式 USB-C) / A1638 / 5,990円（9/30までのセール価格。公式の通常価格7,990円では priceRange 3。セール終了後に再確認）
    id: 'mobile-battery-104',
    name: 'Anker Nano Power Bank (10000mAh, 45W, 巻取り式 USB-Cケーブル)',
    category: 'mobile-battery',
    description: '巻取り式のUSB-Cケーブル（最大約70cm）を内蔵した10,000mAhモバイルバッテリー。最大45W出力です。',
    priceRange: 2,
    features: ['10,000mAh', 'USB-C 最大45W', '巻取り式USB-Cケーブル内蔵', '重さ 約230g'],
    pros: ['ケーブルを必要な長さだけ引き出せる', '45W出力で急速充電できる', '内蔵ケーブル・USB-C・USB-Aの3ポートを同時に使える'],
    cons: ['複数ポートを同時に使うと、各ポートの出力が下がります（2ポートで15W＋7.5W）'],
    recommendFor: 'ケーブル内蔵で、スマホからノートPCまで速く充電したい人',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.anker, 'anker', 'a1638', '10002461'),
    imageUrl: img('anker/cabinet/listing/product/a1638/a1638_sub_1.jpg'),
    enabled: true,
    attributes: { capacity: 3, outputPower: 4, lightness: 3, multiDevice: 4, laptopOk: true, builtInCable: true, wireless: false },
  },
  {
    // EcoFlow RAPID Power Bank (10K, 45W, ケーブル内蔵) / EF-RP45W10K（楽天型番 RP45W10K） / 4,899円（2026-09-24 確認）
    id: 'mobile-battery-105',
    name: 'EcoFlow RAPID Power Bank（10000mAh, 45W, ケーブル内蔵）',
    category: 'mobile-battery',
    description: '長さ約70cmの巻取り式USB-Cケーブルを内蔵した10,000mAhモバイルバッテリー。最大45W出力です。',
    priceRange: 2,
    features: ['10,000mAh', '最大45W', '巻取り式USB-Cケーブル内蔵（約70cm）', '重さ 約230g'],
    pros: ['ケーブルを別に持ち歩かなくてよい', '45W出力で急速充電できる', '残量を数字で表示できる'],
    cons: ['複数の機器を同時に充電したときの出力は公表されていません'],
    recommendFor: 'ケーブル内蔵の高出力モデルを手頃な価格で選びたい人',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.ecoflow, 'ecoflow', 'rp45w10k', '10000511'),
    imageUrl: img('ecoflow/cabinet/rapid/45w10k/1.jpg'),
    enabled: true,
    attributes: { capacity: 3, outputPower: 4, lightness: 3, multiDevice: 3, laptopOk: true, builtInCable: true, wireless: false },
  },
  {
    // UGREEN Nexode 100W モバイルバッテリー 20000mAh / 25188 / 9,999円（2026-09-24 確認。10,000円の境界に注意）
    id: 'mobile-battery-106',
    name: 'UGREEN Nexode 100W モバイルバッテリー 20000mAh',
    category: 'mobile-battery',
    description: 'USB-Cが最大100W出力の20,000mAhモバイルバッテリー。USB-C×2・USB-A×1の3ポートで、3台同時に充電できます。',
    priceRange: 3,
    features: ['20,000mAh', 'USB-C 最大100W', 'USB-C×2・USB-A×1', '重さ 約420g'],
    pros: ['ノートPCも急速充電できる', '複数ポートを使ってもUSB-C1は65W出力を維持', '3台同時に充電できる'],
    cons: ['重さは約420gあります', 'ケーブルは内蔵していません（充電ケーブルは付属）'],
    recommendFor: 'ノートPCを含めて、複数の機器をしっかり充電したい人',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.ugreen, 'ugreen-gear', '25188', '10000560'),
    imageUrl: img('ugreen-gear/cabinet/10470932/10482044/25188.jpg'),
    enabled: true,
    attributes: { capacity: 5, outputPower: 5, lightness: 2, multiDevice: 5, laptopOk: true, builtInCable: false, wireless: false },
  },
  {
    // Anker Power Bank (25000mAh, Built-In & 巻取り式USB-C) / A1695 / 12,490円（9/30までのセール価格。公式の通常価格17,990円でも priceRange 4）
    id: 'mobile-battery-107',
    name: 'Anker Power Bank (25000mAh, Built-In & 巻取り式USB-Cケーブル)',
    category: 'mobile-battery',
    description: '25,000mAhの大容量で、巻取り式と通常の2本のUSB-Cケーブルを内蔵。USB-Cは最大100W、合計で最大165W出力です。',
    priceRange: 4,
    features: ['25,000mAh', 'USB-C 最大100W（合計最大165W）', 'USB-Cケーブル2本内蔵', '重さ 約595g'],
    pros: ['ノートPCも急速充電できる', '内蔵ケーブル2本・USB-C・USB-Aの4出力', 'ケーブルを別に持ち歩かなくてよい'],
    cons: ['重さは約595gあり、毎日の持ち歩きには重めです', '価格は高めです'],
    recommendFor: 'ノートPCも含めて、1台でたくさん充電したい人',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.anker, 'anker', 'a1695', '10002313'),
    imageUrl: img('anker/cabinet/listing/product/a1695/a1695_sub_2.jpg'),
    enabled: true,
    attributes: { capacity: 5, outputPower: 5, lightness: 1, multiDevice: 5, laptopOk: true, builtInCable: true, wireless: false },
  },
  {
    // Anker Nano Power Bank (5000mAh, MagGo, Slim) / A1665 / 5,990円（9/30までのセール価格。公式の通常価格7,990円では priceRange 3。セール終了後に再確認）
    id: 'mobile-battery-108',
    name: 'Anker Nano Power Bank (5000mAh, MagGo, Slim)',
    category: 'mobile-battery',
    description: 'Qi2認証のマグネット式ワイヤレス充電（最大15W）に対応した、厚さ約8.6mmの5,000mAhモバイルバッテリーです。',
    priceRange: 2,
    features: ['5,000mAh', 'Qi2ワイヤレス充電 最大15W', 'USB-C 最大20W', '重さ 約122g・厚さ 約8.6mm'],
    pros: ['スマホに付けたままケーブルなしで充電できる', '薄くて軽い', 'ワイヤレスとUSB-Cを同時に使える'],
    cons: ['容量は多くありません（5,000mAh）', 'ワイヤレスとUSB-Cを同時に使うと出力が下がります'],
    recommendFor: 'ケーブルを使わず、スマホに付けて手軽に充電したい人',
    caution: MAGNET_CAUTION,
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.anker, 'anker', 'a1665', '10002418'),
    imageUrl: img('anker/cabinet/listing/product/a1665/a1665_sub_1.jpg'),
    enabled: true,
    attributes: { capacity: 2, outputPower: 3, lightness: 5, multiDevice: 3, laptopOk: false, builtInCable: false, wireless: true },
  },
  {
    // UGREEN MagFlow Qi2 25W モバイルバッテリー 10000mAh / 65958 / 9,580円（2026-09-24 確認。10,000円の境界に注意）
    // 重量は公式サイト（約254g）と公式楽天店（約356g）で記載が食い違い、JANでも特定できないため lightness は中立の 3（採点基準の「公式に確認できない」）
    id: 'mobile-battery-109',
    name: 'UGREEN MagFlow Qi2 25W モバイルバッテリー 10000mAh',
    category: 'mobile-battery',
    description: 'Qi2 25Wのマグネット式ワイヤレス充電と、最大30WのUSB-Cケーブル内蔵を両立した10,000mAhモバイルバッテリーです。',
    priceRange: 3,
    features: ['10,000mAh', 'Qi2ワイヤレス充電 最大25W', 'USB-Cケーブル内蔵（最大30W）', 'ワイヤレス・内蔵ケーブル・USB-Cで3台同時'],
    pros: ['ワイヤレスでもケーブルでも充電できる', 'ケーブルを別に持ち歩かなくてよい', '3台同時に充電できる'],
    cons: ['3台同時に使うと出力が下がります', '重さの表記が公式情報の間で異なるため、購入前に販売ページで確認してください'],
    recommendFor: 'ワイヤレス充電とケーブル内蔵の両方を1台で使いたい人',
    caution: MAGNET_CAUTION,
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.ugreen, 'ugreen-gear', '65958', '10001438'),
    imageUrl: img('ugreen-gear/cabinet/biiino/item/main-image-2/20250814180814_2.jpg'),
    enabled: true,
    attributes: { capacity: 3, outputPower: 3, lightness: 3, multiDevice: 4, laptopOk: false, builtInCable: true, wireless: true },
  },
]

/** ケーブル内蔵またはワイヤレス充電に対応していれば満点（Q1「ケーブル不要などの使いやすさ」） */
const cableFree = (p: Product) => (p.attributes.builtInCable === true || p.attributes.wireless === true ? 1 : 0)

export const mobileBattery: Diagnosis = {
  id: 'mobile-battery',
  slug: 'mobile-battery',
  name: 'モバイルバッテリー診断',
  itemName: 'モバイルバッテリー',
  group: 'digital',
  icon: '🔋',
  shortDescription: '軽さ・容量・充電の速さ・充電する機器・便利機能・予算から、あなたに合うモバイルバッテリーを診断。',
  intro:
    '日常的に持ち歩くモバイルバッテリーを選ぶ診断です。一番重視すること、充電する機器、欲しい容量、持ち運び方、便利機能、予算の6つの質問から、あなたに合いそうなモバイルバッテリーを相性順に表示します。',
  seo: {
    title: 'モバイルバッテリー診断｜質問に答えてあなたに合うモバイルバッテリーをチェック',
    description:
      'モバイルバッテリーを無料診断。軽さ・容量・充電の速さ・ノートPC対応・ケーブル内蔵・ワイヤレス充電・予算など6つの質問に答えるだけで、あなたに合うモバイルバッテリーが分かります。',
  },
  priceLabels: {
    1: '〜3,000円',
    2: '3,000〜6,000円',
    3: '6,000〜10,000円',
    4: '10,000円〜',
  },
  questions: [
    {
      id: 'priority',
      text: '一番重視することは？',
      shortLabel: '重視すること',
      weight: 24,
      options: [
        { id: 'light', label: '軽さ・持ち運びやすさ', summary: '軽さ・持ち運びやすさを重視', effects: [{ type: 'atLeast', attr: 'lightness', value: 5 }] },
        { id: 'capacity', label: '容量', summary: '容量を重視', effects: [{ type: 'atLeast', attr: 'capacity', value: 5 }] },
        { id: 'speed', label: '充電の速さ', summary: '充電の速さを重視', effects: [{ type: 'atLeast', attr: 'outputPower', value: 5 }] },
        { id: 'multi', label: '複数機器を充電しやすいこと', summary: '複数機器の充電しやすさを重視', effects: [{ type: 'atLeast', attr: 'multiDevice', value: 5 }] },
        // ケーブル内蔵 または ワイヤレス充電 のどちらかに対応していれば満点
        { id: 'easy', label: 'ケーブル不要などの使いやすさ', summary: 'ケーブル不要などの使いやすさを重視', effects: [{ type: 'custom', score: cableFree }] },
      ],
    },
    {
      id: 'device',
      text: '主に何を充電する？',
      shortLabel: '充電する機器',
      weight: 18,
      options: [
        // スマートフォンだけなら、どのモバイルバッテリーでも充電できるため採点しない
        { id: 'phone', label: 'スマートフォン', effects: [] },
        { id: 'small', label: 'スマホ＋イヤホンなど小型機器', summary: 'スマホとイヤホンなどを充電する', effects: [{ type: 'atLeast', attr: 'multiDevice', value: 3 }] },
        {
          id: 'tablet',
          label: 'タブレット',
          summary: 'タブレットを充電する',
          // タブレットには一定の出力と容量が必要
          effects: [
            { type: 'atLeast', attr: 'outputPower', value: 3 },
            { type: 'atLeast', attr: 'capacity', value: 3 },
          ],
        },
        {
          id: 'laptop',
          label: 'ノートPCも充電したい',
          summary: 'ノートPCも充電したい',
          // 適格条件：ノートPCの充電に使える商品だけを通常ランキングの候補にする（採点には使わない）
          effects: [],
          eligibility: {
            attr: 'laptopOk',
            value: true,
            notice: 'ノートPCの充電に使える商品からおすすめを表示しています。',
            supplementLabel: 'ノートPCの充電には対応していません',
          },
        },
      ],
    },
    {
      id: 'capacity',
      text: 'どれくらいの容量が欲しい？',
      shortLabel: '容量',
      weight: 18,
      options: [
        { id: 'emergency', label: '緊急時の予備程度', summary: '緊急時の予備程度の容量', effects: [{ type: 'atMost', attr: 'capacity', value: 2 }] },
        { id: 'once', label: 'スマホ約1回分', summary: 'スマホ約1回分の容量', effects: [{ type: 'near', attr: 'capacity', value: 2 }] },
        { id: 'twice', label: '1〜2回以上充電したい', summary: '1〜2回以上充電したい', effects: [{ type: 'atLeast', attr: 'capacity', value: 3 }] },
        { id: 'max', label: '容量優先で大きくてもよい', summary: '容量優先', effects: [{ type: 'atLeast', attr: 'capacity', value: 5 }] },
      ],
    },
    {
      id: 'carry',
      text: '持ち運びで重視することは？',
      shortLabel: '持ち運び',
      weight: 14,
      options: [
        { id: 'pocket', label: 'ポケットに入る軽さ', summary: 'ポケットに入る軽さ', effects: [{ type: 'atLeast', attr: 'lightness', value: 4 }] },
        { id: 'bag', label: 'バッグに入れやすければよい', summary: 'バッグに入れやすい重さ', effects: [{ type: 'atLeast', attr: 'lightness', value: 3 }] },
        { id: 'any', label: '重さ・大きさはあまり気にしない', effects: [] },
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
        { id: 'multi', label: '複数台同時充電', summary: '複数台を同時に充電したい', effects: [{ type: 'atLeast', attr: 'multiDevice', value: 3 }] },
        { id: 'cable', label: 'ケーブル内蔵', summary: 'ケーブル内蔵があるとうれしい', effects: [{ type: 'equals', attr: 'builtInCable', value: true }] },
        { id: 'wireless', label: 'マグネット・ワイヤレス充電', summary: 'マグネット・ワイヤレス充電があるとうれしい', effects: [{ type: 'equals', attr: 'wireless', value: true }] },
      ],
    },
    budgetQuestion({
      text: '予算は？',
      weight: 16,
      bands: [
        { label: '3,000円以下', summary: '予算3,000円以下' },
        { label: '3,000〜6,000円', summary: '予算3,000〜6,000円' },
        { label: '6,000〜10,000円', summary: '予算6,000〜10,000円' },
      ],
      // 「高価格の商品を希望する」ではなく「予算の上限を実質設けない」という意味。価格では採点しない
      noLimitLabel: '10,000円以上でもOK',
      // 予算は上限条件：予算内の商品を通常ランキングにし、足りないときだけ予算を少し超える商品を別枠に表示
      asLimit: true,
    }),
  ],
  products,
  // 完全同点の並べ方（tieBreak）と、複数条件の回答で一部だけ一致したときの理由文の表現（フライパン診断と同じ）
  scoring: {
    tieBreak: true,
    softenPartialReason: true,
    // 1位が60%未満のときだけ表示（採点・順位・相性%は変えない）
    lowMatchNotice: '条件をすべて満たす商品が少ないため、近い候補を表示しています。',
  },
  guide: {
    title: 'モバイルバッテリーの選び方',
    intro: 'この診断は、日常的に持ち歩くモバイルバッテリーを対象に、メーカー公式の仕様をもとに以下のポイントとあなたの回答を照らし合わせて相性を計算しています。',
    sections: [
      { heading: '容量', body: 'スマートフォン1回分の充電には、5,000mAh前後がひとつの目安です。何度も充電したい場合やタブレットを充電する場合は、10,000mAh以上を選ぶと安心です。容量が大きいほど重くなります。' },
      { heading: '出力（充電の速さ）', body: '急速充電やタブレットの充電には、USB-Cの出力（W数）が大きいものが向いています。ノートPCを充電する場合は、PCが必要とするW数に対応しているかを必ず確認しましょう。' },
      { heading: '重さ・持ち運び', body: 'ポケットに入れて持ち歩くなら軽さを重視しましょう。容量が大きいモデルは重くなる傾向があります。' },
      { heading: '複数機器の充電', body: 'スマホとイヤホンなどを一緒に充電したい場合は、出力ポートの数と、同時に充電できるかを確認しましょう。' },
      { heading: 'ケーブル内蔵・ワイヤレス充電', body: 'ケーブル内蔵タイプは、ケーブルを別に持ち歩く必要がありません。マグネット式のワイヤレス充電は、対応するスマートフォンかどうかを確認しましょう。' },
      { heading: '予算の目安', body: '手頃な価格帯でも日常の充電には十分なものが多く、価格が上がるほど大容量・高出力・多機能なモデルが増える傾向があります。' },
    ],
  },
  notice: '充電できる回数や速さは、機器・ケーブル・使用環境によって変わります。飛行機への持ち込みは航空会社の規定を確認してください。',
  enabled: true,
}

import type { Diagnosis, Product } from '../../types/diagnosis.ts'
import { budgetQuestion } from './shared.ts'

/**
 * トースター診断
 *
 * 【対象範囲】家庭用のオーブントースター（スチーム・コンベクション付きを含む）。
 *   対象外：ポップアップトースター、オーブンレンジ、ホットサンドメーカー、業務用、公式仕様を確認できない商品
 *
 * 商品の attributes（評価項目）。数値は 1〜5（採点基準：data/rakuten-candidates/toaster/scoring-criteria.md）
 *   toastFeatures : トースト向けの機能の数（スチーム・トーストモード・上下ヒーター切替・ヒーター種類の明記）。
 *                   仕上がりのおいしさそのものは評価しない
 *   toastSpeed    : 焼く速さ（公式に明記されたトースト時間。記載がなければ中立の 3。立ち上がり時間は使わない）
 *   versatility   : 調理の幅（温度調節・オートメニュー・コンベクション・ピザ/グラタン の数）
 *   easeOfCare    : お手入れ（パンくずトレイ・焼き網の取り外し・扉の取り外し・汚れにくい加工 の数）
 *   compactness   : 置きやすさ（公式の外形寸法の体積。庫内寸法とは混同しない）
 * true / false の項目（公式に明記されたものだけ）
 *   slices4 : 食パン4枚が焼ける / pizza : ピザ・グラタンが作れる
 *   tempControl : 温度を設定できる / autoMenu : トースト以外のオートメニュー
 *   fineControl : 焼き加減を細かく設定できる / reheat : 揚げ物・パンの温め直し用のモード
 * 価格帯（priceRange）は priceLabels を参照。
 *
 * 【並び順のルール】（共通エンジンの設定）
 *   - Q1 焼きたい枚数・Q3 用途（ピザ・グラタン）：物理的に焼けない商品を上位に出さないため、適格条件（eligibility）にする
 *   - Q7 予算：予算内の商品を通常ランキングの候補にする（上限条件）
 *   - 通常ランキングが3件に満たないときだけ、条件を満たさない商品を別枠に表示する
 *   - 相性スコアが完全に同じときは、回答に関係する一致度 → 評価値 → 商品ID の順で並べる（scoring.tieBreak）
 *
 * 商品はメーカー公式情報で評価した実商品9機種（2026-09-28 確認）。根拠は data/rakuten-candidates/toaster/product-evaluations.json。
 */

/** 商品データ（実商品9機種。評価値はメーカー公式情報に基づく：data/rakuten-candidates/toaster/product-evaluations.json、採点基準 v1） */
const products: Product[] = [
  {
    // 山善 オーブントースター（温度調節機能）YTS-C101 / 幅36.4×奥行19.8×高さ20.7cm（14.9L） / 3,980円（2026-09-28 確認）
    id: 'toaster-101',
    name: '山善 オーブントースター（温度調節機能）YTS-C101',
    category: 'toaster',
    description: '奥行き19.8cmのスリムなオーブントースター。80〜230℃を16段階で温度調節できます。',
    priceRange: 1,
    features: ['食パン2枚', '温度調節 80〜230℃（16段階）', 'タイマー 15分（1分刻み）', '外形 幅36.4×奥行19.8×高さ20.7cm'],
    pros: ['手頃な価格', '奥行きが短く置きやすい'],
    cons: ['楽天の商品ページで「温度調節16段階付き」のSKUを選ぶ必要があります', 'スチーム・オートメニューはありません', 'パンくずトレイの記載はありません'],
    recommendFor: '手頃な価格で、置き場所を取らないトースターがほしい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00tlfdo.d8zuefb3.g00tlfdo.d8zufad3/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fyamazenkaden%2Fxm051%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fyamazenkaden%2Fi%2F10002094%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/yamazenkaden/cabinet/main-img/002/main-23331.jpg?_ex=300x300',
    enabled: true,
    attributes: { toastFeatures: 1, toastSpeed: 3, versatility: 2, easeOfCare: 1, compactness: 4, slices4: false, pizza: false, tempControl: true, autoMenu: false, fineControl: true, reheat: false },
  },
  {
    // アイリスオーヤマ スチームカーボントースター 2枚焼き SOT-201 / 幅350×奥行300×高さ240mm（25.2L） / 6,980円（2026-09-28 確認）
    id: 'toaster-102',
    name: 'アイリスオーヤマ スチームカーボントースター 2枚焼き SOT-201',
    category: 'toaster',
    description: 'スチーム機能と遠赤外線カーボンヒーターを備えた2枚焼きトースター。温度は100〜280℃の無段階で調節できます。',
    priceRange: 2,
    features: ['食パン2枚', 'スチーム機能', '遠赤外線カーボンヒーター', '温度調節 100〜280℃（無段階）', 'パンくずトレイ・取り外せる網', '外形 幅35×奥行30×高さ24cm'],
    pros: ['スチームと温度調節を手頃な価格で使える', 'パンくずトレイや網を外して洗える'],
    cons: ['楽天の商品ページで「2枚」のSKUを選ぶ必要があります', 'オートメニューはありません'],
    recommendFor: '手頃な価格で、スチーム付きのトースターを試したい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00t3zto.d8zuee14.g00t3zto.d8zuf2f4/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Firisplaza-r%2F105458%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Firisplaza-r%2Fi%2F10155776%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/irisplaza-r/cabinet/11073544/13177444/imgrc0119927021.jpg?_ex=300x300',
    enabled: true,
    attributes: { toastFeatures: 3, toastSpeed: 3, versatility: 2, easeOfCare: 3, compactness: 2, slices4: false, pizza: false, tempControl: true, autoMenu: false, fineControl: true, reheat: false },
  },
  {
    // アイリスオーヤマ スチームカーボントースター 4枚焼き SOT-401 / 幅350×奥行320×高さ238mm（26.7L） / 8,980円（2026-09-28 確認）
    id: 'toaster-103',
    name: 'アイリスオーヤマ スチームカーボントースター 4枚焼き SOT-401',
    category: 'toaster',
    description: '食パン4枚と直径21cmのピザが焼ける、スチーム付きのカーボントースター。温度は100〜280℃の無段階です。',
    priceRange: 2,
    features: ['食パン4枚・ピザ直径21cm', 'スチーム機能', '遠赤外線カーボンヒーター', '温度調節 100〜280℃（無段階）', 'パンくずトレー・焼き網・受皿を取り外して丸洗い', '外形 幅35×奥行32×高さ23.8cm'],
    pros: ['1万円以下で4枚焼き・スチーム・温度調節がそろう', 'お手入れしやすい'],
    cons: ['楽天の商品ページで「4枚」のSKUを選ぶ必要があります', 'オートメニューはありません'],
    recommendFor: '家族分のトーストを一度に焼きたい、手頃な価格で機能もほしい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00t3zto.d8zuee14.g00t3zto.d8zuf2f4/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Firisplaza-r%2F105458%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Firisplaza-r%2Fi%2F10155776%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/irisplaza-r/cabinet/11073544/13177444/imgrc0119927021.jpg?_ex=300x300',
    enabled: true,
    attributes: { toastFeatures: 3, toastSpeed: 3, versatility: 3, easeOfCare: 3, compactness: 2, slices4: true, pizza: true, tempControl: true, autoMenu: false, fineControl: true, reheat: false },
  },
  {
    // 山善 熱風オーブントースター YCW-C120 / 幅330×奥行295×高さ310mm（30.2L） / 9,980円（2026-09-28 確認）
    id: 'toaster-104',
    name: '山善 熱風オーブントースター YCW-C120',
    category: 'toaster',
    description: 'Wファンの熱風で焼くコンベクションタイプ。オーブン・エアフライ・トースト・あたための4モードを備えています。',
    priceRange: 2,
    features: ['4つのモード（エアフライ・オーブン・トースト・あたため）', 'コンベクション（Wファン）', '温度調節ダイヤル', '60分タイマー', 'パンくずトレイ・ラック・トレイは丸洗い可', '外形 幅33×奥行29.5×高さ31cm'],
    pros: ['熱風調理・エアフライなど調理の幅が広い', '揚げ物の温め用のモードがある'],
    cons: ['高さ31cmと背が高めです', 'トーストは2枚焼きです', '焼き加減を細かく設定する表示はありません'],
    recommendFor: 'トーストだけでなく、熱風調理や揚げ物の温め直しにも使いたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00tlfdo.d8zuefb3.g00tlfdo.d8zufad3/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fyamazenkaden%2Fs1d65%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fyamazenkaden%2Fi%2F10005529%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/yamazenkaden/cabinet/main-img/018/main-s1d65.jpg?_ex=300x300',
    enabled: true,
    attributes: { toastFeatures: 2, toastSpeed: 3, versatility: 3, easeOfCare: 3, compactness: 1, slices4: false, pizza: false, tempControl: true, autoMenu: false, fineControl: false, reheat: true },
  },
  {
    // シロカ ノンフライオーブン ST-4N231 / 幅38×奥行31×高さ24cm（28.3L） / 12,980円（2026-09-28 確認）
    id: 'toaster-105',
    name: 'シロカ ノンフライオーブン ST-4N231',
    category: 'toaster',
    description: 'トースト4枚と直径22cmのピザが焼ける、コンベクション（熱風循環）式のノンフライオーブン。',
    priceRange: 3,
    features: ['トースト4枚・ピザ直径22cm', 'コンベクション（熱風循環）・ノンフライ調理', '温度設定 100〜250℃', '上下ヒーターの切替', 'タイマー 最大60分', 'パンくずトレー', '外形 幅38×奥行31×高さ24cm'],
    pros: ['4枚焼きで調理の幅も広い', '上下ヒーターを切り替えられる'],
    cons: ['スチーム・オートメニューはありません', '焼き加減を細かく設定する表示はありません'],
    recommendFor: '4枚焼きで、ノンフライ調理などトースト以外にも使いたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00u50qo.d8zue695.g00u50qo.d8zuf217/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fsiroca%2Fst-4n231%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fsiroca%2Fi%2F10000045%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/siroca/cabinet/08863771/thumb_st-4n231r_p10.jpg?_ex=300x300',
    enabled: true,
    attributes: { toastFeatures: 2, toastSpeed: 3, versatility: 4, easeOfCare: 2, compactness: 2, slices4: true, pizza: true, tempControl: true, autoMenu: false, fineControl: false, reheat: false },
  },
  {
    // シロカ すばやきトースター ST-2D451 / 幅35×奥行32×高さ23cm（25.8L） / 19,800円（2026-09-28 確認）
    id: 'toaster-106',
    name: 'シロカ すばやきトースター ST-2D451',
    category: 'toaster',
    description: 'トースト1枚を約90秒で焼けるオートモード付きのトースター。パンの厚みや焼き色を選べます。',
    priceRange: 3,
    features: ['トースト1枚 約90秒（6枚切り・焼き色ふつう）', 'オートモード（トースト・冷凍・クロワッサン・焼きいも など）', 'パンの厚み・焼き色を選べる', '温度 40〜280℃', 'パンくずトレー取り外し可', '外形 幅35×奥行32×高さ23cm'],
    pros: ['公式のトースト時間が短い', 'パンの種類に合わせたオートモードが多い'],
    cons: ['トーストは2枚までです', 'スチーム機能はありません'],
    recommendFor: '朝の忙しい時間に、手早くトーストを焼きたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00u50qo.d8zue695.g00u50qo.d8zuf217/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fsiroca%2Fst-2d451%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fsiroca%2Fi%2F10000083%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/siroca/cabinet/09310869/thumb_st-2d451k_p10.jpg?_ex=300x300',
    enabled: true,
    attributes: { toastFeatures: 2, toastSpeed: 5, versatility: 3, easeOfCare: 2, compactness: 2, slices4: false, pizza: false, tempControl: true, autoMenu: true, fineControl: true, reheat: true },
  },
  {
    // パナソニック ビストロ オーブントースター NT-D700 / 外寸 34.1×32.8×26.9cm（30.1L） / 29,972円（2026-09-28 確認）
    id: 'toaster-107',
    name: 'パナソニック ビストロ オーブントースター NT-D700',
    category: 'toaster',
    description: 'トースト・そうざいパン・ピザ・フライ温めなど15の自動メニューを備えたオーブントースター。',
    priceRange: 4,
    features: ['自動メニュー（うすぎり・あつぎり・冷凍トースト・そうざいパン・冷凍ピザ・フライ温め など）', '遠赤外線・近赤外線ヒーター', '温度調節 120〜260℃（8段階）', 'デジタルタイマー 30秒〜25分', 'スライド式くず受け皿・はずして洗える焼きあみ', '外形 34.1×32.8×26.9cm'],
    pros: ['自動メニューが多く、パンの種類に合わせて焼ける', '揚げ物・そうざいパンの温め直しのメニューがある'],
    cons: ['トーストは2枚までです', '本体がやや大きめです', '価格が高め'],
    recommendFor: 'ボタンひとつで、パンやおかずの温め直しまで任せたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00ubhyo.d8zue3ff.g00ubhyo.d8zuf4bd/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fpanasonic-store%2Fnt-d700-w%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fpanasonic-store%2Fi%2F10000094%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/panasonic-store/cabinet/banner/thumb/nt-d700_251112.jpg?_ex=300x300',
    enabled: true,
    attributes: { toastFeatures: 3, toastSpeed: 3, versatility: 4, easeOfCare: 3, compactness: 1, slices4: false, pizza: true, tempControl: true, autoMenu: true, fineControl: true, reheat: true },
  },
  {
    // バルミューダ ザ・トースター K11A / 357×321×209mm（23.9L） / 33,000円（2026-09-28 確認）
    id: 'toaster-108',
    name: 'バルミューダ ザ・トースター K11A',
    category: 'toaster',
    description: 'スチームとトースト・チーズトースト・フランスパン・クロワッサンの専用モードを備えたトースター。',
    priceRange: 4,
    features: ['スチーム（5ccボイラー）', 'トースト・チーズトースト・フランスパン・クロワッサンのモード', 'クラシックモード 170・200・230℃', 'タイマー 1〜10・15分', '外形 357×321×209mm'],
    pros: ['スチームとパンの種類別のモードがある', '高さ20.9cmで置きやすい'],
    cons: ['焼ける枚数・お手入れについて公式仕様に記載がありません', '温度は3段階です', '価格が高め'],
    recommendFor: 'パンの種類に合わせたモードとスチームで焼きたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pzd8o.d8zue1ad.g00pzd8o.d8zuf7e9/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fplywood%2F14949001%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fplywood%2Fi%2F10012643%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/plywood/cabinet/503/14949059.jpg?_ex=300x300',
    enabled: true,
    attributes: { toastFeatures: 3, toastSpeed: 3, versatility: 3, easeOfCare: 1, compactness: 2, slices4: false, pizza: true, tempControl: true, autoMenu: false, fineControl: true, reheat: true },
  },
  {
    // 山善 オーブントースター YTS-S100 / 幅36.4×奥行19.8×高さ20.7cm（14.9L） / 2,980円（2026-09-28 確認）
    id: 'toaster-109',
    name: '山善 オーブントースター YTS-S100',
    category: 'toaster',
    description: 'タイマーのつまみを回すだけのシンプルなオーブントースター。奥行き19.8cmで、パンくずトレイを取り外せます。',
    priceRange: 1,
    features: ['食パン2枚', 'タイマー 15分（1分刻み）', '取り外せるパンくずトレイ', '外形 幅36.4×奥行19.8×高さ20.7cm'],
    pros: ['最も手頃な価格', '奥行きが短く置きやすい'],
    cons: ['楽天の商品ページで「スタンダード」のSKUを選ぶ必要があります', '温度調節はありません'],
    recommendFor: 'とにかく手頃な価格で、トーストを焼ければ十分な人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00tlfdo.d8zuefb3.g00tlfdo.d8zufad3/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fyamazenkaden%2Fxm051%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fyamazenkaden%2Fi%2F10002094%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/yamazenkaden/cabinet/main-img/002/main-23331.jpg?_ex=300x300',
    enabled: true,
    attributes: { toastFeatures: 1, toastSpeed: 3, versatility: 1, easeOfCare: 2, compactness: 4, slices4: false, pizza: false, tempControl: false, autoMenu: false, fineControl: true, reheat: false },
  },
]

export const toaster: Diagnosis = {
  id: 'toaster',
  slug: 'toaster',
  name: 'トースター診断',
  itemName: 'トースター',
  group: 'kitchen',
  icon: '🍞',
  shortDescription: '焼く枚数・重視点・用途・焼き加減・調理機能・置き場所・予算から、あなたに合うトースターを診断。',
  intro:
    '家庭用のオーブントースターを選ぶ診断です。一度に焼きたい枚数、重視すること、よく使う用途、焼き加減、調理機能、設置スペース、予算の7つの質問から、あなたに合いそうなトースターを相性順に表示します。',
  seo: {
    title: 'トースターおすすめ診断｜質問であなたに合う1台をチェック',
    description:
      '焼きたい枚数や用途、焼き加減、調理機能、設置スペース、予算から、あなたに合うトースター候補を診断します。',
  },
  priceLabels: {
    1: '〜5,000円',
    2: '5,000〜12,000円',
    3: '12,000〜25,000円',
    4: '25,000円〜',
  },
  questions: [
    {
      id: 'slices',
      text: '一度に焼きたい食パンの枚数は？',
      shortLabel: '焼く枚数',
      // 4枚焼けない商品を上位に出さないため、公式に明記された枚数を適格条件にする（採点には使わない）
      weight: 14,
      options: [
        { id: 's2', label: '1〜2枚', effects: [] },
        {
          id: 's4',
          label: '3〜4枚',
          summary: '3〜4枚を一度に焼きたい',
          effects: [],
          eligibility: { attr: 'slices4', value: true, notice: 'メーカー公式に食パン4枚が焼けると明記されたトースターからおすすめを表示しています。', supplementLabel: '4枚焼きの公式記載がありません' },
        },
      ],
    },
    {
      id: 'priority',
      text: '一番重視することは？',
      shortLabel: '重視すること',
      weight: 22,
      options: [
        { id: 'toast', label: 'トーストのおいしさ', summary: 'トースト向けの機能を重視', effects: [{ type: 'atLeast', attr: 'toastFeatures', value: 3 }] },
        { id: 'speed', label: '焼く速さ', summary: '焼く速さを重視', effects: [{ type: 'atLeast', attr: 'toastSpeed', value: 4 }] },
        { id: 'range', label: '調理の幅', summary: '調理の幅を重視', effects: [{ type: 'atLeast', attr: 'versatility', value: 4 }] },
        { id: 'care', label: 'お手入れのしやすさ', summary: 'お手入れのしやすさを重視', effects: [{ type: 'atLeast', attr: 'easeOfCare', value: 3 }] },
        { id: 'cospa', label: 'コスパ（価格の手頃さ）', summary: '価格の手頃さを重視', effects: [{ type: 'atMost', attr: 'priceRange', value: 2 }] },
      ],
    },
    {
      id: 'use',
      text: 'よく使う用途は？',
      shortLabel: '用途',
      weight: 12,
      options: [
        { id: 'bread', label: '食パン中心', summary: '食パン中心に使う', effects: [{ type: 'atLeast', attr: 'toastFeatures', value: 2 }] },
        { id: 'rebake', label: 'パンの温め直し', summary: 'パンの温め直しに使う', effects: [{ type: 'equals', attr: 'reheat', value: true }] },
        {
          id: 'pizza',
          label: 'ピザ・グラタン',
          summary: 'ピザ・グラタンを作る',
          effects: [],
          eligibility: { attr: 'pizza', value: true, notice: 'メーカー公式にピザ・グラタンの調理が明記されたトースターからおすすめを表示しています。', supplementLabel: 'ピザ・グラタンの公式記載がありません' },
        },
        { id: 'fry', label: '揚げ物の温め直し', summary: '揚げ物の温め直しに使う', effects: [{ type: 'equals', attr: 'reheat', value: true }] },
        { id: 'wide', label: '幅広く使いたい', summary: '幅広く使いたい', effects: [{ type: 'atLeast', attr: 'versatility', value: 3 }] },
      ],
    },
    {
      id: 'control',
      text: '焼き加減の調整は？',
      shortLabel: '焼き加減',
      weight: 10,
      options: [
        { id: 'simple', label: 'シンプル操作で十分', effects: [] },
        { id: 'fine', label: '細かく調整したい', summary: '焼き加減を細かく調整したい', effects: [{ type: 'equals', attr: 'fineControl', value: true }] },
      ],
    },
    {
      id: 'cooking',
      text: '調理機能はどこまで必要？',
      shortLabel: '調理機能',
      weight: 12,
      options: [
        { id: 'toast', label: 'トースト中心で十分', effects: [] },
        { id: 'auto', label: 'オートメニューが欲しい', summary: 'オートメニューが欲しい', effects: [{ type: 'equals', attr: 'autoMenu', value: true }] },
        { id: 'temp', label: '温度調節して料理にも使いたい', summary: '温度調節して料理にも使いたい', effects: [{ type: 'equals', attr: 'tempControl', value: true }] },
      ],
    },
    {
      id: 'space',
      text: '設置スペースは？',
      shortLabel: '設置スペース',
      weight: 12,
      options: [
        { id: 'compact', label: 'コンパクト重視', summary: 'コンパクトなものがいい', effects: [{ type: 'atLeast', attr: 'compactness', value: 4 }] },
        { id: 'normal', label: '標準的な大きさならOK', summary: '標準的な大きさならOK', effects: [{ type: 'atLeast', attr: 'compactness', value: 2 }] },
        { id: 'any', label: 'サイズはあまり気にしない', effects: [] },
      ],
    },
    budgetQuestion({
      text: '予算は？',
      weight: 14,
      bands: [
        { label: '5,000円以下', summary: '予算5,000円以下' },
        { label: '12,000円以下', summary: '予算12,000円以下' },
        { label: '25,000円以下', summary: '予算25,000円以下' },
      ],
      // 「高価格の商品を希望する」ではなく「予算の上限を実質設けない」という意味。価格では採点しない
      noLimitLabel: '25,000円以上でもOK',
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
    title: 'トースターの選び方',
    intro:
      'この診断は、家庭用のオーブントースターを対象に、メーカー公式の仕様をもとに以下のポイントとあなたの回答を照らし合わせて相性を計算しています。トーストの仕上がりのおいしさそのものや、メーカー独自の技術には優劣をつけていません。',
    sections: [
      { heading: '焼ける枚数', body: '家族で使うなら4枚焼きが便利です。焼ける枚数は、メーカーが明記している「食パン◯枚」を確認しましょう。' },
      {
        heading: '本体の大きさと庫内の広さ',
        body: '置き場所は本体の外形寸法で、ピザやグラタンが入るかは庫内の広さやメーカーの記載で確認しましょう。外形と庫内の寸法は別物です。',
      },
      {
        heading: 'トースト向けの機能',
        body: 'スチーム、トースト専用の自動モード、上下ヒーターの切り替えなど、トースト向けの機能は機種によって異なります。焼き上がりは好みや食パンによっても変わります。',
      },
      { heading: '調理の幅', body: '温度調節やオートメニュー、コンベクション（熱風）があると、グラタンや揚げ物の温め直しなど、トースト以外にも使いやすくなります。' },
      { heading: 'お手入れ', body: 'パンくずトレイや焼き網を取り外して洗えるかを確認しましょう。' },
    ],
  },
  notice:
    'トースト時間や温度はメーカーの公表値で、パンの種類や量によって変わります。本診断は使い方や好みからトースターの候補を探すためのもので、仕上がりのおいしさを保証するものではありません。',
  enabled: true,
}

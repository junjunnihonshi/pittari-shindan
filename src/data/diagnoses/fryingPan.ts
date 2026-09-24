import type { Diagnosis, Product } from '../../types/diagnosis.ts'
import { budgetQuestion } from './shared.ts'

/**
 * フライパン診断
 *
 * 【対象範囲】家庭で日常的に使うメインのフライパン（焼く・炒める・卵料理など日常の調理用）を選ぶ診断です。
 *   対象：フッ素（ふっ素樹脂）加工 / セラミック加工 / 鉄 / ステンレス系 / アルミ系 / 多層構造
 *   対象外：卵焼き器、中華鍋・北京鍋、深型鍋が主用途の商品、業務用専用、アウトドア専用、グリルパン、ホットプレート、電気フライパン
 *
 * 商品の attributes（評価項目）。数値は 1〜5 で、大きいほどその点に優れています。
 *   nonStick        : こびりつきにくさ（卵料理・パンケーキにも使う）
 *   durability      : コーティングや本体の耐久性
 *   lightness       : 軽さ・取り回し（炒め物で振りやすいかにも使う）
 *   heatPerformance : 熱の入り方・焼き性能（蓄熱・焼き目。肉・魚を焼く料理にも使う）
 *   easyCare        : 手入れのしやすさ（油ならし・さび対策が不要か、洗いやすさなど）
 *   gasOk           : ガス火で使えるか（true / false）
 *   ihOk            : IHで使えるか（true / false）
 *   （「ガス火・IHどちらでも」は gasOk かつ ihOk で判定する。専用の属性は持たない）
 * 価格帯（priceRange）は priceLabels を参照（1: 〜3,000円 / 2: 〜6,000円 / 3: 〜10,000円 / 4: 10,000円〜）。
 *
 * 評価軸の整理（候補から統合したもの）
 *   - 料理別の適性（meatFish / stirFry / eggCooking / versatility）は独立させず、回答ごとに既存の評価軸で判定する
 *     肉・魚 → heatPerformance、炒め物 → lightness＋heatPerformance、卵・パンケーキ → nonStick、幅広く → 採点しない
 *   - gasCompatible / ihCompatible は、条件判定用の gasOk / ihOk（true/false）にした
 *
 * 【比較の標準サイズ】26cm。シリーズに複数サイズがある場合も 26cm の商品だけを評価・登録する
 *   （価格・重量・仕様を 24cm・28cm など別サイズと混在させない）
 *
 * 【並び順のルール】（掃除機・ドライヤーと同じ共通エンジンの設定）
 *   - Q5 熱源：使えない商品を通常ランキングから外す適格条件（eligibility）。全回答が条件なので採点には使わない
 *   - Q6 予算：予算内の商品を通常ランキングの候補にする（上限条件。10,000円以上でもOK は上限なし）
 *   - 通常ランキングが3件に満たないときだけ、条件を満たさない商品を別枠に表示する
 *     （熱源に対応する商品が全体で3件以上あれば、別枠は熱源に対応した予算超えの商品だけになる）
 *   - 相性スコアが完全に同じときは、回答に関係する一致度 → 評価値 → 商品ID の順で並べる（scoring.tieBreak）
 *
 * 商品は実商品8機種（2026-09-24 選定・26cm）。評価値はメーカー公式情報をもとに
 * data/rakuten-candidates/frying-pan/scoring-criteria.md（v1）の基準で採点したもの（結果を整える目的で変更しないこと）。
 * 商品IDは評価記録（product-evaluations.json）の番号＋100。価格帯1（〜3,000円）は2機種のため、3,000円以下では3位が別枠になる。
 */

/** 商品データ（実商品8機種。評価値はメーカー公式情報に基づく） */
const products: Product[] = [
  {
    // 貝印 軽いフライパン（IH対応）26cm / 000DW5629（JAN 4901601213775） / 26cm / 2,280円（2026-09-24 確認）
    // 評価の根拠：data/rakuten-candidates/frying-pan/product-evaluations.json（採点基準 scoring-criteria.md v1）
    id: 'frying-pan-101',
    name: '貝印 軽いフライパン（IH対応）26cm',
    category: 'frying-pan',
    description: '約550gの軽量なふっ素樹脂加工フライパン。IH・ガス火の両方で使えます。',
    priceRange: 1,
    features: ['IH・ガス火対応', '内面：ふっ素樹脂塗膜加工', '重量 約550g', '本体：アルミニウム合金（底の厚さ2.2mm）'],
    pros: ['軽くて扱いやすい', '手頃な価格', 'IHでもガス火でも使える'],
    cons: ['コーティングの層数や耐摩耗構造は公表されていません', '食洗機対応の記載はありません'],
    recommendFor: '軽さと価格を重視して、毎日使うフライパンを選びたい人',
    caution: 'IH対応モデル（000DW5629）を想定しています。同じシリーズのガス火用とは別の商品です。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pw35o.d8zueb97.g00pw35o.d8zuf0cd/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkai%2F000dw5629%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fkai%2Fi%2F10008595%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/kai/cabinet/bc/goods/000dw2/common_f_08.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { nonStick: 4, durability: 3, lightness: 5, heatPerformance: 3, easyCare: 3, gasOk: true, ihOk: true },
  },
  {
    // アイリスオーヤマ ダイヤモンドコートパン IH/ガス火対応 26cm / VDI-F26 / 26cm / 2,480円（2026-09-24 確認）
    // 評価の根拠：data/rakuten-candidates/frying-pan/product-evaluations.json（採点基準 scoring-criteria.md v1）
    id: 'frying-pan-102',
    name: 'アイリスオーヤマ ダイヤモンドコートパン 26cm（IH・ガス火対応）VDI-F26',
    category: 'frying-pan',
    description: 'ダイヤモンド粒子を配合したふっ素樹脂加工のフライパン。IH・ガス火の両方で使えます。',
    priceRange: 1,
    features: ['IH・ガス火対応', '内側：ふっ素樹脂塗膜加工（耐摩耗性を高めるダイヤモンド粒子配合）', '重量 約750g', '底の厚さ2.7mm（はり底含む）'],
    pros: ['手頃な価格', 'コーティングの耐摩耗性を高める構造がメーカーに明記されている', 'IHでもガス火でも使える'],
    cons: ['食洗機対応の記載はありません', '電子レンジ・オーブンでは使えません'],
    recommendFor: '低価格でも、コーティングの耐摩耗構造を重視したい人',
    caution: '楽天の商品ページはガス火専用・IH両用・浅型・炒め鍋の選択式です。「IHガス火両用・浅型・26cm」（VDI-F26）を選んでください。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00t3zto.d8zuee14.g00t3zto.d8zuf2f4/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Firisplaza-r%2F520923%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Firisplaza-r%2Fi%2F10091590%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/irisplaza-r/cabinet/11073544/13034817/imgrc0118019894.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { nonStick: 4, durability: 4, lightness: 4, heatPerformance: 3, easyCare: 3, gasOk: true, ihOk: true },
  },
  {
    // ティファール（グループセブ ジャパン） IHチタン・エクセレンス モカ フライパン 26cm / G17205（JAN 3168430352889） / 26cm / 3,982円（2026-09-24 確認）
    // 評価の根拠：data/rakuten-candidates/frying-pan/product-evaluations.json（採点基準 scoring-criteria.md v1）
    id: 'frying-pan-105',
    name: 'ティファール IHチタン・エクセレンス モカ フライパン 26cm G17205',
    category: 'frying-pan',
    description: 'チタン・フォース コーティングのフライパン。IH・ガス火の両方で使え、食洗機にも対応しています。',
    priceRange: 2,
    features: ['IH・ガス火対応', 'チタン・フォース コーティング', '食洗機対応', '本体重量 約0.95kg'],
    pros: ['食洗機で洗える（メーカー公式）', 'IHでもガス火でも使える'],
    cons: ['重量は約0.95kgで、軽量タイプより重めです', 'コーティングの層数や耐摩耗構造は公表されていません'],
    recommendFor: '食洗機も使って、毎日の手入れの手間を減らしたい人',
    caution: '金属製の調理器具を使う場合は、角の丸いものを使うようメーカーが案内しています。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00t3jpo.d8zuedce.g00t3jpo.d8zufb63/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fyamada-denki%2F2976792019%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fyamada-denki%2Fi%2F10583685%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/yamada-denki/cabinet/a07000299/2976792019.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { nonStick: 4, durability: 3, lightness: 3, heatPerformance: 3, easyCare: 4, gasOk: true, ihOk: true },
  },
  {
    // ドウシシャ（evercook） evercook ガス火専用 フライパン 26cm / EGFP26NV（ネイビー） / 26cm / 4,180円（2026-09-24 確認）
    // 評価の根拠：data/rakuten-candidates/frying-pan/product-evaluations.json（採点基準 scoring-criteria.md v1）
    id: 'frying-pan-106',
    name: 'evercook ガス火専用 フライパン 26cm EGFP26NV',
    category: 'frying-pan',
    description: '約608gのガス火専用フライパン。内面ふっ素樹脂のはがれを対象とした500日保証が付いています。',
    priceRange: 2,
    features: ['ガス火専用', 'ふっ素樹脂コーティング', '重量 約608g', '500日保証（内面ふっ素樹脂のはがれが対象）'],
    pros: ['コーティングのはがれに対する保証がある', '比較的軽い'],
    cons: ['IHでは使えません', '食洗機対応の記載は確認できていません'],
    recommendFor: 'ガス火で使い、コーティングの保証も重視したい人',
    caution: 'ガス火専用です。カラーはネイビー（EGFP26NV）を想定しています。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00u97qo.d8zued56.g00u97qo.d8zuf1b8/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fdoshisha-marche%2Fegfp26or%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fdoshisha-marche%2Fi%2F10000033%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/doshisha-marche/cabinet/evercook/egfp26nv-w.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { nonStick: 4, durability: 4, lightness: 4, heatPerformance: 3, easyCare: 3, gasOk: true, ihOk: false },
  },
  {
    // ビタクラフト ソフィアII フライパン 26cm / No.1746 / 26cm / 4,400円（2026-09-24 確認）
    // 評価の根拠：data/rakuten-candidates/frying-pan/product-evaluations.json（採点基準 scoring-criteria.md v1）
    id: 'frying-pan-107',
    name: 'ビタクラフト ソフィアII フライパン 26cm No.1746',
    category: 'frying-pan',
    description: 'ステンレスとアルミの全面2層構造に、3層のフッ素樹脂コーティングを組み合わせたフライパンです。',
    priceRange: 2,
    features: ['IH・ガス火対応', '全面2層構造（ステンレス・アルミ）', 'ナヴァロン3コート（高密度3層フッ素樹脂コーティング）'],
    pros: ['全面2層構造で、熱の伝わり方に配慮した設計', '3層のフッ素樹脂コーティング', 'IH（200V含む）・ガス火など幅広い熱源に対応'],
    cons: ['重量はメーカー公式で公表されていません', 'メーカー保証は「なし」と記載されています'],
    recommendFor: '焼き上がりを重視しつつ、こびりつきにくい加工も欲しい人',
    caution: '重量はメーカー公式で公表されていないため、この診断では軽さを標準として評価しています。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00s2zdo.d8zuea25.g00s2zdo.d8zufe62/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fshipplace%2F01-1746%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fshipplace%2Fi%2F10000074%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/shipplace/cabinet/04267983/09501748/imgrc0112501679.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { nonStick: 4, durability: 4, lightness: 3, heatPerformance: 4, easyCare: 3, gasOk: true, ihOk: true },
  },
  {
    // マイヤー ホワイトスチール フライパン 26cm（コーティングなし） / PM-P26SSHK（JAN 4976667783883） / 26cm / 5,980円（2026-09-24 確認）
    // 評価の根拠：data/rakuten-candidates/frying-pan/product-evaluations.json（採点基準 scoring-criteria.md v1）
    // 価格帯の境界（6,000円）に近い商品。価格が6,000円を超えた場合は priceRange を 2→3 に変更し、全パターンを再検証する
    id: 'frying-pan-109',
    name: 'マイヤー ホワイトスチール フライパン 26cm PM-P26SSHK',
    category: 'frying-pan',
    description: 'ふっ素コーティングを使わないステンレス製のフライパン。底はアルミとステンレスのはり底（厚さ4.0mm）です。',
    priceRange: 2,
    features: ['IH・ガス火対応', '表面加工なし（ステンレス・内面サテン加工）', '底：アルミ＋ステンレスのはり底（厚さ4.0mm）', '重量 約1,148g'],
    pros: ['劣化するコーティングがない', '底が厚い構造', 'IHでもガス火でも使える'],
    cons: ['重量は約1,148gで重めです', '表面加工がないため、加工フライパンよりこびりつきやすくなります'],
    recommendFor: 'コーティングの劣化を気にせず、長く使えるフライパンを選びたい人',
    caution: '表面加工のないステンレス製です。表面加工フライパンとは使い方・手入れが異なります。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00so8do.d8zue9f3.g00so8do.d8zuf7e7/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Frcmdki%2Fnf-4976667783883%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Frcmdki%2Fi%2F10422098%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/rcmdki/cabinet/nf23/nf-4976667783883.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { nonStick: 2, durability: 5, lightness: 2, heatPerformance: 4, easyCare: 3, gasOk: true, ihOk: true },
  },
  {
    // リバーライト 極JAPAN フライパン 26cm / J1226（JAN 4903449125050） / 26cm / 7,700円（2026-09-24 確認）
    // 評価の根拠：data/rakuten-candidates/frying-pan/product-evaluations.json（採点基準 scoring-criteria.md v1）
    id: 'frying-pan-110',
    name: 'リバーライト 極JAPAN フライパン 26cm J1226',
    category: 'frying-pan',
    description: '窒化処理を施した鉄のフライパン。表面加工がなく、コーティングの劣化を気にせず使えます。',
    priceRange: 3,
    features: ['IH・ガス火対応', '鉄（冷間圧延磨き鋼板）・特殊熱処理（窒化鉄）', '重量 950g', '取っ手：天然木'],
    pros: ['劣化するコーティングがない', '空焼き不要で、使用後の油による保湿も不要（メーカー公式）'],
    cons: ['使い始めに油慣らしが必要です', '表面加工がないため、加工フライパンよりこびりつきやすくなります'],
    recommendFor: '手入れの手間より、鉄の耐久性を重視したい人',
    caution: '表面加工のない鉄製で、使い始めに油慣らしが必要です。表面加工フライパンとは使い方・手入れが異なります。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pmxdo.d8zueecb.g00pmxdo.d8zuf7cf/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fe-goods%2Fk_kjapan_26%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fe-goods%2Fi%2F10015168%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/e-goods/cabinet/dr2/kjapan_26_dr1_2.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { nonStick: 2, durability: 5, lightness: 3, heatPerformance: 3, easyCare: 2, gasOk: true, ihOk: true },
  },
  {
    // 岩鉄鉄器 ダクタイルパン26 / 00726（JAN 4573106450070） / 26cm / 18,150円（2026-09-24 確認）
    // 評価の根拠：data/rakuten-candidates/frying-pan/product-evaluations.json（採点基準 scoring-criteria.md v1）
    id: 'frying-pan-115',
    name: '岩鉄鉄器 ダクタイルパン26',
    category: 'frying-pan',
    description: 'ダクタイル鋳鉄製のフライパン。窒化酸化加工で錆止めの効果を持たせています。',
    priceRange: 4,
    features: ['IH・ガス火対応', '鋳鉄（ダクタイル鋳鉄）・窒化酸化加工', '重量 約1.1kg'],
    pros: ['劣化するコーティングがない', '鋳鉄製で、熱をためやすい構造'],
    cons: ['重量は約1.1kgで重めです', '最初に油慣らしが必要です', '価格帯は高めです'],
    recommendFor: '予算をかけて、長く使える鋳鉄のフライパンを選びたい人',
    caution: '表面加工のない鋳鉄製で、最初に油慣らしが必要です。表面加工フライパンとは使い方・手入れが異なります。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00u1nyo.d8zue040.g00u1nyo.d8zuf615/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fiwatetsu%2F00726%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fiwatetsu%2Fi%2F10000000%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/iwatetsu/cabinet/products/00726/00726_thumb.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { nonStick: 2, durability: 5, lightness: 2, heatPerformance: 4, easyCare: 2, gasOk: true, ihOk: true },
  },
]

export const fryingPan: Diagnosis = {
  id: 'frying-pan',
  slug: 'frying-pan',
  name: 'フライパン診断',
  itemName: 'フライパン',
  group: 'kitchen',
  icon: '🍳',
  shortDescription: 'こびりつきにくさ・耐久性・軽さ・よく作る料理・熱源・予算から、あなたに合うフライパンを診断。',
  intro:
    '家庭で毎日使うメインのフライパンを選ぶ診断です。一番重視すること、よく作る料理、お手入れ、重さ、熱源（ガス火・IH）、予算の6つの質問から、あなたに合いそうなフライパンを相性順に表示します。',
  seo: {
    title: 'フライパン診断｜質問に答えてあなたに合うフライパンをチェック',
    description:
      '家庭用フライパンを無料診断。こびりつきにくさ・耐久性・軽さ・焼き上がり・お手入れ・ガス火/IH・予算など6つの質問に答えるだけで、あなたに合うフライパンが分かります。',
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
        { id: 'nonstick', label: 'こびりつきにくさ', summary: 'こびりつきにくさを重視', effects: [{ type: 'atLeast', attr: 'nonStick', value: 5 }] },
        { id: 'durable', label: '長く使える耐久性', summary: '耐久性を重視', effects: [{ type: 'atLeast', attr: 'durability', value: 5 }] },
        { id: 'light', label: '軽さ・扱いやすさ', summary: '軽さ・扱いやすさを重視', effects: [{ type: 'atLeast', attr: 'lightness', value: 5 }] },
        { id: 'heat', label: '焼き上がり・火の入り方', summary: '焼き上がり・火の入り方を重視', effects: [{ type: 'atLeast', attr: 'heatPerformance', value: 5 }] },
        {
          id: 'value',
          label: 'コストパフォーマンス',
          summary: 'コストパフォーマンスを重視',
          // 価格が手頃（2以下）であることを主に、最低限のこびりつきにくさ（3以上）もあわせて評価（掃除機・ドライヤーと同じ考え方）
          effects: [
            { type: 'atMost', attr: 'priceRange', value: 2, weight: 2 },
            { type: 'atLeast', attr: 'nonStick', value: 3 },
          ],
        },
      ],
    },
    {
      id: 'dish',
      text: 'よく作る料理は？',
      shortLabel: 'よく作る料理',
      weight: 18,
      options: [
        { id: 'meat', label: '肉・魚を焼く料理', summary: '肉・魚を焼く料理が多い', effects: [{ type: 'atLeast', attr: 'heatPerformance', value: 4 }] },
        {
          id: 'stirfry',
          label: '炒め物',
          summary: '炒め物が多い',
          // 振りやすさ（軽さ）を主に、炒め物に必要な火の通り（3以上）もあわせて評価
          effects: [
            { type: 'atLeast', attr: 'lightness', value: 4 },
            { type: 'atLeast', attr: 'heatPerformance', value: 3 },
          ],
        },
        { id: 'egg', label: '卵・パンケーキなど', summary: '卵・パンケーキなどが多い', effects: [{ type: 'atLeast', attr: 'nonStick', value: 4 }] },
        // 幅広く作る場合は、特定の料理への適性では採点しない
        { id: 'various', label: '幅広くいろいろ作る', effects: [] },
      ],
    },
    {
      id: 'care',
      text: 'お手入れはどれくらい楽にしたい？',
      shortLabel: 'お手入れ',
      weight: 14,
      options: [
        { id: 'easy', label: 'とにかく簡単にしたい', summary: 'お手入れを簡単にしたい', effects: [{ type: 'atLeast', attr: 'easyCare', value: 4 }] },
        { id: 'some', label: '多少手入れしてもよい', summary: '多少の手入れはしてもよい', effects: [{ type: 'atLeast', attr: 'easyCare', value: 3 }] },
        { id: 'any', label: '手入れの手間は気にしない', effects: [] },
      ],
    },
    {
      id: 'weight',
      text: '重さはどれくらい気になる？',
      shortLabel: '重さ',
      weight: 12,
      options: [
        { id: 'light', label: '軽いものがいい', summary: '軽いものがいい', effects: [{ type: 'atLeast', attr: 'lightness', value: 4 }] },
        { id: 'mid', label: 'ほどほどならよい', summary: 'ほどほどの重さならよい', effects: [{ type: 'atLeast', attr: 'lightness', value: 3 }] },
        { id: 'any', label: '重くても気にしない', effects: [] },
      ],
    },
    {
      id: 'heatSource',
      text: '使用する熱源は？',
      shortLabel: '熱源',
      // すべての回答が適格条件（使えない商品を通常ランキングから外す）で、採点には使わないため重みは結果に影響しない
      weight: 15,
      options: [
        {
          id: 'gas',
          label: 'ガス火',
          summary: 'ガス火で使う',
          effects: [],
          eligibility: {
            attr: 'gasOk',
            value: true,
            notice: 'ガス火で使える商品からおすすめを表示しています。',
            supplementLabel: 'ガス火で使えない商品です',
          },
        },
        {
          id: 'ih',
          label: 'IH',
          summary: 'IHで使う',
          effects: [],
          eligibility: {
            attr: 'ihOk',
            value: true,
            notice: 'IHで使える商品からおすすめを表示しています。',
            supplementLabel: 'IHでは使えない商品です',
          },
        },
        {
          id: 'both',
          label: 'ガス火・IHどちらでも使えるものがいい',
          summary: 'ガス火・IHのどちらでも使いたい',
          effects: [],
          // ガス火・IHの両方に対応（gasOk かつ ihOk）。説明文は1つだけ表示するため、1つ目の条件にだけ書く
          eligibility: [
            {
              attr: 'gasOk',
              value: true,
              notice: 'ガス火・IHのどちらでも使える商品からおすすめを表示しています。',
              supplementLabel: 'ガス火では使えない商品です',
            },
            { attr: 'ihOk', value: true, supplementLabel: 'IHでは使えない商品です' },
          ],
        },
      ],
    },
    budgetQuestion({
      text: '予算は？',
      weight: 17,
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
  // 相性スコアが完全に同じときは、回答に関係する一致度・評価値で並び順を決める（価格などは使わない）
  // 複数条件の回答（炒め物・コストパフォーマンス）で一部だけ一致する場合は、理由文を「比較的合っています」にする
  scoring: { tieBreak: true, softenPartialReason: true },
  guide: {
    title: 'フライパンの選び方',
    intro: 'この診断は、家庭で毎日使うメインのフライパンを対象に、以下のポイントとあなたの回答を照らし合わせて相性を計算しています。',
    sections: [
      {
        heading: '熱源（ガス火・IH）',
        body: 'IHで使う場合は「IH対応」の表示があるものを選びましょう。ガス火専用の商品はIHでは使えません。',
      },
      {
        heading: 'こびりつきにくさと素材',
        body: 'フッ素（ふっ素樹脂）加工やセラミック加工はこびりつきにくく、卵料理などに向いています。鉄のフライパンは油ならしなどの手入れが必要ですが、高温での調理に強く、使い込むほどなじみます。',
      },
      {
        heading: '耐久性',
        body: 'コーティングは使い方によって少しずつ劣化します。長く使いたい場合は、コーティングの耐久性や本体の素材も確認しましょう。',
      },
      {
        heading: '重さと扱いやすさ',
        body: '炒め物で振ることが多い場合や、毎日の片付けを楽にしたい場合は、軽さも大事なポイントです。多層構造や鉄のフライパンは重めになる傾向があります。',
      },
      {
        heading: '焼き上がり・火の入り方',
        body: '肉や魚をよく焼く場合は、熱をためやすく、全体に均一に伝わるものが向いています。',
      },
      {
        heading: '予算の目安',
        body: '手頃な価格帯でも日常の調理には十分なものが多く、価格が上がるほどコーティングの耐久性や構造にこだわったものが増える傾向があります。',
      },
    ],
  },
  notice: 'コーティングの寿命や焼き上がりは、使い方・火加減・お手入れによって変わります。',
  enabled: true,
}

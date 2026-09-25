import type { Diagnosis, Product } from '../../types/diagnosis.ts'
import { budgetQuestion } from './shared.ts'

/**
 * 電気ケトル診断
 *
 * 【対象範囲】家庭用の電気ケトル（電源プレートに載せて使うコードレスのケトル）。
 *   対象外：電気ポット、業務用、トラベル主体の商品、公式仕様を確認できない商品
 *
 * 商品の attributes（評価項目）。数値は 1〜5（採点基準：data/rakuten-candidates/electric-kettle/scoring-criteria.md）
 *   boilSpeed   : 沸騰の速さ（公式の「カップ1杯分（140mL）」の沸騰時間。測定量が違う数値は比べない。値がなければ中立の 3）
 *   tempControl : 温度調節（公式の温度設定の段階数。沸騰のみは 1）
 *   easeOfCare  : お手入れのしやすさ（広口・内側の構造・外せる部品・お手入れ機能の数）
 *   safety      : 安全機能（転倒湯もれ防止・蒸気対策・空だき防止・本体が熱くなりにくい・ふたロックの数）
 *   lightness   : 軽さ（公式の本体質量）
 * true / false の項目（公式の数値から機械的に決める）
 *   keepWarm : 保温機能がある
 *   cap08 / cap10 / cap12 : 満水容量が 0.8L / 1.0L / 1.2L 以上
 * 価格帯（priceRange）は priceLabels を参照（1: 〜4,000円 / 2: 〜8,000円 / 3: 〜15,000円 / 4: 15,000円〜）。
 *
 * 【並び順のルール】（共通エンジンの設定）
 *   - Q2 一度に沸かす量：容量が足りない商品を上位に出さないため、満水容量を適格条件（eligibility）にする
 *   - Q6 予算：予算内の商品を通常ランキングの候補にする（上限条件）
 *   - 通常ランキングが3件に満たないときだけ、条件を満たさない商品を別枠に表示する
 *   - 相性スコアが完全に同じときは、回答に関係する一致度 → 評価値 → 商品ID の順で並べる（scoring.tieBreak）
 *
 * 商品はメーカー公式情報で評価した実商品10機種（2026-09-25 確認）。根拠は data/rakuten-candidates/electric-kettle/product-evaluations.json。
 */

/** 商品データ（実商品10機種。評価値はメーカー公式情報に基づく：data/rakuten-candidates/electric-kettle/product-evaluations.json、採点基準 v1） */
const products: Product[] = [
  {
    // ティファール ジャスティン ロック 1.2L KO5901JP / 1.2L / カップ1杯 約1分 / 本体900g（電源プレート含まず）/ 転倒こぼれにくいフタ・省スチーム・空焚き防止 / 3,827円（2026-09-25 確認）
    id: 'electric-kettle-101',
    name: 'ティファール ジャスティン ロック 1.2L KO5901JP',
    category: 'electric-kettle',
    description: 'たっぷり1.2Lを沸かせる、シンプルな電気ケトル。倒れてもお湯がこぼれにくいフタと、省スチーム設計です。',
    priceRange: 1,
    features: ['容量 1.2L', 'カップ1杯 約1分', '倒れてもこぼれにくいフタ', '省スチーム設計', '空焚き防止', '本体 約900g'],
    pros: ['手頃な価格で1.2Lの大容量', '広い開口部で内側を洗いやすい'],
    cons: ['温度調節・保温はありません', '給湯ロックはありません'],
    recommendFor: '手頃な価格で、家族分や料理用のお湯をたっぷり沸かしたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pukwo.d8zue5e8.g00pukwo.d8zuf592/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fjism%2F3045387293086-24-19240-n%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fjism%2Fi%2F14292517%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/jism/cabinet/0396/3045387293086.jpg?_ex=300x300',
    enabled: true,
    attributes: { boilSpeed: 4, tempControl: 1, easeOfCare: 4, safety: 4, lightness: 4, keepWarm: false, cap08: true, cap10: true, cap12: true },
  },
  {
    // 山善 電気ケトル DKE-100 / 1.0L / 1200W / 0.83kg / 空焚き防止・着脱式フタ / 2,980円（2026-09-25 確認）
    id: 'electric-kettle-102',
    name: '山善 電気ケトル DKE-100',
    category: 'electric-kettle',
    description: '1.0Lを沸かせるシンプルな電気ケトル。空焚き防止機能と、取り外せるフタが付いています。',
    priceRange: 1,
    features: ['容量 1.0L', '消費電力 1200W', '空焚き防止', '着脱式フタ', '質量 約0.83kg'],
    pros: ['価格が手頃', '1.0Lでカップ麺や2〜3人分に使いやすい'],
    cons: ['温度調節・保温はありません', '転倒時の湯もれ防止・蒸気対策の公式の記載はありません', 'カップ1杯分の沸騰時間の公式値はありません'],
    recommendFor: 'とにかく手頃な価格で、1.0Lを沸かせるケトルがほしい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pukwo.d8zue5e8.g00pukwo.d8zuf592/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fjism%2F4983771983627-24-19240-n%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fjism%2Fi%2F14366432%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/jism/cabinet/1882/4983771983627.jpg?_ex=300x300',
    enabled: true,
    attributes: { boilSpeed: 3, tempControl: 1, easeOfCare: 2, safety: 2, lightness: 4, keepWarm: false, cap08: true, cap10: true, cap12: false },
  },
  {
    // アイリスオーヤマ 電気ケトル IBKT-800 / 0.8L / カップ1杯 約60秒 / 本体0.7kg（電源プレート含まず）/ 転倒湯漏れ防止・空だき防止 / 3,680円（2026-09-25 確認）
    id: 'electric-kettle-103',
    name: 'アイリスオーヤマ 電気ケトル IBKT-800',
    category: 'electric-kettle',
    description: '本体0.7kgの軽い0.8L電気ケトル。転倒湯漏れ防止構造で、倒れてもお湯がこぼれにくい設計です。',
    priceRange: 1,
    features: ['容量 0.8L', 'カップ1杯 約60秒', '転倒湯漏れ防止構造', '空だき防止', '本体 約0.7kg'],
    pros: ['本体が軽い', '手頃な価格'],
    cons: ['温度調節・保温はありません', '給湯ロックはありません（注ぎ口から少量のお湯が出ることがあります）'],
    recommendFor: '手頃な価格で、軽くて扱いやすい小さめのケトルがほしい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00t3zto.d8zuee14.g00t3zto.d8zuf2f4/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Firisplaza-r%2F202601%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Firisplaza-r%2Fi%2F10159024%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/irisplaza-r/cabinet/web11/imgrc0104124750.jpg?_ex=300x300',
    enabled: true,
    attributes: { boilSpeed: 4, tempControl: 1, easeOfCare: 3, safety: 3, lightness: 5, keepWarm: false, cap08: true, cap10: false, cap12: false },
  },
  {
    // タイガー 蒸気レス電気ケトル＜QUICK＆SAFE＋＞ PCV-A100 / 1.0L / カップ1杯 57秒 / 本体0.8kg / 蒸気レス・転倒お湯もれ防止・本体二重構造・カラだき防止・給湯ロック / 6,862円（2026-09-25 確認）
    id: 'electric-kettle-104',
    name: 'タイガー 蒸気レス電気ケトル PCV-A100',
    category: 'electric-kettle',
    description: '蒸気を外に出さない「蒸気レス」構造と本体二重構造を備えた1.0Lの電気ケトル。転倒お湯もれ防止・給湯ロックも付いています。',
    priceRange: 2,
    features: ['容量 1.0L', 'カップ1杯 約57秒', '蒸気レス', '本体二重構造', '転倒お湯もれ防止', '給湯ロックボタン', '広口・W水量窓'],
    pros: ['安全機能がとても充実している', '蒸気が出にくく置き場所に困りにくい', '広口で洗いやすい'],
    cons: ['温度調節・保温はありません'],
    recommendFor: '小さなお子さまやペットがいて、安全性を特に重視したい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00tit6o.d8zuebed.g00tit6o.d8zuf23f/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fksdenki%2F4904710439685%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fksdenki%2Fi%2F10508048%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/ksdenki/cabinet/images/85_5/4904710439685_5.jpg?_ex=300x300',
    enabled: true,
    attributes: { boilSpeed: 4, tempControl: 1, easeOfCare: 4, safety: 5, lightness: 4, keepWarm: false, cap08: true, cap10: true, cap12: false },
  },
  {
    // 象印 電気ケトル CK-SA08 / 0.8L / カップ1杯 約60秒 / 本体0.8kg / 転倒湯もれ防止・蒸気セーブ・空だき防止・本体二重構造・給湯ロック / 5,866円（2026-09-25 確認）
    id: 'electric-kettle-105',
    name: '象印 電気ケトル CK-SA08',
    category: 'electric-kettle',
    description: '転倒湯もれ防止・蒸気セーブ・本体二重構造・給湯ロックなど、安全設計を重ねた0.8Lの電気ケトル。',
    priceRange: 2,
    features: ['容量 0.8L', 'カップ1杯 約60秒', '転倒湯もれ防止構造', '蒸気セーブ構造', '本体二重構造', '給湯ロックボタン', '広口内容器'],
    pros: ['安全機能がとても充実している', '本体が熱くなりにくい二重構造', '広口で洗いやすい'],
    cons: ['温度調節・保温はありません'],
    recommendFor: '小さなお子さまがいるなど、安全性を特に重視したい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00t3jpo.d8zuedce.g00t3jpo.d8zufb63/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fyamada-denki%2F6612313019%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fyamada-denki%2Fi%2F10598377%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/yamada-denki/cabinet/a07000330/6612313019.jpg?_ex=300x300',
    enabled: true,
    attributes: { boilSpeed: 4, tempControl: 1, easeOfCare: 4, safety: 5, lightness: 4, keepWarm: false, cap08: true, cap10: false, cap12: false },
  },
  {
    // タイガー 電気ケトル PCT-A120 / 1.2L / カップ1杯 59秒 / 本体0.73kg / 転倒お湯もれ防止・省スチーム・カラだき防止・給湯ロック / 5,463円（2026-09-25 確認）
    id: 'electric-kettle-106',
    name: 'タイガー 電気ケトル スゴ軽 PCT-A120',
    category: 'electric-kettle',
    description: '1.2Lの大容量ながら本体0.73kgと軽い電気ケトル。転倒お湯もれ防止・給湯ロックなどの安全設計です。',
    priceRange: 2,
    features: ['容量 1.2L', 'カップ1杯 約59秒', '本体 約0.73kg', '転倒お湯もれ防止構造', '給湯ロックボタン', '省スチーム設計', '注ぎ口カバー'],
    pros: ['大容量なのに本体が軽い', '安全機能が充実している'],
    cons: ['温度調節・保温はありません'],
    recommendFor: '家族分をたっぷり沸かしたいけれど、重いケトルは避けたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00r8mvo.d8zued00.g00r8mvo.d8zuf260/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fr-kojima%2F4904710443545%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fr-kojima%2Fi%2F11653912%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/r-kojima/cabinet/n0000001520/4904710443545_1.jpg?_ex=300x300',
    enabled: true,
    attributes: { boilSpeed: 4, tempControl: 1, easeOfCare: 3, safety: 5, lightness: 4, keepWarm: false, cap08: true, cap10: true, cap12: true },
  },
  {
    // タイガー 蒸気レス電気ケトル＜QUICK＆SAFE＋＞（温度調節機能つき）PTV-A120 / 1.2L / カップ1杯 57秒 / 温度6段階 / 本体0.85kg / 蒸気レス・転倒お湯もれ防止・本体二重構造・カラだき防止・給湯ロック / 12,930円（2026-09-25 確認）
    id: 'electric-kettle-107',
    name: 'タイガー 蒸気レス電気ケトル 温度調節機能つき PTV-A120',
    category: 'electric-kettle',
    description: '1.2Lの大容量で、6段階の温度調節ができる蒸気レスの電気ケトル。転倒お湯もれ防止・本体二重構造・給湯ロックも備えています。',
    priceRange: 3,
    features: ['容量 1.2L', '温度調節 6段階', 'カップ1杯 約57秒', '蒸気レス', '本体二重構造', '転倒お湯もれ防止・給湯ロック', '広口・W水量窓'],
    pros: ['大容量で温度調節ができる', '安全機能がとても充実している', '広口で洗いやすい'],
    cons: ['保温機能はありません（本体二重構造で冷めにくい設計）', '温度はダイヤルの目安で、1℃単位ではありません'],
    recommendFor: '家族分をたっぷり沸かしながら、温度調節と安全性も重視したい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00r8mvo.d8zued00.g00r8mvo.d8zuf260/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fr-kojima%2F4904710440827%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fr-kojima%2Fi%2F11513743%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/r-kojima/cabinet/n0000001196/4904710440827_1.jpg?_ex=300x300',
    enabled: true,
    attributes: { boilSpeed: 4, tempControl: 4, easeOfCare: 4, safety: 5, lightness: 4, keepWarm: false, cap08: true, cap10: true, cap12: true },
  },
  {
    // 山善 温度調節機能付き電気ケトル EGL-C1281 / 0.8L / 50〜100℃ 1℃単位・保温1時間 / 900g（電源プレートにセットした状態）/ 空だき防止 / 8,980円（2026-09-25 確認）
    id: 'electric-kettle-108',
    name: '山善 温度調節機能付き電気ケトル EGL-C1281',
    category: 'electric-kettle',
    description: '50〜100℃を1℃単位で設定できる細口の電気ケトル。1時間の保温機能付きで、ハンドドリップにも使いやすい形です。',
    priceRange: 3,
    features: ['温度設定 50〜100℃（1℃単位）', '保温 1時間', '細口ノズル', '空だき防止', '容量 0.8L', '質量 約900g（電源プレート込み）'],
    pros: ['温度を1℃単位で細かく設定できる', '保温機能付き'],
    cons: ['転倒時の湯もれ防止・蒸気対策の公式の記載はありません', 'ケトル本体が熱くなるため取っ手以外に触れないよう注意が必要です'],
    recommendFor: 'コーヒーやお茶に合わせて、温度を細かく設定したい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00tlfdo.d8zuefb3.g00tlfdo.d8zufad3/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fyamazenkaden%2F76033%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fyamazenkaden%2Fi%2F10002614%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/yamazenkaden/cabinet/main-img/018/main-s4x25.jpg?_ex=300x300',
    enabled: true,
    attributes: { boilSpeed: 3, tempControl: 5, easeOfCare: 2, safety: 2, lightness: 4, keepWarm: true, cap08: true, cap10: false, cap12: false },
  },
  {
    // シロカ 温度調節電気ケトル SK-D271 / 0.8L / 60〜100℃ 1℃単位・保温10〜60分 / 本体0.65kg / 転倒湯もれ防止・空だき防止 / 12,980円（2026-09-25 確認）
    id: 'electric-kettle-109',
    name: 'シロカ 温度調節電気ケトル SK-D271',
    category: 'electric-kettle',
    description: '60〜100℃を1℃単位で設定でき、沸騰後に設定温度で保温する「煮沸モード」も備えた軽量の電気ケトル。',
    priceRange: 3,
    features: ['温度設定 60〜100℃（1℃単位）', '保温 10〜60分', '煮沸モード', '転倒湯もれ防止構造', '空だき防止', '本体 約0.65kg'],
    pros: ['温度を細かく設定できて本体も軽い', '広い口径で洗いやすい'],
    cons: ['カップ1杯分の沸騰時間の公式値はありません', '消費電力は900Wです'],
    recommendFor: '温度調節・保温と軽さの両方を重視したい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00u50qo.d8zue695.g00u50qo.d8zuf217/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fsiroca%2Fsk-d271%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fsiroca%2Fi%2F10000214%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/siroca/cabinet/sk-d271/imgrc0121347582.jpg?_ex=300x300',
    enabled: true,
    attributes: { boilSpeed: 3, tempControl: 5, easeOfCare: 3, safety: 3, lightness: 5, keepWarm: true, cap08: true, cap10: false, cap12: false },
  },
  {
    // タイガー 蒸気レス電気ケトル PTQ-A100 / 1.0L / カップ1杯 約45秒 / 温度6段階・約5分の保温 / 本体1.1kg / 7つの安全構造 / 15,800円（2026-09-25 確認）
    id: 'electric-kettle-110',
    name: 'タイガー 蒸気レス電気ケトル PTQ-A100',
    category: 'electric-kettle',
    description: 'カップ1杯約45秒で沸き、6段階の温度調節と蒸気レス・二重構造など7つの安全構造を備えた1.0Lの電気ケトル。',
    priceRange: 4,
    features: ['カップ1杯 約45秒', '温度調節 6段階', '蒸気レス', '本体二重構造', '転倒お湯もれ防止・傾斜ふたロック', '内側フッ素コート', '容量 1.0L'],
    pros: ['沸騰がとても速い', '安全機能と温度調節の両方がそろっている', '内側がフッ素コートで洗いやすい'],
    cons: ['本体は約1.1kgと重めです', '保温は設定温度を下回ったときの約5分間です', '価格は高めです'],
    recommendFor: '速さ・安全性・温度調節をすべて重視し、予算に余裕がある人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00unuvo.d8zue078.g00unuvo.d8zufa1d/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ftiger-official-store%2Fptq-a100%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Ftiger-official-store%2Fi%2F10000154%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/tiger-official-store/cabinet/ptq-a100.jpg?_ex=300x300',
    enabled: true,
    attributes: { boilSpeed: 5, tempControl: 4, easeOfCare: 4, safety: 5, lightness: 3, keepWarm: true, cap08: true, cap10: true, cap12: false },
  },
]

/** 容量の条件を選んだときに結果の上部に出す説明 */
const capNotice = (liter: string) => `満水容量が${liter}以上の電気ケトルからおすすめを表示しています。`

export const electricKettle: Diagnosis = {
  id: 'electric-kettle',
  slug: 'electric-kettle',
  name: '電気ケトル診断',
  itemName: '電気ケトル',
  group: 'kitchen',
  icon: '☕',
  shortDescription: '沸かす量・温度調節・保温・安全性・お手入れ・予算から、あなたに合う電気ケトルを診断。',
  intro:
    '家庭用の電気ケトルを選ぶ診断です。一番重視すること、一度に沸かす量、温度調節、保温、安全性・扱いやすさ、予算の6つの質問から、あなたに合いそうな電気ケトルを相性順に表示します。',
  seo: {
    title: '電気ケトル診断｜質問に答えてあなたに合う電気ケトルをチェック',
    description:
      '電気ケトルを無料診断。沸かす量・沸騰の速さ・温度調節・保温・安全機能・お手入れ・予算など6つの質問に答えるだけで、メーカー公式の仕様をもとに、あなたに合う電気ケトルが分かります。',
  },
  priceLabels: {
    1: '〜4,000円',
    2: '4,000〜8,000円',
    3: '8,000〜15,000円',
    4: '15,000円〜',
  },
  questions: [
    {
      id: 'priority',
      text: '一番重視することは？',
      shortLabel: '重視すること',
      weight: 24,
      options: [
        { id: 'speed', label: '早く沸くこと', summary: '沸騰の速さを重視', effects: [{ type: 'atLeast', attr: 'boilSpeed', value: 5 }] },
        { id: 'temp', label: '温度を選べること', summary: '温度調節を重視', effects: [{ type: 'atLeast', attr: 'tempControl', value: 5 }] },
        { id: 'safety', label: '安全性', summary: '安全性を重視', effects: [{ type: 'atLeast', attr: 'safety', value: 5 }] },
        { id: 'care', label: 'お手入れのしやすさ', summary: 'お手入れのしやすさを重視', effects: [{ type: 'atLeast', attr: 'easeOfCare', value: 5 }] },
        { id: 'light', label: '軽さ・扱いやすさ', summary: '軽さ・扱いやすさを重視', effects: [{ type: 'atLeast', attr: 'lightness', value: 5 }] },
      ],
    },
    {
      id: 'amount',
      text: '一度に沸かす量は？',
      shortLabel: '沸かす量',
      help: 'カップ1杯は約140mLが目安です。',
      // 容量が足りない商品を上位に出さないため、満水容量を適格条件にする（採点には使わない）
      weight: 16,
      options: [
        { id: 'small', label: '1〜2杯分（0.5L程度）', summary: '1〜2杯分を沸かす', effects: [] },
        {
          id: 'l08',
          label: '3〜5杯分（0.8L前後）',
          summary: '3〜5杯分を沸かす',
          effects: [],
          eligibility: { attr: 'cap08', value: true, notice: capNotice('0.8L'), supplementLabel: '容量が0.8L未満です' },
        },
        {
          id: 'l10',
          label: 'カップ麺や家族分も（1.0L前後）',
          summary: '1.0L前後を沸かす',
          effects: [],
          eligibility: { attr: 'cap10', value: true, notice: capNotice('1.0L'), supplementLabel: '容量が1.0L未満です' },
        },
        {
          id: 'l12',
          label: '料理にもたっぷり（1.2L以上）',
          summary: '1.2L以上を沸かす',
          effects: [],
          eligibility: { attr: 'cap12', value: true, notice: capNotice('1.2L'), supplementLabel: '容量が1.2L未満です' },
        },
      ],
    },
    {
      id: 'temp',
      text: 'お湯の温度調節は必要ですか？',
      shortLabel: '温度調節',
      help: 'コーヒーやお茶に合わせて、沸騰より低い温度で止められる機能です。',
      weight: 14,
      options: [
        { id: 'none', label: '沸騰だけでよい', effects: [] },
        { id: 'some', label: '数段階あればよい', summary: '温度を数段階で選びたい', effects: [{ type: 'atLeast', attr: 'tempControl', value: 3 }] },
        { id: 'fine', label: '細かく設定したい', summary: '温度を細かく設定したい', effects: [{ type: 'atLeast', attr: 'tempControl', value: 5 }] },
      ],
    },
    {
      id: 'warm',
      text: '沸かしたお湯の保温は？',
      shortLabel: '保温',
      weight: 12,
      options: [
        { id: 'yes', label: '保温したい', summary: '保温機能が欲しい', effects: [{ type: 'equals', attr: 'keepWarm', value: true }] },
        { id: 'no', label: '保温は使わない', effects: [] },
      ],
    },
    {
      id: 'handling',
      text: '安全性・扱いやすさで特に気になることは？',
      shortLabel: '安全性・扱いやすさ',
      weight: 14,
      options: [
        { id: 'safety', label: '転倒・蒸気・やけどが心配', summary: '安全機能を重視', effects: [{ type: 'atLeast', attr: 'safety', value: 4 }] },
        { id: 'light', label: '軽くて持ちやすいもの', summary: '軽さを重視', effects: [{ type: 'atLeast', attr: 'lightness', value: 4 }] },
        { id: 'care', label: '中まで洗いやすいもの', summary: 'お手入れのしやすさを重視', effects: [{ type: 'atLeast', attr: 'easeOfCare', value: 4 }] },
        { id: 'none', label: '特にない', effects: [] },
      ],
    },
    budgetQuestion({
      text: '予算は？',
      weight: 20,
      bands: [
        { label: '4,000円以下', summary: '予算4,000円以下' },
        { label: '8,000円以下', summary: '予算8,000円以下' },
        { label: '15,000円以下', summary: '予算15,000円以下' },
      ],
      // 「高価格の商品を希望する」ではなく「予算の上限を実質設けない」という意味。価格では採点しない
      noLimitLabel: '15,000円以上でもOK',
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
    title: '電気ケトルの選び方',
    intro: 'この診断は、家庭用の電気ケトルを対象に、メーカー公式の仕様をもとに以下のポイントとあなたの回答を照らし合わせて相性を計算しています。',
    sections: [
      { heading: '容量', body: '1〜2杯分なら0.6L前後、家族分やカップ麺・料理にも使うなら1.0L以上が目安です。容量が大きいほど本体は重くなりがちです。' },
      { heading: '沸騰の速さ', body: '沸騰時間はメーカーによって測る量が違います。この診断では「カップ1杯分（140mL）」の公式値だけで比べています。' },
      { heading: '温度調節・保温', body: 'コーヒーや緑茶など飲み物に合わせたいなら温度調節、続けて使うなら保温機能が便利です。' },
      {
        heading: '安全機能',
        body: '小さなお子さまや高齢の方がいるご家庭では、安全機能を確認しましょう。',
        points: ['転倒湯もれ防止', '蒸気レス・蒸気セーブ', '空だき防止', '本体が熱くなりにくい二重構造', 'ふたロック・給湯ロック'],
      },
      { heading: 'お手入れ', body: '手が入る広口や、外せるフィルター・ふたがあると、内側のカルキ汚れを落としやすくなります。' },
    ],
  },
  notice: '沸騰時間・容量はメーカー公表値です。使用環境（水温・電圧など）によって変わります。本診断は使い方や好みから電気ケトルの候補を探すためのものです。',
  enabled: true,
}

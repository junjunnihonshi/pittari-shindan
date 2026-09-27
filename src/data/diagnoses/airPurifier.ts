import type { Diagnosis, Product } from '../../types/diagnosis.ts'
import { budgetQuestion } from './shared.ts'

/**
 * 空気清浄機診断
 *
 * 【対象範囲】家庭用の空気清浄機（加湿機能付きも可。ただし空気清浄が主機能の商品に限る）。
 *   対象外：業務用、車載用、卓上小型、加湿器・扇風機・ヒーターなどが主機能の商品、公式仕様を確認できない商品
 *
 * 商品の attributes（評価項目）。数値は 1〜5（採点基準：data/rakuten-candidates/air-purifier/scoring-criteria.md）
 *   cleanSpeed  : 集じんの速さ（JEM1467 の「8畳の清浄時間」。記載がなければ中立の 3。最大風量は使わない）
 *   deodorize   : 脱臭機能（脱臭フィルター・独立した脱臭フィルター・ニオイセンサー・脱臭の専用運転の数）
 *   quietness   : 静かさ（最も静かな空気清浄運転の公式 dB を幅の広い区分で判定。記載がなければ中立の 3）
 *   easeOfCare  : お手入れの手軽さ（フィルター交換目安 10年以上・自動掃除・加湿機能なし の数）
 *   compactness : 本体サイズ・置きやすさ（公式の外形寸法から求めた体積と質量の、低いほうの評価）
 * true / false の項目
 *   humidify : 加湿機能がある
 *   room10 / room18 / room25 / room32 : 公式の空気清浄 適用床面積（JEM1467）が 10 / 18 / 25 / 32畳 以上。
 *     広いほど高得点にはせず、部屋の広さとの適合（適格条件）にだけ使う
 * 消費電力・独自技術（イオン・除菌など）は採点しない。価格帯（priceRange）は priceLabels を参照。
 *
 * 【並び順のルール】（共通エンジンの設定）
 *   - Q2 部屋の広さ：能力が足りない商品を上位に出さないため、適用床面積を適格条件（eligibility）にする
 *   - Q3 加湿機能：「欲しい」を選んだときは加湿機能付きを適格条件にする
 *   - Q7 予算：予算内の商品を通常ランキングの候補にする（上限条件）
 *   - 通常ランキングが3件に満たないときだけ、条件を満たさない商品を別枠に表示する
 *   - 相性スコアが完全に同じときは、回答に関係する一致度 → 評価値 → 商品ID の順で並べる（scoring.tieBreak）
 *
 * 商品はメーカー公式情報で評価した実商品10機種（2026-09-27 確認）。根拠は data/rakuten-candidates/air-purifier/product-evaluations.json。
 */

/** 商品データ（実商品10機種。評価値はメーカー公式情報に基づく：data/rakuten-candidates/air-purifier/product-evaluations.json、採点基準 v1） */
const products: Product[] = [
  {
    // アイリスオーヤマ 空気清浄機 10畳 AAP-S20C / 約10畳 / φ210×高さ310mm（約13.7L） / 12,800円（2026-09-27 確認）
    id: 'air-purifier-101',
    name: 'アイリスオーヤマ 空気清浄機 10畳 AAP-S20C',
    category: 'air-purifier',
    description: '直径21cm・質量1.8kgのコンパクトな空気清浄機。集じん脱臭フィルターとにおいを感知するセンサーを搭載しています。',
    priceRange: 1,
    features: ['空気清浄 適用床面積 約10畳（JEM1467）', '集じん脱臭フィルター（HEPA）', 'キレイセンサー（におい）', '運転音 弱 20dB', '本体 φ210×高さ310mm・約1.8kg'],
    pros: ['小さく軽いので置き場所を選びにくい', '手頃な価格'],
    cons: ['楽天の商品ページで「加湿：なし」のSKUを選ぶ必要があります', 'フィルターの交換目安は約2年です', '8畳の清浄時間の公式値はありません'],
    recommendFor: '寝室や個室など10畳までの部屋で、手頃な価格の小型機がほしい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00t3zto.d8zuee14.g00t3zto.d8zuf2f4/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Firisplaza-r%2F209793%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Firisplaza-r%2Fi%2F10168280%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/irisplaza-r/cabinet/11073544/12380730/imgrc0111374601.jpg?_ex=300x300',
    enabled: true,
    attributes: { cleanSpeed: 3, deodorize: 3, quietness: 4, easeOfCare: 2, compactness: 5, humidify: false, room10: true, room18: false, room25: false, room32: false },
  },
  {
    // Levoit 空気清浄機 Core 300 / 20畳 / 22×22×36cm（17.4L） / 12,980円（2026-09-27 確認）
    id: 'air-purifier-102',
    name: 'Levoit 空気清浄機 Core 300',
    category: 'air-purifier',
    description: '幅22cm・質量3.5kgのコンパクトな空気清浄機。公式の適用面積は20畳です。',
    priceRange: 1,
    features: ['適用面積 20畳', '8畳の清浄時間 13分', 'プレフィルター・HEPA・脱臭活性炭の3層フィルター', '運転音 24dB〜', '本体 22×22×36cm・3.5kg'],
    pros: ['小さく軽いのに20畳まで対応', '手頃な価格'],
    cons: ['楽天の商品ページで「Core 300」のSKUを選ぶ必要があります（300S・300Pro と同じページ）', 'ニオイセンサーはありません', 'フィルターは定期的な交換が必要です'],
    recommendFor: '手頃な価格で、置き場所を取らない空気清浄機がほしい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00u8ebo.d8zue9b8.g00u8ebo.d8zufd2e/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fvesync%2Fheapaplvnjp0017%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fvesync%2Fi%2F10000009%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/vesync/cabinet/10546064/11960561/core300.jpg?_ex=300x300',
    enabled: true,
    attributes: { cleanSpeed: 3, deodorize: 2, quietness: 3, easeOfCare: 2, compactness: 5, humidify: false, room10: true, room18: true, room25: false, room32: false },
  },
  {
    // SwitchBot 空気清浄機 / 〜25畳 / 250×250×490mm（30.6L） / 18,200円（2026-09-27 確認）
    id: 'air-purifier-103',
    name: 'SwitchBot 空気清浄機',
    category: 'air-purifier',
    description: 'ペット専用の活性炭フィルターとニオイセンサー、ペットモードを備えた空気清浄機。アプリからの操作にも対応しています。',
    priceRange: 2,
    features: ['適用床面積 〜25畳（JEM1467）', '8畳を11分', 'ペット専用活性炭フィルター', 'ニオイセンサー・ペットモード', '最小運転音 20dB', '本体 250×250×490mm・4.4kg'],
    pros: ['脱臭関連の機能が多い', 'ペットの毛を捕らえるプレフィルター'],
    cons: ['楽天の商品ページで「空気清浄機」のSKUを選ぶ必要があります（Table と同じページ）', 'HEPA・活性炭フィルターは水洗いできず、定期的な交換が必要です'],
    recommendFor: 'ペットのニオイや毛が気になる、リビングにも使える空気清浄機がほしい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00uc4wo.d8zue922.g00uc4wo.d8zuf2ce/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fswitchbot%2F1000010929%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fswitchbot%2Fi%2F10000236%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/switchbot/cabinet/09377790/airpurifier/amazon/imgrc0083606257.jpg?_ex=300x300',
    enabled: true,
    attributes: { cleanSpeed: 4, deodorize: 5, quietness: 4, easeOfCare: 2, compactness: 3, humidify: false, room10: true, room18: true, room25: true, room32: false },
  },
  {
    // シャープ プラズマクラスター空気清浄機 FU-S50 / 〜23畳 / 383×209×540mm（43.2L） / 20,300円（2026-09-27 確認）
    id: 'air-purifier-104',
    name: 'シャープ プラズマクラスター空気清浄機 FU-S50',
    category: 'air-purifier',
    description: '薄型で壁ぎわに置きやすい空気清浄機。集じん・脱臭フィルターはどちらも交換目安が約10年です。',
    priceRange: 2,
    features: ['空気清浄 適用床面積 〜23畳（JEM1467）', '8畳の清浄時間 12分', '静電HEPA・脱臭フィルター（交換目安 約10年）', 'ニオイセンサー', '運転音 静音 21dB', '本体 383×209×540mm・約4.9kg'],
    pros: ['フィルター交換の手間が少ない', '加湿機能がないので給水の手入れが不要'],
    cons: ['加湿機能はありません'],
    recommendFor: 'リビングや寝室で、手入れの手間が少ない空気清浄機を選びたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00qn68o.d8zuee0f.g00qn68o.d8zuf9b5/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fa-price%2F2980000205750%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fa-price%2Fi%2F10846751%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/a-price/cabinet/mailmaga/08814302/2980000205750.jpg?_ex=300x300',
    enabled: true,
    attributes: { cleanSpeed: 4, deodorize: 4, quietness: 4, easeOfCare: 4, compactness: 3, humidify: false, room10: true, room18: true, room25: false, room32: false },
  },
  {
    // シャープ 加湿空気清浄機 KC-T50 / 空気清浄 〜23畳 / 399×230×613mm（56.3L） / 20,800円（2026-09-27 確認）
    id: 'air-purifier-105',
    name: 'シャープ 加湿空気清浄機 KC-T50',
    category: 'air-purifier',
    description: '最大500mL/hの加湿機能付き空気清浄機。集じん・脱臭フィルターの交換目安は約10年です。',
    priceRange: 2,
    features: ['空気清浄 適用床面積 〜23畳（加湿空気清浄時 〜15畳）', '8畳の清浄時間 12分', '加湿 最大500mL/h', '静電HEPA・ダブル脱臭フィルター（交換目安 約10年）', 'ニオイ・湿度・温度センサー', '運転音 静音 20dB', '本体 約7.5kg'],
    pros: ['加湿もできて価格が手頃', 'フィルターの交換目安が長い'],
    cons: ['加湿時は給水と加湿フィルター・トレーの手入れが必要です', '加湿空気清浄時の適用床面積は〜15畳です'],
    recommendFor: '手頃な価格で、空気清浄と加湿を1台で済ませたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00qn68o.d8zuee0f.g00qn68o.d8zuf9b5/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fa-price%2F4974019102863%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fa-price%2Fi%2F10783843%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/a-price/cabinet/mailmaga/08814302/12654252/imgrc0116015580.jpg?_ex=300x300',
    enabled: true,
    attributes: { cleanSpeed: 4, deodorize: 4, quietness: 4, easeOfCare: 3, compactness: 2, humidify: true, room10: true, room18: true, room25: false, room32: false },
  },
  {
    // ダイキン 加湿ストリーマ空気清浄機 MCK505A / 〜22畳 / H700×W270×D270mm（51.0L） / 32,970円（2026-09-27 確認）
    id: 'air-purifier-106',
    name: 'ダイキン 加湿ストリーマ空気清浄機 MCK505A',
    category: 'air-purifier',
    description: '最大460mL/hの加湿機能付き空気清浄機。幅27cmのタワー型で、ニオイセンサーを搭載しています。',
    priceRange: 3,
    features: ['空気清浄 適用床面積 〜22畳（JEM1467）', '8畳を清浄する目安 13分', '加湿 最大460mL/h', '静電HEPAフィルター（交換目安 約10年）・脱臭フィルター', 'ニオイセンサー', '運転音 しずか 19dB', '本体 H700×W270×D270mm・9.5kg'],
    pros: ['幅27cmのスリムなタワー型', '加湿もできる'],
    cons: ['質量が9.5kgあり、移動はやや大変です', '加湿時は給水と加湿フィルターの手入れが必要です'],
    recommendFor: '限られた床スペースで、加湿と空気清浄を1台で済ませたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pj47o.d8zue125.g00pj47o.d8zufaa6/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmitsuyoshi%2Fdkn00000000124%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fmitsuyoshi%2Fi%2F10057941%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/mitsuyoshi/cabinet/top/rkyan/0930-1/dkn00000000124-01.jpg?_ex=300x300',
    enabled: true,
    attributes: { cleanSpeed: 3, deodorize: 4, quietness: 4, easeOfCare: 3, compactness: 2, humidify: true, room10: true, room18: true, room25: false, room32: false },
  },
  {
    // パナソニック 加湿空気清浄機 F-VXW55 / 旧基準 / 562×360×238mm（48.2L） / 46,623円（2026-09-27 確認）
    id: 'air-purifier-107',
    name: 'パナソニック 加湿空気清浄機 F-VXW55',
    category: 'air-purifier',
    description: '静音運転18dBの加湿空気清浄機。集じん・脱臭フィルターの交換目安は約10年です。',
    priceRange: 3,
    features: ['空気清浄 適用床面積 25畳（旧基準）／14畳（新基準）', '8畳の清浄時間 約13分', '加湿 最大500mL/h', '静電HEPA・脱臭フィルター（交換目安 約10年）', '運転音 静音 18dB', '本体 約8.0kg'],
    pros: ['静音運転の運転音が小さい', 'フィルターの交換目安が長い'],
    cons: ['ニオイセンサーはありません', '加湿時は給水と加湿フィルターの手入れが必要です', '新基準（JEM1467:2026）の適用床面積は14畳です'],
    recommendFor: '寝室などで、静かに使える加湿空気清浄機がほしい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pjgho.d8zuef1c.g00pjgho.d8zuf387/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmasanios%2Fpa-f-vxw55-w%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fmasanios%2Fi%2F10180011%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/masanios/cabinet/2501/imgrc0114733400.jpg?_ex=300x300',
    enabled: true,
    attributes: { cleanSpeed: 3, deodorize: 4, quietness: 5, easeOfCare: 3, compactness: 2, humidify: true, room10: true, room18: true, room25: true, room32: false },
  },
  {
    // バルミューダ ザ・ピュア A01A / 〜36畳 / 260×260×700mm（47.3L） / 52,750円（2026-09-27 確認）
    id: 'air-purifier-108',
    name: 'バルミューダ ザ・ピュア A01A',
    category: 'air-purifier',
    description: '幅26cmの縦長デザインで、公式の適用床面積は〜36畳。8畳を8分で清浄します。',
    priceRange: 4,
    features: ['適用床面積 〜36畳（JEM1467）', '8畳の清浄時間 8分', '集じんフィルター・脱臭フィルター', '運転音 19dB〜', '本体 260×260×700mm・約7.4kg'],
    pros: ['広い部屋にも対応し、清浄時間が短い', '床面積が小さい縦長の本体'],
    cons: ['フィルターは1年に1回の交換が推奨されています', 'ニオイセンサーはありません', '価格が高め'],
    recommendFor: '広めのリビングで、置きやすいデザインの空気清浄機を選びたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00s8b0o.d8zuefd0.g00s8b0o.d8zuff18/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fgbft-ltd%2Fd0-jjxi-0sef%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fgbft-ltd%2Fi%2F10028030%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/gbft-ltd/cabinet/image32/d0-jjxi-0sef_1.jpg?_ex=300x300',
    enabled: true,
    attributes: { cleanSpeed: 5, deodorize: 3, quietness: 4, easeOfCare: 2, compactness: 2, humidify: false, room10: true, room18: true, room25: true, room32: true },
  },
  {
    // パナソニック 加湿空気清浄機 F-VXW90 / 旧基準 / 640×398×287mm（73.1L） / 90,916円（2026-09-27 確認）
    id: 'air-purifier-109',
    name: 'パナソニック 加湿空気清浄機 F-VXW90',
    category: 'air-purifier',
    description: '公式の適用床面積40畳（旧基準）の大型加湿空気清浄機。ニオイセンサーやひとセンサーなど機能が充実しています。',
    priceRange: 4,
    features: ['空気清浄 適用床面積 40畳（旧基準）／23畳（新基準）', '8畳の清浄時間 約8分', '加湿 最大930mL/h', '静電HEPA・脱臭フィルター（交換目安 約10年）', 'ハウスダスト・ニオイ・ひとセンサー', '運転音 静音 18dB', 'キャスター付き・本体 11.4kg'],
    pros: ['広い部屋にも対応し、清浄時間が短い', '静音運転の運転音が小さく、機能が多い'],
    cons: ['本体が大きく重い（11.4kg）', '価格が高め', '加湿時は給水と加湿フィルターの手入れが必要です'],
    recommendFor: '広いリビングで、空気清浄と加湿の機能をしっかりそろえたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00ubhyo.d8zue3ff.g00ubhyo.d8zuf4bd/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fpanasonic-store%2Ff-vxw90-tm%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fpanasonic-store%2Fi%2F10001297%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/panasonic-store/cabinet/banner/thumb/f-vxw90_main_00.jpg?_ex=300x300',
    enabled: true,
    attributes: { cleanSpeed: 5, deodorize: 5, quietness: 5, easeOfCare: 3, compactness: 1, humidify: true, room10: true, room18: true, room25: true, room32: true },
  },
  {
    // シャープ 加湿空気清浄機 KI-WX75 / 旧基準 / 395×265×650mm（68.0L） / 91,060円（2026-09-27 確認）
    id: 'air-purifier-110',
    name: 'シャープ 加湿空気清浄機 KI-WX75',
    category: 'air-purifier',
    description: '公式の適用床面積〜34畳（旧基準）の大型加湿空気清浄機。最大900mL/hの加湿と、ホコリ・ニオイなどのセンサーを備えています。',
    priceRange: 4,
    features: ['空気清浄 適用床面積 〜34畳（旧基準）／〜22畳（新基準）', '8畳の清浄時間 9分', '加湿 最大900mL/h', 'nanoHD・ダブル脱臭フィルター（交換目安 約10年）', 'ホコリ・ニオイ・湿度・温度・照度センサー', '運転音 静音 20dB', '本体 約12kg'],
    pros: ['広い部屋にも対応し、加湿量が多い', 'フィルターの交換目安が長い'],
    cons: ['本体が大きく重い（約12kg）', '価格が高め', '加湿時は給水と加湿フィルターの手入れが必要です'],
    recommendFor: '広いリビングで、たっぷり加湿もしたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00ps55o.d8zue2da.g00ps55o.d8zuf2da/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fs-oasis%2F00025702%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fs-oasis%2Fi%2F10028798%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/s-oasis/cabinet/005/00025702.jpg?_ex=300x300',
    enabled: true,
    attributes: { cleanSpeed: 5, deodorize: 4, quietness: 4, easeOfCare: 3, compactness: 1, humidify: true, room10: true, room18: true, room25: true, room32: true },
  },
]

/** 部屋の広さの条件を選んだときに結果の上部に出す説明 */
const roomNotice = (tatami: number) =>
  `メーカー公式の空気清浄の適用床面積（日本電機工業会規格 JEM1467）が${tatami}畳以上の空気清浄機からおすすめを表示しています。適用床面積は目安で、規格の版によって値が異なる場合があります。`

export const airPurifier: Diagnosis = {
  id: 'air-purifier',
  slug: 'air-purifier',
  name: '空気清浄機診断',
  itemName: '空気清浄機',
  group: 'life',
  icon: '🍃',
  shortDescription: '気になるもの・部屋の広さ・加湿・静かさ・お手入れ・サイズ・予算から、あなたに合う空気清浄機を診断。',
  intro:
    '家庭用の空気清浄機を選ぶ診断です。一番気になるもの、部屋の広さ、加湿機能、静かさ、お手入れ、本体サイズ、予算の7つの質問から、あなたに合いそうな空気清浄機を相性順に表示します。',
  seo: {
    title: '空気清浄機診断｜質問に答えてあなたに合う空気清浄機をチェック',
    description:
      '空気清浄機を無料診断。花粉・ほこり、ニオイ、ペット、部屋の広さ、加湿機能、静かさ、お手入れ、本体サイズ、予算など7つの質問に答えるだけで、メーカー公式の仕様をもとに、あなたに合う空気清浄機・加湿空気清浄機が分かります。',
  },
  priceLabels: {
    1: '〜15,000円',
    2: '15,000〜30,000円',
    3: '30,000〜50,000円',
    4: '50,000円〜',
  },
  questions: [
    {
      id: 'concern',
      text: '一番気になるものは？',
      shortLabel: '気になるもの',
      weight: 22,
      options: [
        { id: 'dust', label: '花粉・ほこり', summary: '花粉・ほこりが気になる', effects: [{ type: 'atLeast', attr: 'cleanSpeed', value: 4 }] },
        { id: 'odor', label: 'ニオイ', summary: 'ニオイが気になる', effects: [{ type: 'atLeast', attr: 'deodorize', value: 4 }] },
        {
          id: 'pet',
          label: 'ペットの毛・ニオイ',
          summary: 'ペットの毛やニオイが気になる',
          effects: [
            { type: 'atLeast', attr: 'cleanSpeed', value: 4 },
            { type: 'atLeast', attr: 'deodorize', value: 4 },
          ],
        },
        {
          id: 'all',
          label: '全体的にバランスよく',
          summary: '全体のバランスを重視',
          effects: [
            { type: 'atLeast', attr: 'cleanSpeed', value: 3 },
            { type: 'atLeast', attr: 'deodorize', value: 3 },
            { type: 'atLeast', attr: 'quietness', value: 3 },
          ],
        },
      ],
    },
    {
      id: 'room',
      text: '使う部屋の広さは？',
      shortLabel: '部屋の広さ',
      help: 'メーカー公式の空気清浄の適用床面積が、選んだ広さ以上の空気清浄機からおすすめします。',
      // 能力が足りない商品を上位に出さないため、公式の適用床面積を適格条件にする（広さそのものは採点しない）
      weight: 16,
      options: [
        {
          id: 'r10',
          label: '〜10畳（寝室・個室など）',
          summary: '10畳までの部屋で使う',
          effects: [],
          eligibility: { attr: 'room10', value: true, notice: roomNotice(10), supplementLabel: '公式の適用床面積が10畳未満です' },
        },
        {
          id: 'r18',
          label: '11〜18畳（リビングなど）',
          summary: '18畳までの部屋で使う',
          effects: [],
          eligibility: { attr: 'room18', value: true, notice: roomNotice(18), supplementLabel: '公式の適用床面積が18畳未満です' },
        },
        {
          id: 'r25',
          label: '19〜25畳（広めのLDKなど）',
          summary: '25畳までの部屋で使う',
          effects: [],
          eligibility: { attr: 'room25', value: true, notice: roomNotice(25), supplementLabel: '公式の適用床面積が25畳未満です' },
        },
        {
          id: 'r32',
          label: '26畳以上',
          summary: '26畳以上の広い部屋で使う',
          effects: [],
          // 26畳以上の部屋には余裕を持たせ、適用床面積32畳以上を条件にする
          eligibility: { attr: 'room32', value: true, notice: roomNotice(32), supplementLabel: '公式の適用床面積が32畳未満です' },
        },
      ],
    },
    {
      id: 'humidify',
      text: '加湿機能は必要ですか？',
      shortLabel: '加湿機能',
      weight: 12,
      options: [
        {
          id: 'want',
          label: '欲しい',
          summary: '加湿機能が欲しい',
          effects: [],
          eligibility: {
            attr: 'humidify',
            value: true,
            notice: '加湿機能付きの空気清浄機からおすすめを表示しています。',
            supplementLabel: '加湿機能はありません',
          },
        },
        { id: 'no', label: '不要', summary: '加湿機能は不要', effects: [{ type: 'equals', attr: 'humidify', value: false }] },
        { id: 'any', label: 'こだわらない', effects: [] },
      ],
    },
    {
      id: 'noise',
      text: '運転音はどのくらい気になりますか？',
      shortLabel: '静かさ',
      weight: 12,
      options: [
        { id: 'very', label: 'とても気になる（寝室で使う など）', summary: '運転音がとても気になる', effects: [{ type: 'atLeast', attr: 'quietness', value: 4 }] },
        { id: 'some', label: '少し気になる', summary: '運転音が少し気になる', effects: [{ type: 'atLeast', attr: 'quietness', value: 3 }] },
        { id: 'any', label: '気にならない', effects: [] },
      ],
    },
    {
      id: 'care',
      text: 'お手入れはどのくらい手軽にしたい？',
      shortLabel: 'お手入れ',
      weight: 12,
      options: [
        { id: 'easy', label: 'できるだけ手軽にしたい', summary: 'お手入れを手軽にしたい', effects: [{ type: 'atLeast', attr: 'easeOfCare', value: 4 }] },
        { id: 'normal', label: 'ある程度ならできる', summary: 'ある程度のお手入れはできる', effects: [{ type: 'atLeast', attr: 'easeOfCare', value: 3 }] },
        { id: 'any', label: 'あまり気にしない', effects: [] },
      ],
    },
    {
      id: 'size',
      text: '本体の大きさ・置きやすさは？',
      shortLabel: '本体サイズ',
      weight: 12,
      options: [
        { id: 'compact', label: '小さく軽いものがいい', summary: '小さく軽いものがいい', effects: [{ type: 'atLeast', attr: 'compactness', value: 4 }] },
        { id: 'normal', label: '標準的な大きさならOK', summary: '標準的な大きさならOK', effects: [{ type: 'atLeast', attr: 'compactness', value: 2 }] },
        { id: 'any', label: '大きくても気にしない', effects: [] },
      ],
    },
    budgetQuestion({
      text: '予算は？',
      weight: 14,
      bands: [
        { label: '15,000円以下', summary: '予算15,000円以下' },
        { label: '30,000円以下', summary: '予算30,000円以下' },
        { label: '50,000円以下', summary: '予算50,000円以下' },
      ],
      // 「高価格の商品を希望する」ではなく「予算の上限を実質設けない」という意味。価格では採点しない
      noLimitLabel: '50,000円以上でもOK',
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
    title: '空気清浄機の選び方',
    intro:
      'この診断は、家庭用の空気清浄機を対象に、メーカー公式の仕様をもとに以下のポイントとあなたの回答を照らし合わせて相性を計算しています。メーカー独自の技術（イオン・除菌など）そのものには優劣をつけていません。',
    sections: [
      {
        heading: '適用床面積は部屋の広さに合わせる',
        body: '適用床面積は、日本電機工業会の規格（JEM1467）で決められた「30分で空気をきれいにできる広さ」の目安です。使う部屋の広さ以上のものを選びましょう。2026年に規格が改定され、新しい基準では同じ機種でも値が小さく表示されます。比べるときは、同じ基準の値どうしで比べましょう。',
      },
      {
        heading: '清浄時間',
        body: '「8畳の清浄時間」も JEM1467 で決められた目安です。短いほど、部屋の空気を早くきれいにできます。最大風量は測定条件がそろっていないため、この診断では比べていません。',
      },
      {
        heading: 'ニオイ対策',
        body: 'ニオイが気になる場合は、脱臭フィルターやニオイセンサーの有無を確認しましょう。タバコの有害物質（一酸化炭素など）や、常に発生し続けるニオイはすべて取れるわけではないため、換気との併用が大切です。',
      },
      {
        heading: 'お手入れとランニングコスト',
        body: 'フィルターの交換目安は機種によって約1〜2年のものから約10年のものまであります。加湿機能付きは、給水や加湿フィルター・トレーの定期的なお手入れも必要です。',
      },
      { heading: '静かさ', body: '寝室で使うなら、最も静かな運転モードの運転音（dB）を確認しましょう。測定条件はメーカーごとに異なる場合があるため、数dBの差は目安と考えましょう。' },
    ],
  },
  notice:
    '適用床面積・清浄時間は日本電機工業会規格（JEM1467）に基づくメーカーの公表値で、実際の部屋の条件によって変わります。本診断は使い方や好みから空気清浄機の候補を探すためのもので、花粉・ウイルスなどの除去効果や電気代を保証するものではありません。',
  enabled: true,
}

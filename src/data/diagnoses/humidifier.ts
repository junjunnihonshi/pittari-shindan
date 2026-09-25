import type { Diagnosis, Product } from '../../types/diagnosis.ts'
import { budgetQuestion } from './shared.ts'

/**
 * 加湿器診断
 *
 * 【対象範囲】家庭用の据え置き型加湿器（スチーム式・気化式・超音波式・ハイブリッド式）。
 *   対象外：卓上USBの超小型品、アロマディフューザー主体の商品、業務用、加湿機能がおまけの空気清浄機
 *
 * 商品の attributes（評価項目）。数値は 1〜5（採点基準：data/rakuten-candidates/humidifier/scoring-criteria.md）
 *   humidificationPower : 加湿能力（公式の定格加湿能力 mL/h で判定）
 *   easeOfCare          : お手入れのしやすさ（広口タンク・フィルターの有無・お手入れ部品の数・お手入れ頻度を公式説明から判定）
 *   quietness           : 静かさ（公式の最小運転音 dB。値がなければ中立の 3）
 *   energyEfficiency    : 消費電力の効率（最大運転時の W ÷ mL/h。W 数だけでは比べない）
 *   runtime             : 連続運転時間（最大運転時の連続加湿時間）
 *   refillEase          : 給水のしやすさ（上部給水・タンクの取っ手・残量の分かりやすさ）
 * true / false の項目（プレハブ洋室の適用畳数から機械的に決める。木造和室の値とは混ぜない）
 *   room10 / room14 / room19 : プレハブ洋室で 10畳 / 14畳 / 19畳 以上に対応
 * method : 加湿方式（steam / vaporize / ultrasonic / hybrid）。記録のみで、方式そのものは採点しない
 * 価格帯（priceRange）は priceLabels を参照（1: 〜10,000円 / 2: 〜20,000円 / 3: 〜30,000円 / 4: 30,000円〜）。
 *   区分は公式確認した実商品の価格分布に合わせて採点基準 v1.1 で1回だけ見直したもの（結果を均等にする目的ではない）
 *
 * 【並び順のルール】（共通エンジンの設定）
 *   - Q2 部屋の広さ：部屋に対して能力不足の商品を上位に出さないため、適用畳数を適格条件（eligibility）にする
 *   - Q6 予算：予算内の商品を通常ランキングの候補にする（上限条件。30,000円以上でもOK は上限なし）
 *   - 通常ランキングが3件に満たないときだけ、条件を満たさない商品を別枠に表示する
 *   - 相性スコアが完全に同じときは、回答に関係する一致度 → 評価値 → 商品ID の順で並べる（scoring.tieBreak）
 *
 * 商品はメーカー公式情報で評価した実商品10機種（2026-09-25 確認）。根拠は data/rakuten-candidates/humidifier/product-evaluations.json。
 */

/** 楽天の商品画像（300×300） */
const img = (path: string) => `https://thumbnail.image.rakuten.co.jp/@0_mall/${path}?_ex=300x300`
/** 楽天アフィリエイトURL（商品ページとスマホ版ページ） */
const rakuten = (id: string, shop: string, item: string, mobileId: string) =>
  `https://hb.afl.rakuten.co.jp/hgc/${id}/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2F${shop}%2F${item}%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2F${shop}%2Fi%2F${mobileId}%2F`
const AFL = {
  siroca: 'g00u50qo.d8zue695.g00u50qo.d8zuf217',
  xprice: 'g00qn68o.d8zuee0f.g00qn68o.d8zuf9b5',
  iris: 'g00t3zto.d8zuee14.g00t3zto.d8zuf2f4',
  zojirushi: 'g00unkuo.d8zue41b.g00unkuo.d8zufb4e',
  cutestyle: 'g00rd00o.d8zue612.g00rd00o.d8zuf99b',
}
/** スチーム式の注意（公式の安全機能とは別に、置き場所の一般的な注意） */
const STEAM_CAUTION = 'スチーム式は湯を沸かして加湿します。運転中や運転直後は本体や蒸気に注意し、小さなお子さまの手が届かない場所に置いてください。'

/** 商品データ（実商品10機種。評価値はメーカー公式情報に基づく：data/rakuten-candidates/humidifier/product-evaluations.json、採点基準 v1.1） */
const products: Product[] = [
  {
    // シロカ 5L加湿器 SD-C113 / 超音波式 / 最大350mL/h / プレハブ洋室10畳・木造和室6畳 / 5L / 連続約12時間（最大加湿量時。175mL/h使用時は約24時間）/ 30W / 6,930円（2026-09-25 確認）
    id: 'humidifier-101',
    name: 'シロカ 5L加湿器 SD-C113',
    category: 'humidifier',
    description: '容量5Lのタンクを備えた超音波式の加湿器。最大加湿量350mL/h、プレハブ洋室10畳までが目安です。',
    priceRange: 1,
    features: ['超音波式', '加湿量 最大350mL/h', '適用 プレハブ洋室10畳・木造和室6畳', 'タンク 5L', '連続 約12時間（最大加湿時）', '消費電力 30W'],
    pros: ['手頃な価格', '消費電力が小さい', '取っ手付きのタンクを取り外して丸洗いできる'],
    cons: ['加湿量は少なめで、小さめの部屋向けです', '運転音の公式値はありません'],
    recommendFor: '寝室や個室など、小さめの部屋を手頃な価格で加湿したい人',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.siroca, 'siroca', 'sd-c113-1', '10000127'),
    imageUrl: img('siroca/cabinet/sd-c113/lp_sd-c113_1.jpg'),
    enabled: true,
    attributes: { method: 'ultrasonic', humidificationPower: 2, easeOfCare: 2, quietness: 3, energyEfficiency: 4, runtime: 4, refillEase: 3, room10: true, room14: false, room19: false },
  },
  {
    // アイリスオーヤマ ハイブリッド式加湿器 HDK-35 / 加熱超音波 / 350mL/h / プレハブ洋室10畳・木造和室6畳 / 40W / 7,900円（2026-09-25 確認）
    id: 'humidifier-102',
    name: 'アイリスオーヤマ ハイブリッド式加湿器 HDK-35',
    category: 'humidifier',
    description: '水を加熱してから超音波でミストにするハイブリッド式の加湿器。最大加湿量350mL/h、プレハブ洋室10畳までが目安です。',
    priceRange: 1,
    features: ['ハイブリッド式（加熱＋超音波）', '加湿量 最大350mL/h', '適用 プレハブ洋室10畳・木造和室6畳', '消費電力 40W'],
    pros: ['手頃な価格', '加熱式のわりに消費電力が小さい'],
    cons: ['加湿量は少なめで、小さめの部屋向けです', 'お手入れ・給水・運転音について公式ページの記載が少なめです'],
    recommendFor: '小さめの部屋で、手頃な価格の加熱タイプを選びたい人',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.xprice, 'a-price', '4967576442022', '10777383'),
    imageUrl: img('a-price/cabinet/pics/109/4967576442022.jpg'),
    enabled: true,
    attributes: { method: 'hybrid', humidificationPower: 2, easeOfCare: 1, quietness: 3, energyEfficiency: 3, runtime: 3, refillEase: 2, room10: true, room14: false, room19: false },
  },
  {
    // アイリスオーヤマ 上給水超音波ハイブリッド加湿器 AHM-HUT55A / 加熱超音波 / 550mL/h / プレハブ洋室15畳・木造和室9畳 / 6.0L / 強で約11時間 / 260W / 8,670円（2026-09-25 確認）
    id: 'humidifier-103',
    name: 'アイリスオーヤマ 上給水超音波ハイブリッド加湿器 AHM-HUT55A',
    category: 'humidifier',
    description: 'ふたを開けて上から水を注げる6Lタンクのハイブリッド式加湿器。フィルターレスで、最大加湿量550mL/h、プレハブ洋室15畳までが目安です。',
    priceRange: 1,
    features: ['ハイブリッド式（加熱＋超音波）', '加湿量 550mL/h', '適用 プレハブ洋室15畳・木造和室9畳', 'タンク 約6.0L・上から給水', '強で約11時間'],
    pros: ['上から水を注ぐだけで給水できる', 'フィルターレスで、ふたやタンクを丸洗いできる', '手頃な価格で加湿量が多め'],
    cons: ['運転音の公式値はありません', '加熱するぶん、気化式より消費電力は大きめです（260W）'],
    recommendFor: '手頃な価格で、給水とお手入れの手軽さを重視したい人',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.xprice, 'a-price', '4967576796293', '11339446'),
    imageUrl: img('a-price/cabinet/pics/1084/4967576796293.jpg'),
    enabled: true,
    attributes: { method: 'hybrid', humidificationPower: 3, easeOfCare: 3, quietness: 3, energyEfficiency: 2, runtime: 3, refillEase: 3, room10: true, room14: true, room19: false },
  },
  {
    // アイリスオーヤマ 気化式加湿器 AHM-MVU55A / 気化式 / 550mL/h / プレハブ洋室15畳・木造和室9畳 / 4L / 強で約7時間 / 15W / 16,401円（2026-09-25 確認。楽天は550mL/hのSKUを選択）
    id: 'humidifier-104',
    name: 'アイリスオーヤマ 気化式加湿器 AHM-MVU55A',
    category: 'humidifier',
    description: 'ヒーターを使わない気化式の加湿器。最大加湿量550mL/hで、消費電力は15Wです。プレハブ洋室15畳までが目安です。',
    priceRange: 2,
    features: ['気化式', '加湿量 550mL/h', '適用 プレハブ洋室15畳・木造和室9畳', 'タンク 約4L', '消費電力 15W'],
    pros: ['消費電力がとても小さく、電気代を抑えやすい', 'ヒーターを使わない'],
    cons: ['加湿フィルターは約2年ごとの交換が必要です', '強運転の連続加湿時間は約7時間です'],
    recommendFor: '中くらいの部屋で、電気代を抑えて加湿したい人',
    caution: '楽天の販売ページには加湿量の異なるタイプもあります。加湿量550mL/hのタイプを選んでください。',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.iris, 'irisplaza-r', '209038', '10168198'),
    imageUrl: img('irisplaza-r/cabinet/10172579/12541977/209038_1.jpg'),
    enabled: true,
    attributes: { method: 'vaporize', humidificationPower: 3, easeOfCare: 1, quietness: 3, energyEfficiency: 5, runtime: 2, refillEase: 2, room10: true, room14: true, room19: false },
  },
  {
    // シャープ プラズマクラスター加湿器 HV-T55 / 加熱気化式（ハイブリッド）/ 550mL/h / プレハブ洋室15畳・木造和室9畳 / 4.0L / 強で約7.2時間 / 190W / 静音23dB / 18,800円（2026-09-25 確認）
    id: 'humidifier-105',
    name: 'シャープ プラズマクラスター加湿器 HV-T55',
    category: 'humidifier',
    description: '上から注いでもトレーを外しても給水できるハイブリッド式の加湿器。加湿量550mL/h、静音運転は23dBです。',
    priceRange: 2,
    features: ['ハイブリッド式（加熱気化）', '加湿量 550mL/h', '適用 プレハブ洋室15畳・木造和室9畳', 'タンク 約4.0L', '運転音 静音23dB'],
    pros: ['静音運転が23dBと静か', '上から注いで給水できる'],
    cons: ['強運転の連続加湿時間は約7.2時間です', 'フィルター交換の目安は公式ページに記載がありません'],
    recommendFor: '寝室や中くらいの部屋で、静かさも重視したい人',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.xprice, 'a-price', '2980000491108', '11213029'),
    imageUrl: img('a-price/cabinet/orj/45/0-2980000491108.jpg'),
    enabled: true,
    attributes: { method: 'hybrid', humidificationPower: 3, easeOfCare: 1, quietness: 4, energyEfficiency: 2, runtime: 2, refillEase: 3, room10: true, room14: true, room19: false },
  },
  {
    // シャープ プラズマクラスター加湿器 HV-T75 / 加熱気化式（ハイブリッド）/ 750mL/h / プレハブ洋室21畳・木造和室12.5畳 / 4.0L / 強で約5.3時間 / 335W / 静音23dB / 21,800円（2026-09-25 確認）
    id: 'humidifier-106',
    name: 'シャープ プラズマクラスター加湿器 HV-T75',
    category: 'humidifier',
    description: '加湿量750mL/hのハイブリッド式加湿器。プレハブ洋室21畳までが目安で、上から注いでもトレーを外しても給水できます。',
    priceRange: 3,
    features: ['ハイブリッド式（加熱気化）', '加湿量 750mL/h', '適用 プレハブ洋室21畳・木造和室12.5畳', 'タンク 約4.0L', '運転音 静音23dB'],
    pros: ['広めの部屋にも対応', '静音運転が23dBと静か', '上から注いで給水できる'],
    cons: ['強運転の連続加湿時間は約5.3時間です', '強運転の消費電力は335Wです'],
    recommendFor: 'リビングなど広めの部屋を、静かさも保ちながら加湿したい人',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.xprice, 'a-price', '2980000491085', '11213025'),
    imageUrl: img('a-price/cabinet/orj/45/0-2980000491085.jpg'),
    enabled: true,
    attributes: { method: 'hybrid', humidificationPower: 4, easeOfCare: 1, quietness: 4, energyEfficiency: 2, runtime: 2, refillEase: 3, room10: true, room14: true, room19: true },
  },
  {
    // 象印 スチーム式加湿器 EE-DE50DS（EE-DE50の公式店限定カラー。仕様はEE-DE50と共通の取扱説明書で確認）/ 480mL/h / プレハブ洋室13畳・木造和室8畳 / 4.0L / 強で約8時間 / 加湿時410W / 25,080円（2026-09-25 確認）
    id: 'humidifier-107',
    name: '象印 スチーム式加湿器 EE-DE50DS',
    category: 'humidifier',
    description: 'ポットのような広口容器に水を入れて沸かす、フィルター不要のスチーム式加湿器。容量4.0L、プレハブ洋室13畳までが目安です。',
    priceRange: 3,
    features: ['スチーム式', '加湿量 480mL/h', '適用 プレハブ洋室13畳・木造和室8畳', '容量 4.0L', 'フィルター不要'],
    pros: ['フィルターがなく、広口容器でお手入れしやすい', '容器に直接注げて、水位線と給水ランプで残量が分かる', 'チャイルドロック・ふた開閉ロック・転倒湯もれ防止構造'],
    cons: ['湯を沸かすため消費電力が大きめです（加湿時410W）', '運転音の公式値はありません'],
    recommendFor: 'お手入れと給水の手軽さを重視して、寝室や個室で使いたい人',
    caution: STEAM_CAUTION,
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.zojirushi, 'zojirushi-direct', 'eede50ds_bm', '10000000'),
    imageUrl: img('zojirushi-direct/cabinet/compass1729484530.jpg'),
    enabled: true,
    attributes: { method: 'steam', humidificationPower: 2, easeOfCare: 3, quietness: 3, energyEfficiency: 1, runtime: 3, refillEase: 5, room10: true, room14: false, room19: false },
  },
  {
    // ダイニチ ハイブリッド式加湿器 HD-RXC500C / 温風気化・気化 / 500mL/h / プレハブ洋室14畳・木造和室8.5畳 / 5.0L / 標準で10時間 / 163W / 最小13dB / 25,800円（2026-09-25 確認）
    id: 'humidifier-108',
    name: 'ダイニチ ハイブリッド式加湿器 HD-RXC500C',
    category: 'humidifier',
    description: '温風気化と気化を切り替えるハイブリッド式の加湿器。加湿量500mL/h、プレハブ洋室14畳までが目安で、運転音は最小13dBです。',
    priceRange: 3,
    features: ['ハイブリッド式（温風気化・気化）', '加湿量 500mL/h', '適用 プレハブ洋室14畳・木造和室8.5畳', 'タンク 5.0L', '運転音 最小13dB'],
    pros: ['運転音がとても静か', '給水口が広くタンクのお手入れがしやすい', '転倒自動停止装置付き'],
    cons: ['抗菌気化フィルターの定期的なお手入れと、トレイカバーの交換（1シーズンが目安）が必要です'],
    recommendFor: '寝室や中くらいの部屋で、静かさを重視したい人',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.xprice, 'a-price', '4951272034933', '11199109'),
    imageUrl: img('a-price/cabinet/orj/38/2-4951272034933.jpg'),
    enabled: true,
    attributes: { method: 'hybrid', humidificationPower: 3, easeOfCare: 2, quietness: 5, energyEfficiency: 2, runtime: 3, refillEase: 3, room10: true, room14: true, room19: false },
  },
  {
    // ダイニチ ハイブリッド式加湿器 HD-RXC700C / 温風気化・気化 / 700mL/h / プレハブ洋室19畳・木造和室12畳 / 6.3L / 標準で9時間 / 290W / 最小13dB / 29,800円（2026-09-25 確認）
    id: 'humidifier-109',
    name: 'ダイニチ ハイブリッド式加湿器 HD-RXC700C',
    category: 'humidifier',
    description: '加湿量700mL/hのハイブリッド式加湿器。プレハブ洋室19畳までが目安で、6.3Lタンクと最小13dBの静かな運転が特長です。',
    priceRange: 3,
    features: ['ハイブリッド式（温風気化・気化）', '加湿量 700mL/h', '適用 プレハブ洋室19畳・木造和室12畳', 'タンク 6.3L', '運転音 最小13dB'],
    pros: ['広めの部屋にも対応', '運転音がとても静か', '給水口が広くタンクのお手入れがしやすい'],
    cons: ['抗菌気化フィルターの定期的なお手入れと、トレイカバーの交換（1シーズンが目安）が必要です', '価格はやや高めです'],
    recommendFor: 'リビングなど広めの部屋を、静かに加湿したい人',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.xprice, 'a-price', '4951272034957', '11199091'),
    imageUrl: img('a-price/cabinet/orj/38/2-4951272034957.jpg'),
    enabled: true,
    attributes: { method: 'hybrid', humidificationPower: 4, easeOfCare: 2, quietness: 5, energyEfficiency: 2, runtime: 3, refillEase: 3, room10: true, room14: true, room19: true },
  },
  {
    // パナソニック ヒーターレス気化式加湿機 FE-KXF15 / 気化式 / 1500mL/h / プレハブ洋室42畳・木造和室25畳 / 4.5L×2 / 約6時間 / 強47W / 45,240円（2026-09-25 確認）
    id: 'humidifier-110',
    name: 'パナソニック ヒーターレス気化式加湿機 FE-KXF15',
    category: 'humidifier',
    description: '加湿量1,500mL/hの大容量タイプの気化式加湿機。プレハブ洋室42畳まで対応し、強運転でも消費電力は47Wです。',
    priceRange: 4,
    features: ['気化式（ヒーターレス）', '加湿量 1,500mL/h', '適用 プレハブ洋室42畳・木造和室25畳', 'タンク 約4.5L×2', '消費電力 強47W'],
    pros: ['広い部屋もしっかり加湿できる', '加湿量のわりに消費電力がとても小さい', '加湿フィルターの交換目安は約10年'],
    cons: ['本体が大きく重め（約9.8kg）です', '強運転の連続加湿時間は約6時間です', '価格は高めです'],
    recommendFor: '広いリビングや大きな部屋を、電気代を抑えて加湿したい人',
    amazonUrl: '',
    rakutenUrl: rakuten(AFL.cutestyle, 'e-cutestyle', 'p000000070669', '19768644'),
    imageUrl: img('e-cutestyle/cabinet/img041/p000000070669_1.jpg'),
    enabled: true,
    attributes: { method: 'vaporize', humidificationPower: 5, easeOfCare: 2, quietness: 3, energyEfficiency: 5, runtime: 2, refillEase: 2, room10: true, room14: true, room19: true },
  },
]

/** 部屋の広さの条件を選んだときに結果の上部に出す説明（適用畳数は部屋の条件で変わる） */
const roomNotice = (tatami: number) =>
  `プレハブ洋室で${tatami}畳以上に対応する加湿器からおすすめを表示しています。適用畳数は、木造・鉄筋などの建物の構造や部屋の条件によって変わります。`

export const humidifier: Diagnosis = {
  id: 'humidifier',
  slug: 'humidifier',
  name: '加湿器診断',
  itemName: '加湿器',
  group: 'life',
  icon: '💧',
  shortDescription: '重視すること・部屋の広さ・使う場所・お手入れ・給水・予算から、あなたに合う加湿器を診断。',
  intro:
    '家庭用の据え置き型加湿器を選ぶ診断です。一番重視すること、部屋の広さ、使う場所、お手入れ、連続運転・給水、予算の6つの質問から、あなたに合いそうな加湿器を相性順に表示します。',
  seo: {
    title: '加湿器診断｜質問に答えてあなたに合う加湿器をチェック',
    description:
      '加湿器を無料診断。加湿量・お手入れ・静かさ・電気代・部屋の広さ・給水のしやすさ・予算など6つの質問に答えるだけで、スチーム式・気化式・超音波式・ハイブリッド式から、あなたに合う加湿器が分かります。',
  },
  priceLabels: {
    1: '〜10,000円',
    2: '10,000〜20,000円',
    3: '20,000〜30,000円',
    4: '30,000円〜',
  },
  questions: [
    {
      id: 'priority',
      text: '一番重視することは？',
      shortLabel: '重視すること',
      weight: 22,
      options: [
        { id: 'power', label: 'しっかり加湿できること', summary: '加湿能力を重視', effects: [{ type: 'atLeast', attr: 'humidificationPower', value: 5 }] },
        { id: 'care', label: 'お手入れのしやすさ', summary: 'お手入れのしやすさを重視', effects: [{ type: 'atLeast', attr: 'easeOfCare', value: 5 }] },
        { id: 'quiet', label: '運転音の静かさ', summary: '静かさを重視', effects: [{ type: 'atLeast', attr: 'quietness', value: 5 }] },
        { id: 'eco', label: '電気代の安さ', summary: '電気代の安さを重視', effects: [{ type: 'atLeast', attr: 'energyEfficiency', value: 5 }] },
      ],
    },
    {
      id: 'room',
      text: '使う部屋の広さは？',
      shortLabel: '部屋の広さ',
      // 能力不足の商品を上位に出さないため、プレハブ洋室の適用畳数を適格条件にする（採点には使わない）
      weight: 20,
      options: [
        { id: 'r6', label: '〜6畳', summary: '〜6畳の部屋で使う', effects: [] },
        {
          id: 'r10',
          label: '7〜10畳',
          summary: '7〜10畳の部屋で使う',
          effects: [],
          eligibility: { attr: 'room10', value: true, notice: roomNotice(10), supplementLabel: '10畳の部屋には能力が不足する可能性があります' },
        },
        {
          id: 'r14',
          label: '11〜14畳',
          summary: '11〜14畳の部屋で使う',
          effects: [],
          eligibility: { attr: 'room14', value: true, notice: roomNotice(14), supplementLabel: '14畳の部屋には能力が不足する可能性があります' },
        },
        {
          id: 'r19',
          label: '15畳以上',
          summary: '15畳以上の部屋で使う',
          effects: [],
          eligibility: { attr: 'room19', value: true, notice: roomNotice(19), supplementLabel: '広い部屋には能力が不足する可能性があります' },
        },
      ],
    },
    {
      id: 'place',
      text: '主に使う場所は？',
      shortLabel: '使う場所',
      weight: 14,
      options: [
        { id: 'bedroom', label: '寝室', summary: '寝室で使う', effects: [{ type: 'atLeast', attr: 'quietness', value: 4 }] },
        { id: 'living', label: 'リビング', summary: 'リビングで使う', effects: [{ type: 'atLeast', attr: 'humidificationPower', value: 3 }] },
        { id: 'private', label: '個室・書斎', effects: [] },
        { id: 'any', label: '特に決まっていない', effects: [] },
      ],
    },
    {
      id: 'care',
      text: 'お手入れはどのくらい手軽にしたい？',
      shortLabel: 'お手入れ',
      weight: 14,
      options: [
        { id: 'easy', label: 'できるだけ手軽にしたい', summary: 'お手入れを手軽にしたい', effects: [{ type: 'atLeast', attr: 'easeOfCare', value: 4 }] },
        { id: 'normal', label: 'ある程度ならできる', summary: 'ある程度のお手入れはできる', effects: [{ type: 'atLeast', attr: 'easeOfCare', value: 3 }] },
        { id: 'any', label: 'あまり気にしない', effects: [] },
      ],
    },
    {
      id: 'water',
      text: '連続運転・給水で重視することは？',
      shortLabel: '連続運転・給水',
      weight: 12,
      options: [
        { id: 'long', label: '給水の回数を減らしたい（長時間運転）', summary: '長時間運転したい', effects: [{ type: 'atLeast', attr: 'runtime', value: 4 }] },
        { id: 'easy', label: '給水の作業をラクにしたい', summary: '給水をラクにしたい', effects: [{ type: 'atLeast', attr: 'refillEase', value: 4 }] },
        { id: 'any', label: '特にこだわらない', effects: [] },
      ],
    },
    budgetQuestion({
      text: '予算は？',
      weight: 16,
      bands: [
        { label: '10,000円以下', summary: '予算10,000円以下' },
        { label: '20,000円以下', summary: '予算20,000円以下' },
        { label: '30,000円以下', summary: '予算30,000円以下' },
      ],
      // 「高価格の商品を希望する」ではなく「予算の上限を実質設けない」という意味。価格では採点しない
      noLimitLabel: '30,000円以上でもOK',
      // 予算は上限条件：予算内の商品を通常ランキングにし、足りないときだけ予算を少し超える商品を別枠に表示
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
    title: '加湿器の選び方',
    intro: 'この診断は、家庭用の据え置き型加湿器を対象に、メーカー公式の仕様をもとに以下のポイントとあなたの回答を照らし合わせて相性を計算しています。',
    sections: [
      {
        heading: '部屋の広さ（適用畳数）',
        body: '適用畳数は「木造和室」と「プレハブ洋室」で分けて表示されていることが多く、この診断ではプレハブ洋室の値で判定しています。木造の部屋や気密性の低い部屋では、表示より狭い範囲が目安になるため、余裕のある能力を選ぶと安心です。',
      },
      {
        heading: '加湿方式',
        body: '方式ごとに特徴があります。この診断では方式そのものではなく、加湿量・消費電力・お手入れなどメーカー公式の仕様で比べています。',
        points: [
          'スチーム式：水を沸かして加湿。消費電力は大きめ',
          '気化式：フィルターに風を当てて加湿。消費電力が小さい',
          '超音波式：振動で水を細かくして加湿。こまめな清掃が大切',
          'ハイブリッド式：温風気化・加熱超音波など、方式を組み合わせたもの',
        ],
      },
      { heading: 'お手入れ', body: '加湿器は水を扱うため、タンクやトレー、フィルターを定期的に洗うことが大切です。タンクの口の広さや、お手入れする部品の数・頻度を確認しましょう。' },
      { heading: '静かさ', body: '寝室で使うなら、運転音（dB）の小さいモデルが向いています。メーカーの公表値は運転モードや測定条件で変わります。' },
      { heading: '連続運転と給水', body: '連続運転時間が長いほど給水の回数は減ります。上から注げるタイプや、取っ手付きのタンクは給水がラクです。' },
      { heading: '電気代', body: '消費電力は方式によって大きく違います。同じ加湿量あたりの消費電力で比べると、電気代の目安が分かりやすくなります。' },
    ],
  },
  notice:
    '適用畳数は建物の構造や部屋の条件によって変わります。本診断は部屋や使い方から加湿器の候補を探すためのもので、健康への効果を保証するものではありません。衛生的に使うため、取扱説明書に沿った定期的なお手入れを行ってください。',
  enabled: true,
}

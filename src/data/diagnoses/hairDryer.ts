import type { Diagnosis, Product } from '../../types/diagnosis.ts'
import { budgetQuestion } from './shared.ts'

/**
 * ドライヤー診断
 *
 * 【対象範囲】家庭で日常的に使うヘアドライヤーを選ぶ診断です。
 *   対象外：業務用専用機、ペット用ドライヤー、ハンズフリー専用機
 *
 * 商品の attributes（評価項目）。数値はすべて 1〜5 で、大きいほどその点に優れています。
 *   dryingPower   : 速乾性（JIS C 9613 など比較可能な測定条件が公式に明記された風量のみで判定。それ以外は3）
 *   hairCare      : 髪への負担・乾燥・ダメージへの配慮（温度の自動制御・低温モード・温冷自動切替など）
 *   lightness     : 軽さ・持ちやすさ
 *   quiet         : 静音性（参考情報。公式にdB・静音モードを示す商品がほぼないため、現在は質問では使っていない）
 *   manageability : 広がり・まとまりへの配慮
 *   scalpCare     : 頭皮向けの機能（スカルプモードなど）
 *   compactness   : 収納・持ち運びのしやすさ（折りたたみ・本体サイズ）
 * 価格帯（priceRange）は priceLabels を参照（1: 〜10,000円 / 2: 〜20,000円 / 3: 〜40,000円 / 4: 40,000円〜）。
 *
 * 評価軸の整理（候補から統合したもの）
 *   - damageCare（乾燥・ダメージ）は hairCare（髪への負担）と同じ機能で評価することになるため hairCare に統合
 *   - longHair（ロング・毛量）、continuousUse（家族・連続使用）、quickUse（朝の短時間）は
 *     いずれも主に風量で決まるため dryingPower に統合（回答ごとに求める水準を変えて区別する）
 *
 * 【並び順のルール】（掃除機と同じ共通エンジンの設定）
 *   - Q6 予算：予算内の商品を通常ランキングの候補にする（上限条件。40,000円以上でもOK は上限なし）
 *   - 通常ランキングが3件に満たないときだけ、予算を少し超える商品を別枠に表示する
 *   - 相性スコアが完全に同じときは、回答に関係する一致度 → 評価値 → 商品ID の順で並べる（scoring.tieBreak）
 *
 * 商品は実商品8機種（2026-09-23 選定）。評価値はメーカー公式情報をもとに
 * data/rakuten-candidates/hair-dryer/scoring-criteria.md（v1.1）の基準で採点したもの（結果を整える目的で変更しないこと）。
 * 商品IDは評価記録（evaluation-draft*.json）のIDと同じ。価格帯2（1〜2万円）の商品はないが、
 * 予算「10,000〜20,000円」を選んだ場合も価格帯1の商品が予算内の候補になる。
 */

/** 商品データ（実商品8機種。評価値はメーカー公式情報に基づく） */
const products: Product[] = [
  {
    // パナソニック EH-NE7N / 楽天 yamada-denki:10665740 / 6,649円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/hair-dryer/evaluation-draft.json（採点基準 scoring-criteria.md v1.1）
    id: 'hair-dryer-102',
    name: 'パナソニック ヘアードライヤー イオニティ EH-NE7N',
    category: 'hair-dryer',
    description: '風量1.6㎥/分（JIS基準・TURBO時）の折りたたみ式ドライヤー。約65℃の低温ケアモードを搭載しています。',
    priceRange: 1,
    features: ['風量 1.6㎥/分（TURBO時・JIS基準）', '低温ケアモード（約65℃）', 'ミネラル＆マイナスイオン', '折りたたみ式', '質量 約550g'],
    pros: ['低温ケアモードで、温度を抑えて乾かせる', '折りたたんで収納・持ち運びができる', '手頃な価格帯'],
    cons: ['温度センサーによる自動温度調整や、温冷の自動切替はありません', '海外では使用できません'],
    recommendFor: '手頃な価格で、低温モード付きの折りたたみドライヤーを使いたい人',
    caution: 'カラーはアイスブルー（EH-NE7N-A）を想定しています。ほかのカラーも性能は同じです。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00t3jpo.d8zuedce.g00t3jpo.d8zufb63/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fyamada-denki%2F6791368015%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fyamada-denki%2Fi%2F10665740%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/yamada-denki/cabinet/a07000471/6791368015.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { dryingPower: 3, hairCare: 3, lightness: 3, quiet: 3, manageability: 3, scalpCare: 3, compactness: 5 },
  },
  {
    // コイズミ KHD-9240 / 楽天 coconial:10002689 / 6,080円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/hair-dryer/evaluation-draft.json（採点基準 scoring-criteria.md v1.1）
    id: 'hair-dryer-103',
    name: 'コイズミ マイナスイオンヘアドライヤー KHD-9240',
    category: 'hair-dryer',
    description: '風量2.0㎥/分（JIS C 9613・ノズル無し）の大風量ドライヤー。頭皮向けの低温風が出るスカルプ機能を搭載しています。',
    priceRange: 1,
    features: ['風量 2.0㎥/分（JIS C 9613）', 'スカルプ機能（低温風）', '4つのマイナスイオン', '折りたたみ式', '質量 約510g（集風器付）'],
    pros: ['公称風量が大きく、速く乾かしたい人に向く', '頭皮向けの低温風モードがある', '手頃な価格帯'],
    cons: ['温度センサーや温冷の自動切替はありません', '質量は約510gで、軽量タイプより重めです'],
    recommendFor: '手頃な価格で、速く乾かしたい人・頭皮もしっかり乾かしたい人',
    caution: 'カラーはグレー（/H）とピンク（/P）から選べます（性能は同じ）。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00rdq6o.d8zue1a4.g00rdq6o.d8zufe76/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fcoconial%2Fkhd9000%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fcoconial%2Fi%2F10002689%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/coconial/cabinet/commodity/k4/khd9240_800.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { dryingPower: 5, hairCare: 3, lightness: 3, quiet: 3, manageability: 3, scalpCare: 4, compactness: 4 },
  },
  {
    // mod's hair MHD-1233 / 楽天 roomy:10016274 / 4,950円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/hair-dryer/evaluation-draft.json（採点基準 scoring-criteria.md v1.1）
    id: 'hair-dryer-104',
    name: 'mod\'s hair アドバンススマート コンパクトイオンヘアードライヤー MHD-1233',
    category: 'hair-dryer',
    description: '約354g（ノズル装着時）の軽量・折りたたみ式ドライヤー。100〜240Vに対応し、海外でも使えます。',
    priceRange: 1,
    features: ['質量 約354g（ノズル装着時）', '折りたたみ式', '海外対応（100〜240V）', 'マイナスイオン', '風速 約21.9m/s（ノズル未装着時）'],
    pros: ['軽くて持ちやすい', '折りたたんで旅行や出張に持っていける', '手頃な価格帯'],
    cons: ['風量（㎥/分）は公表されていません', '温度の自動調整・低温モード・温冷の自動切替はありません', '消費電力は100V時620〜900Wと、一般的なドライヤーより小さめです'],
    recommendFor: '軽さと持ち運びやすさを重視する人、旅行用にも使いたい人',
    caution: 'カラーはホワイト・ブラック・アッシュグレーから選べます（性能は同じ）。楽天の商品ページでは「通常注文」と「入荷待ち注文」を選ぶ形式です。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00qb0lo.d8zue1cf.g00qb0lo.d8zufaa1/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Froomy%2Fmhe19aug09h03%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Froomy%2Fi%2F10016274%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/roomy/cabinet/kaden4/etc_kaden/mhd_1233_1.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { dryingPower: 3, hairCare: 2, lightness: 5, quiet: 3, manageability: 3, scalpCare: 2, compactness: 5 },
  },
  {
    // コイズミ KHD-B200 / 楽天 r-kojima:11668282 / 8,980円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/hair-dryer/evaluation-draft-additions.json（採点基準 scoring-criteria.md v1.1）
    id: 'hair-dryer-113',
    name: 'コイズミ ハイスピードマイナスイオンドライヤー KHD-B200',
    category: 'hair-dryer',
    description: '約375g（集風器含まず）の軽量ドライヤー。温冷自動切替と、頭皮向けの低温風モード（スカルプ機能）を搭載しています。',
    priceRange: 1,
    features: ['質量 約375g（集風器含まず）', '温冷自動切替', 'スカルプ機能（低温風）', 'マイナスイオン', 'BLDCモーター（風速 約40m/s・集風器なし）'],
    pros: ['軽くて持ちやすい', '温冷自動切替で、まとまりを意識した仕上げができる', '頭皮向けの低温風モードがある'],
    cons: ['風量（㎥/分）は公表されていません', '風量の切り替えは2段階です', '折りたたみはできません'],
    recommendFor: '手頃な価格で、軽さと髪・頭皮へのやさしさを両立したい人',
    caution: 'カラーはベージュ（KHD-B200/C）を想定しています（グレー・ピンクも性能は同じ）。販売店によって価格が大きく異なり、1万円を超える場合があります。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00r8mvo.d8zued00.g00r8mvo.d8zuf260/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fr-kojima%2F4981747085450%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fr-kojima%2Fi%2F11668282%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/r-kojima/cabinet/n0000001621/4981747085450_1.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { dryingPower: 3, hairCare: 4, lightness: 5, quiet: 3, manageability: 4, scalpCare: 4, compactness: 3 },
  },
  {
    // パナソニック EH-NA0K / 楽天 panasonic-store:10000005 / 34,967円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/hair-dryer/evaluation-draft.json（採点基準 scoring-criteria.md v1.1）
    id: 'hair-dryer-108',
    name: 'パナソニック ヘアードライヤー ナノケア EH-NA0K',
    category: 'hair-dryer',
    description: '高浸透ナノイーを搭載したドライヤー。2つのセンサーで風温を自動調整し、温冷リズム・スカルプ（約60℃）・毛先集中ケアなどのモードがあります。',
    priceRange: 3,
    features: ['高浸透ナノイー・ミネラル', '2つのセンサーによる風温の自動調整', 'スカルプモード（約60℃）', '温冷リズム・毛先集中ケア・スキンの各モード', '風量 1.6㎥/分（風量【強】時）', '質量 約550g（セットノズル含まず）'],
    pros: ['センサーによる温度調整と多彩なモードで、髪への熱負担に配慮されている', '頭皮向けのスカルプモードがある', '付属ノズル（ナイトキャップノズルなど）が充実している'],
    cons: ['価格帯は高めです', '折りたたみはできません'],
    recommendFor: '髪への負担や仕上がり、頭皮ケアを重視したい人',
    caution: 'カラーとギフト包装の有無を選ぶ形式で、一部のカラーは在庫切れの場合があります。スカルプモードの約60℃は室温30℃時の値です。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00ubhyo.d8zue3ff.g00ubhyo.d8zuf4bd/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fpanasonic-store%2Feh-na0j-a%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fpanasonic-store%2Fi%2F10000005%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/panasonic-store/cabinet/banner/thumb/eh-na0k_004.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { dryingPower: 3, hairCare: 5, lightness: 3, quiet: 3, manageability: 5, scalpCare: 5, compactness: 3 },
  },
  {
    // ヤーマン YJHC2 / 楽天 ya-man:10002784 / 27,500円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/hair-dryer/evaluation-draft.json（採点基準 scoring-criteria.md v1.1）
    id: 'hair-dryer-109',
    name: 'ヤーマン リフトドライヤー スマート YJHC2',
    category: 'hair-dryer',
    description: '約395g（電源コード含まず）の折りたたみ式ドライヤー。環境センサーで風の温度が高くなり過ぎないように制御し、約60℃のUPモードを搭載しています。',
    priceRange: 3,
    features: ['質量 約395g（電源コード含まず）', '環境センサーによる温度コントロール', '3モード（UP 約60℃／SHINY 約90℃／SMOOTH 約75℃）', '折りたたみ式・マルチボルテージ（海外使用可）', 'イオンで静電気を抑える機能'],
    pros: ['軽くて持ちやすい', '温度を抑えた設計で、髪への熱負担に配慮されている', '折りたたんで旅行にも持っていける'],
    cons: ['風量（㎥/分）の公式な数値は確認できていません', '頭皮専用のモードはありません（頭皮向けのタッピングアタッチメントは別売り）'],
    recommendFor: '軽さとヘアケアを両立し、旅行にも持っていきたい人',
    caution: '本体とノズルの単品構成（27,500円）を想定しています。タッピングアタッチメント付きのセットは別商品です。海外で使う場合は別途変換プラグが必要です。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00rutoo.d8zueda2.g00rutoo.d8zuf04b/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fya-man%2Fr2503c%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fya-man%2Fi%2F10002784%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/ya-man/cabinet/square500/ytj_hair/r2503c/r2503c_img09_2509.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { dryingPower: 3, hairCare: 5, lightness: 5, quiet: 3, manageability: 4, scalpCare: 3, compactness: 5 },
  },
  {
    // KINUJO KH301 / 楽天 endless02:10001222 / 23,850円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/hair-dryer/evaluation-draft.json（採点基準 scoring-criteria.md v1.1）
    id: 'hair-dryer-110',
    name: 'KINUJO ヘアドライヤー KH301',
    category: 'hair-dryer',
    description: '本体約348gの軽量・折りたたみ式ドライヤー。GLOSS・SCULP・SWINGの3つのモードを搭載しています。',
    priceRange: 3,
    features: ['本体質量 約348g（本体のみ）', 'GLOSS（仕上げ）／SCULP（髪と頭皮の保湿）／SWING（温冷自動切替）の3モード', '温度3段階・風量3段階', 'マイナスイオン', '折りたたみ式'],
    pros: ['軽くて持ちやすい', '仕上げ用のモードや温冷自動切替があり、まとまりを意識した使い方ができる', '頭皮向けのモードがある'],
    cons: ['公式に示された風量（2.2m³/min）の測定条件は公表されていません', '温度センサーによる自動温度調整はありません'],
    recommendFor: '軽さと仕上がりのまとまりを重視したい人',
    caution: 'カラーはホワイト（KH301）を想定しています。モカ（KH302）はカラー違いで、性能は同じです。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00u2koo.d8zueb9e.g00u2koo.d8zuf568/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fendless02%2F4589946770766%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fendless02%2Fi%2F10001222%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/endless02/cabinet/45899467707661.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { dryingPower: 3, hairCare: 3, lightness: 5, quiet: 3, manageability: 5, scalpCare: 4, compactness: 4 },
  },
  {
    // ReFa（MTG） RE-BQ-02A/03A/05A / 楽天 mtgec-beauty:10002327 / 58,300円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/hair-dryer/evaluation-draft.json（採点基準 scoring-criteria.md v1.1）
    id: 'hair-dryer-112',
    name: 'ReFa BEAUTECH DRYER BX（リファビューテック ドライヤー BX）',
    category: 'hair-dryer',
    description: '2つのセンサーで頭皮・毛先の温度や周囲の温度を感知し、温風の温度と温冷の切り替えを自動で調節するドライヤーです。',
    priceRange: 4,
    features: ['ダブルセンシング（自動温度調節）', 'SCALP・MOIST・VOLUME UPの専用モード', 'ハイドロイオン', '風量 約1.4㎥/min（HIGH時）', '重量 約740g（電源コード含む、セット用ノズル含まず）'],
    pros: ['センサーによる自動温度調節で、髪や頭皮への熱負担に配慮されている', '頭皮用と仕上げ用の専用モードがある'],
    cons: ['重量は約740g（電源コード含む）と重めです', '価格帯は高めです', '折りたたみはできません'],
    recommendFor: '予算をかけて、ヘアケアと仕上がり、頭皮ケアを重視したい人',
    caution: '延長保証なし・ラッピングなしの通常構成（58,300円）を想定しています。品番はカラーにより RE-BQ-02A（ホワイト）／03A（ブラック）／05A（ピンク）です。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00r20go.d8zue0c2.g00r20go.d8zufe62/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fmtgec-beauty%2F1246320101%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fmtgec-beauty%2Fi%2F10002327%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/mtgec-beauty/cabinet/refa/refa_dryer_bx/imgrc0120473532.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { dryingPower: 3, hairCare: 5, lightness: 1, quiet: 3, manageability: 5, scalpCare: 5, compactness: 3 },
  },
]

export const hairDryer: Diagnosis = {
  id: 'hair-dryer',
  slug: 'hair-dryer',
  name: 'ドライヤー診断',
  itemName: 'ドライヤー',
  group: 'beauty',
  icon: '💨',
  shortDescription: '速乾・髪への負担・軽さ・まとまり・頭皮ケア・予算から、あなたに合うドライヤーを診断。',
  intro:
    '家庭で毎日使うヘアドライヤーを選ぶ診断です。一番重視すること、髪の長さ・毛量、髪で気になること、使い方、収納・持ち運び、予算の6つの質問から、あなたに合いそうなドライヤーを相性順に表示します。',
  seo: {
    title: 'ドライヤー診断｜質問に答えてあなたに合うドライヤーをチェック',
    description:
      '家庭用ヘアドライヤーを無料診断。速乾性・髪への負担の少なさ・軽さ・まとまり・頭皮ケア・予算など6つの質問に答えるだけで、あなたに合うドライヤーが分かります。',
  },
  priceLabels: {
    1: '〜10,000円',
    2: '10,000〜20,000円',
    3: '20,000〜40,000円',
    4: '40,000円〜',
  },
  questions: [
    {
      id: 'priority',
      text: '一番重視することは？',
      shortLabel: '重視すること',
      weight: 24,
      options: [
        { id: 'fast', label: '早く乾かしたい', summary: '速く乾かすことを重視', effects: [{ type: 'atLeast', attr: 'dryingPower', value: 5 }] },
        { id: 'care', label: '髪への負担を抑えたい', summary: '髪への負担を抑えることを重視', effects: [{ type: 'atLeast', attr: 'hairCare', value: 5 }] },
        { id: 'light', label: '軽さ・持ちやすさ', summary: '軽さ・持ちやすさを重視', effects: [{ type: 'atLeast', attr: 'lightness', value: 5 }] },
        { id: 'finish', label: 'まとまり・仕上がりを重視したい', summary: 'まとまり・仕上がりを重視', effects: [{ type: 'atLeast', attr: 'manageability', value: 5 }] },
        {
          id: 'value',
          label: 'コストパフォーマンス',
          summary: 'コストパフォーマンスを重視',
          // 価格が手頃（2以下）であることを主に、最低限の速乾性（3以上）もあわせて評価（掃除機と同じ考え方）
          effects: [
            { type: 'atMost', attr: 'priceRange', value: 2, weight: 2 },
            { type: 'atLeast', attr: 'dryingPower', value: 3 },
          ],
        },
      ],
    },
    {
      id: 'length',
      text: '髪の長さ・毛量は？',
      shortLabel: '髪の長さ・毛量',
      weight: 16,
      options: [
        // 短め・毛量少なめなら、どのドライヤーでも乾かしやすいため採点しない
        { id: 'short', label: '短め・毛量少なめ', effects: [] },
        { id: 'medium', label: 'ミディアム・標準', summary: 'ミディアム・標準の髪', effects: [{ type: 'atLeast', attr: 'dryingPower', value: 3 }] },
        { id: 'long', label: 'ロング・毛量多め', summary: 'ロング・毛量が多い', effects: [{ type: 'atLeast', attr: 'dryingPower', value: 4 }] },
      ],
    },
    {
      id: 'concern',
      text: '髪で特に気になることは？',
      shortLabel: '髪の悩み',
      weight: 16,
      options: [
        { id: 'damage', label: '乾燥・ダメージ', summary: '乾燥・ダメージが気になる', effects: [{ type: 'atLeast', attr: 'hairCare', value: 4 }] },
        { id: 'frizz', label: '広がり・まとまり', summary: '広がり・まとまりが気になる', effects: [{ type: 'atLeast', attr: 'manageability', value: 4 }] },
        { id: 'scalp', label: '頭皮もケアしたい', summary: '頭皮もケアしたい', effects: [{ type: 'atLeast', attr: 'scalpCare', value: 4 }] },
        { id: 'none', label: '特にない', effects: [] },
      ],
    },
    {
      id: 'usage',
      text: '主な使い方は？',
      shortLabel: '使い方',
      weight: 12,
      options: [
        { id: 'solo', label: '毎日ひとりで使う', effects: [] },
        // 髪の長さが異なる複数人が続けて使うため、一定以上の速乾性を求める
        { id: 'family', label: '家族など複数人で使う', summary: '家族など複数人で使う', effects: [{ type: 'atLeast', attr: 'dryingPower', value: 4 }] },
        { id: 'morning', label: '朝など短時間で素早く使いたい', summary: '短時間で素早く使いたい', effects: [{ type: 'atLeast', attr: 'dryingPower', value: 5 }] },
        { id: 'finish', label: '乾かしたあと、仕上がりも整えたい', summary: '仕上がりも整えたい', effects: [{ type: 'atLeast', attr: 'manageability', value: 4 }] },
      ],
    },
    {
      id: 'storage',
      text: '収納・持ち運びはどれくらい重視する？',
      shortLabel: '収納・持ち運び',
      weight: 10,
      options: [
        { id: 'compact', label: 'コンパクトさを重視', summary: 'コンパクトさを重視', effects: [{ type: 'atLeast', attr: 'compactness', value: 4 }] },
        { id: 'some', label: 'ある程度コンパクトならよい', summary: 'ある程度コンパクトならよい', effects: [{ type: 'atLeast', attr: 'compactness', value: 3 }] },
        { id: 'any', label: 'サイズはあまり気にしない', effects: [] },
      ],
    },
    budgetQuestion({
      text: '予算は？',
      weight: 17,
      bands: [
        { label: '10,000円以下', summary: '予算10,000円以下' },
        { label: '10,000〜20,000円', summary: '予算10,000〜20,000円' },
        { label: '20,000〜40,000円', summary: '予算20,000〜40,000円' },
      ],
      // 「高価格の商品を希望する」ではなく「予算の上限を実質設けない」という意味。価格では採点しない
      noLimitLabel: '40,000円以上でもOK',
      // 予算は上限条件：予算内の商品を通常ランキングにし、足りないときだけ予算を少し超える商品を別枠に表示
      asLimit: true,
    }),
  ],
  products,
  // 相性スコアが完全に同じときは、回答に関係する一致度・評価値で並び順を決める（価格などは使わない）
  scoring: { tieBreak: true },
  guide: {
    title: 'ドライヤーの選び方',
    intro: 'この診断は、家庭で毎日使うヘアドライヤーを対象に、メーカー公式の仕様をもとに以下のポイントとあなたの回答を照らし合わせて相性を計算しています。',
    sections: [
      {
        heading: '速乾性（風量）',
        body: '髪が長い・毛量が多い人や、家族で使う人、朝の忙しい時間に使う人ほど、風量の大きさが重要です。仕様の「風量（㎥/分）」はメーカーによって測定方法が異なることがあるため、比べるときは「JIS C 9613」など測定条件の記載も確認しましょう。',
      },
      {
        heading: '髪への負担',
        body: '温度センサーによる風温の自動調整や低温モード、温風と冷風の自動切り替えなどがあると、熱による乾燥を抑えやすくなります。機能ごとの効果の感じ方には個人差があります。',
      },
      {
        heading: 'まとまり・仕上がり',
        body: '広がりが気になる場合は、温冷の自動切り替えや仕上げ用のモード、静電気を抑える機能を確認しましょう。乾かしたあとに冷風を当てると、仕上がりを整えやすくなります。',
      },
      {
        heading: '頭皮向けの機能',
        body: '頭皮向けの低温モード（スカルプモード）などを備えたモデルもあります。根元や頭皮もしっかり乾かしたい人は確認しておくとよいでしょう。',
      },
      {
        heading: '重さ',
        body: '毎日使うものなので、重さは意外と大事なポイントです。質量は「ノズル込み」「電源コード込み」などメーカーによって条件が異なるため、比べるときは条件も確認しましょう。',
      },
      {
        heading: '収納・持ち運び',
        body: '収納場所が限られる場合や旅行に持っていきたい場合は、折りたためるか、本体の大きさも確認しましょう。',
      },
      {
        heading: '予算の目安',
        body: '手頃な価格帯でも基本的な機能は十分なことが多く、価格が上がるほど風量や温度制御、ヘアケア機能が充実する傾向があります。',
      },
    ],
  },
  notice: 'ヘアケア機能の感じ方には個人差があります。本診断は仕上がりや髪質の変化を保証するものではありません。',
  enabled: true,
}

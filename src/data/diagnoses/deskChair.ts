import type { Diagnosis, Effect, Product } from '../../types/diagnosis.ts'
import { budgetQuestion } from './shared.ts'

/**
 * デスクチェア診断
 *
 * 【対象範囲】家庭・在宅ワーク用のデスクチェア／オフィスチェア（キャスター付き・座面の高さ調整あり）。
 *   対象外：ゲーミングチェア専用品、座椅子、ダイニングチェア、スツール、業務用の大量セット、公式仕様を確認できない商品
 *
 * 商品の attributes（評価項目）。数値は 1〜5（採点基準 v2：data/rakuten-candidates/desk-chair/scoring-criteria.md）
 *   lowSeat      : 低座面（公式の座面高の最低値。40cm以下が5、46.1cm以上が1）
 *   seatRange    : 座面の高さ調整幅（公式の座面高の最高値−最低値）
 *   compactness  : コンパクトさ（公式の本体幅。脚・肘を含む）
 *   breathability: 通気性（公式に明記された張地のメッシュ範囲。背・座ともメッシュが5、背のみが4）
 *   armLevel     : 肘掛けの調整自由度（なし1・固定2・高さ調整3・高さ＋1〜2方向4・高さ＋3方向以上5）
 *   recline      : リクライニング（固定背1・ロッキングのみ2・2段階固定3・3〜4段階固定4・5段階以上/任意角度5。記載がなければ中立の3）
 *   adjust       : 調整機能の数（1＋座面奥行・ランバー・ヘッドレスト・肘・背の角度固定のうち公式に明記されたもの）
 * true / false の項目（'unknown' は公式情報で確認できないもの。「なし」にせず中立 0.5 で採点する）
 *   width62 / width68 : 公式の本体幅が 62cm / 68cm 以下（Q2 の適格条件）
 *   armFree : 肘掛けなし、または跳ね上げできる / hasArm : 肘掛けあり / headrest : ヘッドレストあり
 *   lumbarAdjust : ランバーサポートを調整できる / seatDepth : 座面の奥行きを調整できる
 *   relax : フットレスト内蔵、または recline 4 以上
 * 価格帯（priceRange）は priceLabels を参照。
 *
 * 【並び順のルール】（共通エンジンの設定）
 *   - Q2 設置スペース：本体幅が入らない商品を上位に出さないため、適格条件（eligibility）にする
 *   - Q7 予算：予算内の商品を通常ランキングの候補にする（上限条件）
 *   - 価格は Q4 で「価格」を選んだときだけ採点に使う（予算の上限条件は並び替えのみ）
 *   - 通常ランキングが3件に満たないときだけ、条件を満たさない商品を別枠に表示する
 *   - 相性スコアが完全に同じときは、回答に関係する一致度 → 評価値 → 商品ID の順で並べる（scoring.tieBreak）
 *
 * 商品はメーカー公式情報で評価した実商品9機種（2026-09-29 確認）。根拠は data/rakuten-candidates/desk-chair/product-evaluations.json。
 */

/** true / false の項目の採点（'unknown' は中立 0.5。公式情報で確認できない機能を「なし」として減点しない） */
function feature(attr: string): Effect {
  return { type: 'custom', score: (p) => (p.attributes[attr] === true ? 1 : p.attributes[attr] === false ? 0 : 0.5) }
}

/** 商品データ（実商品9機種。評価値はメーカー公式情報に基づく：data/rakuten-candidates/desk-chair/product-evaluations.json、採点基準 v2） */
const products: Product[] = [
  {
    // 山善 HMC-992H（メッシュ座面。PVC座面は別型番 HMC-P992H） / 幅62×奥行57×高さ104.5〜112cm・座面高42〜49.5cm / 11,470円（2026-09-29 確認）
    id: 'desk-chair-101',
    name: '山善 オフィスチェア ハイバック メッシュ HMC-992H',
    category: 'desk-chair',
    description: '背もたれと座面にメッシュを使った、肘付きのハイバックチェア。ロッキング機能付きです。',
    priceRange: 1,
    features: ['背もたれ・座面ともメッシュ', '座面高 42〜49.5cm', '固定式の肘掛け', 'ロッキング（角度固定なし）', '本体 幅62×奥行57cm'],
    pros: ['手頃な価格で、座面までメッシュ', '本体幅62cmと比較的置きやすい'],
    cons: ['肘掛け・ランバーサポートは調整できません', 'リクライニングの角度固定・ヘッドレスト・座面奥行調整はありません', '楽天での取り扱いが少なく、価格や在庫が変わりやすい商品です'],
    recommendFor: '手頃な価格で、座面まで蒸れにくいチェアがほしい人',
    caution: 'メッシュ座面の HMC-992H を想定しています（PVC座面は別型番 HMC-P992H）。楽天での取り扱い店舗が少なく、価格・在庫が変わりやすいため、購入前に販売ページで型番とカラーを確認してください。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00ux1uo.d8zued05.g00ux1uo.d8zufe48/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fgramsky2nd%2F2nd0dp1wqwsr%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fgramsky2nd%2Fi%2F10042396%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/gramsky2nd/cabinet/rakutenpic/systempic041/b0dp1wqwsr-00.jpg?_ex=300x300',
    enabled: true,
    attributes: {
      lowSeat: 4, seatRange: 2, compactness: 3, breathability: 5, armLevel: 2, recline: 2, adjust: 1,
      width62: true, width68: true, armFree: false, hasArm: true, headrest: false, lumbarAdjust: false, seatDepth: false, relax: false,
    },
  },
  {
    // アイリスオーヤマ メッシュバックチェア OFC-MBR（肘なし） / 幅54.5×奥行62.5×高さ87.5〜99.5cm・座面高44〜56cm / 8,260円（ネイビー、2026-09-29 確認）
    id: 'desk-chair-102',
    name: 'アイリスオーヤマ メッシュバックチェア OFC-MBR',
    category: 'desk-chair',
    description: '背もたれがメッシュの、肘なしのシンプルなチェア。本体幅54.5cmのコンパクトなサイズです。',
    priceRange: 1,
    features: ['背もたれメッシュ', '肘なし', '座面高 44〜56cm（調整幅12cm）', '本体 幅54.5×奥行62.5cm'],
    pros: ['本体幅54.5cmとコンパクト', '座面の高さ調整幅が12cmと広い', '手頃な価格'],
    cons: ['肘掛け・ヘッドレストはありません', 'ロッキング・リクライニング、ランバーサポートの公式記載はありません'],
    recommendFor: '限られたスペースに置ける、シンプルで手頃なチェアがほしい人',
    caution: 'リンク先はネイビーの出品です（ブラック・ボルドーもあります）。価格は販売店によって変わりやすいため、購入前にご確認ください。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pukwo.d8zue5e8.g00pukwo.d8zuf592/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fjism%2F4967576739276-25-67096-n%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fjism%2Fi%2F14499690%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/jism/cabinet/0481/4967576739276.jpg?_ex=300x300',
    enabled: true,
    attributes: {
      lowSeat: 3, seatRange: 5, compactness: 5, breathability: 4, armLevel: 1, recline: 3, adjust: 1,
      width62: true, width68: true, armFree: true, hasArm: false, headrest: false, lumbarAdjust: 'unknown', seatDepth: 'unknown', relax: 'unknown',
    },
  },
  {
    // アイリスオーヤマ メッシュバックチェア ハイバック OFC-MBHR / 幅60.5×奥行61.5×高さ107〜114.5cm・座面高44〜51.5cm / 12,990円（ブラック、2026-09-29 確認）
    id: 'desk-chair-103',
    name: 'アイリスオーヤマ メッシュバックチェア ハイバック OFC-MBHR',
    category: 'desk-chair',
    description: '背もたれがメッシュの、肘付きハイバックチェア。ロッキング機能付きです。',
    priceRange: 1,
    features: ['背もたれメッシュ（背上部は合成皮革）', '肘付き', 'ロッキング', '座面高 44〜51.5cm', '本体 幅60.5×奥行61.5cm'],
    pros: ['手頃な価格の肘付きハイバック', '本体幅60.5cmで比較的置きやすい'],
    cons: ['肘掛けの高さ調整・ヘッドレストはありません', 'リクライニングの角度固定、ランバーサポート・座面奥行調整の公式記載はありません'],
    recommendFor: '手頃な価格で、背もたれの高い肘付きチェアがほしい人',
    caution: 'リンク先はブラックの出品です（ネイビー・ボルドーもあります）。アイリスオーヤマ公式店では15,380円（2026-09-29 確認）など、販売店によって価格が異なります。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pukwo.d8zue5e8.g00pukwo.d8zuf592/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fjism%2F4967576739290-25-67096-n%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fjism%2Fi%2F14499754%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/jism/cabinet/0481/4967576739290.jpg?_ex=300x300',
    enabled: true,
    attributes: {
      lowSeat: 3, seatRange: 2, compactness: 3, breathability: 4, armLevel: 2, recline: 2, adjust: 1,
      width62: true, width68: true, armFree: false, hasArm: true, headrest: false, lumbarAdjust: 'unknown', seatDepth: 'unknown', relax: false,
    },
  },
  {
    // FlexiSpot OC3（メッシュ座面・ブラック OC3B-M1-JA） / 幅66×奥行54×高さ117〜133cm・座面高47〜57cm / 19,800円（2026-09-29 確認）
    id: 'desk-chair-104',
    name: 'FlexiSpot オフィスチェア OC3（メッシュ）',
    category: 'desk-chair',
    description: '背もたれ・座面ともメッシュで、ヘッドレストとランバーサポートを備えたチェア。背もたれは3段階で角度を固定できます。',
    priceRange: 2,
    features: ['背もたれ・座面ともメッシュ', 'シンクロロッキング・3段階の角度固定', 'ヘッドレスト（角度・高さ調整）', 'ランバーサポート（高さ調整）', '肘掛けの高さ調整', '座面高 47〜57cm'],
    pros: ['2万円前後で、ヘッドレスト・ランバー・角度固定がそろう', '背もたれ・座面ともメッシュ'],
    cons: ['最低座面高が47cmと高めです', '本体幅66cmと大きめです', '座面奥行調整の公式記載はありません'],
    recommendFor: '手頃な価格で、ヘッドレストや角度固定などの調整機能もほしい人',
    caution: 'メッシュ座面のブラックを想定しています（フォーム座面は寸法・座面高が異なります）。肘掛けの調整方向は公式販売ページで表記が異なるため、高さ調整のみで評価しています。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00t68zo.d8zuee32.g00t68zo.d8zuffd3/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Floctek%2Foc3d-op%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Floctek%2Fi%2F10000529%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/loctek/cabinet/06747252/oc3/oc3b-newmain.jpg?_ex=300x300',
    enabled: true,
    attributes: {
      lowSeat: 1, seatRange: 4, compactness: 2, breathability: 5, armLevel: 3, recline: 4, adjust: 5,
      width62: false, width68: true, armFree: 'unknown', hasArm: true, headrest: true, lumbarAdjust: true, seatDepth: 'unknown', relax: true,
    },
  },
  {
    // サンワサプライ メッシュチェア 150-SNCM76BK / 幅67×奥行67×高さ112.7〜120cm・座面高41〜48.5cm / 26,820円（2026-09-29 確認。通常 29,800円）
    id: 'desk-chair-105',
    name: 'サンワサプライ メッシュチェア 150-SNCM76BK',
    category: 'desk-chair',
    description: '座面高41cmからの低めの設計で、跳ね上げもできる5Dアームレストと3Dヘッドレストを備えたメッシュチェアです。',
    priceRange: 2,
    features: ['背もたれメッシュ・座面は布', '座面高 41〜48.5cm', '5Dアームレスト（高さ・前後・回転・跳ね上げ）', '3Dヘッドレスト', '3Dランバーサポート（前後3段階）', 'シンクロロッキング・3段階の角度固定'],
    pros: ['最低座面高41cmと低め', '肘掛けを細かく調整でき、跳ね上げもできる', 'ヘッドレスト・ランバー・角度固定がそろう'],
    cons: ['座面の奥行き調整はありません', '本体幅67cmと大きめです', '座面高の調整幅は7.5cmです'],
    recommendFor: '座面を低めにしたい人や、肘掛けを細かく調整したい人',
    caution: '2026-09-29 時点はセール価格（通常 29,800円）です。価格は変わりやすいため、購入前にご確認ください。耐荷重は約100kgです。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pmmbo.d8zueb66.g00pmmbo.d8zuf986/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fsanwadirect%2F150-sncm76bk%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fsanwadirect%2Fi%2F10108187%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/sanwadirect/cabinet/1/1/150-sncm76bk_1.jpg?_ex=300x300',
    enabled: true,
    attributes: {
      lowSeat: 4, seatRange: 2, compactness: 2, breathability: 4, armLevel: 5, recline: 4, adjust: 5,
      width62: false, width68: true, armFree: true, hasArm: true, headrest: true, lumbarAdjust: true, seatDepth: false, relax: true,
    },
  },
  {
    // コクヨ ENTRY2 CCR-ET2P301（メッシュタイプ・樹脂脚・肘なし） / 幅67.5×奥行58〜63×高さ92〜104cm・座面高40.5〜52.5cm / 27,280円（2026-09-29 確認）
    id: 'desk-chair-106',
    name: 'コクヨ ENTRY2 エントリー2 CCR-ET2P301（肘なし）',
    category: 'desk-chair',
    description: '座面の奥行き調整とランバーサポートを備えた、肘なしのメッシュチェア。背もたれは3段階で角度を固定できます。',
    priceRange: 2,
    features: ['背もたれメッシュ', '肘なし', '座面高 40.5〜52.5cm（調整幅12cm）', '座面の奥行き調整（5cm）', 'ランバーサポート（上下4.5cm）', 'シンクロロッキング・3段階の角度固定'],
    pros: ['座面を低めから高めまで広く調整できる', '座面の奥行き・ランバー・背の角度固定がそろう', '肘がないのでデスク下に収めやすい'],
    cons: ['肘掛け・ヘッドレストはありません', '本体幅67.5cmと大きめです'],
    recommendFor: '肘掛けは不要で、座面の高さや奥行きを体に合わせて調整したい人',
    caution: 'メッシュタイプ・樹脂脚・ブラックフレーム・肘なしの CCR-ET2P301 を想定しています（肘付き・アルミ脚などは別型番です）。張地の色を選んで購入してください。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00tmb5o.d8zue342.g00tmb5o.d8zuf93d/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fkokuyofn%2Frfn103170%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fkokuyofn%2Fi%2F10004476%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/kokuyofn/cabinet/entry2/rfn103164_rfn103170.jpg?_ex=300x300',
    enabled: true,
    attributes: {
      lowSeat: 4, seatRange: 5, compactness: 2, breathability: 4, armLevel: 1, recline: 4, adjust: 4,
      width62: false, width68: true, armFree: true, hasArm: false, headrest: false, lumbarAdjust: true, seatDepth: true, relax: true,
    },
  },
  {
    // イトーキ サリダ YL9A（可動肘） / 幅66.7×奥行73.5〜107×高さ113.5〜130.5cm・座面高43.5〜52.5cm / 39,990円（2026-09-29 確認）
    id: 'desk-chair-107',
    name: 'イトーキ サリダ YL9A',
    category: 'desk-chair',
    description: 'メッシュ形状のエラストマー素材の背もたれに、高さと角度を調整できるヘッドレストを備えたエクストラハイバックチェアです。',
    priceRange: 2,
    features: ['背もたれ・ヘッドレストはメッシュ形状のエラストマー', 'ヘッドレスト（高さ7段階・角度4段階）', '肘掛けの高さ調整（9段階）', 'シンクロロッキング（初期位置で固定）', '座面高 43.5〜52.5cm', 'クッション厚40mmの座面'],
    pros: ['ヘッドレストを細かく調整できる', '背もたれが高く、頭まで支えられる'],
    cons: ['ロッキングは初期位置でのみ固定できます', 'ランバーサポート・座面奥行調整の公式記載はありません', '本体幅66.7cmと大きめです'],
    recommendFor: '頭まで支える背もたれと、調整できるヘッドレストがほしい人',
    caution: 'リンク先はサリダ YL9 シリーズ（YL9・YL9A・YL9G）の共通ページです。購入時は必ず「YL9A」のSKUを選んでください。YL9A の価格は40,000円の境界に近いため、変わりやすい点にご注意ください。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pprao.d8zuec8e.g00pprao.d8zufb21/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fsoho-st%2F24083400s%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fsoho-st%2Fi%2F10032555%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/soho-st/cabinet/item/24089928s/24089928-color.jpg?_ex=300x300',
    enabled: true,
    attributes: {
      lowSeat: 3, seatRange: 3, compactness: 2, breathability: 4, armLevel: 3, recline: 2, adjust: 3,
      width62: false, width68: true, armFree: 'unknown', hasArm: true, headrest: true, lumbarAdjust: 'unknown', seatDepth: 'unknown', relax: false,
    },
  },
  {
    // COFO Chair Pro 2（CC-200B ブラック） / 幅69×奥行68.3×高さ109〜128.5cm・座面高45〜51cm / 79,980円（2026-09-29 確認）
    id: 'desk-chair-108',
    name: 'COFO Chair Pro 2 CC-200B',
    category: 'desk-chair',
    description: 'フットレストを内蔵し、背もたれを4段階で固定できるメッシュチェア。ヘッドレスト・ランバー・座面奥行きも調整できます。',
    priceRange: 3,
    features: ['背もたれ・座面ともメッシュ', 'フットレスト内蔵', 'リクライニング 4段階（98°/108°/116°/127°）', '3Dヘッドレスト', '3Dアームレスト', 'ランバーサポート（4段階）・座面の奥行き調整（5cm）'],
    pros: ['調整できる箇所が多い', 'フットレストで足を伸ばして休憩できる', '背もたれ・座面ともメッシュ'],
    cons: ['本体幅69cmと大きく、置き場所が必要です', '最低座面高45cm・調整幅6cmです'],
    recommendFor: '作業と休憩の両方に使える、調整機能の多いチェアがほしい人',
    caution: 'リンク先はブラック（CC-200B）の出品です。COFO公式サイトの販売価格は69,980円（2026-09-29 確認）など、販売店によって価格が異なります。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pukwo.d8zue5e8.g00pukwo.d8zuf592/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fjism%2F4582527092059-25-67096-n%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fjism%2Fi%2F14800212%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/jism/cabinet/0082/4582527092059.jpg?_ex=300x300',
    enabled: true,
    attributes: {
      lowSeat: 2, seatRange: 2, compactness: 2, breathability: 5, armLevel: 4, recline: 4, adjust: 5,
      width62: false, width68: false, armFree: 'unknown', hasArm: true, headrest: true, lumbarAdjust: true, seatDepth: true, relax: true,
    },
  },
  {
    // エルゴヒューマン PRO2 High 5D（EHP2-HAM-5D-DR-BF-BK） / W70×D66.5×H115〜131.5cm・座面高45.5〜54cm / 156,440円（2026-09-29 確認）
    id: 'desk-chair-109',
    name: 'エルゴヒューマン プロ2 ハイタイプ 5D EHP2-HAM-5D-DR',
    category: 'desk-chair',
    description: '独立式ランバーサポートと5Dアームレストを備えたハイエンドのメッシュチェア。好みのリクライニング角度を110〜138°の間で設定できます。',
    priceRange: 4,
    features: ['背もたれ・座面ともメッシュ', 'メモリーロッキング（110〜138°で角度を設定）', '5Dアームレスト', '独立式ランバーサポート（硬さ調整）', 'ヘッドレスト（高さ・角度調整）', '座面の奥行き調整・前傾チルト'],
    pros: ['調整できる箇所が非常に多い', 'リクライニング角度を好みの位置に設定できる'],
    cons: ['価格が高めです', '本体幅70cmと大きく、置き場所が必要です', '最低座面高45.5cmと高めです'],
    recommendFor: '長時間座る前提で、細かく調整できる1脚を選びたい人',
    caution: 'リンク先はブラックフレーム・ブラックメッシュ（EHP2-HAM-5D-DR-BF-BK）の出品です。ヘッドレストなし（EHP2-LAM）・4Dアームなどは別型番です。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00qn68o.d8zuee0f.g00qn68o.d8zuf9b5/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fa-price%2F4550736079239%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fa-price%2Fi%2F11425486%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/a-price/cabinet/pics/1272/4550736079239.jpg?_ex=300x300',
    enabled: true,
    attributes: {
      lowSeat: 2, seatRange: 3, compactness: 2, breathability: 5, armLevel: 5, recline: 5, adjust: 5,
      width62: false, width68: false, armFree: 'unknown', hasArm: true, headrest: true, lumbarAdjust: true, seatDepth: true, relax: true,
    },
  },
]

export const deskChair: Diagnosis = {
  id: 'desk-chair',
  slug: 'desk-chair',
  name: 'デスクチェア診断',
  itemName: 'デスクチェア',
  group: 'life',
  icon: '🪑',
  shortDescription: '座る時間や設置スペース、調整機能から、あなたに合うデスクチェアを診断。',
  intro:
    '家庭・在宅ワーク用のデスクチェアを選ぶ診断です。座る時間、設置スペース、座面の高さ、一番重視すること、肘掛け、欲しい機能、予算の7つの質問から、あなたに合いそうなデスクチェアを相性順に表示します。',
  seo: {
    title: 'デスクチェアおすすめ診断｜質問であなたに合う1脚をチェック',
    description:
      '座る時間、設置スペース、座面の低さ、肘掛け、欲しい調整機能、予算から、あなたに合うデスクチェア候補を相性順で診断します。',
  },
  priceLabels: {
    1: '〜15,000円',
    2: '15,000〜40,000円',
    3: '40,000〜80,000円',
    4: '80,000円〜',
  },
  questions: [
    {
      id: 'hours',
      text: '1日に座る時間は？',
      shortLabel: '座る時間',
      // 長く座るほど、調整機能の多さを重く見る
      weight: 14,
      options: [
        { id: 'h1', label: '1〜2時間', effects: [] },
        { id: 'h2', label: '3〜6時間', summary: '1日3〜6時間座る', effects: [{ type: 'atLeast', attr: 'adjust', value: 3 }] },
        { id: 'h3', label: '7時間以上', summary: '1日7時間以上座る', effects: [{ type: 'atLeast', attr: 'adjust', value: 5 }] },
      ],
    },
    {
      id: 'space',
      text: '設置スペース（チェアの幅）は？',
      shortLabel: '設置スペース',
      help: '脚や肘掛けを含む、チェア本体の幅です。',
      // 置けない商品を上位に出さないため、公式の本体幅を適格条件にする（採点には使わない）
      weight: 10,
      options: [
        {
          id: 'w62',
          label: '幅62cm以内が必須',
          summary: '幅62cm以内のチェアが必須',
          effects: [],
          eligibility: { attr: 'width62', value: true, notice: 'メーカー公式の本体幅が62cm以下のデスクチェアからおすすめを表示しています。', supplementLabel: '本体幅が62cmを超えます' },
          // 幅62cm以内の商品はシンプルなチェアが中心のため、1位の相性が低いときはその理由を説明する（採点は変えない）
          lowMatchNotice:
            '幅62cm以内のコンパクトなチェアは、調整機能が多い商品が少ないため、近い候補を表示しています。調整機能を優先する場合は、設置幅の条件をゆるめると候補が広がります。',
        },
        {
          id: 'w68',
          label: '幅68cm以内が必須',
          summary: '幅68cm以内のチェアが必須',
          effects: [],
          eligibility: { attr: 'width68', value: true, notice: 'メーカー公式の本体幅が68cm以下のデスクチェアからおすすめを表示しています。', supplementLabel: '本体幅が68cmを超えます' },
        },
        { id: 'any', label: '特に気にしない', effects: [] },
      ],
    },
    {
      id: 'seat',
      text: '座面の高さの希望は？',
      shortLabel: '座面の高さ',
      weight: 12,
      options: [
        { id: 'low', label: '低め重視', summary: '座面は低めがいい', effects: [{ type: 'atLeast', attr: 'lowSeat', value: 4 }] },
        { id: 'std', label: '標準でOK', effects: [] },
        { id: 'range', label: '高さ調整幅を重視', summary: '座面の高さ調整幅を重視', effects: [{ type: 'atLeast', attr: 'seatRange', value: 4 }] },
      ],
    },
    {
      id: 'priority',
      text: '一番重視することは？',
      shortLabel: '重視すること',
      weight: 22,
      options: [
        { id: 'price', label: '価格', summary: '価格の手頃さを重視', effects: [{ type: 'atMost', attr: 'priceRange', value: 1 }] },
        { id: 'breath', label: '通気性', summary: '通気性を重視', effects: [{ type: 'atLeast', attr: 'breathability', value: 5 }] },
        { id: 'adjust', label: '調整機能', summary: '調整機能の多さを重視', effects: [{ type: 'atLeast', attr: 'adjust', value: 5 }] },
        { id: 'recline', label: 'リクライニング', summary: 'リクライニングを重視', effects: [{ type: 'atLeast', attr: 'recline', value: 4 }] },
        { id: 'compact', label: 'コンパクトさ', summary: 'コンパクトさを重視', effects: [{ type: 'atLeast', attr: 'compactness', value: 4 }] },
      ],
    },
    {
      id: 'arm',
      text: '肘掛けは？',
      shortLabel: '肘掛け',
      weight: 12,
      options: [
        { id: 'none', label: '不要', summary: '肘掛けは不要', effects: [feature('armFree')] },
        { id: 'fixed', label: '固定で十分', summary: '固定の肘掛けで十分', effects: [{ type: 'equals', attr: 'hasArm', value: true }] },
        { id: 'height', label: '高さ調整したい', summary: '肘掛けの高さを調整したい', effects: [{ type: 'atLeast', attr: 'armLevel', value: 3 }] },
        { id: 'multi', label: '多方向に細かく調整したい', summary: '肘掛けを多方向に細かく調整したい', effects: [{ type: 'atLeast', attr: 'armLevel', value: 5 }] },
      ],
    },
    {
      id: 'feature',
      text: '欲しい機能は？',
      shortLabel: '欲しい機能',
      weight: 12,
      options: [
        { id: 'headrest', label: 'ヘッドレスト', summary: 'ヘッドレストが欲しい', effects: [{ type: 'equals', attr: 'headrest', value: true }] },
        { id: 'lumbar', label: 'ランバー調整', summary: 'ランバーサポートを調整したい', effects: [feature('lumbarAdjust')] },
        { id: 'depth', label: '座面奥行調整', summary: '座面の奥行きを調整したい', effects: [feature('seatDepth')] },
        { id: 'relax', label: 'リラックス機能・フットレスト', summary: 'リラックス機能・フットレストが欲しい', effects: [feature('relax')] },
        { id: 'none', label: '特になし', effects: [] },
      ],
    },
    budgetQuestion({
      text: '予算は？',
      weight: 14,
      bands: [
        { label: '〜15,000円', summary: '予算15,000円まで' },
        { label: '〜40,000円', summary: '予算40,000円まで' },
        { label: '〜80,000円', summary: '予算80,000円まで' },
      ],
      // 「高価格の商品を希望する」ではなく「予算の上限を設けない」という意味。価格では採点しない
      noLimitLabel: '上限なし',
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
    title: 'デスクチェアの選び方',
    intro:
      'この診断は、家庭・在宅ワーク用のデスクチェアを対象に、メーカー公式の仕様をもとに以下のポイントとあなたの回答を照らし合わせて相性を計算しています。座り心地の感じ方には個人差があるため、座り心地そのものには優劣をつけていません。',
    sections: [
      {
        heading: '座る時間と調整機能',
        body: '座る時間が長いほど、座面の奥行き・ランバーサポート・ヘッドレスト・肘掛け・背もたれの角度など、体格や姿勢に合わせて調整できる箇所が多いチェアのほうが合わせやすくなります。',
      },
      {
        heading: '設置スペース',
        body: 'チェアの幅は、脚や肘掛けを含む本体の外形寸法で確認しましょう。ハイバックやリクライニング付きのチェアは大きめです。デスクの下に収めたい場合は、肘なしや跳ね上げ式の肘掛けも選択肢になります。',
      },
      {
        heading: '座面の高さ',
        body: '座面の高さは「最低〜最高」の調整範囲で確認しましょう。小柄な方や低めのデスクで使う場合は、最低座面高が低いチェアが合わせやすくなります。測り方はメーカーによって異なる場合があります。',
      },
      {
        heading: '通気性（張地）',
        body: '背もたれ・座面ともメッシュのチェアは、蒸れにくさを重視する人に向いています。座面がクッションのチェアは、やわらかい座り心地を好む人に向いています。',
      },
      {
        heading: '肘掛けとリクライニング',
        body: '肘掛けは、固定式・高さ調整・多方向（前後・左右・角度など）の調整で使い勝手が変わります。リクライニングは、背もたれを好みの角度で固定できる段数も確認しましょう。',
      },
    ],
  },
  notice:
    '寸法・座面高はメーカーの公表値です。本診断は使い方や好みからチェアの候補を探すためのもので、腰痛などの症状の改善や疲れにくさを保証するものではありません。痛みがある場合は医療機関にご相談ください。',
  enabled: true,
}

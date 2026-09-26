import type { Diagnosis, Product } from '../../types/diagnosis.ts'
import { budgetQuestion } from './shared.ts'

/**
 * ヒーター診断
 *
 * 【対象範囲】家庭用の電気ヒーター（セラミックファンヒーター、電気ストーブ、パネルヒーター、オイル／オイルレスヒーターなど）。
 *   対象外：石油・ガス暖房、業務用、電気毛布など身に着ける・敷く暖房、公式仕様を確認できない商品
 *
 * 商品の attributes（評価項目）。数値は 1〜5（採点基準：data/rakuten-candidates/heater/scoring-criteria.md）
 *   heatingPower : 出力の目安（公式の最大消費電力。暖かさの断定や電気代の優劣には使わない）
 *   quickHeat    : 速暖性（公式に数値で示された立ち上がり時間。記載がなければ中立の 3）
 *   quietness    : 静かさ（公式の運転音 dB、またはファンを使わないことの公式明記。記載がなければ中立の 3）
 *   safety       : 安全機能（転倒OFF・過熱防止・切り忘れ防止・チャイルドロック・やけど対策の数）
 *   ecoFeatures  : 節電機能（人感センサー・室温に応じた自動運転・出力切替・タイマーの数。W数では判定しない）
 *   convenience  : 便利機能（首振り・リモコン・持ち運び・付加機能の数）
 *   lightness    : 軽さ（公式の本体質量）
 * true / false の項目（公式の適用畳数から機械的に決める。記載がなければ false）
 *   room6 / room8 : 適用畳数（木造の値）が 6畳 / 8畳 以上
 * heaterType : 方式（ceramic / carbon / halogen / panel / oil / oilless など）。記録のみで、方式そのものは採点しない
 * 価格帯（priceRange）は priceLabels を参照。
 *
 * 【並び順のルール】（共通エンジンの設定）
 *   - Q3 暖めたい範囲：部屋全体を選んだときは、公式の適用畳数を適格条件（eligibility）にする
 *   - Q7 予算：予算内の商品を通常ランキングの候補にする（上限条件）
 *   - 通常ランキングが3件に満たないときだけ、条件を満たさない商品を別枠に表示する
 *   - 相性スコアが完全に同じときは、回答に関係する一致度 → 評価値 → 商品ID の順で並べる（scoring.tieBreak）
 *
 * 商品はメーカー公式情報で評価した実商品10機種（2026-09-26 確認）。根拠は data/rakuten-candidates/heater/product-evaluations.json。
 */

/** 商品データ（実商品10機種。評価値はメーカー公式情報に基づく：data/rakuten-candidates/heater/product-evaluations.json、採点基準 v1） */
const products: Product[] = [
  {
    // 山善 電気ストーブ DS-D086 / 800W（強）/400W（弱）→ 4 / 1.7kg / 4,480円（2026-09-26 確認）
    id: 'heater-101',
    name: '山善 電気ストーブ DS-D086',
    category: 'heater',
    description: '800W／400Wの2段階で切り替えられる、シンプルな電気ストーブ。質量1.7kgで持ち運びやすいサイズです。',
    priceRange: 1,
    features: ['消費電力 800W／400W', '強弱2段階切替', '転倒OFFスイッチ', '質量 約1.7kg'],
    pros: ['手頃な価格', '軽くて足元や机の下に置きやすい'],
    cons: ['公式の適用畳数の記載はありません', 'タイマー・人感センサーはありません', '安全装置は転倒OFFスイッチのみの記載です'],
    recommendFor: '手頃な価格で、足元や自分のまわりを手軽に暖めたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00tlfdo.d8zuefb3.g00tlfdo.d8zufad3/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fyamazenkaden%2F1484991%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fyamazenkaden%2Fi%2F10002679%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/yamazenkaden/cabinet/main-img/012/main-51858.jpg?_ex=300x300',
    enabled: true,
    attributes: { heatingPower: 4, quickHeat: 3, quietness: 3, safety: 2, ecoFeatures: 1, convenience: 1, lightness: 5, room6: false, room8: false },
  },
  {
    // アイリスオーヤマ 人感センサー付きセラミックファンヒーター ACH-EM12C / 1250/1150W（50/60Hz）→ 5 / 2.0kg / 6,030円（2026-09-26 確認）
    id: 'heater-102',
    name: 'アイリスオーヤマ 人感センサー付きセラミックファンヒーター ACH-EM12C',
    category: 'heater',
    description: '人の動きを感知して自動でON／OFFする人感センサー付きのセラミックファンヒーター。質量2.0kgの軽いタイプです。',
    priceRange: 2,
    features: ['消費電力 1250W／600W（50Hz）', '人感センサー（自動ON／OFF）', '傾斜センサー・バイメタル・温度ヒューズ', '適用床面積 木造 約3〜6畳', '質量 約2.0kg'],
    pros: ['人感センサーでつけっぱなしを防ぎやすい', '軽くて移動しやすい'],
    cons: ['公式の運転音の記載はありません', 'タイマーはありません', '適用床面積は断熱材なしの木造住宅で約3畳です'],
    recommendFor: '脱衣所やトイレ、キッチンなどで、人がいるときだけ手軽に使いたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00qn68o.d8zuee0f.g00qn68o.d8zuf9b5/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fa-price%2F4967576702270%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fa-price%2Fi%2F11212482%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/a-price/cabinet/pics/820/4967576702270.jpg?_ex=300x300',
    enabled: true,
    attributes: { heatingPower: 5, quickHeat: 3, quietness: 3, safety: 4, ecoFeatures: 2, convenience: 1, lightness: 5, room6: true, room8: false },
  },
  {
    // 山善 セラミックファンヒーター HF-L122 / 1200W / 2.4kg / 6,480円（2026-09-26 確認）
    id: 'heater-103',
    name: '山善 セラミックファンヒーター HF-L122',
    category: 'heater',
    description: '1200W／700Wの2段階切替で、公式の適用畳数は約8畳まで。背面の取っ手で持ち運びやすいセラミックファンヒーターです。',
    priceRange: 2,
    features: ['消費電力 1200W／700W', '適用畳数 約8畳まで', '転倒OFFスイッチ', '背面に取っ手', '質量 約2.4kg'],
    pros: ['手頃な価格で公式の適用畳数が約8畳', 'シンプルなダイヤル操作'],
    cons: ['楽天の商品ページで「スタンダード」を選ぶ必要があります（人感センサー付きの DSF-TL12 と同じページ）', 'タイマー・人感センサーはありません', '安全装置は転倒OFFスイッチのみの記載です'],
    recommendFor: '手頃な価格で、部屋全体も暖められるシンプルなヒーターがほしい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00tlfdo.d8zuefb3.g00tlfdo.d8zufad3/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fyamazenkaden%2F1484987%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fyamazenkaden%2Fi%2F10002669%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/yamazenkaden/cabinet/main-img/018/main-s4f08.jpg?_ex=300x300',
    enabled: true,
    attributes: { heatingPower: 5, quickHeat: 3, quietness: 3, safety: 2, ecoFeatures: 1, convenience: 2, lightness: 4, room6: true, room8: true },
  },
  {
    // 山善 セラミックファンヒーター（人感センサー）DSF-TL12 / 1200W/1100W（50/60Hz）→ 5 / 2.4kg / 7,980円（2026-09-26 確認）
    id: 'heater-104',
    name: '山善 セラミックファンヒーター（人感センサー）DSF-TL12',
    category: 'heater',
    description: '人の動きを検知して自動でON／OFFする人感センサー付き。公式の適用畳数は最大約8畳までのセラミックファンヒーターです。',
    priceRange: 2,
    features: ['消費電力 1200W', '人感センサー', '適用畳数 最大約8畳まで', '転倒オフスイッチ・サーモスタット・温度ヒューズ', '質量 約2.4kg'],
    pros: ['人感センサーでつけっぱなしを防ぎやすい', '1万円以下で公式の適用畳数が約8畳'],
    cons: ['楽天の商品ページで「人感センサー搭載」を選ぶ必要があります（HF-L122 と同じページ）', 'タイマーはありません', '公式の運転音の記載はありません'],
    recommendFor: '部屋全体を暖めつつ、人がいないときの消し忘れも防ぎたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00tlfdo.d8zuefb3.g00tlfdo.d8zufad3/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fyamazenkaden%2F1484987%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fyamazenkaden%2Fi%2F10002669%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/yamazenkaden/cabinet/main-img/018/main-s4f08.jpg?_ex=300x300',
    enabled: true,
    attributes: { heatingPower: 5, quickHeat: 3, quietness: 3, safety: 4, ecoFeatures: 2, convenience: 1, lightness: 4, room6: true, room8: true },
  },
  {
    // 山善 ワイド＆スポット レトロカーボンヒーター DCT-B08 / 800W（強）/400W（弱）→ 4 / 約3kg / 11,880円（2026-09-26 確認）
    id: 'heater-105',
    name: '山善 ワイド＆スポット レトロカーボンヒーター DCT-B08',
    category: 'heater',
    description: 'ファンを使わず赤外線で暖めるカーボンヒーター。反射板の角度をワイドにもスポットにも調整できる、レトロなデザインです。',
    priceRange: 3,
    features: ['消費電力 800W／400W', 'カーボンヒーター×2本', 'ファンを使わない（公式に静音と記載）', '反射板の角度を手動調整', '転倒OFFスイッチ', '質量 約3kg'],
    pros: ['ファンを使わないので運転音が気になりにくい', '暖める範囲をワイド／スポットで調整できる'],
    cons: ['公式の適用畳数の記載はありません', 'タイマー・人感センサーはありません', '安全装置は転倒OFFスイッチのみの記載です'],
    recommendFor: '寝室やデスクまわりで、静かに自分のまわりを暖めたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00ux1uo.d8zued05.g00ux1uo.d8zufe48/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fgramsky2nd%2F2nd0dhx6ryzz%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fgramsky2nd%2Fi%2F10042267%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/gramsky2nd/cabinet/rakutenpic/systempic041/b0dhx6ryzz-00.jpg?_ex=300x300',
    enabled: true,
    attributes: { heatingPower: 4, quickHeat: 3, quietness: 4, safety: 2, ecoFeatures: 1, convenience: 3, lightness: 4, room6: false, room8: false },
  },
  {
    // 山善 大風量セラミックファンヒーター（温度センサー）DHF-S121 / 1200W / 2.8kg / 12,520円（2026-09-26 確認）
    id: 'heater-106',
    name: '山善 大風量セラミックファンヒーター（温度センサー）DHF-S121',
    category: 'heater',
    description: '室温センサーで設定温度を保つ大風量タイプ。5時間オートオフとチャイルドロックも備えたセラミックファンヒーターです。',
    priceRange: 3,
    features: ['消費電力 1200W', '適用畳数 〜8畳', '温度センサー（16〜28℃の5段階）', '切タイマー 1／2／4時間', '5時間オートオフ・チャイルドロック', '転倒オフスイッチ・サーモスタット・温度ヒューズ', '質量 2.8kg'],
    pros: ['安全機能が充実', '室温に合わせて運転し、暖めすぎを防ぎやすい'],
    cons: ['公式の運転音の記載はありません', '首振り・リモコンはありません'],
    recommendFor: '部屋全体を暖めたい、安全機能もしっかりほしい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00ux1uo.d8zued05.g00ux1uo.d8zufe48/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fgramsky2nd%2F2nd0dfb9mwzc%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fgramsky2nd%2Fi%2F10042298%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/gramsky2nd/cabinet/rakutenpic/systempic041/b0dfb9mwzc-00.jpg?_ex=300x300',
    enabled: true,
    attributes: { heatingPower: 5, quickHeat: 3, quietness: 3, safety: 5, ecoFeatures: 3, convenience: 1, lightness: 4, room6: true, room8: true },
  },
  {
    // アラジン 遠赤グラファイトヒーター（トリカゴ）CAH-G42GG / 400W/200W / 1.6kg / 13,300円（2026-09-26 確認）
    id: 'heater-107',
    name: 'アラジン 遠赤グラファイトヒーター（トリカゴ）CAH-G42GG',
    category: 'heater',
    description: 'わずか0.2秒で暖まるグラファイトヒーター。鳥かごのようなガードが付いた小型タイプで、防滴仕様です。',
    priceRange: 3,
    features: ['消費電力 400W／200W', '0.2秒で暖まる（公式）', '防滴仕様', 'ボール式転倒オフスイッチ・温度過昇防止装置', '大型ガード', '質量 約1.6kg'],
    pros: ['スイッチを入れてすぐ暖かい', '軽くて脱衣所などへ持ち運びやすい'],
    cons: ['400Wで、暖める範囲は足元や身のまわり向けです', 'タイマー・首振りはありません', '公式の適用畳数の記載はありません'],
    recommendFor: '脱衣所や足元で、スイッチを入れてすぐに暖まりたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pui9o.d8zue242.g00pui9o.d8zufcf1/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fe-kurashi%2F53256%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fe-kurashi%2Fi%2F10032544%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/e-kurashi/cabinet/main-img/017/main-r8l72.jpg?_ex=300x300',
    enabled: true,
    attributes: { heatingPower: 2, quickHeat: 5, quietness: 3, safety: 3, ecoFeatures: 1, convenience: 1, lightness: 5, room6: false, room8: false },
  },
  {
    // アラジン 遠赤グラファイトヒーター AEH-G1000B / 1000W / 約3.0kg / 15,730円（2026-09-26 確認）
    id: 'heater-108',
    name: 'アラジン 遠赤グラファイトヒーター AEH-G1000B',
    category: 'heater',
    description: '起動わずか0.2秒のグラファイトヒーター。1000Wから250Wまで4段階で切り替えられ、自動首振りも付いています。',
    priceRange: 3,
    features: ['消費電力 1000W（4段階切替）', '起動わずか0.2秒（公式）', '自動首振り', 'ボール式転倒オフスイッチ', '背面に取っ手', '質量 約3.0kg'],
    pros: ['すぐに暖まり、首振りで広めに暖められる', '出力を4段階で細かく選べる'],
    cons: ['タイマー・自動オフはありません', '公式の適用畳数の記載はありません', '安全装置は転倒オフスイッチの記載のみです'],
    recommendFor: 'すぐ暖まるヒーターで、リビングやデスクまわりを広めに暖めたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00prcko.d8zue9ad.g00prcko.d8zufb75/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fonestep%2Fp5e005%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fonestep%2Fi%2F10088592%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/onestep/cabinet/elect/elect09/p5e005.jpg?_ex=300x300',
    enabled: true,
    attributes: { heatingPower: 4, quickHeat: 5, quietness: 3, safety: 2, ecoFeatures: 2, convenience: 3, lightness: 4, room6: false, room8: false },
  },
  {
    // シャープ 加湿セラミックファンヒーター HX-TK12 / 1200W/1150W / 約5.5kg / 21,800円（2026-09-26 確認）
    id: 'heater-109',
    name: 'シャープ 加湿セラミックファンヒーター HX-TK12',
    category: 'heater',
    description: '暖房と加湿を1台でこなすセラミックファンヒーター。温度・湿度センサーによるエコ自動運転と、プラズマクラスターを搭載しています。',
    priceRange: 4,
    features: ['消費電力 1200W', '適用床面積 木造 約3〜6畳', '加湿（最大 約650mL/h）', 'エコ自動運転（温度・湿度センサー）', '運転音 弱 33dB', '二重安全転倒OFFスイッチ・切り忘れ防止8時間', '質量 約5.5kg'],
    pros: ['加湿しながら暖められる', '運転音の公表値が小さめ'],
    cons: ['質量が約5.5kgあり、持ち運びにはやや重め', '加湿タンクの給水・手入れが必要です', '価格が高め'],
    recommendFor: '冬の乾燥も気になる、リビングや寝室で暖房と加湿を1台で済ませたい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00qn68o.d8zuee0f.g00qn68o.d8zuf9b5/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fa-price%2F2980000491122%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fa-price%2Fi%2F11213026%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/a-price/cabinet/orj/46/0-2980000491122.jpg?_ex=300x300',
    enabled: true,
    attributes: { heatingPower: 5, quickHeat: 3, quietness: 4, safety: 3, ecoFeatures: 3, convenience: 3, lightness: 3, room6: true, room8: false },
  },
  {
    // アラジン 遠赤グラファイトヒーター（2灯管）CAH-2G10G / 1000W / 約6.7kg / 32,980円（2026-09-26 確認）
    id: 'heater-110',
    name: 'アラジン 遠赤グラファイトヒーター（2灯管）CAH-2G10G',
    category: 'heater',
    description: '0.2秒で立ち上がる2灯管のグラファイトヒーター。タイマーや8時間自動オフ、室温に合わせたパワーセーブなど機能が充実しています。',
    priceRange: 4,
    features: ['消費電力 1000W（700〜300W調整）', '0.2秒で立ち上がる（公式）', 'タイマー 0.5〜8時間・8時間自動オフ', '室温約22℃で自動パワーセーブ', '自動首振り・縦横ローテーション', '光センサー式転倒オフ・チャイルドロック・シャットオフセンサー', '質量 約6.7kg'],
    pros: ['すぐ暖まり、節電・安全の機能が多い', '縦置き・横置きを切り替えられる'],
    cons: ['価格が高め', '質量が約6.7kgあり重め', '公式の適用畳数の記載はありません'],
    recommendFor: 'リビングで長時間使う、すぐ暖まって機能も充実したヒーターがほしい人',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00q3omo.d8zueabb.g00q3omo.d8zuf668/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Femedama%2F4962365031685%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Femedama%2Fi%2F11188913%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/emedama/cabinet/1685/4962365031685_1.jpg?_ex=300x300',
    enabled: true,
    attributes: { heatingPower: 4, quickHeat: 5, quietness: 3, safety: 4, ecoFeatures: 4, convenience: 2, lightness: 2, room6: false, room8: false },
  },
]

/** 部屋の広さの条件を選んだときに結果の上部に出す説明 */
const roomNotice = (tatami: number) =>
  `メーカー公式の適用畳数（木造）が${tatami}畳以上の電気ヒーターからおすすめを表示しています。適用畳数は部屋の断熱性や外気温で変わります。`

export const heater: Diagnosis = {
  id: 'heater',
  slug: 'heater',
  name: 'ヒーター診断',
  itemName: 'ヒーター',
  group: 'life',
  icon: '🔥',
  shortDescription: '重視点・使う場所・暖めたい範囲・使用時間・静かさ・機能・予算から、あなたに合う電気ヒーターを診断。',
  intro:
    '家庭用の電気ヒーターを選ぶ診断です。重視すること、使う場所、暖めたい範囲、使用時間、静かさ、安全・便利機能、予算の7つの質問から、あなたに合いそうな電気ヒーターを相性順に表示します。',
  seo: {
    title: 'ヒーター診断｜質問に答えてあなたに合う電気ヒーターをチェック',
    description:
      '電気ヒーターを無料診断。速暖性・出力の大きさ・静かさ・安全機能・節電機能・使う場所・予算など7つの質問に答えるだけで、メーカー公式の仕様をもとに、セラミックヒーター・電気ストーブ・パネルヒーター・オイルヒーターなどからあなたに合うものが分かります。',
  },
  priceLabels: {
    1: '〜5,000円',
    2: '5,000〜10,000円',
    3: '10,000〜20,000円',
    4: '20,000円〜',
  },
  questions: [
    {
      id: 'priority',
      text: '一番重視することは？',
      shortLabel: '重視すること',
      weight: 22,
      options: [
        { id: 'quick', label: 'すぐに暖まること', summary: '速暖性を重視', effects: [{ type: 'atLeast', attr: 'quickHeat', value: 5 }] },
        { id: 'power', label: 'パワー（出力）の大きさ', summary: '出力の大きさを重視', effects: [{ type: 'atLeast', attr: 'heatingPower', value: 5 }] },
        { id: 'quiet', label: '静かさ', summary: '静かさを重視', effects: [{ type: 'atLeast', attr: 'quietness', value: 5 }] },
        { id: 'safety', label: '安全性', summary: '安全性を重視', effects: [{ type: 'atLeast', attr: 'safety', value: 5 }] },
        { id: 'eco', label: '節電機能', summary: '節電機能を重視', effects: [{ type: 'atLeast', attr: 'ecoFeatures', value: 5 }] },
      ],
    },
    {
      id: 'place',
      text: '主に使う場所は？',
      shortLabel: '使う場所',
      weight: 12,
      options: [
        { id: 'living', label: 'リビング', summary: 'リビングで使う', effects: [{ type: 'atLeast', attr: 'heatingPower', value: 4 }] },
        { id: 'bedroom', label: '寝室', summary: '寝室で使う', effects: [{ type: 'atLeast', attr: 'quietness', value: 4 }] },
        { id: 'washroom', label: '脱衣所・トイレ', summary: '脱衣所・トイレで使う', effects: [{ type: 'atLeast', attr: 'quickHeat', value: 4 }] },
        { id: 'desk', label: 'デスク・足元', summary: 'デスクや足元で使う', effects: [{ type: 'atLeast', attr: 'lightness', value: 4 }] },
      ],
    },
    {
      id: 'area',
      text: '暖めたい範囲は？',
      shortLabel: '暖めたい範囲',
      help: '部屋全体を選ぶと、メーカー公式の適用畳数がその広さ以上のヒーターからおすすめします。',
      // 能力が足りない商品を上位に出さないため、公式の適用畳数を適格条件にする（採点には使わない）
      weight: 16,
      options: [
        { id: 'feet', label: '足元だけ', summary: '足元を暖めたい', effects: [] },
        { id: 'around', label: '自分のまわり', summary: '自分のまわりを暖めたい', effects: [] },
        {
          id: 'room6',
          label: '部屋全体（〜6畳）',
          summary: '6畳までの部屋全体を暖めたい',
          effects: [],
          eligibility: { attr: 'room6', value: true, notice: roomNotice(6), supplementLabel: '公式の適用畳数が6畳未満、または記載がありません' },
        },
        {
          id: 'room8',
          label: '部屋全体（8畳以上）',
          summary: '8畳以上の部屋全体を暖めたい',
          effects: [],
          eligibility: { attr: 'room8', value: true, notice: roomNotice(8), supplementLabel: '公式の適用畳数が8畳未満、または記載がありません' },
        },
      ],
    },
    {
      id: 'hours',
      text: '1回に使う時間は？',
      shortLabel: '使用時間',
      weight: 12,
      options: [
        { id: 'short', label: '短時間（すぐ暖まりたい）', summary: '短時間使う', effects: [{ type: 'atLeast', attr: 'quickHeat', value: 4 }] },
        { id: 'middle', label: '数時間', effects: [] },
        {
          id: 'long',
          label: '長時間（つけっぱなしが多い）',
          summary: '長時間使う',
          effects: [
            { type: 'atLeast', attr: 'ecoFeatures', value: 4 },
            { type: 'atLeast', attr: 'safety', value: 4 },
          ],
        },
      ],
    },
    {
      id: 'noise',
      text: '運転音はどのくらい気になりますか？',
      shortLabel: '静かさ',
      weight: 12,
      options: [
        { id: 'very', label: 'とても気になる', summary: '運転音がとても気になる', effects: [{ type: 'atLeast', attr: 'quietness', value: 4 }] },
        { id: 'some', label: '少し気になる', summary: '運転音が少し気になる', effects: [{ type: 'atLeast', attr: 'quietness', value: 3 }] },
        { id: 'any', label: '気にならない', effects: [] },
      ],
    },
    {
      id: 'feature',
      text: '安全・便利機能で重視するものは？',
      shortLabel: '安全・便利機能',
      weight: 12,
      options: [
        { id: 'safety', label: '転倒OFF・過熱防止などの安全機能', summary: '安全機能を重視', effects: [{ type: 'atLeast', attr: 'safety', value: 4 }] },
        { id: 'eco', label: '人感センサー・タイマーなどの節電機能', summary: '節電機能を重視', effects: [{ type: 'atLeast', attr: 'ecoFeatures', value: 4 }] },
        { id: 'convenience', label: '首振り・リモコンなどの便利機能', summary: '便利機能を重視', effects: [{ type: 'atLeast', attr: 'convenience', value: 4 }] },
        { id: 'any', label: '特にこだわらない', effects: [] },
      ],
    },
    budgetQuestion({
      text: '予算は？',
      weight: 14,
      bands: [
        { label: '5,000円以下', summary: '予算5,000円以下' },
        { label: '10,000円以下', summary: '予算10,000円以下' },
        { label: '20,000円以下', summary: '予算20,000円以下' },
      ],
      // 「高価格の商品を希望する」ではなく「予算の上限を実質設けない」という意味。価格では採点しない
      noLimitLabel: '20,000円以上でもOK',
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
    title: '電気ヒーターの選び方',
    intro: 'この診断は、家庭用の電気ヒーターを対象に、メーカー公式の仕様をもとに以下のポイントとあなたの回答を照らし合わせて相性を計算しています。方式そのものに優劣はつけていません。',
    sections: [
      {
        heading: '暖めたい範囲と適用畳数',
        body: '部屋全体を暖めたい場合は、メーカーが公表している適用畳数を確認しましょう。この診断では木造の値で判定しています（断熱材の有無などで値が分かれている場合は、大きいほうの値）。足元や自分のまわりだけなら、小型のものでも十分な場合があります。',
      },
      {
        heading: '方式ごとの特徴',
        body: '方式によって暖まり方が異なります。',
        points: [
          'セラミックファンヒーター：温風で暖める。立ち上がりが早いものが多い',
          '電気ストーブ（カーボン・グラファイトなど）：光と熱で当たっている部分を暖める',
          'パネルヒーター：ファンを使わず、やわらかく暖める',
          'オイル／オイルレスヒーター：温風を出さず、部屋をじんわり暖める',
        ],
      },
      { heading: '安全機能', body: '転倒時自動OFF・過熱防止・切り忘れ防止・チャイルドロックなどがあると安心です。寝室や小さなお子さまのいる部屋では特に確認しましょう。' },
      {
        heading: '電気代と節電機能',
        body: '消費電力（出力）は暖房能力の目安ですが、実際の暖まり方は部屋の広さや断熱性、置き場所などでも変わります。電気代も使う時間や設定によって変わります。人感センサーや室温に応じた自動運転、タイマーなど、無駄な運転を減らす機能を確認しましょう。',
      },
      { heading: '静かさ', body: '寝室で使うなら、運転音の公表値や、ファンを使わない方式かどうかを確認しましょう。' },
    ],
  },
  notice:
    '適用畳数は部屋の断熱性や外気温によって変わります。電気ヒーターは周囲に燃えやすいものを置かず、取扱説明書に沿って安全にお使いください。本診断は使い方や好みから電気ヒーターの候補を探すためのもので、電気代を保証するものではありません。',
  enabled: true,
}

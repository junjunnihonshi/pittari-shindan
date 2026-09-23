import type { Diagnosis, Product } from '../../types/diagnosis.ts'
import { budgetQuestion } from './shared.ts'

/**
 * 掃除機診断
 *
 * 【対象範囲】家庭の床掃除に使う「メイン掃除機」を選ぶ診断です。
 *   本番候補：コードレススティック / コード式スティック / キャニスター など床掃除の主力になる製品
 *   本番候補外：ロボット掃除機、ハンディ掃除機（実商品選定の対象にしない）
 *
 * 商品の attributes（評価項目）。数値はすべて 1〜5 で、大きいほどその点に優れています。
 *   suction     : 吸引力
 *   lightness   : 軽さ（取り回しのしやすさ）
 *   easyCare    : お手入れのしやすさ（ゴミ捨て・フィルター掃除など）
 *   quiet       : 静音性
 *   flooring    : フローリング適性
 *   carpet      : カーペット・ラグ適性
 *   hair        : 髪の毛への強さ（ブラシへの絡みにくさなど）
 *   petHair     : ペットの毛への強さ
 *   largeDebris : 大きめのゴミ（食べこぼしなど）への強さ
 *   largeHome   : 広い家への適性（連続使用時間・ゴミ容量など）
 *   stablePower : 吸引力の安定性・連続運転のしやすさ（コード式は高め。長時間バッテリーの上位コードレスも高め）
 *   cordless    : コードレスか（true / false）。Q6「コードレスを優先したい」で使用
 * 採点には使わない参考情報:
 *   type        : 'stick'（スティック） / 'canister'（キャニスター） / 'robot'（ロボット） / 'handy'（ハンディ）
 *   dustbox     : 'paper'（紙パック） / 'cyclone'（サイクロン・ダストカップ）
 * 価格帯（priceRange）は priceLabels を参照（1: 〜15,000円 / 2: 〜30,000円 / 3: 〜50,000円 / 4: 50,000円〜）。
 *
 *
 * 【並び順のルール】（共通エンジンの設定で実現）
 *   - Q6「コードレスを優先したい」：コードレスだけを通常ランキングの候補にする（適格条件。予算より優先）
 *   - Q5 予算：予算内の商品を通常ランキングの候補にする（上限条件）
 *   - 通常ランキングが3件に満たないときだけ、条件を満たさない商品を別枠の補完候補として表示する
 *   - 相性スコアが完全に同じときは、回答に関係する一致度 → 評価値 → 商品ID の順で並べる（scoring.tieBreak）
 *
 * 商品は実商品10機種（2026-09-23 選定）。評価値はメーカー公式情報をもとに
 * data/rakuten-candidates/vacuum/scoring-criteria.md の基準で採点したもの（結果を整える目的で変更しないこと）。
 */

/** 商品データ（実商品10機種。評価値はメーカー公式情報に基づく） */
const products: Product[] = [
  {
    // ツインバード TC-E123 / 楽天 twinbird:10000639 / 6,480円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/vacuum/evaluation-draft.json（採点基準 scoring-criteria.md v1）
    id: 'vacuum-101',
    name: 'ツインバード サイクロンスティック型クリーナー TC-E123',
    category: 'vacuum',
    description: 'コード式のサイクロンスティッククリーナー。質量約1.7kgで、スティックとハンディの2WAYで使えます。',
    priceRange: 1,
    features: ['コード式', 'サイクロン式（集じん容量 約0.6L）', '質量 約1.7kg', 'スティック／ハンディの2WAY', 'ダストケース・フィルター水洗い可'],
    pros: ['価格が手頃', 'コード式なのでバッテリー切れの心配がない', 'ダストケースやフィルターを水洗いできる'],
    cons: ['床用吸込口は回転ブラシのない「ノーマル（ブラシなし）」タイプです', '吸込仕事率は70Wと控えめです'],
    recommendFor: '手頃な価格で、コード式のスティッククリーナーを使いたい人',
    caution: '楽天の商品ページでは「ベーシック（TC-E123）」と「パワフル（TC-E124）」を選べます。この診断は「ベーシック（TC-E123）」を想定しています。カーペットの奥のゴミは取りにくい場合があります。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00tar4o.d8zue1bc.g00tar4o.d8zufd13/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Ftwinbird%2F51241%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Ftwinbird%2Fi%2F10000639%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/twinbird/cabinet/06297082/51241/imgrc0105214316.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { type: 'stick', cordless: false, dustbox: 'cyclone', suction: 2, lightness: 4, easyCare: 3, quiet: 3, flooring: 3, carpet: 2, hair: 3, petHair: 3, largeDebris: 3, largeHome: 4, stablePower: 5 },
  },
  {
    // パナソニック MC-PJ25A / 楽天 yamada-denki:10677600 / 16,197円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/vacuum/evaluation-draft.json（採点基準 scoring-criteria.md v1）
    id: 'vacuum-102',
    name: 'パナソニック 紙パック式キャニスター掃除機 MC-PJ25A',
    category: 'vacuum',
    description: '吸込仕事率560Wの紙パック式キャニスター掃除機。集じん容量は1.3Lです。',
    priceRange: 2,
    features: ['キャニスター型・コード式', '紙パック式（集じん容量1.3L）', '吸込仕事率 560W〜約60W', '運転音 65〜約60dB', 'コード長さ5m'],
    pros: ['吸込仕事率が高い', '紙パック式でゴミ捨て時に手が汚れにくい', 'ゴミをためられる量が多い'],
    cons: ['本体質量2.7kg（標準質量4.0kg）で、スティック型より重めです', '紙パックの購入が必要です'],
    recommendFor: '予算を抑えつつ、吸引力と紙パックの手軽さを重視したい人',
    caution: '床用ノズル（エアロノズル）の構造は、購入前に商品ページでご確認ください。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00t3jpo.d8zuedce.g00t3jpo.d8zufb63/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fyamada-denki%2F1386461010%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fyamada-denki%2Fi%2F10677600%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/yamada-denki/cabinet/a07000505/1386461010.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { type: 'canister', cordless: false, dustbox: 'paper', suction: 5, lightness: 2, easyCare: 4, quiet: 3, flooring: 3, carpet: 3, hair: 3, petHair: 3, largeDebris: 3, largeHome: 5, stablePower: 5 },
  },
  {
    // マキタ CL115FDW / 楽天 yamamura:10010408 / 13,409円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/vacuum/evaluation-draft-additions.json（採点基準 scoring-criteria.md v1）
    id: 'vacuum-103',
    name: 'マキタ 充電式クリーナ CL115FDW',
    category: 'vacuum',
    description: '紙パック式のコードレススティッククリーナー。標準モードで約50分使え、本体質量は1.0kgです。',
    priceRange: 1,
    features: ['コードレス（10.8V）', '紙パック式（紙パック330mL／ダストバッグ500mL）', '連続使用 標準約50分', '本体質量1.0kg', 'フロア・カーペットノズル付属'],
    pros: ['紙パック式でゴミ捨てが簡単', '標準モードで約50分使える', '軽くて取り回しやすい'],
    cons: ['充電時間は約4時間です', '吸込仕事率・運転音は公表されていません'],
    recommendFor: '手頃な価格で、軽くて紙パック式のコードレスを使いたい人',
    caution: '質量1.0kgは本体のみの値です（パイプ・ノズル装着時はこれより重くなります）。カラーは3色から選べます（性能・価格は同じ）。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00ppwho.d8zue189.g00ppwho.d8zufd4b/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fyamamura%2Fcl115fdw%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fyamamura%2Fi%2F10010408%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/yamamura/cabinet/point3/cl115fdw_main.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { type: 'stick', cordless: true, dustbox: 'paper', suction: 3, lightness: 5, easyCare: 4, quiet: 3, flooring: 3, carpet: 3, hair: 3, petHair: 3, largeDebris: 3, largeHome: 4, stablePower: 4 },
  },
  {
    // プラスマイナスゼロ（±0） XJC-G040 / 楽天 importshopaqua:10005136 / 22,000円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/vacuum/evaluation-draft.json（採点基準 scoring-criteria.md v1）
    id: 'vacuum-104',
    name: '±0（プラスマイナスゼロ） コードレスクリーナー G040 XJC-G040',
    category: 'vacuum',
    description: 'スティック時約1.2kgの軽量コードレスクリーナー。標準モードで約57分使えます。',
    priceRange: 2,
    features: ['コードレス（バッテリー交換可）', 'サイクロン式（集じん容量 約0.45L）', 'スティック時 約1.2kg', '連続使用 標準約57分'],
    pros: ['軽くて取り回しやすい', '標準モードで長く使える', 'タイヤを外して絡まった髪のお手入れができる'],
    cons: ['吸込仕事率はハイパワー時41Wと控えめです', 'フロアノズルの構造（回転ブラシの有無）は公表されていません'],
    recommendFor: '軽さと運転時間のバランスを重視して、日常の床掃除をしたい人',
    caution: 'カラーは6色から選べます（性能・価格は同じ）。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pz5qo.d8zue590.g00pz5qo.d8zufa9f/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fimportshopaqua%2Fpm-clclnr%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fimportshopaqua%2Fi%2F10005136%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/importshopaqua/cabinet/zoom_c/omk1/10/pm-clclnr.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { type: 'stick', cordless: true, dustbox: 'cyclone', suction: 2, lightness: 5, easyCare: 3, quiet: 3, flooring: 3, carpet: 3, hair: 3, petHair: 3, largeDebris: 3, largeHome: 4, stablePower: 4 },
  },
  {
    // アイリスオーヤマ SCD-124P（マジカリーナ・サイクロン式） / 楽天 irisplaza-r:10156233 / 21,800円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/vacuum/evaluation-draft.json（採点基準 scoring-criteria.md v1）
    id: 'vacuum-105',
    name: 'アイリスオーヤマ 充電式サイクロンスティッククリーナー SCD-124P',
    category: 'vacuum',
    description: 'パワーヘッドを搭載した、フロアヘッド・延長パイプ込みで約1.1kgの軽量コードレスクリーナーです。',
    priceRange: 2,
    features: ['コードレス', 'サイクロン式（集じん容積0.25L）', 'パワーヘッド（きわまでヘッド）', '使用時 約1.1kg', '連続使用 標準約17分／自動モード（フロアヘッド使用時）約30分'],
    pros: ['とても軽い', '回転ブラシ付きのパワーヘッドを搭載', '充電スタンド・静電モップ付き'],
    cons: ['標準モードの連続使用は約17分と短めです', '運転音は公表されていません'],
    recommendFor: '軽さを重視して、ワンルーム〜2部屋程度をこまめに掃除したい人',
    caution: '楽天の商品ページにはサイクロン式・紙パック式、リニューアル品・従来品が混在しています。この診断は「リニューアル品（きわまでヘッド）・サイクロン式・単品（SCD-124P）」を想定しています。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00t3zto.d8zuee14.g00t3zto.d8zuf2f4/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Firisplaza-r%2F201505%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Firisplaza-r%2Fi%2F10156233%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/irisplaza-r/cabinet/12113165/imgrc0117395433.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { type: 'stick', cordless: true, dustbox: 'cyclone', suction: 3, lightness: 5, easyCare: 3, quiet: 3, flooring: 4, carpet: 4, hair: 3, petHair: 3, largeDebris: 3, largeHome: 3, stablePower: 2 },
  },
  {
    // 三菱電機 Be-K TC-FRX1 / 楽天 jyousui:10004280 / 24,970円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/vacuum/evaluation-draft.json（採点基準 scoring-criteria.md v1）
    id: 'vacuum-106',
    name: '三菱電機 紙パック式掃除機 Be-K TC-FRX1',
    category: 'vacuum',
    description: '吸込仕事率500Wの紙パック式キャニスター掃除機。自走式パワーブラシを搭載しています。',
    priceRange: 2,
    features: ['キャニスター型・コード式', '紙パック式（集塵容積1.5L）', '吸込仕事率 500W〜約100W', '自走式パワーブラシ', '運転音 64dB〜約58dB'],
    pros: ['吸込仕事率が高く、自走式パワーブラシでカーペットも掃除しやすい', '紙パック式でゴミ捨てが簡単', 'ゴミをためられる量が多い'],
    cons: ['本体質量2.4kg（総質量3.8kg）で、スティック型より重めです', '紙パックの購入が必要です'],
    recommendFor: '広めの家やカーペットのある部屋を、しっかり掃除したい人',
    caution: 'メーカーの区分では旧型品（後継機種あり）のため、在庫がなくなる場合があります。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00qdvoo.d8zueb5e.g00qdvoo.d8zuf757/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fjyousui%2F5603-01%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fjyousui%2Fi%2F10004280%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/jyousui/cabinet/shouhin/souziki/tc-frx1/tc-frx1top09.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { type: 'canister', cordless: false, dustbox: 'paper', suction: 5, lightness: 3, easyCare: 4, quiet: 4, flooring: 4, carpet: 5, hair: 3, petHair: 3, largeDebris: 3, largeHome: 5, stablePower: 5 },
  },
  {
    // 日立 CV-SP300M / 楽天 a-price:11294223 / 28,800円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/vacuum/evaluation-draft.json（採点基準 scoring-criteria.md v1）
    id: 'vacuum-107',
    name: '日立 サイクロン式クリーナー CV-SP300M',
    category: 'vacuum',
    description: '運転音59dBの静かなサイクロン式キャニスター掃除機。髪の毛などが絡みにくい「からまんブラシ」を搭載しています。',
    priceRange: 2,
    features: ['キャニスター型・コード式', 'サイクロン式（集じん容積0.25L）', '運転音 59〜約54dB', '吸込仕事率 290W〜約40W', '自走式ヘッド・からまんブラシ'],
    pros: ['運転音が静か', '髪の毛などが絡みにくいブラシ', 'ダストケース・フィルターを水洗いできる'],
    cons: ['本体質量2.5kg（標準質量3.8kg）で、スティック型より重めです', 'サイクロン式なのでこまめなゴミ捨てが必要です'],
    recommendFor: '運転音を抑えたい人、髪の毛の掃除が気になる人',
    caution: '楽天の商品ページでは延長保証付きも選べます。この診断は「本体＋メーカー保証」の価格を想定しています。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00qn68o.d8zuee0f.g00qn68o.d8zuf9b5/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fa-price%2F4549873192468%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fa-price%2Fi%2F11294223%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/a-price/cabinet/pics/988/4549873192468.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { type: 'canister', cordless: false, dustbox: 'cyclone', suction: 3, lightness: 3, easyCare: 4, quiet: 5, flooring: 4, carpet: 4, hair: 5, petHair: 4, largeDebris: 3, largeHome: 4, stablePower: 5 },
  },
  {
    // 日立 PV-BL50L（パワかるスティック） / 楽天 akindo:10197548 / 38,580円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/vacuum/evaluation-draft.json（採点基準 scoring-criteria.md v1）
    id: 'vacuum-108',
    name: '日立 コードレススティッククリーナー パワかるスティック PV-BL50L',
    category: 'vacuum',
    description: '標準質量1.4kgのコードレススティック。自走式ヘッドと、髪の毛などが絡みにくい「からまんブラシ」を搭載しています。',
    priceRange: 3,
    features: ['コードレス', 'サイクロン式（集じん容積0.15L）', '標準質量1.4kg', '連続使用 標準約40分（ヘッド使用時）', '自走式ヘッド・からまんブラシ'],
    pros: ['髪の毛などが絡みにくいブラシ', '自走式ヘッドで軽い力で動かせる', '回転ブラシ・フィルターを水洗いできる'],
    cons: ['集じん容積が0.15Lと小さめです', '吸込仕事率・運転音は公表されていません'],
    recommendFor: '髪の毛やペットの毛が気になり、コードレスで手軽に掃除したい人',
    caution: '楽天のレビュー件数はまだ少なめです。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00pii8o.d8zuea56.g00pii8o.d8zuf71a/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fakindo%2Fpv-bl50l-n%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fakindo%2Fi%2F10197548%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/akindo/cabinet/l38/pv-bl50l-n.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { type: 'stick', cordless: true, dustbox: 'cyclone', suction: 3, lightness: 4, easyCare: 4, quiet: 3, flooring: 4, carpet: 4, hair: 5, petHair: 4, largeDebris: 3, largeHome: 4, stablePower: 4 },
  },
  {
    // Shark（シャーク） EVOPOWER SYSTEM iQ CS851J / 楽天 shark:10000223 / 48,510円（2026-09-23 確認。9/25 08:59 までのセール価格で、通常は 69,300円）
    // 商品画像は、同じ商品ページ内の販促文字が入らない画像を使用
    // 評価の根拠：data/rakuten-candidates/vacuum/evaluation-draft.json（採点基準 scoring-criteria.md v1）
    id: 'vacuum-109',
    name: 'Shark EVOPOWER SYSTEM iQ コードレススティッククリーナー CS851J',
    category: 'vacuum',
    description: 'ソフトローラーとパワーフィンを組み合わせたヘッドを搭載したコードレススティック。バッテリーが2個付属します。',
    priceRange: 3,
    features: ['コードレス（バッテリー2個付属）', 'サイクロン式', 'ハイブリッドパワークリーンヘッド（ソフトローラー＋パワーフィン）', 'スティック時 約2.0kg', '運転時間 エコ約50分（バッテリー2個連続使用時）'],
    pros: ['フローリングにもカーペットにも対応したヘッド', '髪の毛やペットの毛が絡みにくい（メーカー試験による）', 'ダストカップ・フィルター・ブラシロールを水洗いできる'],
    cons: ['スティック時約2.0kgと、軽量タイプより重めです', '吸込仕事率・運転音は公表されていません'],
    recommendFor: 'フローリングとカーペットの両方を、コードレスでしっかり掃除したい人',
    caution: '自動ゴミ収集ドック付きの上位機種（iQ+）とは別の機種です。表示価格はセール価格の場合があり、価格が変わると価格帯の表示が変わることがあります。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00toapo.d8zue9b0.g00toapo.d8zufff5/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fshark%2Fcs851j%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fshark%2Fi%2F10000223%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/shark/cabinet/products/thum/p00/cs851j.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { type: 'stick', cordless: true, dustbox: 'cyclone', suction: 3, lightness: 3, easyCare: 4, quiet: 3, flooring: 5, carpet: 5, hair: 5, petHair: 4, largeDebris: 3, largeHome: 4, stablePower: 4 },
  },
  {
    // ダイソン PencilVac Fluffycones SV50 FC / 楽天 dyson:10002008 / 74,800円（2026-09-23 確認）
    // 評価の根拠：data/rakuten-candidates/vacuum/evaluation-draft.json（採点基準 scoring-criteria.md v1）
    // lightness：公式サイトの本体質量 1.8kg（Fluffycones クリーナーヘッド装着時）により 4（2026-09-23 公式ページで確認。当初の 1.3kg は別機種 SV50 FF の値）
    id: 'vacuum-110',
    name: 'ダイソン PencilVac Fluffycones（SV50 FC）',
    category: 'vacuum',
    description: '細身の本体のコードレスクリーナー。回転ブラシを工具なしで外して水洗いできます。',
    priceRange: 4,
    features: ['コードレス', 'サイクロン式（クリアビン）', '本体質量 1.8kg（Fluffycones クリーナーヘッド装着時）', 'Fluffycones クリーナーヘッド', '毛絡み防止スクリューツール付属'],
    pros: ['細身の本体で取り回しやすい', '回転ブラシを工具なしで外して水洗いできる', 'クリアビン・フィルターを水洗いできる'],
    cons: ['価格帯は高めです', '床用ヘッド使用時の運転時間の公表値は確認できていません'],
    recommendFor: '取り回しやすさとお手入れのしやすさを重視し、上位機種を選びたい人',
    caution: '最長運転時間（約30分）は、モーター駆動ではない付属ツールをエコモードで使った場合の値です。',
    amazonUrl: '',
    rakutenUrl: 'https://hb.afl.rakuten.co.jp/hgc/g00s44mo.d8zue21f.g00s44mo.d8zuff7f/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fdyson%2F499044-01%2F&m=http%3A%2F%2Fm.rakuten.co.jp%2Fdyson%2Fi%2F10002008%2F',
    imageUrl: 'https://thumbnail.image.rakuten.co.jp/@0_mall/dyson/cabinet/product/11756959/sv50fc_point_em.jpg?_ex=300x300',
    enabled: true,
    sample: false,
    attributes: { type: 'stick', cordless: true, dustbox: 'cyclone', suction: 3, lightness: 4, easyCare: 4, quiet: 3, flooring: 4, carpet: 4, hair: 4, petHair: 4, largeDebris: 3, largeHome: 3, stablePower: 3 },
  },
]

export const vacuum: Diagnosis = {
  id: 'vacuum',
  slug: 'vacuum',
  name: '掃除機診断',
  itemName: '掃除機',
  group: 'life',
  icon: '🧹',
  shortDescription: '重視すること・床の種類・掃除する範囲・予算から、あなたに合う掃除機を診断。',
  intro:
    '一番重視することや掃除する床・範囲、気になるゴミ、予算、使い方の希望の6つの質問から、床掃除のメインに使う掃除機を相性順に表示します。',
  seo: {
    title: '掃除機診断｜質問に答えてあなたに合う掃除機をチェック',
    description:
      'コードレススティック・コード式スティック・キャニスターなど、家庭の床掃除に使うメイン掃除機を無料診断。吸引力・軽さ・床の種類・予算など6つの質問から、あなたに合う掃除機が分かります。',
  },
  priceLabels: {
    1: '〜15,000円',
    2: '15,000〜30,000円',
    3: '30,000〜50,000円',
    4: '50,000円〜',
  },
  questions: [
    {
      id: 'priority',
      text: '一番重視することは？',
      shortLabel: '重視すること',
      weight: 24,
      options: [
        { id: 'suction', label: '吸引力', summary: '吸引力を重視', effects: [{ type: 'atLeast', attr: 'suction', value: 5 }] },
        { id: 'light', label: '軽さ', summary: '軽さを重視', effects: [{ type: 'atLeast', attr: 'lightness', value: 5 }] },
        { id: 'care', label: 'お手入れの楽さ', summary: 'お手入れの楽さを重視', effects: [{ type: 'atLeast', attr: 'easyCare', value: 5 }] },
        { id: 'quiet', label: '静かさ', summary: '静かさを重視', effects: [{ type: 'atLeast', attr: 'quiet', value: 5 }] },
        {
          id: 'value',
          label: 'コストパフォーマンス',
          summary: 'コストパフォーマンスを重視',
          // 価格が手頃（2以下）であることを主に、最低限の吸引力（3以上）もあわせて評価
          effects: [
            { type: 'atMost', attr: 'priceRange', value: 2, weight: 2 },
            { type: 'atLeast', attr: 'suction', value: 3 },
          ],
        },
      ],
    },
    {
      id: 'floor',
      text: '主に掃除する床は？',
      shortLabel: '床の種類',
      weight: 18,
      options: [
        { id: 'flooring', label: 'フローリング中心', summary: 'フローリング中心', effects: [{ type: 'atLeast', attr: 'flooring', value: 4 }] },
        { id: 'carpet', label: 'カーペット・ラグが多い', summary: 'カーペット・ラグが多い', effects: [{ type: 'atLeast', attr: 'carpet', value: 4 }] },
        {
          id: 'both',
          label: 'フローリングとカーペットの両方',
          summary: 'フローリングとカーペットの両方',
          effects: [
            { type: 'atLeast', attr: 'flooring', value: 4 },
            { type: 'atLeast', attr: 'carpet', value: 4 },
          ],
        },
      ],
    },
    {
      id: 'area',
      text: '掃除する範囲は？',
      shortLabel: '掃除する範囲',
      weight: 13,
      options: [
        // 一部屋程度なら広い家への適性は不要。取り回しやすい軽さを少しだけ評価する
        { id: 'small', label: 'ワンルーム・一部屋程度', summary: 'ワンルーム・一部屋程度', effects: [{ type: 'atLeast', attr: 'lightness', value: 3 }] },
        { id: 'mid', label: '2〜3部屋', summary: '2〜3部屋を掃除する', effects: [{ type: 'atLeast', attr: 'largeHome', value: 3 }] },
        { id: 'large', label: '戸建て・広い家', summary: '戸建て・広い家を掃除する', effects: [{ type: 'atLeast', attr: 'largeHome', value: 5 }] },
      ],
    },
    {
      id: 'concern',
      text: '掃除で気になるものは？',
      shortLabel: '気になるゴミ',
      weight: 13,
      options: [
        { id: 'dust', label: '普通のホコリやゴミ', effects: [] },
        { id: 'hair', label: '髪の毛', summary: '髪の毛が気になる', effects: [{ type: 'atLeast', attr: 'hair', value: 4 }] },
        { id: 'pet', label: 'ペットの毛', summary: 'ペットの毛が気になる', effects: [{ type: 'atLeast', attr: 'petHair', value: 4 }] },
        { id: 'debris', label: '食べこぼしなど大きめのゴミ', summary: '大きめのゴミが気になる', effects: [{ type: 'atLeast', attr: 'largeDebris', value: 4 }] },
      ],
    },
    budgetQuestion({
      text: '予算は？',
      weight: 17,
      bands: [
        { label: '15,000円以下', summary: '予算15,000円以下' },
        { label: '15,000〜30,000円', summary: '予算15,000〜30,000円' },
        { label: '30,000〜50,000円', summary: '予算30,000〜50,000円' },
      ],
      // 「高価格の商品を希望する」ではなく「予算の上限を実質設けない」という意味。価格では採点しない
      noLimitLabel: '50,000円以上でもOK',
      // 予算は上限条件：予算内の商品を通常ランキングにし、足りないときだけ予算を少し超える商品を別枠に表示
      asLimit: true,
    }),
    {
      id: 'usage',
      text: '使い方の希望は？',
      shortLabel: '使い方',
      weight: 15,
      options: [
        {
          id: 'cordless',
          label: 'コードレスを優先したい',
          summary: 'コードレスを優先したい',
          // 適格条件：コードレスの商品だけを通常ランキングの候補にする（予算より優先）。
          // 候補がすべてコードレスになるため、この回答は採点には使わない（effects は空）。
          // コードレスが3件未満のときだけ、コード式を補完候補として別枠に表示する
          effects: [],
          eligibility: {
            attr: 'cordless',
            value: true,
            notice: 'コードレスを優先した商品からおすすめを表示しています。',
            supplementLabel: 'コードレスの候補が少ないため、コード式の商品を補完しています',
          },
        },
        {
          id: 'power',
          label: 'コードがあっても吸引力・安定性を優先したい',
          summary: '吸引力・安定性を優先したい',
          // コード式を無条件に優遇せず、吸引力と連続運転の安定性で評価する（長時間バッテリーの上位コードレスも対象）
          effects: [
            { type: 'atLeast', attr: 'suction', value: 4 },
            { type: 'atLeast', attr: 'stablePower', value: 4 },
          ],
        },
        { id: 'any', label: '特にこだわらない', effects: [] },
      ],
    },
  ],
  products,
  // 相性スコアが完全に同じときは、回答に関係する一致度・評価値で並び順を決める（価格などは使わない）
  scoring: { tieBreak: true },
  guide: {
    title: '掃除機の選び方',
    intro:
      'この診断は、家庭の床掃除に使うメイン掃除機を対象に、以下のポイントとあなたの回答を照らし合わせて相性を計算しています。',
    sections: [
      {
        heading: 'タイプで選ぶ',
        body: '床掃除のメインになる掃除機は、主に3つのタイプがあります。',
        points: [
          'コードレススティック：軽くて取り回しがよく、思い立ったときにすぐ使える',
          'コード式スティック：スティックの手軽さで、バッテリー切れの心配がない',
          'キャニスター：本体を引いて使うタイプ。吸引力が安定し、広い家も掃除しやすい',
        ],
      },
      {
        heading: 'コードレスか、コード式か',
        body: 'コードレスは手軽さが魅力ですが、使える時間はバッテリー次第です。コード式は長時間でも吸引力が安定しやすく、広い家やしっかり掃除したい人に向いています。',
      },
      {
        heading: '吸引力と床の種類',
        body: 'フローリング中心なら標準的な吸引力でも十分なことが多く、カーペットやラグが多い場合は、奥のゴミまで吸い取れる吸引力やヘッドの性能が重要になります。',
      },
      {
        heading: '軽さと掃除する範囲',
        body: '一部屋程度なら軽くて取り回しやすいものが便利です。戸建てや広い家では、連続使用時間やゴミをためられる量も確認しましょう。',
      },
      {
        heading: '髪の毛・ペットの毛・大きめのゴミ',
        body: '髪の毛やペットの毛が気になる場合は、ブラシに毛が絡みにくいヘッドかどうかを確認しましょう。食べこぼしなど大きめのゴミが多いなら、ゴミを吸い込みやすいヘッドの形状もポイントです。',
      },
      {
        heading: 'お手入れと静かさ',
        body: '紙パック式はゴミ捨て時にホコリが舞いにくく、サイクロン式は紙パックの買い足しが不要です。集合住宅や夜に掃除することが多いなら、運転音の大きさも確認しておくと安心です。',
      },
      {
        heading: '予算の目安',
        body: '手頃な価格帯でも基本的な床掃除には十分な製品が多く、価格が上がるほど吸引力・バッテリー・ヘッドの性能やお手入れのしやすさが充実する傾向があります。',
      },
    ],
  },
  enabled: true,
}

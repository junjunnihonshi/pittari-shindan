/**
 * 楽天市場APIで商品候補を検索するときの条件（カテゴリごと）。
 * 検索キーワードや除外ワードを変えたい場合はここを編集してください。
 */
/** 価格条件付きの検索キーワード（その検索だけ、プリセット全体の minPrice / maxPrice の代わりに使う） */
export interface PricedKeyword {
  keyword: string
  minPrice?: number
  maxPrice?: number
}

export interface RakutenPreset {
  /** 診断ID（src/data/diagnoses の id と同じ） */
  category: string
  /**
   * 検索キーワード（1つずつ順番に検索し、商品コードで重複を除きます）。
   * 特定の価格帯だけを探したい検索は { keyword, maxPrice } の形で書けます。
   */
  keywords: (string | PricedKeyword)[]
  /** 除外キーワード（スペース区切り） */
  ngKeyword?: string
  /** 並び順（楽天API の sort パラメータ） */
  sort: string
  /** 1キーワードあたりの取得件数（1〜30） */
  hits: number
  minPrice?: number
  maxPrice?: number
  /** priceRange（1〜5）を決める価格の境界（円）。例: [3000, 6000, 10000] → 〜3000円=1, 〜6000円=2 … */
  priceThresholds: number[]
  /**
   * 1ショップあたりの候補の上限（任意）。
   * メーカー公式店などが検索上位を占めて、特定メーカーに候補が偏るのを防ぎます。
   * 同じショップの候補はレビュー件数の多い順に残します。
   */
  maxPerShop?: number
  /**
   * 候補JSONの productDraft.attributes に用意する評価項目（任意）。
   * 値は null で出力されるので、人が商品ページを確認して記入します。
   */
  attributeKeys?: string[]
}

export const presets: Record<string, RakutenPreset> = {
  pillow: {
    category: 'pillow',
    keywords: ['枕 横向き寝', '枕 仰向け', '枕 高さ調整', '枕 洗える', '枕 低反発', '枕 パイプ'],
    ngKeyword: 'カバー ケース 抱き枕 クッション ペット 子供用 ベビー',
    sort: '-reviewCount',
    hits: 10,
    minPrice: 1000,
    // src/data/diagnoses/pillow.ts の priceLabels に合わせる（〜3,000 / 〜6,000 / 〜10,000 / それ以上）
    priceThresholds: [3000, 6000, 10000],
  },

  /**
   * 掃除機：家庭の床掃除に使う「メイン掃除機」の候補。
   * 本番候補はコードレススティック・コード式スティック・キャニスター。
   * ロボット掃除機・ハンディ掃除機は対象外なので、候補に混ざっていたら確認時に除外してください。
   * （「ハンディ」は“2WAYでハンディにもなるスティック”の商品名にも多く含まれるため、除外ワードにはしていません）
   */
  vacuum: {
    category: 'vacuum',
    // 特性の違う商品を拾えるよう、タイプ・方式・用途別に検索する（メーカー名は入れない）
    keywords: [
      'コードレス掃除機 スティック',
      '紙パック式 掃除機',
      'キャニスター掃除機',
      'コード式 スティック掃除機',
      'ペット 毛 掃除機',
      '軽量 コードレス掃除機',
      'サイクロン 掃除機 吸引力',
      '静音 掃除機',
    ],
    ngKeyword: 'ロボット 布団クリーナー 車用 交換用 互換 部品 中古 訳あり',
    sort: '-reviewCount',
    hits: 10,
    // 替えブラシ・フィルターなどの付属品を除くための下限
    minPrice: 5000,
    // 同じショップ（メーカー公式店など）からは最大3件まで
    maxPerShop: 3,
    // src/data/diagnoses/vacuum.ts の priceLabels に合わせる（〜15,000 / 〜30,000 / 〜50,000 / それ以上）
    priceThresholds: [15000, 30000, 50000],
    // vacuum.ts の評価項目（確認時に記入する）
    attributeKeys: [
      'type',
      'cordless',
      'dustbox',
      'suction',
      'lightness',
      'easyCare',
      'quiet',
      'flooring',
      'carpet',
      'hair',
      'petHair',
      'largeDebris',
      'largeHome',
      'stablePower',
    ],
  },

  /**
   * ドライヤー：家庭で日常的に使うヘアドライヤーの候補。
   * 業務用専用機・ペット用・ハンズフリー専用機・カールドライヤー（ブラシ型）は対象外。
   * 1万円以下の候補を確保するため、価格帯を指定した検索を多めに入れている。
   */
  'hair-dryer': {
    category: 'hair-dryer',
    // 役割（速乾・軽量・ヘアケア・静音・頭皮）と価格帯が偏らないように検索する（メーカー名は入れない）
    keywords: [
      'ドライヤー 大風量',
      'ドライヤー 速乾',
      'ドライヤー 軽量',
      'ドライヤー ヘアケア',
      'ドライヤー 静音',
      'ドライヤー スカルプ',
      'ドライヤー 折りたたみ',
      // 1万円以下（価格帯1）を重点的に探す
      { keyword: 'ドライヤー', maxPrice: 10000 },
      { keyword: 'ドライヤー 大風量', maxPrice: 10000 },
      { keyword: 'ドライヤー 軽量', maxPrice: 10000 },
      { keyword: 'ドライヤー 低温', maxPrice: 10000 },
      { keyword: 'ドライヤー イオン', maxPrice: 10000 },
      { keyword: 'ドライヤー', minPrice: 3000, maxPrice: 6000 },
      // 価格帯2〜4
      { keyword: 'ドライヤー', minPrice: 10001, maxPrice: 20000 },
      { keyword: 'ドライヤー', minPrice: 20001, maxPrice: 40000 },
      { keyword: '高級 ドライヤー', minPrice: 40001 },
    ],
    ngKeyword:
      'ペット 犬 猫 業務用 ハンズフリー スタンド ホルダー カール ブラシ アイロン ストレート 交換用 ノズル単品 部品 中古 訳あり',
    sort: '-reviewCount',
    hits: 15,
    // 付属品・ノズル単品などを除くための下限
    minPrice: 1500,
    // 同じショップ（メーカー公式店など）からは最大3件まで
    maxPerShop: 3,
    // src/data/diagnoses/hairDryer.ts の priceLabels に合わせる（〜10,000 / 〜20,000 / 〜40,000 / それ以上）
    priceThresholds: [10000, 20000, 40000],
    // hairDryer.ts の評価項目（公式仕様を確認して記入する）
    attributeKeys: ['dryingPower', 'hairCare', 'lightness', 'quiet', 'manageability', 'scalpCare', 'compactness'],
  },

  /**
   * フライパン：家庭で日常的に使うメインのフライパン（26cm を比較の標準サイズとする）。
   * 卵焼き器・中華鍋・深型鍋・業務用・アウトドア・グリルパン・ホットプレート・電気フライパンは対象外。
   * 「セット」「鍋」は取っ手が取れるタイプや単品まで消えるため除外ワードにしない（取得後に手動で分類する）。
   */
  'frying-pan': {
    category: 'frying-pan',
    // 役割・素材・熱源と価格帯で広く拾う（メーカー名は入れない）
    keywords: [
      'フライパン 26cm',
      'フライパン 26cm IH',
      'フライパン 26cm ガス',
      'フライパン 26cm 軽量',
      'フライパン 26cm こびりつきにくい',
      'フライパン 26cm フッ素',
      'フライパン 26cm セラミック',
      'フライパン 26cm 鉄',
      'フライパン 26cm ステンレス',
      'フライパン 26cm 多層',
      'フライパン 26cm 食洗機',
      'フライパン 26cm 取っ手が取れる',
      // 価格帯別（src/data/diagnoses/fryingPan.ts の priceLabels に合わせる）
      { keyword: 'フライパン 26cm', maxPrice: 3000 },
      { keyword: 'フライパン 26cm IH', maxPrice: 3000 },
      { keyword: 'フライパン 26cm', minPrice: 3001, maxPrice: 6000 },
      { keyword: 'フライパン 26cm', minPrice: 6001, maxPrice: 10000 },
      { keyword: 'フライパン 26cm', minPrice: 10001 },
    ],
    // 対象外が明らかなものだけ（強くしすぎると単品まで消えるため最小限にする）
    ngKeyword: '卵焼き器 玉子焼き器 北京鍋 中華鍋 ホットプレート 電気フライパン グリルパン 中古',
    sort: '-reviewCount',
    hits: 20,
    // ふた・取っ手などの単品パーツを除くための下限
    minPrice: 800,
    // 同じショップ（メーカー公式店など）からは最大3件まで
    maxPerShop: 3,
    // src/data/diagnoses/fryingPan.ts の priceLabels に合わせる（〜3,000 / 〜6,000 / 〜10,000 / それ以上）
    priceThresholds: [3000, 6000, 10000],
    // fryingPan.ts の評価項目・条件項目（公式仕様を確認して記入する）
    attributeKeys: ['nonStick', 'durability', 'lightness', 'heatPerformance', 'easyCare', 'gasOk', 'ihOk'],
  },
  /**
   * モバイルバッテリー：日常的に持ち歩くモバイルバッテリー。
   * ポータブル電源・車載専用品・乾電池式・ソーラー主体の商品は対象外。
   * 「ケース」「ケーブル」は内蔵ケーブル付きの商品まで消えるため除外ワードにしない（取得後に手動で分類する）。
   */
  'mobile-battery': {
    category: 'mobile-battery',
    // 役割・容量・出力・便利機能と価格帯で広く拾う（メーカー名は入れない）
    keywords: [
      'モバイルバッテリー 軽量 小型',
      'モバイルバッテリー 5000mAh',
      'モバイルバッテリー 10000mAh',
      'モバイルバッテリー 20000mAh',
      'モバイルバッテリー 45W',
      'モバイルバッテリー 65W ノートパソコン',
      'モバイルバッテリー 3台同時',
      'モバイルバッテリー ケーブル内蔵',
      'モバイルバッテリー マグネット ワイヤレス',
      'モバイルバッテリー Qi2',
      'モバイルバッテリー 大容量 急速充電',
      // 価格帯別（src/data/diagnoses/mobileBattery.ts の priceLabels に合わせる）
      { keyword: 'モバイルバッテリー', maxPrice: 3000 },
      { keyword: 'モバイルバッテリー', minPrice: 3001, maxPrice: 6000 },
      { keyword: 'モバイルバッテリー', minPrice: 6001, maxPrice: 10000 },
      { keyword: 'モバイルバッテリー', minPrice: 10001 },
    ],
    // 対象外が明らかなものだけ（強くしすぎると通常品まで消えるため最小限にする）
    ngKeyword: 'ポータブル電源 乾電池 ソーラー ジャンプスターター 中古',
    sort: '-reviewCount',
    hits: 20,
    // ケーブル・ケースなどの単品を除くための下限
    minPrice: 1000,
    // 同じショップ（メーカー公式店など）からは最大3件まで
    maxPerShop: 3,
    // src/data/diagnoses/mobileBattery.ts の priceLabels に合わせる（〜3,000 / 〜6,000 / 〜10,000 / それ以上）
    priceThresholds: [3000, 6000, 10000],
    // mobileBattery.ts の評価項目・true/false 項目（公式仕様を確認して記入する）
    attributeKeys: ['capacity', 'outputPower', 'lightness', 'multiDevice', 'laptopOk', 'builtInCable', 'wireless'],
  },
  /**
   * スーツケース：旅行用のキャスター付きハードタイプのスーツケース。
   * ソフトタイプ・子ども用・アウトドア専用・トランク型インテリア・キャスターなしバッグ・ビジネスバッグ主体の商品は対象外。
   * 「カバー」「ベルト」は本体の説明にも出るため除外ワードにせず、単品パーツは下限価格と取得後の手動分類で除く。
   */
  suitcase: {
    category: 'suitcase',
    // 役割・サイズ・機能と価格帯で広く拾う（メーカー名は入れない）
    keywords: [
      'スーツケース 超軽量 Sサイズ',
      'スーツケース 機内持ち込み ハード',
      'スーツケース Mサイズ ハード',
      'スーツケース Lサイズ 大容量',
      'スーツケース 静音キャスター',
      'スーツケース ダブルキャスター ストッパー',
      'スーツケース フロントオープン',
      'スーツケース 拡張 ハード',
      'スーツケース フレーム 丈夫',
      'スーツケース ポリカーボネート 日本製',
      // 価格帯別（src/data/diagnoses/suitcase.ts の priceLabels に合わせる）
      { keyword: 'スーツケース', maxPrice: 10000 },
      { keyword: 'スーツケース', minPrice: 10001, maxPrice: 20000 },
      { keyword: 'スーツケース', minPrice: 20001, maxPrice: 40000 },
      { keyword: 'スーツケース', minPrice: 40001 },
    ],
    // 対象外が明らかなものだけ（強くしすぎると通常品まで消えるため最小限にする）
    ngKeyword: 'キッズ 子供用 ソフトキャリー 中古 レンタル',
    sort: '-reviewCount',
    hits: 20,
    // キャスター・ベルトなどの単品パーツを除くための下限
    minPrice: 3000,
    // 同じショップ（メーカー公式店など）からは最大3件まで
    maxPerShop: 3,
    // src/data/diagnoses/suitcase.ts の priceLabels に合わせる（〜10,000 / 〜20,000 / 〜40,000 / それ以上）
    priceThresholds: [10000, 20000, 40000],
    // suitcase.ts の評価項目・true/false 項目（公式仕様を確認して記入する）
    attributeKeys: ['capacity', 'lightness', 'durability', 'mobility', 'expandable', 'frontOpen', 'wheelStopper'],
  },
  /**
   * 加湿器：家庭用の据え置き型加湿器（スチーム式・気化式・超音波式・ハイブリッド式）。
   * 卓上USBの超小型品・アロマディフューザー主体・業務用・加湿空気清浄機・交換用部品は対象外。
   */
  humidifier: {
    category: 'humidifier',
    // 方式・部屋の広さ・機能と価格帯で広く拾う（メーカー名は入れない）
    keywords: [
      '加湿器 スチーム式',
      '加湿器 気化式',
      '加湿器 ハイブリッド式',
      '加湿器 超音波式 上部給水',
      '加湿器 寝室 静音',
      '加湿器 リビング 大容量',
      '加湿器 20畳',
      '加湿器 お手入れ簡単',
      '加湿器 上部給水',
      '加湿器 タンク 大容量 連続',
      // 価格帯別（src/data/diagnoses/humidifier.ts の priceLabels に合わせる）
      { keyword: '加湿器', maxPrice: 8000 },
      { keyword: '加湿器', minPrice: 8001, maxPrice: 15000 },
      { keyword: '加湿器', minPrice: 15001, maxPrice: 25000 },
      { keyword: '加湿器', minPrice: 25001 },
    ],
    // 対象外が明らかなものだけ（強くしすぎると通常品まで消えるため最小限にする）
    ngKeyword: '卓上 USB アロマ ディフューザー 空気清浄機 業務用 交換用 中古',
    sort: '-reviewCount',
    hits: 20,
    // フィルターなどの単品パーツを除くための下限
    minPrice: 3000,
    // 同じショップ（メーカー公式店など）からは最大3件まで
    maxPerShop: 3,
    // src/data/diagnoses/humidifier.ts の priceLabels に合わせる（〜8,000 / 〜15,000 / 〜25,000 / それ以上）
    priceThresholds: [8000, 15000, 25000],
    // humidifier.ts の評価項目・true/false 項目（公式仕様を確認して記入する）
    attributeKeys: ['humidificationPower', 'easeOfCare', 'quietness', 'energyEfficiency', 'runtime', 'refillEase', 'room10', 'room14', 'room19', 'method'],
  },

  /**
   * シャワーヘッド：家庭用の交換式シャワーヘッド。
   * シャワーホース・水栓・浄水器が主体の商品や、カートリッジ単品が混ざっていたら確認時に除外してください。
   */
  'shower-head': {
    category: 'shower-head',
    // 機能・悩み別と価格帯別で広く拾う（メーカー名は入れない）
    keywords: [
      'シャワーヘッド 節水',
      'シャワーヘッド 水圧アップ',
      'シャワーヘッド 止水ボタン',
      'シャワーヘッド 軽量',
      'シャワーヘッド ファインバブル',
      'シャワーヘッド マイクロバブル',
      'シャワーヘッド 水流切替',
      'シャワーヘッド 低水圧',
      // 価格帯別（src/data/diagnoses/showerHead.ts の priceLabels に合わせる）
      { keyword: 'シャワーヘッド', maxPrice: 3000 },
      { keyword: 'シャワーヘッド', minPrice: 3001, maxPrice: 6000 },
      { keyword: 'シャワーヘッド', minPrice: 6001, maxPrice: 12000 },
      { keyword: 'シャワーヘッド', minPrice: 12001 },
    ],
    // 対象外が明らかなものだけ（強くしすぎると通常品まで消えるため最小限にする）
    ngKeyword: '中古 業務用 ペット 犬 猫 交換用カートリッジ',
    sort: '-reviewCount',
    hits: 20,
    // パッキンなどの小さな部品を除くための下限
    minPrice: 1000,
    // 同じショップ（メーカー公式店など）からは最大3件まで
    maxPerShop: 3,
    // src/data/diagnoses/showerHead.ts の priceLabels に合わせる（〜3,000 / 〜6,000 / 〜12,000 / それ以上）
    priceThresholds: [3000, 6000, 12000],
    // showerHead.ts の評価項目・true/false 項目（公式仕様を確認して記入する）
    attributeKeys: ['waterPressure', 'waterSaving', 'lightness', 'sprayVariety', 'convenience', 'fineBubble', 'stopButton'],
  },
}

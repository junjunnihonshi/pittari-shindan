/**
 * 診断ページ下部の「関連する診断」。キーは表示する診断の slug、値はリンク先の slug と短い説明文。
 * 公開中（enabled: true）でない診断や、ページ自身へのリンクは表示されません。
 */
export const relatedDiagnoses: Record<string, { slug: string; text: string }[]> = {
  pillow: [
    { slug: 'electric-blanket', text: '寝るときの寒さ対策に' },
    { slug: 'humidifier', text: '寝室の乾燥が気になるなら' },
    { slug: 'futon-dryer', text: '布団の湿気やダニ対策に' },
  ],
  'hair-dryer': [
    { slug: 'shower-head', text: 'バスタイムをもっと快適に' },
    { slug: 'shampoo', text: '髪と頭皮に合うシャンプーも選ぶなら' },
    { slug: 'hair-treatment', text: '乾かす前のダメージケアに' },
  ],
  vacuum: [{ slug: 'air-purifier', text: 'ほこり・花粉対策をもう一歩' }],
  'frying-pan': [
    { slug: 'toaster', text: '朝食づくりをもっとラクに' },
    { slug: 'electric-kettle', text: 'お湯をすばやく沸かしたいなら' },
    { slug: 'rice-cooker', text: '毎日のごはんをおいしく炊くなら' },
  ],
  'electric-kettle': [
    { slug: 'coffee-maker', text: 'ドリップコーヒーを手軽に淹れるなら' },
    { slug: 'toaster', text: '朝食づくりをもっとラクに' },
    { slug: 'frying-pan', text: '毎日の料理道具も見直すなら' },
    { slug: 'rice-cooker', text: '毎日のごはんをおいしく炊くなら' },
    { slug: 'hot-plate', text: '食卓で焼肉やたこ焼きを楽しむなら' },
  ],
  suitcase: [{ slug: 'mobile-battery', text: '旅先での充電切れに備えて' }],
  'mobile-battery': [
    { slug: 'suitcase', text: '旅行や出張の準備に' },
    { slug: 'portable-power-station', text: '家電も動かせる大容量の電源が必要なら' },
  ],
  'shower-head': [
    { slug: 'hair-dryer', text: 'お風呂上がりのケアに' },
    { slug: 'hair-iron', text: '髪を乾かしたあとのスタイリングに' },
    { slug: 'electric-toothbrush', text: '毎日のオーラルケアも見直すなら' },
    { slug: 'shampoo', text: '髪と頭皮に合うシャンプーも選ぶなら' },
    { slug: 'hair-treatment', text: 'バスタイムのダメージケアに' },
    { slug: 'body-soap', text: '肌に合うボディソープも選ぶなら' },
  ],
  humidifier: [
    { slug: 'air-purifier', text: '空気の汚れも気になるなら' },
    { slug: 'heater', text: '冬の寒さ対策に' },
  ],
  heater: [
    { slug: 'humidifier', text: '暖房中の乾燥対策に' },
    { slug: 'electric-blanket', text: '体をピンポイントで温めるなら' },
  ],
  'air-purifier': [
    { slug: 'humidifier', text: '部屋の乾燥が気になるなら' },
    { slug: 'vacuum', text: '床のほこり対策に' },
  ],
  'electric-blanket': [
    { slug: 'heater', text: '部屋全体を暖めるなら' },
    { slug: 'pillow', text: '眠りの質をもっと高めるなら' },
    { slug: 'futon-dryer', text: '寝る前に布団ごと温めるなら' },
  ],
  toaster: [
    { slug: 'electric-kettle', text: '朝のコーヒー・お茶の準備に' },
    { slug: 'coffee-maker', text: '朝のコーヒーを自動で淹れるなら' },
    { slug: 'frying-pan', text: '毎日の料理道具も見直すなら' },
    { slug: 'microwave', text: 'あたためやオーブン料理にも' },
    { slug: 'hot-plate', text: '食卓でホットケーキや焼き料理を楽しむなら' },
  ],
  'rice-cooker': [
    { slug: 'frying-pan', text: 'おかず作りの道具も見直すなら' },
    { slug: 'electric-kettle', text: '汁物やお茶の準備に' },
    { slug: 'microwave', text: 'ごはんのあたため直しに' },
    { slug: 'hot-plate', text: '食卓でおかずを焼きながら楽しむなら' },
  ],
  microwave: [
    { slug: 'toaster', text: 'トーストをもっと手軽に焼くなら' },
    { slug: 'rice-cooker', text: '毎日のごはんをおいしく炊くなら' },
    { slug: 'hot-plate', text: '食卓で焼きながら食べるなら' },
  ],
  'coffee-maker': [
    { slug: 'electric-kettle', text: 'ハンドドリップやお茶の準備に' },
    { slug: 'toaster', text: '朝食づくりをもっとラクに' },
  ],
  'hot-plate': [
    { slug: 'rice-cooker', text: '焼肉や鍋に合わせるごはんを炊くなら' },
    { slug: 'microwave', text: '下ごしらえやあたためにも' },
    { slug: 'toaster', text: '朝食づくりをもっとラクに' },
    { slug: 'electric-kettle', text: 'お湯をすばやく沸かしたいなら' },
  ],
  'hair-iron': [
    { slug: 'shower-head', text: '毎日のバスタイムから髪をいたわるなら' },
    { slug: 'shampoo', text: '毎日のシャンプーから髪をいたわるなら' },
    { slug: 'hair-treatment', text: '熱ダメージのケアも見直すなら' },
  ],
  'electric-toothbrush': [{ slug: 'shower-head', text: '毎日のバスタイムも快適にするなら' }],
  shampoo: [
    { slug: 'hair-treatment', text: 'シャンプー後のダメージケアに' },
    { slug: 'shower-head', text: 'バスタイムをもっと快適に' },
    { slug: 'hair-dryer', text: '洗ったあとの乾かし方も見直すなら' },
    { slug: 'hair-iron', text: '髪を乾かしたあとのスタイリングに' },
    { slug: 'body-soap', text: '体を洗うボディソープも見直すなら' },
  ],
  'hair-treatment': [
    { slug: 'shampoo', text: '髪と頭皮に合うシャンプーも選ぶなら' },
    { slug: 'shower-head', text: 'バスタイムをもっと快適に' },
    { slug: 'hair-dryer', text: '洗ったあとの乾かし方も見直すなら' },
    { slug: 'hair-iron', text: '髪を乾かしたあとのスタイリングに' },
  ],
  'body-soap': [
    { slug: 'shower-head', text: 'バスタイムをもっと快適に' },
    { slug: 'shampoo', text: '髪と頭皮に合うシャンプーも選ぶなら' },
  ],
  'futon-dryer': [
    { slug: 'mattress', text: '寝心地そのものを見直すなら' },
    { slug: 'pillow', text: '眠りの質をもっと高めるなら' },
    { slug: 'dehumidifier', text: '部屋の湿気対策もするなら' },
  ],

  // ---- パソコンまわり ----
  monitor: [
    { slug: 'mobile-monitor', text: '持ち運べるサブモニターがほしいなら' },
    { slug: 'wireless-keyboard', text: 'デスクの入力環境も整えるなら' },
    { slug: 'wireless-mouse', text: '手に合うマウスも選ぶなら' },
    { slug: 'usb-c-hub', text: 'ノートPCとモニターをつなぐなら' },
  ],
  'mobile-monitor': [
    { slug: 'usb-c-hub', text: 'ノートPCの端子が足りないなら' },
    { slug: 'monitor', text: 'デスクに置く大きなモニターを選ぶなら' },
  ],
  'usb-c-hub': [
    { slug: 'mobile-monitor', text: '外出先でも2画面で作業するなら' },
    { slug: 'monitor', text: 'デスクで使う外部モニターを選ぶなら' },
    { slug: 'external-ssd', text: 'データの持ち運び・バックアップに' },
  ],
  'wireless-keyboard': [
    { slug: 'wireless-mouse', text: 'キーボードと一緒にマウスも選ぶなら' },
    { slug: 'monitor', text: 'デスクの作業環境を整えるなら' },
  ],
  'wireless-mouse': [
    { slug: 'wireless-keyboard', text: 'マウスと一緒にキーボードも選ぶなら' },
    { slug: 'monitor', text: 'デスクの作業環境を整えるなら' },
  ],
  webcam: [
    { slug: 'usb-microphone', text: 'オンライン会議の声をもっと聞きやすくするなら' },
    { slug: 'usb-c-hub', text: 'ノートPCのUSB端子が足りないなら' },
  ],
  'usb-microphone': [{ slug: 'webcam', text: 'オンライン会議や配信の映像も整えるなら' }],
  'external-ssd': [{ slug: 'usb-c-hub', text: 'ノートPCの端子を増やすなら' }],

  // ---- 車・屋外・防災 ----
  'drive-recorder': [
    { slug: 'security-camera', text: '自宅の玄関や駐車場も見守るなら' },
    { slug: 'pressure-washer', text: '洗車を自分でするなら' },
    { slug: 'portable-power-station', text: '車中泊やキャンプの電源に' },
  ],
  'pressure-washer': [
    { slug: 'drive-recorder', text: '車の安全運転・記録対策も見直すなら' },
    { slug: 'security-camera', text: '玄関・駐車場まわりの防犯対策に' },
  ],
  'security-camera': [
    { slug: 'wifi-router', text: 'カメラの設置場所までWi-Fiを届けるなら' },
    { slug: 'drive-recorder', text: '車の防犯・記録にも備えるなら' },
  ],
  'portable-power-station': [
    { slug: 'mobile-battery', text: 'スマホの充電を手軽に持ち歩くなら' },
    { slug: 'drive-recorder', text: '車での移動・車中泊の備えに' },
  ],
  'wifi-router': [{ slug: 'security-camera', text: 'Wi-Fiでつなぐ防犯・見守りカメラを選ぶなら' }],

  // ---- 洗濯・部屋干し ----
  'washing-machine': [
    { slug: 'iron-steamer', text: '洗ったあとのシワ取りに' },
    { slug: 'dehumidifier', text: '部屋干しを早く乾かすなら' },
    { slug: 'futon-dryer', text: '布団の乾燥やダニ対策に' },
  ],
  'iron-steamer': [
    { slug: 'washing-machine', text: '洗濯から見直すなら' },
    { slug: 'dehumidifier', text: '部屋干しの湿気対策に' },
  ],
  dehumidifier: [
    { slug: 'circulator-fan', text: '部屋干しに風を当てて早く乾かすなら' },
    { slug: 'futon-dryer', text: '布団の湿気対策に' },
  ],
}

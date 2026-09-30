/**
 * 診断ページ下部の「関連する診断」。キーは表示する診断の slug、値はリンク先の slug と短い説明文。
 * 公開中（enabled: true）でない診断や、ページ自身へのリンクは表示されません。
 */
export const relatedDiagnoses: Record<string, { slug: string; text: string }[]> = {
  pillow: [
    { slug: 'electric-blanket', text: '寝るときの寒さ対策に' },
    { slug: 'humidifier', text: '寝室の乾燥が気になるなら' },
  ],
  'hair-dryer': [
    { slug: 'shower-head', text: 'バスタイムをもっと快適に' },
    { slug: 'shampoo', text: '髪と頭皮に合うシャンプーも選ぶなら' },
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
  'mobile-battery': [{ slug: 'suitcase', text: '旅行や出張の準備に' }],
  'shower-head': [
    { slug: 'hair-dryer', text: 'お風呂上がりのケアに' },
    { slug: 'hair-iron', text: '髪を乾かしたあとのスタイリングに' },
    { slug: 'electric-toothbrush', text: '毎日のオーラルケアも見直すなら' },
    { slug: 'shampoo', text: '髪と頭皮に合うシャンプーも選ぶなら' },
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
  ],
  'electric-toothbrush': [{ slug: 'shower-head', text: '毎日のバスタイムも快適にするなら' }],
  shampoo: [
    { slug: 'shower-head', text: 'バスタイムをもっと快適に' },
    { slug: 'hair-dryer', text: '洗ったあとの乾かし方も見直すなら' },
    { slug: 'hair-iron', text: '髪を乾かしたあとのスタイリングに' },
  ],
}

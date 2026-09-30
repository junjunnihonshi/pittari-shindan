/**
 * 診断ページ下部の「関連する診断」。キーは表示する診断の slug、値はリンク先の slug と短い説明文。
 * 公開中（enabled: true）でない診断や、ページ自身へのリンクは表示されません。
 */
export const relatedDiagnoses: Record<string, { slug: string; text: string }[]> = {
  pillow: [
    { slug: 'electric-blanket', text: '寝るときの寒さ対策に' },
    { slug: 'humidifier', text: '寝室の乾燥が気になるなら' },
  ],
  'hair-dryer': [{ slug: 'shower-head', text: 'バスタイムをもっと快適に' }],
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
  ],
  suitcase: [{ slug: 'mobile-battery', text: '旅先での充電切れに備えて' }],
  'mobile-battery': [{ slug: 'suitcase', text: '旅行や出張の準備に' }],
  'shower-head': [{ slug: 'hair-dryer', text: 'お風呂上がりのケアに' }],
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
  ],
  'rice-cooker': [
    { slug: 'frying-pan', text: 'おかず作りの道具も見直すなら' },
    { slug: 'electric-kettle', text: '汁物やお茶の準備に' },
    { slug: 'microwave', text: 'ごはんのあたため直しに' },
  ],
  microwave: [
    { slug: 'toaster', text: 'トーストをもっと手軽に焼くなら' },
    { slug: 'rice-cooker', text: '毎日のごはんをおいしく炊くなら' },
  ],
  'coffee-maker': [
    { slug: 'electric-kettle', text: 'ハンドドリップやお茶の準備に' },
    { slug: 'toaster', text: '朝食づくりをもっとラクに' },
  ],
}

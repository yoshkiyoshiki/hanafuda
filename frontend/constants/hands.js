// こいこいの役定義と点数テーブル

export const HANDS = {
  // 光役（光札5枚以上）
  godoPikake: {
    name: '五光（ごこう）',
    points: 15,
    description: '光札5枚',
  },
  shikoPikake: {
    name: '四光（しこう）',
    points: 10,
    description: '柳に小野道風含まない光札4枚',
  },
  ameiriShikoPikake: {
    name: '雨入り四光（しこう）',
    points: 8,
    description: '柳に小野道風含む光札4枚',
  },
  sanko: {
    name: '三光（さんこう）',
    points: 6,
    description: '光札3枚',
  },

  teshi: {
    name: '手四（てし）',
    points: 6, 
    description: '同じ月の札4枚',
  },

  // 動物役
  // 猪、鹿、蝶の3枚を集める「いのしかちょう」
  inoShikaChо: {
    name: 'いのしかちょう',
    points: 6,
    description: '5月の菖蒲-種、7月の萩-種、9月の菊-種',
  },
  tane: {
    name: '種',
    points: 1,
    description: '種5枚以上',
  },

  // 短冊役
  akaTannzaku: {
    name: 'あか短冊（赤短冊）',
    points: 5,
    description: '2月、3月、4月の短冊',
  },
  aoTannzaku: {
    name: 'あお短冊（青短冊）',
    points: 5,
    description: '6月、9月、10月の短冊',
  },
  tannzaku: {
    name: '短冊',
    points: 1,
    description: '短冊5枚以上',
  },

  // カス役（札が4種類でそれぞれ1点）
  kasu: {
    name: 'カス',
    points: 1,
    description: 'カス札5～9枚',
  },

  // 特殊役
  tsukiFumiKomi: {
    name: '月見酒（つきみざけ）',
    points: 5,
    description: '8月の種（お月さん）と9月の短冊（菊の短冊）',
  },
  hanamiFumiKomi: {
    name: '花見酒（はなみざけ）',
    points: 5,
    description: '3月の種（桜の種）と8月の短冊（月見の短冊）',
  },
};

// 役判定の優先度（点数が高い順に判定）
export const HAND_ORDER = [
  'godoPikake',      // 10点
  'shikoPikake',     // 8点
  'inoShikaChо',     // 6点
  'sanko',           // 6点
  'akatannzaku',      // 5点
  'aoTannzaku',     // 5点
  'tsukiFumiKomi',   // 5点
  'hanamiFumiKomi',  // 5点
  'tannzaku',         // 1点
  'kasu',        // 1点
];

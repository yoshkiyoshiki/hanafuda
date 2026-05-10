// 花札データ定義
// 各札は以下の情報を持つ：
// - id: 一意識別子（ファイル名ベース）
// - month: 月（1-12）
// - name: 札の名前
// - type: 札の種類（1=光, 2=種, 3=短冊, 4=カス）
// - points: 札単体の点数

export const CARDS = [
  // 1月 - 松（光1・短冊1・カス2）
  { id: 'matsu_hikari', month: 1, name: '松-光', type: 1, points: 0, url: require("../assets/images/matsu_hikari.jpg") },
  { id: 'matsu_tannzaku', month: 1, name: '松-短冊', type: 3, points: 0, url: require("../assets/images/matsu_tannzaku.jpg") },
  { id: 'matsu_kasu', month: 1, name: '松-カス1', type: 4, points: 0, url: require("../assets/images/matsu_kasu.jpg") },
  { id: 'matsu_kasu2', month: 1, name: '松-カス2', type: 4, points: 0, url: require("../assets/images/matsu_kasu2.jpg") },

  // 2月 - 梅（種1・短冊1・カス2）
  { id: 'ume_tane', month: 2, name: '梅-種', type: 2, points: 0, url: require("../assets/images/ume_tane.jpg") },
  { id: 'ume_tannzaku', month: 2, name: '梅-短冊', type: 3, points: 0, url: require("../assets/images/ume_tannzaku.jpg") },
  { id: 'ume_kasu', month: 2, name: '梅-カス1', type: 4, points: 0, url: require("../assets/images/ume_kasu.jpg") },
  { id: 'ume_kasu2', month: 2, name: '梅-カス2', type: 4, points: 0, url: require("../assets/images/ume_kasu2.jpg") },

  // 3月 - 桜（光1・短冊1・カス2）
  { id: 'sakura_hikari', month: 3, name: '桜-光', type: 1, points: 0, url: require("../assets/images/sakura_hikari.jpg") },
  { id: 'sakura_tannzaku', month: 3, name: '桜-短冊', type: 3, points: 0, url: require("../assets/images/sakura_tannzaku.jpg") },
  { id: 'sakura_kasu', month: 3, name: '桜-カス1', type: 4, points: 0, url: require("../assets/images/sakura_kasu.jpg") },
  { id: 'sakura_kasu2', month: 3, name: '桜-カス2', type: 4, points: 0, url: require("../assets/images/sakura_kasu2.jpg") },

  // 4月 - 藤（種1・短冊1・カス2）
  { id: 'fuji_tane', month: 4, name: '藤-種', type: 2, points: 0, url: require("../assets/images/fuji_tane.jpg") },
  { id: 'fuji_tannzaku', month: 4, name: '藤-短冊', type: 3, points: 0, url: require("../assets/images/fuji_tannzaku.jpg") },
  { id: 'fuji_kasu', month: 4, name: '藤-カス1', type: 4, points: 0, url: require("../assets/images/fuji_kasu.jpg") },
  { id: 'fuji_kasu2', month: 4, name: '藤-カス2', type: 4, points: 0, url: require("../assets/images/fuji_kasu2.jpg") },

  // 5月 - 菖蒲（種1・短冊1・カス2）
  { id: 'shobu_tane', month: 5, name: '菖蒲-種', type: 2, points: 0, url: require("../assets/images/shobu_tane.jpg") },
  { id: 'shobu_tannzaku', month: 5, name: '菖蒲-短冊', type: 3, points: 0, url: require("../assets/images/shobu_tannzaku.jpg") },
  { id: 'shobu_kasu', month: 5, name: '菖蒲-カス1', type: 4, points: 0, url: require("../assets/images/shobu_kasu.jpg") },
  { id: 'shobu_kasu2', month: 5, name: '菖蒲-カス2', type: 4, points: 0, url: require("../assets/images/shobu_kasu2.jpg") },

  // 6月 - 牡丹（種1・短冊1・カス2）
  { id: 'botan_tane', month: 6, name: '牡丹-種', type: 2, points: 0, url: require("../assets/images/botan_tane.jpg") },
  { id: 'botan_tannzaku', month: 6, name: '牡丹-短冊', type: 3, points: 0, url: require("../assets/images/botan_tannzaku.jpg") },
  { id: 'botan_kasu', month: 6, name: '牡丹-カス1', type: 4, points: 0, url: require("../assets/images/botan_kasu.jpg") },
  { id: 'botan_kasu2', month: 6, name: '牡丹-カス2', type: 4, points: 0, url: require("../assets/images/botan_kasu2.jpg") },

  // 7月 - 萩（種1・短冊1・カス2）
  { id: 'hagi_tane', month: 7, name: '萩-種', type: 2, points: 0, url: require("../assets/images/hagi_tane.jpg") },
  { id: 'hagi_tannzaku', month: 7, name: '萩-短冊', type: 3, points: 0, url: require("../assets/images/hagi_tannzaku.jpg") },
  { id: 'hagi_kasu', month: 7, name: '萩-カス1', type: 4, points: 0, url: require("../assets/images/hagi_kasu.jpg") },
  { id: 'hagi_kasu2', month: 7, name: '萩-カス2', type: 4, points: 0, url: require("../assets/images/hagi_kasu2.jpg") },

  // 8月 - 月見（光1・種1・カス2）
  { id: 'tsukimi_hikari', month: 8, name: '月見-光', type: 1, points: 0, url: require("../assets/images/tsukimi_hikari.jpg") },
  { id: 'tsukimi_tane', month: 8, name: '月見-種', type: 2, points: 0, url: require("../assets/images/tsukimi_tane.jpg") },
  { id: 'tsukimi_kasu', month: 8, name: '月見-カス1', type: 4, points: 0, url: require("../assets/images/tsukimi_kasu.jpg") },
  { id: 'tsukimi_kasu2', month: 8, name: '月見-カス2', type: 4, points: 0, url: require("../assets/images/tsukimi_kasu2.jpg") },

  // 9月 - 菊（種1・短冊1・カス2）
  { id: 'kiku_tane', month: 9, name: '菊-種', type: 2, points: 0, url: require("../assets/images/kiku_tane.jpg") },
  { id: 'kiku_tannzaku', month: 9, name: '菊-短冊', type: 3, points: 0, url: require("../assets/images/kiku_tannzaku.jpg") },
  { id: 'kiku_kasu', month: 9, name: '菊-カス1', type: 4, points: 0, url: require("../assets/images/kiku_kasu.jpg") },
  { id: 'kiku_kasu2', month: 9, name: '菊-カス2', type: 4, points: 0, url: require("../assets/images/kiku_kasu2.jpg") },

  // 10月 - 紅葉（種1・短冊1・カス2）
  { id: 'kouyou_tane', month: 10, name: '紅葉-種', type: 2, points: 0, url: require("../assets/images/kouyou_tane.jpg") },
  { id: 'kouyou_tannzaku', month: 10, name: '紅葉-短冊', type: 3, points: 0, url: require("../assets/images/kouyou_tannzaku.jpg") },
  { id: 'kouyou_kasu', month: 10, name: '紅葉-カス1', type: 4, points: 0, url: require("../assets/images/kouyou_kasu.jpg") },
  { id: 'kouyou_kasu2', month: 10, name: '紅葉-カス2', type: 4, points: 0, url: require("../assets/images/kouyou_kasu2.jpg") },

  // 11月 - 柳（光1・種1・短冊1・カス1）
  { id: 'yanagi_hikari', month: 11, name: '柳-光', type: 1, points: 0, url: require("../assets/images/yanagi_hikari.jpg") },
  { id: 'yanagi_tane', month: 11, name: '柳-種', type: 2, points: 0, url: require("../assets/images/yanagi_tane.jpg") },
  { id: 'yanagi_tannzaku', month: 11, name: '柳-短冊', type: 3, points: 0, url: require("../assets/images/yanagi_tannzaku.jpg") },
  { id: 'yanagi_kasu', month: 11, name: '柳-カス1', type: 4, points: 0, url: require("../assets/images/yanagi_kasu.jpg") },

  // 12月 - 桐（光1・カス3）
  { id: 'kiri_hikari', month: 12, name: '桐-光', type: 1, points: 0, url: require("../assets/images/kiri_hikari.jpg") },
  { id: 'kiri_kasu', month: 12, name: '桐-カス1', type: 4, points: 0, url: require("../assets/images/kiri_kasu.jpg") },
  { id: 'kiri_kasu2', month: 12, name: '桐-カス2', type: 4, points: 0, url: require("../assets/images/kiri_kasu2.jpg") },
  { id: 'kiri_kasu3', month: 12, name: '桐-カス3', type: 4, points: 0, url: require("../assets/images/kiri_kasu3.jpg") },
];

// 月の名前マッピング
export const MONTH_NAMES = {
  1: '松（1月）',
  2: '梅（2月）',
  3: '桜（3月）',
  4: '藤（4月）',
  5: '菖蒲（5月）',
  6: '牡丹（6月）',
  7: '萩（7月）',
  8: '月見（8月）',
  9: '菊（9月）',
  10: '紅葉（10月）',
  11: '柳（11月）',
  12: '桐（12月）',
};

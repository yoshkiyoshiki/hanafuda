// 役判定エンジン
import { HANDS } from './hands';

/**
 * 選択された札から役を判定し、点数を計算する
 * @param {Array} selectedCards - 選択された札の配列（IDリスト）
 * @param {Array} allCards - 全カードデータ
 * @returns {Object} { hands: 成立した役の配列, totalPoints: 合計点数 }
 */
export function evaluateHands(selectedCards, allCards) {
  const selectedCardObjects = selectedCards
    .map(id => allCards.find(card => card.id === id))
    .filter(card => card !== undefined);
  console.log(selectedCards);
  const hands = [];
  let totalPoints = 0;
  let lightCards = 0;
  let ribbonCards = 0;
  let animalCards = 0;
  let charafCards = 0;

  selectedCardObjects.forEach(card => {
    if (card.type === 1) lightCards++;
    else if (card.type === 2) animalCards++;
    else if (card.type === 3) ribbonCards++;
    else if (card.type === 4) charafCards++;
  });

  // 五光（光札5枚）
  if (lightCards >= 5) {
    hands.push({
      hand: 'godoPikake',
      name: HANDS.godoPikake.name,
      points: HANDS.godoPikake.points,
    });
    totalPoints += HANDS.godoPikake.points;
  }
  // 四光（光札4枚）
  else if (lightCards === 4 && !selectedCards.includes('yanagi_hikari')) { // 柳の光は四光にカウントしない
    hands.push({
      hand: 'shikoPikake',
      name: HANDS.shikoPikake.name,
      points: HANDS.shikoPikake.points,
    });
    totalPoints += HANDS.shikoPikake.points;
  }
  // 雨入り四光（光札4枚）
  else if (lightCards === 4 && selectedCards.includes('yanagi_hikari')) { // 柳の光は雨入り四光にカウントする
    hands.push({
      hand: 'ameiriShikoPikake',
      name: HANDS.ameiriShikoPikake.name,
      points: HANDS.ameiriShikoPikake.points,
    });
    totalPoints += HANDS.ameiriShikoPikake.points;
  }
  // 三光（光札3枚）
  else if (lightCards === 3) {
    hands.push({
      hand: 'sanko',
      name: HANDS.sanko.name,
      points: HANDS.sanko.points,
    });
    totalPoints += HANDS.sanko.points;
  }

  // 手四（同じ月の札4枚）役は重複ありで判定
  const monthCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 月ごとの札の枚数をカウントする配列
  selectedCardObjects.forEach(card => {
    const month = card.month;
    monthCounts[month] = monthCounts[month] + 1;
  });
  const hasTeshi = Object.values(monthCounts).filter(count => count >= 4);
  if (hasTeshi.length > 0) {
    hands.push({
      hand: 'teshi',
      name: HANDS.teshi.name,
      points: HANDS.teshi.points,
    });
    totalPoints += HANDS.teshi.points ; // 同じ月の札が4枚以上ある場合
  }

  // いのしかちょう（6月-種, 7月-種, 10月-種）
  const hasBoarCard = selectedCards.includes('botan_tane');
  const hasDeerCard = selectedCards.includes('hagi_tane');
  const hasButterflyCard = selectedCards.includes('kouyou_tane');

  if (hasBoarCard && hasDeerCard && hasButterflyCard) {
    hands.push({
      hand: 'inoShikaChо',
      name: HANDS.inoShikaChо.name,
      points: HANDS.inoShikaChо.points,
    });
    totalPoints += HANDS.inoShikaChо.points;
  }

  // 赤短冊（1月短冊, 2月短冊, 3月短冊）
  const hasAkaRibbon1 = selectedCards.includes('matsu_tannzaku');
  const hasAkaRibbon2 = selectedCards.includes('ume_tannzaku');
  const hasAkaRibbon3 = selectedCards.includes('sakura_tannzaku');

  if (hasAkaRibbon1 && hasAkaRibbon2 && hasAkaRibbon3) {
    hands.push({
      hand: 'akatannzaku',
      name: HANDS.akatannzaku.name,
      points: HANDS.akatannzaku.points,
    });
    totalPoints += HANDS.akatannzaku.points;
  }

  // 青短冊（6月短冊, 9月短冊, 10月短冊）
  const hasAoRibbon1 = selectedCards.includes('botan_tannzaku');
  const hasAoRibbon2 = selectedCards.includes('kiku_tannzaku');
  const hasAoRibbon3 = selectedCards.includes('kouyou_tannzaku');

  if (hasAoRibbon1 && hasAoRibbon2 && hasAoRibbon3) {
    hands.push({
      hand: 'aoTannzaku',
      name: HANDS.aoTannzaku.name,
      points: HANDS.aoTannzaku.points,
    });
    totalPoints += HANDS.aoTannzaku.points;
  }

  // 月見酒（8月光 + 9月種）
  const hasSusukiHikari = selectedCards.includes('tsukimi_hikari');
  const hasKikuTane = selectedCards.includes('kiku_tane');

  if (hasSusukiHikari && hasKikuTane) {
    hands.push({
      hand: 'tsukiFumiKomi',
      name: HANDS.tsukiFumiKomi.name,
      points: HANDS.tsukiFumiKomi.points,
    });
    totalPoints += HANDS.tsukiFumiKomi.points;
  }

  // 花見酒（3月光 + 9月種）
  const hasSakuraHikari = selectedCards.includes('sakura_hikari');

  if (hasSakuraHikari && hasKikuTane) {
    hands.push({
      hand: 'hanamiFumiKomi',
      name: HANDS.hanamiFumiKomi.name,
      points: HANDS.hanamiFumiKomi.points,
    });
    totalPoints += HANDS.hanamiFumiKomi.points;
  }

  // 種（5枚以上で1点）
  if (animalCards >= 5) {
    hands.push({
      hand: 'tane',
      name: HANDS.tane.name,
      points: HANDS.tane.points + (animalCards - 5),
    });
    totalPoints += HANDS.tane.points + (animalCards - 5); // 5枚を超えるごとに追加で1点 
  }

  // タン（5枚以上で1点）
  if (ribbonCards >= 5) {
    hands.push({
      hand: 'tannzaku',
      name: HANDS.tannzaku.name,
      points: HANDS.tannzaku.points + (ribbonCards - 5),
    });
    totalPoints += HANDS.tannzaku.points + (ribbonCards - 5); // 5枚を超えるごとに追加で1点 
  }

  // カス札役（5枚以上）
  if (charafCards >= 10) {
    hands.push({
      hand: 'kasu',
      name: HANDS.kasu.name,
      points: HANDS.kasu.points + (charafCards - 10),
    });
    totalPoints += HANDS.kasu.points + (charafCards - 10); // 10枚を超えるごとに追加で1点
  }

  return {
    hands,
    totalPoints,
    cardCount: selectedCardObjects.length,
  };
}

import { CARDS, MONTH_NAMES } from '@/constants/cards';
import { evaluateHands } from '@/constants/handEvaluator';
import { API_ENDPOINTS } from '@/constants/env';
import React, { useState, useRef, useEffect } from 'react';
import { Asset } from "expo-asset";
import { CameraView, useCameraPermissions } from 'expo-camera';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const CARD_SIZE = width / 4 - 12;

export default function KoikoiApp() {
  const [selectedCards, setSelectedCards] = useState([]);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [activeTab, setActiveTab] = useState<'game' | 'rules'>('game');
  
  // カメラ関連の状態
  const [cameraVisible, setCameraVisible] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // カメラの許可リクエスト
  useEffect(() => {
    if (cameraVisible && permission && !permission.granted) {
      requestPermission();
    }
  }, [cameraVisible, permission]);

  // 画像をサーバーに送信
  const sendImageByUri = async (imageUri: string) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒でタイムアウト

    try {
      const formData = new FormData();
      const filename = imageUri.split('/').pop() || 'image.png';
      const type = 'image/jpeg';
      
      formData.append("file", {
        uri: imageUri,
        name: filename,
        type: type,
      } as any);

      const response = await fetch(API_ENDPOINTS.ANALYZE, {
        method: "POST",
        body: formData,
        signal: controller.signal,
        //ブラウザが自動で適切なContent-Typeとboundaryを設定するため、ヘッダーからContent-Typeを削除
      });
      const data = await response.json();

      // サーバーから返されたカードIDを選択
      if (data.result.length > 0) {
        const recognizedCardIds = data.result.map((item) => item.cardId);
        setSelectedCards(recognizedCardIds);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('サーバー送信エラー:', error);
      
      // エラー種別を判定して詳細メッセージを提供
      if (error.name === 'AbortError') {
        throw new Error('リクエストがタイムアウトしました。接続を確認してください。');
      } else if (error instanceof TypeError) {
        throw new Error('サーバーに接続できません。アドレスとポートを確認してください。');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  // 写真を撮影してサーバーに送信
  const takePicture = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
        skipProcessing: true,
        width: Math.round(width * 0.7),
        height: Math.round(width * 1.1),
      });
      
      // 撮影した画像をサーバーに送信
      const success = await sendImageByUri(photo.uri);
      
      if (success) {
        Alert.alert('成功', '札が認識されました');
      } else {
        Alert.alert('エラー', 'カードを認識できませんでした');
      }
      
      // カメラを閉じる
      setCameraVisible(false);
    } catch (error: any) {
      console.error('撮影またはサーバーエラー:', error);
      Alert.alert('エラー', error.message || '処理に失敗しました');
    } finally {
      setIsProcessing(false);
    }
  };

  // カメラの許可状態をチェック
  const checkCameraPermission = async () => {
    if (!permission) {
      Alert.alert('エラー', 'カメラの許可を確認できません');
      return;
    }

    if (!permission.granted) {
      const newPermission = await requestPermission();
      if (!newPermission.granted) {
        Alert.alert('許可が必要', 'カメラを使用するには許可が必要です');
        return;
      }
    }

    setCameraVisible(true);
  };

  const toggleCard = (cardId) => {
    setSelectedCards(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });
  };

  const calculateScore = () => {
    if (selectedCards.length === 0) {
      setEvaluationResult(null);
      return;
    }
    const result = evaluateHands(selectedCards, CARDS);
    setEvaluationResult(result);
  };

  const resetSelection = () => {
    setSelectedCards([]);
    setEvaluationResult(null);
  };

  const renderCard = ({ item }) => {
    const isSelected = selectedCards.includes(item.id);
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.card,
          selectedCards.includes(item.id) && styles.selectedCard,
        ]}
        onPress={() => toggleCard(item.id)}
      >
        <View style={styles.cardContent}>
          <Image
            source={item.url}
            style={styles.cardImage}
          />
          {selectedCards.includes(item.id) && (
            <View style={styles.checkmarkContainer}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // 月別にカードをグループ化
  const cardsByMonth = {};
  CARDS.forEach(card => {
    if (!cardsByMonth[card.month]) {
      cardsByMonth[card.month] = [];
    }
    cardsByMonth[card.month].push(card);
  });

  const featuredRoles = [
    {
      title: '五光（ごこう）',
      points: '15点',
      description: '光札5枚をすべて揃える最強役です。光の種類は1月、3月、8月、11月、12月の5枚です。',
      imageIds: ['matsu_hikari', 'sakura_hikari', 'tsukimi_hikari', 'yanagi_hikari', 'kiri_hikari'],
    },
    {
      title: '四光（しこう）',
      points: '10点',
      description: '光札4枚を揃えた役です。柳の光が含まれない場合に成立します。',
      imageIds: ['matsu_hikari', 'sakura_hikari', 'tsukimi_hikari', 'kiri_hikari'],
    },
    {
      title: '雨入り四光（しこう）',
      points: '8点',
      description: '光札4枚を揃えた役のうち、柳の光が含まれる場合に成立します。雨の四光とも呼ばれます。',
      imageIds: ['matsu_hikari', 'sakura_hikari', 'tsukimi_hikari', 'yanagi_hikari'],
    },
    {
      title: '三光（さんこう）',
      points: '6点',
      description: '光札3枚を揃えた役です。',
      imageIds: ['matsu_hikari', 'sakura_hikari', 'tsukimi_hikari'],
    },
    {
      title: '手四（てし）',
      points: '6点',
      description: '同じ月の札を4枚集める役です。例として3月の札を4枚集めると成立します。',
      imageIds: ['sakura_hikari', 'sakura_tannzaku', 'sakura_kasu', 'sakura_kasu2'],
    },
    {
      title: 'いのしかちょう',
      points: '6点',
      description: '6月牡丹-種, 7月萩-種, 10月紅葉-種の3枚を揃える役です。',
      imageIds: ['botan_tane', 'hagi_tane', 'kouyou_tane'],
    },
    {
      title: '赤短冊（あかたんざく）',
      points: '5点',
      description: '1月、2月、3月の短冊を揃える役です。赤い短冊3枚を揃えます。',
      imageIds: ['matsu_tannzaku', 'ume_tannzaku', 'sakura_tannzaku'],
    },
    {
      title: '青短冊（あおたんざく）',
      points: '5点',
      description: '6月、9月、10月の短冊を揃える役です。青い短冊3枚で成立します。',
      imageIds: ['botan_tannzaku', 'kiku_tannzaku', 'kouyou_tannzaku'],
    },
    {
      title: '月見酒（つきみざけ）',
      points: '5点',
      description: '8月の光札と9月の種札を揃える役です。月見の組み合わせで成立します。',
      imageIds: ['tsukimi_hikari', 'kiku_tane'],
    },
    {
      title: '花見酒（はなみざけ）',
      points: '5点',
      description: '3月の光札と9月の種札を揃える役です。花見と月見の組み合わせとして親しまれます。',
      imageIds: ['sakura_hikari', 'kiku_tane'],
    },
  ];

  const exampleRoles = [
    {
      title: '種',
      subtitle: '5枚以上で1点',
      description: '種札を5枚集めると成立。一枚増えるごとに追加で1点になります。',
      imageId: 'tsukimi_tane',
    },
    {
      title: '短冊',
      subtitle: '5枚以上で1点',
      description: '短冊を5枚以上集めると成立。一枚増えるごとに追加で1点になります。',
      imageId: 'sakura_tannzaku',
    },
    {
      title: 'カス',
      subtitle: '10枚以上で1点',
      description: 'カス札を10枚以上集めると成立。一枚増えるごとに追加で1点になります。',
      imageId: 'matsu_kasu',
    },
  ];

  // カメラUI
  if (cameraVisible) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          <View style={styles.cameraOverlay}>
            {/* 上部：戻るボタン */}
            <View style={styles.cameraTopBar}>
              <TouchableOpacity
                style={styles.cameraCancelButton}
                onPress={() => setCameraVisible(false)}
              >
                <Text style={styles.cameraCancelText}>✕ 戻る</Text>
              </TouchableOpacity>
              <Text style={styles.cameraTitle}>写真を撮影</Text>
              <View style={{ width: 60 }} />
            </View>

            {/* 中央：ガイドフレーム */}
            <View style={styles.cameraContent}>
              <View style={styles.cameraGuideFrame} />
            </View>

            {/* 下部：撮影ボタン */}
            <View style={styles.cameraBottomBar}>
              {isProcessing ? (
                <ActivityIndicator size="large" color="#ffffff" />
              ) : (
                <TouchableOpacity
                  style={styles.cameraCaptureButton}
                  onPress={takePicture}
                >
                  <View style={styles.cameraCaptureButtonInner} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  // 通常UI
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>こいこい点数計算</Text>
        <Text style={styles.subtitle}>札をクリックして選択してください</Text>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'game' && styles.tabButtonActive]}
          onPress={() => setActiveTab('game')}
        >
          <Text style={[styles.tabText, activeTab === 'game' && styles.tabTextActive]}>
            こいこい
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'rules' && styles.tabButtonActive]}
          onPress={() => setActiveTab('rules')}
        >
          <Text style={[styles.tabText, activeTab === 'rules' && styles.tabTextActive]}>
            ルール説明
          </Text>
        </TouchableOpacity>
      </View>

      {/* 撮影ボタン - タブの下に配置 */}
      <TouchableOpacity
        style={styles.captureButtonSection}
        onPress={checkCameraPermission}
      >
        <View style={styles.captureButtonContent}>
          <Text style={styles.captureButtonEmoji}>📷</Text>
          <Text style={styles.captureButtonText}>写真から札を認識</Text>
          <Text style={styles.captureButtonSubtext}>タップして撮影開始</Text>
        </View>
      </TouchableOpacity>

      {activeTab === 'game' ? (
        <>
          {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
            <View key={month}>
              <Text style={styles.monthTitle}>{MONTH_NAMES[month]}</Text>
              <View style={styles.cardGrid}>
                {cardsByMonth[month]?.map(card => (
                  renderCard({ item: card })
                ))}
              </View>
            </View>
          ))}

          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.button, styles.calculateButton]}
              onPress={calculateScore}
            >
              <Text style={styles.buttonText}>点数を計算</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={resetSelection}
            >
              <Text style={styles.buttonText}>リセット</Text>
            </TouchableOpacity>
          </View>

          {evaluationResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>役の判定結果</Text>
              <Text style={styles.selectedCount}>
                選択札数: {evaluationResult.cardCount}枚
              </Text>

              {evaluationResult.hands.length > 0 ? (
                <View>
                  <Text style={styles.handsTitle}>成立した役:</Text>
                  {evaluationResult.hands.map((hand, idx) => (
                    <View key={idx} style={styles.handItem}>
                      <Text style={styles.handName}>{hand.name}</Text>
                      <Text style={styles.handPoints}>
                        {hand.points}点
                      </Text>
                    </View>
                  ))}
                  <View style={styles.totalPoints}>
                    <Text style={styles.totalPointsLabel}>合計点数:</Text>
                    <Text style={styles.totalPointsValue}>
                      {evaluationResult.totalPoints}点
                    </Text>
                  </View>
                </View>
              ) : (
                <Text style={styles.noHands}>役が成立していません</Text>
              )}
            </View>
          )}
        </>
      ) : (
        <View style={styles.rulesContainer}>
          <View style={styles.rulesBadge}>
            <Text style={styles.rulesBadgeText}>KOIKOI GUIDE</Text>
          </View>
          <Text style={styles.rulesTitle}>こいこいの基本ルール</Text>
          <Text style={styles.rulesIntro}>
            花札の手札から役を揃えて、続行か確定を選ぶ和風ゲームです。役判定をアプリでサポートします。
          </Text>

          <View style={styles.ruleCard}>
            <Text style={styles.ruleCardTitle}>1. 役を揃える</Text>
            <Text style={styles.ruleCardText}>
              赤短・青短・猪鹿蝶などの役を作ると得点になります。役は手札の組み合わせで発生します。
            </Text>
          </View>

          <View style={styles.ruleCard}>
            <Text style={styles.ruleCardTitle}>2. こいこいを宣言</Text>
            <Text style={styles.ruleCardText}>
              役が成立したあとに「こいこい」で続行すると、さらに大きな得点を狙えます。リスクとリターンの判断が勝敗を左右します。
            </Text>
          </View>

          <View style={styles.ruleCard}> 
            <Text style={styles.ruleCardTitle}>3. やめるで確定</Text>
            <Text style={styles.ruleCardText}>
              これ以上続けたくなければ「やめる」を選んで得点を確定します。安全に得点を取る戦略も重要です。
            </Text>
          </View>

          <Text style={styles.sectionHeader}>代表的な役と必要札</Text>
          {featuredRoles.map(role => (
            <View key={role.title} style={styles.roleBlock}>
              <View style={styles.roleHeader}>
                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.rolePoints}>{role.points}</Text>
              </View>
              <View style={styles.roleImageRow}>
                {role.imageIds.map(id => {
                  const card = CARDS.find(c => c.id === id);
                  return card ? (
                    <Image
                      key={id}
                      source={card.url}
                      style={styles.roleImage}
                    />
                  ) : null;
                })}
              </View>
              <Text style={styles.roleDescription}>{role.description}</Text>
            </View>
          ))}

          <Text style={styles.sectionHeader}>例: 種・短冊・カス</Text>
          <View style={styles.exampleRow}>
            {exampleRoles.map(role => {
              const card = CARDS.find(c => c.id === role.imageId);
              return (
                <View key={role.title} style={styles.exampleCard}>
                  {card && <Image source={card.url} style={styles.exampleImage} />}
                  <Text style={styles.exampleTitle}>{role.title}</Text>
                  <Text style={styles.exampleSubtitle}>{role.subtitle}</Text>
                  <Text style={styles.exampleText}>{role.description}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureBox}>
              <Text style={styles.featureTitle}>戦略</Text>
              <Text style={styles.featureText}>攻めどころと守りどころを見極める</Text>
            </View>
            <View style={styles.featureBox}>
              <Text style={styles.featureTitle}>役判定</Text>
              <Text style={styles.featureText}>このアプリで役の成立を簡単チェック</Text>
            </View>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: '#3b82f6',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    fontWeight: '500',
    opacity: 0.8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 8,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '700',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#ffffff',
  },

  // 撮影ボタンセクション
  captureButtonSection: {
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  captureButtonContent: {
    backgroundColor: '#1a56db',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#1a56db',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  captureButtonEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  captureButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  captureButtonSubtext: {
    fontSize: 14,
    color: '#dbeafe',
    fontWeight: '500',
  },

  // カメラUI
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'space-between',
  },
  cameraTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  cameraTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  cameraCancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    borderRadius: 12,
  },
  cameraCancelText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  cameraContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraGuideFrame: {
    width: width * 0.9,
    height: width * 1.4,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    opacity: 0.7,
  },
  cameraBottomBar: {
    paddingBottom: 40,
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraCaptureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 12,
  },
  cameraCaptureButtonInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#3b82f6',
  },

  monthTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  card: {
    width: '23%',
    height: 120,
    marginHorizontal: '1%',
    marginBottom: 12,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#334155',
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedCard: {
    backgroundColor: '#3b82f6',
    borderColor: '#60a5fa',
    borderWidth: 3,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    alignItems: 'center',
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 6,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 30,
    marginBottom: 80,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  calculateButton: {
    backgroundColor: '#10b981',
  },
  resetButton: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginBottom: 80,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  selectedCount: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 12,
  },
  handsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 12,
    marginBottom: 10,
  },
  handItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  handName: {
    fontSize: 16,
    color: '#ffffff',
  },
  handPoints: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10b981',
  },
  totalPoints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 14,
    paddingBottom: 10,
    borderTopWidth: 2,
    borderTopColor: '#3b82f6',
    marginTop: 12,
  },
  totalPointsLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalPointsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6', 
  },
  noHands: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    marginTop: 12,
  },
  rulesContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
    marginBottom: 80,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  rulesBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f59e0b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginBottom: 16,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  rulesBadgeText: {
    color: '#111827',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  rulesTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: 1,
  },
  rulesIntro: {
    color: '#cbd5e1',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  sectionHeader: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 24,
    marginBottom: 14,
  },
  roleBlock: {
    backgroundColor: '#111827',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 18,
    marginBottom: 14,
  },
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  rolePoints: {
    color: '#34d399',
    fontSize: 16,
    fontWeight: '700',
  },
  roleImageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  roleImage: {
    width: 64,
    height: 88,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#475569',
    backgroundColor: '#0f172a',
  },
  roleDescription: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 24,
  },
  exampleCard: {
    flex: 1,
    backgroundColor: '#111827',
    borderRadius: 18,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  exampleImage: {
    width: 72,
    height: 96,
    borderRadius: 12,
    marginBottom: 12,
  },
  exampleTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  exampleSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
    marginBottom: 8,
  },
  exampleText: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  ruleCard: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  ruleCardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  ruleCardText: {
    color: '#cbd5e1',
    fontSize: 15,
    lineHeight: 22,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
  },
  featureBox: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  featureTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
  },
  featureText: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

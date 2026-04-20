import { Ionicons } from "@expo/vector-icons";
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  ImageBackground,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === 'web';
const CARD_SIZE = isWeb ? 110 : width * 0.35; // حجم مناسب للترتيب العمودي

const ALL_ICONS = ["🍩", "🍄", "⏰", "🐢", "🍎", "⭐", "🎈", "🎨", "🚀", "🌈"];

export default function MemoryGame({ navigation }) {
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isMemorizing, setIsMemorizing] = useState(true);
  const [showModal, setShowModal] = useState({ visible: false, success: true });
  const [showFinishedCard, setShowFinishedCard] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // إحصائيات المؤشرات
  const [stats, setStats] = useState({ correctPairs: 0, wrongAttempts: 0, totalReactionTime: 0 });
  const levelStartTime = useRef(Date.now());

  const progressPercent = level === 1 ? 0 : level === 2 ? 50 : 100;

  async function playClappingSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(require("../../assets/sounds/clapping.mp3"));
      await sound.playAsync();
    } catch (e) { console.log("الصوت غير موجود"); }
  }

  // دالة حساب المؤشرات النهائية
  const calculateFinalStats = () => {
    const totalActions = stats.correctPairs + stats.wrongAttempts;
    const accuracy = stats.correctPairs / (totalActions || 1);
    const avgTime = stats.totalReactionTime / (stats.correctPairs || 1);
    const vmi = (accuracy * 70) + (Math.max(0, 1 - avgTime / 15000) * 30);
    const cpi = (accuracy * 80) + (Math.max(0, 1 - stats.wrongAttempts * 0.1) * 20);
    return {
      vmi: Math.min(98, vmi).toFixed(0),
      cpi: Math.min(96, cpi).toFixed(0),
      avgTime: (avgTime / 1000).toFixed(1)
    };
  };

  const initGame = useCallback(() => {
    const pairsCount = level === 1 ? 2 : level === 2 ? 3 : 4;
    const selectedIcons = ALL_ICONS.slice(0, pairsCount);
    const gameIcons = [...selectedIcons, ...selectedIcons]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({ id: index, icon, isFlipped: true }));

    setCards(gameIcons);
    setMatchedCards([]);
    setFlippedCards([]);
    setIsMemorizing(true);

    setTimeout(() => {
      setIsMemorizing(false);
      setCards((prev) => prev.map((card) => ({ ...card, isFlipped: false })));
      levelStartTime.current = Date.now();
    }, 3000);
  }, [level]);

  useEffect(() => { if (level <= 3) initGame(); }, [level, initGame]);

  const handleCardPress = (index) => {
    if (isMemorizing || cards[index].isFlipped || matchedCards.includes(index) || flippedCards.length === 2) return;

    const reactionTime = Date.now() - levelStartTime.current;
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);
    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].icon === cards[second].icon) {
        setStats(prev => ({ ...prev, correctPairs: prev.correctPairs + 1, totalReactionTime: prev.totalReactionTime + reactionTime }));
        const updatedMatched = [...matchedCards, first, second];
        setMatchedCards(updatedMatched);
        setFlippedCards([]);

        if (updatedMatched.length === cards.length) {
          setTimeout(() => {
            if (level === 3) { playClappingSound(); setShowFinishedCard(true); }
            else { setShowModal({ visible: true, success: true }); }
          }, 600);
        }
      } else {
        setStats(prev => ({ ...prev, wrongAttempts: prev.wrongAttempts + 1 }));
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards([...newCards]);
          setFlippedCards([]);
          setShowModal({ visible: true, success: false });
        }, 800);
      }
    }
  };

  const finalStats = calculateFinalStats();

  return (
    <ImageBackground source={require("../../assets/images/wallper.png")} style={styles.bg} resizeMode="repeat">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {!showReport && !showFinishedCard ? (
          <>
            <View style={styles.header}>
              <View style={styles.topRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
                  <Ionicons name="arrow-back" size={24} color="#10B981" />
                </TouchableOpacity>
                <View style={{alignItems: 'flex-end'}}>
                  <Text style={styles.mainTitle}>لعبة الذاكرة والمطابقة</Text>
                  <Text style={styles.levelText}>المستوى {level} . مهارة المعرفة</Text>
                </View>
              </View>
              <View style={styles.progressSection}>
                 <Text style={styles.progressLabel}>مستوى التقدم {progressPercent}%</Text>
                 <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                 </View>
              </View>
            </View>

            <View style={styles.gameArea}>
              <Text style={styles.instruction}>{isMemorizing ? "احفظ الأماكن! 👀" : "أين الصور المتطابقة؟ ✨"}</Text>
              {/* الترتيب العمودي Grid */}
              <View style={styles.verticalGrid}>
                {cards.map((card, index) => (
                  <TouchableOpacity key={index} style={[styles.card, card.isFlipped && styles.cardActive]} onPress={() => handleCardPress(index)}>
                    <Text style={styles.cardEmoji}>{card.isFlipped ? card.icon : "❓"}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : showFinishedCard ? (
          <View style={styles.centerBox}>
            <Text style={{fontSize: 100}}>🏆</Text> 
            <Text style={styles.congratsTitle}>أحسنت يا بطل!</Text>
            <TouchableOpacity style={styles.mainBtn} onPress={() => { setShowFinishedCard(false); setShowReport(true); }}>
              <Text style={styles.btnText}>عرض مؤشرات الأداء 📊</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.reportContent}>
            <Text style={styles.reportTitle}>تحليل مهارات الطفل</Text>
            <View style={styles.indicesRow}>
              <View style={styles.indexBox}>
                <Text style={styles.indexValue}>{finalStats.vmi}%</Text>
                <Text style={styles.indexLabel}>الإدراك البصري (VMI)</Text>
              </View>
              <View style={[styles.indexBox, { borderBottomColor: "#3498DB" }]}>
                <Text style={[styles.indexValue, { color: "#3498DB" }]}>{finalStats.cpi}%</Text>
                <Text style={styles.indexLabel}>المعالج المعرفي (CPI)</Text>
              </View>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryText}>سرعة الاستجابة: {finalStats.avgTime} ثانية</Text>
              <Text style={styles.summaryText}>عدد الأخطاء: {stats.wrongAttempts}</Text>
            </View>
            <TouchableOpacity style={styles.mainBtn} onPress={() => { setLevel(1); setShowReport(false); setStats({correctPairs:0, wrongAttempts:0, totalReactionTime:0}); }}>
              <Text style={styles.btnText}>إعادة التجربة 🔄</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        <Modal visible={showModal.visible} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContent, { borderTopColor: showModal.success ? "#10B981" : "#FF6B6B", borderTopWidth: 10 }]}>
              <Text style={{fontSize: 80}}>{showModal.success ? "👏" : "☹️"}</Text>
              <Text style={styles.modalTitle}>{showModal.success ? "ممتاز!" : "حاول مرة أخرى"}</Text>
              <TouchableOpacity 
                style={[styles.modalBtn, {backgroundColor: showModal.success ? "#10B981" : "#FF6B6B"}]}
                onPress={() => { setShowModal({visible: false}); if(showModal.success) setLevel(level+1); }}
              >
                <Text style={styles.btnText}>{showModal.success ? "التالي" : "رجوع"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.85)' },
  container: { flex: 1 },
  header: { padding: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { backgroundColor: '#FFF', padding: 10, borderRadius: 15, elevation: 4 },
  mainTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  levelText: { color: '#10B981', fontWeight: 'bold', fontSize: 12 },
  progressSection: { marginTop: 15 },
  progressLabel: { textAlign: 'right', fontSize: 12, marginBottom: 5, color: '#64748B' },
  progressTrack: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10B981' },
  gameArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  instruction: { fontSize: 22, fontWeight: 'bold', marginBottom: 25 },
  verticalGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, width: isWeb ? '50%' : '90%' },
  card: { width: CARD_SIZE, height: CARD_SIZE, backgroundColor: '#FFF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 8, borderBottomWidth: 5, borderBottomColor: '#DDD' },
  cardActive: { borderBottomColor: '#10B981' },
  cardEmoji: { fontSize: 40 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  congratsTitle: { fontSize: 28, fontWeight: 'bold', color: '#10B981', marginVertical: 20 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: isWeb ? 350 : '80%', backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginVertical: 15 },
  modalBtn: { width: '100%', padding: 15, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  mainBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 15, marginTop: 20 },
  reportContent: { padding: 25, alignItems: 'center', paddingTop: 50 },
  reportTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
  indicesRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  indexBox: { width: isWeb ? 150 : width * 0.4, padding: 20, backgroundColor: '#FFF', borderRadius: 20, alignItems: 'center', elevation: 5, borderBottomWidth: 6, borderBottomColor: '#10B981' },
  indexValue: { fontSize: 28, fontWeight: 'bold', color: '#10B981' },
  indexLabel: { fontSize: 11, color: '#64748B', textAlign: 'center' },
  summaryBox: { width: '100%', backgroundColor: '#F0FDF4', padding: 20, borderRadius: 20, marginBottom: 20 },
  summaryText: { textAlign: 'center', fontWeight: 'bold', color: '#10B981' }
});
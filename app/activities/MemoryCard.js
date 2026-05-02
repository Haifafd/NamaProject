import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { auth, db } from "../../FirebaseConfig";

// استيراد مكونات الثيم الموحد ومودال النتيجة
import { AppLayout, BORDER, CARD, MUTED, PRIMARY } from "./ActivityStyle";
import ResultModal from "./Result";

const { width } = Dimensions.get("window");

const ALL_ICONS = ["🍩", "🍄", "⏰", "🐢", "🍎", "⭐", "🎈", "🎨", "🚀", "🌈"];

export default function MemoryGame({ navigation, route }) {
  const router = useRouter();
  const activityId = route?.params?.activityId || "memory_game_01";
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isMemorizing, setIsMemorizing] = useState(true);
  const [showModal, setShowModal] = useState({ visible: false, success: true });
  const [showFinishedCard, setShowFinishedCard] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [gameState, setGameState] = useState("playing");

  const [stats, setStats] = useState({ correctPairs: 0, wrongAttempts: 0, totalReactionTime: 0 });
  const levelStartTime = useRef(Date.now());

  const progressPercent = level === 1 ? 0 : level === 2 ? 50 : 100;

  // تحديد حجم البطاقة وعدد الأعمدة بناءً على المستوى لمنع التداخل
  const numColumns = level === 1 ? 2 : 3; 
  const CARD_SIZE = (width * 0.8) / numColumns;

  const saveMemoryResults = async (finalStats) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, "ActivityResults"), {
        activityId: activityId,
        childId: user.uid,
        vmiScore: parseInt(finalStats.vmi),
        cpiScore: parseInt(finalStats.cpi),
        avgReactionTime: parseFloat(finalStats.avgTime),
        totalErrors: stats.wrongAttempts,
        status: "completed",
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("❌ خطأ في الحفظ: ", e);
    }
  };

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
            if (level === 3) { 
              const finalStats = calculateFinalStats();
              saveMemoryResults(finalStats);
              setShowFinishedCard(true); 
              setGameState("won");
            }
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

  const resetGame = () => {
    setLevel(1);
    setShowFinishedCard(false);
    setShowReport(false);
    setGameState("playing");
    setStats({correctPairs:0, wrongAttempts:0, totalReactionTime:0});
  };

  const results = calculateFinalStats();

  return (
    <AppLayout navigation={navigation} activeTab="activities">
      {!showReport && !showFinishedCard ? (
        <View style={{ flex: 1 }}>
          {/* الهيدر: الباك يسار والعنوان يمين */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.push("/parent/Activities")}>
              <Ionicons name="arrow-back" size={24} color={PRIMARY} />
            </TouchableOpacity>
            
            <View style={styles.titleBlock}>
              <Text style={styles.mainTitle}>لعبة الذاكرة والمطابقة</Text>
              <Text style={styles.levelSubtitle}>المستوى {level} . مهارة المعرفة</Text>
            </View>
          </View>

          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>مستوى التقدم {progressPercent}%</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          <View style={styles.gameArea}>
            <Text style={styles.instructionText}>{isMemorizing ? "احفظ الأماكن! 👀" : "أين الصور المتطابقة؟ ✨"}</Text>
            <View style={styles.grid}>
              {cards.map((card, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.card, {width: CARD_SIZE, height: CARD_SIZE}, card.isFlipped && styles.cardActive]} 
                  onPress={() => handleCardPress(index)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.cardEmoji, {fontSize: CARD_SIZE * 0.45}]}>{card.isFlipped ? card.icon : "❓"}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      ) : showFinishedCard && !showReport ? (
        <View style={styles.finishBox}>
          <Text style={styles.finishIcon}>🏆</Text>
          <Text style={styles.congratsText}>أحسنت يا بطل!</Text>
          <TouchableOpacity style={styles.reportBtn} onPress={() => setShowReport(true)}>
            <Text style={styles.reportBtnText}>عرض مؤشرات الأداء 📊</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.reportArea}>
          <Text style={styles.reportHeader}>نتائج تحليل المهارات</Text>
          <View style={styles.indicesGrid}>
            <View style={styles.indexItem}>
               <Text style={styles.indexVal}>{results.vmi}%</Text>
               <Text style={styles.indexLabel}>الإدراك البصري</Text>
            </View>
            <View style={[styles.indexItem, {borderBottomColor: '#3498DB'}]}>
               <Text style={[styles.indexVal, {color: '#3498DB'}]}>{results.cpi}%</Text>
               <Text style={styles.indexLabel}>المعالج المعرفي</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.retryBtn} onPress={resetGame}>
            <Text style={styles.retryText}>إعادة التجربة 🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.retryBtn, {marginTop: 10, backgroundColor: '#E2E8F0'}]} onPress={() => router.push("/parent/Activities")}>
            <Text style={[styles.retryText, {color: '#1E293B'}]}>الخروج للرئيسية</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* المودال المرحلي */}
      <Modal visible={showModal.visible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalBox, { borderTopColor: showModal.success ? PRIMARY : "#FF6B6B" }]}>
            <Text style={styles.modalStatusIcon}>{showModal.success ? "👏" : "☹️"}</Text>
            <Text style={styles.modalText}>{showModal.success ? "ممتاز!" : "حاول مرة أخرى"}</Text>
            <TouchableOpacity 
              style={[styles.modalActionBtn, {backgroundColor: showModal.success ? PRIMARY : "#FF6B6B"}]} 
              onPress={() => { setShowModal({visible: false}); if(showModal.success) setLevel(level+1); }}>
              <Text style={styles.modalActionText}>{showModal.success ? "التالي" : "رجوع"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* مودال النتيجة النهائية */}
      {gameState === "won" && (
        <ResultModal 
          visible={showFinishedCard && !showReport}
          state="won"
          onReset={resetGame}
          onNavigateNext={() => router.push("/parent/Activities")}
        />
      )}
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 15,
    justifyContent: 'space-between' 
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: CARD, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 3 
  },
  titleBlock: { alignItems: 'flex-end' },
  mainTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  levelSubtitle: { color: PRIMARY, fontWeight: 'bold', fontSize: 12 },
  progressContainer: { paddingHorizontal: 25, marginTop: 10 },
  progressLabel: { textAlign: 'right', fontSize: 12, marginBottom: 5, color: MUTED },
  progressBg: { height: 8, backgroundColor: BORDER, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: PRIMARY },
  gameArea: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'flex-start', // تبدأ من الأعلى لترك مساحة
    paddingTop: 50,
    paddingBottom: 20 
  },
  instructionText: { fontSize: 22, fontWeight: 'bold', marginBottom: 25, color: '#1E293B' },
  grid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    gap: 12, 
    width: '100%',
    paddingHorizontal: 15
  },
  card: { 
    backgroundColor: CARD, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 4, 
    borderBottomWidth: 5, 
    borderBottomColor: BORDER 
  },
  cardActive: { borderBottomColor: PRIMARY },
  cardEmoji: { },
  finishBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  finishIcon: { fontSize: 90 },
  congratsText: { fontSize: 28, fontWeight: 'bold', color: PRIMARY, marginVertical: 20 },
  reportBtn: { backgroundColor: PRIMARY, paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20 },
  reportBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  reportArea: { padding: 25, alignItems: 'center', paddingTop: 30 },
  reportHeader: { fontSize: 24, fontWeight: 'bold', marginBottom: 30, color: '#1E293B' },
  indicesGrid: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  indexItem: { width: width * 0.4, padding: 20, backgroundColor: CARD, borderRadius: 20, alignItems: 'center', elevation: 4, borderBottomWidth: 6, borderBottomColor: PRIMARY },
  indexVal: { fontSize: 28, fontWeight: 'bold', color: PRIMARY },
  indexLabel: { fontSize: 11, color: MUTED, textAlign: 'center', marginTop: 5 },
  retryBtn: { backgroundColor: PRIMARY, padding: 15, borderRadius: 15, width: '80%', alignItems: 'center' },
  retryText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '80%', backgroundColor: CARD, borderRadius: 30, padding: 30, alignItems: 'center', borderTopWidth: 10 },
  modalStatusIcon: { fontSize: 70 },
  modalText: { fontSize: 22, fontWeight: 'bold', marginVertical: 15 },
  modalActionBtn: { width: '100%', padding: 15, borderRadius: 15, alignItems: 'center' },
  modalActionText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

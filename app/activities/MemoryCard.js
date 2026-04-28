import { Ionicons } from "@expo/vector-icons";
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from "react";
// --- استيرادات الفايربيس ---
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../FirebaseConfig";
// ----------------------------------
import {
  Dimensions,
  ImageBackground,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === 'web';
const CARD_SIZE = isWeb ? 130 : (width - 60) / 2; 

const ALL_ICONS = ["🍩", "🍄", "⏰", "🐢", "🍎", "⭐", "🎈", "🎨", "🚀", "🌈"];

export default function MemoryGame({ navigation }) {
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isMemorizing, setIsMemorizing] = useState(true);
  const [showModal, setShowModal] = useState({ visible: false, success: true });
  const [showFinishedCard, setShowFinishedCard] = useState(false);

  const [stats, setStats] = useState({ correctPairs: 0, wrongAttempts: 0, totalReactionTime: 0 });
  const levelStartTime = useRef(Date.now());

  const progressPercent = Math.round(((level - 1) / 3) * 100);

  // --- دالة الحفظ: تعمل في الخلفية دون الحاجة لفتح صفحة المؤشرات ---
  const saveToFirestore = async () => {
    try {
      const totalAttempts = stats.correctPairs + stats.wrongAttempts;
      const errorRate = stats.wrongAttempts / (totalAttempts || 1);
      const avgTime = stats.totalReactionTime / (stats.correctPairs || 1);
      
      let scaledScore;
      if (errorRate <= 0.1) scaledScore = 1;      
      else if (errorRate <= 0.25) scaledScore = 2; 
      else if (errorRate <= 0.5) scaledScore = 3;  
      else if (errorRate <= 0.75) scaledScore = 4; 
      else scaledScore = 5;                        

      await addDoc(collection(db, "ActivityResults"), {
        activityId: "لعبة الذاكرة والمطابقة",
        attempts: totalAttempts,
        categoryId: "Memory",
        childId: "child_user_01", 
        completed: true,
        createdAt: serverTimestamp(),
        duration: parseFloat((avgTime / 1000).toFixed(1)),
        level: level,
        score: scaledScore,
        errors: stats.wrongAttempts
      });
      console.log("تم حفظ البيانات بنجاح في قاعدة البيانات");
    } catch (e) {
      console.error("خطأ في الحفظ: ", e);
    }
  };

  async function playClappingSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(require("../../assets/sounds/clapping.mp3"));
      await sound.playAsync();
    } catch (e) { console.log("الصوت ناقص"); }
  }

  const initGame = useCallback(() => {
    setStats({ correctPairs: 0, wrongAttempts: 0, totalReactionTime: 0 });
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
               saveToFirestore(); // الحفظ يتم هنا مباشرة
               playClappingSound(); 
               setShowFinishedCard(true); 
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

  return (
    <ImageBackground source={require("../../assets/images/wallper.png")} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {!showFinishedCard ? (
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
              <View style={styles.grid}>
                {cards.map((card, index) => (
                  <TouchableOpacity key={index} style={[styles.card, card.isFlipped && styles.cardActive]} onPress={() => handleCardPress(index)}>
                    <Text style={styles.cardEmoji}>{card.isFlipped ? card.icon : "❓"}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : (
          <View style={styles.centerBox}>
            <Text style={{fontSize: 100}}>🎊</Text>
            <Text style={styles.congratsTitle}>تهانينا يا بطل!</Text>
            <Text style={styles.congratsSub}>لقد أتممت جميع المراحل بنجاح 🎉</Text>
            <TouchableOpacity style={styles.mainBtn} onPress={() => navigation?.goBack()}>
              <Text style={styles.btnText}>العودة للرئيسية</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.navBar}>
            <View style={styles.navItem}><Ionicons name="person-outline" size={22} color="#94A3B8" /><Text style={styles.navText}>حسابي</Text></View>
            <View style={styles.activeNavItem}><Ionicons name="brain" size={22} color="#10B981" /><Text style={[styles.navText, {color: '#10B981'}]}>نشاط</Text></View>
            <View style={styles.navItem}><Ionicons name="home-outline" size={22} color="#94A3B8" /><Text style={styles.navText}>الرئيسية</Text></View>
        </View>

        <Modal visible={showModal.visible} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={[styles.modalContent, { borderTopColor: showModal.success ? "#10B981" : "#FF6B6B", borderTopWidth: 10 }]}>
              <Text style={{fontSize: 80}}>{showModal.success ? "👏" : "😥"}</Text>
              <Text style={styles.modalTitle}>{showModal.success ? "ممتاز!" : "أوووه! حاول مرة أخرى"}</Text>
              <TouchableOpacity style={[styles.modalBtn, {backgroundColor: showModal.success ? "#10B981" : "#FF6B6B"}]} onPress={() => { setShowModal({visible: false}); if(showModal.success) setLevel(level+1); }}>
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
  gameArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  instruction: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, width: '90%' },
  card: { width: CARD_SIZE, height: CARD_SIZE, backgroundColor: '#FFF', borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  cardActive: { borderWidth: 2, borderColor: '#10B981' },
  cardEmoji: { fontSize: 45 },
  navBar: { position: 'absolute', bottom: 25, alignSelf: 'center', width: '85%', height: 65, backgroundColor: '#FFF', borderRadius: 35, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 15 },
  navItem: { alignItems: 'center' },
  activeNavItem: { backgroundColor: '#F0FDF4', padding: 8, borderRadius: 15, alignItems: 'center' },
  navText: { fontSize: 10, fontWeight: 'bold' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  congratsTitle: { fontSize: 32, fontWeight: 'bold', color: '#10B981', marginTop: 20 },
  congratsSub: { fontSize: 18, color: '#64748B', textAlign: 'center', marginTop: 10 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '80%', backgroundColor: '#FFF', borderRadius: 30, padding: 30, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginVertical: 15 },
  modalBtn: { width: '100%', padding: 15, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  mainBtn: { backgroundColor: '#10B981', padding: 15, borderRadius: 15, marginTop: 20, width: '80%', alignItems: 'center' },
});

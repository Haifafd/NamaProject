import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
    Dimensions,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get("window");
const ALL_ICONS = ["🍩", "🍄", "⏰", "🐢", "🍎", "⭐", "🎈", "🎨", "🚀", "🌈"];

export default function MemoryGame() {
  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isMemorizing, setIsMemorizing] = useState(true);
  const [showModal, setShowModal] = useState({ visible: false, success: true });
  const [showFinishedCard, setShowFinishedCard] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const [stats, setStats] = useState({
    correctPairs: 0,
    wrongAttempts: 0,
    startTime: Date.now(),
    totalReactionTime: 0,
  });

  const levelStartTime = useRef(Date.now());
  const progressPercent = level === 1 ? 0 : level === 2 ? 50 : 100;

  const initGame = useCallback(() => {
    const pairsCount = level === 1 ? 2 : level === 2 ? 3 : 4;
    const selectedIcons = ALL_ICONS.slice(0, pairsCount);

    const gameIcons = [...selectedIcons, ...selectedIcons]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: true,
      }));

    setCards(gameIcons);
    setMatchedCards([]);
    setFlippedCards([]);
    setIsMemorizing(true);

    setTimeout(() => {
      setIsMemorizing(false);
      setCards((prev) => prev.map((card) => ({ ...card, isFlipped: false })));
      levelStartTime.current = Date.now();
    }, 4000);
  }, [level]);

  useEffect(() => {
    if (level <= 3) initGame();
  }, [level, initGame]);

  const calculateFinalStats = () => {
    const totalActions = stats.correctPairs + stats.wrongAttempts;
    const accuracy = stats.correctPairs / (totalActions || 1);
    const avgTime = stats.totalReactionTime / (stats.correctPairs || 1);

    const vmi = accuracy * 0.7 + Math.max(0, 1 - avgTime / 15000) * 0.3;
    const cpi =
      accuracy * 0.8 + Math.max(0, 1 - stats.wrongAttempts * 0.15) * 0.2;

    return {
      vmi: Math.min(98, vmi * 100).toFixed(0),
      cpi: Math.min(96, cpi * 100).toFixed(0),
      avgTime: (avgTime / 1000).toFixed(1),
    };
  };

  const handleCardPress = (index) => {
    if (
      isMemorizing ||
      cards[index].isFlipped ||
      matchedCards.includes(index) ||
      flippedCards.length === 2
    ) {
      return;
    }

    const reactionTime = Date.now() - levelStartTime.current;
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;

      if (cards[first].icon === cards[second].icon) {
        setStats((prev) => ({
          ...prev,
          correctPairs: prev.correctPairs + 1,
          totalReactionTime: prev.totalReactionTime + reactionTime,
        }));

        const updatedMatched = [...matchedCards, first, second];
        setMatchedCards(updatedMatched);
        setFlippedCards([]);

        if (updatedMatched.length === cards.length) {
          if (level === 3) {
            setTimeout(() => setShowFinishedCard(true), 600);
          } else {
            setTimeout(
              () => setShowModal({ visible: true, success: true }),
              600,
            );
          }
        }
      } else {
        setStats((prev) => ({
          ...prev,
          wrongAttempts: prev.wrongAttempts + 1,
        }));

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

  const results = calculateFinalStats();

  if (showFinishedCard) {
    return (
      <SafeAreaView style={styles.fullOverlay}>
        <View style={styles.congratsCard}>
          <Ionicons name="trophy" size={80} color="#FFD700" />
          <Text style={styles.congratsTitle}>أحسنت يا بطل!</Text>
          <Text style={styles.congratsSub}>
            لقد أتممت نشاط الذاكرة بنجاح 🌟
          </Text>
          <TouchableOpacity
            style={styles.mainBtn}
            onPress={() => {
              setShowFinishedCard(false);
              setShowReport(true);
            }}
          >
            <Text style={styles.btnText}>عرض مؤشرات الأداء 📊</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!showReport ? (
        <>
          <View style={styles.header}>
            <View style={styles.topRow}>
              <TouchableOpacity style={styles.backCircle}>
                <Ionicons name="arrow-back" size={24} color="#10B981" />
              </TouchableOpacity>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.mainTitle}>لعبة الذاكرة والمطابقة</Text>
                <Text style={styles.levelText}>
                  المستوى {level} . مهارة المعرفة
                </Text>
              </View>
            </View>

            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>
                مستوى التقدم {progressPercent}%
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          <View style={styles.gameContainer}>
            <Text style={styles.instruction}>
              {isMemorizing
                ? "احفظ أماكن الصور! 👀"
                : "أين كانت الصور المتطابقة؟ ✨"}
            </Text>

            <View style={styles.cardGrid}>
              {cards.map((card, index) => (
                <TouchableOpacity
                  key={card.id}
                  style={[styles.card, card.isFlipped && styles.cardFlipped]}
                  onPress={() => handleCardPress(index)}
                >
                  <Text style={styles.cardContent}>
                    {card.isFlipped ? card.icon : "❓"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.reportContent}>
          <Text style={styles.reportTitle}>تحليل مهارات الطفل</Text>

          <View style={styles.indicesRow}>
            <View style={styles.indexBox}>
              <Text style={styles.indexValue}>{results.vmi}%</Text>
              <Text style={styles.indexLabel}>الإدراك البصري (VMI)</Text>
            </View>

            <View style={[styles.indexBox, { borderBottomColor: "#3498DB" }]}>
              <Text style={[styles.indexValue, { color: "#3498DB" }]}>
                {results.cpi}%
              </Text>
              <Text style={styles.indexLabel}>المعالج المعرفي (CPI)</Text>
            </View>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>
              متوسط سرعة التذكر: {results.avgTime} ثانية
            </Text>
            <Text style={styles.summaryText}>
              عدد المحاولات الخاطئة: {stats.wrongAttempts}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.mainBtn}
            onPress={() => {
              setLevel(1);
              setShowReport(false);
              setStats({
                correctPairs: 0,
                wrongAttempts: 0,
                startTime: Date.now(),
                totalReactionTime: 0,
              });
            }}
          >
            <Text style={styles.btnText}>إعادة التجربة 🔄</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* شريط المهام السفلي الموحد كما في الصورة b85cc5 */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="person-outline" size={22} color="#94A3B8" />
          <Text style={styles.navText}>حسابي</Text>
        </TouchableOpacity>

        <View style={styles.activeNavItem}>
          <Ionicons name="brain-outline" size={22} color="#10B981" />
          <Text style={[styles.navText, { color: "#10B981" }]}>نشاط</Text>
        </View>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home-outline" size={22} color="#94A3B8" />
          <Text style={styles.navText}>الرئيسية</Text>
        </TouchableOpacity>
      </View>

      {/* مودال الصح والخطأ الموحد */}
      <Modal visible={showModal.visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View
            style={[
              styles.modalBody,
              {
                borderTopWidth: 8,
                borderTopColor: showModal.success ? "#10B981" : "#F59E0B",
              },
            ]}
          >
            <Ionicons
              name={showModal.success ? "checkmark-circle" : "alert-circle"}
              size={70}
              color={showModal.success ? "#10B981" : "#F59E0B"}
            />

            <Text style={styles.modalTitle}>
              {showModal.success ? "إجابة صحيحة!" : "حاول مرة أخرى"}
            </Text>

            <Text style={styles.modalSub}>
              {showModal.success
                ? "أنت رائع في المطابقة!"
                : "ركز في أماكن الصور جيداً"}
            </Text>

            <TouchableOpacity
              style={[
                styles.mainBtn,
                {
                  backgroundColor: showModal.success ? "#10B981" : "#F59E0B",
                  width: "80%",
                },
              ]}
              onPress={() => {
                setShowModal({
                  visible: false,
                  success: showModal.success,
                });
                if (showModal.success) setLevel(level + 1);
              }}
            >
              <Text style={styles.btnText}>
                {showModal.success ? "المرحلة التالية" : "حاول مجدداً"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { padding: 20, paddingTop: 30 },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
  },
  levelText: {
    color: "#10B981",
    fontSize: 13,
    fontWeight: "700",
  },
  progressContainer: { marginTop: 20 },
  progressLabel: {
    textAlign: "right",
    fontSize: 12,
    color: "#64748B",
    marginBottom: 5,
    fontWeight: "bold",
  },
  progressTrack: {
    height: 10,
    backgroundColor: "#E2E8F0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
  },
  gameContainer: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 60,
  },
  instruction: {
    fontSize: 18,
    color: "#1E293B",
    marginBottom: 25,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  card: {
    width: width * 0.35,
    height: width * 0.35,
    backgroundColor: "#FFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  cardFlipped: {
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
    borderColor: "#10B981",
  },
  cardContent: {
    fontSize: 40,
  },
  mainBtn: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    backgroundColor: "#10B981",
    borderRadius: 20,
    marginTop: 15,
    alignItems: "center",
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  fullOverlay: {
    flex: 1,
    backgroundColor: "#F0FDF4",
    justifyContent: "center",
    alignItems: "center",
  },
  congratsCard: {
    width: "85%",
    padding: 30,
    backgroundColor: "#FFF",
    borderRadius: 30,
    alignItems: "center",
    elevation: 10,
  },
  congratsTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#10B981",
    marginTop: 15,
  },
  congratsSub: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    marginVertical: 15,
  },
  reportContent: {
    padding: 25,
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 100,
  },
  reportTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1E293B",
    marginBottom: 30,
  },
  indicesRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 25,
  },
  indexBox: {
    width: width * 0.42,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 22,
    alignItems: "center",
    elevation: 4,
    borderBottomWidth: 6,
    borderBottomColor: "#10B981",
  },
  indexValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#10B981",
  },
  indexLabel: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },
  summaryBox: {
    width: "100%",
    backgroundColor: "#F0FDF4",
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
  },
  summaryText: {
    fontSize: 15,
    color: "#10B981",
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "bold",
  },
  navBar: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "#FFF",
    width: "90%",
    height: 65,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "space-around",
    elevation: 12,
  },
  navItem: {
    alignItems: "center",
  },
  activeNavItem: {
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  navText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 3,
    fontWeight: "700",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBody: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 15,
    color: "#1E293B",
  },
  modalSub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginVertical: 10,
  },
});

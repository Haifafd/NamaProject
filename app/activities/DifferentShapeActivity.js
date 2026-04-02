import { useCallback, useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// --- قائمة فواكه متنوعة وكتيرة ---
const fruitsData = [
  { id: 1, uri: "https://cdn-icons-png.flaticon.com/512/415/415733.png" }, // تفاح
  { id: 2, uri: "https://cdn-icons-png.flaticon.com/512/2909/2909761.png" }, // موز
  { id: 3, uri: "https://cdn-icons-png.flaticon.com/512/1728/1728765.png" }, // برتقال
  { id: 4, uri: "https://cdn-icons-png.flaticon.com/512/599/599502.png" }, // فراولة
  { id: 5, uri: "https://cdn-icons-png.flaticon.com/512/2153/2153788.png" }, // عنب
  { id: 6, uri: "https://cdn-icons-png.flaticon.com/512/3137/3137044.png" }, // ليمون
  { id: 7, uri: "https://cdn-icons-png.flaticon.com/512/2106/2106111.png" }, // كرز
  { id: 8, uri: "https://cdn-icons-png.flaticon.com/512/2224/2224115.png" }, // بطيخ
  { id: 9, uri: "https://cdn-icons-png.flaticon.com/512/2909/2909808.png" }, // أناناس
  { id: 10, uri: "https://cdn-icons-png.flaticon.com/512/2909/2909841.png" }, // كيوي
];

export default function FindDifferentGame() {
  const [gameState, setGameState] = useState("playing"); // playing, won, lost
  const [gameItems, setGameItems] = useState([]); // ترتيب الصور في المربعات

  const generateLevel = useCallback(() => {
    // 1. اختيار الفاكهة المتكررة والمختلفة
    const mainFruit = fruitsData[Math.floor(Math.random() * fruitsData.length)];
    let diffFruit;
    do {
      diffFruit = fruitsData[Math.floor(Math.random() * fruitsData.length)];
    } while (diffFruit.id === mainFruit.id);

    // 2. إنشاء مصفوفة من 4 عناصر (3 متشابهة و 1 مختلفة)
    const items = [
      { uri: mainFruit.uri, isCorrect: false },
      { uri: mainFruit.uri, isCorrect: false },
      { uri: mainFruit.uri, isCorrect: false },
      { uri: diffFruit.uri, isCorrect: true },
    ];

    // 3. خلط المصفوفة (Shuffle) عشان يتغير مكان الإجابة
    const shuffledItems = items.sort(() => Math.random() - 0.5);

    setGameItems(shuffledItems);
    setGameState("playing");
  }, []);

  useEffect(() => {
    generateLevel();
  }, [generateLevel]);

  const handleChoice = (isCorrect) => {
    setGameState(isCorrect ? "won" : "lost");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* الهيدر العلوي */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.mainTitle}>لعبة إيجاد الشكل المختلف</Text>
          <Text style={styles.subTitle}>مستوى ٣ . مهارة المعرفة</Text>
        </View>
      </View>

      {/* شريط التقدم */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressPercent}>65%</Text>
          <Text style={styles.progressLabel}>مستوى التقدم</Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: "65%" }]} />
        </View>
      </View>

      {/* منطقة السؤال */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionTitle}>أين الشكل المختلف؟</Text>
        <Text style={styles.questionSub}>
          قم باختيار الشكل المختلف من بين الأشكال الظاهرة
        </Text>
      </View>

      {/* شبكة الصور */}
      <View style={styles.gridContainer}>
        <View style={styles.row}>
          {gameItems.slice(0, 2).map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.imageCard}
              onPress={() => handleChoice(item.isCorrect)}
            >
              <Image source={{ uri: item.uri }} style={styles.gameImg} />
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.row}>
          {gameItems.slice(2, 4).map((item, idx) => (
            <TouchableOpacity
              key={idx + 2}
              style={styles.imageCard}
              onPress={() => handleChoice(item.isCorrect)}
            >
              <Image source={{ uri: item.uri }} style={styles.gameImg} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* البار السفلي */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconOff}>🏠</Text>
          <Text style={styles.navLabelOff}>الرئيسية</Text>
        </TouchableOpacity>
        <View style={styles.navActiveItem}>
          <View style={styles.navActiveBg}>
            <Text style={styles.navIconOn}>🎮</Text>
            <Text style={styles.navLabelOn}>نشاط</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconOff}>👤</Text>
          <Text style={styles.navLabelOff}>حسابي</Text>
        </TouchableOpacity>
      </View>

      {/* واجهات النتيجة (Popups) - تم استعادتها كما كانت في الكود الأصلي */}
      <Modal visible={gameState !== "playing"} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View
              style={[
                styles.statusCircle,
                {
                  backgroundColor: gameState === "won" ? "#C5E1A5" : "#FF8A80",
                },
              ]}
            >
              <Text style={styles.statusIcon}>
                {gameState === "won" ? "✓" : "✕"}
              </Text>
            </View>
            <Text style={styles.modalTitle}>
              {gameState === "won" ? "عمل رائع !!" : "حاول مرة أخرى!"}
            </Text>
            <TouchableOpacity style={styles.actionBtn} onPress={generateLevel}>
              <Text style={styles.actionBtnText}>
                {gameState === "won" ? "النشاط التالي ←" : "إعادة النشاط ←"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFFFA" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 25,
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: { fontSize: 22, color: "#4CAF50" },
  headerTextContainer: { alignItems: "flex-end" },
  mainTitle: { fontSize: 20, fontWeight: "bold", color: "#1B5E20" },
  subTitle: { fontSize: 12, color: "#81C784" },

  progressSection: { paddingHorizontal: 30, marginTop: 10 },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressPercent: { fontSize: 13, color: "#999", fontWeight: "bold" },
  progressLabel: { fontSize: 14, fontWeight: "bold", color: "#2E7D32" },
  progressBg: { height: 10, backgroundColor: "#E0E0E0", borderRadius: 5 },
  progressFill: { height: "100%", backgroundColor: "#4CAF50", borderRadius: 5 },

  questionContainer: { alignItems: "center", marginTop: 30 },
  questionTitle: { fontSize: 24, fontWeight: "bold", color: "#333" },
  questionSub: {
    fontSize: 13,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 40,
  },

  gridContainer: { flex: 1, justifyContent: "center", paddingHorizontal: 20 },
  row: { flexDirection: "row", justifyContent: "center", marginBottom: 20 },
  imageCard: {
    width: width * 0.38,
    aspectRatio: 1,
    backgroundColor: "#FFF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  gameImg: { width: "70%", height: "70%", resizeMode: "contain" },

  bottomNav: {
    flexDirection: "row",
    height: 90,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 15,
    elevation: 20,
  },
  navActiveBg: {
    backgroundColor: "#E8F5E9",
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  navLabelOn: {
    color: "#4CAF50",
    fontWeight: "bold",
    fontSize: 13,
    marginLeft: 5,
  },
  navIconOn: { fontSize: 18 },
  navIconOff: { fontSize: 22, color: "#DDD" },
  navLabelOff: { color: "#DDD", fontSize: 11 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 35,
    padding: 30,
    alignItems: "center",
  },
  statusCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  statusIcon: { fontSize: 50, color: "#FFF", fontWeight: "bold" },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
  },
  actionBtn: {
    width: "100%",
    height: 60,
    backgroundColor: "#CCFF00",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  actionBtnText: { color: "#1B5E20", fontSize: 18, fontWeight: "bold" },
});

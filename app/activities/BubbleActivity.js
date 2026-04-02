import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// إعدادات الفقاعات بأماكن عشوائية وأحجام متنوعة (زرقاء كما في الصورة)
const INITIAL_BUBBLES = [
  { id: 1, top: "20%", left: "15%", size: 90, color: "#E1F5FE" },
  { id: 2, top: "25%", left: "55%", size: 100, color: "#B3E5FC" },
  { id: 3, top: "45%", left: "20%", size: 110, color: "#E1F5FE" },
  { id: 4, top: "50%", left: "65%", size: 80, color: "#B3E5FC" },
  { id: 5, top: "65%", left: "35%", size: 95, color: "#E1F5FE" },
  { id: 6, top: "78%", left: "15%", size: 70, color: "#B3E5FC" },
  { id: 7, top: "80%", left: "60%", size: 85, color: "#E1F5FE" },
];

export default function PerfectBubbleGame() {
  const [bubbles, setBubbles] = useState(INITIAL_BUBBLES);
  const [gameState, setGameState] = useState("playing"); // playing, won, lost
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // أنيميشن "الطفو" للفقاعات لتبدو حية
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handleBubblePress = (id) => {
    // يمكنك إضافة صوت الفرقرة هنا
    const newBubbles = bubbles.filter((b) => b.id !== id);
    setBubbles(newBubbles);
    if (newBubbles.length === 0) setGameState("won"); // إظهار واجهة "عمل رائع"
  };

  const handleMissPress = () => {
    // اهتزاز الشاشة عند الخطأ
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start(() => setGameState("lost")); // إظهار واجهة "حاول مرة أخرى"
  };

  const resetGame = () => {
    setBubbles(INITIAL_BUBBLES);
    setGameState("playing");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* الجزء العلوي (Header) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={styles.mainTitle}>نشاط الفقاعات</Text>
          <Text style={styles.subTitle}>مستوى ٣ . مهارة المعرفة</Text>
        </View>
      </View>

      {/* شريط التقدم الأخضر */}
      <View style={styles.progressSection}>
        <Text style={styles.progressValue}>65%</Text>
        <Text style={styles.progressLabel}>مستوى التقدم</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: "65%" }]} />
        </View>
      </View>

      {/* منطقة اللعب */}
      <TouchableWithoutFeedback onPress={handleMissPress}>
        <Animated.View
          style={[
            styles.gameArea,
            { transform: [{ translateX: shakeAnimation }] },
          ]}
        >
          <Text style={styles.instructionText}>قم بلمس الفقاعات!</Text>
          {bubbles.map((bubble) => (
            <Animated.View
              key={bubble.id}
              style={[
                styles.bubble,
                {
                  top: bubble.top,
                  left: bubble.left,
                  width: bubble.size,
                  height: bubble.size,
                  borderRadius: bubble.size / 2,
                  backgroundColor: bubble.color,
                  // إضافة حركة الطفو
                  transform: [
                    {
                      translateY: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, bubble.id % 2 === 0 ? 10 : -10],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.4}
                onPress={() => handleBubblePress(bubble.id)}
                style={StyleSheet.absoluteFill}
              >
                <View style={styles.bubbleShine} />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      </TouchableWithoutFeedback>

      {/* البار السفلي - الترتيب الدقيق للأيقونات حسب الصورة */}
      <View style={styles.bottomNav}>
        {/* الرئيسية - يسار */}
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconInactive}>🏠</Text>
          <Text style={styles.navTextInactive}>الرئيسية</Text>
        </TouchableOpacity>

        {/* نشاط - منتصف */}
        <TouchableOpacity style={styles.navItem}>
          <View style={styles.activeTabBg}>
            <Text style={styles.navIconActive}>🎮</Text>
            <Text style={styles.navTextActive}>نشاط</Text>
          </View>
        </TouchableOpacity>

        {/* حسابي - يمين */}
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconInactive}>👤</Text>
          <Text style={styles.navTextInactive}>حسابي</Text>
        </TouchableOpacity>
      </View>

      {/* واجهات النجاح والفشل (Modals) */}
      <Modal visible={gameState !== "playing"} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity
              style={styles.closeModal}
              onPress={() => setGameState("playing")}
            >
              <Text style={{ color: "#BBB", fontSize: 20 }}>✕</Text>
            </TouchableOpacity>

            <View
              style={[
                styles.statusCircle,
                {
                  backgroundColor: gameState === "won" ? "#C5E1A5" : "#FF8A80",
                },
              ]}
            >
              <Text style={styles.statusCheck}>
                {gameState === "won" ? "✓" : "✕"}
              </Text>
            </View>

            <Text style={styles.modalTitle}>
              {gameState === "won" ? "عمل رائع !!" : "حاول مرة اخرى!"}
            </Text>
            {gameState === "won" && (
              <Text style={styles.modalSub}>
                عمل رائع، لقد أكملت النشاط بنجاح
              </Text>
            )}

            <TouchableOpacity style={styles.actionBtn} onPress={resetGame}>
              <Text style={styles.actionBtnText}>
                {gameState === "won" ? "النشاط التالي ←" : "إعادة النشاط ←"}
              </Text>
            </TouchableOpacity>

            {gameState === "won" && (
              <TouchableOpacity onPress={resetGame} style={{ marginTop: 15 }}>
                <Text style={{ color: "#AAB" }}>إعادة النشاط ↻</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFFFA" }, // خلفية بيضاء مريحة
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  backArrow: { fontSize: 24, color: "#4CAF50" },
  headerTitles: { alignItems: "flex-end" },
  mainTitle: { fontSize: 20, fontWeight: "bold", color: "#1B5E20" },
  subTitle: { fontSize: 13, color: "#81C784", marginTop: 2 },

  progressSection: { paddingHorizontal: 25, marginTop: 10 },
  progressValue: {
    position: "absolute",
    left: 25,
    top: 0,
    fontSize: 12,
    color: "#999",
    fontWeight: "bold",
  },
  progressLabel: {
    textAlign: "right",
    fontSize: 13,
    color: "#2E7D32",
    fontWeight: "bold",
    marginBottom: 8,
  },
  progressBg: { height: 10, backgroundColor: "#E0E0E0", borderRadius: 5 },
  progressFill: { height: "100%", backgroundColor: "#4CAF50", borderRadius: 5 },

  gameArea: { flex: 1, position: "relative" },
  instructionText: {
    textAlign: "center",
    marginTop: 30,
    fontSize: 18,
    color: "#333",
    fontWeight: "bold",
  },

  bubble: {
    position: "absolute",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  bubbleShine: {
    width: "25%",
    height: "25%",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 10,
    position: "absolute",
    top: "15%",
    left: "20%",
  },

  bottomNav: {
    flexDirection: "row",
    height: 90,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 15,
    elevation: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  navItem: { alignItems: "center", flex: 1 },
  activeTabBg: {
    backgroundColor: "#E8F5E9",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  navIconActive: { fontSize: 20, marginRight: 5 },
  navTextActive: { color: "#4CAF50", fontWeight: "bold", fontSize: 14 },
  navIconInactive: { fontSize: 24, color: "#DDD", marginBottom: 4 },
  navTextInactive: { color: "#DDD", fontSize: 12 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCard: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 35,
    padding: 30,
    alignItems: "center",
  },
  closeModal: { position: "absolute", top: 20, right: 20 },
  statusCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  statusCheck: { fontSize: 50, color: "#FFF", fontWeight: "bold" },
  modalTitle: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  modalSub: {
    fontSize: 15,
    color: "#888",
    textAlign: "center",
    marginBottom: 30,
  },
  actionBtn: {
    width: "100%",
    height: 60,
    backgroundColor: "#CCFF00",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  actionBtnText: { fontSize: 18, fontWeight: "bold", color: "#1B5E20" },
});

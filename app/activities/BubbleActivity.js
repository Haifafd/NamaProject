import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../FirebaseConfig";

const { width } = Dimensions.get("window");

// -----------------------------
// 🔵 فقاعات كل مستوى (نفس اللي أرسلتيها)
// -----------------------------

const LEVEL_BUBBLES = {
  1: [
    // المرحلة 1 – 5 فقاعات
    { id: 1, top: "20%", left: "15%", size: 90, color: "#E1F5FE" },
    { id: 2, top: "25%", left: "55%", size: 100, color: "#B3E5FC" },
    { id: 3, top: "45%", left: "20%", size: 110, color: "#E1F5FE" },
    { id: 4, top: "50%", left: "65%", size: 80, color: "#B3E5FC" },
    { id: 5, top: "65%", left: "35%", size: 95, color: "#E1F5FE" },
  ],
  2: [
    // المرحلة 2 – 8 فقاعات
    { id: 1, top: "15%", left: "10%", size: 55, color: "#E1F5FE" },
    { id: 2, top: "22%", left: "45%", size: 50, color: "#B3E5FC" },
    { id: 3, top: "30%", left: "70%", size: 60, color: "#E1F5FE" },
    { id: 4, top: "40%", left: "20%", size: 48, color: "#B3E5FC" },
    { id: 5, top: "52%", left: "60%", size: 55, color: "#E1F5FE" },
    { id: 6, top: "63%", left: "30%", size: 50, color: "#B3E5FC" },
    { id: 7, top: "72%", left: "75%", size: 58, color: "#E1F5FE" },
    { id: 8, top: "82%", left: "15%", size: 52, color: "#B3E5FC" },
  ],
  3: [
    // المرحلة 3 – 11 فقاعة
    { id: 1, top: "15%", left: "12%", size: 85, color: "#E1F5FE" },
    { id: 2, top: "18%", left: "55%", size: 45, color: "#B3E5FC" },
    { id: 3, top: "25%", left: "30%", size: 70, color: "#E1F5FE" },
    { id: 4, top: "32%", left: "75%", size: 50, color: "#B3E5FC" },
    { id: 5, top: "40%", left: "10%", size: 95, color: "#E1F5FE" },
    { id: 6, top: "48%", left: "50%", size: 55, color: "#B3E5FC" },
    { id: 7, top: "55%", left: "25%", size: 80, color: "#E1F5FE" },
    { id: 8, top: "63%", left: "70%", size: 45, color: "#B3E5FC" },
    { id: 9, top: "72%", left: "15%", size: 60, color: "#E1F5FE" },
    { id: 10, top: "80%", left: "45%", size: 90, color: "#B3E5FC" },
    { id: 11, top: "85%", left: "68%", size: 50, color: "#E1F5FE" },
  ],
};

// -----------------------------
// 🔥 ATPI + Score
// -----------------------------

function calculateAttentionIndex(
  completionRate,
  randomClickRate,
  exitRate,
  avgReactionTime,
) {
  const reactionScore = 1 - Math.min(avgReactionTime / 3000, 1);
  return (
    completionRate * 0.4 +
    (1 - randomClickRate) * 0.3 +
    (1 - exitRate) * 0.2 +
    reactionScore * 0.1
  );
}

function calculateScore(percentage) {
  if (percentage >= 90) return 1;
  if (percentage >= 80) return 2;
  if (percentage >= 70) return 3;
  if (percentage >= 60) return 4;
  return 5;
}

// -----------------------------
// 🔥 BubbleActivity – صفحة واحدة بثلاث مستويات
// -----------------------------

export default function BubbleActivity({ navigation }) {
  const [level, setLevel] = useState(1); // 1 → 2 → 3
  const [bubbles, setBubbles] = useState(LEVEL_BUBBLES[1]);
  const [gameState, setGameState] = useState("playing"); // playing | levelComplete | finished | lost
  const [showReport, setShowReport] = useState(false); // تقرير المستوى الحالي
  const [finalReport, setFinalReport] = useState(false); // تقرير نهائي بعد المستوى 3

  // أنيميشن
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  // إحصائيات
  const startTimeRef = useRef(Date.now());
  const lastClickRef = useRef(Date.now());
  const totalReactionRef = useRef(0);
  const bubbleClicksRef = useRef(0);
  const missClicksRef = useRef(0);
  const totalClicksRef = useRef(0);

  // -----------------------------
  // 🔥 تشغيل الأنيميشن
  // -----------------------------
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shineAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // -----------------------------
  // 🔥 حفظ نتائج كل مستوى
  // -----------------------------
  const saveToFirestore = async (result, poppedCount) => {
    try {
      const duration = (Date.now() - startTimeRef.current) / 1000;

      const total = LEVEL_BUBBLES[level].length;
      const completionRate = total ? poppedCount / total : 0;

      const totalClicks = totalClicksRef.current || 1;
      const randomClickRate = missClicksRef.current / totalClicks;

      const exitRate = result === "lost" && completionRate < 1 ? 1 : 0;

      const avgReactionTime =
        bubbleClicksRef.current > 0
          ? totalReactionRef.current / bubbleClicksRef.current
          : 3000;

      const atpi = calculateAttentionIndex(
        completionRate,
        randomClickRate,
        exitRate,
        avgReactionTime,
      );

      const percentage = completionRate * 100;
      const score = calculateScore(percentage);

      await addDoc(collection(db, "ActivityResults"), {
        activityId: `BubbleLevel${level}`,
        categoryId: "Attention",
        childId: "child_user_01",
        completed: result === "won",
        result,
        createdAt: serverTimestamp(),
        duration: parseFloat(duration.toFixed(1)),
        completionRate: parseFloat(completionRate.toFixed(2)),
        randomClickRate: parseFloat(randomClickRate.toFixed(2)),
        exitRate,
        avgReactionTime: Math.round(avgReactionTime),
        attentionIndex: parseFloat(atpi.toFixed(3)),
        percentage: Math.round(percentage),
        score,
        totalClicks,
        bubbleClicks: bubbleClicksRef.current,
        missClicks: missClicksRef.current,
        bubblesPopped: poppedCount,
      });
    } catch (e) {
      console.error("خطأ في حفظ بيانات نشاط الفقاعات: ", e);
    }
  };

  // -----------------------------
  // 🔥 نهاية المستوى
  // -----------------------------
  const endGame = (state, poppedCount) => {
    if (gameState !== "playing") return;

    saveToFirestore(state, poppedCount);

    if (state === "won") {
      setGameState("levelComplete"); // نعرض شاشة نجاح + تقرير المستوى
      setShowReport(true);
      if (level === 3) {
        setFinalReport(true); // هذا آخر مستوى
      }
    } else {
      setGameState("lost");
    }
  };

  // -----------------------------
  // 🔥 الضغط على فقاعة
  // -----------------------------
  const handleBubblePress = (id) => {
    if (gameState !== "playing") return;

    const now = Date.now();
    totalReactionRef.current += now - lastClickRef.current;
    lastClickRef.current = now;

    bubbleClicksRef.current += 1;
    totalClicksRef.current += 1;

    const newBubbles = bubbles.filter((b) => b.id !== id);
    setBubbles(newBubbles);

    const popped = LEVEL_BUBBLES[level].length - newBubbles.length;

    if (newBubbles.length === 0) {
      endGame("won", popped);
    }
  };

  // -----------------------------
  // 🔥 الضغط خارج الفقاعات
  // -----------------------------
  const handleMissPress = () => {
    if (gameState !== "playing") return;

    missClicksRef.current += 1;
    totalClicksRef.current += 1;

    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start(() => {
      const popped = LEVEL_BUBBLES[level].length - bubbles.length;
      endGame("lost", popped);
    });
  };

  // -----------------------------
  // 🔥 إعادة ضبط إحصائيات المستوى
  // -----------------------------
  const resetStats = () => {
    startTimeRef.current = Date.now();
    lastClickRef.current = Date.now();
    totalReactionRef.current = 0;
    bubbleClicksRef.current = 0;
    missClicksRef.current = 0;
    totalClicksRef.current = 0;
  };

  // -----------------------------
  // 🔥 بدء مستوى جديد (نفس الصفحة)
  // -----------------------------
  const startLevel = (nextLevel) => {
    setLevel(nextLevel);
    setBubbles(LEVEL_BUBBLES[nextLevel]);
    setGameState("playing");
    setShowReport(false);
    resetStats();
  };

  // -----------------------------
  // 🔥 حسابات العرض الحالية
  // -----------------------------
  const poppedCount = LEVEL_BUBBLES[level].length - bubbles.length;
  const completionRate = LEVEL_BUBBLES[level].length
    ? poppedCount / LEVEL_BUBBLES[level].length
    : 0;
  const progressPercent = Math.round(completionRate * 100);

  const randomClickRate = missClicksRef.current / (totalClicksRef.current || 1);
  const avgReactionTime =
    bubbleClicksRef.current > 0
      ? totalReactionRef.current / bubbleClicksRef.current
      : 3000;

  const atpi = calculateAttentionIndex(
    completionRate,
    randomClickRate,
    gameState === "lost" ? 1 : 0,
    avgReactionTime,
  );

  const percentage = completionRate * 100;
  const score = calculateScore(percentage);

  // -----------------------------
  // 🔥 واجهة اللعب (المستويات الثلاثة)
  // -----------------------------
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ImageBackground
        source={require("../../assets/images/wallper.png")}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      >
        <View style={styles.overlayLayer} />
      </ImageBackground>

      <SafeAreaView style={{ flex: 1 }}>
        {/* شاشة اللعب الأساسية */}
        {gameState === "playing" && !showReport && (
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <View style={styles.topRow}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => navigation?.goBack()}
                >
                  <Ionicons name="arrow-back" size={24} color="#10B981" />
                </TouchableOpacity>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.mainTitle}>نشاط الفقاعات</Text>
                  <Text style={styles.levelText}>
                    المرحلة {level} . مهارة الانتباه
                  </Text>
                </View>
              </View>

              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>
                  مستوى الإنجاز {progressPercent}%
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

            <TouchableWithoutFeedback onPress={handleMissPress}>
              <Animated.View
                style={[
                  styles.gameArea,
                  { transform: [{ translateX: shakeAnim }] },
                ]}
              >
                <Text style={styles.instruction}>قم بلمس الفقاعات!</Text>

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
                        transform: [
                          {
                            translateY: floatAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [
                                0,
                                bubble.id % 2 === 0
                                  ? 10 + level * 2
                                  : -10 - level * 2,
                              ],
                            }),
                          },
                          {
                            translateX: bounceAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [
                                0,
                                bubble.id % 2 === 0
                                  ? 6 + level * 2
                                  : -6 - level * 2,
                              ],
                            }),
                          },
                          {
                            scale: shineAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.05 + level * 0.02],
                            }),
                          },
                        ],
                      },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.bubbleShine,
                        {
                          opacity: shineAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.4, 0.9],
                          }),
                          transform: [
                            {
                              translateX: shineAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 6 + level * 2],
                              }),
                            },
                            {
                              translateY: shineAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, -6 - level * 2],
                              }),
                            },
                          ],
                        },
                      ]}
                    />
                    <TouchableOpacity
                      activeOpacity={0.6}
                      style={StyleSheet.absoluteFill}
                      onPress={() => handleBubblePress(bubble.id)}
                    />
                  </Animated.View>
                ))}
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        )}
        {/* شاشة النجاح / الخسارة */}
        {gameState !== "playing" && !showReport && (
          <View style={styles.centerBox}>
            <Text style={{ fontSize: 100 }}>
              {gameState === "lost" ? "☹️" : "🎉"}
            </Text>

            <Text style={styles.congratsTitle}>
              {gameState === "lost" ? "حاول مرة أخرى" : "أحسنت!"}
            </Text>

            {gameState === "lost" ? (
              <TouchableOpacity
                style={styles.mainBtn}
                onPress={() => startLevel(level)}
              >
                <Text style={styles.btnText}>إعادة المحاولة 🔄</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.mainBtn}
                onPress={() => setShowReport(true)}
              >
                <Text style={styles.btnText}>عرض نتائج الأداء 📊</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* شاشة تقرير المستوى */}
        {showReport && !finalReport && (
          <ScrollView contentContainerStyle={styles.reportContent}>
            <Text style={styles.reportTitle}>تقرير المرحلة {level}</Text>

            <View style={styles.indicesRow}>
              <View style={styles.indexBox}>
                <Text style={styles.indexValue}>{Math.round(atpi * 100)}%</Text>
                <Text style={styles.indexLabel}>مؤشر الانتباه ATPI</Text>
              </View>

              <View style={[styles.indexBox, { borderBottomColor: "#3498DB" }]}>
                <Text style={[styles.indexValue, { color: "#3498DB" }]}>
                  {Math.round(avgReactionTime)}ms
                </Text>
                <Text style={styles.indexLabel}>سرعة الاستجابة</Text>
              </View>
            </View>

            <View style={styles.indicesRow}>
              <View style={[styles.indexBox, { borderBottomColor: "#F97316" }]}>
                <Text style={[styles.indexValue, { color: "#F97316" }]}>
                  {Math.round(percentage)}%
                </Text>
                <Text style={styles.indexLabel}>نسبة إكمال النشاط</Text>
              </View>

              <View style={[styles.indexBox, { borderBottomColor: "#6366F1" }]}>
                <Text style={[styles.indexValue, { color: "#6366F1" }]}>
                  {score}
                </Text>
                <Text style={styles.indexLabel}>الدرجة العامة 1–5</Text>
              </View>
            </View>

            {/* زر الانتقال للمستوى التالي */}
            {level < 3 && (
              <TouchableOpacity
                style={styles.mainBtn}
                onPress={() => startLevel(level + 1)}
              >
                <Text style={styles.btnText}>الانتقال للمرحلة التالية ⬆️</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {/* شاشة التقرير النهائي بعد المرحلة 3 */}
        {showReport && finalReport && (
          <ScrollView contentContainerStyle={styles.reportContent}>
            <Text style={styles.reportTitle}>التقرير النهائي للنشاط</Text>

            <View style={styles.indicesRow}>
              <View style={styles.indexBox}>
                <Text style={styles.indexValue}>{Math.round(atpi * 100)}%</Text>
                <Text style={styles.indexLabel}>مؤشر الانتباه ATPI</Text>
              </View>

              <View style={[styles.indexBox, { borderBottomColor: "#3498DB" }]}>
                <Text style={[styles.indexValue, { color: "#3498DB" }]}>
                  {Math.round(avgReactionTime)}ms
                </Text>
                <Text style={styles.indexLabel}>سرعة الاستجابة</Text>
              </View>
            </View>

            <View style={styles.indicesRow}>
              <View style={[styles.indexBox, { borderBottomColor: "#F97316" }]}>
                <Text style={[styles.indexValue, { color: "#F97316" }]}>
                  {Math.round(percentage)}%
                </Text>
                <Text style={styles.indexLabel}>نسبة إكمال النشاط</Text>
              </View>

              <View style={[styles.indexBox, { borderBottomColor: "#6366F1" }]}>
                <Text style={[styles.indexValue, { color: "#6366F1" }]}>
                  {score}
                </Text>
                <Text style={styles.indexLabel}>الدرجة العامة 1–5</Text>
              </View>
            </View>

            {/* زر العودة لصفحة Activities */}
            <TouchableOpacity
              style={styles.mainBtn}
              onPress={() => navigation.navigate("Activities")}
            >
              <Text style={styles.btnText}>العودة للأنشطة 🏠</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },

  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.85)",
  },

  header: { padding: 20, paddingTop: Platform.OS === "ios" ? 10 : 30 },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  backBtn: {
    backgroundColor: "#FFF",
    padding: 8,
    borderRadius: 12,
    elevation: 3,
  },

  mainTitle: { fontSize: 18, fontWeight: "bold", color: "#1E293B" },

  levelText: { color: "#10B981", fontWeight: "bold", fontSize: 12 },

  progressSection: { marginTop: 15 },

  progressLabel: {
    textAlign: "right",
    fontSize: 11,
    marginBottom: 4,
    color: "#64748B",
  },

  progressTrack: {
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },

  progressFill: { height: "100%", backgroundColor: "#10B981" },

  gameArea: { flex: 1, position: "relative", paddingBottom: 40 },

  instruction: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 18,
    fontWeight: "bold",
    color: "#1E293B",
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
    width: "30%",
    height: "30%",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 999,
    position: "absolute",
    top: "15%",
    left: "20%",
  },

  centerBox: { flex: 1, justifyContent: "center", alignItems: "center" },

  congratsTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#10B981",
    marginVertical: 20,
  },

  mainBtn: {
    backgroundColor: "#10B981",
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 15,
    marginTop: 10,
  },

  btnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },

  reportContent: {
    padding: 25,
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 100,
  },

  reportTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 30 },

  indicesRow: { flexDirection: "row", gap: 12, marginBottom: 25 },

  indexBox: {
    width: width * 0.42,
    padding: 15,
    backgroundColor: "#FFF",
    borderRadius: 20,
    alignItems: "center",
    elevation: 5,
    borderBottomWidth: 6,
    borderBottomColor: "#10B981",
  },

  indexValue: { fontSize: 24, fontWeight: "bold", color: "#10B981" },

  indexLabel: { fontSize: 11, color: "#64748B", textAlign: "center" },
});

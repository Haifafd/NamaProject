import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
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

// قائمة فواكه
const fruitsData = [
  { id: 1, uri: "https://cdn-icons-png.flaticon.com/512/415/415733.png" },
  { id: 2, uri: "https://cdn-icons-png.flaticon.com/512/2909/2909761.png" },
  { id: 3, uri: "https://cdn-icons-png.flaticon.com/512/1728/1728765.png" },
  { id: 4, uri: "https://cdn-icons-png.flaticon.com/512/599/599502.png" },
  { id: 5, uri: "https://cdn-icons-png.flaticon.com/512/2153/2153788.png" },
  { id: 6, uri: "https://cdn-icons-png.flaticon.com/512/3137/3137044.png" },
  { id: 7, uri: "https://cdn-icons-png.flaticon.com/512/2106/2106111.png" },
  { id: 8, uri: "https://cdn-icons-png.flaticon.com/512/2224/2224115.png" },
];

// عدد الجولات
const TOTAL_ROUNDS = 5;

// معادلة WMI
function calculateMemoryIndex(accuracy, hintUsageRate, improvementRate) {
  return accuracy * 0.5 + (1 - hintUsageRate) * 0.3 + improvementRate * 0.2;
}

// score
function calculateScore(percentage) {
  if (percentage >= 90) return 1;
  if (percentage >= 80) return 2;
  if (percentage >= 70) return 3;
  if (percentage >= 60) return 4;
  return 5;
}

export default function DifferentShapeActivity({ navigation }) {
  const [level, setLevel] = useState(1); // 1 → 4 مربعات، 2 → 6 مربعات، 3 → 8 مربعات
  const [gameState, setGameState] = useState("playing");
  const [showReport, setShowReport] = useState(false);
  const [gameItems, setGameItems] = useState([]);
  const [round, setRound] = useState(1);
  const [showHint, setShowHint] = useState(false);

  // إحصائيات
  const correctRef = useRef(0);
  const hintsRef = useRef(0);
  const firstHalfCorrectRef = useRef(0);
  const secondHalfCorrectRef = useRef(0);

  const startTimeRef = useRef(Date.now());

  // عدد المربعات حسب المستوى
  const squaresByLevel = {
    1: 4,
    2: 6,
    3: 8,
  };

  const generateLevel = useCallback(() => {
    const squares = squaresByLevel[level];

    const mainFruit = fruitsData[Math.floor(Math.random() * fruitsData.length)];
    let diffFruit;

    do {
      diffFruit = fruitsData[Math.floor(Math.random() * fruitsData.length)];
    } while (diffFruit.id === mainFruit.id);

    if (!mainFruit?.uri || !diffFruit?.uri) return generateLevel();

    const items = [];

    for (let i = 0; i < squares - 1; i++) {
      items.push({ uri: mainFruit.uri, isCorrect: false });
    }

    items.push({ uri: diffFruit.uri, isCorrect: true });

    const shuffled = items.sort(() => Math.random() - 0.5);
    setGameItems(shuffled);
    setShowHint(false);
  }, [level]);

  const resetStats = () => {
    correctRef.current = 0;
    hintsRef.current = 0;
    firstHalfCorrectRef.current = 0;
    secondHalfCorrectRef.current = 0;
    startTimeRef.current = Date.now();
  };

  const resetAll = () => {
    setRound(1);
    setGameState("playing");
    setShowReport(false);
    resetStats();
    generateLevel();
  };

  useEffect(() => {
    resetAll();
  }, [generateLevel]);

  const handleChoice = (isCorrect) => {
    if (isCorrect) {
      correctRef.current += 1;

      const half = Math.floor(TOTAL_ROUNDS / 2);
      if (round <= half) firstHalfCorrectRef.current += 1;
      else secondHalfCorrectRef.current += 1;
    }

    if (round >= TOTAL_ROUNDS) {
      endGame();
    } else {
      setRound((prev) => prev + 1);
      generateLevel();
    }
  };

  const handleHint = () => {
    setShowHint(true);
    hintsRef.current += 1;
  };

  const saveResult = async (wmi, percentage, score, duration) => {
    try {
      await addDoc(collection(db, "ActivityResults"), {
        activityId: `DifferentShapeActivity_Level_${level}`,
        categoryId: "WorkingMemory",
        childId: "child_user_01",
        completed: true,
        result: "finished",
        createdAt: serverTimestamp(),
        duration: parseFloat(duration.toFixed(1)),
        accuracy: correctRef.current / TOTAL_ROUNDS,
        hintUsageRate: hintsRef.current / TOTAL_ROUNDS,
        improvementRate:
          (secondHalfCorrectRef.current - firstHalfCorrectRef.current) /
          (TOTAL_ROUNDS / 2),
        workingMemoryIndex: parseFloat(wmi.toFixed(3)),
        percentage: Math.round(percentage),
        score,
        totalRounds: TOTAL_ROUNDS,
        correctRounds: correctRef.current,
        hintsUsed: hintsRef.current,
      });
    } catch (e) {
      console.error("خطأ في حفظ بيانات اللعبة:", e);
    }
  };

  const endGame = async () => {
    const duration = (Date.now() - startTimeRef.current) / 1000;

    const accuracy = correctRef.current / TOTAL_ROUNDS;
    const hintUsageRate = hintsRef.current / TOTAL_ROUNDS;

    const half = Math.floor(TOTAL_ROUNDS / 2);
    const firstAcc = firstHalfCorrectRef.current / half;
    const secondAcc = secondHalfCorrectRef.current / half;

    let improvementRate = secondAcc - firstAcc;
    if (improvementRate < 0) improvementRate = 0;
    if (improvementRate > 1) improvementRate = 1;

    const wmi = calculateMemoryIndex(accuracy, hintUsageRate, improvementRate);
    const percentage = accuracy * 100;
    const score = calculateScore(percentage);

    await saveResult(wmi, percentage, score, duration);

    // شاشة النجاح بين المستويات
    if (level < 3) {
      setGameState("levelComplete");
    } else {
      setGameState("finished");
      setShowReport(true);
    }
  };

  const progressPercent = Math.round(((round - 1) / TOTAL_ROUNDS) * 100);

  // حسابات التقرير
  const accuracy = correctRef.current / TOTAL_ROUNDS;
  const hintUsageRate = hintsRef.current / TOTAL_ROUNDS;

  const half = Math.floor(TOTAL_ROUNDS / 2);
  const firstAcc = firstHalfCorrectRef.current / half;
  const secondAcc = secondHalfCorrectRef.current / half;

  let improvementRate = secondAcc - firstAcc;
  if (improvementRate < 0) improvementRate = 0;
  if (improvementRate > 1) improvementRate = 1;

  const wmi = calculateMemoryIndex(accuracy, hintUsageRate, improvementRate);
  const percentage = accuracy * 100;
  const score = calculateScore(percentage);

  // تقسيم الشبكة حسب المستوى
  const rows =
    level === 1
      ? [gameItems.slice(0, 2), gameItems.slice(2, 4)]
      : level === 2
        ? [gameItems.slice(0, 3), gameItems.slice(3, 6)]
        : [gameItems.slice(0, 4), gameItems.slice(4, 8)];

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
        {/* شاشة اللعب */}
        {gameState === "playing" && !showReport && (
          <TouchableWithoutFeedback>
            <View style={{ flex: 1 }}>
              {/* الهيدر */}
              <View style={styles.header}>
                <View style={styles.topRow}>
                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation?.goBack?.()}
                  >
                    <Ionicons name="arrow-back" size={24} color="#10B981" />
                  </TouchableOpacity>

                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.mainTitle}>
                      إيجاد الشكل المختلف – المستوى {level}
                    </Text>
                    <Text style={styles.levelText}>
                      مهارة الذاكرة – {squaresByLevel[level]} مربعات
                    </Text>
                  </View>
                </View>

                {/* شريط التقدم */}
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

              {/* السؤال */}
              <View style={styles.questionContainer}>
                <Text style={styles.questionTitle}>أين الشكل المختلف؟</Text>
                <Text style={styles.questionSub}>
                  اختر الفاكهة المختلفة من بين الفواكه الظاهرة
                </Text>

                <TouchableOpacity style={styles.hintBtn} onPress={handleHint}>
                  <Text style={styles.hintText}>أحتاج تلميح 💡</Text>
                </TouchableOpacity>
              </View>

              {/* الشبكة */}
              <View style={styles.gridContainer}>
                {rows.map((row, rowIndex) => (
                  <View key={rowIndex} style={styles.row}>
                    {row.map((item, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.imageCard,
                          showHint && item.isCorrect && styles.hintHighlight,
                        ]}
                        onPress={() => handleChoice(item.isCorrect)}
                      >
                        <Image
                          source={{ uri: item.uri }}
                          style={styles.gameImg}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}

        {/* شاشة النجاح بين المستويات */}
        {gameState === "levelComplete" && (
          <View style={styles.centerBox}>
            <Text style={{ fontSize: 90 }}>🎉</Text>
            <Text style={styles.congratsTitle}>أحسنت!</Text>

            <Text style={{ fontSize: 18, marginBottom: 20, color: "#1E293B" }}>
              ننتقل الآن للمستوى التالي
            </Text>

            <TouchableOpacity
              style={styles.mainBtn}
              onPress={() => {
                setLevel((prev) => prev + 1);
                resetAll();
              }}
            >
              <Text style={styles.btnText}>الانتقال للمستوى التالي ⬆️</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* شاشة التقرير النهائي */}
        {showReport && (
          <ScrollView contentContainerStyle={styles.reportContent}>
            <Text style={styles.reportTitle}>التقرير النهائي</Text>

            <View style={styles.indicesRow}>
              <View style={styles.indexBox}>
                <Text style={styles.indexValue}>{Math.round(wmi * 100)}%</Text>
                <Text style={styles.indexLabel}>مؤشر الذاكرة WMI</Text>
              </View>

              <View style={[styles.indexBox, { borderBottomColor: "#F97316" }]}>
                <Text style={[styles.indexValue, { color: "#F97316" }]}>
                  {Math.round(percentage)}%
                </Text>
                <Text style={styles.indexLabel}>دقة الإجابات</Text>
              </View>
            </View>

            <View style={styles.indicesRow}>
              <View style={[styles.indexBox, { borderBottomColor: "#6366F1" }]}>
                <Text style={[styles.indexValue, { color: "#6366F1" }]}>
                  {score}
                </Text>
                <Text style={styles.indexLabel}>الدرجة العامة</Text>
              </View>

              <View style={[styles.indexBox, { borderBottomColor: "#22C55E" }]}>
                <Text style={[styles.indexValue, { color: "#22C55E" }]}>
                  {Math.round(hintUsageRate * 100)}%
                </Text>
                <Text style={styles.indexLabel}>معدل استخدام التلميحات</Text>
              </View>
            </View>

            <View style={styles.indicesRow}>
              <View style={[styles.indexBox, { borderBottomColor: "#0EA5E9" }]}>
                <Text style={[styles.indexValue, { color: "#0EA5E9" }]}>
                  {Math.round(improvementRate * 100)}%
                </Text>
                <Text style={styles.indexLabel}>معدل التحسن</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.mainBtn}
              onPress={() => {
                setLevel(1);
                resetAll();
              }}
            >
              <Text style={styles.btnText}>إعادة النشاط من جديد 🔄</Text>
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

  questionContainer: {
    alignItems: "center",
    marginTop: 25,
    paddingHorizontal: 30,
  },
  questionTitle: { fontSize: 22, fontWeight: "bold", color: "#1E293B" },
  questionSub: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
  },

  hintBtn: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E0F2FE",
  },
  hintText: { color: "#0369A1", fontWeight: "bold", fontSize: 13 },

  gridContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 18,
  },

  imageCard: {
    width: width * 0.28,
    aspectRatio: 1,
    backgroundColor: "#FFF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  hintHighlight: { borderWidth: 3, borderColor: "#FACC15" },

  gameImg: { width: "70%", height: "70%", resizeMode: "contain" },

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
  btnText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
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
    marginBottom: 30,
  },

  indicesRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 25,
  },

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

  indexValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10B981",
  },

  indexLabel: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
  },
});

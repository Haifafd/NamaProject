 import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const CUP_COUNT = 3;

function calculateProblemSolvingIndex(winRate, strategyScore, hintUsageRate, speedScore) {
  const value =
    winRate * 0.5 +
    strategyScore * 0.3 +
    (1 - hintUsageRate) * 0.2 +
    speedScore * 0.1;
  return Math.max(0, Math.min(1, value));
}

function calculateAttentionIndex(completionRate, randomClickRate, exitRate, avgReactionTime) {
  const reactionScore = 1 - Math.min(avgReactionTime / 3000, 1);
  const value =
    completionRate * 0.4 +
    (1 - randomClickRate) * 0.3 +
    (1 - exitRate) * 0.2 +
    reactionScore * 0.1;
  return Math.max(0, Math.min(1, value));
}

export default function FindBallGame() {

  const router = useRouter();
  const [gameStarted, setGameStarted] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [ballLogicalIndex, setBallLogicalIndex] = useState(1);
  const [revealedPhysicalIndex, setRevealedPhysicalIndex] = useState(null);
  const [message, setMessage] = useState("الكرة تحت الكوب الأوسط. اضغط على زر البدء لتبدأ اللعبة.");
  const [progress, setProgress] = useState(0);
  const [showPerformance, setShowPerformance] = useState(false);
  const [performanceData, setPerformanceData] = useState({
    attempts: 0,
    correct: 0,
    wrong: 0,
    reactionTime: 0,
    psi: 0,
    atpi: 0,
    finalScore: 0,
  });

  const physicalXPositions = useRef(
    Array.from({ length: CUP_COUNT }).map(
      (_, i) => i * 100 - (CUP_COUNT - 1) * 50
    )
  ).current;

  const cupAnimations = useRef(
    Array.from({ length: CUP_COUNT }, (_, i) => ({
      x: new Animated.Value(physicalXPositions[i]),
      y: new Animated.Value(0),
      zIndex: new Animated.Value(1),
    }))
  ).current;

  const physicalSlotToLogicalCup = useRef(
    Array.from({ length: CUP_COUNT }, (_, i) => i)
  ).current;

  const attemptsRef = useRef(0);
  const correctRef = useRef(0);
  const wrongRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const firstReactionRef = useRef(null);
  const gameFinishedRef = useRef(false);

  const resetToStartState = () => {
    setGameStarted(false);
    setIsShuffling(false);
    setRevealedPhysicalIndex(null);
    setProgress(0);
    setMessage("الكرة تحت الكوب الأوسط. اضغط على زر البدء لتبدأ اللعبة.");
    setBallLogicalIndex(1);
    setShowPerformance(false);

    attemptsRef.current = 0;
    correctRef.current = 0;
    wrongRef.current = 0;
    startTimeRef.current = Date.now();
    firstReactionRef.current = null;
    gameFinishedRef.current = false;

    physicalSlotToLogicalCup.splice(
      0,
      CUP_COUNT,
      ...Array.from({ length: CUP_COUNT }, (_, i) => i)
    );

    cupAnimations.forEach((cup, index) => {
      cup.x.setValue(physicalXPositions[index]);
      cup.y.setValue(index === 1 ? -60 : 0);
      cup.zIndex.setValue(1);
    });
  };

  useEffect(() => {
    resetToStartState();
  }, []);

  const dropCups = () => {
    const animations = cupAnimations.map((cup) =>
      Animated.timing(cup.y, {
        toValue: 0,
        duration: 600,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      })
    );
    return Animated.parallel(animations);
  };

  const liftSingleCup = (logicalCupIndex) => {
    return Animated.timing(cupAnimations[logicalCupIndex].y, {
      toValue: -60,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
  };

  const startShuffle = async () => {
    setIsShuffling(true);
    setMessage("ركّز جيدًا على حركة الأكواب...");

    const shuffleDuration = 900;
    const arcHeight = -40;
    const swaps = [
      [1, 2],
      [2, 1],
      [1, 0],
    ];

    for (let i = 0; i < swaps.length; i++) {
      const [physicalSlotA, physicalSlotB] = swaps[i];
      const logicalCupA = physicalSlotToLogicalCup[physicalSlotA];
      const logicalCupB = physicalSlotToLogicalCup[physicalSlotB];

      cupAnimations[logicalCupA].zIndex.setValue(2);
      cupAnimations[logicalCupB].zIndex.setValue(2);

      await new Promise((resolve) => {
        Animated.parallel([
          Animated.sequence([
            Animated.timing(cupAnimations[logicalCupA].y, {
              toValue: arcHeight,
              duration: shuffleDuration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(cupAnimations[logicalCupA].x, {
              toValue: physicalXPositions[physicalSlotB],
              duration: shuffleDuration,
              useNativeDriver: true,
            }),
            Animated.timing(cupAnimations[logicalCupA].y, {
              toValue: 0,
              duration: shuffleDuration / 2,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(cupAnimations[logicalCupB].y, {
              toValue: arcHeight,
              duration: shuffleDuration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(cupAnimations[logicalCupB].x, {
              toValue: physicalXPositions[physicalSlotA],
              duration: shuffleDuration,
              useNativeDriver: true,
            }),
            Animated.timing(cupAnimations[logicalCupB].y, {
              toValue: 0,
              duration: shuffleDuration / 2,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          cupAnimations[logicalCupA].zIndex.setValue(1);
          cupAnimations[logicalCupB].zIndex.setValue(1);
          resolve(null);
        });
      });

      [physicalSlotToLogicalCup[physicalSlotA], physicalSlotToLogicalCup[physicalSlotB]] = [
        physicalSlotToLogicalCup[physicalSlotB],
        physicalSlotToLogicalCup[physicalSlotA],
      ];

      await new Promise((r) => setTimeout(r, 400));
    }

    setIsShuffling(false);
    setMessage("أين الكرة الآن؟ اختر الكوب الصحيح.");
  };

  const finishAndShowPerformance = () => {
    if (gameFinishedRef.current) return;
    gameFinishedRef.current = true;

    const endTime = Date.now();
    const elapsedSeconds = (endTime - startTimeRef.current) / 1000;
    const attempts = attemptsRef.current;
    const correct = correctRef.current;
    const wrong = wrongRef.current;

    const winRate = attempts > 0 ? correct / attempts : 0;
    const completionRate = 1;
    const randomClickRate = attempts > 0 ? wrong / attempts : 0;
    const exitRate = 0;
    const strategyScore = 1;
    const speedScore = Math.max(0, Math.min(1, 1 - elapsedSeconds / 30));
    const avgReactionTime = firstReactionRef.current || 1800;

    const psi = calculateProblemSolvingIndex(winRate, strategyScore, 0, speedScore);
    const atpi = calculateAttentionIndex(completionRate, randomClickRate, exitRate, avgReactionTime);
    const finalScore = Math.max(0, Math.min(100, ((psi + atpi) / 2) * 100));

    setPerformanceData({
      attempts,
      correct,
      wrong,
      reactionTime: Math.round(avgReactionTime),
      psi: Math.round(psi * 100),
      atpi: Math.round(atpi * 100),
      finalScore: Math.round(finalScore),
    });

    Alert.alert("تقييم الأداء", "هل تريد عرض تقييم الأداء؟", [
      { text: "لا", style: "cancel" },
      { text: "نعم", onPress: () => setShowPerformance(true) },
    ]);
  };

  const handleStartGame = async () => {
    if (isShuffling) return;

    setGameStarted(true);
    setMessage("ستنزل الأكواب الآن... استعد!");

    await new Promise((resolve) => {
      dropCups().start(resolve);
    });

    await new Promise((resolve) => setTimeout(resolve, 800));
    startShuffle();
  };

  const handleCupPress = (pressedPhysicalSlotIndex) => {
    if (!gameStarted || isShuffling || revealedPhysicalIndex !== null) return;

    const pressTime = Date.now();
    if (!firstReactionRef.current) {
      firstReactionRef.current = pressTime - startTimeRef.current;
    }

    attemptsRef.current += 1;

    const chosenLogicalCup = physicalSlotToLogicalCup[pressedPhysicalSlotIndex];
    setRevealedPhysicalIndex(pressedPhysicalSlotIndex);
    liftSingleCup(chosenLogicalCup).start();

    const currentBallPhysicalSlot = physicalSlotToLogicalCup.indexOf(ballLogicalIndex);

    if (pressedPhysicalSlotIndex === currentBallPhysicalSlot) {
      correctRef.current += 1;
      setMessage("🎉 رائع! إجابة صحيحة.");
      setProgress(100);
      finishAndShowPerformance();
    } else {
      wrongRef.current += 1;
      setMessage("❌ خطأ، الكرة ليست هنا. حاول مرة أخرى.");
      setProgress(0);
      setTimeout(() => {
        setRevealedPhysicalIndex(null);
      }, 500);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/background.png")}
        style={styles.background}
        resizeMode="cover"
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2ecc71" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>لعبة إيجاد الكرة</Text>
          <Text style={styles.level}>مستوى 1 - مهارة المعرفة</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.percent}>{progress}%</Text>
        <Text style={styles.progressText}>مستوى التقدم</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.mainText}>أين الكرة؟</Text>
        <Text style={styles.subText}>{message}</Text>
      </View>

      <View style={styles.gameArea}>
        <Animated.View
          style={[
            styles.ballContainer,
            {
              transform: [{ translateX: cupAnimations[ballLogicalIndex].x }],
              opacity:
                !gameStarted ||
                (revealedPhysicalIndex !== null &&
                  physicalSlotToLogicalCup[revealedPhysicalIndex] === ballLogicalIndex)
                  ? 1
                  : 0,
              zIndex: 0,
            },
          ]}
        >
          <View style={styles.ball} />
        </Animated.View>

        <View style={styles.cupsContainer}>
          {Array.from({ length: CUP_COUNT }).map((_, logicalCupIndex) => (
            <Animated.View
              key={logicalCupIndex}
              style={[
                styles.cupWrapper,
                {
                  transform: [
                    { translateX: cupAnimations[logicalCupIndex].x },
                    { translateY: cupAnimations[logicalCupIndex].y },
                  ],
                  zIndex: cupAnimations[logicalCupIndex].zIndex,
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => handleCupPress(physicalSlotToLogicalCup.indexOf(logicalCupIndex))}
                disabled={isShuffling || revealedPhysicalIndex !== null || !gameStarted}
              >
                <Image
                  source={require("../../assets/images/red-cup.png")}
                  style={styles.cupImage}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={gameStarted ? resetToStartState : handleStartGame}
        disabled={isShuffling}
      >
        <Text style={styles.startButtonText}>{gameStarted ? "إعادة اللعب" : "البدء"}</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="home-outline" size={22} />
          <Text>الرئيسية</Text>
        </View>
        <View style={styles.footerItemActive}>
          <Ionicons name="game-controller" size={22} color="white" />
          <Text style={{ color: "white" }}>نشاط</Text>
        </View>
        <TouchableOpacity 
           style={styles.footerItem}
          onPress={() => router.push("/parent/homepageP")}
        >
          <Ionicons name="person-outline" size={22} />
          <Text>حسابي</Text>
        </TouchableOpacity>

      </View>

      <Modal visible={showPerformance} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📊 Dashboard الأداء</Text>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>عدد الألعاب:</Text>
              <Text style={styles.statValue}>1</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>زمن الاستجابة:</Text>
              <Text style={styles.statValue}>{performanceData.reactionTime} مللي ثانية</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>مؤشر حل المشكلات PSI:</Text>
              <Text style={styles.statValue}>{performanceData.psi}%</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>مؤشر الانتباه ATPI:</Text>
              <Text style={styles.statValue}>{performanceData.atpi}%</Text>
            </View>

            <Text style={styles.finalText}>
              {performanceData.finalScore >= 85
                ? "ممتاز"
                : performanceData.finalScore >= 65
                ? "جيد"
                : performanceData.finalScore >= 45
                ? "مقبول"
                : "بحاجة لتحسين"}
            </Text>

            <View style={styles.performanceBar}>
              <View
                style={[
                  styles.performanceFill,
                  { width: `${performanceData.finalScore}%` },
                ]}
              />
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowPerformance(false)}
            >
              <Text style={styles.closeBtnText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E9F6FF" },
  background: { position: "absolute", width: "100%", height: "100%" },
  header: { flexDirection: "row", alignItems: "center", marginTop: 60, paddingHorizontal: 20, gap: 10 },
  backBtn: { backgroundColor: "#eafaf1", padding: 10, borderRadius: 50 },
  title: { fontSize: 18, fontWeight: "bold" },
  level: { color: "#2ecc71", fontSize: 12 },
  progressSection: { paddingHorizontal: 20, marginTop: 20 },
  percent: { fontWeight: "bold" },
  progressText: { alignSelf: "flex-end", marginBottom: 5 },
  progressBar: { height: 10, backgroundColor: "#ddd", borderRadius: 10 },
  progressFill: { height: "100%", backgroundColor: "#2ecc71", borderRadius: 10 },
  instructions: { alignItems: "center", marginTop: 20, paddingHorizontal: 20 },
  mainText: { fontWeight: "bold", fontSize: 18, marginBottom: 8 },
  subText: { fontSize: 14, textAlign: "center" },
  gameArea: { marginTop: 80, alignItems: "center", height: 180, justifyContent: "center" },
  ballContainer: { position: "absolute", width: 80, height: 80, alignItems: "center", justifyContent: "center", bottom: 20 },
  ball: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#ffeb3b", borderWidth: 3, borderColor: "#f39c12" },
  cupsContainer: { width: 260, height: 120, position: "relative", alignItems: "center", justifyContent: "center" },
  cupWrapper: { position: "absolute", alignItems: "center" },
  cupImage: { width: 90, height: 110, resizeMode: "contain" },
  startButton: { marginTop: 40, alignSelf: "center", backgroundColor: "#2ecc71", paddingHorizontal: 50, paddingVertical: 14, borderRadius: 30 },
  startButtonText: { color: "white", fontWeight: "bold", fontSize: 18 },
  footer: { position: "absolute", bottom: 20, width: "90%", alignSelf: "center", backgroundColor: "white", borderRadius: 20, flexDirection: "row", justifyContent: "space-around", padding: 15 },
  footerItem: { alignItems: "center" },
  footerItemActive: { backgroundColor: "#2ecc71", padding: 10, borderRadius: 15, alignItems: "center" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 28,
    paddingVertical: 24,
    paddingHorizontal: 20,
    elevation: 8,
  },
  modalTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#2ecc71",
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 15,
    color: "#444",
    textAlign: "right",
  },
  statValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#222",
  },
  finalText: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#2ecc71",
    marginTop: 14,
    marginBottom: 12,
  },
  performanceBar: {
    height: 12,
    width: "100%",
    backgroundColor: "#e5e5e5",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 18,
  },
  performanceFill: {
    height: "100%",
    backgroundColor: "#2ecc71",
    borderRadius: 10,
  },
  closeBtn: {
    backgroundColor: "#2ecc71",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
    width: "40%",
    alignSelf: "center",
  },
  closeBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});


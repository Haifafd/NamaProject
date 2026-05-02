import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// استدعاء الفايربيس والثيم الموحد
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";
import { AppLayout, BORDER, CARD, MUTED, PRIMARY } from "./ActivityStyle";
import ResultModal from "./Result";

const CUP_COUNT = 3;

// دالة حساب مؤشر الانتباه (Attention Index)
function calculateAttentionIndex(completionRate, randomClickRate, exitRate, avgReactionTime) {
  const reactionScore = 1 - Math.min(avgReactionTime / 3000, 1); 
  return (
    (completionRate * 0.4) +
    ((1 - randomClickRate) * 0.3) +
    ((1 - exitRate) * 0.2) +
    (reactionScore * 0.1)
  );
}

export default function FindBallGame({ navigation, route }) {
  // معرف النشاط الافتراضي لهذه اللعبة في قاعدة البيانات
  const activityId = route?.params?.activityId || "find_the_ball_id_123"; 

  const [gameStarted, setGameStarted] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [ballLogicalIndex, setBallLogicalIndex] = useState(1);
  const [revealedPhysicalIndex, setRevealedPhysicalIndex] = useState(null);
  const [message, setMessage] = useState("الكرة تحت الكوب الأوسط. اضغط على زر البدء لتبدأ اللعبة.");
  const [progress, setProgress] = useState(0);
  const [gameState, setGameState] = useState("playing"); 

  const shuffleEndTime = useRef(null);
  const totalClicks = useRef(0);
  const wrongClicks = useRef(0);
  const reactionTimes = useRef([]);

  const physicalXPositions = useRef([ -100, 0, 100 ]).current;
  const cupAnimations = useRef(Array.from({ length: CUP_COUNT }, (_, i) => ({
    x: new Animated.Value(physicalXPositions[i]),
    y: new Animated.Value(0),
    zIndex: new Animated.Value(1),
  }))).current;

  const physicalSlotToLogicalCup = useRef([0, 1, 2]).current;

  const resetToStartState = () => {
    setGameStarted(false);
    setIsShuffling(false);
    setRevealedPhysicalIndex(null);
    setProgress(0);
    setGameState("playing");
    setMessage("الكرة تحت الكوب الأوسط. اضغط على زر البدء لتبدأ اللعبة.");
    totalClicks.current = 0;
    wrongClicks.current = 0;
    reactionTimes.current = [];

    physicalSlotToLogicalCup.splice(0, CUP_COUNT, 0, 1, 2);
    cupAnimations.forEach((cup, index) => {
      cup.x.setValue(physicalXPositions[index]);
      cup.y.setValue(index === 1 ? -60 : 0);
      cup.zIndex.setValue(1);
    });
  };

  useEffect(() => { resetToStartState(); }, []);

  const saveResult = async (atpi) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "ActivityResults"), {
          childId: user.uid,
          activityId: activityId,
          attentionIndex: parseFloat(atpi.toFixed(2)),
          status: "completed",
          createdAt: serverTimestamp(),
        });
        console.log("✅ تم حفظ مؤشر الانتباه بنجاح");
      }
    } catch (e) { console.error("❌ Error saving result:", e); }
  };

  const dropCups = () => {
    const animations = cupAnimations.map((cup) =>
      Animated.timing(cup.y, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.cubic), useNativeDriver: true })
    );
    return Animated.parallel(animations);
  };

  const liftSingleCup = (logicalCupIndex) => {
    return Animated.timing(cupAnimations[logicalCupIndex].y, { toValue: -60, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true });
  };

  const startShuffle = async () => {
    setIsShuffling(true);
    setMessage("ركّز جيدًا على حركة الأكواب...");
    const shuffleDuration = 500;
    const swaps = [[1, 2], [0, 1], [2, 0], [1, 2], [0, 2]]; 

    for (let i = 0; i < swaps.length; i++) {
      const [pSlotA, pSlotB] = swaps[i];
      const lCupA = physicalSlotToLogicalCup[pSlotA];
      const lCupB = physicalSlotToLogicalCup[pSlotB];

      cupAnimations[lCupA].zIndex.setValue(2);
      await new Promise((resolve) => {
        Animated.parallel([
          Animated.timing(cupAnimations[lCupA].x, { toValue: physicalXPositions[pSlotB], duration: shuffleDuration, useNativeDriver: true }),
          Animated.timing(cupAnimations[lCupB].x, { toValue: physicalXPositions[pSlotA], duration: shuffleDuration, useNativeDriver: true }),
        ]).start(resolve);
      });
      [physicalSlotToLogicalCup[pSlotA], physicalSlotToLogicalCup[pSlotB]] = [physicalSlotToLogicalCup[pSlotB], physicalSlotToLogicalCup[pSlotA]];
    }
    setIsShuffling(false);
    shuffleEndTime.current = Date.now();
    setMessage("أين الكرة الآن؟ اختر الكوب الصحيح.");
  };

  const handleStartGame = async () => {
    if (isShuffling) return;
    setGameStarted(true);
    await new Promise((resolve) => dropCups().start(resolve));
    startShuffle();
  };

  const handleCupPress = (logicalCupIndex) => {
    if (!gameStarted || isShuffling || revealedPhysicalIndex !== null) return;
    
    totalClicks.current += 1;
    const reactionTime = Date.now() - shuffleEndTime.current;
    reactionTimes.current.push(reactionTime);

    // البحث عن المكان الفيزيائي الحالي للكوب الذي تم ضغطه
    const physicalIndex = physicalSlotToLogicalCup.indexOf(logicalCupIndex);
    setRevealedPhysicalIndex(physicalIndex);
    liftSingleCup(logicalCupIndex).start();

    if (logicalCupIndex === ballLogicalIndex) {
      setProgress(100);
      setMessage("🎉 رائع! وجدت الكرة.");
      
      const completionRate = 1; 
      const randomClickRate = wrongClicks.current / totalClicks.current;
      const avgRT = reactionTimes.current.reduce((a, b) => a + b, 0) / reactionTimes.current.length;
      
      const atpi = calculateAttentionIndex(completionRate, randomClickRate, 0, avgRT);
      saveResult(atpi);
      
      setTimeout(() => setGameState("won"), 1000);
    } else {
      wrongClicks.current += 1;
      setMessage("❌ خطأ، حاول مرة أخرى.");
      setTimeout(() => setRevealedPhysicalIndex(null), 800);
    }
  };

  return (
    <AppLayout navigation={navigation} activeTab="activities">
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={PRIMARY} />
          </TouchableOpacity>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>لعبة إيجاد الكرة</Text>
            <Text style={styles.subtitle}>تنمية التركيز والانتباه البصري</Text>
          </View>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>مستوى التقدم</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressPct}>{progress}%</Text>
        </View>

        <View style={styles.instructionRow}>
          <Text style={styles.mainInstruction}>أين الكرة؟</Text>
          <Text style={styles.subInstruction}>{message}</Text>
        </View>

        <View style={styles.gameArea}>
          <Animated.View style={[styles.ballContainer, {
            transform: [{ translateX: cupAnimations[ballLogicalIndex].x }],
            opacity: (!gameStarted || (revealedPhysicalIndex !== null && physicalSlotToLogicalCup[revealedPhysicalIndex] === ballLogicalIndex)) ? 1 : 0,
          }]}>
            <View style={styles.ball} />
          </Animated.View>

          <View style={styles.cupsContainer}>
            {cupAnimations.map((cup, idx) => (
              <Animated.View key={idx} style={[styles.cupWrapper, {
                transform: [{ translateX: cup.x }, { translateY: cup.y }],
                zIndex: cup.zIndex,
              }]}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleCupPress(idx)}
                  disabled={isShuffling || revealedPhysicalIndex !== null || !gameStarted}
                >
                  {/* تأكدي من وجود الصورة في مسار assets */}
                  <Image source={require("../../assets/images/red-cup.png")} style={styles.cupImage} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.startButton, isShuffling && { opacity: 0.5 }]} 
          onPress={gameStarted ? resetToStartState : handleStartGame} 
          disabled={isShuffling}
        >
          <Text style={styles.startButtonText}>{gameStarted ? "إعادة اللعب" : "ابدأ اللعبة"}</Text>
        </TouchableOpacity>
      </View>

      <ResultModal 
        visible={gameState !== "playing"} 
        state={gameState} 
        onReset={resetToStartState} 
        onNavigateNext={() => navigation.goBack()} 
      />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, justifyContent: 'space-between' },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: CARD, alignItems: "center", justifyContent: "center", elevation: 2 },
  titleBlock: { alignItems: "flex-end" },
  title: { fontSize: 18, fontWeight: "700", color: "#2d2d2d" },
  subtitle: { fontSize: 12, color: PRIMARY, fontWeight: '600' },
  progressRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8, paddingHorizontal: 20, marginTop: 5 },
  progressBg: { flex: 1, height: 10, borderRadius: 5, backgroundColor: BORDER, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: PRIMARY },
  progressPct: { fontSize: 12, fontWeight: "bold", color: PRIMARY, width: 35 },
  instructionRow: { alignItems: "center", marginTop: 15, paddingHorizontal: 20 },
  mainInstruction: { fontSize: 22, fontWeight: "bold", color: "#333" },
  subInstruction: { fontSize: 14, color: MUTED, textAlign: "center", marginTop: 5, minHeight: 40 },
  gameArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  ballContainer: { position: "absolute", bottom: '38%', alignItems: "center" },
  ball: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#FFD700", borderWidth: 2, borderColor: "#FFA500" },
  cupsContainer: { width: 300, height: 120, position: "relative", alignItems: "center" },
  cupWrapper: { position: "absolute" },
  cupImage: { width: 90, height: 110, resizeMode: "contain" },
  startButton: { alignSelf: "center", backgroundColor: PRIMARY, paddingHorizontal: 50, paddingVertical: 14, borderRadius: 25, elevation: 4, marginBottom: 30 },
  startButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});

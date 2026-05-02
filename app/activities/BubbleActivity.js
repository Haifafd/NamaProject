import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

// استدعاء الفايربيس
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";

// استدعاء التنسيقات
import { AppLayout, BORDER, CARD, MUTED, PRIMARY } from "./ActivityStyle";

// --- الاستيراد الجديد للمودال الخارجي ---
import ResultModal from "./Result";

const { width } = Dimensions.get("window");

const INITIAL_BUBBLES = [
  { id: 1, top: "20%", left: "15%", size: 90, color: "#E1F5FE" },
  { id: 2, top: "25%", left: "55%", size: 100, color: "#B3E5FC" },
  { id: 3, top: "45%", left: "20%", size: 110, color: "#E1F5FE" },
  { id: 4, top: "50%", left: "65%", size: 80, color: "#B3E5FC" },
  { id: 5, top: "65%", left: "35%", size: 95, color: "#E1F5FE" },
  { id: 6, top: "78%", left: "15%", size: 70, color: "#B3E5FC" },
  { id: 7, top: "80%", left: "60%", size: 85, color: "#E1F5FE" },
];

export default function PerfectBubbleGame({ navigation, route }) {
  const router = useRouter();
  const activityId = route?.params?.activityId || "7uE1Wl6s17R2t4pMOA9Z"; 

  const [bubbles, setBubbles] = useState(INITIAL_BUBBLES);
  const [gameState, setGameState] = useState("playing");
  
  const startTime = useRef(Date.now());
  const lastClickTime = useRef(Date.now());
  const totalReactionTime = useRef(0);
  const correctClicks = useRef(0);
  const randomClicks = useRef(0);

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  const totalInitialBubbles = INITIAL_BUBBLES.length;
  const poppedBubbles = totalInitialBubbles - bubbles.length;
  const progressPercentage = (poppedBubbles / totalInitialBubbles) * 100;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  const saveToDatabase = async (vmi, ai, status) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "ActivityResults"), {
          childId: user.uid, 
          activityId: activityId,
          visualMotorIndex: parseFloat(vmi.toFixed(2)),
          attentionIndex: parseFloat(ai.toFixed(2)),
          status: status,
          createdAt: serverTimestamp(), 
        });
      }
    } catch (error) {
      console.error("❌ Error saving:", error);
    }
  };

  const finishGame = (finalState) => {
    const endTime = Date.now();
    const totalDuration = (endTime - startTime.current) / 1000;
    
    const accuracy = correctClicks.current / (correctClicks.current + randomClicks.current || 1);
    const speedScore = Math.max(0, 1 - totalDuration / 20); 
    const errorRate = randomClicks.current / (correctClicks.current + randomClicks.current || 1);
    const avgReactionTime = totalReactionTime.current / (correctClicks.current || 1);
    const completionRate = finalState === "won" ? 1 : progressPercentage / 100;

    const vmi = (accuracy * 0.4) + (speedScore * 0.3) + ((1 - errorRate) * 0.3);
    const ai = (completionRate * 0.4) + ((1 - errorRate) * 0.3) + (1 - Math.min(avgReactionTime / 3000, 1)) * 0.1;

    saveToDatabase(vmi, ai, finalState);
    setGameState(finalState);
  };

  const handleBubblePress = (id) => {
    if (gameState !== "playing") return;
    
    const now = Date.now();
    totalReactionTime.current += (now - lastClickTime.current);
    lastClickTime.current = now;
    correctClicks.current += 1;

    const newBubbles = bubbles.filter((b) => b.id !== id);
    setBubbles(newBubbles);
    
    if (newBubbles.length === 0) finishGame("won");
  };

  const handleMissPress = () => {
    if (gameState !== "playing") return;
    randomClicks.current += 1;
    
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const resetGame = () => {
    setBubbles(INITIAL_BUBBLES);
    setGameState("playing");
    startTime.current = Date.now();
    lastClickTime.current = Date.now();
    totalReactionTime.current = 0;
    correctClicks.current = 0;
    randomClicks.current = 0;
  };

  return (
    <AppLayout navigation={navigation} activeTab="activities">
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.push("/parent/Activities")}
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>نشاط الفقاعات</Text>
          <Text style={styles.subtitle}>مستوى ٣ . مهارة التركيز</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>مستوى التقدم</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressPct}>{Math.round(progressPercentage)}%</Text>
      </View>

      <TouchableWithoutFeedback onPress={handleMissPress}>
        <Animated.View style={[styles.gameArea, { transform: [{ translateX: shakeAnimation }] }]}>
          <Text style={styles.instruction}>أسرع! قم بلمس جميع الفقاعات</Text>
          
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

      {/* استدعاء المودال الخارجي */}
      <ResultModal 
        visible={gameState !== "playing"} 
        state={gameState} 
        onReset={resetGame}
        onNavigateNext={() => {
          resetGame(); 
          router.push("/parent/Activities"); 
        }} 
      />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, justifyContent: 'space-between' },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: CARD, alignItems: "center", justifyContent: "center", elevation: 3 },
  backArrow: { fontSize: 28, color: PRIMARY, fontWeight: 'bold' },
  titleBlock: { alignItems: "flex-end" },
  title: { fontSize: 20, fontWeight: "700", color: "#2d2d2d" },
  subtitle: { fontSize: 13, color: PRIMARY, fontWeight: '600' },
  progressRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8, paddingHorizontal: 20, marginBottom: 10 },
  progressLabel: { fontSize: 13, color: MUTED, width: 85, textAlign: 'right' },
  progressBg: { flex: 1, height: 12, borderRadius: 6, backgroundColor: BORDER, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: PRIMARY, borderRadius: 6 },
  progressPct: { fontSize: 13, fontWeight: "700", color: PRIMARY, width: 40, textAlign: 'left' },
  gameArea: { flex: 1, position: "relative" },
  instruction: { textAlign: "right", padding: 20, fontSize: 16, color: MUTED, fontWeight: "600" },
  bubble: { position: "absolute", borderWidth: 2, borderColor: "rgba(255,255,255,0.8)", elevation: 5 },
  bubbleShine: { width: "25%", height: "25%", backgroundColor: "rgba(255,255,255,0.6)", borderRadius: 10, position: "absolute", top: "15%", left: "20%" },
});

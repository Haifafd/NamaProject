import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { auth, db } from "../../FirebaseConfig";
import { AppLayout, BORDER, CARD, PRIMARY } from "./ActivityStyle";
import ResultModal from "./Result";

const { width, height } = Dimensions.get("window");

// دالة لتوليد الحلقات بناءً على العدد المطلوب لكل مستوى
const generateRings = (count) => {
  const colors = ["#EF5350", "#42A5F5", "#66BB6A", "#FBC02D", "#9C27B0", "#FF9800"];
  const labels = ["١", "٢", "٣", "٤", "٥", "٦"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `ring-${i}`,
    color: colors[i] || "#333",
    size: 80 - (i * 10), // تصغير الحجم تدريجياً
    placed: false,
    label: labels[i],
  }));
};

export default function PyramidScreen() {
  const router = useRouter(); 
  const [level, setLevel] = useState(1); // المستوى الحالي
  const [rings, setRings] = useState(generateRings(3)); // البداية بـ 3 قطع
  const [progress, setProgress] = useState(0);
  const [gameState, setGameState] = useState("playing");

  const startTime = useRef(Date.now());
  const totalErrors = useRef(0);

  const placedRings = rings.filter((r) => r.placed);

  // تحديث اللعبة عند تغيير المستوى
  useEffect(() => {
    let count = 3;
    if (level === 2) count = 5;
    if (level === 3) count = 6;
    
    setRings(generateRings(count));
    setProgress(0);
    startTime.current = Date.now();
  }, [level]);

  const saveResult = async (psi) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "ActivityResults"), {
          childId: user.uid,
          activityId: "pyramid_building",
          level: level,
          score: parseFloat((psi * 100).toFixed(0)),
          status: "completed",
          createdAt: serverTimestamp(),
        });
      }
    } catch (e) { console.error(e); }
  };

  const handleDrop = (id, gesture) => {
    const pegCenterX = width / 2;
    const isOverPeg = Math.abs(gesture.moveX - pegCenterX) < 90 && gesture.moveY < height * 0.65;
    
    if (!isOverPeg) return false;

    let isCorrectOrder = false;

    setRings((prevRings) => {
      const currentUnplaced = prevRings.filter(r => !r.placed);
      
      if (currentUnplaced.length > 0 && currentUnplaced[0].id === id) {
        isCorrectOrder = true;
        const updated = prevRings.map((r) => (r.id === id ? { ...r, placed: true } : r));
        
        const newPlacedCount = updated.filter(r => r.placed).length;
        setProgress(newPlacedCount / prevRings.length);
        
        if (newPlacedCount === prevRings.length) {
          setTimeout(() => {
            if (level < 3) {
              setLevel(level + 1); // الانتقال للمستوى التالي
            } else {
              setGameState("won"); // إنهاء اللعبة بعد المستوى الثالث
              finishGame();
            }
          }, 600);
        }
        return updated;
      }
      totalErrors.current += 1;
      return prevRings;
    });

    return isCorrectOrder;
  };

  const finishGame = () => {
    const duration = (Date.now() - startTime.current) / 1000;
    const psi = 1 - (totalErrors.current / 10); 
    saveResult(psi);
  };

  const handleReset = () => {
    setLevel(1);
    setRings(generateRings(3));
    setProgress(0);
    setGameState("playing");
    totalErrors.current = 0;
  };

  return (
    <AppLayout activeTab="activities">
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>بناء الهرم - مستوى {level}</Text>
          <Text style={styles.subtitle}>رتب {rings.length} قطع بالترتيب المنطقي</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
      </View>

      <View style={styles.gameArea}>
        <View style={styles.pegContainer}>
          <View style={styles.pegBase} />
          <View style={styles.pegStick} />
          <View style={styles.placedRingsContainer}>
            {placedRings.map((ring) => (
              <View key={ring.id} style={[styles.staticRing, { width: ring.size * 1.8, height: 30, backgroundColor: ring.color }]} />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.ringsArea}>
        <Text style={styles.hintText}>اسحب القطع من ١ إلى {rings.length}</Text>
        <View style={styles.ringsContainer}>
          {rings.filter(r => !r.placed).map((ring) => (
            <RingItem key={ring.id} ring={ring} onDrop={handleDrop} />
          ))}
        </View>
      </View>

      <ResultModal visible={gameState !== "playing"} state={gameState} onReset={handleReset} onNavigateNext={() => router.back()} />
    </AppLayout>
  );
}

// مكون الحلقة (RingItem) كما هو في الكود السابق
function RingItem({ ring, onDrop }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        const success = onDrop(ring.id, gesture);
        if (!success) {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        } else {
          pan.setValue({ x: 0, y: 0 });
        }
      },
    })
  ).current;

  return (
    <Animated.View {...panResponder.panHandlers} style={[styles.ring, { width: ring.size * 1.8, height: 40, backgroundColor: ring.color, transform: pan.getTranslateTransform() }]}>
      <Text style={styles.ringLabel}>{ring.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", padding: 20, justifyContent: 'space-between', marginTop: 40 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: CARD, alignItems: "center", justifyContent: "center", elevation: 2 },
  backArrow: { fontSize: 30, color: PRIMARY, marginTop: -5 },
  titleBlock: { alignItems: "flex-end" },
  title: { fontSize: 18, fontWeight: "bold", color: "#2d2d2d" },
  subtitle: { fontSize: 12, color: PRIMARY },
  progressRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 25, gap: 10 },
  progressBg: { flex: 1, height: 8, borderRadius: 4, backgroundColor: BORDER, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: PRIMARY },
  progressPct: { fontSize: 12, fontWeight: "bold", color: PRIMARY },
  gameArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  pegContainer: { alignItems: "center", justifyContent: "flex-end", height: 280 },
  pegBase: { width: 160, height: 15, borderRadius: 10, backgroundColor: "#5D4037" },
  pegStick: { width: 10, height: 200, borderRadius: 5, backgroundColor: "#795548", position: "absolute", bottom: 15 },
  placedRingsContainer: { position: "absolute", bottom: 15, alignItems: "center", flexDirection: 'column-reverse' },
  staticRing: { borderRadius: 8, marginBottom: 2 },
  ringsArea: { paddingBottom: 50, alignItems: 'center' },
  hintText: { fontSize: 13, color: '#666', marginBottom: 15 },
  ringsContainer: { flexDirection: "row-reverse", gap: 10, flexWrap: 'wrap', justifyContent: 'center', paddingHorizontal: 10 },
  ring: { borderRadius: 10, alignItems: "center", justifyContent: "center", elevation: 3 },
  ringLabel: { color: "white", fontWeight: "bold", fontSize: 16 },
});

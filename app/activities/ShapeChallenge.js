import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState, useMemo } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  PanResponder,
  ScrollView,
} from "react-native";
import Svg, { Defs, G, Mask, Path, Circle } from "react-native-svg";

// --- استيراد المكونات الموحدة ---
import { AppLayout, BORDER, CARD, MUTED, PRIMARY } from "./ActivityStyle";
import ResultModal from "./Result";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";

const { width } = Dimensions.get("window");
const CANVAS_WIDTH = width * 0.85;
const CANVAS_HEIGHT = 450;

export default function ShapeTraceActivity() {
  const router = useRouter();
  const [level, setLevel] = useState(1);
  const [points, setPoints] = useState([]); // نقاط المسح (التتبع)
  const [gameState, setGameState] = useState("playing");

  // تعريف شكل المسار لكل مستوى
  const levelPath = useMemo(() => {
    if (level === 1) return "M60,100 L260,400"; // خط مستقيم
    if (level === 2) return "M60,100 L260,100 L260,400 L60,400 Z"; // مربع
    return "M160,50 L280,350 L40,350 Z"; // مثلث
  }, [level]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        
        // تحسين الأداء: لا نضيف نقطة إلا إذا تحرك الإصبع مسافة معينة
        setPoints((prev) => {
          const newPoint = { x: Math.round(locationX), y: Math.round(locationY) };
          if (prev.length > 0) {
            const last = prev[prev.length - 1];
            const dist = Math.hypot(newPoint.x - last.x, newPoint.y - last.y);
            if (dist < 10) return prev; // تجاهل الحركات البسيطة جداً
          }
          return [...prev, newPoint];
        });
      },
    })
  ).current;

  const handleNext = () => {
    if (points.length < 15) {
      alert("حاول تتبع الخط بالكامل أولاً! ✍️");
      return;
    }

    if (level < 3) {
      setLevel(l => l + 1);
      setPoints([]);
    } else {
      saveToFirebase();
      setGameState("won");
    }
  };

  const saveToFirebase = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "ActivityResults"), {
          childId: user.uid,
          activityName: "تتبع الأشكال المتقدم",
          levelReached: level,
          timestamp: serverTimestamp(),
        });
      }
    } catch (e) { console.error(e); }
  };

  const progress = (level / 3) * 100;

  return (
    <AppLayout navigation={router} activeTab="activities">
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        
        {/* الهيدر الموحد */}
        <View style={styles.header}>
          <View style={styles.titleGroup}>
            <Text style={styles.title}>تتبع الخطوط</Text>
            <Text style={styles.subtitle}>مرر إصبعك فوق الخط لتلوينه</Text>
          </View>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* شريط التقدم */}
        <View style={styles.progressRow}>
          <Text style={styles.progressPct}>{Math.round(progress)}%</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* منطقة التتبع الذكية */}
        <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
          <Svg height="100%" width="100%" viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}>
            <Defs>
              {/* القناع: في البداية يكون أسود (يخفي كل شيء)، والنقاط التي يرسمها الطفل تكون بيضاء (تظهر ما تحته) */}
              <Mask id="traceMask">
                <G>
                  {points.map((p, i) => (
                    <Circle key={i} cx={p.x} cy={p.y} r="35" fill="white" />
                  ))}
                </G>
              </Mask>
            </Defs>

            {/* 1. الخط الخلفي (باهت جداً كدليل للطفل) */}
            <Path 
              d={levelPath} 
              fill="none" 
              stroke="#F1F5F9" 
              strokeWidth="40" 
              strokeLinecap="round" 
              strokeDasharray="10,12"
            />

            {/* 2. الخط الملون (مخفي خلف القناع ويظهر فقط عند مرور الإصبع) */}
            <G mask="url(#traceMask)">
              <Path 
                d={levelPath} 
                fill="none" 
                stroke={PRIMARY} 
                strokeWidth="45" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </G>
          </Svg>
        </View>

        {/* أزرار التحكم */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
            <Text style={styles.nextText}>
              {level === 3 ? "إتمام التحدي 🏆" : "الشكل التالي ➡️"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.clearBtn} 
            onPress={() => setPoints([])}
          >
            <Text style={styles.clearText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <ResultModal 
        visible={gameState === "won"} 
        state="won" 
        onReset={() => {
          setLevel(1);
          setPoints([]);
          setGameState("playing");
        }}
        onNavigateNext={() => router.back()}
      />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { paddingHorizontal: 20, paddingTop: 10 },
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginVertical: 15 },
  backBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: CARD, justifyContent: "center", alignItems: "center", elevation: 2 },
  titleGroup: { alignItems: "flex-end" },
  title: { fontSize: 22, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 13, color: PRIMARY, fontWeight: "600" },
  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 10 },
  progressBg: { flex: 1, height: 10, backgroundColor: BORDER, borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: PRIMARY },
  progressPct: { fontSize: 14, fontWeight: "bold", color: PRIMARY },
  canvasWrapper: { 
    width: CANVAS_WIDTH, 
    height: CANVAS_HEIGHT, 
    backgroundColor: CARD, 
    borderRadius: 30, 
    alignSelf: "center",
    elevation: 4, 
    borderWidth: 2,
    borderColor: BORDER,
    overflow: 'hidden'
  },
  footer: { marginTop: 25, alignItems: "center", gap: 10 },
  nextBtn: { backgroundColor: PRIMARY, width: "100%", paddingVertical: 15, borderRadius: 20, alignItems: "center", elevation: 3 },
  nextText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  clearBtn: { padding: 10 },
  clearText: { color: MUTED, fontSize: 14 }
});

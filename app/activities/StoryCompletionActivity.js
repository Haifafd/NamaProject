import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- استيراد Firebase و الثيم ---
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";
import { AppLayout, BORDER, CARD, MUTED, PRIMARY } from "./ActivityStyle";
import ResultModal from "./Result";

const { width } = Dimensions.get("window");

const GAME_ITEMS = [
  { id: "seed", label: "بذرة", img: require("../../assets/images/seed.png") },
  { id: "plant", label: "نبتة", img: require("../../assets/images/plant.png") },
  { id: "flower", label: "زهرة", img: require("../../assets/images/flower.png") },
];

export default function PlantGame() {
  const router = useRouter();
  const [placed, setPlaced] = useState([null, null, null]);
  const [message, setMessage] = useState("");
  const [gameState, setGameState] = useState("playing");
  const [isSaving, setIsSaving] = useState(false);
  
  // مراجع المربعات الثلاثة بشكل منفصل لتجنب خطأ measure
  const dropZoneRefs = [useRef(null), useRef(null), useRef(null)];
  const dropZonesData = useRef([]); // لتخزين الإحداثيات المحسوبة
  const attemptsRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  const saveResult = async (finalData) => {
    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "ActivityResults"), {
          childId: user.uid,
          activityName: "ترتيب مراحل نمو النبات",
          performance: finalData,
          createdAt: serverTimestamp(),
        });
      }
    } catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  const updateZones = () => {
    // دالة لحساب أماكن المربعات بدقة
    dropZoneRefs.forEach((ref, index) => {
      if (ref.current) {
        ref.current.measure((x, y, w, h, px, py) => {
          dropZonesData.current[index] = { x: px, y: py, width: w, height: h };
        });
      }
    });
  };

  const checkDrop = (gesture, itemId, resetPos) => {
    const { moveX, moveY } = gesture;
    let isCorrectDrop = false;

    // تحديث الإحداثيات عند كل سحبة لضمان الدقة
    updateZones();

    dropZonesData.current.forEach((zone, index) => {
      if (!zone) return;

      const isInside = 
        moveX > zone.x && 
        moveX < zone.x + zone.width && 
        moveY > zone.y && 
        moveY < zone.y + zone.height;

      if (isInside) {
        attemptsRef.current += 1;
        if (GAME_ITEMS[index].id === itemId) {
          if (!placed[index]) {
            const newPlaced = [...placed];
            newPlaced[index] = itemId;
            setPlaced(newPlaced);
            setMessage("✅ أحسنت!");
            isCorrectDrop = true;

            if (newPlaced.every(item => item !== null)) {
              const duration = (Date.now() - startTimeRef.current) / 1000;
              saveResult({ attempts: attemptsRef.current, duration: Math.round(duration), score: 100 });
              setGameState("won");
            }
          }
        } else {
          setMessage("❌ ترتيب خاطئ، حاول مرة أخرى");
        }
      }
    });

    if (!isCorrectDrop) resetPos();
  };

  const DraggableItem = ({ item }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const [isDragging, setIsDragging] = useState(false);

    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => setIsDragging(true),
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gesture) => {
        setIsDragging(false);
        checkDrop(gesture, item.id, () => {
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        });
      },
    });

    return (
      <Animated.View 
        {...panResponder.panHandlers} 
        style={[pan.getLayout(), styles.dragCard, { zIndex: isDragging ? 100 : 1, elevation: isDragging ? 10 : 2 }]}
      >
        <Image source={item.img} style={styles.cardImg} />
        <Text style={styles.cardLabel}>{item.label}</Text>
      </Animated.View>
    );
  };

  const progress = (placed.filter(i => i !== null).length / 3) * 100;

  return (
    <AppLayout navigation={router} activeTab="activities">
      <View style={styles.container}>
        
        {/* هيدر: النص يمين والزر يسار */}
        <View style={styles.header}>
            <View style={styles.titleGroup}>
                <Text style={styles.title}>نمو النبات</Text>
                <Text style={styles.subtitle}>رتب مراحل النمو</Text>
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

        {/* منطقة الخيارات (فوق) */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>اسحب من هنا:</Text>
          <View style={styles.dragArea}>
            {GAME_ITEMS.map((item) => (
              <View key={item.id} style={styles.slot}>
                {!placed.includes(item.id) && <DraggableItem item={item} />}
              </View>
            ))}
          </View>
        </View>

        {/* منطقة المربعات (تحت) */}
        <View style={styles.dropSection}>
          <Text style={styles.sectionTitle}>رتب هنا (١ ← ٣):</Text>
          <View style={styles.dropArea}>
            {[0, 1, 2].map((i) => (
              <View 
                key={i}
                ref={dropZoneRefs[i]} // ربط المرجع المباشر
                collapsable={false} // مهم جداً لأنظمة أندرويد لتمكين القياس
                onLayout={updateZones} // التحديث عند رسم المكون
                style={[styles.dropBox, placed[i] && styles.dropBoxActive]}
              >
                {placed[i] ? (
                  <Image source={GAME_ITEMS.find(item => item.id === placed[i]).img} style={styles.dropImg} />
                ) : (
                  <View style={styles.emptyCircle}><Text style={styles.dropNumber}>{i + 1}</Text></View>
                )}
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.message, { color: message.includes('✅') ? PRIMARY : '#E53935' }]}>
          {message}
        </Text>

        {isSaving && <ActivityIndicator color={PRIMARY} />}
        <View style={{ height: 100 }} />
      </View>

      <ResultModal 
        visible={gameState === "won"} 
        state="won" 
        onReset={() => {
          setPlaced([null, null, null]);
          setGameState("playing");
          setMessage("");
          startTimeRef.current = Date.now();
        }}
        onNavigateNext={() => router.back()}
      />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginTop: 15, marginBottom: 15 },
  backBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: CARD, justifyContent: "center", alignItems: "center", elevation: 2 },
  titleGroup: { alignItems: "flex-end" },
  title: { fontSize: 22, fontWeight: "bold", color: "#333" },
  subtitle: { fontSize: 13, color: PRIMARY, fontWeight: '600' },

  progressRow: { flexDirection: "row", alignItems: "center", marginBottom: 20, gap: 10 },
  progressBg: { flex: 1, height: 10, backgroundColor: BORDER, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: PRIMARY },
  progressPct: { fontSize: 14, fontWeight: "bold", color: PRIMARY, width: 35 },

  sectionTitle: { textAlign: 'right', color: MUTED, fontSize: 13, marginBottom: 10 },
  optionsSection: { marginBottom: 30 },
  dragArea: { flexDirection: "row-reverse", justifyContent: "center", gap: 15 },
  slot: { width: width * 0.25, height: 80, justifyContent: 'center', alignItems: 'center' },
  dragCard: { backgroundColor: CARD, padding: 8, borderRadius: 15, alignItems: "center", width: width * 0.25, elevation: 2, borderWidth: 1, borderColor: BORDER },
  cardImg: { width: 50, height: 50, resizeMode: "contain" },
  cardLabel: { fontSize: 10, marginTop: 4, fontWeight: "bold", color: "#444" },

  dropArea: { flexDirection: "row-reverse", justifyContent: "center", gap: 15 },
  dropBox: { width: width * 0.26, height: width * 0.30, backgroundColor: '#FDFDFD', borderRadius: 20, borderWidth: 2, borderColor: BORDER, borderStyle: 'dashed', justifyContent: "center", alignItems: "center" },
  dropBoxActive: { borderStyle: 'solid', borderColor: PRIMARY, backgroundColor: '#F1F8E9' },
  emptyCircle: { width: 35, height: 35, borderRadius: 17.5, backgroundColor: BORDER, justifyContent: 'center', alignItems: 'center' },
  dropNumber: { fontSize: 16, fontWeight: "bold", color: '#FFF' },
  dropImg: { width: "70%", height: "70%", resizeMode: "contain" },

  message: { textAlign: "center", fontSize: 16, fontWeight: "bold", marginTop: 20, height: 30 },
});

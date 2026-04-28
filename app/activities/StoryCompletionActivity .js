
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- استيراد Firebase ---
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./FirebaseConfig";

const correctOrder = ["seed", "plant", "flower"];

function calculateMemoryIndex(accuracy, hintUsageRate, improvementRate) {
  return (
    accuracy * 0.5 +
    (1 - hintUsageRate) * 0.3 +
    improvementRate * 0.2
  );
}

function calculateCognitiveIndex(accuracy, speedScore, consistency) {
  return accuracy * 0.5 + speedScore * 0.3 + consistency * 0.2;
}

export default function PlantGame() {
  const router = useRouter();
  const [placed, setPlaced] = useState([null, null, null]);
  const [message, setMessage] = useState("");
  const [showPerformance, setShowPerformance] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // حالة الحفظ في Firebase
  const [performanceData, setPerformanceData] = useState({
    attempts: 0,
    hints: 0,
    elapsedSeconds: 0,
    accuracy: 0,
    hintUsageRate: 0,
    improvementRate: 0,
    speedScore: 0,
    consistency: 0,
    wmi: 0,
    cpi: 0,
    finalScore: 0,
  });

  const dropZones = useRef([]);
  const attemptsRef = useRef(0);
  const hintsUsedRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const firstProgressRef = useRef(null);
  const lastProgressRef = useRef(0);

  const getPerformanceText = (score) => {
    if (score >= 85) return "ممتاز";
    if (score >= 65) return "جيد";
    if (score >= 45) return "مقبول";
    return "بحاجة لتحسين";
  };

  // ── دالة حفظ النتيجة في Firebase ──────────────────────────
  const saveActivityToFirebase = async (data) => {
    setIsSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user logged in");
        return;
      }

      const docData = {
        childId: user.uid, // معرف الطفل الحالي
        activityName: "نشاط إكمال القصة (النبات)",
        performance: data, // جميع بيانات الأداء (النقاط، المحاولات، الزمن)
        createdAt: serverTimestamp(),
      };

      
      await addDoc(collection(db, "ActivityResults"), docData);
      console.log("Activity saved successfully!");
    } catch (error) {
      console.error("Error saving activity: ", error);
      Alert.alert("خطأ", "فشل في حفظ نتيجة النشاط.");
    } finally {
      setIsSaving(false);
    }
  };

  const checkDrop = (gesture, type, resetPosition) => {
    const { moveX, moveY } = gesture;
    let dropped = false;

    dropZones.current.forEach((zone, index) => {
      if (!zone) return;

      const inside =
        moveX >= zone.pageX &&
        moveX <= zone.pageX + zone.width &&
        moveY >= zone.pageY &&
        moveY <= zone.pageY + zone.height;

      if (inside) {
        dropped = true;
        attemptsRef.current += 1;

        if (correctOrder[index] === type && !placed[index]) {
          const newPlaced = [...placed];
          newPlaced[index] = type;

          const progressNow =
            (newPlaced.filter((item, i) => item === correctOrder[i]).length / 3) *
            100;

          if (firstProgressRef.current === null) {
            firstProgressRef.current = progressNow;
          }
          lastProgressRef.current = progressNow;

          setPlaced(newPlaced);

          if (newPlaced.every((item) => item !== null)) {
            setMessage("🎉 أحسنت!");

            const endTime = Date.now();
            const elapsedSeconds = (endTime - startTimeRef.current) / 1000;

            const accuracy = 1;
            const hintUsageRate =
              attemptsRef.current > 0
                ? hintsUsedRef.current / attemptsRef.current
                : 0;

            const improvementRate =
              firstProgressRef.current === null
                ? 1
                : Math.max(
                    0,
                    Math.min(1, (lastProgressRef.current - firstProgressRef.current) / 100)
                  );

            const speedScore = Math.max(0, Math.min(1, 1 - elapsedSeconds / 45));
            const consistency = Math.max(
              0,
              Math.min(1, 1 - hintUsageRate - (attemptsRef.current - 3) / 10)
            );

            const wmi = calculateMemoryIndex(
              accuracy,
              hintUsageRate,
              improvementRate
            );
            const cpi = calculateCognitiveIndex(accuracy, speedScore, consistency);
            const finalScore = ((wmi + cpi) / 2) * 100;

            const data = {
              attempts: attemptsRef.current,
              hints: hintsUsedRef.current,
              elapsedSeconds: Math.round(elapsedSeconds),
              accuracy: Math.round(accuracy * 100),
              hintUsageRate: Math.round(hintUsageRate * 100),
              improvementRate: Math.round(improvementRate * 100),
              speedScore: Math.round(speedScore * 100),
              consistency: Math.round(consistency * 100),
              wmi: Math.round(wmi * 100),
              cpi: Math.round(cpi * 100),
              finalScore: Math.round(finalScore),
            };

            setPerformanceData(data);
            
            // حفظ البيانات في Firebase تلقائياً عند الفوز
            saveActivityToFirebase(data);

            Alert.alert("تقييم الأداء", "هل تريد عرض تقييم الأداء؟", [
              { text: "لا", style: "cancel" },
              { text: "نعم", onPress: () => setShowPerformance(true) },
            ]);
          } else {
            setMessage("");
          }
        } else {
          setMessage("❌ حاول مرة أخرى");
        }
      }
    });

    if (!dropped) {
      attemptsRef.current += 1;
      setMessage("❌ حاول مرة أخرى");
    }

    resetPosition();
  };

  const Draggable = ({ type, image }) => {
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        checkDrop(gesture, type, () => {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        });
      },
    });

    return (
      <Animated.View {...panResponder.panHandlers} style={pan.getLayout()}>
        <Image source={image} style={styles.cardImage} />
      </Animated.View>
    );
  };

  const progress =
    (placed.filter((item, i) => item === correctOrder[i]).length / 3) * 100;

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/background.png")}
        style={styles.background}
      />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2ecc71" />
        </TouchableOpacity>

        <View>
          <Text style={styles.title}>نشاط إكمال القصة</Text>
          <Text style={styles.level}>مستوى 1 - مهارة المعرفة</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.percent}>{Math.round(progress)}%</Text>
        <Text style={styles.progressText}>مستوى التقدم</Text>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.mainText}>رتب الصور حسب الترتيب الصحيح</Text>
        <Text style={styles.subText}>اسحب الصورة إلى المربع</Text>
      </View>

      <View style={styles.imagesRow}>
        {!placed.includes("flower") && (
          <Draggable
            type="flower"
            image={require("../../assets/images/flower.png")}
          />
        )}

        {!placed.includes("plant") && (
          <Draggable
            type="plant"
            image={require("../../assets/images/plant.png")}
          />
        )}

        {!placed.includes("seed") && (
          <Draggable
            type="seed"
            image={require("../../assets/images/seed.png")}
          />
        )}
      </View>

      <View style={styles.dropRow}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={styles.dropBox}
            onLayout={(event) => {
              event.target.measure((fx, fy, width, height, px, py) => {
                dropZones.current[i] = {
                  width,
                  height,
                  pageX: px,
                  pageY: py,
                };
              });
            }}
          >
            <Text style={styles.boxNumber}>{i + 1}</Text>

            {placed[i] && (
              <Image
                source={
                  placed[i] === "seed"
                    ? require("../../assets/images/seed.png")
                    : placed[i] === "plant"
                    ? require("../../assets/images/plant.png")
                    : require("../../assets/images/flower.png")
                }
                style={styles.dropImage}
              />
            )}
          </View>
        ))}
      </View>

      <Text style={styles.message}>{message}</Text>
      
      {isSaving && (
        <View style={styles.savingContainer}>
          <ActivityIndicator color="#2ecc71" />
          <Text style={styles.savingText}>جاري حفظ النتيجة...</Text>
        </View>
      )}

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
              <Text style={styles.statLabel}>عدد المحاولات:</Text>
              <Text style={styles.statValue}>{performanceData.attempts}</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>الزمن المستغرق:</Text>
              <Text style={styles.statValue}>{performanceData.elapsedSeconds} ثانية</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>النتيجة النهائية:</Text>
              <Text style={[styles.statValue, { color: "#2ecc71" }]}>{performanceData.finalScore}%</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>التقييم:</Text>
              <Text style={styles.statValue}>{getPerformanceText(performanceData.finalScore)}</Text>
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
  container: { flex: 1, backgroundColor: "#fff" },
  background: { position: "absolute", width: "100%", height: "100%", opacity: 0.1 },
  header: { flexDirection: "row-reverse", alignItems: "center", padding: 20, paddingTop: 50 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center", marginLeft: 15 },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "right" },
  level: { fontSize: 14, color: "#666", textAlign: "right" },
  progressSection: { alignItems: "center", marginVertical: 20 },
  percent: { fontSize: 36, fontWeight: "bold", color: "#2ecc71" },
  progressText: { fontSize: 14, color: "#666", marginBottom: 10 },
  progressBar: { width: "80%", height: 10, backgroundColor: "#f0f0f0", borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#2ecc71" },
  instructions: { alignItems: "center", marginBottom: 30 },
  mainText: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  subText: { fontSize: 14, color: "#888" },
  imagesRow: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 20, marginBottom: 40 },
  cardImage: { width: 80, height: 80, borderRadius: 10 },
  dropRow: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 20 },
  dropBox: { width: 90, height: 90, borderWidth: 2, borderColor: "#2ecc71", borderStyle: "dashed", borderRadius: 10, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fff9" },
  boxNumber: { position: "absolute", top: 5, left: 5, fontSize: 12, color: "#2ecc71", fontWeight: "bold" },
  dropImage: { width: 70, height: 70, borderRadius: 8 },
  message: { textAlign: "center", fontSize: 20, fontWeight: "bold", marginTop: 20, color: "#2ecc71" },
  savingContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  savingText: { marginLeft: 10, color: '#666' },
  footer: { position: "absolute", bottom: 0, width: "100%", height: 70, flexDirection: "row", justifyContent: "space-around", alignItems: "center", borderTopWidth: 1, borderTopColor: "#eee", backgroundColor: "#fff" },
  footerItem: { alignItems: "center" },
  footerItemActive: { alignItems: "center", backgroundColor: "#2ecc71", padding: 10, borderRadius: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalCard: { width: "85%", backgroundColor: "#fff", borderRadius: 20, padding: 25, alignItems: "center" },
  modalTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  statsRow: { flexDirection: "row-reverse", justifyContent: "space-between", width: "100%", marginBottom: 15 },
  statLabel: { fontSize: 16, color: "#666" },
  statValue: { fontSize: 16, fontWeight: "bold" },
  closeBtn: { marginTop: 20, backgroundColor: "#2ecc71", paddingVertical: 12, paddingHorizontal: 40, borderRadius: 25 },
  closeBtnText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
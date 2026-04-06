
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
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
  const [placed, setPlaced] = useState([null, null, null]);
  const [message, setMessage] = useState("");
  const [showPerformance, setShowPerformance] = useState(false);
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
              elapsedSeconds,
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
        <TouchableOpacity style={styles.backBtn}>
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

      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="home-outline" size={22} />
          <Text>الرئيسية</Text>
        </View>

        <View style={styles.footerItemActive}>
          <Ionicons name="game-controller" size={22} color="white" />
          <Text style={{ color: "white" }}>نشاط</Text>
        </View>

        <View style={styles.footerItem}>
          <Ionicons name="person-outline" size={22} />
          <Text>حسابي</Text>
        </View>
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
              <Text style={styles.statLabel}>عدد المحاولات:</Text>
              <Text style={styles.statValue}>{performanceData.attempts}</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>عدد التلميحات:</Text>
              <Text style={styles.statValue}>{performanceData.hints}</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>الزمن المستغرق:</Text>
              <Text style={styles.statValue}>
                {performanceData.elapsedSeconds.toFixed(1)} ثانية
              </Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>نسبة الدقة:</Text>
              <Text style={styles.statValue}>{performanceData.accuracy}%</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>نسبة استخدام التلميحات:</Text>
              <Text style={styles.statValue}>{performanceData.hintUsageRate}%</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>معدل التحسن:</Text>
              <Text style={styles.statValue}>{performanceData.improvementRate}%</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>متوسط السرعة:</Text>
              <Text style={styles.statValue}>{performanceData.speedScore}%</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>الثبات:</Text>
              <Text style={styles.statValue}>{performanceData.consistency}%</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>مؤشر الذاكرة العاملة WMI:</Text>
              <Text style={styles.statValue}>{performanceData.wmi}%</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>مؤشر المعالجة المعرفية CPI:</Text>
              <Text style={styles.statValue}>{performanceData.cpi}%</Text>
            </View>

            <Text style={styles.finalText}>
              {getPerformanceText(performanceData.finalScore)}
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
  container: { flex: 1 },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 20,
    gap: 10,
  },
  backBtn: {
    backgroundColor: "#eafaf1",
    padding: 10,
    borderRadius: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  level: {
    color: "#2ecc71",
    fontSize: 12,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  percent: {
    fontWeight: "bold",
    fontSize: 18,
  },
  progressText: {
    alignSelf: "flex-end",
    marginBottom: 5,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#ddd",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2ecc71",
    borderRadius: 10,
  },
  instructions: {
    alignItems: "center",
    marginTop: 20,
  },
  mainText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  subText: {
    color: "gray",
    marginTop: 5,
  },
  imagesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  cardImage: {
    width: 90,
    height: 90,
    borderRadius: 15,
  },
  dropRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 40,
  },
  dropBox: {
    width: 90,
    height: 90,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#bbb",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  dropImage: {
    width: 70,
    height: 70,
  },
  boxNumber: {
    position: "absolute",
    top: 5,
    left: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "#999",
  },
  message: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 16,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    width: "90%",
    alignSelf: "center",
    backgroundColor: "white",
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
  },
  footerItem: {
    alignItems: "center",
  },
  footerItemActive: {
    backgroundColor: "#2ecc71",
    padding: 10,
    borderRadius: 15,
    alignItems: "center",
  },
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
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 16,
    color: "#444",
    textAlign: "right",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#222",
  },
  finalText: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#2ecc71",
    marginTop: 16,
    marginBottom: 14,
  },
  performanceBar: {
    height: 12,
    width: "100%",
    backgroundColor: "#e5e5e5",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
  },
  performanceFill: {
    height: "100%",
    backgroundColor: "#2ecc71",
    borderRadius: 20,
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

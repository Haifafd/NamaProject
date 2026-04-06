
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

function calculateVisualMotorIndex(accuracy, speedScore, errorRate) {
  return accuracy * 0.4 + speedScore * 0.3 + (1 - errorRate) * 0.3;
}

function calculateCognitiveIndex(accuracy, speedScore, consistency) {
  return accuracy * 0.5 + speedScore * 0.3 + consistency * 0.2;
}

export default function MatchGame() {
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);

  const attemptsRef = useRef(0);
  const wrongAttemptsRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const firstTryCorrectRef = useRef(false);

  const correctAnswer = "apple";
  const totalGames = 1;

  const handleSelect = (type) => {
    if (completed) return;

    attemptsRef.current += 1;

    if (type === correctAnswer) {
      setSelected(type);
      setMessage("🎉 أحسنت!");
      setCompleted(true);

      if (attemptsRef.current === 1) {
        firstTryCorrectRef.current = true;
      }

      const endTime = Date.now();
      const elapsedSeconds = (endTime - startTimeRef.current) / 1000;

      const attempts = attemptsRef.current;
      const wrongAttempts = wrongAttemptsRef.current;
      const accuracy = 1;
      const errorRate = attempts > 0 ? wrongAttempts / attempts : 0;

      const speedScore = Math.max(0, Math.min(1, 1 - elapsedSeconds / 30));

      const consistency = firstTryCorrectRef.current
        ? 1
        : Math.max(0, 1 - wrongAttempts / attempts);

      const vmi = calculateVisualMotorIndex(accuracy, speedScore, errorRate);
      const cpi = calculateCognitiveIndex(accuracy, speedScore, consistency);

      const finalScore = ((vmi + cpi) / 2) * 100;

      const dashboardData = {
        attempts,
        wrongAttempts,
        elapsedSeconds,
        accuracy: Math.round(accuracy * 100),
        speedScore: Math.round(speedScore * 100),
        errorRate: Math.round(errorRate * 100),
        consistency: Math.round(consistency * 100),
        vmi: Math.round(vmi * 100),
        cpi: Math.round(cpi * 100),
        finalScore: Math.round(finalScore),
      };

      Alert.alert("تقييم الأداء", "هل تريد عرض تقييم الأداء؟", [
        {
          text: "لا",
          style: "cancel",
        },
        {
          text: "نعم",
          onPress: () => {
            setShowPerformance(true);
            setPerformanceData(dashboardData);
          },
        },
      ]);
    } else {
      wrongAttemptsRef.current += 1;
      setMessage("❌ حاول مرة أخرى");
    }
  };

  const [performanceData, setPerformanceData] = useState({
    attempts: 0,
    wrongAttempts: 0,
    elapsedSeconds: 0,
    accuracy: 0,
    speedScore: 0,
    errorRate: 0,
    consistency: 0,
    vmi: 0,
    cpi: 0,
    finalScore: 0,
  });

  const progress = completed ? 100 : 0;

  const getPerformanceText = (score) => {
    if (score >= 85) return "ممتاز";
    if (score >= 65) return "جيد";
    if (score >= 45) return "مقبول";
    return "بحاجة لتحسين";
  };

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
          <Text style={styles.title}>نشاط إيجاد الشكل المتماثل</Text>
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
        <Text style={styles.mainText}>
          قم باختيار الشكل المتماثل من بين الأشكال الظاهرة
        </Text>
      </View>

      <View style={styles.mainRow}>
        <Image
          source={require("../../assets/images/apples.png")}
          style={styles.mainImage}
        />

        <View style={styles.resultBox}>
          {selected && (
            <Image
              source={require("../../assets/images/applecor.png")}
              style={styles.resultImage}
            />
          )}
        </View>
      </View>

      <View style={styles.optionsRow}>
        {!completed && (
          <>
            <TouchableOpacity onPress={() => handleSelect("banana")}>
              <Image
                source={require("../../assets/images/bnana.png")}
                style={styles.optionImage}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleSelect("apple")}>
              <Image
                source={require("../../assets/images/applecor.png")}
                style={styles.optionImage}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleSelect("wrong")}>
              <Image
                source={require("../../assets/images/rong.png")}
                style={styles.optionImage}
              />
            </TouchableOpacity>
          </>
        )}
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

      <Modal
        visible={showPerformance}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPerformance(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>📊 Dashboard الأداء</Text>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>عدد الألعاب:</Text>
              <Text style={styles.statValue}>{totalGames}</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>عدد المحاولات:</Text>
              <Text style={styles.statValue}>{performanceData.attempts}</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>عدد الأخطاء:</Text>
              <Text style={styles.statValue}>{performanceData.wrongAttempts}</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>الزمن المستغرق:</Text>
              <Text style={styles.statValue}>
                {performanceData.elapsedSeconds.toFixed(1)} ثانية
              </Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>نسبة الفوز:</Text>
              <Text style={styles.statValue}>100%</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>متوسط الحركات:</Text>
              <Text style={styles.statValue}>{performanceData.attempts}</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>متوسط السرعة:</Text>
              <Text style={styles.statValue}>{performanceData.speedScore}%</Text>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statLabel}>مؤشر الإدراك البصري الحركي VMI:</Text>
              <Text style={styles.statValue}>{performanceData.vmi}%</Text>
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
    paddingHorizontal: 20,
  },

  mainText: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },

  mainRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    gap: 20,
  },

  mainImage: {
    width: 100,
    height: 150,
    borderRadius: 10,
  },

  resultBox: {
    width: 100,
    height: 150,
    backgroundColor: "#eee",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  resultImage: {
    width: 100,
    height: 150,
    borderRadius: 10,
  },

  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 40,
  },

  optionImage: {
    width: 80,
    height: 120,
    borderRadius: 10,
  },

  message: {
    textAlign: "center",
    marginTop: 15,
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


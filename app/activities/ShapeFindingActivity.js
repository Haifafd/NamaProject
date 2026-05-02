import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

// استيراد إعدادات Firebase
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";

// استيراد مكونات الثيم الموحد والـ ResultModal
import { AppLayout, BORDER, CARD, MUTED, PRIMARY } from "./ActivityStyle";
import ResultModal from "./Result"; // تأكد من مطابقة المسار لملف النتائج الموحد لديك

// وظائف الحسابات لمؤشرات الأداء
function calculateVisualMotorIndex(accuracy, speedScore, errorRate) {
  return accuracy * 0.4 + speedScore * 0.3 + (1 - errorRate) * 0.3;
}

function calculateCognitiveIndex(accuracy, speedScore, consistency) {
  return accuracy * 0.5 + speedScore * 0.3 + consistency * 0.2;
}

export default function MatchGame() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(false);
  const [gameState, setGameState] = useState("playing"); // playing, won

  const attemptsRef = useRef(0);
  const wrongAttemptsRef = useRef(0);
  const startTimeRef = useRef(Date.now());
  const firstTryCorrectRef = useRef(false);

  const correctAnswer = "apple";

  // دالة حفظ النتائج في Firebase
  const saveResultToFirebase = async (vmi, cpi, finalScore) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "ActivityResults"), {
          childId: user.uid,
          activityId: "match_similar_shape",
          vmiScore: Math.round(vmi * 100),
          cpiScore: Math.round(cpi * 100),
          totalScore: Math.round(finalScore),
          errors: wrongAttemptsRef.current,
          timeSpent: parseFloat(((Date.now() - startTimeRef.current) / 1000).toFixed(1)),
          status: "completed",
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("❌ Firebase Save Error:", error);
    }
  };

  const handleSelect = (type) => {
    if (completed) return;
    attemptsRef.current += 1;

    if (type === correctAnswer) {
      setSelected(type);
      setMessage("🎉 أحسنت يا بطل!");
      setCompleted(true);
      setGameState("won"); // تفعيل ظهور نافذة النتائج

      if (attemptsRef.current === 1) firstTryCorrectRef.current = true;

      const endTime = Date.now();
      const elapsedSeconds = (endTime - startTimeRef.current) / 1000;
      const speedScore = Math.max(0, Math.min(1, 1 - elapsedSeconds / 30));
      const errorRate = wrongAttemptsRef.current / attemptsRef.current;
      const consistency = firstTryCorrectRef.current ? 1 : Math.max(0, 1 - errorRate);

      const vmi = calculateVisualMotorIndex(1, speedScore, errorRate);
      const cpi = calculateCognitiveIndex(1, speedScore, consistency);
      const finalScore = ((vmi + cpi) / 2) * 100;

      saveResultToFirebase(vmi, cpi, finalScore);
    } else {
      wrongAttemptsRef.current += 1;
      setMessage("❌ حاول مرة أخرى، أنت تستطيع!");
    }
  };

  const handleReset = () => {
    setSelected(null);
    setMessage("");
    setCompleted(false);
    setGameState("playing");
    attemptsRef.current = 0;
    wrongAttemptsRef.current = 0;
    startTimeRef.current = Date.now();
  };

  const progress = completed ? 100 : 0;

  return (
    <AppLayout activeTab="activities">
      {/* الهيدر: الزر يسار والنص يمين */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY} />
        </TouchableOpacity>
        
        <View style={styles.titleBlock}>
          <Text style={styles.mainTitle}>نشاط إيجاد الشكل المتماثل</Text>
          <Text style={styles.levelSubtitle}>مستوى 1 . مهارة المعرفة</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
           <Text style={styles.progressValue}>{progress}%</Text>
           <Text style={styles.progressLabel}>مستوى التقدم</Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.gameArea}>
        <Text style={styles.instructionText}>
          قم باختيار الشكل المتماثل من بين الأشكال الظاهرة
        </Text>

        <View style={styles.matchContainer}>
          <View style={styles.imageWrapper}>
            <Image source={require("../../assets/images/apples.png")} style={styles.matchImage} />
          </View>
          
          <Ionicons name="reorder-two-outline" size={40} color={BORDER} style={{transform: [{rotate: '90deg'}]}} />

          <View style={[styles.resultSlot, selected && {borderColor: PRIMARY}]}>
            {selected ? (
              <Image source={require("../../assets/images/applecor.png")} style={styles.matchImage} />
            ) : (
              <Ionicons name="help-circle" size={50} color={BORDER} />
            )}
          </View>
        </View>

        <View style={styles.optionsGrid}>
          {!completed && (
            <>
              {["banana", "apple", "wrong"].map((type, index) => {
                const images = {
                  banana: require("../../assets/images/bnana.png"),
                  apple: require("../../assets/images/applecor.png"),
                  wrong: require("../../assets/images/rong.png"),
                };
                return (
                  <TouchableOpacity key={index} style={styles.optionCard} onPress={() => handleSelect(type)}>
                    <Image source={images[type]} style={styles.optionImg} resizeMode="contain" />
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </View>

        <Text style={[styles.statusMessage, {color: completed ? PRIMARY : "#FF6B6B"}]}>{message}</Text>
      </ScrollView>

      {/* نافذة النتائج الموحدة */}
      <ResultModal 
        visible={gameState !== "playing"} 
        state={gameState} 
        onReset={handleReset} 
        onNavigateNext={() => router.back()} // أو التوجه لنشاط محدد
      />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  // تعديل الهيدر ليكون الزر يسار والنص يمين
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20, 
    paddingTop: 50,
    paddingBottom: 20
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: CARD, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 2 
  },
  titleBlock: { alignItems: 'flex-end' },
  mainTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  levelSubtitle: { color: PRIMARY, fontWeight: 'bold', fontSize: 12 },
  
  progressSection: { paddingHorizontal: 25, marginBottom: 20 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  progressLabel: { fontSize: 13, color: MUTED },
  progressValue: { fontSize: 12, fontWeight: 'bold', color: PRIMARY },
  progressBg: { height: 8, backgroundColor: BORDER, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: PRIMARY },
  
  gameArea: { alignItems: 'center', paddingVertical: 10 },
  instructionText: { fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#475569', paddingHorizontal: 30, marginBottom: 25 },
  matchContainer: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 40 },
  imageWrapper: { width: 110, height: 140, backgroundColor: CARD, borderRadius: 20, padding: 10, elevation: 3 },
  resultSlot: { width: 110, height: 140, backgroundColor: BORDER, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: MUTED, justifyContent: 'center', alignItems: 'center' },
  matchImage: { width: '100%', height: '100%', borderRadius: 15 },
  optionsGrid: { flexDirection: 'row', gap: 15, justifyContent: 'center' },
  optionCard: { width: 90, height: 120, backgroundColor: CARD, borderRadius: 15, padding: 10, elevation: 4, borderWidth: 1, borderColor: BORDER },
  optionImg: { width: '100%', height: '100%' },
  statusMessage: { marginTop: 25, fontSize: 18, fontWeight: 'bold' },
});

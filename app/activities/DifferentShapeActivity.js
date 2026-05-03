import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";
import { AppLayout, BORDER, CARD, MUTED, PRIMARY } from "./ActivityStyle";
import ResultModal from "./Result";

const { width } = Dimensions.get("window");

const FRUITS_DATA = [
  { id: 1, uri: "https://cdn-icons-png.flaticon.com/512/415/415733.png" },
  { id: 2, uri: "https://cdn-icons-png.flaticon.com/512/2909/2909761.png" },
  { id: 3, uri: "https://cdn-icons-png.flaticon.com/512/1728/1728765.png" },
  { id: 4, uri: "https://cdn-icons-png.flaticon.com/512/599/599502.png" },
  { id: 5, uri: "https://cdn-icons-png.flaticon.com/512/2153/2153788.png" },
  { id: 6, uri: "https://cdn-icons-png.flaticon.com/512/3137/3137044.png" },
  { id: 7, uri: "https://cdn-icons-png.flaticon.com/512/2106/2106111.png" },
  { id: 8, uri: "https://cdn-icons-png.flaticon.com/512/2224/2224115.png" },
  { id: 9, uri: "https://cdn-icons-png.flaticon.com/512/2909/2909808.png" },
  { id: 10, uri: "https://cdn-icons-png.flaticon.com/512/2909/2909841.png" },
];

function calculateCognitiveIndex(accuracy, speedScore, consistency) {
  return (accuracy * 0.5) + (speedScore * 0.3) + (consistency * 0.2);
}

export default function FindDifferentGame({ navigation, route }) {
  const router = useRouter();
  const activityId = route?.params?.activityId || "7uE1Wl6s17R2t4pMOA9Z"; 

  const [gameState, setGameState] = useState("playing"); 
  const [showFinalResult, setShowFinalResult] = useState(false); // حالة جديدة للتحكم في ظهور المودال النهائي
  const [gameItems, setGameItems] = useState([]);
  const [progress, setProgress] = useState(0); 
  const [currentExercise, setCurrentExercise] = useState(1);
  const TOTAL_EXERCISES = 5;

  const exerciseStartTime = useRef(Date.now());
  const totalCorrect = useRef(0);
  const totalAttempts = useRef(0);
  const responseTimes = useRef([]); 

  const generateLevel = useCallback(() => {
    const mainFruit = FRUITS_DATA[Math.floor(Math.random() * FRUITS_DATA.length)];
    let diffFruit;
    do {
      diffFruit = FRUITS_DATA[Math.floor(Math.random() * FRUITS_DATA.length)];
    } while (diffFruit.id === mainFruit.id);

    const items = [
      { uri: mainFruit.uri, isCorrect: false },
      { uri: mainFruit.uri, isCorrect: false },
      { uri: mainFruit.uri, isCorrect: false },
      { uri: diffFruit.uri, isCorrect: true },
    ];

    setGameItems(items.sort(() => Math.random() - 0.5));
    setGameState("playing");
    exerciseStartTime.current = Date.now(); 
  }, []);

  useEffect(() => {
    generateLevel();
  }, [generateLevel]);

  const saveToDatabase = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const accuracy = totalCorrect.current / totalAttempts.current;
        const avgTime = responseTimes.current.reduce((a, b) => a + b, 0) / TOTAL_EXERCISES;
        const speedScore = Math.max(0, 1 - avgTime / 5);
        const variance = responseTimes.current.reduce((a, b) => a + Math.pow(b - avgTime, 2), 0) / TOTAL_EXERCISES;
        const consistency = Math.max(0, 1 - Math.sqrt(variance) / 2);
        const cpi = calculateCognitiveIndex(accuracy, speedScore, consistency);

        await addDoc(collection(db, "ActivityResults"), {
          childId: user.uid,
          activityId: activityId,
          cognitiveProcessingIndex: parseFloat(cpi.toFixed(2)),
          totalExercises: TOTAL_EXERCISES,
          status: "completed",
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("❌ Firebase Save Error:", error);
    }
  };

  const handleChoice = (isCorrect) => {
    if (gameState !== "playing") return;
    
    totalAttempts.current += 1;
    const timeTaken = (Date.now() - exerciseStartTime.current) / 1000;

    if (isCorrect) {
      totalCorrect.current += 1;
      responseTimes.current.push(timeTaken);
      
      const newProgress = (currentExercise / TOTAL_EXERCISES) * 100;
      setProgress(newProgress);

      if (currentExercise < TOTAL_EXERCISES) {
        // بدلاً من إظهار المودال، ننتقل فوراً للمرحلة التالية
        setCurrentExercise(prev => prev + 1);
        generateLevel();
      } else {
        // وصلنا لنهاية الخمس تمارين
        saveToDatabase();
        setGameState("won");
        setShowFinalResult(true); // الآن فقط يظهر المودال
      }
    } else {
      // إذا أخطأ، يمكننا إما إعادة المرحلة أو إظهار مودال المحاولة مرة أخرى
      setGameState("lost");
      setShowFinalResult(true);
    }
  };

  return (
    <AppLayout activeTab="activities">
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>إيجاد الشكل المختلف</Text>
          <Text style={styles.subtitle}>تمرين {currentExercise} من {TOTAL_EXERCISES}</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>مستوى التقدم</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressPct}>{Math.round(progress)}%</Text>
      </View>

      <View style={styles.questionSection}>
        <Text style={styles.questionTitle}>أين الشكل المختلف؟</Text>
        <Text style={styles.questionSub}>ركز جيداً واختر الصورة المختلفة</Text>
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.gridRow}>
          {gameItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.imageCard}
              onPress={() => handleChoice(item.isCorrect)}
            >
              <Image source={{ uri: item.uri }} style={styles.gameImg} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* المودال يظهر فقط عند الخسارة أو عند إتمام الـ 5 مراحل */}
      <ResultModal 
        visible={showFinalResult} 
        state={gameState} 
        onReset={() => {
          if (gameState === "lost") {
            setShowFinalResult(false);
            generateLevel();
          } else {
            router.back();
          }
        }} 
        onNavigateNext={() => router.back()} 
      />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, justifyContent: 'space-between' },
  backBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: CARD, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 32, color: PRIMARY, fontWeight: 'bold' },
  titleBlock: { alignItems: "flex-end" },
  title: { fontSize: 18, fontWeight: "700", color: "#2d2d2d" },
  subtitle: { fontSize: 12, color: PRIMARY, fontWeight: '600' },
  progressRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8, paddingHorizontal: 20, marginBottom: 10 },
  progressLabel: { fontSize: 13, color: MUTED, width: 85, textAlign: 'right' },
  progressBg: { flex: 1, height: 12, borderRadius: 6, backgroundColor: BORDER, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: PRIMARY, borderRadius: 6 },
  progressPct: { fontSize: 13, fontWeight: "700", color: PRIMARY, width: 40, textAlign: 'left' },
  questionSection: { alignItems: "center", marginTop: 20, paddingHorizontal: 20 },
  questionTitle: { fontSize: 22, fontWeight: "bold", color: "#333" },
  questionSub: { fontSize: 14, color: MUTED, textAlign: "center", marginTop: 5 },
  gridContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  gridRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 15 },
  imageCard: { width: width * 0.4, aspectRatio: 1, backgroundColor: CARD, borderRadius: 20, justifyContent: "center", alignItems: "center", elevation: 4 },
  gameImg: { width: "70%", height: "70%", resizeMode: "contain" },
}); 

import { useRouter } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { auth, db } from "../../FirebaseConfig";
import { AppLayout, BORDER, CARD, MUTED, PRIMARY } from "./ActivityStyle";

const { width } = Dimensions.get("window");

export default function XOGame() {
  const router = useRouter(); 
  const [board, setBoard] = useState(Array(9).fill(null));
  const [userChoice, setUserChoice] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [gameState, setGameState] = useState("playing");

  const startTimeRef = useRef(null);
  const movesCountRef = useRef(0);

  useEffect(() => {
    if (userChoice && !startTimeRef.current) {
      startTimeRef.current = Date.now();
    }
  }, [userChoice]);

  const saveResultToFirebase = async (finalState) => {
    try {
      const user = auth.currentUser;
      if (user && startTimeRef.current) {
        const endTime = Date.now();
        const elapsedSeconds = (endTime - startTimeRef.current) / 1000;
        const score = finalState === "won" ? 100 : finalState === "draw" ? 70 : 40;

        await addDoc(collection(db, "ActivityResults"), {
          childId: user.uid,
          activityId: "xo_planning_challenge",
          totalScore: score,
          status: finalState,
          moves: movesCountRef.current,
          timeSpent: parseFloat(elapsedSeconds.toFixed(1)),
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("❌ Firebase Save Error:", error);
    }
  };

  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let line of lines) {
      const [a, b, c] = line;
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) return squares[a];
    }
    return squares.every((s) => s !== null) ? "draw" : null;
  };

  const handlePress = (index) => {
    if (!userChoice || board[index] || gameState !== "playing") return;
    
    movesCountRef.current += 1;
    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);
    
    const result = checkWinner(newBoard);
    if (result) {
      let finalState = result === "draw" ? "draw" : (result === userChoice ? "won" : "lost");
      setGameState(finalState);
      saveResultToFirebase(finalState);
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setUserChoice(null);
    setCurrentPlayer("X");
    setGameState("playing");
    startTimeRef.current = null;
    movesCountRef.current = 0;
  };

  // مستوى الإنجاز يبدأ من 0%
  const completionRate = gameState === "won" ? "100%" : "0%";

  return (
    <AppLayout activeTab="activities">
      <StatusBar barStyle="dark-content" />
      
      {/* الهيدر المعدل */}
      <View style={styles.header}>
        {/* الزر الآن في أقصى اليسار */}
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()} 
        >
          <Text style={styles.backArrow}>‹</Text> 
        </TouchableOpacity>

        {/* النصوص الآن في أقصى اليمين */}
        <View style={styles.headerTitles}>
          <Text style={styles.mainTitle}>تحدي الذكاء XO</Text>
          <Text style={styles.subTitle}>مستوى ٣ . مهارة التخطيط</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
           <Text style={styles.progressValue}>{completionRate}</Text>
           <Text style={styles.progressLabel}>مستوى الإنجاز</Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: completionRate }]} />
        </View>
      </View>

      <View style={styles.gameContainer}>
        <Text style={styles.instruction}>بطل نماء، اختر رمزك للبدء</Text>

        <View style={styles.choicesRow}>
          {["X", "O"].map((symbol) => (
            <TouchableOpacity
              key={symbol}
              disabled={board.some(cell => cell !== null)}
              onPress={() => setUserChoice(symbol)}
              style={[
                styles.choiceCard, 
                userChoice === symbol && styles.choiceCardActive
              ]}
            >
              <Text style={[
                styles.choiceSymbol, 
                userChoice === symbol && styles.choiceSymbolActive
              ]}>
                {symbol}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.boardGrid}>
          {board.map((cell, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.gridCell,
                index < 6 && { borderBottomWidth: 2, borderBottomColor: BORDER },
                (index % 3 !== 2) && { borderRightWidth: 2, borderRightColor: BORDER }
              ]} 
              onPress={() => handlePress(index)}
              activeOpacity={0.6}
            >
              <Text style={[
                styles.cellText, 
                cell === "X" ? styles.xStyle : styles.oStyle
              ]}>
                {cell}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {!userChoice && (
          <View style={styles.hintBox}>
             <Text style={styles.hintText}>💡 اختر X أو O لبدء التحدي</Text>
          </View>
        )}
      </View>

      <Modal visible={gameState !== "playing"} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalEmoji}>
               {gameState === "won" ? "🏆" : gameState === "lost" ? "💪" : "🤝"}
            </Text>
            <Text style={styles.modalTitle}>
              {gameState === "won" ? "أحسنت يا بطل!" : gameState === "lost" ? "محاولة جيدة!" : "تعادل ذكي!"}
            </Text>
            <Text style={styles.modalSub}>
              {gameState === "won" ? "لقد انتصرت بذكائك وتخطيطك" : "حاول مرة أخرى لتطوير مهارتك"}
            </Text>
            
            <TouchableOpacity style={styles.retryBtn} onPress={resetGame}>
              <Text style={styles.retryText}>إعادة التحدي 🔄</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: "row", // استخدام صف عادي
    justifyContent: "space-between", // توزيع العناصر (واحد يمين وواحد يسار)
    paddingHorizontal: 20, 
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: "center",
  },
  backBtn: { 
    width: 40, height: 40, borderRadius: 20, backgroundColor: CARD, 
    justifyContent: "center", alignItems: "center", elevation: 4 
  },
  backArrow: { fontSize: 35, color: PRIMARY, fontWeight: 'bold' },
  headerTitles: { 
    alignItems: "flex-end" // محاذاة محتوى النصوص لليمين
  },
  mainTitle: { fontSize: 18, fontWeight: "bold", color: "#1E293B" },
  subTitle: { fontSize: 12, color: PRIMARY, fontWeight: '600' },
  progressSection: { paddingHorizontal: 25, marginBottom: 20 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  progressValue: { fontSize: 12, fontWeight: "bold", color: PRIMARY },
  progressLabel: { fontSize: 13, color: MUTED },
  progressBg: { height: 8, backgroundColor: "#E2E8F0", borderRadius: 4 },
  progressFill: { height: "100%", backgroundColor: PRIMARY, borderRadius: 4 },
  gameContainer: { flex: 1, alignItems: "center", paddingTop: 10 },
  instruction: { fontSize: 17, fontWeight: "bold", marginBottom: 20, color: "#475569" },
  choicesRow: { flexDirection: "row", marginBottom: 30, gap: 20 },
  choiceCard: { 
    width: 70, height: 70, backgroundColor: CARD, borderRadius: 20, 
    justifyContent: "center", alignItems: "center", elevation: 3,
    borderWidth: 2, borderColor: 'transparent'
  },
  choiceCardActive: { borderColor: PRIMARY, backgroundColor: "#F0FDF4" },
  choiceSymbol: { fontSize: 28, color: MUTED, fontWeight: "900" },
  choiceSymbolActive: { color: PRIMARY },
  boardGrid: { 
    width: width * 0.85, height: width * 0.85, flexDirection: "row", flexWrap: "wrap", 
    backgroundColor: CARD, borderRadius: 30, padding: 15, elevation: 8
  },
  gridCell: { 
    width: "33.33%", height: "33.33%", justifyContent: "center", alignItems: "center"
  },
  cellText: { fontSize: 50, fontWeight: "900" },
  xStyle: { color: "#334155" },
  oStyle: { color: PRIMARY },
  hintBox: { marginTop: 20, padding: 10, backgroundColor: "#FEFCE8", borderRadius: 12 },
  hintText: { color: "#854D0E", fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(30, 41, 59, 0.7)", justifyContent: "center", alignItems: "center" },
  modalCard: { backgroundColor: CARD, padding: 30, borderRadius: 40, alignItems: "center", width: "85%", elevation: 20 },
  modalEmoji: { fontSize: 60, marginBottom: 10 },
  modalTitle: { fontSize: 24, fontWeight: "bold", color: "#1E293B", marginBottom: 5 },
  modalSub: { fontSize: 16, color: MUTED, marginBottom: 25 },
  retryBtn: { backgroundColor: PRIMARY, paddingHorizontal: 40, paddingVertical: 15, borderRadius: 20, elevation: 4 },
  retryText: { color: "#FFF", fontWeight: "bold", fontSize: 17 },
});

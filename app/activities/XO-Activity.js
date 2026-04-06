import { useState } from "react";
import {
    Dimensions,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function XOGame() {
  // الحالات
  const [board, setBoard] = useState(Array(9).fill(null));
  const [userChoice, setUserChoice] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [gameState, setGameState] = useState("playing");

  // التحقق من الفائز
  const checkWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let line of lines) {
      const [a, b, c] = line;
      if (
        squares[a] &&
        squares[a] === squares[b] &&
        squares[a] === squares[c]
      ) {
        return squares[a];
      }
    }

    return squares.every((s) => s !== null) ? "draw" : null;
  };

  // عند الضغط على خانة
  const handlePress = (index) => {
    if (!userChoice || board[index] || gameState !== "playing") return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const result = checkWinner(newBoard);

    if (result) {
      if (result === "draw") setGameState("draw");
      else setGameState(result === userChoice ? "won" : "lost");
    } else {
      setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    }
  };

  // إعادة اللعبة
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setUserChoice(null);
    setCurrentPlayer("X");
    setGameState("playing");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* الهيدر */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerTitles}>
          <Text style={styles.mainTitle}>لعبة XO</Text>
          <Text style={styles.subTitle}>مستوى ٣ . مهارة المعرفة</Text>
        </View>
      </View>

      {/* البروجريس */}
      <View style={styles.progressSection}>
        <Text style={styles.progressValue}>65%</Text>
        <Text style={styles.progressLabel}>مستوى التقدم</Text>

        <View style={styles.progressBg}>
          <View style={styles.progressFill} />
        </View>
      </View>

      {/* منطقة اللعبة */}
      <View style={styles.gameArea}>
        <Text style={styles.instruction}>اختر رمزك</Text>

        {/* اختيار X و O */}
        <View style={styles.choices}>
          <TouchableOpacity
            onPress={() => setUserChoice("X")}
            style={[
              styles.choiceBtn,
              userChoice === "X" && styles.choiceBtnActive,
            ]}
          >
            <Text
              style={[
                styles.choiceText,
                userChoice === "X" && styles.choiceTextActive,
              ]}
            >
              X
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setUserChoice("O")}
            style={[
              styles.choiceBtn,
              userChoice === "O" && styles.choiceBtnActive,
            ]}
          >
            <Text
              style={[
                styles.choiceText,
                userChoice === "O" && styles.choiceTextActive,
              ]}
            >
              O
            </Text>
          </TouchableOpacity>
        </View>

        {/* لوحة XO */}
        <View style={styles.board}>
          {board.map((cell, index) => (
            <TouchableOpacity
              key={index}
              style={styles.cell}
              onPress={() => handlePress(index)}
            >
              <Text
                style={[
                  styles.cellText,
                  cell === "X" ? styles.xColor : styles.oColor,
                ]}
              >
                {cell}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!userChoice && <Text style={styles.warning}>اختر رمزك أولاً</Text>}
      </View>

      {/* البار السفلي */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconInactive}>🏠</Text>
          <Text style={styles.navTextInactive}>الرئيسية</Text>
        </TouchableOpacity>

        <View style={styles.activeTab}>
          <Text style={styles.navIconActive}>🎮</Text>
          <Text style={styles.navTextActive}>نشاط</Text>
        </View>

        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIconInactive}>👤</Text>
          <Text style={styles.navTextInactive}>حسابي</Text>
        </TouchableOpacity>
      </View>

      {/* النتيجة */}
      <Modal visible={gameState !== "playing"} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {gameState === "won"
                ? "🎉 عمل رائع!"
                : gameState === "lost"
                  ? "😢 حاول مرة أخرى"
                  : "🤝 تعادل"}
            </Text>

            <TouchableOpacity style={styles.actionBtn} onPress={resetGame}>
              <Text style={styles.actionText}>إعادة اللعب</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAFFFA" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },

  backBtn: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },

  backArrow: { fontSize: 22, color: "#4CAF50" },

  headerTitles: { alignItems: "flex-end" },

  mainTitle: { fontSize: 20, fontWeight: "bold", color: "#1B5E20" },
  subTitle: { fontSize: 13, color: "#81C784" },

  progressSection: { paddingHorizontal: 25 },

  progressValue: {
    position: "absolute",
    left: 25,
    fontSize: 12,
    color: "#999",
  },

  progressLabel: {
    textAlign: "right",
    fontSize: 13,
    color: "#2E7D32",
    marginBottom: 8,
  },

  progressBg: {
    height: 10,
    backgroundColor: "#E0E0E0",
    borderRadius: 5,
  },

  progressFill: {
    height: "100%",
    width: "65%",
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },

  gameArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  instruction: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },

  choices: {
    flexDirection: "row",
    marginBottom: 20,
  },

  choiceBtn: {
    width: 90,
    height: 45,
    backgroundColor: "#DDD",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },

  choiceBtnActive: {
    backgroundColor: "#A5D6A7",
  },

  choiceText: {
    fontSize: 20,
    color: "#777",
    fontWeight: "bold",
  },

  choiceTextActive: {
    color: "#1B5E20",
  },

  board: {
    width: width * 0.7,
    height: width * 0.7,
    flexDirection: "row",
    flexWrap: "wrap",
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 15,
  },

  cell: {
    width: "33.33%",
    height: "33.33%",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },

  cellText: {
    fontSize: 42,
    fontWeight: "bold",
  },

  xColor: { color: "#333" },
  oColor: { color: "#4CAF50" },

  warning: {
    marginTop: 10,
    color: "#FF8A80",
    fontWeight: "bold",
  },

  bottomNav: {
    flexDirection: "row",
    height: 90,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 15,
    elevation: 10,
  },

  navItem: { alignItems: "center" },

  activeTab: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },

  navIconActive: { fontSize: 20 },
  navTextActive: { color: "#4CAF50", fontWeight: "bold" },

  navIconInactive: { fontSize: 22, color: "#DDD" },
  navTextInactive: { color: "#DDD", fontSize: 12 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    backgroundColor: "#FFF",
    padding: 30,
    borderRadius: 30,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 22,
    marginBottom: 20,
  },

  actionBtn: {
    backgroundColor: "#CCFF00",
    padding: 15,
    borderRadius: 20,
  },

  actionText: {
    fontWeight: "bold",
  },
});

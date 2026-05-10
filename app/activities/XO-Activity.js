import { useEffect, useRef, useState } from "react";
import {
  Animated,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
import { saveActivityResult } from "../../Services/ActivityService";
import ResultModal from "./Result";
import {
  GARDEN,
  NoumiCompanion,
  SpeechBubble,
  SunSVG,
  CloudSmall,
  MiniFlower,
  sharedGameStyles,
} from "./_GameComponents";
import { fetchChildGender, speak } from "../../Services/SpeechHelper";

const X_COLOR = "#EF5350";
const O_COLOR = "#42A5F5";

const checkWinner = (board) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  if (board.every((c) => c)) return { winner: "draw", line: null };
  return null;
};

function XMark({ size = 60 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <Path
        d="M 12 12 L 48 48"
        stroke={X_COLOR}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <Path
        d="M 48 12 L 12 48"
        stroke={X_COLOR}
        strokeWidth="9"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function OMark({ size = 60 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <Circle
        cx="30"
        cy="30"
        r="20"
        stroke={O_COLOR}
        strokeWidth="9"
        fill="none"
      />
    </Svg>
  );
}

export default function XOGame() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } = useLocalSearchParams();

  const [phase, setPhase] = useState("pick");
  const [childGender, setChildGender] = useState("female");
  const [childSymbol, setChildSymbol] = useState(null);
  const [round, setRound] = useState(1);
  const [board, setBoard] = useState(Array(9).fill(""));
  const [currentTurn, setCurrentTurn] = useState("X");
  const [winningLine, setWinningLine] = useState(null);
  const [gameState, setGameState] = useState("playing");
  const [finalStars, setFinalStars] = useState(0);

  const [noumiExpression, setNoumiExpression] = useState("idle");
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleColor, setBubbleColor] = useState(GARDEN.bubbleHappy);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const noumiBounce = useRef(new Animated.Value(0)).current;
  const noumiShake = useRef(new Animated.Value(0)).current;
  const startTime = useRef(Date.now());
  const childWins = useRef(0);
  const opponentWins = useRef(0);
  const draws = useRef(0);
  const bubbleTimerRef = useRef(null);

  const opponentSymbol = childSymbol === "X" ? "O" : "X";

  useEffect(() => {
    if (childId) fetchChildGender(childId).then(setChildGender);
  }, [childId]);

  useEffect(() => {
    if (phase === "pick") {
      showSpeechBubble(speak("اختر ❌ أو ⭕!", childGender), GARDEN.bubbleHappy, "happy", 2500);
    }
  }, [phase]);

  const showSpeechBubble = (text, color, expression, duration = 1500) => {
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    setBubbleText(text);
    setBubbleColor(color);
    setNoumiExpression(expression);
    setBubbleVisible(true);

    if (expression === "happy" || expression === "excited") {
      Animated.sequence([
        Animated.timing(noumiBounce, { toValue: -8, duration: 200, useNativeDriver: true }),
        Animated.timing(noumiBounce, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    } else if (expression === "sad") {
      Animated.sequence([
        Animated.timing(noumiShake, { toValue: -3, duration: 100, useNativeDriver: true }),
        Animated.timing(noumiShake, { toValue: 3, duration: 100, useNativeDriver: true }),
        Animated.timing(noumiShake, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }

    bubbleTimerRef.current = setTimeout(() => {
      setBubbleVisible(false);
      setNoumiExpression("idle");
    }, duration);
  };

  const handlePickSymbol = (symbol) => {
    setChildSymbol(symbol);
    setPhase("playing");
    showSpeechBubble(speak("هيا نلعب!", childGender), GARDEN.bubbleHappy, "happy", 1800);
  };

  const handleCellPress = (i) => {
    if (board[i] || gameState !== "playing" || phase !== "playing") return;

    const newBoard = [...board];
    newBoard[i] = currentTurn;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      handleRoundEnd(result.winner, result.line);
    } else {
      setCurrentTurn(currentTurn === "X" ? "O" : "X");
    }
  };

  const handleRoundEnd = (winner, line) => {
    setWinningLine(line);

    if (winner === childSymbol) {
      childWins.current += 1;
      showSpeechBubble(speak("فزت يا بطل!", childGender), GARDEN.bubbleHappy, "happy", 2200);
    } else if (winner === "draw") {
      draws.current += 1;
      showSpeechBubble(speak("تعادل! حاول مرة ثانية", childGender), GARDEN.bubbleExcited, "idle", 2200);
    } else {
      opponentWins.current += 1;
      showSpeechBubble(speak("لا تيأس، حاول!", childGender), GARDEN.bubbleSad, "sad", 2200);
    }

    setTimeout(() => {
      if (round < 3) {
        setRound(round + 1);
        setBoard(Array(9).fill(""));
        setCurrentTurn("X");
        setWinningLine(null);
      } else {
        finishGame();
      }
    }, 2500);
  };

  const finishGame = async () => {
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const wins = childWins.current;

    let stars = wins > 0 ? Math.min(wins, 3) : 1;

    setFinalStars(stars);
    setGameState("won");

    if (childId && activityId) {
      await saveActivityResult({
        childId,
        activityId,
        activityTitle: activityTitle || "تحدي الذكاء",
        category: category || "thinkingCategoryID",
        level: 3,
        correctAnswers: wins,
        wrongAnswers: opponentWins.current + draws.current,
        totalAttempts: 3,
        durationSec: duration,
      });
    }
  };

  const handleReset = () => {
    setPhase("pick");
    setChildSymbol(null);
    setRound(1);
    setBoard(Array(9).fill(""));
    setCurrentTurn("X");
    setWinningLine(null);
    setGameState("playing");
    setFinalStars(0);
    childWins.current = 0;
    opponentWins.current = 0;
    draws.current = 0;
    startTime.current = Date.now();
  };

  const handleBackToPath = () => {
    if (childId) {
      router.replace({ pathname: "/child/Home", params: { childId } });
    } else {
      router.back();
    }
  };

  const renderCell = (i) => {
    const cell = board[i];
    const isWinning = winningLine && winningLine.includes(i);
    const row = Math.floor(i / 3);
    const col = i % 3;

    return (
      <TouchableOpacity
        key={i}
        style={[
          styles.cell,
          col < 2 && styles.cellRightBorder,
          row < 2 && styles.cellBottomBorder,
          isWinning && styles.cellWinning,
        ]}
        onPress={() => handleCellPress(i)}
        activeOpacity={cell ? 1 : 0.7}
        disabled={!!cell || gameState !== "playing"}
      >
        {cell === "X" && <XMark size={62} />}
        {cell === "O" && <OMark size={62} />}
      </TouchableOpacity>
    );
  };

  if (phase === "pick") {
    return (
      <View style={sharedGameStyles.container}>
        <StatusBar barStyle="light-content" backgroundColor={GARDEN.skyTop} />

        <View style={sharedGameStyles.skyLayer}>
          <View style={sharedGameStyles.sun}><SunSVG size={55} /></View>
          <View style={sharedGameStyles.cloud1}><CloudSmall size={50} /></View>
          <View style={sharedGameStyles.cloud2}><CloudSmall size={40} /></View>
        </View>
        <View style={sharedGameStyles.gardenBg} />

        <View style={sharedGameStyles.header}>
          <TouchableOpacity style={sharedGameStyles.backBtn} onPress={handleBackToPath}>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M 14 6 L 8 12 L 14 18" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </TouchableOpacity>
          <View style={sharedGameStyles.titleBlock}>
            <Text style={sharedGameStyles.title}>تحدي الذكاء</Text>
            <Text style={sharedGameStyles.subtitle}>اختر رمزك</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <View style={sharedGameStyles.flowerTopLeft}><MiniFlower size={26} color={GARDEN.flowerPink} /></View>
        <View style={sharedGameStyles.flowerTopRight}><MiniFlower size={24} color={GARDEN.flowerYellow} /></View>
        <View style={sharedGameStyles.flowerBottomLeft}><MiniFlower size={22} color={GARDEN.flowerPurple} /></View>
        <View style={sharedGameStyles.flowerBottomRight}><MiniFlower size={20} color={GARDEN.flowerPink} /></View>

        <View style={styles.pickArea}>
          <View style={styles.pickTitleBox}>
            <Text style={styles.pickTitle}>اختر رمزك!</Text>
          </View>

          <View style={styles.pickRow}>
            <TouchableOpacity
              style={[styles.pickBtn, { borderColor: X_COLOR }]}
              onPress={() => handlePickSymbol("X")}
              activeOpacity={0.85}
            >
              <XMark size={80} />
              <Text style={[styles.pickLabel, { color: X_COLOR }]}>أحمر</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.pickBtn, { borderColor: O_COLOR }]}
              onPress={() => handlePickSymbol("O")}
              activeOpacity={0.85}
            >
              <OMark size={80} />
              <Text style={[styles.pickLabel, { color: O_COLOR }]}>أزرق</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.pickHint}>
            العبي مع أمك أو الأخصائية
          </Text>
        </View>

        <View style={sharedGameStyles.noumiCorner} pointerEvents="none">
          <SpeechBubble text={bubbleText} color={bubbleColor} visible={bubbleVisible} />
          <Animated.View style={{ transform: [{ translateY: noumiBounce }, { translateX: noumiShake }] }}>
            <NoumiCompanion size={110} expression={noumiExpression} />
          </Animated.View>
        </View>
      </View>
    );
  }

  const overallProgress = (round - 1) / 3 + (board.filter(c => c).length / 9 / 3);
  const isChildTurn = currentTurn === childSymbol;

  return (
    <View style={sharedGameStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={GARDEN.skyTop} />

      <View style={sharedGameStyles.skyLayer}>
        <View style={sharedGameStyles.sun}><SunSVG size={55} /></View>
        <View style={sharedGameStyles.cloud1}><CloudSmall size={50} /></View>
        <View style={sharedGameStyles.cloud2}><CloudSmall size={40} /></View>
      </View>
      <View style={sharedGameStyles.gardenBg} />

      <View style={sharedGameStyles.header}>
        <TouchableOpacity style={sharedGameStyles.backBtn} onPress={handleBackToPath}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path d="M 14 6 L 8 12 L 14 18" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </TouchableOpacity>
        <View style={sharedGameStyles.titleBlock}>
          <Text style={sharedGameStyles.title}>تحدي الذكاء</Text>
          <Text style={sharedGameStyles.subtitle}>الجولة {round} من 3</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={sharedGameStyles.progressRow}>
        <View style={sharedGameStyles.progressBg}>
          <View style={[sharedGameStyles.progressFill, { width: `${overallProgress * 100}%` }]} />
        </View>
        <Text style={sharedGameStyles.progressPct}>{Math.round(overallProgress * 100)}%</Text>
      </View>

      <View style={sharedGameStyles.flowerTopLeft}><MiniFlower size={22} color={GARDEN.flowerPink} /></View>
      <View style={sharedGameStyles.flowerTopRight}><MiniFlower size={20} color={GARDEN.flowerYellow} /></View>
      <View style={sharedGameStyles.flowerBottomLeft}><MiniFlower size={20} color={GARDEN.flowerPurple} /></View>
      <View style={sharedGameStyles.flowerBottomRight}><MiniFlower size={20} color={GARDEN.flowerPink} /></View>

      <View style={styles.scoreRow}>
        <View style={[styles.scoreBox, { backgroundColor: childSymbol === "X" ? X_COLOR : O_COLOR }]}>
          <Text style={styles.scoreLabel}>أنتي ({childSymbol})</Text>
          <Text style={styles.scoreValue}>{childWins.current}</Text>
        </View>
        <View style={[styles.scoreBox, { backgroundColor: opponentSymbol === "X" ? X_COLOR : O_COLOR }]}>
          <Text style={styles.scoreLabel}>المنافس ({opponentSymbol})</Text>
          <Text style={styles.scoreValue}>{opponentWins.current}</Text>
        </View>
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          <View style={styles.gridRow}>
            {renderCell(0)}
            {renderCell(1)}
            {renderCell(2)}
          </View>
          <View style={styles.gridRow}>
            {renderCell(3)}
            {renderCell(4)}
            {renderCell(5)}
          </View>
          <View style={styles.gridRow}>
            {renderCell(6)}
            {renderCell(7)}
            {renderCell(8)}
          </View>
        </View>
      </View>

      <View style={styles.turnIndicator}>
        <View style={[styles.turnPill, { backgroundColor: currentTurn === "X" ? X_COLOR : O_COLOR }]}>
          <Text style={styles.turnText}>
            دور {currentTurn} {isChildTurn ? "(أنتي)" : "(المنافس)"}
          </Text>
        </View>
      </View>

      <View style={sharedGameStyles.noumiCorner} pointerEvents="none">
        <SpeechBubble text={bubbleText} color={bubbleColor} visible={bubbleVisible} />
        <Animated.View style={{ transform: [{ translateY: noumiBounce }, { translateX: noumiShake }] }}>
          <NoumiCompanion size={110} expression={noumiExpression} />
        </Animated.View>
      </View>

      <ResultModal
        visible={gameState === "won"}
        state="won"
        stars={finalStars}
        onReset={handleReset}
        onBackToPath={handleBackToPath}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  pickArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  pickTitleBox: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 22,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  pickTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: GARDEN.textDark,
  },
  pickRow: {
    flexDirection: "row-reverse",
    gap: 20,
    marginBottom: 30,
  },
  pickBtn: {
    width: 140,
    height: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  pickLabel: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 8,
  },
  pickHint: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    textAlign: "center",
  },

  scoreRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
    marginTop: 14,
  },
  scoreBox: {
    flex: 1,
    maxWidth: 150,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  scoreLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    opacity: 0.95,
  },
  scoreValue: {
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
    marginTop: 2,
  },

  gridContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  grid: {
    width: 300,
    height: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  gridRow: {
    flexDirection: "row",
    height: 100,
  },
  cell: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  cellRightBorder: {
    borderRightWidth: 4,
    borderRightColor: "#A5D6A7",
  },
  cellBottomBorder: {
    borderBottomWidth: 4,
    borderBottomColor: "#A5D6A7",
  },
  cellWinning: {
    backgroundColor: "#FFF59D",
  },

  turnIndicator: {
    alignItems: "center",
    paddingVertical: 16,
    paddingBottom: 30,
  },
  turnPill: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  turnText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#FFFFFF",
  },
});

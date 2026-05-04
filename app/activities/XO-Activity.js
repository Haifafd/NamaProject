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
import Svg, { Path } from "react-native-svg";
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

const PLAYER_COLOR = "#EF5350"; // X = red
const COMPUTER_COLOR = "#42A5F5"; // O = blue

const checkWinner = (board) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((c) => c)) return "draw";
  return null;
};

export default function XOGame() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } =
    useLocalSearchParams();

  const [round, setRound] = useState(1);
  const [board, setBoard] = useState(Array(9).fill(""));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameState, setGameState] = useState("playing");
  const [finalStars, setFinalStars] = useState(0);

  const [noumiExpression, setNoumiExpression] = useState("idle");
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleColor, setBubbleColor] = useState(GARDEN.bubbleHappy);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const noumiBounce = useRef(new Animated.Value(0)).current;
  const noumiShake = useRef(new Animated.Value(0)).current;
  const startTime = useRef(Date.now());
  const wins = useRef(0);
  const losses = useRef(0);
  const draws = useRef(0);
  const bubbleTimerRef = useRef(null);

  useEffect(() => {
    showSpeechBubble("ضعي X أحمر في 3 صفّ!", GARDEN.bubbleHappy, "happy", 2500);
  }, []);

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

  const handleCellPress = (i) => {
    if (board[i] || !isPlayerTurn || gameState !== "playing") return;

    const newBoard = [...board];
    newBoard[i] = "X";
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      handleRoundEnd(winner);
      return;
    }
    setIsPlayerTurn(false);
  };

  useEffect(() => {
    if (!isPlayerTurn && gameState === "playing") {
      const timer = setTimeout(() => {
        const empty = board
          .map((c, i) => (c === "" ? i : -1))
          .filter((i) => i !== -1);
        if (empty.length === 0) return;

        let move = -1;
        for (const i of empty) {
          const test = [...board];
          test[i] = "O";
          if (checkWinner(test) === "O") {
            move = i;
            break;
          }
        }
        if (move === -1) {
          for (const i of empty) {
            const test = [...board];
            test[i] = "X";
            if (checkWinner(test) === "X") {
              move = i;
              break;
            }
          }
        }
        if (move === -1) {
          move = empty[Math.floor(Math.random() * empty.length)];
        }

        const newBoard = [...board];
        newBoard[move] = "O";
        setBoard(newBoard);

        const winner = checkWinner(newBoard);
        if (winner) {
          handleRoundEnd(winner);
        } else {
          setIsPlayerTurn(true);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, board, gameState]);

  const handleRoundEnd = (winner) => {
    if (winner === "X") {
      wins.current += 1;
      showSpeechBubble("فزتي!", GARDEN.bubbleHappy, "happy", 1800);
    } else if (winner === "O") {
      losses.current += 1;
      showSpeechBubble("حاولي مرة ثانية!", GARDEN.bubbleSad, "sad", 1800);
    } else {
      draws.current += 1;
      showSpeechBubble("تعادل!", GARDEN.bubbleExcited, "idle", 1500);
    }

    setTimeout(() => {
      if (round < 3) {
        setRound(round + 1);
        setBoard(Array(9).fill(""));
        setIsPlayerTurn(true);
      } else {
        finishGame();
      }
    }, 2000);
  };

  const finishGame = async () => {
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const correct = wins.current;
    const wrong = losses.current;
    const total = 3;
    const accuracy = Math.round((correct / total) * 100);

    let stars = 1;
    if (accuracy >= 67) stars = 3;
    else if (accuracy >= 34) stars = 2;

    setFinalStars(stars);
    setGameState("won");

    if (childId && activityId) {
      await saveActivityResult({
        childId,
        activityId,
        activityTitle: activityTitle || "تحدي الذكاء",
        category: category || "thinkingCategoryID",
        level: round,
        correctAnswers: correct,
        wrongAnswers: wrong,
        totalAttempts: total,
        durationSec: duration,
      });
    }
  };

  const handleReset = () => {
    setRound(1);
    setBoard(Array(9).fill(""));
    setIsPlayerTurn(true);
    setGameState("playing");
    setFinalStars(0);
    wins.current = 0;
    losses.current = 0;
    draws.current = 0;
    showSpeechBubble("هيا نبدأ من جديد!", GARDEN.bubbleHappy, "happy", 2000);
  };

  const handleBackToPath = () => {
    if (childId) {
      router.replace({ pathname: "/child/Home", params: { childId } });
    } else {
      router.back();
    }
  };

  return (
    <View style={sharedGameStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor={GARDEN.skyTop} />

      <View style={sharedGameStyles.skyLayer}>
        <View style={sharedGameStyles.sun}>
          <SunSVG size={55} />
        </View>
        <View style={sharedGameStyles.cloud1}>
          <CloudSmall size={50} />
        </View>
        <View style={sharedGameStyles.cloud2}>
          <CloudSmall size={40} />
        </View>
      </View>
      <View style={sharedGameStyles.gardenBg} />

      <View style={sharedGameStyles.header}>
        <TouchableOpacity style={sharedGameStyles.backBtn} onPress={handleBackToPath}>
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path
              d="M 14 6 L 8 12 L 14 18"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </TouchableOpacity>
        <View style={sharedGameStyles.titleBlock}>
          <Text style={sharedGameStyles.title}>تحدي الذكاء</Text>
          <Text style={sharedGameStyles.subtitle}>الجولة {round} من 3</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.scoreRow}>
        <View style={[styles.scoreBox, { backgroundColor: PLAYER_COLOR }]}>
          <Text style={styles.scoreLabel}>X (أنتي)</Text>
          <Text style={styles.scoreValue}>{wins.current}</Text>
        </View>
        <View style={[styles.scoreBox, { backgroundColor: COMPUTER_COLOR }]}>
          <Text style={styles.scoreLabel}>O</Text>
          <Text style={styles.scoreValue}>{losses.current}</Text>
        </View>
      </View>

      <View style={sharedGameStyles.flowerTopLeft}>
        <MiniFlower size={24} color={GARDEN.flowerPink} />
      </View>
      <View style={sharedGameStyles.flowerTopRight}>
        <MiniFlower size={22} color={GARDEN.flowerYellow} />
      </View>
      <View style={sharedGameStyles.flowerBottomLeft}>
        <MiniFlower size={20} color={GARDEN.flowerPurple} />
      </View>
      <View style={sharedGameStyles.flowerBottomRight}>
        <MiniFlower size={20} color={GARDEN.flowerPink} />
      </View>

      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {board.map((cell, i) => (
            <TouchableOpacity
              key={i}
              style={[
                styles.cell,
                i % 3 !== 2 && { borderRightWidth: 4 },
                i < 6 && { borderBottomWidth: 4 },
              ]}
              onPress={() => handleCellPress(i)}
              activeOpacity={0.7}
              disabled={!!cell || !isPlayerTurn || gameState !== "playing"}
            >
              {cell === "X" && (
                <Text style={[styles.cellText, { color: PLAYER_COLOR }]}>X</Text>
              )}
              {cell === "O" && (
                <Text style={[styles.cellText, { color: COMPUTER_COLOR }]}>O</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.turnIndicator}>
        <Text style={styles.turnText}>
          {isPlayerTurn ? "دورك! ضعي X" : "دور الكمبيوتر..."}
        </Text>
      </View>

      <View style={sharedGameStyles.noumiCorner} pointerEvents="none">
        <SpeechBubble text={bubbleText} color={bubbleColor} visible={bubbleVisible} />
        <Animated.View
          style={{
            transform: [{ translateY: noumiBounce }, { translateX: noumiShake }],
          }}
        >
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
  scoreRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
    marginTop: 14,
  },
  scoreBox: {
    flex: 1,
    maxWidth: 130,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    opacity: 0.9,
  },
  scoreValue: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  gridContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  grid: {
    width: 290,
    height: 290,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  cell: {
    width: "33.333%",
    height: "33.333%",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#A5D6A7",
  },
  cellText: {
    fontSize: 56,
    fontWeight: "900",
  },
  turnIndicator: {
    alignItems: "center",
    paddingVertical: 16,
    paddingBottom: 30,
  },
  turnText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

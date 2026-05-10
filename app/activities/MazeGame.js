import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";
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

const { width } = Dimensions.get("window");

function MiniNoumi({ size = 40 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Ellipse cx="14" cy="8" rx="3" ry="6" fill="#FFFFFF" />
      <Ellipse cx="26" cy="8" rx="3" ry="6" fill="#FFFFFF" />
      <Circle cx="20" cy="22" r="12" fill="#FFFFFF" />
      <Circle cx="16" cy="20" r="1.5" fill="#2C2C2C" />
      <Circle cx="24" cy="20" r="1.5" fill="#2C2C2C" />
      <Path d="M 18 26 Q 20 28 22 26" stroke="#3E2723" strokeWidth="1" strokeLinecap="round" fill="none" />
      <Ellipse cx="20" cy="35" rx="3" ry="1" fill="#000" opacity="0.2" />
    </Svg>
  );
}

function CarrotIcon({ size = 36 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36">
      <Path d="M 18 4 L 14 14 L 22 14 Z" fill="#4CAF50" />
      <Path d="M 12 8 L 10 16 L 16 14 Z" fill="#66BB6A" />
      <Path d="M 24 8 L 26 16 L 20 14 Z" fill="#66BB6A" />
      <Path d="M 18 14 L 12 32 L 24 32 Z" fill="#FF7043" />
      <Path d="M 18 14 L 14 24 Q 18 26 22 24 Z" fill="#FF8A65" />
      <Path d="M 16 22 L 20 22" stroke="#E64A19" strokeWidth="1" />
      <Path d="M 17 27 L 21 27" stroke="#E64A19" strokeWidth="1" />
    </Svg>
  );
}

const MAZES = {
  1: {
    rows: 4,
    cols: 4,
    grid: [
      [2, 0, 1, 0],
      [0, 0, 0, 0],
      [1, 1, 0, 1],
      [0, 0, 0, 3],
    ],
  },
  2: {
    rows: 5,
    cols: 5,
    grid: [
      [2, 0, 1, 0, 0],
      [1, 0, 0, 0, 1],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 0, 3],
    ],
  },
  3: {
    rows: 6,
    cols: 6,
    grid: [
      [2, 0, 0, 1, 0, 0],
      [1, 1, 0, 1, 0, 1],
      [0, 0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1, 0],
      [0, 0, 0, 0, 1, 0],
      [1, 1, 0, 0, 0, 3],
    ],
  },
};

export default function MazeGame() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } = useLocalSearchParams();

  const [level, setLevel] = useState(1);
  const [childGender, setChildGender] = useState("female");
  const [noumiPos, setNoumiPos] = useState({ row: 0, col: 0 });
  const [goalPos, setGoalPos] = useState({ row: 0, col: 0 });
  const [moveCount, setMoveCount] = useState(0);
  const [gameState, setGameState] = useState("playing");
  const [finalStars, setFinalStars] = useState(0);

  const [noumiExpression, setNoumiExpression] = useState("idle");
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleColor, setBubbleColor] = useState(GARDEN.bubbleHappy);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const noumiBounce = useRef(new Animated.Value(0)).current;
  const noumiShake = useRef(new Animated.Value(0)).current;
  const startTime = useRef(Date.now());
  const totalMoves = useRef(0);
  const wrongMoves = useRef(0);
  const bubbleTimerRef = useRef(null);

  const maze = MAZES[level];
  const CELL_SIZE = Math.min((width - 80) / maze.cols, 60);

  useEffect(() => {
    initMaze();
  }, [level]);

  useEffect(() => {
    if (childId) fetchChildGender(childId).then(setChildGender);
  }, [childId]);

  const initMaze = () => {
    let startR = 0, startC = 0, goalR = 0, goalC = 0;
    for (let r = 0; r < maze.rows; r++) {
      for (let c = 0; c < maze.cols; c++) {
        if (maze.grid[r][c] === 2) { startR = r; startC = c; }
        if (maze.grid[r][c] === 3) { goalR = r; goalC = c; }
      }
    }
    setNoumiPos({ row: startR, col: startC });
    setGoalPos({ row: goalR, col: goalC });
    setMoveCount(0);
    showSpeechBubble(speak("وصّل نومي للجزرة! 🥕", childGender), GARDEN.bubbleHappy, "happy", 2500);
  };

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

  const moveNoumi = (dr, dc) => {
    const newRow = noumiPos.row + dr;
    const newCol = noumiPos.col + dc;

    if (newRow < 0 || newRow >= maze.rows || newCol < 0 || newCol >= maze.cols) {
      wrongMoves.current += 1;
      showSpeechBubble(speak("لا تستطيع الذهاب هناك!", childGender), GARDEN.bubbleSad, "sad", 1200);
      return;
    }

    if (maze.grid[newRow][newCol] === 1) {
      wrongMoves.current += 1;
      showSpeechBubble(speak("جدار! حاول طريق آخر", childGender), GARDEN.bubbleSad, "sad", 1200);
      return;
    }

    totalMoves.current += 1;
    setNoumiPos({ row: newRow, col: newCol });
    setMoveCount(moveCount + 1);

    if (newRow === goalPos.row && newCol === goalPos.col) {
      setTimeout(() => {
        if (level < 3) {
          showSpeechBubble(speak("ممتاز! وصلت للجزرة! 🥕", childGender), GARDEN.bubbleExcited, "excited", 2500);
          setTimeout(() => setLevel(level + 1), 2000);
        } else {
          finishGame();
        }
      }, 300);
    }
  };

  const finishGame = async () => {
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const correct = totalMoves.current;
    const wrong = wrongMoves.current;
    const total = correct + wrong;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    let stars = 1;
    if (accuracy >= 80) stars = 3;
    else if (accuracy >= 50) stars = 2;

    setFinalStars(stars);
    setGameState("won");

    if (childId && activityId) {
      await saveActivityResult({
        childId, activityId,
        activityTitle: activityTitle || "المتاهة",
        category: category || "thinkingCategoryID",
        level: 3,
        correctAnswers: correct, wrongAnswers: wrong, totalAttempts: total,
        durationSec: duration,
      });
    }
  };

  const handleReset = () => {
    setLevel(1);
    totalMoves.current = 0;
    wrongMoves.current = 0;
    setGameState("playing");
    setFinalStars(0);
  };

  const handleBackToPath = () => {
    if (childId) router.replace({ pathname: "/child/Home", params: { childId } });
    else router.back();
  };

  const overallProgress = (level - 1) / 3 + (gameState === "won" ? 1 / 3 : 0);

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
          <Text style={sharedGameStyles.title}>المتاهة</Text>
          <Text style={sharedGameStyles.subtitle}>المستوى {level} من 3</Text>
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

      <View style={styles.gameArea}>
        <View style={styles.mazeWrapper}>
          {maze.grid.map((row, r) => (
            <View key={r} style={styles.mazeRow}>
              {row.map((cell, c) => {
                const isWall = cell === 1;
                const isGoal = r === goalPos.row && c === goalPos.col;
                const hasNoumi = r === noumiPos.row && c === noumiPos.col;

                return (
                  <View
                    key={c}
                    style={[
                      styles.cell,
                      { width: CELL_SIZE, height: CELL_SIZE },
                      isWall ? styles.wallCell : styles.pathCell,
                    ]}
                  >
                    {isGoal && !hasNoumi && <CarrotIcon size={CELL_SIZE * 0.7} />}
                    {hasNoumi && <MiniNoumi size={CELL_SIZE * 0.85} />}
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        <View style={styles.dpad}>
          <TouchableOpacity
            style={styles.dpadBtn}
            onPress={() => moveNoumi(-1, 0)}
            activeOpacity={0.75}
          >
            <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <Path d="M 6 16 L 12 8 L 18 16" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </TouchableOpacity>

          <View style={styles.dpadMiddle}>
            <TouchableOpacity
              style={styles.dpadBtn}
              onPress={() => moveNoumi(0, -1)}
              activeOpacity={0.75}
            >
              <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <Path d="M 16 6 L 8 12 L 16 18" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            </TouchableOpacity>

            <View style={styles.dpadCenter} />

            <TouchableOpacity
              style={styles.dpadBtn}
              onPress={() => moveNoumi(0, 1)}
              activeOpacity={0.75}
            >
              <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <Path d="M 8 6 L 16 12 L 8 18" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </Svg>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.dpadBtn}
            onPress={() => moveNoumi(1, 0)}
            activeOpacity={0.75}
          >
            <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <Path d="M 6 8 L 12 16 L 18 8" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </Svg>
          </TouchableOpacity>
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
  gameArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
  },
  mazeWrapper: {
    backgroundColor: "#FFFFFF",
    padding: 6,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    marginBottom: 24,
  },
  mazeRow: {
    flexDirection: "row",
  },
  cell: {
    margin: 1,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  pathCell: {
    backgroundColor: "#E8F5E9",
  },
  wallCell: {
    backgroundColor: "#5D4037",
  },
  dpad: {
    alignItems: "center",
  },
  dpadBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFC93C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F57F17",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  dpadMiddle: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },
  dpadCenter: {
    width: 30,
  },
});

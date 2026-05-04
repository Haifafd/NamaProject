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
import Svg, { Circle, Path, Polygon, Rect } from "react-native-svg";
import { saveActivityResult } from "../../Services/ActivityService";
import ResultModal from "./Result";
import {
  GARDEN,
  NoumiCompanion,
  SpeechBubble,
  SunSVG,
  CloudSmall,
  MiniFlower,
  HAPPY_MESSAGES,
  EXCITED_MESSAGES,
  pickRandom,
  sharedGameStyles,
} from "./_GameComponents";

function ShapeIcon({ type, color, size = 50 }) {
  switch (type) {
    case "circle":
      return (
        <Svg width={size} height={size} viewBox="0 0 50 50">
          <Circle cx="25" cy="25" r="20" fill={color} stroke="#1565C0" strokeWidth="2" />
        </Svg>
      );
    case "square":
      return (
        <Svg width={size} height={size} viewBox="0 0 50 50">
          <Rect x="6" y="6" width="38" height="38" rx="5" fill={color} stroke="#B71C1C" strokeWidth="2" />
        </Svg>
      );
    case "triangle":
      return (
        <Svg width={size} height={size} viewBox="0 0 50 50">
          <Polygon points="25,6 44,42 6,42" fill={color} stroke="#388E3C" strokeWidth="2" />
        </Svg>
      );
    case "star":
      return (
        <Svg width={size} height={size} viewBox="0 0 50 50">
          <Path d="M 25 6 L 30 20 L 44 22 L 33 32 L 36 46 L 25 38 L 14 46 L 17 32 L 6 22 L 20 20 Z" fill={color} stroke="#F57F17" strokeWidth="2" />
        </Svg>
      );
    default:
      return null;
  }
}

const SHAPE_NAMES = {
  circle: "الدوائر",
  square: "المربعات",
  triangle: "المثلثات",
  star: "النجوم",
};

const SHAPE_NAMES_SINGULAR = {
  circle: "دائرة",
  square: "مربع",
  triangle: "مثلث",
  star: "نجمة",
};

const SHAPES = ["circle", "square", "triangle", "star"];
const COLORS = ["#EF5350", "#42A5F5", "#66BB6A", "#FFC93C", "#AB47BC"];

const LEVEL_CONFIG = {
  1: { totalShapes: 6, targetMin: 2, targetMax: 4 },
  2: { totalShapes: 9, targetMin: 3, targetMax: 5 },
  3: { totalShapes: 12, targetMin: 4, targetMax: 7 },
};

const PROBLEMS_PER_LEVEL = 3;

const generateProblem = (level) => {
  const config = LEVEL_CONFIG[level];
  const targetShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const targetCount = Math.floor(Math.random() * (config.targetMax - config.targetMin + 1)) + config.targetMin;

  const items = [];
  for (let i = 0; i < targetCount; i++) {
    items.push({
      shape: targetShape,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
  }

  const otherShapes = SHAPES.filter(s => s !== targetShape);
  for (let i = 0; i < config.totalShapes - targetCount; i++) {
    items.push({
      shape: otherShapes[Math.floor(Math.random() * otherShapes.length)],
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    });
  }

  items.sort(() => Math.random() - 0.5);

  const choices = new Set([targetCount]);
  while (choices.size < 3) {
    const offset = Math.floor(Math.random() * 4) - 2;
    const num = targetCount + offset;
    if (num >= 1 && num !== targetCount) choices.add(num);
  }
  const choicesArr = Array.from(choices).sort(() => Math.random() - 0.5);

  return {
    targetShape,
    targetCount,
    items,
    choices: choicesArr,
  };
};

export default function ShapeFindingActivity() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } = useLocalSearchParams();

  const [level, setLevel] = useState(1);
  const [problemIdx, setProblemIdx] = useState(0);
  const [problem, setProblem] = useState(() => generateProblem(1));
  const [gameState, setGameState] = useState("playing");
  const [finalStars, setFinalStars] = useState(0);

  const [noumiExpression, setNoumiExpression] = useState("idle");
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleColor, setBubbleColor] = useState(GARDEN.bubbleHappy);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const noumiBounce = useRef(new Animated.Value(0)).current;
  const noumiShake = useRef(new Animated.Value(0)).current;
  const startTime = useRef(Date.now());
  const correctAnswers = useRef(0);
  const wrongAnswers = useRef(0);
  const bubbleTimerRef = useRef(null);

  useEffect(() => {
    setProblem(generateProblem(level));
    setProblemIdx(0);
  }, [level]);

  useEffect(() => {
    showSpeechBubble(`عدّي ${SHAPE_NAMES[problem.targetShape]}!`, GARDEN.bubbleHappy, "happy", 2500);
  }, [problem]);

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

  const handleAnswer = (choice) => {
    if (choice === problem.targetCount) {
      correctAnswers.current += 1;
      showSpeechBubble(pickRandom(HAPPY_MESSAGES), GARDEN.bubbleHappy, "happy", 1500);

      setTimeout(() => {
        if (problemIdx < PROBLEMS_PER_LEVEL - 1) {
          setProblemIdx(problemIdx + 1);
          setProblem(generateProblem(level));
        } else {
          if (level < 3) {
            showSpeechBubble(pickRandom(EXCITED_MESSAGES), GARDEN.bubbleExcited, "excited", 2500);
            setTimeout(() => setLevel(level + 1), 1500);
          } else {
            finishGame();
          }
        }
      }, 1300);
    } else {
      wrongAnswers.current += 1;
      showSpeechBubble("عدّي مرة ثانية!", GARDEN.bubbleSad, "sad", 1500);
    }
  };

  const finishGame = async () => {
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const correct = correctAnswers.current;
    const wrong = wrongAnswers.current;
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
        activityTitle: activityTitle || "إيجاد الأشكال",
        category: category || "perceptionCategoryID",
        level: 3,
        correctAnswers: correct, wrongAnswers: wrong, totalAttempts: total,
        durationSec: duration,
      });
    }
  };

  const handleReset = () => {
    setLevel(1);
    setProblemIdx(0);
    correctAnswers.current = 0;
    wrongAnswers.current = 0;
    setProblem(generateProblem(1));
    setGameState("playing");
    setFinalStars(0);
  };

  const handleBackToPath = () => {
    if (childId) router.replace({ pathname: "/child/Home", params: { childId } });
    else router.back();
  };

  const overallProgress = ((level - 1) * PROBLEMS_PER_LEVEL + problemIdx) / (3 * PROBLEMS_PER_LEVEL);

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
          <Text style={sharedGameStyles.title}>عدّ الأشكال</Text>
          <Text style={sharedGameStyles.subtitle}>المستوى {level} • {problemIdx + 1} من {PROBLEMS_PER_LEVEL}</Text>
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
        <View style={styles.questionPill}>
          <Text style={styles.questionText}>كم {SHAPE_NAMES_SINGULAR[problem.targetShape]} في الصورة؟</Text>
        </View>

        <View style={styles.scene}>
          {problem.items.map((item, idx) => (
            <View key={idx} style={styles.shapeCell}>
              <ShapeIcon type={item.shape} color={item.color} size={50} />
            </View>
          ))}
        </View>

        <View style={styles.choicesRow}>
          {problem.choices.map((num, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.numberBtn}
              onPress={() => handleAnswer(num)}
              activeOpacity={0.85}
            >
              <Text style={styles.numberText}>{num}</Text>
            </TouchableOpacity>
          ))}
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
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  questionPill: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 22,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "900",
    color: GARDEN.textDark,
    textAlign: "center",
  },
  scene: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 22,
    padding: 14,
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
    maxWidth: 340,
    minHeight: 180,
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  shapeCell: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  choicesRow: {
    flexDirection: "row-reverse",
    gap: 18,
  },
  numberBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFC93C",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F57F17",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 6,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  numberText: {
    fontSize: 36,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
});

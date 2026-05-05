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
import Svg, { Circle, Ellipse, Path, Rect } from "react-native-svg";
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

function ShapeRenderer({ type, isShadow, size = 90 }) {
  switch (type) {
    case "apple":
      return (
        <Svg width={size} height={size} viewBox="0 0 90 90">
          <Path d="M 45 14 Q 47 8 52 8" stroke={isShadow ? "#212121" : "#388E3C"} strokeWidth="3" fill="none" strokeLinecap="round" />
          <Path d="M 47 14 Q 56 10 60 18 Q 56 18 47 18 Z" fill={isShadow ? "#212121" : "#66BB6A"} />
          <Circle cx="45" cy="50" r="28" fill={isShadow ? "#212121" : "#E53935"} />
        </Svg>
      );
    case "sun":
      return (
        <Svg width={size} height={size} viewBox="0 0 90 90">
          <Circle cx="45" cy="45" r="20" fill={isShadow ? "#212121" : "#FFCA28"} />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const x1 = 45 + Math.cos(rad) * 28;
            const y1 = 45 + Math.sin(rad) * 28;
            const x2 = 45 + Math.cos(rad) * 38;
            const y2 = 45 + Math.sin(rad) * 38;
            return (
              <Path
                key={i}
                d={`M ${x1} ${y1} L ${x2} ${y2}`}
                stroke={isShadow ? "#212121" : "#FFCA28"}
                strokeWidth="4"
                strokeLinecap="round"
              />
            );
          })}
        </Svg>
      );
    case "butterfly":
      return (
        <Svg width={size} height={size} viewBox="0 0 90 90">
          <Ellipse cx="45" cy="45" rx="3" ry="22" fill={isShadow ? "#212121" : "#3E2723"} />
          <Ellipse cx="25" cy="35" rx="18" ry="14" fill={isShadow ? "#212121" : "#FF7043"} transform="rotate(-25 25 35)" />
          <Ellipse cx="65" cy="35" rx="18" ry="14" fill={isShadow ? "#212121" : "#FF7043"} transform="rotate(25 65 35)" />
          <Ellipse cx="28" cy="60" rx="14" ry="11" fill={isShadow ? "#212121" : "#FFAB91"} transform="rotate(20 28 60)" />
          <Ellipse cx="62" cy="60" rx="14" ry="11" fill={isShadow ? "#212121" : "#FFAB91"} transform="rotate(-20 62 60)" />
        </Svg>
      );
    case "tree":
      return (
        <Svg width={size} height={size} viewBox="0 0 90 90">
          <Rect x="40" y="55" width="10" height="30" fill={isShadow ? "#212121" : "#6D4C41"} />
          <Circle cx="45" cy="40" r="22" fill={isShadow ? "#212121" : "#4CAF50"} />
          <Circle cx="30" cy="48" r="14" fill={isShadow ? "#212121" : "#43A047"} />
          <Circle cx="60" cy="48" r="14" fill={isShadow ? "#212121" : "#43A047"} />
          <Circle cx="45" cy="30" r="16" fill={isShadow ? "#212121" : "#66BB6A"} />
        </Svg>
      );
    case "flower":
      return (
        <Svg width={size} height={size} viewBox="0 0 90 90">
          <Path d="M 45 75 L 45 45" stroke={isShadow ? "#212121" : "#388E3C"} strokeWidth="3" strokeLinecap="round" />
          <Circle cx="45" cy="25" r="11" fill={isShadow ? "#212121" : "#EC407A"} />
          <Circle cx="32" cy="35" r="11" fill={isShadow ? "#212121" : "#EC407A"} />
          <Circle cx="58" cy="35" r="11" fill={isShadow ? "#212121" : "#EC407A"} />
          <Circle cx="45" cy="42" r="11" fill={isShadow ? "#212121" : "#EC407A"} />
          <Circle cx="45" cy="33" r="6" fill={isShadow ? "#212121" : "#FFCA28"} />
        </Svg>
      );
    case "fish":
      return (
        <Svg width={size} height={size} viewBox="0 0 90 90">
          <Ellipse cx="40" cy="45" rx="26" ry="18" fill={isShadow ? "#212121" : "#42A5F5"} />
          <Path d="M 65 45 L 80 30 L 80 60 Z" fill={isShadow ? "#212121" : "#42A5F5"} />
          {!isShadow && <Circle cx="30" cy="40" r="4" fill="#FFFFFF" />}
          {!isShadow && <Circle cx="29" cy="40" r="2" fill="#1565C0" />}
        </Svg>
      );
    case "bird":
      return (
        <Svg width={size} height={size} viewBox="0 0 90 90">
          <Ellipse cx="45" cy="50" rx="22" ry="16" fill={isShadow ? "#212121" : "#FFC93C"} />
          <Circle cx="60" cy="40" r="12" fill={isShadow ? "#212121" : "#FFC93C"} />
          <Path d="M 70 38 L 78 40 L 70 44 Z" fill={isShadow ? "#212121" : "#FF7043"} />
          {!isShadow && <Circle cx="62" cy="37" r="2" fill="#3E2723" />}
          <Path d="M 35 50 Q 25 40 30 30" stroke={isShadow ? "#212121" : "#F57F17"} strokeWidth="2" fill="none" />
        </Svg>
      );
    case "star":
      return (
        <Svg width={size} height={size} viewBox="0 0 90 90">
          <Path d="M 45 12 L 53 32 L 75 34 L 58 49 L 63 72 L 45 60 L 27 72 L 32 49 L 15 34 L 37 32 Z" fill={isShadow ? "#212121" : "#FFC93C"} />
        </Svg>
      );
    case "heart":
      return (
        <Svg width={size} height={size} viewBox="0 0 90 90">
          <Path d="M 45 75 L 18 45 Q 12 25 25 25 Q 38 25 45 38 Q 52 25 65 25 Q 78 25 72 45 Z" fill={isShadow ? "#212121" : "#EC407A"} />
        </Svg>
      );
    default:
      return null;
  }
}

const LEVEL_PROBLEMS = {
  1: 3,
  2: 4,
  3: 4,
};

const ALL_SHAPES = ["apple", "sun", "butterfly", "tree", "flower", "fish", "bird", "star", "heart"];

const generateProblem = (level) => {
  let pool;
  if (level === 1) pool = ["apple", "sun", "butterfly"];
  else if (level === 2) pool = ["apple", "sun", "butterfly", "tree", "flower", "fish"];
  else pool = ALL_SHAPES;

  const target = pool[Math.floor(Math.random() * pool.length)];
  const distractors = pool.filter((s) => s !== target).sort(() => Math.random() - 0.5).slice(0, 2);
  const choices = [target, ...distractors].sort(() => Math.random() - 0.5);

  return { target, choices };
};

export default function ShadowMatching() {
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
    showSpeechBubble("أي ظل يطابق الشكل؟", GARDEN.bubbleHappy, "happy", 2000);
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

  const handlePick = (choice) => {
    if (choice === problem.target) {
      correctAnswers.current += 1;
      showSpeechBubble(pickRandom(HAPPY_MESSAGES), GARDEN.bubbleHappy, "happy", 1300);

      setTimeout(() => {
        if (problemIdx < LEVEL_PROBLEMS[level] - 1) {
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
      }, 1100);
    } else {
      wrongAnswers.current += 1;
      showSpeechBubble("شوفي بدقة!", GARDEN.bubbleSad, "sad", 1500);
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
        activityTitle: activityTitle || "الشكل والظل",
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

  const totalProblems = LEVEL_PROBLEMS[1] + LEVEL_PROBLEMS[2] + LEVEL_PROBLEMS[3];
  const completed =
    (level === 1 ? problemIdx : LEVEL_PROBLEMS[1]) +
    (level === 2 ? problemIdx : level > 2 ? LEVEL_PROBLEMS[2] : 0) +
    (level === 3 ? problemIdx : 0);
  const overallProgress = completed / totalProblems;

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
          <Text style={sharedGameStyles.title}>الشكل والظل</Text>
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
        <View style={styles.targetCard}>
          <ShapeRenderer type={problem.target} isShadow={false} size={120} />
        </View>

        <Text style={styles.questionText}>أي ظل يطابق؟</Text>

        <View style={styles.choicesRow}>
          {problem.choices.map((choice, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.choiceCard}
              onPress={() => handlePick(choice)}
              activeOpacity={0.85}
            >
              <ShapeRenderer type={choice} isShadow={true} size={80} />
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
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  targetCard: {
    width: 160,
    height: 160,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    marginBottom: 28,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 22,
  },
  choicesRow: {
    flexDirection: "row-reverse",
    gap: 14,
  },
  choiceCard: {
    width: 110,
    height: 110,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
});

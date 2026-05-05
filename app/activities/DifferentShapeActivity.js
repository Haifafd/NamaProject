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
import { fetchChildGender, speak } from "../../Services/SpeechHelper";

function DiffShape({ type, color = "#42A5F5", size = 80 }) {
  switch (type) {
    case "circle":
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Circle cx="40" cy="40" r="32" fill={color} />
        </Svg>
      );
    case "square":
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Rect x="10" y="10" width="60" height="60" rx="8" fill={color} />
        </Svg>
      );
    case "triangle":
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Polygon points="40,8 72,68 8,68" fill={color} />
        </Svg>
      );
    case "star":
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Path d="M 40 10 L 48 30 L 70 32 L 53 47 L 58 70 L 40 58 L 22 70 L 27 47 L 10 32 L 32 30 Z" fill={color} />
        </Svg>
      );
    case "heart":
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Path d="M 40 65 L 12 38 Q 8 18 22 18 Q 32 18 40 32 Q 48 18 58 18 Q 72 18 68 38 Z" fill={color} />
        </Svg>
      );
    default:
      return null;
  }
}

const LEVELS = {
  1: [
    { items: [{ shape: "circle", color: "#EF5350" }, { shape: "circle", color: "#EF5350" }, { shape: "circle", color: "#EF5350" }, { shape: "square", color: "#EF5350" }], correct: 3 },
    { items: [{ shape: "triangle", color: "#42A5F5" }, { shape: "triangle", color: "#42A5F5" }, { shape: "star", color: "#42A5F5" }, { shape: "triangle", color: "#42A5F5" }], correct: 2 },
    { items: [{ shape: "heart", color: "#EC407A" }, { shape: "circle", color: "#EC407A" }, { shape: "heart", color: "#EC407A" }, { shape: "heart", color: "#EC407A" }], correct: 1 },
  ],
  2: [
    { items: [{ shape: "circle", color: "#EF5350" }, { shape: "circle", color: "#EF5350" }, { shape: "circle", color: "#42A5F5" }, { shape: "circle", color: "#EF5350" }], correct: 2 },
    { items: [{ shape: "star", color: "#FFC93C" }, { shape: "star", color: "#66BB6A" }, { shape: "star", color: "#FFC93C" }, { shape: "star", color: "#FFC93C" }], correct: 1 },
    { items: [{ shape: "square", color: "#AB47BC" }, { shape: "square", color: "#AB47BC" }, { shape: "square", color: "#AB47BC" }, { shape: "square", color: "#FF7043" }], correct: 3 },
  ],
  3: [
    { items: [{ shape: "triangle", color: "#42A5F5" }, { shape: "circle", color: "#EF5350" }, { shape: "triangle", color: "#42A5F5" }, { shape: "triangle", color: "#42A5F5" }], correct: 1 },
    { items: [{ shape: "heart", color: "#EC407A" }, { shape: "heart", color: "#EC407A" }, { shape: "heart", color: "#EC407A" }, { shape: "star", color: "#FFC93C" }], correct: 3 },
    { items: [{ shape: "star", color: "#66BB6A" }, { shape: "square", color: "#AB47BC" }, { shape: "star", color: "#66BB6A" }, { shape: "star", color: "#66BB6A" }], correct: 1 },
    { items: [{ shape: "circle", color: "#FFC93C" }, { shape: "circle", color: "#FFC93C" }, { shape: "triangle", color: "#FF7043" }, { shape: "circle", color: "#FFC93C" }], correct: 2 },
  ],
};

export default function DifferentShapeActivity() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } = useLocalSearchParams();

  const [level, setLevel] = useState(1);
  const [childGender, setChildGender] = useState("female");
  const [problemIdx, setProblemIdx] = useState(0);
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

  const problems = LEVELS[level];
  const problem = problems[problemIdx];

  useEffect(() => {
    if (childId) fetchChildGender(childId).then(setChildGender);
  }, [childId]);

  useEffect(() => {
    showSpeechBubble(speak("اختاري الشكل المختلف!", childGender), GARDEN.bubbleHappy, "happy", 2200);
  }, [level, problemIdx]);

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

  const handlePick = (idx) => {
    if (idx === problem.correct) {
      correctAnswers.current += 1;
      showSpeechBubble(speak(pickRandom(HAPPY_MESSAGES), childGender), GARDEN.bubbleHappy, "happy", 1200);
      setTimeout(() => {
        if (problemIdx < problems.length - 1) {
          setProblemIdx(problemIdx + 1);
        } else {
          if (level < 3) {
            showSpeechBubble(speak(pickRandom(EXCITED_MESSAGES), childGender), GARDEN.bubbleExcited, "excited", 2500);
            setTimeout(() => {
              setLevel(level + 1);
              setProblemIdx(0);
            }, 1500);
          } else {
            finishGame();
          }
        }
      }, 1000);
    } else {
      wrongAnswers.current += 1;
      showSpeechBubble(speak("شوفي بدقة!", childGender), GARDEN.bubbleSad, "sad", 1500);
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
        activityTitle: activityTitle || "الشكل المختلف",
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
    setGameState("playing");
    setFinalStars(0);
  };

  const handleBackToPath = () => {
    if (childId) router.replace({ pathname: "/child/Home", params: { childId } });
    else router.back();
  };

  const totalProblems = LEVELS[1].length + LEVELS[2].length + LEVELS[3].length;
  const completed =
    (level === 1 ? problemIdx : LEVELS[1].length) +
    (level === 2 ? problemIdx : level > 2 ? LEVELS[2].length : 0) +
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
          <Text style={sharedGameStyles.title}>الشكل المختلف</Text>
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
        <Text style={styles.label}>أيهم مختلف؟</Text>
        <View style={styles.grid}>
          {problem.items.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.shapeBtn}
              onPress={() => handlePick(idx)}
              activeOpacity={0.85}
            >
              <DiffShape type={item.shape} color={item.color} size={80} />
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
  label: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 24,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 16,
  },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "center",
    maxWidth: 320,
  },
  shapeBtn: {
    width: 130,
    height: 130,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
});

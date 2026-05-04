import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
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
  HAPPY_MESSAGES,
  SAD_MESSAGES,
  EXCITED_MESSAGES,
  pickRandom,
  sharedGameStyles,
} from "./_GameComponents";

const { width } = Dimensions.get("window");

const BUBBLE_COLORS = {
  red: "#EF5350",
  blue: "#42A5F5",
  yellow: "#FFC107",
  green: "#66BB6A",
};
const COLOR_NAMES = {
  red: "حمراء",
  blue: "زرقاء",
  yellow: "صفراء",
  green: "خضراء",
};

const LEVEL_CONFIG = {
  1: { bubbles: 5, colors: ["red"], target: "red", needed: 8 },
  2: { bubbles: 6, colors: ["red", "blue"], target: "blue", needed: 12 },
  3: { bubbles: 7, colors: ["red", "blue", "yellow"], target: "yellow", needed: 15 },
};

export default function BubbleActivity() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } =
    useLocalSearchParams();

  const [level, setLevel] = useState(1);
  const [bubbles, setBubbles] = useState([]);
  const [correctCount, setCorrectCount] = useState(0);
  const [gameState, setGameState] = useState("playing");
  const [finalStars, setFinalStars] = useState(0);

  const [noumiExpression, setNoumiExpression] = useState("idle");
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleColor, setBubbleColor] = useState(GARDEN.bubbleHappy);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const noumiBounce = useRef(new Animated.Value(0)).current;
  const noumiShake = useRef(new Animated.Value(0)).current;
  const startTime = useRef(Date.now());
  const totalCorrect = useRef(0);
  const totalErrors = useRef(0);
  const bubbleTimerRef = useRef(null);

  const config = LEVEL_CONFIG[level];

  const generateBubbles = () => {
    const newBubbles = [];
    const cols = config.colors;
    for (let i = 0; i < config.bubbles; i++) {
      const colorKey = cols[Math.floor(Math.random() * cols.length)];
      newBubbles.push({
        id: `${Date.now()}-${i}`,
        color: BUBBLE_COLORS[colorKey],
        colorKey,
        x: 30 + Math.random() * (width - 130),
        y: 250 + Math.random() * 250,
      });
    }
    setBubbles(newBubbles);
  };

  useEffect(() => {
    generateBubbles();
    setCorrectCount(0);
    startTime.current = Date.now();
  }, [level]);

  useEffect(() => {
    showSpeechBubble(
      `اضغطي الفقاعات ${COLOR_NAMES[config.target]} فقط!`,
      GARDEN.bubbleHappy,
      "happy",
      2500
    );
  }, [level]);

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

  const getTotalNeeded = () => {
    let total = 0;
    for (let i = 1; i <= level; i++) total += LEVEL_CONFIG[i].needed;
    return total;
  };

  const advanceLevel = () => {
    if (level < 3) {
      showSpeechBubble(pickRandom(EXCITED_MESSAGES), GARDEN.bubbleExcited, "excited", 2500);
      setTimeout(() => setLevel(level + 1), 1500);
    } else {
      finishGame();
    }
  };

  const handleBubbleTap = (bubble) => {
    if (bubble.colorKey === config.target) {
      totalCorrect.current += 1;
      setCorrectCount((c) => c + 1);
      showSpeechBubble(pickRandom(HAPPY_MESSAGES), GARDEN.bubbleHappy, "happy", 1000);

      setBubbles((prev) => {
        const filtered = prev.filter((b) => b.id !== bubble.id);
        const colorKey = config.colors[Math.floor(Math.random() * config.colors.length)];
        return [
          ...filtered,
          {
            id: `${Date.now()}-${Math.random()}`,
            color: BUBBLE_COLORS[colorKey],
            colorKey,
            x: 30 + Math.random() * (width - 130),
            y: 250 + Math.random() * 250,
          },
        ];
      });

      if (totalCorrect.current >= getTotalNeeded()) {
        setTimeout(() => advanceLevel(), 600);
      }
    } else {
      totalErrors.current += 1;
      showSpeechBubble(pickRandom(SAD_MESSAGES), GARDEN.bubbleSad, "sad", 1500);
    }
  };

  const finishGame = async () => {
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const correct = totalCorrect.current;
    const wrong = totalErrors.current;
    const total = correct + wrong;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

    let stars = 1;
    if (accuracy >= 80) stars = 3;
    else if (accuracy >= 50) stars = 2;

    setFinalStars(stars);
    setGameState("won");

    if (childId && activityId) {
      await saveActivityResult({
        childId,
        activityId,
        activityTitle: activityTitle || "الفقاعات",
        category: category || "focusCategoryID",
        level: 3,
        correctAnswers: correct,
        wrongAnswers: wrong,
        totalAttempts: total,
        durationSec: duration,
      });
    }
  };

  const handleReset = () => {
    setLevel(1);
    setCorrectCount(0);
    setGameState("playing");
    setFinalStars(0);
    totalCorrect.current = 0;
    totalErrors.current = 0;
    generateBubbles();
  };

  const handleBackToPath = () => {
    if (childId) {
      router.replace({ pathname: "/child/Home", params: { childId } });
    } else {
      router.back();
    }
  };

  const overallProgress =
    (level - 1) / 3 + correctCount / config.needed / 3;

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
          <Text style={sharedGameStyles.title}>الفقاعات</Text>
          <Text style={sharedGameStyles.subtitle}>المستوى {level} من 3</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={sharedGameStyles.progressRow}>
        <View style={sharedGameStyles.progressBg}>
          <View
            style={[
              sharedGameStyles.progressFill,
              { width: `${overallProgress * 100}%` },
            ]}
          />
        </View>
        <Text style={sharedGameStyles.progressPct}>
          {Math.round(overallProgress * 100)}%
        </Text>
      </View>

      <View style={sharedGameStyles.flowerTopLeft}>
        <MiniFlower size={26} color={GARDEN.flowerPink} />
      </View>
      <View style={sharedGameStyles.flowerTopRight}>
        <MiniFlower size={24} color={GARDEN.flowerYellow} />
      </View>
      <View style={sharedGameStyles.flowerBottomLeft}>
        <MiniFlower size={22} color={GARDEN.flowerPurple} />
      </View>
      <View style={sharedGameStyles.flowerBottomRight}>
        <MiniFlower size={20} color={GARDEN.flowerPink} />
      </View>

      <View style={styles.counterPill}>
        <Text style={styles.counterText}>
          {correctCount} / {config.needed}
        </Text>
      </View>

      <View style={styles.gameArea}>
        {bubbles.map((b) => (
          <TouchableOpacity
            key={b.id}
            style={[
              styles.bubble,
              { backgroundColor: b.color, left: b.x, top: b.y },
            ]}
            onPress={() => handleBubbleTap(b)}
            activeOpacity={0.7}
          >
            <View style={styles.bubbleHighlight} />
          </TouchableOpacity>
        ))}
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
  counterPill: {
    position: "absolute",
    top: Platform.OS === "ios" ? 165 : 135,
    right: 20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    zIndex: 15,
  },
  counterText: {
    fontSize: 18,
    fontWeight: "900",
    color: GARDEN.textDark,
  },
  gameArea: {
    flex: 1,
    position: "relative",
  },
  bubble: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    overflow: "hidden",
  },
  bubbleHighlight: {
    position: "absolute",
    top: 12,
    left: 16,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
});

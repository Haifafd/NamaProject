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
  HAPPY_MESSAGES,
  EXCITED_MESSAGES,
  pickRandom,
  sharedGameStyles,
} from "./_GameComponents";
import { fetchChildGender, speak } from "../../Services/SpeechHelper";

function CardIcon({ type, size = 60 }) {
  switch (type) {
    case "apple":
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Path d="M 30 12 Q 32 8 36 8" stroke="#388E3C" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Circle cx="30" cy="35" r="20" fill="#E53935" />
          <Circle cx="22" cy="28" r="6" fill="#FFCDD2" opacity="0.6" />
        </Svg>
      );
    case "tree":
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Path d="M 27 50 L 27 38 L 33 38 L 33 50 Z" fill="#6D4C41" />
          <Circle cx="30" cy="28" r="18" fill="#4CAF50" />
          <Circle cx="30" cy="20" r="13" fill="#66BB6A" />
        </Svg>
      );
    case "sun":
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Circle cx="30" cy="30" r="16" fill="#FFCA28" />
          <Path d="M 30 4 L 30 12" stroke="#FFCA28" strokeWidth="3" strokeLinecap="round" />
          <Path d="M 30 48 L 30 56" stroke="#FFCA28" strokeWidth="3" strokeLinecap="round" />
          <Path d="M 4 30 L 12 30" stroke="#FFCA28" strokeWidth="3" strokeLinecap="round" />
          <Path d="M 48 30 L 56 30" stroke="#FFCA28" strokeWidth="3" strokeLinecap="round" />
        </Svg>
      );
    case "flower":
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Circle cx="30" cy="20" r="9" fill="#EC407A" />
          <Circle cx="20" cy="28" r="9" fill="#EC407A" />
          <Circle cx="40" cy="28" r="9" fill="#EC407A" />
          <Circle cx="30" cy="34" r="9" fill="#EC407A" />
          <Circle cx="30" cy="26" r="6" fill="#FFCA28" />
        </Svg>
      );
    case "butterfly":
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Ellipse cx="30" cy="30" rx="2" ry="14" fill="#3E2723" />
          <Ellipse cx="18" cy="22" rx="11" ry="9" fill="#FF7043" transform="rotate(-25 18 22)" />
          <Ellipse cx="42" cy="22" rx="11" ry="9" fill="#FF7043" transform="rotate(25 42 22)" />
        </Svg>
      );
    case "strawberry":
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
          <Path d="M 22 18 L 28 14 L 32 14 L 38 18 Z" fill="#43A047" />
          <Path d="M 18 22 Q 30 14 42 22 L 38 50 Q 30 58 22 50 Z" fill="#E53935" />
        </Svg>
      );
    default:
      return null;
  }
}

const ALL_ICONS = ["apple", "tree", "sun", "flower", "butterfly", "strawberry"];
const LEVEL_PAIRS = { 1: 3, 2: 4, 3: 5 };

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

export default function MatchingGame() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } = useLocalSearchParams();

  const [level, setLevel] = useState(1);
  const [childGender, setChildGender] = useState("female");
  const [leftColumn, setLeftColumn] = useState([]);
  const [rightColumn, setRightColumn] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matched, setMatched] = useState([]);
  const [gameState, setGameState] = useState("playing");
  const [finalStars, setFinalStars] = useState(0);

  const [noumiExpression, setNoumiExpression] = useState("idle");
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleColor, setBubbleColor] = useState(GARDEN.bubbleHappy);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const noumiBounce = useRef(new Animated.Value(0)).current;
  const noumiShake = useRef(new Animated.Value(0)).current;
  const startTime = useRef(Date.now());
  const correctMatches = useRef(0);
  const wrongAttempts = useRef(0);
  const bubbleTimerRef = useRef(null);

  useEffect(() => {
    initLevel();
  }, [level]);

  useEffect(() => {
    if (childId) fetchChildGender(childId).then(setChildGender);
  }, [childId]);

  const initLevel = () => {
    const pairsCount = LEVEL_PAIRS[level];
    const selectedIcons = ALL_ICONS.slice(0, pairsCount);
    setLeftColumn(shuffle(selectedIcons));
    setRightColumn(shuffle(selectedIcons));
    setSelectedLeft(null);
    setMatched([]);
    startTime.current = Date.now();
    showSpeechBubble(speak("وصل البطاقات المتشابهة!", childGender), GARDEN.bubbleHappy, "happy", 2500);
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

  const handleLeftTap = (icon) => {
    if (matched.includes(icon)) return;
    setSelectedLeft(icon);
  };

  const handleRightTap = (icon) => {
    if (matched.includes(icon) || !selectedLeft) return;

    if (selectedLeft === icon) {
      correctMatches.current += 1;
      const newMatched = [...matched, icon];
      setMatched(newMatched);
      setSelectedLeft(null);
      showSpeechBubble(speak(pickRandom(HAPPY_MESSAGES), childGender), GARDEN.bubbleHappy, "happy", 1200);

      if (newMatched.length === LEVEL_PAIRS[level]) {
        setTimeout(() => {
          if (level < 3) {
            showSpeechBubble(speak(pickRandom(EXCITED_MESSAGES), childGender), GARDEN.bubbleExcited, "excited", 2500);
            setTimeout(() => setLevel(level + 1), 1500);
          } else {
            finishGame();
          }
        }, 800);
      }
    } else {
      wrongAttempts.current += 1;
      showSpeechBubble(speak("ليست متشابهة، حاول ثانية!", childGender), GARDEN.bubbleSad, "sad", 1500);
      setSelectedLeft(null);
    }
  };

  const finishGame = async () => {
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const correct = correctMatches.current;
    const wrong = wrongAttempts.current;
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
        activityTitle: activityTitle || "لعبة المطابقة",
        category: category || "memoryCategoryID",
        level: 3,
        correctAnswers: correct, wrongAnswers: wrong, totalAttempts: total,
        durationSec: duration,
      });
    }
  };

  const handleReset = () => {
    setLevel(1);
    correctMatches.current = 0;
    wrongAttempts.current = 0;
    setGameState("playing");
    setFinalStars(0);
  };

  const handleBackToPath = () => {
    if (childId) router.replace({ pathname: "/child/Home", params: { childId } });
    else router.back();
  };

  const overallProgress = ((level - 1) / 3) + (matched.length / LEVEL_PAIRS[level] / 3);

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
          <Text style={sharedGameStyles.title}>لعبة المطابقة</Text>
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
        <View style={styles.columnsRow}>
          <View style={styles.column}>
            {rightColumn.map((icon, idx) => {
              const isMatched = matched.includes(icon);
              return (
                <TouchableOpacity
                  key={`r-${idx}`}
                  style={[styles.card, isMatched && styles.cardMatched]}
                  onPress={() => handleRightTap(icon)}
                  disabled={isMatched}
                  activeOpacity={0.85}
                >
                  <CardIcon type={icon} size={56} />
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.connectorCol}>
            {leftColumn.map((icon, idx) => (
              <View key={`c-${idx}`} style={styles.connectorDot} />
            ))}
          </View>

          <View style={styles.column}>
            {leftColumn.map((icon, idx) => {
              const isMatched = matched.includes(icon);
              const isSelected = selectedLeft === icon;
              return (
                <TouchableOpacity
                  key={`l-${idx}`}
                  style={[
                    styles.card,
                    isMatched && styles.cardMatched,
                    isSelected && styles.cardSelected,
                  ]}
                  onPress={() => handleLeftTap(icon)}
                  disabled={isMatched}
                  activeOpacity={0.85}
                >
                  <CardIcon type={icon} size={56} />
                </TouchableOpacity>
              );
            })}
          </View>
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
  columnsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 16,
  },
  column: {
    gap: 12,
  },
  card: {
    width: 80,
    height: 80,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  cardSelected: {
    borderColor: "#FFC93C",
    transform: [{ scale: 1.08 }],
  },
  cardMatched: {
    backgroundColor: "#C8E6C9",
    borderColor: "#66BB6A",
    opacity: 0.7,
  },
  connectorCol: {
    gap: 12,
    paddingVertical: 6,
  },
  connectorDot: {
    width: 30,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
});

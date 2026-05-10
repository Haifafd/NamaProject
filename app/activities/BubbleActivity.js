import { useEffect, useRef, useState, useCallback } from "react";
import {
  Animated,
  Dimensions,
  Easing,
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
  EXCITED_MESSAGES,
  pickRandom,
  sharedGameStyles,
} from "./_GameComponents";
import { fetchChildGender, speak } from "../../Services/SpeechHelper";

const { width, height } = Dimensions.get("window");

const BUBBLE_COLORS = [
  "#EF5350",
  "#42A5F5",
  "#FFC107",
  "#66BB6A",
  "#AB47BC",
  "#FF7043",
  "#26C6DA",
  "#EC407A",
];

const LEVEL_CONFIG = {
  1: { needed: 8, spawnRate: 1500, lifespan: 5000, maxOnScreen: 3 },
  2: { needed: 12, spawnRate: 1100, lifespan: 4000, maxOnScreen: 4 },
  3: { needed: 15, spawnRate: 800, lifespan: 3000, maxOnScreen: 5 },
};

const GAME_TOP = Platform.OS === "ios" ? 280 : 250;
const GAME_BOTTOM = height - 80;
const SPAWN_Y = GAME_BOTTOM - 80;
const FLOAT_DISTANCE = GAME_BOTTOM - GAME_TOP - 100;

function FloatingBubble({ bubble, onTap, onMiss }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;
  const popScale = useRef(new Animated.Value(1)).current;
  const [isPopped, setIsPopped] = useState(false);
  const [hasMissed, setHasMissed] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
    ]).start();

    Animated.timing(translateY, {
      toValue: -FLOAT_DISTANCE,
      duration: bubble.lifespan,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !isPopped) {
        setHasMissed(true);
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onMiss(bubble.id);
        });
      }
    });
  }, []);

  const handlePress = () => {
    if (isPopped || hasMissed) return;
    setIsPopped(true);

    Animated.sequence([
      Animated.timing(popScale, {
        toValue: 1.5,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(popScale, { toValue: 0.3, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
    ]).start(() => {
      onTap(bubble.id);
    });
  };

  return (
    <Animated.View
      style={[
        styles.bubbleWrap,
        {
          left: bubble.x,
          top: SPAWN_Y,
          opacity,
          transform: [
            { translateY },
            { scale: Animated.multiply(scale, popScale) },
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7} disabled={isPopped || hasMissed}>
        <View style={[styles.bubble, { backgroundColor: bubble.color }]}>
          <View style={styles.bubbleHighlight} />
          <View style={styles.bubbleHighlightSmall} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function BubbleActivity() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } = useLocalSearchParams();

  const [level, setLevel] = useState(1);
  const [childGender, setChildGender] = useState("female");
  const [bubbles, setBubbles] = useState([]);
  const [poppedThisLevel, setPoppedThisLevel] = useState(0);
  const [gameState, setGameState] = useState("playing");
  const [finalStars, setFinalStars] = useState(0);

  const [noumiExpression, setNoumiExpression] = useState("idle");
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleColor, setBubbleColor] = useState(GARDEN.bubbleHappy);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const noumiBounce = useRef(new Animated.Value(0)).current;

  const startTime = useRef(Date.now());
  const totalPopped = useRef(0);
  const totalMissed = useRef(0);
  const bubbleTimerRef = useRef(null);
  const spawnIntervalRef = useRef(null);
  const isPausedRef = useRef(false);
  const onScreenCountRef = useRef(0);

  const config = LEVEL_CONFIG[level];

  useEffect(() => {
    if (childId) fetchChildGender(childId).then(setChildGender);
  }, [childId]);

  useEffect(() => {
    showSpeechBubble(
      speak(level === 1 ? "اضغط الفقاعات!" : "هيا نكمل!", childGender),
      GARDEN.bubbleHappy,
      "happy",
      2000
    );
  }, [level]);

  useEffect(() => {
    if (gameState !== "playing") return;

    isPausedRef.current = false;

    const spawn = () => {
      if (isPausedRef.current) return;
      if (onScreenCountRef.current >= config.maxOnScreen) return;

      const newBubble = {
        id: `b-${Date.now()}-${Math.random()}`,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        x: 30 + Math.random() * (width - 110),
        lifespan: config.lifespan,
      };

      onScreenCountRef.current += 1;
      setBubbles((prev) => [...prev, newBubble]);
    };

    spawn();

    spawnIntervalRef.current = setInterval(spawn, config.spawnRate);

    return () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current);
        spawnIntervalRef.current = null;
      }
    };
  }, [level, gameState]);

  useEffect(() => {
    return () => {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
    };
  }, []);

  const showSpeechBubble = (text, color, expression, duration = 1200) => {
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
    }

    bubbleTimerRef.current = setTimeout(() => {
      setBubbleVisible(false);
      setNoumiExpression("idle");
    }, duration);
  };

  const handleBubbleTap = useCallback((bubbleId) => {
    onScreenCountRef.current = Math.max(0, onScreenCountRef.current - 1);
    totalPopped.current += 1;

    setBubbles((prev) => prev.filter((b) => b.id !== bubbleId));
    setPoppedThisLevel((c) => {
      const newCount = c + 1;
      if (newCount % 3 === 0 || newCount === config.needed) {
        showSpeechBubble(speak(pickRandom(HAPPY_MESSAGES), childGender), GARDEN.bubbleHappy, "happy", 1000);
      }

      if (newCount >= config.needed) {
        setTimeout(() => advanceLevel(), 600);
      }

      return newCount;
    });
  }, [config.needed]);

  const handleBubbleMiss = useCallback((bubbleId) => {
    onScreenCountRef.current = Math.max(0, onScreenCountRef.current - 1);
    totalMissed.current += 1;

    setBubbles((prev) => prev.filter((b) => b.id !== bubbleId));
  }, []);

  const advanceLevel = () => {
    isPausedRef.current = true;
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }
    setBubbles([]);
    onScreenCountRef.current = 0;

    if (level < 3) {
      showSpeechBubble(speak(pickRandom(EXCITED_MESSAGES), childGender), GARDEN.bubbleExcited, "excited", 2500);
      setTimeout(() => {
        setPoppedThisLevel(0);
        setLevel(level + 1);
      }, 1800);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    isPausedRef.current = true;
    if (spawnIntervalRef.current) {
      clearInterval(spawnIntervalRef.current);
      spawnIntervalRef.current = null;
    }
    setBubbles([]);

    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const correct = totalPopped.current;
    const missed = totalMissed.current;
    const total = correct + missed;
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
        wrongAnswers: missed,
        totalAttempts: total,
        durationSec: duration,
      });
    }
  };

  const handleReset = () => {
    isPausedRef.current = true;
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    setBubbles([]);
    onScreenCountRef.current = 0;
    setPoppedThisLevel(0);
    setLevel(1);
    setGameState("playing");
    setFinalStars(0);
    totalPopped.current = 0;
    totalMissed.current = 0;
    startTime.current = Date.now();
  };

  const handleBackToPath = () => {
    isPausedRef.current = true;
    if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
    if (childId) {
      router.replace({ pathname: "/child/Home", params: { childId } });
    } else {
      router.back();
    }
  };

  const overallProgress = ((level - 1) / 3) + ((poppedThisLevel / config.needed) / 3);

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
          <Text style={sharedGameStyles.title}>الفقاعات</Text>
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

      <View style={sharedGameStyles.flowerTopLeft}><MiniFlower size={26} color={GARDEN.flowerPink} /></View>
      <View style={sharedGameStyles.flowerTopRight}><MiniFlower size={24} color={GARDEN.flowerYellow} /></View>
      <View style={sharedGameStyles.flowerBottomLeft}><MiniFlower size={22} color={GARDEN.flowerPurple} /></View>
      <View style={sharedGameStyles.flowerBottomRight}><MiniFlower size={20} color={GARDEN.flowerPink} /></View>

      <View style={styles.counterPill}>
        <Text style={styles.counterText}>{poppedThisLevel} / {config.needed}</Text>
      </View>

      {bubbles.map((b) => (
        <FloatingBubble
          key={b.id}
          bubble={b}
          onTap={handleBubbleTap}
          onMiss={handleBubbleMiss}
        />
      ))}

      <View style={sharedGameStyles.noumiCorner} pointerEvents="none">
        <SpeechBubble text={bubbleText} color={bubbleColor} visible={bubbleVisible} />
        <Animated.View style={{ transform: [{ translateY: noumiBounce }] }}>
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
    fontSize: 20,
    fontWeight: "900",
    color: GARDEN.textDark,
  },
  bubbleWrap: {
    position: "absolute",
    zIndex: 5,
  },
  bubble: {
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    position: "relative",
  },
  bubbleHighlight: {
    position: "absolute",
    top: 12,
    left: 16,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
  },
  bubbleHighlightSmall: {
    position: "absolute",
    top: 38,
    left: 22,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
});

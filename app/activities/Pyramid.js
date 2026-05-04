import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  PanResponder,
  Platform,
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

const { width, height } = Dimensions.get("window");

const GARDEN = {
  skyTop: "#87CEEB",
  gardenMain: "#66BB6A",
  gardenLight: "#A5D6A7",
  gardenDark: "#4CAF50",
  sunYellow: "#FFC93C",
  textDark: "#1B5E20",
  flowerPink: "#EC407A",
  flowerYellow: "#FFCA28",
  flowerPurple: "#AB47BC",
  bubbleHappy: "#A5D6A7",
  bubbleSad: "#FFCDD2",
  bubbleExcited: "#FFE082",
  scarfPink: "#EC407A",
  rabbitPink: "#FFB6C1",
};

const RING_COLORS = [
  "#EF5350",
  "#42A5F5",
  "#FFC107",
  "#AB47BC",
  "#FF7043",
  "#26C6DA",
];
const RING_LABELS = ["١", "٢", "٣", "٤", "٥", "٦"];

const generateRings = (count) =>
  Array.from({ length: count }, (_, i) => ({
    id: `ring-${i}`,
    color: RING_COLORS[i] || "#333",
    size: 80 - i * 10,
    placed: false,
    label: RING_LABELS[i],
  }));

// ─────────────────────────────────────────────
// NOUMI COMPANION (4 expressions)
// ─────────────────────────────────────────────
function NoumiCompanion({ size = 100, expression = "idle" }) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 100 110" fill="none">
      <Ellipse cx="50" cy="105" rx="28" ry="4" fill="#000" opacity="0.15" />
      <Ellipse cx="38" cy="20" rx="7" ry="18" fill="#FFFFFF" />
      <Ellipse
        cx="38"
        cy="22"
        rx="4"
        ry="14"
        fill={GARDEN.rabbitPink}
        opacity="0.7"
      />
      <Ellipse cx="62" cy="20" rx="7" ry="18" fill="#FFFFFF" />
      <Ellipse
        cx="62"
        cy="22"
        rx="4"
        ry="14"
        fill={GARDEN.rabbitPink}
        opacity="0.7"
      />
      <Circle cx="50" cy="50" r="28" fill="#FFFFFF" />
      <Circle
        cx="34"
        cy="58"
        r="5"
        fill={GARDEN.rabbitPink}
        opacity={
          expression === "happy" || expression === "excited" ? 0.85 : 0.6
        }
      />
      <Circle
        cx="66"
        cy="58"
        r="5"
        fill={GARDEN.rabbitPink}
        opacity={
          expression === "happy" || expression === "excited" ? 0.85 : 0.6
        }
      />

      {expression === "idle" && (
        <>
          <Circle cx="40" cy="48" r="3.5" fill="#2C2C2C" />
          <Circle cx="60" cy="48" r="3.5" fill="#2C2C2C" />
          <Circle cx="41" cy="46" r="1.2" fill="#FFFFFF" />
          <Circle cx="61" cy="46" r="1.2" fill="#FFFFFF" />
        </>
      )}

      {expression === "happy" && (
        <>
          <Path
            d="M 36 48 Q 40 51 44 48"
            stroke="#2C2C2C"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 56 48 Q 60 51 64 48"
            stroke="#2C2C2C"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}

      {expression === "sad" && (
        <>
          <Circle cx="40" cy="50" r="3" fill="#2C2C2C" />
          <Circle cx="60" cy="50" r="3" fill="#2C2C2C" />
          <Path
            d="M 38 54 Q 38 58 40 60 Q 42 58 42 54 Z"
            fill="#64B5F6"
            opacity="0.85"
          />
        </>
      )}

      {expression === "excited" && (
        <>
          <Circle cx="40" cy="48" r="4" fill="#2C2C2C" />
          <Circle cx="60" cy="48" r="4" fill="#2C2C2C" />
          <Circle cx="42" cy="46" r="1.5" fill="#FFFFFF" />
          <Circle cx="62" cy="46" r="1.5" fill="#FFFFFF" />
          <Path
            d="M 30 35 L 31 38 L 34 39 L 31 40 L 30 43 L 29 40 L 26 39 L 29 38 Z"
            fill={GARDEN.sunYellow}
          />
          <Path
            d="M 70 35 L 71 38 L 74 39 L 71 40 L 70 43 L 69 40 L 66 39 L 69 38 Z"
            fill={GARDEN.sunYellow}
          />
        </>
      )}

      <Path
        d="M 50 56 Q 47 54 47 58 Q 47 61 50 63 Q 53 61 53 58 Q 53 54 50 56 Z"
        fill="#FF6B9D"
      />

      {expression === "idle" && (
        <Path
          d="M 44 66 Q 50 70 56 66"
          stroke="#3E2723"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {expression === "happy" && (
        <>
          <Path
            d="M 50 64 Q 44 70 40 67"
            stroke="#3E2723"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 50 64 Q 56 70 60 67"
            stroke="#3E2723"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 44 65 Q 50 72 56 65"
            stroke="#3E2723"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
      {expression === "sad" && (
        <Path
          d="M 44 70 Q 50 65 56 70"
          stroke="#3E2723"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      )}
      {expression === "excited" && (
        <>
          <Ellipse cx="50" cy="68" rx="6" ry="4" fill="#3E2723" />
          <Ellipse cx="50" cy="67" rx="3" ry="1.5" fill="#FF6B9D" />
        </>
      )}

      <Ellipse cx="50" cy="88" rx="22" ry="16" fill="#FFFFFF" />
      <Path
        d="M 32 78 Q 50 85 68 78 Q 68 82 50 88 Q 32 82 32 78 Z"
        fill={GARDEN.scarfPink}
      />
      <Circle cx="32" cy="82" r="6" fill="#FFFFFF" />
      <Circle cx="68" cy="82" r="6" fill="#FFFFFF" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// SPEECH BUBBLE
// ─────────────────────────────────────────────
function SpeechBubble({ text, color = GARDEN.bubbleHappy, visible }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        styles.bubble,
        { backgroundColor: color, opacity, transform: [{ scale }] },
      ]}
      pointerEvents="none"
    >
      <Text style={styles.bubbleText}>{text}</Text>
      <View style={[styles.bubbleTail, { borderTopColor: color }]} />
    </Animated.View>
  );
}

// ─────────────────────────────────────────────
// SUN + CLOUDS + FLOWER
// ─────────────────────────────────────────────
function SunSVG({ size = 55 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <Circle cx="30" cy="30" r="20" fill={GARDEN.sunYellow} />
      <Path
        d="M 30 4 L 30 12"
        stroke={GARDEN.sunYellow}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Path
        d="M 30 48 L 30 56"
        stroke={GARDEN.sunYellow}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Path
        d="M 4 30 L 12 30"
        stroke={GARDEN.sunYellow}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <Path
        d="M 48 30 L 56 30"
        stroke={GARDEN.sunYellow}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function CloudSmall({ size = 50 }) {
  return (
    <Svg width={size} height={size * 0.55} viewBox="0 0 50 28" fill="none">
      <Ellipse cx="11" cy="16" rx="9" ry="7" fill="#FFFFFF" />
      <Ellipse cx="25" cy="13" rx="11" ry="9" fill="#FFFFFF" />
      <Ellipse cx="39" cy="16" rx="9" ry="7" fill="#FFFFFF" />
    </Svg>
  );
}

function MiniFlower({ size = 22, color = GARDEN.flowerPink }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Circle cx="11" cy="5" r="4" fill={color} />
      <Circle cx="5" cy="11" r="4" fill={color} />
      <Circle cx="17" cy="11" r="4" fill={color} />
      <Circle cx="11" cy="17" r="4" fill={color} />
      <Circle cx="11" cy="11" r="3" fill={GARDEN.flowerYellow} />
    </Svg>
  );
}

const HAPPY_MESSAGES = ["ممتاز!", "أحسنتِ!", "رائع!", "جميل!"];
const SAD_MESSAGES = ["حاولي رقم ١ أولاً!", "ليست هذي!", "بالترتيب!"];
const EXCITED_MESSAGES = [
  "وصلتِ للمستوى التالي!",
  "ممتاز! كملي!",
  "هيا للمستوى الجديد!",
];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─────────────────────────────────────────────
// MAIN: PYRAMID GAME
// ─────────────────────────────────────────────
export default function PyramidScreen() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } =
    useLocalSearchParams();

  const [level, setLevel] = useState(1);
  const [rings, setRings] = useState(generateRings(3));
  const [progress, setProgress] = useState(0);
  const [gameState, setGameState] = useState("playing");
  const [finalStars, setFinalStars] = useState(0);

  const [noumiExpression, setNoumiExpression] = useState("idle");
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleColor, setBubbleColor] = useState(GARDEN.bubbleHappy);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const noumiBounce = useRef(new Animated.Value(0)).current;
  const noumiShake = useRef(new Animated.Value(0)).current;

  const startTime = useRef(Date.now());
  const totalErrors = useRef(0);
  const totalCorrect = useRef(0);
  const bubbleTimerRef = useRef(null);

  const placedRings = rings.filter((r) => r.placed);

  useEffect(() => {
    let count = 3;
    if (level === 2) count = 5;
    if (level === 3) count = 6;
    setRings(generateRings(count));
    setProgress(0);
    startTime.current = Date.now();
  }, [level]);

  useEffect(() => {
    showBubble("هيا نلعب!", GARDEN.bubbleHappy, "happy", 2000);
  }, []);

  const showBubble = (text, color, expression, duration = 1800) => {
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);

    setBubbleText(text);
    setBubbleColor(color);
    setNoumiExpression(expression);
    setBubbleVisible(true);

    if (expression === "happy" || expression === "excited") {
      Animated.sequence([
        Animated.timing(noumiBounce, {
          toValue: -8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(noumiBounce, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (expression === "sad") {
      Animated.sequence([
        Animated.timing(noumiShake, {
          toValue: -3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(noumiShake, {
          toValue: 3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(noumiShake, {
          toValue: -3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(noumiShake, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }

    bubbleTimerRef.current = setTimeout(() => {
      setBubbleVisible(false);
      setNoumiExpression("idle");
    }, duration);
  };

  const handleDrop = (id, gesture) => {
    const pegCenterX = width / 2;
    const isOverPeg =
      Math.abs(gesture.moveX - pegCenterX) < 90 && gesture.moveY < height * 0.6;

    if (!isOverPeg) return false;

    let isCorrectOrder = false;

    setRings((prevRings) => {
      const currentUnplaced = prevRings.filter((r) => !r.placed);

      if (currentUnplaced.length > 0 && currentUnplaced[0].id === id) {
        isCorrectOrder = true;
        totalCorrect.current += 1;
        const updated = prevRings.map((r) =>
          r.id === id ? { ...r, placed: true } : r
        );

        const newPlacedCount = updated.filter((r) => r.placed).length;
        setProgress(newPlacedCount / prevRings.length);

        showBubble(
          pickRandom(HAPPY_MESSAGES),
          GARDEN.bubbleHappy,
          "happy",
          1500
        );

        if (newPlacedCount === prevRings.length) {
          setTimeout(() => {
            if (level < 3) {
              showBubble(
                pickRandom(EXCITED_MESSAGES),
                GARDEN.bubbleExcited,
                "excited",
                2500
              );
              setTimeout(() => setLevel(level + 1), 1500);
            } else {
              finishGame();
            }
          }, 800);
        }
        return updated;
      }

      totalErrors.current += 1;
      showBubble(pickRandom(SAD_MESSAGES), GARDEN.bubbleSad, "sad", 1800);
      return prevRings;
    });

    return isCorrectOrder;
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
        activityTitle: activityTitle || "بناء الهرم",
        category: category || "thinkingCategoryID",
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
    setRings(generateRings(3));
    setProgress(0);
    setGameState("playing");
    setFinalStars(0);
    totalErrors.current = 0;
    totalCorrect.current = 0;
    showBubble("هيا نلعب!", GARDEN.bubbleHappy, "happy", 2000);
  };

  const handleBackToPath = () => {
    if (childId) {
      router.replace({
        pathname: "/child/Home",
        params: { childId },
      });
    } else {
      router.back();
    }
  };

  const overallProgress = (level - 1) / 3 + progress / 3;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={GARDEN.skyTop} />

      <View style={styles.skyLayer}>
        <View style={styles.sun}>
          <SunSVG size={55} />
        </View>
        <View style={styles.cloud1}>
          <CloudSmall size={50} />
        </View>
        <View style={styles.cloud2}>
          <CloudSmall size={40} />
        </View>
      </View>

      <View style={styles.gardenBg} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBackToPath}>
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
        <View style={styles.titleBlock}>
          <Text style={styles.title}>بناء الهرم</Text>
          <Text style={styles.subtitle}>المستوى {level} من 3</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${overallProgress * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressPct}>
          {Math.round(overallProgress * 100)}%
        </Text>
      </View>

      <View style={styles.flowerLeft}>
        <MiniFlower size={26} color={GARDEN.flowerPink} />
      </View>
      <View style={styles.flowerRight}>
        <MiniFlower size={24} color={GARDEN.flowerYellow} />
      </View>
      <View style={styles.flowerBottomLeft}>
        <MiniFlower size={22} color={GARDEN.flowerPurple} />
      </View>
      <View style={styles.flowerBottomRight}>
        <MiniFlower size={20} color={GARDEN.flowerPink} />
      </View>

      <View style={styles.gameArea}>
        <View style={styles.pegContainer}>
          <View style={styles.pegBase} />
          <View style={styles.pegStick} />
          <View style={styles.placedRingsContainer}>
            {placedRings.map((ring) => (
              <View
                key={ring.id}
                style={[
                  styles.staticRing,
                  {
                    width: ring.size * 1.8,
                    height: 30,
                    backgroundColor: ring.color,
                  },
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      <View style={styles.ringsArea}>
        <Text style={styles.hintText}>اسحبي القطع من ١ إلى {rings.length}</Text>
        <View style={styles.ringsContainer}>
          {rings
            .filter((r) => !r.placed)
            .map((ring) => (
              <RingItem key={ring.id} ring={ring} onDrop={handleDrop} />
            ))}
        </View>
      </View>

      <View style={styles.noumiCorner} pointerEvents="none">
        <SpeechBubble
          text={bubbleText}
          color={bubbleColor}
          visible={bubbleVisible}
        />
        <Animated.View
          style={{
            transform: [
              { translateY: noumiBounce },
              { translateX: noumiShake },
            ],
          }}
        >
          <NoumiCompanion size={95} expression={noumiExpression} />
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

function RingItem({ ring, onDrop }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (e, gesture) => {
        const success = onDrop(ring.id, gesture);
        if (!success) {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        } else {
          pan.setValue({ x: 0, y: 0 });
        }
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.ring,
        {
          width: ring.size * 1.8,
          height: 40,
          backgroundColor: ring.color,
          transform: pan.getTranslateTransform(),
        },
      ]}
    >
      <Text style={styles.ringLabel}>{ring.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GARDEN.gardenMain },

  skyLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "16%",
    backgroundColor: GARDEN.skyTop,
  },
  sun: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 25,
    right: 24,
  },
  cloud1: {
    position: "absolute",
    top: Platform.OS === "ios" ? 65 : 45,
    left: 30,
  },
  cloud2: {
    position: "absolute",
    top: Platform.OS === "ios" ? 95 : 75,
    left: width * 0.45,
  },

  gardenBg: {
    position: "absolute",
    top: "16%",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: GARDEN.gardenMain,
  },

  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 55 : 30,
    paddingBottom: 12,
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: { flex: 1, alignItems: "center" },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "700",
    marginTop: 2,
  },

  progressRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 10,
    marginTop: 10,
    zIndex: 5,
  },
  progressBg: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: GARDEN.sunYellow,
    borderRadius: 6,
  },
  progressPct: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    minWidth: 40,
  },

  flowerLeft: { position: "absolute", top: "30%", left: 16, zIndex: 2 },
  flowerRight: { position: "absolute", top: "32%", right: 16, zIndex: 2 },
  flowerBottomLeft: { position: "absolute", bottom: 100, left: 20, zIndex: 2 },
  flowerBottomRight: { position: "absolute", bottom: 110, right: 20, zIndex: 2 },

  gameArea: { flex: 1, justifyContent: "center", alignItems: "center" },
  pegContainer: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 280,
    zIndex: 3,
  },
  pegBase: {
    width: 180,
    height: 18,
    borderRadius: 12,
    backgroundColor: "#5D4037",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  pegStick: {
    width: 12,
    height: 200,
    borderRadius: 6,
    backgroundColor: "#795548",
    position: "absolute",
    bottom: 18,
  },
  placedRingsContainer: {
    position: "absolute",
    bottom: 18,
    alignItems: "center",
    flexDirection: "column-reverse",
  },
  staticRing: {
    borderRadius: 10,
    marginBottom: 2,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  ringsArea: {
    paddingBottom: 30,
    paddingTop: 10,
    alignItems: "center",
    zIndex: 3,
  },
  hintText: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 14,
    fontWeight: "700",
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  ringsContainer: {
    flexDirection: "row-reverse",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
    paddingHorizontal: 10,
    minHeight: 50,
  },
  ring: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  ringLabel: {
    color: "white",
    fontWeight: "900",
    fontSize: 18,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  noumiCorner: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 30 : 20,
    left: 12,
    zIndex: 20,
    alignItems: "flex-start",
  },

  bubble: {
    position: "absolute",
    top: -55,
    left: 60,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    minWidth: 110,
    maxWidth: 200,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  bubbleText: {
    fontSize: 13,
    fontWeight: "800",
    color: GARDEN.textDark,
    textAlign: "center",
  },
  bubbleTail: {
    position: "absolute",
    bottom: -8,
    left: 18,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
});

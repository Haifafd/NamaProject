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

const PALETTE = [
  { id: "red",    color: "#EF5350", hint: "#FFCDD2", name: "أحمر" },
  { id: "orange", color: "#FFA726", hint: "#FFE0B2", name: "برتقالي" },
  { id: "blue",   color: "#42A5F5", hint: "#BBDEFB", name: "أزرق" },
  { id: "green",  color: "#66BB6A", hint: "#C8E6C9", name: "أخضر" },
  { id: "yellow", color: "#FFCA28", hint: "#FFF9C4", name: "أصفر" },
];

const getColorById = (id) => PALETTE.find((p) => p.id === id);

const LEVEL_SHAPES = {
  1: {
    name: "الفراشة",
    zones: [
      { id: "wing-tl", target: "red" },
      { id: "wing-tr", target: "red" },
      { id: "wing-bl", target: "orange" },
      { id: "wing-br", target: "orange" },
    ],
  },
  2: {
    name: "الشجرة",
    zones: [
      { id: "leaves",  target: "green" },
      { id: "trunk",   target: "orange" },
      { id: "apple1",  target: "red" },
      { id: "apple2",  target: "red" },
      { id: "apple3",  target: "red" },
    ],
  },
  3: {
    name: "البستان",
    zones: [
      { id: "sky",          target: "blue" },
      { id: "sun",          target: "yellow" },
      { id: "grass",        target: "green" },
      { id: "tree-top",     target: "green" },
      { id: "flower-petal", target: "red" },
      { id: "flower-center",target: "yellow" },
    ],
  },
};

export default function ColorActivity() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } = useLocalSearchParams();

  const [level, setLevel] = useState(1);
  const [childGender, setChildGender] = useState("female");
  const [selectedColorId, setSelectedColorId] = useState("red");
  const [zoneFilled, setZoneFilled] = useState({});
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

  const currentShape = LEVEL_SHAPES[level];
  const totalZones = currentShape.zones.length;

  useEffect(() => {
    setZoneFilled({});
    startTime.current = Date.now();
    showSpeechBubble(speak(`لوّني ${currentShape.name}!`, childGender), GARDEN.bubbleHappy, "happy", 2500);
  }, [level]);

  useEffect(() => {
    if (childId) fetchChildGender(childId).then(setChildGender);
  }, [childId]);

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

  const getZoneFill = (zoneId) => {
    const zone = currentShape.zones.find((z) => z.id === zoneId);
    if (!zone) return "#FFFFFF";

    const targetColor = getColorById(zone.target);
    if (zoneFilled[zoneId]) {
      return targetColor.color;
    }
    return targetColor.hint;
  };

  const handleZonePress = (zoneId) => {
    const zone = currentShape.zones.find((z) => z.id === zoneId);
    if (!zone || zoneFilled[zoneId]) return;

    if (selectedColorId !== zone.target) {
      totalErrors.current += 1;
      const targetName = getColorById(zone.target).name;
      showSpeechBubble(speak(`اختاري اللون ${targetName}!`, childGender), GARDEN.bubbleSad, "sad", 1800);
      return;
    }

    totalCorrect.current += 1;
    showSpeechBubble(speak(pickRandom(HAPPY_MESSAGES), childGender), GARDEN.bubbleHappy, "happy", 1200);
    const newFilled = { ...zoneFilled, [zoneId]: true };
    setZoneFilled(newFilled);

    if (Object.keys(newFilled).length === totalZones) {
      setTimeout(() => {
        if (level < 3) {
          showSpeechBubble(speak(pickRandom(EXCITED_MESSAGES), childGender), GARDEN.bubbleExcited, "excited", 2500);
          setTimeout(() => setLevel(level + 1), 1500);
        } else {
          finishGame();
        }
      }, 800);
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
        activityTitle: activityTitle || "التلوين",
        category: category || "perceptionCategoryID",
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
    setZoneFilled({});
    setGameState("playing");
    setFinalStars(0);
    totalCorrect.current = 0;
    totalErrors.current = 0;
    startTime.current = Date.now();
  };

  const handleBackToPath = () => {
    if (childId) {
      router.replace({ pathname: "/child/Home", params: { childId } });
    } else {
      router.back();
    }
  };

  const overallProgress = ((level - 1) / 3) + (Object.keys(zoneFilled).length / totalZones / 3);

  const renderShape = () => {
    if (level === 1) {
      return (
        <Svg width={300} height={280} viewBox="0 0 300 280">
          <Ellipse cx="150" cy="140" rx="10" ry="90" fill="#3E2723" />
          <Circle cx="150" cy="55" r="14" fill="#3E2723" />
          <Path d="M 144 50 Q 130 28 118 22" stroke="#3E2723" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Path d="M 156 50 Q 170 28 182 22" stroke="#3E2723" strokeWidth="3" strokeLinecap="round" fill="none" />

          <Path
            d="M 140 80 Q 50 50 25 100 Q 25 135 140 135 Z"
            fill={getZoneFill("wing-tl")}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("wing-tl")}
          />
          <Path
            d="M 160 80 Q 250 50 275 100 Q 275 135 160 135 Z"
            fill={getZoneFill("wing-tr")}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("wing-tr")}
          />
          <Path
            d="M 140 145 Q 60 160 50 220 Q 95 240 140 195 Z"
            fill={getZoneFill("wing-bl")}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("wing-bl")}
          />
          <Path
            d="M 160 145 Q 240 160 250 220 Q 205 240 160 195 Z"
            fill={getZoneFill("wing-br")}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("wing-br")}
          />
        </Svg>
      );
    }

    if (level === 2) {
      return (
        <Svg width={300} height={300} viewBox="0 0 300 300">
          <Path
            d="M 130 285 L 130 175 L 170 175 L 170 285 Z"
            fill={getZoneFill("trunk")}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("trunk")}
          />
          <Circle
            cx="150"
            cy="115"
            r="90"
            fill={getZoneFill("leaves")}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("leaves")}
          />
          <Circle
            cx="100"
            cy="90"
            r="22"
            fill={getZoneFill("apple1")}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("apple1")}
          />
          <Circle
            cx="200"
            cy="105"
            r="22"
            fill={getZoneFill("apple2")}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("apple2")}
          />
          <Circle
            cx="150"
            cy="160"
            r="22"
            fill={getZoneFill("apple3")}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("apple3")}
          />
        </Svg>
      );
    }

    return (
      <Svg width={300} height={300} viewBox="0 0 300 300">
        <Path
          d="M 0 0 L 300 0 L 300 150 L 0 150 Z"
          fill={getZoneFill("sky")}
          stroke="#3E2723"
          strokeWidth="3"
          onPress={() => handleZonePress("sky")}
        />
        <Path
          d="M 0 150 L 300 150 L 300 300 L 0 300 Z"
          fill={getZoneFill("grass")}
          stroke="#3E2723"
          strokeWidth="3"
          onPress={() => handleZonePress("grass")}
        />
        <Circle
          cx="245"
          cy="60"
          r="32"
          fill={getZoneFill("sun")}
          stroke="#3E2723"
          strokeWidth="3"
          onPress={() => handleZonePress("sun")}
        />
        <Circle
          cx="75"
          cy="135"
          r="42"
          fill={getZoneFill("tree-top")}
          stroke="#3E2723"
          strokeWidth="3"
          onPress={() => handleZonePress("tree-top")}
        />
        <Path d="M 70 175 L 70 240 L 80 240 L 80 175 Z" fill="#6D4C41" />
        <Path d="M 200 285 L 200 240" stroke="#388E3C" strokeWidth="4" strokeLinecap="round" />
        <Circle
          cx="200"
          cy="225"
          r="26"
          fill={getZoneFill("flower-petal")}
          stroke="#3E2723"
          strokeWidth="3"
          onPress={() => handleZonePress("flower-petal")}
        />
        <Circle
          cx="200"
          cy="225"
          r="11"
          fill={getZoneFill("flower-center")}
          stroke="#3E2723"
          strokeWidth="3"
          onPress={() => handleZonePress("flower-center")}
        />
      </Svg>
    );
  };

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
          <Text style={sharedGameStyles.title}>التلوين</Text>
          <Text style={sharedGameStyles.subtitle}>{currentShape.name} • {level} من 3</Text>
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

      <View style={styles.shapeArea}>
        <View style={styles.shapeCanvas}>
          {renderShape()}
        </View>
      </View>

      <View style={styles.paletteWrap}>
        <Text style={styles.paletteLabel}>اختاري لون:</Text>
        <View style={styles.paletteRow}>
          {PALETTE.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.colorBtn,
                { backgroundColor: p.color },
                selectedColorId === p.id && styles.colorBtnActive,
              ]}
              onPress={() => setSelectedColorId(p.id)}
              activeOpacity={0.8}
            >
              {selectedColorId === p.id && (
                <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M 5 13 L 9 17 L 19 7"
                    stroke="#FFFFFF"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={sharedGameStyles.noumiCorner} pointerEvents="none">
        <SpeechBubble text={bubbleText} color={bubbleColor} visible={bubbleVisible} />
        <Animated.View
          style={{ transform: [{ translateY: noumiBounce }, { translateX: noumiShake }] }}
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
  shapeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  shapeCanvas: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  paletteWrap: {
    paddingVertical: 16,
    paddingBottom: 30,
    alignItems: "center",
  },
  paletteLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
  },
  paletteRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 14,
  },
  colorBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.7)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  colorBtnActive: {
    borderColor: "#FFFFFF",
    transform: [{ scale: 1.18 }],
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
});

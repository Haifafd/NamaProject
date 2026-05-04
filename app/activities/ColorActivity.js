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
import Svg, { Circle, Ellipse, Path, Text as SvgText } from "react-native-svg";
import { saveActivityResult } from "../../Services/ActivityService";
import ResultModal from "./Result";
import {
  GARDEN,
  NoumiCompanion,
  SpeechBubble,
  SunSVG,
  CloudSmall,
  HAPPY_MESSAGES,
  EXCITED_MESSAGES,
  pickRandom,
  sharedGameStyles,
} from "./_GameComponents";

const PALETTE = [
  { id: 1, color: "#42A5F5", label: "١", name: "أزرق" },
  { id: 2, color: "#FFA726", label: "٢", name: "برتقالي" },
  { id: 3, color: "#EF5350", label: "٣", name: "أحمر" },
  { id: 4, color: "#66BB6A", label: "٤", name: "أخضر" },
  { id: 5, color: "#AB47BC", label: "٥", name: "بنفسجي" },
];

const LEVEL_SHAPES = {
  1: {
    name: "الفراشة",
    zones: [
      { id: "wing-tl", required: "١" },
      { id: "wing-tr", required: "١" },
      { id: "wing-bl", required: "٢" },
      { id: "wing-br", required: "٢" },
    ],
  },
  2: {
    name: "الشجرة",
    zones: [
      { id: "leaves", required: "٤" },
      { id: "trunk", required: "٢" },
      { id: "apple1", required: "٣" },
      { id: "apple2", required: "٣" },
      { id: "apple3", required: "٣" },
    ],
  },
  3: {
    name: "البستان",
    zones: [
      { id: "sky", required: "١" },
      { id: "sun", required: "٢" },
      { id: "grass", required: "٤" },
      { id: "flower-petal", required: "٣" },
      { id: "flower-center", required: "٢" },
      { id: "tree-top", required: "٤" },
    ],
  },
};

export default function ColoringGame() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } =
    useLocalSearchParams();

  const [level, setLevel] = useState(1);
  const [selectedColorId, setSelectedColorId] = useState(1);
  const [zoneColors, setZoneColors] = useState({});
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

  useEffect(() => {
    setZoneColors({});
    startTime.current = Date.now();
    showSpeechBubble(
      `لوّني ${currentShape.name} حسب الأرقام!`,
      GARDEN.bubbleHappy,
      "happy",
      2500
    );
  }, [level]);

  const handleZonePress = (zoneId) => {
    const zone = currentShape.zones.find((z) => z.id === zoneId);
    if (!zone || zoneColors[zoneId]) return;

    const selected = PALETTE.find((p) => p.id === selectedColorId);

    if (selected.label !== zone.required) {
      totalErrors.current += 1;
      showSpeechBubble(
        `اختاري الرقم ${zone.required}!`,
        GARDEN.bubbleSad,
        "sad",
        1800
      );
      return;
    }

    totalCorrect.current += 1;
    showSpeechBubble(pickRandom(HAPPY_MESSAGES), GARDEN.bubbleHappy, "happy", 1200);
    const newColors = { ...zoneColors, [zoneId]: selected.color };
    setZoneColors(newColors);

    if (Object.keys(newColors).length === totalZones) {
      setTimeout(() => {
        if (level < 3) {
          showSpeechBubble(
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
    setZoneColors({});
    setGameState("playing");
    setFinalStars(0);
    totalCorrect.current = 0;
    totalErrors.current = 0;
  };

  const handleBackToPath = () => {
    if (childId) {
      router.replace({ pathname: "/child/Home", params: { childId } });
    } else {
      router.back();
    }
  };

  const overallProgress =
    (level - 1) / 3 + Object.keys(zoneColors).length / totalZones / 3;

  const renderShape = () => {
    if (level === 1) {
      return (
        <Svg width={280} height={260} viewBox="0 0 280 260" fill="none">
          <Ellipse cx="140" cy="130" rx="10" ry="80" fill="#3E2723" />
          <Circle cx="140" cy="55" r="14" fill="#3E2723" />
          <Path
            d="M 134 50 Q 120 30 110 25"
            stroke="#3E2723"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 146 50 Q 160 30 170 25"
            stroke="#3E2723"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <Path
            d="M 130 80 Q 60 50 30 100 Q 30 130 130 130 Z"
            fill={zoneColors["wing-tl"] || "#FFFFFF"}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("wing-tl")}
          />
          <Path
            d="M 150 80 Q 220 50 250 100 Q 250 130 150 130 Z"
            fill={zoneColors["wing-tr"] || "#FFFFFF"}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("wing-tr")}
          />
          <Path
            d="M 130 140 Q 60 150 50 200 Q 90 220 130 180 Z"
            fill={zoneColors["wing-bl"] || "#FFFFFF"}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("wing-bl")}
          />
          <Path
            d="M 150 140 Q 220 150 230 200 Q 190 220 150 180 Z"
            fill={zoneColors["wing-br"] || "#FFFFFF"}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("wing-br")}
          />
          {!zoneColors["wing-tl"] && (
            <SvgText x="80" y="105" fill="#3E2723" fontSize="22" fontWeight="900">
              ١
            </SvgText>
          )}
          {!zoneColors["wing-tr"] && (
            <SvgText x="195" y="105" fill="#3E2723" fontSize="22" fontWeight="900">
              ١
            </SvgText>
          )}
          {!zoneColors["wing-bl"] && (
            <SvgText x="85" y="190" fill="#3E2723" fontSize="22" fontWeight="900">
              ٢
            </SvgText>
          )}
          {!zoneColors["wing-br"] && (
            <SvgText x="195" y="190" fill="#3E2723" fontSize="22" fontWeight="900">
              ٢
            </SvgText>
          )}
        </Svg>
      );
    }

    if (level === 2) {
      return (
        <Svg width={280} height={300} viewBox="0 0 280 300" fill="none">
          <Path
            d="M 120 280 L 120 180 L 160 180 L 160 280 Z"
            fill={zoneColors["trunk"] || "#FFFFFF"}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("trunk")}
          />
          <Circle
            cx="140"
            cy="120"
            r="80"
            fill={zoneColors["leaves"] || "#FFFFFF"}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("leaves")}
          />
          <Circle
            cx="100"
            cy="100"
            r="22"
            fill={zoneColors["apple1"] || "#FFFFFF"}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("apple1")}
          />
          <Circle
            cx="180"
            cy="110"
            r="22"
            fill={zoneColors["apple2"] || "#FFFFFF"}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("apple2")}
          />
          <Circle
            cx="140"
            cy="155"
            r="22"
            fill={zoneColors["apple3"] || "#FFFFFF"}
            stroke="#3E2723"
            strokeWidth="3"
            onPress={() => handleZonePress("apple3")}
          />
          {!zoneColors["leaves"] && (
            <SvgText x="135" y="125" fill="#3E2723" fontSize="28" fontWeight="900">
              ٤
            </SvgText>
          )}
          {!zoneColors["trunk"] && (
            <SvgText x="135" y="235" fill="#3E2723" fontSize="22" fontWeight="900">
              ٢
            </SvgText>
          )}
          {!zoneColors["apple1"] && (
            <SvgText x="95" y="108" fill="#3E2723" fontSize="18" fontWeight="900">
              ٣
            </SvgText>
          )}
          {!zoneColors["apple2"] && (
            <SvgText x="175" y="118" fill="#3E2723" fontSize="18" fontWeight="900">
              ٣
            </SvgText>
          )}
          {!zoneColors["apple3"] && (
            <SvgText x="135" y="163" fill="#3E2723" fontSize="18" fontWeight="900">
              ٣
            </SvgText>
          )}
        </Svg>
      );
    }

    return (
      <Svg width={300} height={300} viewBox="0 0 300 300" fill="none">
        <Path
          d="M 0 0 L 300 0 L 300 150 L 0 150 Z"
          fill={zoneColors["sky"] || "#FFFFFF"}
          stroke="#3E2723"
          strokeWidth="3"
          onPress={() => handleZonePress("sky")}
        />
        <Path
          d="M 0 150 L 300 150 L 300 300 L 0 300 Z"
          fill={zoneColors["grass"] || "#FFFFFF"}
          stroke="#3E2723"
          strokeWidth="3"
          onPress={() => handleZonePress("grass")}
        />
        <Circle
          cx="240"
          cy="60"
          r="32"
          fill={zoneColors["sun"] || "#FFFFFF"}
          stroke="#3E2723"
          strokeWidth="3"
          onPress={() => handleZonePress("sun")}
        />
        <Circle
          cx="80"
          cy="130"
          r="40"
          fill={zoneColors["tree-top"] || "#FFFFFF"}
          stroke="#3E2723"
          strokeWidth="3"
          onPress={() => handleZonePress("tree-top")}
        />
        <Path d="M 75 165 L 75 220 L 85 220 L 85 165 Z" fill="#6D4C41" />
        <Circle
          cx="200"
          cy="220"
          r="22"
          fill={zoneColors["flower-petal"] || "#FFFFFF"}
          stroke="#3E2723"
          strokeWidth="3"
          onPress={() => handleZonePress("flower-petal")}
        />
        <Circle
          cx="200"
          cy="220"
          r="9"
          fill={zoneColors["flower-center"] || "#FFFFFF"}
          stroke="#3E2723"
          strokeWidth="3"
          onPress={() => handleZonePress("flower-center")}
        />
        <Path d="M 200 245 L 200 280" stroke="#3E2723" strokeWidth="3" />
        {!zoneColors["sky"] && (
          <SvgText x="40" y="80" fill="#3E2723" fontSize="22" fontWeight="900">
            ١
          </SvgText>
        )}
        {!zoneColors["sun"] && (
          <SvgText x="234" y="68" fill="#3E2723" fontSize="20" fontWeight="900">
            ٢
          </SvgText>
        )}
        {!zoneColors["grass"] && (
          <SvgText x="40" y="270" fill="#3E2723" fontSize="22" fontWeight="900">
            ٤
          </SvgText>
        )}
        {!zoneColors["tree-top"] && (
          <SvgText x="73" y="140" fill="#3E2723" fontSize="22" fontWeight="900">
            ٤
          </SvgText>
        )}
        {!zoneColors["flower-petal"] && (
          <SvgText x="195" y="208" fill="#3E2723" fontSize="16" fontWeight="900">
            ٣
          </SvgText>
        )}
        {!zoneColors["flower-center"] && (
          <SvgText x="196" y="226" fill="#3E2723" fontSize="14" fontWeight="900">
            ٢
          </SvgText>
        )}
      </Svg>
    );
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
          <Text style={sharedGameStyles.title}>التلوين</Text>
          <Text style={sharedGameStyles.subtitle}>
            {currentShape.name} • {level} من 3
          </Text>
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

      <View style={styles.shapeArea}>
        <View style={styles.shapeCanvas}>{renderShape()}</View>
      </View>

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
            <Text style={styles.colorBtnLabel}>{p.label}</Text>
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
  shapeArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  shapeCanvas: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  paletteRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 20,
    paddingBottom: 30,
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
    transform: [{ scale: 1.15 }],
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  colorBtnLabel: {
    fontSize: 22,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

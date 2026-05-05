import { useEffect, useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Circle, Path } from "react-native-svg";
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

const SHAPES = {
  vertical_line: {
    name: "خط مستقيم",
    checkpoints: [
      { x: 140, y: 40 },
      { x: 140, y: 100 },
      { x: 140, y: 160 },
      { x: 140, y: 220 },
      { x: 140, y: 240 },
    ],
  },
  circle: {
    name: "دائرة",
    checkpoints: [
      { x: 140, y: 50 },
      { x: 200, y: 90 },
      { x: 230, y: 140 },
      { x: 200, y: 200 },
      { x: 140, y: 230 },
      { x: 80, y: 200 },
      { x: 50, y: 140 },
      { x: 80, y: 90 },
      { x: 140, y: 50 },
    ],
  },
  v_shape: {
    name: "حرف V",
    checkpoints: [
      { x: 60, y: 50 },
      { x: 100, y: 130 },
      { x: 140, y: 220 },
      { x: 180, y: 130 },
      { x: 220, y: 50 },
    ],
  },

  num_one: {
    name: "رقم ١",
    checkpoints: [
      { x: 140, y: 50 },
      { x: 140, y: 110 },
      { x: 140, y: 170 },
      { x: 140, y: 220 },
    ],
  },
  num_two: {
    name: "رقم ٢",
    checkpoints: [
      { x: 80, y: 60 },
      { x: 130, y: 50 },
      { x: 180, y: 70 },
      { x: 200, y: 110 },
      { x: 170, y: 150 },
      { x: 130, y: 180 },
      { x: 90, y: 210 },
      { x: 70, y: 230 },
      { x: 130, y: 230 },
      { x: 200, y: 230 },
    ],
  },
  num_three: {
    name: "رقم ٣",
    checkpoints: [
      { x: 80, y: 60 },
      { x: 130, y: 50 },
      { x: 180, y: 70 },
      { x: 200, y: 110 },
      { x: 170, y: 140 },
      { x: 140, y: 145 },
      { x: 170, y: 150 },
      { x: 200, y: 180 },
      { x: 180, y: 220 },
      { x: 130, y: 235 },
      { x: 80, y: 220 },
    ],
  },

  alif: {
    name: "حرف ألف",
    checkpoints: [
      { x: 140, y: 40 },
      { x: 140, y: 100 },
      { x: 140, y: 160 },
      { x: 140, y: 220 },
      { x: 140, y: 250 },
    ],
  },
  ba: {
    name: "حرف باء",
    checkpoints: [
      { x: 50, y: 130 },
      { x: 80, y: 160 },
      { x: 130, y: 180 },
      { x: 180, y: 180 },
      { x: 230, y: 160 },
      { x: 250, y: 130 },
      { x: 140, y: 230 },
    ],
  },
  waw: {
    name: "حرف واو",
    checkpoints: [
      { x: 80, y: 100 },
      { x: 60, y: 130 },
      { x: 80, y: 165 },
      { x: 130, y: 175 },
      { x: 180, y: 165 },
      { x: 200, y: 130 },
      { x: 180, y: 100 },
      { x: 200, y: 130 },
      { x: 220, y: 180 },
      { x: 220, y: 230 },
    ],
  },
};

const LEVEL_SHAPES = {
  1: ["vertical_line", "circle", "v_shape"],
  2: ["num_one", "num_two", "num_three"],
  3: ["alif", "ba", "waw"],
};

const HIT_RADIUS = 28;

export default function LetterTracing() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } = useLocalSearchParams();

  const [level, setLevel] = useState(1);
  const [shapeIdx, setShapeIdx] = useState(0);
  const [hitIndices, setHitIndices] = useState([]);
  const [gameState, setGameState] = useState("playing");
  const [finalStars, setFinalStars] = useState(0);

  const [noumiExpression, setNoumiExpression] = useState("idle");
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleColor, setBubbleColor] = useState(GARDEN.bubbleHappy);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const noumiBounce = useRef(new Animated.Value(0)).current;
  const noumiShake = useRef(new Animated.Value(0)).current;
  const startTime = useRef(Date.now());
  const completedShapes = useRef(0);
  const startedShapes = useRef(0);
  const bubbleTimerRef = useRef(null);

  const currentShapeKey = LEVEL_SHAPES[level][shapeIdx];
  const currentShape = SHAPES[currentShapeKey];

  const hitIndicesRef = useRef([]);
  const currentShapeRef = useRef(currentShape);

  useEffect(() => {
    setHitIndices([]);
    hitIndicesRef.current = [];
    currentShapeRef.current = currentShape;
    startedShapes.current += 1;
    showSpeechBubble(`تتبعي ${currentShape.name}!`, GARDEN.bubbleHappy, "happy", 2500);
  }, [level, shapeIdx]);

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

  const checkPointHit = (x, y) => {
    const shape = currentShapeRef.current;
    const nextIdx = hitIndicesRef.current.length;
    if (nextIdx >= shape.checkpoints.length) return;

    const next = shape.checkpoints[nextIdx];
    const dx = x - next.x;
    const dy = y - next.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= HIT_RADIUS) {
      const newHits = [...hitIndicesRef.current, nextIdx];
      hitIndicesRef.current = newHits;
      setHitIndices(newHits);

      if (newHits.length === shape.checkpoints.length) {
        completedShapes.current += 1;
        showSpeechBubble(pickRandom(HAPPY_MESSAGES), GARDEN.bubbleHappy, "happy", 1500);

        setTimeout(() => {
          if (shapeIdx < LEVEL_SHAPES[level].length - 1) {
            setShapeIdx(shapeIdx + 1);
          } else {
            if (level < 3) {
              showSpeechBubble(pickRandom(EXCITED_MESSAGES), GARDEN.bubbleExcited, "excited", 2500);
              setTimeout(() => {
                setLevel(level + 1);
                setShapeIdx(0);
              }, 1500);
            } else {
              finishGame();
            }
          }
        }, 1300);
      }
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        checkPointHit(locationX, locationY);
      },
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        checkPointHit(locationX, locationY);
      },
    })
  ).current;

  const finishGame = async () => {
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const completed = completedShapes.current;
    const started = startedShapes.current;
    const accuracy = started > 0 ? Math.round((completed / started) * 100) : 0;

    let stars = 1;
    if (accuracy >= 80) stars = 3;
    else if (accuracy >= 50) stars = 2;

    setFinalStars(stars);
    setGameState("won");

    if (childId && activityId) {
      await saveActivityResult({
        childId, activityId,
        activityTitle: activityTitle || "تتبع الخطوط",
        category: category || "focusCategoryID",
        level: 3,
        correctAnswers: completed,
        wrongAnswers: 0,
        totalAttempts: started,
        durationSec: duration,
      });
    }
  };

  const handleReset = () => {
    setLevel(1);
    setShapeIdx(0);
    completedShapes.current = 0;
    startedShapes.current = 0;
    setGameState("playing");
    setFinalStars(0);
  };

  const handleBackToPath = () => {
    if (childId) router.replace({ pathname: "/child/Home", params: { childId } });
    else router.back();
  };

  const totalShapes = LEVEL_SHAPES[1].length + LEVEL_SHAPES[2].length + LEVEL_SHAPES[3].length;
  const completedTotal = (level - 1) * 3 + shapeIdx;
  const overallProgress = completedTotal / totalShapes;

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
          <Text style={sharedGameStyles.title}>تتبع الخطوط</Text>
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

      <View style={styles.canvasWrap}>
        <View style={styles.canvas} {...panResponder.panHandlers}>
          <Svg width={280} height={280} viewBox="0 0 280 280">
            {currentShape.checkpoints.map((p, idx) => {
              if (idx === 0) return null;
              const prev = currentShape.checkpoints[idx - 1];
              const isFilled = hitIndices.includes(idx);
              return (
                <Path
                  key={`line-${idx}`}
                  d={`M ${prev.x} ${prev.y} L ${p.x} ${p.y}`}
                  stroke={isFilled ? "#66BB6A" : "#BDBDBD"}
                  strokeWidth={isFilled ? "8" : "5"}
                  strokeDasharray={isFilled ? "0" : "8 8"}
                  strokeLinecap="round"
                />
              );
            })}

            {currentShape.checkpoints.map((p, idx) => {
              const isHit = hitIndices.includes(idx);
              const isNext = idx === hitIndices.length;

              return (
                <Circle
                  key={`pt-${idx}`}
                  cx={p.x}
                  cy={p.y}
                  r={isNext ? 16 : 11}
                  fill={isHit ? "#66BB6A" : isNext ? "#FFC93C" : "#FFFFFF"}
                  stroke={isHit ? "#388E3C" : isNext ? "#F57F17" : "#9E9E9E"}
                  strokeWidth="3"
                />
              );
            })}

            {hitIndices.length === 0 && currentShape.checkpoints[0] && (
              <Circle
                cx={currentShape.checkpoints[0].x}
                cy={currentShape.checkpoints[0].y}
                r="22"
                fill="none"
                stroke="#FFC93C"
                strokeWidth="3"
                strokeDasharray="4 4"
              />
            )}
          </Svg>
        </View>

        <Text style={styles.hint}>
          ابدئي من النقطة الصفراء واسحبي إصبعك على الخطوط
        </Text>
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
  canvasWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 30,
  },
  canvas: {
    width: 280,
    height: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  hint: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 18,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    textAlign: "center",
  },
});

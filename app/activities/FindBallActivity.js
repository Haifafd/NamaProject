import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Stop } from "react-native-svg";
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

const { width } = Dimensions.get("window");

const SPOT_OFFSETS = [-110, 0, 110];
const CENTER_X = width / 2;
const SPOT_X = SPOT_OFFSETS.map((o) => CENTER_X + o);

const LEVEL_CONFIG = {
  1: { shuffleSpeed: 700, shuffleCount: 3 },
  2: { shuffleSpeed: 500, shuffleCount: 5 },
  3: { shuffleSpeed: 350, shuffleCount: 7 },
};

const ROUNDS_PER_LEVEL = 3;

function InvertedCup({ size = 110 }) {
  return (
    <Svg width={size} height={size * 1.3} viewBox="0 0 110 140">
      <Defs>
        <RadialGradient id="cupShine" cx="35%" cy="20%" r="50%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Path
        d="M 25 30 Q 25 15 55 15 Q 85 15 85 30 L 90 120 L 20 120 Z"
        fill="#EF5350"
        stroke="#B71C1C"
        strokeWidth="3"
      />
      <Path
        d="M 25 30 Q 25 15 55 15 Q 85 15 85 30 L 90 120 L 20 120 Z"
        fill="url(#cupShine)"
      />
      <Ellipse cx="55" cy="22" rx="28" ry="6" fill="#D32F2F" />
      <Ellipse cx="48" cy="20" rx="14" ry="3" fill="#FFCDD2" opacity="0.6" />
      <Ellipse cx="55" cy="120" rx="35" ry="7" fill="#B71C1C" />
      <Ellipse cx="55" cy="120" rx="32" ry="5" fill="#3E2723" />
      <Path d="M 32 40 L 28 115" stroke="#B71C1C" strokeWidth="1.5" opacity="0.5" />
      <Path d="M 78 40 L 82 115" stroke="#B71C1C" strokeWidth="1.5" opacity="0.5" />
    </Svg>
  );
}

function GoldBall({ size = 50 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Defs>
        <RadialGradient id="ballShine" cx="35%" cy="30%" r="50%">
          <Stop offset="0%" stopColor="#FFEB3B" />
          <Stop offset="100%" stopColor="#FFC93C" />
        </RadialGradient>
      </Defs>
      <Circle cx="25" cy="25" r="22" fill="url(#ballShine)" stroke="#F57F17" strokeWidth="2" />
      <Circle cx="18" cy="18" r="6" fill="#FFFFFF" opacity="0.7" />
    </Svg>
  );
}

export default function FindBallActivity() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } = useLocalSearchParams();

  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [phase, setPhase] = useState("show");
  const [gameState, setGameState] = useState("playing");
  const [finalStars, setFinalStars] = useState(0);

  const [ballSpot, setBallSpot] = useState(1);
  const [cupSpots, setCupSpots] = useState([0, 1, 2]);
  const [liftedCups, setLiftedCups] = useState([]);

  const cupTranslateX = useRef([
    new Animated.Value(SPOT_OFFSETS[0]),
    new Animated.Value(SPOT_OFFSETS[1]),
    new Animated.Value(SPOT_OFFSETS[2]),
  ]).current;
  const cupTranslateY = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const [noumiExpression, setNoumiExpression] = useState("idle");
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleColor, setBubbleColor] = useState(GARDEN.bubbleHappy);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const noumiBounce = useRef(new Animated.Value(0)).current;
  const noumiShake = useRef(new Animated.Value(0)).current;

  const startTime = useRef(Date.now());
  const correctGuesses = useRef(0);
  const wrongGuesses = useRef(0);
  const bubbleTimerRef = useRef(null);
  const cupSpotsRef = useRef([0, 1, 2]);
  const ballSpotRef = useRef(1);

  const config = LEVEL_CONFIG[level];

  useEffect(() => {
    startRound();
  }, [level, round]);

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

  const startRound = () => {
    cupTranslateX[0].setValue(SPOT_OFFSETS[0]);
    cupTranslateX[1].setValue(SPOT_OFFSETS[1]);
    cupTranslateX[2].setValue(SPOT_OFFSETS[2]);
    cupTranslateY.forEach((y) => y.setValue(0));

    cupSpotsRef.current = [0, 1, 2];
    setCupSpots([0, 1, 2]);
    setLiftedCups([]);

    const newBallSpot = Math.floor(Math.random() * 3);
    ballSpotRef.current = newBallSpot;
    setBallSpot(newBallSpot);

    setPhase("show");
    showSpeechBubble("شوفي وين الكرة!", GARDEN.bubbleHappy, "happy", 1800);

    const cupCoveringBall = newBallSpot;

    setTimeout(() => {
      setLiftedCups([cupCoveringBall]);
      Animated.timing(cupTranslateY[cupCoveringBall], {
        toValue: -90,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          Animated.timing(cupTranslateY[cupCoveringBall], {
            toValue: 0,
            duration: 500,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }).start(() => {
            setLiftedCups([]);
            setTimeout(() => startShuffle(), 400);
          });
        }, 1800);
      });
    }, 1200);
  };

  const startShuffle = () => {
    setPhase("shuffle");
    showSpeechBubble("ركّزي!", GARDEN.bubbleHappy, "idle", 1000);

    let stepCount = 0;

    const shuffleStep = () => {
      if (stepCount >= config.shuffleCount) {
        setCupSpots([...cupSpotsRef.current]);
        setPhase("guess");
        showSpeechBubble("أين الكرة؟", GARDEN.bubbleHappy, "happy", 2000);
        return;
      }
      stepCount++;

      const spotA = Math.random() > 0.5 ? 0 : 1;
      const spotB = spotA + 1;

      const cupAtA = cupSpotsRef.current.findIndex((s) => s === spotA);
      const cupAtB = cupSpotsRef.current.findIndex((s) => s === spotB);

      const newSpots = [...cupSpotsRef.current];
      newSpots[cupAtA] = spotB;
      newSpots[cupAtB] = spotA;
      cupSpotsRef.current = newSpots;

      Animated.parallel([
        Animated.timing(cupTranslateX[cupAtA], {
          toValue: SPOT_OFFSETS[spotB],
          duration: config.shuffleSpeed,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cupTranslateX[cupAtB], {
          toValue: SPOT_OFFSETS[spotA],
          duration: config.shuffleSpeed,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(shuffleStep, 100);
      });
    };

    setTimeout(shuffleStep, 500);
  };

  const handleCupTap = (cupId) => {
    if (phase !== "guess") return;
    setPhase("reveal");

    const thisCupSpot = cupSpotsRef.current[cupId];
    const isCorrect = thisCupSpot === ballSpotRef.current;

    setLiftedCups([cupId]);
    Animated.timing(cupTranslateY[cupId], {
      toValue: -90,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      if (isCorrect) {
        correctGuesses.current += 1;
        showSpeechBubble(pickRandom(HAPPY_MESSAGES), GARDEN.bubbleHappy, "happy", 1800);
      } else {
        wrongGuesses.current += 1;
        showSpeechBubble("الكرة كانت هنا!", GARDEN.bubbleSad, "sad", 1800);
        setTimeout(() => {
          const winningCup = cupSpotsRef.current.findIndex((s) => s === ballSpotRef.current);
          setLiftedCups([cupId, winningCup]);
          Animated.timing(cupTranslateY[winningCup], {
            toValue: -90,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }, 600);
      }

      setTimeout(() => {
        if (round < ROUNDS_PER_LEVEL) {
          setRound(round + 1);
        } else {
          if (level < 3) {
            showSpeechBubble(pickRandom(EXCITED_MESSAGES), GARDEN.bubbleExcited, "excited", 2200);
            setTimeout(() => {
              setLevel(level + 1);
              setRound(1);
            }, 1800);
          } else {
            finishGame();
          }
        }
      }, isCorrect ? 1500 : 2200);
    });
  };

  const finishGame = async () => {
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const correct = correctGuesses.current;
    const wrong = wrongGuesses.current;
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
        activityTitle: activityTitle || "ابحث عن الكرة",
        category: category || "focusCategoryID",
        level: 3,
        correctAnswers: correct, wrongAnswers: wrong, totalAttempts: total,
        durationSec: duration,
      });
    }
  };

  const handleReset = () => {
    setLevel(1);
    setRound(1);
    correctGuesses.current = 0;
    wrongGuesses.current = 0;
    setGameState("playing");
    setFinalStars(0);
  };

  const handleBackToPath = () => {
    if (childId) router.replace({ pathname: "/child/Home", params: { childId } });
    else router.back();
  };

  const totalRounds = 3 * ROUNDS_PER_LEVEL;
  const completed = (level - 1) * ROUNDS_PER_LEVEL + (round - 1);
  const overallProgress = completed / totalRounds;

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
          <Text style={sharedGameStyles.title}>ابحث عن الكرة</Text>
          <Text style={sharedGameStyles.subtitle}>المستوى {level} • جولة {round} من {ROUNDS_PER_LEVEL}</Text>
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

      <View style={styles.stage}>
        {(() => {
          const cupOnBall = cupSpotsRef.current.findIndex((s) => s === ballSpotRef.current);
          const ballVisible = liftedCups.includes(cupOnBall);
          if (!ballVisible) return null;

          return (
            <View
              style={[
                styles.ballPosition,
                { left: SPOT_X[ballSpotRef.current] - 25 },
              ]}
            >
              <GoldBall size={50} />
            </View>
          );
        })()}

        {[0, 1, 2].map((cupId) => (
          <Animated.View
            key={cupId}
            style={[
              styles.cupAnim,
              {
                left: CENTER_X - 55,
                transform: [
                  { translateX: cupTranslateX[cupId] },
                  { translateY: cupTranslateY[cupId] },
                ],
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => handleCupTap(cupId)}
              disabled={phase !== "guess"}
              activeOpacity={0.85}
            >
              <InvertedCup size={110} />
            </TouchableOpacity>
          </Animated.View>
        ))}
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
  stage: {
    flex: 1,
    position: "relative",
  },
  ballPosition: {
    position: "absolute",
    top: "50%",
    marginTop: 20,
    width: 50,
    height: 50,
    zIndex: 1,
  },
  cupAnim: {
    position: "absolute",
    top: "50%",
    marginTop: -100,
    width: 110,
    zIndex: 2,
  },
});

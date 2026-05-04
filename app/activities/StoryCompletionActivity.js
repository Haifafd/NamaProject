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

function StoryIllustration({ type, size = 80 }) {
  switch (type) {
    case "seed":
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Rect x="0" y="55" width="80" height="25" fill="#8D6E63" />
          <Ellipse cx="40" cy="55" rx="6" ry="4" fill="#5D4037" />
        </Svg>
      );
    case "sapling":
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Rect x="0" y="55" width="80" height="25" fill="#8D6E63" />
          <Path d="M 38 55 L 38 35 L 42 35 L 42 55 Z" fill="#6D4C41" />
          <Circle cx="40" cy="32" r="10" fill="#66BB6A" />
        </Svg>
      );
    case "tree":
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Rect x="0" y="55" width="80" height="25" fill="#8D6E63" />
          <Path d="M 36 55 L 36 30 L 44 30 L 44 55 Z" fill="#6D4C41" />
          <Circle cx="40" cy="22" r="18" fill="#4CAF50" />
          <Circle cx="40" cy="14" r="13" fill="#66BB6A" />
        </Svg>
      );
    case "egg":
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Ellipse cx="40" cy="42" rx="22" ry="28" fill="#FFF9C4" stroke="#F9A825" strokeWidth="3" />
        </Svg>
      );
    case "egg-cracking":
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Ellipse cx="40" cy="42" rx="22" ry="28" fill="#FFF9C4" stroke="#F9A825" strokeWidth="3" />
          <Path d="M 40 25 L 35 35 L 45 35 L 40 45" stroke="#3E2723" strokeWidth="2" fill="none" />
        </Svg>
      );
    case "chick":
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Circle cx="40" cy="50" r="20" fill="#FFC93C" />
          <Circle cx="40" cy="32" r="14" fill="#FFC93C" />
          <Circle cx="36" cy="30" r="2" fill="#3E2723" />
          <Circle cx="44" cy="30" r="2" fill="#3E2723" />
          <Path d="M 40 36 L 38 40 L 42 40 Z" fill="#FF7043" />
          <Ellipse cx="34" cy="60" rx="2" ry="4" fill="#FF7043" />
          <Ellipse cx="46" cy="60" rx="2" ry="4" fill="#FF7043" />
        </Svg>
      );
    case "apple-whole":
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Path d="M 40 18 Q 42 12 46 12" stroke="#388E3C" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Path d="M 42 18 Q 50 14 54 22 Q 50 22 42 22 Z" fill="#66BB6A" />
          <Circle cx="40" cy="48" r="26" fill="#E53935" />
          <Path d="M 40 22 Q 35 26 33 32" stroke="#B71C1C" strokeWidth="1.5" fill="none" />
          <Circle cx="30" cy="42" r="7" fill="#FFCDD2" opacity="0.5" />
        </Svg>
      );
    case "apple-bitten":
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Path d="M 40 18 Q 42 12 46 12" stroke="#388E3C" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Path d="M 42 18 Q 50 14 54 22 Q 50 22 42 22 Z" fill="#66BB6A" />
          <Path
            d="M 40 22 Q 14 22 14 48 Q 14 74 40 74 Q 66 74 66 48 Q 66 22 40 22 Z M 50 35 Q 55 38 55 45 Q 55 50 50 50 Q 45 50 45 45 Q 45 38 50 35 Z"
            fill="#E53935"
            fillRule="evenodd"
          />
          <Path d="M 50 35 Q 55 38 55 45 Q 55 50 50 50 Q 45 50 45 45 Q 45 38 50 35 Z" fill="#FFF8E1" />
          <Circle cx="48" cy="40" r="1.5" fill="#3E2723" />
          <Circle cx="51" cy="46" r="1.5" fill="#3E2723" />
        </Svg>
      );
    case "apple-core":
      return (
        <Svg width={size} height={size} viewBox="0 0 80 80">
          <Path d="M 40 12 Q 42 8 46 8" stroke="#388E3C" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Path d="M 42 12 Q 50 8 54 16 Q 50 16 42 16 Z" fill="#66BB6A" />
          <Path
            d="M 35 18 Q 30 25 30 38 Q 30 48 35 60 L 30 70 L 50 70 L 45 60 Q 50 48 50 38 Q 50 25 45 18 Q 42 24 40 24 Q 38 24 35 18 Z"
            fill="#FFF8E1"
            stroke="#8D6E63"
            strokeWidth="2"
          />
          <Ellipse cx="38" cy="38" rx="2" ry="3" fill="#3E2723" />
          <Ellipse cx="42" cy="42" rx="2" ry="3" fill="#3E2723" />
          <Ellipse cx="40" cy="48" rx="2" ry="3" fill="#3E2723" />
        </Svg>
      );
    default:
      return null;
  }
}

const STORIES_BY_LEVEL = {
  1: { name: "نمو الشجرة", correct: ["seed", "sapling", "tree"] },
  2: { name: "خروج الكتكوت", correct: ["egg", "egg-cracking", "chick"] },
  3: { name: "أكل التفاحة", correct: ["apple-whole", "apple-bitten", "apple-core"] },
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let attempt = 0; attempt < 5; attempt++) {
    a.sort(() => Math.random() - 0.5);
    if (a.join() !== arr.join()) return a;
  }
  return a;
};

export default function StoryCompletionActivity() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } = useLocalSearchParams();

  const [level, setLevel] = useState(1);
  const [shuffled, setShuffled] = useState([]);
  const [picks, setPicks] = useState([]);
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

  const story = STORIES_BY_LEVEL[level];

  useEffect(() => {
    setShuffled(shuffle(story.correct));
    setPicks([]);
    showSpeechBubble(`رتّبي قصة ${story.name}!`, GARDEN.bubbleHappy, "happy", 2500);
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

  const handlePick = (item) => {
    if (picks.includes(item)) return;
    const expectedNext = story.correct[picks.length];

    if (item === expectedNext) {
      correctAnswers.current += 1;
      const newPicks = [...picks, item];
      setPicks(newPicks);
      showSpeechBubble(pickRandom(HAPPY_MESSAGES), GARDEN.bubbleHappy, "happy", 1200);

      if (newPicks.length === story.correct.length) {
        setTimeout(() => {
          if (level < 3) {
            showSpeechBubble(pickRandom(EXCITED_MESSAGES), GARDEN.bubbleExcited, "excited", 2500);
            setTimeout(() => setLevel(level + 1), 1500);
          } else {
            finishGame();
          }
        }, 1000);
      }
    } else {
      wrongAnswers.current += 1;
      showSpeechBubble("ركّزي في الترتيب!", GARDEN.bubbleSad, "sad", 1500);
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
        activityTitle: activityTitle || "إكمال القصة",
        category: category || "thinkingCategoryID",
        level: 3,
        correctAnswers: correct, wrongAnswers: wrong, totalAttempts: total,
        durationSec: duration,
      });
    }
  };

  const handleReset = () => {
    setLevel(1);
    correctAnswers.current = 0;
    wrongAnswers.current = 0;
    setGameState("playing");
    setFinalStars(0);
  };

  const handleBackToPath = () => {
    if (childId) router.replace({ pathname: "/child/Home", params: { childId } });
    else router.back();
  };

  const overallProgress = ((level - 1) / 3) + (picks.length / story.correct.length / 3);

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
          <Text style={sharedGameStyles.title}>إكمال القصة</Text>
          <Text style={sharedGameStyles.subtitle}>{story.name} • {level} من 3</Text>
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
        <View style={styles.picksRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={[styles.pickSlot, picks[i] && styles.pickSlotFilled]}>
              <Text style={styles.pickNumber}>{i + 1}</Text>
              {picks[i] && <StoryIllustration type={picks[i]} size={50} />}
            </View>
          ))}
        </View>

        <Text style={styles.choicesLabel}>اختاري الصورة بالترتيب الصحيح:</Text>
        <View style={styles.choicesRow}>
          {shuffled.map((item, idx) => {
            const isPicked = picks.includes(item);
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.choiceCard, isPicked && styles.choiceCardPicked]}
                onPress={() => handlePick(item)}
                disabled={isPicked}
                activeOpacity={0.85}
              >
                <StoryIllustration type={item} size={70} />
              </TouchableOpacity>
            );
          })}
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
    paddingTop: 80,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  picksRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 14,
    marginBottom: 30,
  },
  pickSlot: {
    width: 90,
    height: 90,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#A5D6A7",
    borderStyle: "dashed",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  pickSlotFilled: {
    backgroundColor: "#C8E6C9",
    borderStyle: "solid",
    borderColor: "#66BB6A",
  },
  pickNumber: {
    position: "absolute",
    top: 4,
    right: 8,
    fontSize: 16,
    fontWeight: "900",
    color: "#388E3C",
  },
  choicesLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 16,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    textAlign: "center",
  },
  choicesRow: {
    flexDirection: "row-reverse",
    gap: 14,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  choiceCard: {
    width: 100,
    height: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
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
  choiceCardPicked: {
    opacity: 0.3,
  },
});

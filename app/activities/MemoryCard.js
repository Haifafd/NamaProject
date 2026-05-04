import { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
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
  SAD_MESSAGES,
  EXCITED_MESSAGES,
  pickRandom,
  sharedGameStyles,
} from "./_GameComponents";

const ICONS = [
  "tree",
  "flower",
  "butterfly",
  "apple",
  "sun",
  "cloud",
  "strawberry",
  "bee",
];

function CardIcon({ type, size = 60 }) {
  switch (type) {
    case "tree":
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
          <Path d="M 27 50 L 27 38 L 33 38 L 33 50 Z" fill="#6D4C41" />
          <Circle cx="30" cy="28" r="18" fill="#4CAF50" />
          <Circle cx="20" cy="32" r="11" fill="#43A047" />
          <Circle cx="40" cy="32" r="11" fill="#43A047" />
          <Circle cx="30" cy="20" r="13" fill="#66BB6A" />
        </Svg>
      );
    case "flower":
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
          <Path d="M 30 52 L 30 38" stroke="#388E3C" strokeWidth="3" strokeLinecap="round" />
          <Circle cx="30" cy="20" r="9" fill="#EC407A" />
          <Circle cx="20" cy="28" r="9" fill="#EC407A" />
          <Circle cx="40" cy="28" r="9" fill="#EC407A" />
          <Circle cx="30" cy="34" r="9" fill="#EC407A" />
          <Circle cx="30" cy="26" r="6" fill="#FFCA28" />
        </Svg>
      );
    case "butterfly":
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
          <Ellipse cx="30" cy="30" rx="2" ry="14" fill="#3E2723" />
          <Ellipse cx="18" cy="22" rx="11" ry="9" fill="#FF7043" transform="rotate(-25 18 22)" />
          <Ellipse cx="42" cy="22" rx="11" ry="9" fill="#FF7043" transform="rotate(25 42 22)" />
          <Ellipse cx="20" cy="40" rx="9" ry="7" fill="#FFAB91" transform="rotate(20 20 40)" />
          <Ellipse cx="40" cy="40" rx="9" ry="7" fill="#FFAB91" transform="rotate(-20 40 40)" />
          <Circle cx="16" cy="20" r="2" fill="#FFFFFF" />
          <Circle cx="44" cy="20" r="2" fill="#FFFFFF" />
        </Svg>
      );
    case "apple":
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
          <Path d="M 30 12 Q 32 8 36 8" stroke="#388E3C" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Path d="M 32 14 Q 38 12 42 18" stroke="#4CAF50" strokeWidth="2" fill="#66BB6A" />
          <Circle cx="30" cy="35" r="20" fill="#E53935" />
          <Circle cx="22" cy="28" r="6" fill="#FFCDD2" opacity="0.6" />
        </Svg>
      );
    case "sun":
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
          <Circle cx="30" cy="30" r="16" fill="#FFCA28" />
          <Path d="M 30 4 L 30 12" stroke="#FFCA28" strokeWidth="3" strokeLinecap="round" />
          <Path d="M 30 48 L 30 56" stroke="#FFCA28" strokeWidth="3" strokeLinecap="round" />
          <Path d="M 4 30 L 12 30" stroke="#FFCA28" strokeWidth="3" strokeLinecap="round" />
          <Path d="M 48 30 L 56 30" stroke="#FFCA28" strokeWidth="3" strokeLinecap="round" />
          <Path d="M 12 12 L 17 17" stroke="#FFCA28" strokeWidth="3" strokeLinecap="round" />
          <Path d="M 43 43 L 48 48" stroke="#FFCA28" strokeWidth="3" strokeLinecap="round" />
          <Path d="M 12 48 L 17 43" stroke="#FFCA28" strokeWidth="3" strokeLinecap="round" />
          <Path d="M 43 17 L 48 12" stroke="#FFCA28" strokeWidth="3" strokeLinecap="round" />
          <Circle cx="25" cy="28" r="2" fill="#5D4037" />
          <Circle cx="35" cy="28" r="2" fill="#5D4037" />
          <Path d="M 25 35 Q 30 38 35 35" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" fill="none" />
        </Svg>
      );
    case "cloud":
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
          <Ellipse cx="18" cy="36" rx="13" ry="10" fill="#90CAF9" />
          <Ellipse cx="35" cy="30" rx="16" ry="14" fill="#90CAF9" />
          <Ellipse cx="48" cy="36" rx="11" ry="9" fill="#90CAF9" />
          <Ellipse cx="32" cy="40" rx="22" ry="9" fill="#90CAF9" />
        </Svg>
      );
    case "strawberry":
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
          <Path d="M 22 18 L 28 14 L 32 14 L 38 18 L 30 18 Z" fill="#43A047" />
          <Path d="M 18 22 Q 30 14 42 22 L 38 50 Q 30 58 22 50 Z" fill="#E53935" />
          <Circle cx="26" cy="30" r="1.5" fill="#FFEB3B" />
          <Circle cx="34" cy="32" r="1.5" fill="#FFEB3B" />
          <Circle cx="28" cy="40" r="1.5" fill="#FFEB3B" />
          <Circle cx="36" cy="42" r="1.5" fill="#FFEB3B" />
          <Circle cx="30" cy="35" r="1.5" fill="#FFEB3B" />
        </Svg>
      );
    case "bee":
      return (
        <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
          <Ellipse cx="30" cy="32" rx="18" ry="14" fill="#FFC107" />
          <Path d="M 17 24 L 43 24" stroke="#3E2723" strokeWidth="4" />
          <Path d="M 14 36 L 46 36" stroke="#3E2723" strokeWidth="4" />
          <Ellipse cx="20" cy="22" rx="8" ry="6" fill="#FFFFFF" opacity="0.7" />
          <Ellipse cx="40" cy="22" rx="8" ry="6" fill="#FFFFFF" opacity="0.7" />
          <Circle cx="22" cy="30" r="2" fill="#3E2723" />
          <Circle cx="38" cy="30" r="2" fill="#3E2723" />
        </Svg>
      );
    default:
      return null;
  }
}

const LEVEL_PAIRS = { 1: 2, 2: 3, 3: 4 };

export default function MemoryCardGame() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } =
    useLocalSearchParams();

  const [level, setLevel] = useState(1);
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [isMemorizing, setIsMemorizing] = useState(true);
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

  const numColumns = level === 1 ? 2 : level === 2 ? 3 : 3;

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

  const initGame = useCallback(() => {
    const pairsCount = LEVEL_PAIRS[level];
    const selectedIcons = ICONS.slice(0, pairsCount);
    const cardSet = [...selectedIcons, ...selectedIcons]
      .sort(() => Math.random() - 0.5)
      .map((icon, idx) => ({ id: idx, icon, isFlipped: true }));
    setCards(cardSet);
    setFlippedCards([]);
    setMatchedCards([]);
    setIsMemorizing(true);
    startTime.current = Date.now();

    showSpeechBubble("احفظي البطاقات!", GARDEN.bubbleHappy, "happy", 2500);

    setTimeout(() => {
      setCards((prev) => prev.map((c) => ({ ...c, isFlipped: false })));
      setIsMemorizing(false);
      showSpeechBubble("ابحثي عن الأزواج!", GARDEN.bubbleHappy, "happy", 2000);
    }, 3500);
  }, [level]);

  useEffect(() => {
    if (level <= 3) initGame();
  }, [level, initGame]);

  const handleCardPress = (idx) => {
    if (
      isMemorizing ||
      cards[idx].isFlipped ||
      matchedCards.includes(idx) ||
      flippedCards.length === 2
    )
      return;

    const newCards = [...cards];
    newCards[idx].isFlipped = true;
    setCards(newCards);
    const newFlipped = [...flippedCards, idx];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (cards[first].icon === cards[second].icon) {
        correctMatches.current += 1;
        showSpeechBubble(pickRandom(HAPPY_MESSAGES), GARDEN.bubbleHappy, "happy", 1200);
        const newMatched = [...matchedCards, first, second];
        setMatchedCards(newMatched);
        setFlippedCards([]);

        if (newMatched.length === cards.length) {
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
          }, 600);
        }
      } else {
        wrongAttempts.current += 1;
        showSpeechBubble(pickRandom(SAD_MESSAGES), GARDEN.bubbleSad, "sad", 1500);
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards([...newCards]);
          setFlippedCards([]);
        }, 1000);
      }
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
        childId,
        activityId,
        activityTitle: activityTitle || "بطاقات الذاكرة",
        category: category || "memoryCategoryID",
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
    setGameState("playing");
    setFinalStars(0);
    correctMatches.current = 0;
    wrongAttempts.current = 0;
  };

  const handleBackToPath = () => {
    if (childId) {
      router.replace({ pathname: "/child/Home", params: { childId } });
    } else {
      router.back();
    }
  };

  const overallProgress =
    (level - 1) / 3 + (matchedCards.length / cards.length / 3 || 0);

  const renderCard = ({ item, index }) => {
    const isVisible = item.isFlipped || matchedCards.includes(index);
    const isMatched = matchedCards.includes(index);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          isMatched && styles.cardMatched,
          isVisible && styles.cardFlipped,
        ]}
        onPress={() => handleCardPress(index)}
        disabled={isVisible || isMemorizing}
        activeOpacity={0.85}
      >
        {isVisible ? (
          <CardIcon type={item.icon} size={60} />
        ) : (
          <View style={styles.cardBack}>
            <Svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <Circle cx="20" cy="14" r="3.5" fill="#FFFFFF" />
              <Circle cx="11" cy="20" r="3.5" fill="#FFFFFF" />
              <Circle cx="29" cy="20" r="3.5" fill="#FFFFFF" />
              <Circle cx="20" cy="26" r="3.5" fill="#FFFFFF" />
              <Circle cx="20" cy="20" r="3" fill="#FFD93D" />
            </Svg>
          </View>
        )}
      </TouchableOpacity>
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
          <Text style={sharedGameStyles.title}>بطاقات الذاكرة</Text>
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
        <MiniFlower size={24} color={GARDEN.flowerPink} />
      </View>
      <View style={sharedGameStyles.flowerTopRight}>
        <MiniFlower size={22} color={GARDEN.flowerYellow} />
      </View>
      <View style={sharedGameStyles.flowerBottomLeft}>
        <MiniFlower size={20} color={GARDEN.flowerPurple} />
      </View>
      <View style={sharedGameStyles.flowerBottomRight}>
        <MiniFlower size={20} color={GARDEN.flowerPink} />
      </View>

      <View style={styles.cardsArea}>
        <FlatList
          key={numColumns}
          data={cards}
          renderItem={renderCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          contentContainerStyle={styles.gridContent}
          scrollEnabled={false}
        />
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
  cardsArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  gridContent: {
    alignItems: "center",
  },
  card: {
    width: 90,
    height: 110,
    margin: 6,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
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
  cardFlipped: {
    backgroundColor: "#FFF8E1",
    borderColor: "#FFD54F",
  },
  cardMatched: {
    backgroundColor: "#C8E6C9",
    borderColor: "#66BB6A",
  },
  cardBack: {
    width: "100%",
    height: "100%",
    backgroundColor: "#EC407A",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
});

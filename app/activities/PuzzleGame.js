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
import { fetchChildGender, speak } from "../../Services/SpeechHelper";

function PictureSVG({ type, size = 200 }) {
  switch (type) {
    case "apple":
      return (
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Path d="M 100 30 Q 105 18 115 18" stroke="#388E3C" strokeWidth="6" strokeLinecap="round" fill="none" />
          <Path d="M 105 30 Q 130 22 140 40 Q 130 40 105 40 Z" fill="#66BB6A" />
          <Circle cx="100" cy="115" r="65" fill="#E53935" />
          <Path d="M 100 50 Q 90 60 85 75" stroke="#B71C1C" strokeWidth="3" fill="none" />
          <Circle cx="75" cy="100" r="18" fill="#FFCDD2" opacity="0.5" />
        </Svg>
      );
    case "tree":
      return (
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Rect x="85" y="135" width="30" height="55" fill="#6D4C41" />
          <Path d="M 88 135 L 88 190" stroke="#5D4037" strokeWidth="2" />
          <Circle cx="100" cy="80" r="55" fill="#4CAF50" />
          <Circle cx="65" cy="100" r="35" fill="#43A047" />
          <Circle cx="135" cy="100" r="35" fill="#43A047" />
          <Circle cx="100" cy="55" r="38" fill="#66BB6A" />
          <Circle cx="80" cy="80" r="9" fill="#E53935" />
          <Circle cx="120" cy="95" r="9" fill="#E53935" />
          <Circle cx="100" cy="115" r="9" fill="#E53935" />
        </Svg>
      );
    case "butterfly":
      return (
        <Svg width={size} height={size} viewBox="0 0 200 200">
          <Ellipse cx="100" cy="100" rx="6" ry="50" fill="#3E2723" />
          <Circle cx="100" cy="55" r="12" fill="#3E2723" />
          <Path d="M 96 50 Q 80 30 75 25" stroke="#3E2723" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Path d="M 104 50 Q 120 30 125 25" stroke="#3E2723" strokeWidth="3" strokeLinecap="round" fill="none" />
          <Ellipse cx="60" cy="80" rx="40" ry="32" fill="#FF7043" transform="rotate(-25 60 80)" />
          <Ellipse cx="140" cy="80" rx="40" ry="32" fill="#FF7043" transform="rotate(25 140 80)" />
          <Ellipse cx="65" cy="135" rx="32" ry="28" fill="#FFAB91" transform="rotate(20 65 135)" />
          <Ellipse cx="135" cy="135" rx="32" ry="28" fill="#FFAB91" transform="rotate(-20 135 135)" />
          <Circle cx="50" cy="75" r="8" fill="#FFFFFF" />
          <Circle cx="150" cy="75" r="8" fill="#FFFFFF" />
          <Circle cx="50" cy="75" r="4" fill="#FFC93C" />
          <Circle cx="150" cy="75" r="4" fill="#FFC93C" />
        </Svg>
      );
    default:
      return null;
  }
}

function PuzzlePiece({ pictureType, row, col, gridSize, pieceSize }) {
  const pictureFullSize = 200;
  const pieceViewSize = pictureFullSize / gridSize;
  const viewBoxX = col * pieceViewSize;
  const viewBoxY = row * pieceViewSize;

  return (
    <Svg
      width={pieceSize}
      height={pieceSize}
      viewBox={`${viewBoxX} ${viewBoxY} ${pieceViewSize} ${pieceViewSize}`}
    >
      <PictureSVG type={pictureType} size={pictureFullSize} />
    </Svg>
  );
}

const LEVEL_DIMS = {
  1: { rows: 2, cols: 2, picture: "apple" },
  2: { rows: 2, cols: 3, picture: "tree" },
  3: { rows: 3, cols: 3, picture: "butterfly" },
};

export default function PuzzleGame() {
  const router = useRouter();
  const { childId, activityId, activityTitle, category } = useLocalSearchParams();

  const [level, setLevel] = useState(1);
  const [childGender, setChildGender] = useState("female");
  const [placedPieces, setPlacedPieces] = useState({});
  const [pieceOrder, setPieceOrder] = useState([]);
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [gameState, setGameState] = useState("playing");
  const [finalStars, setFinalStars] = useState(0);

  const [noumiExpression, setNoumiExpression] = useState("idle");
  const [bubbleText, setBubbleText] = useState("");
  const [bubbleColor, setBubbleColor] = useState(GARDEN.bubbleHappy);
  const [bubbleVisible, setBubbleVisible] = useState(false);

  const noumiBounce = useRef(new Animated.Value(0)).current;
  const noumiShake = useRef(new Animated.Value(0)).current;
  const startTime = useRef(Date.now());
  const correctPlacements = useRef(0);
  const wrongPlacements = useRef(0);
  const bubbleTimerRef = useRef(null);

  const dims = LEVEL_DIMS[level];
  const totalPieces = dims.rows * dims.cols;

  const PUZZLE_AREA_SIZE = 220;
  const pieceSize = PUZZLE_AREA_SIZE / Math.max(dims.rows, dims.cols);

  useEffect(() => {
    initLevel();
  }, [level]);

  useEffect(() => {
    if (childId) fetchChildGender(childId).then(setChildGender);
  }, [childId]);

  const initLevel = () => {
    setPlacedPieces({});
    setSelectedPiece(null);
    const pieces = [];
    for (let r = 0; r < dims.rows; r++) {
      for (let c = 0; c < dims.cols; c++) {
        pieces.push({ row: r, col: c, id: `${r}-${c}` });
      }
    }
    pieces.sort(() => Math.random() - 0.5);
    setPieceOrder(pieces);
    startTime.current = Date.now();
    showSpeechBubble(speak("ركّبي الصورة!", childGender), GARDEN.bubbleHappy, "happy", 2200);
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

  const handleTrayPieceTap = (piece) => {
    if (placedPieces[piece.id]) return;
    setSelectedPiece(piece);
  };

  const handleSlotTap = (row, col) => {
    if (!selectedPiece) {
      showSpeechBubble(speak("اختاري قطعة أولاً!", childGender), GARDEN.bubbleHappy, "idle", 1200);
      return;
    }
    const slotId = `${row}-${col}`;
    if (placedPieces[slotId]) return;

    if (selectedPiece.row === row && selectedPiece.col === col) {
      correctPlacements.current += 1;
      const newPlaced = { ...placedPieces, [slotId]: selectedPiece };
      setPlacedPieces(newPlaced);
      setSelectedPiece(null);
      showSpeechBubble(speak(pickRandom(HAPPY_MESSAGES), childGender), GARDEN.bubbleHappy, "happy", 1000);

      if (Object.keys(newPlaced).length === totalPieces) {
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
      wrongPlacements.current += 1;
      showSpeechBubble(speak("ليس هنا، حاولي مكان آخر!", childGender), GARDEN.bubbleSad, "sad", 1500);
      setSelectedPiece(null);
    }
  };

  const finishGame = async () => {
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    const correct = correctPlacements.current;
    const wrong = wrongPlacements.current;
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
        activityTitle: activityTitle || "البازل",
        category: category || "thinkingCategoryID",
        level: 3,
        correctAnswers: correct, wrongAnswers: wrong, totalAttempts: total,
        durationSec: duration,
      });
    }
  };

  const handleReset = () => {
    setLevel(1);
    correctPlacements.current = 0;
    wrongPlacements.current = 0;
    setGameState("playing");
    setFinalStars(0);
  };

  const handleBackToPath = () => {
    if (childId) router.replace({ pathname: "/child/Home", params: { childId } });
    else router.back();
  };

  const overallProgress = ((level - 1) / 3) + (Object.keys(placedPieces).length / totalPieces / 3);

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
          <Text style={sharedGameStyles.title}>البازل</Text>
          <Text style={sharedGameStyles.subtitle}>المستوى {level} من 3 • {totalPieces} قطعة</Text>
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
        <View style={styles.refLabel}>
          <Text style={styles.refLabelText}>الشكل النهائي:</Text>
        </View>

        <View style={styles.puzzleBoard}>
          {Array.from({ length: dims.rows }).map((_, r) => (
            <View key={r} style={styles.puzzleRow}>
              {Array.from({ length: dims.cols }).map((_, c) => {
                const slotId = `${r}-${c}`;
                const placed = placedPieces[slotId];
                return (
                  <TouchableOpacity
                    key={slotId}
                    style={[
                      styles.slot,
                      { width: pieceSize, height: pieceSize },
                      placed && styles.slotFilled,
                    ]}
                    onPress={() => handleSlotTap(r, c)}
                    disabled={!!placed}
                    activeOpacity={0.85}
                  >
                    {placed ? (
                      <PuzzlePiece
                        pictureType={dims.picture}
                        row={r}
                        col={c}
                        gridSize={Math.max(dims.rows, dims.cols)}
                        pieceSize={pieceSize - 4}
                      />
                    ) : (
                      <View style={styles.emptySlot}>
                        <PuzzlePiece
                          pictureType={dims.picture}
                          row={r}
                          col={c}
                          gridSize={Math.max(dims.rows, dims.cols)}
                          pieceSize={pieceSize - 4}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        <Text style={styles.trayLabel}>القطع:</Text>
        <View style={styles.tray}>
          {pieceOrder.map((piece) => {
            const isPlaced = !!placedPieces[piece.id];
            const isSelected = selectedPiece && selectedPiece.id === piece.id;
            if (isPlaced) return <View key={piece.id} style={[styles.trayPiece, { opacity: 0.2 }]} />;

            return (
              <TouchableOpacity
                key={piece.id}
                style={[styles.trayPiece, isSelected && styles.trayPieceSelected]}
                onPress={() => handleTrayPieceTap(piece)}
                activeOpacity={0.85}
              >
                <PuzzlePiece
                  pictureType={dims.picture}
                  row={piece.row}
                  col={piece.col}
                  gridSize={Math.max(dims.rows, dims.cols)}
                  pieceSize={50}
                />
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
    paddingTop: 60,
    paddingHorizontal: 16,
  },
  refLabel: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 12,
  },
  refLabelText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  puzzleBoard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 8,
    marginBottom: 22,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  puzzleRow: {
    flexDirection: "row",
  },
  slot: {
    backgroundColor: "#F5F5F5",
    margin: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  slotFilled: {
    borderStyle: "solid",
    borderColor: "#66BB6A",
    backgroundColor: "#FFFFFF",
  },
  emptySlot: {
    opacity: 0.18,
  },
  trayLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tray: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 8,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    paddingVertical: 12,
    borderRadius: 18,
    maxWidth: 340,
    minHeight: 70,
  },
  trayPiece: {
    width: 56,
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 2,
    borderColor: "#FFFFFF",
    overflow: "hidden",
  },
  trayPieceSelected: {
    borderColor: "#FFC93C",
    transform: [{ scale: 1.12 }],
    shadowOpacity: 0.4,
  },
});

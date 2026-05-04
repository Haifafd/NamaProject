import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";

const { width } = Dimensions.get("window");

const GARDEN = {
  gardenMain: "#66BB6A",
  starGold: "#FFD700",
  starGray: "#E0E0E0",
  textDark: "#1B5E20",
  scarfPink: "#EC407A",
  rabbitPink: "#FFB6C1",
};

function ResultNoumi({ size = 130 }) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 130 145" fill="none">
      {/* Sparkle stars decoration */}
      <Path
        d="M 15 25 L 17 30 L 22 32 L 17 34 L 15 39 L 13 34 L 8 32 L 13 30 Z"
        fill="#FFD700"
      />
      <Path
        d="M 110 30 L 112 35 L 117 37 L 112 39 L 110 44 L 108 39 L 103 37 L 108 35 Z"
        fill="#FFD700"
      />
      <Path
        d="M 108 100 L 110 104 L 114 106 L 110 108 L 108 112 L 106 108 L 102 106 L 106 104 Z"
        fill="#FFCA28"
      />

      {/* Shadow */}
      <Ellipse cx="65" cy="138" rx="32" ry="4" fill="#000" opacity="0.15" />

      {/* Ears */}
      <Ellipse cx="50" cy="32" rx="8" ry="20" fill="#FFFFFF" />
      <Ellipse cx="50" cy="34" rx="4.5" ry="16" fill="#FFB6C1" opacity="0.7" />
      <Ellipse cx="80" cy="32" rx="8" ry="20" fill="#FFFFFF" />
      <Ellipse cx="80" cy="34" rx="4.5" ry="16" fill="#FFB6C1" opacity="0.7" />

      {/* Head */}
      <Circle cx="65" cy="65" r="32" fill="#FFFFFF" />

      {/* Cheeks */}
      <Circle cx="46" cy="74" r="6" fill="#FF6B9D" opacity="0.85" />
      <Circle cx="84" cy="74" r="6" fill="#FF6B9D" opacity="0.85" />

      {/* Closed-eye smile */}
      <Path
        d="M 50 62 Q 55 66 60 62"
        stroke="#2C2C2C"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 70 62 Q 75 66 80 62"
        stroke="#2C2C2C"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* Nose */}
      <Path
        d="M 65 71 Q 61 69 61 73 Q 61 76 65 79 Q 69 76 69 73 Q 69 69 65 71 Z"
        fill="#FF6B9D"
      />

      {/* Big open mouth (laughing) */}
      <Ellipse cx="65" cy="83" rx="9" ry="6" fill="#3E2723" />
      <Ellipse cx="65" cy="82" rx="5" ry="2" fill="#FF6B9D" />
      <Path
        d="M 62 86 Q 65 89 68 86 Q 68 83 65 83 Q 62 83 62 86 Z"
        fill="#FF8FA3"
      />

      {/* Body */}
      <Ellipse cx="65" cy="115" rx="28" ry="20" fill="#FFFFFF" />

      {/* Pink scarf */}
      <Path
        d="M 42 102 Q 65 110 88 102 Q 88 107 65 115 Q 42 107 42 102 Z"
        fill="#EC407A"
      />

      {/* Clapping hands raised up */}
      <Circle cx="38" cy="92" r="9" fill="#FFFFFF" />
      <Circle cx="38" cy="92" r="6" fill="#FFB6C1" opacity="0.5" />
      <Circle cx="92" cy="92" r="9" fill="#FFFFFF" />
      <Circle cx="92" cy="92" r="6" fill="#FFB6C1" opacity="0.5" />

      {/* Action lines (motion) */}
      <Path
        d="M 28 88 L 24 86"
        stroke="#3E2723"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M 28 92 L 23 92"
        stroke="#3E2723"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M 28 96 L 24 98"
        stroke="#3E2723"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M 102 88 L 106 86"
        stroke="#3E2723"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M 102 92 L 107 92"
        stroke="#3E2723"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M 102 96 L 106 98"
        stroke="#3E2723"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function StarBig({ filled, size = 50, delay = 0 }) {
  const scale = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M 12 2 L 15 9 L 22 10 L 17 15 L 18 22 L 12 19 L 6 22 L 7 15 L 2 10 L 9 9 Z"
          fill={filled ? GARDEN.starGold : GARDEN.starGray}
          stroke={filled ? "#F57C00" : "#BDBDBD"}
          strokeWidth="1.5"
        />
      </Svg>
    </Animated.View>
  );
}

function MiniFlower({ size = 22, color = "#EC407A" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" fill="none">
      <Circle cx="11" cy="5" r="4" fill={color} />
      <Circle cx="5" cy="11" r="4" fill={color} />
      <Circle cx="17" cy="11" r="4" fill={color} />
      <Circle cx="11" cy="17" r="4" fill={color} />
      <Circle cx="11" cy="11" r="3" fill="#FFD93D" />
    </Svg>
  );
}

const MESSAGES = {
  3: ["أحسنتِ يا بطلة!", "أنتِ رائعة!", "ممتاز جداً!", "نجمة لامعة!"],
  2: ["شغل ممتاز!", "أحسنتِ!", "تستاهلين تحية!"],
  1: ["محاولة طيبة!", "أحسنتِ على الجهد!", "كل يوم نتعلم!"],
};

const getRandomMessage = (stars) => {
  const list = MESSAGES[stars] || MESSAGES[1];
  return list[Math.floor(Math.random() * list.length)];
};

export default function ResultModal({
  visible,
  state,
  stars = 0,
  onReset,
  onBackToPath,
}) {
  const router = useRouter();
  const isWon = state === "won";
  const noumiBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && isWon) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(noumiBounce, {
            toValue: -10,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(noumiBounce, {
            toValue: 0,
            duration: 800,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [visible, isWon]);

  const handleBack = () => {
    if (onBackToPath) onBackToPath();
    else router.back();
  };

  const message = isWon
    ? getRandomMessage(stars || 1)
    : "حاولي مرة أخرى يا حلوة!";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.cornerFlower1}>
            <MiniFlower size={20} color="#EC407A" />
          </View>
          <View style={styles.cornerFlower2}>
            <MiniFlower size={18} color="#FFCA28" />
          </View>
          <Animated.View
            style={[
              styles.noumiWrap,
              isWon && { transform: [{ translateY: noumiBounce }] },
            ]}
          >
            <ResultNoumi size={130} />
          </Animated.View>
          {isWon && (
            <View style={styles.starsRow}>
              <StarBig filled={stars >= 1} size={50} delay={200} />
              <StarBig filled={stars >= 2} size={50} delay={500} />
              <StarBig filled={stars >= 3} size={50} delay={800} />
            </View>
          )}
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleBack}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>العودة للمسار</Text>
          </TouchableOpacity>
          {onReset && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onReset}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryBtnText}>العبيها مرة ثانية</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: 28,
    paddingTop: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 18,
    overflow: "hidden",
  },
  cornerFlower1: { position: "absolute", top: 16, right: 18 },
  cornerFlower2: { position: "absolute", top: 22, left: 22 },
  noumiWrap: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#A5D6A7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
    shadowColor: "#388E3C",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  starsRow: { flexDirection: "row-reverse", gap: 10, marginBottom: 14 },
  message: {
    fontSize: 24,
    fontWeight: "900",
    color: GARDEN.textDark,
    textAlign: "center",
    marginBottom: 24,
  },
  primaryBtn: {
    width: "100%",
    backgroundColor: GARDEN.gardenMain,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    shadowColor: "#388E3C",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryBtnText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  secondaryBtn: {
    width: "100%",
    paddingVertical: 14,
    marginTop: 10,
    borderRadius: 18,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  secondaryBtnText: { color: GARDEN.textDark, fontSize: 15, fontWeight: "700" },
});

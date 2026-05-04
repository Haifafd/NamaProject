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

function ResultNoumi({ size = 110 }) {
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
      <Circle cx="34" cy="58" r="5" fill={GARDEN.rabbitPink} opacity="0.7" />
      <Circle cx="66" cy="58" r="5" fill={GARDEN.rabbitPink} opacity="0.7" />
      <Path
        d="M 38 47 Q 41 50 44 47"
        stroke="#2C2C2C"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 56 47 Q 59 50 62 47"
        stroke="#2C2C2C"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 50 56 Q 47 54 47 58 Q 47 61 50 63 Q 53 61 53 58 Q 53 54 50 56 Z"
        fill="#FF6B9D"
      />
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
            <ResultNoumi size={120} />
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
  noumiWrap: { marginBottom: 12, marginTop: 8 },
  starsRow: { flexDirection: "row-reverse", gap: 10, marginBottom: 14 },
  message: {
    fontSize: 22,
    fontWeight: "900",
    color: GARDEN.textDark,
    textAlign: "center",
    marginBottom: 22,
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
  primaryBtnText: { color: "#FFFFFF", fontSize: 17, fontWeight: "900" },
  secondaryBtn: {
    width: "100%",
    paddingVertical: 14,
    marginTop: 10,
    borderRadius: 18,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  secondaryBtnText: { color: GARDEN.textDark, fontSize: 14, fontWeight: "700" },
});

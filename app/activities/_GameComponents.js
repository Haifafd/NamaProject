import { useEffect, useRef } from "react";
import { Animated, Platform, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";

export const GARDEN = {
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

// ─── Noumi Companion (4 expressions) ───
export function NoumiCompanion({ size = 110, expression = "idle" }) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 100 110" fill="none">
      <Ellipse cx="50" cy="105" rx="28" ry="4" fill="#000" opacity="0.15" />
      <Ellipse cx="38" cy="20" rx="7" ry="18" fill="#FFFFFF" />
      <Ellipse cx="38" cy="22" rx="4" ry="14" fill={GARDEN.rabbitPink} opacity="0.7" />
      <Ellipse cx="62" cy="20" rx="7" ry="18" fill="#FFFFFF" />
      <Ellipse cx="62" cy="22" rx="4" ry="14" fill={GARDEN.rabbitPink} opacity="0.7" />
      <Circle cx="50" cy="50" r="28" fill="#FFFFFF" />
      <Circle cx="34" cy="58" r="5" fill={GARDEN.rabbitPink} opacity={expression === "happy" || expression === "excited" ? 0.85 : 0.6} />
      <Circle cx="66" cy="58" r="5" fill={GARDEN.rabbitPink} opacity={expression === "happy" || expression === "excited" ? 0.85 : 0.6} />

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
          <Path d="M 36 48 Q 40 51 44 48" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" fill="none" />
          <Path d="M 56 48 Q 60 51 64 48" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" fill="none" />
        </>
      )}
      {expression === "sad" && (
        <>
          <Circle cx="40" cy="50" r="3" fill="#2C2C2C" />
          <Circle cx="60" cy="50" r="3" fill="#2C2C2C" />
          <Path d="M 38 54 Q 38 58 40 60 Q 42 58 42 54 Z" fill="#64B5F6" opacity="0.85" />
        </>
      )}
      {expression === "excited" && (
        <>
          <Circle cx="40" cy="48" r="4" fill="#2C2C2C" />
          <Circle cx="60" cy="48" r="4" fill="#2C2C2C" />
          <Circle cx="42" cy="46" r="1.5" fill="#FFFFFF" />
          <Circle cx="62" cy="46" r="1.5" fill="#FFFFFF" />
          <Path d="M 30 35 L 31 38 L 34 39 L 31 40 L 30 43 L 29 40 L 26 39 L 29 38 Z" fill={GARDEN.sunYellow} />
          <Path d="M 70 35 L 71 38 L 74 39 L 71 40 L 70 43 L 69 40 L 66 39 L 69 38 Z" fill={GARDEN.sunYellow} />
        </>
      )}

      <Path d="M 50 56 Q 47 54 47 58 Q 47 61 50 63 Q 53 61 53 58 Q 53 54 50 56 Z" fill="#FF6B9D" />

      {expression === "idle" && (
        <Path d="M 44 66 Q 50 70 56 66" stroke="#3E2723" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      )}
      {expression === "happy" && (
        <>
          <Path d="M 50 64 Q 44 70 40 67" stroke="#3E2723" strokeWidth="2" strokeLinecap="round" fill="none" />
          <Path d="M 50 64 Q 56 70 60 67" stroke="#3E2723" strokeWidth="2" strokeLinecap="round" fill="none" />
          <Path d="M 44 65 Q 50 72 56 65" stroke="#3E2723" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </>
      )}
      {expression === "sad" && (
        <Path d="M 44 70 Q 50 65 56 70" stroke="#3E2723" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      )}
      {expression === "excited" && (
        <>
          <Ellipse cx="50" cy="68" rx="6" ry="4" fill="#3E2723" />
          <Ellipse cx="50" cy="67" rx="3" ry="1.5" fill="#FF6B9D" />
        </>
      )}

      <Ellipse cx="50" cy="88" rx="22" ry="16" fill="#FFFFFF" />
      <Path d="M 32 78 Q 50 85 68 78 Q 68 82 50 88 Q 32 82 32 78 Z" fill={GARDEN.scarfPink} />
      <Circle cx="32" cy="82" r="6" fill="#FFFFFF" />
      <Circle cx="68" cy="82" r="6" fill="#FFFFFF" />
    </Svg>
  );
}

// ─── Speech Bubble (below Noumi) ───
export function SpeechBubble({ text, color = GARDEN.bubbleHappy, visible }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, tension: 100, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.5, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        bubbleStyles.bubble,
        { backgroundColor: color, opacity, transform: [{ scale }] },
      ]}
      pointerEvents="none"
    >
      <Text style={bubbleStyles.bubbleText}>{text}</Text>
      <View style={[bubbleStyles.bubbleTail, { borderBottomColor: color }]} />
    </Animated.View>
  );
}

// ─── Decorative SVGs ───
export function SunSVG({ size = 55 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <Circle cx="30" cy="30" r="20" fill={GARDEN.sunYellow} />
      <Path d="M 30 4 L 30 12" stroke={GARDEN.sunYellow} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M 30 48 L 30 56" stroke={GARDEN.sunYellow} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M 4 30 L 12 30" stroke={GARDEN.sunYellow} strokeWidth="2.5" strokeLinecap="round" />
      <Path d="M 48 30 L 56 30" stroke={GARDEN.sunYellow} strokeWidth="2.5" strokeLinecap="round" />
    </Svg>
  );
}

export function CloudSmall({ size = 50 }) {
  return (
    <Svg width={size} height={size * 0.55} viewBox="0 0 50 28" fill="none">
      <Ellipse cx="11" cy="16" rx="9" ry="7" fill="#FFFFFF" />
      <Ellipse cx="25" cy="13" rx="11" ry="9" fill="#FFFFFF" />
      <Ellipse cx="39" cy="16" rx="9" ry="7" fill="#FFFFFF" />
    </Svg>
  );
}

export function MiniFlower({ size = 22, color = GARDEN.flowerPink }) {
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

// ─── Helper: random message picker ───
export const HAPPY_MESSAGES = ["ممتاز!", "أحسنت!", "رائع!", "جميل!"];
export const SAD_MESSAGES = ["حاول مرة ثانية!", "تقدر أحسن!", "خذ وقتك!"];
export const EXCITED_MESSAGES = [
  "وصلت للمستوى التالي!",
  "ممتاز! أكمل!",
  "هيا للمستوى الجديد!",
];
export const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ─── Shared styles ───
const bubbleStyles = StyleSheet.create({
  bubble: {
    position: "absolute",
    top: 110,
    left: 80,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
    minWidth: 130,
    maxWidth: 220,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  bubbleText: {
    fontSize: 15,
    fontWeight: "800",
    color: GARDEN.textDark,
    textAlign: "center",
  },
  bubbleTail: {
    position: "absolute",
    top: -8,
    left: 18,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderTopWidth: 0,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
});

// ─── Shared game wrapper styles ───
export const sharedGameStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GARDEN.gardenMain },
  skyLayer: {
    position: "absolute", top: 0, left: 0, right: 0, height: "16%",
    backgroundColor: GARDEN.skyTop,
  },
  sun: { position: "absolute", top: Platform.OS === "ios" ? 50 : 25, right: 24 },
  cloud1: { position: "absolute", top: Platform.OS === "ios" ? 65 : 45, left: 30 },
  cloud2: { position: "absolute", top: Platform.OS === "ios" ? 95 : 75, left: 180 },
  gardenBg: {
    position: "absolute", top: "16%", left: 0, right: 0, bottom: 0,
    backgroundColor: GARDEN.gardenMain,
  },
  header: {
    flexDirection: "row-reverse", alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 55 : 30,
    paddingBottom: 12, zIndex: 10,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  titleBlock: { flex: 1, alignItems: "center" },
  title: {
    fontSize: 22, fontWeight: "900", color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14, color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "700", marginTop: 2,
  },
  progressRow: {
    flexDirection: "row-reverse", alignItems: "center",
    paddingHorizontal: 24, gap: 10, marginTop: 10, zIndex: 5,
  },
  progressBg: {
    flex: 1, height: 12, borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.4)", overflow: "hidden",
  },
  progressFill: {
    height: "100%", backgroundColor: GARDEN.sunYellow, borderRadius: 6,
  },
  progressPct: {
    fontSize: 15, fontWeight: "800", color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
    minWidth: 50,
  },
  flowerTopLeft: { position: "absolute", top: "22%", left: 16, zIndex: 2 },
  flowerTopRight: { position: "absolute", top: "22%", right: 16, zIndex: 2 },
  flowerBottomLeft: { position: "absolute", bottom: 80, left: 20, zIndex: 2 },
  flowerBottomRight: { position: "absolute", bottom: 80, right: 20, zIndex: 2 },
  noumiCorner: {
    position: "absolute",
    top: Platform.OS === "ios" ? 145 : 115,
    left: 12, zIndex: 20, alignItems: "flex-start",
  },
});

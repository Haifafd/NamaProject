import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient as SvgGradient,
  Path,
  Stop,
} from "react-native-svg";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─────────────────────────────────────────────
// 🌱 لوغو نماء — نبتة مخصصة بتفاصيل
// ─────────────────────────────────────────────
export function NamaaLogo({ size = 90 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <Defs>
        <SvgGradient id="leafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#A5D6A7" stopOpacity="1" />
          <Stop offset="100%" stopColor="#4CAF50" stopOpacity="1" />
        </SvgGradient>
        <SvgGradient id="leafGrad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#C5E1A5" stopOpacity="1" />
          <Stop offset="100%" stopColor="#7CB342" stopOpacity="1" />
        </SvgGradient>
      </Defs>

      <Ellipse cx="60" cy="100" rx="32" ry="6" fill="#5D4037" opacity="0.3" />
      <Path
        d="M 28 96 Q 60 88 92 96 Q 92 104 60 104 Q 28 104 28 96 Z"
        fill="#6D4C41"
      />
      <Circle cx="40" cy="98" r="1.5" fill="#3E2723" opacity="0.6" />
      <Circle cx="55" cy="100" r="1" fill="#3E2723" opacity="0.5" />
      <Circle cx="75" cy="98" r="1.5" fill="#3E2723" opacity="0.6" />

      <Path d="M 58 96 Q 59 75 60 55 Q 61 75 62 96 Z" fill="#5D4037" />

      <Path
        d="M 60 70 Q 35 60 28 38 Q 38 50 58 60 Z"
        fill="url(#leafGrad)"
      />
      <Path
        d="M 60 70 Q 35 60 28 38"
        stroke="#388E3C"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />

      <Path
        d="M 60 65 Q 85 55 92 32 Q 80 45 62 56 Z"
        fill="url(#leafGrad2)"
      />
      <Path
        d="M 60 65 Q 85 55 92 32"
        stroke="#558B2F"
        strokeWidth="1"
        opacity="0.4"
        fill="none"
      />

      <Path
        d="M 60 55 Q 54 42 58 30 Q 60 22 62 30 Q 66 42 60 55 Z"
        fill="url(#leafGrad)"
      />

      <Circle cx="50" cy="58" r="2.5" fill="#FFFFFF" opacity="0.85" />
      <Circle cx="50" cy="58" r="1" fill="#FFFFFF" />

      <Circle cx="78" cy="48" r="3" fill="#FFEB3B" />
      <Circle cx="78" cy="48" r="1.2" fill="#FF9800" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// 🌊 موجة SVG في الأسفل
// ─────────────────────────────────────────────
function BottomWave() {
  return (
    <View style={styles.waveWrap} pointerEvents="none">
      <Svg
        width={SCREEN_WIDTH}
        height="120"
        viewBox={`0 0 ${SCREEN_WIDTH} 120`}
        preserveAspectRatio="none"
      >
        <Path
          d={`M 0 60 Q ${SCREEN_WIDTH * 0.25} 20 ${SCREEN_WIDTH * 0.5} 50 T ${SCREEN_WIDTH} 40 L ${SCREEN_WIDTH} 120 L 0 120 Z`}
          fill="rgba(255, 255, 255, 0.12)"
        />
        <Path
          d={`M 0 80 Q ${SCREEN_WIDTH * 0.25} 50 ${SCREEN_WIDTH * 0.5} 75 T ${SCREEN_WIDTH} 65 L ${SCREEN_WIDTH} 120 L 0 120 Z`}
          fill="rgba(255, 255, 255, 0.18)"
        />
      </Svg>
    </View>
  );
}

// ─────────────────────────────────────────────
// 🍃 ورقة متحركة
// ─────────────────────────────────────────────
function FloatingLeaf({ size = 30, color = "rgba(255,255,255,0.35)" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Path
        d="M 15 4 Q 5 10 5 18 Q 5 26 15 28 Q 25 26 25 18 Q 25 10 15 4 Z"
        fill={color}
      />
      <Path
        d="M 15 6 Q 15 18 15 26"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="0.8"
        fill="none"
      />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// ✨ نقاط ضوء صغيرة
// ─────────────────────────────────────────────
function Sparkle({ size = 8 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10" fill="none">
      <Path
        d="M 5 0 L 6 4 L 10 5 L 6 6 L 5 10 L 4 6 L 0 5 L 4 4 Z"
        fill="rgba(255, 255, 255, 0.8)"
      />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// 🎨 الخلفية الكاملة المتحركة
// ─────────────────────────────────────────────
export function AuthBackground({ children }) {
  const leaf1 = useRef(new Animated.Value(0)).current;
  const leaf2 = useRef(new Animated.Value(0)).current;
  const leaf3 = useRef(new Animated.Value(0)).current;
  const sparkle1 = useRef(new Animated.Value(0)).current;
  const sparkle2 = useRef(new Animated.Value(0)).current;
  const circle1 = useRef(new Animated.Value(0)).current;
  const circle2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const float = (anim, dy, dur) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: dy,
            duration: dur,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: dur,
            useNativeDriver: true,
          }),
        ])
      ).start();

    const twinkle = (anim) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      ).start();

    float(leaf1, -20, 4000);
    float(leaf2, 25, 5000);
    float(leaf3, -15, 3500);
    float(circle1, 18, 6000);
    float(circle2, -22, 5500);
    twinkle(sparkle1);
    twinkle(sparkle2);
  }, []);

  return (
    <LinearGradient
      colors={["#9DDBFA", "#79ccf8", "#5BB5E8"]}
      locations={[0, 0.55, 1]}
      style={{ flex: 1 }}
    >
      <Animated.View
        style={[styles.bigCircle1, { transform: [{ translateY: circle1 }] }]}
      />
      <Animated.View
        style={[styles.bigCircle2, { transform: [{ translateY: circle2 }] }]}
      />
      <View style={styles.bigCircle3} />

      <Animated.View
        style={[styles.leaf1, { transform: [{ translateY: leaf1 }] }]}
      >
        <FloatingLeaf size={32} color="rgba(255,255,255,0.32)" />
      </Animated.View>
      <Animated.View
        style={[styles.leaf2, { transform: [{ translateY: leaf2 }] }]}
      >
        <FloatingLeaf size={26} color="rgba(255,255,255,0.4)" />
      </Animated.View>
      <Animated.View
        style={[styles.leaf3, { transform: [{ translateY: leaf3 }] }]}
      >
        <FloatingLeaf size={36} color="rgba(255,255,255,0.28)" />
      </Animated.View>

      <Animated.View style={[styles.sparkle1, { opacity: sparkle1 }]}>
        <Sparkle size={10} />
      </Animated.View>
      <Animated.View style={[styles.sparkle2, { opacity: sparkle2 }]}>
        <Sparkle size={8} />
      </Animated.View>

      {children}

      <BottomWave />
    </LinearGradient>
  );
}

// ─────────────────────────────────────────────
// 🏷️ بلوك اللوغو + اسم نماء (للاستخدام المشترك)
// ─────────────────────────────────────────────
export function NamaaBrand({ size = "lg", tagline }) {
  const isLg = size === "lg";
  return (
    <View style={styles.brandWrap}>
      <View style={[styles.logoCircle, isLg ? styles.logoLg : styles.logoMd]}>
        <View style={styles.logoInner}>
          <NamaaLogo size={isLg ? 70 : 50} />
        </View>
      </View>
      <Text style={[styles.brandName, isLg ? styles.brandNameLg : styles.brandNameMd]}>
        نماء
      </Text>
      <View style={styles.brandUnderline} />
      {tagline ? <Text style={styles.tagline}>{tagline}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bigCircle1: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  bigCircle2: {
    position: "absolute",
    bottom: 80,
    left: -50,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  bigCircle3: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.42,
    right: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  leaf1: { position: "absolute", top: SCREEN_HEIGHT * 0.12, left: 30 },
  leaf2: { position: "absolute", top: SCREEN_HEIGHT * 0.28, right: 40 },
  leaf3: { position: "absolute", bottom: SCREEN_HEIGHT * 0.22, right: 25 },

  sparkle1: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.18,
    right: SCREEN_WIDTH * 0.3,
  },
  sparkle2: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.5,
    left: SCREEN_WIDTH * 0.25,
  },

  waveWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },

  brandWrap: {
    alignItems: "center",
  },
  logoCircle: {
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    shadowColor: "#FFFFFF",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  logoLg: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 14,
  },
  logoMd: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 10,
  },
  logoInner: {
    backgroundColor: "rgba(255,255,255,0.95)",
    width: "82%",
    height: "82%",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.18)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
    letterSpacing: 4,
  },
  brandNameLg: {
    fontSize: 44,
    fontWeight: "900",
  },
  brandNameMd: {
    fontSize: 34,
    fontWeight: "900",
  },
  brandUnderline: {
    width: 50,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 2,
    marginTop: 8,
  },
  tagline: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.95)",
    marginTop: 12,
    textShadowColor: "rgba(0,0,0,0.12)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

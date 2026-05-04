import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import { startBackgroundMusic } from "../../Services/MusicService";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const GARDEN = {
  skyTop: "#87CEEB",
  skyMid: "#B3E5FC",
  grass: "#92cb6a",
  grassDark: "#558B2F",
  sunYellow: "#FFC93C",
  sunGlow: "#FFE082",
  cloudWhite: "#FFFFFF",
  treeGreen: "#8ab968",
  treeBrown: "#6D4C41",
  flowerPink: "#EC407A",
  flowerYellow: "#FFCA28",
  flowerPurple: "#AB47BC",
  butterflyOrange: "#FF7043",
  butterflyPurple: "#9C27B0",
  butterflyPink: "#EC407A",
  rabbitWhite: "#FFFFFF",
  rabbitPink: "#FFB6C1",
  scarfPink: "#EC407A",
  textDark: "#2E7D32",
  textShadow: "rgba(46, 125, 50, 0.25)",
};

// ─────────────────────────────────────────────
// Garden background SVGs
// ─────────────────────────────────────────────
function SunSVG({ size = 90 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <RadialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={GARDEN.sunGlow} stopOpacity="0.8" />
          <Stop offset="100%" stopColor={GARDEN.sunGlow} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="50" cy="50" r="48" fill="url(#sunGlow)" />
      <G opacity="0.85">
        <Path
          d="M 50 8 L 50 18"
          stroke={GARDEN.sunYellow}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M 50 82 L 50 92"
          stroke={GARDEN.sunYellow}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M 8 50 L 18 50"
          stroke={GARDEN.sunYellow}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M 82 50 L 92 50"
          stroke={GARDEN.sunYellow}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M 22 22 L 28 28"
          stroke={GARDEN.sunYellow}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M 72 72 L 78 78"
          stroke={GARDEN.sunYellow}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M 22 78 L 28 72"
          stroke={GARDEN.sunYellow}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <Path
          d="M 72 28 L 78 22"
          stroke={GARDEN.sunYellow}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </G>
      <Circle cx="50" cy="50" r="26" fill={GARDEN.sunYellow} />
      <Circle cx="42" cy="46" r="2.5" fill="#5D4037" />
      <Circle cx="58" cy="46" r="2.5" fill="#5D4037" />
      <Path
        d="M 42 56 Q 50 62 58 56"
        stroke="#5D4037"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <Circle cx="38" cy="54" r="3" fill="#FF6B9D" opacity="0.5" />
      <Circle cx="62" cy="54" r="3" fill="#FF6B9D" opacity="0.5" />
    </Svg>
  );
}

function CloudSVG({ size = 80 }) {
  return (
    <Svg width={size} height={size * 0.55} viewBox="0 0 100 55" fill="none">
      <Ellipse cx="22" cy="32" rx="18" ry="14" fill={GARDEN.cloudWhite} />
      <Ellipse cx="50" cy="26" rx="22" ry="18" fill={GARDEN.cloudWhite} />
      <Ellipse cx="78" cy="32" rx="18" ry="14" fill={GARDEN.cloudWhite} />
      <Ellipse cx="50" cy="38" rx="32" ry="13" fill={GARDEN.cloudWhite} />
    </Svg>
  );
}

function TreeSVG({ size = 130 }) {
  return (
    <Svg width={size} height={size * 1.2} viewBox="0 0 100 120" fill="none">
      <Path d="M 45 110 L 45 70 L 55 70 L 55 110 Z" fill={GARDEN.treeBrown} />
      <Path
        d="M 47 110 L 47 75 L 49 75 L 49 110 Z"
        fill="#8D6E63"
        opacity="0.6"
      />
      <Circle cx="50" cy="42" r="32" fill={GARDEN.treeGreen} />
      <Circle cx="32" cy="50" r="22" fill="#43A047" />
      <Circle cx="68" cy="50" r="22" fill="#43A047" />
      <Circle cx="50" cy="32" r="24" fill="#4CAF50" />
      <Circle cx="42" cy="42" r="14" fill="#66BB6A" opacity="0.8" />
      <Circle cx="58" cy="42" r="14" fill="#66BB6A" opacity="0.8" />
      <Circle cx="35" cy="40" r="4" fill="#E53935" />
      <Circle cx="34" cy="39" r="1.5" fill="#FFCDD2" />
      <Circle cx="65" cy="55" r="4" fill="#E53935" />
      <Circle cx="64" cy="54" r="1.5" fill="#FFCDD2" />
      <Circle cx="55" cy="30" r="4" fill="#E53935" />
      <Circle cx="54" cy="29" r="1.5" fill="#FFCDD2" />
    </Svg>
  );
}

function FlowerSVG({ size = 30, color = GARDEN.flowerPink }) {
  return (
    <Svg width={size} height={size * 1.4} viewBox="0 0 30 42" fill="none">
      <Path
        d="M 15 30 L 15 42"
        stroke={GARDEN.treeGreen}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Ellipse
        cx="20"
        cy="36"
        rx="4"
        ry="2"
        fill={GARDEN.treeGreen}
        transform="rotate(30 20 36)"
      />
      <Circle cx="15" cy="10" r="6" fill={color} />
      <Circle cx="9" cy="16" r="6" fill={color} />
      <Circle cx="21" cy="16" r="6" fill={color} />
      <Circle cx="15" cy="22" r="6" fill={color} />
      <Circle cx="15" cy="16" r="4" fill={GARDEN.flowerYellow} />
    </Svg>
  );
}

function ButterflySVG({ size = 36, color = GARDEN.butterflyOrange }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Ellipse cx="20" cy="20" rx="1.2" ry="9" fill="#3E2723" />
      <Ellipse
        cx="11"
        cy="14"
        rx="8"
        ry="6"
        fill={color}
        transform="rotate(-25 11 14)"
      />
      <Ellipse
        cx="29"
        cy="14"
        rx="8"
        ry="6"
        fill={color}
        transform="rotate(25 29 14)"
      />
      <Ellipse
        cx="12"
        cy="25"
        rx="6"
        ry="5"
        fill={color}
        opacity="0.75"
        transform="rotate(20 12 25)"
      />
      <Ellipse
        cx="28"
        cy="25"
        rx="6"
        ry="5"
        fill={color}
        opacity="0.75"
        transform="rotate(-20 28 25)"
      />
      <Circle cx="10" cy="13" r="1.5" fill="#FFFFFF" opacity="0.9" />
      <Circle cx="30" cy="13" r="1.5" fill="#FFFFFF" opacity="0.9" />
      <Path
        d="M 19 12 Q 17 6 14 6"
        stroke="#3E2723"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 21 12 Q 23 6 26 6"
        stroke="#3E2723"
        strokeWidth="0.8"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// Mascot
// ─────────────────────────────────────────────
function NoumiRabbit({ size = 200 }) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 200 220" fill="none">
      <Ellipse cx="100" cy="210" rx="55" ry="6" fill="#000" opacity="0.15" />
      <Ellipse cx="78" cy="40" rx="14" ry="36" fill={GARDEN.rabbitWhite} />
      <Ellipse
        cx="78"
        cy="42"
        rx="8"
        ry="28"
        fill={GARDEN.rabbitPink}
        opacity="0.7"
      />
      <Ellipse cx="122" cy="40" rx="14" ry="36" fill={GARDEN.rabbitWhite} />
      <Ellipse
        cx="122"
        cy="42"
        rx="8"
        ry="28"
        fill={GARDEN.rabbitPink}
        opacity="0.7"
      />
      <Circle cx="100" cy="100" r="55" fill={GARDEN.rabbitWhite} />
      <Circle cx="70" cy="115" r="10" fill={GARDEN.rabbitPink} opacity="0.7" />
      <Circle cx="130" cy="115" r="10" fill={GARDEN.rabbitPink} opacity="0.7" />
      <Circle cx="82" cy="95" r="8" fill="#2C2C2C" />
      <Circle cx="118" cy="95" r="8" fill="#2C2C2C" />
      <Circle cx="84" cy="92" r="3" fill="#FFFFFF" />
      <Circle cx="120" cy="92" r="3" fill="#FFFFFF" />
      <Circle cx="80" cy="98" r="1.5" fill="#FFFFFF" opacity="0.8" />
      <Circle cx="116" cy="98" r="1.5" fill="#FFFFFF" opacity="0.8" />
      <Path
        d="M 100 110 Q 95 108 95 113 Q 95 117 100 120 Q 105 117 105 113 Q 105 108 100 110 Z"
        fill="#FF6B9D"
      />
      <Path
        d="M 100 122 Q 95 128 90 125"
        stroke="#3E2723"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 100 122 Q 105 128 110 125"
        stroke="#3E2723"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 60 117 L 50 115"
        stroke="#999"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <Path
        d="M 60 120 L 48 120"
        stroke="#999"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <Path
        d="M 60 123 L 50 125"
        stroke="#999"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <Path
        d="M 140 117 L 150 115"
        stroke="#999"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <Path
        d="M 140 120 L 152 120"
        stroke="#999"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <Path
        d="M 140 123 L 150 125"
        stroke="#999"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <Ellipse cx="100" cy="175" rx="42" ry="32" fill={GARDEN.rabbitWhite} />
      <Path
        d="M 70 152 Q 100 162 130 152 Q 130 158 100 168 Q 70 158 70 152 Z"
        fill={GARDEN.scarfPink}
      />
      <Path d="M 75 158 L 65 175 L 78 168 Z" fill="#FF8FA3" />
      <Circle cx="68" cy="175" r="10" fill={GARDEN.rabbitWhite} />
      <Circle cx="132" cy="175" r="10" fill={GARDEN.rabbitWhite} />
      <Ellipse cx="82" cy="200" rx="10" ry="6" fill={GARDEN.rabbitWhite} />
      <Ellipse cx="118" cy="200" rx="10" ry="6" fill={GARDEN.rabbitWhite} />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function ChildModeSplash() {
  const router = useRouter();

  // Animation values
  const sunRotate = useRef(new Animated.Value(0)).current;
  const sunPulse = useRef(new Animated.Value(1)).current;
  const cloud1X = useRef(new Animated.Value(0)).current;
  const cloud2X = useRef(new Animated.Value(0)).current;
  const treeLeftSway = useRef(new Animated.Value(0)).current;
  const treeRightSway = useRef(new Animated.Value(0)).current;

  const rabbitTranslateY = useRef(
    new Animated.Value(SCREEN_HEIGHT * 0.4),
  ).current;
  const rabbitOpacity = useRef(new Animated.Value(0)).current;
  const rabbitScale = useRef(new Animated.Value(0.7)).current;
  const rabbitJump = useRef(new Animated.Value(0)).current;

  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleSlide = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  const butterfly1 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const butterfly2 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const butterfly3 = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const flowerBob1 = useRef(new Animated.Value(0)).current;
  const flowerBob2 = useRef(new Animated.Value(0)).current;
  const flowerBob3 = useRef(new Animated.Value(0)).current;

  const dot1Anim = useRef(new Animated.Value(0)).current;
  const dot2Anim = useRef(new Animated.Value(0)).current;
  const dot3Anim = useRef(new Animated.Value(0)).current;

  // Animation orchestration
  useEffect(() => {
    // Start background music when entering child mode (idempotent — safe to call)
    startBackgroundMusic();

    Animated.loop(
      Animated.timing(sunRotate, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(sunPulse, {
          toValue: 1.08,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sunPulse, {
          toValue: 1,
          duration: 2500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const driftCloud = (anim, distance, duration) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: distance,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };
    driftCloud(cloud1X, 25, 8000);
    driftCloud(cloud2X, -30, 10000);

    const swayTree = (anim, angle, duration) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: angle,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: -angle,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };
    swayTree(treeLeftSway, 0.02, 4000);
    swayTree(treeRightSway, -0.02, 4500);

    const bobFlower = (anim, duration) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -3,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };
    bobFlower(flowerBob1, 1800);
    bobFlower(flowerBob2, 2200);
    bobFlower(flowerBob3, 2000);

    const floatButterfly = (anim, dx, dy, duration) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: { x: dx, y: dy },
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: { x: 0, y: 0 },
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };
    floatButterfly(butterfly1, 35, -30, 4000);
    floatButterfly(butterfly2, -40, 25, 4500);
    floatButterfly(butterfly3, 30, 30, 3800);

    // Rabbit appears slowly
    Animated.parallel([
      Animated.timing(rabbitOpacity, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(rabbitTranslateY, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(rabbitScale, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(titleSlide, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, 1500);

    setTimeout(() => {
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }).start();
    }, 2500);

    // Rabbit slow rest-jump rest-jump pattern
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rabbitJump, {
            toValue: -15,
            duration: 600,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(rabbitJump, {
            toValue: 0,
            duration: 500,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.delay(1400),
        ]),
      ).start();
    }, 1300);

    const pulseDot = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };
    pulseDot(dot1Anim, 0);
    pulseDot(dot2Anim, 200);
    pulseDot(dot3Anim, 400);

    const timer = setTimeout(() => {
      router.replace("/child/Picker");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const sunRotation = sunRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const treeLeftRotation = treeLeftSway.interpolate({
    inputRange: [-0.02, 0.02],
    outputRange: ["-2deg", "2deg"],
  });

  const treeRightRotation = treeRightSway.interpolate({
    inputRange: [-0.02, 0.02],
    outputRange: ["-2deg", "2deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={GARDEN.skyTop} />

      <View style={styles.skyTop} />
      <View style={styles.skyBottom} />

      <Animated.View
        style={[
          styles.sunWrap,
          { transform: [{ rotate: sunRotation }, { scale: sunPulse }] },
        ]}
      >
        <SunSVG size={100} />
      </Animated.View>

      <Animated.View
        style={[styles.cloud1, { transform: [{ translateX: cloud1X }] }]}
      >
        <CloudSVG size={110} />
      </Animated.View>
      <Animated.View
        style={[styles.cloud2, { transform: [{ translateX: cloud2X }] }]}
      >
        <CloudSVG size={80} />
      </Animated.View>
      <Animated.View
        style={[styles.cloud3, { transform: [{ translateX: cloud1X }] }]}
      >
        <CloudSVG size={70} />
      </Animated.View>

      <Animated.View
        style={[
          styles.butterfly1,
          { transform: butterfly1.getTranslateTransform() },
        ]}
      >
        <ButterflySVG size={38} color={GARDEN.butterflyOrange} />
      </Animated.View>
      <Animated.View
        style={[
          styles.butterfly2,
          { transform: butterfly2.getTranslateTransform() },
        ]}
      >
        <ButterflySVG size={32} color={GARDEN.butterflyPurple} />
      </Animated.View>
      <Animated.View
        style={[
          styles.butterfly3,
          { transform: butterfly3.getTranslateTransform() },
        ]}
      >
        <ButterflySVG size={28} color={GARDEN.butterflyPink} />
      </Animated.View>

      <Animated.View
        style={[
          styles.titleSection,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleSlide }],
          },
        ]}
      >
        <Text style={styles.greeting}>أهلاً بك في عالم نومي</Text>
        <Animated.Text style={[styles.tagline, { opacity: subtitleOpacity }]}>
          هيا نستكشف البستان
        </Animated.Text>
      </Animated.View>

      <Animated.View
        style={[styles.treeLeft, { transform: [{ rotate: treeLeftRotation }] }]}
      >
        <TreeSVG size={140} />
      </Animated.View>
      <Animated.View
        style={[
          styles.treeRight,
          { transform: [{ rotate: treeRightRotation }] },
        ]}
      >
        <TreeSVG size={150} />
      </Animated.View>

      <Animated.View
        style={[
          styles.mascotWrap,
          {
            opacity: rabbitOpacity,
            transform: [
              { translateY: Animated.add(rabbitTranslateY, rabbitJump) },
              { scale: rabbitScale },
            ],
          },
        ]}
      >
        <NoumiRabbit size={200} />
      </Animated.View>

      <View style={styles.grassLayer} />
      <View style={styles.grassLayerDark} />

      <Animated.View
        style={[styles.flower1, { transform: [{ translateY: flowerBob1 }] }]}
      >
        <FlowerSVG size={32} color={GARDEN.flowerPink} />
      </Animated.View>
      <Animated.View
        style={[styles.flower2, { transform: [{ translateY: flowerBob2 }] }]}
      >
        <FlowerSVG size={28} color={GARDEN.flowerYellow} />
      </Animated.View>
      <Animated.View
        style={[styles.flower3, { transform: [{ translateY: flowerBob3 }] }]}
      >
        <FlowerSVG size={30} color={GARDEN.flowerPurple} />
      </Animated.View>
      <Animated.View
        style={[styles.flower4, { transform: [{ translateY: flowerBob1 }] }]}
      >
        <FlowerSVG size={26} color={GARDEN.flowerPink} />
      </Animated.View>
      <Animated.View
        style={[styles.flower5, { transform: [{ translateY: flowerBob3 }] }]}
      >
        <FlowerSVG size={24} color={GARDEN.flowerYellow} />
      </Animated.View>

      <Animated.View
        style={[styles.bottomSection, { opacity: subtitleOpacity }]}
      >
        <View style={styles.loadingDots}>
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: GARDEN.flowerPink, opacity: dot1Anim },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: GARDEN.flowerYellow, opacity: dot2Anim },
            ]}
          />
          <Animated.View
            style={[
              styles.dot,
              { backgroundColor: GARDEN.flowerPurple, opacity: dot3Anim },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GARDEN.skyTop,
    overflow: "hidden",
  },

  skyTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.65,
    backgroundColor: GARDEN.skyTop,
  },
  skyBottom: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.5,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.2,
    backgroundColor: GARDEN.skyMid,
    opacity: 0.7,
  },

  sunWrap: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: 30,
    zIndex: 2,
  },

  cloud1: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.18,
    left: 30,
    zIndex: 1,
  },
  cloud2: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.12,
    right: SCREEN_WIDTH * 0.4,
    zIndex: 1,
  },
  cloud3: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.28,
    left: SCREEN_WIDTH * 0.35,
    zIndex: 1,
  },

  titleSection: {
    position: "absolute",
    top: Platform.OS === "ios" ? 180 : 150,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "900",
    color: GARDEN.textDark,
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
    marginBottom: 6,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0288D1",
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    textAlign: "center",
  },

  treeLeft: {
    position: "absolute",
    bottom: 80,
    left: -20,
    zIndex: 2,
  },
  treeRight: {
    position: "absolute",
    bottom: 75,
    right: -25,
    zIndex: 2,
  },

  mascotWrap: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.42,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 4,
  },

  butterfly1: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.32,
    left: SCREEN_WIDTH * 0.18,
    zIndex: 3,
  },
  butterfly2: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.42,
    right: SCREEN_WIDTH * 0.15,
    zIndex: 3,
  },
  butterfly3: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.55,
    right: SCREEN_WIDTH * 0.45,
    zIndex: 3,
  },

  grassLayer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 110,
    backgroundColor: GARDEN.grass,
    zIndex: 3,
  },
  grassLayerDark: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: GARDEN.grassDark,
    opacity: 0.6,
    zIndex: 3,
  },

  flower1: { position: "absolute", bottom: 60, left: 30, zIndex: 4 },
  flower2: {
    position: "absolute",
    bottom: 55,
    left: SCREEN_WIDTH * 0.25,
    zIndex: 4,
  },
  flower3: {
    position: "absolute",
    bottom: 65,
    right: SCREEN_WIDTH * 0.3,
    zIndex: 4,
  },
  flower4: { position: "absolute", bottom: 50, right: 50, zIndex: 4 },
  flower5: {
    position: "absolute",
    bottom: 70,
    left: SCREEN_WIDTH * 0.5,
    zIndex: 4,
  },

  bottomSection: {
    position: "absolute",
    bottom: 18,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 5,
  },
  loadingDots: {
    flexDirection: "row",
    gap: 10,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});

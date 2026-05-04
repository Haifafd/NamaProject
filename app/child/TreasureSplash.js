import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Circle, Defs, Path, RadialGradient, Stop } from "react-native-svg";
import {
  GARDEN,
  NoumiCompanion,
  SunSVG,
  CloudSmall,
  MiniFlower,
} from "../activities/_GameComponents";

const { width, height } = Dimensions.get("window");

function CelebrationTreasure({ size = 200 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Defs>
        <RadialGradient id="goldGlow" cx="50%" cy="50%" r="60%">
          <Stop offset="0%" stopColor="#FFE082" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </RadialGradient>
      </Defs>

      <Circle cx="100" cy="105" r="95" fill="url(#goldGlow)" />
      <Circle cx="100" cy="105" r="75" fill="#FFD700" opacity="0.3" />

      <Path d="M 36 100 L 36 160 L 164 160 L 164 100 Z" fill="#8D6E63" />
      <Path d="M 36 100 L 36 160 L 52 160 L 52 100 Z" fill="#5D4037" />
      <Path d="M 148 100 L 148 160 L 164 160 L 164 100 Z" fill="#5D4037" />

      <Path d="M 28 60 Q 100 30 172 60 L 172 100 L 28 100 Z" fill="#A1887F" />
      <Path d="M 28 60 Q 100 30 172 60" stroke="#5D4037" strokeWidth="3" fill="none" />

      <Path d="M 28 100 L 172 100" stroke="#FFD700" strokeWidth="5" />
      <Path d="M 28 130 L 172 130" stroke="#FFD700" strokeWidth="3" opacity="0.7" />

      <Circle cx="80" cy="90" r="12" fill="#FFD700" stroke="#F57F17" strokeWidth="2" />
      <Circle cx="100" cy="85" r="14" fill="#FFD700" stroke="#F57F17" strokeWidth="2" />
      <Circle cx="120" cy="90" r="12" fill="#FFD700" stroke="#F57F17" strokeWidth="2" />
      <Circle cx="90" cy="78" r="9" fill="#E91E63" stroke="#AD1457" strokeWidth="2" />
      <Circle cx="110" cy="78" r="9" fill="#42A5F5" stroke="#1976D2" strokeWidth="2" />

      <Path d="M 60 50 L 62 58 L 70 60 L 62 62 L 60 70 L 58 62 L 50 60 L 58 58 Z" fill="#FFFFFF" />
      <Path d="M 140 45 L 142 53 L 150 55 L 142 57 L 140 65 L 138 57 L 130 55 L 138 53 Z" fill="#FFFFFF" />
      <Path d="M 30 90 L 32 95 L 37 96 L 32 97 L 30 102 L 28 97 L 23 96 L 28 95 Z" fill="#FFFFFF" />
      <Path d="M 170 90 L 172 95 L 177 96 L 172 97 L 170 102 L 168 97 L 163 96 L 168 95 Z" fill="#FFFFFF" />
    </Svg>
  );
}

function ConfettiParticle({ delay, startX, color, size = 8 }) {
  const translateY = useRef(new Animated.Value(-50)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(-50);
      translateX.setValue(0);
      rotate.setValue(0);
      opacity.setValue(1);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: height + 50,
          duration: 4000 + Math.random() * 2000,
          delay,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: (Math.random() - 0.5) * 100,
          duration: 4000,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.timing(rotate, {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ),
        Animated.sequence([
          Animated.delay(delay + 3000),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setTimeout(animate, Math.random() * 2000);
      });
    };

    animate();
  }, []);

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 0,
        left: startX,
        width: size,
        height: size * 1.5,
        backgroundColor: color,
        borderRadius: 2,
        opacity,
        transform: [
          { translateY },
          { translateX },
          { rotate: rotation },
        ],
      }}
    />
  );
}

export default function TreasureSplash() {
  const router = useRouter();
  const { childId } = useLocalSearchParams();

  const treasureScale = useRef(new Animated.Value(0)).current;
  const treasureBounce = useRef(new Animated.Value(0)).current;
  const titleScale = useRef(new Animated.Value(0)).current;
  const noumiBounce = useRef(new Animated.Value(0)).current;
  const noumiRotate = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(treasureScale, {
        toValue: 1,
        friction: 4,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.spring(titleScale, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(treasureBounce, {
          toValue: -12,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(treasureBounce, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(noumiBounce, {
          toValue: -15,
          duration: 500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(noumiBounce, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(noumiRotate, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(noumiRotate, {
          toValue: -1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(noumiRotate, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleBack = () => {
    if (childId) {
      router.replace({ pathname: "/child/Home", params: { childId } });
    } else {
      router.replace("/parent/homepageP");
    }
  };

  const confettiColors = [
    "#FFD700", "#EC407A", "#42A5F5", "#66BB6A",
    "#FFA726", "#AB47BC", "#FF7043", "#26C6DA",
  ];

  const confettiParticles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2000,
    startX: Math.random() * width,
    color: confettiColors[i % confettiColors.length],
    size: 6 + Math.random() * 6,
  }));

  const noumiRotation = noumiRotate.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ["-15deg", "0deg", "15deg"],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={GARDEN.skyTop} />

      <View style={styles.skyLayer}>
        <View style={styles.sun}><SunSVG size={70} /></View>
        <View style={styles.cloud1}><CloudSmall size={60} /></View>
        <View style={styles.cloud2}><CloudSmall size={50} /></View>
        <View style={styles.cloud3}><CloudSmall size={45} /></View>
      </View>

      <View style={styles.gardenBg} />

      {confettiParticles.map((p) => (
        <ConfettiParticle key={p.id} {...p} />
      ))}

      <View style={styles.flowerTL}><MiniFlower size={28} color="#EC407A" /></View>
      <View style={styles.flowerTR}><MiniFlower size={26} color="#FFCA28" /></View>
      <View style={styles.flowerBL}><MiniFlower size={28} color="#AB47BC" /></View>
      <View style={styles.flowerBR}><MiniFlower size={26} color="#EC407A" /></View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.treasureWrap,
            {
              transform: [
                { scale: treasureScale },
                { translateY: treasureBounce },
              ],
            },
          ]}
        >
          <CelebrationTreasure size={220} />
        </Animated.View>

        <Animated.View
          style={[
            styles.titleWrap,
            { transform: [{ scale: titleScale }] },
          ]}
        >
          <Text style={styles.title}>أحسنتي يا بطلة!</Text>
          <Text style={styles.subtitle}>أنجزتي كل المغامرة!</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.noumiWrap,
            {
              transform: [
                { translateY: noumiBounce },
                { rotate: noumiRotation },
              ],
            },
          ]}
        >
          <View style={styles.noumiCircle}>
            <NoumiCompanion size={130} expression="excited" />
          </View>
        </Animated.View>

        <View style={styles.starsRow}>
          <Text style={styles.starsEmoji}>⭐</Text>
          <Text style={styles.starsEmoji}>⭐</Text>
          <Text style={styles.starsEmoji}>⭐</Text>
          <Text style={styles.starsEmoji}>⭐</Text>
          <Text style={styles.starsEmoji}>⭐</Text>
        </View>

        <Animated.View style={{ opacity: buttonOpacity, width: "100%" }}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.85}
          >
            <Text style={styles.backButtonText}>العودة للمسار</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: GARDEN.gardenMain,
  },
  skyLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "20%",
    backgroundColor: GARDEN.skyTop,
  },
  sun: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 25,
    right: 24,
  },
  cloud1: {
    position: "absolute",
    top: Platform.OS === "ios" ? 65 : 45,
    left: 30,
  },
  cloud2: {
    position: "absolute",
    top: Platform.OS === "ios" ? 90 : 70,
    left: width * 0.4,
  },
  cloud3: {
    position: "absolute",
    top: Platform.OS === "ios" ? 110 : 90,
    right: 100,
  },
  gardenBg: {
    position: "absolute",
    top: "20%",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: GARDEN.gardenMain,
  },
  flowerTL: { position: "absolute", top: "25%", left: 16, zIndex: 2 },
  flowerTR: { position: "absolute", top: "30%", right: 20, zIndex: 2 },
  flowerBL: { position: "absolute", bottom: 80, left: 24, zIndex: 2 },
  flowerBR: { position: "absolute", bottom: 100, right: 28, zIndex: 2 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  treasureWrap: {
    marginTop: 30,
    marginBottom: 16,
  },
  titleWrap: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#F57F17",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "800",
    color: GARDEN.textDark,
    marginTop: 6,
    textAlign: "center",
  },
  noumiWrap: {
    marginVertical: 10,
  },
  noumiCircle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "#A5D6A7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#FFFFFF",
    shadowColor: "#388E3C",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  starsRow: {
    flexDirection: "row-reverse",
    gap: 6,
    marginVertical: 16,
  },
  starsEmoji: {
    fontSize: 32,
  },
  backButton: {
    backgroundColor: GARDEN.gardenMain,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
    alignSelf: "center",
    shadowColor: "#1B5E20",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
});

import { Ionicons } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient as SvgGradient,
  Path,
  Stop,
} from "react-native-svg";
import { auth, db } from "../FirebaseConfig";
import { AuthBackground } from "../components/AuthBackground";

// ─────────────────────────────────────────────
// 🌱 مراحل نمو النبتة (SVG لكل مرحلة)
// ─────────────────────────────────────────────

function SeedSVG({ size = 220 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 240" fill="none">
      <Path
        d="M 30 200 Q 100 175 170 200 Q 170 215 100 215 Q 30 215 30 200 Z"
        fill="#8B5E3C"
      />
      <Path
        d="M 30 200 Q 100 175 170 200 Q 170 215 100 215 Q 30 215 30 200 Z"
        fill="#6B4226"
        opacity="0.4"
      />
      <Circle cx="60" cy="198" r="2" fill="#5D3A1A" opacity="0.5" />
      <Circle cx="80" cy="202" r="1.5" fill="#5D3A1A" opacity="0.6" />
      <Circle cx="120" cy="200" r="2" fill="#5D3A1A" opacity="0.5" />
      <Circle cx="140" cy="203" r="1.5" fill="#5D3A1A" opacity="0.6" />
      <Ellipse cx="100" cy="195" rx="14" ry="10" fill="#5D3A1A" />
      <Ellipse cx="96" cy="193" rx="12" ry="8" fill="#7A4A24" />
      <Ellipse cx="94" cy="192" rx="6" ry="3" fill="#A0612C" opacity="0.6" />
    </Svg>
  );
}

function SproutSVG({ size = 220 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 240" fill="none">
      <Defs>
        <SvgGradient id="leafG1" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#A5D6A7" />
          <Stop offset="100%" stopColor="#66BB6A" />
        </SvgGradient>
      </Defs>
      <Path
        d="M 30 200 Q 100 175 170 200 Q 170 215 100 215 Q 30 215 30 200 Z"
        fill="#8B5E3C"
      />
      <Path
        d="M 30 200 Q 100 175 170 200 Q 170 215 100 215 Q 30 215 30 200 Z"
        fill="#6B4226"
        opacity="0.4"
      />
      <Path
        d="M 99 195 Q 100 175 100 155"
        stroke="#7CB342"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 100 165 Q 110 162 115 170 Q 110 173 100 170 Z"
        fill="url(#leafG1)"
      />
      <Path d="M 100 158 Q 90 155 85 162 Q 90 165 100 163 Z" fill="#9CCC65" />
      <Circle cx="93" cy="160" r="2" fill="#FFFFFF" opacity="0.85" />
    </Svg>
  );
}

function SaplingSVG({ size = 220 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 240" fill="none">
      <Defs>
        <SvgGradient id="leafG2" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#A5D6A7" />
          <Stop offset="100%" stopColor="#4CAF50" />
        </SvgGradient>
        <SvgGradient id="leafG3" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#C5E1A5" />
          <Stop offset="100%" stopColor="#7CB342" />
        </SvgGradient>
      </Defs>
      <Path
        d="M 30 200 Q 100 175 170 200 Q 170 215 100 215 Q 30 215 30 200 Z"
        fill="#8B5E3C"
      />
      <Path
        d="M 30 200 Q 100 175 170 200 Q 170 215 100 215 Q 30 215 30 200 Z"
        fill="#6B4226"
        opacity="0.4"
      />
      <Path
        d="M 96 195 Q 98 150 100 110 Q 102 100 100 195 Z"
        fill="#5D4037"
      />
      <Path
        d="M 100 130 Q 70 122 60 100 Q 78 115 98 122 Z"
        fill="url(#leafG2)"
      />
      <Path
        d="M 100 125 Q 130 117 140 95 Q 122 110 102 117 Z"
        fill="url(#leafG3)"
      />
      <Path
        d="M 100 110 Q 95 95 98 85 Q 100 78 102 85 Q 105 95 100 110 Z"
        fill="url(#leafG2)"
      />
      <Circle cx="88" cy="120" r="2.5" fill="#FFFFFF" opacity="0.9" />
    </Svg>
  );
}

function FullTreeSVG({ size = 240 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 240" fill="none">
      <Defs>
        <SvgGradient id="leafFull" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#A5D6A7" />
          <Stop offset="100%" stopColor="#388E3C" />
        </SvgGradient>
      </Defs>
      <Path
        d="M 25 205 Q 100 178 175 205 Q 175 220 100 220 Q 25 220 25 205 Z"
        fill="#8B5E3C"
      />
      <Path
        d="M 25 205 Q 100 178 175 205 Q 175 220 100 220 Q 25 220 25 205 Z"
        fill="#6B4226"
        opacity="0.4"
      />
      <Path
        d="M 92 205 Q 96 160 100 110 Q 104 160 108 205 Z"
        fill="#5D4037"
      />
      <Path
        d="M 100 175 Q 88 165 80 158"
        stroke="#5D4037"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 100 165 Q 115 158 124 152"
        stroke="#5D4037"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      <Circle cx="100" cy="80" r="42" fill="#A5D6A7" opacity="0.5" />
      <Circle cx="78" cy="92" r="32" fill="#81C784" opacity="0.85" />
      <Circle cx="122" cy="92" r="34" fill="url(#leafFull)" opacity="0.95" />
      <Circle cx="100" cy="70" r="32" fill="#9CCC65" />

      <Circle cx="78" cy="68" r="4.5" fill="#FFEB3B" />
      <Circle cx="78" cy="68" r="2" fill="#FF9800" />

      <Circle cx="125" cy="62" r="4" fill="#EC407A" />
      <Circle cx="125" cy="62" r="1.5" fill="#FFFFFF" />

      <Circle cx="105" cy="50" r="3.5" fill="#FFFFFF" />
      <Circle cx="105" cy="50" r="1.2" fill="#FFC107" />

      <Circle cx="92" cy="100" r="3" fill="#AB47BC" />
      <Circle cx="92" cy="100" r="1" fill="#FFFFFF" />

      <Circle cx="68" cy="85" r="3" fill="#FFFFFF" opacity="0.9" />
      <Circle cx="68" cy="85" r="1.2" fill="#FFFFFF" />
    </Svg>
  );
}

const STAGES = [
  {
    component: SeedSVG,
    greeting: "كل شي بذرة...",
    subline: "حلم ينتظر النور",
    duration: 2200,
  },
  {
    component: SproutSVG,
    greeting: "تنبت بداية صغيرة",
    subline: "ومعها يولد الأمل",
    duration: 2200,
  },
  {
    component: SaplingSVG,
    greeting: "تكبر بالحب والعناية",
    subline: "وتمتد لتلامس السماء",
    duration: 2200,
  },
  {
    component: FullTreeSVG,
    greeting: "هكذا ينمو طفلك",
    subline: "مع نماء، رحلة مليئة بالحياة 🌸",
    duration: 2400,
    isLast: true,
  },
];

export default function SplashScreen() {
  const [currentStage, setCurrentStage] = useState(0);
  const [readyToNavigate, setReadyToNavigate] = useState(false);
  const [destinationPath, setDestinationPath] = useState("/auth/Login");

  const stageOpacity = useRef(new Animated.Value(0)).current;
  const stageScale = useRef(new Animated.Value(0.6)).current;
  const stageBob = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(20)).current;
  const dotsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (!user.emailVerified) {
          setDestinationPath("/auth/verify-email");
          return;
        }
        try {
          const userDoc = await getDoc(doc(db, "Users", user.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role;
            if (role === "parent") setDestinationPath("/parent/homepageP");
            else if (role === "specialist")
              setDestinationPath("/specialist/homepageS");
            else setDestinationPath("/auth/Login");
          } else {
            setDestinationPath("/auth/Login");
          }
        } catch (e) {
          setDestinationPath("/auth/Login");
        }
      } else {
        setDestinationPath("/auth/Login");
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    stageOpacity.setValue(0);
    stageScale.setValue(0.6);
    textOpacity.setValue(0);
    textTranslate.setValue(20);

    Animated.parallel([
      Animated.timing(stageOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(stageScale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 800,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslate, {
        toValue: 0,
        duration: 800,
        delay: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(stageBob, {
          toValue: -8,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(stageBob, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const stage = STAGES[currentStage];

    const timer = setTimeout(() => {
      if (currentStage < STAGES.length - 1) {
        Animated.parallel([
          Animated.timing(stageOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(textOpacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setCurrentStage(currentStage + 1);
        });
      } else {
        setReadyToNavigate(true);
        Animated.parallel([
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(buttonScale, {
            toValue: 1,
            friction: 5,
            tension: 60,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, stage.duration);

    return () => clearTimeout(timer);
  }, [currentStage]);

  useEffect(() => {
    dotsAnim.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i <= currentStage ? 1 : 0,
        duration: 400,
        useNativeDriver: false,
      }).start();
    });
  }, [currentStage]);

  const handleNavigate = () => {
    router.replace(destinationPath);
  };

  const StageComponent = STAGES[currentStage].component;
  const stage = STAGES[currentStage];

  return (
    <AuthBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {!readyToNavigate && (
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={handleNavigate}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>تخطي</Text>
          <Ionicons name="chevron-back" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      <View style={styles.container}>
        <View style={styles.brandHeader}>
          <Text style={styles.brandName}>نماء</Text>
          <View style={styles.brandUnderline} />
        </View>

        <Animated.View
          style={[
            styles.plantWrap,
            {
              opacity: stageOpacity,
              transform: [
                { scale: stageScale },
                { translateY: stageBob },
              ],
            },
          ]}
        >
          <StageComponent size={240} />
        </Animated.View>

        <Animated.View
          style={[
            styles.textWrap,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslate }],
            },
          ]}
        >
          <Text style={styles.greeting}>{stage.greeting}</Text>
          <Text style={styles.subline}>{stage.subline}</Text>
        </Animated.View>

        <View style={styles.dotsRow}>
          {STAGES.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                {
                  width: dotsAnim[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [8, 24],
                  }),
                  backgroundColor: dotsAnim[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: ["rgba(255,255,255,0.4)", "#FFFFFF"],
                  }),
                },
              ]}
            />
          ))}
        </View>

        {readyToNavigate && (
          <Animated.View
            style={[
              styles.buttonWrap,
              {
                opacity: buttonOpacity,
                transform: [{ scale: buttonScale }],
              },
            ]}
          >
            <TouchableOpacity
              style={styles.startBtn}
              onPress={handleNavigate}
              activeOpacity={0.9}
            >
              <Text style={styles.startBtnText}>ابدأ رحلتك</Text>
              <Ionicons name="arrow-back" size={20} color="#0288D1" />
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 80 : 50,
    paddingBottom: 60,
  },
  skipBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 36,
    left: 18,
    zIndex: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  brandHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  brandName: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 5,
    textShadowColor: "rgba(0,0,0,0.18)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 8,
  },
  brandUnderline: {
    width: 60,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 2,
    marginTop: 8,
  },
  plantWrap: {
    width: 240,
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 30,
  },
  textWrap: {
    alignItems: "center",
    paddingHorizontal: 20,
    minHeight: 80,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
    marginBottom: 8,
  },
  subline: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.95)",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.12)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    lineHeight: 24,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 36,
    alignItems: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  buttonWrap: {
    marginTop: 36,
    width: "100%",
    alignItems: "center",
  },
  startBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  startBtnText: {
    color: "#0288D1",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});

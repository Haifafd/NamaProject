import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { COLORS } from "../../constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// ─────────────────────────────────────────────
// Tree stages (SVG only)
// ─────────────────────────────────────────────

function SeedSVG({ size = 220 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <Path
        d="M 30 160 Q 100 130 170 160 Q 170 175 100 175 Q 30 175 30 160 Z"
        fill="#8B5E3C"
      />
      <Path
        d="M 30 160 Q 100 130 170 160 Q 170 175 100 175 Q 30 175 30 160 Z"
        fill="#6B4226"
        opacity="0.4"
      />

      <Ellipse cx="100" cy="155" rx="14" ry="10" fill="#5D3A1A" />
      <Ellipse cx="96" cy="153" rx="12" ry="8" fill="#7A4A24" />

      <Path
        d="M 100 145 Q 100 130 100 115"
        stroke="#7CB342"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      <Path d="M 100 125 Q 92 122 88 128 Q 92 132 100 130 Z" fill="#8BC34A" />
      <Path d="M 100 120 Q 108 117 112 123 Q 108 127 100 125 Z" fill="#9CCC65" />

      <Circle cx="60" cy="158" r="2" fill="#5D3A1A" opacity="0.5" />
      <Circle cx="80" cy="162" r="1.5" fill="#5D3A1A" opacity="0.6" />
      <Circle cx="120" cy="160" r="2" fill="#5D3A1A" opacity="0.5" />
      <Circle cx="140" cy="163" r="1.5" fill="#5D3A1A" opacity="0.6" />
    </Svg>
  );
}

function SaplingSVG({ size = 240 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 220" fill="none">
      <Path
        d="M 25 195 Q 100 165 175 195 Q 175 210 100 210 Q 25 210 25 195 Z"
        fill="#8B5E3C"
      />
      <Path
        d="M 25 195 Q 100 165 175 195 Q 175 210 100 210 Q 25 210 25 195 Z"
        fill="#6B4226"
        opacity="0.4"
      />

      <Path
        d="M 100 190 Q 98 150 100 110 Q 102 80 100 60"
        stroke="#689F38"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />

      <Path d="M 100 165 Q 75 158 65 170 Q 75 178 100 172 Z" fill="#7CB342" />
      <Path
        d="M 100 168 L 70 168"
        stroke="#558B2F"
        strokeWidth="1"
        opacity="0.6"
      />

      <Path d="M 100 140 Q 130 132 140 148 Q 130 158 100 150 Z" fill="#8BC34A" />
      <Path
        d="M 100 145 L 135 145"
        stroke="#558B2F"
        strokeWidth="1"
        opacity="0.6"
      />

      <Path d="M 100 110 Q 70 102 60 120 Q 72 130 100 120 Z" fill="#9CCC65" />

      <Path d="M 100 75 Q 88 68 82 78 Q 88 82 100 80 Z" fill="#AED581" />
      <Path d="M 100 70 Q 112 64 118 73 Q 112 78 100 75 Z" fill="#AED581" />
      <Circle cx="100" cy="62" r="6" fill="#C5E1A5" />

      <Circle cx="55" cy="195" r="2" fill="#5D3A1A" opacity="0.5" />
      <Circle cx="80" cy="200" r="1.5" fill="#5D3A1A" opacity="0.6" />
      <Circle cx="125" cy="198" r="2" fill="#5D3A1A" opacity="0.5" />
      <Circle cx="150" cy="201" r="1.5" fill="#5D3A1A" opacity="0.6" />
    </Svg>
  );
}

function FullTreeSVG({ size = 260 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 240 260" fill="none">
      <Path d="M 0 235 Q 120 215 240 235 L 240 260 L 0 260 Z" fill="#A5D6A7" />
      <Path
        d="M 0 235 Q 120 215 240 235 L 240 245 L 0 245 Z"
        fill="#81C784"
        opacity="0.6"
      />

      <Path
        d="M 110 235 Q 105 200 110 165 Q 115 145 113 125"
        stroke="#6D4C41"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 110 235 Q 105 200 110 165 Q 115 145 113 125"
        stroke="#8D6E63"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      <Path
        d="M 113 165 Q 90 155 75 145"
        stroke="#6D4C41"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 113 155 Q 140 148 155 138"
        stroke="#6D4C41"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 113 140 Q 95 130 88 120"
        stroke="#6D4C41"
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />

      <Circle cx="120" cy="100" r="58" fill="#558B2F" />
      <Circle cx="80" cy="115" r="42" fill="#689F38" />
      <Circle cx="160" cy="115" r="42" fill="#689F38" />
      <Circle cx="120" cy="80" r="48" fill="#7CB342" />
      <Circle cx="100" cy="100" r="35" fill="#8BC34A" />
      <Circle cx="145" cy="100" r="35" fill="#8BC34A" />
      <Circle cx="120" cy="70" r="32" fill="#9CCC65" />

      <Circle cx="105" cy="75" r="14" fill="#C5E1A5" opacity="0.6" />
      <Circle cx="140" cy="90" r="10" fill="#C5E1A5" opacity="0.6" />
      <Circle cx="90" cy="105" r="9" fill="#C5E1A5" opacity="0.5" />

      <Circle cx="95" cy="120" r="5" fill="#FFA726" />
      <Circle cx="93" cy="118" r="2" fill="#FFCC80" />
      <Circle cx="155" cy="105" r="5" fill="#FFA726" />
      <Circle cx="153" cy="103" r="2" fill="#FFCC80" />
      <Circle cx="130" cy="135" r="5" fill="#FFA726" />
      <Circle cx="128" cy="133" r="2" fill="#FFCC80" />
      <Circle cx="115" cy="60" r="4" fill="#FFA726" />
      <Circle cx="113" cy="58" r="1.5" fill="#FFCC80" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// Decorative SVGs
// ─────────────────────────────────────────────

function CloudSVG({ size = 80, opacity = 0.85 }) {
  return (
    <Svg width={size} height={size * 0.5} viewBox="0 0 100 50" fill="none">
      <Ellipse cx="25" cy="30" rx="18" ry="14" fill="white" opacity={opacity} />
      <Ellipse cx="50" cy="25" rx="22" ry="18" fill="white" opacity={opacity} />
      <Ellipse cx="75" cy="30" rx="18" ry="14" fill="white" opacity={opacity} />
      <Ellipse cx="50" cy="35" rx="30" ry="12" fill="white" opacity={opacity} />
    </Svg>
  );
}

function ButterflySVG({ size = 32 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Ellipse cx="20" cy="20" rx="1.5" ry="10" fill="#3E2723" />
      <Ellipse
        cx="12"
        cy="15"
        rx="9"
        ry="7"
        fill="#FF6B9D"
        transform="rotate(-20 12 15)"
      />
      <Ellipse
        cx="28"
        cy="15"
        rx="9"
        ry="7"
        fill="#FF6B9D"
        transform="rotate(20 28 15)"
      />
      <Ellipse
        cx="13"
        cy="25"
        rx="7"
        ry="6"
        fill="#FFB3D1"
        transform="rotate(20 13 25)"
      />
      <Ellipse
        cx="27"
        cy="25"
        rx="7"
        ry="6"
        fill="#FFB3D1"
        transform="rotate(-20 27 25)"
      />
      <Circle cx="11" cy="14" r="1.5" fill="white" opacity="0.8" />
      <Circle cx="29" cy="14" r="1.5" fill="white" opacity="0.8" />
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

function SunRaysSVG({ width = SCREEN_WIDTH }) {
  return (
    <Svg width={width} height={200} viewBox={`0 0 ${width} 200`} fill="none">
      <Defs>
        <LinearGradient id="rayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="#FFEB99" stopOpacity="0.6" />
          <Stop offset="100%" stopColor="#FFEB99" stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Circle cx={width / 2} cy="0" r="55" fill="#FFE082" opacity="0.5" />
      <Circle cx={width / 2} cy="0" r="35" fill="#FFCA28" opacity="0.7" />
      <Path
        d={`M ${width / 2 - 80} 0 L ${width / 2 - 60} 200 L ${width / 2 - 100} 200 Z`}
        fill="url(#rayGrad)"
      />
      <Path
        d={`M ${width / 2 + 80} 0 L ${width / 2 + 60} 200 L ${width / 2 + 100} 200 Z`}
        fill="url(#rayGrad)"
      />
      <Path
        d={`M ${width / 2 - 30} 0 L ${width / 2 - 10} 200 L ${width / 2 - 40} 200 Z`}
        fill="url(#rayGrad)"
      />
      <Path
        d={`M ${width / 2 + 30} 0 L ${width / 2 + 10} 200 L ${width / 2 + 40} 200 Z`}
        fill="url(#rayGrad)"
      />
    </Svg>
  );
}

function SparkleSVG({ size = 16, color = "#FFFFFF" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M 8 0 L 9 7 L 16 8 L 9 9 L 8 16 L 7 9 L 0 8 L 7 7 Z"
        fill={color}
      />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

const SLIDES = [
  {
    treeType: "seed",
    title: "كل رحلة تبدأ ببذرة",
    subtitle: "مرحباً بكم في نماء",
    description: "نسعى لمساعدتك في رعاية ومتابعة نمو طفلك خطوة بخطوة",
    showButterflies: false,
  },
  {
    treeType: "sapling",
    title: "نمو يحتاج لرعاية",
    subtitle: "ساعدينا نفهم رحلة طفلك",
    description: "أجيبي عن أسئلة بسيطة حول مهارات طفلك اليومية",
    showButterflies: false,
  },
  {
    treeType: "tree",
    title: "معاً نبني خطة نموه",
    subtitle: "أنتِ شريكٌ أساسي",
    description: "إجاباتكِ تساعد الأخصائي على رسم خطة علاجية مخصصة",
    showButterflies: true,
    isLast: true,
  },
];

export default function AssessmentSplash() {
  const router = useRouter();
  const { childId, childName, childGender } = useLocalSearchParams();
  const [currentSlide, setCurrentSlide] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(40)).current;
  const treeScaleAnim = useRef(new Animated.Value(0.7)).current;
  const treeBounceAnim = useRef(new Animated.Value(0)).current;

  const cloud1Anim = useRef(new Animated.Value(0)).current;
  const cloud2Anim = useRef(new Animated.Value(0)).current;
  const butterfly1Anim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const butterfly2Anim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const butterfly3Anim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const sparkle1Anim = useRef(new Animated.Value(0)).current;
  const sparkle2Anim = useRef(new Animated.Value(0)).current;
  const sparkle3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    translateAnim.setValue(40);
    treeScaleAnim.setValue(0.7);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(treeScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 35,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentSlide]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(treeBounceAnim, {
          toValue: -6,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(treeBounceAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    const floatLoop = (anim, distance, duration) => {
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
        ])
      ).start();
    };
    floatLoop(cloud1Anim, 20, 4000);
    floatLoop(cloud2Anim, -25, 5000);
  }, []);

  useEffect(() => {
    if (!SLIDES[currentSlide].showButterflies) return;

    const animateButterfly = (anim, dx, dy, duration) => {
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
        ])
      ).start();
    };

    animateButterfly(butterfly1Anim, 30, -20, 3000);
    animateButterfly(butterfly2Anim, -40, 30, 3500);
    animateButterfly(butterfly3Anim, 25, 25, 2800);
  }, [currentSlide]);

  useEffect(() => {
    const twinkle = (anim, delay) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    twinkle(sparkle1Anim, 0);
    twinkle(sparkle2Anim, 600);
    twinkle(sparkle3Anim, 1200);
  }, []);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleStartAssessment();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  const handleStartAssessment = () => {
    router.replace({
      pathname: "/parent/ParentAssessmentForm",
      params: { childId, childName },
    });
  };

  const handleLater = () => {
    router.replace({
      pathname: "/parent/ChildReport",
      params: { childId, childName },
    });
  };

  const slide = SLIDES[currentSlide];
  const isLast = slide.isLast;

  const getSubtitle = () => {
    if (currentSlide === 1 && childName) {
      return `ساعدينا نفهم رحلة ${childName}`;
    }
    return slide.subtitle;
  };

  const renderTree = () => {
    if (slide.treeType === "seed") return <SeedSVG size={220} />;
    if (slide.treeType === "sapling") return <SaplingSVG size={240} />;
    return <FullTreeSVG size={260} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E1F5FE" />

      <View style={styles.skyTop} />
      <View style={styles.skyMid} />
      <View style={styles.skyBottom} />

      <View style={styles.sunContainer}>
        <SunRaysSVG width={SCREEN_WIDTH} />
      </View>

      <Animated.View
        style={[styles.cloud1, { transform: [{ translateX: cloud1Anim }] }]}
      >
        <CloudSVG size={100} opacity={0.9} />
      </Animated.View>
      <Animated.View
        style={[styles.cloud2, { transform: [{ translateX: cloud2Anim }] }]}
      >
        <CloudSVG size={70} opacity={0.7} />
      </Animated.View>

      <Animated.View style={[styles.sparkle1, { opacity: sparkle1Anim }]}>
        <SparkleSVG size={14} color="#FFD54F" />
      </Animated.View>
      <Animated.View style={[styles.sparkle2, { opacity: sparkle2Anim }]}>
        <SparkleSVG size={10} color="#FFFFFF" />
      </Animated.View>
      <Animated.View style={[styles.sparkle3, { opacity: sparkle3Anim }]}>
        <SparkleSVG size={12} color="#FFD54F" />
      </Animated.View>

      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleLater}>
          <Text style={styles.skipText}>تخطي</Text>
        </TouchableOpacity>
      )}

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.treeSection}>
          <Animated.View
            style={[
              styles.treeWrap,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: treeScaleAnim },
                  { translateY: treeBounceAnim },
                ],
              },
            ]}
          >
            {renderTree()}
          </Animated.View>

          {slide.showButterflies && (
            <>
              <Animated.View
                style={[
                  styles.butterfly1,
                  { transform: butterfly1Anim.getTranslateTransform() },
                ]}
              >
                <ButterflySVG size={34} />
              </Animated.View>
              <Animated.View
                style={[
                  styles.butterfly2,
                  { transform: butterfly2Anim.getTranslateTransform() },
                ]}
              >
                <ButterflySVG size={28} />
              </Animated.View>
              <Animated.View
                style={[
                  styles.butterfly3,
                  { transform: butterfly3Anim.getTranslateTransform() },
                ]}
              >
                <ButterflySVG size={24} />
              </Animated.View>
            </>
          )}
        </View>

        <Animated.View
          style={[
            styles.textSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateAnim }],
            },
          ]}
        >
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <View style={styles.subtitleChip}>
            <Text style={styles.subtitleText}>{getSubtitle()}</Text>
          </View>
          <Text style={styles.slideDescription}>{slide.description}</Text>
        </Animated.View>

        <View style={styles.bottomSection}>
          <View style={styles.dotsRow}>
            {SLIDES.map((_, idx) => (
              <View
                key={idx}
                style={[styles.dot, idx === currentSlide && styles.dotActive]}
              />
            ))}
          </View>

          {isLast ? (
            <View style={styles.lastSlideActions}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleStartAssessment}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>ابدأي الاستمارة</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.laterBtn} onPress={handleLater}>
                <Text style={styles.laterBtnText}>لاحقاً</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.navRow}>
              <TouchableOpacity
                style={[
                  styles.navBtn,
                  currentSlide === 0 && styles.navBtnDisabled,
                ]}
                onPress={handlePrevious}
                disabled={currentSlide === 0}
                activeOpacity={0.7}
              >
                <Text style={styles.navBtnText}>السابق</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextBtn}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>التالي</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E1F5FE",
    overflow: "hidden",
  },

  skyTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.35,
    backgroundColor: "#E1F5FE",
  },
  skyMid: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.35,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.35,
    backgroundColor: "#FFF8E1",
  },
  skyBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT * 0.3,
    backgroundColor: "#FFFDE7",
  },

  sunContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    opacity: 0.7,
  },

  cloud1: {
    position: "absolute",
    top: 80,
    left: 30,
  },
  cloud2: {
    position: "absolute",
    top: 130,
    right: 40,
  },

  sparkle1: { position: "absolute", top: 90, right: SCREEN_WIDTH * 0.3 },
  sparkle2: { position: "absolute", top: 200, left: 50 },
  sparkle3: { position: "absolute", top: 160, right: 70 },

  skipBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : 30,
    left: 20,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: "rgba(2, 136, 209, 0.15)",
    borderRadius: 20,
  },
  skipText: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 13,
    fontWeight: "700",
  },

  safeArea: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },

  treeSection: {
    flex: 1.2,
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  treeWrap: {
    alignItems: "center",
    justifyContent: "center",
  },

  butterfly1: {
    position: "absolute",
    top: 60,
    left: SCREEN_WIDTH * 0.18,
  },
  butterfly2: {
    position: "absolute",
    top: 100,
    right: SCREEN_WIDTH * 0.18,
  },
  butterfly3: {
    position: "absolute",
    top: 30,
    right: SCREEN_WIDTH * 0.35,
  },

  textSection: {
    flex: 0.9,
    paddingHorizontal: 12,
    paddingTop: 24,
    alignItems: "center",
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.TEXT,
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitleChip: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 20,
    marginBottom: 14,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  subtitleText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  slideDescription: {
    fontSize: 14,
    color: COLORS.MUTED,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },

  bottomSection: {
    paddingBottom: Platform.OS === "ios" ? 30 : 20,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(2, 136, 209, 0.25)",
  },
  dotActive: {
    width: 28,
    backgroundColor: COLORS.PRIMARY,
  },

  navRow: {
    flexDirection: "row-reverse",
    gap: 10,
  },
  navBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY_LIGHT,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 14,
    fontWeight: "700",
  },
  nextBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  nextBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  lastSlideActions: {
    gap: 10,
  },
  primaryBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  laterBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  laterBtnText: {
    color: COLORS.MUTED,
    fontSize: 13,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";
import { COLORS } from "../../constants/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// White flower logo (matches admin sky theme)
function NamaaFlower({ size = 100 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Ellipse cx="32" cy="18" rx="7" ry="9" fill="white" opacity="0.95" />
      <Ellipse
        cx="20"
        cy="26"
        rx="7"
        ry="9"
        fill="white"
        opacity="0.85"
        rotation="-50"
        originX="20"
        originY="26"
      />
      <Ellipse
        cx="44"
        cy="26"
        rx="7"
        ry="9"
        fill="white"
        opacity="0.85"
        rotation="50"
        originX="44"
        originY="26"
      />
      <Ellipse
        cx="22"
        cy="38"
        rx="7"
        ry="9"
        fill="white"
        opacity="0.75"
        rotation="-110"
        originX="22"
        originY="38"
      />
      <Ellipse
        cx="42"
        cy="38"
        rx="7"
        ry="9"
        fill="white"
        opacity="0.75"
        rotation="110"
        originX="42"
        originY="38"
      />
      <Circle cx="32" cy="30" r="6" fill="#FFD54F" />
      <Circle cx="32" cy="30" r="3" fill="#FF9800" />
      <Path
        d="M 32 36 Q 32 46 32 54"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.8"
        fill="none"
      />
      <Path
        d="M 32 46 Q 24 44 22 50 Q 28 50 32 48 Z"
        fill="white"
        opacity="0.7"
      />
    </Svg>
  );
}

const SLIDES = [
  {
    iconType: "flower",
    title: "مرحباً بكم في نماء",
    description:
      "رحلة نمو طفلك تبدأ هنا. نحن سعداء بانضمامك إلينا!",
    accentText: "✨ خطوتنا الأولى معاً",
  },
  {
    iconType: "icon",
    iconName: "clipboard-text-outline",
    title: "استمارة تقييم طفلك",
    description:
      "ساعدينا لنتعرف على طفلك أكثر من خلال أسئلة بسيطة عن مهاراته اليومية.",
    accentText: "💖 أنتِ الأقرب لطفلك",
  },
  {
    iconType: "icon",
    iconName: "chart-line",
    title: "متابعة دقيقة لتقدّم طفلك",
    description:
      "إجاباتك تساعد الأخصائي على بناء خطة علاجية مخصصة لطفلك.",
    accentText: "🌟 لنبدأ معاً!",
    isLast: true,
  },
];

export default function AssessmentSplash() {
  const router = useRouter();
  const { childId, childName, childGender } = useLocalSearchParams();

  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(50)).current;
  const flowerScaleAnim = useRef(new Animated.Value(0.5)).current;
  const flowerRotateAnim = useRef(new Animated.Value(0)).current;

  const decor1Anim = useRef(new Animated.Value(0)).current;
  const decor2Anim = useRef(new Animated.Value(0)).current;
  const decor3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    translateAnim.setValue(50);
    flowerScaleAnim.setValue(0.5);

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
      Animated.spring(flowerScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentSlide]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(flowerRotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    const createFloat = (anim, distance, duration) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: -distance,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: distance,
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    createFloat(decor1Anim, 12, 2400);
    createFloat(decor2Anim, 16, 2800);
    createFloat(decor3Anim, 10, 2200);
  }, []);

  const flowerRotation = flowerRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

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

  const childPossessive = childGender === "female" ? "ابنتي" : "ابني";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />

      <Animated.View
        style={[
          styles.decorCircle1,
          { transform: [{ translateY: decor1Anim }] },
        ]}
      />
      <Animated.View
        style={[
          styles.decorCircle2,
          { transform: [{ translateY: decor2Anim }] },
        ]}
      />
      <Animated.View
        style={[
          styles.decorCircle3,
          { transform: [{ translateY: decor3Anim }] },
        ]}
      />

      {!isLast && (
        <TouchableOpacity style={styles.skipBtn} onPress={handleLater}>
          <Text style={styles.skipText}>تخطي</Text>
        </TouchableOpacity>
      )}

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.slideContent,
            { opacity: fadeAnim, transform: [{ translateY: translateAnim }] },
          ]}
        >
          <View style={styles.iconSection}>
            {slide.iconType === "flower" ? (
              <Animated.View
                style={[
                  styles.flowerWrap,
                  {
                    transform: [
                      { scale: flowerScaleAnim },
                      { rotate: flowerRotation },
                    ],
                  },
                ]}
              >
                <NamaaFlower size={140} />
              </Animated.View>
            ) : (
              <Animated.View
                style={[
                  styles.iconCircle,
                  { transform: [{ scale: flowerScaleAnim }] },
                ]}
              >
                <MaterialCommunityIcons
                  name={slide.iconName}
                  size={70}
                  color="#FFFFFF"
                />
              </Animated.View>
            )}
          </View>

          <View style={styles.textSection}>
            <View style={styles.accentChip}>
              <Text style={styles.accentText}>{slide.accentText}</Text>
            </View>

            <Text style={styles.slideTitle}>
              {currentSlide === 1 && childName
                ? `استمارة تقييم ${childPossessive}`
                : slide.title}
            </Text>

            <Text style={styles.slideDescription}>
              {currentSlide === 1 && childName
                ? `ساعدينا لنتعرف على ${childName} أكثر من خلال أسئلة بسيطة عن مهاراته اليومية`
                : slide.description}
            </Text>
          </View>
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
                activeOpacity={0.8}
              >
                <Ionicons name="play" size={18} color={COLORS.PRIMARY_DARK} />
                <Text style={styles.primaryBtnText}>أعبّئ الاستمارة الآن</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn} onPress={handleLater}>
                <Text style={styles.secondaryBtnText}>لاحقاً</Text>
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
              >
                <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.nextBtn}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>التالي</Text>
                <Ionicons
                  name="chevron-back"
                  size={22}
                  color={COLORS.PRIMARY_DARK}
                />
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
    backgroundColor: COLORS.PRIMARY,
    overflow: "hidden",
  },

  decorCircle1: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: -80,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.13)",
  },
  decorCircle3: {
    position: "absolute",
    top: "35%",
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.10)",
  },

  skipBtn: {
    position: "absolute",
    top: 50,
    left: 24,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    zIndex: 10,
  },
  skipText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  safeArea: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },

  slideContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 30,
  },

  iconSection: {
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
  },
  flowerWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },

  textSection: {
    alignItems: "center",
    paddingHorizontal: 12,
  },
  accentChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 16,
    marginBottom: 18,
  },
  accentText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  slideDescription: {
    fontSize: 15,
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 8,
  },

  bottomSection: {
    paddingBottom: 40,
  },

  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  dotActive: {
    width: 28,
    backgroundColor: "#FFFFFF",
  },

  navRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  navBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  nextBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  nextBtnText: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 16,
    fontWeight: "800",
  },

  lastSlideActions: {
    gap: 12,
  },
  primaryBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  primaryBtnText: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryBtn: {
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

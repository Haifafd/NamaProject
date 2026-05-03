import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { COLORS } from "../../constants/theme";

export default function ChooseRole() {
  const router = useRouter();
  const [role, setRole] = useState(null);

  const slider = useRef(new Animated.Value(0)).current;
  const circle1 = useRef(new Animated.Value(0)).current;
  const circle2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(circle1, {
          toValue: 20,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(circle1, {
          toValue: 0,
          duration: 4000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(circle2, {
          toValue: -20,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(circle2, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const selectRole = (value) => {
    setRole(value);

    Animated.spring(slider, {
      toValue: value === "parent" ? 0 : 1,
      useNativeDriver: false,
    }).start();
  };

  const translate = slider.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "50%"],
  });

  const description =
    role === "parent"
      ? "اختاري دور الوالد إذا كنتي تتابعين رحلة طفلك مع الأخصائي."
      : role === "specialist"
        ? "اختاري دور المختص إذا كنتي تقدمين الجلسات والمتابعة للأطفال."
        : "اختاري دورك للبدء في رحلة نماء.";

  return (
    <LinearGradient colors={["#79ccf8", "#5BB5E8"]} style={{ flex: 1 }}>
      <Animated.View
        style={[styles.decorCircle1, { transform: [{ translateY: circle1 }] }]}
      />
      <Animated.View
        style={[styles.decorCircle2, { transform: [{ translateY: circle2 }] }]}
      />
      <View style={styles.decorCircle3} />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/auth/Login")}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
      </TouchableOpacity>

      <View style={styles.container}>
        <View style={styles.brandWrap}>
          <View style={styles.logoCircle}>
            <Ionicons name="flower-outline" size={32} color={COLORS.WHITE} />
          </View>
          <Text style={styles.brandName}>نماء</Text>
        </View>

        <Text style={styles.subtitle}>حدد ما دورك في هذه المرحلة!</Text>

        <View style={styles.card}>
          <View style={styles.switchContainer}>
            <Animated.View style={[styles.slider, { left: translate }]} />

            <TouchableOpacity
              style={styles.option}
              onPress={() => selectRole("parent")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.optionText,
                  role === "parent" && styles.selectedText,
                ]}
              >
                الوالد
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => selectRole("specialist")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.optionText,
                  role === "specialist" && styles.selectedText,
                ]}
              >
                المختص
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>{description}</Text>

          <TouchableOpacity
            style={[styles.nextButton, !role && styles.nextButtonDisabled]}
            onPress={() => {
              if (!role) return;
              router.push({ pathname: "/auth/register", params: { role } });
            }}
            activeOpacity={0.9}
          >
            <Text style={styles.nextText}>الخطوة التالية</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 110,
    alignItems: "center",
    paddingHorizontal: 22,
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  brandWrap: {
    alignItems: "center",
    marginBottom: 18,
  },

  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    marginBottom: 10,
  },

  brandName: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.WHITE,
    letterSpacing: 1,
  },

  subtitle: {
    fontSize: 22,
    color: COLORS.WHITE,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 28,
  },

  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 28,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  switchContainer: {
    flexDirection: "row",
    backgroundColor: "#F0F4F8",
    borderRadius: 28,
    padding: 5,
    width: "100%",
    height: 54,
    overflow: "hidden",
    position: "relative",
  },

  slider: {
    position: "absolute",
    width: "50%",
    height: "100%",
    top: 0,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 28,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  option: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },

  optionText: {
    fontSize: 15,
    color: COLORS.MUTED,
    textAlign: "center",
    fontWeight: "600",
  },

  selectedText: {
    color: COLORS.WHITE,
    fontWeight: "700",
  },

  description: {
    fontSize: 14,
    color: COLORS.MUTED,
    textAlign: "center",
    marginTop: 18,
    marginBottom: 6,
    lineHeight: 22,
  },

  nextButton: {
    backgroundColor: COLORS.PRIMARY,
    marginTop: 18,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  nextButtonDisabled: {
    opacity: 0.55,
  },

  nextText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "700",
  },

  decorCircle1: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  decorCircle2: {
    position: "absolute",
    bottom: -50,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.15)",
  },

  decorCircle3: {
    position: "absolute",
    top: "40%",
    left: -40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});

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
    outputRange: ["0%", "55%"],
  });

  return (
    <LinearGradient colors={["#eef2f8", "#cfdcf3"]} style={{ flex: 1 }}>
      {/* زر الرجوع */}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/auth/Login")}
      >
        <Ionicons name="arrow-back" size={28} color="#4a6fa5" />
      </TouchableOpacity>

      {/* الدوائر المتحركة */}

      <Animated.View
        style={[styles.circle1, { transform: [{ translateY: circle1 }] }]}
      />

      <Animated.View
        style={[styles.circle2, { transform: [{ translateY: circle2 }] }]}
      />

      <View style={styles.container}>
        <Text style={styles.subtitle}>حدد ما دورك في هذه المرحلة!</Text>

        <View style={styles.switchContainer}>
          <Animated.View style={[styles.slider, { left: translate }]} />

          <TouchableOpacity
            style={styles.option}
            onPress={() => selectRole("parent")}
          >
            <Text
              style={[
                styles.optionText,
                role === "parent" && styles.selectedText,
              ]}
            >
              الوالد/والدة الطفل النمائي
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => selectRole("specialist")}
          >
            <Text
              style={[
                styles.optionText,
                role === "specialist" && styles.selectedText,
              ]}
            >
              الطبيب / المختص
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => {
            if (!role) return;
            router.push({ pathname: "/auth/register", params: { role } });
          }}
        >
          <Text style={styles.nextText}>الخطوة التالية</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 120,
    alignItems: "center",
    paddingHorizontal: 30,
  },

  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
  },

  title: {
    fontSize: 38,
    fontWeight: "bold",
    marginBottom: 30,
  },

  subtitle: {
    fontSize: 30,
    color: "#605e5e",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 80,
  },

  switchContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 35,
    padding: 5,
    width: "100%",
    height: 50,
    overflow: "hidden",
  },

  slider: {
    position: "absolute",
    width: "55%",
    height: "130%",
    backgroundColor: "#7fa6d6",
    borderRadius: 35,
  },

  option: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  optionText: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
  },

  selectedText: {
    color: "#fff",
    fontWeight: "600",
  },

  nextButton: {
    backgroundColor: "#86aad596",
    marginTop: 70,
    width: 230,
    paddingVertical: 16,
    borderRadius: 35,
    alignItems: "center",

    shadowColor: "#7fa6d6",
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },

  nextText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  circle1: {
    position: "absolute",
    width: 260,
    height: 260,
    backgroundColor: "#bcd0f3",
    borderRadius: 200,
    top: -80,
    right: -60,
    opacity: 0.4,
  },

  circle2: {
    position: "absolute",
    width: 200,
    height: 200,
    backgroundColor: "#9fbaf0",
    borderRadius: 200,
    bottom: -50,
    left: -40,
    opacity: 0.4,
  },
});

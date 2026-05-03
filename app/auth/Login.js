import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";

import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { COLORS } from "../../constants/theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.role === "parent") {
          router.push("/parent/homepageP");
        } else if (userData.role === "specialist") {
          router.push("/specialist/homepageS");
        }
      }
    } catch (error) {
      setError("حدث خطأ: " + error.message);
    }
  };

  return (
    <LinearGradient colors={["#79ccf8", "#5BB5E8"]} style={{ flex: 1 }}>
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandWrap}>
            <View style={styles.logoCircle}>
              <Ionicons name="flower-outline" size={32} color={COLORS.WHITE} />
            </View>
            <Text style={styles.brandName}>نماء</Text>
          </View>

          <Text style={styles.title}>تسجيل الدخول</Text>
          <Text style={styles.welcome}>أهلاً بعودتك في نماء</Text>

          <View style={styles.card}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={COLORS.PRIMARY_DARK}
              />
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                textAlign="right"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>كلمة المرور</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={COLORS.PRIMARY_DARK}
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                textAlign="right"
              />
            </View>

            <TouchableOpacity
              onPress={() => router.push("/auth/reset-password")}
            >
              <Text style={styles.forgot}>نسيت كلمة المرور؟</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Animated.View style={{ transform: [{ scale }] }}>
              <TouchableOpacity
                style={styles.loginBtn}
                onPressIn={pressIn}
                onPressOut={pressOut}
                onPress={handleLogin}
                activeOpacity={0.9}
              >
                <Text style={styles.loginText}>تسجيل الدخول</Text>
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.subtitle}>
              ليس لديك حساب؟
              <Text
                style={styles.link}
                onPress={() => router.push("/auth/choose-role")}
              >
                {" "}
                سجل الآن
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 40,
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
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.WHITE,
    letterSpacing: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.WHITE,
    marginBottom: 6,
  },

  welcome: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 22,
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

  label: {
    fontSize: 13,
    color: COLORS.TEXT,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "right",
  },

  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#F8FBFE",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E1F5FE",
  },

  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: COLORS.TEXT,
    padding: 0,
  },

  forgot: {
    alignSelf: "flex-start",
    color: COLORS.PRIMARY_DARK,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },

  errorText: {
    color: COLORS.DANGER,
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 4,
  },

  loginBtn: {
    backgroundColor: COLORS.PRIMARY,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },

  loginText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "700",
  },

  subtitle: {
    color: COLORS.MUTED,
    textAlign: "center",
    marginTop: 18,
    fontSize: 13,
  },

  link: {
    fontWeight: "700",
    color: COLORS.PRIMARY_DARK,
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

import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../FirebaseConfig";

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
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { COLORS } from "../../constants/theme";

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

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

  const handleReset = async () => {
    if (!email) {
      setSuccess(false);
      setMessage("يرجى إدخال البريد الإلكتروني");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
      setMessage("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك");
    } catch (error) {
      setSuccess(false);
      setMessage("حدث خطأ: " + error.message);
    }
  };

  return (
    <LinearGradient colors={["#79ccf8", "#5BB5E8"]} style={{ flex: 1 }}>
      <Animated.View
        style={[styles.decorCircle1, { transform: [{ translateY: circle1 }] }]}
      />
      <Animated.View
        style={[styles.decorCircle2, { transform: [{ translateY: circle2 }] }]}
      />
      <View style={styles.decorCircle3} />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={COLORS.WHITE} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandWrap}>
            <View style={styles.logoCircle}>
              <Ionicons
                name="lock-closed-outline"
                size={32}
                color={COLORS.WHITE}
              />
            </View>
          </View>

          <Text style={styles.title}>نسيت كلمة المرور؟</Text>
          <Text style={styles.subtitleHero}>
            أدخلي بريدك واستعادة كلمة المرور
          </Text>

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

            {message ? (
              <View
                style={[
                  styles.messageBox,
                  success ? styles.successBox : styles.errorBox,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    success ? styles.successText : styles.errorText,
                  ]}
                >
                  {message}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.button}
              onPress={handleReset}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>إرسال رابط الاستعادة</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/auth/Login")}>
              <Text style={styles.bottomLink}>
                <Text style={styles.link}>العودة لتسجيل الدخول</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 110,
    paddingBottom: 40,
    alignItems: "center",
    paddingHorizontal: 22,
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 999,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },

  brandWrap: {
    alignItems: "center",
    marginBottom: 14,
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
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.WHITE,
    marginBottom: 6,
    textAlign: "center",
  },

  subtitleHero: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 22,
    textAlign: "center",
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

  button: {
    backgroundColor: COLORS.PRIMARY,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },

  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: "700",
  },

  bottomLink: {
    color: COLORS.MUTED,
    textAlign: "center",
    marginTop: 16,
    fontSize: 13,
  },

  link: {
    fontWeight: "700",
    color: COLORS.PRIMARY_DARK,
  },

  messageBox: {
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },

  successBox: {
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#C8E6C9",
  },

  errorBox: {
    backgroundColor: "#FFEBEE",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },

  messageText: {
    textAlign: "center",
    fontSize: 13,
  },

  successText: {
    color: "#2E7D32",
  },

  errorText: {
    color: "#C62828",
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

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
    <LinearGradient colors={["#eef2f8", "#cfdcf3"]} style={{ flex: 1 }}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#4a6fa5" />
      </TouchableOpacity>

      <Animated.View
        style={[styles.circle1, { transform: [{ translateY: circle1 }] }]}
      />

      <Animated.View
        style={[styles.circle2, { transform: [{ translateY: circle2 }] }]}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>إعادة تعيين كلمة المرور</Text>

          <View style={styles.card}>
            <Text style={styles.label}>البريد الإلكتروني</Text>

            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
            />

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

            <TouchableOpacity style={styles.button} onPress={handleReset}>
              <Text style={styles.buttonText}>إرسال الرابط</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 130,
    alignItems: "center",
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
  },

  card: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 30,
    padding: 25,
  },

  label: {
    marginBottom: 8,
    color: "#555",
    textAlign: "right",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 14,
    marginBottom: 20,
    textAlign: "left",
  },

  button: {
    backgroundColor: "#7fa6d6",
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  message: {
    textAlign: "center",
    marginBottom: 15,
    color: "red",
  },

  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 999,
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

  messageBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },

  successBox: {
    backgroundColor: "#e6f7ed",
  },

  errorBox: {
    backgroundColor: "#fde8e8",
  },

  messageText: {
    textAlign: "center",
    fontSize: 14,
  },

  successText: {
    color: "#2e7d32",
  },

  errorText: {
    color: "#c62828",
  },
});

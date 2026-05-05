import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../FirebaseConfig";

import {
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
import { useRouter } from "expo-router";
import { useState } from "react";
import { COLORS } from "../../constants/theme";
import { AuthBackground, NamaaBrand } from "../../components/AuthBackground";

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

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
    <AuthBackground>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
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
          <NamaaBrand size="md" />

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
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === "ios" ? 110 : 90,
    paddingBottom: 40,
    alignItems: "center",
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 999,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 10,
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    textAlign: "center",
  },

  subtitleHero: {
    fontSize: 13,
    color: "rgba(255,255,255,0.92)",
    marginTop: 4,
    marginBottom: 18,
    textAlign: "center",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 28,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    zIndex: 5,
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
    color: "#FFFFFF",
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
});

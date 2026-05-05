import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";

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
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { COLORS } from "../../constants/theme";
import { AuthBackground, NamaaBrand } from "../../components/AuthBackground";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { role } = useLocalSearchParams();

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*().]/.test(password),
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    if (
      !passwordRules.length ||
      !passwordRules.uppercase ||
      !passwordRules.lowercase ||
      !passwordRules.number ||
      !passwordRules.special
    ) {
      setError("كلمة المرور لا تحقق الشروط المطلوبة");
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين");
      return;
    }

    if (!role) {
      setError("يرجى اختيار دور المستخدم");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      await setDoc(doc(db, "Users", user.uid), {
        name: name,
        email: email,
        role: role,
      });
      router.push("/auth/Login");
    } catch (error) {
      setError("حدث خطأ أثناء إنشاء الحساب: " + error.message);
    }
  };

  const roleLabel = role === "specialist" ? "المختص" : "الوالد";

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

          <Text style={styles.title}>إنشاء حساب جديد</Text>
          <Text style={styles.subtitleHero}>
            {role ? `كـ ${roleLabel}` : "أدخل بياناتك للبدء"}
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>الاسم الكامل</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={COLORS.PRIMARY_DARK}
              />
              <TextInput
                style={styles.input}
                placeholder="اكتب اسمك"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                textAlign="right"
              />
            </View>

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
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                textAlign="right"
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
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                textAlign="right"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={COLORS.MUTED}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordRules}>
              <Text
                style={[styles.rule, passwordRules.length && styles.validRule]}
              >
                • 8 أحرف على الأقل
              </Text>
              <Text
                style={[
                  styles.rule,
                  passwordRules.uppercase && styles.validRule,
                ]}
              >
                • حرف كبير واحد على الأقل
              </Text>
              <Text
                style={[
                  styles.rule,
                  passwordRules.lowercase && styles.validRule,
                ]}
              >
                • حرف صغير واحد على الأقل
              </Text>
              <Text
                style={[styles.rule, passwordRules.number && styles.validRule]}
              >
                • رقم واحد على الأقل
              </Text>
              <Text
                style={[styles.rule, passwordRules.special && styles.validRule]}
              >
                • رمز خاص واحد على الأقل
              </Text>
            </View>

            <Text style={styles.label}>تأكيد كلمة المرور</Text>
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
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                textAlign="right"
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              activeOpacity={0.9}
            >
              <Text style={styles.buttonText}>إنشاء الحساب</Text>
            </TouchableOpacity>

            <Text style={styles.bottomLink}>
              لديك حساب؟
              <Text
                style={styles.link}
                onPress={() => router.push("/auth/Login")}
              >
                {" "}
                تسجيل الدخول
              </Text>
            </Text>
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
    paddingTop: Platform.OS === "ios" ? 100 : 80,
    paddingBottom: 40,
    alignItems: "center",
  },

  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
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
  },

  subtitleHero: {
    fontSize: 13,
    color: "rgba(255,255,255,0.92)",
    marginTop: 4,
    marginBottom: 16,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 28,
    padding: 22,
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
    marginTop: 14,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
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

  errorText: {
    color: COLORS.DANGER,
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 4,
  },

  passwordRules: {
    marginBottom: 14,
    paddingHorizontal: 4,
  },

  rule: {
    fontSize: 12,
    color: COLORS.MUTED,
    marginBottom: 3,
    textAlign: "right",
  },

  validRule: {
    color: COLORS.SUCCESS,
  },
});

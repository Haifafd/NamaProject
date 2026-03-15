import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
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
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const { role } = useLocalSearchParams();

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

      console.log("Firestore saving...");

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

  const passwordRules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*().]/.test(password),
  };

  const [showPassword, setShowPassword] = useState(false);

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
          <Text style={styles.title}>إنشاء حساب</Text>

          <Text style={styles.subtitle}>أدخل بياناتك للبدء</Text>

          <View style={styles.card}>
            <Text style={styles.label}>الاسم الكامل</Text>

            <TextInput
              style={[styles.input, { textAlign: "right" }]}
              placeholder="اكتب اسمك"
              placeholderTextColor="#777"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>البريد الإلكتروني</Text>

            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor="#777"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>كلمة المرور</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />

              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.passwordRules}>
              <Text
                style={[styles.rule, passwordRules.length && styles.validRule]}
              >
                • 8 أحرف على الأقل{" "}
              </Text>
              <Text
                style={[
                  styles.rule,
                  passwordRules.uppercase && styles.validRule,
                ]}
              >
                • حرف كبير واحد على الأقل{" "}
              </Text>
              <Text
                style={[
                  styles.rule,
                  passwordRules.lowercase && styles.validRule,
                ]}
              >
                • حرف صغير واحد على الأقل{" "}
              </Text>
              <Text
                style={[styles.rule, passwordRules.number && styles.validRule]}
              >
                {" "}
                • رقم واحد على الأقل{" "}
              </Text>
              <Text
                style={[styles.rule, passwordRules.special && styles.validRule]}
              >
                • رمز خاص واحد على الأقل{" "}
              </Text>
            </View>

            <Text style={styles.label}>تأكيد كلمة المرور</Text>

            <TextInput
              style={styles.input}
              placeholderTextColor="#777"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {error ? (
              <Text
                style={{ color: "red", marginBottom: 10, textAlign: "center" }}
              >
                {error}
              </Text>
            ) : null}

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>إنشاء الحساب</Text>
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

  backButton: {
    position: "absolute",
    top: 60,
    left: 20,
    zIndex: 10,
  },

  title: {
    fontSize: 38,
    fontWeight: "bold",
    marginBottom: 15,
    marginTop: -50,
  },

  subtitle: {
    fontSize: 18,
    color: "#6c6c6c",
    marginBottom: 40,
  },

  card: {
    width: "100%",
    borderRadius: 35,
    padding: 25,

    backgroundColor: "rgba(255, 255, 255, 0.21)",

    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.59)",
  },

  label: {
    fontSize: 14,
    marginBottom: 5,
    color: "#444",
    textAlign: "right",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 20,
    fontSize: 15,
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 25,
    paddingHorizontal: 18,
    marginBottom: 20,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
  },

  button: {
    backgroundColor: "#7fa6d6",
    borderRadius: 35,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,

    shadowColor: "#7fa6d6",
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },

  buttonText: {
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

  passwordRules: {
    marginBottom: 20,
  },

  rule: {
    fontSize: 13,
    color: "#777",
    marginBottom: 3,
    textAlign: "right",
  },

  validRule: {
    color: "#4caf50",
  },
});

import { sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useRef, useState } from "react";
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
import { auth, db } from "../../FirebaseConfig";
import { COLORS } from "../../constants/theme";
import { AuthBackground, NamaaBrand } from "../../components/AuthBackground";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("يرجى ملء جميع الحقول");
      return;
    }
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      if (!user.emailVerified) {
        try {
          await sendEmailVerification(user);
        } catch (e) {
          // نتجاهل الخطأ ونوجه المستخدم لشاشة التحقق
        }
        router.replace({
          pathname: "/auth/verify-email",
          params: { email: user.email },
        });
        return;
      }

      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        if (role === "parent") router.push("/parent/homepageP");
        else if (role === "specialist") router.push("/specialist/homepageS");
      }
    } catch (err) {
      setError("بيانات الدخول غير صحيحة");
    }
  };

  return (
    <AuthBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <NamaaBrand size="lg" tagline="رحلة طفلك تبدأ من هنا" />

          <View style={styles.headerSpace}>
            <Text style={styles.welcome}>أهلاً بعودتك</Text>
            <Text style={styles.welcomeSub}>سجّل دخولك لمتابعة رحلتك</Text>
          </View>

          <View style={styles.glassCard}>
            <Text style={styles.label}>البريد الإلكتروني</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={COLORS.PRIMARY_DARK} />
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor="#A0AEC0"
                value={email}
                onChangeText={setEmail}
                textAlign="right"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>كلمة المرور</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.PRIMARY_DARK} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#A0AEC0"
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

            <TouchableOpacity
              onPress={() => router.push("/auth/reset-password")}
              style={styles.forgotWrap}
            >
              <Text style={styles.forgot}>نسيت كلمة المرور؟</Text>
            </TouchableOpacity>

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={COLORS.DANGER} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Animated.View style={{ transform: [{ scale }], marginTop: 8 }}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPressIn={pressIn}
                onPressOut={pressOut}
                onPress={handleLogin}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryBtnText}>تسجيل الدخول</Text>
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>أو</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => router.push("/auth/choose-role")}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryBtnText}>إنشاء حساب جديد</Text>
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
    paddingTop: Platform.OS === "ios" ? 70 : 50,
    paddingBottom: 40,
    alignItems: "center",
  },
  headerSpace: {
    marginTop: 24,
    marginBottom: 18,
    alignItems: "center",
  },
  welcome: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSub: {
    fontSize: 13,
    color: "rgba(255,255,255,0.92)",
    marginTop: 4,
  },
  glassCard: {
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
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "right",
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#F7FAFD",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    marginBottom: 14,
    gap: 10,
    borderWidth: 1.2,
    borderColor: "#E1F5FE",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.TEXT,
    padding: 0,
    height: "100%",
  },
  forgotWrap: {
    alignSelf: "flex-start",
  },
  forgot: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 13,
    fontWeight: "700",
  },
  errorBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 12,
  },
  errorText: {
    color: COLORS.DANGER,
    fontSize: 13,
    fontWeight: "600",
  },
  primaryBtn: {
    backgroundColor: COLORS.PRIMARY,
    height: 56,
    borderRadius: 18,
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 8,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  divider: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E7EF",
  },
  dividerText: {
    fontSize: 12,
    color: COLORS.MUTED,
    fontWeight: "600",
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    backgroundColor: "rgba(121,204,248,0.08)",
  },
  secondaryBtnText: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 15,
    fontWeight: "800",
  },
});

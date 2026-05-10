import { sendEmailVerification, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth, db } from "../../FirebaseConfig";
import { COLORS } from "../../constants/theme";
import { AuthBackground, NamaaBrand } from "../../components/AuthBackground";

const RESEND_COOLDOWN = 60;

export default function VerifyEmail() {
  const { email: emailParam } = useLocalSearchParams();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [message, setMessage] = useState({ text: "", type: "info" });
  const intervalRef = useRef(null);

  const displayEmail = emailParam || auth.currentUser?.email || "";

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    const user = auth.currentUser;
    if (!user) {
      setMessage({
        text: "انتهت الجلسة، يرجى تسجيل الدخول من جديد",
        type: "error",
      });
      return;
    }
    setResending(true);
    try {
      await sendEmailVerification(user);
      setCooldown(RESEND_COOLDOWN);
      setMessage({ text: "تم إرسال رابط التحقق مرة أخرى", type: "success" });
    } catch (e) {
      setMessage({
        text: "تعذّر إرسال الرابط، حاولي بعد قليل",
        type: "error",
      });
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerified = async () => {
    const user = auth.currentUser;
    if (!user) {
      setMessage({
        text: "انتهت الجلسة، يرجى تسجيل الدخول من جديد",
        type: "error",
      });
      return;
    }
    setChecking(true);
    try {
      await user.reload();
      if (auth.currentUser?.emailVerified) {
        const userDoc = await getDoc(doc(db, "Users", auth.currentUser.uid));
        const role = userDoc.exists() ? userDoc.data().role : null;
        if (role === "parent") {
          router.replace("/parent/homepageP");
        } else if (role === "specialist") {
          router.replace("/specialist/homepageS");
        } else {
          router.replace("/auth/Login");
        }
      } else {
        setMessage({
          text: "لم يتم التحقق بعد، تأكدي من فتح الرابط في بريدك",
          type: "error",
        });
      }
    } catch (e) {
      setMessage({ text: "حدث خطأ، حاولي مرة أخرى", type: "error" });
    } finally {
      setChecking(false);
    }
  };

  const handleBackToLogin = async () => {
    try {
      await signOut(auth);
    } catch (e) {}
    router.replace("/auth/Login");
  };

  return (
    <AuthBackground>
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

          <Text style={styles.title}>تحقّقي من بريدك</Text>
          <Text style={styles.subtitleHero}>
            أرسلنا رابط التحقق إلى بريدك الإلكتروني
          </Text>

          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="mail-unread-outline"
                size={42}
                color={COLORS.PRIMARY_DARK}
              />
            </View>

            {displayEmail ? (
              <Text style={styles.email}>{displayEmail}</Text>
            ) : null}

            <Text style={styles.instructions}>
              افتحي الرسالة من بريدك واضغطي على رابط التحقق، ثم ارجعي لهذه
              الشاشة واضغطي على زر "تحقّقت من البريد".
            </Text>

            {message.text ? (
              <View
                style={[
                  styles.messageBox,
                  message.type === "success"
                    ? styles.successBox
                    : styles.errorBox,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.type === "success"
                      ? styles.successText
                      : styles.errorText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleCheckVerified}
              disabled={checking}
              activeOpacity={0.9}
            >
              {checking ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>تحقّقت من البريد</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                (cooldown > 0 || resending) && styles.secondaryBtnDisabled,
              ]}
              onPress={handleResend}
              disabled={cooldown > 0 || resending}
              activeOpacity={0.9}
            >
              {resending ? (
                <ActivityIndicator color={COLORS.PRIMARY_DARK} />
              ) : (
                <Text style={styles.secondaryBtnText}>
                  {cooldown > 0
                    ? `إعادة الإرسال خلال ${cooldown} ثانية`
                    : "إعادة إرسال الرابط"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleBackToLogin}
              style={styles.backLinkWrap}
            >
              <Text style={styles.backLink}>العودة لتسجيل الدخول</Text>
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
    paddingTop: Platform.OS === "ios" ? 90 : 70,
    paddingBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 10,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
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
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  iconCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#E1F5FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  email: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.PRIMARY_DARK,
    marginBottom: 10,
    textAlign: "center",
  },
  instructions: {
    fontSize: 13,
    color: COLORS.MUTED,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 16,
  },
  messageBox: {
    width: "100%",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
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
    fontWeight: "600",
  },
  successText: { color: "#2E7D32" },
  errorText: { color: "#C62828" },
  primaryBtn: {
    backgroundColor: COLORS.PRIMARY,
    height: 54,
    borderRadius: 16,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryBtn: {
    height: 50,
    width: "100%",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    backgroundColor: "rgba(121,204,248,0.08)",
  },
  secondaryBtnDisabled: {
    opacity: 0.5,
  },
  secondaryBtnText: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 14,
    fontWeight: "700",
  },
  backLinkWrap: {
    marginTop: 16,
  },
  backLink: {
    color: COLORS.MUTED,
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});

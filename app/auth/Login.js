import {
    Animated,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useRef, useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
    }
  };

  return (
    <LinearGradient colors={["#e8edf6", "#cfdcf3"]} style={{ flex: 1 }}>
      <View style={styles.backgroundCircle1} />
      <View style={styles.backgroundCircle2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Text style={styles.title}>تسجيل الدخول</Text>

        <Text style={styles.subtitle}>
          لا تملك حسابًا؟
          <Text
            style={styles.link}
            onPress={() => router.push("/auth/choose-role")}
          >
            {" "}
            سجل الآن
          </Text>
        </Text>

        <BlurView intensity={15} style={styles.card}>
          <Text style={styles.label}>البريد الإلكتروني</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            textAlign="right"
          />

          <Text style={styles.label}>كلمة المرور</Text>

          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            textAlign="right"
          />

          <Text style={styles.forgot}>نسيت كلمة المرور؟</Text>

          <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
              style={styles.loginBtn}
              onPressIn={pressIn}
              onPressOut={pressOut}
            >
              <Text style={styles.loginText}>تسجيل الدخول</Text>
            </TouchableOpacity>
          </Animated.View>
        </BlurView>

        <Text style={styles.socialText}>أو المتابعة باستخدام</Text>

        <TouchableOpacity style={styles.googleBtn}>
          <Image
            source={require("../../assets/images/icons/google.png")}
            style={styles.googleIcon}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  title: {
    fontSize: 38,
    fontWeight: "bold",
    marginBottom: 15,
  },

  subtitle: {
    color: "#6d6d6d",
    marginBottom: 45,
  },

  link: {
    fontWeight: "700",
  },

  card: {
    width: "100%",
    borderRadius: 35,
    padding: 25,
    overflow: "hidden",

    shadowColor: "#050000",
    shadowOpacity: 0.1,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
  },

  label: {
    fontSize: 13,
    color: "#3d3d3d",
    marginBottom: 6,
    textAlign: "right",
  },

  input: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 15,
    marginBottom: 15,
  },

  forgot: {
    alignSelf: "flex-end",
    color: "#292540",
    marginBottom: 25,
  },

  loginBtn: {
    backgroundColor: "#7fa6d6",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",

    shadowColor: "#7fa6d6",
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
  },

  loginText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

  socialText: {
    marginTop: 35,
    marginBottom: 12,
    color: "#6d6d6d",
  },

  googleBtn: {
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 18,
    borderRadius: 50,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },

  googleIcon: {
    width: 34,
    height: 34,
  },

  backgroundCircle1: {
    position: "absolute",
    width: 220,
    height: 220,
    backgroundColor: "#bcd0f3",
    borderRadius: 200,
    top: -60,
    right: -60,
    opacity: 0.4,
  },

  backgroundCircle2: {
    position: "absolute",
    width: 180,
    height: 180,
    backgroundColor: "#a5bff0",
    borderRadius: 200,
    bottom: -40,
    left: -40,
    opacity: 0.4,
  },
});

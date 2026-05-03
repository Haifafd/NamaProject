import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../../FirebaseConfig";
import { COLORS } from "../../constants/theme";

export default function ChangePassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("تنبيه", "الرجاء ملء جميع الحقول");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert(
        "تنبيه",
        "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل"
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("تنبيه", "كلمتا المرور الجديدتان غير متطابقتين");
      return;
    }
    if (newPassword === currentPassword) {
      Alert.alert("تنبيه", "كلمة المرور الجديدة يجب أن تختلف عن الحالية");
      return;
    }

    try {
      setSaving(true);
      const user = auth.currentUser;
      if (!user) throw new Error("Not authenticated");

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      Alert.alert("تم بنجاح", "تم تحديث كلمة المرور", [
        { text: "حسناً", onPress: () => router.back() },
      ]);
    } catch (error) {
      let message = "حدث خطأ غير متوقع";
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        message = "كلمة المرور الحالية غير صحيحة";
      } else if (error.code === "auth/weak-password") {
        message = "كلمة المرور الجديدة ضعيفة";
      } else if (error.code === "auth/requires-recent-login") {
        message = "الرجاء تسجيل الدخول مرة أخرى";
      }
      Alert.alert("خطأ", message);
    } finally {
      setSaving(false);
    }
  };

  const lengthOk = newPassword.length >= 8;
  const differsOk = newPassword.length > 0 && newPassword !== currentPassword;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* ─── HEADER ─── */}
        <View style={styles.headerGradient}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>تغيير كلمة المرور</Text>
            </View>

            <View style={{ width: 38 }} />
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hero icon + text */}
            <View style={styles.heroSection}>
              <View style={styles.heroIconBox}>
                <Ionicons name="lock-closed" size={28} color={COLORS.PRIMARY} />
              </View>
              <Text style={styles.heroTitle}>
                لحماية حسابك، اختاري كلمة مرور قوية جديدة
              </Text>
            </View>

            {/* Current password */}
            <View style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)}>
                  <Ionicons
                    name={showCurrent ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.MUTED}
                  />
                </TouchableOpacity>
                <View style={styles.inputLabelRow}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color={COLORS.PRIMARY_DARK}
                  />
                  <Text style={styles.inputLabel}>كلمة المرور الحالية</Text>
                </View>
              </View>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrent}
                textAlign="right"
                placeholder="••••••••"
                placeholderTextColor={COLORS.MUTED}
              />
            </View>

            {/* New password */}
            <View style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  <Ionicons
                    name={showNew ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.MUTED}
                  />
                </TouchableOpacity>
                <View style={styles.inputLabelRow}>
                  <Ionicons
                    name="key-outline"
                    size={18}
                    color={COLORS.PRIMARY_DARK}
                  />
                  <Text style={styles.inputLabel}>كلمة المرور الجديدة</Text>
                </View>
              </View>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNew}
                textAlign="right"
                placeholder="••••••••"
                placeholderTextColor={COLORS.MUTED}
              />
            </View>

            {/* Confirm password */}
            <View style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Ionicons
                    name={showConfirm ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.MUTED}
                  />
                </TouchableOpacity>
                <View style={styles.inputLabelRow}>
                  <Ionicons
                    name="checkmark-done-outline"
                    size={18}
                    color={COLORS.PRIMARY_DARK}
                  />
                  <Text style={styles.inputLabel}>تأكيد كلمة المرور</Text>
                </View>
              </View>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                textAlign="right"
                placeholder="••••••••"
                placeholderTextColor={COLORS.MUTED}
              />
            </View>

            {/* Requirements */}
            <View style={styles.requirementsCard}>
              <Text style={styles.reqTitle}>متطلبات كلمة المرور:</Text>
              <View style={styles.reqRow}>
                <Ionicons
                  name={lengthOk ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={lengthOk ? COLORS.SUCCESS : COLORS.MUTED}
                />
                <Text
                  style={[
                    styles.reqText,
                    lengthOk && { color: COLORS.SUCCESS },
                  ]}
                >
                  8 أحرف على الأقل
                </Text>
              </View>
              <View style={styles.reqRow}>
                <Ionicons
                  name={differsOk ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={differsOk ? COLORS.SUCCESS : COLORS.MUTED}
                />
                <Text
                  style={[
                    styles.reqText,
                    differsOk && { color: COLORS.SUCCESS },
                  ]}
                >
                  تختلف عن كلمة المرور الحالية
                </Text>
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="key" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>تحديث كلمة المرور</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => router.back()}
              disabled={saving}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelBtnText}>إلغاء</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },

  headerGradient: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    position: "relative",
  },
  decorCircle1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: -40,
    left: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },

  heroSection: {
    alignItems: "center",
    marginBottom: 24,
    gap: 10,
  },
  heroIconBox: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 13,
    color: COLORS.MUTED,
    textAlign: "center",
    paddingHorizontal: 30,
    lineHeight: 20,
  },

  inputCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  inputHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  inputLabelRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.TEXT,
  },
  input: {
    fontSize: 15,
    color: COLORS.TEXT,
    paddingVertical: 6,
    paddingHorizontal: 4,
    minHeight: 38,
  },

  requirementsCard: {
    backgroundColor: COLORS.PRIMARY_BG,
    borderRadius: 14,
    padding: 14,
    marginVertical: 14,
    gap: 8,
  },
  reqTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.PRIMARY_DARK,
    textAlign: "right",
    marginBottom: 4,
  },
  reqRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  reqText: {
    fontSize: 12,
    color: COLORS.MUTED,
  },

  saveBtn: {
    flexDirection: "row-reverse",
    backgroundColor: COLORS.PRIMARY,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  cancelBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
    marginTop: 12,
  },
  cancelBtnText: {
    color: COLORS.PRIMARY_DARK,
    fontWeight: "700",
    fontSize: 14,
  },
});

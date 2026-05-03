import { useEffect, useState } from "react";
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
  updateEmail,
} from "firebase/auth";
import { auth } from "../../FirebaseConfig";
import { getCurrentUser, updateUserProfile } from "../../Services/UserService";
import { COLORS } from "../../constants/theme";

export default function EditProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [originalName, setOriginalName] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
      setName(userData?.name || "");
      setEmail(userData?.email || auth.currentUser?.email || "");
      setOriginalName(userData?.name || "");
      setOriginalEmail(userData?.email || auth.currentUser?.email || "");
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال الاسم");
      return;
    }
    if (!email.trim() || !validateEmail(email.trim())) {
      Alert.alert("تنبيه", "الرجاء إدخال بريد إلكتروني صحيح");
      return;
    }

    const nameChanged = name.trim() !== originalName;
    const emailChanged =
      email.trim().toLowerCase() !== originalEmail.toLowerCase();

    if (!nameChanged && !emailChanged) {
      Alert.alert("تنبيه", "لم يتم تغيير أي شيء");
      return;
    }

    if (emailChanged) {
      setShowPasswordModal(true);
      return;
    }

    try {
      setSaving(true);
      await updateUserProfile({ name: name.trim() });
      Alert.alert("تم بنجاح", "تم تحديث الاسم", [
        { text: "حسناً", onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert("خطأ", "لم نتمكن من حفظ التغييرات");
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmEmailChange = async () => {
    if (!reauthPassword) {
      Alert.alert("تنبيه", "الرجاء إدخال كلمة المرور");
      return;
    }

    try {
      setSaving(true);
      const currentUser = auth.currentUser;

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        reauthPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      await updateEmail(currentUser, email.trim());

      const updates = { email: email.trim() };
      if (name.trim() !== originalName) {
        updates.name = name.trim();
      }
      await updateUserProfile(updates);

      setShowPasswordModal(false);
      setReauthPassword("");
      Alert.alert("تم بنجاح", "تم تحديث البريد الإلكتروني", [
        { text: "حسناً", onPress: () => router.back() },
      ]);
    } catch (error) {
      let message = "حدث خطأ غير متوقع";
      if (
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        message = "كلمة المرور غير صحيحة";
      } else if (error.code === "auth/email-already-in-use") {
        message = "هذا البريد مستخدم بالفعل";
      } else if (error.code === "auth/invalid-email") {
        message = "البريد الإلكتروني غير صحيح";
      } else if (error.code === "auth/requires-recent-login") {
        message = "الرجاء تسجيل الدخول مرة أخرى ثم المحاولة";
      } else if (error.code === "auth/operation-not-allowed") {
        message =
          "تغيير البريد يتطلب تفعيل البريد الجديد. تحققي من بريدك الإلكتروني.";
      }
      Alert.alert("خطأ", message);
    } finally {
      setSaving(false);
    }
  };

  const getInitial = (n) => {
    if (!n) return "؟";
    return n.trim().charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerLoading]}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

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
              <Text style={styles.headerTitle}>تعديل الملف الشخصي</Text>
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
            {/* ─── AVATAR ─── */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarBig}>
                <Text style={styles.avatarInitial}>{getInitial(name)}</Text>
              </View>
              <View style={styles.roleChip}>
                <Text style={styles.roleText}>
                  {user?.role === "specialist" ? "أخصائي" : "ولي أمر"}
                </Text>
              </View>
            </View>

            {/* ─── NAME ─── */}
            <View style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={COLORS.PRIMARY_DARK}
                />
                <Text style={styles.inputLabel}>الاسم</Text>
              </View>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="أدخلي اسمك"
                placeholderTextColor={COLORS.MUTED}
                textAlign="right"
              />
            </View>

            {/* ─── EMAIL ─── */}
            <View style={styles.inputCard}>
              <View style={styles.inputHeader}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={COLORS.PRIMARY_DARK}
                />
                <Text style={styles.inputLabel}>البريد الإلكتروني</Text>
              </View>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="example@email.com"
                placeholderTextColor={COLORS.MUTED}
                textAlign="right"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* ─── EMAIL CHANGE WARNING ─── */}
            <View style={styles.warningCard}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color="#F5A623"
              />
              <Text style={styles.warningText}>
                تغيير البريد يتطلب إدخال كلمة المرور للتأكيد
              </Text>
            </View>

            {/* ─── SAVE ─── */}
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>حفظ التغييرات</Text>
                </>
              )}
            </TouchableOpacity>

            {/* ─── CANCEL ─── */}
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

        {/* ─── PASSWORD MODAL ─── */}
        {showPasswordModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalIconBox}>
                <Ionicons name="lock-closed" size={32} color={COLORS.PRIMARY} />
              </View>
              <Text style={styles.modalTitle}>تأكيد تغيير البريد</Text>
              <Text style={styles.modalSubtitle}>
                لحماية حسابك، أدخلي كلمة المرور الحالية
              </Text>
              <TextInput
                style={styles.modalInput}
                value={reauthPassword}
                onChangeText={setReauthPassword}
                placeholder="كلمة المرور الحالية"
                placeholderTextColor={COLORS.MUTED}
                secureTextEntry
                textAlign="right"
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => {
                    setShowPasswordModal(false);
                    setReauthPassword("");
                  }}
                  disabled={saving}
                >
                  <Text style={styles.modalBtnTextCancel}>إلغاء</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnConfirm]}
                  onPress={handleConfirmEmailChange}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalBtnTextConfirm}>تأكيد</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  centerLoading: { justifyContent: "center", alignItems: "center" },

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

  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarBig: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatarInitial: {
    fontSize: 42,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  roleChip: {
    backgroundColor: COLORS.PRIMARY_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    color: COLORS.PRIMARY_DARK,
    fontWeight: "700",
    fontSize: 12,
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
    gap: 8,
    marginBottom: 8,
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

  warningCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#FFF6E8",
    borderColor: "#FFE2B5",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginBottom: 18,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: "#8B6914",
    textAlign: "right",
    lineHeight: 18,
  },

  saveBtn: {
    flexDirection: "row-reverse",
    backgroundColor: COLORS.PRIMARY,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
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

  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  modalIconBox: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.TEXT,
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    color: COLORS.MUTED,
    textAlign: "center",
    marginBottom: 16,
  },
  modalInput: {
    width: "100%",
    backgroundColor: COLORS.BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.TEXT,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row-reverse",
    width: "100%",
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalBtnCancel: {
    backgroundColor: COLORS.BG,
  },
  modalBtnConfirm: {
    backgroundColor: COLORS.PRIMARY,
  },
  modalBtnTextCancel: {
    color: COLORS.MUTED,
    fontWeight: "700",
  },
  modalBtnTextConfirm: {
    color: "#fff",
    fontWeight: "700",
  },
});

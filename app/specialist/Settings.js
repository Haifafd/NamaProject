import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../../FirebaseConfig";
import { getCurrentUser } from "../../Services/UserService";
import BottomNavBar from "../../components/BottomNavBar";

// ─── نفس الثيم السماوي ───
const PRIMARY = "#79ccf8";
const PRIMARY_DARK = "#0288D1";
const PRIMARY_LIGHT = "#E1F5FE";
const BG = "#F0F4F8";
const CARD = "#FFFFFF";
const TEXT = "#1A1A1A";
const MUTED = "#757575";
const RED = "#F44336";
const RED_LIGHT = "#FFEBEE";
const GREEN = "#4CAF50";
const AMBER = "#F5A623";

export default function Settings() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // إعدادات الإشعارات
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reportAlerts, setReportAlerts] = useState(true);

  // إعدادات الخصوصية والأمان
  const [biometricLock, setBiometricLock] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────
  // 🚪 تسجيل الخروج
  // ─────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل أنتي متأكدة من تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تسجيل الخروج",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/Login");
          } catch (error) {
            Alert.alert("خطأ", "لم نتمكن من تسجيل الخروج");
          }
        },
      },
    ]);
  };

  // ─────────────────────────────────────────────
  // 🔧 مكون الإعداد
  // ─────────────────────────────────────────────
  const SettingItem = ({
    icon,
    iconColor = PRIMARY_DARK,
    iconBg = PRIMARY_LIGHT,
    title,
    subtitle,
    onPress,
    isSwitch = false,
    switchValue,
    onSwitchChange,
    showArrow = true,
    isDanger = false,
  }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      disabled={isSwitch || !onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.itemIconBox,
          { backgroundColor: isDanger ? RED_LIGHT : iconBg },
        ]}
      >
        <Ionicons name={icon} size={20} color={isDanger ? RED : iconColor} />
      </View>

      <View style={styles.itemTextContainer}>
        <Text
          style={[styles.itemTitle, isDanger && { color: RED }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      {isSwitch ? (
        <Switch
          trackColor={{ false: "#E0E0E0", true: PRIMARY }}
          thumbColor={switchValue ? "#fff" : "#f4f3f4"}
          onValueChange={onSwitchChange}
          value={switchValue}
        />
      ) : (
        showArrow && <Ionicons name="chevron-back" size={18} color={MUTED} />
      )}
    </TouchableOpacity>
  );

  // ─────────────────────────────────────────────
  // 📋 عنوان قسم
  // ─────────────────────────────────────────────
  const SectionTitle = ({ title, icon }) => (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={16} color={PRIMARY_DARK} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerLoading]}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* ─── HEADER GRADIENT ─── */}
        <View style={styles.headerGradient}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>الإعدادات</Text>

            <View style={{ width: 42 }} />
          </View>

          {/* بطاقة الملف الشخصي */}
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={28} color={PRIMARY_DARK} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || "أخصائي"}</Text>
              <Text style={styles.profileEmail} numberOfLines={1}>
                {user?.email || "—"}
              </Text>
              <View style={styles.profileBadge}>
                <Ionicons name="shield-checkmark" size={10} color={GREEN} />
                <Text style={styles.profileBadgeText}>
                  {user?.role === "specialist" ? "أخصائي" : "مستخدم"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ═══ قسم: الحساب ═══ */}
          <SectionTitle title="الحساب" icon="person-circle" />
          <View style={styles.sectionCard}>
            <SettingItem
              icon="person-outline"
              title="تعديل الملف الشخصي"
              subtitle="الاسم، الصورة، البريد"
              onPress={() => router.push("./EditProfile")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="lock-closed-outline"
              title="تغيير كلمة المرور"
              subtitle="حماية حسابك"
              onPress={() => router.push("./ChangePassword")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="briefcase-outline"
              title="معلومات مهنية"
              subtitle="التخصص والمؤهلات"
              onPress={() => router.push("./ProfessionalInfo")}
            />
          </View>

          {/* ═══ قسم: الإشعارات ═══ */}
          <SectionTitle title="الإشعارات" icon="notifications" />
          <View style={styles.sectionCard}>
            <SettingItem
              icon="notifications-outline"
              iconColor={AMBER}
              iconBg="#FFF6E8"
              title="إشعارات التطبيق"
              subtitle="تلقي الإشعارات الفورية"
              isSwitch={true}
              switchValue={pushNotifications}
              onSwitchChange={setPushNotifications}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="mail-outline"
              iconColor={AMBER}
              iconBg="#FFF6E8"
              title="إشعارات البريد"
              subtitle="إرسال تنبيهات للبريد"
              isSwitch={true}
              switchValue={emailNotifications}
              onSwitchChange={setEmailNotifications}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="document-text-outline"
              iconColor={AMBER}
              iconBg="#FFF6E8"
              title="تنبيهات التقارير"
              subtitle="عند توفر تقرير جديد"
              isSwitch={true}
              switchValue={reportAlerts}
              onSwitchChange={setReportAlerts}
            />
          </View>

          {/* ═══ قسم: الخصوصية والأمان ═══ */}
          <SectionTitle title="الخصوصية والأمان" icon="shield-checkmark" />
          <View style={styles.sectionCard}>
            <SettingItem
              icon="finger-print-outline"
              iconColor={GREEN}
              iconBg="#E8F5E9"
              title="القفل البيومتري"
              subtitle="بصمة أو Face ID"
              isSwitch={true}
              switchValue={biometricLock}
              onSwitchChange={setBiometricLock}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="shield-outline"
              iconColor={GREEN}
              iconBg="#E8F5E9"
              title="سياسة الخصوصية"
              onPress={() => router.push("./Privacy")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="document-outline"
              iconColor={GREEN}
              iconBg="#E8F5E9"
              title="الشروط والأحكام"
              onPress={() => router.push("./Terms")}
            />
          </View>

          {/* ═══ قسم: الدعم ═══ */}
          <SectionTitle title="الدعم والمساعدة" icon="help-circle" />
          <View style={styles.sectionCard}>
            <SettingItem
              icon="chatbubbles-outline"
              title="تواصل معنا"
              subtitle="نسعد بمساعدتك"
              onPress={() => router.push("./Contact")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="help-circle-outline"
              title="الأسئلة الشائعة"
              onPress={() => router.push("./FAQ")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="information-circle-outline"
              title="عن تطبيق نماء"
              subtitle="الإصدار 1.0.0"
              onPress={() => router.push("./About")}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="star-outline"
              title="قيّم التطبيق"
              subtitle="ساعدينا في التحسين"
              onPress={() => {}}
            />
          </View>

          {/* ═══ زر تسجيل الخروج ═══ */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={RED} />
            <Text style={styles.logoutText}>تسجيل الخروج</Text>
          </TouchableOpacity>

          {/* ═══ معلومات الإصدار ═══ */}
          <View style={styles.versionContainer}>
            <Text style={styles.appName}>🌟 تطبيق نماء</Text>
            <Text style={styles.versionText}>الإصدار 1.0.0 © 2026</Text>
          </View>

          {/* مساحة للـ Navbar */}
          <View style={{ height: 110 }} />
        </ScrollView>

        {/* ═══════════════════════════════════════════ */}
        {/* ─── BOTTOM NAVBAR (Component مشترك) ─── */}
        {/* ═══════════════════════════════════════════ */}
        <BottomNavBar />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  centerLoading: { justifyContent: "center", alignItems: "center" },

  // Header
  headerGradient: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 70,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    position: "relative",
  },
  decorCircle1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: -40,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },

  // Profile Card
  profileCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 20,
    padding: 14,
    borderRadius: 20,
    gap: 14,
    zIndex: 1,
    shadowColor: PRIMARY_DARK,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    textAlign: "right",
  },
  profileEmail: {
    fontSize: 12,
    color: MUTED,
    textAlign: "right",
  },
  profileBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  profileBadgeText: {
    fontSize: 10,
    color: GREEN,
    fontWeight: "700",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  sectionTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY_DARK,
    textAlign: "right",
  },

  sectionCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  item: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  itemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: TEXT,
    textAlign: "right",
  },
  itemSubtitle: {
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 14,
  },

  logoutButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    backgroundColor: RED_LIGHT,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1.5,
    borderColor: "#FFCDD2",
  },
  logoutText: {
    color: RED,
    fontWeight: "700",
    fontSize: 15,
  },

  versionContainer: {
    alignItems: "center",
    marginTop: 20,
    gap: 4,
  },
  appName: {
    fontSize: 14,
    fontWeight: "700",
    color: PRIMARY_DARK,
  },
  versionText: {
    color: MUTED,
    fontSize: 11,
  },
});

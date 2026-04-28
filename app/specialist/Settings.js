import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

// ─── الثيم السماوي ───
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

  // ─── تسجيل الخروج ───
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

  // ─── مكون الإعداد ───
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
    isLast = false,
  }) => (
    <TouchableOpacity
      style={[styles.item, !isLast && styles.itemBorder]}
      onPress={onPress}
      disabled={isSwitch || !onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.itemIconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>

      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle} numberOfLines={1}>
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
        <Ionicons name="chevron-back" size={18} color={MUTED} />
      )}
    </TouchableOpacity>
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
      <StatusBar barStyle="dark-content" backgroundColor={CARD} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* ─── HEADER بسيط ورسمي ─── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-forward" size={22} color={TEXT} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>الإعدادات</Text>

          <View style={{ width: 38 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ─── بطاقة الملف الشخصي ─── */}
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={28} color={PRIMARY_DARK} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {user?.name || "أخصائي"}
              </Text>
              <Text style={styles.profileEmail} numberOfLines={1}>
                {user?.email || "—"}
              </Text>
            </View>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>
                {user?.role === "specialist" ? "أخصائي" : "مستخدم"}
              </Text>
            </View>
          </View>

          {/* ═══ قسم: الحساب ═══ */}
          <Text style={styles.sectionTitle}>الحساب</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="person-outline"
              title="تعديل الملف الشخصي"
              subtitle="الاسم والصورة والبريد"
              onPress={() => router.push("./EditProfile")}
            />
            <SettingItem
              icon="lock-closed-outline"
              title="تغيير كلمة المرور"
              subtitle="حماية حسابك"
              onPress={() => router.push("./ChangePassword")}
              isLast={true}
            />
          </View>

          {/* ═══ قسم: الإشعارات ═══ */}
          <Text style={styles.sectionTitle}>الإشعارات</Text>
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
            <SettingItem
              icon="document-text-outline"
              iconColor={AMBER}
              iconBg="#FFF6E8"
              title="تنبيهات التقارير"
              subtitle="عند توفر تقرير جديد"
              isSwitch={true}
              switchValue={reportAlerts}
              onSwitchChange={setReportAlerts}
              isLast={true}
            />
          </View>

          {/* ═══ قسم: الخصوصية والأمان ═══ */}
          <Text style={styles.sectionTitle}>الخصوصية والأمان</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="shield-outline"
              iconColor={GREEN}
              iconBg="#E8F5E9"
              title="سياسة الخصوصية"
              onPress={() => router.push("./Privacy")}
            />
            <SettingItem
              icon="document-outline"
              iconColor={GREEN}
              iconBg="#E8F5E9"
              title="الشروط والأحكام"
              onPress={() => router.push("./Terms")}
              isLast={true}
            />
          </View>

          {/* ═══ قسم: الدعم والمساعدة ═══ */}
          <Text style={styles.sectionTitle}>الدعم والمساعدة</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="chatbubbles-outline"
              title="تواصل معنا"
              subtitle="نسعد بمساعدتك"
              onPress={() => router.push("./Contact")}
            />
            <SettingItem
              icon="help-circle-outline"
              title="الأسئلة الشائعة"
              onPress={() => router.push("./FAQ")}
            />
            <SettingItem
              icon="information-circle-outline"
              title="عن تطبيق نماء"
              subtitle="الإصدار 1.0.0"
              onPress={() => router.push("./About")}
              isLast={true}
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
            <Text style={styles.appName}>تطبيق نماء</Text>
            <Text style={styles.versionText}>الإصدار 1.0.0 © 2026</Text>
          </View>

          {/* مساحة للـ Navbar */}
          <View style={{ height: 110 }} />
        </ScrollView>

        {/* ─── BOTTOM NAVBAR ─── */}
        <BottomNavBar />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  centerLoading: { justifyContent: "center", alignItems: "center" },

  // ─── Header طبيعي ورسمي ───
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // ─── Profile Card ───
  profileCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: CARD,
    padding: 14,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  profileAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT,
    textAlign: "right",
  },
  profileEmail: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
    textAlign: "right",
  },
  profileBadge: {
    backgroundColor: PRIMARY_LIGHT,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  profileBadgeText: {
    fontSize: 11,
    color: PRIMARY_DARK,
    fontWeight: "700",
  },

  // ─── Section ───
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: MUTED,
    marginTop: 22,
    marginBottom: 10,
    paddingHorizontal: 4,
    textAlign: "right",
  },
  sectionCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },

  // ─── Item ───
  item: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  itemIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
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

  // ─── Logout ───
  logoutButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    backgroundColor: RED_LIGHT,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  logoutText: {
    color: RED,
    fontWeight: "700",
    fontSize: 14,
  },

  // ─── Version ───
  versionContainer: {
    alignItems: "center",
    marginTop: 18,
    gap: 3,
  },
  appName: {
    fontSize: 13,
    fontWeight: "700",
    color: PRIMARY_DARK,
  },
  versionText: {
    color: MUTED,
    fontSize: 11,
  },
});

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
import {
  getCurrentUser,
  getNotificationPreferences,
  updateNotificationPreference,
} from "../../Services/UserService";
import { getChildrenByParentEmail } from "../../Services/ChildrenService";
import BottomNavBar from "../../components/BottomNavBar";
import { COLORS } from "../../constants/theme";

const PRIMARY = COLORS.PRIMARY;
const PRIMARY_DARK = COLORS.PRIMARY_DARK;
const PRIMARY_LIGHT = COLORS.PRIMARY_LIGHT;
const BG = COLORS.BG;
const CARD = COLORS.CARD_BG;
const TEXT = COLORS.TEXT;
const MUTED = COLORS.MUTED;
const RED = COLORS.DANGER;
const RED_LIGHT = "#FFEBEE";
const GREEN = COLORS.SUCCESS;
const AMBER = COLORS.WARNING;

export default function ParentSettings() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [reportAlerts, setReportAlerts] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, childrenData, prefs] = await Promise.all([
        getCurrentUser(),
        getChildrenByParentEmail(),
        getNotificationPreferences(),
      ]);
      setUser(userData);
      setChildren(childrenData);
      if (prefs) {
        setPushNotifications(prefs.pushNotifications ?? true);
        setEmailNotifications(prefs.emailNotifications ?? true);
        setReportAlerts(prefs.reportAlerts ?? true);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل أنتي متأكدة من تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تسجيل الخروج",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/auth/Login");
          } catch (error) {
            Alert.alert("خطأ", "لم نتمكن من تسجيل الخروج");
          }
        },
      },
    ]);
  };

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
    rightBadge = null,
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
      ) : rightBadge !== null ? (
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{rightBadge}</Text>
        </View>
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

  const previewChildren = children.slice(0, 3);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={CARD} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* ─── HEADER ─── */}
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
          {/* ─── PROFILE CARD ─── */}
          <View style={styles.profileCard}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={28} color={PRIMARY_DARK} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {user?.name || "الوالد"}
              </Text>
              <Text style={styles.profileEmail} numberOfLines={1}>
                {user?.email || "—"}
              </Text>
            </View>
            <View style={styles.profileBadge}>
              <Text style={styles.profileBadgeText}>ولي أمر</Text>
            </View>
          </View>

          {/* ═══ ACCOUNT ═══ */}
          <Text style={styles.sectionTitle}>حسابي</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="person-outline"
              title="تعديل الملف الشخصي"
              subtitle="الاسم والصورة والبريد"
              onPress={() => router.push("/settings/EditProfile")}
            />
            <SettingItem
              icon="lock-closed-outline"
              title="تغيير كلمة المرور"
              subtitle="حماية حسابك"
              onPress={() => router.push("/settings/ChangePassword")}
              isLast={true}
            />
          </View>

          {/* ═══ CHILDREN ═══ */}
          <Text style={styles.sectionTitle}>أطفالي</Text>
          {children.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconBox}>
                <Ionicons
                  name="people-outline"
                  size={28}
                  color={PRIMARY_DARK}
                />
              </View>
              <Text style={styles.emptyTitle}>
                لا يوجد أطفال مرتبطين بحسابك
              </Text>
              <Text style={styles.emptySubtitle}>
                تواصلي مع الأخصائي لإضافة طفلك
              </Text>
            </View>
          ) : (
            <View style={styles.sectionCard}>
              <SettingItem
                icon="people-outline"
                title="أطفالي"
                subtitle="عرض وإدارة أطفالي"
                onPress={() => router.push("/parent/homepageP")}
                rightBadge={children.length}
                isLast={true}
              />
              <View style={styles.childrenPreview}>
                {previewChildren.map((child) => (
                  <View key={child.id} style={styles.childPreviewRow}>
                    <View style={styles.childDot} />
                    <Text style={styles.childPreviewText} numberOfLines={1}>
                      {child.name} - {child.age || 0}{" "}
                      {child.age === 1 ? "سنة" : "سنوات"}
                    </Text>
                  </View>
                ))}
                {children.length > 3 && (
                  <Text style={styles.moreChildrenText}>
                    + {children.length - 3} المزيد
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* ═══ NOTIFICATIONS ═══ */}
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
              onSwitchChange={async (value) => {
                setPushNotifications(value);
                try {
                  await updateNotificationPreference(
                    "pushNotifications",
                    value
                  );
                } catch (error) {
                  setPushNotifications(!value);
                  Alert.alert("خطأ", "لم نتمكن من حفظ التفضيلات");
                }
              }}
            />
            <SettingItem
              icon="mail-outline"
              iconColor={AMBER}
              iconBg="#FFF6E8"
              title="إشعارات البريد"
              subtitle="إرسال تنبيهات للبريد"
              isSwitch={true}
              switchValue={emailNotifications}
              onSwitchChange={async (value) => {
                setEmailNotifications(value);
                try {
                  await updateNotificationPreference(
                    "emailNotifications",
                    value
                  );
                } catch (error) {
                  setEmailNotifications(!value);
                  Alert.alert("خطأ", "لم نتمكن من حفظ التفضيلات");
                }
              }}
            />
            <SettingItem
              icon="document-text-outline"
              iconColor={AMBER}
              iconBg="#FFF6E8"
              title="تنبيهات تقارير طفلي"
              subtitle="عند توفر تقرير جديد"
              isSwitch={true}
              switchValue={reportAlerts}
              onSwitchChange={async (value) => {
                setReportAlerts(value);
                try {
                  await updateNotificationPreference("reportAlerts", value);
                } catch (error) {
                  setReportAlerts(!value);
                  Alert.alert("خطأ", "لم نتمكن من حفظ التفضيلات");
                }
              }}
              isLast={true}
            />
          </View>

          {/* ═══ SUPPORT ═══ */}
          <Text style={styles.sectionTitle}>الدعم</Text>
          <View style={styles.sectionCard}>
            <SettingItem
              icon="chatbubbles-outline"
              title="تواصل معنا"
              subtitle="نسعد بمساعدتك"
              onPress={() => router.push("/settings/Contact")}
            />
            <SettingItem
              icon="help-circle-outline"
              title="الأسئلة الشائعة"
              onPress={() => router.push("/settings/FAQ")}
            />
            <SettingItem
              icon="information-circle-outline"
              title="عن تطبيق نماء"
              subtitle="الإصدار 1.0.0"
              onPress={() => router.push("/settings/About")}
              isLast={true}
            />
          </View>

          {/* ═══ LOGOUT ═══ */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color={RED} />
            <Text style={styles.logoutText}>تسجيل الخروج</Text>
          </TouchableOpacity>

          {/* ═══ VERSION ═══ */}
          <View style={styles.versionContainer}>
            <Text style={styles.appName}>تطبيق نماء</Text>
            <Text style={styles.versionText}>الإصدار 1.0.0 © 2026</Text>
          </View>

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

  // Header
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

  // Profile Card
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
  profileInfo: { flex: 1 },
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

  // Section
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

  // Item
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
  itemTextContainer: { flex: 1 },
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

  // Count badge (for children count)
  countBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  countBadgeText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 12,
  },

  // Children preview list
  childrenPreview: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
    backgroundColor: "#FAFCFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  childPreviewRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 6,
    gap: 8,
  },
  childDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY,
  },
  childPreviewText: {
    flex: 1,
    fontSize: 13,
    color: TEXT,
    textAlign: "right",
  },
  moreChildrenText: {
    fontSize: 11,
    color: PRIMARY_DARK,
    fontWeight: "700",
    marginTop: 4,
    textAlign: "right",
  },

  // Empty state for children
  emptyCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12,
    color: MUTED,
    textAlign: "center",
    marginTop: 4,
  },

  // Logout
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

  // Version
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

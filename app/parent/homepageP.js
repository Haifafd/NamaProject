import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getChildrenByParentEmail } from "../../Services/ChildrenService";
import { getCurrentUser } from "../../Services/UserService";
import BottomNavBar from "../../components/BottomNavBar";
import { COLORS } from "../../constants/theme";

const PRIMARY = COLORS.PRIMARY;
const PRIMARY_DARK = COLORS.PRIMARY_DARK;
const PRIMARY_LIGHT = COLORS.PRIMARY_LIGHT;
const BG = COLORS.BG;
const CARD = COLORS.CARD_BG;
const TEXT = COLORS.TEXT;
const MUTED = COLORS.MUTED;
const GREEN = COLORS.SUCCESS;
const GREEN_LIGHT = COLORS.SUCCESS_BG;
const AMBER = COLORS.WARNING;
const AMBER_LIGHT = COLORS.WARNING_BG;
const RED = COLORS.DANGER;

function getProgressColor(progress) {
  if (progress === null || progress === undefined) return MUTED;
  if (progress >= 70) return GREEN;
  if (progress >= 50) return PRIMARY_DARK;
  return AMBER;
}

function getProgressLightColor(progress) {
  if (progress === null || progress === undefined) return BG;
  if (progress >= 70) return GREEN_LIGHT;
  if (progress >= 50) return PRIMARY_LIGHT;
  return AMBER_LIGHT;
}

function getGenderIcon(gender) {
  const g = (gender || "").toString().toLowerCase();
  if (g === "male" || g === "ذكر" || g === "ولد") {
    return { name: "face-man", color: "#0288D1" };
  }
  if (g === "female" || g === "أنثى" || g === "انثى" || g === "بنت") {
    return { name: "face-woman", color: "#E91E63" };
  }
  return { name: "baby-face-outline", color: MUTED };
}

export default function HomepageP() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [userData, childrenData] = await Promise.all([
        getCurrentUser(),
        getChildrenByParentEmail(),
      ]);
      setUser(userData);
      setChildren(childrenData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleChildPress = (child) => {
    router.push({
      pathname: "/parent/ChildReport",
      params: { childId: child.id, childName: child.name },
    });
  };

  const handleActivities = () => router.push("/parent/Activities");
  const handleAssessment = () => router.push("/parent/ParentAssessmentForm");
  const handleChat = () => router.push("/parent/Chat");

  if (loading) {
    return (
      <View style={[styles.screen, styles.centerLoading]}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PRIMARY]}
              tintColor={PRIMARY}
            />
          }
        >
          {/* ─── HEADER ─── */}
          <View style={styles.headerGradient}>
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.notificationBubble}>
                <Ionicons name="notifications" size={20} color="#fff" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>

              <View style={styles.headerCenter}>
                <Text style={styles.welcomeText}>مرحباً بعودتك</Text>
                <Text style={styles.greeting}>{user?.name || "الوالد"}</Text>
              </View>

              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color={PRIMARY_DARK} />
              </View>
            </View>
          </View>

          {/* ─── WELCOME CARD ─── */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeIconBox}>
              <Ionicons name="heart" size={22} color={PRIMARY_DARK} />
            </View>
            <View style={styles.welcomeTextBox}>
              <Text style={styles.welcomeTitle}>تابعي رحلة طفلك</Text>
              <Text style={styles.welcomeSub}>
                اكتشفي تطوره يوماً بعد يوم
              </Text>
            </View>
          </View>

          {/* ─── CHILDREN SECTION HEADER ─── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              أطفالي{" "}
              {children.length > 0 ? `(${children.length})` : ""}
            </Text>
          </View>

          {/* ─── CHILDREN GRID / EMPTY ─── */}
          {children.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <MaterialCommunityIcons
                  name="baby-face-outline"
                  size={42}
                  color={PRIMARY_DARK}
                />
              </View>
              <Text style={styles.emptyTitle}>
                لا يوجد أطفال مرتبطين بحسابك
              </Text>
              <Text style={styles.emptySubtitle}>
                تواصلي مع الأخصائي لإضافة طفلك ومتابعة تطوره من هنا.
              </Text>
            </View>
          ) : (
            <View style={styles.childrenGrid}>
              {children.map((child) => {
                const color = getProgressColor(child.progress);
                const lightColor = getProgressLightColor(child.progress);
                const hasProgress =
                  child.progress !== null && child.progress !== undefined;
                const genderIcon = getGenderIcon(child.gender);

                return (
                  <TouchableOpacity
                    key={child.id}
                    style={styles.childCard}
                    onPress={() => handleChildPress(child)}
                    activeOpacity={0.7}
                  >
                    {hasProgress ? (
                      <View
                        style={[
                          styles.progressBadge,
                          { backgroundColor: lightColor },
                        ]}
                      >
                        <Text
                          style={[styles.progressBadgeText, { color: color }]}
                        >
                          {child.progress}%
                        </Text>
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.progressBadge,
                          { backgroundColor: PRIMARY_LIGHT },
                        ]}
                      >
                        <Text
                          style={[
                            styles.progressBadgeText,
                            { color: PRIMARY_DARK },
                          ]}
                        >
                          جديد
                        </Text>
                      </View>
                    )}

                    <View style={styles.childAvatar}>
                      <MaterialCommunityIcons
                        name={genderIcon.name}
                        size={28}
                        color={genderIcon.color}
                      />
                    </View>

                    <Text style={styles.childName} numberOfLines={1}>
                      {child.name}
                    </Text>

                    <Text style={styles.childAge}>
                      العمر: {child.age} {child.age === 1 ? "سنة" : "سنوات"}
                    </Text>

                    {hasProgress ? (
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${child.progress}%`,
                              backgroundColor: color,
                            },
                          ]}
                        />
                      </View>
                    ) : (
                      <Text style={styles.noReportHint}>
                        لا يوجد تقرير بعد
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* ─── QUICK ACTIONS SECTION ─── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>إجراءات سريعة</Text>
          </View>

          <View style={styles.actionsCard}>
            <TouchableOpacity
              style={[styles.actionItem, styles.actionItemBorder]}
              onPress={handleActivities}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: PRIMARY_LIGHT },
                ]}
              >
                <MaterialCommunityIcons
                  name="gamepad-variant"
                  size={20}
                  color={PRIMARY_DARK}
                />
              </View>
              <View style={styles.actionTextBox}>
                <Text style={styles.actionTitle}>ابدئي الأنشطة</Text>
                <Text style={styles.actionSub}>ألعاب تنموية لطفلك</Text>
              </View>
              <Ionicons name="chevron-back" size={18} color={MUTED} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionItem, styles.actionItemBorder]}
              onPress={handleAssessment}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: AMBER_LIGHT },
                ]}
              >
                <Ionicons
                  name="clipboard-outline"
                  size={20}
                  color={AMBER}
                />
              </View>
              <View style={styles.actionTextBox}>
                <Text style={styles.actionTitle}>استمارة التقييم</Text>
                <Text style={styles.actionSub}>أجيبي عن أسئلة المتابعة</Text>
              </View>
              <Ionicons name="chevron-back" size={18} color={MUTED} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleChat}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconBox,
                  { backgroundColor: GREEN_LIGHT },
                ]}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color={GREEN}
                />
              </View>
              <View style={styles.actionTextBox}>
                <Text style={styles.actionTitle}>تواصلي مع الأخصائي</Text>
                <Text style={styles.actionSub}>محادثة مباشرة</Text>
              </View>
              <Ionicons name="chevron-back" size={18} color={MUTED} />
            </TouchableOpacity>
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
  screen: { flex: 1, backgroundColor: BG },
  centerLoading: { justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: MUTED, fontSize: 13 },

  // Header
  headerGradient: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 50,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notificationBubble: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED,
    borderWidth: 2,
    borderColor: PRIMARY,
  },
  headerCenter: { alignItems: "center" },
  welcomeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.95)",
    marginBottom: 2,
  },
  greeting: { fontSize: 20, fontWeight: "700", color: "#fff" },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  // Welcome Card
  welcomeCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: CARD,
    marginHorizontal: 20,
    marginTop: -25,
    padding: 16,
    borderRadius: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  welcomeIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeTextBox: { flex: 1 },
  welcomeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT,
    textAlign: "right",
  },
  welcomeSub: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
    textAlign: "right",
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    textAlign: "right",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 30,
    gap: 8,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    marginTop: 4,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12,
    color: MUTED,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
  },

  // Children Grid
  childrenGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
  },
  childCard: {
    width: "48%",
    backgroundColor: CARD,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    alignItems: "center",
    position: "relative",
    shadowColor: PRIMARY_DARK,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  progressBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  progressBadgeText: { fontSize: 11, fontWeight: "800" },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  childName: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT,
    textAlign: "center",
  },
  childAge: {
    fontSize: 10,
    color: MUTED,
    marginTop: 2,
    textAlign: "center",
  },
  progressBarContainer: {
    backgroundColor: BG,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 2 },
  noReportHint: {
    fontSize: 10,
    color: MUTED,
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },

  // Quick Actions Card
  actionsCard: {
    backgroundColor: CARD,
    marginHorizontal: 20,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  actionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextBox: { flex: 1 },
  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
    textAlign: "right",
  },
  actionSub: {
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
    textAlign: "right",
  },
});

import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { getCurrentUser } from "../../Services/UserService";
import {
  getMyChildrenWithProgress,
  calculateAverageProgress,
  getChildrenNeedingReview,
} from "../../Services/ChildrenService";

// ─── ثيم سماوي مبهج ───
const PRIMARY = "#79ccf8";
const PRIMARY_DARK = "#0288D1";
const PRIMARY_LIGHT = "#E1F5FE";
const BG = "#F0F4F8";
const CARD = "#FFFFFF";
const BORDER = "#E0E0E0";
const TEXT = "#1A1A1A";
const MUTED = "#757575";
const GREEN = "#4CAF50";
const GREEN_LIGHT = "#E8F5E9";
const AMBER = "#F5A623";
const AMBER_LIGHT = "#FFF6E8";
const RED = "#FF4D4F";

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

export default function HomepageS() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    try {
      const [userData, childrenData] = await Promise.all([
        getCurrentUser(),
        getMyChildrenWithProgress(),
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

  const filteredChildren = children.filter((child) =>
    child.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const averageProgress = calculateAverageProgress(children);
  const childrenNeedingReview = getChildrenNeedingReview(children);

  const childrenWithReports = children.filter(
    (c) => c.progress !== null && c.progress !== undefined
  );

  const handleChildPress = (child) => {
    router.push({
      pathname: "/specialist/Dashboard",
      params: {
        childId: child.id,
        childName: child.name,
      },
    });
  };

  const handleAddChild = () => {
    router.push("/specialist/AddChild");
  };

  // ── Navigation للصفحات الفاضية ──
  const handleChatsPress = () => {
    router.push("/specialist/Chats");
  };

  const handleSettingsPress = () => {
    router.push("/specialist/Settings");
  };

  const handleHomePress = () => {
    // إنتي بالفعل في الهوم
  };

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
                <Text style={styles.greeting}>{user?.name || "أخصائي"}</Text>
              </View>

              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color={PRIMARY_DARK} />
              </View>
            </View>
          </View>

          {/* ─── SEARCH ─── */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color={MUTED} />
              <TextInput
                placeholder="ابحث عن طفل..."
                placeholderTextColor="#aaa"
                style={styles.searchInput}
                textAlign="right"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* ─── STATS ─── */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderRightColor: PRIMARY }]}>
              <View style={[styles.statIcon, { backgroundColor: PRIMARY_LIGHT }]}>
                <Ionicons name="people" size={18} color={PRIMARY_DARK} />
              </View>

              {children.length === 0 ? (
                <>
                  <Text style={[styles.statEmptyText, { color: PRIMARY_DARK }]}>
                    لا يوجد
                  </Text>
                  <Text style={styles.statLabel}>أطفال مسجلين</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.statNumber, { color: PRIMARY_DARK }]}>
                    {children.length}
                  </Text>
                  <Text style={styles.statLabel}>عدد الأطفال</Text>
                </>
              )}
            </View>

            <View style={[styles.statCard, { borderRightColor: GREEN }]}>
              <View style={[styles.statIcon, { backgroundColor: GREEN_LIGHT }]}>
                <Ionicons name="trending-up" size={18} color={GREEN} />
              </View>

              {averageProgress !== null ? (
                <>
                  <Text style={[styles.statNumber, { color: GREEN }]}>
                    {averageProgress}
                    <Text style={{ fontSize: 16 }}>%</Text>
                  </Text>
                  <Text style={styles.statLabel}>متوسط التحسن</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.statEmptyText, { color: GREEN }]}>
                    لا توجد
                  </Text>
                  <Text style={styles.statLabel}>تقارير بعد</Text>
                </>
              )}
            </View>
          </View>

          {/* ─── معلومات لو ما فيه تقارير ─── */}
          {children.length > 0 && childrenWithReports.length === 0 && (
            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={18} color={PRIMARY_DARK} />
              <Text style={styles.infoText}>
                لم يتم إنشاء تقارير تطور بعد. ستظهر النتائج هنا بعد إكمال الأطفال للأنشطة.
              </Text>
            </View>
          )}

          {/* ─── REVIEW CARD ─── */}
          {childrenNeedingReview.length > 0 && (
            <TouchableOpacity style={styles.reviewCard} activeOpacity={0.7}>
              <View style={styles.reviewIconBox}>
                <Ionicons name="warning" size={20} color="#fff" />
              </View>
              <View style={styles.reviewContent}>
                <Text style={styles.reviewTitle}>
                  {childrenNeedingReview.length === 1
                    ? "حالة تحتاج مراجعة"
                    : `${childrenNeedingReview.length} حالات تحتاج مراجعة`}
                </Text>
                <Text style={styles.reviewSub} numberOfLines={1}>
                  {childrenNeedingReview.map((c) => c.name).join("، ")}
                </Text>
              </View>
              <Ionicons name="chevron-back" size={18} color="#8B4513" />
            </TouchableOpacity>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* ─── SECTION HEADER (العربي: عنوان يمين، زر يسار) ─── */}
          {/* ═══════════════════════════════════════════ */}
          <View style={styles.sectionHeader}>
            {/* العنوان على اليمين */}
            <Text style={styles.sectionTitle}>
              الأطفال {children.length > 0 ? `(${filteredChildren.length})` : ""}
            </Text>

            {/* زر الإضافة على اليسار */}
            <TouchableOpacity style={styles.addBtn} onPress={handleAddChild}>
              <Ionicons name="add" size={14} color="#fff" />
              <Text style={styles.addText}>إضافة طفل</Text>
            </TouchableOpacity>
          </View>

          {/* ─── CHILDREN GRID / EMPTY ─── */}
          {children.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="people-outline" size={42} color={PRIMARY_DARK} />
              </View>
              <Text style={styles.emptyTitle}>لم يتم إضافة أطفال بعد</Text>
              <Text style={styles.emptySubtitle}>
                ابدئي بإضافة أول طفل في حسابك لتصميم خطته العلاجية ومتابعة تطوره.
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={handleAddChild}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text style={styles.emptyActionText}>إضافة أول طفل</Text>
              </TouchableOpacity>
            </View>
          ) : filteredChildren.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="search" size={42} color={MUTED} />
              </View>
              <Text style={styles.emptyTitle}>لم يتم العثور على نتائج</Text>
              <Text style={styles.emptySubtitle}>
                لا يوجد طفل بهذا الاسم. جربي البحث باسم آخر.
              </Text>
            </View>
          ) : (
            <View style={styles.childrenGrid}>
              {filteredChildren.map((child) => {
                const color = getProgressColor(child.progress);
                const lightColor = getProgressLightColor(child.progress);
                const hasProgress =
                  child.progress !== null && child.progress !== undefined;

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
                        <Text style={[styles.progressBadgeText, { color: color }]}>
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
                          style={[styles.progressBadgeText, { color: PRIMARY_DARK }]}
                        >
                          جديد
                        </Text>
                      </View>
                    )}

                    <View style={styles.childAvatar}>
                      <Ionicons name="person" size={24} color={PRIMARY_DARK} />
                    </View>

                    <Text style={styles.childName} numberOfLines={1}>
                      {child.name}
                    </Text>

                    <Text style={styles.childAge}>
                      العمر: {child.age} {child.age === 1 ? "سنة" : "سنوات"}
                    </Text>

                    <View style={styles.difficultyBox}>
                      <Text style={styles.difficultyText} numberOfLines={1}>
                        {child.difficulty || "لم يتم التحديد"}
                      </Text>
                    </View>

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
                      <Text style={styles.noReportHint}>لا يوجد تقرير بعد</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* ═══════════════════════════════════════════════ */}
        {/* ─── BOTTOM NAV - زر الهوم بالنص يبرز فوق ─── */}
        {/* ═══════════════════════════════════════════════ */}
        <View style={styles.navbarWrapper}>
          {/* الـ Navbar الأبيض */}
          <View style={styles.navbar}>
            {/* المحادثات - يمين */}
            <TouchableOpacity
              style={styles.navItem}
              activeOpacity={0.7}
              onPress={handleChatsPress}
            >
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#999" />
              <Text style={styles.navText}>المحادثات</Text>
            </TouchableOpacity>

            {/* مساحة فارغة في النص للزر */}
            <View style={styles.navCenterSpace} />

            {/* الإعدادات - يسار */}
            <TouchableOpacity
              style={styles.navItem}
              activeOpacity={0.7}
              onPress={handleSettingsPress}
            >
              <Ionicons name="settings-outline" size={24} color="#999" />
              <Text style={styles.navText}>الإعدادات</Text>
            </TouchableOpacity>
          </View>

          {/* الزر الدائري المرتفع - في النص */}
          <TouchableOpacity
            style={styles.floatingHomeBtn}
            activeOpacity={0.85}
            onPress={handleHomePress}
          >
            <Ionicons name="home" size={28} color="#fff" />
          </TouchableOpacity>

          {/* نص "الرئيسية" تحت الزر */}
          <Text style={styles.floatingHomeText}>الرئيسية</Text>
        </View>
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

  // Search
  searchContainer: { paddingHorizontal: 20, marginTop: -25 },
  searchBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: CARD,
    padding: 14,
    borderRadius: 16,
    gap: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  searchInput: { flex: 1, fontSize: 13, color: TEXT, padding: 0 },

  // Stats
  statsRow: {
    flexDirection: "row-reverse",
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD,
    padding: 14,
    borderRadius: 16,
    borderRightWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statNumber: { fontSize: 26, fontWeight: "800", lineHeight: 30 },
  statEmptyText: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  statLabel: {
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
    textAlign: "right",
  },

  // Info Card
  infoCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: PRIMARY_LIGHT,
    marginHorizontal: 20,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#B3E5FC",
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    color: PRIMARY_DARK,
    textAlign: "right",
    lineHeight: 18,
  },

  // Review Card
  reviewCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: AMBER_LIGHT,
    marginHorizontal: 20,
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFE2B5",
    gap: 12,
  },
  reviewIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: AMBER,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewContent: { flex: 1 },
  reviewTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8B4513",
    textAlign: "right",
  },
  reviewSub: {
    fontSize: 11,
    color: "#A0826D",
    marginTop: 2,
    textAlign: "right",
  },

  // ═══════════════════════════════════════════
  // Section Header (العربي - عنوان يمين، زر يسار)
  // ═══════════════════════════════════════════
  sectionHeader: {
    flexDirection: "row",
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
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    gap: 4,
  },
  addText: { color: "#fff", fontWeight: "700", fontSize: 11 },

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
  emptyActionBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
    marginTop: 12,
  },
  emptyActionText: { color: "#fff", fontWeight: "700", fontSize: 13 },

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
  difficultyBox: {
    backgroundColor: BG,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 8,
    width: "100%",
  },
  difficultyText: { fontSize: 10, color: MUTED, textAlign: "center" },
  progressBarContainer: {
    backgroundColor: BG,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
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

  // ═══════════════════════════════════════════
  // Navbar - زر الهوم بالنص يبرز فوق
  // ═══════════════════════════════════════════
  navbarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  navbar: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: CARD,
    paddingTop: 14,
    paddingBottom: 18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
    elevation: 15,
    alignItems: "center",
    justifyContent: "space-around",
  },
  navItem: {
    alignItems: "center",
    gap: 5,
    flex: 1,
    paddingVertical: 4,
  },
  navCenterSpace: {
    width: 80,
  },
  navText: {
    fontSize: 10,
    color: "#999",
    fontWeight: "600",
  },
  // الزر الدائري المرتفع - في النص بالضبط
  floatingHomeBtn: {
    position: "absolute",
    bottom: 35,
    left: "50%",
    marginLeft: -32,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "#fff",
    shadowColor: PRIMARY_DARK,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 20,
    zIndex: 10,
  },
  floatingHomeText: {
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: PRIMARY_DARK,
    fontWeight: "700",
    zIndex: 11,
  },
});
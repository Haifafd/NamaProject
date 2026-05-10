import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  calculateAverageProgress,
  getChildrenNeedingReview,
  getMyChildrenWithProgress,
} from "../../Services/ChildrenService";
import { getCurrentUser } from "../../Services/UserService";
import { subscribeToUnreadCount } from "../../Services/NotificationService";
import { countChildrenWithReports } from "../../Services/ActivityService";
import BottomNavBar from "../../components/BottomNavBar";

// ─── 🎨 استيراد الثيم الموحد من constants/theme.js ───
import { COLORS } from "../../constants/theme";

// ربط الأسماء المحلية بالثيم الموحد (backward compatible)
const PRIMARY = COLORS.PRIMARY;
const PRIMARY_DARK = COLORS.PRIMARY_DARK;
const PRIMARY_LIGHT = COLORS.PRIMARY_LIGHT;
const BG = COLORS.BG;
const CARD = COLORS.CARD_BG;
const BORDER = COLORS.BORDER_GRAY;
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
    return { name: "face-man", color: PRIMARY_DARK, bg: PRIMARY_LIGHT };
  }
  if (g === "female" || g === "أنثى" || g === "انثى" || g === "بنت") {
    return { name: "face-woman", color: "#E91E63", bg: "#FCE4EC" };
  }
  return { name: "baby-face-outline", color: MUTED, bg: BG };
}

export default function HomepageS() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportsCount, setReportsCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToUnreadCount(setUnreadCount);
    return () => unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      const [userData, childrenData] = await Promise.all([
        getCurrentUser(),
        getMyChildrenWithProgress(),
      ]);

      setUser(userData);
      setChildren(childrenData);

      // عدد الأطفال الذين لديهم تقرير (لعبوا على الأقل نشاط واحد)
      if (childrenData && childrenData.length > 0) {
        const childIds = childrenData.map((c) => c.id);
        const count = await countChildrenWithReports(childIds);
        setReportsCount(count);
      } else {
        setReportsCount(0);
      }
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

  // تحديث البيانات تلقائياً لما الأخصائية ترجع للصفحة
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const trimmedQuery = searchQuery.trim();
  const filteredChildren = trimmedQuery
    ? children.filter((child) => {
        const name = (child.name || "").trim().toLowerCase();
        const q = trimmedQuery.toLowerCase();
        return name.includes(q);
      })
    : children;

  // نتائج الـ dropdown (أول 5 نقط)
  const searchResults = trimmedQuery ? filteredChildren.slice(0, 5) : [];

  const averageProgress = calculateAverageProgress(children);
  const childrenNeedingReview = getChildrenNeedingReview(children);

  const childrenWithReports = children.filter(
    (c) => c.progress !== null && c.progress !== undefined,
  );

  const handleChildPress = (child) => {
    setSearchQuery("");
    router.push({
      pathname: "/specialist/Dashboard",
      params: {
        childId: child.id,
        childName: child.name,
      },
    });
  };

  const handleAddChild = () => {
    router.push("./AddChild");
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
              <TouchableOpacity
                style={styles.notificationBubble}
                onPress={() => router.push("/notifications")}
              >
                <Ionicons name="notifications" size={20} color="#fff" />
                {unreadCount > 0 && <View style={styles.notificationDot} />}
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
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={18} color={MUTED} />
                </TouchableOpacity>
              )}
            </View>

            {trimmedQuery.length > 0 && searchResults.length > 0 && (
              <View style={styles.searchDropdown}>
                {searchResults.map((child, idx) => (
                  <TouchableOpacity
                    key={child.id}
                    style={[
                      styles.searchResultItem,
                      idx !== searchResults.length - 1 && styles.searchResultBorder,
                    ]}
                    onPress={() => handleChildPress(child)}
                    activeOpacity={0.6}
                  >
                    <View
                      style={[
                        styles.searchResultAvatar,
                        { backgroundColor: getGenderIcon(child.gender).bg },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={getGenderIcon(child.gender).name}
                        size={20}
                        color={getGenderIcon(child.gender).color}
                      />
                    </View>
                    <View style={styles.searchResultInfo}>
                      <Text style={styles.searchResultName} numberOfLines={1}>
                        {child.name}
                      </Text>
                      <Text style={styles.searchResultMeta} numberOfLines={1}>
                        {child.age} {child.age === 1 ? "سنة" : "سنوات"}
                      </Text>
                    </View>
                    <Ionicons name="chevron-back" size={16} color={MUTED} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {trimmedQuery.length > 0 && searchResults.length === 0 && (
              <View style={styles.searchDropdown}>
                <View style={styles.searchEmpty}>
                  <Ionicons name="alert-circle-outline" size={18} color={MUTED} />
                  <Text style={styles.searchEmptyText}>
                    لا يوجد طفل بهذا الاسم
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* ─── STATS ─── */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { borderRightColor: PRIMARY }]}>
              <View
                style={[styles.statIcon, { backgroundColor: PRIMARY_LIGHT }]}
              >
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
                <Ionicons name="document-text" size={18} color={GREEN} />
              </View>

              {reportsCount > 0 ? (
                <>
                  <Text style={[styles.statNumber, { color: GREEN }]}>
                    {reportsCount}
                  </Text>
                  <Text style={styles.statLabel}>عدد التقارير</Text>
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

          {/* ─── بانر الإحصائيات الذكي ─── */}
          {children.length > 0 && (() => {
            const total = children.length;
            const withReports = childrenWithReports.length;
            const withoutReports = total - withReports;

            // الحالة 1: كل الأطفال عندهم تقارير → بانر إيجابي
            if (withReports === total && averageProgress !== null) {
              const topChild = [...childrenWithReports].sort(
                (a, b) => (b.progress || 0) - (a.progress || 0)
              )[0];

              return (
                <View style={[styles.infoCard, styles.infoCardSuccess]}>
                  <Ionicons name="trending-up" size={18} color={GREEN} />
                  <Text style={styles.infoText}>
                    ممتاز! متوسط أداء أطفالك{" "}
                    <Text style={{ fontWeight: "800", color: GREEN }}>
                      {averageProgress}%
                    </Text>
                    {topChild ? (
                      <>
                        {" "}— أعلى نسبة:{" "}
                        <Text style={{ fontWeight: "800", color: GREEN }}>
                          {topChild.name} {topChild.progress}%
                        </Text>
                      </>
                    ) : null}
                  </Text>
                </View>
              );
            }

            // الحالة 2: بعضهم بدون تقارير → بانر تحذيري
            if (withReports > 0 && withoutReports > 0) {
              return (
                <View style={[styles.infoCard, styles.infoCardWarning]}>
                  <Ionicons name="alert-circle" size={18} color={AMBER} />
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: "800", color: AMBER }}>
                      {withoutReports}
                    </Text>{" "}
                    من{" "}
                    <Text style={{ fontWeight: "800" }}>{total}</Text>{" "}
                    {withoutReports === 1 ? "طفل لم يبدأ" : "أطفال لم يبدأوا"} الأنشطة بعد
                  </Text>
                </View>
              );
            }

            // الحالة 3: محد عنده تقارير → البانر التشجيعي الأصلي
            return (
              <View style={styles.infoCard}>
                <Ionicons
                  name="information-circle"
                  size={18}
                  color={PRIMARY_DARK}
                />
                <Text style={styles.infoText}>
                  لم يتم إنشاء تقارير تطور بعد. ستظهر النتائج هنا بعد إكمال
                  الأطفال للأنشطة.
                </Text>
              </View>
            );
          })()}

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

          {/* ─── SECTION HEADER ─── */}
          <View style={styles.sectionHeader}>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddChild}>
              <Ionicons name="add" size={14} color="#fff" />
              <Text style={styles.addText}>إضافة طفل</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>
              الأطفال{" "}
              {children.length > 0 ? `(${filteredChildren.length})` : ""}
            </Text>
          </View>

          {/* ─── CHILDREN GRID / EMPTY ─── */}
          {children.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons
                  name="people-outline"
                  size={42}
                  color={PRIMARY_DARK}
                />
              </View>
              <Text style={styles.emptyTitle}>لم يتم إضافة سجلات أطفال بعد</Text>
              <Text style={styles.emptySubtitle}>
                ابدأ بإضافة سجل لأول طفل في حسابك لتصميم خطته العلاجية ومتابعة
                تطوره.
              </Text>
              <TouchableOpacity
                style={styles.emptyActionBtn}
                onPress={handleAddChild}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={18} color="#fff" />
                <Text style={styles.emptyActionText}>إضافة سجل للطفل</Text>
              </TouchableOpacity>
            </View>
          ) : filteredChildren.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons name="search" size={42} color={MUTED} />
              </View>
              <Text style={styles.emptyTitle}>لم يتم العثور على نتائج</Text>
              <Text style={styles.emptySubtitle}>
                لا يوجد طفل بهذا الاسم. جرّب البحث باسم آخر.
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

                    <View
                      style={[
                        styles.childAvatar,
                        { backgroundColor: getGenderIcon(child.gender).bg },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={getGenderIcon(child.gender).name}
                        size={28}
                        color={getGenderIcon(child.gender).color}
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
                      <Text style={styles.noReportHint}>لا يوجد تقرير بعد</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

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
  searchDropdown: {
    backgroundColor: CARD,
    marginTop: 8,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
    overflow: "hidden",
  },
  searchResultItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  searchResultBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  searchResultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  searchResultInfo: { flex: 1 },
  searchResultName: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
    textAlign: "right",
  },
  searchResultMeta: {
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
    textAlign: "right",
  },
  searchEmpty: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  searchEmptyText: {
    fontSize: 13,
    color: MUTED,
  },

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
  infoCardSuccess: {
    backgroundColor: GREEN_LIGHT,
  },
  infoCardWarning: {
    backgroundColor: AMBER_LIGHT,
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
  addBtn: {
    flexDirection: "row-reverse",
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
});

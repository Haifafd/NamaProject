import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../FirebaseConfig";
import {
  getChildPlan,
  getActivitiesByIds,
  CATEGORY_INFO,
} from "../../Services/ActivityService";
import BottomNavBar from "../../components/BottomNavBar";

// ─── 🎨 الثيم الموحد ───
import {
  COLORS,
  SCORE_COLORS,
  CATEGORY_COLORS as THEME_CATEGORIES,
} from "../../constants/theme";

const PRIMARY = COLORS.PRIMARY;
const PRIMARY_DARK = COLORS.PRIMARY_DARK;
const PRIMARY_LIGHT = COLORS.PRIMARY_LIGHT;
const BG = COLORS.BG;
const CARD = COLORS.CARD_BG;
const TEXT = COLORS.TEXT;
const MUTED = COLORS.MUTED;
const PINK_LIGHT = "#FCE4EC";

// ─── ألوان الفئات (مع labels) ───
const CATEGORY_COLORS = {
  memory: { ...THEME_CATEGORIES.memory, label: "الذاكرة" },
  focus: { ...THEME_CATEGORIES.focus, label: "التركيز والانتباه" },
  thinking: { ...THEME_CATEGORIES.thinking, label: "التفكير وحل المشكلات" },
  perception: { ...THEME_CATEGORIES.perception, label: "الإدراك البصري" },
};

const SCORE_LABELS = {
  1: "ممتاز",
  2: "جيد",
  3: "متوسط",
  4: "ضعيف",
  5: "ضعيف جداً",
};

export default function ChildReport() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { childId, childName } = params;

  const [child, setChild] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [plan, setPlan] = useState(null);
  const [planActivities, setPlanActivities] = useState([]);

  const calculateCategoryScore = (categoryId) => {
    const categoryResults = results.filter((r) => r.categoryId === categoryId);
    if (categoryResults.length === 0) return null;

    const sum = categoryResults.reduce((acc, r) => acc + (r.score || 0), 0);
    const avg = sum / categoryResults.length;

    return Math.round(avg);
  };

  const loadData = async () => {
    if (!childId) {
      setLoading(false);
      return;
    }

    try {
      const childDoc = await getDoc(doc(db, "Children", childId));
      if (childDoc.exists()) {
        setChild({ id: childDoc.id, ...childDoc.data() });
      }

      const resultsQuery = query(
        collection(db, "ActivityResults"),
        where("childId", "==", childId),
      );
      const resultsSnapshot = await getDocs(resultsQuery);
      const resultsData = resultsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResults(resultsData);

      // Fetch therapy plan
      const planData = await getChildPlan(childId);
      setPlan(planData);

      if (planData?.activityIds?.length > 0) {
        const activities = await getActivitiesByIds(planData.activityIds);
        setPlanActivities(activities);
      } else {
        setPlanActivities([]);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [childId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return "—";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const ScoreCircles = ({ score }) => {
    return (
      <View style={styles.circlesContainer}>
        <View style={styles.circlesRow}>
          {[5, 4, 3, 2, 1].map((num) => {
            const isActive = score === num;
            return (
              <View key={num} style={styles.circleWrapper}>
                <View
                  style={[
                    styles.scoreCircle,
                    isActive && {
                      backgroundColor: SCORE_COLORS[num],
                      borderColor: SCORE_COLORS[num],
                      transform: [{ scale: 1.2 }],
                    },
                  ]}
                >
                  {isActive && (
                    <Ionicons name="checkmark" size={12} color="#fff" />
                  )}
                </View>
                <Text
                  style={[
                    styles.circleNumber,
                    isActive && { color: SCORE_COLORS[num], fontWeight: "800" },
                  ]}
                >
                  {num}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={styles.scaleRow}>
          <Text style={[styles.scaleLabel, { color: SCORE_COLORS[5] }]}>
            ضعيف جداً
          </Text>
          <View style={styles.scaleLine} />
          <Text style={[styles.scaleLabel, { color: SCORE_COLORS[1] }]}>
            ممتاز
          </Text>
        </View>
      </View>
    );
  };

  const CategoryCard = ({ categoryKey, categoryId }) => {
    const info = CATEGORY_COLORS[categoryKey];
    const score = calculateCategoryScore(categoryId);
    const hasResults = score !== null;

    return (
      <View style={styles.categoryCard}>
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryIconBox, { backgroundColor: info.bg }]}>
            <MaterialCommunityIcons
              name={info.icon}
              size={20}
              color={info.color}
            />
          </View>
          <Text style={styles.categoryTitle}>{info.label}</Text>
        </View>

        {hasResults ? (
          <>
            <ScoreCircles score={score} />
            <View
              style={[
                styles.scoreBadge,
                { backgroundColor: SCORE_COLORS[score] + "20" },
              ]}
            >
              <Text
                style={[styles.scoreBadgeText, { color: SCORE_COLORS[score] }]}
              >
                التقييم: {SCORE_LABELS[score]}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyResultBox}>
            <Ionicons name="time-outline" size={20} color={MUTED} />
            <Text style={styles.emptyResultText}>
              لن تظهر النتائج إلا بعد إكمال الأنشطة
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerLoading]}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
      </View>
    );
  }

  if (!child) {
    return (
      <View style={[styles.container, styles.centerLoading]}>
        <Ionicons name="alert-circle-outline" size={50} color={MUTED} />
        <Text style={styles.errorText}>لم يتم العثور على بيانات الطفل</Text>
        <TouchableOpacity
          style={styles.backToHomeBtn}
          onPress={() => router.back()}
        >
          <Text style={styles.backToHomeText}>الرجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const age = calculateAge(child.birthDate);
  const totalActivitiesCompleted = results.length;
  const childIcon =
    child.gender === "male"
      ? "face-man"
      : child.gender === "female"
        ? "face-woman"
        : "baby-face-outline";
  const childIconColor =
    child.gender === "male"
      ? PRIMARY_DARK
      : child.gender === "female"
        ? "#E91E63"
        : MUTED;
  const childIconBg =
    child.gender === "male"
      ? PRIMARY_LIGHT
      : child.gender === "female"
        ? PINK_LIGHT
        : BG;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerGradient}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>تقرير الطفل</Text>

            <View style={{ width: 38 }} />
          </View>

          <View style={styles.childCard}>
            <View
              style={[styles.childAvatar, { backgroundColor: childIconBg }]}
            >
              <MaterialCommunityIcons
                name={childIcon}
                size={36}
                color={childIconColor}
              />
            </View>
            <View style={styles.childInfo}>
              <Text style={styles.childName} numberOfLines={1}>
                {child.name}
              </Text>
              <View style={styles.childMetaRow}>
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={11} color={MUTED} />
                  <Text style={styles.metaText}>
                    {age} {age === 1 ? "سنة" : "سنوات"}
                  </Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Ionicons name="medkit-outline" size={11} color={MUTED} />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {child.difficulty || "—"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PRIMARY]}
              tintColor={PRIMARY}
            />
          }
        >
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatCard}>
              <View
                style={[
                  styles.quickStatIcon,
                  { backgroundColor: PRIMARY_LIGHT },
                ]}
              >
                <Ionicons name="trophy" size={16} color={PRIMARY_DARK} />
              </View>
              <Text style={styles.quickStatNumber}>
                {totalActivitiesCompleted}
              </Text>
              <Text style={styles.quickStatLabel}>نشاط مكتمل</Text>
            </View>

            <View style={styles.quickStatCard}>
              <View
                style={[styles.quickStatIcon, { backgroundColor: "#FFF6E8" }]}
              >
                <Ionicons name="time" size={16} color="#F5A623" />
              </View>
              <Text style={styles.quickStatNumber}>
                {child.createdAt
                  ? new Date(child.createdAt.seconds * 1000).toLocaleDateString(
                      "ar-EG",
                      { month: "short", year: "numeric" },
                    )
                  : "—"}
              </Text>
              <Text style={styles.quickStatLabel}>تاريخ الإضافة</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionSubtitle}>
              مقياس التقييم: 1 ممتاز - 5 ضعيف جداً
            </Text>
            <Text style={styles.sectionTitle}>تقييم الفئات</Text>
          </View>

          <CategoryCard categoryKey="memory" categoryId="memoryCategoryID" />
          <CategoryCard categoryKey="focus" categoryId="focusCategoryID" />
          <CategoryCard
            categoryKey="thinking"
            categoryId="thinkingCategoryID"
          />
          <CategoryCard
            categoryKey="perception"
            categoryId="perceptionCategoryID"
          />

          {/* ─── Therapy Plan Section ─── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>الخطة العلاجية</Text>
            <Text style={styles.sectionSubtitle}>
              الأهداف والأنشطة المخصصة لطفلك
            </Text>
          </View>

          {plan ? (
            <View style={styles.planCard}>
              {/* Goals Sub-card */}
              {plan.goals && plan.goals.length > 0 && (
                <>
                  <View style={styles.planSection}>
                    <View style={styles.planSectionHeader}>
                      <View
                        style={[
                          styles.planIconBox,
                          { backgroundColor: "#FFF6E8" },
                        ]}
                      >
                        <Ionicons name="flag" size={16} color="#F5A623" />
                      </View>
                      <Text style={styles.planSectionTitle}>
                        الأهداف العلاجية
                      </Text>
                    </View>
                    {plan.goals.map((goal, index) => (
                      <View key={index} style={styles.goalRow}>
                        <View style={styles.goalBullet} />
                        <Text style={styles.goalText}>{goal}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.planDivider} />
                </>
              )}

              {/* Dose Sub-card */}
              <View style={styles.planSection}>
                <View style={styles.planSectionHeader}>
                  <View
                    style={[
                      styles.planIconBox,
                      { backgroundColor: PRIMARY_LIGHT },
                    ]}
                  >
                    <Ionicons name="medkit" size={16} color={PRIMARY_DARK} />
                  </View>
                  <Text style={styles.planSectionTitle}>الجرعة العلاجية</Text>
                </View>
                <View style={styles.doseGrid}>
                  <View style={styles.doseItem}>
                    <Text style={styles.doseNumber}>
                      {plan.sessionsPerWeek || 0}
                    </Text>
                    <Text style={styles.doseLabel}>جلسات/أسبوع</Text>
                  </View>
                  <View style={styles.doseDivider} />
                  <View style={styles.doseItem}>
                    <Text style={styles.doseNumber}>
                      {plan.activitiesPerSession || 0}
                    </Text>
                    <Text style={styles.doseLabel}>أنشطة/جلسة</Text>
                  </View>
                  <View style={styles.doseDivider} />
                  <View style={styles.doseItem}>
                    <Text style={styles.doseNumber}>
                      {plan.duration || 0}
                      <Text style={styles.doseUnit}> د</Text>
                    </Text>
                    <Text style={styles.doseLabel}>المدة</Text>
                  </View>
                </View>
              </View>

              {/* Activities Sub-card */}
              {planActivities.length > 0 && (
                <>
                  <View style={styles.planDivider} />
                  <View style={styles.planSection}>
                    <View style={styles.planSectionHeader}>
                      <View
                        style={[
                          styles.planIconBox,
                          { backgroundColor: "#E8F5E9" },
                        ]}
                      >
                        <Ionicons name="list" size={16} color="#4CAF50" />
                      </View>
                      <Text style={styles.planSectionTitle}>
                        الأنشطة المطلوبة ({planActivities.length})
                      </Text>
                    </View>
                    {planActivities.map((activity) => {
                      const catInfo = CATEGORY_INFO[activity.categoryId] || {
                        name: "—",
                        color: MUTED,
                        lightColor: BG,
                        icon: "help-circle",
                      };
                      return (
                        <View
                          key={activity.id}
                          style={styles.planActivityRow}
                        >
                          <View
                            style={[
                              styles.planActivityIcon,
                              { backgroundColor: catInfo.lightColor },
                            ]}
                          >
                            <Ionicons
                              name={catInfo.icon}
                              size={14}
                              color={catInfo.color}
                            />
                          </View>
                          <Text style={styles.planActivityName}>
                            {activity.title}
                          </Text>
                          <Text
                            style={[
                              styles.planActivityCategory,
                              { color: catInfo.color },
                            ]}
                          >
                            {catInfo.name}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}
            </View>
          ) : (
            <View style={styles.emptyPlanCard}>
              <Ionicons
                name="document-text-outline"
                size={32}
                color={MUTED}
              />
              <Text style={styles.emptyPlanTitle}>
                لم يتم إعداد خطة علاجية بعد
              </Text>
              <Text style={styles.emptyPlanSub}>
                سيقوم الأخصائي بإعداد الخطة قريباً
              </Text>
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
  container: { flex: 1, backgroundColor: BG },
  centerLoading: { justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: MUTED, fontSize: 13 },
  errorText: { color: TEXT, fontSize: 14, fontWeight: "600", marginTop: 12 },
  backToHomeBtn: {
    marginTop: 16,
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backToHomeText: { color: "#fff", fontWeight: "700" },

  headerGradient: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 60,
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
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },

  childCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#fff",
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    gap: 14,
    zIndex: 1,
    shadowColor: PRIMARY_DARK,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  childAvatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  childInfo: { flex: 1 },
  childName: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT,
    textAlign: "right",
  },
  childMetaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
    flexWrap: "wrap",
  },
  metaItem: { flexDirection: "row-reverse", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, color: MUTED },
  metaDivider: { width: 1, height: 12, backgroundColor: "#E0E0E0" },

  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  quickStatsRow: { flexDirection: "row-reverse", gap: 10, marginBottom: 20 },
  quickStatCard: {
    flex: 1,
    backgroundColor: CARD,
    padding: 12,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  quickStatNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
    textAlign: "right",
  },
  quickStatLabel: {
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
    textAlign: "right",
  },

  sectionHeader: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    textAlign: "right",
  },
  sectionSubtitle: {
    fontSize: 11,
    color: MUTED,
    textAlign: "right",
    marginTop: 4,
  },

  categoryCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  categoryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTitle: { fontSize: 14, fontWeight: "700", color: TEXT },

  circlesContainer: { paddingVertical: 10 },
  circlesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 8,
  },
  circleWrapper: { alignItems: "center", gap: 4 },
  scoreCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  circleNumber: { fontSize: 11, color: MUTED, fontWeight: "600" },
  scaleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  scaleLabel: { fontSize: 9, fontWeight: "700" },
  scaleLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 6,
  },

  scoreBadge: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 10,
  },
  scoreBadgeText: { fontSize: 11, fontWeight: "700" },

  emptyResultBox: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: BG,
    padding: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  emptyResultText: {
    flex: 1,
    fontSize: 11,
    color: MUTED,
    textAlign: "right",
    lineHeight: 16,
  },

  // Plan card
  planCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  planSection: {
    paddingVertical: 4,
  },
  planSectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  planIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  planSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT,
  },
  planDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 12,
  },

  // Goals
  goalRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  goalBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY,
    marginTop: 7,
  },
  goalText: {
    flex: 1,
    fontSize: 13,
    color: TEXT,
    textAlign: "right",
    lineHeight: 22,
  },

  // Dose grid
  doseGrid: {
    flexDirection: "row-reverse",
    backgroundColor: BG,
    borderRadius: 12,
    paddingVertical: 14,
  },
  doseItem: {
    flex: 1,
    alignItems: "center",
  },
  doseDivider: {
    width: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 4,
  },
  doseNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: PRIMARY_DARK,
  },
  doseUnit: {
    fontSize: 13,
    fontWeight: "600",
  },
  doseLabel: {
    fontSize: 10,
    color: MUTED,
    marginTop: 2,
    textAlign: "center",
  },

  // Plan activities
  planActivityRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  planActivityIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  planActivityName: {
    flex: 1,
    fontSize: 13,
    color: TEXT,
    textAlign: "right",
    fontWeight: "600",
  },
  planActivityCategory: {
    fontSize: 10,
    fontWeight: "700",
  },

  // Empty plan
  emptyPlanCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  emptyPlanTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
    marginTop: 4,
  },
  emptyPlanSub: {
    fontSize: 12,
    color: MUTED,
    textAlign: "center",
  },
});

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

// ─── الثيم السماوي ───
const PRIMARY = "#79ccf8";
const PRIMARY_DARK = "#0288D1";
const PRIMARY_LIGHT = "#E1F5FE";
const BG = "#F0F4F8";
const CARD = "#FFFFFF";
const TEXT = "#1A1A1A";
const MUTED = "#757575";
const PINK_LIGHT = "#FCE4EC";

// ─── ألوان الفئات ───
const CATEGORY_COLORS = {
  memory: { color: "#9C27B0", bg: "#F3E5F5", icon: "brain", label: "الذاكرة" },
  focus: {
    color: "#FFC107",
    bg: "#FFF8E1",
    icon: "eye-outline",
    label: "التركيز والانتباه",
  },
  thinking: {
    color: "#2196F3",
    bg: "#E3F2FD",
    icon: "lightbulb-outline",
    label: "التفكير وحل المشكلات",
  },
  perception: {
    color: "#F44336",
    bg: "#FFEBEE",
    icon: "shape-outline",
    label: "الإدراك البصري",
  },
};

// ─── ألوان التقييم 1-5 ───
// 1 = ممتاز (أخضر) ... 5 = ضعيف جداً (أحمر)
const SCORE_COLORS = {
  1: "#4CAF50", // ممتاز - أخضر
  2: "#8BC34A", // جيد - أخضر فاتح
  3: "#FFC107", // متوسط - أصفر
  4: "#FF9800", // ضعيف - برتقالي
  5: "#F44336", // ضعيف جداً - أحمر
};

const SCORE_LABELS = {
  1: "ممتاز",
  2: "جيد",
  3: "متوسط",
  4: "ضعيف",
  5: "ضعيف جداً",
};

export default function Dashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { childId, childName } = params;

  const [child, setChild] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ─────────────────────────────────────────────
  // 📊 حساب التقييم للفئة (1-5)
  // كم متوسط نتائج الطفل في الفئة هذي
  // ─────────────────────────────────────────────
  const calculateCategoryScore = (categoryId) => {
    const categoryResults = results.filter((r) => r.categoryId === categoryId);
    if (categoryResults.length === 0) return null; // ما فيه نتايج

    const sum = categoryResults.reduce((acc, r) => acc + (r.score || 0), 0);
    const avg = sum / categoryResults.length;

    // تقريب لأقرب رقم صحيح (1-5)
    return Math.round(avg);
  };

  // ─────────────────────────────────────────────
  // 📥 جلب بيانات الطفل والنتائج من Firebase
  // ─────────────────────────────────────────────
  const loadData = async () => {
    if (!childId) {
      setLoading(false);
      return;
    }

    try {
      // جلب بيانات الطفل
      const childDoc = await getDoc(doc(db, "Children", childId));
      if (childDoc.exists()) {
        setChild({ id: childDoc.id, ...childDoc.data() });
      }

      // جلب نتائج الأنشطة
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

  // ─────────────────────────────────────────────
  // 🎨 حساب العمر من تاريخ الميلاد
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // 🔵 مكون عرض التقييم بـ 5 دوائر
  // 5 = ضعيف جداً, 1 = ممتاز
  // ─────────────────────────────────────────────
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
        {/* مقياس */}
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

  // ─────────────────────────────────────────────
  // 📋 بطاقة فئة
  // ─────────────────────────────────────────────
  const CategoryCard = ({ categoryKey, categoryId }) => {
    const info = CATEGORY_COLORS[categoryKey];
    const score = calculateCategoryScore(categoryId);
    const hasResults = score !== null;

    return (
      <View style={styles.categoryCard}>
        {/* رأس البطاقة */}
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

        {/* المحتوى */}
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

  // ─────────────────────────────────────────────
  // ⏳ Loading
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, styles.centerLoading]}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
      </View>
    );
  }

  // ─────────────────────────────────────────────
  // ❌ ما فيه طفل
  // ─────────────────────────────────────────────
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
        {/* ─── HEADER ─── */}
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

            <TouchableOpacity style={styles.exportButton}>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* بطاقة الطفل في الـ Header */}
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
          {/* ─── إحصائية سريعة ─── */}
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
                      {
                        month: "short",
                        year: "numeric",
                      },
                    )
                  : "—"}
              </Text>
              <Text style={styles.quickStatLabel}>تاريخ الإضافة</Text>
            </View>
          </View>

          {/* ─── العنوان ─── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionSubtitle}>
              مقياس التقييم: 1 ممتاز - 5 ضعيف جداً
            </Text>
            <Text style={styles.sectionTitle}>تقييم الفئات</Text>
          </View>

          {/* ─── بطاقات الفئات ─── */}
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

          {/* ─── زر الخطة العلاجية ─── */}
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: "./TreatPlan",
                params: { childId: child.id, childName: child.name },
              })
            }
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="document-text" size={20} color="#fff" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>الخطة العلاجية</Text>
              <Text style={styles.actionSubtitle}>إدارة الأنشطة والأهداف</Text>
            </View>
            <Ionicons name="chevron-back" size={18} color="#fff" />
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  centerLoading: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: { color: MUTED, fontSize: 13 },
  errorText: {
    color: TEXT,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
  backToHomeBtn: {
    marginTop: 16,
    backgroundColor: PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backToHomeText: { color: "#fff", fontWeight: "700" },

  // ─── Header ───
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
  exportButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },

  // ─── Child Card ───
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
  childInfo: {
    flex: 1,
  },
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
  metaItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: MUTED,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: "#E0E0E0",
  },

  // ─── Scroll ───
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // ─── Quick Stats ───
  quickStatsRow: {
    flexDirection: "row-reverse",
    gap: 10,
    marginBottom: 20,
  },
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

  // ─── Section Header ───
  sectionHeader: {
    marginBottom: 14,
  },
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

  // ─── Category Card ───
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
  categoryTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
  },

  // ─── Score Circles ───
  circlesContainer: {
    paddingVertical: 10,
  },
  circlesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 8,
  },
  circleWrapper: {
    alignItems: "center",
    gap: 4,
  },
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
  circleNumber: {
    fontSize: 11,
    color: MUTED,
    fontWeight: "600",
  },
  scaleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  scaleLabel: {
    fontSize: 9,
    fontWeight: "700",
  },
  scaleLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 6,
  },

  // ─── Score Badge ───
  scoreBadge: {
    alignSelf: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 10,
  },
  scoreBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // ─── Empty Result ───
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

  // ─── Action Button ───
  actionButton: {
    flexDirection: "row-reverse",
    backgroundColor: PRIMARY,
    padding: 14,
    borderRadius: 16,
    marginTop: 16,
    alignItems: "center",
    gap: 12,
    shadowColor: PRIMARY_DARK,
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    textAlign: "right",
  },
  actionSubtitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
    textAlign: "right",
  },
});

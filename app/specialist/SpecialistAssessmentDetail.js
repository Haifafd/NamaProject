import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { BarChart } from "react-native-chart-kit";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../FirebaseConfig";
import { SPECIALIST_CATEGORIES } from "../../Services/AssessmentService";
import { COLORS } from "../../constants/theme";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function SpecialistAssessmentDetail() {
  const router = useRouter();
  const { assessmentId, childName } = useLocalSearchParams();
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessment();
  }, [assessmentId]);

  const loadAssessment = async () => {
    if (!assessmentId) {
      setLoading(false);
      return;
    }
    try {
      const docSnap = await getDoc(
        doc(db, "SpecialistAssessments", assessmentId)
      );
      if (docSnap.exists()) {
        setAssessment({ id: docSnap.id, ...docSnap.data() });
      }
    } catch (error) {
      console.error("Error loading assessment:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "—";
    const date = timestamp.toDate?.() || new Date(timestamp);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getLevelColor = (level) => {
    if (level === "عالي" || level === "مستوى عالي") return COLORS.SUCCESS;
    if (level === "متوسط" || level === "مستوى متوسط") return COLORS.WARNING;
    return COLORS.DANGER;
  };

  const getLevelIcon = (level) => {
    if (level === "عالي" || level === "مستوى عالي") return "checkmark-circle";
    if (level === "متوسط" || level === "مستوى متوسط") return "alert-circle";
    return "warning";
  };

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (!assessment || !assessment.result) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />
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
              <Text style={styles.headerTitle}>تفاصيل التقييم</Text>
            </View>
            <View style={{ width: 38 }} />
          </View>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="document-outline" size={64} color={COLORS.MUTED} />
          <Text style={styles.emptyTitle}>لم نتمكن من تحميل التقييم</Text>
        </View>
      </View>
    );
  }

  const categoryNames = Object.keys(assessment.result.categoryScores || {});
  const shortNames = {
    "المهارات الإدراكية والأكاديمية": "إدراكي",
    "الانتباه والتركيز": "تركيز",
    "الذاكرة والإدراك": "ذاكرة",
    "المعرفة العامة": "معرفة",
    "المهارات الأكاديمية": "أكاديمي",
    "المهارات البصرية والحركية": "بصري",
    "حل المشكلات": "مشكلات",
  };

  const chartData = {
    labels: categoryNames.map((n) => shortNames[n] || n.slice(0, 6)),
    datasets: [
      {
        data: categoryNames.map(
          (n) => assessment.result.categoryScores[n].percentage || 0
        ),
      },
    ],
  };

  const chartConfig = {
    backgroundColor: "#FFFFFF",
    backgroundGradientFrom: "#FFFFFF",
    backgroundGradientTo: "#FFFFFF",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(2, 136, 209, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(26, 26, 26, ${opacity})`,
    barPercentage: 0.6,
    propsForBackgroundLines: { strokeDasharray: "", stroke: "#F0F0F0" },
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />

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
            <Text style={styles.headerTitle}>تفاصيل التقييم</Text>
            {childName && (
              <Text style={styles.headerSubtitle}>{childName}</Text>
            )}
          </View>
          <View style={{ width: 38 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.dateBadge}>
          <Ionicons
            name="calendar-outline"
            size={14}
            color={COLORS.PRIMARY_DARK}
          />
          <Text style={styles.dateText}>{formatDate(assessment.createdAt)}</Text>
        </View>

        <View style={styles.overallCard}>
          <Text style={styles.overallLabel}>المستوى الكلي</Text>
          <View
            style={[
              styles.scoreCircle,
              { borderColor: getLevelColor(assessment.result.level) },
            ]}
          >
            <Text
              style={[
                styles.scoreNumber,
                { color: getLevelColor(assessment.result.level) },
              ]}
            >
              {assessment.result.percentage}%
            </Text>
          </View>
          <View style={styles.levelRow}>
            <Ionicons
              name={getLevelIcon(assessment.result.level)}
              size={20}
              color={getLevelColor(assessment.result.level)}
            />
            <Text
              style={[
                styles.levelText,
                { color: getLevelColor(assessment.result.level) },
              ]}
            >
              {assessment.result.level}
            </Text>
          </View>
          <Text style={styles.pointsText}>
            {assessment.result.totalPoints} / {assessment.result.maxPoints} نقطة
          </Text>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="bar-chart" size={20} color={COLORS.PRIMARY_DARK} />
            <Text style={styles.cardTitle}>تحليل الفئات</Text>
          </View>
          <View style={styles.chartWrapper}>
            <BarChart
              data={chartData}
              width={SCREEN_WIDTH - 64}
              height={240}
              yAxisSuffix="%"
              chartConfig={chartConfig}
              showValuesOnTopOfBars
              fromZero
              withInnerLines
              style={{ borderRadius: 12, marginLeft: -20 }}
            />
          </View>
        </View>

        <View style={styles.detailCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="list" size={20} color={COLORS.PRIMARY_DARK} />
            <Text style={styles.cardTitle}>تفاصيل الفئات</Text>
          </View>
          {categoryNames.map((catName) => {
            const cat = assessment.result.categoryScores[catName];
            const meta = SPECIALIST_CATEGORIES[catName] || {};
            return (
              <View key={catName} style={styles.categoryRow}>
                <View style={styles.categoryHeader}>
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: meta.bgColor || "#F0F0F0" },
                    ]}
                  >
                    <Ionicons
                      name={meta.icon || "ellipse"}
                      size={18}
                      color={meta.color || COLORS.MUTED}
                    />
                  </View>
                  <Text style={styles.categoryName}>{catName}</Text>
                  <Text
                    style={[
                      styles.categoryPercent,
                      { color: getLevelColor(cat.level) },
                    ]}
                  >
                    {cat.percentage}%
                  </Text>
                </View>
                <View style={styles.progressBarWrap}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${cat.percentage}%`,
                        backgroundColor: getLevelColor(cat.level),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.categoryMeta}>
                  {cat.score} / {cat.maxScore} نقطة • {cat.level}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.BG,
  },
  headerGradient: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
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
  headerTitle: { fontSize: 17, fontWeight: "700", color: "#fff" },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },
  scrollContent: { padding: 16, paddingBottom: 32 },
  dateBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  dateText: { fontSize: 12, color: COLORS.PRIMARY_DARK, fontWeight: "600" },
  overallCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  overallLabel: { fontSize: 13, color: COLORS.MUTED, marginBottom: 16 },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  scoreNumber: { fontSize: 32, fontWeight: "800" },
  levelRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  levelText: { fontSize: 16, fontWeight: "700" },
  pointsText: { fontSize: 12, color: COLORS.MUTED },
  chartCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  chartWrapper: { alignItems: "center", marginTop: 8 },
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: COLORS.TEXT },
  detailCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  categoryRow: { marginBottom: 14 },
  categoryHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryName: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.TEXT,
    textAlign: "right",
  },
  categoryPercent: { fontSize: 14, fontWeight: "800" },
  progressBarWrap: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
    flexDirection: "row-reverse",
  },
  progressBarFill: { height: "100%", borderRadius: 4 },
  categoryMeta: {
    fontSize: 11,
    color: COLORS.MUTED,
    marginTop: 4,
    textAlign: "right",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.TEXT,
    textAlign: "center",
  },
});

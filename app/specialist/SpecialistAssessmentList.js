import { useCallback, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from "expo-router";
import { getSpecialistAssessmentsForChild } from "../../Services/AssessmentService";
import { COLORS } from "../../constants/theme";

export default function SpecialistAssessmentList() {
  const router = useRouter();
  const { childId, childName } = useLocalSearchParams();

  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAssessments();
    }, [childId])
  );

  const loadAssessments = async () => {
    if (!childId) {
      setLoading(false);
      return;
    }
    try {
      const data = await getSpecialistAssessmentsForChild(childId);
      setAssessments(data);
    } catch (error) {
      console.error("Error loading assessments:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAssessments();
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

  const handleNewAssessment = () => {
    router.push({
      pathname: "/specialist/spform",
      params: { childId, childName },
    });
  };

  const handleViewSession = (assessmentId) => {
    router.push({
      pathname: "/specialist/SpecialistAssessmentDetail",
      params: { assessmentId, childId, childName },
    });
  };

  const getLevelColor = (level) => {
    if (level === "مستوى عالي") return COLORS.SUCCESS;
    if (level === "مستوى متوسط") return COLORS.WARNING;
    return COLORS.DANGER;
  };

  if (loading) {
    return (
      <View style={styles.centerLoading}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>استمارتي</Text>
            {childName && (
              <Text style={styles.headerSubtitle}>{childName}</Text>
            )}
          </View>
          <View style={{ width: 38 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <TouchableOpacity
          style={styles.newButton}
          onPress={handleNewAssessment}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={22} color="#FFFFFF" />
          <Text style={styles.newButtonText}>تقييم جديد</Text>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            السجل ({assessments.length}{" "}
            {assessments.length === 1 ? "جلسة" : "جلسات"})
          </Text>
        </View>

        {assessments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-outline" size={48} color={COLORS.MUTED} />
            <Text style={styles.emptyTitle}>لا توجد تقييمات سابقة</Text>
            <Text style={styles.emptySub}>اضغط "تقييم جديد" لبدء أول تقييم</Text>
          </View>
        ) : (
          <View style={styles.sessionsList}>
            {assessments.map((assessment, index) => {
              const sessionNum = assessments.length - index;
              const result = assessment.result || {};
              return (
                <TouchableOpacity
                  key={assessment.id}
                  style={styles.sessionCard}
                  onPress={() => handleViewSession(assessment.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.sessionIconBox}>
                    <Text style={styles.sessionNumber}>{sessionNum}</Text>
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTitle}>جلسة {sessionNum}</Text>
                    <Text style={styles.sessionDate}>
                      {formatDate(assessment.createdAt)}
                    </Text>
                    {result.percentage !== undefined && (
                      <View style={styles.sessionResultRow}>
                        <View
                          style={[
                            styles.levelChip,
                            {
                              backgroundColor:
                                getLevelColor(result.level) + "20",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.levelChipText,
                              { color: getLevelColor(result.level) },
                            ]}
                          >
                            {result.level} ({result.percentage}%)
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                  <Ionicons
                    name="chevron-back"
                    size={20}
                    color={COLORS.MUTED}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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

  newButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 20,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  newButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },

  sectionHeader: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT,
    textAlign: "right",
  },

  emptyCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT,
    marginTop: 8,
  },
  emptySub: { fontSize: 12, color: COLORS.MUTED, textAlign: "center" },

  sessionsList: { gap: 10 },
  sessionCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sessionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  sessionNumber: { fontSize: 18, fontWeight: "800", color: COLORS.PRIMARY_DARK },
  sessionInfo: { flex: 1, gap: 4 },
  sessionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT,
    textAlign: "right",
  },
  sessionDate: { fontSize: 11, color: COLORS.MUTED, textAlign: "right" },
  sessionResultRow: { flexDirection: "row-reverse", marginTop: 4 },
  levelChip: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  levelChipText: { fontSize: 11, fontWeight: "700" },
});

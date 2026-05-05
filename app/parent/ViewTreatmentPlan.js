import { Ionicons } from "@expo/vector-icons";
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
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  COLORS
} from "../../constants/theme";
import { db } from "../../FirebaseConfig";
import { CATEGORY_INFO } from "../../Services/ActivityService";

const PRIMARY = COLORS.PRIMARY;
const PRIMARY_DARK = COLORS.PRIMARY_DARK;
const PRIMARY_LIGHT = COLORS.PRIMARY_LIGHT;
const BG = COLORS.BG;
const CARD = COLORS.CARD_BG;
const TEXT = COLORS.TEXT;
const MUTED = COLORS.MUTED;

export default function ViewTreatmentPlan() {
  const router = useRouter();
  const { childId, childName } = useLocalSearchParams();

  const [plan, setPlan] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, [childId]);

  const loadPlan = async () => {
    if (!childId) {
      setLoading(false);
      return;
    }

    try {
      const plansQ = query(
        collection(db, "TherapeuticPlan"),
        where("childId", "==", childId),
      );
      const plansSnap = await getDocs(plansQ);

      if (plansSnap.empty) {
        setLoading(false);
        return;
      }

      const planDoc = plansSnap.docs[0];
      const planData = { id: planDoc.id, ...planDoc.data() };
      setPlan(planData);

      const activityIds = planData.activityIds || [];
      const acts = [];
      for (const aid of activityIds) {
        const aRef = doc(db, "Activities", aid);
        const aSnap = await getDoc(aRef);
        if (aSnap.exists()) {
          acts.push({ id: aSnap.id, ...aSnap.data() });
        }
      }
      setActivities(acts);
    } catch (error) {
      console.error("Error loading plan:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerLoading]}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>جاري تحميل الخطة...</Text>
      </View>
    );
  }

  const grouped = {};
  activities.forEach((a) => {
    const cat = a.categoryId || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(a);
  });

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

            <Text style={styles.headerTitle}>الخطة العلاجية</Text>

            <View style={{ width: 38 }} />
          </View>

          {childName && (
            <Text style={styles.headerSubtitle}>للطفل: {childName}</Text>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {!plan ? (
            <View style={styles.emptyCard}>
              <Ionicons name="document-outline" size={50} color={MUTED} />
              <Text style={styles.emptyTitle}>لا توجد خطة علاجية بعد</Text>
              <Text style={styles.emptyText}>
                سيقوم الأخصائي بإعداد خطة علاجية مناسبة قريباً
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.planInfoCard}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <Ionicons name="list" size={18} color={PRIMARY_DARK} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>عدد الأنشطة</Text>
                    <Text style={styles.infoValue}>
                      {activities.length} نشاط
                    </Text>
                  </View>
                </View>

                {plan.duration && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconBox}>
                      <Ionicons name="time" size={18} color={PRIMARY_DARK} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>المدة</Text>
                      <Text style={styles.infoValue}>
                        {plan.duration} دقيقة
                      </Text>
                    </View>
                  </View>
                )}

                {plan.notes && (
                  <View style={styles.notesBox}>
                    <Text style={styles.notesLabel}>ملاحظات الأخصائي:</Text>
                    <Text style={styles.notesText}>{plan.notes}</Text>
                  </View>
                )}
              </View>

              <Text style={styles.sectionTitle}>الأنشطة حسب الفئة</Text>

              {Object.keys(grouped).map((catId) => {
                const info = CATEGORY_INFO[catId] || {
                  name: "أخرى",
                  color: MUTED,
                  lightColor: BG,
                };
                return (
                  <View key={catId} style={styles.categorySection}>
                    <View
                      style={[
                        styles.categoryHeader,
                        { backgroundColor: info.lightColor },
                      ]}
                    >
                      <View
                        style={[
                          styles.categoryDot,
                          { backgroundColor: info.color },
                        ]}
                      />
                      <Text
                        style={[styles.categoryName, { color: info.color }]}
                      >
                        {info.name}
                      </Text>
                      <Text style={styles.categoryCount}>
                        {grouped[catId].length} نشاط
                      </Text>
                    </View>

                    {grouped[catId].map((act, idx) => (
                      <View key={act.id} style={styles.activityCard}>
                        <View
                          style={[
                            styles.activityNumber,
                            { backgroundColor: info.lightColor },
                          ]}
                        >
                          <Text
                            style={[
                              styles.activityNumberText,
                              { color: info.color },
                            ]}
                          >
                            {idx + 1}
                          </Text>
                        </View>
                        <View style={styles.activityContent}>
                          <Text style={styles.activityTitle}>
                            {act.title || "نشاط"}
                          </Text>
                          {act.description && (
                            <Text style={styles.activityDesc} numberOfLines={2}>
                              {act.description}
                            </Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                );
              })}
            </>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  centerLoading: { justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: MUTED, fontSize: 13 },

  headerGradient: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 26,
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
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 16, fontWeight: "700", color: "#fff" },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginTop: 8,
  },

  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 30 },

  readOnlyBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: PRIMARY_LIGHT,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 14,
    gap: 6,
  },
  readOnlyText: { fontSize: 13, fontWeight: "800", color: PRIMARY_DARK },

  emptyCard: {
    backgroundColor: CARD,
    padding: 30,
    borderRadius: 18,
    alignItems: "center",
    marginVertical: 20,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: TEXT,
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: { fontSize: 13, color: MUTED, textAlign: "center" },

  planInfoCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
  },
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: 11,
    color: MUTED,
    fontWeight: "600",
    textAlign: "right",
  },
  infoValue: {
    fontSize: 15,
    color: TEXT,
    fontWeight: "800",
    textAlign: "right",
  },

  notesBox: {
    backgroundColor: BG,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: PRIMARY_DARK,
    marginBottom: 4,
    textAlign: "right",
  },
  notesText: { fontSize: 13, color: TEXT, lineHeight: 20, textAlign: "right" },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    marginBottom: 10,
    marginTop: 6,
    textAlign: "right",
  },

  categorySection: { marginBottom: 14 },
  categoryHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 6,
    gap: 8,
  },
  categoryDot: { width: 8, height: 8, borderRadius: 4 },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "right",
  },
  categoryCount: { fontSize: 11, color: MUTED, fontWeight: "700" },

  activityCard: {
    flexDirection: "row-reverse",
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
    alignItems: "center",
    elevation: 1,
    gap: 10,
  },
  activityNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  activityNumberText: { fontSize: 14, fontWeight: "800" },
  activityContent: { flex: 1 },
  activityTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT,
    textAlign: "right",
  },
  activityDesc: {
    fontSize: 12,
    color: MUTED,
    textAlign: "right",
    marginTop: 2,
  },
});

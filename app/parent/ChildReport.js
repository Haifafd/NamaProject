import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../FirebaseConfig";
import { getTodayActivityResults, CATEGORIES } from "../../Services/ActivityService";

const { width } = Dimensions.get("window");

const ProfessionalRating = ({ activeScore }) => {
  const getStyle = (num) => {
    const isActive = activeScore === num;
    if (!isActive) return { backgroundColor: "#F0F2F5", color: "#ADB5BD" };
    const colors = {
      1: "#27AE60", 2: "#2ECC71", 3: "#F1C40F", 4: "#E67E22", 5: "#E74C3C",
    };
    return { backgroundColor: colors[num], color: "#FFF", fontWeight: "bold" };
  };
  return (
    <View style={styles.ratingRow}>
      {[5, 4, 3, 2, 1].map((num) => (
        <View
          key={num}
          style={[styles.ratingCircle, { backgroundColor: getStyle(num).backgroundColor }]}
        >
          <Text style={[styles.ratingNum, {
            color: getStyle(num).color,
            fontWeight: getStyle(num).fontWeight,
          }]}>
            {num}
          </Text>
        </View>
      ))}
    </View>
  );
};

const LineChartTile = ({ title, score, color, data }) => (
  <View style={[styles.chartCard, styles.shadowCard]}>
    <Text style={styles.chartTitle}>{title}</Text>
    <View style={styles.chartBody}>
      <View style={styles.yAxis}>
        {["100%", "80%", "60%", "40%"].map((val, i) => (
          <Text key={i} style={styles.axisTxt}>{val}</Text>
        ))}
      </View>
      <View style={styles.chartArea}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.gridLine} />
        ))}
        <View style={styles.chartLineLayer}>
          {data.map((h, i) => (
            <View
              key={i}
              style={[styles.dataPoint, {
                bottom: h * 0.45,
                left: i * (width * 0.08),
                backgroundColor: color,
              }]}
            >
              <View style={[styles.pointPulse, { backgroundColor: color }]} />
            </View>
          ))}
        </View>
      </View>
    </View>
    <View style={styles.xAxis}>
      {["محاولة 4", "محاولة 3", "محاولة 2", "محاولة 1"].map((val, i) => (
        <Text key={i} style={styles.axisTxtX}>{val}</Text>
      ))}
    </View>
    <View style={styles.divider} />
    <ProfessionalRating activeScore={score} />
  </View>
);

const accuracyToRating = (avgAcc) => {
  if (avgAcc >= 80) return 1;
  if (avgAcc >= 65) return 2;
  if (avgAcc >= 50) return 3;
  if (avgAcc >= 35) return 4;
  return 5;
};

const getLast4Accuracies = (results, categoryId) => {
  const filtered = results
    .filter((r) => r.category === categoryId || r.categoryId === categoryId)
    .sort((a, b) => {
      const aMs = a.completedAt?.toMillis?.() || 0;
      const bMs = b.completedAt?.toMillis?.() || 0;
      return aMs - bMs;
    })
    .slice(-4);
  while (filtered.length < 4) filtered.unshift({ accuracy: 0 });
  return filtered.map((r) => r.accuracy || 0);
};

const getCategoryRating = (results, categoryId) => {
  const filtered = results.filter(
    (r) => r.category === categoryId || r.categoryId === categoryId
  );
  if (filtered.length === 0) return 5;
  const avg = filtered.reduce((sum, r) => sum + (r.accuracy || 0), 0) / filtered.length;
  return accuracyToRating(avg);
};

const getOverallAccuracy = (results) => {
  if (results.length === 0) return 0;
  return Math.round(
    results.reduce((sum, r) => sum + (r.accuracy || 0), 0) / results.length
  );
};

export default function ChildReport() {
  const router = useRouter();
  const { childId } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadData();
  }, [childId]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (childId) {
        const childRef = doc(db, "Children", childId);
        const childSnap = await getDoc(childRef);
        if (childSnap.exists()) {
          setChild({ id: childSnap.id, ...childSnap.data() });
        }
        const todayResults = await getTodayActivityResults(childId);
        setResults(todayResults);
        console.log("📊 Parent report - today results:", todayResults.length);
      }
    } catch (error) {
      console.error("Error loading report:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#3498DB" />
        <Text style={{ marginTop: 12, color: "#666", fontWeight: "700" }}>
          جاري تحميل التقرير...
        </Text>
      </SafeAreaView>
    );
  }

  const memoryData = getLast4Accuracies(results, CATEGORIES.MEMORY);
  const memoryRating = getCategoryRating(results, CATEGORIES.MEMORY);

  const focusData = getLast4Accuracies(results, CATEGORIES.FOCUS);
  const focusRating = getCategoryRating(results, CATEGORIES.FOCUS);

  const perceptionResults = results.filter(
    (r) => r.category === CATEGORIES.PERCEPTION || r.categoryId === CATEGORIES.PERCEPTION
  );
  const perceptionByActivity = {};
  perceptionResults.forEach((r) => {
    const key = r.activityTitle || "نشاط";
    if (!perceptionByActivity[key]) perceptionByActivity[key] = { total: 0, count: 0 };
    perceptionByActivity[key].total += r.accuracy || 0;
    perceptionByActivity[key].count += 1;
  });
  const perceptionBars = Object.keys(perceptionByActivity)
    .slice(0, 3)
    .map((key, i) => ({
      v: Math.round(perceptionByActivity[key].total / perceptionByActivity[key].count),
      l: key.substring(0, 6),
      c: ["#3498DB", "#5DADE2", "#85C1E9"][i] || "#3498DB",
    }));
  while (perceptionBars.length < 3) perceptionBars.push({ v: 0, l: "—", c: "#E0E0E0" });
  const perceptionRating = getCategoryRating(results, CATEGORIES.PERCEPTION);

  const overallAccuracy = getOverallAccuracy(results);
  const overallRating = accuracyToRating(overallAccuracy);

  const childName = child?.name || child?.fullName || "غير محدد";
  let childAge = "-";
  if (child?.birthDate) {
    try {
      const birth = new Date(child.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
      childAge = age;
    } catch {}
  } else if (child?.age) {
    childAge = child.age;
  }
  const childDifficulty = child?.difficulty || child?.diagnosis || "غير محدد";
  const isFemale = child?.gender === "female";

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headBtn} onPress={() => router.back()}>
          <Text style={styles.headIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.avatarContainer}>
          <Text style={{ fontSize: 55 }}>{isFemale ? "👧🏻" : "👦🏻"}</Text>
        </View>
        <TouchableOpacity style={styles.headBtn}>
          <Text style={{ fontSize: 20 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileInfo}>
          <Text style={styles.nameTxt}>الأسم : {childName}</Text>
          <Text style={styles.subTxt}>
            العمر : {childAge} {typeof childAge === "number" ? "سنوات" : ""}
          </Text>
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>نوع الصعوبة: {childDifficulty}</Text>
          </View>
          <View style={styles.todayBadge}>
            <Text style={styles.todayText}>📅 نتائج اليوم • {results.length} محاولة</Text>
          </View>
        </View>

        {results.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>لا توجد نتائج لليوم</Text>
            <Text style={styles.emptyText}>
              ستظهر نتائج الطفل هنا بعد إكمال أي نشاط اليوم
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            <LineChartTile
              title="مؤشر الذاكرة العاملة"
              score={memoryRating}
              color="#3498DB"
              data={memoryData}
            />
            <LineChartTile
              title="الأنتباه والثبات على المهمة"
              score={focusRating}
              color="#2ECC71"
              data={focusData}
            />

            <View style={[styles.chartCard, styles.shadowCard]}>
              <Text style={styles.chartTitle}>مؤشر الإدراك البصري</Text>
              <View style={styles.barArea}>
                <View style={styles.yAxis}>
                  {["100%", "80%", "60%", "40%"].map((v, i) => (
                    <Text key={i} style={styles.axisTxt}>{v}</Text>
                  ))}
                </View>
                <View style={styles.barsContainer}>
                  {perceptionBars.map((b, i) => (
                    <View key={i} style={styles.barCol}>
                      <Text style={[styles.barVal, { color: b.c }]}>{b.v}%</Text>
                      <View style={[styles.barBody, { height: b.v * 0.4, backgroundColor: b.c }]} />
                      <Text style={styles.barLab}>{b.l}</Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={styles.divider} />
              <ProfessionalRating activeScore={perceptionRating} />
            </View>

            <View style={[styles.chartCard, styles.shadowCard]}>
              <Text style={styles.chartTitle}>متوسط الأداء العام</Text>
              <View style={styles.circleContainer}>
                <View style={styles.circleBorder}>
                  <Text style={styles.circleText}>{overallAccuracy}%</Text>
                </View>
              </View>
              <View style={styles.divider} />
              <ProfessionalRating activeScore={overallRating} />
            </View>
          </View>
        )}

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.footerBtn, styles.shadowCard]}
          onPress={() => {
            if (childId) {
              router.push({
                pathname: "/parent/ParentAssessmentForm",
                params: { childId },
              });
            }
          }}
        >
          <View style={styles.btnIconCircle}>
            <Text style={{ fontSize: 22 }}>📝</Text>
          </View>
          <Text style={styles.btnLabel}>
            استشارة تقييم الطفل من قبل ولي الأمر
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FBFF" },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    padding: 20,
    alignItems: "center",
  },
  headBtn: {
    width: 45, height: 45, borderRadius: 15, backgroundColor: "#FFF",
    justifyContent: "center", alignItems: "center", elevation: 3,
  },
  headIcon: { fontSize: 20, fontWeight: "bold", color: "#333" },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "#E1F5FE",
    justifyContent: "center", alignItems: "center",
    borderWidth: 3, borderColor: "#FFF",
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  profileInfo: { alignItems: "center", marginVertical: 15 },
  nameTxt: { fontSize: 22, fontWeight: "800", color: "#2D3436" },
  subTxt: { fontSize: 14, color: "#636E72", marginTop: 4 },
  difficultyBadge: {
    backgroundColor: "#EBF5FF", paddingHorizontal: 15, paddingVertical: 6,
    borderRadius: 12, marginTop: 8,
  },
  difficultyText: { fontSize: 13, color: "#3498DB", fontWeight: "700" },
  todayBadge: {
    backgroundColor: "#E8F5E9", paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: 10, marginTop: 6,
  },
  todayText: { fontSize: 12, color: "#27AE60", fontWeight: "800" },
  emptyCard: {
    backgroundColor: "#FFF", padding: 30, borderRadius: 20, alignItems: "center",
    marginVertical: 20, elevation: 4, shadowColor: "#3498DB",
    shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 5 },
  },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "900", color: "#2D3436", marginBottom: 4 },
  emptyText: { fontSize: 13, color: "#636E72", textAlign: "center" },
  grid: {
    flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "space-between",
  },
  chartCard: {
    width: "48%", backgroundColor: "#FFF", borderRadius: 24, padding: 12, marginBottom: 16,
  },
  chartTitle: {
    fontSize: 11, fontWeight: "bold", color: "#2D3436",
    textAlign: "center", marginBottom: 15,
  },
  chartBody: { flexDirection: "row-reverse", height: 80 },
  yAxis: { width: 30, justifyContent: "space-between", alignItems: "flex-start" },
  axisTxt: { fontSize: 8, color: "#B2BEC3", fontWeight: "bold" },
  chartArea: {
    flex: 1, borderBottomWidth: 1, borderLeftWidth: 1,
    borderColor: "#F1F2F6", position: "relative",
  },
  gridLine: { height: 1, backgroundColor: "#F8F9FA", width: "100%", marginBottom: 18 },
  chartLineLayer: { position: "absolute", width: "100%", height: "100%" },
  dataPoint: { width: 6, height: 6, borderRadius: 3, position: "absolute", zIndex: 2 },
  pointPulse: {
    width: 12, height: 12, borderRadius: 6, opacity: 0.2,
    position: "absolute", top: -3, left: -3,
  },
  xAxis: {
    flexDirection: "row-reverse", justifyContent: "space-around",
    paddingRight: 35, marginTop: 8,
  },
  axisTxtX: { fontSize: 7, color: "#999", fontWeight: "700" },
  barArea: { flexDirection: "row-reverse", height: 80 },
  barsContainer: {
    flex: 1, flexDirection: "row-reverse",
    alignItems: "flex-end", justifyContent: "space-around",
  },
  barCol: { alignItems: "center" },
  barBody: { width: 14, borderRadius: 4 },
  barVal: { fontSize: 9, fontWeight: "800", marginBottom: 4 },
  barLab: { fontSize: 7, color: "#636E72", marginTop: 6, fontWeight: "bold" },
  circleContainer: { height: 80, justifyContent: "center", alignItems: "center" },
  circleBorder: {
    width: 75, height: 75, borderRadius: 37.5, borderWidth: 6,
    borderColor: "#3498DB", justifyContent: "center", alignItems: "center",
  },
  circleText: { fontSize: 18, fontWeight: "900", color: "#2D3436" },
  divider: { height: 1, backgroundColor: "#F1F2F6", marginVertical: 12 },
  ratingRow: { flexDirection: "row-reverse", justifyContent: "center" },
  ratingCircle: {
    width: 22, height: 22, borderRadius: 11, marginHorizontal: 2,
    justifyContent: "center", alignItems: "center",
  },
  ratingNum: { fontSize: 10 },
  footerBtn: {
    flexDirection: "row-reverse", backgroundColor: "#FFF",
    padding: 18, borderRadius: 25, alignItems: "center", marginTop: 10,
  },
  btnIconCircle: {
    width: 45, height: 45, borderRadius: 15, backgroundColor: "#E3F2FD",
    justifyContent: "center", alignItems: "center", marginLeft: 15,
  },
  btnLabel: {
    flex: 1, textAlign: "right", fontSize: 15, fontWeight: "700", color: "#2D3436",
  },
  shadowCard: {
    elevation: 4, shadowColor: "#3498DB",
    shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 5 },
  },
});

import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// --- نظام التقييم الاحترافي (1 هو الأفضل - أخضر) ---
const ProfessionalRating = ({ activeScore }) => {
  const getStyle = (num) => {
    const isActive = activeScore === num;
    if (!isActive) return { backgroundColor: "#F0F2F5", color: "#ADB5BD" };

    const colors = {
      1: "#27AE60", // ممتاز
      2: "#2ECC71",
      3: "#F1C40F",
      4: "#E67E22",
      5: "#E74C3C",
    };
    return { backgroundColor: colors[num], color: "#FFF", fontWeight: "bold" };
  };

  return (
    <View style={styles.ratingRow}>
      {[5, 4, 3, 2, 1].map((num) => (
        <View
          key={num}
          style={[
            styles.ratingCircle,
            { backgroundColor: getStyle(num).backgroundColor },
          ]}
        >
          <Text
            style={[
              styles.ratingNum,
              {
                color: getStyle(num).color,
                fontWeight: getStyle(num).fontWeight,
              },
            ]}
          >
            {num}
          </Text>
        </View>
      ))}
    </View>
  );
};

// --- كرت الرسم البياني الخطي ---
const LineChartTile = ({ title, score, color, data }) => (
  <View style={[styles.chartCard, styles.shadowCard]}>
    <Text style={styles.chartTitle}>{title}</Text>
    <View style={styles.chartBody}>
      <View style={styles.yAxis}>
        {["100%", "80%", "60%", "40%"].map((val, i) => (
          <Text key={i} style={styles.axisTxt}>
            {val}
          </Text>
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
              style={[
                styles.dataPoint,
                {
                  bottom: h * 0.45,
                  left: i * (width * 0.08),
                  backgroundColor: color,
                },
              ]}
            >
              <View style={[styles.pointPulse, { backgroundColor: color }]} />
            </View>
          ))}
        </View>
      </View>
    </View>
    <View style={styles.xAxis}>
      {["جلسة 4", "جلسة 3", "جلسة 2", "جلسة 1"].map((val, i) => (
        <Text key={i} style={styles.axisTxtX}>
          {val}
        </Text>
      ))}
    </View>
    <View style={styles.divider} />
    <ProfessionalRating activeScore={score} />
  </View>
);

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headBtn}>
          <Text style={styles.headIcon}>〉</Text>
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <Text style={{ fontSize: 55 }}>👦🏻</Text>
        </View>

        <TouchableOpacity style={styles.headBtn}>
          <Text style={{ fontSize: 20 }}>📄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileInfo}>
          <Text style={styles.nameTxt}>الأسم : محمد عبدالله</Text>
          <Text style={styles.subTxt}>العمر : 4 سنوات</Text>

          {/* تم تغيير لون نوع الصعوبة من الأحمر إلى الأزرق الاحترافي الهادئ */}
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>نوع الصعوبة: تشتت انتباه</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <LineChartTile
            title="مؤشر الذاكرة العاملة"
            score={1}
            color="#3498DB"
            data={[40, 60, 85, 95]}
          />
          <LineChartTile
            title="الأنتباه والثبات على المهمة"
            score={2}
            color="#2ECC71"
            data={[30, 50, 70, 85]}
          />

          <View style={[styles.chartCard, styles.shadowCard]}>
            <Text style={styles.chartTitle}>مؤشر الإدراك البصري</Text>
            <View style={styles.barArea}>
              <View style={styles.yAxis}>
                {["100%", "80%", "60%", "40%"].map((v, i) => (
                  <Text key={i} style={styles.axisTxt}>
                    {v}
                  </Text>
                ))}
              </View>
              <View style={styles.barsContainer}>
                {[
                  { v: 82, l: "نسخ", c: "#3498DB" },
                  { v: 70, l: "تركيب", c: "#5DADE2" },
                  { v: 76, l: "لون", c: "#85C1E9" },
                ].map((b, i) => (
                  <View key={i} style={styles.barCol}>
                    <Text style={[styles.barVal, { color: b.c }]}>{b.v}%</Text>
                    <View
                      style={[
                        styles.barBody,
                        { height: b.v * 0.4, backgroundColor: b.c },
                      ]}
                    />
                    <Text style={styles.barLab}>{b.l}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.divider} />
            <ProfessionalRating activeScore={3} />
          </View>

          <View style={[styles.chartCard, styles.shadowCard]}>
            <Text style={styles.chartTitle}>متوسط الأداء العام</Text>
            <View style={styles.circleContainer}>
              <View style={styles.circleBorder}>
                <Text style={styles.circleText}>92%</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <ProfessionalRating activeScore={1} />
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.footerBtn, styles.shadowCard]}
        >
          <View style={styles.btnIconCircle}>
            <Text style={{ fontSize: 22 }}>📝</Text>
          </View>
          <Text style={styles.btnLabel}>
            استمارة تقييم الطفل من قبل ولي الأمر
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
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  headIcon: { fontSize: 20, fontWeight: "bold", color: "#333" },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#E1F5FE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },

  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  profileInfo: { alignItems: "center", marginVertical: 15 },
  nameTxt: { fontSize: 22, fontWeight: "800", color: "#2D3436" },
  subTxt: { fontSize: 14, color: "#636E72", marginTop: 4 },

  // تنسيق جديد لنوع الصعوبة
  difficultyBadge: {
    backgroundColor: "#EBF5FF",
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  difficultyText: { fontSize: 13, color: "#3498DB", fontWeight: "700" },

  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  chartCard: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 12,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#2D3436",
    textAlign: "center",
    marginBottom: 15,
  },

  chartBody: { flexDirection: "row-reverse", height: 80 },
  yAxis: {
    width: 30,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  axisTxt: { fontSize: 8, color: "#B2BEC3", fontWeight: "bold" },
  chartArea: {
    flex: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: "#F1F2F6",
    position: "relative",
  },
  gridLine: {
    height: 1,
    backgroundColor: "#F8F9FA",
    width: "100%",
    marginBottom: 18,
  },
  chartLineLayer: { position: "absolute", width: "100%", height: "100%" },
  dataPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: "absolute",
    zIndex: 2,
  },
  pointPulse: {
    width: 12,
    height: 12,
    borderRadius: 6,
    opacity: 0.2,
    position: "absolute",
    top: -3,
    left: -3,
  },
  xAxis: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    paddingRight: 35,
    marginTop: 8,
  },
  axisTxtX: { fontSize: 7, color: "#999", fontWeight: "700" },

  barArea: { flexDirection: "row-reverse", height: 80 },
  barsContainer: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    justifyContent: "space-around",
  },
  barCol: { alignItems: "center" },
  barBody: { width: 14, borderRadius: 4 },
  barVal: { fontSize: 9, fontWeight: "800", marginBottom: 4 },
  barLab: { fontSize: 7, color: "#636E72", marginTop: 6, fontWeight: "bold" },

  circleContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  circleBorder: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    borderWidth: 6,
    borderColor: "#3498DB",
    justifyContent: "center",
    alignItems: "center",
  },
  circleText: { fontSize: 18, fontWeight: "900", color: "#2D3436" },

  divider: { height: 1, backgroundColor: "#F1F2F6", marginVertical: 12 },
  ratingRow: { flexDirection: "row-reverse", justifyContent: "center" },
  ratingCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginHorizontal: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  ratingNum: { fontSize: 10 },

  footerBtn: {
    flexDirection: "row-reverse",
    backgroundColor: "#FFF",
    padding: 18,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  btnIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
  btnLabel: {
    flex: 1,
    textAlign: "right",
    fontSize: 15,
    fontWeight: "700",
    color: "#2D3436",
  },

  shadowCard: {
    elevation: 4,
    shadowColor: "#3498DB",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
});

import {
    Dimensions,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

// --- مكون نظام التقييم (1-5) ---
const RatingScale = ({ activeScore }) => {
  return (
    <View style={styles.ratingWrapper}>
      {[5, 4, 3, 2, 1].map((num) => (
        <View
          key={num}
          style={[styles.ratingDot, activeScore === num && styles.activeDot]}
        >
          <Text
            style={[
              styles.ratingNum,
              activeScore === num && styles.activeNumText,
            ]}
          >
            {num}
          </Text>
        </View>
      ))}
    </View>
  );
};

// --- مكون بطاقة المؤشرات الصغيرة ---
const MetricCard = ({ title, color, score, emoji }) => (
  <View style={styles.metricCard}>
    <View style={styles.cardHeaderRow}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <Text style={styles.metricTitle}>{title}</Text>
    </View>

    {/* شكل جمالي يمثل الرسم البياني */}
    <View style={styles.visualGraph}>
      <View
        style={[
          styles.miniBar,
          { height: "40%", backgroundColor: color + "88" },
        ]}
      />
      <View
        style={[styles.miniBar, { height: "70%", backgroundColor: color }]}
      />
      <View
        style={[
          styles.miniBar,
          { height: "55%", backgroundColor: color + "88" },
        ]}
      />
      <View
        style={[styles.miniBar, { height: "90%", backgroundColor: color }]}
      />
    </View>

    <View style={styles.divider} />
    <Text style={styles.ratingLabel}>مستوى الإنجاز</Text>
    <RatingScale activeScore={score} />
  </View>
);

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      {/* البار العلوي - تصميم أنيق */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={{ fontSize: 18 }}>📄</Text>
        </TouchableOpacity>
        <Text style={styles.headerMainTitle}>لوحة المتابعة</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Text style={{ fontSize: 18 }}>〉</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* قسم الملف الشخصي بتصميم بطاقة زجاجية */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBorder}>
            <View style={styles.avatarInternal}>
              <Text style={{ fontSize: 45 }}>👦🏻</Text>
            </View>
          </View>
          <Text style={styles.childName}>محمد عبدالله</Text>
          <View style={styles.tagsRow}>
            <View style={[styles.tag, { backgroundColor: "#E3F2FD" }]}>
              <Text style={styles.tagText}>4 سنوات</Text>
            </View>
            <View style={[styles.tag, { backgroundColor: "#FFF3E0" }]}>
              <Text style={styles.tagText}>تشتت انتباه</Text>
            </View>
          </View>
        </View>

        {/* شبكة المؤشرات */}
        <View style={styles.grid}>
          <MetricCard
            title="الذاكرة العاملة"
            color="#4facfe"
            score={1}
            emoji="🧠"
          />
          <MetricCard
            title="الانتباه والتركيز"
            color="#43e97b"
            score={2}
            emoji="🎯"
          />
          <MetricCard
            title="الإدراك البصري"
            color="#f6d365"
            score={3}
            emoji="👁️"
          />
          <MetricCard
            title="حل المشكلات"
            color="#fa709a"
            score={2}
            emoji="🧩"
          />
        </View>

        {/* بطاقة الأداء العام الكبيرة */}
        <View style={styles.mainProgressCard}>
          <Text style={styles.mainProgressTitle}>متوسط الأداء العام</Text>
          <View style={styles.outerCircle}>
            <View style={styles.innerCircle}>
              <Text style={styles.bigPercent}>92%</Text>
            </View>
          </View>
          <View style={{ width: "60%", marginTop: 10 }}>
            <RatingScale activeScore={1} />
          </View>
        </View>

        {/* زر التقييم السفلي */}
        <TouchableOpacity activeOpacity={0.8} style={styles.footerAction}>
          <View style={styles.footerIconBox}>
            <Text style={{ fontSize: 20 }}>📝</Text>
          </View>
          <Text style={styles.footerActionText}>استمارة تقييم ولي الأمر</Text>
          <Text style={{ color: "#AAA", marginLeft: 10 }}>〉</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- التنسيقات الجمالية المحسنة ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FBFF" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
  },
  headerMainTitle: { fontSize: 18, fontWeight: "bold", color: "#2D3436" },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowOpacity: 0.1,
  },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  profileCard: {
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 25,
    padding: 20,
    marginBottom: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
  },
  avatarBorder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    padding: 3,
    backgroundColor: "#4facfe",
    marginBottom: 12,
  },
  avatarInternal: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
  },
  childName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 8,
  },
  tagsRow: { flexDirection: "row-reverse" },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tagText: { fontSize: 12, color: "#555", fontWeight: "600" },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricCard: {
    backgroundColor: "#FFF",
    width: "48%",
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowOpacity: 0.03,
  },
  cardHeaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 15,
  },
  cardEmoji: { fontSize: 16, marginLeft: 8 },
  metricTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#636E72",
    flex: 1,
    textAlign: "right",
  },

  visualGraph: {
    flexDirection: "row",
    height: 40,
    alignItems: "flex-end",
    justifyContent: "center",
    marginBottom: 15,
  },
  miniBar: { width: 6, marginHorizontal: 3, borderRadius: 3 },

  divider: {
    height: 1,
    backgroundColor: "#F1F2F6",
    width: "100%",
    marginBottom: 10,
  },
  ratingLabel: {
    fontSize: 9,
    color: "#B2BEC3",
    textAlign: "center",
    marginBottom: 6,
  },

  mainProgressCard: {
    backgroundColor: "#FFF",
    borderRadius: 25,
    padding: 25,
    alignItems: "center",
    elevation: 3,
    marginBottom: 20,
  },
  mainProgressTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3436",
    marginBottom: 20,
  },
  outerCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F1F2F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  innerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF",
    borderWidth: 6,
    borderColor: "#4facfe",
    justifyContent: "center",
    alignItems: "center",
  },
  bigPercent: { fontSize: 24, fontWeight: "bold", color: "#4facfe" },

  ratingWrapper: { flexDirection: "row-reverse", justifyContent: "center" },
  ratingDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F1F2F6",
    marginHorizontal: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  activeDot: { backgroundColor: "#43e97b" },
  ratingNum: { fontSize: 11, color: "#B2BEC3" },
  activeNumText: { color: "#FFF", fontWeight: "bold" },

  footerAction: {
    flexDirection: "row-reverse",
    backgroundColor: "#3bb4ff",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    elevation: 4,
  },
  footerIconBox: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(181, 198, 235, 0.1)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 15,
  },
  footerActionText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
  },
});

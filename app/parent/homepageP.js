import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

// 🔥 استيراد Firebase
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../FirebaseConfig";

const { width } = Dimensions.get("window");

// --- المكونات الفرعية ---

const ProgressCard = ({ percentage, improvement }) => (
  <View style={styles.card}>
    <View style={styles.progressRow}>
      <View style={styles.progressTextContainer}>
        <Text style={styles.cardTitle}>متوسط التحسن العام لطفلك</Text>
        <Text style={styles.cardSubTitle}>
          تحسن طفلك بنسبة{" "}
          <Text style={{ color: "#4CAF50", fontWeight: "bold" }}>
            {improvement}
          </Text>{" "}
          عن الشهر الماضي
        </Text>
      </View>
      <View style={styles.circleProgress}>
        <Text style={styles.percentageText}>{percentage}%</Text>
      </View>
    </View>
  </View>
);

const DoctorCard = ({ name, message, time }) => (
  <View style={[styles.card, styles.doctorCard]}>
    <View style={styles.doctorInfo}>
      <Image
        source={{ uri: "https://via.placeholder.com/50" }}
        style={styles.avatar}
      />
      <View style={{ marginRight: 10 }}>
        <Text style={styles.doctorName}>{name}</Text>
        <Text style={styles.timeText}>{time}</Text>
      </View>
    </View>
    <Text style={styles.messageText}>{message}</Text>
    <TouchableOpacity style={styles.viewButton}>
      <Text style={styles.viewButtonText}>عرض {">"}</Text>
    </TouchableOpacity>
  </View>
);

// --- الواجهة الرئيسية ---

export default function App() {
  const router = useRouter();

  // 🔥 جلب بيانات الوالد
  const auth = getAuth();
  const [parentData, setParentData] = useState(null);

  useEffect(() => {
    const fetchParentData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      // 🔥 الحل الأول: نجيب البيانات من Users
      const ref = doc(db, "Users", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setParentData(snap.data());
      }
    };

    fetchParentData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* الهيدر */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Text style={styles.bellIcon}>🔔</Text>
          </TouchableOpacity>

          {/* 🔥 اسم الوالد من الداتابيس */}
          <Text style={styles.welcomeText}>
            مرحباً، {parentData?.name || "الوالد"} 👋
          </Text>
        </View>

        {/* 🔥 كارت التحسن من الداتابيس */}
        <ProgressCard
          percentage={parentData?.progress || 0}
          improvement={parentData?.improvement || "0%"}
        />

        {/* كارت الطبيبة */}
        <DoctorCard
          name="دكتورة سارة"
          time="اليوم 11:00 صباحاً"
          message="تحسن ممتاز ماشاء الله..."
        />

        {/* زر تقييم الطفل */}
        <TouchableOpacity
          style={[styles.card, { alignItems: "center" }]}
          onPress={() => router.push("/parent/ParentAssessmentForm")}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold" }}>تقييم الطفل</Text>
        </TouchableOpacity>

        {/* قسم البطاقات الصغيرة */}
        <View style={styles.row}>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.smallCardTitle}>عدد الجلسات الغير مكتمله</Text>
            <Text style={styles.bigNumber}>2</Text>
          </View>

          <View style={[styles.card, styles.halfCard]}>
            <Image
              source={{ uri: "https://via.placeholder.com/40" }}
              style={styles.childAvatar}
            />

            {/* 🔥 اسم الطفل من الداتابيس */}
            <Text style={styles.childName}>
              {parentData?.childName || "اسم الطفل"}
            </Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>تقدم في المهارات الحركية</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.linkText}>عرض التقرير {">"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* بنر الأنشطة */}
        <TouchableOpacity
          style={styles.banner}
          onPress={() => router.push("/parent/IntroScreen")}
        >
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>الانتقال إلى وضع</Text>
            <Text style={styles.bannerSubTitle}>الأنشطة</Text>
          </View>
          <View style={styles.arrowCircle}>
            <Text style={{ color: "#fff", fontSize: 20 }}>→</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- التنسيقات (نفس كودك بدون أي تغيير) ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 20,
    alignItems: "flex-end",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 25,
    marginTop: 10,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  bellIcon: {
    fontSize: 24,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 15,
    width: "100%",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  progressRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTextContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 5,
  },
  cardSubTitle: {
    fontSize: 13,
    color: "#777",
    textAlign: "right",
  },
  circleProgress: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: "#E0E0E0",
    borderTopColor: "#4A90E2",
    justifyContent: "center",
    alignItems: "center",
  },
  percentageText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
  },
  doctorCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  doctorInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "#EEE",
  },
  doctorName: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "right",
  },
  timeText: {
    fontSize: 10,
    color: "#AAA",
    textAlign: "right",
  },
  messageText: {
    fontSize: 12,
    color: "#666",
    flex: 1,
    textAlign: "right",
    marginHorizontal: 10,
  },
  viewButton: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  viewButtonText: {
    color: "#4A90E2",
    fontSize: 11,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  halfCard: {
    width: "48%",
    alignItems: "center",
    minHeight: 140,
  },
  bigNumber: {
    fontSize: 50,
    color: "#4A90E2",
    fontWeight: "bold",
    marginTop: 10,
  },
  smallCardTitle: {
    fontSize: 13,
    textAlign: "center",
    color: "#555",
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 5,
  },
  childName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  badge: {
    backgroundColor: "#E8F5E9",
    padding: 4,
    borderRadius: 5,
    marginVertical: 5,
  },
  badgeText: {
    fontSize: 9,
    color: "#2E7D32",
  },
  linkText: {
    color: "#4A90E2",
    fontSize: 11,
    marginTop: 5,
  },
  banner: {
    width: "100%",
    height: 120,
    backgroundColor: "#4A90E2",
    borderRadius: 25,
    marginTop: 10,
    padding: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  bannerTitle: {
    color: "#FFF",
    fontSize: 20,
    textAlign: "right",
  },
  bannerSubTitle: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "right",
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});

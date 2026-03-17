import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

const children = [
  {
    id: 1,
    name: "محمد عبدالله",
    age: 4,
    difficulty: "تشتت انتباه",
    progress: 76,
  },
  {
    id: 2,
    name: "خالد فهد",
    age: 3,
    difficulty: "صعوبة في التركيز",
    progress: 61,
  },
  {
    id: 3,
    name: "فاطمة أحمد",
    age: 4,
    difficulty: "تشتت وصعوبة تركيز",
    progress: 38,
  },
];

function DefaultAvatar() {
  return (
    <View style={styles.avatar}>
      <Ionicons name="person" size={22} color="#6E8FC8" />
    </View>
  );
}

function getProgressColor(progress) {
  if (progress >= 70) {
    return "#2ECC71";
  }

  if (progress >= 50) {
    return "#5A8DEE";
  }

  return "#F5A623";
}

export default function HomepageS() {
  return (
    <View style={styles.screen}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* HEADER */}

          <View style={styles.header}>
            <TouchableOpacity style={styles.notificationBubble}>
              <Ionicons name="notifications" size={22} color="#fbc707" />

              <View style={styles.notificationDot} />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.greeting}>مرحباً د. كوثر</Text>
              <Text style={styles.sub}>لوحة متابعة الأطفال</Text>
            </View>

            <DefaultAvatar />
          </View>

          {/* SEARCH */}

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color="#888" />

            <TextInput placeholder="ابحث عن طفل" style={styles.searchInput} />
          </View>

          {/* STATS */}

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>عدد الأطفال</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>88%</Text>
              <Text style={styles.statLabel}>متوسط التحسن</Text>
            </View>
          </View>

          {/* REVIEW CARD */}

          <View style={styles.reviewCard}>
            <Ionicons name="warning-outline" size={22} color="#F5A623" />

            <Text style={styles.reviewTitle}>الحالات التي تحتاج مراجعة</Text>

            <Text style={styles.reviewSub}>فاطمة أحمد</Text>
          </View>

          {/* SECTION HEADER */}

          <View style={styles.sectionHeader}>
            <TouchableOpacity style={styles.addBtn}>
              <Ionicons name="add" size={16} color="#fff" />

              <Text style={styles.addText}>إضافة طفل</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>
              الأطفال المسجلين لديك ({children.length})
            </Text>
          </View>

          {/* CHILDREN */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 15 }}
            contentContainerStyle={{ paddingLeft: 20 }}
          >
            {children.map((child) => {
              const color = getProgressColor(child.progress);

              return (
                <View key={child.id} style={styles.childCardHorizontal}>
                  <DefaultAvatar />

                  <Text style={styles.childName}>{child.name}</Text>

                  <Text style={styles.childMeta}>العمر: {child.age}</Text>

                  <Text style={styles.childMeta}>{child.difficulty}</Text>

                  <Text style={[styles.progress, { color: color }]}>
                    {child.progress}%
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* BOTTOM NAV */}

        <View style={styles.navbar}>
          <View style={styles.navItem}>
            <Ionicons name="home" size={24} color="#5A8DEE" />
            <Text style={styles.navTextActive}>الرئيسية</Text>
          </View>

          <View style={styles.navItem}>
            <Ionicons name="chatbubble-outline" size={24} color="#888" />
            <Text style={styles.navText}>المحادثات</Text>
          </View>

          <View style={styles.navItem}>
            <Ionicons name="settings-outline" size={24} color="#888" />
            <Text style={styles.navText}>الإعدادات</Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 10,
  },

  headerCenter: {
    alignItems: "center",
  },

  greeting: {
    fontSize: 22,
    fontWeight: "700",
  },

  sub: {
    fontSize: 13,
    color: "#777",
    marginTop: 2,
  },

  iconBtn: {
    padding: 6,
  },

  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#EAF2FF",
    alignItems: "center",
    justifyContent: "center",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F8FB",
    marginHorizontal: 20,
    marginTop: 15,
    padding: 12,
    borderRadius: 14,
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginTop: 20,
  },

  statCard: {
    backgroundColor: "#F8FAFF",
    width: "48%",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEF2FF",
  },

  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#5A8DEE",
  },

  statLabel: {
    marginTop: 4,
    color: "#777",
  },

  reviewCard: {
    backgroundColor: "#FFF6E8",
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFE2B5",
  },

  reviewTitle: {
    fontWeight: "700",
    marginTop: 4,
  },

  reviewSub: {
    color: "#777",
    marginTop: 2,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 25,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#5A8DEE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },

  addText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 4,
    fontSize: 12,
  },

  childCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FBFF",
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EEF2FF",
  },

  childName: {
    fontWeight: "700",
  },

  childMeta: {
    color: "#777",
    marginTop: 2,
  },

  progress: {
    marginTop: 4,
    fontWeight: "700",
  },

  navbar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#EEE",
  },

  navItem: {
    alignItems: "center",
  },

  navText: {
    fontSize: 11,
    color: "#888",
  },

  navTextActive: {
    fontSize: 11,
    color: "#5A8DEE",
  },

  notificationBubble: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F6FF",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#5A8DEE",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  notificationDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF4D4F",
  },
  childCardHorizontal: {
    width: 170,
    height: 180,
    backgroundColor: "#F9FBFF",
    marginRight: 15,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    alignItems: "center",

    shadowColor: "#4d76bd",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 100 },
  },
});

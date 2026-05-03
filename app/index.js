// app/index.js
// 🧪 صفحة اختبار للتنقل بين كل صفحات التطبيق
// راح تتحول لاحقاً لـ Splash Screen

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  SPACING,
} from "../constants/theme";

export default function TestIndex() {
  const router = useRouter();
  const [testChildId, setTestChildId] = useState("");
  const [testChildName, setTestChildName] = useState("");

  // للصفحات اللي تحتاج childId
  const goToWithChild = (pathname) => {
    if (!testChildId.trim()) {
      Alert.alert(
        "تنبيه",
        "هذي الصفحة تحتاج childId. الصقي معرّف الطفل في الحقل أعلاه أول.",
      );
      return;
    }
    router.push({
      pathname,
      params: {
        childId: testChildId.trim(),
        childName: testChildName.trim() || "طفل اختبار",
      },
    });
  };

  // ========== الأقسام والصفحات ==========

  const sections = [
    {
      title: "🔐 المصادقة (Auth)",
      pages: [
        { label: "اختيار الدور", icon: "people", path: "/auth/choose-role" },
        { label: "تسجيل الدخول", icon: "log-in", path: "/auth/Login" },
        { label: "إنشاء حساب", icon: "person-add", path: "/auth/register" },
        { label: "نسيت كلمة السر", icon: "key", path: "/auth/reset-password" },
      ],
    },
    {
      title: "👨‍👩 ولي الأمر",
      pages: [
        { label: "شاشة الترحيب", icon: "happy", path: "/parent/IntroScreen" },
        {
          label: "الرئيسية - ولي الأمر",
          icon: "home",
          path: "/parent/homepageP",
        },
        {
          label: "أنشطة الطفل",
          icon: "game-controller",
          path: "/parent/Activities",
        },
        {
          label: "تقرير الطفل",
          icon: "document-text",
          path: "/parent/ChildReport",
        },
        { label: "المحادثة", icon: "chatbubbles", path: "/parent/Chat" },
        {
          label: "استمارة ولي الأمر",
          icon: "clipboard",
          path: "/parent/ParentAssessmentForm",
          requiresChild: true,
        },
      ],
    },
    {
      title: "👨‍⚕️ الأخصائي",
      pages: [
        {
          label: "الرئيسية - الأخصائي",
          icon: "home",
          path: "/specialist/homepageS",
        },
        {
          label: "إضافة طفل",
          icon: "person-add",
          path: "/specialist/AddChild",
        },
        {
          label: "بروفايل الطفل (Dashboard)",
          icon: "stats-chart",
          path: "/specialist/Dashboard",
          requiresChild: true,
        },
        {
          label: "الخطة العلاجية",
          icon: "clipboard",
          path: "/specialist/TreatPlan",
          requiresChild: true,
        },
        {
          label: "استمارة الأخصائي",
          icon: "document-text",
          path: "/specialist/spform",
          requiresChild: true,
        },
      ],
    },
    {
      title: "⚙️ الإعدادات",
      pages: [
        {
          label: "الإعدادات",
          icon: "settings-outline",
          path: "/specialist/Settings",
        },
      ],
    },
    {
      title: "🧠 ألعاب الذاكرة",
      color: "#9C27B0",
      pages: [
        {
          label: "بطاقات الذاكرة",
          icon: "albums",
          path: "/activities/MemoryCard",
        },
        {
          label: "لعبة المطابقة",
          icon: "git-compare",
          path: "/activities/MatchingGame",
        },
      ],
    },
    {
      title: "👁 ألعاب التركيز",
      color: "#FFC107",
      pages: [
        {
          label: "ابحث عن الكرة",
          icon: "tennisball",
          path: "/activities/FindBallActivity",
        },
        {
          label: "الفقاعات",
          icon: "water",
          path: "/activities/BubbleActivity",
        },
      ],
    },
    {
      title: "💡 ألعاب التفكير",
      color: "#2196F3",
      pages: [
        { label: "الهرم", icon: "triangle", path: "/activities/Pyramid" },
        {
          label: "تحدي الأشكال",
          icon: "shapes",
          path: "/activities/ShapeChallenge",
        },
        { label: "إكس أو", icon: "grid", path: "/activities/XO-Activity" },
        {
          label: "إكمال القصة",
          icon: "book",
          path: "/activities/StoryCompletionActivity",
        },
      ],
    },
    {
      title: "🔷 ألعاب الإدراك البصري",
      color: "#F44336",
      pages: [
        {
          label: "الألوان",
          icon: "color-palette",
          path: "/activities/ColorActivity",
        },
        {
          label: "الشكل المختلف",
          icon: "scan",
          path: "/activities/DifferentShapeActivity",
        },
        {
          label: "إيجاد الأشكال",
          icon: "search",
          path: "/activities/ShapeFindingActivity",
        },
      ],
    },
  ];

  const handlePress = (page) => {
    if (page.requiresChild) {
      goToWithChild(page.path);
    } else {
      router.push(page.path);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.WHITE} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: SPACING.xxxl }}
          showsVerticalScrollIndicator={false}
        >
          {/* ============ الهيدر ============ */}
          <View style={styles.header}>
            <View style={styles.headerCenter}>
              <Text style={styles.greeting}>🌸 نماء</Text>
              <Text style={styles.sub}>وضع الاختبار - تنقل بين الصفحات</Text>
            </View>
          </View>

          {/* ============ بطاقة childId ============ */}
          <View style={styles.testCard}>
            <View style={styles.testCardHeader}>
              <Ionicons
                name="information-circle"
                size={20}
                color={COLORS.PRIMARY}
              />
              <Text style={styles.testTitle}>معرّف الطفل (للاختبار)</Text>
            </View>
            <Text style={styles.testHint}>
              للصفحات اللي تحتاج childId. الصقيه من Firestore.
            </Text>
            <TextInput
              style={styles.input}
              placeholder="childId مثال: abc123xyz"
              placeholderTextColor={COLORS.MUTED}
              value={testChildId}
              onChangeText={setTestChildId}
              textAlign="right"
            />
            <TextInput
              style={styles.input}
              placeholder="اسم الطفل (اختياري)"
              placeholderTextColor={COLORS.MUTED}
              value={testChildName}
              onChangeText={setTestChildName}
              textAlign="right"
            />
          </View>

          {/* ============ الأقسام ============ */}
          {sections.map((section, idx) => (
            <View key={idx} style={styles.section}>
              <Text
                style={[
                  styles.sectionTitle,
                  section.color && { color: section.color },
                ]}
              >
                {section.title}
              </Text>

              {section.pages.map((page, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.pageButton}
                  onPress={() => handlePress(page)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      section.color && {
                        backgroundColor: section.color + "20",
                      },
                    ]}
                  >
                    <Ionicons
                      name={page.icon}
                      size={20}
                      color={section.color || COLORS.PRIMARY}
                    />
                  </View>

                  <View style={styles.labelWrap}>
                    <Text style={styles.pageLabel}>{page.label}</Text>
                    {page.requiresChild && (
                      <Text style={styles.requiresHint}>
                        ⚠️ يحتاج معرّف طفل
                      </Text>
                    )}
                  </View>

                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={COLORS.MUTED}
                  />
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* ============ الفوتر ============ */}
          <Text style={styles.footer}>🌸 تطبيق نماء - جلسة تطوير</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },

  // ========== الهيدر ==========
  header: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    marginTop: SPACING.md,
  },
  headerCenter: {
    alignItems: "center",
  },
  greeting: {
    fontSize: FONT_SIZE.xxxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.PRIMARY,
  },
  sub: {
    fontSize: FONT_SIZE.md,
    color: COLORS.MUTED,
    marginTop: 4,
  },

  // ========== بطاقة childId ==========
  testCard: {
    backgroundColor: COLORS.CARD_BG,
    marginHorizontal: SPACING.xl,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    marginBottom: SPACING.md,
  },
  testCardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  testTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.TEXT,
    textAlign: "right",
  },
  testHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.MUTED,
    textAlign: "right",
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.WHITE,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZE.base,
    color: COLORS.TEXT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
  },

  // ========== الأقسام ==========
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.TEXT,
    textAlign: "right",
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },

  // ========== أزرار الصفحات ==========
  pageButton: {
    backgroundColor: COLORS.CARD_BG_ALT,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  labelWrap: {
    flex: 1,
    marginHorizontal: SPACING.md,
  },
  pageLabel: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.TEXT,
    textAlign: "right",
  },
  requiresHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.WARNING,
    textAlign: "right",
    marginTop: 3,
    fontWeight: FONT_WEIGHT.medium,
  },

  // ========== الفوتر ==========
  footer: {
    textAlign: "center",
    color: COLORS.MUTED,
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xxl,
  },
});

import {
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/theme";

const SECTIONS = [
  {
    icon: "shield-checkmark",
    title: "حماية بياناتك",
    text: "في تطبيق نماء، خصوصيتك وبيانات طفلك أولوية قصوى. نلتزم بحماية معلوماتك الشخصية وفقاً لأعلى معايير الأمان الرقمي.",
  },
  {
    icon: "information-circle",
    title: "البيانات التي نجمعها",
    text: "نقوم بجمع المعلومات التالية فقط لتقديم الخدمة:\n\n• الاسم والبريد الإلكتروني\n• معلومات الطفل (الاسم، تاريخ الميلاد، نوع الصعوبة)\n• نتائج الأنشطة والتقييمات\n• المحادثات بين ولي الأمر والأخصائي",
  },
  {
    icon: "people",
    title: "كيف نستخدم بياناتك",
    text: "نستخدم بياناتك حصرياً للأغراض التالية:\n\n• تقديم الخدمة العلاجية للطفل\n• متابعة تطور الطفل\n• التواصل بين ولي الأمر والأخصائي\n• تحسين تجربة الاستخدام",
  },
  {
    icon: "lock-closed",
    title: "أمان البيانات",
    text: "نستخدم تقنيات تشفير متقدمة من خلال خدمات Google Firebase لحماية بياناتك. الوصول للمعلومات محصور بين ولي الأمر المعني والأخصائي المختص فقط.",
  },
  {
    icon: "share-social",
    title: "مشاركة البيانات",
    text: "لا نقوم ببيع أو مشاركة بياناتك مع أي طرف ثالث. البيانات تُشارك فقط بين ولي الأمر والأخصائي المعالج المرتبط بالطفل.",
  },
  {
    icon: "person",
    title: "حقوقك",
    text: "لك الحق في:\n\n• الوصول لبياناتك في أي وقت\n• تعديل أو تحديث معلوماتك\n• طلب حذف حسابك وبياناتك\n• معرفة كيفية استخدام بياناتك",
  },
  {
    icon: "mail",
    title: "تواصل معنا",
    text: "لأي استفسار حول الخصوصية، تواصلي معنا عبر البريد الإلكتروني: support@namaa.app",
  },
];

export default function Privacy() {
  const router = useRouter();

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
            <Text style={styles.headerTitle}>سياسة الخصوصية</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section, index) => (
          <View key={index} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBox}>
                <Ionicons
                  name={section.icon}
                  size={20}
                  color={COLORS.PRIMARY_DARK}
                />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionText}>{section.text}</Text>
          </View>
        ))}

        <Text style={styles.footerNote}>آخر تحديث: يناير 2026</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },

  headerGradient: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
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
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  sectionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT,
    flex: 1,
    textAlign: "right",
  },
  sectionText: {
    fontSize: 13,
    color: COLORS.MUTED,
    lineHeight: 22,
    textAlign: "right",
  },
  footerNote: {
    textAlign: "center",
    fontSize: 11,
    color: COLORS.MUTED,
    marginTop: 8,
  },
});

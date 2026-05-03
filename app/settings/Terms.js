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
    icon: "document-text",
    title: "قبول الشروط",
    text: "باستخدامك لتطبيق نماء، فإنك توافقين على هذه الشروط والأحكام. إذا لم توافقي عليها، يرجى عدم استخدام التطبيق.",
  },
  {
    icon: "person-circle",
    title: "الأهلية",
    text: "يجب أن يكون عمرك 18 سنة فأكثر لاستخدام التطبيق. إذا كنتِ ولي أمر، فأنتِ مسؤولة عن استخدام طفلك للتطبيق تحت إشرافك المباشر.",
  },
  {
    icon: "medical",
    title: "ملاحظة طبية مهمة",
    text: "تطبيق نماء أداة مساعدة وليس بديلاً عن الاستشارة الطبية أو العلاج المتخصص. الأنشطة والتقييمات في التطبيق تُستخدم تحت إشراف أخصائي مؤهل، ولا تشكل تشخيصاً طبياً نهائياً.",
  },
  {
    icon: "shield",
    title: "حقوق الطفل",
    text: "نلتزم بحماية حقوق الأطفال:\n\n• لا نطلب معلومات من الأطفال مباشرة\n• البيانات تُدخل بواسطة ولي الأمر أو الأخصائي\n• نتبع معايير حماية الأطفال الرقمية",
  },
  {
    icon: "ban",
    title: "الاستخدام الممنوح",
    text: "يُمنع منعاً تاماً:\n\n• استخدام التطبيق لأغراض غير شخصية\n• محاولة اختراق أو تعطيل الخدمة\n• مشاركة معلومات حساب آخر\n• إساءة استخدام نظام المحادثات",
  },
  {
    icon: "alert-circle",
    title: "إنهاء الحساب",
    text: "نحتفظ بالحق في تعليق أو إنهاء أي حساب يخالف هذه الشروط. كما يمكنكِ إنهاء حسابك في أي وقت من خلال الإعدادات أو التواصل معنا.",
  },
  {
    icon: "refresh",
    title: "تحديث الشروط",
    text: "قد نقوم بتحديث هذه الشروط من حين لآخر. سنقوم بإشعارك بأي تغييرات جوهرية، ويُعتبر استمرارك في استخدام التطبيق موافقة على الشروط المحدثة.",
  },
];

export default function Terms() {
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
            <Text style={styles.headerTitle}>الشروط والأحكام</Text>
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

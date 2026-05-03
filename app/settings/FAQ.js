import { useState } from "react";
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

const FAQS = [
  {
    question: "ما هو تطبيق نماء؟",
    answer:
      "نماء تطبيق علاجي يربط بين أولياء الأمور والأخصائيين لمتابعة تطور الأطفال ذوي الاحتياجات النمائية، ويوفر أنشطة تنموية مخصصة وتقارير دقيقة.",
  },
  {
    question: "كيف يتم ربط طفلي بالأخصائي؟",
    answer:
      "بعد تسجيلك كولي أمر، يقوم الأخصائي بإضافة طفلك من حسابه باستخدام بريدك الإلكتروني، ثم يظهر الطفل تلقائياً في حسابك.",
  },
  {
    question: "كيف أتواصل مع الأخصائي؟",
    answer:
      "من خلال تبويب \"المحادثات\" في الشريط السفلي، ستظهر لك محادثة مع الأخصائي المعالج لطفلك. يمكنكما التواصل مباشرة في أي وقت.",
  },
  {
    question: "ماذا أفعل إذا نسيت كلمة المرور؟",
    answer:
      "في صفحة تسجيل الدخول، اضغطي على \"نسيت كلمة المرور؟\"، أدخلي بريدك الإلكتروني، وسيتم إرسال رابط لإعادة تعيين كلمة المرور.",
  },
  {
    question: "هل بيانات طفلي آمنة؟",
    answer:
      "نعم. نستخدم تقنيات تشفير متقدمة من Google Firebase لحماية البيانات. لا يستطيع الوصول لمعلومات طفلك سوى أنتِ والأخصائي المعالج.",
  },
  {
    question: "كيف يقوم الأخصائي بتقييم طفلي؟",
    answer:
      "يقوم الأخصائي باستخدام استمارة تقييم شاملة تغطي عدة مجالات (الذاكرة، التركيز، التفكير، الإدراك)، ويتم بناء خطة علاجية مخصصة بناءً على النتائج.",
  },
  {
    question: "هل يمكنني عرض خطة علاج طفلي؟",
    answer:
      "نعم. عند فتح بطاقة طفلك من الصفحة الرئيسية، ستجدين قسم \"الخطة العلاجية\" يعرض الأهداف والجرعة العلاجية والأنشطة المخصصة.",
  },
  {
    question: "هل التطبيق مجاني؟",
    answer:
      "حالياً، التطبيق مجاني تماماً. سنخبرك بأي تحديثات مستقبلية عبر الإشعارات.",
  },
  {
    question: "كيف أحدّث معلومات حسابي؟",
    answer:
      "في الإعدادات، اضغطي على \"تعديل الملف الشخصي\" لتحديث اسمك أو بريدك. لتغيير كلمة المرور، اضغطي على \"تغيير كلمة المرور\".",
  },
  {
    question: "ماذا أفعل إذا واجهت مشكلة تقنية؟",
    answer:
      "تواصلي معنا من خلال صفحة \"تواصل معنا\" في الإعدادات على البريد: support@namaa.app",
  },
];

export default function FAQ() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState(null);

  const toggleFaq = (index) => {
    setExpandedId(expandedId === index ? null : index);
  };

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
            <Text style={styles.headerTitle}>الأسئلة الشائعة</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Ionicons name="help-circle" size={32} color={COLORS.PRIMARY} />
          <Text style={styles.introTitle}>كيف يمكننا مساعدتك؟</Text>
          <Text style={styles.introText}>
            إجابات على الأسئلة الأكثر شيوعاً
          </Text>
        </View>

        {FAQS.map((faq, index) => {
          const isExpanded = expandedId === index;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.faqCard, isExpanded && styles.faqCardActive]}
              onPress={() => toggleFaq(index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Ionicons
                  name={isExpanded ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={COLORS.PRIMARY_DARK}
                />
                <Text style={styles.faqQuestion}>{faq.question}</Text>
              </View>
              {isExpanded && (
                <View style={styles.faqAnswerBox}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
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

  intro: {
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 12,
  },
  introTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.TEXT,
    marginTop: 8,
  },
  introText: {
    fontSize: 12,
    color: COLORS.MUTED,
    marginTop: 4,
  },
  faqCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  faqCardActive: {
    borderColor: COLORS.PRIMARY_LIGHT,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  faqHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT,
    textAlign: "right",
  },
  faqAnswerBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  faqAnswer: {
    fontSize: 13,
    color: COLORS.MUTED,
    textAlign: "right",
    lineHeight: 22,
  },
});

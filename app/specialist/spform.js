// ============================================================
//BATOOLH
// ============================================================

import { useRouter } from "expo-router";
import { useState } from "react";
import {
  I18nManager,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ── تفعيل RTL ─────────────────────────────────────────────
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// ── خيارات الراديو الثابتة ──────────────────────────────
const RADIO_OPTIONS = ["أبدا", "احيانا", "غالبا", "دائما"];

// ════════════════════════════════════════════════════════════
//  تعريف كل الصفحات ومحتواها
// ════════════════════════════════════════════════════════════
const PAGES = [
  // ── صفحة 1 ─────────────────────────────────────────────
  {
    section: "المهارات الإدراكية والأكاديمية",
    badgeBg: "#C6F0D0",
    badgeText: "#1E6B35",
    btnColor: "#5BAD8A",
    questions: [
      {
        id: "q1",
        type: "radio",
        text:
          "1- يظهر الطفل تواصلاً بصرياً عند المناداة باسمه / عند اللعب معه / عند الضحك معه",
      },
      {
        id: "q2",
        type: "radio",
        text:
          "2- يظهر الطفل القدرة على اللعب التخيلي\n(يتظاهر بإطعام دمية / التحدث بالهاتف / تحريك سيارة / يمثل دور بابا أو ماما أو طبيب)",
      },
      {
        id: "q3",
        type: "radio",
        text:
          "3- هل يظهر الطفل القدرة على مطابقة الأشياء المتماثلة؟\n(مطابقة الجوارب / الأحذية المشابهة / تنسيق غطاء العلبة مع العلبة الصحيحة)",
      },
    ],
  },

  // ── صفحة 2 ─────────────────────────────────────────────
  {
    section: "المهارات الإدراكية والأكاديمية",
    badgeBg: "#C6F0D0",
    badgeText: "#1E6B35",
    btnColor: "#5BAD8A",
    questions: [
      {
        id: "q4",
        type: "radio",
        text:
          "4- هل يصنّف الطفل الأشياء حسب:\n(الوظيفة - اللون - الشكل)\n(يفرز الملابس في السلة / يضع الألعاب في مكانها الصحيح / يميز بين أدواته وأدوات إخوته)",
      },
      {
        id: "q5",
        type: "radio",
        text:
          "5- هل يظهر الطفل القدرة على تمييز:\n(الأوامر - الفواكه - الحيوانات - الألوان - الأشكال)",
      },
      {
        id: "q6",
        type: "radio",
        text:
          "6- هل ينفذ الأوامر مثل: (تعال - افتح - اجلس - أعطني)\n(أين الشيء الأحمر؟ / أين شكل الدائرة؟) من خلال الأشياء المنزلية",
      },
    ],
  },

  // ── صفحة 3 ─────────────────────────────────────────────
  {
    section: "الانتباه والتركيز",
    badgeBg: "#FEFACC",
    badgeText: "#7A6B10",
    btnColor: "#6BAFCF",
    questions: [
      {
        id: "q7",
        type: "radio",
        text:
          "7- هل يظهر الطفل تشتت انتباه واضح ومتكرر؟\n(يترك اللعبة بسرعة / يصعب عليه الجلوس / لا يستمر في نشاط بسيط / ينشغل بالأصوات / يحتاج تذكيراً متكرراً)",
      },
      {
        id: "q8",
        type: "radio",
        text:
          "8- هل يظهر الطفل القدرة على إنهاء مهمة بشكل كامل؟\n(ينفذ التعليمات من البداية للنهاية / يكمل التلوين أو النشاط)",
      },
      {
        id: "q9",
        type: "radio",
        text:
          '9- هل يظهر الطفل القدرة على إدراك المخاطر؟\n(يتوقف عند قول "لا" / يبتعد عن الأشياء الحارة أو الحادة / يتنبه عند الاقتراب من الدرج أو الشارع)',
      },
    ],
  },

  // ── صفحة 4 ─────────────────────────────────────────────
  {
    section: "المعرفة العامة",
    badgeBg: "#C8E8F8",
    badgeText: "#1A5A7A",
    btnColor: "#6BAFCF",
    questions: [
      {
        id: "q10",
        type: "radio",
        text: "10- هل يعرف أجزاء الجسم؟\n(عين - أنف - فم - أذن)",
      },
      {
        id: "q11",
        type: "radio",
        text:
          "11- هل يعرف الأشياء البسيطة في البيئة؟\n(كرسي - باب - حذاء - ملعقة - كوب - طاولة)",
      },
    ],
  },

  // ── صفحة 5 ─────────────────────────────────────────────
  {
    section: "المهارات البصرية والحركية",
    badgeBg: "#F8C8D8",
    badgeText: "#7A1A3A",
    btnColor: "#6BAFCF",
    questions: [
      {
        id: "q12",
        type: "radio",
        text:
          "12- هل يظهر الطفل القدرة على نسخ الخطوط؟\n(يرسم خط عمودي أو أفقي بعد أن يُرسم أمامه)",
      },
      {
        id: "q13",
        type: "radio",
        text:
          "13- هل يظهر الطفل القدرة على نسخ الأشكال؟\n(يرسم دائرة أو مثلث أو مربع بعد أن يُرسم أمامه)",
      },
      {
        id: "q14",
        type: "radio",
        text:
          "14- هل يظهر الطفل القدرة على التلوين داخل الأشكال بشكل صحيح؟",
      },
    ],
  },

  // ── صفحة 6 ─────────────────────────────────────────────
  {
    section: "الذاكرة والإدراك",
    badgeBg: "#E0D0F8",
    badgeText: "#4A2080",
    btnColor: "#6BAFCF",
    questions: [
      {
        id: "q15",
        type: "radio",
        text:
          "15- هل يتذكر أشياء تم عرضها عليه؟\n(مكان لعبة / نشاط سابق / خطوات لعبة معينة)",
      },
      {
        id: "q16",
        type: "radio",
        text: "16- هل يظهر الطفل القدرة على تركيب المكعبات؟",
      },
      {
        id: "q17",
        type: "radio",
        text:
          "17- هل يستطيع حل أحجية (بازل)؟\n(تركيب قطعتين أو أكثر / وضع القطع في أماكنها الصحيحة)",
      },
    ],
  },

  // ── صفحة 7 ─────────────────────────────────────────────
  {
    section: "الذاكرة والإدراك",
    badgeBg: "#E0D0F8",
    badgeText: "#4A2080",
    btnColor: "#6BAFCF",
    questions: [
      {
        id: "q18",
        type: "radio",
        text: "18- هل يبحث عن شيء إذا أخفيته منه وسألته عنه؟",
      },
      {
        id: "q19",
        type: "radio",
        text:
          "19- هل يتذكر مكان أغراضه المفضلة؟\n(دمية - سيارة - حذاء)",
      },
      {
        id: "q20",
        type: "radio",
        text: "20- هل يعرف أسماء أفراد العائلة؟",
      },
    ],
  },

  // ── صفحة 8 ─────────────────────────────────────────────
  {
    section: "حل المشكلات",
    badgeBg: "#F8D7E6",
    badgeText: "#8B1E5F",
    btnColor: "#6BAFCF",
    questions: [
      {
        id: "q21",
        type: "radio",
        text:
          "21- إذا لم يستطع الوصول لشيء مرتفع هل يحاول\n(سحب كرسي أو يقف على شيء / إذا انفتح غطاء العلبة، هل يعرف كيف يقفله؟)",
      },
    ],
  },

  // ── صفحة 9 ─────────────────────────────────────────────
  {
    section: "المهارات الأكاديمية",
    badgeBg: "#FEFACC",
    badgeText: "#7A6B10",
    btnColor: "#6BAFCF",
    questions: [
      {
        id: "q22",
        type: "radio",
        text: "22- هل يظهر الطفل القدرة على معرفة الحروف",
      },
      {
        id: "q23",
        type: "radio",
        text: "23- هل يظهر الطفل القدرة على معرفة الأرقام",
      },
      {
        id: "q24",
        type: "radio",
        text: "24- هل ينسى أدواته بالمدرسة",
      },
    ],
  },

  // ── صفحة 10 ────────────────────────────────────────────
  {
    section: "المهارات الأكاديمية",
    badgeBg: "#FEFACC",
    badgeText: "#7A6B10",
    btnColor: "#6BAFCF",
    questions: [
      {
        id: "q25",
        type: "radio",
        text: "25- هل ينسى أن يحل واجباته",
      },
      {
        id: "q26",
        type: "radio",
        text: "26- هل لديه ضعف في الإملاء",
      },
      {
        id: "q27",
        type: "radio",
        text: "27- هل لديه صعوبة في التهجئة",
      },
    ],
  },

  // ── صفحة 11 ────────────────────────────────────────────
  {
    section: "المهارات الأكاديمية",
    badgeBg: "#FEFACC",
    badgeText: "#7A6B10",
    btnColor: "#6BAFCF",
    questions: [
      {
        id: "q28",
        type: "radio",
        text: "28- في تعلم مهارة جديدة لديه بطء",
      },
      {
        id: "q29",
        type: "radio",
        text: "29- هل لديه صعوبة في الحفظ",
      },
      {
        id: "q30",
        type: "radio",
        text: "30- هل يصعب عليه معرفة الوقت واليوم",
      },
    ],
  },

  // ── صفحة 12 ────────────────────────────────────────────
  {
    section: "المهارات الأكاديمية",
    badgeBg: "#FEFACC",
    badgeText: "#7A6B10",
    btnColor: "#6BAFCF",
    questions: [
      {
        id: "q31",
        type: "radio",
        text: "31- هل لديه صعوبة في فهم واتباع التعليمات والاتجاهات",
      },
      {
        id: "q32",
        type: "radio",
        text: "32- هل يمسك القلم بشكل صحيح",
      },
      {
        id: "q33",
        type: "radio",
        text: "33- لا يتذكر ما سمعه بعد فترة قصيرة",
      },
    ],
  },

  // ── صفحة 13 ────────────────────────────────────────────
  {
    section: "المهارات الأكاديمية",
    badgeBg: "#FEFACC",
    badgeText: "#7A6B10",
    btnColor: "#6BAFCF",
    questions: [
      {
        id: "q34",
        type: "radio",
        text: "34- يندفع في الاستجابة",
      },
    ],
  },

  // ── صفحة 14 ── أسئلة مفتوحة ────────────────────────────
  {
    section: "أسئلة مفتوحة",
    badgeBg: "#C8E8F8",
    badgeText: "#1A5A7A",
    btnColor: "#6BAFCF",
    questions: [
      {
        id: "q35",
        type: "text",
        text: "35- الأشياء المفضلة لديه؟",
      },
      {
        id: "q36",
        type: "text",
        text: "36- ملاحظات إضافية",
      },
    ],
  },

  // ── صفحة 15 ── شاشة النجاح ─────────────────────────────
  {
    section: "success",
    questions: [],
  },
];

// ════════════════════════════════════════════════════════════
//  مكوّن الاستمارة الرئيسي
// ════════════════════════════════════════════════════════════
export default function SPForm() {
  const router = useRouter();

  // الصفحة الحالية (0 = أول صفحة)
  const [currentPage, setCurrentPage] = useState(0);

  // إجابات كل الأسئلة  { q1: 'أبدا', q2: 'دائما', ... }
  const [answers, setAnswers] = useState({});

  // الأسئلة التي لم تُجَب وتحتاج لتلوين أحمر
  const [errorFields, setErrorFields] = useState({});

  const page = PAGES[currentPage];
  const totalPages = PAGES.length - 1; // نستثني صفحة النجاح من العد

  // ── اختيار إجابة راديو ─────────────────────────────────
  const handleRadio = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    // إزالة علامة الخطأ عند الإجابة
    setErrorFields((prev) => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  // ── تغيير نص ─────────────────────────────────────────────
  const handleText = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  // ── الضغط على "التالي" ───────────────────────────────────
  const handleNext = () => {
    const errors = {};

    // التحقق فقط من أسئلة الراديو (النص اختياري)
    page.questions.forEach((q) => {
      if (q.type === "radio" && !answers[q.id]) {
        errors[q.id] = true;
      }
    });

    if (Object.keys(errors).length > 0) {
      setErrorFields(errors);
      return; // أوقف الانتقال
    }

    setErrorFields({});
    setCurrentPage((prev) => prev + 1);
  };

  // ── الضغط على "تم" في شاشة النجاح ──────────────────────
  const handleDone = () => {
    router.back(); // ارجع للصفحة السابقة
  };

  // ════════════════════════════════════════════════════════
  //  شاشة النجاح (صفحة 15)
  // ════════════════════════════════════════════════════════
  if (page.section === "success") {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.successContainer}>
          <Text style={styles.successText}>تم حفظ استمارة تقييم بنجاح!</Text>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>تم</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ════════════════════════════════════════════════════════
  //  صفحات الأسئلة (صفحات 1 - 14)
  // ════════════════════════════════════════════════════════
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* ── الهيدر ─────────────────────────────────────── */}
      <View style={styles.header}>
        {currentPage > 0 && (
          <TouchableOpacity
            onPress={() => setCurrentPage((p) => p - 1)}
            style={styles.backBtn}
          >
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle} numberOfLines={2}>
          استمارة تقييم الطفل من قبل الأخصائي
        </Text>
      </View>

      {/* ── المحتوى ─────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* شارة القسم */}
        <View
          style={[
            styles.sectionBadge,
            { backgroundColor: page.badgeBg },
          ]}
        >
          <Text style={[styles.sectionText, { color: page.badgeText }]}>
            {page.section}
          </Text>
        </View>

        {/* الأسئلة */}
        {page.questions.map((q) => (
          <View key={q.id} style={styles.questionBlock}>
            {/* نص السؤال */}
            <Text
              style={[
                styles.questionText,
                errorFields[q.id] && styles.questionTextError,
              ]}
            >
              {q.text}
            </Text>

            {/* رسالة خطأ */}
            {errorFields[q.id] && (
              <Text style={styles.errorMsg}>* الرجاء الإجابة على هذا السؤال</Text>
            )}

            {/* خيارات الراديو */}
            {q.type === "radio" && (
              <View
                style={[
                  styles.radioRow,
                  errorFields[q.id] && styles.radioRowError,
                ]}
              >
                {RADIO_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.radioItem}
                    onPress={() => handleRadio(q.id, option)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.radioCircle,
                        answers[q.id] === option && styles.radioCircleSelected,
                        errorFields[q.id] && styles.radioCircleError,
                      ]}
                    >
                      {answers[q.id] === option && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.radioLabel,
                        errorFields[q.id] && styles.radioLabelError,
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* حقل نص */}
            {q.type === "text" && (
              <TextInput
                style={styles.textInput}
                value={answers[q.id] || ""}
                onChangeText={(val) => handleText(q.id, val)}
                placeholder=""
                multiline={false}
                textAlign="right"
              />
            )}
          </View>
        ))}

        {/* مسافة قبل الزر */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── زر التالي ─────────────────────────────────────── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: page.btnColor }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>التالي</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ════════════════════════════════════════════════════════════
//  الأنماط (StyleSheet)
// ════════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  // ── الهيكل العام ─────────────────────────────────────────
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  // ── الهيدر ───────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    marginLeft: 8,
    padding: 4,
  },
  backArrow: {
    fontSize: 28,
    color: "#555",
    lineHeight: 30,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    textAlign: "right",
    writingDirection: "rtl",
  },

  // ── منطقة التمرير ────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  // ── شارة القسم ───────────────────────────────────────────
  sectionBadge: {
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  sectionText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  // ── كتلة السؤال ──────────────────────────────────────────
  questionBlock: {
    marginBottom: 28,
  },
  questionText: {
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    writingDirection: "rtl",
    lineHeight: 22,
    marginBottom: 12,
  },
  questionTextError: {
    color: "#D32F2F",
  },
  errorMsg: {
    fontSize: 12,
    color: "#D32F2F",
    textAlign: "right",
    marginBottom: 6,
  },

  // ── صف الراديو ───────────────────────────────────────────
  radioRow: {
    flexDirection: "row",          // RTL يعكسها تلقائياً
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 6,
    borderRadius: 8,
  },
  radioRowError: {
    backgroundColor: "#FFF5F5",
    borderWidth: 1,
    borderColor: "#FFCDD2",
    borderRadius: 8,
    paddingHorizontal: 6,
  },

  // ── عنصر الراديو (دائرة + تسمية) ────────────────────────
  radioItem: {
    alignItems: "center",
    gap: 6,
  },
  radioCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#B0C4DE",
    backgroundColor: "#E8F0FA",
    justifyContent: "center",
    alignItems: "center",
  },
  radioCircleSelected: {
    borderColor: "#4A90D9",
    backgroundColor: "#4A90D9",
  },
  radioCircleError: {
    borderColor: "#E57373",
    backgroundColor: "#FFEBEE",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  radioLabel: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
  },
  radioLabelError: {
    color: "#D32F2F",
  },

  // ── حقل النص ─────────────────────────────────────────────
  textInput: {
    height: 48,
    backgroundColor: "#EAF2FF",
    borderRadius: 24,
    paddingHorizontal: 18,
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    writingDirection: "rtl",
  },

  // ── الفوتر (زر التالي) ───────────────────────────────────
  footer: {
    paddingHorizontal: 30,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  nextButton: {
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  // ── شاشة النجاح ──────────────────────────────────────────
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    backgroundColor: "#FFFFFF",
  },
  successText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 40,
    writingDirection: "rtl",
  },
  checkCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  checkMark: {
    fontSize: 48,
    color: "#FFFFFF",
    fontWeight: "700",
    lineHeight: 56,
  },
  doneButton: {
    width: "80%",
    backgroundColor: "#A0C4F0",
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});

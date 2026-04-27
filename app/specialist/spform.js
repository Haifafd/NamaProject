
import { useLocalSearchParams, useRouter } from "expo-router"; // أضفنا useLocalSearchParams لجلب معرف الطفل
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

// --- استيراد Firebase ---
import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where
} from "firebase/firestore";
import { auth, db } from "./FirebaseConfig";

// ── تفعيل RTL ─────────────────────────────────────────────
I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const RADIO_OPTIONS = ["أبدا", "احيانا", "غالبا", "دائما"];

// ════════════════════════════════════════════════════════════
// تعريف الصفحات 
// ════════════════════════════════════════════════════════════
const PAGES = [
  {
    section: "المهارات الإدراكية والأكاديمية",
    badgeBg: "#C6F0D0",
    badgeText: "#1E6B35",
    btnColor: "#5BAD8A",
    questions: [
      { id: "q1", type: "radio", text: "1- يظهر الطفل تواصلاً بصرياً عند المناداة باسمه / عند اللعب معه / عند الضحك معه" },
      { id: "q2", type: "radio", text: "2- يظهر الطفل القدرة على اللعب التخيلي\n(يتظاهر بإطعام دمية / التحدث بالهاتف / تحريك سيارة / يمثل دور بابا أو ماما أو طبيب)" },
      { id: "q3", type: "radio", text: "3- هل يظهر الطفل القدرة على مطابقة الأشياء المتماثلة؟\n(مطابقة الجوارب / الأحذية المشابهة / تنسيق غطاء العلبة مع العلبة الصحيحة)" },
    ],
  },
  {
    section: "المهارات الإدراكية والأكاديمية",
    badgeBg: "#C6F0D0",
    badgeText: "#1E6B35",
    btnColor: "#5BAD8A",
    questions: [
      { id: "q4", type: "radio", text: "4- هل يصنّف الطفل الأشياء حسب:\n(الوظيفة - اللون - الشكل)\n(يفرز الملابس في السلة / يضع الألعاب في مكانها الصحيح / يميز بين أدواته وأدوات إخوته)" },
      { id: "q5", type: "radio", text: "5- هل يظهر الطفل القدرة على تمييز:\n(الأوامر - الفواكه - الحيوانات - الألوان - الأشكال)" },
      { id: "q6", type: "radio", text: "6- هل ينفذ الأوامر مثل: (تعال - افتح - اجلس - أعطني)\n(أين الشيء الأحمر؟ / أين شكل الدائرة؟) من خلال الأشياء المنزلية" },
    ],
  },
  {
    section: "الانتباه والتركيز",
    badgeBg: "#FEFACC",
    badgeText: "#7A6B10",
    btnColor: "#6BAFCF",
    questions: [
      { id: "q7", type: "radio", text: "7- هل يظهر الطفل تشتت انتباه واضح ومتكرر؟\n(يترك اللعبة بسرعة / يصعب عليه الجلوس / لا يستمر في نشاط بسيط / ينشغل بالأصوات / يحتاج تذكيراً متكرراً)" },
      { id: "q8", type: "radio", text: "8- هل يظهر الطفل القدرة على إنهاء مهمة بشكل كامل؟\n(ينفذ التعليمات من البداية للنهاية / يكمل التلوين أو النشاط)" },
      { id: "q9", type: "radio", text: '9- هل يظهر الطفل القدرة على إدراك المخاطر؟\n(يتوقف عند قول "لا" / يبتعد عن الأشياء الحارة أو الحادة / يتنبه عند الاقتراب من الدرج أو الشارع)' },
    ],
  },
  {
    section: "المعرفة العامة",
    badgeBg: "#C8E8F8",
    badgeText: "#1A5A7A",
    btnColor: "#6BAFCF",
    questions: [
      { id: "q10", type: "radio", text: "10- هل يعرف أجزاء الجسم؟\n(عين - أنف - فم - أذن)" },
      { id: "q11", type: "radio", text: "11- هل يعرف الأشياء البسيطة في البيئة؟\n(كرسي - باب - حذاء - ملعقة - كوب - طاولة)" },
    ],
  },
  {
    section: "المهارات البصرية والحركية",
    badgeBg: "#F8C8D8",
    badgeText: "#7A1A3A",
    btnColor: "#6BAFCF",
    questions: [
      { id: "q12", type: "radio", text: "12- هل يظهر الطفل القدرة على نسخ الخطوط؟\n(يرسم خط عمودي أو أفقي بعد أن يُرسم أمامه)" },
      { id: "q13", type: "radio", text: "13- هل يظهر الطفل القدرة على نسخ الأشكال؟\n(يرسم دائرة أو مثلث أو مربع بعد أن يُرسم أمامه)" },
      { id: "q14", type: "radio", text: "14- هل يظهر الطفل القدرة على التلوين داخل الأشكال بشكل صحيح؟" },
    ],
  },
  {
    section: "الذاكرة والإدراك",
    badgeBg: "#E0D0F8",
    badgeText: "#4A2080",
    btnColor: "#6BAFCF",
    questions: [
      { id: "q15", type: "radio", text: "15- هل يتذكر أشياء تم عرضها عليه؟\n(مكان لعبة / نشاط سابق / خطوات لعبة معينة)" },
      { id: "q16", type: "radio", text: "16- هل يظهر الطفل القدرة على تركيب المكعبات؟" },
      { id: "q17", type: "radio", text: "17- هل يستطيع حل أحجية (بازل)؟\n(تركيب قطعتين أو أكثر / وضع القطع في أماكنها الصحيحة)" },
    ],
  },
  {
    section: "الذاكرة والإدراك",
    badgeBg: "#E0D0F8",
    badgeText: "#4A2080",
    btnColor: "#6BAFCF",
    questions: [
      { id: "q18", type: "radio", text: "18- هل يبحث عن شيء إذا أخفيته منه وسألته عنه؟" },
      { id: "q19", type: "radio", text: "19- هل يتذكر مكان أغراضه المفضلة؟\n(دمية - سيارة - حذاء)" },
      { id: "q20", type: "radio", text: "20- هل يعرف أسماء أفراد العائلة؟" },
    ],
  },
  {
    section: "حل المشكلات",
    badgeBg: "#F8D7E6",
    badgeText: "#8B1E5F",
    btnColor: "#6BAFCF",
    questions: [
      { id: "q21", type: "radio", text: "21- إذا لم يستطع الوصول لشيء مرتفع هل يحاول\n(سحب كرسي أو يقف على شيء / إذا انفتح غطاء العلبة، هل يعرف كيف يقفله؟)" },
    ],
  },
  {
    section: "المهارات الأكاديمية",
    badgeBg: "#FEFACC",
    badgeText: "#7A6B10",
    btnColor: "#6BAFCF",
    questions: [
      { id: "q22", type: "radio", text: "22- هل يظهر الطفل القدرة على معرفة الحروف" },
      { id: "q23", type: "radio", text: "23- هل يظهر الطفل القدرة على معرفة الأرقام" },
      { id: "q24", type: "radio", text: "24- هل ينسى أدواته بالمدرسة" },
    ],
  },
  {
    section: "المهارات الأكاديمية",
    badgeBg: "#FEFACC",
    badgeText: "#7A6B10",
    btnColor: "#6BAFCF",
    questions: [
      { id: "q25", type: "radio", text: "25- هل ينسى أن يحل واجباته" },
      { id: "q26", type: "radio", text: "26- هل لديه ضعف في الإملاء" },
      { id: "q27", type: "radio", text: "27- هل لديه صعوبة في التهجئة" },
    ],
  },
  {
    section: "المهارات الأكاديمية",
    badgeBg: "#FEFACC",
    badgeText: "#7A6B10",
    btnColor: "#6BAFCF",
    questions: [
      { id: "q28", type: "radio", text: "28- في تعلم مهارة جديدة لديه بطء" },
      { id: "q29", type: "radio", text: "29- هل لديه صعوبة في الحفظ" },
      { id: "q30", type: "radio", text: "30- هل يصعب عليه معرفة الوقت واليوم" },
    ],
  },
  {
    section: "المهارات الأكاديمية",
    badgeBg: "#FEFACC",
    badgeText: "#7A6B10",
    btnColor: "#6BAFCF",
    questions: [
      { id: "q31", type: "radio", text: "31- هل لديه صعوبة في فهم واتباع التعليمات والاتجاهات" },
      { id: "q32", type: "radio", text: "32- هل يمسك القلم بشكل صحيح" },
      { id: "q33", type: "radio", text: "33- لا يتذكر ما سمعه بعد فترة قصيرة" },
    ],
  },
  {
    section: "المهارات الأكاديمية",
    badgeBg: "#FEFACC",
    badgeText: "#7A6B10",
    btnColor: "#6BAFCF",
    questions: [
      { id: "q34", type: "radio", text: "34- يندفع في الاستجابة" },
    ],
  },
  {
    section: "أسئلة مفتوحة",
    badgeBg: "#C8E8F8",
    badgeText: "#1A5A7A",
    btnColor: "#6BAFCF",
    questions: [
      { id: "q35", type: "text", text: "35- الأشياء المفضلة لديه؟" },
      { id: "q36", type: "text", text: "36- ملاحظات إضافية" },
    ],
  },
  {
    section: "success",
    questions: [],
  },
];

export default function SPForm() {
  const router = useRouter();
  
  // --- جلب معرف الطفل من الرابط ---
  // ملاحظة: عند الانتقال لهذه الصفحة، يجب أن يكون الرابط مثلاً: /spform?childId=123
  const { childId } = useLocalSearchParams();

  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [errorFields, setErrorFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const currentPageData = PAGES[currentPage];

  // ── 1. جلب بيانات هذا الطفل تحديداً ──────────────────────────
  useEffect(() => {
    const fetchChildAssessment = async () => {
      try {
        const user = auth.currentUser;
        if (!user || !childId) {
          setIsFetching(false);
          return;
        }

        // البحث عن تقييم يطابق (الأخصائي الحالي + الطفل الحالي)
        const q = query(
          collection(db, "SpecialistAssessments"),
          where("specialistId", "==", user.uid),
          where("childId", "==", childId), // شرط إضافي لضمان عدم الاختلاط
          orderBy("createdAt", "desc"),
          limit(1)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const lastDoc = querySnapshot.docs[0].data();
          if (lastDoc.observations) {
            setAnswers(lastDoc.observations);
            Alert.alert("تنبيه", "تم استعادة تقييم هذا الطفل المحفوظ مسبقاً.");
          }
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchChildAssessment();
  }, [childId]); // إعادة البحث إذا تغير الطفل

  // ── 2. حفظ البيانات لهذا الطفل تحديداً ──────────────────────
  const saveToFirebase = async () => {
    if (!childId) {
      Alert.alert("خطأ", "لم يتم العثور على معرف الطفل.");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      
      const docData = {
        childId: childId, // حفظ معرف الطفل الحقيقي الممرر للصفحة
        specialistId: user ? user.uid : "anonymous",
        createdAt: serverTimestamp(),
        observations: answers,
      };

      await addDoc(collection(db, "SpecialistAssessments"), docData);
      setCurrentPage(PAGES.length - 1);
    } catch (error) {
      console.error("Error saving to Firebase: ", error);
      Alert.alert("خطأ", "حدث خطأ أثناء حفظ البيانات.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const currentQuestions = currentPageData.questions;
    const missing = [];

    currentQuestions.forEach((q) => {
      if (!answers[q.id] || answers[q.id].trim() === "") {
        missing.push(q.id);
      }
    });

    if (missing.length > 0) {
      setErrorFields(missing);
      Alert.alert("تنبيه", "يرجى الإجابة على جميع الأسئلة.");
      return;
    }

    if (currentPage === PAGES.length - 2) {
      saveToFirebase();
    } else {
      setErrorFields([]);
      setCurrentPage(currentPage + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      setErrorFields([]);
    } else {
      router.back();
    }
  };

  const updateAnswer = (id, val) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
    if (errorFields.includes(id)) {
      setErrorFields((prev) => prev.filter((item) => item !== id));
    }
  };

  if (isFetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#5BAD8A" />
        <Text style={{ textAlign: 'center', marginTop: 10 }}>جاري جلب تقييم الطفل...</Text>
      </View>
    );
  }

  if (currentPageData.section === "success") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>تم إرسال التقييم بنجاح!</Text>
          <Text style={styles.successSub}>تم حفظ بيانات الطفل في قاعدة البيانات.</Text>
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: "#5BAD8A", marginTop: 30, width: '80%' }]}
            onPress={() => router.replace("/")}
          >
            <Text style={styles.btnText}>العودة للرئيسية</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.backBtn}>رجوع</Text>
        </TouchableOpacity>
        <View style={[styles.badge, { backgroundColor: currentPageData.badgeBg }]}>
          <Text style={[styles.badgeText, { color: currentPageData.badgeText }]}>{currentPageData.section}</Text>
        </View>
        <Text style={styles.pageIndicator}>{currentPage + 1} / {PAGES.length - 1}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {currentPageData.questions.map((q) => (
          <View key={q.id} style={styles.questionWrapper}>
            <Text style={[styles.questionText, errorFields.includes(q.id) && { color: "red" }]}>{q.text}</Text>
            {q.type === "radio" ? (
              <View style={styles.radioGroup}>
                {RADIO_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.radioOption, answers[q.id] === opt && styles.radioSelected]}
                    onPress={() => updateAnswer(q.id, opt)}
                  >
                    <Text style={[styles.radioLabel, answers[q.id] === opt && styles.radioLabelSelected]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TextInput
                style={[styles.textInput, errorFields.includes(q.id) && { borderColor: "red" }]}
                placeholder="اكتب إجابتك هنا..."
                multiline
                value={answers[q.id] || ""}
                onChangeText={(val) => updateAnswer(q.id, val)}
              />
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: currentPageData.btnColor }]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>{currentPage === PAGES.length - 2 ? "إرسال وحفظ" : "التالي"}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 15, backgroundColor: "#FFF" },
  backBtn: { fontSize: 16, color: "#666" },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "bold" },
  pageIndicator: { fontSize: 14, color: "#999" },
  scrollContent: { padding: 20 },
  questionWrapper: { marginBottom: 30, backgroundColor: "#FFF", padding: 15, borderRadius: 10, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  questionText: { fontSize: 16, lineHeight: 24, marginBottom: 15, textAlign: "right", color: "#333" },
  radioGroup: { flexDirection: "row-reverse", flexWrap: "wrap", justifyContent: "space-between" },
  radioOption: { borderWidth: 1, borderColor: "#DDD", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 10, minWidth: "22%", alignItems: "center" },
  radioSelected: { backgroundColor: "#5BAD8A", borderColor: "#5BAD8A" },
  radioLabel: { fontSize: 13, color: "#666" },
  radioLabelSelected: { color: "#FFF", fontWeight: "bold" },
  textInput: { borderWidth: 1, borderColor: "#DDD", borderRadius: 8, padding: 12, height: 80, textAlign: "right", textAlignVertical: "top" },
  footer: { padding: 20, backgroundColor: "#FFF" },
  nextBtn: { paddingVertical: 15, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  btnText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },
  successContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  successTitle: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 10 },
  successSub: { fontSize: 16, color: "#666" },
});
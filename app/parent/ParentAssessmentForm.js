import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import {
  saveParentAssessment,
  hasParentAssessedChild,
  getLatestParentAssessment,
} from "../../Services/AssessmentService";
import { COLORS } from "../../constants/theme";

const ALL_QUESTIONS = [
  {
    id: 1,
    text: "ينتبه للمثيرات البصرية (يتابع بعينيه).",
    category: "المهارات الإدراكية والأكاديمية",
    type: "scale",
  },
  {
    id: 2,
    text: "ينتبه للمثيرات السمعية (المناداة أو صوت لعبة) وهل يبحث عن مصدر الصوت.",
    category: "المهارات الإدراكية والأكاديمية",
    type: "scale",
  },
  {
    id: 3,
    text: "يركز على نشاط واحد لأكثر من دقيقة.",
    category: "المهارات الإدراكية والأكاديمية",
    type: "scale",
  },
  {
    id: 4,
    text: "يميز بين الأشياء المتشابهة والمختلفة.",
    category: "المهارات الإدراكية والأكاديمية",
    type: "scale",
  },
  {
    id: 5,
    text: "يطابق الأشكال أو الألوان (صور - مجسمات).",
    category: "المهارات الإدراكية والأكاديمية",
    type: "scale",
  },
  {
    id: 6,
    text: "يصنف الأشياء حسب اللون أو الشكل أو الحجم.",
    category: "المهارات الإدراكية والأكاديمية",
    type: "scale",
  },
  {
    id: 7,
    text: "يكمل أجزاء مفقودة في صورة أو شكل (بازل بسيط).",
    category: "المهارات الإدراكية والأكاديمية",
    type: "scale",
  },
  {
    id: 8,
    text: "يحل مشكلات بسيطة مثل إخراج لعبة من صندوق.",
    category: "المهارات الإدراكية والأكاديمية",
    type: "scale",
  },
  {
    id: 9,
    text: "يربط السبب بالنتيجة (يضغط زر فيخرج صوت مثال).",
    category: "المهارات الإدراكية والأكاديمية",
    type: "scale",
  },
  {
    id: 10,
    text: "يتعرف على مواقع الأشياء (فوق-تحت-داخل-خارج).",
    category: "المهارات الإدراكية والأكاديمية",
    type: "scale",
  },
  {
    id: 11,
    text: "يتذكر أماكن الأشياء بعد إخفائها.",
    category: "المهارات الإدراكية والأكاديمية",
    type: "scale",
  },
  {
    id: 12,
    text: "يتبع تسلسل خطوات بسيط.",
    category: "المهارات الإدراكية والأكاديمية",
    type: "scale",
  },

  {
    id: 13,
    text: "يفهم التعليمات البسيطة / خذ الكرة.",
    category: "المهارات اللغوية",
    type: "scale",
  },
  {
    id: 14,
    text: "ينفذ تعليمات من خطوتين.",
    category: "المهارات اللغوية",
    type: "scale",
  },
  {
    id: 15,
    text: "يشير لصور أو أشكال عند تسميتها.",
    category: "المهارات اللغوية",
    type: "scale",
  },
  {
    id: 16,
    text: "يستخدم كلمات أو جمل للتعبير.",
    category: "المهارات اللغوية",
    type: "scale",
  },
  {
    id: 17,
    text: "يجيب على أسئلة بسيطة.",
    category: "المهارات اللغوية",
    type: "scale",
  },
  {
    id: 18,
    text: "يشير أو ينظر عند سماع اسمه.",
    category: "المهارات اللغوية",
    type: "scale",
  },
  {
    id: 19,
    text: "يسأل أسئلة بسيطة.",
    category: "المهارات اللغوية",
    type: "scale",
  },

  {
    id: 20,
    text: "يشارك في اللعب الجماعي.",
    category: "المهارات الاجتماعية والانفعالية",
    type: "scale",
  },
  {
    id: 21,
    text: "يبدي مشاعر.",
    category: "المهارات الاجتماعية والانفعالية",
    type: "scale",
  },
  {
    id: 22,
    text: "يتقبل التوجيه.",
    category: "المهارات الاجتماعية والانفعالية",
    type: "scale",
  },
  {
    id: 23,
    text: "يقلد أقرانه.",
    category: "المهارات الاجتماعية والانفعالية",
    type: "scale",
  },
  {
    id: 24,
    text: "يتبادل الأدوار.",
    category: "المهارات الاجتماعية والانفعالية",
    type: "scale",
  },
  {
    id: 25,
    text: "يقترب من الكبار.",
    category: "المهارات الاجتماعية والانفعالية",
    type: "scale",
  },
  {
    id: 26,
    text: "يتفاعل بالابتسامة أو التواصل البصري.",
    category: "المهارات الاجتماعية والانفعالية",
    type: "scale",
  },

  { id: 27, text: "يمشي بثبات.", category: "المهارات الحركية", type: "scale" },
  {
    id: 28,
    text: "يصعد أو ينزل الدرج.",
    category: "المهارات الحركية",
    type: "scale",
  },
  {
    id: 29,
    text: "يقفز أو يركض.",
    category: "المهارات الحركية",
    type: "scale",
  },
  { id: 30, text: "يركل كرة.", category: "المهارات الحركية", type: "scale" },
  { id: 31, text: "يوازن جسمه.", category: "المهارات الحركية", type: "scale" },
  {
    id: 32,
    text: "ينقل الأشياء من يد لأخرى.",
    category: "المهارات الحركية",
    type: "scale",
  },
  {
    id: 33,
    text: "يمسك بالأشياء الصغيرة.",
    category: "المهارات الحركية",
    type: "scale",
  },
  { id: 34, text: "يمسك بالقلم.", category: "المهارات الحركية", type: "scale" },
  {
    id: 35,
    text: "يدخل أشياء في فتحات.",
    category: "المهارات الحركية",
    type: "scale",
  },
  { id: 36, text: "يبني أبراج.", category: "المهارات الحركية", type: "scale" },
  {
    id: 37,
    text: "ينسخ أشكال بسيطة.",
    category: "المهارات الحركية",
    type: "scale",
  },
  {
    id: 38,
    text: "يلون داخل الحدود.",
    category: "المهارات الحركية",
    type: "scale",
  },

  {
    id: 39,
    text: "يأكل بنفسه.",
    category: "الاعتماد على النفس أو الاستقلالية",
    type: "scale",
  },
  {
    id: 40,
    text: "يشرب من الكوب.",
    category: "الاعتماد على النفس أو الاستقلالية",
    type: "scale",
  },
  {
    id: 41,
    text: "يحاول ارتداء ملابسه.",
    category: "الاعتماد على النفس أو الاستقلالية",
    type: "scale",
  },
  {
    id: 42,
    text: "يستخدم الحمام.",
    category: "الاعتماد على النفس أو الاستقلالية",
    type: "scale",
  },
  {
    id: 43,
    text: "يغسل يديه.",
    category: "الاعتماد على النفس أو الاستقلالية",
    type: "scale",
  },
  {
    id: 44,
    text: "ينظف فمه.",
    category: "الاعتماد على النفس أو الاستقلالية",
    type: "scale",
  },
  {
    id: 45,
    text: "يستخدم الفرشاة أو المشط.",
    category: "الاعتماد على النفس أو الاستقلالية",
    type: "scale",
  },
  {
    id: 46,
    text: "يعرف ممتلكاته.",
    category: "الاعتماد على النفس أو الاستقلالية",
    type: "scale",
  },
  {
    id: 47,
    text: "يبدي رغبة في أداء المهام.",
    category: "الاعتماد على النفس أو الاستقلالية",
    type: "scale",
  },

  {
    id: "notes",
    text: "اضف ملاحظة",
    category: "ملاحظات عامة عن الطفل/ بالإضافة (المعززات)",
    type: "notes",
  },
];

const SCALE_OPTIONS = [
  { label: "دائماً", value: 3 },
  { label: "غالباً", value: 2 },
  { label: "أحياناً", value: 1 },
  { label: "ابداً", value: 0 },
];

export default function AssessmentApp() {
  const router = useRouter();
  const auth = getAuth();
  const { childId, childName } = useLocalSearchParams();

  const [savedResult, setSavedResult] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [notesText, setNotesText] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [validationError, setValidationError] = useState(false);

  useEffect(() => {
    const fetchSavedAssessment = async () => {
      const user = auth.currentUser;
      if (!user || !childId) return;

      try {
        const latest = await getLatestParentAssessment(childId);
        if (latest && latest.parentId === user.uid) {
          setSavedResult(latest.result);
        }
      } catch (error) {
        console.error("Error fetching saved assessment:", error);
      }
    };

    fetchSavedAssessment();
  }, [childId]);

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace("/login");
    }
  }, []);

  const questionsPerView = 3;
  const scaleQuestions = ALL_QUESTIONS.filter((q) => q.type === "scale");
  const totalScaleQuestions = scaleQuestions.length;
  const totalPages = Math.ceil(totalScaleQuestions / questionsPerView) + 1;

  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / totalScaleQuestions) * 100;

  const buildQuestionCategoryMap = () => {
    const map = {};
    ALL_QUESTIONS.forEach((q) => {
      if (q.type === "scale") {
        map[String(q.id)] = q.category;
      }
    });
    return map;
  };

  const calculateResult = async () => {
    if (!childId) {
      Alert.alert(
        "خطأ",
        "لم يتم تحديد الطفل. الرجاء العودة والمحاولة مرة أخرى."
      );
      return;
    }

    try {
      const questionCategoryMap = buildQuestionCategoryMap();

      const stringKeyAnswers = {};
      Object.entries(answers).forEach(([k, v]) => {
        stringKeyAnswers[String(k)] = v;
      });

      const finalResult = await saveParentAssessment({
        childId,
        childName: childName || "",
        answers: stringKeyAnswers,
        notes: notesText,
        questionCategoryMap,
      });

      setResult(finalResult);
      setShowResult(true);
    } catch (error) {
      console.error(error);
      Alert.alert("خطأ", "لم نتمكن من حفظ التقييم. حاول مرة أخرى.");
    }
  };

  const handleNext = async () => {
    const startIndex = currentPage * questionsPerView;
    const isNotesPage = currentPage === totalPages - 1;

    if (!isNotesPage) {
      const currentViewQuestions = scaleQuestions.slice(
        startIndex,
        startIndex + questionsPerView,
      );
      const hasUnanswered = currentViewQuestions.some(
        (q) => answers[q.id] === undefined,
      );
      if (hasUnanswered) {
        setValidationError(true);
        Alert.alert("تنبيه", "يرجى الإجابة على جميع الخيارات قبل الانتقال.");
        return;
      }
    }

    setValidationError(false);

    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      await calculateResult();
    }
  };

  // ─────────────────────────────────────────────
  // Single success screen for both "already submitted" and "just submitted"
  // ─────────────────────────────────────────────
  if (savedResult || (showResult && result)) {
    const isFirstTime = showResult && result;

    return (
      <View style={styles.successWrap}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />

        <View style={styles.successDecor1} />
        <View style={styles.successDecor2} />

        <View style={styles.successCard}>
          <View style={styles.successIconBox}>
            <Ionicons name="checkmark-circle" size={80} color="#FFFFFF" />
          </View>

          <Text style={styles.successTitle}>
            {isFirstTime ? "تم إرسال التقييم بنجاح!" : "تم تعبئة الاستمارة"}
          </Text>

          <Text style={styles.successSubtitle}>
            {isFirstTime
              ? "شكراً لك، تم إرسال إجاباتك للأخصائي المختص للاطلاع عليها"
              : "تم إرسال إجاباتك مسبقاً للأخصائي"}
          </Text>

          <View style={styles.successInfoCard}>
            <View style={styles.successInfoRow}>
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={COLORS.PRIMARY_DARK}
              />
              <Text style={styles.successInfoText}>
                النتائج تظل خاصة بالأخصائي
              </Text>
            </View>
            <View style={styles.successInfoRow}>
              <Ionicons name="people" size={18} color={COLORS.PRIMARY_DARK} />
              <Text style={styles.successInfoText}>
                سيتواصل معك الأخصائي بشأن خطة طفلك
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.successButton}
            onPress={() => router.replace("/parent/homepageP")}
            activeOpacity={0.85}
          >
            <Ionicons name="home" size={18} color="#FFFFFF" />
            <Text style={styles.successButtonText}>العودة للرئيسية</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const startIndex = currentPage * questionsPerView;
  const isNotesPage = currentPage === totalPages - 1;
  const currentQuestions = isNotesPage
    ? [ALL_QUESTIONS.find((q) => q.id === "notes")]
    : scaleQuestions.slice(startIndex, startIndex + questionsPerView);

  return (
    <View style={styles.formContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />

      {/* Sky gradient header */}
      <View style={styles.formHeader}>
        <View style={styles.formDecor1} />
        <View style={styles.formDecor2} />

        <View style={styles.formHeaderRow}>
          <TouchableOpacity
            style={styles.formBackBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-forward" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.formHeaderCenter}>
            <Text style={styles.formHeaderTitle}>استمارة التقييم</Text>
            {childName && (
              <Text style={styles.formHeaderSubtitle}>{childName}</Text>
            )}
          </View>
          <View style={{ width: 38 }} />
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressBarBg}>
            <View
              style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
            />
          </View>
          <View style={styles.progressInfoRow}>
            <Text style={styles.progressInfoText}>
              {answeredCount} من {totalScaleQuestions}
            </Text>
            <Text style={styles.progressInfoPercent}>
              {Math.round(progressPercent)}%
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.formScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentQuestions.map((q) => {
            if (q.type === "notes") {
              return (
                <View key={q.id} style={styles.notesCard}>
                  <View style={styles.categoryBadge}>
                    <Ionicons
                      name="create"
                      size={14}
                      color={COLORS.PRIMARY_DARK}
                    />
                    <Text style={styles.categoryBadgeText}>
                      ملاحظات إضافية
                    </Text>
                  </View>
                  <Text style={styles.notesLabel}>
                    أضف أي ملاحظة عامة عن طفلك، أو معززات تساعد في فهمه أكثر
                  </Text>
                  <TextInput
                    style={styles.notesInput}
                    multiline
                    placeholder="اكتب ملاحظاتك هنا..."
                    placeholderTextColor={COLORS.MUTED}
                    value={notesText}
                    onChangeText={setNotesText}
                    textAlign="right"
                  />
                </View>
              );
            }

            const isUnanswered = validationError && answers[q.id] === undefined;

            return (
              <View key={q.id} style={styles.questionCard}>
                <View style={styles.categoryBadge}>
                  <Ionicons
                    name="ribbon"
                    size={14}
                    color={COLORS.PRIMARY_DARK}
                  />
                  <Text style={styles.categoryBadgeText}>{q.category}</Text>
                </View>

                <Text
                  style={[
                    styles.questionText,
                    isUnanswered && { color: COLORS.DANGER },
                  ]}
                >
                  {typeof q.id === "number" ? `${q.id}- ` : ""}
                  {q.text}
                </Text>

                <View style={styles.scaleRow}>
                  {SCALE_OPTIONS.map((opt) => {
                    const isSelected = answers[q.id] === opt.value;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          styles.scaleBtn,
                          isSelected && styles.scaleBtnActive,
                        ]}
                        onPress={() =>
                          setAnswers({ ...answers, [q.id]: opt.value })
                        }
                        activeOpacity={0.85}
                      >
                        <Text
                          style={[
                            styles.scaleBtnText,
                            isSelected && styles.scaleBtnTextActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Sticky bottom navigation */}
        <View style={styles.navBottom}>
          <TouchableOpacity
            style={[
              styles.navBtnSecondary,
              currentPage === 0 && styles.navBtnDisabled,
            ]}
            onPress={() =>
              currentPage > 0 && setCurrentPage(currentPage - 1)
            }
            disabled={currentPage === 0}
            activeOpacity={0.85}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={COLORS.PRIMARY_DARK}
            />
            <Text style={styles.navBtnSecondaryText}>السابق</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navBtnPrimary}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.navBtnPrimaryText}>
              {currentPage === totalPages - 1 ? "إرسال" : "التالي"}
            </Text>
            <Ionicons
              name={currentPage === totalPages - 1 ? "send" : "chevron-back"}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ─── Success screen ───
  successWrap: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    position: "relative",
    overflow: "hidden",
  },
  successDecor1: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  successDecor2: {
    position: "absolute",
    bottom: -80,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.13)",
  },
  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 28,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
    zIndex: 2,
  },
  successIconBox: {
    width: 110,
    height: 110,
    borderRadius: 32,
    backgroundColor: COLORS.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.TEXT,
    textAlign: "center",
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 14,
    color: COLORS.MUTED,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  successInfoCard: {
    width: "100%",
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  successInfoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  successInfoText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.PRIMARY_DARK,
    fontWeight: "600",
    textAlign: "right",
    lineHeight: 18,
  },
  successButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: "100%",
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  successButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // ─── Form ───
  formContainer: {
    flex: 1,
    backgroundColor: COLORS.BG,
  },

  formHeader: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  formDecor1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  formDecor2: {
    position: "absolute",
    bottom: -40,
    left: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  formHeaderRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1,
    marginBottom: 14,
  },
  formBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  formHeaderCenter: { flex: 1, alignItems: "center" },
  formHeaderTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  formHeaderSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
  },

  progressSection: {
    zIndex: 1,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    overflow: "hidden",
    flexDirection: "row-reverse",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
  },
  progressInfoRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressInfoText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.95)",
    fontWeight: "600",
  },
  progressInfoPercent: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "800",
  },

  formScrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  questionCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  categoryBadge: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.PRIMARY_DARK,
  },

  questionText: {
    fontSize: 14,
    color: COLORS.TEXT,
    textAlign: "right",
    lineHeight: 22,
    marginBottom: 14,
    fontWeight: "600",
  },

  scaleRow: {
    flexDirection: "row-reverse",
    gap: 8,
    flexWrap: "wrap",
  },
  scaleBtn: {
    flex: 1,
    minWidth: 70,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: COLORS.BG,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  scaleBtnActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY_DARK,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  scaleBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.MUTED,
  },
  scaleBtnTextActive: {
    color: "#FFFFFF",
  },

  notesCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  notesLabel: {
    fontSize: 13,
    color: COLORS.MUTED,
    textAlign: "right",
    lineHeight: 20,
    marginBottom: 12,
  },
  notesInput: {
    minHeight: 120,
    borderWidth: 2,
    borderColor: "#F0F0F0",
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: COLORS.TEXT,
    textAlignVertical: "top",
    backgroundColor: COLORS.BG,
  },

  navBottom: {
    flexDirection: "row-reverse",
    gap: 10,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 30 : 16,
    backgroundColor: COLORS.CARD_BG,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  navBtnPrimary: {
    flex: 2,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  navBtnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  navBtnSecondary: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    paddingVertical: 14,
    borderRadius: 14,
  },
  navBtnSecondaryText: {
    color: COLORS.PRIMARY_DARK,
    fontSize: 14,
    fontWeight: "700",
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
});

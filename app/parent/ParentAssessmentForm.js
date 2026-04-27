import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getDocs } from "firebase/firestore";

import { useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../FirebaseConfig";

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

const CATEGORY_COLORS = {
  "المهارات الإدراكية والأكاديمية": "#D1F2EB",
  "المهارات اللغوية": "#D6EAF8",
  "المهارات الاجتماعية والانفعالية": "#FDEBD0",
  "المهارات الحركية": "#FEF9E7",
  "الاعتماد على النفس أو الاستقلالية": "#F5EEF8",
  "ملاحظات عامة عن الطفل/ بالإضافة (المعززات)": "#EBF5FB",
};

export default function AssessmentApp() {
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const fetchSavedAssessment = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const snapshot = await getDocs(
        collection(db, "ParentAssessments", user.uid, "assessments"),
      );

      if (!snapshot.empty) {
        const last = snapshot.docs[snapshot.docs.length - 1].data();
        setSavedResult(last.result);
      }
    };

    fetchSavedAssessment();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace("/login");
    }
  }, []);
  const [savedResult, setSavedResult] = useState(null);

  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [notesText, setNotesText] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [validationError, setValidationError] = useState(false);

  const questionsPerView = 3;
  const scaleQuestions = ALL_QUESTIONS.filter((q) => q.type === "scale");
  const totalScaleQuestions = scaleQuestions.length;
  const totalPages = Math.ceil(totalScaleQuestions / questionsPerView) + 1;

  const answeredCount = Object.keys(answers).length;
  const progressPercent = (answeredCount / totalScaleQuestions) * 100;
  const remainingQuestions = totalScaleQuestions - answeredCount;

  const saveAssessmentToFirestore = async (finalResult) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(
        collection(db, "ParentAssessments", user.uid, "assessments"),
        {
          answers,
          notes: notesText,
          result: finalResult,
          createdAt: new Date(),
        },
      );
    } catch (error) {
      console.log("Firestore Error:", error);
    }
  };

  const calculateResult = () => {
    let totalPoints = 0;
    let maxPoints = totalScaleQuestions * 3;

    scaleQuestions.forEach((q) => {
      totalPoints += answers[q.id] ?? 0;
    });

    const percentage = (totalPoints / maxPoints) * 100;

    const finalResult = {
      totalPoints,
      maxPoints,
      percentage: percentage.toFixed(1),
      level:
        percentage >= 60
          ? "مستوى عالي"
          : percentage >= 40
            ? "مستوى متوسط"
            : "مستوى منخفض",
    };

    setResult(finalResult);
    setShowResult(true);
    saveAssessmentToFirestore(finalResult);
  };

  const handleNext = () => {
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
      calculateResult();
    }
  };

  if (savedResult) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successText}>نتيجة التقييم السابقة</Text>

        <Text style={{ fontSize: 40, color: "#2ECC71", marginVertical: 10 }}>
          {savedResult.percentage}%
        </Text>

        <Text style={{ fontSize: 22, marginBottom: 10 }}>
          {savedResult.level}
        </Text>

        <Text style={{ color: "#555" }}>
          مجموع النقاط: {savedResult.totalPoints} / {savedResult.maxPoints}
        </Text>

        <TouchableOpacity
          style={styles.finalButton}
          onPress={() => router.replace("/parent/homepageP")}
        >
          <Text style={styles.buttonText}>رجوع</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showResult && result) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successText}>نتيجة تقييم الطفل</Text>
        <Text style={{ fontSize: 40, color: "#2ECC71", marginVertical: 10 }}>
          {result.percentage}%
        </Text>
        <Text style={{ fontSize: 22, marginBottom: 10 }}>{result.level}</Text>
        <Text style={{ color: "#555" }}>
          مجموع النقاط: {result.totalPoints} / {result.maxPoints}
        </Text>

        <TouchableOpacity
          style={styles.finalButton}
          onPress={() => {
            router.replace("/parent/homepageP");
          }}
        >
          <Text style={styles.buttonText}>تم</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const startIndex = currentPage * questionsPerView;
  const isNotesPage = currentPage === totalPages - 1;
  const currentQuestions = isNotesPage
    ? [ALL_QUESTIONS.find((q) => q.id === "notes")]
    : scaleQuestions.slice(startIndex, startIndex + questionsPerView);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
        >
          <Text
            style={[styles.backIcon, currentPage === 0 && { color: "#EEE" }]}
          >
            {"<"}
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>استمارة تقييم الطفل</Text>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressPercent}>{remainingQuestions} سؤال</Text>
          <Text style={styles.progressText}>الأسئلة المتبقية</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View
            style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
          />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {currentQuestions.map((q) => (
            <View key={q.id} style={styles.questionCard}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: CATEGORY_COLORS[q.category] },
                ]}
              >
                <Text style={styles.badgeText}>{q.category}</Text>
              </View>

              <Text
                style={[
                  styles.qText,
                  validationError &&
                    answers[q.id] === undefined && { color: "red" },
                ]}
              >
                {typeof q.id === "number" ? `${q.id}- ` : ""}
                {q.text}
              </Text>

              {q.type === "scale" ? (
                <View style={styles.optionsContainer}>
                  {SCALE_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.label}
                      style={styles.option}
                      onPress={() =>
                        setAnswers({ ...answers, [q.id]: opt.value })
                      }
                    >
                      <View
                        style={[
                          styles.radio,
                          answers[q.id] === opt.value && styles.radioSelected,
                        ]}
                      >
                        {answers[q.id] === opt.value && (
                          <View style={styles.innerRadio} />
                        )}
                      </View>
                      <Text style={styles.optLabel}>{opt.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <TextInput
                  style={styles.notesInput}
                  placeholder="اضف ملاحظة"
                  multiline
                  value={notesText}
                  onChangeText={setNotesText}
                  textAlign="right"
                />
              )}
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.buttonText}>{isNotesPage ? "تم" : "التالي"}</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF" },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: { fontSize: 16, fontWeight: "bold" },
  backIcon: { fontSize: 25, color: "#85C1E9" },
  progressSection: { paddingHorizontal: 20, marginBottom: 10 },
  progressLabels: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressText: { fontSize: 14, fontWeight: "bold", color: "#333" },
  progressPercent: { fontSize: 14, color: "#666" },
  progressBarBg: {
    height: 10,
    backgroundColor: "#E5E8E8",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2ECC71",
    borderRadius: 5,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  questionCard: {
    marginBottom: 40,
  },

  badge: {
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 15,
  },

  badgeText: {
    fontSize: 13,
    fontWeight: "600",
  },

  qText: {
    textAlign: "right",
    fontSize: 16,
    marginBottom: 25,
    lineHeight: 24,
  },

  optionsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
  },

  option: {
    alignItems: "center",
  },

  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D5DBDB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },

  radioSelected: {
    borderColor: "#85C1E9",
  },

  innerRadio: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#85C1E9",
  },

  optLabel: {
    fontSize: 12,
    color: "#7F8C8D",
  },

  notesInput: {
    backgroundColor: "#F4F7F6",
    borderRadius: 15,
    padding: 15,
    height: 100,
    fontSize: 16,
  },

  nextBtn: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#85C1E9",
    padding: 18,
    borderRadius: 15,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  successText: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },

  finalButton: {
    marginTop: 40,
    backgroundColor: "#85C1E9",
    width: "60%",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
});

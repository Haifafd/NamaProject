import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Svg, { Defs, G, Mask, Path } from 'react-native-svg';

// استيراد إعدادات Firebase من ملفك
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";

// استيراد مكونات الثيم الخاص بك
import { AppLayout, BORDER, CARD, MUTED, PRIMARY } from "./ActivityStyle";

const { width, height } = Dimensions.get('window');

export default function EnhancedDrawingGame({ navigation }) {
  const [level, setLevel] = useState(1);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedColor, setSelectedColor] = useState(PRIMARY);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFinishedCard, setShowFinishedCard] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showError, setShowError] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const stats = useRef({
    startTime: Date.now(),
    levelPoints: 0,
    allLevelsPoints: [],
    totalTime: 0
  });

  const colors = ['#FF4D4D', '#4D8CFF', PRIMARY, '#FFA500', '#A855F7', '#000000'];
  const progressPercent = Math.round(((level - 1) / 3) * 100);

  // تحديد مسار الشكل بناءً على المستوى
  const getLevelPath = () => {
    if (level === 1) return "M80,100 L240,400"; // خط مائل
    if (level === 2) return "M80,100 L240,400 L80,400"; // مثلث ناقص
    return "M80,100 L240,400 M240,100 L80,400"; // علامة X
  };

  // حفظ النتائج في Firebase
  const saveToFirebase = async (metrics) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "ActivityResults"), {
          childId: user.uid,
          activityId: "enhanced_drawing",
          vmiScore: metrics.vmi, // الإدراك البصري
          cpiScore: metrics.cpi, // المعالجة المعرفية
          totalTime: parseFloat(metrics.time),
          status: "completed",
          createdAt: serverTimestamp(),
        });
        console.log("✅ تم حفظ نتائج الرسم بنجاح");
      }
    } catch (error) {
      console.error("❌ خطأ في حفظ النتائج:", error);
    }
  };

  const calculateMetrics = () => {
    const totalPoints = stats.current.allLevelsPoints.reduce((a, b) => a + b, 0);
    // VMI: مهارة التآزر البصري الحركي
    let vmi = Math.min(98, Math.round((totalPoints / 1000) * 100));
    // CPI: مؤشر المعالجة المعرفية (السرعة والدقة)
    const cpi = Math.max(65, Math.min(95, 100 - (stats.current.totalTime / 15)));
    return { vmi, cpi, time: stats.current.totalTime.toFixed(1) };
  };

  const handleNextLevel = () => {
    // التحقق من أن الطفل قام برسم قدر كافٍ (نقاط المستوى)
    const requiredPoints = level === 1 ? 120 : level === 2 ? 220 : 320;
    
    if (stats.current.levelPoints >= requiredPoints) {
      stats.current.allLevelsPoints.push(stats.current.levelPoints);
      if (level < 3) {
        triggerLevelSuccess();
      } else {
        stats.current.totalTime = (Date.now() - stats.current.startTime) / 1000;
        setShowFinishedCard(true);
      }
    } else {
      setShowError(true);
      setTimeout(() => setShowError(false), 2500);
    }
  };

  const triggerLevelSuccess = () => {
    setShowSuccess(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
        setShowSuccess(false);
        stats.current.levelPoints = 0;
        setLevel(level + 1);
        setPaths([]);
      });
    }, 1000);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      setCurrentPath((prev) => [...prev, `${locationX},${locationY}`]);
      stats.current.levelPoints += 1;
    },
    onPanResponderRelease: () => {
      if (currentPath.length > 0) {
        setPaths((prev) => [...prev, { points: currentPath, color: selectedColor }]);
        setCurrentPath([]);
      }
    },
  });

  const handleFinalFinish = () => {
    const metrics = calculateMetrics();
    saveToFirebase(metrics); // الحفظ الفعلي عند الضغط على زر عرض التقرير
    setShowFinishedCard(false);
    setShowReport(true);
  };

  return (
    <AppLayout navigation={navigation} activeTab="activities">
      {showReport ? (
        <ScrollView contentContainerStyle={styles.reportContainer}>
          <Text style={styles.reportTitle}>نتائج تحليل المهارات</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.val}>{calculateMetrics().vmi}%</Text>
              <Text style={styles.lab}>الإدراك البصري</Text>
            </View>
            <View style={[styles.statItem, { borderBottomColor: '#3498DB' }]}>
              <Text style={[styles.val, { color: '#3498DB' }]}>{calculateMetrics().cpi}%</Text>
              <Text style={styles.lab}>المعالج المعرفي</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.retryBtn} 
            onPress={() => navigation?.goBack()}
          >
            <Text style={styles.retryBtnText}>العودة للرئيسية 🏠</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
              <Ionicons name="arrow-forward" size={24} color={PRIMARY} />
            </TouchableOpacity>
            <View style={styles.titleBlock}>
              <Text style={styles.mainTitle}>تحدي الأشكال الذكي</Text>
              <Text style={styles.levelSubtitle}>المرحلة {level} . مهارة التآزر</Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>مستوى الإنجاز {progressPercent}%</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          <View style={styles.gameArea}>
            <View style={styles.canvasWrapper} {...panResponder.panHandlers}>
              <Svg height="100%" width="100%" viewBox="0 0 320 500">
                <Defs>
                  <Mask id="m">
                    <Path d={getLevelPath()} fill="none" stroke="white" strokeWidth="40" strokeLinecap="round" />
                  </Mask>
                </Defs>
                {/* الدليل المنقط خلف الشكل */}
                <Path d={getLevelPath()} fill="none" stroke="#F1F5F9" strokeWidth="40" strokeLinecap="round" strokeDasharray="15,10" />
                <G mask="url(#m)">
                  {paths.map((p, i) => (
                    <Path key={i} d={`M${p.points.join(' L')}`} fill="none" stroke={p.color} strokeWidth="50" strokeLinecap="round" />
                  ))}
                  <Path d={`M${currentPath.join(' L')}`} fill="none" stroke={selectedColor} strokeWidth="50" strokeLinecap="round" />
                </G>
              </Svg>
            </View>

            <View style={styles.palette}>
              {colors.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorCircle, { 
                    backgroundColor: c, 
                    borderWidth: selectedColor === c ? 4 : 0, 
                    borderColor: '#FFF' 
                  }]}
                  onPress={() => setSelectedColor(c)}
                />
              ))}
            </View>

            <TouchableOpacity style={styles.nextBtn} onPress={handleNextLevel}>
              <Text style={styles.nextBtnText}>{level === 3 ? "إنهاء وتدقيق" : "المرحلة التالية ➡️"}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* مودال الخطأ */}
      <Modal visible={showError} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { borderTopColor: '#F59E0B' }]}>
            <Ionicons name="color-palette" size={60} color="#F59E0B" />
            <Text style={styles.modalTitle}>لم تنتهِ بعد!</Text>
            <Text style={styles.modalSub}>لون مساحة أكبر من الشكل لتنتقل للمرحلة التالية 🎨</Text>
          </View>
        </View>
      </Modal>

      {/* بطاقة التهنئة النهائية */}
      {showFinishedCard && (
        <View style={styles.fullOverlay}>
          <View style={styles.congratsCard}>
            <Text style={{ fontSize: 80 }}>🏆</Text>
            <Text style={styles.congratsTitle}>أحسنت يا بطل!</Text>
            <Text style={styles.congratsSub}>لقد أكملت جميع الأشكال بنسبة 100% 🌟</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={handleFinalFinish}>
              <Text style={styles.retryBtnText}>عرض مؤشرات الأداء 📊</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* أنيميشن النجاح بين المستويات */}
      {showSuccess && (
        <Animated.View style={[styles.levelSuccessOverlay, { opacity: fadeAnim }]}>
          <View style={styles.checkCircle}><Text style={styles.checkIcon}>✓</Text></View>
        </Animated.View>
      )}
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row-reverse', alignItems: 'center', padding: 20, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: CARD, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  titleBlock: { flex: 1, alignItems: 'flex-end' },
  mainTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  levelSubtitle: { color: PRIMARY, fontWeight: 'bold', fontSize: 12 },
  progressSection: { paddingHorizontal: 25 },
  progressLabel: { textAlign: 'right', fontSize: 12, marginBottom: 5, color: MUTED },
  progressBg: { height: 8, backgroundColor: BORDER, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: PRIMARY },
  gameArea: { flex: 1, alignItems: 'center', marginTop: 15 },
  canvasWrapper: { width: width * 0.85, height: 380, backgroundColor: CARD, borderRadius: 30, elevation: 5, overflow: 'hidden', borderWidth: 2, borderColor: BORDER },
  palette: { flexDirection: 'row', marginTop: 20, gap: 12 },
  colorCircle: { width: 35, height: 35, borderRadius: 18, elevation: 2 },
  nextBtn: { backgroundColor: PRIMARY, paddingHorizontal: 40, paddingVertical: 15, borderRadius: 20, marginTop: 20, elevation: 3 },
  nextBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  reportContainer: { padding: 25, alignItems: 'center', paddingTop: 40 },
  reportTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 30 },
  statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  statItem: { width: width * 0.4, padding: 20, backgroundColor: CARD, borderRadius: 20, alignItems: 'center', elevation: 4, borderBottomWidth: 6, borderBottomColor: PRIMARY },
  val: { fontSize: 28, fontWeight: 'bold', color: PRIMARY },
  lab: { fontSize: 11, color: MUTED, textAlign: 'center', marginTop: 5 },
  retryBtn: { backgroundColor: PRIMARY, width: '90%', padding: 15, borderRadius: 15, alignItems: 'center' },
  retryBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: '80%', backgroundColor: CARD, borderRadius: 30, padding: 25, alignItems: 'center', borderTopWidth: 8 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 10, color: '#1E293B' },
  modalSub: { fontSize: 14, color: MUTED, textAlign: 'center', marginTop: 10 },
  fullOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  congratsCard: { width: '85%', padding: 30, backgroundColor: CARD, borderRadius: 30, alignItems: 'center', elevation: 8 },
  congratsTitle: { fontSize: 26, fontWeight: 'bold', color: PRIMARY, marginTop: 10 },
  congratsSub: { fontSize: 15, color: MUTED, textAlign: 'center', marginVertical: 20 },
  levelSuccessOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 50 },
  checkCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: PRIMARY, justifyContent: 'center', alignItems: 'center' },
  checkIcon: { color: 'white', fontSize: 50, fontWeight: 'bold' }
});

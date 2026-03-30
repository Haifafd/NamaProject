import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const GAME_LEVELS = [
  { 
    id: 1, 
    target: '🍎', 
    options: ['🍎', '🍓', '🍒', '🍅'], 
    title: 'ابحث عن التفاحة' 
  },
  { 
    id: 2, 
    target: '🚗', 
    // المستوى الثاني: 4 خيارات بأنواع مختلطة (سيارة، قطة، موزة، فراولة)
    options: ['🚗', '🐱', '🍌', '🍓'], 
    title: 'ابحث عن السيارة الحمراء' 
  },
  { 
    id: 3, 
    target: '✈️', 
    // المستوى الثالث: 6 خيارات من أنواع مختلفة تماماً
    options: ['✈️', '🍔', '🎁', '🎈', '🔑', '🏠'], 
    title: 'ابحث عن الطائرة' 
  },
];

export default function MatchingGame() {
  const [level, setLevel] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [modalStatus, setModalStatus] = useState({ visible: false, success: true });
  const [showFinishedCard, setShowFinishedCard] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  const currentLevel = GAME_LEVELS[level] || GAME_LEVELS[GAME_LEVELS.length - 1];
  const progressPercent = Math.round((level / GAME_LEVELS.length) * 100);

  const initLevel = useCallback(() => {
    if (level < GAME_LEVELS.length) {
      setShuffledOptions([...GAME_LEVELS[level].options].sort(() => Math.random() - 0.5));
    }
  }, [level]);

  useEffect(() => {
    initLevel();
  }, [initLevel]);

  const handleChoice = (choice) => {
    if (choice === currentLevel.target) {
      if (level < GAME_LEVELS.length - 1) {
        setModalStatus({ visible: true, success: true });
      } else {
        setTimeout(() => setShowFinishedCard(true), 500);
      }
    } else {
      setWrongAttempts(prev => prev + 1);
      setModalStatus({ visible: true, success: false });
    }
  };

  const calculateResults = () => {
    const timeTaken = ((Date.now() - startTime) / 1000).toFixed(1);
    const vmi = Math.max(75, 100 - (wrongAttempts * 5));
    const cpi = Math.max(70, 95 - (timeTaken / 10));
    return { vmi, cpi, time: timeTaken };
  };

  const closeActivity = () => {
    // هنا يمكنك إضافة منطق التنقل (Navigation) للعودة للقائمة الرئيسية
    console.log("Activity Closed");
    // مثال: navigation.goBack();
  };

  if (showFinishedCard) {
    return (
      <SafeAreaView style={styles.fullOverlay}>
        <View style={styles.congratsCard}>
          <Ionicons name="trophy" size={80} color="#FFD700" />
          <Text style={styles.congratsTitle}>أحسنت يا بطل!</Text>
          <Text style={styles.congratsSub}>لقد أكملت تحدي المطابقة بنجاح 🌟</Text>
          <TouchableOpacity style={styles.mainBtn} onPress={() => { setShowFinishedCard(false); setShowReport(true); }}>
            <Text style={styles.btnText}>عرض مؤشرات الأداء 📊</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const res = calculateResults();

  return (
    <SafeAreaView style={styles.container}>
      {!showReport ? (
        <>
          <View style={styles.header}>
            <View style={styles.topRow}>
              <TouchableOpacity style={styles.backCircle} onPress={closeActivity}>
                <Ionicons name="arrow-back" size={24} color="#10B981" />
              </TouchableOpacity>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.mainTitle}>مهارة التركيز والمطابقة</Text>
                <Text style={styles.levelText}>المستوى {level + 1} . الإدراك البصري</Text>
              </View>
            </View>
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>مستوى التقدم {progressPercent}%</Text>
              <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progressPercent}%` }]} /></View>
            </View>
          </View>

          <View style={styles.gameArea}>
            <Text style={styles.instruction}>{currentLevel.title}</Text>
            <View style={styles.questionBox}>
              <Text style={styles.questionEmoji}>{currentLevel.target}</Text>
            </View>
            <Text style={styles.subInstruction}>اختر الشكل المطابق من الأسفل:</Text>
            <View style={styles.optionsGrid}>
              {shuffledOptions.map((item, index) => (
                <TouchableOpacity key={index} style={styles.optionCard} onPress={() => handleChoice(item)}>
                  <Text style={styles.optionEmoji}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      ) : (
        <ScrollView contentContainerStyle={styles.reportContent}>
          <Text style={styles.reportTitle}>تحليل مهارات الطفل</Text>
          <View style={styles.indicesRow}>
            <View style={styles.indexBox}>
              <Text style={styles.indexValue}>{res.vmi}%</Text>
              <Text style={styles.indexLabel}>الإدراك البصري (VMI)</Text>
            </View>
            <View style={[styles.indexBox, { borderBottomColor: '#3498DB' }]}>
              <Text style={[styles.indexValue, { color: '#3498DB' }]}>{res.cpi}%</Text>
              <Text style={styles.indexLabel}>المعالج المعرفي (CPI)</Text>
            </View>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryText}>الزمن المستغرق: {res.time} ثانية</Text>
            <Text style={styles.summaryText}>عدد الأخطاء: {wrongAttempts}</Text>
          </View>
          
          {/* أزرار النهاية */}
          <TouchableOpacity style={styles.mainBtn} onPress={() => { setLevel(0); setShowReport(false); setWrongAttempts(0); }}>
            <Text style={styles.btnText}>إعادة الاختبار 🔄</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.mainBtn, styles.exitBtn]} onPress={closeActivity}>
            <Text style={styles.exitBtnText}>الخروج من اللعبة 🚪</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}><Ionicons name="person-outline" size={22} color="#94A3B8" /><Text style={styles.navText}>حسابي</Text></TouchableOpacity>
        <View style={styles.activeNavItem}><Ionicons name="apps-outline" size={22} color="#10B981" /><Text style={[styles.navText, {color: '#10B981'}]}>نشاط</Text></View>
        <TouchableOpacity style={styles.navItem}><Ionicons name="home-outline" size={22} color="#94A3B8" /><Text style={styles.navText}>الرئيسية</Text></TouchableOpacity>
      </View>

      <Modal visible={modalStatus.visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={[styles.modalBody, { borderTopWidth: 8, borderTopColor: modalStatus.success ? '#10B981' : '#F59E0B' }]}>
            <Ionicons 
              name={modalStatus.success ? "checkmark-circle" : "alert-circle"} 
              size={70} 
              color={modalStatus.success ? "#10B981" : "#F59E0B"} 
            />
            <Text style={styles.modalTitle}>{modalStatus.success ? 'إجابة صحيحة!' : 'حاول مرة أخرى'}</Text>
            <Text style={styles.modalSub}>{modalStatus.success ? 'رائع، استمر في التركيز!' : 'انظر جيداً للشكل المطلوب'}</Text>
            <TouchableOpacity 
              style={[styles.mainBtn, {backgroundColor: modalStatus.success ? '#10B981' : '#F59E0B', width: '80%'}]} 
              onPress={() => { 
                setModalStatus({ ...modalStatus, visible: false }); 
                if(modalStatus.success) setLevel(level + 1); 
              }}>
              <Text style={styles.btnText}>{modalStatus.success ? 'المرحلة التالية' : 'حاول مجدداً'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { padding: 20, paddingTop: 30 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  mainTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  levelText: { color: '#10B981', fontSize: 13, fontWeight: '700' },
  progressContainer: { marginTop: 20 },
  progressLabel: { textAlign: 'right', fontSize: 12, color: '#64748B', marginBottom: 5, fontWeight: 'bold' },
  progressTrack: { height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10B981' },
  gameArea: { flex: 1, alignItems: 'center', paddingHorizontal: 20 },
  instruction: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginVertical: 20 },
  questionBox: { width: 110, height: 110, backgroundColor: '#FFF', borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, marginBottom: 20, borderWidth: 4, borderColor: '#F0FDF4' },
  questionEmoji: { fontSize: 55 },
  subInstruction: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15 },
  optionCard: { width: width * 0.4, height: 90, backgroundColor: '#FFF', borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  optionEmoji: { fontSize: 40 },
  mainBtn: { width: '100%', paddingVertical: 14, backgroundColor: '#10B981', borderRadius: 22, marginTop: 15, alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  exitBtn: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  exitBtnText: { color: '#64748B', fontWeight: 'bold', fontSize: 16 },
  fullOverlay: { flex: 1, backgroundColor: '#F0FDF4', justifyContent: 'center', alignItems: 'center' },
  congratsCard: { width: '85%', padding: 30, backgroundColor: '#FFF', borderRadius: 30, alignItems: 'center', elevation: 10 },
  congratsTitle: { fontSize: 26, fontWeight: 'bold', color: '#10B981', marginTop: 15 },
  congratsSub: { fontSize: 15, color: '#64748B', textAlign: 'center', marginVertical: 15 },
  reportContent: { padding: 25, alignItems: 'center', paddingTop: 50, paddingBottom: 100 },
  reportTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B', marginBottom: 30 },
  indicesRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  indexBox: { width: width * 0.42, padding: 20, backgroundColor: '#FFF', borderRadius: 22, alignItems: 'center', elevation: 4, borderBottomWidth: 6, borderBottomColor: '#10B981' },
  indexValue: { fontSize: 32, fontWeight: 'bold', color: '#10B981' },
  indexLabel: { fontSize: 11, color: '#64748B', textAlign: 'center', marginTop: 8, fontWeight: '600' },
  summaryBox: { width: '100%', backgroundColor: '#F0FDF4', padding: 20, borderRadius: 20, marginBottom: 15 },
  summaryText: { fontSize: 15, color: '#10B981', marginBottom: 8, textAlign: 'center', fontWeight: 'bold' },
  navBar: { position: 'absolute', bottom: 25, alignSelf: 'center', flexDirection: 'row', backgroundColor: '#FFF', width: '90%', height: 65, borderRadius: 32, alignItems: 'center', justifyContent: 'space-around', elevation: 12 },
  navItem: { alignItems: 'center' },
  activeNavItem: { alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  navText: { fontSize: 11, color: '#64748B', marginTop: 3, fontWeight: '700' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalBody: { width: '80%', backgroundColor: '#FFF', borderRadius: 25, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginTop: 15, color: '#1E293B' },
  modalSub: { fontSize: 14, color: '#64748B', textAlign: 'center', marginVertical: 10 },
});
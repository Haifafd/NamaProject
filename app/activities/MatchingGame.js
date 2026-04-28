import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useState } from 'react';
// --- استيرادات الفايربيس ---
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../FirebaseConfig";
// ----------------------------------
import {
  Dimensions,
  ImageBackground,
  Modal,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const GAME_LEVELS = [
  { 
    id: 1, 
    target: '🍎', 
    options: ['🍎', '🍌', '🍇', '🍍'], 
    title: 'المستوى المبتدئ: ابحث عن التفاحة 🍎',
    skill: 'تمييز الألوان'
  },
  { 
    id: 2, 
    target: '🚓', 
    options: ['🚓', '🚕', '🚗', '🚌', '🚑', '🚒'], 
    title: 'المستوى الذكي: تحدي سيارات المدينة! 🚓',
    skill: 'التركيز التفصيلي'
  },
  { 
    id: 3, 
    target: '🚀', 
    options: ['🚀', '✈️', '🛸', '🚁', '🛰️', '🎈', '🦅', '🐦'], 
    title: 'المستوى العبقري: هل تجد الصاروخ؟ 🚀',
    skill: 'المسح البصري السريع'
  },
];

export default function MatchingGame({ navigation }) {
  const [level, setLevel] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [modalStatus, setModalStatus] = useState({ visible: false, success: true });
  const [showFinishedCard, setShowFinishedCard] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  const currentLevel = GAME_LEVELS[level] || GAME_LEVELS[GAME_LEVELS.length - 1];
  const progressPercent = Math.round((level / GAME_LEVELS.length) * 100);

  // --- دالات الأصوات ---
  async function playSuccessSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(require("../../assets/sounds/correct.mp3"), { shouldPlay: true });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) sound.unloadAsync(); });
    } catch (e) { console.log("ملف correct.mp3 غير موجود"); }
  }

  async function playErrorSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(require("../../assets/sounds/wrong.mp3"), { shouldPlay: true });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) sound.unloadAsync(); });
    } catch (e) { console.log("ملف wrong.mp3 غير موجود"); }
  }

  async function playFinalClappingSound() {
    try {
      const { sound } = await Audio.Sound.createAsync(require("../../assets/sounds/clapping.mp3"), { shouldPlay: true });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((s) => { if (s.didJustFinish) sound.unloadAsync(); });
    } catch (e) { console.log("ملف clapping.mp3 غير موجود"); }
  }

  // --- حفظ البيانات في قاعدة البيانات ---
  const saveToFirestore = async () => {
    try {
      const timeTaken = (Date.now() - startTime) / 1000;
      const vmi = Math.max(65, 98 - (wrongAttempts * 4));
      
      let scaledScore; 
      if (vmi >= 90) scaledScore = 1;
      else if (vmi >= 80) scaledScore = 2;
      else if (vmi >= 70) scaledScore = 3;
      else if (vmi >= 60) scaledScore = 4;
      else scaledScore = 5;

      await addDoc(collection(db, "ActivityResults"), {
        activityId: "مطابقة الشكل الصحيح", // تم تغيير الاسم هنا للداتا بيس
        attempts: wrongAttempts + GAME_LEVELS.length,
        categoryId: "Attention", 
        childId: "child_user_01",
        completed: true,
        createdAt: serverTimestamp(),
        duration: parseFloat(timeTaken.toFixed(1)),
        level: level + 1,
        score: scaledScore,
        errors: wrongAttempts
      });
      console.log("تم حفظ نتائج مطابقة الشكل الصحيح بنجاح");
    } catch (e) {
      console.error("خطأ في حفظ بيانات المطابقة: ", e);
    }
  };

  const initLevel = useCallback(() => {
    if (level < GAME_LEVELS.length) {
      setShuffledOptions([...GAME_LEVELS[level].options].sort(() => Math.random() - 0.5));
    }
  }, [level]);

  useEffect(() => { initLevel(); }, [initLevel]);

  const handleChoice = (choice) => {
    if (choice === currentLevel.target) {
      if (level < GAME_LEVELS.length - 1) {
        playSuccessSound();
        setModalStatus({ visible: true, success: true });
      } else {
        saveToFirestore();
        playFinalClappingSound();
        setTimeout(() => setShowFinishedCard(true), 500);
      }
    } else {
      setWrongAttempts(prev => prev + 1);
      playErrorSound();
      setModalStatus({ visible: true, success: false });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ImageBackground source={require("../../assets/images/wallper.png")} style={StyleSheet.absoluteFillObject} resizeMode="cover">
        <View style={styles.overlayLayer} />
      </ImageBackground>

      <SafeAreaView style={{ flex: 1 }}>
        {!showFinishedCard ? (
          <View style={{ flex: 1 }}>
            <View style={styles.header}>
              <View style={styles.topRow}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
                  <Ionicons name="arrow-back" size={24} color="#10B981" />
                </TouchableOpacity>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.mainTitle}>مطابقة الشكل الصحيح</Text> 
                  <Text style={styles.levelText}>المرحلة {level + 1} . {currentLevel.skill}</Text>
                </View>
              </View>
              <View style={styles.progressSection}>
                <Text style={styles.progressLabel}>مستوى الإنجاز {progressPercent}%</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                </View>
              </View>
            </View>

            <View style={styles.gameArea}>
              <Text style={styles.instruction}>{currentLevel.title}</Text>
              <View style={styles.questionBox}>
                <Text style={styles.questionEmoji}>{currentLevel.target}</Text>
              </View>
              <Text style={styles.subInstruction}>المس الشكل المماثل بأسرع ما يمكن:</Text>
              <View style={styles.optionsGrid}>
                {shuffledOptions.map((item, index) => (
                  <TouchableOpacity key={index} style={styles.optionCard} onPress={() => handleChoice(item)}>
                    <Text style={styles.optionEmoji}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.centerBox}>
            <Text style={{fontSize: 100}}>🏆</Text>
            <Text style={styles.congratsTitle}>بطل متميز!</Text>
            <Text style={styles.congratsSub}>تم تسجيل مهاراتك في مطابقة الشكل الصحيح بنجاح 🎉</Text>
            <TouchableOpacity style={styles.mainBtn} onPress={() => navigation?.goBack()}>
              <Text style={styles.btnText}>العودة للرئيسية</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.navBar}>
          <View style={styles.navItem}><Ionicons name="person-outline" size={20} color="#94A3B8" /><Text style={styles.navText}>حسابي</Text></View>
          <View style={styles.activeNavItem}><Ionicons name="apps-outline" size={20} color="#10B981" /><Text style={[styles.navText, {color: '#10B981'}]}>نشاط</Text></View>
          <View style={styles.navItem}><Ionicons name="home-outline" size={20} color="#94A3B8" /><Text style={styles.navText}>الرئيسية</Text></View>
        </View>
      </SafeAreaView>

      <Modal visible={modalStatus.visible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { borderTopColor: modalStatus.success ? '#10B981' : '#FF6B6B', borderTopWidth: 10 }]}>
            <Text style={{fontSize: 80}}>{modalStatus.success ? "👏" : "☹️"}</Text>
            <Text style={styles.modalTitle}>{modalStatus.success ? 'إجابة عبقرية!' : 'أعد المحاولة'}</Text>
            <TouchableOpacity 
              style={[styles.modalBtn, {backgroundColor: modalStatus.success ? '#10B981' : '#FF6B6B'}]} 
              onPress={() => { setModalStatus({ ...modalStatus, visible: false }); if(modalStatus.success) setLevel(level + 1); }}>
              <Text style={styles.btnText}>{modalStatus.success ? 'استمر' : 'رجوع'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  overlayLayer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.85)' },
  header: { padding: 20, paddingTop: Platform.OS === 'ios' ? 10 : 30 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backBtn: { backgroundColor: '#FFF', padding: 8, borderRadius: 12, elevation: 3 },
  mainTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  levelText: { color: '#10B981', fontWeight: 'bold', fontSize: 12 },
  progressSection: { marginTop: 15 },
  progressLabel: { textAlign: 'right', fontSize: 11, marginBottom: 4, color: '#64748B' },
  progressTrack: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10B981' },
  gameArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  instruction: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 15, textAlign: 'center' },
  questionBox: { width: 100, height: 100, backgroundColor: '#FFF', borderRadius: 25, justifyContent: 'center', alignItems: 'center', elevation: 5, borderWidth: 3, borderColor: '#F0FDF4', marginBottom: 15 },
  questionEmoji: { fontSize: 50 },
  subInstruction: { fontSize: 13, color: '#64748B', marginBottom: 20 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, width: '90%' },
  optionCard: { width: width * 0.4, height: 85, backgroundColor: '#FFF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4, borderBottomWidth: 4, borderBottomColor: '#E2E8F0' },
  optionEmoji: { fontSize: 40 },
  navBar: { position: 'absolute', bottom: 20, alignSelf: 'center', width: '90%', height: 60, backgroundColor: '#FFF', borderRadius: 30, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 10 },
  navItem: { alignItems: 'center' },
  activeNavItem: { backgroundColor: '#F0FDF4', padding: 8, borderRadius: 15, alignItems: 'center' },
  navText: { fontSize: 10, fontWeight: 'bold' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  congratsTitle: { fontSize: 32, fontWeight: 'bold', color: '#10B981', marginTop: 20 },
  congratsSub: { fontSize: 16, color: '#64748B', textAlign: 'center', marginTop: 10 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFF', borderRadius: 30, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginVertical: 15 },
  modalBtn: { width: '100%', padding: 15, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  mainBtn: { backgroundColor: '#10B981', paddingHorizontal: 35, paddingVertical: 15, borderRadius: 15, marginTop: 20 },
});
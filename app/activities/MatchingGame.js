import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router"; // استخدام الراوتر المتوافق مع صفحاتك السابقة
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useCallback, useEffect, useState } from 'react';
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
import { auth, db } from "../../FirebaseConfig";

const { width } = Dimensions.get('window');

const GAME_LEVELS = [
  { id: 1, target: '🍎', options: ['🍎', '🍌', '🍇', '🍍'], title: 'المستوى المبتدئ: ابحث عن التفاحة 🍎', skill: 'تمييز الألوان' },
  { id: 2, target: '🚓', options: ['🚓', '🚕', '🚗', '🚌', '🚑', '🚒'], title: 'المستوى الذكي: تحدي سيارات المدينة! 🚓', skill: 'التركيز التفصيلي' },
  { id: 3, target: '🚀', options: ['🚀', '✈️', '🛸', '🚁', '🛰️', '🎈', '🦅', '🐦'], title: 'المستوى العبقري: هل تجد الصاروخ? 🚀', skill: 'المسح البصري السريع' },
];

export default function MatchingGame() {
  const router = useRouter(); 
  const [level, setLevel] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [modalStatus, setModalStatus] = useState({ visible: false, success: true });
  const [showFinishedCard, setShowFinishedCard] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [startTime] = useState(Date.now());

  const currentLevel = GAME_LEVELS[level] || GAME_LEVELS[GAME_LEVELS.length - 1];
  const progressPercent = Math.round((level / GAME_LEVELS.length) * 100);

  // حفظ النتائج في الفايربيس
  const saveToFirestore = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const timeTaken = (Date.now() - startTime) / 1000;
      const vmi = Math.max(65, 98 - (wrongAttempts * 4));
      let scaledScore = vmi >= 90 ? 1 : vmi >= 80 ? 2 : vmi >= 70 ? 3 : vmi >= 60 ? 4 : 5;

      await addDoc(collection(db, "ActivityResults"), {
        activityId: "مطابقة الشكل الصحيح",
        childId: user.uid,
        attempts: wrongAttempts + GAME_LEVELS.length,
        errors: wrongAttempts,
        duration: parseFloat(timeTaken.toFixed(1)),
        score: scaledScore,
        status: "completed",
        createdAt: serverTimestamp(),
      });
    } catch (e) { console.error("Firebase Error: ", e); }
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
        setModalStatus({ visible: true, success: true });
      } else {
        saveToFirestore();
        setShowFinishedCard(true);
      }
    } else {
      setWrongAttempts(prev => prev + 1);
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
                {/* زر العودة يوجه لصفحة الأنشطة */}
                <TouchableOpacity 
                  style={styles.backBtn} 
                  onPress={() => router.replace("/parent/Activities")}
                >
                  <Ionicons name="arrow-back" size={24} color="#10B981" />
                </TouchableOpacity>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.mainTitle}>مطابقة الشكل الصحيح</Text> 
                  <Text style={styles.levelText}>المرحلة {level + 1} . {currentLevel.skill}</Text>
                </View>
              </View>
              
              <View style={styles.progressSection}>
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
          /* صفحة بطل متميز */
          <View style={styles.centerBox}>
            <Text style={{fontSize: 100}}>🏆</Text>
            <Text style={styles.congratsTitle}>بطل متميز!</Text>
            <Text style={styles.congratsSub}>تم تسجيل مهاراتك في مطابقة الشكل الصحيح بنجاح 🎉</Text>
            <TouchableOpacity 
              style={styles.mainBtn} 
              onPress={() => router.replace("/parent/Activities")}
            >
              <Text style={styles.btnText}>العودة للأنشطة</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      <Modal visible={modalStatus.visible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { borderTopColor: modalStatus.success ? '#10B981' : '#FF6B6B', borderTopWidth: 10 }]}>
            <Text style={{fontSize: 80}}>{modalStatus.success ? "👏" : "☹️"}</Text>
            <Text style={styles.modalTitle}>{modalStatus.success ? 'إجابة عبقرية!' : 'أعد المحاولة'}</Text>
            <TouchableOpacity 
              style={[styles.modalBtn, {backgroundColor: modalStatus.success ? '#10B981' : '#FF6B6B'}]} 
              onPress={() => { 
                setModalStatus({ ...modalStatus, visible: false }); 
                if(modalStatus.success) setLevel(level + 1); 
              }}>
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
  progressTrack: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10B981' },
  gameArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 50 },
  instruction: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginBottom: 20, textAlign: 'center', paddingHorizontal: 20 },
  questionBox: { width: 110, height: 110, backgroundColor: '#FFF', borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 5, borderWidth: 3, borderColor: '#F0FDF4', marginBottom: 30 },
  questionEmoji: { fontSize: 55 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, width: '90%' },
  optionCard: { width: width * 0.4, height: 90, backgroundColor: '#FFF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 4, borderBottomWidth: 4, borderBottomColor: '#E2E8F0' },
  optionEmoji: { fontSize: 45 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  congratsTitle: { fontSize: 32, fontWeight: 'bold', color: '#10B981', marginTop: 20 },
  congratsSub: { fontSize: 16, color: '#64748B', textAlign: 'center', marginTop: 10 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#FFF', borderRadius: 30, padding: 25, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginVertical: 15 },
  modalBtn: { width: '100%', padding: 15, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  mainBtn: { backgroundColor: '#10B981', paddingHorizontal: 40, paddingVertical: 18, borderRadius: 20, marginTop: 30 },
});

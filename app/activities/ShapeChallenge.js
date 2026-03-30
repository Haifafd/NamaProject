import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Animated, Dimensions, Modal, PanResponder, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Defs, G, Mask, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function EnhancedDrawingGame() {
  const [level, setLevel] = useState(1);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [selectedColor, setSelectedColor] = useState('#10B981');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFinishedCard, setShowFinishedCard] = useState(false); 
  const [showReport, setShowReport] = useState(false);
  const [showError, setShowError] = useState(false); // رسالة الخطأ إذا لم يلون كفاية

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const stats = useRef({ 
    startTime: Date.now(), 
    levelPoints: 0, 
    allLevelsPoints: [],
    totalTime: 0 
  });

  const colors = ['#FF4D4D', '#4D8CFF', '#10B981', '#FFA500', '#A855F7', '#000000'];

  // حساب النسبة المئوية للتقدم الحقيقي
  const progressPercent = Math.round(((level - 1) / 3) * 100);

  const getLevelPath = () => {
    if (level === 1) return "M80,100 L240,400";
    if (level === 2) return "M80,100 L240,400 L80,400";
    return "M80,100 L240,400 M240,100 L80,400";
  };

  const handleNextLevel = () => {
    // شرط تلوين 75% (تقريباً 150 نقطة لمسار المستوى الأول ويزيد في المستويات الأخرى)
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
      setTimeout(() => setShowError(false), 2000);
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

  const calculateMetrics = () => {
    const totalPoints = stats.current.allLevelsPoints.reduce((a, b) => a + b, 0);
    let vmi = Math.min(98, Math.round((totalPoints / 1000) * 100)); 
    const cpi = Math.max(65, Math.min(95, 100 - (stats.current.totalTime / 15)));
    return { vmi, cpi, time: stats.current.totalTime.toFixed(1) };
  };

  if (showReport) {
    const res = calculateMetrics();
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.reportTitle}>تحليل مهارات الطفل</Text>
        <View style={styles.statsGrid}>
          <View style={styles.card}><Text style={styles.val}>{res.vmi}%</Text><Text style={styles.lab}>الإدراك (VMI)</Text></View>
          <View style={[styles.card, {borderBottomColor: '#3498DB'}]}><Text style={[styles.val, {color: '#3498DB'}]}>{res.cpi}%</Text><Text style={styles.lab}>المعالجة (CPI)</Text></View>
          <View style={styles.card}><Text style={styles.val}>{res.time}ث</Text><Text style={styles.lab}>الزمن الكلي</Text></View>
        </View>
        <TouchableOpacity style={styles.mainBtn} onPress={() => { setLevel(1); setShowReport(false); setPaths([]); stats.current.allLevelsPoints = []; stats.current.startTime = Date.now(); stats.current.levelPoints = 0; }}>
          <Text style={styles.btnText}>إعادة التجربة 🔄</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {showFinishedCard && (
        <View style={styles.fullOverlay}>
          <View style={styles.congratsCard}>
            <Ionicons name="trophy" size={80} color="#FFD700" />
            <Text style={styles.congratsTitle}>أحسنت يا بطل!</Text>
            <Text style={styles.congratsSub}>لقد أكملت جميع الأشكال بنسبة 100% 🌟</Text>
            <TouchableOpacity style={styles.mainBtn} onPress={() => { setShowFinishedCard(false); setShowReport(true); }}>
              <Text style={styles.btnText}>عرض مؤشرات الأداء 📊</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showSuccess && (
        <Animated.View style={[styles.successOverlay, { opacity: fadeAnim }]}>
          <View style={styles.successCircle}><Text style={styles.checkMark}>✓</Text></View>
        </Animated.View>
      )}

      {/* مودال الخطأ عند عدم إكمال التلوين */}
      <Modal visible={showError} transparent animationType="slide">
        <View style={styles.errorContainer}>
           <View style={styles.errorBox}>
              <Ionicons name="color-palette" size={50} color="#F59E0B" />
              <Text style={styles.errorTitle}>لم تنتهِ بعد!</Text>
              <Text style={styles.errorText}>لون مساحة أكبر من الشكل لتنتقل للمرحلة التالية 🎨</Text>
           </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <Text style={styles.title}>تحدي الأشكال الذكي</Text>
        <Text style={styles.progressText}>الإنجاز: {progressPercent}%</Text>
        <View style={styles.progressContainer}>
           <View style={[styles.progressBar, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <Svg height="100%" width="100%" viewBox="0 0 320 500">
          <Defs><Mask id="m"><Path d={getLevelPath()} fill="none" stroke="white" strokeWidth="40" strokeLinecap="round" /></Mask></Defs>
          <Path d={getLevelPath()} fill="none" stroke="#F1F5F9" strokeWidth="40" strokeLinecap="round" strokeDasharray="15,10" />
          <G mask="url(#m)">
            {paths.map((p, i) => (<Path key={i} d={`M${p.points.join(' L')}`} fill="none" stroke={p.color} strokeWidth="50" strokeLinecap="round" />))}
            <Path d={`M${currentPath.join(' L')}`} fill="none" stroke={selectedColor} strokeWidth="50" strokeLinecap="round" />
          </G>
        </Svg>
      </View>

      <View style={styles.colorPicker}>
        {colors.map((c) => (
          <TouchableOpacity 
            key={c} 
            style={[styles.circle, { backgroundColor: c, borderWidth: selectedColor === c ? 4 : 0, borderColor: '#1E293B' }]} 
            onPress={() => setSelectedColor(c)} 
          />
        ))}
      </View>

      <TouchableOpacity style={styles.mainBtn} onPress={handleNextLevel}>
        <Text style={styles.btnText}>{level === 3 ? "إنهاء وتدقيق" : "المرحلة التالية ➡️"}</Text>
      </TouchableOpacity>

      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navItem}><Ionicons name="person-outline" size={22} color="#94A3B8" /><Text style={styles.navText}>حسابي</Text></TouchableOpacity>
        <View style={styles.activeNavItem}><Ionicons name="brush" size={22} color="#10B981" /><Text style={[styles.navText, {color: '#10B981'}]}>نشاط</Text></View>
        <TouchableOpacity style={styles.navItem}><Ionicons name="home-outline" size={22} color="#94A3B8" /><Text style={styles.navText}>الرئيسية</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', alignItems: 'center' },
  header: { width: '90%', marginTop: 20, alignItems: 'flex-end' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#1E293B' },
  progressText: { marginTop: 5, fontSize: 13, color: '#64748B', fontWeight: 'bold' },
  progressContainer: { width: '100%', height: 10, backgroundColor: '#E2E8F0', borderRadius: 5, marginTop: 5 },
  progressBar: { height: '100%', backgroundColor: '#10B981', borderRadius: 5 },
  canvasContainer: { width: 320, height: 380, backgroundColor: '#FFF', borderRadius: 30, marginTop: 15, elevation: 5, overflow: 'hidden' },
  colorPicker: { flexDirection: 'row', marginTop: 15, gap: 10, justifyContent: 'center', width: '90%' },
  circle: { width: 38, height: 38, borderRadius: 19 },
  mainBtn: { paddingVertical: 14, paddingHorizontal: 35, backgroundColor: '#10B981', borderRadius: 22, marginTop: 15, elevation: 4 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  fullOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(240, 253, 244, 0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 200 },
  congratsCard: { width: '85%', padding: 30, backgroundColor: '#FFF', borderRadius: 30, alignItems: 'center', elevation: 10 },
  congratsTitle: { fontSize: 26, fontWeight: 'bold', color: '#10B981', marginTop: 15 },
  congratsSub: { fontSize: 15, color: '#64748B', textAlign: 'center', marginVertical: 20 },
  navBar: { position: 'absolute', bottom: 25, flexDirection: 'row', backgroundColor: '#FFF', width: '90%', height: 65, borderRadius: 32, alignItems: 'center', justifyContent: 'space-around', elevation: 12 },
  navItem: { alignItems: 'center' },
  activeNavItem: { alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  navText: { fontSize: 11, color: '#64748B', marginTop: 3, fontWeight: '700' },
  reportTitle: { fontSize: 24, fontWeight: 'bold', marginTop: 40, color: '#1E293B' },
  statsGrid: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 25, marginBottom: 30 },
  card: { width: width * 0.28, padding: 15, backgroundColor: '#FFF', borderRadius: 20, borderBottomWidth: 5, borderBottomColor: '#10B981', elevation: 4, alignItems: 'center' },
  val: { fontSize: 22, fontWeight: 'bold', color: '#10B981' },
  lab: { fontSize: 10, color: '#64748B', marginTop: 5, textAlign: 'center' },
  successOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  successCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center' },
  checkMark: { color: 'white', fontSize: 50, fontWeight: 'bold' },
  // تصميم رسالة الخطأ
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  errorBox: { width: '80%', backgroundColor: '#FFF', padding: 25, borderRadius: 25, alignItems: 'center', borderTopWidth: 8, borderTopColor: '#F59E0B' },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginTop: 10 },
  errorText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 10 },
});
import { useRouter } from "expo-router"; // استيراد useRouter للتنقل
import { useRef, useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";

// استدعاء الفايربيس والثيم الموحد
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";
import { AppLayout, BORDER, CARD, MUTED, PRIMARY } from "./ActivityStyle";
import ResultModal from "./Result";

const { width } = Dimensions.get("window");

const PALETTE = [
  { id: 1, color: "#4A90E2", label: "١" },
  { id: 2, color: "#FFA000", label: "٢" },
  { id: 3, color: "#EF4444", label: "٣" },
  { id: 4, color: "#26E675", label: "٤" },
];

// دالة حساب مؤشر التآزر البصري الحركي
function calculateVisualMotorIndex(accuracy, speedScore, errorRate) {
  return (accuracy * 0.4) + (speedScore * 0.3) + ((1 - errorRate) * 0.3);
}

export default function ButterflyColoringScreen({ navigation, route }) {
  const router = useRouter(); // تعريف الراوتر للتحكم في التنقل
  const activityId = route?.params?.activityId || "7uE1Wl6s17R2t4pMOA9Z"; 

  const [selectedColorId, setSelectedColorId] = useState(1);
  const [zoneColors, setZoneColors] = useState({});
  const [progress, setProgress] = useState(0);
  const [gameState, setGameState] = useState("playing");

  const startTime = useRef(Date.now());
  const totalAttempts = useRef(0);
  const totalErrors = useRef(0);
  const totalZones = 6; 

  // حفظ النتيجة في Firebase
  const saveResult = async (vmi) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "ActivityResults"), {
          childId: user.uid,
          activityId: activityId,
          visualMotorIndex: parseFloat(vmi.toFixed(2)),
          status: "won",
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error("❌ خطأ أثناء حفظ النتيجة:", error);
    }
  };

  const handleZonePress = (zoneId, requiredLabel) => {
    if (gameState === "won") return;

    totalAttempts.current += 1;
    const selected = PALETTE.find((p) => p.id === selectedColorId);
    
    if (selected.label !== requiredLabel) {
      totalErrors.current += 1;
      return; 
    }

    if (!zoneColors[zoneId]) {
      const newColors = { ...zoneColors, [zoneId]: selected.color };
      setZoneColors(newColors);
      
      const newProgress = Object.keys(newColors).length / totalZones;
      setProgress(newProgress);

      if (Object.keys(newColors).length === totalZones) {
        finishGame();
      }
    }
  };

  const finishGame = () => {
    const endTime = Date.now();
    const durationInSeconds = (endTime - startTime.current) / 1000;

    const accuracy = (totalZones / totalAttempts.current) || 0;
    const speedScore = Math.max(0, 1 - durationInSeconds / 40); 
    const errorRate = (totalErrors.current / totalAttempts.current) || 0;

    const vmi = calculateVisualMotorIndex(accuracy, speedScore, errorRate);

    saveResult(vmi);
    setGameState("won");
  };

  const handleReset = () => {
    setZoneColors({});
    setProgress(0);
    setGameState("playing");
    startTime.current = Date.now();
    totalAttempts.current = 0;
    totalErrors.current = 0;
  };

  const ColoringPart = ({ id, d, label, lx, ly }) => (
    <G onPress={() => handleZonePress(id, label)}>
      <Path
        d={d}
        fill={zoneColors[id] || "#FFFFFF"}
        stroke="#1A1D2D"
        strokeWidth="1.5"
      />
      {!zoneColors[id] && label && (
        <SvgText x={lx} y={ly} fontSize="14" fill="#A0A0A0" textAnchor="middle" fontWeight="bold">
          {label}
        </SvgText>
      )}
    </G>
  );

  return (
    <AppLayout activeTab="activities">
      {/* الهيدر: الزر يسار والنص يمين */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()} // الرجوع لصفحة الأنشطة
        >
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>نشاط تلوين الفراشة</Text>
          <Text style={styles.subtitle}>مهارة: التآزر البصري الحركي</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressHeader}>
           <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
           <Text style={styles.progressLabel}>مستوى التقدم</Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.instructionRow}>
        <Text style={styles.instruction}>طابق الأرقام بالألوان لتلوين الفراشة</Text>
      </View>

      <View style={styles.gameArea}>
        <View style={styles.canvasCard}>
          <Svg width={width * 0.85} height={250} viewBox="0 0 300 200">
            <G transform="translate(10, 10)">
              <ColoringPart id="body" label="١" lx="150" ly="170" d="M145,160 Q150,190 155,160 Q160,130 150,110 Q140,130 145,160 Z M150,110 Q145,90 150,70 Q155,90 150,110 Z" />
              <ColoringPart id="wing_r_t" label="٢" lx="220" ly="60" d="M150,100 C170,80 230,40 260,80 C290,120 230,140 150,100 Z" />
              <ColoringPart id="wing_r_b" label="٣" lx="200" ly="140" d="M150,100 C170,120 210,180 230,150 C250,120 210,100 150,100 Z" />
              <ColoringPart id="wing_l_t" label="٢" lx="80" ly="60" d="M150,100 C130,80 70,40 40,80 C10,120 70,140 150,100 Z" />
              <ColoringPart id="wing_l_b" label="٣" lx="100" ly="140" d="M150,100 C130,120 90,180 70,150 C50,120 90,100 150,100 Z" />
              <ColoringPart id="spots" label="٤" lx="150" ly="100" d="M230,80 C240,70 240,60 230,50 C220,60 220,70 230,80 Z M70,80 C60,70 60,60 70,50 C80,60 80,70 70,80 Z" />
            </G>
          </Svg>
        </View>
      </View>

      <View style={styles.paletteContainer}>
        <View style={styles.paletteRow}>
          {PALETTE.map((item) => (
            <TouchableOpacity key={item.id} style={styles.paletteItem} onPress={() => setSelectedColorId(item.id)}>
              <View style={[styles.colorCircle, { backgroundColor: item.color }, selectedColorId === item.id && styles.activeColor]}>
                {selectedColorId === item.id && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.paletteLabel, { color: selectedColorId === item.id ? item.color : MUTED }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetIcon}>↺</Text>
          <Text style={styles.resetText}>إعادة التلوين</Text>
        </TouchableOpacity>
      </View>

      <ResultModal 
        visible={gameState !== "playing"} 
        state={gameState} 
        onReset={handleReset} 
        onNavigateNext={() => router.back()} // العودة بعد النجاح
      />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  header: { 
    flexDirection: "row", // الزر يسار
    alignItems: "center", 
    paddingHorizontal: 20, 
    paddingTop: 50, 
    paddingBottom: 16, 
    justifyContent: 'space-between' 
  },
  backBtn: { 
    width: 42, height: 42, borderRadius: 21, backgroundColor: CARD, 
    alignItems: "center", justifyContent: "center", elevation: 3 
  },
  backArrow: { fontSize: 32, color: PRIMARY, fontWeight: 'bold' },
  titleBlock: { alignItems: "flex-end" }, // النصوص يمين
  title: { fontSize: 18, fontWeight: "700", color: "#2d2d2d" },
  subtitle: { fontSize: 13, color: PRIMARY, fontWeight: '600' },
  
  progressRow: { paddingHorizontal: 25, marginBottom: 15 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  progressLabel: { fontSize: 13, color: MUTED },
  progressPct: { fontSize: 12, fontWeight: "bold", color: PRIMARY },
  progressBg: { height: 10, borderRadius: 6, backgroundColor: BORDER, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: PRIMARY, borderRadius: 6 },
  
  instructionRow: { paddingHorizontal: 20, marginBottom: 4 },
  instruction: { fontSize: 14, color: MUTED, textAlign: "right", fontWeight: '600' },
  gameArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  canvasCard: { backgroundColor: CARD, borderRadius: 25, elevation: 8, padding: 15 },
  paletteContainer: { paddingBottom: 10 },
  paletteRow: { flexDirection: "row-reverse", justifyContent: "center", gap: 12, marginBottom: 15 },
  paletteItem: { alignItems: "center" },
  colorCircle: { width: 55, height: 55, borderRadius: 27.5, elevation: 3, alignItems: "center", justifyContent: "center" },
  activeColor: { transform: [{ scale: 1.1 }], borderWidth: 3, borderColor: "#fff" },
  checkmark: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  paletteLabel: { marginTop: 4, fontWeight: "bold", fontSize: 16 },
  resetButton: { flexDirection: "row-reverse", alignItems: "center", alignSelf: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: CARD, elevation: 2, marginBottom: 10 },
  resetIcon: { fontSize: 18, color: MUTED },
  resetText: { fontSize: 14, color: MUTED, fontWeight: '600' },
});

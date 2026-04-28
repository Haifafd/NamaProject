import { useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";

const { width } = Dimensions.get("window");

const PRIMARY = "#4CAF50";
const CARD    = "#ffffff";
const MUTED   = "#737373";
const BORDER  = "#C8E6C9";

const PALETTE = [
  { id: 1, color: "#4A90E2", label: "١" },
  { id: 2, color: "#FFA000", label: "٢" },
  { id: 3, color: "#EF4444", label: "٣" },
  { id: 4, color: "#26E675", label: "٤" },
];

const TABS = [
  { key: "profile",    label: "حسابي",     icon: require("../../assets/images/icons/profile.png"),  screen: "Profile" },
  { key: "activities", label: "نشاط",     icon: require("../../assets/images/icons/game.png"), screen: "Activities" },
  { key: "home",       label: "الرئيسية", icon: require("../../assets/images/icons/home.png"),     screen: "Home" },
];

function BottomTabBar({ active = "activities", navigation }) {
  return (
    <View style={tabStyles.wrapper}>
      <View style={tabStyles.container}>
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <TouchableOpacity
              key={tab.key}
              style={tabStyles.tab}
              onPress={() => navigation && navigation.navigate(tab.screen)}
              activeOpacity={0.7}
            >
              <View style={[tabStyles.pill, isActive && tabStyles.pillActive]}>
                <Image
                  source={tab.icon}
                  style={[
                    tabStyles.icon,
                    { tintColor: isActive ? PRIMARY : MUTED },
                  ]}
                  resizeMode="contain"
                />
              </View>
              <Text style={[tabStyles.label, isActive && tabStyles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function ButterflyColoringScreen({ navigation }) {
  const [selectedColorId, setSelectedColorId] = useState(4);
  const [zoneColors, setZoneColors] = useState({});
  const [progress, setProgress] = useState(0.65);

  const handleZonePress = (zoneId) => {
    const selected = PALETTE.find((p) => p.id === selectedColorId);
    if (!selected) return;
    
    if (!zoneColors[zoneId]) {
      setProgress(prev => Math.min(1, prev + 0.05));
    }
    
    setZoneColors((prev) => ({ ...prev, [zoneId]: selected.color }));
  };

  const handleReset = () => {
    setZoneColors({});
    setProgress(0.65);
  };

  const ColoringPart = ({ id, d, label, lx, ly }) => (
    <G onPress={() => handleZonePress(id)}>
      <Path
        d={d}
        fill={zoneColors[id] || "#FFFFFF"}
        stroke="#1A1D2D"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {!zoneColors[id] && label && (
        <SvgText x={lx} y={ly} fontSize="14" fill="#A0A0A0" textAnchor="middle" fontWeight="bold">
          {label}
        </SvgText>
      )}
    </G>
  );

  return (
    <ImageBackground source={require("../../assets/images/wallper.png")} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation && navigation.goBack()}>
            <Text style={styles.backArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>نشاط تلوين الفراشة</Text>
            <Text style={styles.subtitle}>مهارة: مهارة المرحلة</Text>
          </View>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>مستوى التقدم</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
        </View>

        <View style={styles.instructionRow}>
          <Text style={styles.instruction}>
            قم بتلوين الرسم الظاهرة عن طريق مطابقة الأرقام
          </Text>
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
            <Text style={styles.resetText}>إعادة</Text>
          </TouchableOpacity>
        </View>

        <BottomTabBar active="activities" navigation={navigation} />
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255, 255, 255, 0.55)" },
  safe: { flex: 1 },
  header: { flexDirection: "row-reverse", alignItems: "center", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: CARD, alignItems: "center", justifyContent: "center", elevation: 3 },
  backArrow: { fontSize: 26, color: PRIMARY, transform: [{ rotate: "180deg" }], lineHeight: 30 },
  titleBlock: { flex: 1, alignItems: "flex-end" },
  title: { fontSize: 18, fontWeight: "700", color: "#2d2d2d", textAlign: "right" },
  subtitle: { fontSize: 12, color: MUTED, textAlign: "right" },
  progressRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8, paddingHorizontal: 16, marginBottom: 4 },
  progressLabel: { fontSize: 12, color: MUTED, minWidth: 80, textAlign: "right" },
  progressBg: { flex: 1, height: 10, borderRadius: 5, backgroundColor: BORDER, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5, backgroundColor: PRIMARY },
  progressPct: { fontSize: 13, fontWeight: "700", color: PRIMARY, minWidth: 36, textAlign: "right" },
  instructionRow: { paddingHorizontal: 20, marginBottom: 4 },
  instruction: { fontSize: 13, color: MUTED, textAlign: "right" },
  gameArea: { flex: 1, alignItems: "center", justifyContent: "center" },
  canvasCard: { backgroundColor: CARD, borderRadius: 25, elevation: 8, padding: 15 },
  paletteContainer: { paddingBottom: 10 },
  paletteRow: { flexDirection: "row-reverse", justifyContent: "center", gap: 12, marginBottom: 15 },
  paletteItem: { alignItems: "center" },
  colorCircle: { width: 50, height: 50, borderRadius: 25, elevation: 3, alignItems: "center", justifyContent: "center" },
  activeColor: { transform: [{ scale: 1.1 }], borderWidth: 2, borderColor: "#fff" },
  checkmark: { color: "#fff", fontWeight: "bold" },
  paletteLabel: { marginTop: 4, fontWeight: "bold", fontSize: 14 },
  resetButton: { flexDirection: "row-reverse", alignItems: "center", alignSelf: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: CARD, elevation: 2, marginBottom: 10 },
  resetIcon: { fontSize: 16, color: MUTED },
  resetText:  { fontSize: 13, color: MUTED },
});

const tabStyles = StyleSheet.create({
  wrapper: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 },
  container: { flexDirection: "row-reverse", backgroundColor: CARD, borderRadius: 32, paddingVertical: 10, paddingHorizontal: 16, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 16, elevation: 10 },
  tab: { flex: 1, alignItems: "center", gap: 4 },
  pill: { width: 44, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  pillActive: { backgroundColor: "#E8F5E9" },
  icon: { width: 22, height: 22 },
  label: { fontSize: 11, color: MUTED, fontWeight: "500" },
  labelActive: { color: PRIMARY, fontWeight: "700" },
});


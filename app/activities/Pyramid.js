import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Image,
} from "react-native";

const { width } = Dimensions.get("window");

const PRIMARY = "#4CAF50";
const CARD    = "#ffffff";
const MUTED   = "#737373";
const BORDER  = "#C8E6C9";

const INITIAL_RINGS = [
  { id: "large",  color: "#EF5350", size: 80,  placed: false },
  { id: "medium", color: "#42A5F5", size: 60,  placed: false },
  { id: "small",  color: "#66BB6A", size: 40,  placed: false },
];

const TABS = [
  { key: "profile",    label: "حسابي",     icon: require("../../assets/profile.png"),  screen: "Profile" },
  { key: "activities", label: "نشاط",     icon: require("../../assets/game.png"), screen: "Activities" },
  { key: "home",       label: "الرئيسية", icon: require("../../assets/home.png"),     screen: "Home" },
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

function RingItem({ ring, onDrop }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [isDragging, setIsDragging] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      pan.setOffset({ x: pan.x._value, y: pan.y._value });
      pan.setValue({ x: 0, y: 0 });
      setIsDragging(true);
    },
    onPanResponderMove: Animated.event(
      [null, { dx: pan.x, dy: pan.y }],
      { useNativeDriver: false }
    ),
    onPanResponderRelease: () => {
      pan.flattenOffset();
      if (pan.y._value < -80) onDrop(ring.id);
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false,
      }).start();
      setIsDragging(false);
    },
  });

  if (ring.placed) return null;

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: ring.size * 1.8,
          height: ring.size * 0.5,
          borderRadius: ring.size * 0.25,
          backgroundColor: ring.color,
          transform: pan.getTranslateTransform(),
          zIndex: isDragging ? 999 : 1,
          opacity: isDragging ? 0.85 : 1,
          elevation: isDragging ? 12 : 3,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <Text style={styles.ringLabel}>{ring.label}</Text>
    </Animated.View>
  );
}

function Peg({ placedRings }) {
  return (
    <View style={styles.pegContainer}>
      <View style={styles.pegBase} />
      <View style={styles.pegStick} />
      <View style={styles.placedRingsContainer}>
        {[...placedRings].reverse().map((ring) => (
          <View
            key={ring.id}
            style={{
              width: ring.size * 1.8,
              height: ring.size * 0.5,
              borderRadius: ring.size * 0.25,
              backgroundColor: ring.color,
              marginBottom: 2,
            }}
          />
        ))}
      </View>
    </View>
  );
}

export default function PyramidScreen({ navigation }) {
  const [rings, setRings] = useState(INITIAL_RINGS);
  const [progress, setProgress] = useState(0.65);
  const [success, setSuccess] = useState(false);

  const placedRings   = rings.filter((r) => r.placed);
  const unplacedRings = rings.filter((r) => !r.placed);

  const handleDrop = (id) => {
    const orderedUnplaced = INITIAL_RINGS.filter((r) =>
      rings.find((pr) => pr.id === r.id && !pr.placed)
    );
    if (orderedUnplaced[0]?.id === id) {
      const updated = rings.map((r) =>
        r.id === id ? { ...r, placed: true } : r
      );
      setRings(updated);
      const newPlaced = updated.filter((r) => r.placed).length;
      setProgress(Math.min(1, 0.65 + newPlaced * 0.1));
      if (newPlaced === INITIAL_RINGS.length) setSuccess(true);
    }
  };

  const handleReset = () => {
    setRings(INITIAL_RINGS);
    setProgress(0.65);
    setSuccess(false);
  };

  return (
    <ImageBackground
      source={require("../../assets/wallper.png")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation && navigation.goBack()}
          >
            <Text style={styles.backArrow}>›</Text>
          </TouchableOpacity>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>لعبة بناء هرم</Text>
            <Text style={styles.subtitle}>مهارة: مهارة المرحلة</Text>
          </View>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>مستوى التقدم</Text>
          <View style={styles.progressBg}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressPct}>
            {Math.round(progress * 100)}%
          </Text>
        </View>

        <View style={styles.instructionRow}>
          <Text style={styles.instruction}>
            قم بسحب الشكل لبناء الهرم من الأكبر إلى الأصغر
          </Text>
        </View>

        {success && (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>
              🎉 أحسنت! بنيت الهرم بنجاح!
            </Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={styles.successReset}>↺</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.gameArea}>
          <Peg placedRings={placedRings} />
        </View>

        <View style={styles.dropTarget}>
          <Text style={styles.dropHint}>
            {unplacedRings.length > 0
              ? "← اسحب الحلقة إلى الأعلى"
              : "أحسنت! الهرم مكتمل"}
          </Text>
        </View>

        <View style={styles.ringsContainer}>
          {INITIAL_RINGS.map((ring) => (
            <RingItem
              key={ring.id}
              ring={rings.find((r) => r.id === ring.id)}
              onDrop={handleDrop}
            />
          ))}
        </View>

        {!success && (
          <View style={styles.resetRow}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetIcon}>↺</Text>
              <Text style={styles.resetText}>إعادة</Text>
            </TouchableOpacity>
          </View>
        )}

        <BottomTabBar active="activities" navigation={navigation} />

      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
  },
  safe: { flex: 1, backgroundColor: "transparent" },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  backArrow: {
    fontSize: 26,
    color: PRIMARY,
    transform: [{ rotate: "180deg" }],
    lineHeight: 30,
  },
  titleBlock: { flex: 1, alignItems: "flex-end" },
  title: { fontSize: 18, fontWeight: "700", color: "#2d2d2d", textAlign: "right" },
  subtitle: { fontSize: 12, color: MUTED, textAlign: "right" },
  progressRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  progressLabel: { fontSize: 12, color: MUTED, minWidth: 80, textAlign: "right" },
  progressBg: { flex: 1, height: 10, borderRadius: 5, backgroundColor: BORDER, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5, backgroundColor: PRIMARY },
  progressPct: { fontSize: 13, fontWeight: "700", color: PRIMARY, minWidth: 36, textAlign: "right" },
  instructionRow: { paddingHorizontal: 20, marginBottom: 4 },
  instruction: { fontSize: 13, color: MUTED, textAlign: "right" },
  successBanner: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    backgroundColor: PRIMARY,
  },
  successText: { color: "white", fontSize: 15, fontWeight: "700" },
  successReset: { fontSize: 22, color: "white", padding: 6 },
  gameArea: { flex: 1, alignItems: "center", justifyContent: "flex-end", paddingBottom: 20 },
  pegContainer: { alignItems: "center", justifyContent: "flex-end", height: 220 },
  pegBase: { width: 160, height: 22, borderRadius: 11, backgroundColor: "#8D6E63" },
  pegStick: {
    width: 16,
    height: 180,
    borderRadius: 8,
    backgroundColor: "#A1887F",
    position: "absolute",
    bottom: 22,
  },
  placedRingsContainer: {
    position: "absolute",
    bottom: 22,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 2,
  },
  dropTarget: {
    marginHorizontal: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    borderColor: BORDER,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  dropHint: { fontSize: 13, color: MUTED },
  ringsContainer: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    minHeight: 80,
  },
  ring: { alignItems: "center", justifyContent: "center" },
  ringLabel: { color: "white", fontSize: 13, fontWeight: "600" },
  resetRow: { alignItems: "center", paddingBottom: 12 },
  resetButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: CARD,
  },
  resetIcon: { fontSize: 16, color: MUTED },
  resetText:  { fontSize: 13, color: MUTED },
});

const tabStyles = StyleSheet.create({
  wrapper: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8, backgroundColor: "transparent" },
  container: {
    flexDirection: "row-reverse",
    backgroundColor: CARD,
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  tab: { flex: 1, alignItems: "center", gap: 4 },
  pill: { width: 44, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  pillActive: { backgroundColor: "#E8F5E9" },
  icon: { width: 22, height: 22 },
  label: { fontSize: 11, color: MUTED, fontWeight: "500" },
  labelActive: { color: PRIMARY, fontWeight: "700" },
});
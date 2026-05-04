import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";
import {
  CATEGORY_INFO,
  getActivitiesByIds,
  getChildPlan,
} from "../../Services/ActivityService";
import { stopBackgroundMusic } from "../../Services/MusicService";
import {
  computeStationStates,
  getChildProgress,
} from "../../Services/ProgressService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const GARDEN = {
  // Sky (top strip only)
  skyTop: "#87CEEB",
  skyMid: "#B3E5FC",
  cloudWhite: "#FFFFFF",
  sunYellow: "#FFC93C",
  sunGlow: "#FFE082",

  // Garden (main background)
  gardenLight: "#A5D6A7",
  gardenMain: "#66BB6A",
  gardenDark: "#4CAF50",
  gardenDeep: "#388E3C",

  // Trees
  treeLight: "#66BB6A",
  treeMain: "#4CAF50",
  treeDark: "#388E3C",
  treeBrown: "#6D4C41",
  treeBark: "#8D6E63",

  // Path
  pathDot: "#FF8FA3",
  pathStone: "#D7CCC8",

  // Stations
  stationActive: "#FFC93C",
  stationCompleted: "#66BB6A",
  stationLocked: "#9E9E9E",

  // Treasure
  treasureGold: "#FFD700",

  // Mascot
  rabbitWhite: "#FFFFFF",
  rabbitPink: "#FFB6C1",
  scarfPink: "#EC407A",

  // Decorations
  flowerPink: "#EC407A",
  flowerYellow: "#FFCA28",
  flowerPurple: "#AB47BC",
  flowerWhite: "#FFFFFF",
  flowerOrange: "#FF7043",
  butterflyOrange: "#FF7043",
  butterflyPurple: "#9C27B0",
  butterflyPink: "#EC407A",

  // Stars
  starGold: "#FFD700",
  starGray: "#E0E0E0",

  // Text
  textDark: "#1B5E20",
  textOnGarden: "#FFFFFF",
};

const STATION_THEMES = [
  "tree",
  "flower",
  "balloon",
  "mushroom",
  "butterfly",
  "star",
];

// ─────────────────────────────────────────────
// SVG components
// ─────────────────────────────────────────────

function NoumiOnPath({ size = 70 }) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 70 77" fill="none">
      <Ellipse cx="35" cy="73" rx="20" ry="3" fill="#000" opacity="0.15" />
      <Ellipse cx="27" cy="14" rx="5" ry="13" fill={GARDEN.rabbitWhite} />
      <Ellipse
        cx="27"
        cy="15"
        rx="3"
        ry="10"
        fill={GARDEN.rabbitPink}
        opacity="0.7"
      />
      <Ellipse cx="43" cy="14" rx="5" ry="13" fill={GARDEN.rabbitWhite} />
      <Ellipse
        cx="43"
        cy="15"
        rx="3"
        ry="10"
        fill={GARDEN.rabbitPink}
        opacity="0.7"
      />
      <Circle cx="35" cy="36" r="20" fill={GARDEN.rabbitWhite} />
      <Circle cx="24" cy="42" r="3.5" fill={GARDEN.rabbitPink} opacity="0.7" />
      <Circle cx="46" cy="42" r="3.5" fill={GARDEN.rabbitPink} opacity="0.7" />
      <Circle cx="29" cy="34" r="3" fill="#2C2C2C" />
      <Circle cx="41" cy="34" r="3" fill="#2C2C2C" />
      <Circle cx="30" cy="33" r="1.2" fill="#FFFFFF" />
      <Circle cx="42" cy="33" r="1.2" fill="#FFFFFF" />
      <Ellipse cx="35" cy="40" rx="2.2" ry="1.7" fill="#FF6B9D" />
      <Path
        d="M 35 42 Q 32 45 30 43"
        stroke="#3E2723"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 35 42 Q 38 45 40 43"
        stroke="#3E2723"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <Ellipse cx="35" cy="62" rx="16" ry="12" fill={GARDEN.rabbitWhite} />
      <Path
        d="M 22 55 Q 35 60 48 55 Q 48 58 35 62 Q 22 58 22 55 Z"
        fill={GARDEN.scarfPink}
      />
    </Svg>
  );
}

function StationIcon({ theme, status, size = 80 }) {
  const baseColor =
    status === "completed"
      ? GARDEN.stationCompleted
      : status === "active"
        ? GARDEN.stationActive
        : GARDEN.stationLocked;
  const opacity = status === "locked" ? 0.5 : 1;

  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Circle
        cx="40"
        cy="40"
        r="36"
        fill={
          status === "active"
            ? "#FFFFFF"
            : status === "completed"
              ? "#E8F5E9"
              : "#F5F5F5"
        }
        stroke={baseColor}
        strokeWidth="4"
        opacity={opacity}
      />

      <G opacity={opacity}>
        {theme === "tree" && (
          <>
            <Path d="M 38 56 L 38 44 L 42 44 L 42 56 Z" fill="#6D4C41" />
            <Circle cx="40" cy="36" r="14" fill="#4CAF50" />
            <Circle cx="32" cy="42" r="9" fill="#43A047" />
            <Circle cx="48" cy="42" r="9" fill="#43A047" />
            <Circle cx="40" cy="28" r="11" fill="#66BB6A" />
            <Circle cx="36" cy="32" r="2.5" fill="#E53935" />
            <Circle cx="46" cy="38" r="2.5" fill="#E53935" />
          </>
        )}
        {theme === "flower" && (
          <>
            <Path
              d="M 40 60 L 40 46"
              stroke="#558B2F"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <Circle cx="40" cy="28" r="10" fill="#EC407A" />
            <Circle cx="28" cy="36" r="10" fill="#EC407A" />
            <Circle cx="52" cy="36" r="10" fill="#EC407A" />
            <Circle cx="40" cy="44" r="10" fill="#EC407A" />
            <Circle cx="40" cy="36" r="6" fill="#FFCA28" />
          </>
        )}
        {theme === "balloon" && (
          <>
            <Path d="M 40 56 L 38 70" stroke="#3E2723" strokeWidth="1.5" />
            <Path d="M 40 60 L 36 68 L 44 68 Z" fill="#3E2723" opacity="0.3" />
            <Ellipse cx="40" cy="36" rx="18" ry="22" fill="#9C27B0" />
            <Ellipse
              cx="34"
              cy="28"
              rx="6"
              ry="9"
              fill="#CE93D8"
              opacity="0.6"
            />
            <Path d="M 40 58 L 38 60 L 42 60 Z" fill="#9C27B0" />
          </>
        )}
        {theme === "mushroom" && (
          <>
            <Path d="M 30 56 Q 30 46 40 46 Q 50 46 50 56 Z" fill="#FFFFFF" />
            <Path
              d="M 22 38 Q 40 18 58 38 Q 58 46 40 46 Q 22 46 22 38 Z"
              fill="#E53935"
            />
            <Circle cx="30" cy="34" r="3" fill="#FFFFFF" />
            <Circle cx="46" cy="38" r="3" fill="#FFFFFF" />
            <Circle cx="40" cy="28" r="3" fill="#FFFFFF" />
          </>
        )}
        {theme === "butterfly" && (
          <>
            <Ellipse cx="40" cy="40" rx="2" ry="14" fill="#3E2723" />
            <Ellipse
              cx="26"
              cy="32"
              rx="14"
              ry="10"
              fill="#FF7043"
              transform="rotate(-25 26 32)"
            />
            <Ellipse
              cx="54"
              cy="32"
              rx="14"
              ry="10"
              fill="#FF7043"
              transform="rotate(25 54 32)"
            />
            <Ellipse
              cx="28"
              cy="50"
              rx="10"
              ry="8"
              fill="#FFAB91"
              transform="rotate(20 28 50)"
            />
            <Ellipse
              cx="52"
              cy="50"
              rx="10"
              ry="8"
              fill="#FFAB91"
              transform="rotate(-20 52 50)"
            />
            <Circle cx="24" cy="30" r="2.5" fill="#FFFFFF" />
            <Circle cx="56" cy="30" r="2.5" fill="#FFFFFF" />
          </>
        )}
        {theme === "star" && (
          <Path
            d="M 40 16 L 47 32 L 64 34 L 51 46 L 55 64 L 40 54 L 25 64 L 29 46 L 16 34 L 33 32 Z"
            fill="#FFC93C"
          />
        )}
      </G>

      {status === "locked" && (
        <G>
          <Path
            d="M 32 38 L 32 32 Q 32 26 40 26 Q 48 26 48 32 L 48 38"
            stroke="#757575"
            strokeWidth="3.5"
            fill="none"
          />
          <Path d="M 28 38 L 52 38 L 52 56 L 28 56 Z" fill="#757575" />
          <Circle cx="40" cy="46" r="2.5" fill="#FFFFFF" />
        </G>
      )}

      {status === "completed" && (
        <>
          <Circle
            cx="62"
            cy="18"
            r="11"
            fill={GARDEN.stationCompleted}
            stroke="#FFFFFF"
            strokeWidth="2"
          />
          <Path
            d="M 57 18 L 61 22 L 67 14"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      )}
    </Svg>
  );
}

function StarIcon({ filled, size = 18 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M 12 2 L 15 9 L 22 10 L 17 15 L 18 22 L 12 19 L 6 22 L 7 15 L 2 10 L 9 9 Z"
        fill={filled ? GARDEN.starGold : GARDEN.starGray}
        stroke={filled ? "#F57C00" : "#BDBDBD"}
        strokeWidth="1"
      />
    </Svg>
  );
}

function TreasureChest({ size = 100, unlocked = false }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      {unlocked && (
        <>
          <Circle
            cx="50"
            cy="55"
            r="48"
            fill={GARDEN.treasureGold}
            opacity="0.3"
          />
          <Circle
            cx="50"
            cy="55"
            r="38"
            fill={GARDEN.treasureGold}
            opacity="0.5"
          />
        </>
      )}
      <Path d="M 18 50 L 18 80 L 82 80 L 82 50 Z" fill="#8D6E63" />
      <Path d="M 18 50 L 18 80 L 26 80 L 26 50 Z" fill="#5D4037" />
      <Path d="M 74 50 L 74 80 L 82 80 L 82 50 Z" fill="#5D4037" />
      <Path
        d={
          unlocked
            ? "M 14 30 Q 50 15 86 30 L 86 50 L 14 50 Z"
            : "M 14 50 Q 50 35 86 50 L 86 50 L 14 50 Z"
        }
        fill="#A1887F"
      />
      <Path
        d={unlocked ? "M 14 30 Q 50 15 86 30" : "M 14 50 Q 50 35 86 50"}
        stroke="#5D4037"
        strokeWidth="2"
        fill="none"
      />
      <Path d="M 14 50 L 86 50" stroke="#FFD700" strokeWidth="3" />
      <Path
        d="M 14 65 L 86 65"
        stroke="#FFD700"
        strokeWidth="2"
        opacity="0.7"
      />
      {!unlocked && (
        <>
          <Path d="M 45 56 L 55 56 L 55 64 L 45 64 Z" fill="#FFD700" />
          <Circle cx="50" cy="60" r="1.5" fill="#5D4037" />
        </>
      )}
      {unlocked && (
        <>
          <Path
            d="M 50 22 L 51 28 L 56 29 L 51 30 L 50 36 L 49 30 L 44 29 L 49 28 Z"
            fill="#FFFFFF"
          />
          <Path
            d="M 30 35 L 31 38 L 34 39 L 31 40 L 30 43 L 29 40 L 26 39 L 29 38 Z"
            fill="#FFFFFF"
          />
          <Path
            d="M 70 35 L 71 38 L 74 39 L 71 40 L 70 43 L 69 40 L 66 39 L 69 38 Z"
            fill="#FFFFFF"
          />
        </>
      )}
    </Svg>
  );
}

function CloudSVG({ size = 80 }) {
  return (
    <Svg width={size} height={size * 0.55} viewBox="0 0 100 55" fill="none">
      <Ellipse cx="22" cy="32" rx="18" ry="14" fill={GARDEN.cloudWhite} />
      <Ellipse cx="50" cy="26" rx="22" ry="18" fill={GARDEN.cloudWhite} />
      <Ellipse cx="78" cy="32" rx="18" ry="14" fill={GARDEN.cloudWhite} />
      <Ellipse cx="50" cy="38" rx="32" ry="13" fill={GARDEN.cloudWhite} />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// New garden decoration SVGs
// ─────────────────────────────────────────────

function BackgroundTree({ size = 80, variant = 0 }) {
  const colors = [
    [GARDEN.treeMain, GARDEN.treeDark, GARDEN.treeLight],
    [GARDEN.treeDark, GARDEN.treeMain, GARDEN.treeLight],
    [GARDEN.treeLight, GARDEN.treeMain, GARDEN.treeDark],
  ];
  const [c1, c2, c3] = colors[variant % 3];

  return (
    <Svg width={size} height={size * 1.3} viewBox="0 0 80 100" fill="none">
      <Path d="M 36 92 L 36 60 L 44 60 L 44 92 Z" fill={GARDEN.treeBrown} />
      <Circle cx="40" cy="40" r="26" fill={c1} />
      <Circle cx="26" cy="48" r="18" fill={c2} />
      <Circle cx="54" cy="48" r="18" fill={c2} />
      <Circle cx="40" cy="28" r="20" fill={c3} />
      <Circle cx="32" cy="38" r="10" fill={c3} opacity="0.7" />
      <Circle cx="48" cy="42" r="10" fill={c3} opacity="0.7" />
    </Svg>
  );
}

function BushSVG({ size = 60 }) {
  return (
    <Svg width={size} height={size * 0.7} viewBox="0 0 60 42" fill="none">
      <Ellipse cx="30" cy="28" rx="28" ry="14" fill={GARDEN.gardenDark} />
      <Circle cx="18" cy="22" r="11" fill={GARDEN.treeMain} />
      <Circle cx="30" cy="18" r="13" fill={GARDEN.treeMain} />
      <Circle cx="42" cy="22" r="11" fill={GARDEN.treeMain} />
      <Circle cx="22" cy="20" r="5" fill={GARDEN.treeLight} opacity="0.7" />
      <Circle cx="36" cy="16" r="6" fill={GARDEN.treeLight} opacity="0.7" />
    </Svg>
  );
}

function GrassTuft({ size = 30 }) {
  return (
    <Svg width={size} height={size * 0.8} viewBox="0 0 30 24" fill="none">
      <Path
        d="M 5 24 Q 4 12 6 4"
        stroke={GARDEN.gardenDark}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 11 24 Q 10 10 13 2"
        stroke={GARDEN.gardenDeep}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 17 24 Q 16 12 19 5"
        stroke={GARDEN.gardenDark}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 23 24 Q 22 10 25 3"
        stroke={GARDEN.gardenDeep}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function MiniFlower({ size = 24, color = GARDEN.flowerPink }) {
  return (
    <Svg width={size} height={size * 1.3} viewBox="0 0 24 32" fill="none">
      <Path
        d="M 12 30 L 12 18"
        stroke={GARDEN.treeDark}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Ellipse
        cx="15"
        cy="24"
        rx="3"
        ry="1.5"
        fill={GARDEN.treeDark}
        transform="rotate(30 15 24)"
      />
      <Circle cx="12" cy="6" r="5" fill={color} />
      <Circle cx="6" cy="12" r="5" fill={color} />
      <Circle cx="18" cy="12" r="5" fill={color} />
      <Circle cx="12" cy="16" r="5" fill={color} />
      <Circle cx="12" cy="11" r="3" fill={GARDEN.flowerYellow} />
    </Svg>
  );
}

function TallFlower({ size = 50, color = GARDEN.flowerPink }) {
  return (
    <Svg width={size * 0.6} height={size} viewBox="0 0 30 50" fill="none">
      <Path
        d="M 15 50 L 15 20"
        stroke={GARDEN.treeDark}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Ellipse
        cx="20"
        cy="38"
        rx="5"
        ry="2"
        fill={GARDEN.treeDark}
        transform="rotate(30 20 38)"
      />
      <Ellipse
        cx="10"
        cy="32"
        rx="5"
        ry="2"
        fill={GARDEN.treeDark}
        transform="rotate(-30 10 32)"
      />
      <Circle cx="15" cy="10" r="6" fill={color} />
      <Circle cx="9" cy="14" r="6" fill={color} />
      <Circle cx="21" cy="14" r="6" fill={color} />
      <Circle cx="15" cy="18" r="6" fill={color} />
      <Circle cx="15" cy="14" r="4" fill={GARDEN.flowerYellow} />
    </Svg>
  );
}

function GardenSun({ size = 70 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 70 70" fill="none">
      <Defs>
        <RadialGradient id="sunRays" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={GARDEN.sunGlow} stopOpacity="0.7" />
          <Stop offset="100%" stopColor={GARDEN.sunGlow} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx="35" cy="35" r="33" fill="url(#sunRays)" />
      <G opacity="0.85">
        <Path
          d="M 35 6 L 35 14"
          stroke={GARDEN.sunYellow}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Path
          d="M 56 14 L 51 19"
          stroke={GARDEN.sunYellow}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Path
          d="M 14 14 L 19 19"
          stroke={GARDEN.sunYellow}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Path
          d="M 60 35 L 52 35"
          stroke={GARDEN.sunYellow}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Path
          d="M 10 35 L 18 35"
          stroke={GARDEN.sunYellow}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </G>
      <Circle cx="35" cy="35" r="18" fill={GARDEN.sunYellow} />
      <Circle cx="30" cy="32" r="2" fill="#5D4037" />
      <Circle cx="40" cy="32" r="2" fill="#5D4037" />
      <Path
        d="M 30 38 Q 35 42 40 38"
        stroke="#5D4037"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function FloatingButterfly({ size = 30, color = GARDEN.butterflyOrange }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Ellipse cx="15" cy="15" rx="1" ry="7" fill="#3E2723" />
      <Ellipse
        cx="9"
        cy="11"
        rx="6"
        ry="5"
        fill={color}
        transform="rotate(-25 9 11)"
      />
      <Ellipse
        cx="21"
        cy="11"
        rx="6"
        ry="5"
        fill={color}
        transform="rotate(25 21 11)"
      />
      <Ellipse
        cx="10"
        cy="20"
        rx="5"
        ry="4"
        fill={color}
        opacity="0.7"
        transform="rotate(20 10 20)"
      />
      <Ellipse
        cx="20"
        cy="20"
        rx="5"
        ry="4"
        fill={color}
        opacity="0.7"
        transform="rotate(-20 20 20)"
      />
      <Circle cx="8" cy="10" r="0.8" fill="white" />
      <Circle cx="22" cy="10" r="0.8" fill="white" />
    </Svg>
  );
}

// ─────────────────────────────────────────────
// Path geometry
// ─────────────────────────────────────────────
function calculateStationPositions(count, screenWidth) {
  const positions = [];
  const verticalGap = 130;
  const horizontalAmplitude = (screenWidth - 200) / 2;
  const centerX = screenWidth / 2;
  const startY = 120;

  for (let i = 0; i < count; i++) {
    const sineOffset =
      Math.sin((i / count) * Math.PI * 2) * horizontalAmplitude;
    positions.push({
      x: centerX + sineOffset,
      y: startY + i * verticalGap,
    });
  }
  return positions;
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
export default function ChildHome() {
  const router = useRouter();
  const { childId, childName } = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [activities, setActivities] = useState([]);
  const [progress, setProgress] = useState({});
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);

  const noumiPulse = useRef(new Animated.Value(1)).current;
  const activeStationPulse = useRef(new Animated.Value(1)).current;

  const butterfly1Anim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const butterfly2Anim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const butterfly3Anim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const butterfly4Anim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [childId]),
  );

  const loadData = async () => {
    if (!childId) {
      router.replace("/parent/homepageP");
      return;
    }
    try {
      setLoading(true);

      const childPlan = await getChildPlan(childId);
      if (
        !childPlan ||
        !childPlan.activityIds ||
        childPlan.activityIds.length === 0
      ) {
        router.replace("/parent/homepageP");
        return;
      }
      setPlan(childPlan);

      const acts = await getActivitiesByIds(childPlan.activityIds);
      setActivities(acts);

      const progressMap = await getChildProgress(childId);
      setProgress(progressMap);

      const stationStates = computeStationStates(
        childPlan.activityIds,
        progressMap,
      );
      setStations(stationStates);
    } catch (error) {
      console.error("Error loading child home:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(noumiPulse, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(noumiPulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(activeStationPulse, {
          toValue: 1.12,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(activeStationPulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const floatButterfly = (anim, dx, dy, duration) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: { x: dx, y: dy },
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: { x: 0, y: 0 },
            duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    };
    floatButterfly(butterfly1Anim, 30, -20, 4000);
    floatButterfly(butterfly2Anim, -25, 25, 4500);
    floatButterfly(butterfly3Anim, 35, 30, 3800);
    floatButterfly(butterfly4Anim, -40, -25, 5000);
  }, []);

  const handleBackToParent = async () => {
    await stopBackgroundMusic();
    router.replace("/parent/homepageP");
  };

  const handleStationPress = (station, index) => {
    if (station.status === "locked") return;
    const activity = activities.find((a) => a.id === station.activityId);
    if (!activity) return;
    setSelectedStation({ ...station, activity, index });
  };

  const handleStartActivity = () => {
    if (!selectedStation) return;
    const activity = selectedStation.activity;
    setSelectedStation(null);

    console.log("🎮 Activity tapped:", {
      id: activity.id,
      title: activity.title,
      categoryId: activity.categoryId,
    });

    const gameRoutes = {
      pyramid: "/activities/Pyramid",
      pyramid_building: "/activities/Pyramid",
      bubble: "/activities/BubbleActivity",
      bubble_activity: "/activities/BubbleActivity",
      bubbles: "/activities/BubbleActivity",
      xo: "/activities/XO-Activity",
      "xo-activity": "/activities/XO-Activity",
      memory: "/activities/MemoryCard",
      memory_card: "/activities/MemoryCard",
      memorycard: "/activities/MemoryCard",
      color: "/activities/ColorActivity",
      coloring: "/activities/ColorActivity",
      colors: "/activities/ColorActivity",
      coloractivity: "/activities/ColorActivity",
      matching: "/activities/MatchingGame",
      matching_game: "/activities/MatchingGame",
      matchinggame: "/activities/MatchingGame",
      findball: "/activities/FindBallActivity",
      findballactivity: "/activities/FindBallActivity",
      find_ball: "/activities/FindBallActivity",
      story: "/activities/StoryCompletionActivity",
      storycompletion: "/activities/StoryCompletionActivity",
      storycompletionactivity: "/activities/StoryCompletionActivity",
      different: "/activities/DifferentShapeActivity",
      differentshape: "/activities/DifferentShapeActivity",
      differentshapeactivity: "/activities/DifferentShapeActivity",
      finding: "/activities/ShapeFindingActivity",
      shape_finding: "/activities/ShapeFindingActivity",
      shapefinding: "/activities/ShapeFindingActivity",
      shapefindingactivity: "/activities/ShapeFindingActivity",
    };

    const idLower = (activity.id || "").toLowerCase();
    let route = gameRoutes[idLower];

    if (!route) {
      const t = (activity.title || "").toLowerCase().trim();

      if (t.includes("هرم") || t.includes("pyramid") || t.includes("بناء")) {
        route = "/activities/Pyramid";
      } else if (t.includes("فقاع") || t.includes("bubble")) {
        route = "/activities/BubbleActivity";
      } else if (t.includes("xo") || t.includes("x o") || t.includes("إكس") || t.includes("اكس")) {
        route = "/activities/XO-Activity";
      } else if (t.includes("ذاكرة") || t.includes("memory") || t.includes("بطاق")) {
        route = "/activities/MemoryCard";
      } else if (
        t.includes("تلوين") ||
        t.includes("لون") ||
        t.includes("الوان") ||
        t.includes("ألوان") ||
        t.includes("الألوان") ||
        t.includes("رسم") ||
        t.includes("color") ||
        t.includes("paint") ||
        t.includes("draw")
      ) {
        route = "/activities/ColorActivity";
      } else if (t.includes("مطابق") || t.includes("توصيل") || t.includes("matching")) {
        route = "/activities/MatchingGame";
      } else if (t.includes("كرة") || t.includes("ابحث") || t.includes("ball") || t.includes("find")) {
        route = "/activities/FindBallActivity";
      } else if (t.includes("قصة") || t.includes("إكمال") || t.includes("اكمال") || t.includes("ترتيب") || t.includes("story")) {
        route = "/activities/StoryCompletionActivity";
      } else if (t.includes("مختلف") || t.includes("different")) {
        route = "/activities/DifferentShapeActivity";
      } else if (
        t.includes("إيجاد") ||
        t.includes("ايجاد") ||
        t.includes("دوّر") ||
        t.includes("دور") ||
        t.includes("finding") ||
        t.includes("عد") ||
        t.includes("count")
      ) {
        route = "/activities/ShapeFindingActivity";
      } else if (t.includes("ذكاء") || t.includes("تحدي")) {
        route = "/activities/XO-Activity";
      }
    }

    if (!route && activity.categoryId) {
      if (activity.categoryId === "perceptionCategoryID") {
        route = "/activities/ColorActivity";
      }
    }

    if (!route) {
      console.log("❌ No route matched for activity:", activity);
      setTimeout(() => {
        alert(
          `اللعبة "${activity.title}" غير مربوطة بعد.\n\nID: ${activity.id}\nالفئة: ${activity.categoryId}`
        );
      }, 300);
      return;
    }

    console.log("✅ Routing to:", route);

    setTimeout(() => {
      router.push({
        pathname: route,
        params: {
          childId,
          activityId: activity.id,
          activityTitle: activity.title || "",
          category: activity.categoryId || "",
        },
      });
    }, 200);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GARDEN.stationActive} />
      </View>
    );
  }

  const completedCount = stations.filter(
    (s) => s.status === "completed",
  ).length;
  const totalCount = stations.length;
  const allDone = completedCount === totalCount && totalCount > 0;

  const positions = calculateStationPositions(totalCount, SCREEN_WIDTH);
  const treasureY =
    positions.length > 0 ? positions[positions.length - 1].y + 140 : 200;
  const totalHeight = treasureY + 200;

  const activeIdx = stations.findIndex((s) => s.status === "active");
  const lastCompletedIdx =
    activeIdx === -1 ? stations.length - 1 : activeIdx - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={GARDEN.skyTop} />

      {/* SKY LAYER (top 18%) */}
      <View style={styles.skyLayer}>
        <View style={styles.sun}>
          <GardenSun size={75} />
        </View>
        <View style={styles.skyCloud1}>
          <CloudSVG size={60} />
        </View>
        <View style={styles.skyCloud2}>
          <CloudSVG size={45} />
        </View>
        <View style={styles.skyCloud3}>
          <CloudSVG size={50} />
        </View>
      </View>

      {/* GARDEN BACKGROUND */}
      <View style={styles.gardenBackground} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBackToParent}>
          <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <Path
              d="M 14 6 L 8 12 L 14 18"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </Svg>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>{childName || "صديقي"}</Text>
          <Text style={styles.headerProgress}>
            {completedCount} من {totalCount}{" "}
            {totalCount === 1 ? "نشاط" : "أنشطة"}
          </Text>
        </View>

        <View style={{ width: 44 }} />
      </View>

      {/* SCROLLABLE PATH WITH GARDEN DECORATIONS */}
      <ScrollView
        contentContainerStyle={[styles.pathContainer, { height: totalHeight }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Background trees on edges */}
        <View style={[styles.bgTreeLeft, { top: 80 }]}>
          <BackgroundTree size={70} variant={0} />
        </View>
        <View style={[styles.bgTreeRight, { top: 100 }]}>
          <BackgroundTree size={75} variant={1} />
        </View>
        <View style={[styles.bgTreeLeft, { top: totalHeight * 0.4 }]}>
          <BackgroundTree size={65} variant={2} />
        </View>
        <View style={[styles.bgTreeRight, { top: totalHeight * 0.5 }]}>
          <BackgroundTree size={80} variant={0} />
        </View>
        <View style={[styles.bgTreeLeft, { top: totalHeight * 0.75 }]}>
          <BackgroundTree size={70} variant={1} />
        </View>
        <View style={[styles.bgTreeRight, { top: totalHeight * 0.8 }]}>
          <BackgroundTree size={75} variant={2} />
        </View>

        {/* Bushes scattered */}
        <View style={[styles.bushLeft, { top: totalHeight * 0.2 }]}>
          <BushSVG size={50} />
        </View>
        <View style={[styles.bushRight, { top: totalHeight * 0.3 }]}>
          <BushSVG size={45} />
        </View>
        <View style={[styles.bushLeft, { top: totalHeight * 0.6 }]}>
          <BushSVG size={55} />
        </View>
        <View style={[styles.bushRight, { top: totalHeight * 0.7 }]}>
          <BushSVG size={50} />
        </View>

        {/* Tall flowers scattered */}
        <View style={[styles.tallFlowerLeft, { top: totalHeight * 0.15 }]}>
          <TallFlower size={40} color={GARDEN.flowerPink} />
        </View>
        <View style={[styles.tallFlowerRight, { top: totalHeight * 0.25 }]}>
          <TallFlower size={45} color={GARDEN.flowerYellow} />
        </View>
        <View style={[styles.tallFlowerLeft, { top: totalHeight * 0.45 }]}>
          <TallFlower size={42} color={GARDEN.flowerPurple} />
        </View>
        <View style={[styles.tallFlowerRight, { top: totalHeight * 0.55 }]}>
          <TallFlower size={40} color={GARDEN.flowerOrange} />
        </View>
        <View style={[styles.tallFlowerLeft, { top: totalHeight * 0.85 }]}>
          <TallFlower size={42} color={GARDEN.flowerPink} />
        </View>

        {/* Mini flowers scattered */}
        <View style={[styles.miniFlower, { top: totalHeight * 0.1, left: 30 }]}>
          <MiniFlower size={20} color={GARDEN.flowerYellow} />
        </View>
        <View
          style={[styles.miniFlower, { top: totalHeight * 0.18, right: 40 }]}
        >
          <MiniFlower size={18} color={GARDEN.flowerPink} />
        </View>
        <View
          style={[styles.miniFlower, { top: totalHeight * 0.32, left: 50 }]}
        >
          <MiniFlower size={22} color={GARDEN.flowerWhite} />
        </View>
        <View
          style={[styles.miniFlower, { top: totalHeight * 0.5, right: 30 }]}
        >
          <MiniFlower size={20} color={GARDEN.flowerPurple} />
        </View>
        <View
          style={[styles.miniFlower, { top: totalHeight * 0.65, left: 35 }]}
        >
          <MiniFlower size={22} color={GARDEN.flowerYellow} />
        </View>
        <View
          style={[styles.miniFlower, { top: totalHeight * 0.78, right: 50 }]}
        >
          <MiniFlower size={18} color={GARDEN.flowerOrange} />
        </View>

        {/* Grass tufts */}
        <View style={[styles.grassTuft, { top: totalHeight * 0.12, left: 60 }]}>
          <GrassTuft size={24} />
        </View>
        <View
          style={[styles.grassTuft, { top: totalHeight * 0.28, right: 60 }]}
        >
          <GrassTuft size={28} />
        </View>
        <View style={[styles.grassTuft, { top: totalHeight * 0.55, left: 70 }]}>
          <GrassTuft size={26} />
        </View>
        <View
          style={[styles.grassTuft, { top: totalHeight * 0.72, right: 70 }]}
        >
          <GrassTuft size={24} />
        </View>

        {/* Floating butterflies */}
        <Animated.View
          style={[
            styles.butterfly,
            { top: totalHeight * 0.2, left: SCREEN_WIDTH * 0.7 },
            { transform: butterfly1Anim.getTranslateTransform() },
          ]}
        >
          <FloatingButterfly size={26} color={GARDEN.butterflyOrange} />
        </Animated.View>
        <Animated.View
          style={[
            styles.butterfly,
            { top: totalHeight * 0.4, left: SCREEN_WIDTH * 0.15 },
            { transform: butterfly2Anim.getTranslateTransform() },
          ]}
        >
          <FloatingButterfly size={22} color={GARDEN.butterflyPurple} />
        </Animated.View>
        <Animated.View
          style={[
            styles.butterfly,
            { top: totalHeight * 0.6, left: SCREEN_WIDTH * 0.75 },
            { transform: butterfly3Anim.getTranslateTransform() },
          ]}
        >
          <FloatingButterfly size={24} color={GARDEN.butterflyPink} />
        </Animated.View>
        <Animated.View
          style={[
            styles.butterfly,
            { top: totalHeight * 0.8, left: SCREEN_WIDTH * 0.2 },
            { transform: butterfly4Anim.getTranslateTransform() },
          ]}
        >
          <FloatingButterfly size={22} color={GARDEN.butterflyOrange} />
        </Animated.View>

        {/* PATH CONNECTING LINES */}
        <Svg
          width={SCREEN_WIDTH}
          height={totalHeight}
          style={StyleSheet.absoluteFill}
          fill="none"
        >
          {positions.map((pos, idx) => {
            if (idx === 0) return null;
            const prev = positions[idx - 1];
            return (
              <Path
                key={`path-${idx}`}
                d={`M ${prev.x} ${prev.y + 40} Q ${(prev.x + pos.x) / 2} ${(prev.y + pos.y) / 2} ${pos.x} ${pos.y - 40}`}
                stroke={GARDEN.pathDot}
                strokeWidth="5"
                strokeDasharray="8 8"
                strokeLinecap="round"
              />
            );
          })}
          {positions.length > 0 && (
            <Path
              d={`M ${positions[positions.length - 1].x} ${positions[positions.length - 1].y + 40} Q ${SCREEN_WIDTH / 2} ${(positions[positions.length - 1].y + treasureY) / 2} ${SCREEN_WIDTH / 2} ${treasureY - 40}`}
              stroke={GARDEN.pathDot}
              strokeWidth="5"
              strokeDasharray="8 8"
              strokeLinecap="round"
            />
          )}
        </Svg>

        {/* STATIONS */}
        {stations.map((station, idx) => {
          const pos = positions[idx];
          const activity = activities.find((a) => a.id === station.activityId);
          const theme = STATION_THEMES[idx % STATION_THEMES.length];

          return (
            <View
              key={station.activityId}
              style={[
                styles.stationWrap,
                { left: pos.x - 50, top: pos.y - 50 },
              ]}
            >
              <Animated.View
                style={
                  station.status === "active"
                    ? { transform: [{ scale: activeStationPulse }] }
                    : {}
                }
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => handleStationPress(station, idx)}
                  disabled={station.status === "locked"}
                >
                  <StationIcon
                    theme={theme}
                    status={station.status}
                    size={100}
                  />
                </TouchableOpacity>
              </Animated.View>

              {station.status === "completed" && (
                <View style={styles.starsRow}>
                  <StarIcon filled={station.stars >= 1} size={18} />
                  <StarIcon filled={station.stars >= 2} size={18} />
                  <StarIcon filled={station.stars >= 3} size={18} />
                </View>
              )}

              {activity && (
                <View
                  style={[
                    styles.stationLabel,
                    station.status === "locked" && { opacity: 0.5 },
                  ]}
                >
                  <Text style={styles.stationLabelText} numberOfLines={1}>
                    {activity.title}
                  </Text>
                </View>
              )}

              {lastCompletedIdx === idx && (
                <Animated.View
                  style={[
                    styles.noumiOnStation,
                    { transform: [{ scale: noumiPulse }] },
                  ]}
                >
                  <NoumiOnPath size={70} />
                </Animated.View>
              )}

              {idx === 0 && lastCompletedIdx < 0 && (
                <Animated.View
                  style={[
                    styles.noumiOnStation,
                    { transform: [{ scale: noumiPulse }] },
                  ]}
                >
                  <NoumiOnPath size={70} />
                </Animated.View>
              )}
            </View>
          );
        })}

        {/* TREASURE AT TOP */}
        <TouchableOpacity
          style={[
            styles.treasureWrap,
            { left: SCREEN_WIDTH / 2 - 60, top: treasureY - 60 },
          ]}
          onPress={() => {
            if (allDone) {
              router.push({
                pathname: "/child/TreasureSplash",
                params: { childId },
              });
            }
          }}
          disabled={!allDone}
          activeOpacity={0.85}
        >
          <TreasureChest size={120} unlocked={allDone} />
          {allDone && (
            <Text style={styles.treasureText}>اضغطي للاحتفال!</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL */}
      <Modal
        transparent
        visible={!!selectedStation}
        animationType="fade"
        onRequestClose={() => setSelectedStation(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {selectedStation?.activity && (
              <>
                <View style={styles.modalIconWrap}>
                  <StationIcon
                    theme={
                      STATION_THEMES[
                        (selectedStation.index || 0) % STATION_THEMES.length
                      ]
                    }
                    status={selectedStation.status}
                    size={100}
                  />
                </View>

                <Text style={styles.modalTitle}>
                  {selectedStation.activity.title}
                </Text>

                {(() => {
                  const cat =
                    CATEGORY_INFO[selectedStation.activity.categoryId];
                  if (!cat) return null;
                  return (
                    <View
                      style={[
                        styles.modalCatChip,
                        { backgroundColor: cat.lightColor },
                      ]}
                    >
                      <Text style={[styles.modalCatText, { color: cat.color }]}>
                        {cat.name}
                      </Text>
                    </View>
                  );
                })()}

                {selectedStation.status === "completed" && (
                  <View style={styles.completedInfo}>
                    <Text style={styles.completedTitle}>أكملتها!</Text>
                    <View style={styles.starsRowBig}>
                      <StarIcon filled={selectedStation.stars >= 1} size={28} />
                      <StarIcon filled={selectedStation.stars >= 2} size={28} />
                      <StarIcon filled={selectedStation.stars >= 3} size={28} />
                    </View>
                    {selectedStation.attempts > 1 && (
                      <Text style={styles.attemptsText}>
                        لعبتيها {selectedStation.attempts} مرات
                      </Text>
                    )}
                  </View>
                )}

                <TouchableOpacity
                  style={styles.modalPlayBtn}
                  activeOpacity={0.85}
                  onPress={handleStartActivity}
                >
                  <Text style={styles.modalPlayText}>
                    {selectedStation.status === "completed"
                      ? "العبيها مرة ثانية!"
                      : "ابدئي!"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setSelectedStation(null)}
                >
                  <Text style={styles.modalCloseText}>إغلاق</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GARDEN.gardenMain },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: GARDEN.gardenMain,
  },

  // SKY LAYER (top 18%)
  skyLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "18%",
    backgroundColor: GARDEN.skyTop,
    zIndex: 0,
  },
  sun: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 25,
    right: 20,
  },
  skyCloud1: {
    position: "absolute",
    top: Platform.OS === "ios" ? 70 : 50,
    left: 20,
  },
  skyCloud2: {
    position: "absolute",
    top: Platform.OS === "ios" ? 100 : 80,
    left: SCREEN_WIDTH * 0.4,
  },
  skyCloud3: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    right: SCREEN_WIDTH * 0.35,
  },

  // GARDEN BACKGROUND
  gardenBackground: {
    position: "absolute",
    top: "18%",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: GARDEN.gardenMain,
    zIndex: 0,
  },

  // HEADER (transparent on top)
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 55 : 30,
    paddingBottom: 14,
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerProgress: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.95)",
    fontWeight: "700",
    marginTop: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // PATH CONTAINER
  pathContainer: {
    position: "relative",
    paddingTop: 40,
    paddingBottom: 100,
  },

  // BACKGROUND DECORATIONS
  bgTreeLeft: {
    position: "absolute",
    left: -10,
    zIndex: 1,
    opacity: 0.85,
  },
  bgTreeRight: {
    position: "absolute",
    right: -10,
    zIndex: 1,
    opacity: 0.85,
  },
  bushLeft: {
    position: "absolute",
    left: 5,
    zIndex: 2,
  },
  bushRight: {
    position: "absolute",
    right: 5,
    zIndex: 2,
  },
  tallFlowerLeft: {
    position: "absolute",
    left: 80,
    zIndex: 3,
  },
  tallFlowerRight: {
    position: "absolute",
    right: 80,
    zIndex: 3,
  },
  miniFlower: {
    position: "absolute",
    zIndex: 3,
  },
  grassTuft: {
    position: "absolute",
    zIndex: 2,
  },
  butterfly: {
    position: "absolute",
    zIndex: 4,
  },

  // STATIONS
  stationWrap: {
    position: "absolute",
    width: 100,
    height: 100,
    alignItems: "center",
    zIndex: 5,
  },
  starsRow: {
    flexDirection: "row-reverse",
    gap: 2,
    marginTop: 4,
  },
  starsRowBig: {
    flexDirection: "row-reverse",
    gap: 6,
    marginVertical: 14,
  },
  stationLabel: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 10,
    maxWidth: 130,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  stationLabelText: {
    fontSize: 11,
    fontWeight: "700",
    color: GARDEN.textDark,
    textAlign: "center",
  },
  noumiOnStation: {
    position: "absolute",
    top: -55,
    left: 15,
    zIndex: 6,
  },

  // TREASURE
  treasureWrap: {
    position: "absolute",
    alignItems: "center",
    zIndex: 5,
  },
  treasureText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "900",
    color: "#F57F17",
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 15,
  },
  modalIconWrap: { marginBottom: 16 },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: GARDEN.textDark,
    textAlign: "center",
    marginBottom: 10,
  },
  modalCatChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 18,
  },
  modalCatText: { fontSize: 12, fontWeight: "800" },
  completedInfo: { alignItems: "center", marginBottom: 12 },
  completedTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: GARDEN.stationCompleted,
  },
  attemptsText: { fontSize: 12, color: "#666", fontWeight: "600" },
  modalPlayBtn: {
    width: "100%",
    backgroundColor: GARDEN.stationActive,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#F57C00",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  modalPlayText: { fontSize: 16, fontWeight: "900", color: "#FFFFFF" },
  modalCloseBtn: { paddingVertical: 12, marginTop: 6 },
  modalCloseText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

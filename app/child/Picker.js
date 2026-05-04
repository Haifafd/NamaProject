import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";
import { getChildrenByParentEmail } from "../../Services/ChildrenService";
import { getChildPlan } from "../../Services/ActivityService";

const GARDEN = {
  skyTop: "#87CEEB",
  grass: "#66BB6A",
  flowerPink: "#EC407A",
  flowerYellow: "#FFCA28",
  flowerPurple: "#AB47BC",
  butterflyOrange: "#FF7043",
  textDark: "#2E7D32",
};

const CARD_COLORS = [
  { bg: "#FFE5EC", border: "#EC407A", icon: "#C2185B" },
  { bg: "#FFF8E1", border: "#FFCA28", icon: "#F57C00" },
  { bg: "#E8F5E9", border: "#66BB6A", icon: "#388E3C" },
  { bg: "#F3E5F5", border: "#AB47BC", icon: "#7B1FA2" },
  { bg: "#FFF3E0", border: "#FF7043", icon: "#D84315" },
  { bg: "#E1F5FE", border: "#4FC3F7", icon: "#0277BD" },
];

function MiniNoumi({ size = 70 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 70 70" fill="none">
      <Ellipse cx="26" cy="16" rx="6" ry="13" fill="#FFFFFF" />
      <Ellipse cx="26" cy="17" rx="3" ry="9" fill="#FFB6C1" opacity="0.7" />
      <Ellipse cx="44" cy="16" rx="6" ry="13" fill="#FFFFFF" />
      <Ellipse cx="44" cy="17" rx="3" ry="9" fill="#FFB6C1" opacity="0.7" />
      <Circle cx="35" cy="40" r="20" fill="#FFFFFF" />
      <Circle cx="24" cy="44" r="3.5" fill="#FFB6C1" opacity="0.7" />
      <Circle cx="46" cy="44" r="3.5" fill="#FFB6C1" opacity="0.7" />
      <Circle cx="29" cy="38" r="3" fill="#2C2C2C" />
      <Circle cx="41" cy="38" r="3" fill="#2C2C2C" />
      <Circle cx="30" cy="37" r="1.2" fill="#FFFFFF" />
      <Circle cx="42" cy="37" r="1.2" fill="#FFFFFF" />
      <Ellipse cx="35" cy="44" rx="2.2" ry="1.7" fill="#FF6B9D" />
      <Path
        d="M 35 46 Q 32 49 30 47"
        stroke="#3E2723"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M 35 46 Q 38 49 40 47"
        stroke="#3E2723"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function MiniFlower({ size = 26, color = "#EC407A" }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <Circle cx="13" cy="6" r="4" fill={color} />
      <Circle cx="6" cy="13" r="4" fill={color} />
      <Circle cx="20" cy="13" r="4" fill={color} />
      <Circle cx="13" cy="20" r="4" fill={color} />
      <Circle cx="13" cy="13" r="3" fill="#FFCA28" />
    </Svg>
  );
}

export default function ChildPicker() {
  const router = useRouter();
  const [eligibleChildren, setEligibleChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEligibleChildren();
  }, []);

  const loadEligibleChildren = async () => {
    try {
      const allChildren = await getChildrenByParentEmail();

      const withPlans = [];
      for (const child of allChildren) {
        const plan = await getChildPlan(child.id);
        if (plan && plan.activityIds && plan.activityIds.length > 0) {
          withPlans.push({ ...child, plan });
        }
      }

      if (withPlans.length === 0) {
        router.replace("/parent/homepageP");
        return;
      }

      if (withPlans.length === 1) {
        const child = withPlans[0];
        router.replace({
          pathname: "/child/Home",
          params: { childId: child.id, childName: child.name },
        });
        return;
      }

      setEligibleChildren(withPlans);
    } catch (error) {
      console.error("Error loading children:", error);
      router.replace("/parent/homepageP");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChild = (child) => {
    router.replace({
      pathname: "/child/Home",
      params: { childId: child.id, childName: child.name },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GARDEN.flowerPink} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={GARDEN.skyTop} />

      <View style={styles.sky} />

      <View style={styles.topSection}>
        <View style={styles.miniNoumiWrap}>
          <MiniNoumi size={80} />
        </View>
        <Text style={styles.title}>من سيلعب اليوم؟</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.cardsScroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsGrid}>
          {eligibleChildren.map((child, index) => {
            const colors = CARD_COLORS[index % CARD_COLORS.length];
            const initial = (child.name || "؟").charAt(0).toUpperCase();
            const activityCount = child.plan?.activityIds?.length || 0;

            return (
              <TouchableOpacity
                key={child.id}
                style={[
                  styles.childCard,
                  { backgroundColor: colors.bg, borderColor: colors.border },
                ]}
                activeOpacity={0.85}
                onPress={() => handleSelectChild(child)}
              >
                <View
                  style={[styles.avatarBig, { backgroundColor: colors.border }]}
                >
                  <Text style={styles.avatarLetter}>{initial}</Text>
                </View>

                <Text style={styles.childCardName} numberOfLines={1}>
                  {child.name || "بدون اسم"}
                </Text>

                <View
                  style={[
                    styles.activityBadge,
                    { backgroundColor: colors.icon },
                  ]}
                >
                  <Text style={styles.activityBadgeText}>
                    {activityCount} {activityCount === 1 ? "نشاط" : "أنشطة"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.grassLayer} />

      <View style={styles.flower1}>
        <MiniFlower size={28} color={GARDEN.flowerPink} />
      </View>
      <View style={styles.flower2}>
        <MiniFlower size={24} color={GARDEN.flowerYellow} />
      </View>
      <View style={styles.flower3}>
        <MiniFlower size={26} color={GARDEN.flowerPurple} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: GARDEN.skyTop },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: GARDEN.skyTop,
  },

  sky: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: GARDEN.skyTop,
  },

  topSection: {
    paddingTop: Platform.OS === "ios" ? 80 : 50,
    paddingBottom: 24,
    alignItems: "center",
  },
  miniNoumiWrap: {
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: GARDEN.textDark,
    textAlign: "center",
    textShadowColor: "rgba(255, 255, 255, 0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  cardsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 140,
    flexGrow: 1,
  },
  cardsGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 14,
    justifyContent: "center",
  },

  childCard: {
    width: "44%",
    minHeight: 180,
    borderRadius: 24,
    padding: 18,
    alignItems: "center",
    borderWidth: 3,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  avatarBig: {
    width: 70,
    height: 70,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  avatarLetter: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  childCardName: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 10,
  },
  activityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  activityBadgeText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  grassLayer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: GARDEN.grass,
  },

  flower1: {
    position: "absolute",
    bottom: 50,
    left: 40,
  },
  flower2: {
    position: "absolute",
    bottom: 60,
    left: "45%",
  },
  flower3: {
    position: "absolute",
    bottom: 45,
    right: 50,
  },
});

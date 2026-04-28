import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PRIMARY = "#79ccf8";
const PRIMARY_DARK = "#0288D1";
const CARD = "#FFFFFF";
const MUTED = "#999";

const TABS = [
  {
    name: "Chats",
    label: "المحادثات",
    icon: "chatbubble-ellipses-outline",
    iconActive: "chatbubble-ellipses",
    path: "/specialist/Chats",
  },
  {
    name: "homepageS",
    label: "الرئيسية",
    icon: "home-outline",
    iconActive: "home",
    path: "/specialist/homepageS",
  },
  {
    name: "Settings",
    label: "الإعدادات",
    icon: "settings-outline",
    iconActive: "settings",
    path: "/specialist/Settings",
  },
];

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const getCurrentTabIndex = () => {
    if (pathname?.includes("Chats")) return 0;
    if (pathname?.includes("Settings")) return 2;
    return 1;
  };

  const currentIndex = getCurrentTabIndex();
  const circlePosition = useRef(new Animated.Value(currentIndex)).current;

  useEffect(() => {
    Animated.spring(circlePosition, {
      toValue: currentIndex,
      useNativeDriver: false,
      friction: 7,
      tension: 60,
    }).start();
  }, [currentIndex]);

  const tabWidth = SCREEN_WIDTH / 3;
  const circleLeft = circlePosition.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [
      tabWidth * 0 + tabWidth / 2 - 32,
      tabWidth * 1 + tabWidth / 2 - 32,
      tabWidth * 2 + tabWidth / 2 - 32,
    ],
  });

  const handleTabPress = (tab, index) => {
    if (index === currentIndex) return;
    router.push(tab.path);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.navbar}>
        {TABS.map((tab, index) => {
          const isActive = currentIndex === index;

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.navItem}
              onPress={() => handleTabPress(tab, index)}
              activeOpacity={0.7}
              disabled={isActive}
            >
              {!isActive ? (
                <>
                  <Ionicons name={tab.icon} size={22} color={MUTED} />
                  <Text style={styles.navText}>{tab.label}</Text>
                </>
              ) : (
                // Tab النشط - فاضي عشان الدائرة المرتفعة تكون مكانه
                <View style={{ height: 38 }} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* الدائرة المرتفعة */}
      <Animated.View style={[styles.floatingCircle, { left: circleLeft }]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handleTabPress(TABS[currentIndex], currentIndex)}
          style={styles.floatingCircleInner}
        >
          <Ionicons
            name={TABS[currentIndex].iconActive}
            size={26}
            color="#fff"
          />
        </TouchableOpacity>
      </Animated.View>

      {/* النص تحت الدائرة (واحد فقط) */}
      <Animated.Text
        style={[
          styles.floatingLabel,
          {
            left: circlePosition.interpolate({
              inputRange: [0, 1, 2],
              outputRange: [tabWidth * 0, tabWidth * 1, tabWidth * 2],
            }),
            width: tabWidth,
          },
        ]}
      >
        {TABS[currentIndex].label}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navbar: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: CARD,
    paddingTop: 14,
    paddingBottom: 18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -6 },
    elevation: 15,
    alignItems: "center",
    justifyContent: "space-around",
  },
  navItem: {
    alignItems: "center",
    gap: 5,
    flex: 1,
    paddingVertical: 4,
  },
  navText: {
    fontSize: 10,
    color: MUTED,
    fontWeight: "600",
  },
  floatingCircle: {
    position: "absolute",
    bottom: 35,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "#fff",
    shadowColor: PRIMARY_DARK,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 20,
    zIndex: 10,
  },
  floatingCircleInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 32,
  },
  floatingLabel: {
    position: "absolute",
    bottom: 8,
    textAlign: "center",
    fontSize: 10,
    color: PRIMARY_DARK,
    fontWeight: "700",
    zIndex: 11,
  },
});

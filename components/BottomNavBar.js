// components/BottomNavBar.js
// 🧭 ناف بار سفلية متحركة
//
// التخطيط (RTL):
//   ⚙️ الإعدادات (يمين) | 🏠 الرئيسية (وسط) | 💬 المحادثات (يسار)
//
// المميزات:
// - الدائرة المرتفعة تتحرك بانيميشن سلس للتاب النشط
// - تعرف الصفحة الحالية تلقائياً من usePathname()
// - تتعامل مع البارنت والسبيشلست تلقائياً

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
import {
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT,
  SHADOWS,
  SPACING
} from "../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_WIDTH = SCREEN_WIDTH / 3;

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();
  const translateX = useRef(new Animated.Value(0)).current;

  // ========== تحديد المسارات حسب نوع المستخدم ==========
  const isParent = pathname.includes("/parent/");

  // 🔑 الترتيب البصري: [يمين، وسط، يسار]
  // index 0 = الإعدادات (يمين)
  // index 1 = الرئيسية (وسط)
  // index 2 = المحادثات (يسار)
  const tabs = isParent
    ? [
        {
          key: "settings",
          label: "الإعدادات",
          icon: "settings",
          iconOutline: "settings-outline",
          path: "/parent/Settings", // ← غيريه لو Settings في parent عندك مسارها مختلف
        },
        {
          key: "home",
          label: "الرئيسية",
          icon: "home",
          iconOutline: "home-outline",
          path: "/parent/homepageP",
        },
        {
          key: "chat",
          label: "المحادثات",
          icon: "chatbubble-ellipses",
          iconOutline: "chatbubble-ellipses-outline",
          path: "/parent/Chat",
        },
      ]
    : [
        {
          key: "settings",
          label: "الإعدادات",
          icon: "settings",
          iconOutline: "settings-outline",
          path: "/specialist/Settings", // ✅ المسار الصحيح
        },
        {
          key: "home",
          label: "الرئيسية",
          icon: "home",
          iconOutline: "home-outline",
          path: "/specialist/homepageS",
        },
        {
          key: "chat",
          label: "المحادثات",
          icon: "chatbubble-ellipses",
          iconOutline: "chatbubble-ellipses-outline",
          path: "/specialist/Chats",
        },
      ];

  // ========== تحديد التاب النشط ==========
  // ملاحظة: نتحقق من الـ pathname الحالي عشان نعرف التاب النشط
  const isOnSettings = pathname.includes("/Settings");
  const isOnChat = pathname.includes("/Chat") || pathname.includes("/Chats");

  let activeIndex;
  if (isOnSettings)
    activeIndex = 0; // يمين
  else if (isOnChat)
    activeIndex = 2; // يسار
  else activeIndex = 1; // وسط (الرئيسية وكل الصفحات الفرعية مثل AddChild, Dashboard)

  // ========== الأنيميشن ==========
  useEffect(() => {
    // الدائرة تبدأ من الوسط (index 1).
    // لو activeIndex = 0 (يمين) → نتحرك يمين  → translateX سالب (في layout عادي يمين = سالب)
    // لو activeIndex = 1 (وسط) → نبقى مكاننا → translateX = 0
    // لو activeIndex = 2 (يسار) → نتحرك يسار → translateX موجب
    //
    // ولكن لأن الترتيب البصري عندنا [يمين, وسط, يسار] والـ flexDirection: "row" يضع
    // index 0 على اليسار في حالة LTR، لازم نعكس الإشارة:
    const offsetFromCenter = activeIndex - 1; // -1, 0, +1

    // النتيجة: الدائرة تتبع التاب اللي عليه بالضبط
    const translation = offsetFromCenter * TAB_WIDTH;

    Animated.spring(translateX, {
      toValue: translation,
      useNativeDriver: true,
      friction: 8,
      tension: 50,
    }).start();
  }, [activeIndex]);

  const handlePress = (tab) => {
    router.push(tab.path);
  };

  return (
    <View style={styles.container}>
      {/* ============ الدائرة المتحركة ============ */}
      <Animated.View
        style={[styles.activeCircle, { transform: [{ translateX }] }]}
        pointerEvents="none"
      >
        <Ionicons
          name={tabs[activeIndex].icon}
          size={28}
          color={COLORS.WHITE}
        />
      </Animated.View>

      {/* ============ شريط التابات ============ */}
      <View style={styles.tabsRow}>
        {tabs.map((tab, idx) => {
          const isActive = idx === activeIndex;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => handlePress(tab)}
              activeOpacity={0.7}
            >
              {isActive ? (
                <View style={styles.iconPlaceholder} />
              ) : (
                <Ionicons
                  name={tab.iconOutline}
                  size={22}
                  color={COLORS.MUTED}
                />
              )}

              <Text style={[styles.label, isActive && styles.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const NAVBAR_HEIGHT = 70;
const CIRCLE_SIZE = 64;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: NAVBAR_HEIGHT,
  },

  tabsRow: {
    flexDirection: "row",
    width: "100%",
    height: NAVBAR_HEIGHT,
    backgroundColor: COLORS.WHITE,
    borderTopWidth: 1,
    borderColor: COLORS.BORDER_GRAY,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 12,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
  },

  iconPlaceholder: {
    height: 22,
  },

  // الدائرة السماوية المرتفعة
  activeCircle: {
    position: "absolute",
    alignSelf: "center",
    top: -CIRCLE_SIZE / 2 + 4,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: COLORS.WHITE,
    zIndex: 10,
    ...SHADOWS.bubble,
  },

  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.MUTED,
    marginTop: 4,
    fontWeight: FONT_WEIGHT.medium,
  },

  labelActive: {
    color: COLORS.PRIMARY_DARK,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 22,
  },
});

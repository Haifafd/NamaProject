// components/ui/ScreenHeader.js
// ⭐ هيدر سماوي موحّد مع دوائر زخرفية - بنفس ستايل homepageS الجديدة
//
// طريقة الاستخدام:
// <ScreenHeader title="مرحباً بعودتك" subtitle="أخصائي" />
// <ScreenHeader title="إضافة طفل" showBack onBackPress={() => router.back()} />
// <ScreenHeader title="..." showBell onBellPress={...} hasBadge showAvatar />

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    COLORS,
    FONT_SIZE,
    FONT_WEIGHT,
    RADIUS,
    SHADOWS,
    SPACING,
} from "../../constants/theme";

export default function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  onBackPress,
  showBell = false,
  onBellPress,
  hasBadge = false,
  showAvatar = false,
  onAvatarPress,
  height = "default", // "default" | "tall"
}) {
  const isTall = height === "tall";

  return (
    <View style={[styles.header, isTall && styles.headerTall]}>
      {/* الدوائر الزخرفية */}
      <View style={[styles.deco, styles.deco1]} />
      <View style={[styles.deco, styles.deco2]} />
      <View style={[styles.deco, styles.deco3]} />

      {/* صف الأيقونات (يمين ويسار) */}
      <View style={styles.iconsRow}>
        {/* اليسار: الجرس أو الرجوع */}
        {showBack ? (
          <TouchableOpacity style={styles.iconBubble} onPress={onBackPress}>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={COLORS.PRIMARY_DARK}
            />
          </TouchableOpacity>
        ) : showBell ? (
          <TouchableOpacity style={styles.iconBubble} onPress={onBellPress}>
            <Ionicons name="notifications" size={20} color={COLORS.YELLOW} />
            {hasBadge && <View style={styles.dot} />}
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}

        {/* اليمين: الأفاتار */}
        {showAvatar ? (
          <TouchableOpacity style={styles.avatarBubble} onPress={onAvatarPress}>
            <Ionicons name="person" size={22} color={COLORS.PRIMARY_DARK} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* العنوان والعنوان الفرعي في المنتصف */}
      <View style={styles.center}>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 50,
    paddingBottom: 50,
    paddingHorizontal: SPACING.xl,
    borderBottomLeftRadius: RADIUS.xxxl,
    borderBottomRightRadius: RADIUS.xxxl,
    overflow: "hidden",
    position: "relative",
  },

  headerTall: {
    paddingTop: 60,
    paddingBottom: 70,
  },

  // ========== الدوائر الزخرفية ==========
  deco: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: RADIUS.full,
  },
  deco1: {
    width: 140,
    height: 140,
    top: -40,
    right: -40,
  },
  deco2: {
    width: 100,
    height: 100,
    bottom: -30,
    left: 30,
  },
  deco3: {
    width: 60,
    height: 60,
    top: 80,
    left: -20,
    backgroundColor: "rgba(255,255,255,0.12)",
  },

  // ========== صف الأيقونات ==========
  iconsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 2,
  },

  // الأيقونة اليسار (جرس/رجوع)
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.light,
  },

  // الأفاتار يمين
  avatarBubble: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.WHITE,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.light,
  },

  placeholder: {
    width: 44,
    height: 44,
  },

  // النقطة الحمراء على الجرس
  dot: {
    position: "absolute",
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.DANGER,
  },

  // ========== العنوان والوصف ==========
  center: {
    alignItems: "center",
    marginTop: SPACING.md,
    zIndex: 2,
  },

  subtitle: {
    fontSize: FONT_SIZE.md,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 4,
    fontWeight: FONT_WEIGHT.medium,
  },

  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.WHITE,
    textAlign: "center",
  },
});

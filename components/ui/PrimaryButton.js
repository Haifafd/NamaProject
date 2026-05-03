// components/ui/PrimaryButton.js
// ⭐ زر موحّد - بدل تكرار ستايل الأزرار في كل صفحة
//
// طريقة الاستخدام:
// <PrimaryButton title="إضافة طفل" icon="add" onPress={...} />
// <PrimaryButton title="حفظ" onPress={...} fullWidth />
// <PrimaryButton title="إلغاء" variant="outline" onPress={...} />

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import {
    COLORS,
    FONT_SIZE,
    FONT_WEIGHT,
    RADIUS,
    SPACING,
} from "../../constants/theme";

export default function PrimaryButton({
  title,
  onPress,
  icon,
  variant = "filled", // filled | outline | ghost
  size = "md", // sm | md | lg
  fullWidth = false,
  disabled = false,
  style,
}) {
  const sizeStyle = getSizeStyle(size);
  const variantStyle = getVariantStyle(variant);
  const textColor = getTextColor(variant);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        sizeStyle.button,
        variantStyle,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={sizeStyle.icon}
          color={textColor}
          style={{ marginLeft: SPACING.xs }}
        />
      )}
      <Text style={[styles.text, sizeStyle.text, { color: textColor }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function getSizeStyle(size) {
  switch (size) {
    case "sm":
      return {
        button: {
          paddingHorizontal: SPACING.md,
          paddingVertical: SPACING.sm / 2 + 2,
        },
        text: { fontSize: FONT_SIZE.sm },
        icon: 14,
      };
    case "lg":
      return {
        button: { paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md },
        text: { fontSize: FONT_SIZE.lg },
        icon: 20,
      };
    case "md":
    default:
      return {
        button: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm },
        text: { fontSize: FONT_SIZE.md },
        icon: 16,
      };
  }
}

function getVariantStyle(variant) {
  switch (variant) {
    case "outline":
      return {
        backgroundColor: "transparent",
        borderWidth: 1.5,
        borderColor: COLORS.PRIMARY,
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
      };
    case "filled":
    default:
      return {
        backgroundColor: COLORS.PRIMARY,
      };
  }
}

function getTextColor(variant) {
  if (variant === "filled") return COLORS.WHITE;
  return COLORS.PRIMARY;
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: RADIUS.sm,
  },
  text: {
    fontWeight: FONT_WEIGHT.semibold,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
});

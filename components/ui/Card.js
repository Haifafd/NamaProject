// components/ui/Card.js
// ⭐ بطاقة موحّدة - بنفس ستايل بطاقات homepageS
//
// طريقة الاستخدام:
// <Card>
//   <Text>محتوى البطاقة</Text>
// </Card>
//
// أنواع:
// <Card variant="default">  → الافتراضية (#F8FAFF)
// <Card variant="alt">      → بديلة (#F9FBFF)
// <Card variant="warning">  → تحذير (#FFF6E8)
// <Card variant="white">    → بيضاء عادية

import { StyleSheet, View } from "react-native";
import { COLORS, RADIUS, SPACING } from "../../constants/theme";

export default function Card({
  children,
  variant = "default",
  style,
  noBorder = false,
  padding = "lg",
}) {
  const variantStyle = getVariantStyle(variant);
  const paddingValue = SPACING[padding] || SPACING.lg;

  return (
    <View
      style={[
        styles.base,
        variantStyle,
        { padding: paddingValue },
        noBorder && { borderWidth: 0 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

function getVariantStyle(variant) {
  switch (variant) {
    case "alt":
      return {
        backgroundColor: COLORS.CARD_BG_ALT,
        borderColor: COLORS.BORDER_LIGHT,
      };
    case "warning":
      return {
        backgroundColor: COLORS.WARNING_BG,
        borderColor: COLORS.WARNING_BORDER,
      };
    case "white":
      return {
        backgroundColor: COLORS.WHITE,
        borderColor: COLORS.BORDER_LIGHT,
      };
    case "default":
    default:
      return {
        backgroundColor: COLORS.CARD_BG,
        borderColor: COLORS.BORDER_LIGHT,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
  },
});

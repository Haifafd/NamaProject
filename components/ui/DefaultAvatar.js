// components/ui/DefaultAvatar.js
// ⭐ أفاتار موحّد - يستخدم في الهيدر وبطاقات الأطفال
//
// طريقة الاستخدام:
// <DefaultAvatar />              → افتراضي
// <DefaultAvatar size={50} />    → حجم مخصص
// <DefaultAvatar gender="male" />   → ولد (لاحقاً)

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { COLORS } from "../../constants/theme";

export default function DefaultAvatar({
  size = 34,
  iconSize,
  iconColor = COLORS.ICON_BLUE,
  bgColor = COLORS.PRIMARY_LIGHT,
}) {
  const finalIconSize = iconSize || Math.round(size * 0.65);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
      ]}
    >
      <Ionicons name="person" size={finalIconSize} color={iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
});

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS } from "../../constants/theme";
import { AuthBackground, NamaaBrand } from "../../components/AuthBackground";

export default function ChooseRole() {
  const router = useRouter();
  const [role, setRole] = useState(null);

  return (
    <AuthBackground>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/auth/Login")}
      >
        <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.container}>
        <NamaaBrand size="md" />

        <View style={styles.heroBlock}>
          <Text style={styles.title}>من أنت؟</Text>
          <Text style={styles.subtitle}>اختر دورك لنبدأ في رحلة نماء</Text>
        </View>

        {/* بطاقة الوالد */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            role === "parent" && styles.roleCardActive,
          ]}
          onPress={() => setRole("parent")}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.roleIconBox,
              role === "parent" && styles.roleIconBoxActive,
            ]}
          >
            <MaterialCommunityIcons
              name="account-heart"
              size={32}
              color={role === "parent" ? "#FFFFFF" : COLORS.PRIMARY_DARK}
            />
          </View>
          <View style={styles.roleTextBlock}>
            <Text
              style={[
                styles.roleTitle,
                role === "parent" && styles.roleTitleActive,
              ]}
            >
              ولي أمر
            </Text>
            <Text style={styles.roleDesc}>
              لمتابعة رحلة طفلي مع الأخصائي
            </Text>
          </View>
          <View
            style={[
              styles.checkBox,
              role === "parent" && styles.checkBoxActive,
            ]}
          >
            {role === "parent" && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            )}
          </View>
        </TouchableOpacity>

        {/* بطاقة الأخصائي */}
        <TouchableOpacity
          style={[
            styles.roleCard,
            role === "specialist" && styles.roleCardActive,
          ]}
          onPress={() => setRole("specialist")}
          activeOpacity={0.85}
        >
          <View
            style={[
              styles.roleIconBox,
              role === "specialist" && styles.roleIconBoxActive,
            ]}
          >
            <MaterialCommunityIcons
              name="stethoscope"
              size={32}
              color={role === "specialist" ? "#FFFFFF" : COLORS.PRIMARY_DARK}
            />
          </View>
          <View style={styles.roleTextBlock}>
            <Text
              style={[
                styles.roleTitle,
                role === "specialist" && styles.roleTitleActive,
              ]}
            >
              أخصائي
            </Text>
            <Text style={styles.roleDesc}>
              لتقديم الجلسات والمتابعة للأطفال
            </Text>
          </View>
          <View
            style={[
              styles.checkBox,
              role === "specialist" && styles.checkBoxActive,
            ]}
          >
            {role === "specialist" && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            )}
          </View>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />

        <TouchableOpacity
          style={[styles.continueBtn, !role && styles.continueBtnDisabled]}
          onPress={() => {
            if (!role) return;
            router.push({ pathname: "/auth/register", params: { role } });
          }}
          activeOpacity={0.9}
          disabled={!role}
        >
          <Text style={styles.continueBtnText}>متابعة</Text>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 100,
    paddingBottom: 40,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
  },
  heroBlock: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
    marginTop: 6,
  },

  roleCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.96)",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },
  roleCardActive: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: "#FFFFFF",
    shadowOpacity: 0.22,
    shadowRadius: 20,
  },
  roleIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  roleIconBoxActive: {
    backgroundColor: COLORS.PRIMARY,
  },
  roleTextBlock: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.TEXT,
    textAlign: "right",
  },
  roleTitleActive: {
    color: COLORS.PRIMARY_DARK,
  },
  roleDesc: {
    fontSize: 12,
    color: COLORS.MUTED,
    marginTop: 4,
    textAlign: "right",
    lineHeight: 18,
  },
  checkBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#CFD8DC",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkBoxActive: {
    backgroundColor: COLORS.PRIMARY,
    borderColor: COLORS.PRIMARY,
  },

  continueBtn: {
    backgroundColor: COLORS.PRIMARY,
    height: 56,
    borderRadius: 18,
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 8,
  },
  continueBtnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0.1,
  },
  continueBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
});

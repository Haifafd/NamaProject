import {
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/theme";

export default function Contact() {
  const router = useRouter();

  const handleEmailPress = () => {
    Linking.openURL("mailto:support@namaa.app");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />

      <View style={styles.headerGradient}>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-forward" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>تواصل معنا</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingCard}>
          <View style={styles.greetingIconBox}>
            <Ionicons
              name="chatbubble-ellipses"
              size={32}
              color={COLORS.PRIMARY}
            />
          </View>
          <Text style={styles.greetingTitle}>يسعدنا تواصلك معنا!</Text>
          <Text style={styles.greetingText}>
            نحن هنا لمساعدتك في أي وقت
          </Text>
        </View>

        {/* Email card (only contact method) */}
        <Text style={styles.sectionLabel}>طرق التواصل</Text>
        <TouchableOpacity
          style={styles.contactCard}
          onPress={handleEmailPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.MUTED} />
          <View style={styles.contactInfo}>
            <Text style={styles.contactValue}>support@namaa.app</Text>
            <Text style={styles.contactLabel}>البريد الإلكتروني</Text>
          </View>
          <View style={[styles.contactIconBox, { backgroundColor: "#E3F2FD" }]}>
            <Ionicons name="mail" size={22} color="#2196F3" />
          </View>
        </TouchableOpacity>

        {/* Working Hours */}
        <Text style={styles.sectionLabel}>ساعات العمل</Text>
        <View style={styles.hoursCard}>
          <View style={styles.hoursHeader}>
            <Ionicons name="time-outline" size={20} color={COLORS.PRIMARY_DARK} />
            <Text style={styles.hoursTitle}>متاحون للرد عليك</Text>
          </View>
          <View style={styles.hoursDivider} />
          <View style={styles.hoursRow}>
            <Text style={styles.hoursValue}>9:00 ص - 5:00 م</Text>
            <Text style={styles.hoursDay}>السبت - الخميس</Text>
          </View>
          <View style={styles.hoursRow}>
            <Text style={[styles.hoursValue, { color: COLORS.DANGER }]}>
              مغلق
            </Text>
            <Text style={styles.hoursDay}>الجمعة</Text>
          </View>
        </View>

        {/* Social */}
        <Text style={styles.sectionLabel}>تابعنا على</Text>
        <View style={styles.socialRow}>
          <View style={styles.socialIcon}>
            <Ionicons
              name="logo-twitter"
              size={22}
              color={COLORS.PRIMARY_DARK}
            />
          </View>
          <View style={styles.socialIcon}>
            <Ionicons
              name="logo-instagram"
              size={22}
              color={COLORS.PRIMARY_DARK}
            />
          </View>
          <View style={styles.socialIcon}>
            <Ionicons
              name="globe-outline"
              size={22}
              color={COLORS.PRIMARY_DARK}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },

  headerGradient: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  decorCircle1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: -40,
    left: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  greetingCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 18,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  greetingIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  greetingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 12,
    color: COLORS.MUTED,
    textAlign: "center",
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.PRIMARY_DARK,
    textAlign: "right",
    marginBottom: 8,
    marginTop: 8,
  },

  contactCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  contactIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: {
    flex: 1,
    alignItems: "flex-end",
  },
  contactLabel: {
    fontSize: 11,
    color: COLORS.MUTED,
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT,
  },

  hoursCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  hoursHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  hoursTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT,
  },
  hoursDivider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 12,
  },
  hoursRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  hoursDay: {
    fontSize: 13,
    color: COLORS.MUTED,
  },
  hoursValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.TEXT,
  },

  socialRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 14,
    marginVertical: 16,
  },
  socialIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
});

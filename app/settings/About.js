import {
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

const FEATURES = [
  {
    icon: "extension-puzzle",
    color: "#9C27B0",
    bg: "#F3E5F5",
    title: "أنشطة تنموية",
    text: "ألعاب ذكية لتنمية مهارات الطفل",
  },
  {
    icon: "stats-chart",
    color: "#2196F3",
    bg: "#E3F2FD",
    title: "تقارير دقيقة",
    text: "متابعة تطور الطفل بمؤشرات واضحة",
  },
  {
    icon: "chatbubbles",
    color: "#4CAF50",
    bg: "#E8F5E9",
    title: "تواصل فعّال",
    text: "محادثات مباشرة مع الأخصائي",
  },
  {
    icon: "shield-checkmark",
    color: "#FF9800",
    bg: "#FFF3E0",
    title: "خصوصية وأمان",
    text: "حماية كاملة لبيانات طفلك",
  },
];

const MISSION =
  "نسعى في تطبيق نماء لتقديم منصة احترافية تربط بين أولياء الأمور والأخصائيين، لمتابعة وتطوير مهارات الأطفال من خلال أنشطة تنموية مخصصة وتقارير دقيقة.";

const TEAM_TEXT =
  "تم تطوير تطبيق نماء بشغف وحب من فريق متخصص مؤمن بأهمية دعم نمو الأطفال من خلال التكنولوجيا.";

export default function About() {
  const router = useRouter();

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
            <Text style={styles.headerTitle}>عن تطبيق نماء</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={styles.appIconBig}>
            <Text style={styles.appIconEmoji}>🌸</Text>
          </View>
          <Text style={styles.appName}>نماء</Text>
          <Text style={styles.appTagline}>رحلة نمو طفلك تبدأ هنا</Text>
          <View style={styles.versionChip}>
            <Text style={styles.versionText}>الإصدار 1.0.0</Text>
          </View>
        </View>

        {/* Mission */}
        <View style={styles.missionCard}>
          <View style={styles.missionHeader}>
            <View style={styles.missionIconBox}>
              <Ionicons name="bulb" size={20} color={COLORS.PRIMARY_DARK} />
            </View>
            <Text style={styles.missionTitle}>رؤيتنا</Text>
          </View>
          <Text style={styles.missionText}>{MISSION}</Text>
        </View>

        {/* Features Grid */}
        <Text style={styles.sectionLabel}>ماذا نقدم</Text>
        <View style={styles.featuresGrid}>
          {FEATURES.map((feat, index) => (
            <View key={index} style={styles.featureCard}>
              <View
                style={[styles.featureIconBox, { backgroundColor: feat.bg }]}
              >
                <Ionicons name={feat.icon} size={22} color={feat.color} />
              </View>
              <Text style={styles.featureTitle}>{feat.title}</Text>
              <Text style={styles.featureText}>{feat.text}</Text>
            </View>
          ))}
        </View>

        {/* Team Card */}
        <View style={styles.teamCard}>
          <View style={styles.teamIconBox}>
            <Ionicons name="people" size={28} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.teamTitle}>فريق التطوير</Text>
          <Text style={styles.teamText}>{TEAM_TEXT}</Text>
        </View>

        {/* Social Row */}
        <View style={styles.socialRow}>
          <View style={styles.socialIcon}>
            <Ionicons
              name="logo-twitter"
              size={20}
              color={COLORS.PRIMARY_DARK}
            />
          </View>
          <View style={styles.socialIcon}>
            <Ionicons
              name="logo-instagram"
              size={20}
              color={COLORS.PRIMARY_DARK}
            />
          </View>
          <View style={styles.socialIcon}>
            <Ionicons
              name="globe-outline"
              size={20}
              color={COLORS.PRIMARY_DARK}
            />
          </View>
        </View>

        <Text style={styles.footerCopyright}>
          © 2026 نماء - جميع الحقوق محفوظة
        </Text>
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

  heroSection: {
    alignItems: "center",
    paddingVertical: 24,
  },
  appIconBig: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  appIconEmoji: { fontSize: 44 },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.TEXT,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 13,
    color: COLORS.MUTED,
    marginBottom: 12,
  },
  versionChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    borderRadius: 12,
  },
  versionText: {
    fontSize: 11,
    color: COLORS.PRIMARY_DARK,
    fontWeight: "600",
  },

  missionCard: {
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
  missionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  missionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT,
  },
  missionText: {
    fontSize: 13,
    color: COLORS.MUTED,
    lineHeight: 22,
    textAlign: "right",
  },

  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.PRIMARY_DARK,
    textAlign: "right",
    marginBottom: 10,
    marginTop: 4,
  },
  featuresGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16,
  },
  featureCard: {
    width: "48%",
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 14,
    padding: 14,
    alignItems: "flex-end",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.TEXT,
    marginBottom: 4,
    textAlign: "right",
    width: "100%",
  },
  featureText: {
    fontSize: 11,
    color: COLORS.MUTED,
    textAlign: "right",
    lineHeight: 18,
    width: "100%",
  },

  teamCard: {
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  teamIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  teamTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT,
    marginBottom: 6,
  },
  teamText: {
    fontSize: 12,
    color: COLORS.MUTED,
    textAlign: "center",
    lineHeight: 20,
  },

  socialRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 14,
    marginVertical: 16,
  },
  socialIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },

  footerCopyright: {
    textAlign: "center",
    fontSize: 11,
    color: COLORS.MUTED,
    marginTop: 8,
  },
});

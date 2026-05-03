import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// الثوابت الموحدة (تم دمجها كما طلبت سابقاً)
const PRIMARY = "#4CAF50";
const CARD = "#ffffff";
const MUTED = "#737373";
const BORDER = "#C8E6C9";

const { width } = Dimensions.get("window");

const TABS = [
  { key: "profile", label: "حسابي", icon: require("../../assets/images/icons/profile.png"), screen: "Profile" },
  { key: "activities", label: "نشاط", icon: require("../../assets/images/icons/game.png"), screen: "Activities" },
  { key: "home", label: "الرئيسية", icon: require("../../assets/images/icons/home.png"), screen: "Home" },
];

const SKILLS = [
  { id: "attention", name: "مهارات الانتباه", icon: "chatbubble-ellipses", iconColor: "#2196F3" },
  { id: "focus", name: "مهارات التركيز", icon: "bulb", iconColor: "#FBC02D" },
  { id: "memory", name: "مهارات الذاكرة", icon: "extension-puzzle", iconColor: "#9C27B0" },
  { id: "perception", name: "مهارات الادراك", icon: "hand-right", iconColor: "#FF9800" },
];

// مكون النافجيشن السفلي
const BottomTabBar = ({ active, router }) => (
  <View style={tabStyles.wrapper}>
    <View style={tabStyles.container}>
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <TouchableOpacity
            key={tab.key}
            style={tabStyles.tab}
            onPress={() => router.push(tab.screen)}
            activeOpacity={0.7}
          >
            <View style={[tabStyles.pill, isActive && tabStyles.pillActive]}>
              <Image
                source={tab.icon}
                style={[tabStyles.icon, { tintColor: isActive ? PRIMARY : MUTED }]}
                resizeMode="contain"
              />
            </View>
            <Text style={[tabStyles.label, isActive && tabStyles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

export default function Activities() {
  const router = useRouter();

  return (
    <ImageBackground
      source={require("../../assets/images/wallper.png")}
      style={sharedStyles.bg}
      resizeMode="cover"
    >
      <View style={sharedStyles.overlay} />
      <SafeAreaView style={sharedStyles.safe}>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        
        <ScrollView 
          style={styles.mainContainer} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* قسم الترحيب مع ضبط الإنجاز إلى 0 */}
          <View style={[styles.headerSection, { borderBottomColor: BORDER }]}>
             <View style={styles.userInfo}>
               <Text style={styles.welcomeText}>مرحباً فاطمة 👋</Text>
               <Text style={[styles.subWelcome, { color: MUTED }]}>ابدئي نشاط الذاكرة اليوم!</Text>
             </View>
             
             <View style={styles.progressBox}>
                <View style={styles.progressHeader}>
                  {/* تم تعديل النص إلى 0% */}
                  <Text style={[styles.progressPercent, { color: PRIMARY }]}>0%</Text>
                  <Text style={[styles.progressLabel, { color: MUTED }]}>مستوى الإنجاز</Text>
                </View>
                <View style={[styles.progressBarBg, { backgroundColor: BORDER }]}>
                   {/* تم تعديل عرض شريط التقدم إلى 0% */}
                   <View style={[styles.progressBarFill, { width: '0%', backgroundColor: PRIMARY }]} />
                </View>
             </View>
          </View>

          <Text style={styles.sectionTitle}>أنشطة خطتك العلاجية</Text>

          <View style={styles.skillsGrid}>
            {SKILLS.map((skill) => (
              <TouchableOpacity
                key={skill.id}
                activeOpacity={0.8}
                style={[
                  styles.skillCard, 
                  { 
                    backgroundColor: CARD, 
                    borderBottomColor: BORDER, 
                    borderBottomWidth: 5 
                  }
                ]}
                onPress={() => router.push({
                  pathname: "/parent/SkillsDetails",
                  params: { skillId: skill.id, skillName: skill.name }
                })}
              >
                <View style={[styles.iconCircle, { backgroundColor: skill.iconColor }]}>
                  <Ionicons name={skill.icon} size={32} color="#FFF" />
                </View>
                <Text style={styles.skillText}>{skill.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <BottomTabBar active="activities" router={router} />
      </SafeAreaView>
    </ImageBackground>
  );
}

// التنسيقات (Styles)
const sharedStyles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255, 255, 255, 0.55)" },
  safe: { flex: 1 },
});

const tabStyles = StyleSheet.create({
  wrapper: { paddingHorizontal: 20, paddingBottom: 16, paddingTop: 8 },
  container: {
    flexDirection: "row-reverse",
    backgroundColor: CARD,
    borderRadius: 32,
    paddingVertical: 10,
    paddingHorizontal: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  tab: { flex: 1, alignItems: "center", gap: 4 },
  pill: { width: 44, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  pillActive: { backgroundColor: "#E8F5E9" },
  icon: { width: 22, height: 22 },
  label: { fontSize: 11, color: MUTED, fontWeight: "500" },
  labelActive: { color: PRIMARY, fontWeight: "700" },
});

const styles = StyleSheet.create({
  mainContainer: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingBottom: 40 },
  headerSection: {
    marginTop: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    padding: 25,
    borderRadius: 25,
    elevation: 4,
    borderBottomWidth: 4,
  },
  userInfo: { marginBottom: 15 },
  welcomeText: { fontSize: 22, textAlign: 'right', color: '#1E293B', fontWeight: 'bold' },
  subWelcome: { fontSize: 14, textAlign: 'right', marginTop: 5 },
  progressBox: { marginTop: 5 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 12 },
  progressPercent: { fontSize: 14, fontWeight: 'bold' },
  progressBarBg: { height: 10, borderRadius: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1E293B",
    marginVertical: 25,
    textAlign: "right",
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    alignSelf: 'flex-end',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 12,
  },
  skillsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  skillCard: {
    width: (width - 60) / 2,
    height: 160,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    elevation: 4,
  },
  iconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  skillText: { fontSize: 16, fontWeight: "bold", color: "#1E293B", textAlign: 'center' },
});

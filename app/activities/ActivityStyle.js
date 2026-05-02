import {
    Image,
    ImageBackground,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// الثوابت الموحدة
export const PRIMARY = "#4CAF50";
export const CARD = "#ffffff";
export const MUTED = "#737373";
export const BORDER = "#C8E6C9";

const TABS = [
  { key: "profile", label: "حسابي", icon: require("../../assets/images/icons/profile.png"), screen: "Profile" },
  { key: "activities", label: "نشاط", icon: require("../../assets/images/icons/game.png"), screen: "Activities" },
  { key: "home", label: "الرئيسية", icon: require("../../assets/images/icons/home.png"), screen: "Home" },
];

// مكون الخلفية الموحد
export const AppLayout = ({ children, navigation, activeTab = "activities" }) => (
  <ImageBackground
    source={require("../../assets/images/wallper.png")}
    style={sharedStyles.bg}
    resizeMode="cover"
  >
    <View style={sharedStyles.overlay} />
    <SafeAreaView style={sharedStyles.safe}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {children}
      <BottomTabBar active={activeTab} navigation={navigation} />
    </SafeAreaView>
  </ImageBackground>
);

// مكون النافجيشن الموحد
export function BottomTabBar({ active, navigation }) {
  return (
    <View style={tabStyles.wrapper}>
      <View style={tabStyles.container}>
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <TouchableOpacity
              key={tab.key}
              style={tabStyles.tab}
              onPress={() => navigation && navigation.navigate(tab.screen)}
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
}

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
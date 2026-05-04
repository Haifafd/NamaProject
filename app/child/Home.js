import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function ChildHome() {
  const router = useRouter();
  const { childName } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#87CEEB" />
      <Text style={styles.title}>قريباً...</Text>
      <Text style={styles.subtitle}>المسار الخاص بـ {childName || "الطفل"}</Text>
      <Text style={styles.note}>(Phase 7B - مسار المغامرة)</Text>

      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.replace("/parent/homepageP")}
      >
        <Ionicons name="home" size={20} color="#FFFFFF" />
        <Text style={styles.backText}>العودة</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#87CEEB",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    paddingTop: Platform.OS === "ios" ? 80 : 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#2E7D32",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  note: {
    fontSize: 13,
    color: "#666",
    marginBottom: 40,
    fontStyle: "italic",
  },
  backBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#66BB6A",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: "#388E3C",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  backText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});

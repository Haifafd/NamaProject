import { StyleSheet, Text, View } from "react-native";
import BottomNavBar from "../../components/BottomNavBar";

export default function Chats() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>صفحة المحادثات</Text>
      <BottomNavBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "700",
  },
});

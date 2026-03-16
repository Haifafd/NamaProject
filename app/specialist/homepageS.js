import { StyleSheet, Text, View } from "react-native";

export default function SpecialistHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>مرحبا بك 👋</Text>
      <Text style={styles.subtitle}>لوحة الطبيب / المختص</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eef2f8",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 18,
    color: "#666",
  },
});

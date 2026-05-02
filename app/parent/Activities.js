import { useRouter } from "expo-router";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";

export default function Activities() {
  const router = useRouter();

  const games = [
    { name: "فقاعات", route: "/activities/BubbleActivity" },
    { name: "الألوان", route: "/activities/ColorActivity" },
    { name: "أشكال مختلفة", route: "/activities/DifferentShapeActivity" },
    { name: "ابحث عن الكرة", route: "/activities/FindBallActivity" },
    { name: "مطابقة", route: "/activities/MatchingGame" },
    { name: "ذاكرة", route: "/activities/MemoryCard" },
    { name: "الهرم", route: "/activities/Pyramid" },
    { name: "تحدي الأشكال", route: "/activities/ShapeChallenge" },
    { name: "البحث عن الشكل", route: "/activities/ShapeFindingActivity" },
    { name: "أكمل القصة", route: "/activities/StoryCompletionActivity" },
    { name: "XO", route: "/activities/XO-Activity" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>اختر لعبتك</Text>

      {games.map((game, index) => (
        <TouchableOpacity
          key={index}
          style={styles.gameButton}
          onPress={() => router.push(game.route)}
        >
          <Text style={styles.gameText}>{game.name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 40,
    alignItems: "center",
    backgroundColor: "#FFFDE7",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#6C63FF",
    marginBottom: 30,
  },
  gameButton: {
    backgroundColor: "#BDE0FE",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 20,
    marginBottom: 15,
    width: "80%",
    alignItems: "center",
  },
  gameText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#6C63FF",
  },
});

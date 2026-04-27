import { useRouter } from "expo-router";
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function IntroScreen() {
  const router = useRouter();

  const createFloat = (distance, duration) => {
    const anim = new Animated.Value(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: -distance,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: distance,
          duration,
          useNativeDriver: true,
        }),
      ]),
    ).start();
    return anim;
  };

  const items = [
    // دوائر
    { style: styles.circleGreen, anim: createFloat(10, 1800) },
    { style: styles.circleBlue, anim: createFloat(12, 2000) },
    { style: styles.circleRed, anim: createFloat(14, 2200) },
    { style: styles.circleYellow, anim: createFloat(11, 1700) },
    { style: styles.circlePurple, anim: createFloat(13, 2100) },

    // مربعات
    { style: styles.squareGreen, anim: createFloat(10, 1600) },
    { style: styles.squareBlue, anim: createFloat(12, 1900) },
    { style: styles.squareRed, anim: createFloat(14, 2300) },

    // مستطيلات
    { style: styles.rectGreen, anim: createFloat(10, 1500) },
    { style: styles.rectBlue, anim: createFloat(12, 1800) },

    // مثلثات
    { style: styles.triangleYellow, anim: createFloat(14, 2000) },
    { style: styles.trianglePurple, anim: createFloat(12, 1700) },

    // أرقام
    { style: styles.textItem1, text: "١", anim: createFloat(10, 1600) },
    { style: styles.textItem2, text: "٢", anim: createFloat(12, 1800) },
    { style: styles.textItem3, text: "٣", anim: createFloat(14, 2000) },

    // حروف عربية
    { style: styles.textItem4, text: "أ", anim: createFloat(10, 1500) },
    { style: styles.textItem5, text: "ب", anim: createFloat(12, 1700) },
    { style: styles.textItem6, text: "ت", anim: createFloat(14, 1900) },

    // ألعاب
    { style: styles.ball, anim: createFloat(10, 2100) },
    { style: styles.pen, anim: createFloat(12, 2300) },
  ];

  return (
    <View style={styles.container}>
      {items.map((item, i) => (
        <Animated.View
          key={i}
          style={[item.style, { transform: [{ translateY: item.anim }] }]}
        >
          {item.text && <Text style={styles.text}>{item.text}</Text>}
        </Animated.View>
      ))}

      <Text style={styles.title}>جاهز للمرح؟</Text>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => router.push("/parent/Activities")}
      >
        <Text style={styles.startText}>ابدأ</Text>
      </TouchableOpacity>
    </View>
  );
}

const pastel = {
  green: "#D8F3DC",
  blue: "#BDE0FE",
  red: "#FECACA",
  yellow: "#FFF9C4",
  purple: "#EDE7F6",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFDE7",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#6C63FF",
    marginBottom: 50,
  },

  startButton: {
    backgroundColor: "#6C63FF",
    paddingVertical: 15,
    paddingHorizontal: 70,
    borderRadius: 40,
    elevation: 5,
  },

  startText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "bold",
  },

  text: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6C63FF",
  },

  // دوائر
  circleGreen: {
    width: 60,
    height: 60,
    backgroundColor: pastel.green,
    borderRadius: 30,
    position: "absolute",
    top: 80,
    left: 40,
  },
  circleBlue: {
    width: 50,
    height: 50,
    backgroundColor: pastel.blue,
    borderRadius: 25,
    position: "absolute",
    top: 150,
    right: 50,
  },
  circleRed: {
    width: 40,
    height: 40,
    backgroundColor: pastel.red,
    borderRadius: 20,
    position: "absolute",
    bottom: 200,
    left: 70,
  },
  circleYellow: {
    width: 55,
    height: 55,
    backgroundColor: pastel.yellow,
    borderRadius: 30,
    position: "absolute",
    bottom: 150,
    right: 80,
  },
  circlePurple: {
    width: 45,
    height: 45,
    backgroundColor: pastel.purple,
    borderRadius: 25,
    position: "absolute",
    top: 250,
    left: 200,
  },

  // مربعات
  squareGreen: {
    width: 50,
    height: 50,
    backgroundColor: pastel.green,
    position: "absolute",
    top: 100,
    right: 120,
  },
  squareBlue: {
    width: 40,
    height: 40,
    backgroundColor: pastel.blue,
    position: "absolute",
    bottom: 250,
    left: 40,
  },
  squareRed: {
    width: 45,
    height: 45,
    backgroundColor: pastel.red,
    position: "absolute",
    bottom: 100,
    right: 150,
  },

  // مستطيلات
  rectGreen: {
    width: 90,
    height: 35,
    backgroundColor: pastel.green,
    position: "absolute",
    top: 300,
    left: 50,
  },
  rectBlue: {
    width: 100,
    height: 40,
    backgroundColor: pastel.blue,
    position: "absolute",
    bottom: 200,
    right: 40,
  },

  // مثلثات
  triangleYellow: {
    width: 0,
    height: 0,
    borderLeftWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 45,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: pastel.yellow,
    position: "absolute",
    top: 200,
    left: 120,
  },

  trianglePurple: {
    width: 0,
    height: 0,
    borderLeftWidth: 30,
    borderRightWidth: 30,
    borderBottomWidth: 50,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: pastel.purple,
    position: "absolute",
    bottom: 180,
    right: 100,
  },

  // أرقام
  textItem1: { position: "absolute", top: 120, right: 180 },
  textItem2: { position: "absolute", top: 250, left: 60 },
  textItem3: { position: "absolute", bottom: 250, right: 200 },

  // حروف
  textItem4: { position: "absolute", top: 320, left: 150 },
  textItem5: { position: "absolute", bottom: 120, left: 100 },
  textItem6: { position: "absolute", bottom: 200, right: 60 },

  // ألعاب
  ball: {
    width: 50,
    height: 50,
    backgroundColor: pastel.blue,
    borderRadius: 25,
    position: "absolute",
    top: 350,
    left: 250,
  },
  pen: {
    width: 15,
    height: 70,
    backgroundColor: pastel.red,
    borderRadius: 5,
    position: "absolute",
    bottom: 250,
    right: 150,
  },
});

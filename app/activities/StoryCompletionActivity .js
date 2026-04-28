
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Animated,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// --- استيرادات الفايربيس ---
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../FirebaseConfig";

const correctOrder = ["seed", "plant", "flower"];

export default function PlantGame() {
  const router = useRouter();
  const [placed, setPlaced] = useState([null, null, null]);
  const [message, setMessage] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  const dropZones = useRef([]);
  const attemptsRef = useRef(0);
  const errorsRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  // --- دالة حفظ البيانات بالهيكلية الجديدة (في الخلفية) ---
  const saveToFirestore = async () => {
    try {
      const user = auth.currentUser;
      const timeTaken = (Date.now() - startTimeRef.current) / 1000;
      
       
      let scaledScore;
      if (errorsRef.current === 0) scaledScore = 1;
      else if (errorsRef.current <= 2) scaledScore = 2;
      else if (errorsRef.current <= 4) scaledScore = 3;
      else if (errorsRef.current <= 6) scaledScore = 4;
      else scaledScore = 5;

      await addDoc(collection(db, "ActivityResults"), {
        activityId: "نشاط إكمال القصة (النبات)", 
        attempts: attemptsRef.current,
        errors: errorsRef.current,
        childId: user ? user.uid : "guest_user",
        completed: true,
        createdAt: serverTimestamp(),
        duration: parseFloat(timeTaken.toFixed(1)),
        score: scaledScore,
        categoryId: "Cognitive" // تصنيف النشاط
      });
      console.log("تم حفظ نتائج النشاط بنجاح في الخلفية");
    } catch (e) {
      console.error("خطأ في حفظ بيانات النشاط: ", e);
    }
  };

  const checkDrop = (gesture, type, resetPosition) => {
    const { moveX, moveY } = gesture;
    let dropped = false;

    dropZones.current.forEach((zone, index) => {
      if (!zone) return;

      const inside =
        moveX >= zone.pageX &&
        moveX <= zone.pageX + zone.width &&
        moveY >= zone.pageY &&
        moveY <= zone.pageY + zone.height;

      if (inside) {
        dropped = true;
        attemptsRef.current += 1;

        if (correctOrder[index] === type && !placed[index]) {
          const newPlaced = [...placed];
          newPlaced[index] = type;
          setPlaced(newPlaced);

          if (newPlaced.every((item) => item !== null)) {
            setMessage("🎉 أحسنت يا بطل!");
            setIsFinished(true);
            saveToFirestore(); // الحفظ في الخلفية فوراً
          } else {
            setMessage("");
          }
        } else {
          errorsRef.current += 1;
          setMessage("❌ حاول مرة أخرى");
        }
      }
    });

    if (!dropped) {
      attemptsRef.current += 1;
      setMessage("❌ حاول مرة أخرى");
    }

    resetPosition();
  };

  const Draggable = ({ type, image }) => {
    const pan = useRef(new Animated.ValueXY()).current;

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event(
        [null, { dx: pan.x, dy: pan.y }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (e, gesture) => {
        checkDrop(gesture, type, () => {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        });
      },
    });

    return (
      <Animated.View {...panResponder.panHandlers} style={pan.getLayout()}>
        <Image source={image} style={styles.cardImage} />
      </Animated.View>
    );
  };

  const progress = (placed.filter((item, i) => item === correctOrder[i]).length / 3) * 100;

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/images/background.png")} style={styles.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2ecc71" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>نشاط إكمال القصة</Text>
          <Text style={styles.level}>مستوى 1 - مهارة المعرفة</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <Text style={styles.percent}>{Math.round(progress)}%</Text>
        <Text style={styles.progressText}>مستوى التقدم</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      {!isFinished ? (
        <>
          <View style={styles.instructions}>
            <Text style={styles.mainText}>رتب الصور حسب الترتيب الصحيح</Text>
            <Text style={styles.subText}>اسحب الصورة إلى المربع</Text>
          </View>

          <View style={styles.imagesRow}>
            {!placed.includes("flower") && <Draggable type="flower" image={require("../../assets/images/flower.png")} />}
            {!placed.includes("plant") && <Draggable type="plant" image={require("../../assets/images/plant.png")} />}
            {!placed.includes("seed") && <Draggable type="seed" image={require("../../assets/images/seed.png")} />}
          </View>

          <View style={styles.dropRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.dropBox} onLayout={(event) => {
                event.target.measure((fx, fy, width, height, px, py) => {
                  dropZones.current[i] = { width, height, pageX: px, pageY: py };
                });
              }}>
                <Text style={styles.boxNumber}>{i + 1}</Text>
                {placed[i] && (
                  <Image
                    source={
                      placed[i] === "seed" ? require("../../assets/images/seed.png") :
                      placed[i] === "plant" ? require("../../assets/images/plant.png") :
                      require("../../assets/images/flower.png")
                    }
                    style={styles.dropImage}
                  />
                )}
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.finishedContainer}>
          <Text style={{fontSize: 80}}>🏆</Text>
          <Text style={styles.finishedTitle}>بطل متميز!</Text>
          <Text style={styles.finishedSub}>لقد أتممت النشاط بنجاح 🎉</Text>
          <TouchableOpacity style={styles.mainBtn} onPress={() => router.back()}>
            <Text style={styles.btnText}>العودة للرئيسية</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.message}>{message}</Text>

      <View style={styles.footer}>
        <View style={styles.footerItem}><Ionicons name="home-outline" size={22} /><Text>الرئيسية</Text></View>
        <View style={styles.footerItemActive}><Ionicons name="game-controller" size={22} color="white" /><Text style={{ color: "white" }}>نشاط</Text></View>
        <TouchableOpacity style={styles.footerItem} onPress={() => router.push("/parent/homepageP")}>
          <Ionicons name="person-outline" size={22} /><Text>حسابي</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  background: { position: "absolute", width: "100%", height: "100%", opacity: 0.1 },
  header: { flexDirection: "row-reverse", alignItems: "center", padding: 20, paddingTop: 50 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center", marginLeft: 15 },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "right" },
  level: { fontSize: 14, color: "#666", textAlign: "right" },
  progressSection: { alignItems: "center", marginVertical: 20 },
  percent: { fontSize: 36, fontWeight: "bold", color: "#2ecc71" },
  progressText: { fontSize: 14, color: "#666", marginBottom: 10 },
  progressBar: { width: "80%", height: 10, backgroundColor: "#f0f0f0", borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#2ecc71" },
  instructions: { alignItems: "center", marginBottom: 30 },
  mainText: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  subText: { fontSize: 14, color: "#888" },
  imagesRow: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 20, marginBottom: 40 },
  cardImage: { width: 80, height: 80, borderRadius: 10 },
  dropRow: { flexDirection: "row", justifyContent: "space-around", paddingHorizontal: 20 },
  dropBox: { width: 90, height: 90, borderWidth: 2, borderColor: "#2ecc71", borderStyle: "dashed", borderRadius: 10, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fff9" },
  boxNumber: { position: "absolute", top: 5, left: 5, fontSize: 12, color: "#2ecc71", fontWeight: "bold" },
  dropImage: { width: 70, height: 70, borderRadius: 8 },
  message: { textAlign: "center", fontSize: 20, fontWeight: "bold", marginTop: 20, color: "#2ecc71" },
  finishedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 100 },
  finishedTitle: { fontSize: 32, fontWeight: 'bold', color: '#2ecc71', marginTop: 20 },
  finishedSub: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10 },
  mainBtn: { backgroundColor: '#2ecc71', paddingHorizontal: 35, paddingVertical: 15, borderRadius: 15, marginTop: 20 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { position: "absolute", bottom: 0, width: "100%", height: 70, flexDirection: "row", justifyContent: "space-around", alignItems: "center", borderTopWidth: 1, borderTopColor: "#eee", backgroundColor: "#fff" },
  footerItem: { alignItems: "center" },
  footerItemActive: { alignItems: "center", backgroundColor: "#2ecc71", padding: 10, borderRadius: 15 },
});
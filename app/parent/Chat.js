import {
    Dimensions,
    FlatList,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

const App = () => {
  // بيانات المحادثة المستوحاة من الصورة
  const chatMessages = [
    {
      id: "1",
      sender: "doctor",
      text: "أم محمد البطل 🌹\nأحب أطمئنك إن محمد يحقق تقدم جميل في الجلسات الأخيرة، خاصة في جانب الاستجابة للتعليمات والتفاعل أثناء الأنشطة 👏👏\nلاحظت تحسن في قدرته على إكمال المهام عند تقسيمها إلى خطوات بسيطة. وهذا يدل على تطور في مهارات التركيز لديه ✨",
      time: "9:15 م",
    },
    {
      id: "2",
      sender: "doctor",
      text: "أحب أبلغك أن محمد أظهر تقدم واضح في أداء الأنشطة 🌟\nصار ينجز المهام بسرعة أفضل ويحتاج مساعدة أقل من قبل، وهذا مؤشر ممتاز على تطوره 👐\nمستمرة معه على نفس الخطة لدعمه تقدمه أكثر بإذن الله.",
      time: "10:00 م",
    },
  ];

  const renderMessage = ({ item }) => (
    <View style={styles.messageWrapper}>
      <View style={styles.bubbleContainer}>
        <View style={styles.bubble}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        <Text style={styles.timeText}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* البار العلوي (Header) */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backArrow}>〈</Text>
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.checkIcon}>✔️</Text>
            <Text style={styles.doctorName}>دكتورة سارة</Text>
          </View>
          <Text style={styles.doctorJob}>أخصائية صعوبات تعلم</Text>
        </View>

        <View style={styles.avatarPlaceholder}>
          <Text style={{ fontSize: 30 }}>👩‍⚕️</Text>
        </View>
      </View>

      {/* قائمة الرسائل */}
      <FlatList
        data={chatMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB", // خلفية فاتحة ومريحة
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    padding: 5,
  },
  backArrow: {
    fontSize: 22,
    color: "#CCC",
  },
  headerInfo: {
    flex: 1,
    alignItems: "flex-end",
    marginRight: 15,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  checkIcon: {
    fontSize: 14,
    color: "#4A90E2",
    marginRight: 5,
  },
  doctorJob: {
    fontSize: 12,
    color: "#AAA",
    marginTop: 2,
  },
  avatarPlaceholder: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "#EEE",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  messageWrapper: {
    alignItems: "flex-end", // لمحاكاة رسائل الطبيب من اليمين
    marginBottom: 20,
  },
  bubbleContainer: {
    maxWidth: "85%",
    alignItems: "flex-end",
  },
  bubble: {
    backgroundColor: "#EBF3FF", // لون الفقاعة كما في الصورة
    padding: 15,
    borderRadius: 20,
    borderTopRightRadius: 5, // زاوية حادة من جهة المرسل
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
  },
  messageText: {
    fontSize: 15,
    color: "#444",
    lineHeight: 24,
    textAlign: "right", // اتجاه النص عربي
  },
  timeText: {
    fontSize: 11,
    color: "#BBB",
    marginTop: 5,
    marginRight: 5,
  },
});

export default App;

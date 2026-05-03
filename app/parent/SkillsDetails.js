import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// قاعدة بيانات الأنشطة
const ALL_GAMES = [
  { name: "فقاعات", route: "/activities/BubbleActivity", skillId: "focus" },
  { name: "الألوان", route: "/activities/ColorActivity", skillId: "perception" },
  { name: "أشكال مختلفة", route: "/activities/DifferentShapeActivity", skillId: "perception" },
  { name: "ابحث عن الكرة", route: "/activities/FindBallActivity", skillId: "attention" },
  { name: "مطابقة", route: "/activities/MatchingGame", skillId: "memory" },
  { name: "ذاكرة", route: "/activities/MemoryCard", skillId: "memory" },
  { name: "الهرم", route: "/activities/Pyramid", skillId: "focus" },
  { name: "تحدي الأشكال", route: "/activities/ShapeChallenge", skillId: "perception" },
  { name: "البحث عن الشكل", route: "/activities/ShapeFindingActivity", skillId: "attention" },
  { name: "أكمل القصة", route: "/activities/StoryCompletionActivity", skillId: "attention" },
  { name: "XO", route: "/activities/XO-Activity", skillId: "focus" },
];

export default function SkillDetail() {
  const router = useRouter();
  const { skillId, skillName } = useLocalSearchParams();

  // تصفية الألعاب بناءً على المهارة المختارة
  const filteredGames = ALL_GAMES.filter(game => game.skillId === skillId);

  return (
    <View style={styles.container}>
      {/* الهيدر: زر الرجوع يسار والعنوان يمين */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#6C63FF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{skillName}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        <Text style={styles.instruction}>الأنشطة المتاحة لهذه المهارة:</Text>
        
        {filteredGames.map((game, index) => (
          <TouchableOpacity
            key={index}
            style={styles.gameButton}
            onPress={() => router.push(game.route)}
          >
             <View style={styles.gameIconLabel}>
                <Ionicons name="play-circle" size={28} color="#6C63FF" />
                <Text style={styles.gameText}>{game.name}</Text>
             </View>
             <Ionicons name="chevron-back" size={20} color="#CCC" />
          </TouchableOpacity>
        ))}

        {filteredGames.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد أنشطة مضافة حالياً.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: {
    flexDirection: 'row', // تم التغيير ليكون الترتيب طبيعي (من اليسار لليمين)
    alignItems: 'center',
    justifyContent: 'space-between', // توزيع العناصر بين الطرفين
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE'
  },
  backBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#F3E5F5', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#333',
    textAlign: 'right' 
  },
  listContainer: { padding: 20 },
  instruction: { textAlign: 'right', fontSize: 16, color: '#666', marginBottom: 20 },
  gameButton: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 15,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0'
  },
  gameIconLabel: { flexDirection: 'row-reverse', alignItems: 'center' },
  gameText: { fontSize: 18, fontWeight: '600', color: '#444', marginRight: 15 },
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#999', fontSize: 16 }
});
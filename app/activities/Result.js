import { useRouter } from 'expo-router'; // استيراد الراوتر
import { Dimensions, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get("window");

// الثوابت (يفضل استيرادها من ملف الاستايل الخاص بك إذا كانت موجودة)
const PRIMARY = "#4CAF50";
const CARD = "#ffffff";
const MUTED = "#737373";

export default function ResultModal({ visible, state, onReset }) {
  const router = useRouter(); // تعريف الراوتر داخل المكون
  const isWon = state === "won";

  // دالة التعامل مع زر "النشاط التالي"
  const handleNextActivity = () => {
    if (onReset) onReset(); // أولاً: نصفر حالة اللعبة لإغلاق المودال
    router.push("/parent/Activities"); // ثانياً: ننتقل لصفحة الأنشطة
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          
          {/* الأيقونة العلوية */}
          <View style={[styles.statusCircle, { backgroundColor: isWon ? PRIMARY : "#FF8A80" }]}>
            <Text style={styles.statusIcon}>{isWon ? "✓" : "✕"}</Text>
          </View>

          <Text style={styles.modalTitle}>
            {isWon ? "عمل رائع يا بطل !!" : "حاول مرة أخرى!"}
          </Text>
          
          <Text style={styles.modalSub}>
            {isWon 
              ? "لقد أكملت النشاط بنجاح، نماء فخور بك!" 
              : "لا بأس، المحاولة هي طريق التعلم. جرب مجدداً!"}
          </Text>

          {/* الزر الأساسي */}
          <TouchableOpacity 
            style={[
              styles.actionBtn, 
              { backgroundColor: isWon ? "#CCFF00" : "#E2E8F0" }
            ]} 
            onPress={isWon ? handleNextActivity : onReset}
          >
            <Text style={styles.actionBtnText}>
              {isWon ? "النشاط التالي ←" : "إعادة المحاولة"}
            </Text>
          </TouchableOpacity>

          {/* زر خروج إضافي (اختياري) يظهر عند الخسارة للعودة للقائمة */}
          {!isWon && (
            <TouchableOpacity onPress={handleNextActivity} style={{ marginTop: 15 }}>
              <Text style={{ color: MUTED, fontWeight: "600", textDecorationLine: 'underline' }}>
                العودة لقائمة الأنشطة
              </Text>
            </TouchableOpacity>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.6)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  modalCard: { 
    width: "85%", 
    backgroundColor: CARD, 
    borderRadius: 35, 
    padding: 30, 
    alignItems: "center", 
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  statusCircle: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 20, 
    marginTop: -75, // لبروز الأيقونة فوق الكرت
    borderWidth: 5, 
    borderColor: CARD 
  },
  statusIcon: { fontSize: 45, color: "#FFF", fontWeight: "900" },
  modalTitle: { fontSize: 24, fontWeight: "bold", color: "#1E293B", marginBottom: 10, textAlign: 'center' },
  modalSub: { fontSize: 16, color: MUTED, textAlign: "center", marginBottom: 30, lineHeight: 22 },
  actionBtn: { 
    width: "100%", 
    height: 55, 
    borderRadius: 20, 
    justifyContent: "center", 
    alignItems: "center",
    elevation: 2 
  },
  actionBtnText: { fontSize: 18, fontWeight: "bold", color: "#1B5E20" },
});
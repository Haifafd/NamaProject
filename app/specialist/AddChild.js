import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { db } from "../../FirebaseConfig";

export default function AddChild({ navigation }) {
  const [childName, setChildName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [difficultyType, setDifficultyType] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);

  const [birthDate, setBirthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateText, setDateText] = useState("تاريخ الميلاد");

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthDate;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthDate(currentDate);

    let tempDate = new Date(currentDate);
    let fDate = tempDate.getDate() + '/' + (tempDate.getMonth() + 1) + '/' + tempDate.getFullYear();
    setDateText(fDate);
  };

  const handleSaveChild = async () => {
    if (!childName || !parentEmail || !gender || dateText === "تاريخ الميلاد") {
      Alert.alert("تنبيه", "يرجى تعبئة الحقول الأساسية وتحديد تاريخ الميلاد");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "Children"), {
        name: childName,
        parentEmail: parentEmail,
        difficulty: difficultyType,
        gender: gender,
        birthDate: birthDate.toISOString(),
        createdAt: new Date().toISOString(),
      });

      Alert.alert("نجاح", "تمت إضافة معلومات الطفل بنجاح");
      navigation?.navigate("TreatPlan");
    } catch (error) {
      Alert.alert("خطأ", "فشل في حفظ البيانات.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButtonCircle}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#030303" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.mainTitle}>أدخل معلومات الطفل</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.inputSection}>
          <TextInput 
            placeholder="اسم الطفل" 
            style={styles.customInput} 
            value={childName} 
            onChangeText={setChildName} 
            placeholderTextColor="#90A4AE"
          />
          <TextInput 
            placeholder="ايميل ولي الأمر" 
            style={styles.customInput} 
            value={parentEmail} 
            onChangeText={setParentEmail} 
            placeholderTextColor="#90A4AE"
          />
          <TextInput 
            placeholder="نوع الصعوبة" 
            style={styles.customInput} 
            value={difficultyType} 
            onChangeText={setDifficultyType} 
            placeholderTextColor="#90A4AE"
          />

          <TouchableOpacity 
            style={styles.customInput} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dateTextDisplay, dateText === "تاريخ الميلاد" && { color: "#90A4AE" }]}>
              {dateText}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={onDateChange}
            />
          )}
        </View>

        <View style={styles.genderRow}>
          <TouchableOpacity style={styles.radioButtonContainer} onPress={() => setGender("female")}>
            <View style={[styles.radioOuter, gender === "female" && styles.radioOuterActive]}>
              {gender === "female" && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.genderText}>أنثى</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.radioButtonContainer} onPress={() => setGender("male")}>
            <View style={[styles.radioOuter, gender === "male" && styles.radioOuterActive]}>
              {gender === "male" && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.genderText}>ذكر</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.nextButton, loading && { backgroundColor: "#A0A0A0" }]}
          onPress={handleSaveChild}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.nextButtonText}>الخطوة التالية</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FEFF" },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
  },
  headerTextContainer: { alignItems: 'flex-end' },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A2530',
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },
  subTitle: {
    fontSize: 14,
    color: '#00E676',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif',
  },
  backButtonCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8FFF5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: { paddingHorizontal: 25, paddingBottom: 30 },
  inputSection: { width: '100%', gap: 12, marginTop: 20 },
  customInput: { 
    backgroundColor: "#E7EEFF", 
    borderRadius: 25, 
    height: 55, 
    paddingHorizontal: 20, 
    justifyContent: 'center',
    textAlign: 'right',
  },
  dateTextDisplay: {
    textAlign: 'right',
    fontSize: 14,
    color: '#1A2530',
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif'
  },
  genderRow: { flexDirection: "row-reverse", justifyContent: "center", gap: 50, marginVertical: 30 },
  radioButtonContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  radioOuter: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D1E3FF', justifyContent: 'center', alignItems: 'center' },
  radioOuterActive: { borderColor: '#4E7CF3' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#4E7CF3' },
  genderText: { 
    fontSize: 16, 
    color: "#555",
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif'
  },
  nextButton: { backgroundColor: "#8EBEF5", width: '100%', height: 55, borderRadius: 25, justifyContent: "center", alignItems: "center", marginTop: 10 },
  nextButtonText: { 
    color: "#FFF", 
    fontSize: 18, 
    fontWeight: "bold",
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif'
  }
});

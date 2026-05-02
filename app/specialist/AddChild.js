import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  TextInput,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../FirebaseConfig";

// ─── نفس ثيم الهوم بيج ───
const PRIMARY = "#79ccf8";
const PRIMARY_DARK = "#0288D1";
const PRIMARY_LIGHT = "#E1F5FE";
const BG = "#F0F4F8";
const CARD = "#FFFFFF";
const BORDER = "#E0E0E0";
const TEXT = "#1A1A1A";
const MUTED = "#757575";
const PINK = "#F48FB1";
const PINK_LIGHT = "#FCE4EC";

export default function AddChild() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [gender, setGender] = useState("");
  const [date, setDate] = useState(new Date(2022, 8, 9));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  // ─────────────────────────────────────────────
  // 💾 حفظ الطفل في Firebase
  // ─────────────────────────────────────────────
  const handleSave = async () => {
    // التحقق من المدخلات
    if (!name.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال اسم الطفل");
      return;
    }
    if (!parentEmail.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال إيميل ولي الأمر");
      return;
    }
    if (!difficulty.trim()) {
      Alert.alert("تنبيه", "الرجاء إدخال نوع الصعوبة");
      return;
    }
    if (!gender) {
      Alert.alert("تنبيه", "الرجاء اختيار الجنس");
      return;
    }

    const specialistId = auth.currentUser?.uid;
    if (!specialistId) {
      Alert.alert("تنبيه", "الرجاء تسجيل الدخول أولاً");
      return;
    }

    try {
      setSaving(true);

      // حفظ الطفل في Children collection
      await addDoc(collection(db, "Children"), {
        name: name.trim(),
        parentEmail: parentEmail.trim(),
        difficulty: difficulty.trim(),
        gender: gender,
        birthDate: date.toISOString().split("T")[0], // YYYY-MM-DD
        specialistId: specialistId,
        createdAt: serverTimestamp(),
      });

      Alert.alert("تم بنجاح", "تم إضافة الطفل بنجاح", [
        {
          text: "حسناً",
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error("Error saving child:", error);
      Alert.alert("خطأ", "لم نتمكن من حفظ بيانات الطفل");
    } finally {
      setSaving(false);
    }
  };

  // ─── أيقونة الطفل تتغير حسب الجنس (طفولية) ───
  const getChildIcon = () => {
    if (gender === "male") return "face-man";
    if (gender === "female") return "face-woman";
    return "baby-face-outline";
  };

  const getChildIconColor = () => {
    if (gender === "male") return PRIMARY_DARK;
    if (gender === "female") return "#E91E63";
    return MUTED;
  };

  const getChildIconBg = () => {
    if (gender === "male") return PRIMARY_LIGHT;
    if (gender === "female") return PINK_LIGHT;
    return BG;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      {/* ─── HEADER GRADIENT ─── */}
      <View style={styles.headerGradient}>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>إضافة طفل جديد</Text>

          <View style={{ width: 42 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── أيقونة الطفل (تتغير حسب الجنس) ─── */}
        <View style={styles.avatarSection}>
          <View
            style={[
              styles.avatarCircle,
              { backgroundColor: getChildIconBg() },
            ]}
          >
            <MaterialCommunityIcons
              name={getChildIcon()}
              size={70}
              color={getChildIconColor()}
            />
          </View>
          <Text style={styles.avatarHint}>
            {gender === "male"
              ? "طفل"
              : gender === "female"
              ? "طفلة"
              : "اختاري الجنس"}
          </Text>
        </View>

        {/* ─── العنوان ─── */}
        <Text style={styles.title}>
          أدخلي معلومات الطفل لنبدأ رحلة{"\n"}المتابعة والنمو
        </Text>

        {/* ─── الحقول ─── */}
        <View style={styles.inputSection}>
          {/* اسم الطفل */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color={PRIMARY_DARK} />
            <TextInput
              placeholder="اسم الطفل"
              style={styles.customInput}
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
              textAlign="right"
            />
          </View>

          {/* ايميل ولي الأمر */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={PRIMARY_DARK} />
            <TextInput
              placeholder="إيميل ولي أمر الطفل"
              style={styles.customInput}
              placeholderTextColor="#888"
              value={parentEmail}
              onChangeText={setParentEmail}
              textAlign="right"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* نوع الصعوبة */}
          <View style={styles.inputContainer}>
            <Ionicons name="medkit-outline" size={20} color={PRIMARY_DARK} />
            <TextInput
              placeholder="نوع الصعوبة"
              style={styles.customInput}
              placeholderTextColor="#888"
              value={difficulty}
              onChangeText={setDifficulty}
              textAlign="right"
            />
          </View>
        </View>

        {/* ─── اختيار الجنس ─── */}
        <Text style={styles.sectionLabel}>الجنس</Text>
        <View style={styles.genderRow}>
          <TouchableOpacity
            style={[
              styles.genderCard,
              gender === "female" && styles.genderCardActiveFemale,
            ]}
            onPress={() => setGender("female")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.genderIconBox,
                gender === "female" && { backgroundColor: PINK },
              ]}
            >
              <MaterialCommunityIcons
                name="face-woman"
                size={32}
                color={gender === "female" ? "#fff" : "#E91E63"}
              />
            </View>
            <Text
              style={[
                styles.genderText,
                gender === "female" && { color: "#E91E63", fontWeight: "700" },
              ]}
            >
              أنثى
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderCard,
              gender === "male" && styles.genderCardActiveMale,
            ]}
            onPress={() => setGender("male")}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.genderIconBox,
                gender === "male" && { backgroundColor: PRIMARY },
              ]}
            >
              <MaterialCommunityIcons
                name="face-man"
                size={32}
                color={gender === "male" ? "#fff" : PRIMARY_DARK}
              />
            </View>
            <Text
              style={[
                styles.genderText,
                gender === "male" && { color: PRIMARY_DARK, fontWeight: "700" },
              ]}
            >
              ذكر
            </Text>
          </TouchableOpacity>
        </View>

        {/* ─── تاريخ الميلاد ─── */}
        <Text style={styles.sectionLabel}>تاريخ الميلاد</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={22} color={PRIMARY_DARK} />
          <Text style={styles.dateText}>
            {date.toLocaleDateString("ar-EG", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
            locale="ar-SA"
            maximumDate={new Date()}
          />
        )}

        {/* ─── زر الحفظ ─── */}
        <TouchableOpacity
          style={[styles.nextButton, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.nextButtonText}>حفظ بيانات الطفل</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  // ─── Header ───
  headerGradient: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
    position: "relative",
  },
  decorCircle1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  decorCircle2: {
    position: "absolute",
    bottom: -40,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#fff",
  },

  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: "center",
  },

  // ─── Avatar Section ───
  avatarSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 4,
    borderColor: "#fff",
    shadowColor: PRIMARY_DARK,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  avatarHint: {
    fontSize: 13,
    color: MUTED,
    fontWeight: "600",
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    color: TEXT,
    lineHeight: 28,
    marginBottom: 25,
  },

  // ─── Inputs ───
  inputSection: {
    width: "100%",
    gap: 12,
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 10,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  customInput: {
    flex: 1,
    height: 50,
    fontSize: 14,
    color: TEXT,
    padding: 0,
  },

  // ─── Section Label ───
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT,
    alignSelf: "flex-end",
    marginTop: 22,
    marginBottom: 12,
  },

  // ─── Gender ───
  genderRow: {
    flexDirection: "row-reverse",
    width: "100%",
    gap: 12,
  },
  genderCard: {
    flex: 1,
    backgroundColor: CARD,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#EEF2FF",
  },
  genderCardActiveMale: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY_LIGHT,
  },
  genderCardActiveFemale: {
    borderColor: PINK,
    backgroundColor: PINK_LIGHT,
  },
  genderIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: BG,
    alignItems: "center",
    justifyContent: "center",
  },
  genderText: {
    fontSize: 14,
    color: MUTED,
    fontWeight: "600",
  },

  // ─── Date ───
  dateInput: {
    backgroundColor: CARD,
    borderRadius: 16,
    height: 55,
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  dateText: {
    flex: 1,
    fontSize: 14,
    color: TEXT,
    textAlign: "right",
  },

  // ─── Save Button ───
  nextButton: {
    flexDirection: "row-reverse",
    backgroundColor: PRIMARY,
    width: "100%",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 30,
    shadowColor: PRIMARY_DARK,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
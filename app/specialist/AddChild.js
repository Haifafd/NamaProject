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
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/Ionicons";

export default function AddChild({ navigation }) {
  const [gender, setGender] = useState("");
  const [date, setDate] = useState(new Date(2022, 8, 9));
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation?.goBack()}
        >
          <Image 
            source={require("../../assets/images/icons/icon.png")}
            style={styles.backIcon} 
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={styles.title}>
          أدخل معلومات الطفل لنبدأ رحلة{"\n"}المتابعة والنمو
        </Text>

        <View style={styles.inputSection}>
          <TextInput 
            placeholder="اسم الطفل" 
            style={styles.customInput} 
            placeholderTextColor="#888"
          />
          <TextInput 
            placeholder="ايميل ولي امر الطفل" 
            style={styles.customInput} 
            placeholderTextColor="#888"
          />
          <TextInput 
            placeholder="نوع الصعوبة" 
            style={styles.customInput} 
            placeholderTextColor="#888"
          />
        </View>

        <View style={styles.genderRow}>
          <TouchableOpacity 
            style={styles.radioButtonContainer} 
            onPress={() => setGender("female")}
          >
            <View style={[styles.radioOuter, gender === "female" && styles.radioOuterActive]}>
              {gender === "female" && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.genderText}>أنثى</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.radioButtonContainer} 
            onPress={() => setGender("male")}
          >
            <View style={[styles.radioOuter, gender === "male" && styles.radioOuterActive]}>
              {gender === "male" && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.genderText}>ذكر</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.dateInput} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <Icon name="calendar-outline" size={22} color="#4E7CF3" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
            locale="ar-SA"
          />
        )}

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => navigation?.navigate("TherapyPlan")}
        >
          <Text style={styles.nextButtonText}>الخطوة التالية</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFF",
  },
  container: {
    paddingHorizontal: 25,
    paddingBottom: 30,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-end',
    marginTop: 15,
    marginBottom: 10,
    padding: 5, 
  },
  backIcon: {
    width: 28,
    height: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
    lineHeight: 32,
    marginBottom: 30,
  },
  inputSection: {
    width: '100%',
    gap: 12,
  },
  customInput: {
    backgroundColor: "#E7EEFF",
    borderRadius: 25,
    height: 55,
    paddingHorizontal: 20,
    textAlign: 'right',
    fontSize: 15,
    color: '#333',
    borderWidth: 0,
  },
  genderRow: {
    flexDirection: "row-reverse",
    justifyContent: "center",
    gap: 50,
    marginVertical: 30,
  },
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1E3FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: '#4E7CF3',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4E7CF3',
  },
  genderText: {
    fontSize: 16,
    color: "#555",
    fontWeight: '500',
  },
  dateInput: {
    backgroundColor: "#E7EEFF",
    borderRadius: 25,
    height: 55,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 35,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  nextButton: {
    backgroundColor: "#8EBEF5",
    width: '100%',
    height: 55,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8EBEF5",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  nextButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

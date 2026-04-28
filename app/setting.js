import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function Settings({ navigation }) {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = React.useState(true);

  const toggleSwitch = () => setIsNotificationsEnabled(previousState => !previousState);

  const SettingItem = ({ title, onPress, isSwitch = false }) => (
    <TouchableOpacity 
      style={styles.item} 
      onPress={onPress} 
      disabled={isSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.leftContainer}>
        {isSwitch ? (
          <Switch
            trackColor={{ false: "#767577", true: "#BBDEFB" }}
            thumbColor={isNotificationsEnabled ? "#00E676" : "#f4f3f4"}
            onValueChange={toggleSwitch}
            value={isNotificationsEnabled}
          />
        ) : (
          <View style={styles.arrowCircle}>
             <MaterialCommunityIcons name="arrow-left-thin" size={20} color="#B0BEC5" />
          </View>
        )}
      </View>
      
      <View style={styles.rightContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonCircle}>
           <MaterialCommunityIcons name="arrow-left" size={28} color="#000000" />
        </TouchableOpacity>

        <View style={styles.headerTextContainer}>
          <Text style={styles.mainTitle}>الإعدادات</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionTitle}>الحساب</Text>
        <View style={styles.sectionCard}>
          <SettingItem title="تعديل الملف الشخصي" onPress={() => navigation.navigate("EditProfile")} />
          <SettingItem title="تغيير كلمة المرور" onPress={() => navigation.navigate("ChangePassword")} />
          <SettingItem title="التنبيهات" isSwitch={true} />
        </View>

        <Text style={styles.sectionTitle}>الدعم والمساعدة</Text>
        <View style={styles.sectionCard}>
          <SettingItem title="تواصل معنا" onPress={() => {}} />
          <SettingItem title="عن تطبيق نماء" onPress={() => {}} />
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>تطبيق نماء - ٢٠٢٦</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FEFF' },
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
  scrollContent: { padding: 20 },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#546E7A', 
    marginBottom: 10, 
    marginTop: 15,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif'
  },
  sectionCard: { 
    backgroundColor: '#fff', 
    borderRadius: 22, 
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    marginBottom: 10
  },
  item: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F9F9F9'
  },
  rightContainer: { alignItems: 'flex-end' },
  leftContainer: { alignItems: 'flex-start' },
  arrowCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F0F4F8',
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemTitle: { 
    fontSize: 17, 
    color: '#37474F', 
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif'
  },
  logoutButton: { 
    marginTop: 30, 
    backgroundColor: '#FFF5F5', 
    padding: 18, 
    borderRadius: 15, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFE0E0'
  },
  logoutText: { 
    color: '#D32F2F', 
    fontWeight: 'bold', 
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif'
  },
  versionText: { 
    textAlign: 'center', 
    color: '#90A4AE', 
    marginTop: 20, 
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif'
  }
});

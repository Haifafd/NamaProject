import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { collection, limit, onSnapshot, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BarChart, LineChart, ProgressChart } from 'react-native-chart-kit';
import { db } from "../../FirebaseConfig";

const screenWidth = Dimensions.get("window").width;

export default function Dashboard({ navigation }) {
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "Children"), limit(1)); 
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ ...doc.data(), id: doc.id });
      });
      if (data.length > 0) setChildData(data[0]);
      setLoading(false);
    }, (error) => {
      console.error("Firebase Error: ", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconContainer}>
            <Ionicons name="chevron-back" size={28} color="#90A4AE" /> 
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconContainer}>
            <MaterialCommunityIcons name="file-document-outline" size={26} color="#546E7A" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          {loading ? (
            <ActivityIndicator size="large" color="#1976D2" />
          ) : childData ? (
            <>
              <View style={styles.avatarContainer}>
                 <FontAwesome5 name="user-alt" size={45} color="#BBDEFB" />
              </View>
              <Text style={styles.childName}>{childData.name}</Text>
              <View style={styles.infoBadgeRow}>
                <View style={styles.badge}>
                    <MaterialCommunityIcons name={childData.gender === 'male' ? 'gender-male' : 'gender-female'} size={14} color="#546E7A" />
                    <Text style={styles.badgeText}>{childData.gender === 'male' ? 'ذكر' : 'أنثى'}</Text>
                </View>
                <View style={styles.badge}>
                    <MaterialCommunityIcons name="brain" size={14} color="#546E7A" />
                    <Text style={styles.badgeText}>{childData.difficulty || "صعوبات تعلم"}</Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.childInfo}>لا توجد بيانات متاحة</Text>
          )}
        </View>

        <View style={styles.whiteSheet}>
          <View style={styles.grid}>
            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
              <Text style={styles.cardTitle}>مؤشر الانتباه والثبات</Text>
              <LineChart data={{ datasets: [{ data: [20, 45, 60, 85] }] }} width={screenWidth * 0.4} height={55} chartConfig={chartConfig} bezier withDots={false} withInnerLines={false} withOuterLines={false} withVerticalLabels={false} withHorizontalLabels={false} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
              <Text style={styles.cardTitle}>مؤشر الذاكرة العاملة</Text>
              <LineChart data={{ datasets: [{ data: [30, 40, 70, 75] }] }} width={screenWidth * 0.4} height={55} chartConfig={{...chartConfig, color: () => '#4CAF50'}} bezier withDots={false} withInnerLines={false} withVerticalLabels={false} withHorizontalLabels={false} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
              <Text style={styles.cardTitle}>مؤشر المعالجة المعرفية</Text>
              <View style={styles.barContainer}>
                <View style={styles.barRow}><View style={[styles.bar, {width: '65%'}]} /><Text style={styles.barLabel}>65%</Text></View>
                <View style={styles.barRow}><View style={[styles.bar, {width: '75%', backgroundColor: '#64B5F6'}]} /><Text style={styles.barLabel}>75%</Text></View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
              <Text style={styles.cardTitle}>مؤشر الإدراك البصري</Text>
              <BarChart data={{ labels: ["", "", ""], datasets: [{ data: [82, 70, 78] }] }} width={screenWidth * 0.4} height={55} chartConfig={chartConfig} withInnerLines={false} fromZero withHorizontalLabels={false} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
              <Text style={styles.cardTitle}>متوسط الأداء العام</Text>
              <View style={styles.progressContainer}>
                <ProgressChart data={{ data: [0.85] }} width={screenWidth * 0.35} height={55} strokeWidth={6} radius={20} chartConfig={chartConfig} hideLegend />
                <Text style={styles.progressText}>85%</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} activeOpacity={0.8}>
              <Text style={styles.cardTitle}>حل المشكلات</Text>
              <BarChart data={{ labels: ["", ""], datasets: [{ data: [76, 65] }] }} width={screenWidth * 0.4} height={55} chartConfig={chartConfig} withInnerLines={false} fromZero withHorizontalLabels={false} />
            </TouchableOpacity>
          </View>

          {/* الزر المطلوب للانتقال */}
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => navigation.navigate("TreatPlan")}
          >
            <MaterialCommunityIcons name="clipboard-text-clock-outline" size={22} color="#37474F" style={{marginLeft: 10}} />
            <Text style={styles.actionButtonText}>الخطة العلاجية وإدارة الأنشطة</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.chatButton}>
        <Ionicons name="chatbubble-ellipses" size={30} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  scrollContent: { flexGrow: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 10 : 40, paddingBottom: 10, alignItems: 'center' },
  headerIconContainer: { padding: 8 },
  profileSection: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
  avatarContainer: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  childName: { fontSize: 20, fontWeight: 'bold', marginTop: 12, color: '#37474F' },
  infoBadgeRow: { flexDirection: 'row-reverse', marginTop: 8, gap: 10 },
  badge: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.7)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 15, gap: 6 },
  badgeText: { fontSize: 12, color: '#546E7A', fontWeight: 'bold' },
  whiteSheet: { backgroundColor: '#fff', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 20, flex: 1, paddingBottom: 100 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 22, padding: 12, marginBottom: 15, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10, height: 135, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#F0F4F8' },
  cardTitle: { fontSize: 11, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#455A64' },
  barContainer: { width: '100%', alignItems: 'center' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, width: '90%' },
  bar: { height: 6, backgroundColor: '#2196F3', borderRadius: 4 },
  barLabel: { fontSize: 9, marginLeft: 6, color: '#78909C' },
  progressContainer: { justifyContent: 'center', alignItems: 'center' },
  progressText: { position: 'absolute', fontSize: 12, fontWeight: 'bold', color: '#2196F3' },
  actionButton: { flexDirection: 'row', backgroundColor: '#F5F7F9', padding: 18, borderRadius: 20, marginTop: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E1E8ED' },
  actionButtonText: { fontSize: 15, fontWeight: 'bold', color: '#37474F' },
  chatButton: { position: 'absolute', bottom: 30, left: 25, backgroundColor: '#1976D2', width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#1976D2', shadowOpacity: 0.4, shadowRadius: 10 },
});

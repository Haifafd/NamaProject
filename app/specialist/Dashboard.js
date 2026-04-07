import { Alert, Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart, ProgressChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get("window").width;

export default function Dashboard(props) {
  
  const childData = {
    name: "محمد عبدالله",
    age: 4,
    difficulty: "تشتت انتباه",
    // تم التأكد من المسار بناءً على هيكلة ملفاتك
    avatar: require('../../assets/images/child.png'), 
    overallPerformance: 0.92
  };

  const chartConfig = {
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 0,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  const navigateToDetails = (metricName) => {
    Alert.alert("تفاصيل المؤشر", `الانتقال لصفحة تفاصيل: ${metricName}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        
        <View style={styles.header}>
          <TouchableOpacity>
            <Image source={require('../../assets/images/icons/doc.png')} style={styles.headerIcon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.backBtnContainer}>
            <Text style={styles.navIcon}>{"<"}</Text> 
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <Image source={childData.avatar} style={styles.avatar} />
          <Text style={styles.childName}>الأسم : {childData.name}</Text>
          <Text style={styles.childInfo}>العمر : {childData.age}</Text>
          <Text style={styles.childInfo}>نوع الصعوبة: {childData.difficulty}</Text>
        </View>

        <View style={styles.whiteSheet}>
          <View style={styles.grid}>
            
            <TouchableOpacity style={styles.card} onPress={() => navigateToDetails("مؤشر الانتباه والثبات")}>
              <Text style={styles.cardTitle}>مؤشر الانتباه والثبات</Text>
              <LineChart
                data={{ datasets: [{ data: [20, 45, 60, 85] }] }}
                width={screenWidth * 0.38} height={60}
                chartConfig={chartConfig} bezier withDots={false} withInnerLines={false} withOuterLines={false} withVerticalLabels={false} withHorizontalLabels={false}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigateToDetails("مؤشر الذاكرة العاملة")}>
              <Text style={styles.cardTitle}>مؤشر الذاكرة العاملة</Text>
              <LineChart
                data={{ datasets: [{ data: [30, 40, 70, 75] }] }}
                width={screenWidth * 0.38} height={60}
                chartConfig={{...chartConfig, color: () => '#4CAF50'}} bezier withDots={false}
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigateToDetails("مؤشر المعالجة المعرفية")}>
              <Text style={styles.cardTitle}>مؤشر المعالجة المعرفية</Text>
              <View style={styles.barRow}><View style={[styles.bar, {width: '65%'}]} /><Text style={styles.barLabel}>65%</Text></View>
              <View style={styles.barRow}><View style={[styles.bar, {width: '75%', backgroundColor: '#64B5F6'}]} /><Text style={styles.barLabel}>75%</Text></View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigateToDetails("مؤشر الإدراك البصري")}>
              <Text style={styles.cardTitle}>مؤشر الإدراك البصري</Text>
              <BarChart
                data={{ labels: ["", "", ""], datasets: [{ data: [82, 70, 78] }] }}
                width={screenWidth * 0.38} height={60}
                chartConfig={chartConfig} withInnerLines={false} fromZero
              />
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigateToDetails("متوسط الأداء العام")}>
              <Text style={styles.cardTitle}>متوسط الأداء العام</Text>
              {/* تعديل: تم تغيير <div> إلى <View> لأن React Native لا يدعم <div> */}
              <View style={styles.progressContainer}>
                <ProgressChart
                  data={{ data: [childData.overallPerformance] }}
                  width={screenWidth * 0.35} height={60} strokeWidth={6} radius={22}
                  chartConfig={chartConfig} hideLegend
                />
                <Text style={styles.progressText}>{Math.round(childData.overallPerformance * 100)}%</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => navigateToDetails("حل المشكلات والاستقلالية")}>
              <Text style={styles.cardTitle}>حل المشكلات والاستقلالية</Text>
              <BarChart
                data={{ labels: ["", ""], datasets: [{ data: [76, 65] }] }}
                width={screenWidth * 0.38} height={60}
                chartConfig={chartConfig} withInnerLines={false}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.actionButton}>
            <Image source={require('../../assets/images/icons/edit.png')} style={styles.btnIcon} />
            <Text style={styles.actionButtonText}>الخطة العلاجية وإدارة الأنشطة</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.chatButton} onPress={() => Alert.alert("الشات")}>
        <Image source={require('../../assets/images/icons/chat_bubble.png')} style={styles.chatIcon} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD' },
  scrollContent: { flexGrow: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: 30, 
    alignItems: 'center' 
  },
  navIcon: { 
    fontSize: 24, 
    color: '#90A4AE', 
    fontWeight: 'bold',
    transform: [{ scaleX: -1 }] 
  },
  headerIcon: { width: 25, height: 25, tintColor: '#546E7A' },
  profileSection: { alignItems: 'center', marginBottom: 25 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#fff' },
  childName: { fontSize: 18, fontWeight: 'bold', marginTop: 10, color: '#37474F' },
  childInfo: { fontSize: 14, color: '#546E7A', marginTop: 3 },
  whiteSheet: { 
    backgroundColor: '#fff', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 20, 
    flex: 1, 
    paddingBottom: 100 
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', backgroundColor: '#fff', borderRadius: 15, padding: 10, marginBottom: 15, elevation: 3 },
  cardTitle: { fontSize: 10, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#455A64' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  bar: { height: 6, backgroundColor: '#2196F3', borderRadius: 3 },
  barLabel: { fontSize: 8, marginLeft: 5, color: '#78909C' },
  progressContainer: { justifyContent: 'center', alignItems: 'center' },
  progressText: { position: 'absolute', fontSize: 12, fontWeight: 'bold', color: '#2196F3' },
  actionButton: { flexDirection: 'row', backgroundColor: '#F8F9FA', padding: 18, borderRadius: 15, marginTop: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ECEFF1' },
  actionButtonText: { fontSize: 15, fontWeight: 'bold', color: '#37474F' },
  btnIcon: { width: 20, height: 20, marginRight: 10, tintColor: '#37474F' },
  chatButton: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    backgroundColor: '#1976D2',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  chatIcon: { width: 30, height: 30, tintColor: '#fff' },
});

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  SafeAreaView,
  StatusBar,
} from "react-native";

const PRIMARY = "#1565C0";
const PRIMARY_LIGHT = "#E3F2FD";
const BG = "#F0F4F8";
const CARD = "#FFFFFF";
const BORDER = "#E0E0E0";
const TEXT = "#1A1A1A";
const MUTED = "#757575";
const GREEN = "#4CAF50";

const INITIAL_GOALS = [
  "تحسين انتباه الطفل %75",
  "زيادة التركيز إلى 10 دقائق",
  "تقليل نسبة التشتيت إلى %30",
];

const INITIAL_ACTIVITIES = [
  { id: "memory",    label: "أنشطة الذاكرة",          count: null, checked: true },
  { id: "attention", label: "أنشطة التشتت والانتباه",  count: null, checked: true },
  { id: "focus",     label: "أنشطة التركيز",           count: 5,    checked: true },
  { id: "visual",    label: "أنشطة البصرية",           count: null, checked: true },
];

function SectionCard({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Stepper({ value, onChange }) {
  return (
    <View style={styles.stepper}>
      <TouchableOpacity
        style={styles.stepBtn}
        onPress={() => onChange(Math.max(1, value - 1))}
      >
        <Text style={styles.stepBtnText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.stepValue}>{value}</Text>
      <TouchableOpacity
        style={styles.stepBtn}
        onPress={() => onChange(value + 1)}
      >
        <Text style={styles.stepBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function Checkbox({ checked, onToggle }) {
  return (
    <TouchableOpacity
      style={[
        styles.checkbox,
        checked && { backgroundColor: PRIMARY, borderColor: PRIMARY },
      ]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      {checked && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

export default function TherapyPlanScreen({ navigation }) {
  const [goals, setGoals] = useState(INITIAL_GOALS);
  const [newGoal, setNewGoal] = useState("");
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [sessions, setSessions] = useState(4);
  const [activitiesCount, setActivitiesCount] = useState(6);
  const [duration] = useState(20);
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [saved, setSaved] = useState(false);

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal("");
      setShowGoalInput(false);
    }
  };

  const handleToggleActivity = (id) => {
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, checked: !a.checked } : a))
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleBack = () => {
    if (navigation) navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={CARD} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Text style={styles.backBtnText}>›</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>الخطة العلاجية وإدارة الأنشطة</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Goals Section ── */}
        <SectionCard title="الأهداف العلاجية">
          {goals.map((goal, index) => (
            <View key={index} style={styles.goalRow}>
              <View style={styles.goalBullet}>
                <Text style={styles.goalBulletText}>{index + 1}-</Text>
              </View>
              <Text style={styles.goalText}>{goal}</Text>
            </View>
          ))}

          {showGoalInput && (
            <View style={styles.goalInputRow}>
              <TouchableOpacity style={styles.addConfirmBtn} onPress={handleAddGoal}>
                <Text style={styles.addConfirmText}>✓</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.goalInput}
                value={newGoal}
                onChangeText={setNewGoal}
                placeholder="اكتب الهدف الجديد..."
                placeholderTextColor={MUTED}
                textAlign="right"
                autoFocus
                onSubmitEditing={handleAddGoal}
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.addGoalBtn}
            onPress={() => setShowGoalInput(true)}
          >
            <Text style={styles.addGoalPlus}>+</Text>
            <Text style={styles.addGoalText}>إضافة هدف جديد</Text>
          </TouchableOpacity>
        </SectionCard>

        {/* ── Dose Section ── */}
        <SectionCard title="الجرعة العلاجية">
          <View style={styles.doseRow}>
            <Stepper value={sessions} onChange={setSessions} />
            <Text style={styles.doseLabel}>جلسات في الأسبوع</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.doseRow}>
            <Stepper value={activitiesCount} onChange={setActivitiesCount} />
            <Text style={styles.doseLabel}>عدد الأنشطة في الجلسة</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.doseRow}>
            <View style={styles.durationDisplay}>
              <Text style={styles.clockIcon}>🕐</Text>
              <Text style={styles.durationText}>{duration} دقيقة</Text>
            </View>
            <Text style={styles.doseLabel}>مدة الأنشطة</Text>
          </View>

          <TouchableOpacity style={styles.saveSmallBtn} onPress={handleSave}>
            <Text style={styles.saveSmallText}>حفظ</Text>
          </TouchableOpacity>
        </SectionCard>

        {/* ── Activities Section ── */}
        <SectionCard title="الأنشطة المختارة">
          {activities.map((activity, index) => (
            <View key={activity.id}>
              <View style={styles.activityRow}>
                <Checkbox
                  checked={activity.checked}
                  onToggle={() => handleToggleActivity(activity.id)}
                />
                {activity.count !== null && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{activity.count}</Text>
                  </View>
                )}
                <Text style={[styles.activityLabel, !activity.checked && { color: MUTED }]}>
                  {activity.label}
                </Text>
              </View>
              {index < activities.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </SectionCard>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Bottom Save Button ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, saved && { backgroundColor: GREEN }]}
          onPress={handleSave}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>{saved ? "✓ تم الحفظ" : "حفظ"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backBtn: {
    position: "absolute",
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  backBtnText: {
    fontSize: 24,
    color: TEXT,
    lineHeight: 28,
    transform: [{ rotate: "180deg" }],
  },
  headerTitle: {
    fontSize: 16,
    color: TEXT,
    textAlign: "right",
    flex: 1,
    paddingRight: 4,
    fontWeight: "700",
  },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 14 },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 10,
  },
  sectionTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: TEXT,
    textAlign: "right",
    marginBottom: 4,
  },
  goalRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: 6,
  },
  goalBullet: { minWidth: 24, alignItems: "flex-end" },
  goalBulletText: { fontSize: 13, color: MUTED },
  goalText: {
    fontSize: 13,
    color: TEXT,
    flex: 1,
    textAlign: "right",
    lineHeight: 22,
  },
  goalInputRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  goalInput: {
    flex: 1,
    fontSize: 13,
    color: TEXT,
    minHeight: 36,
    padding: 0,
  },
  addConfirmBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  addConfirmText: { color: "white", fontSize: 16, fontWeight: "700" },
  addGoalBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: PRIMARY,
    borderStyle: "dashed",
    alignSelf: "flex-end",
    marginTop: 2,
  },
  addGoalPlus: { color: PRIMARY, fontSize: 18, fontWeight: "700" },
  addGoalText: { fontWeight: "600", fontSize: 13, color: PRIMARY },
  doseRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  doseLabel: {
    fontSize: 14,
    color: TEXT,
    textAlign: "right",
    flex: 1,
    marginRight: 12,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  stepBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  stepBtnText: { fontSize: 18, color: PRIMARY, lineHeight: 22 },
  stepValue: {
    fontWeight: "700",
    fontSize: 15,
    color: PRIMARY,
    minWidth: 22,
    textAlign: "center",
  },
  durationDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 4,
  },
  clockIcon: { fontSize: 14 },
  durationText: { fontWeight: "600", fontSize: 14, color: PRIMARY },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 2 },
  saveSmallBtn: {
    alignSelf: "flex-start",
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  saveSmallText: { fontWeight: "600", fontSize: 13, color: "white" },
  activityRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BORDER,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: { color: "white", fontSize: 13, fontWeight: "700" },
  activityLabel: { fontSize: 14, color: TEXT, flex: 1, textAlign: "right" },
  countBadge: {
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  countBadgeText: { fontWeight: "700", fontSize: 12, color: PRIMARY },
  footer: {
    backgroundColor: CARD,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  saveBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: { fontWeight: "700", fontSize: 16, color: "white" },
});
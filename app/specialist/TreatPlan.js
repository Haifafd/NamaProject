import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../../FirebaseConfig";
import {
  getAllActivities,
  getActivitiesByCategory,
  saveTherapeuticPlan,
  CATEGORIES,
  CATEGORY_INFO,
} from "../../Services/ActivityService";

const PRIMARY = "#1565C0";
const PRIMARY_LIGHT = "#E3F2FD";
const BG = "#F0F4F8";
const CARD = "#FFFFFF";
const BORDER = "#E0E0E0";
const TEXT = "#1A1A1A";
const MUTED = "#757575";
const GREEN = "#4CAF50";
const RED = "#f56565";

// فلاتر التصنيفات (الكل + 4 أنواع)
const FILTERS = [
  { id: "all", name: "الكل", icon: "apps", color: PRIMARY, lightColor: PRIMARY_LIGHT },
  { id: CATEGORIES.MEMORY, ...CATEGORY_INFO[CATEGORIES.MEMORY] },
  { id: CATEGORIES.FOCUS, ...CATEGORY_INFO[CATEGORIES.FOCUS] },
  { id: CATEGORIES.THINKING, ...CATEGORY_INFO[CATEGORIES.THINKING] },
  { id: CATEGORIES.PERCEPTION, ...CATEGORY_INFO[CATEGORIES.PERCEPTION] },
];

// خيارات مدة النشاط (دقائق)
const DURATION_OPTIONS = [10, 15, 20, 30, 45, 60];

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

function Checkbox({ checked, onToggle, color = PRIMARY }) {
  return (
    <TouchableOpacity
      style={[
        styles.checkbox,
        checked && { backgroundColor: color, borderColor: color },
      ]}
      onPress={onToggle}
      activeOpacity={0.8}
    >
      {checked && <Ionicons name="checkmark" size={14} color="#fff" />}
    </TouchableOpacity>
  );
}

export default function TherapyPlanScreen({ navigation, route }) {
  // childId يجي من الصفحة السابقة (قائمة الأطفال)
  const childId = route?.params?.childId || null;

  // ── الأهداف (تبدأ فاضية) ──
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState("");
  const [showGoalInput, setShowGoalInput] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");

  // ── الجرعة العلاجية (تبدأ بـ 1) ──
  const [sessions, setSessions] = useState(1);
  const [activitiesCount, setActivitiesCount] = useState(1);
  const [duration, setDuration] = useState(20);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [doseSaved, setDoseSaved] = useState(false);

  const [saved, setSaved] = useState(false);

  // ── State للأنشطة ──
  const [activities, setActivities] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);

  // ─────────────────────────────────────────────
  // 📥 جلب الأنشطة
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetchActivities();
  }, [activeFilter]);

  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      let data;
      if (activeFilter === "all") {
        data = await getAllActivities();
      } else {
        data = await getActivitiesByCategory(activeFilter);
      }
      setActivities(data);
    } catch (error) {
      Alert.alert("خطأ", "لم نتمكن من تحميل الأنشطة");
    } finally {
      setLoadingActivities(false);
    }
  };

  // ─────────────────────────────────────────────
  // 🎯 إدارة الأهداف
  // ─────────────────────────────────────────────
  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal("");
      setShowGoalInput(false);
    }
  };

  const handleDeleteGoal = (indexToDelete) => {
    Alert.alert(
      "حذف الهدف",
      "هل أنتي متأكدة من حذف هذا الهدف؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "حذف",
          style: "destructive",
          onPress: () => {
            setGoals(goals.filter((_, i) => i !== indexToDelete));
          },
        },
      ]
    );
  };

  const handleStartEdit = (index, currentText) => {
    setEditingIndex(index);
    setEditingText(currentText);
  };

  const handleSaveEdit = () => {
    if (editingText.trim()) {
      const updated = [...goals];
      updated[editingIndex] = editingText.trim();
      setGoals(updated);
    }
    setEditingIndex(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  // ─────────────────────────────────────────────
  // 💊 حفظ الجرعة (مؤقت في الـ state)
  // ─────────────────────────────────────────────
  const handleSaveDose = () => {
    setDoseSaved(true);
    setTimeout(() => setDoseSaved(false), 2000);
  };

  // ─────────────────────────────────────────────
  // ✅ تبديل اختيار النشاط
  // ─────────────────────────────────────────────
  const toggleActivity = (activityId) => {
    setSelectedActivities((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  };

  // ─────────────────────────────────────────────
  // 💾 حفظ الخطة في Firebase
  // ─────────────────────────────────────────────
  const handleSave = async () => {
    if (selectedActivities.length === 0) {
      Alert.alert("تنبيه", "الرجاء اختيار نشاط واحد على الأقل");
      return;
    }

    if (!childId) {
      Alert.alert("تنبيه", "لم يتم تحديد الطفل");
      return;
    }

    const specialistId = auth.currentUser?.uid;
    if (!specialistId) {
      Alert.alert("تنبيه", "الرجاء تسجيل الدخول");
      return;
    }

    try {
      setSavingPlan(true);
      await saveTherapeuticPlan({
        childId: childId,
        createdBy: specialistId,
        activityIds: selectedActivities,
        goals: goals,
        sessionsPerWeek: sessions,
        activitiesPerSession: activitiesCount,
        duration: duration,
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      Alert.alert("تم بنجاح", "تم حفظ الخطة العلاجية");
    } catch (error) {
      Alert.alert("خطأ", "لم نتمكن من حفظ الخطة");
    } finally {
      setSavingPlan(false);
    }
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
          <Ionicons name="chevron-forward" size={22} color={TEXT} />
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
          {goals.length === 0 && !showGoalInput && (
            <View style={styles.emptyGoalsBox}>
              <Ionicons name="flag-outline" size={32} color={MUTED} />
              <Text style={styles.emptyGoalsText}>
                لم يتم إضافة أهداف بعد
              </Text>
              <Text style={styles.emptyGoalsSubText}>
                اضغطي على "إضافة هدف جديد" للبدء
              </Text>
            </View>
          )}

          {goals.map((goal, index) => (
            <View key={index} style={styles.goalCard}>
              {editingIndex === index ? (
                <View style={styles.goalEditRow}>
                  <TouchableOpacity
                    style={styles.editConfirmBtn}
                    onPress={handleSaveEdit}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editCancelBtn}
                    onPress={handleCancelEdit}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.goalEditInput}
                    value={editingText}
                    onChangeText={setEditingText}
                    placeholder="عدّلي الهدف..."
                    placeholderTextColor={MUTED}
                    textAlign="right"
                    autoFocus
                    onSubmitEditing={handleSaveEdit}
                  />
                </View>
              ) : (
                <View style={styles.goalRow}>
                  <View style={styles.goalActions}>
                    <TouchableOpacity
                      style={styles.goalActionBtn}
                      onPress={() => handleDeleteGoal(index)}
                    >
                      <Ionicons name="trash-outline" size={16} color={RED} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.goalActionBtn}
                      onPress={() => handleStartEdit(index, goal)}
                    >
                      <Ionicons name="pencil-outline" size={16} color={PRIMARY} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.goalText}>
                    {index + 1}. {goal}
                  </Text>
                </View>
              )}
            </View>
          ))}

          {showGoalInput && (
            <View style={styles.goalInputRow}>
              <TouchableOpacity style={styles.addConfirmBtn} onPress={handleAddGoal}>
                <Ionicons name="checkmark" size={16} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addCancelBtn}
                onPress={() => {
                  setShowGoalInput(false);
                  setNewGoal("");
                }}
              >
                <Ionicons name="close" size={16} color="#fff" />
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

          {!showGoalInput && (
            <TouchableOpacity
              style={styles.addGoalBtn}
              onPress={() => setShowGoalInput(true)}
            >
              <Ionicons name="add" size={18} color={PRIMARY} />
              <Text style={styles.addGoalText}>إضافة هدف جديد</Text>
            </TouchableOpacity>
          )}
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

          {/* مدة الأنشطة - قابلة للتعديل */}
          <View style={styles.doseRow}>
            <TouchableOpacity
              style={styles.durationDisplay}
              onPress={() => setShowDurationPicker(!showDurationPicker)}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={16} color={PRIMARY} />
              <Text style={styles.durationText}>{duration} دقيقة</Text>
              <Ionicons
                name={showDurationPicker ? "chevron-up" : "chevron-down"}
                size={14}
                color={PRIMARY}
              />
            </TouchableOpacity>
            <Text style={styles.doseLabel}>مدة الأنشطة</Text>
          </View>

          {/* قائمة اختيار المدة */}
          {showDurationPicker && (
            <View style={styles.durationPicker}>
              {DURATION_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.durationOption,
                    duration === option && styles.durationOptionActive,
                  ]}
                  onPress={() => {
                    setDuration(option);
                    setShowDurationPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.durationOptionText,
                      duration === option && styles.durationOptionTextActive,
                    ]}
                  >
                    {option} د
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* زر حفظ الجرعة */}
          <TouchableOpacity
            style={[
              styles.saveDoseBtn,
              doseSaved && { backgroundColor: GREEN },
            ]}
            onPress={handleSaveDose}
            activeOpacity={0.85}
          >
            <Ionicons
              name={doseSaved ? "checkmark-circle" : "save-outline"}
              size={14}
              color="#fff"
            />
            <Text style={styles.saveDoseBtnText}>
              {doseSaved ? "تم حفظ الجرعة" : "حفظ الجرعة"}
            </Text>
          </TouchableOpacity>
        </SectionCard>

        {/* ── Activities Section ── */}
        <SectionCard title="اختر الأنشطة العلاجية">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filtersScroll}
            contentContainerStyle={styles.filtersContainer}
          >
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: isActive ? filter.color : filter.lightColor,
                      borderColor: filter.color,
                    },
                  ]}
                  onPress={() => setActiveFilter(filter.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={filter.icon}
                    size={16}
                    color={isActive ? "#fff" : filter.color}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      { color: isActive ? "#fff" : filter.color },
                    ]}
                  >
                    {filter.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {selectedActivities.length > 0 && (
            <View style={styles.selectedCountBox}>
              <Text style={styles.selectedCountText}>
                ✓ تم اختيار {selectedActivities.length} نشاط
              </Text>
            </View>
          )}

          {loadingActivities ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={PRIMARY} />
              <Text style={styles.loadingText}>جاري التحميل...</Text>
            </View>
          ) : activities.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="folder-open-outline" size={40} color={MUTED} />
              <Text style={styles.emptyText}>لا توجد أنشطة في هذا التصنيف</Text>
            </View>
          ) : (
            activities.map((activity) => {
              const catInfo = CATEGORY_INFO[activity.categoryId] || {
                name: "غير محدد",
                color: MUTED,
                lightColor: BG,
                icon: "help-circle",
              };
              const isSelected = selectedActivities.includes(activity.id);

              return (
                <View key={activity.id}>
                  <TouchableOpacity
                    style={[
                      styles.activityCard,
                      isSelected && {
                        backgroundColor: catInfo.lightColor,
                        borderColor: catInfo.color,
                      },
                    ]}
                    onPress={() => toggleActivity(activity.id)}
                    activeOpacity={0.7}
                  >
                    <Checkbox
                      checked={isSelected}
                      onToggle={() => toggleActivity(activity.id)}
                      color={catInfo.color}
                    />

                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>{activity.title}</Text>
                      <View style={styles.activityMeta}>
                        <View
                          style={[
                            styles.categoryBadge,
                            { backgroundColor: catInfo.lightColor },
                          ]}
                        >
                          <Ionicons
                            name={catInfo.icon}
                            size={12}
                            color={catInfo.color}
                          />
                          <Text
                            style={[
                              styles.categoryBadgeText,
                              { color: catInfo.color },
                            ]}
                          >
                            {catInfo.name}
                          </Text>
                        </View>
                        <Text style={styles.levelsText}>
                          📊 {activity.levels} مستويات
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: catInfo.lightColor },
                      ]}
                    >
                      <Ionicons
                        name={catInfo.icon}
                        size={22}
                        color={catInfo.color}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </SectionCard>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* ── Bottom Save Button ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.saveBtn,
            saved && { backgroundColor: GREEN },
            savingPlan && { opacity: 0.7 },
          ]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={savingPlan}
        >
          {savingPlan ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {saved ? "✓ تم الحفظ" : "حفظ الخطة"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
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

  // Empty Goals
  emptyGoalsBox: { alignItems: "center", paddingVertical: 20, gap: 6 },
  emptyGoalsText: { fontSize: 14, color: TEXT, fontWeight: "600" },
  emptyGoalsSubText: { fontSize: 12, color: MUTED },

  // Goal Card
  goalCard: { backgroundColor: BG, borderRadius: 10, padding: 10, marginBottom: 6 },
  goalRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  goalText: { fontSize: 13, color: TEXT, flex: 1, textAlign: "right", lineHeight: 22 },
  goalActions: { flexDirection: "row-reverse", gap: 6 },
  goalActionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },

  // Goal Edit Mode
  goalEditRow: { flexDirection: "row-reverse", alignItems: "center", gap: 6 },
  goalEditInput: {
    flex: 1,
    fontSize: 13,
    color: TEXT,
    minHeight: 36,
    padding: 8,
    backgroundColor: CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  editConfirmBtn: {
    backgroundColor: GREEN,
    borderRadius: 8,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  editCancelBtn: {
    backgroundColor: RED,
    borderRadius: 8,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  // Goal Input
  goalInputRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  goalInput: { flex: 1, fontSize: 13, color: TEXT, minHeight: 36, padding: 0 },
  addConfirmBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 8,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  addCancelBtn: {
    backgroundColor: MUTED,
    borderRadius: 8,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
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
  addGoalText: { fontWeight: "600", fontSize: 13, color: PRIMARY },

  // Dose
  doseRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  doseLabel: { fontSize: 14, color: TEXT, textAlign: "right", flex: 1, marginRight: 12 },
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
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: PRIMARY_LIGHT,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: PRIMARY,
  },
  durationText: { fontWeight: "600", fontSize: 14, color: PRIMARY },
  divider: { height: 1, backgroundColor: BORDER, marginVertical: 2 },

  // Duration Picker
  durationPicker: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 8,
  },
  durationOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: BG,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  durationOptionActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  durationOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: TEXT,
  },
  durationOptionTextActive: {
    color: "#fff",
  },

  // Save Dose Button
  saveDoseBtn: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  saveDoseBtnText: { fontWeight: "600", fontSize: 13, color: "white" },

  // Filters
  filtersScroll: { marginBottom: 4 },
  filtersContainer: {
    flexDirection: "row-reverse",
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterText: { fontSize: 13, fontWeight: "600" },

  // Selected counter
  selectedCountBox: {
    backgroundColor: PRIMARY_LIGHT,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginVertical: 4,
  },
  selectedCountText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: "700",
    textAlign: "right",
  },

  // Loading & Empty
  loadingBox: { alignItems: "center", paddingVertical: 30, gap: 10 },
  loadingText: { color: MUTED, fontSize: 13 },
  emptyBox: { alignItems: "center", paddingVertical: 30, gap: 8 },
  emptyText: { color: MUTED, fontSize: 13 },

  // Activity card
  activityCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: BG,
    borderWidth: 1.5,
    borderColor: "transparent",
    marginBottom: 8,
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
  activityInfo: { flex: 1, gap: 4 },
  activityTitle: {
    fontSize: 14,
    color: TEXT,
    textAlign: "right",
    fontWeight: "600",
  },
  activityMeta: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  categoryBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  categoryBadgeText: { fontSize: 11, fontWeight: "600" },
  levelsText: { fontSize: 11, color: MUTED },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  // Footer
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
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import Svg, { Circle, Ellipse, Path } from "react-native-svg";
import { getChildrenByParentEmail } from "../../Services/ChildrenService";
import { getChildPlan } from "../../Services/ActivityService";
import { getCurrentUser } from "../../Services/UserService";
import { hasParentAssessedChild } from "../../Services/AssessmentService";
import { stopBackgroundMusic } from "../../Services/MusicService";
import BottomNavBar from "../../components/BottomNavBar";
import { COLORS } from "../../constants/theme";

// Small plant decoration for the activities button
function MiniPlant({ size = 60 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <Path
        d="M 30 50 Q 30 35 30 22"
        stroke="#558B2F"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M 30 40 Q 18 38 14 44 Q 20 48 30 44 Z" fill="#7CB342" />
      <Path d="M 30 35 Q 42 33 46 39 Q 40 43 30 39 Z" fill="#8BC34A" />
      <Circle cx="30" cy="20" r="6" fill="#9CCC65" />
      <Circle cx="24" cy="16" r="4" fill="#AED581" />
      <Circle cx="36" cy="16" r="4" fill="#AED581" />
      <Circle cx="30" cy="13" r="3" fill="#C5E1A5" />
    </Svg>
  );
}

// Tiny butterfly decoration
function MiniButterfly({ size = 26 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <Ellipse cx="15" cy="15" rx="1" ry="7" fill="#3E2723" />
      <Ellipse
        cx="9"
        cy="11"
        rx="6"
        ry="5"
        fill="#FFB74D"
        transform="rotate(-20 9 11)"
      />
      <Ellipse
        cx="21"
        cy="11"
        rx="6"
        ry="5"
        fill="#FFB74D"
        transform="rotate(20 21 11)"
      />
      <Ellipse
        cx="10"
        cy="19"
        rx="5"
        ry="4"
        fill="#FFE0B2"
        transform="rotate(20 10 19)"
      />
      <Ellipse
        cx="20"
        cy="19"
        rx="5"
        ry="4"
        fill="#FFE0B2"
        transform="rotate(-20 20 19)"
      />
      <Circle cx="8" cy="10" r="0.8" fill="white" />
      <Circle cx="22" cy="10" r="0.8" fill="white" />
    </Svg>
  );
}

const PRIMARY = COLORS.PRIMARY;
const PRIMARY_DARK = COLORS.PRIMARY_DARK;
const PRIMARY_LIGHT = COLORS.PRIMARY_LIGHT;
const BG = COLORS.BG;
const CARD = COLORS.CARD_BG;
const TEXT = COLORS.TEXT;
const MUTED = COLORS.MUTED;
const GREEN = COLORS.SUCCESS;
const GREEN_LIGHT = COLORS.SUCCESS_BG;
const AMBER = COLORS.WARNING;
const AMBER_LIGHT = COLORS.WARNING_BG;
const RED = COLORS.DANGER;

function getProgressColor(progress) {
  if (progress === null || progress === undefined) return MUTED;
  if (progress >= 70) return GREEN;
  if (progress >= 50) return PRIMARY_DARK;
  return AMBER;
}

function getProgressLightColor(progress) {
  if (progress === null || progress === undefined) return BG;
  if (progress >= 70) return GREEN_LIGHT;
  if (progress >= 50) return PRIMARY_LIGHT;
  return AMBER_LIGHT;
}

function getGenderIcon(gender) {
  const g = (gender || "").toString().toLowerCase();
  if (g === "male" || g === "ذكر" || g === "ولد") {
    return { name: "face-man", color: "#0288D1" };
  }
  if (g === "female" || g === "أنثى" || g === "انثى" || g === "بنت") {
    return { name: "face-woman", color: "#E91E63" };
  }
  return { name: "baby-face-outline", color: MUTED };
}

export default function HomepageP() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Children who haven't been assessed yet by parent
  const [pendingAssessments, setPendingAssessments] = useState([]);

  // Track if any child has a therapy plan
  const [hasAnyPlan, setHasAnyPlan] = useState(false);
  const [checkingPlans, setCheckingPlans] = useState(true);

  // Pulse animation for banners
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const loadData = async () => {
    try {
      const [userData, childrenData] = await Promise.all([
        getCurrentUser(),
        getChildrenByParentEmail(),
      ]);
      setUser(userData);
      setChildren(childrenData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Check which children still need parent assessment
  useEffect(() => {
    const checkAssessments = async () => {
      if (!children || children.length === 0) {
        setPendingAssessments([]);
        return;
      }

      try {
        const pending = [];
        for (const child of children) {
          const hasAssessed = await hasParentAssessedChild(child.id);
          if (!hasAssessed) {
            pending.push(child);
          }
        }
        setPendingAssessments(pending);
      } catch (error) {
        console.error("Error checking assessments:", error);
      }
    };

    checkAssessments();
  }, [children]);

  // Check if any child has a therapy plan
  useEffect(() => {
    const checkPlans = async () => {
      if (!children || children.length === 0) {
        setHasAnyPlan(false);
        setCheckingPlans(false);
        return;
      }

      try {
        let foundPlan = false;
        for (const child of children) {
          const plan = await getChildPlan(child.id);
          if (plan && plan.activityIds && plan.activityIds.length > 0) {
            foundPlan = true;
            break;
          }
        }
        setHasAnyPlan(foundPlan);
      } catch (error) {
        console.error("Error checking plans:", error);
        setHasAnyPlan(false);
      } finally {
        setCheckingPlans(false);
      }
    };

    checkPlans();
  }, [children]);

  // Stop child-mode music whenever parent returns to home
  useFocusEffect(
    useCallback(() => {
      stopBackgroundMusic();
    }, [])
  );

  // Re-check plans whenever home screen gets focus (catches new plans created elsewhere)
  useFocusEffect(
    useCallback(() => {
      if (!children || children.length === 0) return;
      const checkPlans = async () => {
        try {
          let foundPlan = false;
          for (const child of children) {
            const plan = await getChildPlan(child.id);
            if (plan && plan.activityIds && plan.activityIds.length > 0) {
              foundPlan = true;
              break;
            }
          }
          setHasAnyPlan(foundPlan);
        } catch (error) {
          console.error(error);
        }
      };
      checkPlans();
    }, [children])
  );

  // Subtle pulse animation for pending banners
  useEffect(() => {
    if (pendingAssessments.length === 0) return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pendingAssessments.length]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOpenAssessmentSplash = (child) => {
    router.push({
      pathname: "/parent/AssessmentSplash",
      params: {
        childId: child.id,
        childName: child.name,
        childGender: child.gender || "",
      },
    });
  };

  const handleChildPress = (child) => {
    router.push({
      pathname: "/parent/ChildReport",
      params: { childId: child.id, childName: child.name },
    });
  };

  const handleActivities = () => router.push("/child/ChildModeSplash");

  const handleOpenChat = async () => {
    if (children.length === 1) {
      const child = children[0];
      if (!child.specialistId) {
        Alert.alert("تنبيه", "لم يتم ربط أخصائي بعد لطفلك");
        return;
      }
      try {
        const { getOrCreateChat } = await import(
          "../../Services/ChatService"
        );
        const chat = await getOrCreateChat({
          childId: child.id,
          childName: child.name,
          parentId: child.parentId,
          parentName: child.parentName || "",
          specialistId: child.specialistId,
          specialistName: child.specialistName || "الأخصائي",
        });

        router.push({
          pathname: "/parent/ChatRoom",
          params: {
            chatId: chat.id,
            childName: child.name,
            specialistName: child.specialistName || "الأخصائي",
          },
        });
      } catch (error) {
        console.error("Error opening chat:", error);
        router.push("/parent/Chat");
      }
    } else {
      router.push("/parent/Chat");
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.centerLoading]}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[PRIMARY]}
              tintColor={PRIMARY}
            />
          }
        >
          {/* ─── HEADER ─── */}
          <View style={styles.headerGradient}>
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            <View style={styles.headerRow}>
              <TouchableOpacity style={styles.notificationBubble}>
                <Ionicons name="notifications" size={20} color="#fff" />
                <View style={styles.notificationDot} />
              </TouchableOpacity>

              <View style={styles.headerCenter}>
                <Text style={styles.welcomeText}>مرحباً بعودتك</Text>
                <Text style={styles.greeting}>{user?.name || "الوالد"}</Text>
              </View>

              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color={PRIMARY_DARK} />
              </View>
            </View>
          </View>

          {/* ─── WELCOME CARD ─── */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeIconBox}>
              <Ionicons name="heart" size={22} color={PRIMARY_DARK} />
            </View>
            <View style={styles.welcomeTextBox}>
              <Text style={styles.welcomeTitle}>تابعي رحلة طفلك</Text>
              <Text style={styles.welcomeSub}>
                اكتشفي تطوره يوماً بعد يوم
              </Text>
            </View>
          </View>

          {/* ─── Pending Assessment Banners ─── */}
          {pendingAssessments.length > 0 && (
            <View style={styles.bannersSection}>
              <View style={styles.bannersSectionHeader}>
                <Ionicons name="alert-circle" size={18} color="#F39C12" />
                <Text style={styles.bannersSectionTitle}>
                  استمارات بانتظار تعبئتك ({pendingAssessments.length})
                </Text>
              </View>

              {pendingAssessments.map((child) => (
                <Animated.View
                  key={child.id}
                  style={{ transform: [{ scale: pulseAnim }] }}
                >
                  <TouchableOpacity
                    style={styles.assessmentBanner}
                    activeOpacity={0.9}
                    onPress={() => handleOpenAssessmentSplash(child)}
                  >
                    <View style={styles.bannerDecor1} />
                    <View style={styles.bannerDecor2} />

                    <View style={styles.bannerIconBox}>
                      <Ionicons name="clipboard" size={26} color="#FFFFFF" />
                    </View>

                    <View style={styles.bannerContent}>
                      <Text style={styles.bannerTitle}>
                        استمارة {child.name} بانتظارك
                      </Text>
                      <Text style={styles.bannerSubtitle}>
                        تساعد الأخصائي على متابعة طفلكِ
                      </Text>
                    </View>

                    <View style={styles.bannerArrow}>
                      <Ionicons
                        name="chevron-back"
                        size={20}
                        color="#FFFFFF"
                      />
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}

          {/* ─── CHILDREN SECTION HEADER ─── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              أطفالي{" "}
              {children.length > 0 ? `(${children.length})` : ""}
            </Text>
          </View>

          {/* ─── CHILDREN GRID / EMPTY ─── */}
          {children.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <MaterialCommunityIcons
                  name="baby-face-outline"
                  size={42}
                  color={PRIMARY_DARK}
                />
              </View>
              <Text style={styles.emptyTitle}>
                لا يوجد أطفال مرتبطين بحسابك
              </Text>
              <Text style={styles.emptySubtitle}>
                تواصلي مع الأخصائي لإضافة طفلك ومتابعة تطوره من هنا.
              </Text>
            </View>
          ) : (
            <View style={styles.childrenGrid}>
              {children.map((child) => {
                const color = getProgressColor(child.progress);
                const lightColor = getProgressLightColor(child.progress);
                const hasProgress =
                  child.progress !== null && child.progress !== undefined;
                const genderIcon = getGenderIcon(child.gender);

                return (
                  <TouchableOpacity
                    key={child.id}
                    style={styles.childCard}
                    onPress={() => handleChildPress(child)}
                    activeOpacity={0.7}
                  >
                    {hasProgress ? (
                      <View
                        style={[
                          styles.progressBadge,
                          { backgroundColor: lightColor },
                        ]}
                      >
                        <Text
                          style={[styles.progressBadgeText, { color: color }]}
                        >
                          {child.progress}%
                        </Text>
                      </View>
                    ) : (
                      <View
                        style={[
                          styles.progressBadge,
                          { backgroundColor: PRIMARY_LIGHT },
                        ]}
                      >
                        <Text
                          style={[
                            styles.progressBadgeText,
                            { color: PRIMARY_DARK },
                          ]}
                        >
                          جديد
                        </Text>
                      </View>
                    )}

                    <View style={styles.childAvatar}>
                      <MaterialCommunityIcons
                        name={genderIcon.name}
                        size={28}
                        color={genderIcon.color}
                      />
                    </View>

                    <Text style={styles.childName} numberOfLines={1}>
                      {child.name}
                    </Text>

                    <Text style={styles.childAge}>
                      العمر: {child.age} {child.age === 1 ? "سنة" : "سنوات"}
                    </Text>

                    {hasProgress ? (
                      <View style={styles.progressBarContainer}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${child.progress}%`,
                              backgroundColor: color,
                            },
                          ]}
                        />
                      </View>
                    ) : (
                      <Text style={styles.noReportHint}>
                        لا يوجد تقرير بعد
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* ─── Activities Hero Button — only when at least one child has a plan ─── */}
          {hasAnyPlan && (
            <TouchableOpacity
              style={styles.activitiesHero}
              activeOpacity={0.85}
              onPress={handleActivities}
            >
              <View style={styles.heroDecor1} />
              <View style={styles.heroDecor2} />
              <View style={styles.heroDecor3} />

              <View style={styles.heroPlant}>
                <MiniPlant size={70} />
              </View>

              <View style={styles.heroButterfly}>
                <MiniButterfly size={28} />
              </View>

              <View style={styles.heroContent}>
                <View style={styles.heroBadge}>
                  <Ionicons name="sparkles" size={12} color="#FFFFFF" />
                  <Text style={styles.heroBadgeText}>عالم طفلك</Text>
                </View>
                <Text style={styles.heroTitle}>لنبدأ رحلة المرح!</Text>
                <Text style={styles.heroSubtitle}>
                  أنشطة ممتعة لتنمية مهارات طفلك
                </Text>

                <View style={styles.heroCTA}>
                  <Text style={styles.heroCTAText}>ادخلي الآن</Text>
                  <Ionicons name="arrow-back" size={16} color="#FFFFFF" />
                </View>
              </View>
            </TouchableOpacity>
          )}

          {/* ─── Chat Button (separate, smaller) ─── */}
          <TouchableOpacity
            style={styles.chatButton}
            activeOpacity={0.85}
            onPress={handleOpenChat}
          >
            <View style={styles.chatIconBox}>
              <Ionicons name="chatbubbles" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.chatContent}>
              <Text style={styles.chatTitle}>تواصلي مع الأخصائي</Text>
              <Text style={styles.chatSubtitle}>
                محادثة مباشرة لمتابعة طفلك
              </Text>
            </View>
            <Ionicons name="chevron-back" size={20} color="#0288D1" />
          </TouchableOpacity>

          <View style={{ height: 110 }} />
        </ScrollView>

        {/* ─── BOTTOM NAVBAR ─── */}
        <BottomNavBar />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  centerLoading: { justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: MUTED, fontSize: 13 },

  // Header
  headerGradient: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 50,
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  notificationBubble: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: RED,
    borderWidth: 2,
    borderColor: PRIMARY,
  },
  headerCenter: { alignItems: "center" },
  welcomeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.95)",
    marginBottom: 2,
  },
  greeting: { fontSize: 20, fontWeight: "700", color: "#fff" },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  // Welcome Card
  // ─── Pending assessment banners ───
  bannersSection: {
    marginHorizontal: 16,
    marginBottom: 18,
    marginTop: 22,
  },
  bannersSectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  bannersSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.TEXT,
  },

  assessmentBanner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    overflow: "hidden",
    position: "relative",
    shadowColor: COLORS.PRIMARY_DARK,
    shadowOpacity: 0.35,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  bannerDecor1: {
    position: "absolute",
    top: -25,
    right: -25,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  bannerDecor2: {
    position: "absolute",
    bottom: -30,
    left: -10,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  bannerIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  bannerContent: {
    flex: 1,
    zIndex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "right",
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    textAlign: "right",
  },
  bannerArrow: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },

  welcomeCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: CARD,
    marginHorizontal: 20,
    marginTop: -25,
    padding: 16,
    borderRadius: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  welcomeIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeTextBox: { flex: 1 },
  welcomeTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT,
    textAlign: "right",
  },
  welcomeSub: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
    textAlign: "right",
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    textAlign: "right",
  },

  // Empty State
  emptyState: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 30,
    gap: 8,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    marginTop: 4,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12,
    color: MUTED,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 10,
  },

  // Children Grid
  childrenGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
  },
  childCard: {
    width: "48%",
    backgroundColor: CARD,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#EEF2FF",
    alignItems: "center",
    position: "relative",
    shadowColor: PRIMARY_DARK,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  progressBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  progressBadgeText: { fontSize: 11, fontWeight: "800" },
  childAvatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  childName: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT,
    textAlign: "center",
  },
  childAge: {
    fontSize: 10,
    color: MUTED,
    marginTop: 2,
    textAlign: "center",
  },
  progressBarContainer: {
    backgroundColor: BG,
    height: 4,
    borderRadius: 2,
    marginTop: 10,
    width: "100%",
    overflow: "hidden",
  },
  progressBarFill: { height: "100%", borderRadius: 2 },
  noReportHint: {
    fontSize: 10,
    color: MUTED,
    fontStyle: "italic",
    marginTop: 8,
    textAlign: "center",
  },

  // ─── Activities Hero Button ───
  activitiesHero: {
    marginHorizontal: 16,
    marginTop: 22,
    marginBottom: 14,
    height: 160,
    borderRadius: 24,
    backgroundColor: "#7CB342",
    overflow: "hidden",
    position: "relative",
    shadowColor: "#558B2F",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  heroDecor1: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#9CCC65",
    opacity: 0.5,
  },
  heroDecor2: {
    position: "absolute",
    bottom: -50,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#AED581",
    opacity: 0.4,
  },
  heroDecor3: {
    position: "absolute",
    top: 30,
    left: 60,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFEB3B",
    opacity: 0.3,
  },
  heroPlant: {
    position: "absolute",
    bottom: 8,
    left: 16,
    zIndex: 2,
  },
  heroButterfly: {
    position: "absolute",
    top: 16,
    left: 24,
    zIndex: 2,
  },
  heroContent: {
    flex: 1,
    padding: 18,
    paddingRight: 22,
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 1,
  },
  heroBadge: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    marginBottom: 8,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
    textAlign: "right",
    textShadowColor: "rgba(0, 0, 0, 0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.95)",
    marginBottom: 12,
    textAlign: "right",
  },
  heroCTA: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.5)",
  },
  heroCTAText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  // ─── Chat Button ───
  chatButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#E1F5FE",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  chatIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#0288D1",
    alignItems: "center",
    justifyContent: "center",
  },
  chatContent: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "right",
    marginBottom: 2,
  },
  chatSubtitle: {
    fontSize: 11,
    color: "#666",
    textAlign: "right",
  },

  // Quick Actions Card
  actionsCard: {
    backgroundColor: CARD,
    marginHorizontal: 20,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  actionItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
  },
  actionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  actionIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTextBox: { flex: 1 },
  actionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
    textAlign: "right",
  },
  actionSub: {
    fontSize: 11,
    color: MUTED,
    marginTop: 2,
    textAlign: "right",
  },
});

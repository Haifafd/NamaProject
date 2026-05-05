import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import {
  subscribeToMyNotifications,
  markAsRead,
  markAllAsRead,
  NOTIFICATION_TYPES,
} from "../../Services/NotificationService";
import { getCurrentUser } from "../../Services/UserService";
import { COLORS } from "../../constants/theme";

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate?.() || new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return "الآن";
  if (diffMin < 60) return `قبل ${diffMin} د`;
  if (diffHours < 24) return `قبل ${diffHours} س`;
  if (diffDays === 1) return "أمس";
  if (diffDays < 7) return `قبل ${diffDays} أيام`;
  return date.toLocaleDateString("ar-EG", { day: "numeric", month: "short" });
};

const getNotifVisuals = (type) => {
  switch (type) {
    case NOTIFICATION_TYPES.CHAT_MESSAGE:
      return { icon: "chatbubbles", color: COLORS.PRIMARY_DARK, bg: COLORS.PRIMARY_LIGHT };
    case NOTIFICATION_TYPES.REPORT_ISSUED:
      return { icon: "document-text", color: COLORS.SUCCESS, bg: "#E8F5E9" };
    case NOTIFICATION_TYPES.TREATMENT_PLAN:
      return { icon: "clipboard", color: COLORS.WARNING, bg: "#FFF6E8" };
    case NOTIFICATION_TYPES.ASSESSMENT_SUBMITTED:
      return { icon: "clipboard-outline", color: "#9C27B0", bg: "#F3E5F5" };
    case NOTIFICATION_TYPES.ACTIVITY_REMINDER:
      return { icon: "game-controller", color: COLORS.DANGER, bg: "#FFEBEE" };
    default:
      return { icon: "notifications", color: COLORS.PRIMARY_DARK, bg: COLORS.PRIMARY_LIGHT };
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let unsubscribe = null;
      const init = async () => {
        const user = await getCurrentUser();
        setUserRole(user?.role || null);
        unsubscribe = subscribeToMyNotifications((notifs) => {
          setNotifications(notifs);
          setLoading(false);
          setRefreshing(false);
        });
      };
      init();
      return () => unsubscribe?.();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleNotifPress = async (notif) => {
    if (!notif.read) await markAsRead(notif.id);

    const { type, data } = notif;
    switch (type) {
      case NOTIFICATION_TYPES.CHAT_MESSAGE:
        if (data?.chatId) {
          const path = userRole === "parent" ? "/parent/ChatRoom" : "/specialist/ChatRoom";
          router.push({
            pathname: path,
            params: {
              chatId: data.chatId,
              childName: data.childName || "",
              specialistName: "",
              parentName: "",
            },
          });
        }
        break;
      case NOTIFICATION_TYPES.REPORT_ISSUED:
      case NOTIFICATION_TYPES.TREATMENT_PLAN:
        if (data?.childId) {
          // الأخصائي يروح للـ Dashboard، ولي الأمر يروح للـ ChildReport
          const path =
            userRole === "specialist"
              ? "/specialist/Dashboard"
              : "/parent/ChildReport";
          router.push({
            pathname: path,
            params: { childId: data.childId, childName: data.childName || "" },
          });
        }
        break;
      case NOTIFICATION_TYPES.ASSESSMENT_SUBMITTED:
        if (data?.childId) {
          router.push({
            pathname: "/specialist/Dashboard",
            params: { childId: data.childId, childName: data.childName || "" },
          });
        }
        break;
      case NOTIFICATION_TYPES.ACTIVITY_REMINDER:
        router.push("/child/ChildModeSplash");
        break;
    }
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.PRIMARY} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerGradient}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>الإشعارات</Text>

            <TouchableOpacity
              style={styles.markAllBtn}
              onPress={handleMarkAll}
            >
              <Text style={styles.markAllText}>تحديد الكل كمقروء</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.PRIMARY]}
                tintColor={COLORS.PRIMARY}
              />
            }
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyBox}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="notifications-outline" size={42} color={COLORS.PRIMARY} />
                </View>
                <Text style={styles.emptyTitle}>لا توجد إشعارات</Text>
                <Text style={styles.emptyText}>ستظهر إشعاراتك هنا عند توفرها</Text>
              </View>
            ) : (
              notifications.map((notif) => {
                const v = getNotifVisuals(notif.type);
                const unread = !notif.read;
                return (
                  <TouchableOpacity
                    key={notif.id}
                    style={[styles.notifCard, unread && styles.notifCardUnread]}
                    onPress={() => handleNotifPress(notif)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.notifIcon, { backgroundColor: v.bg }]}>
                      <Ionicons name={v.icon} size={22} color={v.color} />
                    </View>
                    <View style={styles.notifContent}>
                      <View style={styles.notifTopRow}>
                        <Text style={styles.notifTitle} numberOfLines={1}>
                          {notif.title || ""}
                        </Text>
                        <Text style={styles.notifTime}>
                          {formatTime(notif.createdAt)}
                        </Text>
                      </View>
                      <Text style={styles.notifBody} numberOfLines={2}>
                        {notif.body || ""}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}

            <View style={{ height: 30 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },

  headerGradient: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
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
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  markAllBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  markAllText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },

  emptyBox: {
    paddingVertical: 60,
    alignItems: "center",
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.TEXT,
  },
  emptyText: { fontSize: 13, color: COLORS.MUTED },

  notifCard: {
    flexDirection: "row-reverse",
    backgroundColor: COLORS.CARD_BG,
    borderRadius: 18,
    padding: 14,
    gap: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: "center",
  },
  notifCardUnread: {
    borderRightWidth: 3,
    borderRightColor: COLORS.PRIMARY,
    backgroundColor: COLORS.PRIMARY_LIGHT + "33",
  },
  notifIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  notifContent: { flex: 1 },
  notifTopRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  notifTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.TEXT,
    textAlign: "right",
  },
  notifTime: {
    fontSize: 11,
    color: COLORS.MUTED,
    marginRight: 8,
  },
  notifBody: {
    fontSize: 12,
    color: COLORS.MUTED,
    textAlign: "right",
    lineHeight: 18,
  },
});

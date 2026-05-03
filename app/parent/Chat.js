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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { auth } from "../../FirebaseConfig";
import { getChildrenByParentEmail } from "../../Services/ChildrenService";
import {
  getOrCreateChat,
  subscribeToParentChats,
} from "../../Services/ChatService";
import { getCurrentUser } from "../../Services/UserService";
import BottomNavBar from "../../components/BottomNavBar";
import { COLORS } from "../../constants/theme";

const PRIMARY = COLORS.PRIMARY;
const PRIMARY_DARK = COLORS.PRIMARY_DARK;
const PRIMARY_LIGHT = COLORS.PRIMARY_LIGHT;
const BG = COLORS.BG;
const CARD = COLORS.CARD_BG;
const TEXT = COLORS.TEXT;
const MUTED = COLORS.MUTED;

const formatChatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate?.() || new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return "الآن";
  if (diffMin < 60) return `${diffMin} د`;
  if (diffHours < 24) {
    return date.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  if (diffDays === 1) return "أمس";
  if (diffDays < 7) return `${diffDays} أيام`;
  return date.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
  });
};

export default function ParentChat() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let unsubscribe = null;

      const init = async () => {
        try {
          // 1. Get parent's user data
          const userData = await getCurrentUser();
          setUser(userData);

          // 2. Get all children of this parent (by email)
          const children = await getChildrenByParentEmail();

          // 3. Ensure a chat exists for each child that has specialistId
          await Promise.all(
            children
              .filter((child) => child.specialistId && child.parentId)
              .map((child) =>
                getOrCreateChat({
                  childId: child.id,
                  childName: child.name,
                  parentId: child.parentId,
                  parentName: userData?.name || "",
                  specialistId: child.specialistId,
                  specialistName: "",
                })
              )
          );

          // 4. Subscribe to real-time chat list
          unsubscribe = subscribeToParentChats((next) => {
            setChats(next);
            setLoading(false);
            setRefreshing(false);
          });
        } catch (error) {
          console.error("Error loading parent chats:", error);
          setLoading(false);
          setRefreshing(false);
        }
      };

      init();

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, [])
  );

  const handleChatPress = (chat) => {
    router.push({
      pathname: "/parent/ChatRoom",
      params: {
        chatId: chat.id,
        childName: chat.childName,
        specialistName: chat.specialistName,
      },
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  if (loading) {
    return (
      <View style={[styles.screen, styles.centerLoading]}>
        <ActivityIndicator size="large" color={PRIMARY} />
        <Text style={styles.loadingText}>جاري تحميل المحادثات...</Text>
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
              </TouchableOpacity>

              <View style={styles.headerCenter}>
                <Text style={styles.headerTitle}>المحادثات</Text>
                <Text style={styles.headerSub}>تواصلي مع الأخصائي</Text>
              </View>

              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color={PRIMARY_DARK} />
              </View>
            </View>
          </View>

          {/* ─── CHATS LIST ─── */}
          {chats.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconBox}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={42}
                  color={PRIMARY_DARK}
                />
              </View>
              <Text style={styles.emptyTitle}>لا توجد محادثات بعد</Text>
              <Text style={styles.emptySubtitle}>
                ستظهر هنا عند إضافة الأخصائي لطفلك.
              </Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {chats.map((chat) => (
                <TouchableOpacity
                  key={chat.id}
                  style={styles.chatItem}
                  onPress={() => handleChatPress(chat)}
                  activeOpacity={0.7}
                >
                  <View style={styles.chatAvatar}>
                    <MaterialCommunityIcons
                      name="doctor"
                      size={26}
                      color={PRIMARY_DARK}
                    />
                  </View>

                  <View style={styles.chatBody}>
                    <View style={styles.chatTopRow}>
                      <Text style={styles.chatTime}>
                        {formatChatTime(chat.updatedAt)}
                      </Text>
                      <Text style={styles.chatTitle} numberOfLines={1}>
                        {chat.specialistName || "الأخصائي"}
                      </Text>
                    </View>
                    <Text style={styles.chatMeta} numberOfLines={1}>
                      الطفل: {chat.childName || "—"}
                    </Text>
                    <Text style={styles.chatPreview} numberOfLines={1}>
                      {chat.lastMessage
                        ? chat.lastMessageSender === "parent"
                          ? `أنتِ: ${chat.lastMessage}`
                          : chat.lastMessage
                        : "ابدئي المحادثة الآن"}
                    </Text>
                  </View>

                  <Ionicons name="chevron-back" size={18} color={MUTED} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 110 }} />
        </ScrollView>

        <BottomNavBar />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  centerLoading: { justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: { color: MUTED, fontSize: 13 },

  headerGradient: {
    backgroundColor: PRIMARY,
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
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff" },
  headerSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.95)",
    marginTop: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 10,
  },
  chatItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: CARD,
    padding: 14,
    borderRadius: 18,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chatAvatar: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  chatBody: { flex: 1 },
  chatTopRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: TEXT,
    textAlign: "right",
  },
  chatTime: {
    fontSize: 10,
    color: MUTED,
    marginLeft: 8,
  },
  chatMeta: {
    fontSize: 11,
    color: PRIMARY_DARK,
    marginTop: 2,
    textAlign: "right",
  },
  chatPreview: {
    fontSize: 12,
    color: MUTED,
    marginTop: 4,
    textAlign: "right",
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
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
});

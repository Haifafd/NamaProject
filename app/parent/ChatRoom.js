import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { auth } from "../../FirebaseConfig";
import { sendMessage, subscribeToMessages } from "../../Services/ChatService";
import { COLORS } from "../../constants/theme";

const PRIMARY = COLORS.PRIMARY;
const PRIMARY_DARK = COLORS.PRIMARY_DARK;
const PRIMARY_LIGHT = COLORS.PRIMARY_LIGHT;
const BG = COLORS.BG;
const CARD = COLORS.CARD_BG;
const TEXT = COLORS.TEXT;
const MUTED = COLORS.MUTED;
const BORDER_GRAY = COLORS.BORDER_GRAY;

const formatMessageTime = (timestamp) => {
  if (!timestamp) return "";
  const date = timestamp.toDate?.() || new Date(timestamp);
  return date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function ParentChatRoom() {
  const router = useRouter();
  const { chatId, childName, specialistName } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  const currentUserId = auth.currentUser?.uid;

  useEffect(() => {
    if (!chatId) {
      setLoading(false);
      return;
    }
    const unsubscribe = subscribeToMessages(chatId, (msgs) => {
      setMessages(msgs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    const text = inputText.trim();
    setInputText("");
    setSending(true);
    try {
      await sendMessage(chatId, text, "parent");
    } catch (error) {
      Alert.alert("خطأ", "لم نتمكن من إرسال الرسالة");
      setInputText(text);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.senderId === currentUserId;
    return (
      <View
        style={[
          styles.messageRow,
          isOwn ? styles.myMessageRow : styles.theirMessageRow,
        ]}
      >
        <View
          style={[styles.bubble, isOwn ? styles.myBubble : styles.theirBubble]}
        >
          <Text style={isOwn ? styles.myText : styles.theirText}>
            {item.text}
          </Text>
        </View>
        <Text
          style={[
            styles.timeText,
            isOwn ? styles.myTimeText : styles.theirTimeText,
          ]}
        >
          {formatMessageTime(item.createdAt)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={PRIMARY} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* ─── HEADER ─── */}
          <View style={styles.header}>
            <View style={styles.decorCircle} />
            <View style={styles.headerInner}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-forward" size={22} color="#fff" />
              </TouchableOpacity>

              <View style={styles.headerCenter}>
                <View style={styles.headerAvatar}>
                  <MaterialCommunityIcons
                    name="doctor"
                    size={20}
                    color={PRIMARY_DARK}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.headerTitle} numberOfLines={1}>
                    {specialistName || "الأخصائي"}
                  </Text>
                  <Text style={styles.headerSub} numberOfLines={1}>
                    طفلي: {childName || "—"}
                  </Text>
                </View>
              </View>

              <View style={{ width: 38 }} />
            </View>
          </View>

          {/* ─── MESSAGES (tap-to-dismiss keyboard) ─── */}
          {loading ? (
            <View style={styles.centerLoading}>
              <ActivityIndicator size="large" color={PRIMARY} />
            </View>
          ) : messages.length === 0 ? (
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
            >
              <View style={styles.emptyMessages}>
                <View style={styles.emptyIconBox}>
                  <Ionicons
                    name="chatbubbles-outline"
                    size={36}
                    color={PRIMARY_DARK}
                  />
                </View>
                <Text style={styles.emptyTitle}>ابدئي المحادثة</Text>
                <Text style={styles.emptySubtitle}>
                  اكتبي أول رسالة للأخصائي للبدء.
                </Text>
              </View>
            </TouchableWithoutFeedback>
          ) : (
            <TouchableWithoutFeedback
              onPress={Keyboard.dismiss}
              accessible={false}
            >
              <View style={{ flex: 1 }}>
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  keyExtractor={(item) => item.id}
                  renderItem={renderMessage}
                  contentContainerStyle={styles.messagesList}
                  onContentSizeChange={() =>
                    flatListRef.current?.scrollToEnd({ animated: true })
                  }
                  onLayout={() =>
                    flatListRef.current?.scrollToEnd({ animated: false })
                  }
                  keyboardShouldPersistTaps="handled"
                />
              </View>
            </TouchableWithoutFeedback>
          )}

          {/* ─── INPUT BAR ─── */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="اكتب رسالة..."
              placeholderTextColor={MUTED}
              value={inputText}
              onChangeText={setInputText}
              textAlign="right"
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!inputText.trim() || sending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
              activeOpacity={0.7}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  centerLoading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 10 : 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    position: "relative",
  },
  decorCircle: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  headerInner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 1,
    gap: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    textAlign: "right",
  },
  headerSub: {
    fontSize: 11,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
    textAlign: "right",
  },

  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },

  emptyMessages: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    gap: 6,
  },
  emptyIconBox: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 12,
    color: MUTED,
    textAlign: "center",
  },

  messageRow: {
    width: "100%",
    marginVertical: 4,
  },
  myMessageRow: { alignItems: "flex-start" },
  theirMessageRow: { alignItems: "flex-end" },

  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myBubble: {
    backgroundColor: PRIMARY,
    borderBottomLeftRadius: 4,
  },
  theirBubble: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#EEF2FF",
    borderBottomRightRadius: 4,
  },
  myText: { color: "#fff", fontSize: 14, lineHeight: 20 },
  theirText: { color: TEXT, fontSize: 14, lineHeight: 20, textAlign: "right" },

  timeText: { fontSize: 10, color: MUTED, marginTop: 3 },
  myTimeText: { textAlign: "left", marginLeft: 6 },
  theirTimeText: { textAlign: "right", marginRight: 6 },

  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    backgroundColor: COLORS.WHITE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: Platform.OS === "ios" ? 8 : 12,
    borderTopWidth: 1,
    borderTopColor: BORDER_GRAY,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: BG,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: TEXT,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY_DARK,
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: MUTED,
    opacity: 0.5,
  },
});

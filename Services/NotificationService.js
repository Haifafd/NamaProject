import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "../FirebaseConfig";

// ─── Notification Handler — مع صوت دائماً ───
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ─── أنواع الإشعارات ───
export const NOTIFICATION_TYPES = {
  CHAT_MESSAGE: "chat_message",
  REPORT_ISSUED: "report_issued",
  ASSESSMENT_SUBMITTED: "assessment_submitted",
  TREATMENT_PLAN: "treatment_plan",
  ACTIVITY_REMINDER: "activity_reminder",
};

// ─── طلب الإذن + Android Channel بصوت ───
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    try {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#79ccf8",
        sound: "default",
      });
    } catch (e) {
      console.log("Android channel error:", e.message);
    }
  }

  if (!Device.isDevice) return null;

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") return null;

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (projectId) {
        const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
        return tokenData.data;
      }
    } catch (e) {
      console.log("ℹ️ Push token غير متاح في Expo Go (طبيعي)");
    }
  } catch (error) {
    console.log("Permission error:", error.message);
  }

  return null;
}

// ─── إنشاء إشعار في Firestore ───
export const createNotification = async ({ userId, type, title, body, data = {} }) => {
  if (!userId || !type) return null;
  try {
    const docRef = await addDoc(collection(db, "Notifications"), {
      userId,
      type,
      title,
      body,
      data,
      read: false,
      createdAt: serverTimestamp(),
    });
    console.log("✅ Notification created:", title);
    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// ─── إشعار محلي فوري (للتجارب أو التنبيهات الفورية للمستخدم نفسه) ───
export const fireLocalNotification = async ({ title, body, data = {} }) => {
  try {
    if (!Device.isDevice) return;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: "default",
      },
      trigger: null,
    });
  } catch (error) {
    console.error("Local notification error:", error);
  }
};

// ─── الاشتراك في إشعاراتي real-time ───
export const subscribeToMyNotifications = (callback) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return () => {};

  const q = query(
    collection(db, "Notifications"),
    where("userId", "==", currentUser.uid)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const notifs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      notifs.sort((a, b) => {
        const tA = a.createdAt?.toMillis?.() || 0;
        const tB = b.createdAt?.toMillis?.() || 0;
        return tB - tA;
      });
      callback(notifs);
    },
    (error) => console.error("Notifications subscription error:", error)
  );
};

// ─── عداد غير المقروء real-time ───
export const subscribeToUnreadCount = (callback) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return () => {};

  const q = query(
    collection(db, "Notifications"),
    where("userId", "==", currentUser.uid),
    where("read", "==", false)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.size);
    },
    (error) => {
      console.error("Unread count error:", error);
      callback(0);
    }
  );
};

// ─── الاشتراك في الإشعارات الجديدة فقط (لتشغيل صوت + إشعار محلي) ───
export const subscribeToNewNotifications = (onNew) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return () => {};

  let isFirstSnapshot = true;
  const seenIds = new Set();

  const q = query(
    collection(db, "Notifications"),
    where("userId", "==", currentUser.uid)
  );

  return onSnapshot(q, (snapshot) => {
    if (isFirstSnapshot) {
      snapshot.docs.forEach((d) => seenIds.add(d.id));
      isFirstSnapshot = false;
      return;
    }

    snapshot.docChanges().forEach((change) => {
      if (change.type === "added" && !seenIds.has(change.doc.id)) {
        seenIds.add(change.doc.id);
        const notif = { id: change.doc.id, ...change.doc.data() };
        onNew(notif);
      }
    });
  });
};

// ─── تحديد إشعار كمقروء ───
export const markAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, "Notifications", notificationId), { read: true });
  } catch (error) {
    console.error("Error marking as read:", error);
  }
};

// ─── تحديد كل الإشعارات كمقروءة ───
export const markAllAsRead = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const q = query(
      collection(db, "Notifications"),
      where("userId", "==", currentUser.uid),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return;

    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => batch.update(d.ref, { read: true }));
    await batch.commit();
  } catch (error) {
    console.error("Error marking all as read:", error);
  }
};

// ─── جدولة تذكير يومي 5 العصر بصوت ───
export const scheduleDailyActivityReminder = async () => {
  try {
    if (!Device.isDevice) return null;

    await cancelDailyActivityReminder();

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") return null;
    }

    const id = await Notifications.scheduleNotificationAsync({
      identifier: "daily-activity-reminder",
      content: {
        title: "🌸 وقت اللعب مع نماء!",
        body: "حان وقت أنشطة طفلك اليومية، شجعيه يكمل رحلته 🌟",
        data: { type: NOTIFICATION_TYPES.ACTIVITY_REMINDER },
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 17,
        minute: 0,
      },
    });

    console.log("✅ Daily reminder scheduled at 5 PM");
    return id;
  } catch (error) {
    console.error("Error scheduling reminder:", error);
    return null;
  }
};

// ─── إلغاء التذكير اليومي ───
export const cancelDailyActivityReminder = async () => {
  try {
    await Notifications.cancelScheduledNotificationAsync("daily-activity-reminder");
  } catch (error) {
    // مو موجود، عادي
  }
};

// ─── 🧪 إشعار تجريبي بعد 10 ثواني (للاختبار في Expo Go) ───
export const scheduleTestReminder = async () => {
  try {
    if (!Device.isDevice) return null;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const { status: newStatus } = await Notifications.requestPermissionsAsync();
      if (newStatus !== "granted") return null;
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🌸 اختبار - وقت اللعب!",
        body: "هذا إشعار تجريبي بصوت بعد 10 ثواني",
        data: { type: NOTIFICATION_TYPES.ACTIVITY_REMINDER },
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 10,
        repeats: false,
      },
    });

    console.log("✅ Test notification scheduled in 10s");
    return id;
  } catch (error) {
    console.error("Error scheduling test:", error);
    return null;
  }
};

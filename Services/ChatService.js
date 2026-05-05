import {
  collection,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../FirebaseConfig";
import { createNotification, NOTIFICATION_TYPES } from "./NotificationService";

// ─────────────────────────────────────────────
// 🔑 Find or create chat for a child
// Returns the chat document with id
// ─────────────────────────────────────────────
export const getOrCreateChat = async ({
  childId,
  childName,
  parentId,
  parentName = "",
  specialistId,
  specialistName = "",
}) => {
  try {
    if (!childId || !parentId || !specialistId) {
      console.warn("Missing required fields for chat creation");
      return null;
    }

    // Check if chat exists for this child
    const q = query(
      collection(db, "Chats"),
      where("childId", "==", childId)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() };
    }

    // Create new chat
    const newChat = {
      childId,
      childName: childName || "",
      parentId,
      parentName: parentName || "",
      specialistId,
      specialistName: specialistName || "",
      lastMessage: "",
      lastMessageSender: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "Chats"), newChat);
    return { id: docRef.id, ...newChat };
  } catch (error) {
    console.error("Error getting/creating chat:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// 📋 Get all chats for current specialist
// ─────────────────────────────────────────────
export const getSpecialistChats = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    const q = query(
      collection(db, "Chats"),
      where("specialistId", "==", currentUser.uid)
    );

    const snapshot = await getDocs(q);
    const chats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    chats.sort((a, b) => {
      const timeA = a.updatedAt?.toMillis?.() || 0;
      const timeB = b.updatedAt?.toMillis?.() || 0;
      return timeB - timeA;
    });

    return chats;
  } catch (error) {
    console.error("Error getting specialist chats:", error);
    return [];
  }
};

// ─────────────────────────────────────────────
// 📋 Get all chats for current parent
// ─────────────────────────────────────────────
export const getParentChats = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    const q = query(
      collection(db, "Chats"),
      where("parentId", "==", currentUser.uid)
    );

    const snapshot = await getDocs(q);
    const chats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    chats.sort((a, b) => {
      const timeA = a.updatedAt?.toMillis?.() || 0;
      const timeB = b.updatedAt?.toMillis?.() || 0;
      return timeB - timeA;
    });

    return chats;
  } catch (error) {
    console.error("Error getting parent chats:", error);
    return [];
  }
};

// ─────────────────────────────────────────────
// 🔴 Subscribe to messages in real-time
// Returns unsubscribe function - call it on cleanup
// ─────────────────────────────────────────────
export const subscribeToMessages = (chatId, callback) => {
  if (!chatId) {
    console.warn("subscribeToMessages: missing chatId");
    return () => {};
  }

  const q = query(
    collection(db, "Chats", chatId, "Messages"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    },
    (error) => {
      console.error("Error in messages subscription:", error);
    }
  );
};

// ─────────────────────────────────────────────
// ✉️ Send a message
// Adds to subcollection AND updates chat's lastMessage
// ─────────────────────────────────────────────
export const sendMessage = async (chatId, text, senderRole) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || !text.trim() || !chatId) return;

    const trimmedText = text.trim();

    await addDoc(collection(db, "Chats", chatId, "Messages"), {
      text: trimmedText,
      senderId: currentUser.uid,
      senderRole: senderRole,
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "Chats", chatId), {
      lastMessage: trimmedText,
      lastMessageSender: senderRole,
      updatedAt: serverTimestamp(),
    });

    // 🔔 إشعار للطرف المستقبل
    try {
      const chatSnap = await getDoc(doc(db, "Chats", chatId));
      if (chatSnap.exists()) {
        const chat = chatSnap.data();
        const recipientId =
          senderRole === "parent" ? chat.specialistId : chat.parentId;
        const senderName =
          senderRole === "parent"
            ? chat.parentName || "ولي الأمر"
            : chat.specialistName || "الأخصائي";

        if (recipientId) {
          await createNotification({
            userId: recipientId,
            type: NOTIFICATION_TYPES.CHAT_MESSAGE,
            title: `رسالة جديدة من ${senderName}`,
            body:
              trimmedText.length > 60
                ? trimmedText.slice(0, 60) + "…"
                : trimmedText,
            data: { chatId, childName: chat.childName || "", senderRole },
          });
        }
      }
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// 🔴 Subscribe to chats list in real-time (specialist)
// ─────────────────────────────────────────────
export const subscribeToSpecialistChats = (callback) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return () => {};

  const q = query(
    collection(db, "Chats"),
    where("specialistId", "==", currentUser.uid)
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    chats.sort((a, b) => {
      const timeA = a.updatedAt?.toMillis?.() || 0;
      const timeB = b.updatedAt?.toMillis?.() || 0;
      return timeB - timeA;
    });
    callback(chats);
  });
};

// ─────────────────────────────────────────────
// 🔴 Subscribe to chats list for parent
// ─────────────────────────────────────────────
export const subscribeToParentChats = (callback) => {
  const currentUser = auth.currentUser;
  if (!currentUser) return () => {};

  const q = query(
    collection(db, "Chats"),
    where("parentId", "==", currentUser.uid)
  );

  return onSnapshot(q, (snapshot) => {
    const chats = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    chats.sort((a, b) => {
      const timeA = a.updatedAt?.toMillis?.() || 0;
      const timeB = b.updatedAt?.toMillis?.() || 0;
      return timeB - timeA;
    });
    callback(chats);
  });
};

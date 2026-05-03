import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../FirebaseConfig";

// ─────────────────────────────────────────────
// 👤 جلب بيانات المستخدم الحالي (الأخصائي)
// ─────────────────────────────────────────────
export const getCurrentUser = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
    if (!userDoc.exists()) return null;

    return {
      id: userDoc.id,
      ...userDoc.data(),
    };
  } catch (error) {
    console.error("Error fetching current user:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// 👤 جلب بيانات مستخدم معين بالـ ID
// ─────────────────────────────────────────────
export const getUserById = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "Users", userId));
    if (!userDoc.exists()) return null;

    return {
      id: userDoc.id,
      ...userDoc.data(),
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// 🔔 Get user's notification preferences
// ─────────────────────────────────────────────
export const getNotificationPreferences = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const userDoc = await getDoc(doc(db, "Users", currentUser.uid));
    if (!userDoc.exists()) return null;

    const data = userDoc.data();
    return (
      data.preferences || {
        pushNotifications: true,
        emailNotifications: true,
        reportAlerts: true,
      }
    );
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return null;
  }
};

// ─────────────────────────────────────────────
// 🔔 Update one notification preference
// ─────────────────────────────────────────────
export const updateNotificationPreference = async (key, value) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    await updateDoc(doc(db, "Users", currentUser.uid), {
      [`preferences.${key}`]: value,
    });
  } catch (error) {
    console.error("Error updating preference:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// 👤 Update user profile (name and/or email)
// ─────────────────────────────────────────────
export const updateUserProfile = async (updates) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");

    await updateDoc(doc(db, "Users", currentUser.uid), updates);
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};
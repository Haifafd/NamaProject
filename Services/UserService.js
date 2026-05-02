import { doc, getDoc } from "firebase/firestore";
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
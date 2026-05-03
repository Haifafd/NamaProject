import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../FirebaseConfig";

// ─────────────────────────────────────────────
// 🧒 جلب كل أطفال الأخصائي الحالي
// ─────────────────────────────────────────────
export const getMyChildren = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return [];

    const q = query(
      collection(db, "Children"),
      where("specialistId", "==", currentUser.uid)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching children:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// 🧒 جلب طفل معين بالـ ID
// ─────────────────────────────────────────────
export const getChildById = async (childId) => {
  try {
    const childDoc = await getDoc(doc(db, "Children", childId));
    if (!childDoc.exists()) return null;

    return {
      id: childDoc.id,
      ...childDoc.data(),
    };
  } catch (error) {
    console.error("Error fetching child:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// 🎂 حساب العمر من تاريخ الميلاد
// ─────────────────────────────────────────────
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;

  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
};

// ─────────────────────────────────────────────
// 📊 جلب نسبة تطور طفل (من ProgressReports)
// ─────────────────────────────────────────────
export const getChildProgress = async (childId) => {
  try {
    const q = query(
      collection(db, "ProgressReports"),
      where("childId", "==", childId)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    // ناخذ آخر تقرير
    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // ترتيب حسب التاريخ (الأحدث أولاً)
    reports.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB - dateA;
    });

    return reports[0]?.progressPercentage || 0;
  } catch (error) {
    console.error("Error fetching progress:", error);
    return null;
  }
};

// ─────────────────────────────────────────────
// 📊 جلب الأطفال مع نسبة تطورهم
// ─────────────────────────────────────────────
export const getMyChildrenWithProgress = async () => {
  try {
    const children = await getMyChildren();

    const childrenWithProgress = await Promise.all(
      children.map(async (child) => {
        const progress = await getChildProgress(child.id);
        return {
          ...child,
          age: calculateAge(child.birthDate),
          progress: progress,
        };
      })
    );

    return childrenWithProgress;
  } catch (error) {
    console.error("Error fetching children with progress:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// 📈 حساب متوسط التطور لكل الأطفال
// ─────────────────────────────────────────────
export const calculateAverageProgress = (children) => {
  const childrenWithProgress = children.filter(
    (c) => c.progress !== null && c.progress !== undefined
  );
  if (childrenWithProgress.length === 0) return null;

  const sum = childrenWithProgress.reduce(
    (total, c) => total + c.progress,
    0
  );
  return Math.round(sum / childrenWithProgress.length);
};

// ─────────────────────────────────────────────
// ⚠️ جلب الأطفال اللي يحتاجون مراجعة (نسبة < 50%)
// ─────────────────────────────────────────────
export const getChildrenNeedingReview = (children) => {
  return children.filter(
    (c) => c.progress !== null && c.progress !== undefined && c.progress < 50
  );
};

// ─────────────────────────────────────────────
// 👨‍👩 Get all children linked to current parent's email
// Used in parent home page to show their children
// ─────────────────────────────────────────────
export const getChildrenByParentEmail = async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser?.email) return [];

    const q = query(
      collection(db, "Children"),
      where("parentEmail", "==", currentUser.email)
    );

    const snapshot = await getDocs(q);
    const children = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Add age and progress to each child
    const childrenWithDetails = await Promise.all(
      children.map(async (child) => {
        const progress = await getChildProgress(child.id);
        return {
          ...child,
          age: calculateAge(child.birthDate),
          progress: progress,
        };
      })
    );

    return childrenWithDetails;
  } catch (error) {
    console.error("Error fetching children by parent email:", error);
    throw error;
  }
};
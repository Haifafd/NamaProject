import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";
import { saveActivityProgress } from "./ProgressService";

// ─────────────────────────────────────────────
// أنواع الأنشطة (نفس IDs الموجودة في Firebase)
// ─────────────────────────────────────────────
export const CATEGORIES = {
  MEMORY: "memoryCategoryID",
  FOCUS: "focusCategoryID",
  THINKING: "thinkingCategoryID",
  PERCEPTION: "perceptionCategoryID",
};

// معلومات العرض لكل نوع (الاسم + اللون + الأيقونة)
export const CATEGORY_INFO = {
  memoryCategoryID: {
    name: "الذاكرة",
    color: "#9C27B0",        // بنفسجي
    lightColor: "#F3E5F5",
    icon: "bulb",
  },
  focusCategoryID: {
    name: "التركيز والانتباه",
    color: "#FFC107",        // أصفر
    lightColor: "#FFF8E1",
    icon: "eye",
  },
  thinkingCategoryID: {
    name: "التفكير وحل المشكلات",
    color: "#2196F3",        // أزرق
    lightColor: "#E3F2FD",
    icon: "extension-puzzle",
  },
  perceptionCategoryID: {
    name: "الإدراك البصري",
    color: "#F44336",        // أحمر
    lightColor: "#FFEBEE",
    icon: "scan",
  },
};

// ─────────────────────────────────────────────
// 📥 جلب كل الأنشطة من Firestore
// ─────────────────────────────────────────────
export const getAllActivities = async () => {
  try {
    const snapshot = await getDocs(collection(db, "Activities"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching activities:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// 📥 جلب الأنشطة حسب النوع (للفلترة)
// ─────────────────────────────────────────────
export const getActivitiesByCategory = async (categoryId) => {
  try {
    const q = query(
      collection(db, "Activities"),
      where("categoryId", "==", categoryId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching activities by category:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// 📥 جلب أنشطة محددة بالـ IDs (للطفل)
// ─────────────────────────────────────────────
export const getActivitiesByIds = async (activityIds) => {
  try {
    if (!activityIds || activityIds.length === 0) return [];

    const promises = activityIds.map((id) =>
      getDoc(doc(db, "Activities", id))
    );
    const docs = await Promise.all(promises);

    return docs
      .filter((d) => d.exists())
      .map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching activities by ids:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// 💾 حفظ خطة علاجية جديدة
// ─────────────────────────────────────────────
export const saveTherapeuticPlan = async (planData) => {
  try {
    const docRef = await addDoc(collection(db, "TherapeuticPlan"), {
      ...planData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving plan:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// 🔄 تحديث خطة موجودة
// ─────────────────────────────────────────────
export const updateTherapeuticPlan = async (planId, updates) => {
  try {
    await updateDoc(doc(db, "TherapeuticPlan", planId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// 📥 جلب خطة طفل معين
// ─────────────────────────────────────────────
export const getChildPlan = async (childId) => {
  try {
    const q = query(
      collection(db, "TherapeuticPlan"),
      where("childId", "==", childId)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const planDoc = snapshot.docs[0];
    return { id: planDoc.id, ...planDoc.data() };
  } catch (error) {
    console.error("Error fetching child plan:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// 🎯 UNIFIED Activity Result Saver
// ─────────────────────────────────────────────
export const saveActivityResult = async ({
  childId,
  activityId,
  activityTitle,
  category,
  level = 1,
  correctAnswers = 0,
  wrongAnswers = 0,
  totalAttempts = 0,
  reactionTime = 0,
  durationSec = 0,
}) => {
  if (!childId || !activityId) {
    console.error("Missing childId or activityId");
    return null;
  }

  try {
    const total = correctAnswers + wrongAnswers;
    const accuracy = total > 0 ? Math.round((correctAnswers / total) * 100) : 0;

    let stars = 1;
    if (accuracy >= 80) stars = 3;
    else if (accuracy >= 50) stars = 2;

    await addDoc(collection(db, "ActivityResults"), {
      childId,
      activityId,
      activityTitle: activityTitle || "",
      category: category || "",
      level,
      correctAnswers,
      wrongAnswers,
      totalAttempts,
      reactionTime,
      durationSec,
      accuracy,
      stars,
      completedAt: serverTimestamp(),
    });

    await saveActivityProgress({
      childId,
      activityId,
      stars,
      score: accuracy,
    });

    return { stars, accuracy };
  } catch (error) {
    console.error("Error saving activity result:", error);
    return null;
  }
};
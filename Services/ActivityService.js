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
import { createNotification, NOTIFICATION_TYPES } from "./NotificationService";

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

    // 🔔 إشعار لولي الأمر
    try {
      if (planData.childId) {
        const childSnap = await getDoc(doc(db, "Children", planData.childId));
        if (childSnap.exists()) {
          const parentId = childSnap.data().parentId;
          const childName = childSnap.data().name || "";
          if (parentId) {
            await createNotification({
              userId: parentId,
              type: NOTIFICATION_TYPES.TREATMENT_PLAN,
              title: "🌱 خطة علاجية جديدة",
              body: `تم إعداد خطة علاجية للطفل ${childName}`,
              data: { childId: planData.childId, childName },
            });
          }
        }
      }
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

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

    // 🔔 إشعار لولي الأمر
    try {
      let childId = updates.childId;
      if (!childId) {
        const planSnap = await getDoc(doc(db, "TherapeuticPlan", planId));
        if (planSnap.exists()) childId = planSnap.data().childId;
      }
      if (childId) {
        const childSnap = await getDoc(doc(db, "Children", childId));
        if (childSnap.exists()) {
          const parentId = childSnap.data().parentId;
          const childName = childSnap.data().name || "";
          if (parentId) {
            await createNotification({
              userId: parentId,
              type: NOTIFICATION_TYPES.TREATMENT_PLAN,
              title: "🔄 تحديث الخطة العلاجية",
              body: `تم تحديث خطة الطفل ${childName}`,
              data: { childId, childName },
            });
          }
        }
      }
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }
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

    // 1-5 REVERSE rating (1 = excellent, 5 = weak) used by the reports
    let rating = 5;
    if (accuracy >= 80) rating = 1;
    else if (accuracy >= 65) rating = 2;
    else if (accuracy >= 50) rating = 3;
    else if (accuracy >= 35) rating = 4;

    await addDoc(collection(db, "ActivityResults"), {
      childId,
      activityId,
      activityTitle: activityTitle || "",
      category: category || "",
      categoryId: category || "",
      level,
      correctAnswers,
      wrongAnswers,
      totalAttempts,
      reactionTime,
      durationSec,
      accuracy,
      stars,
      rating,
      score: rating,
      completedAt: serverTimestamp(),
    });

    await saveActivityProgress({
      childId,
      activityId,
      stars,
      score: accuracy,
    });

    return { stars, accuracy, rating };
  } catch (error) {
    console.error("Error saving activity result:", error);
    return null;
  }
};

// ─────────────────────────────────────────────
// 📥 Get TODAY's results for a child
// ─────────────────────────────────────────────
export const getTodayActivityResults = async (childId) => {
  try {
    if (!childId) return [];

    const q = query(
      collection(db, "ActivityResults"),
      where("childId", "==", childId)
    );
    const snapshot = await getDocs(q);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    return snapshot.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((r) => {
        if (!r.completedAt) return false;
        const ms = r.completedAt.toMillis?.() || 0;
        return ms >= todayMs;
      });
  } catch (error) {
    console.error("Error fetching today's results:", error);
    return [];
  }
};

// ─────────────────────────────────────────────
// 📥 Fetch Activity Results for a child (all results, newest first)
// ─────────────────────────────────────────────
export const getActivityResults = async (childId) => {
  try {
    if (!childId) return [];

    const q = query(
      collection(db, "ActivityResults"),
      where("childId", "==", childId)
    );
    const snapshot = await getDocs(q);

    const results = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    results.sort((a, b) => {
      const aTime = a.completedAt?.toMillis?.() || 0;
      const bTime = b.completedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });

    return results;
  } catch (error) {
    console.error("Error fetching activity results:", error);
    return [];
  }
};
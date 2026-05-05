import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { auth, db } from "../FirebaseConfig";
import { createNotification, NOTIFICATION_TYPES } from "./NotificationService";

// ─────────────────────────────────────────────
// PARENT ASSESSMENT — 5 categories + notes
// ─────────────────────────────────────────────
export const PARENT_CATEGORIES = {
  "المهارات الإدراكية والأكاديمية": {
    color: "#27AE60",
    bgColor: "#D1F2EB",
    icon: "school",
    questionCount: 12,
  },
  "المهارات اللغوية": {
    color: "#2980B9",
    bgColor: "#D6EAF8",
    icon: "chatbubbles",
    questionCount: 7,
  },
  "المهارات الاجتماعية والانفعالية": {
    color: "#E67E22",
    bgColor: "#FDEBD0",
    icon: "happy",
    questionCount: 7,
  },
  "المهارات الحركية": {
    color: "#F1C40F",
    bgColor: "#FEF9E7",
    icon: "walk",
    questionCount: 12,
  },
  "الاعتماد على النفس أو الاستقلالية": {
    color: "#8E44AD",
    bgColor: "#F5EEF8",
    icon: "person",
    questionCount: 9,
  },
};

// ─────────────────────────────────────────────
// SPECIALIST ASSESSMENT — 7 categories + notes
// ─────────────────────────────────────────────
export const SPECIALIST_CATEGORIES = {
  "المهارات الإدراكية والأكاديمية": { color: "#27AE60", bgColor: "#C6F0D0", icon: "school" },
  "الانتباه والتركيز": { color: "#F39C12", bgColor: "#FEFACC", icon: "eye" },
  "الذاكرة والإدراك": { color: "#3498DB", bgColor: "#D6EAF8", icon: "library" },
  "المعرفة العامة": { color: "#9B59B6", bgColor: "#E8DAEF", icon: "book" },
  "المهارات الأكاديمية": { color: "#E74C3C", bgColor: "#FADBD8", icon: "create" },
  "المهارات البصرية والحركية": { color: "#E67E22", bgColor: "#FDEBD0", icon: "shapes" },
  "حل المشكلات": { color: "#16A085", bgColor: "#D1F2EB", icon: "bulb" },
};

// Map specialist text answers to numeric scores
export const SPECIALIST_SCORE_MAP = {
  "أبدا": 0,
  "احيانا": 1,
  "غالبا": 2,
  "دائما": 3,
};

// ─────────────────────────────────────────────
// SAVE PARENT ASSESSMENT (linked to childId)
// ─────────────────────────────────────────────
export const saveParentAssessment = async ({
  childId,
  childName,
  answers,
  notes,
  questionCategoryMap,
}) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");
    if (!childId) throw new Error("childId is required");

    const categoryScores = calculateParentCategoryScores(
      answers,
      questionCategoryMap
    );

    let totalPoints = 0;
    let maxPoints = 0;
    Object.values(categoryScores).forEach((cat) => {
      totalPoints += cat.score;
      maxPoints += cat.maxScore;
    });

    const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

    const result = {
      totalPoints,
      maxPoints,
      percentage: parseFloat(percentage.toFixed(1)),
      level:
        percentage >= 60
          ? "مستوى عالي"
          : percentage >= 40
            ? "مستوى متوسط"
            : "مستوى منخفض",
      categoryScores,
    };

    const docData = {
      childId,
      childName: childName || "",
      parentId: currentUser.uid,
      parentEmail: currentUser.email,
      answers,
      notes: notes || "",
      result,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "ParentAssessments"), docData);

    // 🔔 إشعار للأخصائي
    try {
      const childSnap = await getDoc(doc(db, "Children", childId));
      if (childSnap.exists()) {
        const specialistId = childSnap.data().specialistId;
        if (specialistId) {
          await createNotification({
            userId: specialistId,
            type: NOTIFICATION_TYPES.ASSESSMENT_SUBMITTED,
            title: "📋 استشارة جديدة من ولي الأمر",
            body: `تم تعبئة استشارة الطفل ${childName || ""}`,
            data: { childId, childName: childName || "" },
          });
        }
      }
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    return result;
  } catch (error) {
    console.error("Error saving parent assessment:", error);
    throw error;
  }
};

function calculateParentCategoryScores(answers, questionCategoryMap) {
  const scores = {};

  Object.keys(PARENT_CATEGORIES).forEach((catName) => {
    scores[catName] = { score: 0, maxScore: 0, percentage: 0 };
  });

  Object.entries(answers).forEach(([qId, value]) => {
    const category = questionCategoryMap[qId];
    if (category && scores[category]) {
      scores[category].score += value || 0;
      scores[category].maxScore += 3;
    }
  });

  Object.keys(scores).forEach((cat) => {
    const s = scores[cat];
    s.percentage =
      s.maxScore > 0
        ? parseFloat(((s.score / s.maxScore) * 100).toFixed(1))
        : 0;
    s.level =
      s.percentage >= 60
        ? "عالي"
        : s.percentage >= 40
          ? "متوسط"
          : "منخفض";
  });

  return scores;
}

// ─────────────────────────────────────────────
// SAVE SPECIALIST ASSESSMENT (with scoring)
// ─────────────────────────────────────────────
export const saveSpecialistAssessment = async ({
  childId,
  childName,
  answers,
  questionCategoryMap,
}) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");
    if (!childId) throw new Error("childId is required");

    const categoryScores = calculateSpecialistCategoryScores(
      answers,
      questionCategoryMap
    );

    let totalPoints = 0;
    let maxPoints = 0;
    Object.values(categoryScores).forEach((cat) => {
      totalPoints += cat.score;
      maxPoints += cat.maxScore;
    });

    const percentage = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;

    const result = {
      totalPoints,
      maxPoints,
      percentage: parseFloat(percentage.toFixed(1)),
      level:
        percentage >= 60
          ? "مستوى عالي"
          : percentage >= 40
            ? "مستوى متوسط"
            : "مستوى منخفض",
      categoryScores,
    };

    const docData = {
      childId,
      childName: childName || "",
      specialistId: currentUser.uid,
      observations: answers,
      result,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "SpecialistAssessments"), docData);

    // 🔔 إشعار لولي الأمر
    try {
      const childSnap = await getDoc(doc(db, "Children", childId));
      if (childSnap.exists()) {
        const parentId = childSnap.data().parentId;
        if (parentId) {
          await createNotification({
            userId: parentId,
            type: NOTIFICATION_TYPES.REPORT_ISSUED,
            title: "📊 تقييم جديد من الأخصائي",
            body: `صدر تقييم جديد للطفل ${childName || ""}`,
            data: { childId, childName: childName || "" },
          });
        }
      }
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    return result;
  } catch (error) {
    console.error("Error saving specialist assessment:", error);
    throw error;
  }
};

function calculateSpecialistCategoryScores(answers, questionCategoryMap) {
  const scores = {};

  Object.keys(SPECIALIST_CATEGORIES).forEach((catName) => {
    scores[catName] = { score: 0, maxScore: 0, percentage: 0 };
  });

  Object.entries(answers).forEach(([qId, textAnswer]) => {
    const category = questionCategoryMap[qId];
    if (!category || !scores[category]) return;

    const numericScore = SPECIALIST_SCORE_MAP[textAnswer];
    if (numericScore !== undefined) {
      scores[category].score += numericScore;
      scores[category].maxScore += 3;
    }
  });

  Object.keys(scores).forEach((cat) => {
    const s = scores[cat];
    s.percentage =
      s.maxScore > 0
        ? parseFloat(((s.score / s.maxScore) * 100).toFixed(1))
        : 0;
    s.level =
      s.percentage >= 60
        ? "عالي"
        : s.percentage >= 40
          ? "متوسط"
          : "منخفض";
  });

  return scores;
}

// ─────────────────────────────────────────────
// CHECK IF PARENT HAS ASSESSED THIS CHILD
// ─────────────────────────────────────────────
export const hasParentAssessedChild = async (childId) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || !childId) return false;

    const q = query(
      collection(db, "ParentAssessments"),
      where("childId", "==", childId),
      where("parentId", "==", currentUser.uid),
      limit(1)
    );

    const snap = await getDocs(q);
    return !snap.empty;
  } catch (error) {
    console.error("Error checking parent assessment:", error);
    return false;
  }
};

// ─────────────────────────────────────────────
// GET LATEST PARENT ASSESSMENT FOR A CHILD
// ─────────────────────────────────────────────
export const getLatestParentAssessment = async (childId) => {
  try {
    if (!childId) return null;

    let docs = [];
    try {
      const q = query(
        collection(db, "ParentAssessments"),
        where("childId", "==", childId),
        orderBy("createdAt", "desc"),
        limit(1)
      );
      const snap = await getDocs(q);
      docs = snap.docs;
    } catch (indexError) {
      const q = query(
        collection(db, "ParentAssessments"),
        where("childId", "==", childId)
      );
      const snap = await getDocs(q);
      docs = snap.docs
        .sort((a, b) => {
          const tA = a.data().createdAt?.toMillis?.() || 0;
          const tB = b.data().createdAt?.toMillis?.() || 0;
          return tB - tA;
        })
        .slice(0, 1);
    }

    if (docs.length === 0) return null;
    return { id: docs[0].id, ...docs[0].data() };
  } catch (error) {
    console.error("Error fetching parent assessment:", error);
    return null;
  }
};

// ─────────────────────────────────────────────
// GET ALL SPECIALIST ASSESSMENTS FOR A CHILD
// ─────────────────────────────────────────────
export const getSpecialistAssessmentsForChild = async (childId) => {
  try {
    if (!childId) return [];

    const q = query(
      collection(db, "SpecialistAssessments"),
      where("childId", "==", childId)
    );

    const snap = await getDocs(q);
    const assessments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    assessments.sort((a, b) => {
      const tA = a.createdAt?.toMillis?.() || 0;
      const tB = b.createdAt?.toMillis?.() || 0;
      return tB - tA;
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching specialist assessments:", error);
    return [];
  }
};

// ─────────────────────────────────────────────
// GET ALL PARENT ASSESSMENTS FOR A CHILD (history)
// ─────────────────────────────────────────────
export const getParentAssessmentsForChild = async (childId) => {
  try {
    if (!childId) return [];

    const q = query(
      collection(db, "ParentAssessments"),
      where("childId", "==", childId)
    );

    const snap = await getDocs(q);
    const assessments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    assessments.sort((a, b) => {
      const tA = a.createdAt?.toMillis?.() || 0;
      const tB = b.createdAt?.toMillis?.() || 0;
      return tB - tA;
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching parent assessments:", error);
    return [];
  }
};

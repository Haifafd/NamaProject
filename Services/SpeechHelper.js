// ─────────────────────────────────────────────
// 🐰 مساعد عبارات نومي
// كل العبارات الآن بصيغة محايدة تناسب الجنسين
// ─────────────────────────────────────────────
import { doc, getDoc } from "firebase/firestore";
import { db } from "../FirebaseConfig";

// كاش بسيط داخل الجلسة (محتفظ به للتوافق مع الكود الحالي)
const genderCache = {};

export const fetchChildGender = async (childId) => {
  if (!childId) return "neutral";
  if (genderCache[childId]) return genderCache[childId];

  try {
    const snap = await getDoc(doc(db, "Children", childId));
    if (snap.exists()) {
      const g = (snap.data().gender || "").toString().toLowerCase();
      const normalized =
        g === "male" || g === "ذكر" || g === "ولد" ? "male" : "female";
      genderCache[childId] = normalized;
      return normalized;
    }
  } catch (e) {
    console.log("Error fetching gender:", e.message);
  }
  return "neutral";
};

// تم توحيد كل النصوص للصيغة المحايدة، فلا حاجة للترجمة
export const speak = (text) => text;

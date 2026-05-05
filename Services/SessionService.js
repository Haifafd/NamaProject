import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";
import {
  createNotification,
  NOTIFICATION_TYPES,
} from "./NotificationService";

// ─────────────────────────────────────────────
// 🔄 SESSION SYSTEM
// Tracks when child last completed the adventure (reached treasure)
// After SESSION_RESET_HOURS → adventure sequence resets (only first unlocked)
// Before SESSION_RESET_HOURS → all stations unlocked (free play with stars showing)
// ─────────────────────────────────────────────

// Production: 24
// Quick test: 0.05 (= 3 minutes), or 0.0017 (= 6 seconds)
export const SESSION_RESET_HOURS = 24;

export const getChildSession = async (childId) => {
  try {
    if (!childId) return null;
    const ref = doc(db, "ChildSessions", childId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data();
  } catch (error) {
    console.error("Error getting child session:", error);
    return null;
  }
};

const getCompletionCount = async (childId) => {
  try {
    const session = await getChildSession(childId);
    return session?.completionCount || 0;
  } catch {
    return 0;
  }
};

export const markSessionComplete = async (childId) => {
  try {
    if (!childId) return;
    const ref = doc(db, "ChildSessions", childId);
    const count = await getCompletionCount(childId);
    await setDoc(
      ref,
      {
        childId,
        lastCompletedAt: serverTimestamp(),
        completionCount: count + 1,
      },
      { merge: true }
    );
    console.log("✅ Session marked as complete for child:", childId);

    // 🔔 إشعار "تقرير جديد" لولي الأمر + الأخصائي
    try {
      const childSnap = await getDoc(doc(db, "Children", childId));
      if (childSnap.exists()) {
        const childData = childSnap.data();
        const parentId = childData.parentId;
        const specialistId = childData.specialistId;
        const childName = childData.name || "";

        // إشعار لولي الأمر
        if (parentId) {
          await createNotification({
            userId: parentId,
            type: NOTIFICATION_TYPES.REPORT_ISSUED,
            title: `📊 تقرير ${childName} جاهز!`,
            body: `أكمل ${childName} جلسة جديدة، شوفي تقريره الآن`,
            data: { childId, childName },
          });
        }

        // إشعار للأخصائي
        if (specialistId) {
          await createNotification({
            userId: specialistId,
            type: NOTIFICATION_TYPES.REPORT_ISSUED,
            title: `📊 تقرير جديد للطفل ${childName}`,
            body: `أكمل ${childName} جلسة جديدة، تابع تطوره من اللوحة`,
            data: { childId, childName },
          });
        }
      }
    } catch (notifErr) {
      console.error("Notification error in session complete:", notifErr);
    }
  } catch (error) {
    console.error("Error marking session complete:", error);
  }
};

// Returns one of:
//   "first_time"  — never completed, only first station unlocked
//   "free_play"   — completed recently (< SESSION_RESET_HOURS), all stations unlocked
//   "fresh_round" — completed >= SESSION_RESET_HOURS ago, sequence reset
export const getSessionState = async (childId) => {
  try {
    const session = await getChildSession(childId);

    if (!session || !session.lastCompletedAt) {
      return "first_time";
    }

    const lastCompletedAt = session.lastCompletedAt.toMillis?.() || 0;
    const now = Date.now();
    const hoursSince = (now - lastCompletedAt) / (1000 * 60 * 60);

    if (hoursSince >= SESSION_RESET_HOURS) {
      return "fresh_round";
    } else {
      return "free_play";
    }
  } catch (error) {
    console.error("Error getting session state:", error);
    return "first_time";
  }
};

// Mark in session that fresh round started (timestamp used by unlock logic
// to ignore previous-round completions).
export const resetForFreshRound = async (childId, activityIds) => {
  try {
    if (!childId || !activityIds || activityIds.length === 0) return;

    const ref = doc(db, "ChildSessions", childId);
    await setDoc(
      ref,
      {
        currentRoundStartedAt: serverTimestamp(),
      },
      { merge: true }
    );

    console.log("🔄 Fresh round started for child:", childId);
  } catch (error) {
    console.error("Error resetting for fresh round:", error);
  }
};

export const getTimeUntilReset = (lastCompletedAt) => {
  if (!lastCompletedAt) return null;

  const lastMs = lastCompletedAt.toMillis?.() || 0;
  const resetMs = lastMs + SESSION_RESET_HOURS * 60 * 60 * 1000;
  const now = Date.now();
  const remainingMs = resetMs - now;

  if (remainingMs <= 0) return null;

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) return `${hours} ساعة و ${minutes} دقيقة`;
  return `${minutes} دقيقة`;
};

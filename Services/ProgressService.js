import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../FirebaseConfig";

// ─────────────────────────────────────────────
// Document path: ChildProgress/{childId}/activities/{activityId}
// Each doc: { completed, stars, bestScore, completedAt, attempts }
// ─────────────────────────────────────────────

export const getChildProgress = async (childId) => {
  if (!childId) return {};

  try {
    const colRef = collection(db, "ChildProgress", childId, "activities");
    const snapshot = await getDocs(colRef);

    const progressMap = {};
    snapshot.docs.forEach((d) => {
      progressMap[d.id] = d.data();
    });
    return progressMap;
  } catch (error) {
    console.error("Error fetching child progress:", error);
    return {};
  }
};

export const saveActivityProgress = async ({
  childId,
  activityId,
  stars,
  score,
}) => {
  if (!childId || !activityId) return;

  try {
    const docRef = doc(db, "ChildProgress", childId, "activities", activityId);
    const existing = await getDoc(docRef);
    const existingData = existing.exists() ? existing.data() : {};

    const newData = {
      completed: true,
      stars: Math.max(stars || 0, existingData.stars || 0),
      bestScore: Math.max(score || 0, existingData.bestScore || 0),
      lastScore: score || 0,
      completedAt: serverTimestamp(),
      attempts: (existingData.attempts || 0) + 1,
    };

    await setDoc(docRef, newData, { merge: true });
    return newData;
  } catch (error) {
    console.error("Error saving progress:", error);
    throw error;
  }
};

// ─────────────────────────────────────────────
// Compute station states from plan + progress
// Returns array: [{ activityId, status: 'completed'|'active'|'locked', stars }]
// Sequential unlock: station N is active only if station N-1 is completed
// ─────────────────────────────────────────────
export const computeStationStates = (activityIds, progressMap) => {
  if (!activityIds || activityIds.length === 0) return [];

  const stations = [];
  let foundActive = false;

  for (let i = 0; i < activityIds.length; i++) {
    const id = activityIds[i];
    const progress = progressMap[id];
    const isCompleted = progress?.completed === true;

    let status;
    if (isCompleted) {
      status = "completed";
    } else if (!foundActive) {
      status = "active";
      foundActive = true;
    } else {
      status = "locked";
    }

    stations.push({
      activityId: id,
      status,
      stars: progress?.stars || 0,
      bestScore: progress?.bestScore || 0,
      attempts: progress?.attempts || 0,
    });
  }

  return stations;
};

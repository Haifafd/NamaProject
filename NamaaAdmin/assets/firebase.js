import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

// ─────────── Firebase Config ───────────
const firebaseConfig = {
  apiKey: "AIzaSyD-LOrPzRH2wd4rS2ftp-ZKI3wg0Migvww",
  authDomain: "namaa-30e99.firebaseapp.com",
  projectId: "namaa-30e99",
  storageBucket: "namaa-30e99.firebasestorage.app",
  messagingSenderId: "678910410774",
  appId: "1:678910410774:web:191cb32c8f98503d9ff537",
  measurementId: "G-YJ7307VKLP",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Re-export Firestore functions
export {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
};

// ─────────── Category Mapping ───────────
export const CATEGORY_MAP = {
  memoryCategoryID: {
    name: "الذاكرة",
    badge: "badge-memory",
    iconClass: "purple",
    lucideIcon: "brain",
    color: "#9C27B0",
  },
  focusCategoryID: {
    name: "التركيز والانتباه",
    badge: "badge-focus",
    iconClass: "amber",
    lucideIcon: "eye",
    color: "#F5A623",
  },
  thinkingCategoryID: {
    name: "التفكير وحل المشكلات",
    badge: "badge-thinking",
    iconClass: "blue",
    lucideIcon: "lightbulb",
    color: "#2196F3",
  },
  perceptionCategoryID: {
    name: "الإدراك البصري",
    badge: "badge-perception",
    iconClass: "pink",
    lucideIcon: "shapes",
    color: "#F44336",
  },
};

// ─────────── Helpers ───────────
export function showAlert(message, type = "info") {
  const alertBox = document.getElementById("alertBox");
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type} show`;
  setTimeout(() => alertBox.classList.remove("show"), 3500);
}

export function formatDate(timestamp) {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeTime(timestamp) {
  if (!timestamp) return "—";
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "الآن";
  if (diffMin < 60) return `منذ ${diffMin} د`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return "أمس";
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  return formatDate(timestamp);
}

export function calculateAge(birthDateStr) {
  if (!birthDateStr) return "—";
  const birth = new Date(birthDateStr);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function confirmDialog(title, message) {
  return new Promise((resolve) => {
    const result = confirm(`${title}\n\n${message}`);
    resolve(result);
  });
}

// ─────────────────────────────────────────────
// 🗑️ Delete user with cascade (Firestore only)
// ─────────────────────────────────────────────
export async function deleteUserCascade(uid, role) {
  const deletedItems = {
    user: false,
    children: 0,
    chats: 0,
  };

  try {
    const childrenQuery = query(
      collection(db, "Children"),
      where(role === "parent" ? "parentId" : "specialistId", "==", uid)
    );
    const childrenSnap = await getDocs(childrenQuery);

    for (const childDoc of childrenSnap.docs) {
      const childId = childDoc.id;

      const chatsQuery = query(
        collection(db, "Chats"),
        where("childId", "==", childId)
      );
      const chatsSnap = await getDocs(chatsQuery);
      for (const chatDoc of chatsSnap.docs) {
        await deleteDoc(doc(db, "Chats", chatDoc.id));
        deletedItems.chats++;
      }

      await deleteDoc(doc(db, "Children", childId));
      deletedItems.children++;
    }

    await deleteDoc(doc(db, "Users", uid));
    deletedItems.user = true;

    return deletedItems;
  } catch (error) {
    console.error("Error in cascade delete:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────
// 🗑️ Delete child with cascade (chats only)
// ─────────────────────────────────────────────
export async function deleteChildCascade(childId) {
  const deletedItems = {
    child: false,
    chats: 0,
  };

  try {
    const chatsQuery = query(
      collection(db, "Chats"),
      where("childId", "==", childId)
    );
    const chatsSnap = await getDocs(chatsQuery);
    for (const chatDoc of chatsSnap.docs) {
      await deleteDoc(doc(db, "Chats", chatDoc.id));
      deletedItems.chats++;
    }

    await deleteDoc(doc(db, "Children", childId));
    deletedItems.child = true;

    return deletedItems;
  } catch (error) {
    console.error("Error in child cascade delete:", error);
    throw error;
  }
}

// ─────────────────────────────────────────────
// 📊 Get user statistics
// ─────────────────────────────────────────────
export async function getUserStats(uid, role) {
  try {
    const stats = {
      childrenCount: 0,
      chatsCount: 0,
    };

    const childrenQuery = query(
      collection(db, "Children"),
      where(role === "parent" ? "parentId" : "specialistId", "==", uid)
    );
    const childrenSnap = await getDocs(childrenQuery);
    stats.childrenCount = childrenSnap.size;

    const chatsQuery = query(
      collection(db, "Chats"),
      where(role === "parent" ? "parentId" : "specialistId", "==", uid)
    );
    const chatsSnap = await getDocs(chatsQuery);
    stats.chatsCount = chatsSnap.size;

    return stats;
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return { childrenCount: 0, chatsCount: 0 };
  }
}

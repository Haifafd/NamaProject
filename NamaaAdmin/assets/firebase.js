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
  memoryCategoryID: { name: "الذاكرة", badge: "badge-memory", icon: "🧠", color: "#9C27B0" },
  focusCategoryID: { name: "التركيز والانتباه", badge: "badge-focus", icon: "👁️", color: "#F5A623" },
  thinkingCategoryID: { name: "التفكير وحل المشكلات", badge: "badge-thinking", icon: "💡", color: "#2196F3" },
  perceptionCategoryID: { name: "الإدراك البصري", badge: "badge-perception", icon: "🔷", color: "#F44336" },
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

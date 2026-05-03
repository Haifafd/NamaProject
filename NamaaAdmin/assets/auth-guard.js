// ─────────────────────────────────────────
// Auth Guard - Protects admin pages
// Imports as ES module from each admin page
// ─────────────────────────────────────────

import { auth, onAuthStateChanged, verifyAdmin } from "./firebase.js";

let resolveAdmin;
export const adminReady = new Promise((resolve) => {
  resolveAdmin = resolve;
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (!window.location.pathname.endsWith("login.html")) {
      window.location.href = "login.html";
    }
    return;
  }

  const admin = await verifyAdmin();
  if (!admin) {
    alert("هذا الحساب ليس لديه صلاحيات المسؤول");
    await auth.signOut();
    window.location.href = "login.html";
    return;
  }

  updateSidebarUserInfo(admin);
  resolveAdmin(admin);
});

function updateSidebarUserInfo(admin) {
  const nameEl = document.getElementById("sidebarAdminName");
  if (nameEl) nameEl.textContent = admin.name || "المسؤول";

  const emailEl = document.getElementById("sidebarAdminEmail");
  if (emailEl) emailEl.textContent = admin.email || "";
}

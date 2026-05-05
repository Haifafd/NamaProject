// ────────────────────────────────────────────
// 🎵 مدير موسيقى Child Mode (expo-audio - SDK 54+)
// ────────────────────────────────────────────
// يدير نسخة وحيدة من الموسيقى الخلفية تستمر عبر شاشات Child Mode
// يستخدم createAudioPlayer (من useAudioPlayer hook) لأن الموسيقى
// يجب أن تعيش خارج عمر أي مكوّن

let createAudioPlayer = null;
let setAudioModeAsync = null;

try {
  const expoAudio = require("expo-audio");
  createAudioPlayer = expoAudio.createAudioPlayer;
  setAudioModeAsync = expoAudio.setAudioModeAsync;
} catch (e) {
  console.log("⚠️ expo-audio not installed, music disabled");
}

// ── حالة Singleton ──
let player = null;
let isStarted = false;
let isLoading = false;

// ────────────────────────────────────────────
// 🎵 بدء تشغيل الموسيقى الخلفية
// آمنة للاستدعاء عدة مرات — لا تعيد التشغيل لو شغالة
// ────────────────────────────────────────────
export const startBackgroundMusic = async () => {
  if (!createAudioPlayer) {
    console.log("⚠️ Audio module not available");
    return;
  }
  if (isStarted || isLoading) {
    console.log("ℹ️ Music already playing or loading");
    return;
  }

  try {
    isLoading = true;

    // إعداد وضع الصوت — يشتغل حتى مع الجوال صامت (فقط في iOS)
    if (setAudioModeAsync) {
      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          interruptionMode: "duckOthers",
          interruptionModeAndroid: "duckOthers",
          shouldRouteThroughEarpiece: false,
        });
      } catch (modeErr) {
        console.log("⚠️ Audio mode set warning:", modeErr.message);
      }
    }

    // إنشاء المشغّل
    player = createAudioPlayer(
      require("../assets/sounds/nama-music.mp3"),
      { updateInterval: 1000 }
    );

    // الإعدادات
    player.loop = true;
    player.volume = 0.4;

    // التشغيل
    player.play();

    isStarted = true;
    isLoading = false;
    console.log("🎵 Background music started");
  } catch (error) {
    console.log("❌ Music start error:", error.message);
    isLoading = false;
    isStarted = false;
    if (player) {
      try {
        player.release();
      } catch (e) {}
      player = null;
    }
  }
};

// ────────────────────────────────────────────
// 🛑 إيقاف الموسيقى وتفريغ الذاكرة
// ────────────────────────────────────────────
export const stopBackgroundMusic = async () => {
  if (!player) {
    isStarted = false;
    return;
  }

  try {
    try {
      player.pause();
    } catch (e) {}
    try {
      player.release();
    } catch (e) {}
    console.log("🛑 Background music stopped");
  } catch (error) {
    console.log("⚠️ Music stop error:", error.message);
  } finally {
    player = null;
    isStarted = false;
    isLoading = false;
  }
};

// ────────────────────────────────────────────
// 🔉 خفض الصوت (داخل الألعاب)
// ────────────────────────────────────────────
export const duckMusic = async () => {
  if (!player || !isStarted) return;
  try {
    player.volume = 0.15;
  } catch (_e) {
    // ignore
  }
};

// ────────────────────────────────────────────
// 🔊 استعادة الصوت الطبيعي
// ────────────────────────────────────────────
export const unduckMusic = async () => {
  if (!player || !isStarted) return;
  try {
    player.volume = 0.4;
  } catch (_e) {
    // ignore
  }
};

// ────────────────────────────────────────────
// 🔇 كتم/تشغيل صريح (للأيقونة المستقبلية)
// ────────────────────────────────────────────
export const setMusicMuted = async (muted) => {
  if (!player || !isStarted) return;
  try {
    player.muted = !!muted;
  } catch (_e) {
    // ignore
  }
};

// ────────────────────────────────────────────
// ℹ️ هل الموسيقى تشتغل حالياً؟
// ────────────────────────────────────────────
export const isMusicPlaying = () => isStarted;

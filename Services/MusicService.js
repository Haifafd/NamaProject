// ────────────────────────────────────────────
// 🎵 Centralized Music Manager for Child Mode
// ────────────────────────────────────────────
// Manages a single background music instance that persists
// across child mode screens. Imports expo-av lazily to avoid
// crashes if package isn't installed.

let Audio = null;
try {
  Audio = require("expo-av").Audio;
} catch (e) {
  console.log("expo-av not installed, music disabled");
}

// Singleton state
let soundInstance = null;
let isPlaying = false;
let isLoading = false;

// ────────────────────────────────────────────
// 🎵 Start playing background music
// Safe to call multiple times — won't restart if already playing
// ────────────────────────────────────────────
export const startBackgroundMusic = async () => {
  if (!Audio) return;
  if (isPlaying || isLoading) return;

  try {
    isLoading = true;

    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      interruptionModeIOS: 1,
      interruptionModeAndroid: 1,
    });

    const { sound } = await Audio.Sound.createAsync(
      // ⚠️ IMPORTANT: Update this path if the file has a different name
      require("../assets/sounds/nama-music.mp3"),
      {
        isLooping: true,
        volume: 0.4,
        shouldPlay: true,
      },
    );

    soundInstance = sound;
    isPlaying = true;
    isLoading = false;
  } catch (error) {
    console.log("Music load error:", error.message);
    isLoading = false;
  }
};

// ────────────────────────────────────────────
// 🛑 Stop and unload music
// ────────────────────────────────────────────
export const stopBackgroundMusic = async () => {
  if (!soundInstance) return;

  try {
    await soundInstance.stopAsync();
    await soundInstance.unloadAsync();
  } catch (error) {
    console.log("Music stop error:", error.message);
  } finally {
    soundInstance = null;
    isPlaying = false;
  }
};

// ────────────────────────────────────────────
// 🔉 Lower volume (for inside games)
// ────────────────────────────────────────────
export const duckMusic = async () => {
  if (!soundInstance || !isPlaying) return;
  try {
    await soundInstance.setVolumeAsync(0.15);
  } catch (e) {
    // ignore
  }
};

// ────────────────────────────────────────────
// 🔊 Restore normal volume
// ────────────────────────────────────────────
export const unduckMusic = async () => {
  if (!soundInstance || !isPlaying) return;
  try {
    await soundInstance.setVolumeAsync(0.4);
  } catch (e) {
    // ignore
  }
};

// ────────────────────────────────────────────
// ℹ️ Is music currently playing?
// ────────────────────────────────────────────
export const isMusicPlaying = () => isPlaying;

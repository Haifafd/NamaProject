import { Stack } from "expo-router";
import { useEffect } from "react";
import {
  startBackgroundMusic,
  stopBackgroundMusic,
} from "../../Services/MusicService";

export default function ChildLayout() {
  useEffect(() => {
    // ابدأ الموسيقى عند دخول Child Mode
    startBackgroundMusic();

    // أوقف الموسيقى عند الخروج (unmount)
    return () => {
      stopBackgroundMusic();
    };
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}

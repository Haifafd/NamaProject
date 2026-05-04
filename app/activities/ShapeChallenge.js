import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { View } from "react-native";

export default function ShapeChallenge() {
  const router = useRouter();
  const { childId } = useLocalSearchParams();

  useEffect(() => {
    if (childId) {
      router.replace({ pathname: "/child/Home", params: { childId } });
    } else {
      router.back();
    }
  }, []);

  return <View />;
}

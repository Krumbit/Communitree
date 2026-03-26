import Constants from "expo-constants";
import { Platform } from "react-native";

const EXPO_HOST =
  Constants.expoConfig?.hostUri?.split(":")[0] ??
  Constants.manifest2?.extra?.expoClient?.hostUri?.split(":")[0] ??
  null;

function getDefaultApiBase() {
  if (Platform.OS === "web") {
    return "http://localhost:8000";
  }

  if (EXPO_HOST) {
    return `http://${EXPO_HOST}:8000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:8000";
  }

  return "http://localhost:8000";
}

export const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? getDefaultApiBase();

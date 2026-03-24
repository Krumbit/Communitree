import { Stack } from "expo-router";
import { CommunitreeProvider } from "@/context/communitree-context";
import "./global.css";

export default function RootLayout() {
  return (
    <CommunitreeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="community-stats" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="habit-history" options={{ headerShown: false }} />
      </Stack>
    </CommunitreeProvider>
  );
}

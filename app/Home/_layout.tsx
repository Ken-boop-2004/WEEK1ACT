import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Drawer" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="ComponentShowcase" />
    </Stack>
  );
}

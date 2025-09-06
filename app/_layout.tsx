import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        initialRouteName="Signin"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Main entry: Signin */}
        <Stack.Screen name="Signin" options={{ title: 'Sign In' }} />

        {/* Home section */}
        <Stack.Screen name="/Home/ComponentShowcase" options={{ title: 'Component Showcase' }} />
        <Stack.Screen name="/Home/explore" options={{ title: 'Explore' }} />
        <Stack.Screen name="/Home/HomePage" options={{ title: 'Home Page' }} />
        <Stack.Screen name="/Home/index" options={{ title: 'Home' }} />

        {/* Not found screen */}
        <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
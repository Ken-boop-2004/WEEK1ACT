import { Stack } from "expo-router";
import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "../store";
import { useAppDispatch } from "../store/hooks";
import { loadTheme } from "../store/themeSlice";

function AppContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadTheme());
  }, [dispatch]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="Signin" />
      <Stack.Screen name="SignUp" />
      <Stack.Screen name="Home" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

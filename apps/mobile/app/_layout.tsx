import { createI18n } from "@orion/i18n";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import "../global.css";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

const i18n = createI18n("en");

const orionDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0B0D10",
    card: "#141820",
    text: "#F4F6FA",
    border: "#2A3344",
    primary: "#3DDC97",
  },
};

export default function RootLayout() {
  useEffect(() => {
    void SplashScreen.hideAsync();
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={orionDarkTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </I18nextProvider>
  );
}

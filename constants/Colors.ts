/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { CustomTheme } from '../store/themeSlice';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    primary: '#0a7ea4',
    secondary: '#6c757d',
    accent: '#ff6b6b',
    surface: '#f8f9fa',
    textSecondary: '#687076',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#0a7ea4',
    secondary: '#6c757d',
    accent: '#ff6b6b',
    surface: '#2a2a2a',
    textSecondary: '#9BA1A6',
  },
};

export const getThemeColors = (mode: 'light' | 'dark' | 'custom', customTheme?: CustomTheme) => {
  if (mode === 'custom' && customTheme) {
    return {
      text: customTheme.text,
      background: customTheme.background,
      tint: customTheme.primary,
      icon: customTheme.textSecondary,
      tabIconDefault: customTheme.textSecondary,
      tabIconSelected: customTheme.primary,
      primary: customTheme.primary,
      secondary: customTheme.secondary,
      accent: customTheme.accent,
      surface: customTheme.surface,
      textSecondary: customTheme.textSecondary,
    };
  }
  return Colors[mode];
};

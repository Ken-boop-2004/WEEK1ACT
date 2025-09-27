import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CustomTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export interface ThemeState {
  mode: 'light' | 'dark' | 'custom';
  customTheme: CustomTheme;
  isLoaded: boolean;
}

const defaultCustomTheme: CustomTheme = {
  primary: '#0a7ea4',
  secondary: '#6c757d',
  accent: '#ff6b6b',
  background: '#ffffff',
  surface: '#f8f9fa',
  text: '#11181C',
  textSecondary: '#687076',
};

const initialState: ThemeState = {
  mode: 'light',
  customTheme: defaultCustomTheme,
  isLoaded: false,
};

const THEME_STORAGE_KEY = '@theme_settings';

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<'light' | 'dark' | 'custom'>) => {
      state.mode = action.payload;
      AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state));
    },
    setCustomTheme: (state, action: PayloadAction<CustomTheme>) => {
      state.customTheme = action.payload;
      state.mode = 'custom';
      AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state));
    },
    updateCustomThemeColor: (
      state,
      action: PayloadAction<{ key: keyof CustomTheme; value: string }>
    ) => {
      state.customTheme[action.payload.key] = action.payload.value;
      if (state.mode === 'custom') {
        AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(state));
      }
    },
    loadThemeFromStorage: (state, action: PayloadAction<ThemeState>) => {
      return { ...action.payload, isLoaded: true };
    },
    setThemeLoaded: (state) => {
      state.isLoaded = true;
    },
  },
});

export const {
  setThemeMode,
  setCustomTheme,
  updateCustomThemeColor,
  loadThemeFromStorage,
  setThemeLoaded,
} = themeSlice.actions;

// Async thunk to load theme from storage
export const loadTheme = () => async (dispatch: any) => {
  try {
    const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
      const parsedTheme = JSON.parse(savedTheme);
      dispatch(loadThemeFromStorage(parsedTheme));
    } else {
      dispatch(setThemeLoaded());
    }
  } catch (error) {
    console.error('Error loading theme from storage:', error);
    dispatch(setThemeLoaded());
  }
};

export default themeSlice.reducer;

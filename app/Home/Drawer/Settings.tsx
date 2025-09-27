import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import ColorPicker from '../../../components/ColorPicker';
import ThemeToggle from '../../../components/ThemeToggle';
import { getThemeColors } from '../../../constants/Colors';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { setCustomTheme, setThemeMode } from '../../../store/themeSlice';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { mode, customTheme } = useAppSelector((state) => state.theme);
  const colors = getThemeColors(mode, customTheme);

  const handlePresetTheme = (themeMode: 'light' | 'dark') => {
    dispatch(setThemeMode(themeMode));
  };

  const handleCustomTheme = () => {
    dispatch(setThemeMode('custom'));
  };

  const resetCustomTheme = () => {
    const defaultCustomTheme = {
      primary: '#0a7ea4',
      secondary: '#6c757d',
      accent: '#ff6b6b',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#11181C',
      textSecondary: '#687076',
    };
    dispatch(setCustomTheme(defaultCustomTheme));
  };

  const PresetThemeButton = ({ 
    title, 
    description, 
    themeMode, 
    icon 
  }: { 
    title: string; 
    description: string; 
    themeMode: 'light' | 'dark'; 
    icon: string; 
  }) => {
    const isSelected = mode === themeMode;

    return (
      <TouchableOpacity
        style={[
          styles.presetButton,
          { 
            backgroundColor: colors.surface,
            borderColor: isSelected ? colors.primary : colors.textSecondary,
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
        onPress={() => handlePresetTheme(themeMode)}
        activeOpacity={0.7}
      >
        <View style={styles.presetButtonContent}>
          <Ionicons 
            name={icon as any} 
            size={24} 
            color={isSelected ? colors.primary : colors.textSecondary} 
          />
          <View style={styles.presetButtonText}>
            <Text style={[styles.presetButtonTitle, { color: colors.text }]}>
              {title}
            </Text>
            <Text style={[styles.presetButtonDescription, { color: colors.textSecondary }]}>
              {description}
            </Text>
          </View>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Customize your app experience
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Toggle
          </Text>
          <View style={styles.toggleContainer}>
            <ThemeToggle size={28} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            App Settings
          </Text>
          
          <View style={[styles.settingsContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.settingRow, { borderBottomColor: colors.textSecondary }]}>
              <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
              <Switch 
                value={notifications} 
                onValueChange={setNotifications}
                trackColor={{ false: colors.textSecondary, true: colors.primary }}
                thumbColor={notifications ? colors.background : colors.textSecondary}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Preset Themes
          </Text>
          
          <PresetThemeButton
            title="Light Theme"
            description="Clean and bright interface"
            themeMode="light"
            icon="sunny"
          />
          
          <PresetThemeButton
            title="Dark Theme"
            description="Easy on the eyes in low light"
            themeMode="dark"
            icon="moon"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.customThemeHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Custom Theme
            </Text>
            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: colors.secondary }]}
              onPress={resetCustomTheme}
            >
              <Text style={[styles.resetButtonText, { color: colors.background }]}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[
              styles.customThemeButton,
              { 
                backgroundColor: colors.surface,
                borderColor: mode === 'custom' ? colors.primary : colors.textSecondary,
                borderWidth: mode === 'custom' ? 2 : 1,
              }
            ]}
            onPress={handleCustomTheme}
          >
            <View style={styles.customThemeButtonContent}>
              <Ionicons 
                name="color-palette" 
                size={24} 
                color={mode === 'custom' ? colors.primary : colors.textSecondary} 
              />
              <View style={styles.customThemeButtonText}>
                <Text style={[styles.customThemeButtonTitle, { color: colors.text }]}>
                  Custom Colors
                </Text>
                <Text style={[styles.customThemeButtonDescription, { color: colors.textSecondary }]}>
                  Create your own color scheme
                </Text>
              </View>
              {mode === 'custom' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </View>
          </TouchableOpacity>

          {mode === 'custom' && (
            <View style={[styles.colorPickersContainer, { backgroundColor: `${colors.primary}10` }]}>
              <ColorPicker colorKey="primary" label="Primary Color" />
              <ColorPicker colorKey="secondary" label="Secondary Color" />
              <ColorPicker colorKey="accent" label="Accent Color" />
              <ColorPicker colorKey="background" label="Background Color" />
              <ColorPicker colorKey="surface" label="Surface Color" />
              <ColorPicker colorKey="text" label="Text Color" />
              <ColorPicker colorKey="textSecondary" label="Secondary Text Color" />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account
          </Text>
          
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.accent }]}
            onPress={() => router.replace("/Signin")}
          >
            <Ionicons name="log-out" size={20} color={colors.background} />
            <Text style={[styles.logoutText, { color: colors.background }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  toggleContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  settingsContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  settingText: { 
    fontSize: 16, 
    fontWeight: '500',
  },
  presetButton: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  presetButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presetButtonText: {
    flex: 1,
    marginLeft: 12,
  },
  presetButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  presetButtonDescription: {
    fontSize: 14,
  },
  customThemeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  customThemeButton: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  customThemeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customThemeButtonText: {
    flex: 1,
    marginLeft: 12,
  },
  customThemeButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  customThemeButtonDescription: {
    fontSize: 14,
  },
  colorPickersContainer: {
    borderRadius: 12,
    padding: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: { 
    fontSize: 16, 
    fontWeight: "600" 
  },
});

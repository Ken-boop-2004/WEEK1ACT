import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList, useDrawerProgress } from "@react-navigation/drawer";
import { createStackNavigator } from "@react-navigation/stack";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { interpolate, useAnimatedStyle } from "react-native-reanimated";
import ThemeToggle from "../../../components/ThemeToggle";
import { getThemeColors } from "../../../constants/Colors";
import { useAppSelector } from "../../../store/hooks";

// Import drawer screens
import Camera from './Camera';
import HomePage from './HomePage';
import Playlists from './Playlists';
import Profile from './Profile';
import Settings from './Settings';

// ------------------ Drawer Param Types ------------------
type RootDrawerParamList = {
  HomePage: undefined;
  Profile: undefined;
  Playlists: undefined;
  Settings: undefined;
  Camera: undefined;
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();
const Stack = createStackNavigator();

// ------------------ Animated Wrapper ------------------
const AnimatedWrapper = React.memo(({ children }: { children: React.ReactNode }) => {
  const progress = useDrawerProgress();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: interpolate(progress.value, [0, 1], [1, 0.9]),
        },
        {
          translateX: interpolate(progress.value, [0, 1], [0, 20]),
        },
      ],
      borderRadius: interpolate(progress.value, [0, 1], [0, 20]),
      overflow: "hidden",
    };
  });

  return <Animated.View style={[{ flex: 1 }, animatedStyle]}>{children}</Animated.View>;
});

// ------------------ Custom Drawer Content ------------------
function CustomDrawerContent(props: any) {
  const router = useRouter();
  const { mode, customTheme } = useAppSelector((state) => state.theme);
  const colors = getThemeColors(mode, customTheme);

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={[styles.drawerContent, { backgroundColor: colors.background }]}>
      {/* Header Section */}
      <View style={[styles.drawerHeader, { borderBottomColor: colors.textSecondary }]}>
        <Text style={[styles.drawerTitle, { color: colors.primary }]}>Spotify</Text>
        <Text style={[styles.drawerSubtitle, { color: colors.textSecondary }]}>Music & Podcasts</Text>
      </View>

      {/* Theme Toggle Section */}
      <View style={[styles.themeSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.themeLabel, { color: colors.text }]}>Theme</Text>
        <ThemeToggle size={20} />
      </View>

      {/* Navigation Items */}
      <DrawerItemList {...props} />

      {/* Custom Actions */}
      <View style={[styles.drawerActions, { borderTopColor: colors.textSecondary }]}>
        <DrawerItem
          label="Logout"
          onPress={() => router.replace("/Signin")}
          labelStyle={[styles.logoutLabel, { color: colors.accent }]}
          style={styles.logoutItem}
          icon={() => <Text style={[styles.logoutIcon, { color: colors.accent }]}>🚪</Text>}
        />
      </View>
    </DrawerContentScrollView>
  );
}

// ------------------ Screen Wrapper Helper ------------------
const createAnimatedScreen = (ScreenComponent: React.ComponentType) => {
  return () => (
    <AnimatedWrapper>
      <ScreenComponent />
    </AnimatedWrapper>
  );
};

// ------------------ Drawer Navigator ------------------
function DrawerNavigator() {
  const { mode, customTheme } = useAppSelector((state) => state.theme);
  const colors = getThemeColors(mode, customTheme);

  return (
    <Drawer.Navigator
      initialRouteName="HomePage"
      drawerContent={CustomDrawerContent}
      screenOptions={{
        drawerType: "slide",
        swipeEnabled: true,
        swipeEdgeWidth: 100,
        swipeMinDistance: 80,
        headerShown: false,
        drawerStyle: { 
          backgroundColor: colors.background,
          width: 280,
        },
        drawerLabelStyle: { 
          color: colors.text,
          fontSize: 16,
          fontWeight: "500",
          marginLeft: -20, // Adjust spacing
        },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textSecondary,
        drawerActiveBackgroundColor: `${colors.primary}20`,
        drawerItemStyle: {
          borderRadius: 8,
          marginVertical: 2,
        },
      }}
    >
      <Drawer.Screen 
        name="HomePage"
        component={createAnimatedScreen(HomePage)}
        options={{
          title: "Home",
          drawerIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size === 24 ? 20 : size }}>🏠</Text>
          ),
        }}
      />
      
      <Drawer.Screen 
        name="Profile"
        component={createAnimatedScreen(Profile)}
        options={{
          title: "Profile",
          drawerIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size === 24 ? 20 : size }}>👤</Text>
          ),
        }}
      />
      
      <Drawer.Screen 
        name="Playlists"
        component={createAnimatedScreen(Playlists)}
        options={{
          title: "Playlists",
          drawerIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size === 24 ? 20 : size }}>🎵</Text>
          ),
        }}
      />
      
      <Drawer.Screen 
        name="Settings"
        component={createAnimatedScreen(Settings)}
        options={{
          title: "Settings",
          drawerIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size === 24 ? 20 : size }}>⚙️</Text>
          ),
        }}
      />
      
      <Drawer.Screen 
        name="Camera"
        component={createAnimatedScreen(Camera)}
        options={{
          title: "Camera",
          drawerIcon: ({ color, size }) => (
            <Text style={{ color, fontSize: size === 24 ? 20 : size }}>📷</Text>
          ),
        }}
      />
    </Drawer.Navigator>
  );
}

export default function DrawerLayout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RootDrawer" component={DrawerNavigator} />
    </Stack.Navigator>
  );
}

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomWidth: 1,
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
  },
  drawerSubtitle: {
    fontSize: 14,
  },
  themeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  drawerActions: {
    marginTop: "auto",
    paddingTop: 20,
    borderTopWidth: 1,
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: -20,
  },
  logoutItem: {
    borderRadius: 8,
    marginVertical: 2,
  },
  logoutIcon: {
    fontSize: 20,
  },
});
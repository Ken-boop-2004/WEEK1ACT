import AsyncStorage from '@react-native-async-storage/async-storage';

const PERSISTENCE_KEY = 'NAVIGATION_STATE';
const DRAWER_PERSISTENCE_KEY = 'DRAWER_STATE';

export interface NavigationState {
  screen: string;
  drawerOpen?: boolean;
  timestamp: number;
}

export interface DrawerState {
  isOpen: boolean;
  lastScreen: string;
  timestamp: number;
}

// Valid screens in the app
const VALID_SCREENS = [
  '/Signin',
  '/SignUp', 
  '/Home',
  '/Home/',
  '/Home/index',
  '/Home/explore',
  '/Home/ComponentShowcase',
  '/Home/HomePage', // Add this route
];

// Validate if a screen path is valid
export function isValidScreen(screen: string): boolean {
  return VALID_SCREENS.includes(screen) || screen.startsWith('/Home/');
}

// Clear all navigation state
export async function clearNavigationState(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([PERSISTENCE_KEY, DRAWER_PERSISTENCE_KEY]);
    console.log('Navigation state cleared');
  } catch (error) {
    console.warn('Failed to clear navigation state:', error);
  }
}

// Get default navigation state
export function getDefaultNavigationState(): NavigationState {
  return {
    screen: '/Signin',
    drawerOpen: false,
    timestamp: Date.now(),
  };
}

// Validate and sanitize navigation state
export function validateNavigationState(state: any): NavigationState | null {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const { screen, drawerOpen, timestamp } = state;

  // Check required fields
  if (!screen || typeof screen !== 'string') {
    return null;
  }

  // Check if screen is valid
  if (!isValidScreen(screen)) {
    console.warn('Invalid screen in saved state:', screen);
    return null;
  }

  // Check timestamp (should be within last 7 days)
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  if (!timestamp || (now - timestamp) > maxAge) {
    console.warn('Navigation state too old, ignoring');
    return null;
  }

  return {
    screen,
    drawerOpen: Boolean(drawerOpen),
    timestamp: Number(timestamp),
  };
}

// Validate and sanitize drawer state
export function validateDrawerState(state: any): DrawerState | null {
  if (!state || typeof state !== 'object') {
    return null;
  }

  const { isOpen, lastScreen, timestamp } = state;

  // Check required fields
  if (typeof isOpen !== 'boolean' || !lastScreen || typeof lastScreen !== 'string') {
    return null;
  }

  // Check if lastScreen is valid
  if (!isValidScreen(lastScreen)) {
    console.warn('Invalid lastScreen in drawer state:', lastScreen);
    return null;
  }

  // Check timestamp (should be within last 24 hours for drawer state)
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  if (!timestamp || (now - timestamp) > maxAge) {
    console.warn('Drawer state too old, ignoring');
    return null;
  }

  return {
    isOpen: Boolean(isOpen),
    lastScreen,
    timestamp: Number(timestamp),
  };
}

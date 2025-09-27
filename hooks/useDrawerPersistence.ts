import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'expo-router';

const DRAWER_PERSISTENCE_KEY = 'DRAWER_STATE';

interface DrawerState {
  isOpen: boolean;
  lastScreen: string;
  timestamp: number;
}

export function useDrawerPersistence() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Save drawer state
  const saveDrawerState = useCallback(async (isOpen: boolean) => {
    try {
      const state: DrawerState = {
        isOpen,
        lastScreen: pathname,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(DRAWER_PERSISTENCE_KEY, JSON.stringify(state));
      console.log('Drawer state saved:', state);
    } catch (error) {
      console.warn('Failed to save drawer state:', error);
    }
  }, [pathname]);

  // Restore drawer state
  const restoreDrawerState = useCallback(async () => {
    try {
      const savedState = await AsyncStorage.getItem(DRAWER_PERSISTENCE_KEY);
      
      if (savedState) {
        const state: DrawerState = JSON.parse(savedState);
        
        // Check if state is recent (within 1 hour for drawer state)
        const isRecent = Date.now() - state.timestamp < 60 * 60 * 1000;
        
        if (isRecent) {
          setDrawerOpen(state.isOpen);
          console.log('Drawer state restored:', state);
        } else {
          // Clear old state
          await AsyncStorage.removeItem(DRAWER_PERSISTENCE_KEY);
          console.log('Cleared old drawer state');
        }
      }
    } catch (error) {
      console.warn('Failed to restore drawer state:', error);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    restoreDrawerState();
  }, [restoreDrawerState]);

  // Handle drawer state changes
  const handleDrawerToggle = useCallback((isOpen: boolean) => {
    setDrawerOpen(isOpen);
    saveDrawerState(isOpen);
  }, [saveDrawerState]);

  return {
    drawerOpen,
    handleDrawerToggle,
    saveDrawerState,
  };
}

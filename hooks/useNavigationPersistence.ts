import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { 
  validateNavigationState, 
  getDefaultNavigationState, 
  clearNavigationState,
  NavigationState 
} from '../utils/navigationUtils';

const PERSISTENCE_KEY = 'NAVIGATION_STATE';

export function useNavigationPersistence() {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastSavedPath, setLastSavedPath] = useState<string | null>(null);

  // Save navigation state
  const saveNavigationState = useCallback(async (screen: string, drawerOpen: boolean = false) => {
    // Don't save during restoration or if already saved this path
    if (isRestoring || lastSavedPath === screen) return;
    
    try {
      const state: NavigationState = {
        screen,
        drawerOpen,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
      setLastSavedPath(screen);
      console.log('Navigation state saved:', state);
    } catch (error) {
      console.warn('Failed to save navigation state:', error);
    }
  }, [isRestoring, lastSavedPath]);

  // Restore navigation state
  const restoreNavigationState = useCallback(async () => {
    try {
      const savedState = await AsyncStorage.getItem(PERSISTENCE_KEY);
      
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        const validatedState = validateNavigationState(parsedState);
        
        if (validatedState && validatedState.screen !== pathname) {
          console.log('Restoring navigation state:', validatedState);
          setIsRestoring(true);
          router.replace(validatedState.screen as any);
          // Reset restoration flag after a delay
          setTimeout(() => setIsRestoring(false), 1000);
        } else if (!validatedState) {
          // Clear invalid state
          await clearNavigationState();
          console.log('Cleared invalid navigation state');
        }
      }
    } catch (error) {
      console.warn('Failed to restore navigation state:', error);
      // Clear corrupted state
      await clearNavigationState();
    } finally {
      setIsReady(true);
    }
  }, [pathname, router]);

  // Initialize on mount
  useEffect(() => {
    restoreNavigationState();
  }, [restoreNavigationState]);

  // Save state when pathname changes (but not during restoration)
  useEffect(() => {
    if (isReady && pathname && !isRestoring) {
      saveNavigationState(pathname);
    }
  }, [pathname, isReady, saveNavigationState, isRestoring]);

  // Clear all state (useful for logout)
  const clearState = useCallback(async () => {
    await clearNavigationState();
    setLastSavedPath(null);
    console.log('Navigation state cleared');
  }, []);

  return {
    isReady,
    saveNavigationState,
    clearState,
  };
}

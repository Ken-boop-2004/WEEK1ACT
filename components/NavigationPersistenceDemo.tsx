import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useNavigationPersistence } from "../hooks/useNavigationPersistence";
import LogoutButton from "./LogoutButton";

export default function NavigationPersistenceDemo() {
  const router = useRouter();
  const { saveNavigationState, clearState } = useNavigationPersistence();

  const navigateToScreen = (screen: string) => {
    router.push(screen as any);
    saveNavigationState(screen);
  };

  const showCurrentState = async () => {
    try {
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const savedState = await AsyncStorage.getItem('NAVIGATION_STATE');
      const drawerState = await AsyncStorage.getItem('DRAWER_STATE');
      
      Alert.alert(
        "Navigation State",
        `Current State:\n${savedState || 'None'}\n\nDrawer State:\n${drawerState || 'None'}`,
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to load state");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Navigation Persistence Demo</Text>
      
      <Text style={styles.subtitle}>Test Navigation:</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigateToScreen('/Home')}
      >
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigateToScreen('/Home/explore')}
      >
        <Text style={styles.buttonText}>Go to Explore</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigateToScreen('/Home/ComponentShowcase')}
      >
        <Text style={styles.buttonText}>Go to Components</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => navigateToScreen('/Signin')}
      >
        <Text style={styles.buttonText}>Go to Signin</Text>
      </TouchableOpacity>
      
      <Text style={styles.subtitle}>Debug:</Text>
      <TouchableOpacity 
        style={[styles.button, styles.debugButton]} 
        onPress={showCurrentState}
      >
        <Text style={styles.buttonText}>Show Current State</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.clearButton]} 
        onPress={clearState}
      >
        <Text style={styles.buttonText}>Clear All State</Text>
      </TouchableOpacity>
      
      <LogoutButton style={styles.logoutButton} />
      
      <Text style={styles.instructions}>
        Instructions:{'\n'}
        1. Navigate to different screens{'\n'}
        2. Close the app completely{'\n'}
        3. Reopen the app{'\n'}
        4. You should return to the last screen!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#121212",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1DB954",
    marginTop: 20,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#1DB954",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  debugButton: {
    backgroundColor: "#FF6B35",
  },
  clearButton: {
    backgroundColor: "#FF3B30",
  },
  logoutButton: {
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  instructions: {
    color: "#aaa",
    fontSize: 14,
    marginTop: 20,
    lineHeight: 20,
  },
});

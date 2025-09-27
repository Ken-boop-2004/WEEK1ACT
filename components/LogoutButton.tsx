import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useNavigationPersistence } from "../hooks/useNavigationPersistence";

interface LogoutButtonProps {
  style?: any;
  textStyle?: any;
}

export default function LogoutButton({ style, textStyle }: LogoutButtonProps) {
  const router = useRouter();
  const { clearState } = useNavigationPersistence();

  const handleLogout = async () => {
    try {
      // Clear navigation state
      await clearState();
      
      // Navigate to signin
      router.replace("/Signin");
      
      console.log("User logged out, navigation state cleared");
    } catch (error) {
      console.warn("Error during logout:", error);
      // Still navigate even if clearing state fails
      router.replace("/Signin");
    }
  };

  return (
    <TouchableOpacity
      style={[styles.logoutButton, style]}
      onPress={handleLogout}
    >
      <Text style={[styles.logoutText, textStyle]}>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginTop: 40,
    padding: 15,
    backgroundColor: "#1DB954",
    borderRadius: 25,
    alignItems: "center",
  },
  logoutText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

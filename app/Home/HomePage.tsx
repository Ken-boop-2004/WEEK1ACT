import React, { useState } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { View, Text, Image, StyleSheet, Switch, TouchableOpacity, FlatList } from "react-native";
import { useRouter } from "expo-router";

const Drawer = createDrawerNavigator();

function ProfileScreen() {
  const user = {
    name: "Eze Kiel",
    email: "Eze.kiel@example.com",
    profilePic: require("../../Image/ProfilePic1.png"),
  };

  return (
    <View style={styles.center}>
      <Image source={user.profilePic} style={styles.profile} />
      <Text style={styles.name}>{user.name}</Text>
      <Text style={styles.email}>{user.email}</Text>
    </View>
  );
}

function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const router = useRouter();

  return (
    <View style={styles.center}>
      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Notifications</Text>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          thumbColor={notifications ? "#1DB954" : "#ccc"}
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingText}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          thumbColor={darkMode ? "#1DB954" : "#ccc"}
        />
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={() => router.replace("/Signin")}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

function PlaylistScreen() {
  const playlists = [
    {
      id: "1",
      title: "Top Hits 2025",
      cover: require("../../Image/playlist1.jpg"),
    },
    {
      id: "2",
      title: "Chill Vibes",
      cover: require("../../Image/playlist2.jpg"),
    },
    {
      id: "3",
      title: "Workout Mix",
      cover: require("../../Image/playlist3.webp"),
    },
    {
      id: "4",
      title: "Classic Favorites",
      cover: require("../../Image/playlist4.jpg"),
    },
  ];

  return (
    <View style={styles.center}>
      <Text style={styles.playlistHeader}>Your Playlists</Text>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.playlistCard}>
            <Image source={item.cover} style={styles.playlistCover} />
            <Text style={styles.playlistTitle}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

export default function HomePage() {
  return (
    <Drawer.Navigator initialRouteName="Profile">
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Playlists" component={PlaylistScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff4f4ff",
  },
  profile: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    alignSelf: "center",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0d0d0dff",
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    color: "#000000ff",
    textAlign: "center",
    marginBottom: 30,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  settingText: {
    fontSize: 18,
    color: "#000000ff",
  },
  logoutButton: {
    marginTop: 40,
    padding: 15,
    backgroundColor: "#1DB954",
    borderRadius: 25,
    alignItems: "center",
  },
  logoutText: {
    color: "#000000ff",
    fontSize: 18,
    fontWeight: "bold",
  },
  playlistHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000ff",
    marginBottom: 20,
  },
  playlistCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#737373ff",
    padding: 10,
    borderRadius: 10,
  },
  playlistCover: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  playlistTitle: {
    fontSize: 18,
    color: "#fffcfcff",
  },
});

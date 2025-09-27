import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { getThemeColors } from "../../../constants/Colors";
import { useAppSelector } from "../../../store/hooks";

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 20px margin + 8px gap

// ------------------ Types ------------------
type Playlist = { 
  id: string; 
  title: string; 
  cover: any;
  description?: string;
  trackCount?: number;
};

// ------------------ Memoized Components ------------------
const PlaylistCard = React.memo(({ 
  playlist, 
  onPress,
  style,
  colors
}: { 
  playlist: Playlist; 
  onPress: (playlist: Playlist) => void;
  style?: any;
  colors: any;
}) => {
  const handlePress = useCallback(() => {
    onPress(playlist);
  }, [playlist, onPress]);

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.surface }, style]} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image source={playlist.cover} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={[styles.cardText, { color: colors.text }]} numberOfLines={2}>{playlist.title}</Text>
        {playlist.trackCount && (
          <Text style={[styles.cardSubtext, { color: colors.textSecondary }]}>{playlist.trackCount} songs</Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

const HorizontalPlaylistCard = React.memo(({ 
  playlist,
  onPress,
  colors
}: { 
  playlist: Playlist;
  onPress: (playlist: Playlist) => void;
  colors: any;
}) => {
  const handlePress = useCallback(() => {
    onPress(playlist);
  }, [playlist, onPress]);

  return (
    <TouchableOpacity 
      style={styles.horizontalCard} 
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image source={playlist.cover} style={styles.horizontalImage} />
      <Text style={[styles.horizontalText, { color: colors.text }]} numberOfLines={2}>{playlist.title}</Text>
      {playlist.description && (
        <Text style={[styles.horizontalSubtext, { color: colors.textSecondary }]} numberOfLines={1}>{playlist.description}</Text>
      )}
    </TouchableOpacity>
  );
});

const SettingRow = React.memo(({ 
  title, 
  value, 
  onValueChange,
  colors
}: { 
  title: string; 
  value: boolean; 
  onValueChange: (value: boolean) => void;
  colors: any;
}) => (
  <View style={[styles.settingRow, { borderBottomColor: colors.textSecondary }]}>
    <Text style={[styles.settingText, { color: colors.text }]}>{title}</Text>
    <Switch 
      value={value} 
      onValueChange={onValueChange}
      trackColor={{ false: colors.textSecondary, true: colors.primary }}
      thumbColor={value ? colors.background : colors.textSecondary}
    />
  </View>
));

// ------------------ Main HomePage Component ------------------
export default function HomePage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  
  // Theme integration
  const { mode, customTheme } = useAppSelector((state) => state.theme);
  const colors = getThemeColors(mode, customTheme);

  // Memoized data to prevent unnecessary re-renders
  const recentPlaylists = useMemo(() => [
    { id: "1", title: "Top Hits 2025", cover: require("../../../Image/playlist1.jpg"), trackCount: 50 },
    { id: "2", title: "Chill Vibes", cover: require("../../../Image/playlist2.jpg"), trackCount: 32 },
  ], []);

  const madeForYouPlaylists = useMemo(() => [
    { 
      id: "3", 
      title: "Workout Mix", 
      cover: require("../../../Image/playlist3.webp"),
      description: "High energy tracks",
      trackCount: 45 
    },
    { 
      id: "4", 
      title: "Classic Favorites", 
      cover: require("../../../Image/playlist4.jpg"),
      description: "Timeless hits",
      trackCount: 67 
    },
    { 
      id: "5", 
      title: "Focus Deep", 
      cover: require("../../../Image/playlist1.jpg"),
      description: "Concentration music",
      trackCount: 23 
    },
  ], []);

  const allPlaylists = useMemo(() => [
    { id: "1", title: "Top Hits 2025", cover: require("../../../Image/playlist1.jpg"), trackCount: 50 },
    { id: "2", title: "Chill Vibes", cover: require("../../../Image/playlist2.jpg"), trackCount: 32 },
    { id: "3", title: "Workout Mix", cover: require("../../../Image/playlist3.webp"), trackCount: 45 },
    { id: "4", title: "Classic Favorites", cover: require("../../../Image/playlist4.jpg"), trackCount: 67 },
  ], []);

  // Memoized callbacks
  const handlePlaylistPress = useCallback((playlist: Playlist) => {
    console.log('Navigate to playlist:', playlist.title);
    // Navigate to playlist details
    // router.push(`/playlist/${playlist.id}`);
  }, []);

  const handleLogout = useCallback(() => {
    router.replace("/Signin");
  }, [router]);

  const renderPlaylistItem = useCallback(({ item }: { item: Playlist }) => (
    <TouchableOpacity 
      style={[styles.playlistCard, { backgroundColor: colors.surface }]}
      onPress={() => handlePlaylistPress(item)}
      activeOpacity={0.7}
    >
      <Image source={item.cover} style={styles.playlistCover} />
      <View style={styles.playlistInfo}>
        <Text style={[styles.playlistTitle, { color: colors.text }]}>{item.title}</Text>
        {item.trackCount && (
          <Text style={[styles.playlistSubtitle, { color: colors.textSecondary }]}>{item.trackCount} songs</Text>
        )}
      </View>
      <TouchableOpacity style={[styles.playButton, { backgroundColor: colors.primary }]}>
        <Text style={[styles.playButtonText, { color: colors.background }]}>▶️</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  ), [handlePlaylistPress, colors]);

  // Get current hour for greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  return (
    <ScrollView 
      style={[styles.homeContainer, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      bounces={false}
    >
      {/* Header */}
      <Text style={[styles.header, { color: colors.text }]}>{greeting} 👋</Text>

      {/* Recently Played */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recently Played</Text>
      <View style={styles.playlistGrid}>
        {recentPlaylists.map((playlist) => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            onPress={handlePlaylistPress}
            style={{ width: CARD_WIDTH }}
            colors={colors}
          />
        ))}
      </View>

      {/* Made For You */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Made For You</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalScrollContent}
        decelerationRate="fast"
        snapToInterval={160}
      >
        {madeForYouPlaylists.map((playlist) => (
          <HorizontalPlaylistCard
            key={playlist.id}
            playlist={playlist}
            onPress={handlePlaylistPress}
            colors={colors}
          />
        ))}
      </ScrollView>

      {/* Your Playlists */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Playlists</Text>
      <FlatList
        data={allPlaylists}
        keyExtractor={(item) => item.id}
        renderItem={renderPlaylistItem}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {/* Settings */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Settings</Text>
      <View style={[styles.settingsContainer, { backgroundColor: colors.surface }]}>
        <SettingRow
          title="Notifications"
          value={notifications}
          onValueChange={setNotifications}
          colors={colors}
        />

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.accent }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={[styles.logoutText, { color: colors.background }]}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

// ------------------ Styles ------------------
const styles = StyleSheet.create({
  homeContainer: { 
    flex: 1, 
  },
  header: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 24,
    marginTop: 20,
    marginHorizontal: 20,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: "bold", 
    marginVertical: 16,
    marginHorizontal: 20,
  },
  playlistGrid: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    marginBottom: 24,
    paddingHorizontal: 20,
    gap: 8,
  },
  card: { 
    borderRadius: 12, 
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardImage: { 
    width: "100%", 
    height: 120,
    backgroundColor: "#333",
  },
  cardContent: {
    padding: 12,
  },
  cardText: { 
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 12,
  },
  horizontalScrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  horizontalCard: { 
    marginRight: 0,
    width: 140,
  },
  horizontalImage: { 
    width: "100%", 
    height: 140, 
    borderRadius: 12,
    backgroundColor: "#333",
  },
  horizontalText: { 
    marginTop: 8, 
    fontSize: 14, 
    fontWeight: "600",
  },
  horizontalSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  playlistCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  playlistCover: { 
    width: 60, 
    height: 60, 
    borderRadius: 8,
    backgroundColor: "#333",
  },
  playlistInfo: {
    flex: 1,
    marginLeft: 16,
  },
  playlistTitle: { 
    fontSize: 16, 
    fontWeight: "600",
    marginBottom: 4,
  },
  playlistSubtitle: {
    fontSize: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonText: {
    fontSize: 14,
  },
  separator: {
    height: 12,
  },
  settingsContainer: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingText: { 
    fontSize: 16, 
    fontWeight: "500",
  },
  logoutButton: {
    marginTop: 20,
    padding: 16,
    borderRadius: 25,
    alignItems: "center",
  },
  logoutText: { 
    fontSize: 16, 
    fontWeight: "bold",
  },
  bottomSpacing: {
    height: 40,
  },
});
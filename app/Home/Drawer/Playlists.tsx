import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { getThemeColors } from '../../../constants/Colors';
import { useAppSelector } from '../../../store/hooks';

const { width, height } = Dimensions.get('window');

// Storage keys
const PLAYLIST_STORAGE_KEY = '@playlist_data';
const HISTORY_STORAGE_KEY = '@playlist_history';

// Types
type Song = {
  id: string;
  name: string;
  artist: string;
  addedAt: Date;
};

type PlaylistState = {
  songs: Song[];
  history: PlaylistState[];
  historyIndex: number;
};

type PlaylistAction =
  | { type: 'ADD_SONG'; payload: { name: string; artist: string } }
  | { type: 'REMOVE_SONG'; payload: string }
  | { type: 'CLEAR_PLAYLIST' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'LOAD_STATE'; payload: PlaylistState };

// Playlist Reducer with History Management
function playlistReducer(state: PlaylistState, action: PlaylistAction): PlaylistState {
  const saveToHistory = (currentState: PlaylistState): PlaylistState => ({
    ...currentState,
    history: [...currentState.history.slice(0, currentState.historyIndex + 1), {
      songs: currentState.songs,
      history: [],
      historyIndex: -1,
    }],
    historyIndex: currentState.historyIndex + 1,
  });

  switch (action.type) {
    case 'ADD_SONG':
      const newSong: Song = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: action.payload.name,
        artist: action.payload.artist,
        addedAt: new Date(),
      };
      const stateAfterAdd = saveToHistory(state);
      return {
        ...stateAfterAdd,
        songs: [...stateAfterAdd.songs, newSong],
      };

    case 'REMOVE_SONG':
      const stateAfterRemove = saveToHistory(state);
      return {
        ...stateAfterRemove,
        songs: stateAfterRemove.songs.filter(song => song.id !== action.payload),
      };

    case 'CLEAR_PLAYLIST':
      const stateAfterClear = saveToHistory(state);
      return {
        ...stateAfterClear,
        songs: [],
      };

    case 'UNDO':
      if (state.historyIndex >= 0 && state.history[state.historyIndex]) {
        return {
          ...state.history[state.historyIndex],
          history: state.history,
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;

    case 'REDO':
      if (state.historyIndex < state.history.length - 1) {
        return {
          ...state.history[state.historyIndex + 1],
          history: state.history,
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
}

// Add Song Modal Component
const AddSongModal = React.memo(({ 
  visible, 
  onClose, 
  onAddSong 
}: { 
  visible: boolean;
  onClose: () => void;
  onAddSong: (name: string, artist: string) => void;
}) => {
  const [songName, setSongName] = useState('');
  const [artistName, setArtistName] = useState('');
  
  const modalScale = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const inputScale = useSharedValue(0.8);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 300 });
      modalScale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
      inputScale.value = withDelay(200, withSpring(1, {
        damping: 12,
        stiffness: 150,
      }));
    } else {
      overlayOpacity.value = withTiming(0, { duration: 200 });
      modalScale.value = withTiming(0, { duration: 200 });
      inputScale.value = withTiming(0.8, { duration: 200 });
    }
  }, [visible]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: modalScale.value }],
  }));

  const inputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const handleAddSong = useCallback(() => {
    if (!songName.trim() || !artistName.trim()) {
      Alert.alert('Missing Information', 'Please enter both song name and artist');
      return;
    }

    onAddSong(songName.trim(), artistName.trim());
    setSongName('');
    setArtistName('');
    onClose();
  }, [songName, artistName, onAddSong, onClose]);

  const handleClose = useCallback(() => {
    setSongName('');
    setArtistName('');
    onClose();
  }, [onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View style={[styles.modalOverlay, overlayStyle]}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1}
          onPress={handleClose}
        />
        
        <Animated.View style={[styles.modalContainer, modalStyle]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add New Song</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleClose}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={[styles.modalContent, inputStyle]}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Song Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter song name..."
                placeholderTextColor="#6c7293"
                value={songName}
                onChangeText={setSongName}
                maxLength={50}
                autoFocus
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Artist</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter artist name..."
                placeholderTextColor="#6c7293"
                value={artistName}
                onChangeText={setArtistName}
                maxLength={30}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddSong}
                activeOpacity={0.8}
              >
                <Text style={styles.addButtonText}>Add Song</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
});

// Animated Song Item Component
const AnimatedSongItem = React.memo(({ 
  song, 
  index, 
  onRemove 
}: { 
  song: Song; 
  index: number; 
  onRemove: (id: string) => void; 
}) => {
  const translateX = useSharedValue(width);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    translateX.value = withDelay(
      index * 100,
      withSpring(0, {
        damping: 15,
        stiffness: 100,
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  }, []);

  const handleRemove = useCallback(() => {
    Alert.alert(
      'Remove Song',
      `Remove "${song.name}" by ${song.artist}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setIsRemoving(true);
            translateX.value = withTiming(-width, { duration: 300 });
            opacity.value = withTiming(0, { duration: 300 }, () => {
              runOnJS(onRemove)(song.id);
            });
          },
        },
      ]
    );
  }, [song, onRemove]);

  if (isRemoving) return null;

  return (
    <Animated.View style={[styles.songItem, animatedStyle]}>
      <TouchableOpacity
        style={styles.songContent}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.songNumber}>
          <Text style={styles.songNumberText}>{index + 1}</Text>
        </View>
        
        <View style={styles.songInfo}>
          <Text style={styles.songName} numberOfLines={1}>
            {song.name}
          </Text>
          <Text style={styles.songArtist} numberOfLines={1}>
            {song.artist}
          </Text>
          <Text style={styles.songDate}>
            Added {song.addedAt.toLocaleDateString()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={handleRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.removeButtonText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Stats Component with Reanimated Animation
const PlaylistStats = React.memo(({ songsCount, colors }: { songsCount: number; colors: any }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSequence(
      withTiming(1.1, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );
  }, [songsCount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.statsContainer, { backgroundColor: colors.secondary }, animatedStyle]}>
      <Text style={[styles.statsText, { color: colors.background }]}>
        {songsCount} {songsCount === 1 ? 'Song' : 'Songs'} in Playlist
      </Text>
    </Animated.View>
  );
});

// Action Buttons Component
const ActionButtons = React.memo(({ 
  onClear, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo, 
  songsCount,
  colors
}: {
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  songsCount: number;
  colors: any;
}) => {
  const undoScale = useSharedValue(1);
  const redoScale = useSharedValue(1);
  const clearScale = useSharedValue(1);

  const undoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: undoScale.value }],
    opacity: canUndo ? 1 : 0.5,
  }));

  const redoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: redoScale.value }],
    opacity: canRedo ? 1 : 0.5,
  }));

  const clearAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: clearScale.value }],
    opacity: songsCount > 0 ? 1 : 0.5,
  }));

  const animateButton = (animValue: any, callback: () => void) => {
    animValue.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    callback();
  };

  const handleClear = useCallback(() => {
    if (songsCount === 0) return;
    
    Alert.alert(
      'Clear Playlist',
      'Remove all songs from the playlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive', 
          onPress: () => animateButton(clearScale, onClear)
        },
      ]
    );
  }, [onClear, songsCount]);

  const handleUndo = useCallback(() => {
    if (!canUndo) return;
    animateButton(undoScale, onUndo);
  }, [onUndo, canUndo]);

  const handleRedo = useCallback(() => {
    if (!canRedo) return;
    animateButton(redoScale, onRedo);
  }, [onRedo, canRedo]);

  return (
    <View style={styles.actionButtonsContainer}>
      <Animated.View style={undoAnimatedStyle}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface }]}
          onPress={handleUndo}
          disabled={!canUndo}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>↶ Undo</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={redoAnimatedStyle}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.surface }]}
          onPress={handleRedo}
          disabled={!canRedo}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>↷ Redo</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={clearAnimatedStyle}>
        <TouchableOpacity
          style={[styles.clearButton, { backgroundColor: colors.accent }]}
          onPress={handleClear}
          disabled={songsCount === 0}
          activeOpacity={0.8}
        >
          <Text style={[styles.clearButtonText, { color: colors.background }]}>🗑 Clear All</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

// Empty Playlist Component
const EmptyPlaylist = React.memo(() => {
  const scale = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, {
      damping: 10,
      stiffness: 100,
    });
    rotate.value = withSpring(360, {
      damping: 15,
      stiffness: 200,
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotate.value}deg` }
    ],
  }));

  return (
    <View style={styles.emptyContainer}>
      <Animated.View style={[styles.emptyIcon, animatedStyle]}>
        <Text style={styles.emptyIconText}>🎵</Text>
      </Animated.View>
      <Text style={styles.emptyTitle}>Your playlist is empty</Text>
      <Text style={styles.emptySubtitle}>Tap the + button to add some songs!</Text>
    </View>
  );
});

// Floating Add Button Component
const FloatingAddButton = React.memo(({ onPress }: { onPress: () => void }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    rotation.value = withTiming(rotation.value + 180, { duration: 300 });
    onPress();
  }, [onPress]);

  return (
    <Animated.View style={[styles.floatingButton, animatedStyle]}>
      <TouchableOpacity
        style={styles.floatingButtonTouchable}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

// Main Playlist App Component
export default function PlaylistApp() {
  const [state, dispatch] = useReducer(playlistReducer, {
    songs: [],
    history: [],
    historyIndex: -1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const fadeOpacity = useSharedValue(0);
  
  // Theme integration
  const { mode, customTheme } = useAppSelector((state) => state.theme);
  const colors = getThemeColors(mode, customTheme);

  // AsyncStorage functions
  const saveToStorage = useCallback(async (newState: PlaylistState) => {
    try {
      const playlistData = {
        songs: newState.songs.map(song => ({
          ...song,
          addedAt: song.addedAt.toISOString(),
        })),
        historyIndex: newState.historyIndex,
      };
      
      const historyData = newState.history.map(historyState => ({
        songs: historyState.songs.map(song => ({
          ...song,
          addedAt: song.addedAt.toISOString(),
        })),
        historyIndex: historyState.historyIndex,
      }));

      await AsyncStorage.multiSet([
        [PLAYLIST_STORAGE_KEY, JSON.stringify(playlistData)],
        [HISTORY_STORAGE_KEY, JSON.stringify(historyData)],
      ]);
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
    }
  }, []);

  const loadFromStorage = useCallback(async () => {
    try {
      setIsLoading(true);
      const [[, playlistData], [, historyData]] = await AsyncStorage.multiGet([
        PLAYLIST_STORAGE_KEY,
        HISTORY_STORAGE_KEY,
      ]);

      if (playlistData && historyData) {
        const parsedPlaylist = JSON.parse(playlistData);
        const parsedHistory = JSON.parse(historyData);

        const restoredState: PlaylistState = {
          songs: parsedPlaylist.songs.map((song: any) => ({
            ...song,
            addedAt: new Date(song.addedAt),
          })),
          history: parsedHistory.map((historyState: any) => ({
            songs: historyState.songs.map((song: any) => ({
              ...song,
              addedAt: new Date(song.addedAt),
            })),
            history: [],
            historyIndex: -1,
          })),
          historyIndex: parsedPlaylist.historyIndex,
        };

        dispatch({ type: 'LOAD_STATE', payload: restoredState });
      }
    } catch (error) {
      console.error('Error loading from AsyncStorage:', error);
    } finally {
      setIsLoading(false);
      fadeOpacity.value = withTiming(1, { duration: 600 });
    }
  }, []);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    if (!isLoading) {
      saveToStorage(state);
    }
  }, [state, isLoading, saveToStorage]);

  const mainAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeOpacity.value,
  }));

  const addSong = useCallback((name: string, artist: string) => {
    dispatch({ type: 'ADD_SONG', payload: { name, artist } });
  }, []);

  const removeSong = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_SONG', payload: id });
  }, []);

  const clearPlaylist = useCallback(() => {
    dispatch({ type: 'CLEAR_PLAYLIST' });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const canUndo = state.historyIndex >= 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading your playlist...</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background }, mainAnimatedStyle]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.primary }]}>
        <Text style={[styles.title, { color: colors.primary }]}>My Playlist</Text>
        <PlaylistStats songsCount={state.songs.length} colors={colors} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Action Buttons */}
        <ActionButtons
          onClear={clearPlaylist}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo}
          canRedo={canRedo}
          songsCount={state.songs.length}
          colors={colors}
        />

        {/* Songs List */}
        <View style={styles.songsList}>
          {state.songs.length > 0 ? (
            state.songs.map((song, index) => (
              <AnimatedSongItem
                key={song.id}
                song={song}
                index={index}
                onRemove={removeSong}
              />
            ))
          ) : (
            <EmptyPlaylist />
          )}
        </View>
      </ScrollView>

      {/* Floating Add Button */}
      <FloatingAddButton onPress={() => setShowModal(true)} />

      {/* Add Song Modal */}
      <AddSongModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAddSong={addSong}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
    flexWrap: 'wrap',
  },
  actionButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },
  clearButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  songsList: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  songItem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#16213e',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 8,
  },
  songContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  songNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e94560',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },
  songNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  songInfo: {
    flex: 1,
    marginRight: 20,
  },
  songName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#f5f5f5',
    marginBottom: 8,
  },
  songArtist: {
    fontSize: 14,
    color: '#a0a3bd',
    marginBottom: 4,
  },
  songDate: {
    fontSize: 12,
    color: '#6c7293',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e94560',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    borderWidth: 3,
    borderColor: '#e94560',
  },
  emptyIconText: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f5f5f5',
    marginBottom: 15,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#a0a3bd',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Floating Add Button Styles
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e94560',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 10,
  },
  floatingButtonTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingButtonText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 28,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#1a1a2e',
    borderRadius: 25,
    marginHorizontal: 20,
    maxWidth: 400,
    width: '90%',
    borderWidth: 2,
    borderColor: '#e94560',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 35,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e94560',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#16213e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#f5f5f5',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 18,
  },
  modalContent: {
    padding: 25,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a0a3bd',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#16213e',
    color: '#f5f5f5',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#0f3460',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#16213e',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#a0a3bd',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    flex: 1,
    backgroundColor: '#e94560',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
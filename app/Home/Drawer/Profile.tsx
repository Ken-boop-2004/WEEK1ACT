import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeIn, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { getThemeColors } from '../../../constants/Colors';
import { useAppSelector } from '../../../store/hooks';

// Types
type UserProfile = {
  username: string;
  email: string;
  favoriteGenre: string;
  profileImage: string | null;
};

type Genre = {
  id: string;
  name: string;
  emoji: string;
};

// Predefined genres
const GENRES: Genre[] = [
  { id: '1', name: 'Pop', emoji: '🎵' },
  { id: '2', name: 'Rock', emoji: '🎸' },
  { id: '3', name: 'Hip Hop', emoji: '🎤' },
  { id: '4', name: 'Electronic', emoji: '🎧' },
  { id: '5', name: 'Jazz', emoji: '🎺' },
  { id: '6', name: 'Classical', emoji: '🎼' },
  { id: '7', name: 'R&B', emoji: '🎶' },
  { id: '8', name: 'Country', emoji: '🤠' },
  { id: '9', name: 'Reggae', emoji: '🌴' },
  { id: '10', name: 'Alternative', emoji: '🎭' },
];

// Editable Field Component
const EditableField = React.memo(({ 
  label, 
  value, 
  onSave, 
  placeholder,
  keyboardType = 'default',
  autoCapitalize = 'words',
  maxLength,
  colors,
}: {
  label: string;
  value: string;
  onSave: (newValue: string) => void;
  placeholder: string;
  keyboardType?: any;
  autoCapitalize?: any;
  maxLength?: number;
  colors: any;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = useCallback(() => {
    const trimmedValue = tempValue.trim();
    if (trimmedValue && trimmedValue !== value) {
      onSave(trimmedValue);
    } else {
      setTempValue(value); // Reset if empty or unchanged
    }
    setIsEditing(false);
  }, [tempValue, value, onSave]);

  const handleCancel = useCallback(() => {
    setTempValue(value);
    setIsEditing(false);
  }, [value]);

  const handleEdit = useCallback(() => {
    setTempValue(value);
    setIsEditing(true);
  }, [value]);

  return (
    <Animated.View entering={FadeIn} style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      {isEditing ? (
        <View style={[styles.editingContainer, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <TextInput
            style={[styles.editInput, { color: colors.text }]}
            value={tempValue}
            onChangeText={setTempValue}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            autoFocus
            onSubmitEditing={handleSave}
          />
          <View style={[styles.editActions, { borderTopColor: colors.textSecondary }]}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primary }]} onPress={handleSave}>
              <Text style={[styles.saveButtonText, { color: colors.background }]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity style={[styles.fieldValue, { backgroundColor: colors.surface, borderColor: colors.textSecondary }]} onPress={handleEdit}>
          <Text style={[styles.fieldText, { color: colors.text }]}>{value || placeholder}</Text>
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
});

// Genre Selector Component
const GenreSelector = React.memo(({ 
  selectedGenre, 
  onSelectGenre,
  colors
}: {
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  colors: any;
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSelectGenre = useCallback((genre: Genre) => {
    onSelectGenre(genre.name);
    setIsModalVisible(false);
  }, [onSelectGenre]);

  const renderGenreItem = useCallback(({ item }: { item: Genre }) => (
    <TouchableOpacity
      style={[
        styles.genreItem,
        { backgroundColor: colors.surface, borderColor: colors.textSecondary },
        item.name === selectedGenre && { backgroundColor: colors.primary, borderColor: colors.primary }
      ]}
      onPress={() => handleSelectGenre(item)}
    >
      <Text style={styles.genreEmoji}>{item.emoji}</Text>
      <Text style={[
        styles.genreText,
        { color: item.name === selectedGenre ? colors.background : colors.text }
      ]}>
        {item.name}
      </Text>
      {item.name === selectedGenre && (
        <Text style={[styles.checkmark, { color: colors.background }]}>✓</Text>
      )}
    </TouchableOpacity>
  ), [selectedGenre, handleSelectGenre, colors]);

  return (
    <Animated.View entering={FadeIn} style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>Favorite Genre</Text>
      <TouchableOpacity
        style={[styles.fieldValue, { backgroundColor: colors.surface, borderColor: colors.textSecondary }]}
        onPress={() => setIsModalVisible(true)}
      >
        <View style={styles.genreDisplay}>
          <Text style={styles.genreDisplayEmoji}>
            {GENRES.find(g => g.name === selectedGenre)?.emoji || '🎵'}
          </Text>
          <Text style={[styles.fieldText, { color: selectedGenre ? colors.text : colors.textSecondary }]}>
            {selectedGenre || 'Select your favorite genre'}
          </Text>
        </View>
        <Text style={styles.editIcon}>📝</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={SlideInDown}
            exiting={SlideOutDown}
            style={[styles.modalContent, { backgroundColor: colors.background }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.textSecondary }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Favorite Genre</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={GENRES}
              keyExtractor={(item) => item.id}
              renderItem={renderGenreItem}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.genreGrid}
            />
          </Animated.View>
        </View>
      </Modal>
    </Animated.View>
  );
});

// Profile Image Component
const ProfileImageSection = React.memo(({ 
  imageUri, 
  onImageUpdate 
}: {
  imageUri: string | null;
  onImageUpdate: (uri: string) => void;
}) => {
  const handleImagePicker = useCallback(async () => {
    // Request permissions
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert(
        "Permission Required",
        "Permission to access camera roll is required to change profile picture."
      );
      return;
    }

    // Show options
    Alert.alert(
      "Change Profile Picture",
      "Choose an option",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Camera", onPress: () => openCamera() },
        { text: "Photo Library", onPress: () => openImageLibrary() },
      ]
    );
  }, []);

  const openCamera = useCallback(async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.granted === false) {
      Alert.alert("Permission Required", "Camera permission is required.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageUpdate(result.assets[0].uri);
    }
  }, [onImageUpdate]);

  const openImageLibrary = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onImageUpdate(result.assets[0].uri);
    }
  }, [onImageUpdate]);

  return (
    <Animated.View entering={FadeIn} style={styles.profileImageSection}>
      <TouchableOpacity style={styles.profileImageContainer} onPress={handleImagePicker}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileImagePlaceholderText}>👤</Text>
          </View>
        )}
        <View style={styles.imageEditOverlay}>
          <Text style={styles.imageEditText}>📷</Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.imageHint}>Tap to change profile picture</Text>
    </Animated.View>
  );
});

// Main Profile Screen Component
export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>({
    username: 'Kenni',
    email: 'kenni@example.com',
    favoriteGenre: 'Pop',
    profileImage: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Theme integration
  const { mode, customTheme } = useAppSelector((state) => state.theme);
  const colors = getThemeColors(mode, customTheme);

  // Load profile data on mount
  useEffect(() => {
    loadProfile();
  }, []);

  // Auto-save profile changes
  useEffect(() => {
    if (!isLoading && hasUnsavedChanges) {
      const timeoutId = setTimeout(() => {
        saveProfile();
        setHasUnsavedChanges(false);
      }, 1000); // Auto-save after 1 second of inactivity

      return () => clearTimeout(timeoutId);
    }
  }, [profile, isLoading, hasUnsavedChanges]);

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile changes');
    }
  };

  const updateProfile = useCallback((field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  }, []);

  const handleUsernameChange = useCallback((username: string) => {
    updateProfile('username', username);
  }, [updateProfile]);

  const handleEmailChange = useCallback((email: string) => {
    updateProfile('email', email);
  }, [updateProfile]);

  const handleGenreChange = useCallback((genre: string) => {
    updateProfile('favoriteGenre', genre);
  }, [updateProfile]);

  const handleImageChange = useCallback((imageUri: string) => {
    updateProfile('profileImage', imageUri);
  }, [updateProfile]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
          {hasUnsavedChanges && (
            <Animated.View entering={FadeIn} style={[styles.savingIndicator, { backgroundColor: colors.primary }]}>
              <Text style={[styles.savingText, { color: colors.background }]}>Saving...</Text>
            </Animated.View>
          )}
        </View>

        {/* Profile Image */}
        <ProfileImageSection
          imageUri={profile.profileImage}
          onImageUpdate={handleImageChange}
        />

        {/* Editable Fields */}
        <View style={styles.fieldsContainer}>
          <EditableField
            label="Username"
            value={profile.username}
            onSave={handleUsernameChange}
            placeholder="Enter your username"
            maxLength={20}
            autoCapitalize="words"
            colors={colors}
          />

          <EditableField
            label="Email"
            value={profile.email}
            onSave={handleEmailChange}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={50}
            colors={colors}
          />

          <GenreSelector
            selectedGenre={profile.favoriteGenre}
            onSelectGenre={handleGenreChange}
            colors={colors}
          />
        </View>

        {/* Profile Stats */}
        <View style={styles.statsSection}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Your Music Stats</Text>
          <View style={[styles.statsGrid, { backgroundColor: colors.surface }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>127</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Songs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>18</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Playlists</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>45h</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Month</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  savingIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  savingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
  },
  
  // Profile Image Styles
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImagePlaceholderText: {
    fontSize: 40,
    color: '#666',
  },
  imageEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1DB954',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#121212',
  },
  imageEditText: {
    fontSize: 16,
  },
  imageHint: {
    color: '#666',
    fontSize: 12,
  },

  // Fields Styles
  fieldsContainer: {
    paddingHorizontal: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  fieldValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  fieldText: {
    fontSize: 16,
    flex: 1,
  },
  editIcon: {
    fontSize: 16,
    marginLeft: 10,
  },

  // Editing Styles
  editingContainer: {
    borderRadius: 12,
    borderWidth: 2,
  },
  editInput: {
    fontSize: 16,
    padding: 16,
    borderRadius: 12,
  },
  editActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#1DB954',
    borderBottomRightRadius: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Genre Selector Styles
  genreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  genreDisplayEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  genreGrid: {
    padding: 20,
  },
  genreItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    margin: 6,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGenreItem: {
    borderColor: '#1DB954',
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
  },
  genreEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  genreText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  selectedGenreText: {
    color: '#1DB954',
  },
  checkmark: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Stats Section
  statsSection: {
    marginTop: 40,
    paddingHorizontal: 20,
  },
  statsTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: '#1DB954',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
});
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

// Types
interface FormData {
  username: string;
  email: string;
  genre: string;
}

interface ValidationErrors {
  username?: string;
  email?: string;
  genre?: string;
}

const GENRES = ['Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop'];

// Profile Preview Component with React.memo
const ProfilePreview = React.memo(({ formData }: { formData: FormData }) => {
  const hasData = formData.username || formData.email || formData.genre;
  
  if (!hasData) return null;

  const getGenreImage = (genre: string) => {
    if (!genre) return 'https://via.placeholder.com/100?text=Profile';
    return `https://via.placeholder.com/100?text=${encodeURIComponent(genre)}`;
  };

  return (
    <Animated.View
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(300)}
      style={styles.previewContainer}
    >
      <Text style={styles.previewTitle}>Profile Preview</Text>
      <View style={styles.previewCard}>
        <View style={styles.previewImageContainer}>
          <Text style={styles.previewImageText}>
            {formData.genre ? formData.genre.charAt(0) : '👤'}
          </Text>
        </View>
        <View style={styles.previewInfo}>
          <Text style={styles.previewUsername}>
            {formData.username || 'Username'}
          </Text>
          <Text style={styles.previewEmail}>
            {formData.email || 'email@example.com'}
          </Text>
          <Text style={styles.previewGenre}>
            {formData.genre || 'Select Genre'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
});

// Animated Input Component
const AnimatedInput = React.memo(({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
}) => {
  const shakeValue = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeValue.value }],
  }));

  const triggerShake = useCallback(() => {
    shakeValue.value = withSpring(-10, {}, () => {
      shakeValue.value = withSpring(10, {}, () => {
        shakeValue.value = withSpring(-5, {}, () => {
          shakeValue.value = withSpring(0);
        });
      });
    });
  }, [shakeValue]);

  useEffect(() => {
    if (error) {
      triggerShake();
    }
  }, [error, triggerShake]);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <Animated.View style={animatedStyle}>
        <TextInput
          style={[styles.input, error && styles.inputError]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#666"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
      </Animated.View>
      {error && (
        <Animated.Text
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.errorText}
        >
          {error}
        </Animated.Text>
      )}
    </View>
  );
});

// Genre Selector Component
const GenreSelector = React.memo(({
  selectedGenre,
  onSelectGenre,
  error,
}: {
  selectedGenre: string;
  onSelectGenre: (genre: string) => void;
  error?: string;
}) => {
  const shakeValue = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeValue.value }],
  }));

  const triggerShake = useCallback(() => {
    shakeValue.value = withSpring(-10, {}, () => {
      shakeValue.value = withSpring(10, {}, () => {
        shakeValue.value = withSpring(-5, {}, () => {
          shakeValue.value = withSpring(0);
        });
      });
    });
  }, [shakeValue]);

  useEffect(() => {
    if (error) {
      triggerShake();
    }
  }, [error, triggerShake]);

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>Favorite Genre</Text>
      <Animated.View style={[styles.genreContainer, animatedStyle]}>
        {GENRES.map((genre) => (
          <TouchableOpacity
            key={genre}
            style={[
              styles.genreButton,
              selectedGenre === genre && styles.genreButtonSelected,
            ]}
            onPress={() => onSelectGenre(genre)}
          >
            <Text
              style={[
                styles.genreButtonText,
                selectedGenre === genre && styles.genreButtonTextSelected,
              ]}
            >
              {genre}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
      {error && (
        <Animated.Text
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          style={styles.errorText}
        >
          {error}
        </Animated.Text>
      )}
    </View>
  );
});

export default function ProfileForm() {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    genre: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load cached data on component mount
  useEffect(() => {
    loadCachedData();
  }, []);

  const loadCachedData = async () => {
    try {
      const cachedData = await AsyncStorage.getItem('profileFormData');
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setFormData(parsedData);
      }
    } catch (error) {
      console.error('Error loading cached data:', error);
    }
  };

  const saveCachedData = async (data: FormData) => {
    try {
      await AsyncStorage.setItem('profileFormData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving cached data:', error);
    }
  };

  // Validation functions
  const validateUsername = (username: string): string | undefined => {
    if (!username) return 'Username is required';
    if (username.length < 3 || username.length > 20) {
      return 'Username must be 3-20 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return undefined;
  };

  const validateGenre = (genre: string): string | undefined => {
    if (!genre) return 'Please select a genre';
    return undefined;
  };

  // Real-time validation
  const handleUsernameChange = (username: string) => {
    setFormData(prev => ({ ...prev, username }));
    const error = validateUsername(username);
    setErrors(prev => ({ ...prev, username: error }));
    saveCachedData({ ...formData, username });
  };

  const handleEmailChange = (email: string) => {
    setFormData(prev => ({ ...prev, email }));
    const error = validateEmail(email);
    setErrors(prev => ({ ...prev, email: error }));
    saveCachedData({ ...formData, email });
  };

  const handleGenreSelect = (genre: string) => {
    setFormData(prev => ({ ...prev, genre }));
    const error = validateGenre(genre);
    setErrors(prev => ({ ...prev, genre: error }));
    saveCachedData({ ...formData, genre });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Validate all fields
    const usernameError = validateUsername(formData.username);
    const emailError = validateEmail(formData.email);
    const genreError = validateGenre(formData.genre);

    const newErrors = {
      username: usernameError,
      email: emailError,
      genre: genreError,
    };

    setErrors(newErrors);

    // Check if form is valid
    const isValid = !usernameError && !emailError && !genreError;

    if (isValid) {
      // Clear cache and reset form
      try {
        await AsyncStorage.removeItem('profileFormData');
        setFormData({ username: '', email: '', genre: '' });
        setErrors({});
        Alert.alert('Success', 'Profile created successfully!');
      } catch (error) {
        console.error('Error clearing cache:', error);
      }
    } else {
      Alert.alert('Validation Error', 'Please fix all errors before submitting');
    }

    setIsSubmitting(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar} />
          </View>
          <Text style={styles.myProfileTitle}>My Profile</Text>
        </View>

        <View style={styles.formContainer}>
          <AnimatedInput
            label="Username"
            value={formData.username}
            onChangeText={handleUsernameChange}
            placeholder="Enter your username"
            error={errors.username}
            autoCapitalize="none"
          />

          <AnimatedInput
            label="Email"
            value={formData.email}
            onChangeText={handleEmailChange}
            placeholder="Enter your email"
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <GenreSelector
            selectedGenre={formData.genre}
            onSelectGenre={handleGenreSelect}
            error={errors.genre}
          />

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Saving...' : 'Save Profile'}
            </Text>
          </TouchableOpacity>
        </View>

        <ProfilePreview formData={formData} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 10,
  },
  avatarWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#2A2A2A',
  },
  myProfileTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1DE870',
  },
  formContainer: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#fff',
    padding: 15,
    borderRadius: 24,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#1DE870',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 5,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreButton: {
    backgroundColor: '#1E1E1E',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#1DE870',
  },
  genreButtonSelected: {
    backgroundColor: '#1DE870',
    borderColor: '#1DE870',
  },
  genreButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  genreButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#1DE870',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#666',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    padding: 20,
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  previewCard: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  previewImageText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  previewInfo: {
    flex: 1,
  },
  previewUsername: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  previewEmail: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 5,
  },
  previewGenre: {
    fontSize: 14,
    color: '#1DB954',
    fontWeight: '500',
  },
});

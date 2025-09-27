import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface MusicPlayerProps {
  songTitle: string;
  songArtist: string;
  youtubeUrl?: string;
  onPlaybackStateChange?: (isPlaying: boolean) => void;
}

export default function MusicPlayer({ 
  songTitle, 
  songArtist, 
  youtubeUrl, 
  onPlaybackStateChange 
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const playButtonScale = useSharedValue(1);

  const playPause = async () => {
    if (youtubeUrl) {
      await playYouTubeAudio();
    } else {
      Alert.alert('No Audio', 'No audio source available for this song');
    }
  };

  const stop = async () => {
    setIsPlaying(false);
    onPlaybackStateChange?.(false);
  };

  const playYouTubeAudio = async () => {
    if (!youtubeUrl) return;

    setIsLoading(true);
    
    try {
      const result = await WebBrowser.openBrowserAsync(youtubeUrl, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        controlsColor: '#1DB954',
      });

      if (result.type === 'dismiss') {
        setIsPlaying(false);
        onPlaybackStateChange?.(false);
      } else {
        setIsPlaying(true);
        onPlaybackStateChange?.(true);
      }
    } catch (error) {
      console.error('Error opening YouTube video:', error);
      Alert.alert('Error', 'Could not open YouTube video');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPress = async () => {
    playButtonScale.value = withSpring(0.95, {}, () => {
      playButtonScale.value = withSpring(1);
    });

    await playPause();
  };

  const handleStopPress = async () => {
    playButtonScale.value = withSpring(0.95, {}, () => {
      playButtonScale.value = withSpring(1);
    });
    await stop();
  };

  const animatedPlayButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playButtonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{songTitle}</Text>
        <Text style={styles.songArtist} numberOfLines={1}>{songArtist}</Text>
      </View>

      <View style={styles.controls}>
        <Animated.View style={animatedPlayButtonStyle}>
          <TouchableOpacity
            style={[styles.playButton, isPlaying && styles.playingButton]}
            onPress={handlePlayPress}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.playButtonText}>
                {isPlaying ? '⏸️' : '▶️'}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.stopButton}
          onPress={handleStopPress}
          disabled={!youtubeUrl}
        >
          <Text style={styles.stopButtonText}>⏹️</Text>
        </TouchableOpacity>

        {youtubeUrl && (
          <TouchableOpacity
            style={styles.youtubeButton}
            onPress={() => WebBrowser.openBrowserAsync(youtubeUrl)}
          >
            <Text style={styles.youtubeButtonText}>📺</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E1E1E',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#1DB954',
  },
  songInfo: {
    marginBottom: 15,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 8,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  playButton: {
    backgroundColor: '#1DB954',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playingButton: {
    backgroundColor: '#FF6B35',
  },
  playButtonText: {
    fontSize: 20,
  },
  stopButton: {
    backgroundColor: '#FF4444',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    fontSize: 16,
  },
  youtubeButton: {
    backgroundColor: '#FF0000',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  youtubeButtonText: {
    fontSize: 16,
  },
});

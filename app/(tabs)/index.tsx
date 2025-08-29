import { Image } from 'expo-image';
import { Platform, StyleSheet, Dimensions } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#E0F7FA", dark: "#004D40" }}
      headerImage={
        <Image
          source={require("../../Image/5eeea355389655.59822ff824b72.gif")}
          style={styles.headerGif}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">HELLOWORLD!!</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="title">AND YOU</ThemedText>
        <HelloWave />
        <ThemedText type="subtitle">Step 1: I LOVE IT</ThemedText>
        <ThemedText type="default">ID: 23104084</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: CERTIFICATE TO PASAR</ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: DSA NALANG</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  headerGif: {
    width: width,
    height: 300,
    resizeMode: "cover",
  },
});

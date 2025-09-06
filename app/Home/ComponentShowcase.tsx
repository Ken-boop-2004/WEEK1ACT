import React, { useState } from "react";
import { StyleSheet, Alert, Dimensions, TextInput } from "react-native";
import { Image } from "expo-image";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { HelloWave } from "@/components/HelloWave";

const { width } = Dimensions.get("window");

export default function ComponentShowcase() {
  const [userInput, setUserInput] = useState("");

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#E0F7FA", dark: "#004D40" }}
      headerImage={
        <Image
          source={require("../../Image/9a3c3fb5f73822af8514df07f6676392.gif")} 
          style={styles.headerGif}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Component Scavenger Hunt</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText>
          ✅ This page demonstrates the use of basic React Native components:
        </ThemedText>
        <ThemedText>- Text</ThemedText>
        <ThemedText>- Image</ThemedText>
        <ThemedText>- Button</ThemedText>
        <ThemedText>- ScrollView</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Enter Your Text</ThemedText>
        <TextInput
          style={styles.input}
          placeholder="Type something..."
          placeholderTextColor="#999"
          value={userInput}
          onChangeText={setUserInput}
        />
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Example Button</ThemedText>
        <ThemedText
          style={styles.button}
          onPress={() =>
            Alert.alert("Hello!", userInput ? `You typed: ${userInput}` : "You pressed it!! You now have a wonderful day.")
          }
        >
          <HelloWave /> Press Me
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Scroll Example</ThemedText>
        <ThemedText>This is extra text inside a ScrollView layout.</ThemedText>
        <ThemedText>You can keep adding more components below.</ThemedText>
        <ThemedText>The ScrollView lets the content extend beyond the screen height.</ThemedText>
        <ThemedText>The ScrollView lets the content extend beyond the screen height.</ThemedText>
        <ThemedText>The ScrollView lets the content extend beyond the screen height.</ThemedText>
        <ThemedText>The ScrollView lets the content extend beyond the screen height.</ThemedText>
        <ThemedText>The ScrollView lets the content extend beyond the screen height.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Example Image</ThemedText>
        <Image source={require("../../Image/JOSEinTHEwater.jpg")} style={styles.contentImage} />
        <Image source={require("../../Image/unnamed.jpg")} style={styles.contentImage} />
        <Image source={require("../../Image/unnamed.png")} style={styles.contentImage} />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  section: {
    gap: 8,
    marginBottom: 16,
  },
  headerGif: {
    width: width,
    height: 300,
    resizeMode: "cover",
  },
  button: {
    marginTop: 8,
    fontSize: 16,
    color: "#007AFF",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#fff",
  },
  contentImage: {
    width: width * 0.9,
    height: 180,
    alignSelf: "center",
    borderRadius: 12,
    resizeMode: "contain",
  },
});

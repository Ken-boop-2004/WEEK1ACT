import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SpotifyLoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  return (
    <LinearGradient
      colors={['#121212', '#000000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 2, y: 2 }}
      style={styles.container}
    >
      {/* Spotify Logo */}
      <Image 
        source={require('../Image/Spotify_icon.svg.png')}  // ✅ use PNG or WEBP
        style={styles.logo} 
      />

      {/* Title */}
      <Text style={styles.title}>Spotify</Text>

      {/* Username */}
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#666"
        value={username}
        onChangeText={setUsername}
      />

      {/* Password */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#666"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Forgot Password */}
      <TouchableOpacity style={styles.forgotWrapper} activeOpacity={0.7}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      {/* Sign In */}
      <TouchableOpacity style={styles.signInButton} onPress={() => router.push("/Home/Drawer")}>
        <Text style={styles.signInText}>Sign In</Text>
      </TouchableOpacity>

      {/* Social Logins */}
      <Text style={styles.socialText}>Be Correct With</Text>
      <View style={styles.socialContainer}>
        <TouchableOpacity activeOpacity={0.8}>
          <Image 
            source={require('../Image/fb_icon4.webp')} 
            style={styles.socialIcon} 
          />
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8}>
          <Image 
            source={require('../Image/google_icon4.webp')} 
            style={styles.socialIcon} 
          />
        </TouchableOpacity>
      </View>


      {/* Components Drawer Trigger */}
      <TouchableOpacity
        style={styles.drawerTrigger}
        activeOpacity={0.8}
        onPress={() => setIsDrawerOpen(true)}
      >
        <Text style={styles.drawerTriggerText}>Open Components Drawer</Text>
      </TouchableOpacity>

      {/* Sign Up */}
      <Text style={styles.signupText}>
        Don’t have an account?{" "}
        <TouchableOpacity onPress={() => router.push("/SignUp")}>
          <Text style={styles.signupLink}>Sign Up</Text>
        </TouchableOpacity>
      </Text>

      {/* Bottom Drawer for Component Screens */}
      <Modal
        transparent
        animationType="slide"
        visible={isDrawerOpen}
        onRequestClose={() => setIsDrawerOpen(false)}
      >
        <Pressable style={styles.drawerOverlay} onPress={() => setIsDrawerOpen(false)}>
          <Pressable style={styles.drawerContainer}>
            <Text style={styles.drawerTitle}>Component Screens</Text>
            <Text style={styles.drawerSubtitle}>
              Quick links to your demo and explore pages.
            </Text>

            <TouchableOpacity
              style={styles.drawerItem}
              activeOpacity={0.8}
              onPress={() => {
                setIsDrawerOpen(false);
                router.push("/Home/ComponentShowcase");
              }}
            >
              <Text style={styles.drawerItemTitle}>Component Showcase</Text>
              <Text style={styles.drawerItemDescription}>
                See the scavenger hunt of basic React Native components.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.drawerItem}
              activeOpacity={0.8}
              onPress={() => {
                setIsDrawerOpen(false);
                router.push("/Home/explore");
              }}
            >
              <Text style={styles.drawerItemTitle}>Explore</Text>
              <Text style={styles.drawerItemDescription}>
                Learn about routing, images, animations, and more.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.drawerCloseButton}
              activeOpacity={0.8}
              onPress={() => setIsDrawerOpen(false)}
            >
              <Text style={styles.drawerCloseText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 34,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1E1E1E',
    borderRadius: 30,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
  },
  forgotWrapper: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 25,
  },
  forgotText: {
    color: '#888',
    fontSize: 14,
  },
  signInButton: {
    width: '100%',
    height: 55,
    backgroundColor: '#1DB954',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  signInText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  socialText: {
    color: '#1DB954', 
    marginBottom: 15,
    fontSize: 15,
    fontWeight: '600',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30, // ✅ RN 0.71+ supports gap, else use marginHorizontal
    marginBottom: 30,
  },
  socialIcon: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
  },
  signupText: {
    color: '#888',
  },
  signupLink: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
  drawerTrigger: {
    marginTop: 10,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1DB954',
  },
  drawerTriggerText: {
    color: '#1DB954',
    fontSize: 14,
    fontWeight: '600',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    backgroundColor: '#121212',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  drawerSubtitle: {
    fontSize: 13,
    color: '#bbb',
    marginBottom: 16,
  },
  drawerItem: {
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#1E1E1E',
    marginBottom: 10,
  },
  drawerItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
    paddingHorizontal: 10,
  },
  drawerItemDescription: {
    fontSize: 12,
    color: '#aaa',
    paddingHorizontal: 10,
  },
  drawerCloseButton: {
    alignSelf: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#1DB954',
  },
  drawerCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState({ day: '', month: '', year: '' });
  const [gender, setGender] = useState('');

  return (
    <LinearGradient
      colors={['#121212', '#000000']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Logo + Title */}
      <View style={styles.logoRow}>
        <Image 
          source={require('../Image/Spotify_icon.svg.png')}  
          style={styles.logo} 
        />
        <Text style={styles.title}>Spotify</Text>
      </View>

      {/* Email */}
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
      />

      {/* Full Name */}
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#666"
        value={fullName}
        onChangeText={setFullName}
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

      {/* Date of Birth */}
      <View style={styles.dobWrapper}>
        <Text style={styles.dobLabel}>Date Of Birth :</Text>
        <TextInput
          style={styles.dobInput}
          placeholder="DD"
          placeholderTextColor="#666"
          keyboardType="numeric"
          maxLength={2}
          value={dob.day}
          onChangeText={(text) => setDob({ ...dob, day: text })}
        />
        <TextInput
          style={styles.dobInput}
          placeholder="MM"
          placeholderTextColor="#666"
          keyboardType="numeric"
          maxLength={2}
          value={dob.month}
          onChangeText={(text) => setDob({ ...dob, month: text })}
        />
        <TextInput
          style={styles.dobInput}
          placeholder="YY"
          placeholderTextColor="#666"
          keyboardType="numeric"
          maxLength={4}
          value={dob.year}
          onChangeText={(text) => setDob({ ...dob, year: text })}
        />
      </View>

      {/* Gender */}
      <View style={styles.genderContainer}>
        {/* Male */}
        <TouchableOpacity 
          style={styles.genderOption}
          onPress={() => setGender('male')}
        >
          <View style={[styles.radioCircle, gender === 'male' && styles.radioSelected]} />
          <Text style={styles.genderText}>Male</Text>
        </TouchableOpacity>

        {/* Female */}
        <TouchableOpacity 
          style={styles.genderOption}
          onPress={() => setGender('female')}
        >
          <View style={[styles.radioCircle, gender === 'female' && styles.radioSelected]} />
          <Text style={styles.genderText}>Female</Text>
        </TouchableOpacity>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.signUpButton}>
        <Text style={styles.signUpText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Social */}
      <Text style={styles.socialText}>Sign Up With</Text>
      <View style={styles.socialContainer}>
        <TouchableOpacity>
          <Image 
            source={require('../Image/fb_icon4.webp')} 
            style={styles.socialIcon} 
          />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image 
            source={require('../Image/google_icon4.webp')} 
            style={styles.socialIcon} 
          />
        </TouchableOpacity>
      </View>

      {/* Already have account */}
      <Text style={styles.signinText}>
        Already have an account?{" "} 
        <Link href="/Signin" style={styles.signinLink}>
          Sign In
        </Link>
      </Text>
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
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 8,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
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
  dobWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dobLabel: {
    color: '#1DB954',
    marginRight: 10,
    fontWeight: '600',
  },
  dobInput: {
    width: 55,
    height: 45,
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
    marginHorizontal: 5,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '70%',
    marginBottom: 25,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#1DB954',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioSelected: {
    backgroundColor: '#1DB954',
  },
  genderText: {
    color: '#fff',
    fontSize: 14,
  },
  signUpButton: {
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
  signUpText: {
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
    gap: 30,
    marginBottom: 30,
  },
  socialIcon: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
  },
  signinText: {
    color: '#888',
  },
  signinLink: {
    color: '#1DB954',
    fontWeight: 'bold',
  },
});
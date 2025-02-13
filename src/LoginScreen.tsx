import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from "react-native";
import auth from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "556028993106-5jf05j3rcs5c40e8v3gpi8p82385tu6e.apps.googleusercontent.com.apps.googleusercontent.com", // Replace with your Web Client ID from Firebase Console
    });
  }, []);

  // Handle Email/Password Login
  const handleLogin = async () => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert("Success", "Logged in successfully!");
    } catch (error: unknown) {
      const err = error as Error;
      Alert.alert("Error", err.message);
    }
  };

  // Google Sign-In
  // Google Sign-In
const googleLogin = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();

    if (response.type === 'success') {
      const { idToken } = response.data;

      if (!idToken) {
        throw new Error('Google Sign-In failed. No ID token received.');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);

      Alert.alert('Success', 'Logged in with Google!');
    } else {
      Alert.alert('Google Sign-In Cancelled', 'User cancelled the sign-in process.');
    }
  } catch (error) {
    Alert.alert('Google Sign-In Error', String(error));
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>AlumNITD</Text>
      <Text style={styles.subtitle}>Welcome Back,</Text>
      <Text style={styles.description}>
        Please log in to continue and make the most of our Alumni platform.
      </Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="College Email (@nitdelhi.ac.in)"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />

      {/* Forgot Password */}
      <TouchableOpacity onPress={() => Alert.alert("Reset Password", "Feature Coming Soon!")}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      {/* Social Logins */}

      <TouchableOpacity style={[styles.socialButton, { backgroundColor: "#fff" }]} onPress={googleLogin}>
        <Image source={require("./assets/google.png")} style={styles.icon} />
        <Text style={styles.socialText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Register Link (Updated) */}

      
      <Text style={styles.registerText}>
        Don’t have an account?{" "}
        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.registerText}>Register Now</Text>
        </TouchableOpacity>
      </Text>

      {/* Contact */}
      <Text style={styles.contactText}>
        Contact us: support@alumnitd.com | +91-XXX-XXXX-XXXX
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, backgroundColor: "#F0F0F5" },
  title: { fontSize: 28, fontWeight: "bold", color: "#4A00E0" },
  subtitle: { fontSize: 20, fontWeight: "600", marginVertical: 5 },
  description: { fontSize: 14, textAlign: "center", marginBottom: 20 },
  input: { width: "100%", padding: 12, borderWidth: 1, borderRadius: 8, backgroundColor: "#fff", marginBottom: 10 },
  forgotPassword: { color: "#4A00E0", marginBottom: 15 },
  button: { backgroundColor: "#4A00E0", padding: 12, borderRadius: 8, width: "100%", alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16 },
  orText: { marginVertical: 10 },
  socialButton: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 8, marginBottom: 10, width: "100%" },
  icon: { width: 24, height: 24, marginRight: 10 },
  socialText: { color: "#000", fontSize: 16 },
  registerText: { marginTop: 10 },
  registerLink: { color: "#4A00E0", fontWeight: "bold" },
  contactText: { fontSize: 12, color: "#555", marginTop: 20, textAlign: "center" },
});

export default LoginScreen;

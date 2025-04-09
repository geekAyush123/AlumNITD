import React, { useState, useEffect, useCallback } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, Keyboard, TouchableWithoutFeedback 
} from "react-native";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { useFocusEffect } from "@react-navigation/native";

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Reset state when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setEmail("");
      setPassword("");
      setErrorMessage(null);
      setIsResettingPassword(false);
    }, [])
  );

  // Configure Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "556028993106-5jf05j3rcs5c40e8v3gpi8p82385tu6e.apps.googleusercontent.com", // Replace with your Web Client ID from Firebase Console
    });
  }, []);

  // Handle Email/Password Login
  const handleLogin = async () => {
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      await auth().signInWithEmailAndPassword(email, password);
      navigation.navigate("Home");
    } catch (error) {
      const err = error as FirebaseAuthTypes.NativeFirebaseAuthError;
      console.log("Login Error:", err);
      setErrorMessage("Incorrect email or password");
    }
  };

  // Google Sign-In
  const googleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // Get the ID token (new correct way)
      const { idToken } = await GoogleSignin.getTokens();
  
      if (idToken) {
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);
        await auth().signInWithCredential(googleCredential);
        navigation.navigate("Home");
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("Google Sign-In cancelled by user");
        return;
      }
      console.error("Google Sign-In Error:", error);
      Alert.alert("Error", error.message || "Failed to sign in with Google.");
    }
  };

  // Handle Password Reset
  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address to reset password.");
      return;
    }

    // Check if email ends with @nitdelhi.ac.in
    if (!email.endsWith("@nitdelhi.ac.in")) {
      setErrorMessage("Please use your college email (@nitdelhi.ac.in)");
      return;
    }

    setIsResettingPassword(true);
    setErrorMessage(null);

    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert(
        "Password Reset Email Sent",
        `Please check your email (${email}) for instructions to reset your password.`,
        [
          {
            text: "OK",
            onPress: () => setIsResettingPassword(false),
          },
        ]
      );
    } catch (error) {
      const err = error as FirebaseAuthTypes.NativeFirebaseAuthError;
      console.log("Password Reset Error:", err);
      
      let errorMessage = "Failed to send password reset email. Please try again.";
      if (err.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      }

      setErrorMessage(errorMessage);
      setIsResettingPassword(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

        {/* Password Input - Only show if not resetting password */}
        {!isResettingPassword && (
          <TextInput
            style={styles.input}
            placeholder="Password"
            onChangeText={setPassword}
            value={password}
            secureTextEntry
          />
        )}

        {/* Error Message */}
        {errorMessage && <Text style={styles.errorMessage}>{errorMessage}</Text>}

        {/* Forgot Password */}
        {!isResettingPassword ? (
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>Forgot Password?</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            onPress={() => setIsResettingPassword(false)}
            style={styles.backToLogin}
          >
            <Text style={styles.forgotPassword}>Back to Login</Text>
          </TouchableOpacity>
        )}

        {/* Login Button - Only show if not resetting password */}
        {!isResettingPassword ? (
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleForgotPassword}
            disabled={isResettingPassword}
          >
            <Text style={styles.buttonText}>
              {isResettingPassword ? "Sending..." : "Send Reset Email"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Social Logins - Only show if not resetting password */}
        {!isResettingPassword && (
          <TouchableOpacity style={[styles.socialButton, { backgroundColor: "#fff" }]} onPress={googleLogin}>
            <Image source={require("./assets/google.png")} style={styles.icon} />
            <Text style={styles.socialText}>Continue with Google</Text>
          </TouchableOpacity>
        )}

        {/* Register Link - Only show if not resetting password */}
        {!isResettingPassword && (
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Register Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Contact */}
        <Text style={styles.contactText}>
          Contact us: support@alumnitd.com | +91-XXX-XXXX-XXXX
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F0F0F5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4A00E0",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 5,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  errorMessage: {
    color: "#E53E3E",
    fontSize: 14,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  forgotPassword: {
    color: "#4A00E0",
    marginBottom: 15,
  },
  backToLogin: {
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4A00E0",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  socialText: {
    color: "#000",
    fontSize: 16,
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 10,
    alignItems: "center",
  },
  registerText: {
    fontSize: 14,
    color: "#000",
  },
  registerLink: {
    color: "#4A00E0",
    fontWeight: "bold",
  },
  contactText: {
    fontSize: 12,
    color: "#555",
    marginTop: 20,
    textAlign: "center",
  },
});

export default LoginScreen;
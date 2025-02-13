import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import auth from "@react-native-firebase/auth";

const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Registration
  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword || !role) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    if (!email.endsWith("@nitdelhi.ac.in")) {
      Alert.alert("Error", "Use your college email (@nitdelhi.ac.in).");
      return;
    }

    setLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email, password);
      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("LoginScreen");
    } catch (error: unknown) { // Explicitly typing `error` as `unknown`
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Register</Text>

      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>College Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email (@nitdelhi.ac.in)"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Create a password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Text style={styles.label}>Role Selection</Text>
      <View style={styles.dropdownContainer}>
        <RNPickerSelect
          onValueChange={setRole}
          items={[
            { label: "Student", value: "Student" },
            { label: "Alumni", value: "Alumni" },
            { label: "TNP Member", value: "TNP Member" },
          ]}
          placeholder={{ label: "Select role", value: "" }}
        />
      </View>

      <Text style={styles.label}>Graduation Year</Text>
      <View style={styles.dropdownContainer}>
        <RNPickerSelect
          onValueChange={setGraduationYear}
          items={[
            { label: "2023", value: "2023" },
            { label: "2024", value: "2024" },
            { label: "2025", value: "2025" },
            { label: "2026", value: "2026" },
          ]}
          placeholder={{ label: "Select year", value: "" }}
        />
      </View>

      <TouchableOpacity
        style={styles.registerButton}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.registerText}>
          {loading ? "Registering..." : "Register"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>Already have an account? Login Here</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 5, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 15, color:"#000" },
  dropdownContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 15 , color:"#000"},
  registerButton: { backgroundColor: "#4A00E0", padding: 15, borderRadius: 8, alignItems: "center" },
  registerText: { color: "#000", fontSize: 18, fontWeight: "bold" },
  loginText: { fontSize: 16, textAlign: "center", color: "#4A00E0", marginTop: 15 },
});

export default RegisterScreen;

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";

const RegisterScreen = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Register</Text>

      {/* Full Name Input */}
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={setFullName}
      />

      {/* Email Input */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Create a password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Confirm Password */}
      <Text style={styles.label}>Confirm Password</Text>
      <TextInput
        style={styles.input}
        placeholder="Confirm your password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* Role Selection (Dropdown) */}
      <Text style={styles.label}>Role Selection</Text>
      <View style={styles.dropdownContainer}>
        <RNPickerSelect
          onValueChange={(value) => setRole(value)}
          items={[
            { label: "Student", value: "Student" },
            { label: "Alumni", value: "Alumni" },
            { label: "TNP Member", value: "TNP Member" },
          ]}
          placeholder={{ label: "Select role", value: "" }}
        />
      </View>

      {/* Graduation Year Selection */}
      <Text style={styles.label}>Graduation Year</Text>
      <View style={styles.dropdownContainer}>
        <RNPickerSelect
          onValueChange={(value) => setGraduationYear(value)}
          items={[
            { label: "2023", value: "2023" },
            { label: "2024", value: "2024" },
            { label: "2025", value: "2025" },
            { label: "2026", value: "2026" },
          ]}
          placeholder={{ label: "Select year", value: "" }}
        />
      </View>

      {/* Register Button */}
      <TouchableOpacity style={styles.registerButton}>
        <Text style={styles.registerText}>Register</Text>
      </TouchableOpacity>

      {/* Footer Links */}
      <Text style={styles.footerText}>
        Contact Us: support@alumnitd.com | +91 XXXXXXXXXX
      </Text>
      <Text style={styles.footerLinks}>
        Privacy Policy | Terms and Conditions | About Us
      </Text>
      <TouchableOpacity>
        <Text style={styles.loginText}>Already have an account? Login Here</Text>
      </TouchableOpacity>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff", // No background color
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  registerButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  registerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  footerText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
  },
  footerLinks: {
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline",
    marginVertical: 10,
  },
  loginText: {
    fontSize: 16,
    textAlign: "center",
    color: "#0000ff",
    textDecorationLine: "underline",
  },
});

export default RegisterScreen;
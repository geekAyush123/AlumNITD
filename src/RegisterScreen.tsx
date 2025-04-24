import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import Ionicons from 'react-native-vector-icons/Ionicons';
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import Geolocation from "@react-native-community/geolocation";
import axios from "axios";

const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const MAPTILER_API_KEY = "BqTvnw9XEB3yLtGALyZG";
  const years = Array.from({ length: 87 }, (_, i) => (2014 + i).toString());

  const pickerSelectStyles = {
    inputIOS: {
      fontSize: 16,
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 12,
      color: '#1F2937',
      paddingRight: 30,
      marginBottom: 16,
      backgroundColor: '#F9FAFB',
    },
    inputAndroid: {
      fontSize: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 12,
      color: '#1F2937',
      paddingRight: 30,
      marginBottom: 16,
      backgroundColor: '#F9FAFB',
    },
    placeholder: {
      color: '#9CA3AF',
    },
    iconContainer: {
      top: 18,
      right: 15,
    },
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password || !confirmPassword || !role || !location) {
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
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      await firestore().collection("users").doc(userCredential.user.uid).set({
        fullName,
        email,
        role,
        graduationYear,
        location,
      });
      Alert.alert("Success", "Account created successfully!");
      navigation.navigate("Login");
    } catch (error: unknown) {
      if (error instanceof Error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Error", "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get(
        `https://api.maptiler.com/geocoding/${query}.json?key=${MAPTILER_API_KEY}`
      );
      setSuggestions(response.data.features);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleLocationSelect = (item: any) => {
    setLocation(item.place_name);
    setSearchQuery(item.place_name);
    setSuggestions([]);
  };

  const useGPSLocation = () => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const geoLocation = `Lat: ${latitude}, Lng: ${longitude}`;
        setLocation(geoLocation);
        setSearchQuery(geoLocation);
        Geolocation.clearWatch(watchId);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            Alert.alert("Location Error", "Location permission denied.");
            break;
          case error.POSITION_UNAVAILABLE:
            Alert.alert("Location Error", "Location information unavailable.");
            break;
          case error.TIMEOUT:
            Alert.alert("Location Error", "Location request timed out.");
            break;
          default:
            Alert.alert("Location Error", "An unknown error occurred.");
            break;
        }
        Geolocation.clearWatch(watchId);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Create Account</Text>
            <Text style={styles.subheader}>Join our community today</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <Text style={styles.label}>College Email</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="yourname@nitdelhi.ac.in"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
            </View>

            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Create a password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Confirm your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity 
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#6B7280" 
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Role Selection</Text>
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={setRole}
                items={[
                  { label: "Student", value: "Student" },
                  { label: "Alumni", value: "Alumni" },
                ]}
                placeholder={{
                  label: "Select your role",
                  value: "",
                  color: '#9CA3AF',
                }}
                style={pickerSelectStyles}
                Icon={() => (
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                )}
              />
            </View>

            <Text style={styles.label}>Graduation Year</Text>
            <View style={styles.pickerContainer}>
              <RNPickerSelect
                onValueChange={setGraduationYear}
                items={years.map((year) => ({ label: year, value: year }))}
                placeholder={{
                  label: "Select graduation year",
                  value: "",
                  color: '#9CA3AF',
                }}
                style={pickerSelectStyles}
                Icon={() => (
                  <Ionicons name="chevron-down" size={20} color="#6B7280" />
                )}
              />
            </View>

            <Text style={styles.label}>Location</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="location-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your location"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  fetchSuggestions(text);
                }}
              />
            </View>

            {suggestions.length > 0 && (
              <View style={styles.suggestionsContainer}>
                <FlatList
                  data={suggestions}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.suggestionItem}
                      onPress={() => handleLocationSelect(item)}
                    >
                      <Text style={styles.suggestionText}>{item.place_name}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.suggestionsList}
                  nestedScrollEnabled
                />
              </View>
            )}

            <TouchableOpacity style={styles.gpsButton} onPress={useGPSLocation}>
              <Ionicons name="locate-outline" size={18} color="#FFFFFF" />
              <Text style={styles.gpsButtonText}> Use My Current Location</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
              onPress={handleRegister} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerText}>Register</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginLink}>Login Here</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 24, 
    backgroundColor: "#FFFFFF",
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 32,
    alignItems: 'center',
  },
  header: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: '#1F2937',
    marginBottom: 8,
  },
  subheader: {
    fontSize: 16,
    color: '#6B7280',
  },
  formContainer: {
    width: '100%',
  },
  label: { 
    fontSize: 14, 
    marginBottom: 8, 
    fontWeight: "600",
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  input: { 
    flex: 1,
    paddingVertical: 16,
    fontSize: 16, 
    color: '#1F2937',
  },
  inputIcon: {
    marginRight: 12,
  },
  eyeIcon: {
    padding: 8,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  registerButton: { 
    backgroundColor: "#4F46E5", 
    padding: 18, 
    borderRadius: 12, 
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#4F46E5",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  registerButtonDisabled: {
    backgroundColor: "#A5B4FC",
  },
  registerText: { 
    color: "#FFFFFF", 
    fontSize: 16, 
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: { 
    fontSize: 14, 
    color: "#6B7280",
  },
  loginLink: {
    fontSize: 14,
    color: "#4F46E5",
    fontWeight: "600",
  },
  suggestionsContainer: {
    maxHeight: 150,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  suggestionsList: {
    width: '100%',
  },
  suggestionItem: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: "#F3F4F6",
  },
  suggestionText: {
    color: '#1F2937',
  },
  gpsButton: { 
    backgroundColor: "#10B981", 
    padding: 14, 
    borderRadius: 12, 
    width: "100%", 
    alignItems: "center",
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 16,
  },
  gpsButtonText: { 
    color: "#FFFFFF", 
    fontSize: 14,
    fontWeight: '500',
  },
});

export default RegisterScreen;
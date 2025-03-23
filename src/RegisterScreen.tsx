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
  ScrollView, // Add ScrollView
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
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

  // MapTiler API Key
  const MAPTILER_API_KEY = "BqTvnw9XEB3yLtGALyZG";

  // Handle registration
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
      const userId = userCredential.user.uid;
      await firestore().collection("users").doc(userId).set({
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

  // Fetch location suggestions from MapTiler Geocoding API
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

  // Handle location selection
  const handleLocationSelect = (item: any) => {
    setLocation(item.place_name);
    setSearchQuery(item.place_name);
    setSuggestions([]);
  };

  // Use GPS to get current location
  const useGPSLocation = () => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const geoLocation = `Lat: ${latitude}, Lng: ${longitude}`;
        setLocation(geoLocation);
        setSearchQuery(geoLocation);
        Geolocation.clearWatch(watchId); // Stop watching after getting the location
      },
      (error) => {
        // Handle errors
        switch (error.code) {
          case error.PERMISSION_DENIED:
            Alert.alert("Location Error", "Location permission denied. Please enable location services in your device settings.");
            break;
          case error.POSITION_UNAVAILABLE:
            Alert.alert("Location Error", "Location information is unavailable. Please check your network or GPS connection.");
            break;
          case error.TIMEOUT:
            Alert.alert("Location Error", "Location request timed out. Please ensure you are in an area with good GPS signal.");
            break;
          default:
            Alert.alert("Location Error", "An unknown error occurred while fetching your location.");
            break;
        }
        Geolocation.clearWatch(watchId); // Stop watching on error
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
    );
  };

  // Graduation years
  const years = Array.from({ length: 87 }, (_, i) => (2100 - i).toString());

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView contentContainerStyle={styles.container}> {/* Wrap with ScrollView */}
        <Text style={styles.header}>Register</Text>

        {/* Full Name */}
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={fullName}
          onChangeText={setFullName}
        />

        {/* College Email */}
        <Text style={styles.label}>College Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email (@nitdelhi.ac.in)"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        {/* Password */}
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

        {/* Role Selection */}
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
            style={{ inputIOS: { color: "black" }, inputAndroid: { color: "black" } }}
          />
        </View>

        {/* Graduation Year */}
        <Text style={styles.label}>Graduation Year</Text>
        <RNPickerSelect
          onValueChange={(value) => setGraduationYear(value)}
          items={years.map((year) => ({ label: year, value: year }))}
          placeholder={{ label: "Select Year", value: "" }}
          style={{ inputIOS: { color: "black" }, inputAndroid: { color: "black" } }}
        />

        {/* Location Input (MapTiler Autocomplete) */}
        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your location"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            fetchSuggestions(text);
          }}
        />

        {/* Display Suggestions */}
        {suggestions.length > 0 && (
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleLocationSelect(item)}
              >
                <Text>{item.place_name}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
          />
        )}

        {/* Use GPS Location Button */}
        <TouchableOpacity style={styles.gpsButton} onPress={useGPSLocation}>
          <Text style={styles.gpsButtonText}>📍 Use My Current Location</Text>
        </TouchableOpacity>

        {/* Register Button */}
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
          <Text style={styles.registerText}>{loading ? "Registering..." : "Register"}</Text>
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginText}>Already have an account? Login Here</Text>
        </TouchableOpacity>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

// Styles
const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#fff" }, // Use flexGrow for ScrollView
  header: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 5, fontWeight: "600" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 15, color: "#000" },
  dropdownContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, marginBottom: 15, color: "#000" },
  registerButton: { backgroundColor: "#4A00E0", padding: 15, borderRadius: 8, alignItems: "center" },
  registerText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  loginText: { fontSize: 14, color: "#4A00E0", textAlign: "center", marginTop: 10 },
  suggestionsList: { width: "100%", maxHeight: 150, backgroundColor: "#fff", borderRadius: 8, borderWidth: 1, borderColor: "#ccc", marginTop: 5 },
  suggestionItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  gpsButton: { backgroundColor: "#FF5F1F", padding: 12, borderRadius: 8, width: "100%", alignItems: "center", marginBottom: 10 },
  gpsButtonText: { color: "#fff", fontSize: 14 },
});

export default RegisterScreen;
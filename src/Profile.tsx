import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  FlatList,
  Linking,
} from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import * as ImagePicker from "react-native-image-picker";
import Geolocation from "@react-native-community/geolocation";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";

const CLOUDINARY_UPLOAD_PRESET = "Profile";
const CLOUDINARY_CLOUD_NAME = "dqdhnkdzo";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dqdhnkdzo/image/upload";
const MAPTILER_API_KEY = "BqTvnw9XEB3yLtGALyZG";

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [uploading, setUploading] = useState(false);
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [githubLink, setGithubLink] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth().currentUser;
      if (user) {
        setEmail(user.email || "");
        const userDoc = await firestore().collection("users").doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setFullName(userData?.fullName || "");
          setPhone(userData?.phone || "");
          setLocation(userData?.location || "");
          setBio(userData?.bio || "");
          setProfilePic(userData?.profilePic || "");
          setInstitution(userData?.institution || "");
          setDegree(userData?.degree || "");
          setGraduationYear(userData?.graduationYear || "");
          setFieldOfStudy(userData?.fieldOfStudy || "");
          setCompany(userData?.company || "");
          setJobTitle(userData?.jobTitle || "");
          setStartDate(userData?.startDate || "");
          setEndDate(userData?.endDate || "");
          setJobDescription(userData?.jobDescription || "");
          setSkills(userData?.skills || "");
          setProjects(userData?.projects || []);
          setGithubLink(userData?.githubLink || "");
        }
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateProfile = async () => {
    const user = auth().currentUser;
    if (user) {
      try {
        await firestore().collection("users").doc(user.uid).update({
          fullName,
          phone,
          location,
          bio,
          profilePic,
          institution,
          degree,
          graduationYear,
          fieldOfStudy,
          company,
          jobTitle,
          startDate,
          endDate,
          jobDescription,
          skills,
          projects,
          githubLink,
        });
        Alert.alert("Success", "Profile updated successfully");
      } catch (error) {
        Alert.alert("Error", "Failed to update profile");
      }
    }
  };

  const handleChooseImage = async () => {
    ImagePicker.launchImageLibrary({ mediaType: "photo", quality: 0.8 }, async (response) => {
      if (!response.didCancel && response.assets) {
        const imageUri = response.assets[0].uri;
        if (imageUri) {
          await uploadImage(imageUri);
        }
      }
    });
  };

  const uploadImage = async (imageUri: string) => {
    setUploading(true);
    const user = auth().currentUser;

    if (user) {
      try {
        const formData = new FormData();
        formData.append("file", {
          uri: imageUri,
          type: "image/jpeg",
          name: `${user.uid}.jpg`,
        } as any);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const res = await fetch(CLOUDINARY_URL, {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.secure_url) {
          setProfilePic(data.secure_url);
          await firestore().collection("users").doc(user.uid).update({
            profilePic: data.secure_url,
          });
          Alert.alert("Success", "Profile picture updated!");
        } else {
          Alert.alert("Error", "Failed to upload image");
        }
      } catch (error) {
        console.error("Upload Error:", error);
        Alert.alert("Error", "Failed to upload image");
      }
    }

    setUploading(false);
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

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await axios.get(
        `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${MAPTILER_API_KEY}`
      );
      if (response.data && response.data.features && response.data.features.length > 0) {
        const address = response.data.features[0].place_name;
        setLocation(address);
        setSearchQuery(address);
      } else {
        Alert.alert("Error", "No address found for the given coordinates.");
      }
    } catch (error) {
      console.error("Reverse Geocoding Error:", error);
      Alert.alert("Error", "Failed to fetch address. Please try again.");
    }
  };

  const updateLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        Alert.alert("Error", "Failed to fetch location. Please ensure GPS is enabled.");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleShareProfile = () => {
    // Implement share functionality
    Alert.alert("Share Profile", "Profile sharing functionality will be implemented here");
  };

  const handleConnect = () => {
    // Implement connect functionality
    Alert.alert("Connect", "Connect functionality will be implemented here");
  };

  const handleOpenGithub = () => {
    if (githubLink) {
      Linking.openURL(githubLink).catch(err => {
        Alert.alert("Error", "Could not open the GitHub link");
      });
    } else {
      Alert.alert("No Link", "Please add a GitHub link first");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profile Settings</Text>
      
      <View style={styles.profilePictureContainer}>
        {uploading ? (
          <ActivityIndicator size="large" color="#6200ea" />
        ) : (
          <TouchableOpacity onPress={handleChooseImage}>
            <Image
              source={profilePic ? { uri: profilePic } : require("./assets/default_pic.png")}
              style={styles.profilePicture}
            />
            <Text style={styles.uploadText}>Change Profile Picture</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} editable={false} />
        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Text style={styles.label}>Location</Text>
        <View style={styles.locationContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              fetchSuggestions(text);
            }}
            placeholder="Enter your location"
          />
          <TouchableOpacity onPress={updateLocation} style={styles.gpsButton}>
            <Icon name="gps-fixed" size={24} color="#6200ea" />
          </TouchableOpacity>
        </View>
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
        <Text style={styles.label}>Bio/About Me</Text>
        <TextInput style={styles.input} value={bio} onChangeText={setBio} multiline />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        <Text style={styles.label}>Institution Name</Text>
        <TextInput style={styles.input} value={institution} onChangeText={setInstitution} />
        <Text style={styles.label}>Degree/Program</Text>
        <TextInput style={styles.input} value={degree} onChangeText={setDegree} />
        <Text style={styles.label}>Graduation Year</Text>
        <TextInput style={styles.input} value={graduationYear} onChangeText={setGraduationYear} />
        <Text style={styles.label}>Field of Study</Text>
        <TextInput style={styles.input} value={fieldOfStudy} onChangeText={setFieldOfStudy} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Work Experience</Text>
        <Text style={styles.label}>Company Name</Text>
        <TextInput style={styles.input} value={company} onChangeText={setCompany} />
        <Text style={styles.label}>Job Title</Text>
        <TextInput style={styles.input} value={jobTitle} onChangeText={setJobTitle} />
        <Text style={styles.label}>Start Date</Text>
        <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} />
        <Text style={styles.label}>End Date</Text>
        <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} />
        <Text style={styles.label}>Description</Text>
        <TextInput style={styles.input} value={jobDescription} onChangeText={setJobDescription} multiline />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <TextInput style={styles.input} value={skills} onChangeText={setSkills} multiline />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Projects</Text>
        <Text style={styles.label}>GitHub Link</Text>
        <TextInput 
          style={styles.input} 
          value={githubLink} 
          onChangeText={setGithubLink} 
          placeholder="https://github.com/username/project"
        />
        
        {projects.length > 0 ? (
          projects.map((project, index) => (
            <View key={index} style={styles.projectItem}>
              {project.image && (
                <Image source={{ uri: project.image }} style={styles.projectImage} />
              )}
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.projectDescription}>{project.description}</Text>
              {project.githubLink && (
                <TouchableOpacity onPress={() => Linking.openURL(project.githubLink)}>
                  <Text style={styles.linkText}>View on GitHub</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noProjectsText}>No projects added yet</Text>
        )}
        
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProject')}
        >
          <Text style={styles.addButtonText}>Add Project</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.shareButton]}
          onPress={handleShareProfile}
        >
          <Text style={styles.actionButtonText}>Share Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.connectButton]}
          onPress={handleConnect}
        >
          <Text style={styles.actionButtonText}>Connect</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#333" },
  profilePictureContainer: { alignItems: "center", marginBottom: 20 },
  profilePicture: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#ddd" },
  uploadText: { color: "#6200ea", marginTop: 8, fontSize: 14 },
  section: { 
    backgroundColor: "white", 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 15, 
    elevation: 3 
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#333" },
  label: { fontSize: 16, marginBottom: 5, color: "#555" },
  input: { 
    borderWidth: 1, 
    borderColor: "#ddd", 
    padding: 10, 
    borderRadius: 5, 
    marginBottom: 10, 
    backgroundColor: "#fff" 
  },
  locationContainer: { flexDirection: "row", alignItems: "center" },
  gpsButton: { marginLeft: 10, padding: 10 },
  suggestionsList: { 
    width: "100%", 
    maxHeight: 150, 
    backgroundColor: "#fff", 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: "#ccc", 
    marginTop: 5 
  },
  suggestionItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  button: { 
    backgroundColor: "#6200ea", 
    padding: 15, 
    borderRadius: 5, 
    alignItems: "center", 
    marginVertical: 20 
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  projectItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  projectImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  projectDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  linkText: {
    color: '#6200ea',
    textDecorationLine: 'underline',
  },
  noProjectsText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 10,
  },
  addButton: {
    backgroundColor: '#6200ea',
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  shareButton: {
    backgroundColor: '#4CAF50',
  },
  connectButton: {
    backgroundColor: '#2196F3',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
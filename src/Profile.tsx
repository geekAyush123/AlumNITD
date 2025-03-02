import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import * as ImagePicker from "react-native-image-picker";

type PrivacySettingsType = {
  profileVisibility: boolean;
  emailNotifications: boolean;
  showGraduationYear: boolean;
  showWorkExperience: boolean;
};

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [uploading, setUploading] = useState(false);

  const [privacySettings, setPrivacySettings] = useState<PrivacySettingsType>({
    profileVisibility: true,
    emailNotifications: true,
    showGraduationYear: true,
    showWorkExperience: true,
  });

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

          setPrivacySettings({
            profileVisibility: userData?.privacySettings?.profileVisibility ?? true,
            emailNotifications: userData?.privacySettings?.emailNotifications ?? true,
            showGraduationYear: userData?.privacySettings?.showGraduationYear ?? true,
            showWorkExperience: userData?.privacySettings?.showWorkExperience ?? true,
          });
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
          privacySettings,
        });
        Alert.alert("Success", "Profile updated successfully");
      } catch (error) {
        Alert.alert("Error", "Failed to update profile");
      }
    }
  };

  const togglePrivacySetting = (key: keyof PrivacySettingsType) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
      const filename = `profilePics/${user.uid}.jpg`;
      const reference = storage().ref(filename);

      try {
        await reference.putFile(imageUri);
        const downloadURL = await reference.getDownloadURL();
        setProfilePic(downloadURL);

        await firestore().collection("users").doc(user.uid).update({
          profilePic: downloadURL,
        });

        Alert.alert("Success", "Profile picture updated!");
      } catch (error) {
        Alert.alert("Error", "Failed to upload image");
      }
    }
    setUploading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profile Settings</Text>

      {/* Profile Picture */}
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

      {/* Personal Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Info</Text>

        <Text style={styles.label}>Full Name</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} editable={false} />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <Text style={styles.label}>Location</Text>
        <TextInput style={styles.input} value={location} onChangeText={setLocation} />

        <Text style={styles.label}>Bio/About Me</Text>
        <TextInput style={styles.input} value={bio} onChangeText={setBio} multiline />
      </View>

      {/* Privacy Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>

        {Object.keys(privacySettings).map((key) => (
          <View style={styles.privacyRow} key={key}>
            <Text style={styles.privacyLabel}>{key.replace(/([A-Z])/g, " $1")}</Text>
            <Switch value={privacySettings[key as keyof PrivacySettingsType]} onValueChange={() => togglePrivacySetting(key as keyof PrivacySettingsType)} />
          </View>
        ))}
      </View>

      {/* Update Button */}
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
  section: { backgroundColor: "white", padding: 15, borderRadius: 8, marginBottom: 15, elevation: 3 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  label: { fontSize: 16, marginBottom: 5, color: "#555" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 5, marginBottom: 10, backgroundColor: "#fff" },
  privacyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  privacyLabel: { fontSize: 16, color: "#333" },
  button: { backgroundColor: "#6200ea", padding: 15, borderRadius: 5, alignItems: "center", marginVertical: 20 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default ProfileScreen;

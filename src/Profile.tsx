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
} from "react-native";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import * as ImagePicker from "react-native-image-picker";

const CLOUDINARY_UPLOAD_PRESET = "Profile";
const CLOUDINARY_CLOUD_NAME = "dqdhnkdzo";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dqdhnkdzo/image/upload";

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
        <TextInput style={styles.input} value={location} onChangeText={setLocation} />
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
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#333" },
  label: { fontSize: 16, marginBottom: 5, color: "#555" },
  input: { borderWidth: 1, borderColor: "#ddd", padding: 10, borderRadius: 5, marginBottom: 10, backgroundColor: "#fff" },
  button: { backgroundColor: "#6200ea", padding: 15, borderRadius: 5, alignItems: "center", marginVertical: 20 },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});

export default ProfileScreen;
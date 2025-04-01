import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  FlatList,
  Platform,
} from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import * as ImagePicker from "react-native-image-picker";
import Geolocation from "@react-native-community/geolocation";
import Icon from "react-native-vector-icons/MaterialIcons";
import axios from "axios";
import RNPickerSelect from "react-native-picker-select";

const CLOUDINARY_UPLOAD_PRESET = "Profile";
const CLOUDINARY_CLOUD_NAME = "dqdhnkdzo";
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dqdhnkdzo/image/upload";
const MAPTILER_API_KEY = "BqTvnw9XEB3yLtGALyZG";

const SKILLS_LIST = [
  "Programming",
  "JavaScript",
  "TypeScript",
  "React",
  "React Native",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "Swift",
  "Kotlin",
  "HTML",
  "CSS",
  "UI/UX Design",
  "Graphic Design",
  "Project Management",
  "Data Analysis",
  "Machine Learning",
  "Artificial Intelligence",
  "Cloud Computing",
  "DevOps",
  "Database Management",
  "SQL",
  "NoSQL",
  "Agile Methodologies",
  "Scrum",
  "Product Management",
  "Digital Marketing",
  "Content Writing",
  "Public Speaking",
  "Leadership",
];

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
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  // Generate graduation years
  const years = Array.from({ length: 87 }, (_, i) => (2100 - i).toString());

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
          setStartDate(userData?.startDate ? new Date(userData.startDate) : null);
          setEndDate(userData?.endDate ? new Date(userData.endDate) : null);
          setJobDescription(userData?.jobDescription || "");
          setSelectedSkills(userData?.skills ? userData.skills.split(',').map((s: string) => s.trim()) : []);
          setLinkedinUrl(userData?.linkedinUrl || "");
          setGithubUrl(userData?.githubUrl || "");
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
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          jobDescription,
          skills: selectedSkills.join(', '),
          linkedinUrl,
          githubUrl,
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

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return date.toLocaleDateString();
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setStartDate(currentDate || null);
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    setEndDate(currentDate || null);
  };

  const handleSkillInputChange = (text: string) => {
    setSkillsInput(text);
    if (text.length > 0) {
      const filtered = SKILLS_LIST.filter(skill =>
        skill.toLowerCase().includes(text.toLowerCase())
      );
      setSkillSuggestions(filtered);
      setShowSkillSuggestions(true);
    } else {
      setShowSkillSuggestions(false);
    }
  };

  const addSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSkillsInput("");
    setShowSkillSuggestions(false);
  };

  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills(selectedSkills.filter(skill => skill !== skillToRemove));
  };

  const renderHeader = () => (
    <View>
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
    </View>
  );

  const renderPersonalInfo = () => (
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
          scrollEnabled={false}
        />
      )}
      <Text style={styles.label}>Bio/About Me</Text>
      <TextInput style={[styles.input, { minHeight: 80 }]} value={bio} onChangeText={setBio} multiline />
      
      <Text style={styles.label}>LinkedIn Profile URL</Text>
      <TextInput 
        style={styles.input} 
        value={linkedinUrl} 
        onChangeText={setLinkedinUrl} 
        placeholder="https://linkedin.com/in/yourprofile" 
        keyboardType="url"
      />

      <Text style={styles.label}>GitHub Profile URL</Text>
      <TextInput 
        style={styles.input} 
        value={githubUrl} 
        onChangeText={setGithubUrl} 
        placeholder="https://github.com/yourusername" 
        keyboardType="url"
      />
    </View>
  );

  const renderEducation = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Education</Text>
      <Text style={styles.label}>Institution Name</Text>
      <TextInput style={styles.input} value={institution} onChangeText={setInstitution} />
      
      <Text style={styles.label}>Degree/Program</Text>
      <TextInput style={styles.input} value={degree} onChangeText={setDegree} />
      
      <Text style={styles.label}>Graduation Year</Text>
      <View style={styles.dropdownContainer}>
        <RNPickerSelect
          onValueChange={(value) => setGraduationYear(value)}
          items={years.map((year) => ({ label: year, value: year }))}
          value={graduationYear}
          placeholder={{ label: "Select Year", value: "" }}
          style={pickerSelectStyles}
        />
      </View>
      
      <Text style={styles.label}>Field of Study</Text>
      <TextInput style={styles.input} value={fieldOfStudy} onChangeText={setFieldOfStudy} />
    </View>
  );

  const renderWorkExperience = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Work Experience</Text>
      <Text style={styles.label}>Company Name</Text>
      <TextInput style={styles.input} value={company} onChangeText={setCompany} />
      
      <Text style={styles.label}>Job Title</Text>
      <TextInput style={styles.input} value={jobTitle} onChangeText={setJobTitle} />
      
      <Text style={styles.label}>Start Date</Text>
      <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
        <TextInput
          style={styles.input}
          value={formatDate(startDate)}
          placeholder="Select start date"
          editable={false}
        />
      </TouchableOpacity>
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate || new Date()}
          mode="date"
          display="default"
          onChange={onStartDateChange}
        />
      )}
      
      <Text style={styles.label}>End Date</Text>
      <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
        <TextInput
          style={styles.input}
          value={formatDate(endDate)}
          placeholder="Select end date"
          editable={false}
        />
      </TouchableOpacity>
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate || new Date()}
          mode="date"
          display="default"
          onChange={onEndDateChange}
        />
      )}
      
      <Text style={styles.label}>Description</Text>
      <TextInput style={[styles.input, { minHeight: 80 }]} value={jobDescription} onChangeText={setJobDescription} multiline />
    </View>
  );

  const renderSkills = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <View style={styles.skillsInputContainer}>
        <TextInput
          style={[styles.input, { flex: 1 }]}
          value={skillsInput}
          onChangeText={handleSkillInputChange}
          placeholder="Type to search skills"
          onFocus={() => skillsInput.length > 0 && setShowSkillSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
        />
      </View>
      
      {showSkillSuggestions && skillSuggestions.length > 0 && (
        <View style={styles.skillSuggestionsContainer}>
          <FlatList
            data={skillSuggestions}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.skillSuggestionItem}
                onPress={() => addSkill(item)}
              >
                <Text>{item}</Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="always"
            scrollEnabled={false}
          />
        </View>
      )}
      
      <View style={styles.selectedSkillsContainer}>
        {selectedSkills.map((skill) => (
          <View key={skill} style={styles.skillTag}>
            <Text style={styles.skillTagText}>{skill}</Text>
            <TouchableOpacity onPress={() => removeSkill(skill)}>
              <Icon name="close" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderFooter = () => (
    <TouchableOpacity style={styles.button} onPress={handleUpdateProfile}>
      <Text style={styles.buttonText}>Save Changes</Text>
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={[]}
      renderItem={null}
      ListHeaderComponent={
        <View>
          {renderHeader()}
          {renderPersonalInfo()}
          {renderEducation()}
          {renderWorkExperience()}
          {renderSkills()}
        </View>
      }
      ListFooterComponent={renderFooter()}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.container}
    />
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    color: 'black',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: '#ddd',
    borderRadius: 8,
    color: 'black',
    paddingRight: 30,
  },
});

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    backgroundColor: "#f5f5f5",
    paddingBottom: 40 
  },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#333" },
  profilePictureContainer: { alignItems: "center", marginBottom: 20 },
  profilePicture: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#ddd" },
  uploadText: { color: "#6200ea", marginTop: 8, fontSize: 14 },
  section: { backgroundColor: "white", padding: 15, borderRadius: 8, marginBottom: 15, elevation: 3 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#333" },
  label: { fontSize: 16, marginBottom: 5, color: "#555" },
  input: { 
    borderWidth: 1, 
    borderColor: "#ddd", 
    padding: 10, 
    borderRadius: 5, 
    marginBottom: 10, 
    backgroundColor: "#fff",
    minHeight: 40,
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
  skillsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  skillSuggestionsContainer: {
    maxHeight: 150,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  skillSuggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedSkillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  skillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ea',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  skillTagText: {
    color: '#fff',
    marginRight: 5,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
});

export default ProfileScreen;
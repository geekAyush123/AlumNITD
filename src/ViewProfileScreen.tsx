import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  ImageSourcePropType,
  StyleProp,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import firestore from "@react-native-firebase/firestore";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "./App";

type ProfileData = {
  profilePic?: string;
  fullName: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  bio?: string;
  institution?: string;
  degree?: string;
  fieldOfStudy?: string;
  graduationYear?: string;
  startDate?: string;
  endDate?: string;
  jobDescription?: string;
  skills?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  githubUrl?: string;
};

type ViewProfileScreenProps = {
  route: RouteProp<RootStackParamList, "ViewProfile">;
  navigation: any; // You can further type this if needed
};

const ViewProfileScreen: React.FC<ViewProfileScreenProps> = ({ route, navigation }) => {
  const { userId } = route.params;
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userDoc = await firestore().collection("users").doc(userId).get();
        if (userDoc.exists) {
          setProfileData(userDoc.data() as ProfileData);
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const openUrl = (url?: string): void => {
    if (!url) return;
    
    if (url.startsWith("http://") || url.startsWith("https://")) {
      Linking.openURL(url).catch(err => console.error("Failed to open URL:", err));
    } else {
      Linking.openURL(`https://${url}`).catch(err => console.error("Failed to open URL:", err));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.container}>
        <Text>Profile not found</Text>
      </View>
    );
  }

  // Default image source
  const imageSource: ImageSourcePropType = profileData.profilePic
    ? { uri: profileData.profilePic }
    : require("./assets/default_pic.png");

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Image source={imageSource} style={styles.profileImage} />
        <Text style={styles.name}>{profileData.fullName}</Text>
        {profileData.jobTitle && (
          <Text style={styles.title}>
            {profileData.jobTitle}
            {profileData.company && ` at ${profileData.company}`}
          </Text>
        )}
        {profileData.location && (
          <View style={styles.locationContainer}>
            <Icon name="location-on" size={16} color="#666" />
            <Text style={styles.location}>{profileData.location}</Text>
          </View>
        )}
      </View>

      {/* Connect Button */}
      <TouchableOpacity style={styles.connectButton}>
        <Text style={styles.connectButtonText}>Connect</Text>
      </TouchableOpacity>

      {/* About Section */}
      {profileData.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionContent}>{profileData.bio}</Text>
        </View>
      )}

      {/* Education Section */}
      {(profileData.institution || profileData.degree) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <View style={styles.educationItem}>
            <Text style={styles.educationInstitution}>
              {profileData.institution}
            </Text>
            <Text style={styles.educationDegree}>{profileData.degree}</Text>
            {profileData.fieldOfStudy && (
              <Text style={styles.educationField}>
                {profileData.fieldOfStudy}
              </Text>
            )}
            {profileData.graduationYear && (
              <Text style={styles.educationYear}>
                Graduated {profileData.graduationYear}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Experience Section */}
      {(profileData.company || profileData.jobTitle) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          <View style={styles.experienceItem}>
            <Text style={styles.experienceCompany}>{profileData.company}</Text>
            <Text style={styles.experienceTitle}>{profileData.jobTitle}</Text>
            <Text style={styles.experienceDuration}>
              {formatDate(profileData.startDate)} -{" "}
              {formatDate(profileData.endDate)}
            </Text>
            {profileData.jobDescription && (
              <Text style={styles.experienceDescription}>
                {profileData.jobDescription}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Skills Section */}
      {profileData.skills && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.skillsContainer}>
            {profileData.skills.split(',').map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill.trim()}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Contact Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact</Text>
        {profileData.email && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => Linking.openURL(`mailto:${profileData.email}`)}
          >
            <Icon name="email" size={20} color="#6200ea" />
            <Text style={styles.contactText}>{profileData.email}</Text>
          </TouchableOpacity>
        )}
        {profileData.phone && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => Linking.openURL(`tel:${profileData.phone}`)}
          >
            <Icon name="phone" size={20} color="#6200ea" />
            <Text style={styles.contactText}>{profileData.phone}</Text>
          </TouchableOpacity>
        )}
        {profileData.linkedinUrl && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => openUrl(profileData.linkedinUrl)}
          >
            <Icon name="linkedin" size={20} color="#6200ea" />
            <Text style={styles.contactText}>
              {profileData.linkedinUrl.replace(/(^\w+:|^)\/\//, '')}
            </Text>
          </TouchableOpacity>
        )}
        {profileData.githubUrl && (
          <TouchableOpacity
            style={styles.contactItem}
            onPress={() => openUrl(profileData.githubUrl)}
          >
            <Icon name="code" size={20} color="#6200ea" />
            <Text style={styles.contactText}>
              {profileData.githubUrl.replace(/(^\w+:|^)\/\//, '')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

// Define your styles with TypeScript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: "#ddd",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  connectButton: {
    backgroundColor: "#6200ea",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 16,
  },
  connectButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
  educationItem: {
    marginBottom: 12,
  },
  educationInstitution: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  educationDegree: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  educationField: {
    fontSize: 14,
    color: "#555",
    fontStyle: "italic",
    marginTop: 2,
  },
  educationYear: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceCompany: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  experienceTitle: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  experienceDuration: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
    fontStyle: "italic",
  },
  experienceDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  skillTag: {
    backgroundColor: "#f0e6ff",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: "#6200ea",
    fontSize: 14,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: "#6200ea",
    marginLeft: 12,
    textDecorationLine: "underline",
  },
});

export default ViewProfileScreen;
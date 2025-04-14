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
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "./App";
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

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
  navigation: any;
};

const ViewProfileScreen: React.FC<ViewProfileScreenProps> = ({ route, navigation }) => {
  const { userId } = route.params;
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionStatus, setConnectionStatus] = useState<
    "not-connected" | "connected" | "request-sent" | "request-received"
  >("not-connected");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) return;

        // 1. Fetch profile data
        const userDoc = await firestore().collection("users").doc(userId).get();
        if (userDoc.exists) {
          setProfileData(userDoc.data() as ProfileData);
        }

        // 2. Check connection status
        // Check if already connected
        const connectionsSnapshot = await firestore()
          .collection("connections")
          .where("users", "array-contains", currentUser.uid)
          .where("status", "==", "accepted")
          .get();

        const isConnected = connectionsSnapshot.docs.some((doc) => {
          const users = doc.data().users;
          return users.includes(userId);
        });

        if (isConnected) {
          setConnectionStatus("connected");
          return;
        }

        // Check for pending requests
        const sentRequest = await firestore()
          .collection("connectionRequests")
          .where("fromUserId", "==", currentUser.uid)
          .where("toUserId", "==", userId)
          .where("status", "==", "pending")
          .limit(1)
          .get();

        if (!sentRequest.empty) {
          setConnectionStatus("request-sent");
          return;
        }

        const receivedRequest = await firestore()
          .collection("connectionRequests")
          .where("fromUserId", "==", userId)
          .where("toUserId", "==", currentUser.uid)
          .where("status", "==", "pending")
          .limit(1)
          .get();

        if (!receivedRequest.empty) {
          setConnectionStatus("request-received");
          return;
        }

        setConnectionStatus("not-connected");
      } catch (error) {
        console.error("Error fetching profile data:", error);
        Alert.alert("Error", "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleConnect = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert("Error", "You need to be logged in to connect");
        return;
      }

      if (currentUser.uid === userId) {
        Alert.alert("Error", "You cannot connect with yourself");
        return;
      }

      // Get current user data
      const currentUserDoc = await firestore()
        .collection("users")
        .doc(currentUser.uid)
        .get();
      const currentUserData = currentUserDoc.data() || {};

      // Add connection request
      await firestore().collection("connectionRequests").add({
        fromUserId: currentUser.uid,
        fromUserName: currentUserData.fullName || "Alumni User",
        fromUserProfilePic: currentUserData.profilePic || null,
        fromUserJobTitle: currentUserData.jobTitle || null,
        toUserId: userId,
        status: "pending",
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      setConnectionStatus("request-sent");
      Alert.alert("Success", "Connection request sent successfully");
    } catch (error) {
      console.error("Error sending connection request:", error);
      Alert.alert("Error", "Failed to send connection request");
    }
  };

  const handleAcceptRequest = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      // Find the request
      const requestQuery = await firestore()
        .collection("connectionRequests")
        .where("fromUserId", "==", userId)
        .where("toUserId", "==", currentUser.uid)
        .where("status", "==", "pending")
        .limit(1)
        .get();

      if (requestQuery.empty) {
        Alert.alert("Error", "Request not found");
        return;
      }

      const request = requestQuery.docs[0];
      const batch = firestore().batch();

      // Update request status
      batch.update(request.ref, { status: "accepted" });

      // Create new connection
      const connectionRef = firestore().collection("connections").doc();
      batch.set(connectionRef, {
        users: [userId, currentUser.uid],
        status: "accepted",
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();
      setConnectionStatus("connected");
      Alert.alert("Success", "Connection request accepted");
    } catch (error) {
      console.error("Error accepting request:", error);
      Alert.alert("Error", "Failed to accept connection request");
    }
  };

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
      Linking.openURL(url).catch((err) =>
        console.error("Failed to open URL:", err)
      );
    } else {
      Linking.openURL(`https://${url}`).catch((err) =>
        console.error("Failed to open URL:", err)
      );
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

  const imageSource = profileData.profilePic
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

      {/* Connection Button Section */}
      {connectionStatus === "not-connected" && (
        <TouchableOpacity
          style={styles.connectButton}
          onPress={handleConnect}
        >
          <Text style={styles.connectButtonText}>Connect</Text>
        </TouchableOpacity>
      )}

      {connectionStatus === "request-sent" && (
        <View style={styles.requestSentButton}>
          <Text style={styles.requestSentText}>Request Sent</Text>
        </View>
      )}

      {connectionStatus === "request-received" && (
        <View style={styles.requestButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={handleAcceptRequest}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.declineButton]}
            onPress={() => setConnectionStatus("not-connected")}
          >
            <Text style={styles.buttonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}

      {connectionStatus === "connected" && (
        <View style={styles.connectedButton}>
          <Icon name="check" size={20} color="#4CAF50" />
          <Text style={styles.connectedText}>Connected</Text>
        </View>
      )}

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
            {profileData.skills.split(",").map((skill, index) => (
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
            <FontAwesomeIcon name="linkedin-square" size={20} color="#6200ea" />
            <Text style={styles.contactText}>
              {profileData.linkedinUrl.replace(/(^\w+:|^)\/\//, "")}
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
              {profileData.githubUrl.replace(/(^\w+:|^)\/\//, "")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

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
  requestSentButton: {
    backgroundColor: "#888",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 16,
  },
  requestSentText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  connectedButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    marginVertical: 16,
  },
  connectedText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  requestButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 8,
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  declineButton: {
    backgroundColor: "#f44336",
  },
  buttonText: {
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
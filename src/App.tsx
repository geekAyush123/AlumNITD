import "react-native-gesture-handler";
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Image, Text } from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator, StackNavigationProp } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { RouteProp } from "@react-navigation/native";

// Screen imports
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import HomePage from "./HomePage";
import ProfileScreen from "./Profile";
import AlumniSearchScreen from "./AlumniSearchScreen";
import ProfilePage from "./ProfilePage";
import HereMap from "./HereMap";
import MessagesListScreen from './MessagesListScreen';
import ChatScreen from './ChatScreen';
import JobOpportunitiesScreen from './JobOpportunitiesScreen';
import JobDetailsScreen from './JobDetailsScreen';
import ViewProfileScreen from './ViewProfileScreen';
import EventsScreen from "./Events_Codes/EventsScreen";
import EventDetailsScreen from "./Events_Codes/EventDetailsScreen";
import VirtualEventScreen from "./Events_Codes/VirtualEventScreen";
import AlumniSearchResults from './AlumniSearchResults';

export type Alumni = {
  id: string;
  fullName: string;
  company?: string;
  jobTitle?: string;
  profilePic?: string;
  location?: string;
  skills?: string[];
  graduationYear?: string;
  industry?: string;
  fieldOfStudy?: string;
  degree?: string;
  institution?: string;
  bio?: string;
  jobDescription?: string;
};
import DonationScreen from "./DonationScreen";
import ViewTimeCapsuleScreen from "./TimeCapsuleCodes/ViewTimeCapsuleScreen";
import CreateTimeCapsuleScreen from "./TimeCapsuleCodes/CreateTimeCapsuleScreen";
import TimeCapsuleListScreen from "./TimeCapsuleCodes/TimeCapsuleListScreen";

// Splash Screen Component
const SplashScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation>();

  useEffect(() => {
    animationRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    );
    animationRef.current.start();

    const timer = setTimeout(() => {
      navigation.navigate("Login");
    }, 3000);

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
      clearTimeout(timer);
    };
  }, [navigation, pulseAnim]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("./assets/logo.png")}
        style={[styles.logo, { transform: [{ scale: pulseAnim }] }]}
      />
      <Text style={styles.appName}>AlumNITD</Text>
      <Text style={styles.slogan}>Connecting Futures, Honoring Pasts.</Text>
    </View>
  );
};

// Time Capsule Type
export interface TimeCapsuleType {
  id: string;
  title: string;
  message: string;
  creationDate: Date;
  unlockDate: Date;
  mediaUrls: string[];
  recipients?: string[];
  isPublic?: boolean;
  viewedBy: string[];
}

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  MessagesList: undefined;
  Chat: { conversationId: string };
  ProfilePage: undefined;
  Profile: undefined;
  AlumniSearch: undefined;
  Map: undefined;
  JobOpportunities: undefined;
  JobDetails: { jobId: string };
  ViewProfile: { userId: string };
  Events: undefined;
  EventDetails: { eventId: string };
  VirtualEvent: { eventId: string };
  Donation: undefined;
  TimeCapsules: undefined;
  ViewTimeCapsule: { capsuleId: string };
  CreateTimeCapsule: undefined;
  AlumniSearchResults: { alumniList: Alumni[] };
};

const Stack = createStackNavigator<RootStackParamList>();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          {/* Splash Screen */}
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />

          {/* App Screens */}
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true, title: "Back" }} />
          <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
          <Stack.Screen name="MessagesList" component={MessagesListScreen} options={{ title: "Messages" }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: "Chat" }} />
          <Stack.Screen name="ProfilePage" component={ProfilePage} options={{ title: "Profile" }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: "Edit Profile" }} />
          <Stack.Screen name="AlumniSearch" component={AlumniSearchScreen} options={{ title: "Search Alumni" }} />
          <Stack.Screen name="Map" component={HereMap} options={{ title: "Campus Map" }} />
          <Stack.Screen name="JobOpportunities" component={JobOpportunitiesScreen} options={{ title: "Job Opportunities" }} />
          <Stack.Screen name="JobDetails" component={JobDetailsScreen} options={{ title: "Job Details" }} />
          <Stack.Screen name="ViewProfile" component={ViewProfileScreen} options={{ title: "Profile" }} />
          <Stack.Screen name="Events" component={EventsScreen} options={{ title: "Upcoming Events" }} />
          <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ title: "Event Details" }} />
          <Stack.Screen name="VirtualEvent" component={VirtualEventScreen} options={{ title: "Virtual Event" }} />
          <Stack.Screen name="Donation" component={DonationScreen} options={{ title: "Donate" }} />
          <Stack.Screen name="AlumniSearchResults" component={AlumniSearchResults} options={{ title: "Search Results" }} />

          {/* Job Opportunities Screens */}
          
          {/* Time Capsule Screens */}
          <Stack.Screen name="TimeCapsules" component={TimeCapsuleListScreen} options={{ title: "Time Capsules" }} />
          <Stack.Screen name="ViewTimeCapsule" component={ViewTimeCapsuleScreen} options={{ title: "Time Capsule" }} />
          <Stack.Screen name="CreateTimeCapsule" component={CreateTimeCapsuleScreen} options={{ title: "Create Time Capsule" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDD965",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginBottom: 20,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a365d",
    marginBottom: 8,
  },
  slogan: {
    fontSize: 16,
    color: "#4A00E0",
    fontStyle: "italic",
  },
});

export default App;
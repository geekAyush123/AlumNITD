import "react-native-gesture-handler";
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Image, Text } from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator, StackNavigationProp } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from 'react-native-toast-message';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';

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
import DiscussionScreen from "./DiscussionScreen";
import DonationScreen from "./DonationScreen";
import ViewTimeCapsuleScreen from "./TimeCapsuleCodes/ViewTimeCapsuleScreen";
import CreateTimeCapsuleScreen from "./TimeCapsuleCodes/CreateTimeCapsuleScreen";
import TimeCapsuleListScreen from "./TimeCapsuleCodes/TimeCapsuleListScreen";
import MyNetworkScreen from "./MyNetworkScreen"; 

export interface Alumni {
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

// Splash Screen Component
const SplashScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation>();

  useEffect(() => {
    // Initialize notifications
    const initializeNotifications = async () => {
      await notifee.requestPermission();
      await notifee.createChannel({
        id: 'time-capsules',
        name: 'Time Capsule Notifications',
        importance: AndroidImportance.HIGH,
        vibration: true,
        sound: 'default',
      });
    };

    initializeNotifications();

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

    // Show toast when splash loads
    Toast.show({
      type: 'success',
      text1: 'Welcome to AlumNITD 👋',
      text2: 'Connecting Futures, Honoring Pasts.',
      visibilityTime: 2500,
    });

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
  Discussion: undefined;
  MyNetwork: undefined; // Add this route
};

const Stack = createStackNavigator<RootStackParamList>();

function App() {
  // Set up notification foreground handler
  useEffect(() => {
    return notifee.onForegroundEvent(({ type, detail }) => {
      switch (type) {
        case EventType.DELIVERED:
          console.log('Notification delivered');
          break;
        case EventType.PRESS:
          console.log('Notification pressed');
          break;
        case EventType.ACTION_PRESS:
          console.log('Notification action pressed');
          break;
        case EventType.DISMISSED:
          console.log('Notification dismissed');
          break;
      }
    });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true, title: "Back" }} />
          <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
          <Stack.Screen name="MessagesList" component={MessagesListScreen} options={{ title: "Messages" }} />
         
          {/* <Stack.Screen name="Home" component={ChatScreen}  />
          <Stack.Screen name="Friends" component={FriendsScree}  />
          <Stack.Screen name="Chats" component={ChatsScreen}  />
          <Stack.Screen name="Messages" component={ChatMessageScreen}  /> */}
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
          <Stack.Screen name="Discussion" component={DiscussionScreen} options={{ title: 'Discussion Room' }} />
          <Stack.Screen name="TimeCapsules" component={TimeCapsuleListScreen} options={{ title: "Time Capsules" }} />
          <Stack.Screen name="ViewTimeCapsule" component={ViewTimeCapsuleScreen} options={{ title: "Time Capsule" }} />
          <Stack.Screen name="CreateTimeCapsule" component={CreateTimeCapsuleScreen} options={{ title: "Create Time Capsule" }} />
          {/* Add the new MyNetwork screen */}
          <Stack.Screen name="MyNetwork" component={MyNetworkScreen} options={{ title: "My Network" }} />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast />
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
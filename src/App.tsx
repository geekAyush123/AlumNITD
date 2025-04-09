import "react-native-gesture-handler";
import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Image, Text } from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator, StackNavigationProp } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";

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

// Splash Screen Component
const SplashScreen = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const animationRef = useRef<Animated.CompositeAnimation>();

  useEffect(() => {
    // Heartbeat animation
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

    // Navigate after 3 seconds
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
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
    color: "#666",
    fontStyle: "italic",
  },
});

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
};

const Stack = createStackNavigator<RootStackParamList>();

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          {/* Splash Screen */}
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />

          {/* App Screens */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: true, title: "Back" }}
          />
          <Stack.Screen
            name="Home"
            component={HomePage}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="MessagesList" 
            component={MessagesListScreen} 
          />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen} 
          />
          <Stack.Screen 
            name="ProfilePage" 
            component={ProfilePage} 
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
          />
          <Stack.Screen
            name="AlumniSearch"
            component={AlumniSearchScreen}
            options={{ title: "Search Alumni" }}
          />
          <Stack.Screen
            name="Map"
            component={HereMap}
            options={{ title: "Campus Map" }}
          />
          <Stack.Screen
            name="ViewProfile"
            component={ViewProfileScreen}
            options={{ title: "Profile" }}
          />
          <Stack.Screen
            name="JobOpportunities"
            component={JobOpportunitiesScreen}
            options={{ title: "Job Opportunities" }}
          />
          <Stack.Screen
            name="JobDetails"
            component={JobDetailsScreen}
            options={{ title: "Job Details" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
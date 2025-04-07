import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
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

// At the top of your App.tsx (after the imports)
export type RootStackParamList = {
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
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true, title: "Back" }} />
          <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
          <Stack.Screen name="MessagesList" component={MessagesListScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="ProfilePage" component={ProfilePage} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="AlumniSearch" component={AlumniSearchScreen} options={{ title: "Search Alumni" }} />
          <Stack.Screen name="Map" component={HereMap} options={{ title: "Campus Map" }} />
          <Stack.Screen name="ViewProfile" component={ViewProfileScreen} options = {{title: "Profile"}}/>
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
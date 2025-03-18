import "react-native-gesture-handler"; // ✅ Important for React Navigation
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./LoginScreen";
import RegisterScreen from "./RegisterScreen";
import HomePage from "./HomePage";
import ProfileScreen from "./Profile";
import AlumniSearchScreen from "./AlumniSearchScreen";

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
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
        <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="AlumniSearch" component={AlumniSearchScreen} options={{ title: "Search Alumni" }} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

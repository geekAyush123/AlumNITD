import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import Login from './Login'; // Import your Login screen
import SignInScreen from './Signin'; // Import your SignIn screen
import Signup from './Signup'; // Import your Signup screen

// Create a stack navigator
const Stack = createStackNavigator();

// Define the theme for the paper components (optional, for consistency)
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee', // Example color
    accent: '#03dac4',  // Example accent color
  },
};

const App: React.FC = () => {
  return (
    <PaperProvider theme={theme}> {/* Wrap the app with PaperProvider */}
      <NavigationContainer> {/* Navigation container to manage navigation state */}
        <Stack.Navigator
          initialRouteName="Login" // The screen that will show initially
          screenOptions={{
            headerShown: false, // Hide the header for a clean design
          }}
        >
          {/* Define all screens */}
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={Signup} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;

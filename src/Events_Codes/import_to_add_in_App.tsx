// In your navigation file (e.g., AppNavigator.tsx)
import { createStackNavigator } from '@react-navigation/stack';
import HomePage from './screens/HomePage';
import EventsScreen from './screens/EventsScreen';
import EventDetailsScreen from './screens/EventDetailsScreen';
import VirtualEventScreen from './screens/VirtualEventScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
      <Stack.Screen name="Events" component={EventsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="VirtualEvent" component={VirtualEventScreen} options={{ headerShown: false }} />
      {/* ... other screens */}
    </Stack.Navigator>
  );
}

export default AppNavigator;
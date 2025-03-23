import { PermissionsAndroid, Platform } from "react-native";
import Geolocation from "react-native-geolocation-service";
import database from "@react-native-firebase/database";

// Request permission for location access
const requestLocationPermission = async () => {
  if (Platform.OS === "android") {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true;
};

// Function to get and store location
export const getAndStoreLocation = async (userId: string) => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) {
    console.log("Location permission denied");
    return;
  }

  Geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      console.log("Fetched Location:", latitude, longitude);

      // 🔥 Store location in Firebase
      database().ref(`/users/${userId}/location`).set({
        latitude,
        longitude,
      });
    },
    (error) => console.error("Error getting location:", error),
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
  );
};

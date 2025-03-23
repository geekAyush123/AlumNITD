import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  Button
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const App = () => {
  const [currentLongitude, setCurrentLongitude] = useState('...');
  const [currentLatitude, setCurrentLatitude] = useState('...');
  const [locationStatus, setLocationStatus] = useState('');

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Access Required",
              message: "This App needs to access your location",
              buttonPositive: "OK"
            }
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            getOneTimeLocation();
            subscribeLocation();
          } else {
            setLocationStatus("Permission Denied");
          }
        } else {
          getOneTimeLocation();
          subscribeLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    };

    requestLocationPermission();

    return () => {
      Geolocation.clearWatch(watchID);
    };
  }, []);

  const getOneTimeLocation = () => {
    setLocationStatus("Getting Location...");
    Geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus("You are here");
        const currentLongitude = JSON.stringify(position.coords.longitude);
        const currentLatitude = JSON.stringify(position.coords.latitude);
        setCurrentLongitude(currentLongitude);
        setCurrentLatitude(currentLatitude);
      },
      (error) => {
        setLocationStatus(error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  let watchID;
  const subscribeLocation = () => {
    watchID = Geolocation.watchPosition(
      (position) => {
        setLocationStatus("Location Updated");
        setCurrentLongitude(JSON.stringify(position.coords.longitude));
        setCurrentLatitude(JSON.stringify(position.coords.latitude));
      },
      (error) => {
        setLocationStatus(error.message);
      },
      { enableHighAccuracy: true, distanceFilter: 10 }
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.text}>Location Status: {locationStatus}</Text>
        <Text style={styles.text}>Longitude: {currentLongitude}</Text>
        <Text style={styles.text}>Latitude: {currentLatitude}</Text>
      </View>
      <Button title="Get Location" onPress={getOneTimeLocation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginVertical: 5,
  },
});

export default App;

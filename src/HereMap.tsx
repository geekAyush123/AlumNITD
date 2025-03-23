import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, PermissionsAndroid, Platform } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import { WebView } from "react-native-webview";

const MAPTILER_API_KEY = "BqTvnw9XEB3yLtGALyZG";

const HereMap: React.FC = () => {
  const [currentLongitude, setCurrentLongitude] = useState<number | null>(null);
  const [currentLatitude, setCurrentLatitude] = useState<number | null>(null);

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === "android") {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Access Required",
              message: "This App needs to access your location",
              buttonPositive: "OK",
            }
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            subscribeLocation();
          }
        } else {
          subscribeLocation();
        }
      } catch (err) {
        console.warn(err);
      }
    };

    const subscribeLocation = () => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setCurrentLongitude(longitude);
          setCurrentLatitude(latitude);
        },
        (error) => console.warn("Error getting location:", error),
        { enableHighAccuracy: true }
      );

      Geolocation.watchPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          setCurrentLongitude(longitude);
          setCurrentLatitude(latitude);
        },
        (error) => console.warn("Error getting location:", error),
        { enableHighAccuracy: true, distanceFilter: 5 }
      );
    };

    requestLocationPermission();
  }, []);

  const coords =
    currentLatitude !== null && currentLongitude !== null
      ? [currentLongitude, currentLatitude]
      : [0, 0]; // Default if location not yet available

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://unpkg.com/maplibre-gl@2.1.9/dist/maplibre-gl.js"></script>
      <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@2.1.9/dist/maplibre-gl.css" />
      <style>
        html, body { margin: 0; height: 100%; overflow: hidden; }
        #map { width: 100%; height: 100%; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        document.addEventListener("DOMContentLoaded", function () {
          console.log("Initializing MapLibre...");

          var map = new maplibregl.Map({
            container: 'map',
            style: 'https://api.maptiler.com/maps/streets/style.json?key=' + '${MAPTILER_API_KEY}',
            center: ${JSON.stringify(coords)}, 
            zoom: 15
          });

          map.addControl(new maplibregl.NavigationControl());

          var marker = new maplibregl.Marker({ color: "red" })
            .setLngLat(${JSON.stringify(coords)}) 
            .addTo(map);

          console.log("Map & Marker initialized.");
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={["*"]}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        mixedContentMode="always"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default HereMap;
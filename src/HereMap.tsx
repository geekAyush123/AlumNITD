import React, { useState, useEffect } from "react";
import { View, StyleSheet, PermissionsAndroid, Platform } from "react-native";
import Geolocation from "@react-native-community/geolocation";
import { WebView } from "react-native-webview";
import firestore from "@react-native-firebase/firestore";
import axios from "axios";

const MAPTILER_API_KEY = "BqTvnw9XEB3yLtGALyZG";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

const HereMap: React.FC = () => {
  const [currentLongitude, setCurrentLongitude] = useState<number | null>(null);
  const [currentLatitude, setCurrentLatitude] = useState<number | null>(null);
  const [alumniData, setAlumniData] = useState<any[]>([]);

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

  // Fetch alumni data from Firestore and reverse geocode their locations
  useEffect(() => {
    const fetchAlumniData = async () => {
      try {
        const alumniSnapshot = await firestore().collection("users").get();
        const alumni = await Promise.all(
          alumniSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const address = data.location; // Human-readable address

            // Reverse geocode the address to get coordinates
            try {
              const response = await axios.get(
                `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${MAPTILER_API_KEY}`
              );
              if (response.data && response.data.features && response.data.features.length > 0) {
                const [longitude, latitude] = response.data.features[0].center;
                return {
                  id: doc.id,
                  name: data.fullName,
                  profilePic: data.profilePic || "https://via.placeholder.com/50", // Default profile picture
                  email: data.email,
                  longitude,
                  latitude,
                };
              }
            } catch (error) {
              console.error("Reverse geocoding error:", error);
            }
            return null;
          })
        );

        // Filter out null values and set alumni data
        setAlumniData(alumni.filter((alum) => alum !== null));
      } catch (error) {
        console.error("Error fetching alumni data:", error);
      }
    };

    fetchAlumniData();
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
        .mapboxgl-popup-content {
          padding: 10px;
          text-align: center;
        }
        .profile-pic {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          margin-bottom: 10px;
        }
        .connect-button {
          background-color: #4A00E0;
          color: white;
          padding: 5px 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }
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

          // Add current user's location marker (red)
          var currentUserMarker = new maplibregl.Marker({ color: "red" })
            .setLngLat(${JSON.stringify(coords)}) 
            .addTo(map);

          // Add alumni markers with popups
          var alumniData = ${JSON.stringify(alumniData)};
          alumniData.forEach(function (alum) {
            if (alum && alum.longitude && alum.latitude) {
              var popup = new maplibregl.Popup({ offset: 25 })
                .setHTML(\`
                  <div>
                    <img src="\${alum.profilePic}" class="profile-pic" alt="\${alum.name}" />
                    <h4>\${alum.name}</h4>
                    <p>\${alum.email}</p>
                    <button class="connect-button" onclick="handleConnect('\${alum.id}')">Connect</button>
                  </div>
                \`);

              var alumniMarker = new maplibregl.Marker({ color: "blue" })
                .setLngLat([alum.longitude, alum.latitude])
                .setPopup(popup)
                .addTo(map);
            }
          });

          // Handle connect button click
          window.handleConnect = function (alumniId) {
            alert("Connect request sent to alumni with ID: " + alumniId);
            // You can implement your connect logic here
          };

          console.log("Map & Markers initialized.");
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

export default HereMap;
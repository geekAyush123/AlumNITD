import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const MAPTILER_API_KEY = "BqTvnw9XEB3yLtGALyZG";

const HereMap: React.FC = () => {
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
            style: 'https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY}',
            center: [77.2090, 28.6139], // Delhi
            zoom: 15
          });

          // Add navigation controls
          map.addControl(new maplibregl.NavigationControl());

          // Add a marker
          var marker = new maplibregl.Marker({ color: "red" })
            .setLngLat([77.2090, 28.6139])
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
        style={{ flex: 1 }}
        originWhitelist={["*"]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
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
});

export default HereMap;

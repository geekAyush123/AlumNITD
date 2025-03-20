import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";

const AlumniMapScreen = () => {
  const nearbyAlumni = [
    { name: "Ayush", role: "Software Engineer", distance: "2 miles away", image: require("./assets/alumni.png") },
    { name: "Akshat", role: "Data Analyst", distance: "4 miles away", image: require("./assets/user 1.png") },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Interactive Map Section */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{ latitude: 37.78825, longitude: -122.4324 }}
            title="Alumni Location"
            description="This is where the alumni is located"
          />
        </MapView>
      </View>

      {/* Nearby Alumni Section */}
      <View style={styles.alumniContainer}>
        <Text style={styles.sectionTitle}>Nearby Alumni</Text>
        {nearbyAlumni.map((alumni, index) => (
          <TouchableOpacity key={index} style={styles.alumniCard}>
            <Image source={alumni.image} style={styles.alumniImage} />
            <View style={styles.alumniInfo}>
              <Text style={styles.alumniName}>{alumni.name}</Text>
              <Text style={styles.alumniRole}>{alumni.role}</Text>
              <Text style={styles.alumniDistance}>{alumni.distance}</Text>
            </View>
            <TouchableOpacity style={styles.viewProfileButton}>
              <Text style={styles.viewProfileButtonText}>View Profile &gt;</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  mapContainer: {
    height: 300,
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  alumniContainer: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  alumniCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 8,
  },
  alumniImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  alumniInfo: {
    flex: 1,
  },
  alumniName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  alumniRole: {
    fontSize: 14,
    color: "#666",
  },
  alumniDistance: {
    fontSize: 12,
    color: "#888",
  },
  viewProfileButton: {
    padding: 10,
  },
  viewProfileButtonText: {
    color: "#6200ea",
    fontWeight: "bold",
  },
});

export default AlumniMapScreen;
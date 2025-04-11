import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  StyleSheet, 
  PermissionsAndroid, 
  Platform, 
  TextInput, 
  Text, 
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
  Alert
} from "react-native";
import Geolocation from "@react-native-community/geolocation";
import { WebView } from "react-native-webview";
import firestore from "@react-native-firebase/firestore";
import auth from '@react-native-firebase/auth';
import axios from "axios";
import debounce from 'lodash.debounce';

const MAPTILER_API_KEY = "BqTvnw9XEB3yLtGALyZG";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  resultsContainer: {
    marginTop: 5,
    maxHeight: 200,
    backgroundColor: 'white',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  resultItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  resultDetails: {
    color: '#666',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 10,
    alignItems: 'center',
  },
  noResultsText: {
    padding: 10,
    textAlign: 'center',
    color: '#666',
  },
});

const HereMap: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [currentLongitude, setCurrentLongitude] = useState<number | null>(null);
  const [currentLatitude, setCurrentLatitude] = useState<number | null>(null);
  const [alumniData, setAlumniData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allAlumniData, setAllAlumniData] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const webViewRef = useRef<WebView>(null);

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

  useEffect(() => {
    const fetchAlumniData = async () => {
      try {
        const alumniSnapshot = await firestore().collection("users").get();
        const alumni = await Promise.all(
          alumniSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const address = data.location;

            try {
              const response = await axios.get(
                `https://api.maptiler.com/geocoding/${encodeURIComponent(address)}.json?key=${MAPTILER_API_KEY}`
              );
              if (response.data?.features?.length > 0) {
                const [longitude, latitude] = response.data.features[0].center;
                return {
                  id: doc.id,
                  name: data.fullName,
                  profilePic: data.profilePic || "https://via.placeholder.com/50",
                  location: data.location,
                  bio: data.bio || "",
                  institution: data.institution || "",
                  degree: data.degree || "",
                  graduationYear: data.graduationYear || "",
                  fieldOfStudy: data.fieldOfStudy || "",
                  company: data.company || "",
                  jobTitle: data.jobTitle || "",
                  skills: data.skills || [],
                  jobDescription: data.jobDescription || "",
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

        const filteredAlumni = alumni.filter((alum) => alum !== null);
        setAllAlumniData(filteredAlumni);
        setAlumniData(filteredAlumni);
      } catch (error) {
        console.error("Error fetching alumni data:", error);
      }
    };

    fetchAlumniData();
  }, []);

  const handleConnect = async (alumniId: string) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('Error', 'You need to be logged in to connect');
        return;
      }

      if (currentUser.uid === alumniId) {
        Alert.alert('Error', 'You cannot connect with yourself');
        return;
      }

      // Check if connection already exists
      const existingConnection = await firestore()
        .collection('connectionRequests')
        .where('fromUserId', '==', currentUser.uid)
        .where('toUserId', '==', alumniId)
        .limit(1)
        .get();

      if (!existingConnection.empty) {
        Alert.alert('Info', 'Connection request already sent');
        return;
      }

      // Add connection request to Firestore
      await firestore()
        .collection('connectionRequests')
        .add({
          fromUserId: currentUser.uid,
          toUserId: alumniId,
          status: 'pending',
          createdAt: firestore.FieldValue.serverTimestamp(),
          fromUserName: currentUser.displayName || 'Alumni User'
        });

      // Update the button in the WebView
      if (webViewRef.current) {
        const js = `
          const button = document.querySelector(\`button[onclick="handleConnect('${alumniId}')"]\`);
          if (button) {
            button.textContent = 'Request Sent';
            button.style.backgroundColor = '#888';
            button.onclick = null;
          }
        `;
        webViewRef.current.injectJavaScript(js);
      }

      Alert.alert('Success', 'Connection request sent successfully');
    } catch (error) {
      console.error('Error sending connection request:', error);
      Alert.alert('Error', 'Failed to send connection request');
    }
  };

  const debouncedSearch = debounce((query: string) => {
    if (query.trim() === "") {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const results = allAlumniData.filter(alum => {
      const searchFields = [
        alum.name,
        alum.location,
        alum.bio,
        alum.institution,
        alum.degree,
        alum.graduationYear,
        alum.fieldOfStudy,
        alum.company,
        alum.jobTitle,
        Array.isArray(alum.skills) ? alum.skills.join(' ') : alum.skills,
        alum.jobDescription
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchFields.includes(lowerCaseQuery) || 
             searchFields.split(' ').some(word => word.startsWith(lowerCaseQuery));
    });

    setSearchResults(results);
    setIsSearching(false);
  }, 300);

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text.trim().length > 0) {
      setIsSearching(true);
      debouncedSearch(text);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setTimeout(() => {
      setIsInputFocused(false);
      setSearchResults([]);
    }, 200);
  };

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'viewProfile') {
        navigation.navigate('ViewProfile', { userId: data.id });
      } else if (data.type === 'connect') {
        handleConnect(data.id);
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  };

  const handleSearchResultSelect = (alum: any) => {
    setSearchQuery(alum.name);
    setSearchResults([]);
    
    if (webViewRef.current) {
      const html = `
        window.map.flyTo({
          center: [${alum.longitude}, ${alum.latitude}],
          zoom: 14
        });
        
        new maplibregl.Popup({ offset: 25 })
          .setLngLat([${alum.longitude}, ${alum.latitude}])
          .setHTML(\`
            <div style="text-align: center;">
              <img src="${alum.profilePic}" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin-bottom: 12px;" alt="${alum.name}" />
              <h4>${alum.name}</h4>
              <p>${alum.jobTitle || ''} ${alum.company ? `at ${alum.company}` : ''}</p>
              <div class="popup-buttons">
                <button class="connect-button" onclick="handleConnect('${alum.id}')">Connect</button>
                <button class="view-profile-button" onclick="handleViewProfile('${alum.id}')">View Profile</button>
              </div>
            </div>
          \`)
          .addTo(window.map);
      `;
      
      webViewRef.current.injectJavaScript(html);
    }
  };

  const renderSearchResult = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSearchResultSelect(item)}
    >
      <Text style={styles.resultName}>{item.name}</Text>
      <Text style={styles.resultDetails}>
        {item.jobTitle ? `${item.jobTitle}` : ''}
        {item.company ? ` at ${item.company}` : ''}
        {!item.jobTitle && !item.company && item.institution ? 
          `${item.institution} (${item.fieldOfStudy || 'Alumni'})` : ''}
      </Text>
      {item.location && (
        <Text style={[styles.resultDetails, { color: '#888' }]}>{item.location}</Text>
      )}
    </TouchableOpacity>
  );

  const coords =
    currentLatitude !== null && currentLongitude !== null
      ? [currentLongitude, currentLatitude]
      : [0, 0];

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://unpkg.com/maplibre-gl@2.1.9/dist/maplibre-gl.js"></script>
      <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@2.1.9/dist/maplibre-gl.css" />
      <script src="https://unpkg.com/supercluster@7.1.5/dist/supercluster.min.js"></script>
      <style>
        html, body { margin: 0; height: 100%; overflow: hidden; }
        #map { width: 100%; height: 100%; }
        .mapboxgl-popup-content {
          padding: 12px;
          text-align: center;
          width: 180px;
        }
        .profile-pic {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          margin-bottom: 8px;
          object-fit: cover;
        }
        .connect-button {
          background-color: #4A00E0;
          color: white;
          padding: 6px 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          width: 100%;
          margin-bottom: 5px;
        }
        .connect-button:active {
          opacity: 0.7;
          transform: scale(0.98);
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .view-profile-button {
          background-color: #00A86B;
          color: white;
          padding: 6px 10px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          width: 100%;
        }
        .view-profile-button:active {
          opacity: 0.7;
          transform: scale(0.98);
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
        }
        .popup-buttons {
          display: flex;
          flex-direction: column;
          margin-top: 10px;
          gap: 5px;
        }
        .popup-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .popup-subtitle {
          font-size: 13px;
          color: #555;
          margin-bottom: 8px;
        }
        .cluster-marker {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background-color: #51bbd6;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          font-size: 14px;
          color: white;
          border: 2px solid #3388cc;
        }
        .cluster-marker-large {
          width: 40px;
          height: 40px;
          background-color: #f1f075;
          color: #333;
        }
        .cluster-marker-huge {
          width: 50px;
          height: 50px;
          background-color: #f28cb1;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        document.addEventListener("DOMContentLoaded", function () {
          console.log("Initializing MapLibre with clustering...");
          
          window.map = new maplibregl.Map({
            container: 'map',
            style: 'https://api.maptiler.com/maps/streets/style.json?key=' + '${MAPTILER_API_KEY}',
            center: ${JSON.stringify(coords)}, 
            zoom: 2
          });

          window.map.addControl(new maplibregl.NavigationControl());

          var currentUserMarker = new maplibregl.Marker({ color: "red" })
            .setLngLat(${JSON.stringify(coords)}) 
            .addTo(window.map);

          var index = new Supercluster({
            radius: 60,
            maxZoom: 16,
            minZoom: 2,
            extent: 256,
            nodeSize: 64
          });

          var alumniData = ${JSON.stringify(alumniData)};
          var points = alumniData
            .filter(alum => alum && alum.longitude && alum.latitude)
            .map(alum => ({
              type: 'Feature',
              properties: {
                id: alum.id,
                name: alum.name,
                profilePic: alum.profilePic,
                cluster: false
              },
              geometry: {
                type: 'Point',
                coordinates: [alum.longitude, alum.latitude]
              }
            }));

          index.load(points);

          var clusterSource = {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: []
            },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50
          };

          window.map.on('load', function() {
            window.map.addSource('alumni', clusterSource);

            window.map.addLayer({
              id: 'clusters',
              type: 'circle',
              source: 'alumni',
              filter: ['has', 'point_count'],
              paint: {
                'circle-color': [
                  'step',
                  ['get', 'point_count'],
                  '#51bbd6',
                  10,
                  '#f1f075',
                  30,
                  '#f28cb1'
                ],
                'circle-radius': [
                  'step',
                  ['get', 'point_count'],
                  20,
                  10,
                  30,
                  30,
                  40
                ]
              }
            });

            window.map.addLayer({
              id: 'cluster-count',
              type: 'symbol',
              source: 'alumni',
              filter: ['has', 'point_count'],
              layout: {
                'text-field': '{point_count_abbreviated}',
                'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                'text-size': 12
              }
            });

            window.map.addLayer({
              id: 'unclustered-point',
              type: 'circle',
              source: 'alumni',
              filter: ['!', ['has', 'point_count']],
              paint: {
                'circle-color': '#11b4da',
                'circle-radius': 8,
                'circle-stroke-width': 1,
                'circle-stroke-color': '#fff'
              }
            });

            updateClusters();
          });

          function updateClusters() {
            var bounds = window.map.getBounds();
            var zoom = window.map.getZoom();

            var clusters = index.getClusters([
              bounds.getWest(),
              bounds.getSouth(),
              bounds.getEast(),
              bounds.getNorth()
            ], Math.floor(zoom));

            window.map.getSource('alumni').setData({
              type: 'FeatureCollection',
              features: clusters
            });
          }

          function animateButton(button) {
            button.style.opacity = '0.7';
            button.style.transform = 'scale(0.98)';
            setTimeout(() => {
              button.style.opacity = '1';
              button.style.transform = 'scale(1)';
            }, 150);
          }

          window.handleConnect = function (alumniId) {
            const button = document.querySelector(\`button[onclick="handleConnect('\${alumniId}')"]\`);
            if (button) animateButton(button);
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'connect',
              id: alumniId
            }));
          };

          window.handleViewProfile = function (alumniId) {
            const button = document.querySelector(\`button[onclick="handleViewProfile('\${alumniId}')"]\`);
            if (button) animateButton(button);
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'viewProfile',
              id: alumniId
            }));
          };

          window.map.on('click', 'clusters', function(e) {
            var features = window.map.queryRenderedFeatures(e.point, {
              layers: ['clusters']
            });

            var clusterId = features[0].properties.cluster_id;
            var source = window.map.getSource('alumni');

            source.getClusterExpansionZoom(clusterId, function(err, zoom) {
              if (err) return;

              window.map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
              });
            });
          });

          window.map.on('click', 'unclustered-point', function(e) {
            var coordinates = e.features[0].geometry.coordinates.slice();
            var properties = e.features[0].properties;

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            const alum = alumniData.find(a => a.id === properties.id);
            
            new maplibregl.Popup({ 
              offset: 25,
              maxWidth: '180px'
            })
              .setLngLat(coordinates)
              .setHTML(\`
                <div class="popup-content">
                  <img src="\${properties.profilePic}" class="profile-pic" alt="\${properties.name}" />
                  <div class="popup-title">\${properties.name}</div>
                  <div class="popup-subtitle">
                    \${alum?.jobTitle || ''}\${alum?.jobTitle && alum?.company ? ' at ' : ''}\${alum?.company || ''}
                  </div>
                  <div class="popup-buttons">
                    <button class="connect-button" onclick="handleConnect('\${properties.id}')">
                      Connect
                    </button>
                    <button class="view-profile-button" onclick="handleViewProfile('\${properties.id}')">
                      View Profile
                    </button>
                  </div>
                </div>
              \`)
              .addTo(window.map);
          });

          window.map.on('mouseenter', 'clusters', function() {
            window.map.getCanvas().style.cursor = 'pointer';
          });

          window.map.on('mouseleave', 'clusters', function() {
            window.map.getCanvas().style.cursor = '';
          });

          window.map.on('mouseenter', 'unclustered-point', function() {
            window.map.getCanvas().style.cursor = 'pointer';
          });

          window.map.on('mouseleave', 'unclustered-point', function() {
            window.map.getCanvas().style.cursor = '';
          });

          window.map.on('moveend', updateClusters);

          console.log("Map with clustering initialized.");
        });
      </script>
    </body>
    </html>
  `;

  return (
    <TouchableWithoutFeedback 
      onPress={() => {
        Keyboard.dismiss();
        setIsInputFocused(false);
        setSearchResults([]);
      }} 
      accessible={false}
    >
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search alumni by name, location, skills, etc."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearchChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {(isSearching || (searchResults.length > 0 && isInputFocused)) && (
            <View style={styles.resultsContainer}>
              {isSearching ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#4A00E0" />
                </View>
              ) : searchResults.length > 0 ? (
                <FlatList
                  data={searchResults}
                  renderItem={renderSearchResult}
                  keyExtractor={(item) => item.id}
                  keyboardShouldPersistTaps="always"
                />
              ) : (
                <Text style={styles.noResultsText}>No results found</Text>
              )}
            </View>
          )}
        </View>
        <WebView
          ref={webViewRef}
          source={{ html }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          originWhitelist={["*"]}
          allowFileAccessFromFileURLs={true}
          allowUniversalAccessFromFileURLs={true}
          mixedContentMode="always"
          onMessage={handleWebViewMessage}
          injectedJavaScript={`
            window.ReactNativeWebView = window.ReactNativeWebView || {
              postMessage: function(data) {
                window.postMessage(data);
              }
            };
            true;
          `}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export default HereMap;
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { NavigationProp } from '@react-navigation/native';

interface HomePageProps {
  navigation: NavigationProp<any>; // You can specify a more specific type if you have defined your navigation structure
}

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState<string>("User"); // Default value

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth().currentUser;
      if (user) {
        const userDoc = await firestore().collection("users").doc(user.uid).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          setDisplayName(userData?.fullName || "User"); // Set name from Firestore
        }
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "OK",
        onPress: () => {
          auth()
            .signOut()
            .then(() => {
              navigation.navigate("Login"); // Navigate to the Login screen
            })
            .catch(error => {
              console.error("Sign out error:", error);
            });
        },
      },
    ]);
  };

  return (
    <LinearGradient colors={["#A89CFF", "#C8A2C8"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Icon name="list" size={30} color="black" />
          <Text style={styles.logo}>AlumNITD</Text>
          <TouchableOpacity onPress={handleSignOut}>
            <Icon name="log-out-outline" size={30} color="black" /> {/* Sign out button */}
          </TouchableOpacity>
        </View>
        
        <Text style={styles.userText}><Text style={styles.bold}>Hi, </Text><Text>{displayName}</Text></Text>
        
        <Text style={styles.welcomeText}>Welcome to AlumNITD - Your Alumni Network</Text>
        
        <View style={styles.cardContainer}>
          <FeatureCard 
            title="Explore Job Opportunities" 
            image={require('./assets/Job.png')}
            text="Join our community to access exclusive job listings and resources tailored for alumni."
          />
          
          <FeatureCard 
            title="Connect with Nearby Alumni" 
            image={require('./assets/alumni.png')} 
            text="See the alumni locations and connect with your peers in your area."
          />
          
          <FeatureCard 
            title="Upcoming Events" 
            image={require('./assets/events.png')} 
            text="Stay updated with the latest events and networking opportunities."
          />
        </View>
        
        <Text style={styles.quickLinksTitle}>Quick Links</Text>
        <View style={styles.quickLinksContainer}>
          <QuickLink icon="person-circle" text="Profile" />
          <QuickLink icon="mail" text="Messages" />
          <QuickLink icon="cash-outline" text="Donations" />
          <QuickLink icon="chatbubble-ellipses-outline" text="Discussion" />
        </View>
        
        <Text style={styles.contactText}>Contact Us: <Text style={styles.bold}>support@alumnitd.com</Text> | <Text style={styles.bold}>+91 XXXXXXXXXX</Text></Text>
        <Text style={styles.footerText}>Privacy Policy | Terms and Conditions | About Us</Text>
      </ScrollView>
    </LinearGradient>
  );
};

// Define the type for FeatureCard props
interface FeatureCardProps {
  title: string;
  image: any; 
  text: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, image, text }) => (
  <View style={styles.card}>
    <Image source={image} style={styles.cardImage} />
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDescription}>{text}</Text>
  </View>
);

// Define the type for QuickLink props
interface QuickLinkProps {
  icon: string;
  text: string; // Add text prop to specify the label
}

const QuickLink: React.FC<QuickLinkProps> = ({ icon, text }) => (
  <TouchableOpacity style={styles.quickLink}>
    <Icon name={icon} size={30} color="black" />
    <Text style={styles.quickLinkText}>{text}</Text> {/* Use the passed text */}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { alignItems: 'center', paddingBottom: 20 },
  header: { flexDirection: 'row', width: '90%', justifyContent: 'space-between', alignItems: 'center', marginTop: 50 },
  logo: { fontSize: 22, fontWeight: 'bold' },
  userText: { fontSize: 18 },
  bold: { fontWeight: 'bold' },
  welcomeText: { fontSize: 16, textAlign: 'center', marginVertical: 20 },
  cardContainer: { width: '90%' },
  card: { backgroundColor: 'white', borderRadius: 10, padding: 15, alignItems: 'center', marginBottom: 15 },
  cardImage: { width: 80, height: 80, marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  cardDescription: { fontSize: 14, textAlign: 'center', color: 'gray' },
  quickLinksTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  quickLinksContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '80%' },
  quickLink: { alignItems: 'center' },
  quickLinkText: { fontSize: 12, marginTop: 5 },
  contactText: { marginTop: 20, fontSize: 14 },
  footerText: { fontSize: 12, color: 'gray', marginTop: 5, textAlign: 'center' },
});

export default HomePage;

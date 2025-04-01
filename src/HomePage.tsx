import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { NavigationProp } from '@react-navigation/native';

interface HomePageProps {
  navigation: NavigationProp<any>;
}

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState<string>('User');
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth().currentUser;
      if (user) {
        const userDoc = await firestore().collection('users').doc(user.uid).get();
        if (userDoc.exists) {
          setDisplayName(userDoc.data()?.fullName || 'User');
        }
      }
    };
    fetchUserData();
  }, []);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'OK', onPress: () => auth().signOut().then(() => navigation.navigate('Login')) },
    ]);
  };

  return (
    <LinearGradient colors={['#A89CFF', '#C8A2C8']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
            <Icon name="menu" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.logo}>AlumNITD</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('AlumniSearch')}>
              <Icon name="search" size={30} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {menuVisible && (
          <View style={styles.menu}>
            <MenuItem icon="person-circle" text="Profile" onPress={() => navigation.navigate('Profile')} />
            <MenuItem icon="mail" text="Messages" onPress={() => navigation.navigate('MessagesList')} />
            <MenuItem icon="cash-outline" text="Donations" onPress={() => {}} />
            <MenuItem icon="chatbubble-ellipses-outline" text="Discussion" onPress={() => {}} />
            <MenuItem 
              icon="log-out-outline" 
              text="Log Out" 
              onPress={handleSignOut} 
              iconColor="#FF0000" 
              textColor="#FF0000" 
            />
          </View>
        )}

        <Text style={styles.userText}><Text style={styles.bold}>Hi, </Text>{displayName}</Text>
        <Text style={styles.welcomeText}>Welcome to AlumNITD - Your Alumni Network</Text>

        <View style={styles.cardContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('JobOpportunities')}>
            <FeatureCard 
              title="Explore Job Opportunities" 
              image={require('./assets/Job.png')} 
              text="Join our community for exclusive job listings." 
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Map')}>
            <FeatureCard
              title="Connect with Nearby Alumni"
              image={require('./assets/alumni.png')}
              text="See alumni locations and connect with peers."
            />
          </TouchableOpacity>
          <FeatureCard title="Upcoming Events" image={require('./assets/events.png')} text="Stay updated with events and networking opportunities." />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

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

interface MenuItemProps {
  icon: string;
  text: string;
  onPress: () => void;
  iconColor?: string;
  textColor?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, onPress, iconColor = 'black', textColor = 'black' }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Icon name={icon} size={25} color={iconColor} />
    <Text style={[styles.menuText, { color: textColor }]}>{text}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { alignItems: 'center', paddingBottom: 20 },
  header: { flexDirection: 'row', width: '90%', justifyContent: 'space-between', alignItems: 'center', marginTop: 50 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  logo: { fontSize: 22, fontWeight: 'bold' },
  userText: { fontSize: 18 },
  bold: { fontWeight: 'bold' },
  welcomeText: { fontSize: 16, textAlign: 'center', marginVertical: 20 },
  cardContainer: { width: '90%' },
  card: { backgroundColor: 'white', borderRadius: 10, padding: 15, alignItems: 'center', marginBottom: 15 },
  cardImage: { width: 80, height: 80, marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  cardDescription: { fontSize: 14, textAlign: 'center', color: 'gray' },
  menu: { backgroundColor: 'white', padding: 10, borderRadius: 8, width: '80%', marginVertical: 10 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 10 },
  menuText: { fontSize: 16, marginLeft: 10 },
});

export default HomePage;
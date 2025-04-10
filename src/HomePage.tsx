import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, BackHandler } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';

interface HomePageProps {
  navigation: NavigationProp<any>;
}

interface FeatureCardProps {
  title: string;
  image: any;
  text: string;
  onPress?: () => void;
}

interface MenuItemProps {
  icon: string;
  text: string;
  onPress: () => void;
  iconColor?: string;
  textColor?: string;
}

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState<string>('User');
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth().currentUser;
      if (user) {
        try {
          const userDoc = await firestore().collection('users').doc(user.uid).get();
          if (userDoc.exists) {
            setDisplayName(userDoc.data()?.fullName || 'User');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        Alert.alert('Exit App', 'Do you want to exit?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandler.remove();
    }, [])
  );

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'OK', 
        onPress: () => auth().signOut().then(() => navigation.navigate('Login')).catch(error => {
          console.error('Sign out error:', error);
          Alert.alert('Error', 'Failed to sign out. Please try again.');
        }) 
      },
    ]);
  };

  const FeatureCard: React.FC<FeatureCardProps> = ({ title, image, text, onPress }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.card}>
        <Image source={image} style={styles.cardImage} />
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{text}</Text>
      </View>
    </TouchableOpacity>
  );

  const MenuItem: React.FC<MenuItemProps> = ({ icon, text, onPress, iconColor = 'black', textColor = 'black' }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <Icon name={icon} size={25} color={iconColor} />
      <Text style={[styles.menuText, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#A89CFF', '#A89CFF']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)} activeOpacity={0.7}>
            <Icon name="menu" size={30} color="black" />
          </TouchableOpacity>
          <Text style={styles.logo}>AlumNITD</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('AlumniSearch')} activeOpacity={0.7}>
              <Icon name="search" size={30} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {menuVisible && (
          <View style={styles.menu}>
            <MenuItem 
              icon="person-circle" 
              text="Profile" 
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Profile');
              }} 
            />
            <MenuItem 
              icon="mail" 
              text="Messages" 
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('MessagesList');
              }} 
            />
            <MenuItem 
              icon="cash-outline" 
              text="Donations" 
              onPress={() => {
                setMenuVisible(false);
                // navigation.navigate('Donations');
              }} 
            />
            <MenuItem 
              icon="chatbubble-ellipses-outline" 
              text="Discussion" 
              onPress={() => {
                setMenuVisible(false);
                // navigation.navigate('Discussion');
              }} 
            />
            <MenuItem 
              icon="log-out-outline" 
              text="Log Out" 
              onPress={() => {
                setMenuVisible(false);
                handleSignOut();
              }} 
              iconColor="#FF0000" 
              textColor="#FF0000" 
            />
          </View>
        )}

        <Text style={styles.userText}><Text style={styles.bold}>Hi, </Text>{displayName}</Text>
        <Text style={styles.welcomeText}>Welcome to AlumNITD - Your Alumni Network</Text>

        <View style={styles.cardContainer}>
          <FeatureCard 
            title="Explore Job Opportunities" 
            image={require('./assets/Job.png')} 
            text="Join our community for exclusive job listings."
            onPress={() => navigation.navigate('JobOpportunities')}
          />

          <FeatureCard
            title="Connect with Nearby Alumni"
            image={require('./assets/alumni.png')}
            text="See alumni locations and connect with peers."
            onPress={() => navigation.navigate('Map')}
          />

<FeatureCard 
  title="Upcoming Events" 
  image={require('./assets/events.png')} 
  text="Stay updated with events and networking opportunities."
  onPress={() => navigation.navigate('Events')} // Add this line
/>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollContainer: { 
    alignItems: 'center', 
    paddingBottom: 20 
  },
  header: { 
    flexDirection: 'row', 
    width: '90%', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 50,
    marginBottom: 10 
  },
  headerIcons: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  logo: { 
    fontSize: 22, 
    fontWeight: 'bold' 
  },
  userText: { 
    fontSize: 18, 
    marginTop: 10,
    marginBottom: 5 
  },
  bold: { 
    fontWeight: 'bold' 
  },
  welcomeText: { 
    fontSize: 16, 
    textAlign: 'center', 
    marginVertical: 10,
    paddingHorizontal: 20 
  },
  cardContainer: { 
    width: '90%',
    marginTop: 10 
  },
  card: { 
    backgroundColor: 'white', 
    borderRadius: 10, 
    padding: 15, 
    alignItems: 'center', 
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: { 
    width: 80, 
    height: 80, 
    marginBottom: 10,
    resizeMode: 'contain' 
  },
  cardTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    textAlign: 'center',
    marginBottom: 5 
  },
  cardDescription: { 
    fontSize: 14, 
    textAlign: 'center', 
    color: 'gray',
    paddingHorizontal: 10 
  },
  menu: { 
    backgroundColor: 'white', 
    padding: 10, 
    borderRadius: 8, 
    width: '80%', 
    marginVertical: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 10,
    borderRadius: 5 
  },
  menuText: { 
    fontSize: 16, 
    marginLeft: 10 
  },
});

export default HomePage;
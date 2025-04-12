import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, BackHandler, Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface HomePageProps {
  navigation: NavigationProp<any>;
}

interface FeatureCardProps {
  title: string;
  image: any;
  text: string;
  onPress?: () => void;
  showDot?: boolean;
}

interface MenuItemProps {
  icon: string;
  text: string;
  onPress: () => void;
  iconColor?: string;
  textColor?: string;
  showDot?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState<string>('User');
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [hasNewRequests, setHasNewRequests] = useState<boolean>(false);

  // Check for new connection requests
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;
  
    const unsubscribe = firestore()
      .collection('connectionRequests')
      .where('toUserId', '==', currentUser.uid)
      .where('status', '==', 'pending')
      .onSnapshot(
        snapshot => {
          if (snapshot) {
            setHasNewRequests(!snapshot.empty);
          } else {
            setHasNewRequests(false);
          }
        },
        error => {
          console.error('Error fetching connection requests:', error);
          setHasNewRequests(false);
        }
      );
  
    return () => unsubscribe();
  }, []);

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
        if (menuVisible) {
          setMenuVisible(false);
          return true;
        }
        Alert.alert('Exit App', 'Do you want to exit?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Exit', onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => backHandler.remove();
    }, [menuVisible])
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

  const FeatureCard: React.FC<FeatureCardProps> = ({ title, image, text, onPress, showDot = false }) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <View style={styles.card}>
        <View style={styles.cardImageContainer}>
          <Image source={image} style={styles.cardImage} />
          {showDot && <View style={styles.notificationDotLarge} />}
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{text}</Text>
      </View>
    </TouchableOpacity>
  );

  const MenuItem: React.FC<MenuItemProps> = ({ icon, text, onPress, iconColor = 'black', textColor = 'black', showDot = false }) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={() => {
        onPress();
        setMenuVisible(false);
      }} 
      activeOpacity={0.6}
    >
      <View style={styles.iconContainer}>
        <Icon name={icon} size={25} color={iconColor} />
        {showDot && <View style={styles.notificationDot} />}
      </View>
      <Text style={[styles.menuText, { color: textColor }]}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Overlay for when menu is visible */}
      {menuVisible && (
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        />
      )}
      
      {/* Side Menu */}
      {menuVisible && (
        <View style={styles.sideMenu}>
          <View style={styles.menuHeader}>
            <Text style={styles.menuHeaderText}>Menu</Text>
            <TouchableOpacity onPress={() => setMenuVisible(false)}>
              <Icon name="close" size={25} color="#FFF" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.menuItemsContainer}>
            <MenuItem 
              icon="person-circle" 
              text="Profile" 
              onPress={() => navigation.navigate('Profile')} 
              iconColor="#FFF"
              textColor="#FFF"
            />
            <MenuItem 
              icon="people-outline" 
              text="My Network" 
              onPress={() => {
                navigation.navigate('MyNetwork');
                setHasNewRequests(false);
              }}
              showDot={hasNewRequests}
              iconColor="#FFF"
              textColor="#FFF"
            />
            <MenuItem 
              icon="mail" 
              text="Messages" 
              onPress={() => navigation.navigate('MessagesList')} 
              iconColor="#FFF"
              textColor="#FFF"
            />
            <MenuItem 
              icon="time-outline" 
              text="Time Capsules" 
              onPress={() => navigation.navigate('TimeCapsules')} 
              iconColor="#FFF"
              textColor="#FFF"
            />
            <MenuItem 
              icon="chatbubble-ellipses-outline" 
              text="Discussion" 
              onPress={() => navigation.navigate('Discussion')} 
              iconColor="#FFF"
              textColor="#FFF"
            />
            <MenuItem 
              icon="gift-outline" 
              text="Donations" 
              onPress={() => navigation.navigate('Donation')} 
              iconColor="#FFF"
              textColor="#FFF"
            />
          </ScrollView>
          <MenuItem 
            icon="log-out-outline" 
            text="Log Out" 
            onPress={handleSignOut} 
            iconColor="#FF6B6B" 
            textColor="#FF6B6B" 
          />
        </View>
      )}
      
      <LinearGradient colors={['#A89CFF', '#A89CFF']} style={styles.mainContent}>
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
              title="My Network" 
              image={require('./assets/network.png')} 
              text="View and manage your alumni connections"
              onPress={() => {
                navigation.navigate('MyNetwork');
                setHasNewRequests(false);
              }}
              showDot={hasNewRequests}
            />

            <FeatureCard 
              title="Upcoming Events" 
              image={require('./assets/events.png')} 
              text="Stay updated with events and networking opportunities."
              onPress={() => navigation.navigate('Events')}
            />
          </View>
        </ScrollView>

        {/* Bottom Menu Row */}
        <View style={styles.bottomMenu}>
          <TouchableOpacity 
            style={styles.bottomMenuItem} 
            onPress={() => navigation.navigate('MessagesList')}
          >
            <Icon name="mail" size={25} color="black" />
            <Text style={styles.bottomMenuText}>Messages</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.bottomMenuItem} 
            onPress={() => navigation.navigate('TimeCapsules')}
          >
            <Icon name="time-outline" size={25} color="black" />
            <Text style={styles.bottomMenuText}>Time Capsules</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.bottomMenuItem} 
            onPress={() => {
              navigation.navigate('MyNetwork');
              setHasNewRequests(false);
            }}
          >
            <View style={styles.iconContainer}>
              <Icon name="people-outline" size={25} color="black" />
              {hasNewRequests && <View style={styles.notificationDot} />}
            </View>
            <Text style={styles.bottomMenuText}>My Network</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.bottomMenuItem} 
            onPress={() => navigation.navigate('Discussion')}
          >
            <Icon name="chatbubble-ellipses-outline" size={25} color="black" />
            <Text style={styles.bottomMenuText}>Discussion</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  mainContent: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1,
  },
  sideMenu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.65,
    backgroundColor: '#5C2D91',
    zIndex: 2,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
    marginBottom: 10,
  },
  menuHeaderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  menuItemsContainer: {
    flex: 1,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 10,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5C2D91',
  },
  userText: {
    fontSize: 18,
    marginTop: 10,
    marginBottom: 5,
    color: '#4B0082',
  },
  bold: {
    fontWeight: 'bold',
    color: '#6A0DAD',
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
    paddingHorizontal: 20,
    color: '#5D3FD3',
  },
  cardContainer: {
    width: '90%',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#EDE7F6',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#7B1FA2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  cardImageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: 80,
    height: 80,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#512DA8',
  },
  cardDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6C3483',
    paddingHorizontal: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#FFF',
  },
  bottomMenu: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#EDE7F6',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#B39DDB',
    elevation: 8,
  },
  bottomMenuItem: {
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  bottomMenuText: {
    fontSize: 12,
    marginTop: 5,
    color: '#5C2D91',
  },
  iconContainer: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -3,
    right: -3,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
  },
  notificationDotLarge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
  },
});

export default HomePage;
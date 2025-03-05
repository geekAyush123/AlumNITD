import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet, Alert, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { NavigationProp } from '@react-navigation/native';

interface HomePageProps {
  navigation: NavigationProp<any>;
}

const HomePage: React.FC<HomePageProps> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState<string>('User');
  const [menuVisible, setMenuVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');

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
          <TouchableOpacity onPress={handleSignOut}>
            <Icon name="log-out-outline" size={30} color="black" />
          </TouchableOpacity>
        </View>

        {menuVisible && (
          <View style={styles.menu}>
            <MenuItem icon="person-circle" text="Profile Settings" onPress={() => navigation.navigate('Profile')} />
            <MenuItem icon="mail" text="Messages" onPress={() => {}} />
            <MenuItem icon="cash-outline" text="Donations" onPress={() => {}} />
            <MenuItem icon="chatbubble-ellipses-outline" text="Discussion" onPress={() => {}} />
          </View>
        )}

        <Text style={styles.userText}><Text style={styles.bold}>Hi, </Text>{displayName}</Text>
        <Text style={styles.welcomeText}>Welcome to AlumNITD - Your Alumni Network</Text>

        {/* Search and Filters */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search Alumni..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {/* <Picker selectedValue={selectedBatch} style={styles.picker} onValueChange={setSelectedBatch}>
            <Picker.Item label="Select Batch" value="" />
            <Picker.Item label="2024" value="2024" />
            <Picker.Item label="2023" value="2023" />
            <Picker.Item label="2022" value="2022" />
          </Picker>
          <Picker selectedValue={selectedDepartment} style={styles.picker} onValueChange={setSelectedDepartment}>
            <Picker.Item label="Select Department" value="" />
            <Picker.Item label="CSE" value="CSE" />
            <Picker.Item label="ECE" value="ECE" />
            <Picker.Item label="ME" value="ME" />
          </Picker> */}
        </View>

        {/* <View style={styles.cardContainer}>
          <FeatureCard title="Explore Job Opportunities" image={require('./assets/Job.png')} text="Join our community for exclusive job listings." />
          <FeatureCard title="Connect with Nearby Alumni" image={require('./assets/alumni.png')} text="See alumni locations and connect with peers." />
          <FeatureCard title="Upcoming Events" image={require('./assets/events.png')} text="Stay updated with events and networking opportunities." />
        </View> */}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { alignItems: 'center', paddingBottom: 20 },
  header: { flexDirection: 'row', width: '90%', justifyContent: 'space-between', alignItems: 'center', marginTop: 50 },
  logo: { fontSize: 22, fontWeight: 'bold' },
  userText: { fontSize: 18 },
  bold: { fontWeight: 'bold' },
  welcomeText: { fontSize: 16, textAlign: 'center', marginVertical: 20 },
  searchContainer: { width: '90%', marginVertical: 15 },
  searchInput: { backgroundColor: 'white', borderRadius: 10, padding: 10, fontSize: 16, marginBottom: 10 },
  picker: { backgroundColor: 'white', borderRadius: 10, marginBottom: 10 },
  cardContainer: { width: '90%' },
});

export default HomePage;
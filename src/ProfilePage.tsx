import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Image, TouchableOpacity } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import firestore from '@react-native-firebase/firestore';

interface PrivacySettings {
  emailNotifications: boolean;
  profileVisibility: boolean;
  showGraduationYear: boolean;
  showWorkExperience: boolean;
}

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  graduationYear: string;
  profilePic: string;
  role: string;
  privacySettings: PrivacySettings;
}

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const userDoc = await firestore().collection('users').doc('userID').get();
        if (userDoc.exists) {
          setProfileData(userDoc.data() as ProfileData);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  const updateField = (field: keyof ProfileData, value: any) => {
    setProfileData(prevData => (prevData ? { ...prevData, [field]: value } : { [field]: value } as ProfileData));
  };

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      if (response.assets && response.assets.length > 0) {
        updateField('profilePic', response.assets[0].uri);
      }
    });
  };

  const saveProfile = async () => {
    if (profileData) {
      try {
        await firestore().collection('users').doc('userID').set(profileData);
        console.log('Profile updated successfully');
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {profileData ? (
        <>
          <TouchableOpacity onPress={pickImage}>
            {profileData.profilePic ? (
              <Image source={{ uri: profileData.profilePic }} style={{ width: 100, height: 100, borderRadius: 50 }} />
            ) : (
              <Text>Select Profile Picture</Text>
            )}
          </TouchableOpacity>

          <Text>Full Name:</Text>
          <TextInput
            value={profileData.fullName}
            onChangeText={text => updateField('fullName', text)}
            style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
          />

          <Text>Email:</Text>
          <TextInput
            value={profileData.email}
            editable={false}
            style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
          />

          <Text>Phone:</Text>
          <TextInput
            value={profileData.phone}
            onChangeText={text => updateField('phone', text)}
            style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
          />

          <Text>Location:</Text>
          <TextInput
            value={profileData.location}
            onChangeText={text => updateField('location', text)}
            style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
          />

          <Text>Graduation Year:</Text>
          <TextInput
            value={profileData.graduationYear}
            onChangeText={text => updateField('graduationYear', text)}
            style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
          />

          <Text>Role:</Text>
          <TextInput
            value={profileData.role}
            onChangeText={text => updateField('role', text)}
            style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
          />

          <Button title="Save Profile" onPress={saveProfile} />
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

export default ProfilePage;

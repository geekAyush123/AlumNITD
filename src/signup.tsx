import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text } from 'react-native-paper';

const Login: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Image source={require('./assets/logo_alum.jpg')} style={styles.logo} />
      <Text style={styles.title}>Welcome to Alumni Connect</Text>
      <Button mode="contained" onPress={() => navigation.navigate('SignIn')} style={styles.button}>
        Sign In
      </Button>
      <Button mode="outlined" onPress={() => navigation.navigate('SignUp')} style={styles.button}>
        Sign Up
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  logo: { width: 150, height: 150, marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  button: { marginTop: 10, width: '80%' },
});

export default Login;

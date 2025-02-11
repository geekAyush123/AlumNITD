import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import EncryptedStorage from 'react-native-encrypted-storage';
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define navigation type
type RootStackParamList = {
  Home: undefined;
};
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// Validation Schema using Zod
const loginSchema = z.object({
  email: z.string()
    .email({ message: 'Invalid email address' })
    .refine((email) => email.toLowerCase().endsWith("@nitdelhi.ac.in"), {
      message: "Email must be from nitdelhi.ac.in domain"
    }),
  password: z.string()
    .min(6, { message: 'Password must be at least 6 characters long' })
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",  // Validate in real-time
    shouldUnregister: false
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(data.email, data.password);

      // Securely store user email
      await EncryptedStorage.setItem("userToken", JSON.stringify({ email: data.email }));

      Alert.alert("Success", "You are logged in!");
      navigation.navigate("Home");
    } catch (error: any) {
      let errorMsg = "An error occurred. Please try again.";
      if (error.code === 'auth/user-not-found') errorMsg = "User not found. Please check your email.";
      if (error.code === 'auth/wrong-password') errorMsg = "Incorrect password. Please try again.";
      Alert.alert("Login Failed", errorMsg);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      {/* Email Input */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Email"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            error={!!errors.email}
          />
        )}
      />
      {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

      {/* Password Input */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            mode="outlined"
            secureTextEntry
            style={styles.input}
            error={!!errors.password}
          />
        )}
      />
      {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

      {/* Login Button */}
      <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={loading} style={styles.button}>
        Login
      </Button>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  }
});

export default Login;

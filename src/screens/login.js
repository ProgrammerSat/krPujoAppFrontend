import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  Keyboard,
  Alert,
  Image,
  Platform,
} from 'react-native';

import BASE_URL from '../env';

const {width, height} = Dimensions.get('window');

// Import the image at the top level
const logoImage = require('../assets/Images/durgaMaFace.png');

const Login = ({navigation}) => {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const titleScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(titleScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    // Dismiss keyboard first
    Keyboard.dismiss();

    // Basic validation
    if (!mobile.trim()) {
      Alert.alert('Error', 'Please enter your mobile number.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(BASE_URL + '/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: mobile,
          password: password,
        }),
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.log('Non-JSON response from server:', text);
        Alert.alert('Error', 'Invalid response from server.');
        return;
      }

      if (response.ok) {
        console.log('Login Success:', data);
        console.log('Success', 'Logged in successfully!');

        // Fixed navigation reset - params should be inside the route object
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Home',
              params: {
                userRole: data.user.userRole,
                userID: data.user.id,
                name: data.user.name,
                cooperativeSociety: data.user.cooperativeSociety,
                flatNumber: data.user.flatNumber,
                phoneNumber: data.user.phoneNumber,
              },
            },
          ],
        });
      } else {
        // Handle login failure
        Alert.alert(
          'Login Failed',
          data.message || 'Invalid credentials. Please try again.',
        );
      }
    } catch (err) {
      console.error('Login error:', err);
      Alert.alert(
        'Error',
        'Unable to login. Please check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with gradient background */}
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}, {scale: titleScale}],
            },
          ]}>
          <View style={styles.logoContainer}>
            <Image
              source={logoImage}
              style={styles.logoImage}
              resizeMode="contain"
              onError={error => {
                console.log('Image load error:', error);
              }}
              onLoad={() => {
                console.log('Image loaded successfully');
              }}
              defaultSource={require('../assets/Images/durgaMaFace.png')}
            />
          </View>
          <Text style={styles.appTitle}>Q Block Puja App</Text>
          <Text style={styles.subtitle}>Welcome back</Text>
        </Animated.View>
      </View>

      {/* Login Form */}
      <Animated.View
        style={[
          styles.formContainer,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mobile Number</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your mobile number"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
                maxLength={10}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#999"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}>
            <Text style={styles.buttonText}>
              {isLoading ? 'SIGNING IN...' : 'LOGIN'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation?.navigate?.('Verify Secret')}
            style={styles.registerLink}>
            <Text style={styles.linkText}>
              Forgot Password? <Text style={styles.linkTextBold}>Update</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation?.navigate?.('Register')}
            style={styles.registerLink}>
            <Text style={styles.linkText}>
              New User? <Text style={styles.linkTextBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF6B35',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  titleContainer: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  logoText: {
    fontSize: 40,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '300',
  },
  formContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: -20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  input: {
    padding: 18,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#FF6B35',
    borderRadius: 15,
    paddingVertical: 18,
    marginTop: 20,
    marginBottom: 30,
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#ffab8a',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  linkText: {
    color: '#666',
    fontSize: 14,
  },
  linkTextBold: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
});

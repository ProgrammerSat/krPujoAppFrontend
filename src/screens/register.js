import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import BASE_URL from '../env';

const Register = () => {
  const [selectedSociety, setSelectedSociety] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [errors, setErrors] = useState({});

  const navigation = useNavigation();

  // Regex to validate cooperative society (Q56 to Q74)
  const validateSociety = input => {
    const regex = /^Q(5[6-9]|6[0-9]|7[0-4])$/;
    return regex.test(input);
  };

  const handleSocietyChange = text => {
    // Convert to uppercase and remove spaces
    const cleanText = text.toUpperCase().replace(/\s/g, '');
    setSelectedSociety(cleanText);

    // Clear error if valid
    if (validateSociety(cleanText) || cleanText === '') {
      setErrors(prev => ({...prev, society: null}));
    } else {
      setErrors(prev => ({
        ...prev,
        society: 'Society must be between Q56 and Q74',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedSociety) {
      newErrors.society = 'Co-operative Society is required';
    } else if (!validateSociety(selectedSociety)) {
      newErrors.society = 'Society must be between Q56 and Q74';
    }

    if (!flatNo.trim()) newErrors.flatNo = 'Flat number is required';
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(mobile)) {
      newErrors.mobile = 'Mobile number must be 10 digits';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!secretCode.trim()) newErrors.secretCode = 'Secret code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    // Dismiss keyboard first
    Keyboard.dismiss();

    if (!validateForm()) return;

    try {
      const response = await fetch(BASE_URL + '/user/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          cooperativeSociety: selectedSociety,
          name,
          flatNumber: flatNo,
          password: confirmPassword,
          phoneNumber: mobile,
          userRole: 'U01',
          userSecretCode: secretCode,
          userSubType: 'NA',
          userSubPaid: false,
          userPaidAmt: 0,
          userCpnActiveStatus: false,
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        Alert.alert('Success', 'Registration successful! 🎉', [
          {text: 'OK', onPress: () => navigation.navigate('Login')},
        ]);
      } else if (response.status === 409) {
        Alert.alert('Duplicate Entry', data.message);
      } else {
        Alert.alert('Registration Failed', data.message || 'Try again later.');
      }
    } catch (error) {
      console.error('Registration Error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };

  const handleLoginNavigation = () => {
    Keyboard.dismiss();
    navigation.navigate('Login');
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <>
      <StatusBar backgroundColor="#FF6B35" barStyle="light-content" />
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Text style={styles.appTitle}>Puja Management App</Text>
              <Text style={styles.subtitle}>Create Your Account</Text>
            </View>
            <View style={styles.omSymbol}>
              <Text style={styles.om}>ॐ</Text>
            </View>
          </View>

          {/* Form */}
          <ScrollView
            style={styles.formContainer}
            contentContainerStyle={styles.formContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <View style={styles.welcomeCard}>
              <Text style={styles.welcomeTitle}>Welcome! 🙏</Text>
              <Text style={styles.welcomeText}>Join your puja community</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Co-operative Society</Text>
              <TextInput
                style={[styles.input, errors.society && styles.inputError]}
                placeholder="Enter Society (e.g., Q67)"
                value={selectedSociety}
                onChangeText={handleSocietyChange}
                placeholderTextColor="#999"
                autoCapitalize="characters"
                maxLength={3}
              />
              {errors.society && (
                <Text style={styles.errorText}>{errors.society}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Flat No.</Text>
              <TextInput
                style={[styles.input, errors.flatNo && styles.inputError]}
                placeholder="Enter your flat number"
                value={flatNo}
                onChangeText={setFlatNo}
                placeholderTextColor="#999"
                maxLength={10}
              />
              {errors.flatNo && (
                <Text style={styles.errorText}>{errors.flatNo}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, errors.name && styles.inputError]}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999"
                autoCapitalize="words"
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={[styles.input, errors.mobile && styles.inputError]}
                placeholder="Enter 10-digit mobile number"
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={setMobile}
                placeholderTextColor="#999"
                maxLength={10}
              />
              {errors.mobile && (
                <Text style={styles.errorText}>{errors.mobile}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Create a secure password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                placeholderTextColor="#999"
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.confirmPassword && styles.inputError,
                ]}
                placeholder="Re-enter your password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#999"
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Secret Code</Text>
              <TextInput
                style={[styles.input, errors.secretCode && styles.inputError]}
                placeholder="Enter society secret code"
                secureTextEntry
                value={secretCode}
                onChangeText={setSecretCode}
                placeholderTextColor="#999"
                maxLength={4}
                keyboardType="numeric"
              />
              {errors.secretCode && (
                <Text style={styles.errorText}>{errors.secretCode}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              activeOpacity={0.8}>
              <Text style={styles.registerButtonText}>CREATE ACCOUNT</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity
                onPress={handleLoginNavigation}
                activeOpacity={0.8}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#FF6B35',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    flex: 1,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  omSymbol: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  om: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  inputError: {
    borderColor: '#dc3545',
    borderWidth: 1.5,
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  registerButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#FF6B35',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  registerButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginLink: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '600',
  },
});

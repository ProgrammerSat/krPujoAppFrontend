import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import BASE_URL from '../env';

const {width, height} = Dimensions.get('window');

const UpdatePasswordScreen = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const navigation = useNavigation();
  const route = useRoute();

  // Get phoneNumber from route params (passed from VerifySecretCode screen)
  const {phoneNumber} = route.params || {};

  // Animation refs
  const newPasswordAnim = useRef(new Animated.Value(1)).current;
  const confirmPasswordAnim = useRef(new Animated.Value(1)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Animate card entrance
    Animated.timing(cardAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const animateInput = (anim, focus) => {
    Animated.spring(anim, {
      toValue: focus ? 1.05 : 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const validatePasswords = () => {
    if (!newPassword || !confirmPassword) {
      setErrorMsg('Please fill in both password fields');
      return false;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleUpdatePassword = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!validatePasswords()) {
      return;
    }

    if (!phoneNumber) {
      setErrorMsg('Phone number is missing. Please try again.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/user/updatePassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          newPass: newPassword,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        setSuccessMsg(data.message);
        // Show success alert and navigate back after delay
        setTimeout(() => {
          Alert.alert(
            'Success',
            'Password updated successfully! Please login with your new password.',
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Login'), // Adjust route name as needed
              },
            ],
          );
        }, 1000);
      } else {
        setErrorMsg(data.message || 'Failed to update password');
      }
    } catch (error) {
      setErrorMsg('Network error. Please try again.');
      console.error('Update password error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Gradient background layers */}
      <View style={styles.gradientLayer1} />
      <View style={styles.gradientLayer2} />
      <View style={styles.gradientLayer3} />

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleGoBack}
        activeOpacity={0.7}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Animated Card */}
      <Animated.View
        style={[
          styles.card,
          {
            opacity: cardAnim,
            transform: [
              {
                translateY: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
              {
                scale: cardAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          },
        ]}>
        <View style={styles.iconContainer}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>

        <Text style={styles.title}>Update Password</Text>
        <Text style={styles.subtitle}>
          Create a new secure password for your account
        </Text>

        <Animated.View
          style={[
            styles.inputWrapper,
            {transform: [{scale: newPasswordAnim}]},
          ]}>
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#b5b5b5"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            maxLength={50}
            onFocus={() => animateInput(newPasswordAnim, true)}
            onBlur={() => animateInput(newPasswordAnim, false)}
            autoCapitalize="none"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.inputWrapper,
            {transform: [{scale: confirmPasswordAnim}]},
          ]}>
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor="#b5b5b5"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            maxLength={50}
            onFocus={() => animateInput(confirmPasswordAnim, true)}
            onBlur={() => animateInput(confirmPasswordAnim, false)}
            autoCapitalize="none"
          />
        </Animated.View>

        {/* Password Requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Password Requirements:</Text>
          <Text
            style={[
              styles.requirement,
              newPassword.length >= 6 && styles.requirementMet,
            ]}>
            • At least 6 characters
          </Text>
          <Text
            style={[
              styles.requirement,
              newPassword === confirmPassword &&
                newPassword.length > 0 &&
                styles.requirementMet,
            ]}>
            • Passwords match
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#E67E22" style={{marginVertical: 12}} />
        ) : successMsg ? (
          <Text style={styles.successMsg}>{successMsg}</Text>
        ) : errorMsg ? (
          <Text style={styles.errorMsg}>{errorMsg}</Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.button,
            (loading || !newPassword || !confirmPassword) &&
              styles.buttonDisabled,
          ]}
          onPress={handleUpdatePassword}
          disabled={loading || !newPassword || !confirmPassword}>
          <Text style={styles.buttonText}>
            {loading ? 'Updating...' : 'Update Password'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFB366',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: '#FFB366',
    opacity: 1,
  },
  gradientLayer2: {
    position: 'absolute',
    top: height * 0.16,
    left: -width * 0.15,
    width: width * 1.3,
    height: height * 0.7,
    backgroundColor: '#FFC78A',
    opacity: 0.65,
    borderRadius: width * 0.75,
  },
  gradientLayer3: {
    position: 'absolute',
    top: height * 0.48,
    right: -width * 0.24,
    width: width * 1.15,
    height: height * 0.5,
    backgroundColor: '#FFDBAD',
    opacity: 0.45,
    borderRadius: width * 0.6,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 32,
    left: 20,
    width: 56,
    height: 56,
    backgroundColor: '#fff',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffe4c3',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1000,
  },
  backButtonText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#E67E22',
    textAlign: 'center',
    lineHeight: 28,
  },
  card: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 34,
    borderRadius: 30,
    width: '89%',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 18},
    shadowOpacity: 0.17,
    shadowRadius: 24,
    elevation: 10,
    alignItems: 'center',
  },
  iconContainer: {
    width: 70,
    height: 70,
    backgroundColor: '#FFF7E6',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  lockIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f08526',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 16,
    color: '#767676',
    marginBottom: 30,
    textAlign: 'center',
    letterSpacing: 0.1,
    lineHeight: 22,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#F6F8FA',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 15,
    fontSize: 16,
    color: '#232323',
    borderWidth: 1.5,
    borderColor: '#ECECEC',
    fontWeight: '500',
  },
  requirementsContainer: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
  },
  requirementMet: {
    color: '#28a745',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#FFB366',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 25,
    marginTop: 10,
    shadowColor: '#FFB366',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 2,
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  successMsg: {
    color: '#07a65e',
    fontWeight: '600',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.12,
  },
  errorMsg: {
    color: '#b22323',
    fontWeight: '600',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.12,
  },
});

export default UpdatePasswordScreen;

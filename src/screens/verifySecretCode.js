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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

// Set this to your actual API endpoint.
import BASE_URL from '../env';

const {width, height} = Dimensions.get('window');

const VerifySecretCode = () => {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const navigation = useNavigation();

  const phoneAnim = useRef(new Animated.Value(1)).current;
  const pinAnim = useRef(new Animated.Value(1)).current;

  const animateInput = (anim, focus) => {
    Animated.spring(anim, {
      toValue: focus ? 1.04 : 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleVerify = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${BASE_URL}/user/verifySecretCode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phone,
          userSecretCode: pin,
        }),
      });

      const data = await res.json();
      if (res.status === 200 && data.user) {
        // Navigate to Update Password screen, passing data as params
        navigation.navigate('UpdatePassword', {
          userId: data.user.id,
          phoneNumber: data.user.phoneNumber,
        });
      } else {
        setErrorMsg(data.message || 'Verification failed');
      }
    } catch (err) {
      setErrorMsg('Network or server error');
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

      {/* Back Button - Top Left Corner */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleGoBack}
        activeOpacity={0.7}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Verify Secret Code</Text>
        <Text style={styles.subtitle}>Enter your phone and family pin</Text>

        <Animated.View
          style={[styles.inputWrapper, {transform: [{scale: phoneAnim}]}]}>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#b5b5b5"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={12}
            onFocus={() => animateInput(phoneAnim, true)}
            onBlur={() => animateInput(phoneAnim, false)}
            autoCapitalize="none"
          />
        </Animated.View>

        <Animated.View
          style={[styles.inputWrapper, {transform: [{scale: pinAnim}]}]}>
          <TextInput
            style={styles.input}
            placeholder="Family Pin"
            placeholderTextColor="#b5b5b5"
            value={pin}
            onChangeText={setPin}
            secureTextEntry
            maxLength={8}
            onFocus={() => animateInput(pinAnim, true)}
            onBlur={() => animateInput(pinAnim, false)}
            autoCapitalize="none"
          />
        </Animated.View>

        {loading ? (
          <ActivityIndicator color="#E67E22" style={{marginVertical: 12}} />
        ) : errorMsg ? (
          <Text style={styles.errorMsg}>{errorMsg}</Text>
        ) : null}

        <TouchableOpacity
          style={[
            styles.button,
            (loading || !phone || !pin) && styles.buttonDisabled,
          ]}
          onPress={handleVerify}
          disabled={loading || !phone || !pin}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f08526',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 17,
    color: '#767676',
    marginBottom: 27,
    textAlign: 'center',
    letterSpacing: 0.1,
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
    marginBottom: 2,
  },
  button: {
    backgroundColor: '#FFB366',
    paddingVertical: 15,
    paddingHorizontal: 48,
    borderRadius: 20,
    marginTop: 18,
    marginBottom: 6,
    shadowColor: '#FFB366',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.18,
    shadowRadius: 7,
    elevation: 2,
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
  errorMsg: {
    color: '#b22323',
    fontWeight: '600',
    fontSize: 15,
    marginTop: 10,
    marginBottom: 2,
    textAlign: 'center',
    letterSpacing: 0.12,
  },
});

export default VerifySecretCode;

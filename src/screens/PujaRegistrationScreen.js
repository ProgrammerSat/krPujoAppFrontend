import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
  Image,
  FlatList,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import BASE_URL from '../env';

const {width, height} = Dimensions.get('window');

// Replace with your actual API base URL

export default function PujaRegistrationScreen({navigation}) {
  // Basic User Details State
  const [cooperativeSociety, setCooperativeSociety] = useState('');
  const [flatNo, setFlatNo] = useState('');
  const [name, setName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [familyPin, setFamilyPin] = useState('');

  // Payment Details State
  const [moneyGivenTo, setMoneyGivenTo] = useState('');
  const [paymentType, setPaymentType] = useState('cash');
  const [familyAmount] = useState(1000); // Fixed amount
  const [saptamiCoupons, setSaptamiCoupons] = useState(0);
  const [navamiCoupons, setNavamiCoupons] = useState(0);
  const [dashamiCoupons, setDashamiCoupons] = useState(0);
  const [adminNote, setAdminNote] = useState('');
  const [totalAmount, setTotalAmount] = useState(1000);
  const [selectedImages, setSelectedImages] = useState([]);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entry animation
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calculate total amount whenever coupons change
  useEffect(() => {
    const couponTotal = (saptamiCoupons + navamiCoupons + dashamiCoupons) * 500;
    setTotalAmount(familyAmount + couponTotal);
  }, [saptamiCoupons, navamiCoupons, dashamiCoupons, familyAmount]);

  const updateCouponCount = (type, increment) => {
    const hapticFeedback = () => {
      // Add haptic feedback if available
      if (Platform.OS === 'ios') {
        // HapticFeedback.impact(HapticFeedback.ImpactFeedbackStyle.Light);
      }
    };

    hapticFeedback();

    switch (type) {
      case 'saptami':
        setSaptamiCoupons(prev => Math.max(0, prev + increment));
        break;
      case 'navami':
        setNavamiCoupons(prev => Math.max(0, prev + increment));
        break;
      case 'dashami':
        setDashamiCoupons(prev => Math.max(0, prev + increment));
        break;
    }
  };

  const selectImages = () => {
    Alert.alert(
      'Select Images',
      'Choose how you want to add images',
      [
        {
          text: 'Camera',
          onPress: () => openCamera(),
        },
        {
          text: 'Gallery',
          onPress: () => openGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      {cancelable: true},
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
    };

    launchCamera(options, response => {
      if (response.assets && response.assets[0]) {
        const newImage = {
          uri: response.assets[0].uri,
          type: response.assets[0].type,
          name: response.assets[0].fileName || 'camera_image.jpg',
        };
        setSelectedImages(prev => [...prev, newImage]);
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1000,
      maxHeight: 1000,
      selectionLimit: 5, // Allow multiple selection
    };

    launchImageLibrary(options, response => {
      if (response.assets) {
        const newImages = response.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || 'gallery_image.jpg',
        }));
        setSelectedImages(prev => [...prev, ...newImages]);
      }
    });
  };

  const removeImage = index => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // API Integration Functions
  const registerUser = async userData => {
    try {
      const response = await fetch(`${BASE_URL}/manualAdmin/register-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  const createManualPayment = async paymentData => {
    try {
      const response = await fetch(`${BASE_URL}/manualAdmin/manual-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Payment recording failed');
      }

      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleSave = async () => {
    // Validation
    if (
      !cooperativeSociety ||
      !flatNo ||
      !name ||
      !mobileNumber ||
      !password ||
      !familyPin
    ) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (!moneyGivenTo.trim()) {
      Alert.alert('Error', 'Please specify who the money was given to');
      return;
    }

    if (mobileNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Register the user
      const userRegistrationData = {
        cooperativeSociety: cooperativeSociety.trim(),
        flat: flatNo.trim(),
        name: name.trim(),
        mobileNumber: mobileNumber.trim(),
        password: password.trim(),
        familyPin: familyPin.trim(),
      };

      console.log('Registering user:', userRegistrationData);
      const userResult = await registerUser(userRegistrationData);

      console.log('User registered successfully:', userResult);

      // Step 2: Create manual payment record
      const paymentData = {
        userId: userResult.userId,
        moneyGivenTo: moneyGivenTo.trim(),
        paymentType: paymentType.toUpperCase(),
        familyAmount,
        saptamiCoupons,
        navamiCoupons,
        dashamiCoupons,
        amount: totalAmount,
        adminNote: adminNote.trim(),
      };

      console.log('Creating payment record:', paymentData);
      const paymentResult = await createManualPayment(paymentData);

      console.log('Payment recorded successfully:', paymentResult);

      // Success
      Alert.alert(
        'Success',
        `Registration and payment recorded successfully!\n\nUser ID: ${userResult.userId}\nPayment ID: ${paymentResult.paymentId}\nTotal Amount: ₹${totalAmount}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              resetForm();
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert(
        'Error',
        error.message ||
          'Failed to save registration and payment. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCooperativeSociety('');
    setFlatNo('');
    setName('');
    setMobileNumber('');
    setPassword('');
    setFamilyPin('');
    setMoneyGivenTo('');
    setPaymentType('cash');
    setSaptamiCoupons(0);
    setNavamiCoupons(0);
    setDashamiCoupons(0);
    setAdminNote('');
    setSelectedImages([]);
  };

  const CouponCounter = ({label, value, onIncrement, onDecrement}) => (
    <Animated.View
      style={[
        styles.couponContainer,
        {
          transform: [{scale: scaleAnim}],
        },
      ]}>
      <Text style={styles.couponLabel}>{label}</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity
          style={[styles.counterButton, styles.decrementButton]}
          onPress={onDecrement}
          activeOpacity={0.7}
          disabled={isLoading}>
          <Text style={styles.counterButtonText}>−</Text>
        </TouchableOpacity>
        <View style={styles.counterDisplay}>
          <Text style={styles.counterValue}>{value}</Text>
        </View>
        <TouchableOpacity
          style={[styles.counterButton, styles.incrementButton]}
          onPress={onIncrement}
          activeOpacity={0.7}
          disabled={isLoading}>
          <Text style={styles.counterButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />

      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <Text style={styles.headerTitle}>Puja Registration</Text>
        <Text style={styles.headerSubtitle}>Admin Manual Entry</Text>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Basic User Details Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}, {scale: scaleAnim}],
            },
          ]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>👤</Text>
            </View>
            <Text style={styles.sectionTitle}>Basic User Details</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cooperative Society *</Text>
            <TextInput
              style={styles.input}
              value={cooperativeSociety}
              onChangeText={setCooperativeSociety}
              placeholder="Enter cooperative society name"
              placeholderTextColor="#999"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Flat No *</Text>
            <TextInput
              style={styles.input}
              value={flatNo}
              onChangeText={setFlatNo}
              placeholder="e.g., A-101"
              placeholderTextColor="#999"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
              placeholderTextColor="#999"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={mobileNumber}
              onChangeText={setMobileNumber}
              placeholder="Enter 10-digit phone number"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              maxLength={10}
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password *</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password for user"
              placeholderTextColor="#999"
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Family PIN *</Text>
            <TextInput
              style={styles.input}
              value={familyPin}
              onChangeText={setFamilyPin}
              placeholder="Enter 4-digit family PIN"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={4}
              secureTextEntry
              editable={!isLoading}
            />
          </View>
        </Animated.View>

        {/* Payment Details Section */}
        <Animated.View
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}, {scale: scaleAnim}],
            },
          ]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIcon}>
              <Text style={styles.sectionIconText}>💰</Text>
            </View>
            <Text style={styles.sectionTitle}>Payment Details</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Money Given To *</Text>
            <TextInput
              style={styles.input}
              value={moneyGivenTo}
              onChangeText={setMoneyGivenTo}
              placeholder="Enter person/entity name"
              placeholderTextColor="#999"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Payment Type</Text>
            <View
              style={[styles.pickerContainer, isLoading && styles.disabled]}>
              <Picker
                selectedValue={paymentType}
                style={styles.picker}
                onValueChange={setPaymentType}
                enabled={!isLoading}>
                <Picker.Item label="Cash" value="cash" />
                <Picker.Item label="UPI" value="upi" />
                <Picker.Item label="Bank Transfer" value="bank" />
              </Picker>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Family Amount</Text>
            <View style={styles.disabledInput}>
              <Text style={styles.disabledInputText}>₹ {familyAmount}</Text>
            </View>
          </View>

          {/* Coupon Counters */}
          <View style={styles.couponsSection}>
            <Text style={styles.couponsTitle}>Meal Coupons (₹500 each)</Text>

            <CouponCounter
              label="Saptami Coupons"
              value={saptamiCoupons}
              onIncrement={() => updateCouponCount('saptami', 1)}
              onDecrement={() => updateCouponCount('saptami', -1)}
            />

            <CouponCounter
              label="Navami Coupons"
              value={navamiCoupons}
              onIncrement={() => updateCouponCount('navami', 1)}
              onDecrement={() => updateCouponCount('navami', -1)}
            />

            <CouponCounter
              label="Dashami Coupons"
              value={dashamiCoupons}
              onIncrement={() => updateCouponCount('dashami', 1)}
              onDecrement={() => updateCouponCount('dashami', -1)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Admin's Note</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={adminNote}
              onChangeText={setAdminNote}
              placeholder="Add any special notes or comments..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.uploadButton, isLoading && styles.disabled]}
            onPress={selectImages}
            activeOpacity={0.7}
            disabled={isLoading}>
            <Text style={styles.uploadButtonText}>
              📁 Upload Relevant Images
            </Text>
            <Text style={styles.uploadSubtext}>
              {selectedImages.length > 0
                ? `${selectedImages.length} image(s) selected`
                : 'Tap to select images'}
            </Text>
          </TouchableOpacity>

          {/* Display Selected Images */}
          {selectedImages.length > 0 && (
            <View style={styles.imagePreviewContainer}>
              <Text style={styles.imagePreviewTitle}>Selected Images:</Text>
              <FlatList
                data={selectedImages}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({item, index}) => (
                  <View style={styles.imagePreviewItem}>
                    <Image
                      source={{uri: item.uri}}
                      style={styles.imagePreview}
                    />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                      activeOpacity={0.7}
                      disabled={isLoading}>
                      <Text style={styles.removeImageText}>×</Text>
                    </TouchableOpacity>
                  </View>
                )}
                contentContainerStyle={styles.imageList}
              />
            </View>
          )}

          {/* Total Amount Display */}
          <Animated.View
            style={[
              styles.totalContainer,
              {
                transform: [{scale: scaleAnim}],
              },
            ]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>
              ₹ {totalAmount.toLocaleString('en-IN')}
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{translateY: slideAnim}],
            },
          ]}>
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.disabledButton]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={isLoading}>
            <Text style={styles.saveButtonText}>
              {isLoading ? '⏳ Saving...' : '💾 Save Registration'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, isLoading && styles.disabled]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
            disabled={isLoading}>
            <Text style={styles.secondaryButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#FF6B35',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionIconText: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#2D3748',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  disabledInput: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 15,
    backgroundColor: '#F7FAFC',
    justifyContent: 'center',
  },
  disabledInputText: {
    fontSize: 16,
    color: '#718096',
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#2D3748',
  },
  disabled: {
    opacity: 0.6,
  },
  disabledButton: {
    opacity: 0.6,
    backgroundColor: '#A0AEC0',
  },
  couponsSection: {
    marginBottom: 20,
  },
  couponsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 15,
    textAlign: 'center',
  },
  couponContainer: {
    backgroundColor: '#F7FAFC',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  couponLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 10,
    textAlign: 'center',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButton: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  decrementButton: {
    backgroundColor: '#FF6B6B',
  },
  incrementButton: {
    backgroundColor: '#51CF66',
  },
  counterButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  counterDisplay: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 25,
    paddingVertical: 10,
    marginHorizontal: 15,
    minWidth: 80,
    alignItems: 'center',
  },
  counterValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
  },
  uploadButton: {
    backgroundColor: '#667EEA',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#667EEA',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  uploadSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  totalContainer: {
    backgroundColor: '#F0FFF4',
    borderWidth: 2,
    borderColor: '#48BB78',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#38A169',
    marginBottom: 5,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#38A169',
  },
  buttonContainer: {
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#48BB78',
    borderRadius: 15,
    padding: 18,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#48BB78',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryButton: {
    backgroundColor: '#718096',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#718096',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  imagePreviewContainer: {
    marginBottom: 20,
  },
  imagePreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 10,
  },
  imageList: {
    paddingVertical: 5,
  },
  imagePreviewItem: {
    position: 'relative',
    marginRight: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#F7FAFC',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  removeImageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 18,
  },
});

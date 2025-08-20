import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  Dimensions,
  Animated as RNAnimated,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import {Card} from 'react-native-paper';
import Animated, {FadeInUp, SlideInUp} from 'react-native-reanimated';
import {useRoute} from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import BASE_URL from '../env';

const Payment = ({navigation}) => {
  const [selectedMode, setSelectedMode] = useState('UPI');
  const [selectedImage, setSelectedImage] = useState(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [moneyGivenTo, setMoneyGivenTo] = useState('');

  const {params} = useRoute();
  const userID = params?.userID || '';
  const name = params?.name || '';
  const cooperativeSociety = params?.cooperativeSociety || '';
  const flatNumber = params?.flatNumber || 0;
  const totalAmount = params?.totalAmount || 0;
  const coupons = params?.coupons || {};
  phoneNumber = params?.phoneNumber || '';

  console.log('Coupons data' + JSON.stringify(coupons, null, 2));

  console.log('Payment Screen Params:', {
    userID,
    cooperativeSociety,
    flatNumber,
    totalAmount,
    coupons,
    phoneNumber,
  });

  const {width, height} = Dimensions.get('window');
  const isSmallScreen = width < 360 || height < 640;

  const uploadButtonScale = useRef(new RNAnimated.Value(1)).current;
  const submitButtonScale = useRef(new RNAnimated.Value(1)).current;
  const backButtonScale = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    setAmount(totalAmount.toString());
  }, [totalAmount]);

  const handleImageUpload = () => {
    ImagePicker.launchImageLibrary(
      {mediaType: 'photo', quality: 0.8},
      response => {
        if (response.assets && response.assets.length > 0) {
          setSelectedImage(response.assets[0].uri);
        }
      },
    );
  };

  const handleSubmitPayment = async () => {
    try {
      // 1. First create subscription
      const subscriptionPayload = {
        userID,
        cooperativeSociety,
        flatNumber,
        phoneNumber: params?.phoneNumber || '', // make sure you pass this from navigation params
        userSubscriptionAmount: totalAmount,
        userFamilySubscriptionPaidorNo: false,
        userSubscriptionDate: date.toISOString(),
        userSubscriptionType: 'Regular',
        userSubscriptionPaymentDate: date.toISOString(),
        userSubscriptionPaymentMode: selectedMode.toUpperCase(),
        userSubscriptionPaymentRef: referenceNumber,
        userSubscriptionCreatedBy: name || 'Admin',
        userSubscriptionLastUpdatedBy: name || 'Admin',
        SaptamiCoupons: coupons?.Saptami || 0,
        NabamiCoupons: coupons?.Nabami || 0,
        DashamiCoupons: coupons?.Dashami || 0,
      };

      const subRes = await fetch(
        BASE_URL + '/userSubscription/createSubscription',
        {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(subscriptionPayload),
        },
      );

      const subData = await subRes.json();
      if (!subRes.ok) {
        console.error('Subscription failed:', subData);
        alert(subData.message || 'Subscription creation failed');
        return;
      }
      console.log('Subscription Created:', subData);

      // 2. Then create payment (with image)
      const formData = new FormData();
      formData.append('userID', userID);
      formData.append('cooperativeSociety', cooperativeSociety);
      formData.append('flatNumber', flatNumber);
      formData.append('userPaymentDate', date.toISOString());
      formData.append('userPaymentAmount', totalAmount);
      formData.append('userPaymentMode', selectedMode.toUpperCase());
      formData.append('userPaymentSubscriptionDesc', 'Festival Subscription');
      formData.append('userLastUpdatedBy', name || 'Admin');

      if (selectedMode === 'UPI') {
        formData.append('userPaymentRefID', referenceNumber);
      }
      if (selectedMode === 'Cheque') {
        formData.append('userPaymentRefID', referenceNumber);
        formData.append('userChequeBankName', bankName);
      }
      if (selectedMode === 'Bank Transfer') {
        formData.append('userPaymentRefID', referenceNumber);
        formData.append('userTransferBankName', bankName);
      }

      if (selectedImage) {
        const filename = selectedImage.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        formData.append('userPaymentImage', {
          uri: selectedImage,
          name: filename,
          type,
        });
      }

      const payRes = await fetch(BASE_URL + '/userPayment/createPayment', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const payData = await payRes.json();
      if (payRes.ok) {
        console.log('Payment Submitted Successfully:', payData);
        resetForm();
        alert('Payment & Subscription submitted successfully!');
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Home',
              params: {
                userRole: params?.userRole,
                cooperativeSociety,
                userID,
                flatNumber,
                name,
                phoneNumber: params?.phoneNumber || '',
              },
            },
          ],
        });
      } else {
        console.error('Payment failed:', payData);
        alert(payData.message || 'Payment failed');
      }
    } catch (err) {
      console.error('Error submitting payment:', err);
      alert('Something went wrong. Try again.');
    }
  };

  const resetForm = () => {
    setSelectedImage(null);
    setAmount(totalAmount.toString());
    setDate(new Date());
    setReferenceNumber('');
    setBankName('');
    setMoneyGivenTo('');
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false); // Always hide the picker after selection
    if (selectedDate) {
      // Only update if user actually selected a date
      setDate(currentDate);
    }
  };

  const handleButtonPressIn = scaleRef => {
    RNAnimated.spring(scaleRef, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = scaleRef => {
    RNAnimated.spring(scaleRef, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderForm = () => {
    const formFields = [];
    switch (selectedMode) {
      case 'UPI':
        formFields.push(
          <Animated.View
            key="amount"
            entering={FadeInUp.delay(0).duration(300)}>
            <View style={styles.amountDisplayContainer}>
              <Text style={styles.amountDisplayText}>₹{totalAmount}</Text>
              <Text style={styles.amountLabel}>Payment Amount</Text>
            </View>
          </Animated.View>,

          <Animated.View
            key="reference"
            entering={FadeInUp.delay(100).duration(300)}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Reference Number</Text>
              <TextInput
                placeholder="Enter reference number"
                value={referenceNumber}
                onChangeText={setReferenceNumber}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </Animated.View>,

          <Animated.View
            key="date"
            entering={FadeInUp.delay(100).duration(300)}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Transaction Date</Text>
                <Text style={styles.dateText}>
                  {date.toLocaleDateString('en-GB')}
                </Text>
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                style={styles.datePicker}
              />
            )}
          </Animated.View>,
        );
        break;
      case 'Bank Transfer':
        formFields.push(
          <Animated.View
            key="amount"
            entering={FadeInUp.delay(100).duration(300)}>
            <View style={styles.amountDisplayContainer}>
              <Text style={styles.amountDisplayText}>₹{totalAmount}</Text>
              <Text style={styles.amountLabel}>Transfer Amount</Text>
            </View>
          </Animated.View>,
          <Animated.View
            key="bankDetails"
            entering={FadeInUp.delay(0).duration(300)}>
            <View style={styles.bankDetailsContainer}>
              <Text style={styles.inputLabel}>Bank Details</Text>
              <View style={styles.bankDetailsTextContainer}>
                <Text style={styles.bankDetailsText}>
                  Account Name: Q BLOCK DURGOUTSAV COMMITTEE
                </Text>
                <Text style={styles.bankDetailsText}>
                  Account Number: 190301000003013
                </Text>
                <Text style={styles.bankDetailsText}>
                  Bank: Indian Overseas Bank, Patuli Branch
                </Text>
                <Text style={styles.bankDetailsText}>
                  IFSC Code: IOBA0001930
                </Text>
              </View>
            </View>
          </Animated.View>,
          <Animated.View
            key="reference"
            entering={FadeInUp.delay(200).duration(300)}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Reference Number</Text>
              <TextInput
                placeholder="Enter reference number"
                value={referenceNumber}
                onChangeText={setReferenceNumber}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </Animated.View>,
          <Animated.View
            key="bank"
            entering={FadeInUp.delay(300).duration(300)}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Bank Name</Text>
              <TextInput
                placeholder="Enter bank name"
                value={bankName}
                onChangeText={setBankName}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </Animated.View>,
          <Animated.View
            key="date"
            entering={FadeInUp.delay(400).duration(300)}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Transaction Date</Text>
                <Text style={styles.dateText}>
                  {date.toLocaleDateString('en-GB')}
                </Text>
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                style={styles.datePicker}
              />
            )}
          </Animated.View>,
        );
        break;
      case 'Cash':
        formFields.push(
          <Animated.View
            key="amount"
            entering={FadeInUp.delay(0).duration(300)}>
            <View style={styles.amountDisplayContainer}>
              <Text style={styles.amountDisplayText}>₹{totalAmount}</Text>
              <Text style={styles.amountLabel}>Cash Amount</Text>
            </View>
          </Animated.View>,
          <Animated.View
            key="date"
            entering={FadeInUp.delay(100).duration(300)}>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => setShowDatePicker(true)}>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Transaction Date</Text>
                <Text style={styles.dateText}>
                  {date.toLocaleDateString('en-GB')}
                </Text>
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                style={styles.datePicker}
              />
            )}
          </Animated.View>,
          <Animated.View
            key="givenTo"
            entering={FadeInUp.delay(200).duration(300)}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Received By</Text>
              <TextInput
                placeholder="Enter recipient name"
                value={moneyGivenTo}
                onChangeText={setMoneyGivenTo}
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </Animated.View>,
        );
        break;
      default:
        return null;
    }

    return (
      <>
        {formFields}
        <Animated.View entering={FadeInUp.delay(400).duration(300)}>
          <View style={styles.imageUploadSection}>
            <Text style={styles.sectionTitle}>
              {selectedMode === 'UPI'
                ? 'UPI QR Code & Payment Screenshot'
                : selectedMode === 'Bank Transfer'
                ? 'Transfer Proof'
                : 'Receipt Image'}
            </Text>

            {/* Show UPI QR Code for UPI mode */}
            {selectedMode === 'UPI' && (
              <View style={styles.qrCodeContainer}>
                <Text style={styles.qrCodeLabel}>Scan QR Code to Pay</Text>
                <Image
                  source={require('../assets/Images/Upi.jpeg')}
                  style={[
                    styles.qrCodeImage,
                    isSmallScreen && styles.smallQrCodeImage,
                  ]}
                  resizeMode="contain"
                />
              </View>
            )}

            {/* Image upload section */}
            <View style={styles.imageContainer}>
              <Text style={styles.uploadSectionLabel}>
                {selectedMode === 'UPI'
                  ? 'Upload Payment Screenshot'
                  : 'Upload Proof'}
              </Text>
              {selectedImage ? (
                <Image
                  source={{uri: selectedImage}}
                  style={[styles.image, isSmallScreen && styles.smallImage]}
                />
              ) : (
                <View
                  style={[
                    styles.placeholder,
                    isSmallScreen && styles.smallPlaceholder,
                  ]}>
                  <View style={styles.uploadIcon}>
                    <Text style={styles.uploadIconText}>📸</Text>
                  </View>
                  <Text style={styles.placeholderText}>No Image Uploaded</Text>
                  <Text style={styles.placeholderSubtext}>Tap to upload</Text>
                </View>
              )}
            </View>
          </View>
        </Animated.View>
        <View style={styles.buttonContainer}>
          <RNAnimated.View style={{transform: [{scale: uploadButtonScale}]}}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPressIn={() => handleButtonPressIn(uploadButtonScale)}
              onPressOut={() => handleButtonPressOut(uploadButtonScale)}
              onPress={handleImageUpload}>
              <Text style={styles.uploadButtonText}>
                📷 {selectedImage ? 'Change Image' : 'Upload Image'}
              </Text>
            </TouchableOpacity>
          </RNAnimated.View>
          <RNAnimated.View style={{transform: [{scale: submitButtonScale}]}}>
            <TouchableOpacity
              style={styles.submitButton}
              onPressIn={() => handleButtonPressIn(submitButtonScale)}
              onPressOut={() => handleButtonPressOut(submitButtonScale)}
              onPress={handleSubmitPayment}>
              <Text style={styles.submitButtonText}>✓ Confirm Payment</Text>
            </TouchableOpacity>
          </RNAnimated.View>
        </View>
      </>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Animated.View
            entering={FadeInUp.duration(600)}
            style={styles.content}>
            <View style={styles.header}>
              <RNAnimated.View style={{transform: [{scale: backButtonScale}]}}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPressIn={() => handleButtonPressIn(backButtonScale)}
                  onPressOut={() => handleButtonPressOut(backButtonScale)}
                  onPress={handleBackPress}>
                  <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
              </RNAnimated.View>
              <View style={styles.titleContainer}>
                <Text
                  style={[styles.title, isSmallScreen && styles.smallTitle]}>
                  Payment
                </Text>
                <Text style={styles.subtitle}>Complete your transaction</Text>
              </View>
            </View>

            <View style={styles.modeSwitcher}>
              {['UPI', 'Bank Transfer', 'Cash'].map(mode => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => {
                    setSelectedMode(mode);
                    resetForm();
                  }}
                  style={[
                    styles.modeButton,
                    isSmallScreen && styles.smallModeButton,
                    selectedMode === mode && styles.selectedModeButton,
                  ]}>
                  <Text
                    style={[
                      styles.modeButtonText,
                      isSmallScreen && styles.smallModeButtonText,
                      selectedMode === mode && styles.selectedModeButtonText,
                    ]}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Card style={[styles.card, {width: Math.min(width - 32, 380)}]}>
              <Animated.View
                key={selectedMode}
                entering={SlideInUp.duration(400)}
                style={styles.cardContent}>
                {renderForm()}
              </Animated.View>
            </Card>
          </Animated.View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Payment;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    minHeight: Dimensions.get('window').height - 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 4,
  },
  backButtonText: {
    fontSize: 20,
    color: '#374151',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  smallTitle: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  modeSwitcher: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  smallModeButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  selectedModeButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  modeButtonText: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  smallModeButtonText: {
    fontSize: 13,
  },
  selectedModeButtonText: {
    color: '#1E293B',
    fontWeight: '700',
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    elevation: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 8},
  },
  cardContent: {
    padding: 20,
  },
  amountDisplayContainer: {
    backgroundColor: '#667eea',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#667eea',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 6,
  },
  amountDisplayText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 14,
    color: '#E2E8F0',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  dateInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputContent: {
    flexDirection: 'column',
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginTop: 4,
  },
  imageUploadSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  qrCodeContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrCodeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  qrCodeImage: {
    width: 180,
    height: 180,
    borderRadius: 12,
  },
  smallQrCodeImage: {
    width: 150,
    height: 150,
  },
  imageContainer: {
    alignItems: 'center',
  },
  uploadSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholder: {
    width: 200,
    height: 200,
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallPlaceholder: {
    width: 160,
    height: 160,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadIconText: {
    fontSize: 20,
  },
  placeholderText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeholderSubtext: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  smallImage: {
    width: 160,
    height: 160,
  },
  buttonContainer: {
    gap: 12,
  },
  uploadButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
    elevation: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  bankDetailsContainer: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bankDetailsTextContainer: {
    marginTop: 8,
  },
  bankDetailsText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 4,
  },
});

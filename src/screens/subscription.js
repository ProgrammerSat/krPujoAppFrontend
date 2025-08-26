import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');
const PRICE_PER_PERSON = 500;
const FAMILY_MUST_PAY = 1000;

// Responsive scaling functions
const scale = size => (width / 375) * size; // Based on iPhone X width
const verticalScale = size => (height / 812) * size; // Based on iPhone X height
const moderateScale = (size, factor = 0.5) =>
  size + (scale(size) - size) * factor;

// Responsive breakpoints
const isSmallScreen = width < 360;
const isMediumScreen = width >= 360 && width < 400;
const isLargeScreen = width >= 400;

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Fixed Modern Back Button Component
const ModernBackButton = ({onPress}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.9,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <TouchableOpacity
      style={styles.modernBackButton}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}>
      <Animated.View
        style={[
          styles.modernBackButtonInner,
          {
            transform: [{scale: scaleAnim}],
          },
        ]}>
        {/* Custom Arrow */}
        <View style={styles.arrowContainer}>
          <Text style={styles.modernArrow}>‹</Text>
        </View>

        {/* Press effect overlay */}
        <Animated.View
          style={[
            styles.pressOverlay,
            {
              opacity: opacityAnim,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const SubscriptionScreen = ({navigation}) => {
  const [totalCoupons, setTotalCoupons] = useState(0);

  const {params} = useRoute();
  const userID = params?.userID || '';
  const cooperativeSociety = params?.cooperativeSociety || '';
  const flatNumber = params?.flatNumber || 0;
  const phoneNumber = params?.phoneNumber || '';
  const name = params?.name || '';

  console.log('Subscription Screen Params:', {
    userID,
    cooperativeSociety,
    flatNumber,
  });

  const opacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const cardAnimation = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleIncrement = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.8,
      },
    });

    // Animate card scale
    Animated.sequence([
      Animated.timing(cardAnimation, {
        toValue: 1.02,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setTotalCoupons(prev => Math.min(prev + 1, 100));
  };

  const handleDecrement = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.8,
      },
    });

    // Animate card scale
    Animated.sequence([
      Animated.timing(cardAnimation, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setTotalCoupons(prev => Math.max(prev - 1, 0));
  };

  const totalAmount = totalCoupons * PRICE_PER_PERSON + FAMILY_MUST_PAY;

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Modern Back Button Header */}
      <View style={styles.headerRow}>
        <ModernBackButton onPress={() => navigation.goBack()} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity,
              transform: [{translateY: slideY}],
            },
          ]}>
          {/* Header with gradient background */}
          <View style={styles.headerContainer}>
            <Text style={styles.heading}>SUBSCRIPTION</Text>
            <View style={styles.decorativeBar} />
          </View>

          {/* Family subscription row */}
          <View style={styles.familyCard}>
            <View style={styles.rowBetween}>
              <View style={styles.familyTextContainer}>
                <Text style={styles.subText}>Family</Text>
                <Text style={styles.subDescription}>Base subscription fee</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.currency}>₹</Text>
                <Text style={styles.amount}>1000</Text>
              </View>
            </View>
          </View>

          {/* Book Coupons Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeading}>Book Coupons</Text>
            <View style={styles.sectionUnderline} />
          </View>

          {/* Single Coupon Selection Card */}
          <Animated.View
            style={[styles.eventCard, {transform: [{scale: cardAnimation}]}]}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventName}>Total Coupons</Text>
              <View style={styles.eventBadge}>
                <Text style={styles.badgeText}>LUNCH</Text>
              </View>
            </View>

            <View style={styles.eventBody}>
              <View style={styles.counterContainer}>
                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    totalCoupons === 0 && styles.counterButtonDisabled,
                  ]}
                  onPress={handleDecrement}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.counterText,
                      totalCoupons === 0 && styles.counterTextDisabled,
                    ]}>
                    −
                  </Text>
                </TouchableOpacity>

                <View style={styles.counterValueContainer}>
                  <Text style={styles.counterValue}>{totalCoupons}</Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.counterButton,
                    totalCoupons === 100 && styles.counterButtonDisabled,
                  ]}
                  onPress={handleIncrement}
                  activeOpacity={0.7}>
                  <Text
                    style={[
                      styles.counterText,
                      totalCoupons === 100 && styles.counterTextDisabled,
                    ]}>
                    +
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.perPerson}>
                ₹{PRICE_PER_PERSON} per coupon
              </Text>
            </View>
          </Animated.View>

          {/* Total Section */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <View style={styles.totalBreakdown}>
              <Text style={styles.breakdownText}>
                Base: ₹{FAMILY_MUST_PAY} + {totalCoupons} × ₹{PRICE_PER_PERSON}
              </Text>
            </View>
            <View style={styles.totalAmountContainer}>
              <Text style={styles.totalCurrency}>₹</Text>
              <Text style={styles.totalAmount}>{totalAmount}</Text>
            </View>
          </View>

          {/* Payment Button */}
          <Animated.View style={{transform: [{scale: buttonScale}]}}>
            <TouchableOpacity
              style={styles.paymentButton}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              onPress={() => {
                navigation.navigate('Payment', {
                  userID,
                  userRole: params?.userRole,
                  name,
                  cooperativeSociety,
                  flatNumber,
                  totalAmount,
                  phoneNumber,
                  totalCoupons: totalCoupons,
                });
              }}
              activeOpacity={0.9}>
              <View style={styles.buttonContent}>
                <Text style={styles.paymentText}>PROCEED TO PAYMENT</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SubscriptionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  // Fixed Modern Back Button Styles
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(6),
  },
  modernBackButton: {
    width: scale(48),
    height: scale(48),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(8),
  },
  modernBackButtonInner: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
  },
  arrowContainer: {
    width: scale(24),
    height: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: scale(-2),
  },
  modernArrow: {
    fontSize: moderateScale(26),
    fontWeight: '600',
    color: '#3b82f6',
    lineHeight: moderateScale(26),
    textAlign: 'center',
  },
  pressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#3b82f6',
    borderRadius: scale(22),
    opacity: 0,
  },

  scrollContainer: {
    flexGrow: 1,
    padding: scale(12),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(20),
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(20),
    padding: scale(16),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: 8},
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    minHeight: height * 0.85,
  },
  headerContainer: {
    marginBottom: verticalScale(20),
    alignItems: 'center',
  },
  heading: {
    fontSize: moderateScale(isSmallScreen ? 22 : 26),
    fontWeight: '800',
    color: '#1e293b',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  decorativeBar: {
    width: scale(50),
    height: moderateScale(3),
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    marginTop: verticalScale(6),
  },
  familyCard: {
    backgroundColor: '#f8fafc',
    borderRadius: moderateScale(14),
    padding: scale(16),
    marginBottom: verticalScale(20),
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#3b82f6',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  familyTextContainer: {
    flex: 1,
    marginRight: scale(10),
  },
  subText: {
    fontSize: moderateScale(isSmallScreen ? 16 : 18),
    color: '#1e293b',
    fontWeight: '700',
  },
  subDescription: {
    fontSize: moderateScale(isSmallScreen ? 11 : 13),
    color: '#64748b',
    marginTop: verticalScale(2),
    fontWeight: '500',
    flexWrap: 'wrap',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: moderateScale(isSmallScreen ? 13 : 15),
    fontWeight: '600',
    color: '#3b82f6',
  },
  amount: {
    fontSize: moderateScale(isSmallScreen ? 20 : 22),
    fontWeight: '700',
    color: '#3b82f6',
  },
  sectionHeader: {
    marginBottom: verticalScale(16),
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: moderateScale(isSmallScreen ? 16 : 18),
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  sectionUnderline: {
    width: scale(35),
    height: moderateScale(2),
    backgroundColor: '#f59e0b',
    borderRadius: 1,
    marginTop: verticalScale(4),
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(14),
    padding: scale(14),
    marginBottom: verticalScale(12),
    borderWidth: 2,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  eventName: {
    fontSize: moderateScale(isSmallScreen ? 15 : 17),
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
  },
  eventBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: scale(6),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(6),
  },
  badgeText: {
    fontSize: moderateScale(isSmallScreen ? 8 : 9),
    fontWeight: '700',
    color: '#92400e',
    letterSpacing: 0.5,
  },
  eventBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: moderateScale(10),
    padding: scale(3),
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  counterButton: {
    width: scale(isSmallScreen ? 30 : 32),
    height: scale(isSmallScreen ? 30 : 32),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: moderateScale(6),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 1},
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  counterButtonDisabled: {
    backgroundColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  },
  counterText: {
    fontSize: moderateScale(isSmallScreen ? 14 : 16),
    fontWeight: '700',
    color: '#1e293b',
  },
  counterTextDisabled: {
    color: '#94a3b8',
  },
  counterValueContainer: {
    minWidth: scale(isSmallScreen ? 32 : 36),
    alignItems: 'center',
    paddingHorizontal: scale(8),
  },
  counterValue: {
    fontSize: moderateScale(isSmallScreen ? 15 : 17),
    fontWeight: '700',
    color: '#3b82f6',
  },
  perPerson: {
    fontSize: moderateScale(isSmallScreen ? 11 : 13),
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: scale(8),
  },
  totalCard: {
    backgroundColor: '#1e293b',
    borderRadius: moderateScale(14),
    padding: scale(16),
    marginVertical: verticalScale(20),
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: moderateScale(isSmallScreen ? 13 : 15),
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: verticalScale(6),
  },
  totalBreakdown: {
    marginBottom: verticalScale(10),
    paddingHorizontal: scale(10),
  },
  breakdownText: {
    fontSize: moderateScale(isSmallScreen ? 11 : 13),
    color: '#cbd5e1',
    fontWeight: '500',
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  totalAmountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  totalCurrency: {
    fontSize: moderateScale(isSmallScreen ? 16 : 18),
    fontWeight: '700',
    color: '#10b981',
  },
  totalAmount: {
    fontSize: moderateScale(isSmallScreen ? 26 : 30),
    fontWeight: '800',
    color: '#10b981',
  },
  paymentButton: {
    backgroundColor: '#3b82f6',
    borderRadius: moderateScale(14),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(20),
    shadowColor: '#3b82f6',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 6,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: moderateScale(isSmallScreen ? 13 : 15),
    letterSpacing: 0.5,
  },
});

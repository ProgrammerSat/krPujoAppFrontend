import React, {useEffect, useRef, useState} from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import BASE_URL from '../env'; // <- Make sure BASE_URL points to your backend (e.g., http://localhost:5000)

const {width} = Dimensions.get('window');

// --- Reusable AnimatedCard ---
const AnimatedCard = ({children, delay = 0, style}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      {children}
    </Animated.View>
  );
};

// --- Counter Animation ---
const CounterAnimation = ({
  value,
  prefix = '₹',
  duration = 1500,
  delay = 0,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    const listener = animatedValue.addListener(({value}) => {
      setDisplayValue(Math.floor(value));
    });

    setTimeout(() => {
      Animated.timing(animatedValue, {
        toValue: value || 0,
        duration,
        useNativeDriver: false,
      }).start();
    }, delay);

    return () => animatedValue.removeListener(listener);
  }, [value]);

  return (
    <Text style={styles.cardAmount}>
      {prefix}
      {(displayValue || 0).toLocaleString()}
    </Text>
  );
};

// --- Count Animation (without currency prefix) ---
const CountAnimation = ({value, duration = 1500, delay = 0}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    const listener = animatedValue.addListener(({value}) => {
      setDisplayValue(Math.floor(value));
    });

    setTimeout(() => {
      Animated.timing(animatedValue, {
        toValue: value || 0,
        duration,
        useNativeDriver: false,
      }).start();
    }, delay);

    return () => animatedValue.removeListener(listener);
  }, [value]);

  return (
    <Text style={styles.cardAmount}>
      {(displayValue || 0).toLocaleString()}
    </Text>
  );
};

// --- Stat Card ---
const StatCard = ({
  title,
  amount = 0,
  icon,
  color,
  delay = 0,
  onPress,
  isCount = false,
}) => (
  <AnimatedCard delay={delay}>
    <TouchableOpacity
      style={[styles.card, {borderLeftColor: color}]}
      onPress={onPress}
      activeOpacity={0.95}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, {backgroundColor: color + '20'}]}>
          <Text style={[styles.icon, {color}]}>{icon}</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          {isCount ? (
            <CountAnimation value={amount} delay={delay + 200} />
          ) : (
            <CounterAnimation value={amount} delay={delay + 200} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  </AnimatedCard>
);

// --- Breakdown Card for showing sub-details ---
const BreakdownCard = ({
  title,
  normalCount = 0,
  manualCount = 0,
  totalAmount = 0,
  delay = 0,
}) => (
  <AnimatedCard delay={delay}>
    <View style={styles.breakdownCard}>
      <Text style={styles.breakdownTitle}>{title}</Text>
      <View style={styles.breakdownRow}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>User Entry Families</Text>
          <Text style={styles.breakdownValue}>
            {(normalCount || 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.breakdownDivider} />
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Manual Entry Families</Text>
          <Text style={styles.breakdownValue}>
            {(manualCount || 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.breakdownDivider} />
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Total Amount</Text>
          <Text style={styles.breakdownAmount}>
            ₹{(totalAmount || 0).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  </AnimatedCard>
);

// --- Event Coupon Breakdown Card ---
const EventCouponBreakdownCard = ({
  title,
  saptamiCount = 0,
  saptamiAmount = 0,
  navamiCount = 0,
  navamiAmount = 0,
  dashamiCount = 0,
  dashamiAmount = 0,
  totalCount = 0,
  totalAmount = 0,
  delay = 0,
}) => (
  <AnimatedCard delay={delay}>
    <View style={styles.eventBreakdownCard}>
      <Text style={styles.breakdownTitle}>{title}</Text>

      {/* Individual Event Rows */}
      <View style={styles.eventRow}>
        <View style={styles.eventItem}>
          <Text style={styles.eventLabel}>🎫 Saptami</Text>
          <Text style={styles.eventCount}>
            {(saptamiCount || 0).toLocaleString()}
          </Text>
          <Text style={styles.eventAmount}>
            ₹{(saptamiAmount || 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.eventDivider} />
        <View style={styles.eventItem}>
          <Text style={styles.eventLabel}>🎪 Navami</Text>
          <Text style={styles.eventCount}>
            {(navamiCount || 0).toLocaleString()}
          </Text>
          <Text style={styles.eventAmount}>
            ₹{(navamiAmount || 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.eventDivider} />
        <View style={styles.eventItem}>
          <Text style={styles.eventLabel}>🎊 Dashami</Text>
          <Text style={styles.eventCount}>
            {(dashamiCount || 0).toLocaleString()}
          </Text>
          <Text style={styles.eventAmount}>
            ₹{(dashamiAmount || 0).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Total Row */}
      <View style={styles.totalRow}>
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Total Coupons</Text>
          <Text style={styles.totalValue}>
            {(totalCount || 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.totalDivider} />
        <View style={styles.totalItem}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalAmountValue}>
            ₹{(totalAmount || 0).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  </AnimatedCard>
);

// --- Pulse Animation for main card ---
const PulseAnimation = ({children}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  return (
    <Animated.View style={{transform: [{scale: pulseAnim}]}}>
      {children}
    </Animated.View>
  );
};

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [couponData, setCouponData] = useState({
    Saptami: {count: 0, amount: 0},
    Nabami: {count: 0, amount: 0},
    Dashami: {count: 0, amount: 0},
  });
  const [stats, setStats] = useState({
    totalSubscription: 0,
    totalCoupon: 0,
    grandTotal: 0,
  });

  // Updated state for detailed family subscription data
  const [familySubDetails, setFamilySubDetails] = useState({
    normalFamilies: 0,
    manualFamilies: 0,
    totalFamilies: 0,
    totalAmount: 0,
    perFamilySubscription: 0,
  });

  const [coupons, setCoupons] = useState({
    SaptamiCoupons: 0,
    NabamiCoupons: 0,
    DashamiCoupons: 0,
  });

  // New state for event total coupon data
  const [eventTotalCoupons, setEventTotalCoupons] = useState({
    saptamiTotalCoupons: 0,
    navamiTotalCoupons: 0,
    dashamiTotalCoupons: 0,
    saptamiTotalAmount: 0,
    navamiTotalAmount: 0,
    dashamiTotalAmount: 0,
    totalCouponAmount: 0,
    userCouponAmount: 0,
    manualCouponAmount: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        console.log('🔄 Starting API calls...');

        const res1 = await fetch(`${BASE_URL}/adminDashboard/admin-stats`);
        const data1 = await res1.json();
        console.log('📊 Admin Stats Response:', data1);

        const res2 = await fetch(`${BASE_URL}/adminDashboard/coupon-amounts`);
        const data2 = await res2.json();
        console.log('🎫 Coupon Amounts Response:', data2);

        const res3 = await fetch(
          `${BASE_URL}/manualAdmin/total-family-manual-subscription`,
        );
        const data3 = await res3.json();
        console.log('👨‍👩‍👧‍👦 Family Subscription Details Response:', data3);

        const res4 = await fetch(
          `${BASE_URL}/userSubscription/total-coupon-amount`,
        );
        const data4 = await res4.json();
        console.log('🎪 User Coupon Data Response:', data4);

        // Check if this API is returning the correct event coupon data
        const res5 = await fetch(
          `${BASE_URL}/adminDashboard/total-family-subscription`,
        );
        const data5 = await res5.json();
        console.log('🎊 Family Subscription Data Response:', data5);

        // Process coupon data with better validation
        const processedCouponData = {
          SaptamiCoupons: data4?.SaptamiCoupons || 0,
          NabamiCoupons: data4?.NabamiCoupons || 0,
          DashamiCoupons: data4?.DashamiCoupons || 0,
        };

        console.log('✅ Processed Coupon Data:', processedCouponData);

        // Set all states
        setStats(
          data1 || {totalSubscription: 0, totalCoupon: 0, grandTotal: 0},
        );
        setCouponData(
          data2 || {
            Saptami: {count: 0, amount: 0},
            Nabami: {count: 0, amount: 0},
            Dashami: {count: 0, amount: 0},
          },
        );

        // Set family subscription details
        const familyDetails = data3 || {
          normalFamilies: 0,
          manualFamilies: 0,
          totalFamilies: 0,
          totalAmount: 0,
          perFamilySubscription: 0,
        };
        setFamilySubDetails(familyDetails);
        console.log('🏠 Setting Family Details:', familyDetails);

        setCoupons(processedCouponData);

        // ✅ USE data4 (userSubscription API) for event coupon totals, not data5!
        const eventCouponData = {
          saptamiTotalCoupons: data4?.saptamiTotalCoupons || 0,
          navamiTotalCoupons: data4?.navamiTotalCoupons || 0,
          dashamiTotalCoupons: data4?.dashamiTotalCoupons || 0,
          saptamiTotalAmount: data4?.saptamiTotalAmount || 0,
          navamiTotalAmount: data4?.navamiTotalAmount || 0,
          dashamiTotalAmount: data4?.dashamiTotalAmount || 0,
          totalCouponAmount: data4?.totalCouponAmount || 0,
          userCouponAmount: data4?.userCouponAmount || 0,
          manualCouponAmount: data4?.manualCouponAmount || 0,
        };
        setEventTotalCoupons(eventCouponData);
        console.log('🎭 Setting Event Coupon Data:', eventCouponData);
      } catch (err) {
        console.error('❌ Error fetching stats:', err);
        // Set default values on error
        setCoupons({
          SaptamiCoupons: 0,
          NabamiCoupons: 0,
          DashamiCoupons: 0,
        });
        setFamilySubDetails({
          normalFamilies: 0,
          manualFamilies: 0,
          totalFamilies: 0,
          totalAmount: 0,
          perFamilySubscription: 0,
        });
        setEventTotalCoupons({
          saptamiTotalCoupons: 0,
          navamiTotalCoupons: 0,
          dashamiTotalCoupons: 0,
          saptamiTotalAmount: 0,
          navamiTotalAmount: 0,
          dashamiTotalAmount: 0,
          totalCouponAmount: 0,
          userCouponAmount: 0,
          manualCouponAmount: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Add useEffect to log state updates
  useEffect(() => {
    console.log(
      '🔄 Family Subscription Details State Updated:',
      familySubDetails,
    );
  }, [familySubDetails]);

  useEffect(() => {
    console.log('🔄 Event Total Coupons State Updated:', eventTotalCoupons);
  }, [eventTotalCoupons]);

  useEffect(() => {
    console.log('🔄 Coupons State Updated:', coupons);
  }, [coupons]);

  console.log('Current State Values:');
  console.log('├── Coupons:', coupons);
  console.log('├── Family Subscription Details:', familySubDetails);
  console.log('├── Event Total Coupons:', eventTotalCoupons);
  console.log('├── Stats:', stats);
  console.log('└── Loading:', loading);

  // FIXED CALCULATION: Grand Total = Family Subscription Details Total Amount + Event Coupon Summary Total Amount
  const grandTotal =
    (familySubDetails?.totalAmount || 0) +
    (eventTotalCoupons?.totalCouponAmount || 0);

  // Family subscription total is directly from familySubDetails.totalAmount
  const familySubscriptionTotal = familySubDetails?.totalAmount || 0;

  // Event coupon total is from eventTotalCoupons.totalCouponAmount
  const eventCouponTotal = eventTotalCoupons?.totalCouponAmount || 0;

  // Calculate total coupon count from event data
  const totalEventCouponCount =
    (eventTotalCoupons?.saptamiTotalCoupons || 0) +
    (eventTotalCoupons?.navamiTotalCoupons || 0) +
    (eventTotalCoupons?.dashamiTotalCoupons || 0);

  console.log('🧮 CORRECTED CALCULATIONS:');
  console.log('├── Family Subscription Total:', familySubscriptionTotal);
  console.log('├── Event Coupon Total:', eventCouponTotal);
  console.log('└── Grand Total (Family + Event):', grandTotal);

  const handleCardPress = cardType => {
    console.log(`${cardType} card pressed`);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{marginTop: 10}}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <AnimatedCard style={styles.headerContainer}>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.header}>Dashboard Summary</Text>
          <Text style={styles.subtitle}>Track your festival collections</Text>
        </AnimatedCard>

        {/* Grand Total Card - CORRECTED: Now shows Family + Event totals */}
        <AnimatedCard delay={100}>
          <PulseAnimation>
            <TouchableOpacity
              style={styles.grandTotalCard}
              activeOpacity={0.95}
              onPress={() => handleCardPress('GrandTotal')}>
              <View style={styles.totalCardContent}>
                <Text style={styles.totalLabel}>🎉 Grand Total Collection</Text>
                <CounterAnimation
                  value={grandTotal}
                  delay={300}
                  duration={2500}
                />
                <View style={styles.totalCardFooter}>
                  <Text style={styles.totalSubtext}>
                    Complete Festival Revenue (Family + Event Coupons)
                  </Text>
                </View>
              </View>
              <View style={styles.grandTotalCardDecoration} />
            </TouchableOpacity>
          </PulseAnimation>
        </AnimatedCard>

        {/* Family Subscription Total Card - CORRECTED: Shows familySubDetails.totalAmount */}
        <AnimatedCard delay={150}>
          <TouchableOpacity
            style={styles.totalCard}
            activeOpacity={0.95}
            onPress={() => handleCardPress('FamilyTotal')}>
            <View style={styles.totalCardContent}>
              <Text style={styles.totalLabel}>Family Subscription Total</Text>
              <CounterAnimation
                value={familySubscriptionTotal}
                delay={400}
                duration={2000}
              />
              <View style={styles.totalCardFooter}>
                <Text style={styles.totalSubtext}>
                  👨‍👩‍👧‍👦 All Family Subscriptions
                </Text>
              </View>
            </View>
            <View style={styles.totalCardDecoration} />
          </TouchableOpacity>
        </AnimatedCard>

        {/* Event Coupons Total Card - Shows eventTotalCoupons.totalCouponAmount */}
        <AnimatedCard delay={200}>
          <TouchableOpacity
            style={styles.couponTotalCard}
            activeOpacity={0.95}
            onPress={() => handleCardPress('CouponTotal')}>
            <View style={styles.totalCardContent}>
              <Text style={styles.totalLabel}>Event Coupons Total</Text>

              {/* Two column layout for count and amount */}
              <View style={styles.couponTotalRow}>
                <View style={styles.couponTotalItem}>
                  <Text style={styles.couponCountLabel}>Total Coupons</Text>
                  <CountAnimation
                    value={totalEventCouponCount}
                    delay={500}
                    duration={2000}
                  />
                </View>
                <View style={styles.couponTotalDivider} />
                <View style={styles.couponTotalItem}>
                  <Text style={styles.couponAmountLabel}>
                    Event Coupons Total
                  </Text>
                  <CounterAnimation
                    value={eventCouponTotal}
                    delay={500}
                    duration={2000}
                  />
                </View>
              </View>

              <View style={styles.totalCardFooter}>
                <Text style={styles.totalSubtext}>
                  🎫 All Event Coupons Combined
                </Text>
              </View>
            </View>
            <View style={styles.couponTotalCardDecoration} />
          </TouchableOpacity>
        </AnimatedCard>

        {/* Family Subscription Breakdown */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Family Subscriptions</Text>

          <BreakdownCard
            title="Family Subscription Details"
            normalCount={familySubDetails?.normalFamilies || 0}
            manualCount={familySubDetails?.manualFamilies || 0}
            totalAmount={familySubDetails?.totalAmount || 0}
            delay={250}
          />

          <StatCard
            title="Total Families"
            amount={familySubDetails?.totalFamilies || 0}
            icon="👨‍👩‍👧‍👦"
            color="#6366F1"
            delay={300}
            onPress={() => handleCardPress('Family')}
            isCount={true}
          />
        </View>

        {/* Event Total Coupon Breakdown */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Event Coupons Breakdown</Text>

          <EventCouponBreakdownCard
            title="Complete Event Coupon Summary"
            saptamiCount={eventTotalCoupons?.saptamiTotalCoupons || 0}
            saptamiAmount={eventTotalCoupons?.saptamiTotalAmount || 0}
            navamiCount={eventTotalCoupons?.navamiTotalCoupons || 0}
            navamiAmount={eventTotalCoupons?.navamiTotalAmount || 0}
            dashamiCount={eventTotalCoupons?.dashamiTotalCoupons || 0}
            dashamiAmount={eventTotalCoupons?.dashamiTotalAmount || 0}
            totalCount={totalEventCouponCount}
            totalAmount={eventTotalCoupons?.totalCouponAmount || 0}
            delay={350}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

// Updated styles with new breakdown card styles
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  scrollView: {flex: 1},
  scrollContent: {padding: 20},
  headerContainer: {marginBottom: 20},
  greeting: {fontSize: 16, color: '#64748B', marginBottom: 4},
  header: {fontSize: 28, fontWeight: '800', color: '#1E293B', marginBottom: 4},
  subtitle: {fontSize: 14, color: '#64748B'},

  // Grand Total Card (most prominent)
  grandTotalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  grandTotalCardDecoration: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#6366F1',
    opacity: 0.1,
  },

  // Family Total Card
  totalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#059669',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
  },
  totalCardDecoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#059669',
    opacity: 0.1,
  },

  // Coupon Total Card
  couponTotalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#F59E0B',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  couponTotalCardDecoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F59E0B',
    opacity: 0.1,
  },

  // Coupon Total Row Styles
  couponTotalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  couponTotalItem: {
    alignItems: 'center',
    flex: 1,
  },
  couponCountLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  couponAmountLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  couponTotalDivider: {
    width: 2,
    height: 50,
    backgroundColor: '#F59E0B',
    marginHorizontal: 16,
    opacity: 0.3,
  },

  totalCardContent: {alignItems: 'center'},
  totalLabel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  cardAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
  },
  totalCardFooter: {marginTop: 12},
  totalSubtext: {
    fontSize: 14,
    color: '#6366F1',
    textAlign: 'center',
    fontWeight: '500',
  },

  statsContainer: {marginBottom: 24},
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {flexDirection: 'row', alignItems: 'center'},
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {fontSize: 20},
  cardContent: {flex: 1},
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  breakdownItem: {
    alignItems: 'center',
    flex: 1,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
    textAlign: 'center',
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  breakdownAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  breakdownDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },

  // Event Breakdown Card Styles
  eventBreakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  eventRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  eventItem: {
    alignItems: 'center',
    flex: 1,
  },
  eventLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
    textAlign: 'center',
    fontWeight: '600',
  },
  eventCount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  eventAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  eventDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalItem: {
    alignItems: 'center',
    flex: 1,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  totalAmountValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#059669',
  },
  totalDivider: {
    width: 2,
    height: 40,
    backgroundColor: '#F59E0B',
    marginHorizontal: 16,
    opacity: 0.3,
  },

  quickStatsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  quickStat: {alignItems: 'center', flex: 1},
  quickStatNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1E293B',
    marginBottom: 4,
  },
  quickStatLabel: {fontSize: 12, color: '#64748B', textAlign: 'center'},
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
  },
  bottomSpacing: {height: 20},
});

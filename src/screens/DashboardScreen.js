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
        toValue: value,
        duration,
        useNativeDriver: false,
      }).start();
    }, delay);

    return () => animatedValue.removeListener(listener);
  }, [value]);

  return (
    <Text style={styles.cardAmount}>
      {prefix}
      {displayValue.toLocaleString()}
    </Text>
  );
};

// --- Stat Card ---
const StatCard = ({title, amount, icon, color, delay = 0, onPress}) => (
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
          <CounterAnimation value={amount} delay={delay + 200} />
        </View>
      </View>
    </TouchableOpacity>
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

  const [familySubDetails, setFamilySubDetails] = useState({
    totalFamilies: 0,
    totalAmount: 0,
    perFamilySubscription: 0,
  });

  const [coupons, setCoupons] = useState({
    SaptamiCoupons: 0,
    NabamiCoupons: 0,
    DashamiCoupons: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res1 = await fetch(`${BASE_URL}/adminDashboard/admin-stats`);
        const data1 = await res1.json();

        const res2 = await fetch(`${BASE_URL}/adminDashboard/coupon-amounts`);
        const data2 = await res2.json();

        const res3 = await fetch(
          `${BASE_URL}/adminDashboard/total-family-subscription`,
        );
        const data3 = await res3.json();

        const res4 = await fetch(`${BASE_URL}/userSubscription/getCouponsData`);
        const data4 = await res4.json();

        console.log('Raw Coupon Data from API:', data4);

        // Since backend now returns a single object, use it directly
        const processedCouponData = {
          SaptamiCoupons: data4.SaptamiCoupons || 0,
          NabamiCoupons: data4.NabamiCoupons || 0,
          DashamiCoupons: data4.DashamiCoupons || 0,
        };

        console.log('Processed Coupon Data:', processedCouponData);

        setStats(data1);
        setCouponData(data2);
        setFamilySubDetails(data3);
        setCoupons(processedCouponData);
      } catch (err) {
        console.error('Error fetching stats:', err);
        // Set default values on error
        setCoupons({
          SaptamiCoupons: 0,
          NabamiCoupons: 0,
          DashamiCoupons: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  console.log('Coupons', coupons);

  // Calculate coupon amount sum safely
  const couponAmtSum =
    (couponData?.Saptami?.amount || 0) +
    (couponData?.Nabami?.amount || 0) +
    (couponData?.Dashami?.amount || 0);

  // Calculate full total
  const fullTotal = stats.totalSubscription + couponAmtSum;

  // Calculate total coupon count
  const totalCouponCount =
    (couponData?.Saptami?.count || 0) +
    (couponData?.Nabami?.count || 0) +
    (couponData?.Dashami?.count || 0);

  const familyTotal = familySubDetails.totalAmount;

  console.log('Family Total:', familyTotal);

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

  const Saptami = coupons?.SaptamiCoupons;
  console.log('Saptami Coupons:', Saptami);

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

        {/* Total Amount Card - Featured */}
        <AnimatedCard delay={100}>
          <PulseAnimation>
            <TouchableOpacity
              style={styles.totalCard}
              activeOpacity={0.95}
              onPress={() => handleCardPress('Total')}>
              <View style={styles.totalCardContent}>
                <Text style={styles.totalLabel}>Total Amount Collected</Text>
                <CounterAnimation
                  value={stats.totalSubscription}
                  delay={300}
                  duration={2000}
                />
                <View style={styles.totalCardFooter}>
                  <Text style={styles.totalSubtext}>
                    🎉 Festival Collection Live
                  </Text>
                </View>
              </View>
              <View style={styles.totalCardDecoration} />
            </TouchableOpacity>
          </PulseAnimation>
        </AnimatedCard>

        {/* Stats Grid */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Collection Breakdown</Text>

          <StatCard
            title="Family Subscriptions"
            amount={familyTotal}
            icon="👨‍👩‍👧‍👦"
            color="#6366F1"
            delay={200}
            onPress={() => handleCardPress('Family')}
          />

          <StatCard
            title="Saptami Coupons"
            amount={coupons.SaptamiCoupons || 0}
            icon="🎫"
            color="#F59E0B"
            delay={300}
            onPress={() => handleCardPress('Saptami')}
          />

          <StatCard
            title="Nabami Coupons"
            amount={coupons.NabamiCoupons ?? 0}
            icon="🎪"
            color="#EF4444"
            delay={400}
            onPress={() => handleCardPress('Nabami')}
          />

          <StatCard
            title="Dashami Coupons"
            amount={coupons.DashamiCoupons ?? 0}
            icon="🎊"
            color="#10B981"
            delay={500}
            onPress={() => handleCardPress('Dashami')}
          />
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

// --- styles (same as yours, unchanged except BASE_URL import above)
const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F8FAFC'},
  scrollView: {flex: 1},
  scrollContent: {padding: 20},
  headerContainer: {marginBottom: 20},
  greeting: {fontSize: 16, color: '#64748B', marginBottom: 4},
  header: {fontSize: 28, fontWeight: '800', color: '#1E293B', marginBottom: 4},
  subtitle: {fontSize: 14, color: '#64748B'},
  totalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  totalCardContent: {alignItems: 'center'},
  totalLabel: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardAmount: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1E293B',
    textAlign: 'center',
  },
  totalCardFooter: {marginTop: 12},
  totalSubtext: {fontSize: 14, color: '#10B981', textAlign: 'center'},
  totalCardDecoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366F1',
    opacity: 0.1,
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

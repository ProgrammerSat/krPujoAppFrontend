import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import BASE_URL from '../env';

import {useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

const UserDashboard = ({route}) => {
  const {phoneNumber} = route?.params || {};
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  const navigation = useNavigation();

  useEffect(() => {
    if (phoneNumber) {
      fetchDashboardData();
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (dashboardData) {
      startAnimations();
    }
  }, [dashboardData]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/userDashboard/user-dashboard/${phoneNumber}`,
      );
      const data = await response.json();

      if (response.ok) {
        setDashboardData(data);
      } else {
        console.log('Error', data.message || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.log('Error', 'Network error occurred');
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const startAnimations = () => {
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
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getStatusColor = status => {
    switch (status) {
      case 'APR':
        return '#4CAF50';
      case 'PEN':
        return '#FF9800';
      default:
        return '#F44336';
    }
  };

  const getStatusText = status => {
    switch (status) {
      case 'APR':
        return 'Approved';
      case 'PEN':
        return 'Pending';
      default:
        return 'Inactive';
    }
  };

  if (loading && !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <TouchableOpacity
          style={styles.errorBackButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.errorBackButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No data found</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchDashboardData}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const {userType, subscriptionDetails, subscriptionStatus, couponDetails} =
    dashboardData;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      {/* Header Section */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.greeting}>Namaste! 🙏</Text>
          <Text style={styles.subGreeting}>Your puja dashboard awaits</Text>
        </View>
      </Animated.View>

      {/* User Type Badge */}
      <Animated.View
        style={[
          styles.userTypeBadge,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <Text style={styles.userTypeText}>
          {userType === 'SYSTEM_USER' ? 'System User' : 'Manual User'}
        </Text>
      </Animated.View>

      {/* Subscription Status Card */}
      <Animated.View
        style={[
          styles.statusCard,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Subscription Status</Text>
          <View
            style={[
              styles.statusBadge,
              {backgroundColor: getStatusColor(subscriptionStatus)},
            ]}>
            <Text style={styles.statusBadgeText}>
              {getStatusText(subscriptionStatus)}
            </Text>
          </View>
        </View>

        <View style={styles.subscriptionInfo}>
          {subscriptionDetails.name && (
            <InfoRow label="Name" value={subscriptionDetails.name} />
          )}
          {subscriptionDetails.cooperativeSociety && (
            <InfoRow
              label="Cooperative Society"
              value={subscriptionDetails.cooperativeSociety}
            />
          )}
          {subscriptionDetails.flat && (
            <InfoRow label="Flat" value={subscriptionDetails.flat} />
          )}
          {subscriptionDetails.totalPaid !== undefined && (
            <InfoRow
              label="Total Paid"
              value={`₹${subscriptionDetails.totalPaid}`}
            />
          )}
          {subscriptionDetails.familyAmountPaid !== undefined && (
            <InfoRow
              label="Family Amount Paid"
              value={`₹${subscriptionDetails.familyAmountPaid}`}
            />
          )}
        </View>
      </Animated.View>

      {/* Coupon Details */}
      <Animated.View
        style={[
          styles.couponSection,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <Text style={styles.sectionTitle}>Coupon Details</Text>

        <View style={styles.couponGrid}>
          {Object.entries(couponDetails)
            .filter(([key]) => key !== 'grandTotalAmount')
            .map(([day, details], index) => (
              <Animated.View
                key={day}
                style={[
                  styles.couponCard,
                  {
                    transform: [{scale: scaleAnim}],
                  },
                ]}>
                <Text style={styles.couponDay}>{day}</Text>
                <Text style={styles.couponCount}>{details.count}</Text>
                <Text style={styles.couponAmount}>₹{details.amount}</Text>
              </Animated.View>
            ))}
        </View>

        <View style={styles.grandTotalCard}>
          <Text style={styles.grandTotalLabel}>Grand Total</Text>
          <Text style={styles.grandTotalAmount}>
            ₹{subscriptionDetails.userSubscriptionAmount}
          </Text>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <Animated.View
        style={[
          styles.actionSection,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        {/* <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Download Receipt</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Contact Us')}>
          <Text style={styles.secondaryButtonText}>Contact Support</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
};

const InfoRow = ({label, value}) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorBackButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF6B35',
    borderRadius: 20,
  },
  errorBackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorSubText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginBottom: 15,
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  goBackButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  goBackText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#FF6B35',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  userTypeBadge: {
    alignSelf: 'center',
    backgroundColor: '#FFC107',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: -15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userTypeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  statusCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  subscriptionInfo: {
    gap: 12,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'right',
  },
  couponSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  couponGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  couponCard: {
    backgroundColor: 'white',
    width: (width - 60) / 3,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  couponDay: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF6B35',
    marginBottom: 8,
  },
  couponCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  couponAmount: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  grandTotalCard: {
    backgroundColor: '#FF6B35',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  grandTotalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  actionSection: {
    marginHorizontal: 20,
    marginBottom: 40,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFC107',
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UserDashboard;

import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

export default function HomePage() {
  const route = useRoute();
  const navigation = useNavigation();
  const {userRole, cooperativeSociety, userID, flatNumber, name} =
    route.params || {};

  console.log('HomePage Params:', {
    userRole,
    cooperativeSociety,
    userID,
    flatNumber,
  });
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const headerSlide = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout Confirmation',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // Add your logout logic here
            // For example: navigation.reset() or navigation.navigate('Login')
            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
          },
        },
      ],
      {cancelable: false},
    );
  };

  const createButtonPressAnimation = callback => {
    return () => {
      const buttonScale = new Animated.Value(1);
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      if (callback) callback();
    };
  };

  const AdminCard = ({title, subtitle, onPress, backgroundColor, icon}) => {
    const cardScale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(cardScale, {
          toValue: 0.96,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      if (onPress) onPress();
    };

    return (
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [
              {translateY: slideAnim},
              {scale: Animated.multiply(scaleAnim, cardScale)},
            ],
          },
        ]}>
        <TouchableOpacity
          style={[styles.adminCard, {backgroundColor}]}
          onPress={handlePress}
          activeOpacity={0.9}>
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>{icon}</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardSubtitle}>{subtitle}</Text>
            </View>
            <View style={styles.cardArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const UserCard = ({title, subtitle, onPress, backgroundColor, icon}) => {
    const cardScale = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
      Animated.sequence([
        Animated.timing(cardScale, {
          toValue: 0.96,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      if (onPress) onPress();
    };

    return (
      <Animated.View
        style={[
          {
            opacity: fadeAnim,
            transform: [
              {translateY: slideAnim},
              {scale: Animated.multiply(scaleAnim, cardScale)},
            ],
          },
        ]}>
        <TouchableOpacity
          style={[styles.userCard, {backgroundColor}]}
          onPress={handlePress}
          activeOpacity={0.9}>
          <View style={styles.cardContent}>
            <View style={styles.cardIcon}>
              <Text style={styles.cardIconText}>{icon}</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardSubtitle}>{subtitle}</Text>
            </View>
            <View style={styles.cardArrow}>
              <Text style={styles.arrowText}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Small logout button positioned at bottom right
  const SmallLogoutButton = () => (
    <Animated.View
      style={[
        styles.smallLogoutButton,
        {
          opacity: fadeAnim,
          transform: [{scale: scaleAnim}],
        },
      ]}>
      <TouchableOpacity
        style={styles.logoutIconButton}
        onPress={handleLogout}
        activeOpacity={0.8}>
        <Text style={styles.logoutIcon}>🚪</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderAdminPanel = () => (
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      <Animated.View
        style={[
          styles.welcomeSection,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <Text style={styles.welcomeText}>Welcome Back!</Text>
        <Text style={styles.welcomeSubtext}>
          Manage your puja administration
        </Text>
      </Animated.View>

      <View style={styles.cardsContainer}>
        <AdminCard
          title="Dashboard Summary"
          subtitle="View analytics & insights"
          backgroundColor="#FF6B35"
          icon="📊"
          onPress={() => navigation.navigate('Dashboard')}
        />

        <AdminCard
          title="Manual Registration"
          subtitle="Register users manually"
          backgroundColor="#4ECDC4"
          icon="✍️"
          onPress={() => navigation.navigate('Manual User Registration')}
        />

        <AdminCard
          title="Approvals"
          subtitle="Approve the subscriptions"
          backgroundColor="#4ECDC4"
          icon="✍️"
          onPress={() => navigation.navigate('Admin Approval')}
        />

        <AdminCard
          title="Family Directory"
          subtitle="Manage registered families"
          backgroundColor="#45B7D1"
          icon="👥"
          onPress={() => navigation.navigate('FamilyList')}
        />

        <AdminCard
          title="Personal Subscription"
          subtitle="Handle transactions & billing"
          backgroundColor="#96CEB4"
          icon="💳"
          onPress={() =>
            navigation.navigate('Subscription', {
              userRole,
              userID,
              cooperativeSociety,
              flatNumber,
              phoneNumber: route.params?.phoneNumber,
              name,
            })
          }
        />
      </View>
    </ScrollView>
  );

  const renderUserPanel = () => (
    <ScrollView
      style={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}>
      <Animated.View
        style={[
          styles.welcomeSection,
          {
            opacity: fadeAnim,
            transform: [{translateY: slideAnim}],
          },
        ]}>
        <Text style={styles.welcomeText}>Namaste! 🙏</Text>
        <Text style={styles.welcomeSubtext}>Your puja dashboard awaits</Text>
      </Animated.View>

      <View style={styles.cardsContainer}>
        <UserCard
          title="My Subscription"
          subtitle="Manage your puja subscription"
          backgroundColor="#FF6B35"
          icon="🕉️"
          onPress={() =>
            navigation.navigate('Subscription', {
              userRole,
              userID,
              cooperativeSociety,
              flatNumber,
              phoneNumber: route.params?.phoneNumber,
              name,
            })
          }
        />

        <UserCard
          title="Help & Support"
          subtitle="Get assistance & FAQs"
          backgroundColor="#f7d258ff"
          icon="❓"
          onPress={() => {
            navigation.navigate('Contact Us');
          }}
        />
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#FF6B35"
        translucent={false}
      />

      {/* Animated Header */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{translateY: headerSlide}],
          },
        ]}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {userRole === 'U02' ? 'Admin Portal' : 'Puja Management App'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {userRole === 'U02'
              ? 'Administrative Dashboard'
              : 'Your Subscription Manager'}
          </Text>
        </View>
        <View style={styles.headerDecoration}>
          <Text style={styles.decorationText}>🕉️</Text>
        </View>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {userRole === 'U02' ? renderAdminPanel() : renderUserPanel()}
      </View>

      {/* Small Logout Button - Fixed at bottom right */}
      <SmallLogoutButton />
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
    paddingTop: Platform.OS === 'ios' ? 10 : 10,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#FF6B35',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  headerDecoration: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorationText: {
    fontSize: 30,
  },
  mainContent: {
    flex: 1,
    marginTop: -15,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Add bottom padding to account for the floating logout button
  },
  welcomeSection: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    marginBottom: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  cardsContainer: {
    gap: 15,
  },
  adminCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  userCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardIconText: {
    fontSize: 24,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  cardArrow: {
    width: 30,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  // New styles for small logout button
  smallLogoutButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 1000,
  },
  logoutIconButton: {
    width: 50,
    height: 50,
    backgroundColor: '#E53E3E',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutIcon: {
    fontSize: 24,
    color: 'white',
  },
  // Remove old logout button styles
  logoutButton: {
    backgroundColor: '#E53E3E',
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIconOld: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoutIconTextOld: {
    fontSize: 20,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});

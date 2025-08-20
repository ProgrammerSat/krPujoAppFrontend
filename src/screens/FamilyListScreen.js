import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

import BASE_URL from '../env';

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const {width, height} = Dimensions.get('window');

export default function FamilyListScreen({navigation}) {
  const [familyList, setFamilyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [stats, setStats] = useState({
    totalFamilies: 0,
    paidFamilies: 0,
    unpaidFamilies: 0,
  });

  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-50);
  const modalScale = useSharedValue(0);
  const modalOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);

  // Fetch families from API
  const fetchFamilies = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const response = await fetch(`${BASE_URL}/user/getAllFamilies`);
      const data = await response.json();

      if (response.ok) {
        setFamilyList(data.families);
        setStats({
          totalFamilies: data.totalFamilies,
          paidFamilies: data.paidFamilies,
          unpaidFamilies: data.unpaidFamilies,
        });
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch families');
      }
    } catch (error) {
      console.error('Error fetching families:', error);
      Alert.alert('Network Error', 'Unable to connect to server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchFamilies(false);
  };

  // Modal animation functions
  const showModal = family => {
    setSelectedFamily(family);
    setModalVisible(true);

    // Animate modal entrance
    overlayOpacity.value = withTiming(1, {duration: 300});
    modalScale.value = withSpring(1, {
      damping: 15,
      stiffness: 100,
    });
    modalOpacity.value = withTiming(1, {duration: 300});
  };

  const hideModal = () => {
    // Animate modal exit
    overlayOpacity.value = withTiming(0, {duration: 250});
    modalScale.value = withSpring(0.8, {
      damping: 15,
      stiffness: 100,
    });
    modalOpacity.value = withTiming(0, {duration: 250});

    // Close modal after animation
    setTimeout(() => {
      setModalVisible(false);
      setSelectedFamily(null);
    }, 250);
  };

  useEffect(() => {
    fetchFamilies();

    // Header entrance animation
    headerOpacity.value = withTiming(1, {duration: 800});
    headerTranslateY.value = withSpring(0, {
      damping: 15,
      stiffness: 100,
    });
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{translateY: headerTranslateY.value}],
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    opacity: modalOpacity.value,
    transform: [{scale: modalScale.value}],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  // Loading screen component
  const LoadingScreen = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#667eea" />
      <Text style={styles.loadingText}>Loading families...</Text>
    </View>
  );

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No Families Found</Text>
      <Text style={styles.emptySubtitle}>
        No registered families to display
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => fetchFamilies()}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // Family Details Modal Component
  const FamilyDetailsModal = () => {
    if (!selectedFamily) return null;

    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideModal}>
        <Animated.View style={[styles.modalOverlay, overlayAnimatedStyle]}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={hideModal}>
            <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
              <TouchableOpacity activeOpacity={1} onPress={() => {}}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Family Details</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={hideModal}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.modalContent}
                  showsVerticalScrollIndicator={false}>
                  {/* Flat Number Section */}
                  <View style={styles.detailSection}>
                    <View style={styles.flatNumberContainer}>
                      <Text style={styles.flatNumberLarge}>
                        {selectedFamily.flat}
                      </Text>
                      <View
                        style={[
                          styles.statusIndicator,
                          selectedFamily.paid
                            ? styles.paidIndicator
                            : styles.unpaidIndicator,
                        ]}>
                        <Text
                          style={[
                            styles.statusIndicatorText,
                            selectedFamily.paid
                              ? styles.paidIndicatorText
                              : styles.unpaidIndicatorText,
                          ]}>
                          {selectedFamily.paid ? '● PAID' : '● UNPAID'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Personal Information */}
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>
                      Personal Information
                    </Text>

                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <Text style={styles.detailIcon}>👤</Text>
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Full Name</Text>
                        <Text style={styles.detailValue}>
                          {selectedFamily.name}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <Text style={styles.detailIcon}>📞</Text>
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Phone Number</Text>
                        <Text style={styles.detailValue}>
                          {selectedFamily.phoneNumber}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <Text style={styles.detailIcon}>🏢</Text>
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>
                          Cooperative Society
                        </Text>
                        <Text style={styles.detailValue}>
                          {selectedFamily.cooperativeSociety}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Account Information */}
                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Account Information</Text>

                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <Text style={styles.detailIcon}>🔑</Text>
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Role</Text>
                        <Text style={styles.detailValue}>
                          {selectedFamily.role === 'U02'
                            ? 'Administrator'
                            : selectedFamily.role === 'U01'
                            ? 'Member'
                            : 'Guest'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <Text style={styles.detailIcon}>📅</Text>
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Member Since</Text>
                        <Text style={styles.detailValue}>
                          {selectedFamily.createdAt
                            ? new Date(
                                selectedFamily.createdAt,
                              ).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'Not available'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <Text style={styles.detailIcon}>🔄</Text>
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Last Updated</Text>
                        <Text style={styles.detailValue}>
                          {selectedFamily.updatedAt
                            ? new Date(
                                selectedFamily.updatedAt,
                              ).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'Not available'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.iconContainer}>
                        <Text style={styles.detailIcon}>⚡</Text>
                      </View>
                      <View style={styles.detailTextContainer}>
                        <Text style={styles.detailLabel}>Account Status</Text>
                        <Text
                          style={[
                            styles.detailValue,
                            selectedFamily.active
                              ? styles.activeText
                              : styles.inactiveText,
                          ]}>
                          {selectedFamily.active ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Payment Status Section */}
                  <View
                    style={[
                      styles.detailSection,
                      styles.paymentSection,
                      selectedFamily.paid
                        ? styles.paidSection
                        : styles.unpaidSection,
                    ]}>
                    <Text style={styles.sectionTitle}>Payment Status</Text>
                    <View style={styles.paymentContainer}>
                      <Text style={styles.paymentStatusLarge}>
                        {selectedFamily.paid
                          ? 'PAYMENT COMPLETED'
                          : 'PAYMENT PENDING'}
                      </Text>
                      <Text style={styles.paymentStatusSubtext}>
                        {selectedFamily.paid
                          ? 'This family has completed their payment'
                          : 'Payment is still pending for this family'}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                {/* Modal Footer */}
                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={hideModal}>
                    <Text style={styles.modalCloseButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    );
  };

  const FamilyItem = ({item, index}) => {
    const scale = useSharedValue(0);
    const opacity = useSharedValue(0);
    const translateX = useSharedValue(50);

    // Button animation values
    const buttonScale = useSharedValue(1);
    const buttonBackgroundColor = useSharedValue(0);
    const buttonShadowOpacity = useSharedValue(0.3);
    const buttonElevation = useSharedValue(4);
    const iconTranslateX = useSharedValue(0);
    const textOpacity = useSharedValue(1);
    const rippleScale = useSharedValue(0);

    useEffect(() => {
      // Staggered entrance animation
      const delay = index * 100;
      scale.value = withDelay(
        delay,
        withSpring(1, {damping: 15, stiffness: 100}),
      );
      opacity.value = withDelay(delay, withTiming(1, {duration: 600}));
      translateX.value = withDelay(
        delay,
        withSpring(0, {damping: 20, stiffness: 80}),
      );
    }, [index]);

    const itemAnimatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{scale: scale.value}, {translateX: translateX.value}],
    }));

    const buttonAnimatedStyle = useAnimatedStyle(() => {
      const backgroundColor = interpolate(
        buttonBackgroundColor.value,
        [0, 1],
        [0x667eea, 0x764ba2], // From blue to purple
      );

      return {
        transform: [{scale: buttonScale.value}],
        backgroundColor: `#${Math.round(backgroundColor)
          .toString(16)
          .padStart(6, '0')}`,
        shadowOpacity: buttonShadowOpacity.value,
        elevation: buttonElevation.value,
      };
    });

    const iconAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{translateX: iconTranslateX.value}],
    }));

    const textAnimatedStyle = useAnimatedStyle(() => ({
      opacity: textOpacity.value,
    }));

    const rippleAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{scale: rippleScale.value}],
      opacity: interpolate(rippleScale.value, [0, 1], [0.3, 0]),
    }));

    const handlePressIn = () => {
      // Multi-layered press animation
      buttonScale.value = withSpring(0.96, {damping: 15, stiffness: 300});
      buttonBackgroundColor.value = withTiming(1, {duration: 150});
      buttonShadowOpacity.value = withTiming(0.6, {duration: 150});
      buttonElevation.value = withTiming(8, {duration: 150});
      iconTranslateX.value = withSpring(3, {damping: 15, stiffness: 200});

      // Ripple effect
      rippleScale.value = 0;
      rippleScale.value = withTiming(1, {duration: 400});
    };

    const handlePressOut = () => {
      // Return to normal state
      buttonScale.value = withSpring(1, {damping: 15, stiffness: 200});
      buttonBackgroundColor.value = withTiming(0, {duration: 200});
      buttonShadowOpacity.value = withTiming(0.3, {duration: 200});
      buttonElevation.value = withTiming(4, {duration: 200});
      iconTranslateX.value = withSpring(0, {damping: 15, stiffness: 200});
    };

    const handlePress = () => {
      // Success animation sequence
      textOpacity.value = withTiming(0, {duration: 100});
      buttonScale.value = withSpring(0.9, {damping: 15, stiffness: 200}, () => {
        buttonScale.value = withSpring(
          1.05,
          {damping: 15, stiffness: 200},
          () => {
            buttonScale.value = withSpring(1, {damping: 15, stiffness: 200});
            // Show modal instead of navigation
            runOnJS(showModal)(item);
          },
        );
      });

      // Reset text opacity after animation
      setTimeout(() => {
        textOpacity.value = withTiming(1, {duration: 200});
      }, 300);
    };

    return (
      <Animated.View style={[styles.itemContainer, itemAnimatedStyle]}>
        <View style={styles.itemContent}>
          <View style={styles.flatInfo}>
            <View style={styles.flatHeader}>
              <Text style={styles.flatNumber}>{item.flat}</Text>
              <Text style={styles.societyBadge}>{item.cooperativeSociety}</Text>
            </View>
            <Text style={styles.familyName}>{item.name}</Text>
            <Text style={styles.phoneNumber}>📞 {item.phoneNumber}</Text>
            <Text style={styles.cooperativeSociety}>
              🏢 {item.cooperativeSociety}
            </Text>
          </View>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                item.paid ? styles.paidBadge : styles.unpaidBadge,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  item.paid ? styles.paidText : styles.unpaidText,
                ]}>
                {item.paid ? 'Paid' : 'Unpaid'}
              </Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>
                {item.role === 'U02'
                  ? 'Admin'
                  : item.role === 'U01'
                  ? 'Member'
                  : 'Guest'}
              </Text>
            </View>
          </View>
        </View>
        <AnimatedTouchableOpacity
          style={[styles.actionButton, buttonAnimatedStyle]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handlePress}
          activeOpacity={1}>
          {/* Ripple effect overlay */}
          <Animated.View style={[styles.rippleEffect, rippleAnimatedStyle]} />

          <View style={styles.buttonContent}>
            <Animated.Text style={[styles.actionButtonText, textAnimatedStyle]}>
              View Details
            </Animated.Text>
            <Animated.View style={[styles.buttonIcon, iconAnimatedStyle]}>
              <Text style={styles.iconText}>→</Text>
            </Animated.View>
          </View>
        </AnimatedTouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <View style={styles.container}>
        <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
          <Text style={styles.header}>Family Registration</Text>
          <Text style={styles.subtitle}>
            {stats.totalFamilies} families registered • {stats.paidFamilies}{' '}
            paid
          </Text>
        </Animated.View>

        {loading ? (
          <LoadingScreen />
        ) : familyList.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={familyList}
            keyExtractor={item => item.id.toString()}
            renderItem={({item, index}) => (
              <FamilyItem item={item} index={index} />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#667eea']}
                tintColor="#667eea"
              />
            }
          />
        )}

        {/* Family Details Modal */}
        <FamilyDetailsModal />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    backgroundColor: '#667eea',
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    opacity: 0.9,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  itemContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#64748b',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  flatInfo: {
    flex: 1,
    marginRight: 15,
  },
  flatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  flatNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginRight: 12,
  },
  societyBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#667eea',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    overflow: 'hidden',
  },
  familyName: {
    fontSize: 18,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 6,
  },
  phoneNumber: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  cooperativeSociety: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  unpaidBadge: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
  },
  paidBadge: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  unpaidText: {
    color: '#d97706',
  },
  paidText: {
    color: '#059669',
  },
  roleBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginTop: 6,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  actionButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  buttonIcon: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  rippleEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackdrop: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    width: '100%',
    maxWidth: 420,
    maxHeight: height * 0.85,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
    overflow: 'hidden',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#667eea',
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },

  modalContent: {
    maxHeight: height * 0.6,
  },
  detailSection: {
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#f9fafb',
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  flatNumberContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  flatNumberLarge: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },

  statusIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  paidIndicator: {
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
    shadowColor: '#16a34a',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  unpaidIndicator: {
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    shadowColor: '#f59e0b',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  statusIndicatorText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  paidIndicatorText: {
    color: '#15803d',
  },
  unpaidIndicatorText: {
    color: '#d97706',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#667eea',
    paddingLeft: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailIcon: {
    fontSize: 18,
    color: '#4338ca',
  },

  paymentSection: {
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 12,
  },
  paidSection: {
    backgroundColor: '#ecfdf5',
  },
  unpaidSection: {
    backgroundColor: '#fff7ed',
  },
  paymentStatusLarge: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  paymentStatusSubtext: {
    fontSize: 13,
    color: '#6b7280',
  },
  modalFooter: {
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  modalCloseButton: {
    backgroundColor: '#667eea',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';

const {width, height} = Dimensions.get('window');

import BASE_URL from '../env';

const api = {
  getPendingSubscriptions: () => fetch(`${BASE_URL}/admin/pending`),
  getApprovedSubscriptions: () => fetch(`${BASE_URL}/admin/approved`),
  getRejectedSubscriptions: () => fetch(`${BASE_URL}/admin/rejected`),
  getAllPaymentsWithImages: () =>
    fetch(`${BASE_URL}/userPayment/getAllPaymentsWithImages`),
  getPaymentWithImage: paymentId =>
    fetch(`${BASE_URL}/userPayment/getPaymentWithImage/${paymentId}`),
  updateSubscriptionStatus: (
    phoneNumber,
    newStatus,
    updatedBy,
    rejectionReason,
  ) =>
    fetch(`${BASE_URL}/admin/updateUserApprovalStatus`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        phoneNumber,
        newStatus,
        updatedBy,
        rejectionReason,
      }),
    }),
};

// Helper function to safely format dates
const formatDate = dateValue => {
  if (!dateValue) return 'N/A';

  try {
    let dateObj;

    if (typeof dateValue === 'string') {
      dateObj = new Date(dateValue);
    } else if (typeof dateValue === 'number') {
      dateObj = new Date(dateValue);
    } else {
      return 'N/A';
    }

    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }

    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'N/A';
  }
};

// Helper function to get the correct phone number
const getPhoneNumber = item => {
  return item.phoneNumber || item.userID?.phoneNumber || 'No phone';
};

const AdminApproval = ({navigation}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [subscriptionData, setSubscriptionData] = useState({
    0: [],
    1: [],
    2: [],
  });
  const [paymentsData, setPaymentsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const cardTransformAnim = useRef(new Animated.Value(1)).current;
  const modalScaleAnim = useRef(new Animated.Value(0)).current;
  const imageModalScaleAnim = useRef(new Animated.Value(0)).current;

  const tabs = [
    {
      name: 'Pending',
      color: '#FF8E53',
      bgColor: '#FFF3E0',
      textColor: '#E65100',
    },
    {
      name: 'Approved',
      color: '#4ECDC4',
      bgColor: '#E0F2F1',
      textColor: '#00695C',
    },
    {
      name: 'Rejected',
      color: '#FF6B6B',
      bgColor: '#FFEBEE',
      textColor: '#C62828',
    },
  ];

  // Function to find payment image for a subscription
  const findPaymentImage = item => {
    const payment = paymentsData.find(
      payment =>
        payment.userID?.phoneNumber === getPhoneNumber(item) ||
        payment.userID?._id === item.userID?._id,
    );
    return payment?.imageUrl || null;
  };

  //fetch subscription and payment data
  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes, rejectedRes, paymentsRes] =
        await Promise.all([
          api.getPendingSubscriptions(),
          api.getApprovedSubscriptions(),
          api.getRejectedSubscriptions(),
          api.getAllPaymentsWithImages(),
        ]);

      const pending = await pendingRes.json();
      const approved = await approvedRes.json();
      const rejected = await rejectedRes.json();
      const payments = await paymentsRes.json();

      console.log('Payments Response:', payments);

      // Store payments data
      setPaymentsData(payments.payments || []);

      // Transform backend data to match your UI format
      const transformedData = {
        0: pending.map(item => ({
          id: item._id,
          name: item.userID?.name || 'Unknown',
          email: getPhoneNumber(item),
          plan: item.userSubscriptionType || 'Regular',
          amount: `₹${item.userSubscriptionAmount || '0'}`,
          date: formatDate(
            item.userSubscriptionCreatedDate ||
              item.userSubscriptionDate ||
              item.paymentDate,
          ),
          avatar: '👨‍💼',
          priority: 'medium',
          phoneNumber: getPhoneNumber(item),
          userID: item.userID,
        })),
        1: approved.map(item => ({
          id: item._id,
          name: item.userID?.name || 'Unknown',
          email: getPhoneNumber(item),
          plan: item.userSubscriptionType || 'Regular',
          amount: `₹${item.userSubscriptionAmount || '0'}`,
          date: formatDate(
            item.userSubscriptionCreatedDate ||
              item.userSubscriptionDate ||
              item.paymentDate,
          ),
          avatar: '👨‍💼',
          phoneNumber: getPhoneNumber(item),
          userID: item.userID,
        })),
        2: rejected.map(item => ({
          id: item._id,
          name: item.userID?.name || 'Unknown',
          email: getPhoneNumber(item),
          plan: item.userSubscriptionType || 'Regular',
          amount: `₹${item.userSubscriptionAmount || '0'}`,
          date: formatDate(
            item.userSubscriptionCreatedDate ||
              item.userSubscriptionDate ||
              item.paymentDate,
          ),
          avatar: '👨‍💼',
          phoneNumber: getPhoneNumber(item),
          userID: item.userID,
        })),
      };

      setSubscriptionData(transformedData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSubscriptionData({
        0: [],
        1: [],
        2: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, [refreshTrigger]);

  const handleTabPress = index => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    cardTransformAnim.setValue(1);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: (index * (width - 60)) / 3,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardTransformAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setActiveTab(index);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(cardTransformAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    });
  };

  const showModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setRejectionReason('');
    setModalVisible(true);

    Animated.spring(modalScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(modalScaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setSelectedItem(null);
      setRejectionReason('');
    });
  };

  const showImageModal = imageUrl => {
    setSelectedImage(imageUrl);
    setImageModalVisible(true);
    Animated.spring(imageModalScaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  console.log('SelectedImage modal:', selectedImage);

  const hideImageModal = () => {
    Animated.timing(imageModalScaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setImageModalVisible(false);
      setSelectedImage(null);
    });
  };

  const handleConfirmAction = async () => {
    if (!selectedItem) return;

    try {
      const newStatus = modalType === 'approve' ? 'APR' : 'REJ';
      const response = await api.updateSubscriptionStatus(
        selectedItem.phoneNumber,
        newStatus,
        'admin',
        rejectionReason,
      );

      if (response.ok) {
        setRefreshTrigger(prev => prev + 1);

        setTimeout(() => {
          const currentTabData = subscriptionData[activeTab];
          if (currentTabData.length <= 1) {
            const targetTab = modalType === 'approve' ? 1 : 2;
            handleTabPress(targetTab);
          }
        }, 500);
      } else {
        console.error('Failed to update subscription status');
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
    }

    hideModal();
  };

  const handleApprove = item => {
    showModal('approve', item);
  };

  const handleReject = item => {
    showModal('reject', item);
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return '#FF6B6B';
      case 'medium':
        return '#FFA726';
      case 'low':
        return '#66BB6A';
      default:
        return '#9E9E9E';
    }
  };

  const renderPaymentImage = item => {
    const imageUrl = findPaymentImage(item);

    if (!imageUrl) {
      return (
        <View style={styles.noImageContainer}>
          <View style={styles.noImageIcon}>
            <Text style={styles.noImageText}>📷</Text>
          </View>
          <Text style={styles.noImageLabel}>No payment image</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={styles.paymentImageContainer}
        onPress={() => showImageModal(imageUrl)}
        activeOpacity={0.8}>
        <Image
          source={{uri: imageUrl}}
          style={styles.paymentImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <Text style={styles.imageOverlayText}>📷 Tap to view</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSubscriptionCard = (item, index) => {
    const isApproved = activeTab === 1;
    const isRejected = activeTab === 2;
    const isPending = activeTab === 0;

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.card,
          {
            transform: [
              {
                translateY: cardTransformAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
              {
                scale: cardTransformAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.95, 1],
                }),
              },
            ],
            opacity: fadeAnim,
          },
        ]}>
        <View style={styles.cardContent}>
          {isPending && (
            <View
              style={[
                styles.priorityIndicator,
                {backgroundColor: getPriorityColor(item.priority)},
              ]}
            />
          )}

          <View style={styles.cardHeader}>
            <View
              style={[
                styles.avatarContainer,
                {backgroundColor: tabs[activeTab].bgColor},
              ]}>
              <Text style={styles.avatar}>{item.avatar}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
              {isPending && (
                <View style={styles.priorityBadge}>
                  <View
                    style={[
                      styles.priorityDot,
                      {backgroundColor: getPriorityColor(item.priority)},
                    ]}
                  />
                  <Text
                    style={[
                      styles.priorityText,
                      {color: getPriorityColor(item.priority)},
                    ]}>
                    {item.priority?.toUpperCase()} PRIORITY
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.statusContainer}>
              <Animated.View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: tabs[activeTab].color,
                    transform: [{scale: scaleAnim}],
                  },
                ]}>
                <Text style={styles.statusText}>
                  {isApproved ? '✓' : isRejected ? '✗' : '⏳'}
                </Text>
              </Animated.View>
            </View>
          </View>

          <View style={styles.planInfoContainer}>
            <View style={styles.planInfo}>
              <View style={styles.planLeft}>
                <Text style={styles.planName}>{item.plan}</Text>
                <Text style={styles.planAmount}>{item.amount}</Text>
              </View>
              <View
                style={[
                  styles.planBadge,
                  {
                    backgroundColor: tabs[activeTab].bgColor,
                    borderColor: tabs[activeTab].color,
                  },
                ]}>
                <Text
                  style={[
                    styles.planBadgeText,
                    {color: tabs[activeTab].textColor},
                  ]}>
                  {item.plan.includes('Premium') ? '⭐ Premium' : '📦 Basic'}
                </Text>
              </View>
            </View>
          </View>

          {/* Payment Image Section */}
          <View style={styles.paymentSection}>
            <View style={styles.paymentSectionHeader}>
              <View style={styles.paymentIconContainer}>
                <Text style={styles.paymentIcon}>💳</Text>
              </View>
              <Text style={styles.paymentSectionTitle}>Payment Proof</Text>
            </View>
            {renderPaymentImage(item)}
          </View>

          <View style={styles.dateContainer}>
            <View
              style={[
                styles.dateIconContainer,
                {backgroundColor: tabs[activeTab].bgColor},
              ]}>
              <Text style={styles.dateIcon}>📅</Text>
            </View>
            <Text style={styles.dateText}>Applied on {item.date}</Text>
          </View>

          {isRejected && item.reason && (
            <View style={styles.reasonContainer}>
              <View style={styles.reasonHeader}>
                <View style={styles.warningIconContainer}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                </View>
                <Text style={styles.reasonLabel}>Rejection Reason</Text>
              </View>
              <Text style={styles.reasonText}>{item.reason}</Text>
            </View>
          )}

          {isPending && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApprove(item)}
                activeOpacity={0.7}>
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonIcon}>✓</Text>
                  <Text style={styles.approveButtonText}>Approve</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReject(item)}
                activeOpacity={0.7}>
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonIcon}>✗</Text>
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FF6B6B" barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              navigation.goBack();
            }}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription Approvals</Text>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>📋</Text>
          </View>
        </View>
      </View>

      {/* Enhanced Tab Navigation */}
      <View style={styles.tabContainer}>
        <View style={styles.tabWrapper}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tabButton,
                activeTab === index && [
                  styles.activeTabButton,
                  {backgroundColor: tab.color},
                ],
              ]}
              onPress={() => handleTabPress(index)}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === index
                    ? styles.activeTabText
                    : {color: tab.textColor},
                ]}>
                {tab.name}
              </Text>
              <View
                style={[
                  styles.tabBadge,
                  activeTab === index
                    ? {backgroundColor: 'rgba(255, 255, 255, 0.3)'}
                    : {backgroundColor: tab.color},
                ]}>
                <Text
                  style={[
                    styles.tabBadgeText,
                    {color: activeTab === index ? '#FFFFFF' : '#FFFFFF'},
                  ]}>
                  {subscriptionData[index]?.length || 0}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Enhanced Stats Cards */}
      <View style={styles.statsContainer}>
        {tabs.map((tab, index) => (
          <Animated.View
            key={index}
            style={[
              styles.statsCard,
              {backgroundColor: tab.bgColor},
              activeTab === index && styles.activeStatsCard,
            ]}>
            <Text style={[styles.statsNumber, {color: tab.textColor}]}>
              {subscriptionData[index]?.length || 0}
            </Text>
            <Text style={[styles.statsLabel, {color: tab.textColor}]}>
              {tab.name}
            </Text>
          </Animated.View>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{opacity: fadeAnim}}>
          {subscriptionData[activeTab]?.length > 0 ? (
            subscriptionData[activeTab].map((item, index) =>
              renderSubscriptionCard(item, index),
            )
          ) : (
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconContainer,
                  {backgroundColor: tabs[activeTab].bgColor},
                ]}>
                <Text style={styles.emptyIcon}>
                  {activeTab === 0 ? '⏳' : activeTab === 1 ? '✅' : '❌'}
                </Text>
              </View>
              <Text style={styles.emptyText}>
                No {tabs[activeTab].name.toLowerCase()} subscriptions
              </Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 0
                  ? 'All pending requests have been processed!'
                  : `No ${tabs[
                      activeTab
                    ].name.toLowerCase()} subscriptions found.`}
              </Text>
              <TouchableOpacity
                style={[
                  styles.refreshButton,
                  {backgroundColor: tabs[activeTab].color},
                ]}
                onPress={() => {
                  setRefreshTrigger(prev => prev + 1);
                  fetchSubscriptionData();
                }}>
                <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{scale: modalScaleAnim}],
              },
            ]}>
            <View style={styles.modalContent}>
              <View
                style={[
                  styles.modalHeader,
                  {
                    backgroundColor:
                      modalType === 'approve' ? '#4ECDC4' : '#FF6B6B',
                  },
                ]}>
                <Text style={styles.modalHeaderIcon}>
                  {modalType === 'approve' ? '✓' : '✗'}
                </Text>
                <Text style={styles.modalTitle}>
                  {modalType === 'approve'
                    ? 'Approve Subscription'
                    : 'Reject Subscription'}
                </Text>
              </View>

              {selectedItem && (
                <View style={styles.modalUserInfo}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>
                      {selectedItem.avatar}
                    </Text>
                  </View>
                  <View style={styles.modalUserDetails}>
                    <Text style={styles.modalUserName}>
                      {selectedItem.name}
                    </Text>
                    <Text style={styles.modalUserEmail}>
                      {selectedItem.email}
                    </Text>
                    <Text style={styles.modalPlanInfo}>
                      {selectedItem.plan} - {selectedItem.amount}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.modalMessage}>
                <Text style={styles.modalMessageText}>
                  {modalType === 'approve'
                    ? 'Are you sure you want to approve this subscription request?'
                    : 'Are you sure you want to reject this subscription request?'}
                </Text>
              </View>

              {modalType === 'reject' && (
                <View style={styles.reasonInputContainer}>
                  <Text style={styles.reasonInputLabel}>
                    Reason for rejection:
                  </Text>
                  <TextInput
                    style={styles.reasonInput}
                    placeholder="Enter rejection reason..."
                    placeholderTextColor="#9CA3AF"
                    value={rejectionReason}
                    onChangeText={setRejectionReason}
                    multiline={true}
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalCancelButton]}
                  onPress={hideModal}
                  activeOpacity={0.7}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.modalConfirmButton,
                    {
                      backgroundColor:
                        modalType === 'approve' ? '#4ECDC4' : '#FF6B6B',
                    },
                  ]}
                  onPress={handleConfirmAction}
                  activeOpacity={0.7}>
                  <Text style={styles.modalConfirmText}>
                    {modalType === 'approve' ? 'Approve' : 'Reject'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}>
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalCloseArea}
            onPress={hideImageModal}
            activeOpacity={1}
          />
          <Animated.View
            style={[
              styles.imageModalContainer,
              {
                transform: [{scale: imageModalScaleAnim}],
              },
            ]}>
            <View style={styles.imageModalHeader}>
              <Text style={styles.imageModalTitle}>Payment Proof</Text>
              <TouchableOpacity
                style={styles.imageModalCloseButton}
                onPress={hideImageModal}>
                <Text style={styles.imageModalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            {selectedImage && (
              <Image
                source={{uri: selectedImage}}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            )}
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FF6B6B',
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 22,
  },
  tabContainer: {
    marginHorizontal: 20,
    marginTop: -12,
    marginBottom: 16,
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 2,
  },
  activeTabButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activeStatsCard: {
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    transform: [{scale: 1.02}],
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  cardContent: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  priorityIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 28,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  planInfoContainer: {
    marginBottom: 16,
  },
  planInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
  },
  planLeft: {
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  planAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#059669',
  },
  planBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateIcon: {
    fontSize: 16,
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  reasonContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  warningIcon: {
    fontSize: 12,
  },
  reasonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
  },
  reasonText: {
    fontSize: 14,
    color: '#DC2626',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 0.48,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  approveButton: {
    backgroundColor: '#4ECDC4',
  },
  rejectButton: {
    backgroundColor: '#FF6B6B',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },
  approveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  refreshButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalContent: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 24,
    alignItems: 'center',
  },
  modalHeaderIcon: {
    fontSize: 48,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalUserInfo: {
    flexDirection: 'row',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalAvatarText: {
    fontSize: 32,
  },
  modalUserDetails: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalUserEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  modalPlanInfo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  modalMessage: {
    padding: 24,
    paddingTop: 16,
  },
  modalMessageText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
  },
  reasonInputContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  reasonInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#374151',
    backgroundColor: '#F9FAFB',
    minHeight: 80,
  },
  modalActions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 0,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  modalCancelButton: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  modalConfirmButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  paymentSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  paymentSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  paymentIcon: {
    fontSize: 16,
  },
  paymentSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  paymentImageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  paymentImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  imageOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  noImageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  noImageText: {
    fontSize: 20,
    opacity: 0.5,
  },
  noImageLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },

  // Image Modal Styles
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  imageModalCloseArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  imageModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 20,
    maxHeight: height * 0.8,
    maxWidth: width * 0.9,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {width: 10, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  imageModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  imageModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageModalCloseText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  fullScreenImage: {
    width: '100%',
    height: height * 0.6,
    backgroundColor: '#F9FAFB',
  },
});

export default AdminApproval;

import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useState} from 'react';
import Register from '../screens/register';
import Login from '../screens/login';
import SubscriptionScreen from '../screens/subscription';
import Payment from '../screens/Payment';
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PujaRegistrationScreen from '../screens/PujaRegistrationScreen';
import FamilyListScreen from '../screens/FamilyListScreen';
import ContactUs from '../screens/contactus';
import AdminApproval from '../screens/adminApproval';
import UserDashboard from '../screens/userDashboard';

const Stack = createStackNavigator();

export default props => {
  const [currentScreen, setCurrentScreen] = useState(null);
  const [prevScreen, setPrevScreen] = useState(null);

  const onNavigationRef = navigation => {
    if (navigation) {
      unsubscribe = navigation.addListener('state', e => {
        setPrevScreen(currentScreen);
        setCurrentScreen(navigation.getCurrentRoute());
      });
    } else if (unsubscribe) {
      unsubscribe();
    }

    props.onNavigationRef(navigation);
  };

  return (
    <NavigationContainer ref={onNavigationRef}>
      <Stack.Navigator
        initialRouteName="Register"
        screenOptions={{
          headerShown: false,
          animationTypeForReplace: 'pop',
          animationEnabled: true,
          gestureEnabled: false,
        }}>
        <Stack.Screen
          name="Register"
          component={Register}
          options={{headerShown: false}}
        />
        <Stack.Screen
          // options={{headerShown: false}}
          name="Login"
          component={Login}
        />
        <Stack.Screen
          // options={{headerShown: false}}
          name="Subscription"
          component={SubscriptionScreen}
          initialParams={{
            userID: props?.route?.params?.userID,
            name: props?.route?.params?.name,
            userRole: props?.route?.params?.userRole,
            cooperativeSociety: props?.route?.params?.cooperativeSociety,
            flatNumber: props?.route?.params?.flatNumber,
            userRole: props?.route?.params?.userRole,
            userCpnActiveStatus: props?.route?.params?.userCpnActiveStatus,
            phoneNumber: props?.route?.params?.phoneNumber,
          }}
        />
        <Stack.Screen
          // options={{headerShown: false}}
          name="Payment"
          component={Payment}
          initialParams={{
            totalAmount: props?.route?.params?.totalAmount,
            userID: props?.route?.params?.userID,
            userRole: props?.route?.params?.userRole,
            name: props?.route?.params?.name,
            cooperativeSociety: props?.route?.params?.cooperativeSociety,
            flatNumber: props?.route?.params?.flatNumber,
            userRole: props?.route?.params?.userRole,
            userCpnActiveStatus: props?.route?.params?.userCpnActiveStatus,
            phoneNumber: props?.route?.params?.phoneNumber,
            coupons: props?.route?.params?.coupons,
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          initialParams={{
            userID: props?.route?.params?.userID,
            name: props?.route?.params?.name,
            cooperativeSociety: props?.route?.params?.cooperativeSociety,
            flatNumber: props?.route?.params?.flatNumber,
            userRole: props?.route?.params?.userRole,
            userCpnActiveStatus: props?.route?.params?.userCpnActiveStatus,
            phoneNumber: props?.route?.params?.phoneNumber,
          }}
        />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Contact Us" component={ContactUs} />
        <Stack.Screen
          name="Manual User Registration"
          component={PujaRegistrationScreen}
        />
        <Stack.Screen name="FamilyList" component={FamilyListScreen} />
        <Stack.Screen name="Admin Approval" component={AdminApproval} />
        <Stack.Screen name="User Dashboard" component={UserDashboard} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

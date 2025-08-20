import {NavigationContainer} from '@react-navigation/native';
import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, ActivityIndicator} from 'react-native';
import StackNavigator from './src/navigation/StackNavigation';
import {UserProvider} from './src/components/UserContext';
import {NativeBaseProvider, Box} from 'native-base';

const App = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentRoute, setCurrentRoute] = useState(null);
  const setNavigationRef = navigation => {
    setTimeout(() => {
      if (navigation) {
        if (!isSubscribed) {
          navigation.addListener('state', () => {
            setIsSubscribed(true);
            setCurrentRoute(navigation.getCurrentRoute().name);
          });
        }
      }
    });
  };
  return (
    // <UserProvider>
    //   <View style={{flex: 1}}>
    //     <NavigationContainer>
    //       <StackNavigator />
    //     </NavigationContainer>
    //   </View>
    // </UserProvider>
    <UserProvider>
      <NativeBaseProvider>
        <View style={{flex: 1}}>
          <StackNavigator onNavigationRef={setNavigationRef} />
        </View>
      </NativeBaseProvider>
    </UserProvider>
  );
};

export default App;

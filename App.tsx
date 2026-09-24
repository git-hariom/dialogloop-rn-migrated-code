/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {getMessaging, getToken} from '@react-native-firebase/messaging';
import { useEffect, useState } from 'react';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [FCMToken, setFCMToken] = useState("");
  
  useEffect(() => {
    const getFcmToken = async () => {
      try {
        const messagingInstance = getMessaging();
        const token = await getToken(messagingInstance);
        setFCMToken(prev=>token);

        console.log('LOG_FCM_TOKEN:', token);
      } catch (error) {
        console.log('LOG_ERROR_FCM_TOKEN:', error);
      }
    };
  
    getFcmToken();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent FCMToken={FCMToken} />
    </SafeAreaProvider>
  );
}

function AppContent({FCMToken}: {FCMToken: string}) {
  return (
    <View style={styles.container}>
      <Text>FCMToken</Text>
      <Text>{FCMToken}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
});

export default App;

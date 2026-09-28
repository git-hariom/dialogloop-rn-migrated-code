import {useEffect, useState} from 'react';
import {Platform, StatusBar, StyleSheet, Text, useColorScheme, View} from 'react-native';
import {NewAppScreen} from '@react-native/new-app-screen';
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  checkNotifications,
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';
import {
  getMessaging,
  getToken,
  getAPNSToken,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [APNToken, setAPNSToken] = useState<string | null>(null);
  const [FCMToken, setFCMToken] = useState<string | null>(null);

  useEffect(() => {
    const responseTokens = async () => {
      const tokens = await setupNotifications();
      if (tokens) {
        setAPNSToken(tokens.apnsToken);
        setFCMToken(tokens.fcmToken);
      }
    };

    responseTokens();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{textAlign: 'center', marginTop: 20, fontSize: 16}}>
        APNs Token: {APNToken || 'Not available yet'}
      </Text>
      <Text style={{textAlign: 'center', marginTop: 10, fontSize: 16}}>
        FCM Token: {FCMToken || 'Not available yet'}
      </Text>
      </View>
    </SafeAreaProvider>
  );
}

async function setupNotifications() {
  try {
    // 1. Check permission
    let {status} = await checkNotifications();

    // 2. Ask for permission if needed
    if (status !== RESULTS.GRANTED) {
      const result = await requestNotifications([
        'alert',
        'badge',
        'sound',
      ]);

      status = result.status;
    }

    if (status !== RESULTS.GRANTED) {
      console.log('LOG_NOTIFICATION_PERMISSION_DENIED: Notification permission denied');
      return;
    }

    // 3. Get Firebase Messaging instance
    const messaging = getMessaging();

    // 4. Register for remote messages
    await registerDeviceForRemoteMessages(messaging);
    let apnsToken = null;

    // 5. Get APNs token (iOS)
    if (Platform.OS === 'ios') {
      apnsToken = await getAPNSToken(messaging);
    
      console.log('LOG_APN_TOKEN: APNs Token:', apnsToken);
    
      if (!apnsToken) {
        console.log('LOG_APN_TOKEN: APNs token is null or undefined');
        return;
      }
    }
    
    const fcmToken = await getToken(messaging);
    console.log('LOG_FCM_TOKEN: FCM Token:', fcmToken);

    return {
      apnsToken: Platform.OS === 'ios' ? apnsToken : 'NA',
      fcmToken,
    };

  } catch (error) {
    console.error('LOG_NOTIFICATION_SETUP_ERROR: Error setting up notifications:', error);
  }
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
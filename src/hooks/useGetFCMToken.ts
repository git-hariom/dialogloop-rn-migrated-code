
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import {
  getMessaging,
  getToken,
  getAPNSToken,
  registerDeviceForRemoteMessages,
} from '@react-native-firebase/messaging';

import useGetPermissionState from './useGetPermissionState';
import CONSTANTS from '../constants';

const useGetFCMToken = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [apnToken, setApnToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    permissionStates,
    refreshPermissionState,
  } = useGetPermissionState();

  const getFCMToken = useCallback(async () => {
    try {
      const messaging = getMessaging();

      if (Platform.OS === 'ios') {
        await registerDeviceForRemoteMessages(messaging);

        const latestAPNSToken = await getAPNSToken(messaging);
        console.log('LOG_APN_TOKEN:', latestAPNSToken);

        if (!latestAPNSToken) {
          setApnToken(null);
          setFcmToken(null);
          return null;
        }

        const latestFCMToken = await getToken(messaging);

        setApnToken(latestAPNSToken);
        setFcmToken(latestFCMToken);

        console.log('LOG_FCM_TOKEN:', latestFCMToken);

        return {
          fcmToken: latestFCMToken,
          apnToken: latestAPNSToken,
        };
      }

      const latestFCMToken = await getToken(messaging);

      setFcmToken(latestFCMToken);
      setApnToken(null);

      console.log('LOG_FCM_TOKEN:', latestFCMToken);

      return {
        fcmToken: latestFCMToken,
        apnToken: null,
      };
    } catch (error) {
      console.error('Error getting FCM/APNs token:', error);
      return null;
    }
  }, []);

  const refreshTokens = useCallback(async () => {
    setLoading(true);

    try {
      // Recheck permissions before retrieving tokens.
      const latestPermissions = await refreshPermissionState();

      if (
        !latestPermissions ||
        latestPermissions.notification !== CONSTANTS.GRANTED
      ) {
        setFcmToken(null);
        setApnToken(null);
        return null;
      }

      return await getFCMToken();
    } finally {
      setLoading(false);
    }
  }, [refreshPermissionState, getFCMToken]);

  useEffect(() => {
    if (permissionStates.notification === CONSTANTS.GRANTED) {
      getFCMToken();
    }
  }, [permissionStates.notification, getFCMToken]);

  return {
    fcmToken,
    apnToken,
    refreshTokens,
    loading,
  };
};

export default useGetFCMToken;

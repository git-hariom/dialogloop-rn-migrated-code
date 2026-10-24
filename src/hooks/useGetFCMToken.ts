import { useState, useEffect } from 'react';
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
import useGetPermissionState from './useGetPermissionState';
import { Platform } from 'react-native';

const useGetFCMToken = () => {
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [apnToken, setApnToken] = useState<string | null>(null);
    const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean>(false);

    useGetPermissionState().then((PermissionStatus) => {
        console.log('LOG_PermissionStatus:', PermissionStatus);
        if (PermissionStatus?.notification === 0) {
            console.log('LOG_Notification permission is denied.');
            setHasNotificationPermission(false);

            // Temp Code -- Dinesh will ask for Permission in the WebView, so we will not request permission here.
            requestNotifications(['alert', 'sound', 'badge']).then(({ status, settings }) => {
                if (status === RESULTS.GRANTED) {
                    console.log('LOG_Notification permission granted.');
                    setHasNotificationPermission(true);
                } else {
                    console.log('LOG_Notification permission denied.');
                    setHasNotificationPermission(false);
                }
            });
        }
        setHasNotificationPermission(PermissionStatus?.notification === 1);
    });

    useEffect(() => {
        const getFCMToken = async () => {
            try {
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

                setFcmToken(fcmToken);
                setApnToken(apnsToken);
            } catch (error) {
                console.error('Error getting FCM token:', error);
            }
        };

        if (hasNotificationPermission) getFCMToken();
    }, [hasNotificationPermission]);

    return { fcmToken, apnToken };
}

export default useGetFCMToken;
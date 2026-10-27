import { Platform, PermissionsAndroid } from 'react-native';
import {
  checkNotifications,
  requestNotifications,
  RESULTS,
} from 'react-native-permissions';

const useGetNotificationPermission = () => {
  const getNotificationPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        const { status } = await checkNotifications();

        if (status === RESULTS.GRANTED || status === RESULTS.LIMITED) {
          return true;
        }

        const { status: requestedStatus } =
          await requestNotifications(['alert', 'badge', 'sound']);

        return (
          requestedStatus === RESULTS.GRANTED ||
          requestedStatus === RESULTS.LIMITED
        );
      }

      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const permission =
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;

        const alreadyGranted =
          await PermissionsAndroid.check(permission);

        if (alreadyGranted) return true;

        const result = await PermissionsAndroid.request(permission);

        return result === PermissionsAndroid.RESULTS.GRANTED;
      }

      // Android 12 and below don't require runtime notification permission.
      return true;
    } catch (error) {
      console.error('Notification permission error:', error);
      return false;
    }
  };

  return { getNotificationPermission };
};

export default useGetNotificationPermission;
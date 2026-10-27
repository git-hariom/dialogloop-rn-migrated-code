
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useCameraPermission } from 'react-native-vision-camera';
import {
  checkNotifications,
  RESULTS,
} from 'react-native-permissions';
import CONSTANTS from '../constants';

const useGetPermissionState = () => {
  const { hasPermission: hasCameraPermission } = useCameraPermission();

  const [notificationStatus, setNotificationStatus] = useState<string | null>(
    null,
  );

  const refreshPermissionState = useCallback(async () => {
    try {
      const { status } = await checkNotifications();

      console.log('LOG_notification_status', status);

      setNotificationStatus(previous =>
        previous === status ? previous : status,
      );

      return {
        camera: hasCameraPermission
          ? CONSTANTS.GRANTED
          : CONSTANTS.DENIED,
        notification:
          status === RESULTS.GRANTED
            ? CONSTANTS.GRANTED
            : CONSTANTS.DENIED,
      };
    } catch (error) {
      console.error('LOG_Error checking permissions:', error);
      return null;
    }
  }, [hasCameraPermission]);

  useEffect(() => {
    refreshPermissionState();
  }, [refreshPermissionState]);

  const permissionStates = useMemo(
    () => ({
      camera: hasCameraPermission
        ? CONSTANTS.GRANTED
        : CONSTANTS.DENIED,
      notification:
        notificationStatus === null
          ? null
          : notificationStatus === RESULTS.GRANTED
            ? CONSTANTS.GRANTED
            : CONSTANTS.DENIED,
    }),
    [hasCameraPermission, notificationStatus],
  );

  return {
    permissionStates,
    refreshPermissionState,
  };
};

export default useGetPermissionState;

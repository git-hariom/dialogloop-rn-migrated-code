
import { useCallback, useEffect, useRef, useState } from 'react';
import DeviceInfo from 'react-native-device-info';
import { getLocales } from 'react-native-localize';
import useGetPermissionState from './useGetPermissionState';
import useGetFCMToken from './useGetFCMToken';

function useDeviceInfo() {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const { refreshPermissionState } = useGetPermissionState();
  const { refreshTokens } = useGetFCMToken();

  // Prevent overlapping device-info refreshes.
  const refreshPromiseRef = useRef<Promise<any> | null>(null);

  const refreshDeviceInfo = useCallback(async () => {
    // Reuse the current operation if a refresh is already running.
    if (refreshPromiseRef.current) {
      console.log('LOG_Device info refresh already in progress');
      return refreshPromiseRef.current;
    }

    console.log('LOG_Refreshing device Info');

    const refreshPromise = (async () => {
      setLoading(true);

      try {
        const powerState = await DeviceInfo.getPowerState();
        const permissionStates = await refreshPermissionState();
        const token = await refreshTokens();

        console.log('LOG_Refreshing powerState', powerState);
        console.log('LOG_Refreshing permissionStates', permissionStates);
        console.log('LOG_Refreshing token', token);

        const info = {
          deviceId: DeviceInfo.getDeviceId(),
          deviceName: await DeviceInfo.getDeviceName(),
          systemName: DeviceInfo.getSystemName(),
          systemVersion: DeviceInfo.getSystemVersion(),
          nativeId: await DeviceInfo.getUniqueId(),
          manufacturer: await DeviceInfo.getManufacturer(),
          model: DeviceInfo.getModel(),
          brand: DeviceInfo.getBrand(),
          buildNumber: DeviceInfo.getBuildNumber(),
          bundleId: DeviceInfo.getBundleId(),
          readableVersion: DeviceInfo.getReadableVersion(),
          deviceType: DeviceInfo.getDeviceType(),
          os: DeviceInfo.getSystemName(),
          osVersion: DeviceInfo.getSystemVersion(),
          isEmulator: await DeviceInfo.isEmulator(),
          isTablet: DeviceInfo.isTablet(),
          isPinOrFingerprintSet:
            await DeviceInfo.isPinOrFingerprintSet(),
          hasNotch: DeviceInfo.hasNotch(),
          isLandscape: await DeviceInfo.isLandscape(),
          isAirplaneMode: await DeviceInfo.isAirplaneMode(),
          isBatteryCharging: await DeviceInfo.isBatteryCharging(),
          isLocationEnabled: await DeviceInfo.isLocationEnabled(),
          nativeVer: await DeviceInfo.getVersion(),
          locales: getLocales(),
          permissions: permissionStates,
          ...(token?.fcmToken ? { fcmToken: token.fcmToken } : {}),
          ...(token?.apnToken ? { apnToken: token.apnToken } : {}),
          batteryState: powerState.batteryState,
          batteryLevel: powerState.batteryLevel,
          batteryLowPowerMode: powerState.lowPowerMode,
        };

        console.log('LOG_info', info);
        setDeviceInfo(info);

        return info;
      } catch (error) {
        console.error('Failed to refresh device info:', error);
        return null;
      } finally {
        setLoading(false);
      }
    })();

    refreshPromiseRef.current = refreshPromise;

    try {
      return await refreshPromise;
    } finally {
      if (refreshPromiseRef.current === refreshPromise) {
        refreshPromiseRef.current = null;
      }
    }
  }, [refreshPermissionState, refreshTokens]);

  // Collect device information on initial mount.
  useEffect(() => {
    refreshDeviceInfo();
  }, [refreshDeviceInfo]);

  return {
    deviceInfo,
    refreshDeviceInfo,
    loading,
  };
}

export default useDeviceInfo;

import { useEffect, useState } from "react";
import DeviceInfo from "react-native-device-info";
import { getLocales } from 'react-native-localize';
import useGetPermissionState from "./useGetPermissionState";
import useGetFCMToken from "./useGetFCMToken";

function useDeviceInfo() {
    const [deviceInfo, setDeviceInfo] = useState<any>(null);
    const permissionStates = useGetPermissionState();
    const tokens = useGetFCMToken();

    console.log('LOG_FCM_TOKEN:', tokens?.fcmToken);
    console.log('LOG_APN_TOKEN:', tokens?.apnToken);

    useEffect(() => {
        const getDeviceInfo = async () => {
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
                isPinOrFingerprintSet: await DeviceInfo.isPinOrFingerprintSet(),
                hasNotch: DeviceInfo.hasNotch(),
                isLandscape: await DeviceInfo.isLandscape(),
                isAirplaneMode: await DeviceInfo.isAirplaneMode(),
                isBatteryCharging: await DeviceInfo.isBatteryCharging(),
                isLocationEnabled: await DeviceInfo.isLocationEnabled(),
                nativeVer: await DeviceInfo.getVersion(),
                locales: await getLocales(),
                permissions: permissionStates,
                fcmToken: tokens?.fcmToken || 'NOT_AVAILABLE',
                batteryState: (await DeviceInfo.getPowerState()).batteryState,
                batteryLevel: (await DeviceInfo.getPowerState()).batteryLevel,
                batteryLowPowerMode: (await DeviceInfo.getPowerState()).lowPowerMode,
            };

            setDeviceInfo(info);
        };

        getDeviceInfo();
    }, []);

    return deviceInfo;
}

export default useDeviceInfo;
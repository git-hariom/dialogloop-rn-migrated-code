import {useEffect, useState} from "react";
import DeviceInfo from "react-native-device-info";

function useDeviceInfo() {
    const [deviceInfo, setDeviceInfo] = useState<any>(null);

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
                isLandscape: DeviceInfo.isLandscape(),
                isAirplaneMode: await DeviceInfo.isAirplaneMode(),
                isBatteryCharging: await DeviceInfo.isBatteryCharging(),
                batteryLevel: await DeviceInfo.getBatteryLevel(),
                isLocationEnabled: await DeviceInfo.isLocationEnabled(),
                nativeVer: await DeviceInfo.getVersion(),
            };

            setDeviceInfo(info);
        };

        getDeviceInfo();
    }, []);

    return deviceInfo;
}

export default useDeviceInfo;
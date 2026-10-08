import DeviceInfo from "react-native-device-info";

const useDeviceBatteryStateChange = () => {
  const powerState = DeviceInfo.usePowerState();

  return {
    batteryLevel: powerState.batteryLevel,
    batteryState: powerState.batteryState,
    lowPowerMode: powerState.lowPowerMode,
  };
};

export default useDeviceBatteryStateChange;
import { Linking } from 'react-native';
import {
  useCameraPermission,
} from 'react-native-vision-camera';

const useGetNotificationPermission = async () => {
  const {
    requestPermission,
  } = useCameraPermission();

  try {
    const granted = await requestPermission();
    if (!granted) {
      Linking.openSettings();
    }

    return granted;
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

export default useGetNotificationPermission;
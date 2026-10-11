import {
  useCameraPermission,
} from 'react-native-vision-camera';
import { Linking } from 'react-native';

const useRequestCameraPermission = async () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  try {
    if (!hasPermission) {
      const granted = await requestPermission();
      return granted;
    }
    return true;
  } catch (error) {
    console.error('Permission request error:', error);
  }
};

export default useRequestCameraPermission;
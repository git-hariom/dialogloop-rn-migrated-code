import { useState } from "react";
import {
  useCameraPermission,
} from 'react-native-vision-camera';
import CONSTANTS from "../constants";

const useGetPermissionState = () => {
    const { hasPermission } = useCameraPermission();

    return {
        camera: hasPermission ? CONSTANTS?.GRANTED : CONSTANTS?.DENIED,
        notification: CONSTANTS?.DENIED,
    }

}    

export default useGetPermissionState;
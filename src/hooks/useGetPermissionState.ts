import { useState } from "react";
import {
    useCameraPermission,
} from 'react-native-vision-camera';
import {
    checkNotifications,
    RESULTS
} from 'react-native-permissions';
import CONSTANTS from "../constants";

const useGetPermissionState = async() => {
    try {
        const { hasPermission } = useCameraPermission();
        let { status } = await checkNotifications();

        console.log('LOG_PermissionStatus:', { camera: hasPermission, notification: status });
        return {
            camera: hasPermission ? CONSTANTS?.GRANTED : CONSTANTS?.DENIED,
            notification: status === RESULTS.GRANTED ? CONSTANTS?.GRANTED : CONSTANTS?.DENIED,
        }
    }
    catch (error) {
        console.error('LOG_Error checking permissions:', error);
    }

}

export default useGetPermissionState;
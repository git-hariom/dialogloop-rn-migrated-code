import CONSTANTS from "../constants";
import { hasQueryParams } from "../utils/helper";
import useDeviceInfo from "./useDeviceInfo";

const getNavigateURLParams = (navigateTo: string, deviceInfo: object) => {
    const queryParamsSymbol = hasQueryParams(navigateTo) ? '&' : '?';
    const nativeId = deviceInfo?.nativeId;
    const nativeVer = deviceInfo?.nativeVer;
    const locale = deviceInfo?.locales?.[0]?.languageTag || 'NOT_AVAILABLE';
    const language = deviceInfo?.locales?.[0]?.languageCode || 'NOT_AVAILABLE';
    const fcmToken = deviceInfo?.fcmToken || 'NOT_AVAILABLE';
    const timeStamp = Math.floor(Date.now() / 1000);

    const navigateURLParams: string = `${queryParamsSymbol}&nativeId=${nativeId}&nativeVer=${nativeVer}&locale=${locale}&language=${language}&fcmToken=${fcmToken}&_ts=${timeStamp}`;

    return navigateURLParams;
}

const useGetFirstLaunchURL = (deviceInfo: any) => {
    const firstLaunchURL =
        CONSTANTS?.FIRST_LAUNCH_URL +
        getNavigateURLParams(CONSTANTS?.FIRST_LAUNCH_URL, deviceInfo);
    console.log('LOG_FIRST_LAUNCH_URL', firstLaunchURL);

    return firstLaunchURL;
};

export default useGetFirstLaunchURL;
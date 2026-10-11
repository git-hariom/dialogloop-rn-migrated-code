import { Linking } from "react-native";
import InAppBrowser from "react-native-inappbrowser-reborn";
import useRequestCameraPermission from "../hooks/useRequestCameraPermission";

export const hasQueryParams = (url: string) => /\?.+/.test(url);

export const getNavigateURLParams = (navigateTo: string, deviceInfo: object) => {
  const queryParamsSymbol = hasQueryParams(navigateTo) ? '&' : '?';
  const nativeId = deviceInfo?.nativeId;
  const nativeVer = deviceInfo?.nativeVer;
  const locale = deviceInfo?.locales?.[0]?.languageTag || 'NOT_AVAILABLE';
  const language = deviceInfo?.locales?.[0]?.languageCode || 'NOT_AVAILABLE';
  const timeStamp = Math.floor(Date.now() / 1000);

  const navigateURLParams: string = `${queryParamsSymbol}&nativeId=${nativeId}&nativeVer=${nativeVer}&locale=${locale}&language=${language}&_ts=${timeStamp}`;

  return navigateURLParams;
}

let isInAppBrowserActive = false;
export const openExternal = async (url: string) => {
  if (!url || typeof url !== "string") return;

  if (isInAppBrowserActive) {
    return;
  }

  isInAppBrowserActive = true;

  try {
    const available = await InAppBrowser.isAvailable();

    if (available) {
      const result = await InAppBrowser.open(url, {
        dismissButtonStyle: "close",
        preferredBarTintColor: "#000000",
        preferredControlTintColor: "#ffffff",
        enableUrlBarHiding: true,
        showTitle: true,
      });

      if (result.type === "dismiss") {
        console.log("LOG_BROWSER: InAppBrowser dismissed");
      }
    } else {
      await Linking.openURL(url);
    }
  } catch (error) {
    console.log("LOG_BROWSER: InAppBrowser error:", error);
  } finally {
    setTimeout(() => {
      isInAppBrowserActive = false;
    }, 300);
  }
};

export const requestPermissions = async (permissions: any[]) => {
  for (const permission of permissions) {
    try {

      switch (permission) {
        case 'CAMERA':
          const granted = await useRequestCameraPermission();
          if (!granted) {
            await Linking.openSettings();
          }
          break;
        default:
          console.warn(`Unknown permission requested: ${permission}`);
      }
    } catch (error) {
      console.error(`Permission request error for ${permission}:`, error);
    }
  }
}

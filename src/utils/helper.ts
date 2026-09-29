import { Linking } from "react-native";

export const hasQueryParams = (url: string) => /\?.+/.test(url);

export const getNavigateURLParams = (navigateTo: string, deviceInfo: object) => {
  const queryParamsSymbol = hasQueryParams(navigateTo) ? '&' : '?';
  const nativeId = deviceInfo?.nativeId;
  const nativeVer = deviceInfo?.nativeVer;
  const timeStamp = Math.floor(Date.now() / 1000);

  const navigateURLParams: string = `${queryParamsSymbol}&nativeId=${nativeId}&nativeVer=${nativeVer}&_ts=${timeStamp}`;

  return navigateURLParams;
}

export const openExternal = async (url: string) => {
  if (!url || typeof url !== "string") return;

  try {
      await Linking.openURL(url);
  } catch (error) {
    console.log("Linking error:", error);
  }
};
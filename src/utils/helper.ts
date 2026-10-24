import { Linking } from "react-native";
import InAppBrowser from "react-native-inappbrowser-reborn";

export const hasQueryParams = (url: string) => /\?.+/.test(url);

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
import React, { useRef } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import type { WebView as WebViewType } from "react-native-webview";

import { AppStackParamList } from '../navigation/AppNavigator';
import CONSTANTS from '../constants';
import useDeviceInfo from '../hooks/useDeviceInfo';
import { getNavigateURLParams, openExternal } from '../utils/helper';


type Props = NativeStackScreenProps<AppStackParamList, 'WebViewWrapper'>;

const WebViewWrapper: React.FC<Props> = ({ route, navigation }) => {
    const webViewRef = useRef<WebViewType>(null);
    const deviceInfo = useDeviceInfo();

    const firstLaunchURL =
    CONSTANTS?.FIRST_LAUNCH_URL +
    getNavigateURLParams(CONSTANTS?.FIRST_LAUNCH_URL, deviceInfo);

    const injectedJS = `
        (function() {
        // Override window.open
        window.open = function(url, target) {
            window.ReactNativeWebView.postMessage(
            JSON.stringify({
                type: "OPEN_EXTERNAL",
                url: url,
                target: target || '_blank'
            })
            );
            return null;
        };
        })();
        true;
    `;

    const handleMessage = async (event: any) => {
        let message;
        try {
            message = JSON.parse(event.nativeEvent.data);
        } catch {
            return "INVALID_EVENT_DATA";
        }
        console.log("Received message from WebView:", message);

        if (message.type === CONSTANTS.GET_DEVICE_INFO) {
            // Handle GET_DEVICE_INFO message
            console.log("Handling GET_DEVICE_INFO");

            const script = `
                (function() {
                    window.postMessage(${JSON.stringify(deviceInfo)}, "*");
                })();
                true;
            `;

            webViewRef.current?.injectJavaScript(script);
        }
        if (message.type === "OPEN_EXTERNAL") {
            await openExternal(message.url);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <WebView
                ref={webViewRef}
                source={{ uri: firstLaunchURL }}
                style={{ flex: 1 }}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
                alignMediaPlayback={true}
                injectedJavaScript={injectedJS}
            />
        </SafeAreaView>
    );
};

export default WebViewWrapper;
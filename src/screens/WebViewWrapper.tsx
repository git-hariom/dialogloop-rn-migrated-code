import React, { useEffect, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import type { WebView as WebViewType } from "react-native-webview";
import NetInfo from "@react-native-community/netinfo";
import { View, Text } from 'react-native';

import { AppStackParamList } from '../navigation/AppNavigator';
import CONSTANTS from '../constants';
import useDeviceInfo from '../hooks/useDeviceInfo';
import { getNavigateURLParams, openExternal } from '../utils/helper';
import QRScanner from '../components/QRScanner';
import useGetAppState from '../hooks/useGetAppState';
import useDeviceBatteryStateChange from '../hooks/useDeviceBatteryStateChange';

type Props = NativeStackScreenProps<AppStackParamList, 'WebViewWrapper'>;

const WebViewWrapper: React.FC<Props> = ({ route, navigation }) => {
    const webViewRef = useRef<WebViewType>(null);
    const deviceInfo = useDeviceInfo();
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [isInternet, setInternet] = useState(true);
    const appState = useGetAppState();
    const { batteryLevel, batteryState, lowPowerMode } =
        useDeviceBatteryStateChange();
    const [isWebviewloading, setIsWebViewLoading] = useState(true);
    const hasLoadedOnce = useRef(false);

    const firstLaunchURL =
        CONSTANTS?.FIRST_LAUNCH_URL +
        getNavigateURLParams(CONSTANTS?.FIRST_LAUNCH_URL, deviceInfo);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            if (!state.isConnected) {
                setInternet(false);
            } else {
                setInternet(true);
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        handleAppStateChange(appState);
    }, [appState]);

    useEffect(() => {
        if (batteryLevel == null) return;

        const payload = JSON.stringify({
            batteryLevel,
            batteryState,
            lowPowerMode,
        });

        webViewRef.current?.injectJavaScript(`
    window.dispatchEvent(new CustomEvent('${CONSTANTS.NATIVEAPP_POWER_STATE_CHANGE
            }', {
      data: ${payload},
      timestamp: ${Date.now()}
    }));
    true;
  `);
    }, [batteryLevel, batteryState, lowPowerMode]);

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

    const handleAppStateChange = (state: string) => {
        const script = `
    window.dispatchEvent(new CustomEvent('${CONSTANTS.NATIVEAPP_STATE_CHANGE
            }', {
      data: { state: '${state}' },
      timestamp: ${Date.now()}
    }));
    true;
  `;

        webViewRef.current?.injectJavaScript(script);
    };

    const onBarcodeScanned = (barcodes: any[]) => {
        if (!barcodes || barcodes.length === 0) {
            return;
        }

        const barcode = barcodes[0];

        if (!barcode?.rawValue) {
            return;
        }

        const value = barcode.rawValue;

        // console.log('LOG_QR_CODE_SCANNED', value);

        const response = {
            id: 'QRCodeRes',
            url: value,
        };

        const script = `
            (function() {
                window.postMessage(
                    ${JSON.stringify(response)},
                    "*"
                );
            })();
            true;
        `;

        setShowQRScanner(false);

        setTimeout(() => {
            sendMessageToWebView(response);
        }, 500);
    };

    const sendMessageToWebView = (message: any) => {
        if (!webViewRef.current) {
            console.log('LOG_WEBVIEW_REF_NOT_AVAILABLE');
            return;
        }

        const payload = JSON.stringify(message);

        const script = `
        (function() {
            try {
                window.postMessage(${payload}, "*");
                console.log("Native -> Web QR message sent");
            } catch (e) {
                console.error("Native -> Web QR message failed", e);
            }
        })();
        true;
    `;

        console.log('LOG_INJECTING_JS_TO_WEBVIEW', message);

        webViewRef.current.injectJavaScript(script);
    };

    const handleMessage = async (event: any) => {
        let response: any;
        try {
            response = JSON.parse(event.nativeEvent.data);
        } catch {
            return "INVALID_EVENT_DATA";
        }

        if (response?.message?.id === CONSTANTS.GET_DEVICE_INFO) {
            const script = `
                (function() {
                    window.postMessage(${JSON.stringify(deviceInfo)}, "*");
                })();
                true;
            `;

            webViewRef.current?.injectJavaScript(script);
        }

        if (response.type === "OPEN_EXTERNAL") {
            await openExternal(response.url);
        }

        if (response?.message?.id === CONSTANTS?.LAUNCH_QRCODE_READER) {
            setShowQRScanner(true);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            {!isInternet && (
                <View style={{ justifyContent: 'center', alignItems: 'center', height: 50, backgroundColor: 'red' }}>
                    <Text style={{ color: 'white' }}>{CONSTANTS?.NO_INTERNET}</Text>
                </View>
            )}
            {isWebviewloading && <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Text>Loading...</Text>
            </View>}
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
                onLoadStart={() => {
                    if (!hasLoadedOnce.current) {
                        setIsWebViewLoading(true);
                    }
                }}
                onLoadEnd={() => {
                    if (!hasLoadedOnce.current) {
                        setIsWebViewLoading(false);
                        hasLoadedOnce.current = true;
                    }
                }}
            />
            {showQRScanner && (
                <QRScanner
                    onBarcodeScanned={onBarcodeScanned}
                    onClose={() => setShowQRScanner(false)}
                    visible={true}
                />
            )}

        </SafeAreaView>
    );
};

export default WebViewWrapper;
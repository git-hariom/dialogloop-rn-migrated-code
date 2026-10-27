import React, { useEffect, useRef, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import WebView from 'react-native-webview';
import type { WebView as WebViewType } from "react-native-webview";
import NetInfo from "@react-native-community/netinfo";
import { View, Text, Image } from 'react-native';

import { AppStackParamList } from '../navigation/AppNavigator';
import CONSTANTS from '../constants';
import { openExternal } from '../utils/helper';
import QRScanner from '../components/QRScanner';

import useGetAppState from '../hooks/useGetAppState';
import useGetFirstLaunchURL from '../hooks/useGetFirstLaunchURL';
import useDeviceInfo from '../hooks/useDeviceInfo';
import useGetNotificationPermission from '../hooks/useGetNotificationPermission';

type Props = NativeStackScreenProps<AppStackParamList, 'WebViewWrapper'>;

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

const WebViewWrapper: React.FC<Props> = ({ route, navigation }) => {
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [langStrings, setLangStrings] = useState({});
    const [isInternet, setInternet] = useState(true);
    const [isWebviewloading, setIsWebViewLoading] = useState(true);

    const webViewRef = useRef<WebViewType>(null);
    const hasLoadedOnce = useRef(false);

    const appState = useGetAppState();
    const { deviceInfo, refreshDeviceInfo } = useDeviceInfo();
    const [firstLaunchURL, setFirstLaunchURL] = useState<string | null>(null);
    const { getNotificationPermission } = useGetNotificationPermission();

    useEffect(() => {
        if (deviceInfo && firstLaunchURL === null) {
            setFirstLaunchURL(useGetFirstLaunchURL(deviceInfo));
        }
    }, [deviceInfo, firstLaunchURL]);

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

        console.log('LOG_QR_CODE_SCANNED', value);

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
            sendataToWebView(response);
        }, 500);
    };

    const sendataToWebView = async (message: any) => {
        if (!webViewRef.current) {
            console.log('LOG_WEBVIEW_REF_NOT_AVAILABLE');
            return;
        }

        const script = `
                (function() {
                    window.postMessage(${JSON.stringify(message)}, "*");
                })();
                true;
            `;
        webViewRef.current.injectJavaScript(script);
    }


    const handlePostMessage = async (event: any) => {
        let response: any;
        try {
            response = JSON.parse(event.nativeEvent.data);
        } catch {
            return "INVALID_EVENT_DATA";
        }

        if (response?.message?.id === CONSTANTS.GET_DEVICE_INFO) {
            const currentDeviceInfo = await refreshDeviceInfo();
            console.log("LOG_currentDeviceInfo", currentDeviceInfo);
            await sendataToWebView({ id: CONSTANTS.GET_DEVICE_INFO, currentDeviceInfo });
        }

        if (response.type === "OPEN_EXTERNAL") {
            await openExternal(response.url);
        }

        if (response?.message?.id === CONSTANTS?.LAUNCH_QRCODE_READER) {
            setLangStrings(response?.message?.data?.strings || {});
            setShowQRScanner(true);
        }

        if (response?.message?.id === CONSTANTS?.REQUEST_NOTIFICATIONS_PERMISSION) {
            const latestNotificationState = await getNotificationPermission();
            const currentDeviceInfo = await refreshDeviceInfo();

            if (latestNotificationState && currentDeviceInfo?.fcmToken) {
                await sendataToWebView({ id: CONSTANTS.GET_DEVICE_INFO, currentDeviceInfo });
            }
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {!isInternet && (
                <View
                    style={{
                        position: 'absolute',
                        top: 8,
                        alignSelf: 'center',
                        height: 36,
                        minWidth: 180,
                        paddingHorizontal: 16,
                        borderRadius: 20,
                        backgroundColor: '#c54e4e',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 9999,
                        elevation: 10,
                    }}
                >
                    <Text
                        style={{
                            color: 'white',
                            fontSize: 16,
                            fontWeight: '600',
                        }}
                    >
                        {'⊘  '}{CONSTANTS?.NO_INTERNET}
                    </Text>
                </View>
            )}
            {isWebviewloading && <View style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Image
                    source={require('../../assets/images/app-logo.png')}
                    style={{ width: 200, height: 200 }}
                    resizeMode="contain"
                />
            </View>}
            <WebView
                ref={webViewRef}
                source={{ uri: firstLaunchURL }}
                style={{ flex: 1 }}
                onMessage={handlePostMessage}
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
                    langStrings={langStrings}
                />
            )}

        </View>
    );
};

export default WebViewWrapper;
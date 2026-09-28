import React from 'react';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {AppStackParamList} from '../navigation/AppNavigator';
import WebView from 'react-native-webview';

type Props = NativeStackScreenProps<AppStackParamList, 'WebViewWrapper'>;

const WebViewWrapper: React.FC<Props> = ({route, navigation}) => {

  return (
    <SafeAreaView style={{flex: 1}}>
      <WebView
        source={{uri: 'https://app.dialogloop.com/v3/rd110/native/firstlaunch.html'}}
        style={{flex: 1}}
      />
    </SafeAreaView>
  );
};

export default WebViewWrapper;
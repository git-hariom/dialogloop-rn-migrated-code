import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import WebViewWrapper from '../screens/WebViewWrapper';

export type AppStackParamList = {
  WebViewWrapper: {};
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="WebViewWrapper" screenOptions={{headerShown: false}}>
      <Stack.Screen  name="WebViewWrapper" component={WebViewWrapper} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
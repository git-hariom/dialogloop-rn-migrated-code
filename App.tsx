import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f9f5f5' }}
    edges={['top']} >
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default App;
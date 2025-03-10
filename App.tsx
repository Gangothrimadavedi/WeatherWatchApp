import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WeatherScreen from './src/screens/WeatherScreen';
import BluetoothScreen from './src/screens/BluetoothScreen';
import WifiScreen from './src/screens/WifiScreen';
import BarcodeScannerScreen from './src/screens/BarcodeScannerScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Optional: Create a stack navigator for each screen if needed
const WeatherStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Weather" component={WeatherScreen} />
  </Stack.Navigator>
);

const BluetoothStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Bluetooth" component={BluetoothScreen} />
  </Stack.Navigator>
);

const WifiStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="WiFi" component={WifiScreen} />
  </Stack.Navigator>
);

const BarcodeScannerStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Barcode Scanner" component={BarcodeScannerScreen} />
  </Stack.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Weather" component={WeatherStack} />
        <Tab.Screen name="Bluetooth" component={BluetoothStack} />
        <Tab.Screen name="WiFi" component={WifiStack} />
        <Tab.Screen name="Barcode Scanner" component={BarcodeScannerStack} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

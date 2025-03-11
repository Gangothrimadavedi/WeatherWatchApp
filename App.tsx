// I thought of importing React first because without React, nothing works
import React from 'react'; // I need React to make components and use JSX
// Then I thought of importing navigation stuff because I want to move between screens
import { NavigationContainer } from '@react-navigation/native'; // This is like the big box that holds all navigation things
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // I want tabs at the bottom, so I use this
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // This is for stacking screens inside tabs, just in case

// Now I thought of importing all the screens I made because I need them in the app
import WeatherScreen from './src/screens/WeatherScreen'; // This is for weather stuff, like checking temperature
import BluetoothScreen from './src/screens/BluetoothScreen'; // This is for Bluetooth things, like connecting devices
import WifiScreen from './src/screens/WifiScreen'; // This is for WiFi things, like scanning networks
import BarcodeScannerScreen from './src/screens/BarcodeScannerScreen'; // This is for scanning barcodes, like in a store

// I thought of creating a tab navigator first because I want tabs at the bottom
const Tab = createBottomTabNavigator(); // This will make the bottom tabs
// Then I thought of creating a stack navigator because maybe later I want to add more screens inside each tab
const Stack = createNativeStackNavigator(); // This is for stacking screens, like going deeper into a feature

// Now I thought of making a stack for each screen, just in case I want to add more screens later
const WeatherStack = () => ( // This is the stack for the weather screen
  <Stack.Navigator> 
    <Stack.Screen name="Weather" component={WeatherScreen} /> {/* // I added the weather screen here*/}
  </Stack.Navigator>
);

const BluetoothStack = () => ( // This is the stack for the Bluetooth screen
  <Stack.Navigator>
    <Stack.Screen name="Bluetooth" component={BluetoothScreen} /> {/* // I added the Bluetooth screen here*/}
  </Stack.Navigator>
);

const WifiStack = () => ( // This is the stack for the WiFi screen
  <Stack.Navigator>
    <Stack.Screen name="WiFi" component={WifiScreen} /> {/* // I added the WiFi screen here*/}
  </Stack.Navigator>
);

const BarcodeScannerStack = () => ( // This is the stack for the barcode scanner screen
  <Stack.Navigator>
    <Stack.Screen name="Barcode Scanner" component={BarcodeScannerScreen} /> {/* // I added the barcode scanner screen here*/}
  </Stack.Navigator>
);

// Now I thought of making the main app component, this is where everything starts
export default function App() {
  return (
    // I wrapped everything in NavigationContainer because without this, navigation won't work
    <NavigationContainer>
      {/* I made a bottom tab navigator and hid the header because I don't need it right now */}
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        {/* I added all the tabs here, each tab is connected to a stack navigator */}
        <Tab.Screen name="Weather" component={WeatherStack} /> {/* // This is the weather tab*/}
        <Tab.Screen name="Bluetooth" component={BluetoothStack} />{/*  // This is the Bluetooth tab*/}
        <Tab.Screen name="WiFi" component={WifiStack} /> {/* // This is the WiFi tab*/}
        <Tab.Screen name="Barcode Scanner" component={BarcodeScannerStack} /> {/* // This is the barcode scanner tab*/}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
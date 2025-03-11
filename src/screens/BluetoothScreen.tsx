import React, { useState, useEffect } from 'react'; // React is the backbone, so it’s here to make things work
import {
  View,
  Button,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native'; // Grabbing UI components to build the screen
import { BleManager, Device, Service, Characteristic } from 'react-native-ble-plx'; // BleManager is the boss for Bluetooth magic
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'; // Permissions are like keys to unlock Bluetooth features

const manager = new BleManager(); // Creating a BleManager instance to handle all Bluetooth operations

export default function BluetoothScreen() {
  const [devices, setDevices] = useState<Device[]>([]); // Stores the list of scanned devices
  const [isScanning, setIsScanning] = useState(false); // Tracks if scanning is in progress
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null); // Holds the currently connected device
  const [services, setServices] = useState<Service[]>([]); // Stores services of the connected device
  const [characteristicsMap, setCharacteristicsMap] = useState<Record<string, Characteristic[]>>({}); // Maps characteristics to services
  const [error, setError] = useState<string | null>(null); // Keeps track of errors to show user-friendly messages

  /** 
   * Permission handling is a must for Bluetooth to work, especially on Android.
   * Without permissions, the app is like a car without keys.
   */
  useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 31) {
          // Android 12+ needs BLUETOOTH_CONNECT and BLUETOOTH_SCAN permissions
          const connectStatus = await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
          const scanStatus = await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
          if (connectStatus !== RESULTS.GRANTED || scanStatus !== RESULTS.GRANTED) {
            setError('Bluetooth permissions are required to use this feature.');
            return;
          }
        }

        // Location permission is needed for scanning Bluetooth devices
        const locationStatus = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
        if (locationStatus !== RESULTS.GRANTED) {
          setError('Location permission is required to scan for Bluetooth devices.');
          return;
        }
      }
    };

    requestPermissions(); // Calling the function to request permissions
  }, []);

  /** 
   * Scanning for devices is like searching for friends in a crowded room.
   * Start scanning, wait for devices to show up, and stop after 5 seconds.
   */
  const scanDevices = async () => {
    setDevices([]); // Clear old devices to start fresh
    setIsScanning(true); // Set scanning state to true
    setError(null); // Clear any previous errors

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error); // Log errors for debugging
        setIsScanning(false); // Stop scanning if there’s an error
        setError('Scan failed. Please try again.'); // Show error to the user
        return;
      }

      if (device && device.name) {
        setDevices((prevDevices) => {
          if (!prevDevices.some((d) => d.id === device.id)) {
            return [...prevDevices, device]; // Add new device to the list if it’s not already there
          }
          return prevDevices;
        });
      }
    });

    // Stop scanning after 5 seconds to save battery and avoid endless searching
    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 5000);
  };

  /** 
   * Connecting to a device is like shaking hands with a new friend.
   * Discover services and characteristics to understand what the device can do.
   */
  const connectToDevice = async (device: Device) => {
    try {
      if (connectedDevice && connectedDevice.id === device.id) {
        setError('Device is already connected.'); // Don’t connect if already connected
        return;
      }

      // Check if the device is already connected
      const isConnected = await device.isConnected();
      if (isConnected) {
        setConnectedDevice(device); // If connected, just set the device
        return;
      }

      // Connect to the device and discover its services and characteristics
      console.log('Connecting to:', device.name || 'Unknown Device');
      const connectedDevice = await device.connect();
      setConnectedDevice(connectedDevice);
      setError(null);

      await connectedDevice.discoverAllServicesAndCharacteristics(); // Discover services and characteristics
      const discoveredServices = await connectedDevice.services();
      setServices(discoveredServices);

      // Map characteristics to services for easy access
      let charMap: Record<string, Characteristic[]> = {};
      for (const service of discoveredServices) {
        const chars = await service.characteristics();
        charMap[service.uuid] = chars;
      }
      setCharacteristicsMap(charMap);
    } catch (error) {
      console.error('Connection error:', error); // Log connection errors
      setError('Failed to connect to the device. Please try again.'); // Show error to the user
    }
  };

  /** 
   * Disconnecting is like saying goodbye to a friend.
   * Clean up and reset everything to start fresh.
   */
  const disconnectDevice = async () => {
    if (connectedDevice) {
      try {
        await connectedDevice.cancelConnection(); // Disconnect from the device
        setConnectedDevice(null); // Reset connected device
        setServices([]); // Clear services
        setCharacteristicsMap({}); // Clear characteristics
        setError(null); // Clear errors
      } catch (error) {
        console.error('Disconnection error:', error); // Log disconnection errors
        setError('Failed to disconnect from the device.'); // Show error to the user
      }
    }
  };

  /** 
   * Rendering a device item is like showing a name tag for each friend.
   * Tap on it to connect and start the conversation.
   */
  const renderDeviceItem = ({ item }: { item: Device }) => (
    <TouchableOpacity onPress={() => connectToDevice(item)} style={styles.deviceItem}>
      <Text>{item.name || 'Unknown Device'}</Text> {/* Show device name or "Unknown Device" */}
    </TouchableOpacity>
  );

  /** 
   * Rendering a service is like opening a toolbox.
   * Each service has its own set of tools (characteristics).
   */
  const renderService = (service: Service) => (
    <View key={service.uuid} style={styles.serviceContainer}>
      <Text style={styles.serviceTitle}>Service UUID: {service.uuid}</Text> {/* Show service UUID */}
      {characteristicsMap[service.uuid]?.map((char) => (
        <Text key={char.uuid} style={styles.characteristicText}>
          Characteristic UUID: {char.uuid} {/* Show characteristic UUID */}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Scan Button */}
      <Button
        title={isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'} // Change button text based on scanning state
        onPress={scanDevices}
        disabled={isScanning} // Disable button while scanning
      />

      {/* Scanning Indicator */}
      {isScanning && (
        <View style={styles.scanningContainer}>
          <ActivityIndicator size="large" color="#0000ff" /> {/* Show loading spinner */}
          <Text>Searching for Bluetooth devices...</Text> {/* Show scanning message */}
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text> {/* Show error message */}
          <Button
            title="Open Settings"
            onPress={() => Linking.openSettings()} // Open settings if permissions are missing
          />
        </View>
      )}

      {/* Device List */}
      {!connectedDevice && (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id} // Use device ID as key
          renderItem={renderDeviceItem} // Render each device item
          style={styles.deviceList}
        />
      )}

      {/* Connected Device Details */}
      {connectedDevice && (
        <ScrollView style={styles.connectedDeviceContainer}>
          <Text style={styles.connectedDeviceTitle}>
            Connected to: {connectedDevice.name || 'Unknown Device'} {/* Show connected device name */}
          </Text>
          <Button title="Disconnect" onPress={disconnectDevice} /> {/* Disconnect button */}
          {services.map((service) => renderService(service))} {/* Render services and characteristics */}
        </ScrollView>
      )}
    </View>
  );
}

/** 
 * Styles are like the outfit for the app.
 * They make everything look clean and organized.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  scanningContainer: {
    marginVertical: 10,
    alignItems: 'center',
  },
  deviceList: {
    marginTop: 20,
  },
  deviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  connectedDeviceContainer: {
    marginTop: 20,
  },
  connectedDeviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  serviceContainer: {
    marginBottom: 20,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  characteristicText: {
    fontSize: 14,
    marginLeft: 10,
  },
  errorContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
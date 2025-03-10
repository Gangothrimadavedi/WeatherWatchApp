// src/screens/BluetoothScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Button, FlatList, Text, TouchableOpacity, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { BleManager, Device, Service, Characteristic } from 'react-native-ble-plx';

const manager = new BleManager();

export default function BluetoothScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [characteristicsMap, setCharacteristicsMap] = useState<Record<string, Characteristic[]>>({});
  const [error, setError] = useState<string | null>(null);

  // Scan for Bluetooth devices
  const scanDevices = async () => {
    setDevices([]);
    setIsScanning(true);
    setError(null);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        setIsScanning(false);
        setError('Scan failed. Please try again.');
        return;
      }

      if (device && device.name) {
        setDevices((prevDevices) => {
          if (!prevDevices.some((d) => d.id === device.id)) {
            return [...prevDevices, device];
          }
          return prevDevices;
        });
      }
    });

    // Stop scanning after 5 seconds
    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 5000);
  };

  // Connect to a device and discover services and characteristics
  const connectToDevice = async (device: Device) => {
    try {
      if (connectedDevice && connectedDevice.id === device.id) {
        setError('Device is already connected.');
        return;
      }

      // Check if the device is already connected
      const isConnected = await device.isConnected();
      if (isConnected) {
        setConnectedDevice(device);
        return;
      }

      // Connect to the device
      console.log('Connecting to:', device.name || 'Unknown Device');
      const connectedDevice = await device.connect();
      setConnectedDevice(connectedDevice);
      setError(null);

      // Discover services and characteristics
      await connectedDevice.discoverAllServicesAndCharacteristics();
      const discoveredServices = await connectedDevice.services();
      setServices(discoveredServices);

      // Map characteristics to services
      let charMap: Record<string, Characteristic[]> = {};
      for (const service of discoveredServices) {
        const chars = await service.characteristics();
        charMap[service.uuid] = chars;
      }
      setCharacteristicsMap(charMap);
    } catch (error) {
      console.error('Connection error:', error);
      setError('Failed to connect to the device. Please try again.');
    }
  };

  // Disconnect from the device
  const disconnectDevice = async () => {
    if (connectedDevice) {
      try {
        await connectedDevice.cancelConnection();
        setConnectedDevice(null);
        setServices([]);
        setCharacteristicsMap({});
        setError(null);
      } catch (error) {
        console.error('Disconnection error:', error);
        setError('Failed to disconnect from the device.');
      }
    }
  };

  // Render a single device
  const renderDeviceItem = ({ item }: { item: Device }) => (
    <TouchableOpacity onPress={() => connectToDevice(item)} style={styles.deviceItem}>
      <Text>{item.name || 'Unknown Device'}</Text>
    </TouchableOpacity>
  );

  // Render a single service with its characteristics
  const renderService = (service: Service) => (
    <View key={service.uuid} style={styles.serviceContainer}>
      <Text style={styles.serviceTitle}>Service UUID: {service.uuid}</Text>
      {characteristicsMap[service.uuid]?.map((char) => (
        <Text key={char.uuid} style={styles.characteristicText}>
          Characteristic UUID: {char.uuid}
        </Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Scan Button */}
      <Button
        title={isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'}
        onPress={scanDevices}
        disabled={isScanning}
      />

      {/* Scanning Indicator */}
      {isScanning && (
        <View style={styles.scanningContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Searching for Bluetooth devices...</Text>
        </View>
      )}

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Device List */}
      {!connectedDevice && (
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={renderDeviceItem}
          style={styles.deviceList}
        />
      )}

      {/* Connected Device Details */}
      {connectedDevice && (
        <ScrollView style={styles.connectedDeviceContainer}>
          <Text style={styles.connectedDeviceTitle}>
            Connected to: {connectedDevice.name || 'Unknown Device'}
          </Text>
          <Button title="Disconnect" onPress={disconnectDevice} />
          {services.map((service) => renderService(service))}
        </ScrollView>
      )}
    </View>
  );
}

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
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
});
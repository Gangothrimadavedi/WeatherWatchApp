// src/screens/WifiScreen.tsx

import React, { useState } from 'react';
import { View, Button, FlatList, Text, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput, Alert } from 'react-native';
import WifiManager from 'react-native-wifi-reborn';

export default function WifiScreen() {
  const [networks, setNetworks] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedNetwork, setConnectedNetwork] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null); // Track selected network
  const [password, setPassword] = useState(''); // Password for the selected network

  // Scan for nearby WiFi networks
  const scanWifiNetworks = async () => {
    setIsScanning(true);
    try {
      const results = await WifiManager.loadWifiList();
      setNetworks(results);
      console.log('WiFi networks found:', results);
    } catch (error) {
      console.error('Error scanning WiFi networks:', error);
      Alert.alert('Error', 'Failed to scan networks. Please check permissions.');
    } finally {
      setIsScanning(false);
    }
  };

  // Connect to a WiFi network
  const connectToNetwork = async (ssid: string) => {
    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return;
    }

    setIsConnecting(true);
    try {
      //await WifiManager.connectToSSID(ssid, password);
      await WifiManager.connectToProtectedSSID(ssid, password, false, false);
      const currentNetwork = await WifiManager.getCurrentWifiSSID();
      setConnectedNetwork(currentNetwork);
      Alert.alert('Success', `Connected to ${currentNetwork}`);
    } catch (error) {
      console.error('Connection failed:', error);
      Alert.alert('Error', 'Connection failed. Check password and try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Render a single WiFi network
  const renderNetworkItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.networkItem}
      onPress={() => setSelectedNetwork(item.SSID === selectedNetwork ? null : item.SSID)} // Toggle selected network
    >
      <Text style={styles.networkSSID}>{item.SSID || 'Unknown Network'}</Text>
      <Text style={styles.networkDetails}>BSSID: {item.BSSID}</Text>
      <Text style={styles.networkDetails}>Signal: {item.level} dBm</Text>

      {/* Show password input and connect button only for the selected network */}
      {selectedNetwork === item.SSID && (
        <View>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter password"
            placeholderTextColor="#999"
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Button
            title="Connect"
            onPress={() => connectToNetwork(item.SSID)}
            disabled={isConnecting}
          />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Scan Button */}
      <Button
        title={isScanning ? "Scanning..." : "Scan WiFi Networks"}
        onPress={scanWifiNetworks}
        disabled={isScanning}
      />

      {/* Scanning Indicator */}
      {isScanning && (
        <View style={styles.scanningContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Searching for networks...</Text>
        </View>
      )}

      {/* Network List */}
      <FlatList
        data={networks}
        keyExtractor={(item) => item.BSSID}
        renderItem={renderNetworkItem}
        style={styles.networkList}
      />

      {/* Connected Network Info */}
      {connectedNetwork && (
        <View style={styles.connectedContainer}>
          <Text style={styles.connectedText}>Connected to:</Text>
          <Text style={styles.ssidText}>{connectedNetwork}</Text>
        </View>
      )}

      {/* Connecting Indicator */}
      {isConnecting && (
        <View style={styles.connectingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Connecting...</Text>
        </View>
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
  networkList: {
    marginTop: 20,
  },
  networkItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  networkSSID: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  networkDetails: {
    fontSize: 14,
    color: '#666',
  },
  passwordInput: {
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    color: '#000', // Ensure text color is visible
  },
  connectedContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  connectedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2e7d32',
  },
  ssidText: {
    fontSize: 15,
    color: '#1b5e20',
    marginTop: 4,
  },
  connectingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
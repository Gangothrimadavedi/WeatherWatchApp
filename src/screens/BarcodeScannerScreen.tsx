// src/screens/BarcodeScannerScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Camera } from 'react-native-camera-kit'; // Import the Camera component
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function BarcodeScannerScreen() {
  const [barcode, setBarcode] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  // Save the scanned barcode to history
  const saveBarcode = async (code: string) => {
    setBarcode(code);
    let storedHistory = await AsyncStorage.getItem('barcodeHistory');
    let parsedHistory: string[] = storedHistory ? JSON.parse(storedHistory) : [];
    if (!parsedHistory.includes(code)) {
      parsedHistory.unshift(code); // Add the new barcode to the beginning of the array
      if (parsedHistory.length > 5) {
        parsedHistory.pop(); // Keep only the last 5 barcodes
      }
      await AsyncStorage.setItem('barcodeHistory', JSON.stringify(parsedHistory));
      setHistory(parsedHistory);
    }
  };

  // Load barcode history on component mount
  useEffect(() => {
    AsyncStorage.getItem('barcodeHistory').then((data) => {
      setHistory(data ? JSON.parse(data) : []);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Camera
        scanBarcode={true} // Enable barcode scanning
        onReadCode={(event) => saveBarcode(event.nativeEvent.codeStringValue)} // Handle barcode scan
        style={styles.camera}
      />

      <View style={styles.historyContainer}>
        <Text style={styles.barcodeText}>Scanned Barcode: {barcode}</Text>
        <Text style={styles.historyTitle}>Scan History:</Text>
        <FlatList
          data={history}
          keyExtractor={(item) => item}
          renderItem={({ item }) => <Text style={styles.historyItem}>{item}</Text>}
        />
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  historyContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  barcodeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyItem: {
    fontSize: 14,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
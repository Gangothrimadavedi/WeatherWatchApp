import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OPEN_WEATHER_API_KEY } from '../../config'; // Adjust path as necessary

export default function WeatherScreen() {
  const [zip, setZip] = useState('');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [history, setHistory] = useState<{ zip: string; temp: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch weather data for a given ZIP code
  const fetchWeather = async () => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?zip=${zip},us&appid=${OPEN_WEATHER_API_KEY}&units=metric`
      );
      setWeatherData(res.data);
      setError(null);

      // Save search history in AsyncStorage
      let storedHistory = await AsyncStorage.getItem('weatherHistory');
      let parsedHistory: { zip: string; temp: string }[] = storedHistory ? JSON.parse(storedHistory) : [];
      const newEntry = { zip, temp: `${res.data.list[0].main.temp}°C` };

      // Check if the ZIP code already exists in history
      const existingIndex = parsedHistory.findIndex((entry) => entry.zip === zip);
      if (existingIndex !== -1) {
        parsedHistory.splice(existingIndex, 1); // Remove existing entry
      }

      parsedHistory.unshift(newEntry); // Add new entry to the beginning
      if (parsedHistory.length > 5) {
        parsedHistory.pop(); // Keep only the last 5 searches
      }

      await AsyncStorage.setItem('weatherHistory', JSON.stringify(parsedHistory));
      setHistory(parsedHistory);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Invalid ZIP code or network error. Please try again.');
    }
  };

  // Load search history on component mount
  useEffect(() => {
    AsyncStorage.getItem('weatherHistory').then((data) => {
      if (data) {
        setHistory(JSON.parse(data));
      }
    });
  }, []);

  // Render a single day's forecast
  const renderForecastItem = (item: any) => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    return (
      <View key={item.dt} style={styles.forecastItem}>
        <Text style={styles.forecastDate}>{date}</Text>
        <Text>Temperature: {item.main.temp}°C</Text>
        <Text>Condition: {item.weather[0].description}</Text>
      </View>
    );
  };

  // Render a single history entry
  const renderHistoryItem = ({ item }: { item: { zip: string; temp: string } }) => (
    <View style={styles.historyItem}>
      <Text>ZIP: {item.zip}</Text>
      <Text>Temperature: {item.temp}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Input field for ZIP code */}
      <TextInput
        placeholder="Enter ZIP Code"
        value={zip}
        onChangeText={setZip}
        style={styles.input}
        keyboardType="numeric"
      />

      {/* Button to fetch weather */}
      <Button title="Get Weather" onPress={fetchWeather} />

      {/* Display error message */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Display current weather */}
      {weatherData && (
        <View style={styles.currentWeather}>
          <Text style={styles.locationText}>Location: {weatherData.city.name}</Text>
          <Text>Temperature: {weatherData.list[0].main.temp}°C</Text>
          <Text>Condition: {weatherData.list[0].weather[0].description}</Text>
        </View>
      )}

      {/* Display 3-5 day forecast */}
      {weatherData && (
        <ScrollView style={styles.forecastContainer}>
          <Text style={styles.forecastTitle}>3-Day Forecast:</Text>
          {weatherData.list.slice(0, 5).map((item: any) => renderForecastItem(item))}
        </ScrollView>
      )}

      {/* Display search history */}
      <Text style={styles.historyTitle}>Search History:</Text>
      <View style={styles.historyContainer}>
        <FlatList
          data={history}
          keyExtractor={(item) => item.zip}
          renderItem={renderHistoryItem}
          style={styles.historyList}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  currentWeather: {
    marginBottom: 20,
  },
  locationText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  forecastContainer: {
    marginBottom: 20,
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  forecastItem: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  forecastDate: {
    fontWeight: 'bold',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyContainer: {
    height: 150, // Fixed height for the history list
  },
  historyList: {
    flex: 1,
  },
  historyItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 5,
  },
});
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OPEN_WEATHER_API_KEY } from '../../config'; // I thought of importing API key from config file because it's secret

export default function WeatherScreen() {
  const [zip, setZip] = useState(''); // I thought of using state for ZIP code because user will type it
  const [weatherData, setWeatherData] = useState<any>(null); // I thought of using state for weather data because API will give it
  const [history, setHistory] = useState<{ zip: string; temp: string }[]>([]); // I thought of using state for history because I want to save searches
  const [error, setError] = useState<string | null>(null); // I thought of using state for error because API might fail

  /** 
   * I thought of making a function to fetch weather data because I need to call API
   * and get weather info for the ZIP code user typed
   */
  const fetchWeather = async () => {
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?zip=${zip},us&appid=${OPEN_WEATHER_API_KEY}&units=metric`
      );
      setWeatherData(res.data); // I set weather data here because API gave me the data
      setError(null); // I clear error here because API worked

      /** 
       * I thought of saving search history in AsyncStorage because I want to keep it even if app closes
       * I get old history first, then add new entry, and make sure only last 5 searches are saved
       */
      let storedHistory = await AsyncStorage.getItem('weatherHistory');
      let parsedHistory: { zip: string; temp: string }[] = storedHistory ? JSON.parse(storedHistory) : [];
      const newEntry = { zip, temp: `${res.data.list[0].main.temp}°C` }; // I make new entry with ZIP and temperature

      // I check if ZIP already exists in history because I don't want duplicates
      const existingIndex = parsedHistory.findIndex((entry) => entry.zip === zip);
      if (existingIndex !== -1) {
        parsedHistory.splice(existingIndex, 1); // I remove old entry if it exists
      }

      parsedHistory.unshift(newEntry); // I add new entry to the beginning of history
      if (parsedHistory.length > 5) {
        parsedHistory.pop(); // I keep only last 5 searches because too many is not good
      }

      await AsyncStorage.setItem('weatherHistory', JSON.stringify(parsedHistory)); // I save updated history
      setHistory(parsedHistory); // I update history state to show new entry
    } catch (error) {
      console.error('Error fetching weather data:', error); // I log error because something went wrong
      setError('Invalid ZIP code or network error. Please try again.'); // I show error message to user
    }
  };

  /** 
   * I thought of loading search history when screen loads because I want to show old searches
   * I use useEffect because it runs when component mounts
   */
  useEffect(() => {
    AsyncStorage.getItem('weatherHistory').then((data) => {
      if (data) {
        setHistory(JSON.parse(data)); // I set history state with saved data
      }
    });
  }, []);

  /** 
   * I thought of making a function to render forecast item because I need to show weather for each day
   * I get date, temperature, and condition from API data and show it in a nice way
   */
  const renderForecastItem = (item: any) => {
    const date = new Date(item.dt * 1000).toLocaleDateString(); // I convert timestamp to readable date
    return (
      <View key={item.dt} style={styles.forecastItem}>
        <Text style={styles.forecastDate}>{date}</Text>
        <Text>Temperature: {item.main.temp}°C</Text>
        <Text>Condition: {item.weather[0].description}</Text>
      </View>
    );
  };

  /** 
   * I thought of making a function to render history item because I need to show old searches
   * I show ZIP code and temperature for each history entry
   */
  const renderHistoryItem = ({ item }: { item: { zip: string; temp: string } }) => (
    <View style={styles.historyItem}>
      <Text>ZIP: {item.zip}</Text>
      <Text>Temperature: {item.temp}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* I thought of adding an input field for ZIP code because user needs to type it */}
      <TextInput
        placeholder="Enter ZIP Code"
        value={zip}
        onChangeText={setZip}
        style={styles.input}
        keyboardType="numeric"
      />

      {/* I thought of adding a button to fetch weather because user needs to trigger API call */}
      <Button title="Get Weather" onPress={fetchWeather} />

      {/* I thought of showing error message if something goes wrong */}
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* I thought of showing current weather if API gives data */}
      {weatherData && (
        <View style={styles.currentWeather}>
          <Text style={styles.locationText}>Location: {weatherData.city.name}</Text>
          <Text>Temperature: {weatherData.list[0].main.temp}°C</Text>
          <Text>Condition: {weatherData.list[0].weather[0].description}</Text>
        </View>
      )}

      {/* I thought of showing 3-5 day forecast if API gives data */}
      {weatherData && (
        <ScrollView style={styles.forecastContainer}>
          <Text style={styles.forecastTitle}>3-Day Forecast:</Text>
          {weatherData.list.slice(0, 5).map((item: any) => renderForecastItem(item))}
        </ScrollView>
      )}

      {/* I thought of showing search history because user might want to see old searches */}
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

/** 
 * I thought of making styles because I want the app to look nice
 * I use StyleSheet to organize all styles in one place
 */
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
    height: 150, // I set fixed height for history list because too much scrolling is bad
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
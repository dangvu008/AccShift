import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import weatherService from '../services/weatherService';
import * as Location from 'expo-location';

const WeatherDebugScreen = ({ navigation }) => {
  const {
    t,
    darkMode,
    theme,
    homeLocation,
    workLocation,
    locationPermissionGranted,
    requestLocationPermission,
  } = useContext(AppContext);

  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    setLoading(true);
    const info = {
      homeLocation: homeLocation || null,
      workLocation: workLocation || null,
      locationPermissionGranted,
      timestamp: new Date().toISOString(),
    };

    // Kiểm tra quyền vị trí chi tiết
    try {
      const permission = await Location.getForegroundPermissionsAsync();
      info.detailedPermission = permission;
    } catch (error) {
      info.permissionError = error.message;
    }

    // Kiểm tra API keys
    try {
      const apiKeys = await weatherService.getApiKeys();
      info.apiKeysCount = apiKeys ? apiKeys.length : 0;
      info.hasApiKeys = apiKeys && apiKeys.length > 0;
    } catch (error) {
      info.apiKeysError = error.message;
    }

    setDebugInfo(info);
    setLoading(false);
  };

  const testWeatherAPI = async () => {
    setLoading(true);
    const results = [];

    try {
      // Test 1: API với vị trí mặc định
      results.push({ test: 'API Default Location', status: 'testing' });
      setTestResults([...results]);

      const defaultWeather = await weatherService.getCurrentWeather();
      if (defaultWeather) {
        results[results.length - 1] = {
          test: 'API Default Location',
          status: 'success',
          data: `${defaultWeather.name}: ${Math.round(defaultWeather.main.temp)}°C`,
        };
      } else {
        results[results.length - 1] = {
          test: 'API Default Location',
          status: 'failed',
          error: 'No data returned',
        };
      }
      setTestResults([...results]);

      // Test 2: API với vị trí nhà (nếu có)
      if (homeLocation) {
        results.push({ test: 'API Home Location', status: 'testing' });
        setTestResults([...results]);

        const homeWeather = await weatherService.getCurrentWeather(
          homeLocation.latitude,
          homeLocation.longitude
        );
        if (homeWeather) {
          results[results.length - 1] = {
            test: 'API Home Location',
            status: 'success',
            data: `${homeWeather.name}: ${Math.round(homeWeather.main.temp)}°C`,
          };
        } else {
          results[results.length - 1] = {
            test: 'API Home Location',
            status: 'failed',
            error: 'No data returned',
          };
        }
        setTestResults([...results]);
      }

      // Test 3: Clear cache và thử lại
      results.push({ test: 'Clear Cache & Retry', status: 'testing' });
      setTestResults([...results]);

      await weatherService.clearWeatherCache();
      const retryWeather = await weatherService.getCurrentWeather();
      if (retryWeather) {
        results[results.length - 1] = {
          test: 'Clear Cache & Retry',
          status: 'success',
          data: `Cache cleared, got fresh data`,
        };
      } else {
        results[results.length - 1] = {
          test: 'Clear Cache & Retry',
          status: 'failed',
          error: 'Still no data after cache clear',
        };
      }
      setTestResults([...results]);

    } catch (error) {
      results.push({
        test: 'Weather API Test',
        status: 'failed',
        error: error.message,
      });
      setTestResults([...results]);
    }

    setLoading(false);
  };

  const requestLocation = async () => {
    try {
      const granted = await requestLocationPermission();
      if (granted) {
        Alert.alert(t('Success'), t('Location permission granted'));
        loadDebugInfo();
      } else {
        Alert.alert(t('Error'), t('Location permission denied'));
      }
    } catch (error) {
      Alert.alert(t('Error'), error.message);
    }
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <Ionicons name="checkmark-circle" size={20} color="#27ae60" />;
      case 'failed':
        return <Ionicons name="close-circle" size={20} color="#e74c3c" />;
      case 'testing':
        return <ActivityIndicator size="small" color={theme.primaryColor} />;
      default:
        return <Ionicons name="help-circle" size={20} color="#f39c12" />;
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundColor, padding: 16 }}
    >
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.textColor, marginBottom: 16 }}>
          🔍 Weather Debug
        </Text>

        {/* Debug Info */}
        <View style={{ backgroundColor: theme.cardColor, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textColor, marginBottom: 12 }}>
            📊 System Status
          </Text>
          
          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: theme.textColor }}>
              🏠 Home Location: {debugInfo.homeLocation ? '✅ Set' : '❌ Not set'}
            </Text>
            {debugInfo.homeLocation && (
              <Text style={{ color: theme.subtextColor, fontSize: 12, marginLeft: 16 }}>
                {debugInfo.homeLocation.address || `${debugInfo.homeLocation.latitude}, ${debugInfo.homeLocation.longitude}`}
              </Text>
            )}
          </View>

          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: theme.textColor }}>
              🏢 Work Location: {debugInfo.workLocation ? '✅ Set' : '❌ Not set'}
            </Text>
            {debugInfo.workLocation && (
              <Text style={{ color: theme.subtextColor, fontSize: 12, marginLeft: 16 }}>
                {debugInfo.workLocation.address || `${debugInfo.workLocation.latitude}, ${debugInfo.workLocation.longitude}`}
              </Text>
            )}
          </View>

          <Text style={{ color: theme.textColor, marginBottom: 8 }}>
            🔐 Location Permission: {debugInfo.locationPermissionGranted ? '✅ Granted' : '❌ Denied'}
          </Text>

          <Text style={{ color: theme.textColor, marginBottom: 8 }}>
            🔑 API Keys: {debugInfo.hasApiKeys ? `✅ ${debugInfo.apiKeysCount} available` : '❌ No keys'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ marginBottom: 16 }}>
          <TouchableOpacity
            style={{
              backgroundColor: theme.primaryColor,
              padding: 12,
              borderRadius: 8,
              marginBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={loadDebugInfo}
            disabled={loading}
          >
            <Ionicons name="refresh" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Refresh Status</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: '#27ae60',
              padding: 12,
              borderRadius: 8,
              marginBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={testWeatherAPI}
            disabled={loading}
          >
            <Ionicons name="cloud" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Test Weather API</Text>
          </TouchableOpacity>

          {!debugInfo.locationPermissionGranted && (
            <TouchableOpacity
              style={{
                backgroundColor: '#f39c12',
                padding: 12,
                borderRadius: 8,
                marginBottom: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={requestLocation}
              disabled={loading}
            >
              <Ionicons name="location" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Request Location Permission</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Test Results */}
        {testResults.length > 0 && (
          <View style={{ backgroundColor: theme.cardColor, borderRadius: 12, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.textColor, marginBottom: 12 }}>
              🧪 Test Results
            </Text>
            {testResults.map((result, index) => (
              <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                {renderStatusIcon(result.status)}
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Text style={{ color: theme.textColor, fontWeight: '500' }}>{result.test}</Text>
                  {result.data && (
                    <Text style={{ color: theme.subtextColor, fontSize: 12 }}>{result.data}</Text>
                  )}
                  {result.error && (
                    <Text style={{ color: '#e74c3c', fontSize: 12 }}>{result.error}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default WeatherDebugScreen;

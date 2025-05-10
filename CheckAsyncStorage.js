import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './config/appConfig';

const CheckAsyncStorage = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAsyncStorage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy tất cả các key trong AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      console.log(`Tìm thấy ${keys.length} key trong AsyncStorage`);
      
      // Lọc các key liên quan đến thống kê
      const dailyWorkStatusKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX));
      const attendanceLogKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.ATTENDANCE_LOGS_PREFIX));
      
      // Lấy mẫu dữ liệu từ dailyWorkStatus
      let dailyWorkStatusSample = null;
      if (dailyWorkStatusKeys.length > 0) {
        const sampleKey = dailyWorkStatusKeys[0];
        const sampleData = await AsyncStorage.getItem(sampleKey);
        if (sampleData) {
          dailyWorkStatusSample = {
            key: sampleKey,
            data: JSON.parse(sampleData)
          };
        }
      }
      
      // Lấy mẫu dữ liệu từ attendanceLogs
      let attendanceLogSample = null;
      if (attendanceLogKeys.length > 0) {
        const sampleKey = attendanceLogKeys[0];
        const sampleData = await AsyncStorage.getItem(sampleKey);
        if (sampleData) {
          attendanceLogSample = {
            key: sampleKey,
            data: JSON.parse(sampleData)
          };
        }
      }
      
      // Kiểm tra xem có dữ liệu thống kê theo giờ không
      const hourlyStatsKeys = keys.filter(key => 
        key.includes('hourly') || 
        key.includes('hour') || 
        key.includes('statistics') || 
        key.includes('stats')
      );
      
      // Lấy mẫu dữ liệu từ hourlyStats nếu có
      let hourlyStatsSample = null;
      if (hourlyStatsKeys.length > 0) {
        const sampleKey = hourlyStatsKeys[0];
        const sampleData = await AsyncStorage.getItem(sampleKey);
        if (sampleData) {
          hourlyStatsSample = {
            key: sampleKey,
            data: JSON.parse(sampleData)
          };
        }
      }
      
      // Kiểm tra cấu trúc dữ liệu trong dailyWorkStatus
      let hasHourlyData = false;
      if (dailyWorkStatusSample) {
        const data = dailyWorkStatusSample.data;
        
        // Kiểm tra các trường liên quan đến giờ
        hasHourlyData = !!(
          data.standardHours !== undefined ||
          data.otHours !== undefined ||
          data.sundayHours !== undefined ||
          data.nightHours !== undefined ||
          data.standardDayHours !== undefined ||
          data.standardNightHours !== undefined ||
          data.otWeekdayDayHours !== undefined ||
          data.otWeekdayNightHours !== undefined ||
          data.otSaturdayDayHours !== undefined ||
          data.otSaturdayNightHours !== undefined ||
          data.otSundayDayHours !== undefined ||
          data.otSundayNightHours !== undefined ||
          data.otHolidayDayHours !== undefined ||
          data.otHolidayNightHours !== undefined
        );
      }
      
      setResults({
        totalKeys: keys.length,
        dailyWorkStatusKeys: dailyWorkStatusKeys.length,
        attendanceLogKeys: attendanceLogKeys.length,
        hourlyStatsKeys: hourlyStatsKeys.length,
        dailyWorkStatusSample,
        attendanceLogSample,
        hourlyStatsSample,
        hasHourlyData
      });
    } catch (err) {
      console.error('Lỗi khi kiểm tra AsyncStorage:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAsyncStorage();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kiểm tra dữ liệu trong AsyncStorage</Text>
      
      {loading ? (
        <Text style={styles.loading}>Đang tải dữ liệu...</Text>
      ) : error ? (
        <View>
          <Text style={styles.error}>Lỗi: {error}</Text>
          <TouchableOpacity style={styles.button} onPress={checkAsyncStorage}>
            <Text style={styles.buttonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : results ? (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultText}>Tổng số key: {results.totalKeys}</Text>
          <Text style={styles.resultText}>Số key dailyWorkStatus: {results.dailyWorkStatusKeys}</Text>
          <Text style={styles.resultText}>Số key attendanceLogs: {results.attendanceLogKeys}</Text>
          <Text style={styles.resultText}>Số key liên quan đến thống kê theo giờ: {results.hourlyStatsKeys}</Text>
          <Text style={styles.resultText}>Có dữ liệu thống kê theo giờ trong dailyWorkStatus: {results.hasHourlyData ? 'Có' : 'Không'}</Text>
          
          {results.dailyWorkStatusSample && (
            <View style={styles.sampleContainer}>
              <Text style={styles.sectionTitle}>Mẫu dữ liệu dailyWorkStatus:</Text>
              <Text style={styles.sampleKey}>{results.dailyWorkStatusSample.key}</Text>
              <Text style={styles.sampleData}>{JSON.stringify(results.dailyWorkStatusSample.data, null, 2)}</Text>
            </View>
          )}
          
          {results.attendanceLogSample && (
            <View style={styles.sampleContainer}>
              <Text style={styles.sectionTitle}>Mẫu dữ liệu attendanceLogs:</Text>
              <Text style={styles.sampleKey}>{results.attendanceLogSample.key}</Text>
              <Text style={styles.sampleData}>{JSON.stringify(results.attendanceLogSample.data, null, 2)}</Text>
            </View>
          )}
          
          {results.hourlyStatsSample && (
            <View style={styles.sampleContainer}>
              <Text style={styles.sectionTitle}>Mẫu dữ liệu thống kê theo giờ:</Text>
              <Text style={styles.sampleKey}>{results.hourlyStatsSample.key}</Text>
              <Text style={styles.sampleData}>{JSON.stringify(results.hourlyStatsSample.data, null, 2)}</Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.button} onPress={checkAsyncStorage}>
            <Text style={styles.buttonText}>Làm mới</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <Text style={styles.noData}>Không có dữ liệu</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  loading: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  error: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  resultsContainer: {
    flex: 1,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  sampleContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  sampleKey: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#666',
  },
  sampleData: {
    fontSize: 12,
    fontFamily: 'monospace',
  },
  noData: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#8a56ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CheckAsyncStorage;

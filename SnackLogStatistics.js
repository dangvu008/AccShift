import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Định nghĩa các key lưu trữ
const STORAGE_KEYS = {
  ATTENDANCE_LOGS_PREFIX: 'attendanceLogs_',
  NOTIFICATION_LOGS_PREFIX: 'notificationLogs_',
  DAILY_WORK_STATUS_PREFIX: 'dailyWorkStatus_',
  SHIFT_LIST: 'shifts',
  NOTES: 'notes',
  CURRENT_SHIFT_ID: 'currentShiftId',
  WEATHER_CACHE_PREFIX: 'weather_cache_',
  WEATHER_API_KEYS: 'weatherApiKeys',
  WEATHER_API_STATE: 'weatherApiState',
  WEATHER_ALERTS: 'weatherAlerts',
  DEVICE_ID: 'device_id',
  USER_SETTINGS: 'userSettings',
  ACTIVE_SHIFT_ID: 'activeShiftId',
  IS_WORKING: 'isWorking',
  WORK_START_TIME: 'workStartTime',
  LAST_AUTO_RESET_TIME: 'lastAutoResetTime',
};

// Hàm định dạng ngày
const formatDate = (date) => {
  if (!date) return '';
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

const SnackLogStatistics = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkStatisticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('===== BẮT ĐẦU KIỂM TRA DỮ LIỆU THỐNG KÊ =====');
      
      // Lấy tất cả các key trong AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      console.log(`Tìm thấy ${keys.length} key trong AsyncStorage`);
      
      // Lọc các key liên quan đến thống kê
      const dailyWorkStatusKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX));
      console.log(`Tìm thấy ${dailyWorkStatusKeys.length} key dailyWorkStatus`);
      
      // Lấy dữ liệu từ 5 key dailyWorkStatus đầu tiên
      const sampleKeys = dailyWorkStatusKeys.slice(0, 5);
      const sampleData = [];
      
      for (const key of sampleKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);
            console.log(`\nDữ liệu từ key ${key}:`);
            console.log(JSON.stringify(parsedData, null, 2));
            
            // Kiểm tra các trường liên quan đến giờ
            console.log('\nCác trường liên quan đến giờ:');
            console.log(`- standardHours: ${parsedData.standardHours}`);
            console.log(`- standardHoursScheduled: ${parsedData.standardHoursScheduled}`);
            console.log(`- otHours: ${parsedData.otHours}`);
            console.log(`- otHoursScheduled: ${parsedData.otHoursScheduled}`);
            console.log(`- sundayHours: ${parsedData.sundayHours}`);
            console.log(`- sundayHoursScheduled: ${parsedData.sundayHoursScheduled}`);
            console.log(`- nightHours: ${parsedData.nightHours}`);
            console.log(`- nightHoursScheduled: ${parsedData.nightHoursScheduled}`);
            console.log(`- standardDayHours: ${parsedData.standardDayHours}`);
            console.log(`- standardNightHours: ${parsedData.standardNightHours}`);
            console.log(`- otWeekdayDayHours: ${parsedData.otWeekdayDayHours}`);
            console.log(`- otWeekdayNightHours: ${parsedData.otWeekdayNightHours}`);
            console.log(`- otSaturdayDayHours: ${parsedData.otSaturdayDayHours}`);
            console.log(`- otSaturdayNightHours: ${parsedData.otSaturdayNightHours}`);
            console.log(`- otSundayDayHours: ${parsedData.otSundayDayHours}`);
            console.log(`- otSundayNightHours: ${parsedData.otSundayNightHours}`);
            
            sampleData.push({
              key,
              data: parsedData
            });
          }
        } catch (err) {
          console.error(`Lỗi khi xử lý key ${key}:`, err);
        }
      }
      
      // Kiểm tra cách StatisticsScreen lấy dữ liệu
      console.log('\n===== CÁCH STATISTICSSCREEN LẤY DỮ LIỆU =====');
      console.log('1. StatisticsScreen gọi hàm loadStatistics() khi component được mount');
      console.log('2. loadStatistics() gọi hàm loadDailyWorkStatuses() để lấy dữ liệu từ AsyncStorage');
      console.log('3. loadDailyWorkStatuses() lấy các key bắt đầu bằng DAILY_WORK_STATUS_PREFIX');
      console.log('4. Dữ liệu được lấy theo batch để tránh quá tải');
      console.log('5. Sau khi lấy dữ liệu, calculateStatistics() được gọi để tính toán thống kê');
      console.log('6. Trong calculateStatistics(), các trường standardHoursScheduled, otHoursScheduled, sundayHoursScheduled, nightHoursScheduled được sử dụng');
      console.log('7. Nếu trạng thái là DU_CONG nhưng không có giá trị giờ làm, giá trị mặc định 8.0 giờ được sử dụng');
      
      setResults({
        totalKeys: keys.length,
        dailyWorkStatusKeys: dailyWorkStatusKeys.length,
        sampleData
      });
      
      console.log('\n===== KẾT THÚC KIỂM TRA DỮ LIỆU THỐNG KÊ =====');
    } catch (err) {
      console.error('Lỗi khi kiểm tra dữ liệu thống kê:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatisticsData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Kiểm tra dữ liệu thống kê theo giờ</Text>
      
      {loading ? (
        <Text style={styles.loading}>Đang tải dữ liệu...</Text>
      ) : error ? (
        <View>
          <Text style={styles.error}>Lỗi: {error}</Text>
          <TouchableOpacity style={styles.button} onPress={checkStatisticsData}>
            <Text style={styles.buttonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : results ? (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultText}>Tổng số key: {results.totalKeys}</Text>
          <Text style={styles.resultText}>Số key dailyWorkStatus: {results.dailyWorkStatusKeys}</Text>
          
          <Text style={styles.sectionTitle}>Dữ liệu mẫu:</Text>
          {results.sampleData.length > 0 ? (
            results.sampleData.map((item, index) => (
              <View key={index} style={styles.sampleContainer}>
                <Text style={styles.sampleKey}>{item.key}</Text>
                <Text style={styles.sampleData}>
                  {JSON.stringify(item.data, null, 2)}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noData}>Không tìm thấy dữ liệu mẫu</Text>
          )}
          
          <TouchableOpacity style={styles.button} onPress={checkStatisticsData}>
            <Text style={styles.buttonText}>Làm mới</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <Text style={styles.noData}>Không có dữ liệu</Text>
      )}
    </SafeAreaView>
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
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  sampleContainer: {
    marginTop: 10,
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

export default SnackLogStatistics;

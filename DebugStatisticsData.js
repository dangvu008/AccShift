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

const DebugStatisticsData = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugLog, setDebugLog] = useState([]);

  const addToLog = (message) => {
    console.log(message);
    setDebugLog(prevLog => [...prevLog, message]);
  };

  const checkStatisticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugLog([]);
      
      addToLog('===== BẮT ĐẦU KIỂM TRA DỮ LIỆU THỐNG KÊ =====');
      
      // Lấy tất cả các key trong AsyncStorage
      const keys = await AsyncStorage.getAllKeys();
      addToLog(`Tìm thấy ${keys.length} key trong AsyncStorage`);
      
      // Lọc các key liên quan đến thống kê
      const dailyWorkStatusKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX));
      addToLog(`Tìm thấy ${dailyWorkStatusKeys.length} key dailyWorkStatus`);
      
      // Kiểm tra dữ liệu từ 5 key dailyWorkStatus đầu tiên
      const sampleKeys = dailyWorkStatusKeys.slice(0, 5);
      const sampleData = [];
      
      for (const key of sampleKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);
            addToLog(`\nDữ liệu từ key ${key}:`);
            addToLog(JSON.stringify(parsedData, null, 2));
            
            // Kiểm tra các trường liên quan đến giờ
            addToLog('\nCác trường liên quan đến giờ:');
            addToLog(`- standardHours: ${parsedData.standardHours}`);
            addToLog(`- standardHoursScheduled: ${parsedData.standardHoursScheduled}`);
            addToLog(`- otHours: ${parsedData.otHours}`);
            addToLog(`- otHoursScheduled: ${parsedData.otHoursScheduled}`);
            addToLog(`- sundayHours: ${parsedData.sundayHours}`);
            addToLog(`- sundayHoursScheduled: ${parsedData.sundayHoursScheduled}`);
            addToLog(`- nightHours: ${parsedData.nightHours}`);
            addToLog(`- nightHoursScheduled: ${parsedData.nightHoursScheduled}`);
            addToLog(`- status: ${parsedData.status}`);
            
            sampleData.push({
              key,
              data: parsedData
            });
          }
        } catch (err) {
          addToLog(`Lỗi khi xử lý key ${key}: ${err.message}`);
        }
      }
      
      // Kiểm tra cách StatisticsScreen lấy dữ liệu
      addToLog('\n===== CÁCH STATISTICSSCREEN LẤY DỮ LIỆU =====');
      addToLog('1. StatisticsScreen gọi hàm loadStatistics() khi component được mount');
      addToLog('2. loadStatistics() gọi hàm loadDailyWorkStatuses() để lấy dữ liệu từ AsyncStorage');
      addToLog('3. loadDailyWorkStatuses() lấy các key bắt đầu bằng DAILY_WORK_STATUS_PREFIX');
      addToLog('4. Dữ liệu được lấy theo batch để tránh quá tải');
      addToLog('5. Sau khi lấy dữ liệu, calculateStatistics() được gọi để tính toán thống kê');
      addToLog('6. Trong calculateStatistics(), các trường standardHoursScheduled, otHoursScheduled, sundayHoursScheduled, nightHoursScheduled được sử dụng');
      addToLog('7. Nếu trạng thái là DU_CONG nhưng không có giá trị giờ làm, giá trị mặc định 8.0 giờ được sử dụng');
      
      // Kiểm tra vấn đề với dữ liệu
      addToLog('\n===== KIỂM TRA VẤN ĐỀ VỚI DỮ LIỆU =====');
      
      let hasMissingScheduledHours = false;
      let hasDuCongWithZeroHours = false;
      
      for (const item of sampleData) {
        const data = item.data;
        
        // Kiểm tra các trường *HoursScheduled
        if (data.status === 'DU_CONG') {
          if (!data.standardHoursScheduled || parseFloat(data.standardHoursScheduled) === 0) {
            hasDuCongWithZeroHours = true;
            addToLog(`Phát hiện ngày ${item.key} có trạng thái DU_CONG nhưng standardHoursScheduled = ${data.standardHoursScheduled}`);
          }
        }
        
        // Kiểm tra sự khác biệt giữa các trường *Hours và *HoursScheduled
        if (data.standardHours !== data.standardHoursScheduled) {
          addToLog(`Ngày ${item.key} có standardHours (${data.standardHours}) khác với standardHoursScheduled (${data.standardHoursScheduled})`);
        }
        
        if (data.otHours !== data.otHoursScheduled) {
          addToLog(`Ngày ${item.key} có otHours (${data.otHours}) khác với otHoursScheduled (${data.otHoursScheduled})`);
        }
      }
      
      addToLog('\n===== KẾT LUẬN =====');
      if (hasDuCongWithZeroHours) {
        addToLog('Có ngày với trạng thái DU_CONG nhưng giá trị standardHoursScheduled = 0');
        addToLog('StatisticsScreen sẽ hiển thị giá trị mặc định 8.0 giờ cho những ngày này');
        addToLog('Tuy nhiên, dữ liệu thực tế trong AsyncStorage vẫn là 0, dẫn đến sự không nhất quán');
      } else {
        addToLog('Không phát hiện vấn đề với dữ liệu DU_CONG');
      }
      
      setResults({
        totalKeys: keys.length,
        dailyWorkStatusKeys: dailyWorkStatusKeys.length,
        sampleData,
        hasDuCongWithZeroHours
      });
      
      addToLog('\n===== KẾT THÚC KIỂM TRA DỮ LIỆU THỐNG KÊ =====');
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
      <Text style={styles.title}>Debug Dữ liệu thống kê</Text>
      
      {loading ? (
        <Text style={styles.loading}>Đang tải dữ liệu...</Text>
      ) : error ? (
        <View>
          <Text style={styles.error}>Lỗi: {error}</Text>
          <TouchableOpacity style={styles.button} onPress={checkStatisticsData}>
            <Text style={styles.buttonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.resultsContainer}>
          <TouchableOpacity style={styles.button} onPress={checkStatisticsData}>
            <Text style={styles.buttonText}>Làm mới</Text>
          </TouchableOpacity>
          
          <View style={styles.logContainer}>
            {debugLog.map((log, index) => (
              <Text key={index} style={styles.logText}>
                {log}
              </Text>
            ))}
          </View>
        </ScrollView>
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
  logContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  logText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#fff',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#8a56ff',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DebugStatisticsData;

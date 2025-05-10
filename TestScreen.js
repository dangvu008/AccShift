import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import checkAllKeys from './checkHourlyStats';

const TestScreen = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTest = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await checkAllKeys();
      setResults(data);
    } catch (err) {
      setError(err.message);
      console.error('Lỗi khi chạy kiểm tra:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTest();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kiểm tra dữ liệu thống kê theo giờ</Text>
      
      {loading ? (
        <Text style={styles.loading}>Đang tải dữ liệu...</Text>
      ) : error ? (
        <View>
          <Text style={styles.error}>Lỗi: {error}</Text>
          <TouchableOpacity style={styles.button} onPress={runTest}>
            <Text style={styles.buttonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : results ? (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.resultText}>Tổng số key: {results.totalKeys}</Text>
          
          <Text style={styles.sectionTitle}>Các key liên quan đến thống kê theo giờ ({results.hourlyStatsKeys.length}):</Text>
          {results.hourlyStatsKeys.length > 0 ? (
            results.hourlyStatsKeys.map((key, index) => (
              <Text key={index} style={styles.keyItem}>{key}</Text>
            ))
          ) : (
            <Text style={styles.noData}>Không tìm thấy key nào liên quan đến thống kê theo giờ</Text>
          )}
          
          <Text style={styles.sectionTitle}>Các key dailyWorkStatus ({results.dailyWorkStatusKeys.length}):</Text>
          {results.dailyWorkStatusKeys.length > 0 ? (
            results.dailyWorkStatusKeys.slice(0, 5).map((key, index) => (
              <Text key={index} style={styles.keyItem}>{key}</Text>
            ))
          ) : (
            <Text style={styles.noData}>Không tìm thấy key dailyWorkStatus nào</Text>
          )}
          
          <Text style={styles.sectionTitle}>Các key attendanceLogs ({results.attendanceLogKeys.length}):</Text>
          {results.attendanceLogKeys.length > 0 ? (
            results.attendanceLogKeys.slice(0, 5).map((key, index) => (
              <Text key={index} style={styles.keyItem}>{key}</Text>
            ))
          ) : (
            <Text style={styles.noData}>Không tìm thấy key attendanceLogs nào</Text>
          )}
          
          <TouchableOpacity style={styles.button} onPress={runTest}>
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  keyItem: {
    fontSize: 14,
    marginBottom: 4,
    paddingLeft: 8,
  },
  noData: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    marginLeft: 8,
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

export default TestScreen;

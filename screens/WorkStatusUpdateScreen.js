'use client'

import React, { useState, useContext, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import { WORK_STATUS } from '../config/appConfig'
import ManualUpdateModal from '../components/ManualUpdateModal'
import DebugModal from '../components/DebugModal'

const WorkStatusUpdateScreen = ({ navigation }) => {
  const { t, darkMode } = useContext(AppContext)

  // State
  const [modalVisible, setModalVisible] = useState(false)
  const [debugModalVisible, setDebugModalVisible] = useState(false)
  const [selectedTestDay, setSelectedTestDay] = useState(null)
  const [testResults, setTestResults] = useState([])

  // Tạo dữ liệu test cho các ngày
  const generateTestDays = () => {
    const days = []
    const today = new Date()

    // Tạo 7 ngày test (3 ngày trước, hôm nay, 3 ngày sau)
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      days.push({
        date: date,
        status: {
          status: i === 0 ? WORK_STATUS.CHUA_CAP_NHAT : WORK_STATUS.NGAY_TUONG_LAI,
          vaoLogTime: '',
          raLogTime: '',
          notes: '',
        },
        isToday: i === 0,
        dayName: date.toLocaleDateString('vi-VN', { weekday: 'short' }),
        dayNumber: date.getDate(),
      })
    }

    return days
  }

  const [testDays, setTestDays] = useState(generateTestDays())

  // Format ngày hiển thị
  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  // Lấy màu cho trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case WORK_STATUS.DU_CONG:
        return '#4CAF50'
      case WORK_STATUS.DI_MUON:
      case WORK_STATUS.VE_SOM:
        return '#FF9800'
      case WORK_STATUS.DI_MUON_VE_SOM:
        return '#FF5722'
      case WORK_STATUS.THIEU_LOG:
        return '#FF9800'
      case WORK_STATUS.NGHI_PHEP:
        return '#2196F3'
      case WORK_STATUS.NGHI_BENH:
        return '#9C27B0'
      case WORK_STATUS.NGHI_LE:
        return '#E91E63'
      case WORK_STATUS.VANG_MAT:
        return '#F44336'
      default:
        return darkMode ? '#666' : '#999'
    }
  }

  // Lấy text cho trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case WORK_STATUS.DU_CONG:
        return t('Đủ công')
      case WORK_STATUS.DI_MUON:
        return t('Đi muộn')
      case WORK_STATUS.VE_SOM:
        return t('Về sớm')
      case WORK_STATUS.DI_MUON_VE_SOM:
        return t('Đi muộn & về sớm')
      case WORK_STATUS.THIEU_LOG:
        return t('Thiếu chấm công')
      case WORK_STATUS.NGHI_PHEP:
        return t('Nghỉ phép')
      case WORK_STATUS.NGHI_BENH:
        return t('Nghỉ bệnh')
      case WORK_STATUS.NGHI_LE:
        return t('Nghỉ lễ')
      case WORK_STATUS.VANG_MAT:
        return t('Vắng không lý do')
      case WORK_STATUS.NGAY_TUONG_LAI:
        return t('Ngày tương lai')
      default:
        return t('Chưa cập nhật')
    }
  }

  // Xử lý khi chọn ngày để cập nhật
  const handleDayPress = (day) => {
    setSelectedTestDay(day)
    setModalVisible(true)
  }

  // Xử lý khi trạng thái được cập nhật
  const handleStatusUpdated = (updatedStatus) => {
    console.log('Trạng thái đã được cập nhật:', updatedStatus)

    // Cập nhật test days
    setTestDays(prevDays =>
      prevDays.map(day => {
        if (day.date.toISOString().split('T')[0] === updatedStatus.date) {
          return {
            ...day,
            status: updatedStatus
          }
        }
        return day
      })
    )

    // Thêm vào kết quả test
    const testResult = {
      id: Date.now(),
      date: updatedStatus.date,
      status: updatedStatus.status,
      vaoLogTime: updatedStatus.vaoLogTime,
      raLogTime: updatedStatus.raLogTime,
      timestamp: new Date().toLocaleString('vi-VN'),
    }

    setTestResults(prev => [testResult, ...prev])

    Alert.alert(
      t('Test thành công'),
      `${t('Đã cập nhật trạng thái')}: ${getStatusText(updatedStatus.status)}`,
      [{ text: t('OK') }]
    )
  }

  // Xóa tất cả kết quả test
  const clearTestResults = () => {
    Alert.alert(
      t('Xác nhận'),
      t('Bạn có muốn xóa tất cả kết quả test?'),
      [
        { text: t('Hủy'), style: 'cancel' },
        {
          text: t('Xóa'),
          style: 'destructive',
          onPress: () => {
            setTestResults([])
            setTestDays(generateTestDays())
          }
        }
      ]
    )
  }

  return (
    <SafeAreaView style={[
      styles.container,
      darkMode && styles.darkContainer
    ]}>
      {/* Header */}
      <View style={[styles.header, darkMode && styles.darkHeader]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={darkMode ? '#fff' : '#000'}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, darkMode && styles.darkText]}>
          {t('Test Cập Nhật Trạng Thái')}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={[styles.clearButton, { marginRight: 10 }]}
            onPress={() => setDebugModalVisible(true)}
          >
            <Ionicons
              name="bug"
              size={24}
              color={darkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearTestResults}
          >
            <Ionicons
              name="trash"
              size={24}
              color={darkMode ? '#fff' : '#000'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hướng dẫn */}
        <View style={[styles.instructionCard, darkMode && styles.darkCard]}>
          <Text style={[styles.instructionTitle, darkMode && styles.darkText]}>
            {t('Hướng dẫn test')}
          </Text>
          <Text style={[styles.instructionText, darkMode && styles.darkText]}>
            • {t('Chọn một ngày bất kỳ để mở form cập nhật trạng thái')}
          </Text>
          <Text style={[styles.instructionText, darkMode && styles.darkText]}>
            • {t('Chọn trạng thái và nhập thời gian (nếu cần)')}
          </Text>
          <Text style={[styles.instructionText, darkMode && styles.darkText]}>
            • {t('Kiểm tra xem form có hiển thị đúng trên thiết bị không')}
          </Text>
          <Text style={[styles.instructionText, darkMode && styles.darkText]}>
            • {t('Kết quả test sẽ hiển thị bên dưới')}
          </Text>
        </View>

        {/* Danh sách ngày test */}
        <View style={[styles.testDaysCard, darkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>
            {t('Chọn ngày để test')}
          </Text>

          {testDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayItem,
                darkMode && styles.darkDayItem,
                day.isToday && styles.todayItem,
                day.isToday && darkMode && styles.darkTodayItem,
              ]}
              onPress={() => handleDayPress(day)}
            >
              <View style={styles.dayInfo}>
                <Text style={[
                  styles.dayName,
                  darkMode && styles.darkText,
                  day.isToday && styles.todayText
                ]}>
                  {day.dayName}
                </Text>
                <Text style={[
                  styles.dayNumber,
                  darkMode && styles.darkText,
                  day.isToday && styles.todayText
                ]}>
                  {day.dayNumber}
                </Text>
              </View>

              <View style={styles.statusInfo}>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(day.status.status) }
                ]} />
                <Text style={[
                  styles.statusText,
                  darkMode && styles.darkText
                ]}>
                  {getStatusText(day.status.status)}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={darkMode ? '#666' : '#999'}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Kết quả test */}
        {testResults.length > 0 && (
          <View style={[styles.resultsCard, darkMode && styles.darkCard]}>
            <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>
              {t('Kết quả test')} ({testResults.length})
            </Text>

            {testResults.map((result) => (
              <View
                key={result.id}
                style={[styles.resultItem, darkMode && styles.darkResultItem]}
              >
                <View style={styles.resultHeader}>
                  <Text style={[styles.resultDate, darkMode && styles.darkText]}>
                    {new Date(result.date).toLocaleDateString('vi-VN')}
                  </Text>
                  <Text style={[styles.resultTime, darkMode && styles.darkText]}>
                    {result.timestamp}
                  </Text>
                </View>

                <View style={styles.resultContent}>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: getStatusColor(result.status) }
                  ]} />
                  <Text style={[styles.resultStatus, darkMode && styles.darkText]}>
                    {getStatusText(result.status)}
                  </Text>
                </View>

                {(result.vaoLogTime || result.raLogTime) && (
                  <View style={styles.timeInfo}>
                    {result.vaoLogTime && (
                      <Text style={[styles.timeText, darkMode && styles.darkText]}>
                        {t('Vào')}: {result.vaoLogTime}
                      </Text>
                    )}
                    {result.raLogTime && (
                      <Text style={[styles.timeText, darkMode && styles.darkText]}>
                        {t('Ra')}: {result.raLogTime}
                      </Text>
                    )}
                  </View>
                )}


              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal cập nhật trạng thái */}
      <ManualUpdateModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedDay={selectedTestDay}
        onStatusUpdated={handleStatusUpdated}
      />

      {/* Debug Modal */}
      <DebugModal
        visible={debugModalVisible}
        onClose={() => setDebugModalVisible(false)}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  darkHeader: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    padding: 8,
  },
  darkText: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  darkCard: {
    backgroundColor: '#1e1e1e',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  testDaysCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  darkDayItem: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  todayItem: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  darkTodayItem: {
    backgroundColor: '#1a237e',
    borderColor: '#3f51b5',
  },
  dayInfo: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  todayText: {
    color: '#2196F3',
  },
  statusInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  resultItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  darkResultItem: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  resultTime: {
    fontSize: 12,
    color: '#666',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultStatus: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  timeInfo: {
    flexDirection: 'row',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    marginRight: 16,
  },

})

export default WorkStatusUpdateScreen

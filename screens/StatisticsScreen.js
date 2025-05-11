'use client'

import { useState, useEffect, useContext, useCallback, useRef } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../config/appConfig'

const StatisticsScreen = ({ navigation }) => {
  const { t, darkMode } = useContext(AppContext)
  const [selectedPeriod, setSelectedPeriod] = useState('week') // 'week', 'month', 'year'
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null })
  const [isLoading, setIsLoading] = useState(true)
  const [statisticsData, setStatisticsData] = useState([])
  const [summaryData, setSummaryData] = useState({
    totalWorkHours: 0.0,
    totalOtHours: 0.0,
    workDays: 0,
  })
  const [error, setError] = useState(null)

  // Tham chiếu để theo dõi trạng thái đang tải
  const isLoadingRef = useRef(false)

  // Tính toán khoảng thời gian dựa trên period được chọn
  const calculateDateRange = useCallback((period) => {
    const now = new Date()
    const endDate = new Date(now)
    let startDate = new Date(now)

    // Lấy ngày trong tuần (0: CN, 1-6: T2-CN)
    const dayOfWeek = now.getDay()

    switch (period) {
      case 'week':
        // Bắt đầu từ thứ 2 của tuần hiện tại
        startDate.setDate(
          now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        )
        break
      case 'month':
        // Bắt đầu từ ngày đầu tiên của tháng hiện tại
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        // Bắt đầu từ ngày đầu tiên của năm hiện tại
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    // Đặt giờ để lấy đủ ngày
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    setDateRange({ startDate, endDate })
    return { startDate, endDate }
  }, [])

  // Xử lý khi người dùng thay đổi khoảng thời gian
  const handlePeriodChange = useCallback(
    (newPeriod) => {
      setSelectedPeriod(newPeriod)
      setIsLoading(true)
      const newDateRange = calculateDateRange(newPeriod)
      loadAndProcessStatistics(newDateRange.startDate, newDateRange.endDate)
    },
    [calculateDateRange]
  )

  // Định dạng ngày hiển thị (chỉ ngày và tháng)
  const formatDate = useCallback((date) => {
    if (!date) return ''
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    // Chỉ hiển thị ngày và tháng cho bảng dữ liệu
    return `${day}/${month}`
  }, [])

  // Định dạng ngày đầy đủ (cho khoảng thời gian)
  const formatFullDate = useCallback((date) => {
    if (!date) return ''
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }, [])

  // Định dạng thời gian hiển thị (chỉ giờ và phút)
  const formatTime = useCallback((timeString) => {
    if (!timeString || timeString === '--:--') return '--:--'

    // Nếu là chuỗi thời gian đầy đủ (HH:MM:SS), cắt bỏ phần giây
    if (
      timeString.length === 8 &&
      timeString.charAt(2) === ':' &&
      timeString.charAt(5) === ':'
    ) {
      return timeString.substring(0, 5)
    }

    return timeString
  }, [])

  // Lấy tên thứ trong tuần theo ngôn ngữ
  const getDayOfWeek = useCallback(
    (date) => {
      if (!date) return ''

      // Các thứ viết tắt theo ngôn ngữ
      const daysByLanguage = {
        vi: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      }

      // Lấy mảng thứ theo ngôn ngữ hiện tại, mặc định là tiếng Việt
      const days = daysByLanguage[language] || daysByLanguage.vi

      return days[date.getDay()]
    },
    [language]
  )

  // Lấy biểu tượng trạng thái
  const getStatusDisplay = useCallback((status) => {
    switch (status) {
      case 'DU_CONG':
        return '✅'
      case 'DI_MUON':
        return '⚠️'
      case 'VE_SOM':
        return '⚠️'
      case 'DI_MUON_VE_SOM':
        return '⚠️'
      case 'THIEU_LOG':
        return '❌'
      case 'NGHI_PHEP':
        return '📝'
      case 'NGAY_TUONG_LAI':
        return '⏳'
      default:
        return '-'
    }
  }, [])

  // Hàm chính để tải và xử lý dữ liệu thống kê
  const loadAndProcessStatistics = useCallback(
    async (startDate, endDate) => {
      // Đánh dấu đang tải
      setIsLoading(true)
      isLoadingRef.current = true
      setError(null)

      try {
        console.log('[DEBUG] Bắt đầu tải dữ liệu thống kê...')
        console.log(
          `[DEBUG] Khoảng thời gian: ${formatFullDate(
            startDate
          )} - ${formatFullDate(endDate)}`
        )

        // Lấy tất cả các key từ AsyncStorage
        const keys = await AsyncStorage.getAllKeys()
        const statusKeys = keys.filter((key) =>
          key.startsWith(STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX)
        )

        console.log(
          `[DEBUG] Tìm thấy ${statusKeys.length} key trạng thái làm việc`
        )

        // Lọc các key trong khoảng thời gian
        const filteredKeys = statusKeys.filter((key) => {
          const dateStr = key.replace(STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX, '')
          const date = new Date(dateStr)
          return date >= startDate && date <= endDate
        })

        console.log(
          `[DEBUG] Sau khi lọc còn ${filteredKeys.length} key trong khoảng thời gian`
        )

        if (filteredKeys.length === 0) {
          setStatisticsData([])
          setSummaryData({
            totalWorkHours: 0.0,
            totalOtHours: 0.0,
            workDays: 0,
          })
          setIsLoading(false)
          isLoadingRef.current = false
          return
        }

        // Lấy dữ liệu từ AsyncStorage
        const statusPairs = await AsyncStorage.multiGet(filteredKeys)
        console.log(`[DEBUG] Đã lấy được ${statusPairs.length} cặp key-value`)

        // Xử lý dữ liệu
        const processedData = []
        let totalWorkHours = 0
        let totalOtHours = 0
        let workDays = 0

        // Tạo mảng tất cả các ngày trong khoảng thời gian
        const allDatesInRange = []
        const currentDate = new Date(startDate)
        while (currentDate <= endDate) {
          allDatesInRange.push(new Date(currentDate))
          currentDate.setDate(currentDate.getDate() + 1)
        }

        // Tạo map từ dữ liệu đã lấy được
        const statusMap = {}
        for (const [key, value] of statusPairs) {
          if (!value) continue
          try {
            const dateStr = key.replace(
              STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX,
              ''
            )
            const parsedValue = JSON.parse(value)
            statusMap[dateStr] = parsedValue
          } catch (parseError) {
            console.error(
              `[DEBUG] Lỗi khi phân tích dữ liệu cho key ${key}:`,
              parseError
            )
          }
        }

        // Xử lý từng ngày trong khoảng thời gian
        for (const date of allDatesInRange) {
          const dateStr = date.toISOString().split('T')[0]
          const statusEntry = statusMap[dateStr]

          // Tạo dữ liệu cho ngày này
          const dayData = {
            date: formatDate(date),
            dayOfWeek: getDayOfWeek(date),
            checkIn: statusEntry?.vaoLogTime
              ? formatTime(statusEntry.vaoLogTime)
              : '--:--',
            checkOut: statusEntry?.raLogTime
              ? formatTime(statusEntry.raLogTime)
              : '--:--',
            standardHours: statusEntry?.standardHoursScheduled || 0.0,
            otHours: statusEntry?.otHoursScheduled || 0.0,
            sundayHours: statusEntry?.sundayHoursScheduled || 0.0,
            nightHours: statusEntry?.nightHoursScheduled || 0.0,
            totalHours: statusEntry?.totalHoursScheduled || 0.0,
            status: statusEntry?.status
              ? getStatusDisplay(statusEntry.status)
              : '-',
          }

          processedData.push(dayData)

          // Cập nhật dữ liệu tổng hợp
          if (statusEntry) {
            totalWorkHours += statusEntry.totalHoursScheduled || 0
            totalOtHours += statusEntry.otHoursScheduled || 0
            if (statusEntry.totalHoursScheduled > 0) {
              workDays++
            }
          }
        }

        // Sắp xếp dữ liệu theo ngày
        processedData.sort((a, b) => {
          const dateA = new Date(a.date.split('/').reverse().join('-'))
          const dateB = new Date(b.date.split('/').reverse().join('-'))
          return dateA - dateB
        })

        // Cập nhật state
        setStatisticsData(processedData)
        setSummaryData({
          totalWorkHours: parseFloat(totalWorkHours.toFixed(1)),
          totalOtHours: parseFloat(totalOtHours.toFixed(1)),
          workDays,
        })

        console.log(`[DEBUG] Đã xử lý ${processedData.length} ngày dữ liệu`)
        console.log(
          `[DEBUG] Tổng giờ làm: ${totalWorkHours.toFixed(
            1
          )}, Tổng OT: ${totalOtHours.toFixed(1)}, Số ngày làm: ${workDays}`
        )
      } catch (error) {
        console.error('[DEBUG] Lỗi khi tải dữ liệu thống kê:', error)
        setError(error.message || 'Đã xảy ra lỗi khi tải dữ liệu thống kê')
        setStatisticsData([])
        setSummaryData({
          totalWorkHours: 0.0,
          totalOtHours: 0.0,
          workDays: 0,
        })
      } finally {
        setIsLoading(false)
        isLoadingRef.current = false
        console.log('[DEBUG] Hoàn thành quá trình tải dữ liệu thống kê')
      }
    },
    [formatDate, formatFullDate, formatTime, getDayOfWeek, getStatusDisplay]
  )

  // Tải dữ liệu khi component được mount
  useEffect(() => {
    const { startDate, endDate } = calculateDateRange(selectedPeriod)
    loadAndProcessStatistics(startDate, endDate)
  }, [calculateDateRange, loadAndProcessStatistics, selectedPeriod])

  // Tải lại dữ liệu khi quay lại màn hình
  useFocusEffect(
    useCallback(() => {
      if (!isLoadingRef.current) {
        const { startDate, endDate } = calculateDateRange(selectedPeriod)
        loadAndProcessStatistics(startDate, endDate)
      }
    }, [calculateDateRange, loadAndProcessStatistics, selectedPeriod])
  )

  // Render item cho FlatList
  const renderItem = ({ item }) => (
    <View style={[styles.tableRow, darkMode && styles.darkTableRow]}>
      <Text
        style={[styles.tableCell, styles.dateCell, darkMode && styles.darkText]}
      >
        {item.date}
      </Text>
      <Text
        style={[styles.tableCell, styles.dayCell, darkMode && styles.darkText]}
      >
        {item.dayOfWeek}
      </Text>
      <Text
        style={[styles.tableCell, styles.timeCell, darkMode && styles.darkText]}
      >
        {item.checkIn}
      </Text>
      <Text
        style={[styles.tableCell, styles.timeCell, darkMode && styles.darkText]}
      >
        {item.checkOut}
      </Text>
      <Text
        style={[
          styles.tableCell,
          styles.hoursCell,
          darkMode && styles.darkText,
        ]}
      >
        {item.standardHours.toFixed(1)}
      </Text>
      <Text
        style={[
          styles.tableCell,
          styles.hoursCell,
          darkMode && styles.darkText,
        ]}
      >
        {item.otHours.toFixed(1)}
      </Text>
      <Text
        style={[
          styles.tableCell,
          styles.hoursCell,
          darkMode && styles.darkText,
        ]}
      >
        {item.totalHours.toFixed(1)}
      </Text>
      <Text
        style={[
          styles.tableCell,
          styles.statusCell,
          darkMode && styles.darkText,
        ]}
      >
        {item.status}
      </Text>
    </View>
  )

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Thanh chọn khoảng thời gian */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'week' && styles.activePeriodButton,
            darkMode && styles.darkPeriodButton,
            selectedPeriod === 'week' &&
              darkMode &&
              styles.darkActivePeriodButton,
          ]}
          onPress={() => handlePeriodChange('week')}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === 'week' && styles.activePeriodButtonText,
              darkMode && styles.darkText,
            ]}
          >
            {t('This Week')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'month' && styles.activePeriodButton,
            darkMode && styles.darkPeriodButton,
            selectedPeriod === 'month' &&
              darkMode &&
              styles.darkActivePeriodButton,
          ]}
          onPress={() => handlePeriodChange('month')}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === 'month' && styles.activePeriodButtonText,
              darkMode && styles.darkText,
            ]}
          >
            {t('This Month')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'year' && styles.activePeriodButton,
            darkMode && styles.darkPeriodButton,
            selectedPeriod === 'year' &&
              darkMode &&
              styles.darkActivePeriodButton,
          ]}
          onPress={() => handlePeriodChange('year')}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === 'year' && styles.activePeriodButtonText,
              darkMode && styles.darkText,
            ]}
          >
            {t('This Year')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hiển thị khoảng thời gian */}
      {dateRange.startDate && dateRange.endDate && (
        <Text style={[styles.dateRangeText, darkMode && styles.darkText]}>
          {formatFullDate(dateRange.startDate)} -{' '}
          {formatFullDate(dateRange.endDate)}
        </Text>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8a56ff" />
          <Text style={[styles.loadingText, darkMode && styles.darkText]}>
            {t('Loading statistics...')}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
          <Text style={[styles.errorText, darkMode && styles.darkText]}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              const { startDate, endDate } = calculateDateRange(selectedPeriod)
              loadAndProcessStatistics(startDate, endDate)
            }}
          >
            <Text style={styles.retryButtonText}>{t('Retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Thẻ tổng hợp */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, darkMode && styles.darkCard]}>
              <Text style={[styles.summaryValue, styles.workHoursValue]}>
                {summaryData.totalWorkHours.toFixed(1)}
              </Text>
              <Text style={[styles.summaryLabel, darkMode && styles.darkText]}>
                {t('Total Work Hours')}
              </Text>
            </View>

            <View style={[styles.summaryCard, darkMode && styles.darkCard]}>
              <Text style={[styles.summaryValue, styles.otHoursValue]}>
                {summaryData.totalOtHours.toFixed(1)}
              </Text>
              <Text style={[styles.summaryLabel, darkMode && styles.darkText]}>
                {t('Total OT Hours')}
              </Text>
            </View>

            <View style={[styles.summaryCard, darkMode && styles.darkCard]}>
              <Text style={[styles.summaryValue, styles.workDaysValue]}>
                {summaryData.workDays}
              </Text>
              <Text style={[styles.summaryLabel, darkMode && styles.darkText]}>
                {t('Work Days')}
              </Text>
            </View>
          </View>

          {/* Bảng dữ liệu */}
          <View style={[styles.tableContainer, darkMode && styles.darkCard]}>
            {/* Header của bảng */}
            <View
              style={[styles.tableHeader, darkMode && styles.darkTableHeader]}
            >
              <Text
                style={[
                  styles.headerCell,
                  styles.dateCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('Date')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.dayCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('Day')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.timeCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('In')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.timeCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('Out')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.hoursCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('Std')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.hoursCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('OT')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.hoursCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('Total')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.statusCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('Status')}
              </Text>
            </View>

            {/* Dữ liệu bảng */}
            <FlatList
              data={statisticsData}
              renderItem={renderItem}
              keyExtractor={(item, index) => `stat-${index}`}
              style={styles.tableBody}
            />
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  activePeriodButton: {
    backgroundColor: '#8a56ff',
  },
  darkPeriodButton: {
    backgroundColor: '#333',
  },
  darkActivePeriodButton: {
    backgroundColor: '#6a3aff',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  activePeriodButtonText: {
    color: '#fff',
  },
  dateRangeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#8a56ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: '#1e1e1e',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workHoursValue: {
    color: '#3498db',
  },
  otHoursValue: {
    color: '#e67e22',
  },
  workDaysValue: {
    color: '#2ecc71',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  darkTableHeader: {
    backgroundColor: '#2a2a2a',
    borderBottomColor: '#444',
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333',
  },
  darkHeaderText: {
    color: '#eee',
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkTableRow: {
    borderBottomColor: '#333',
  },
  tableCell: {
    fontSize: 12,
    color: '#333',
  },
  darkText: {
    color: '#ddd',
  },
  dateCell: {
    width: '15%',
  },
  dayCell: {
    width: '10%',
  },
  timeCell: {
    width: '15%',
  },
  hoursCell: {
    width: '12%',
    textAlign: 'center',
  },
  statusCell: {
    width: '9%',
    textAlign: 'center',
  },
})

export default StatisticsScreen

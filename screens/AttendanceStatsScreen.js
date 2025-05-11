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
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { WORK_STATUS } from '../config/appConfig'

const AttendanceStatsScreen = ({ navigation }) => {
  const { t, darkMode } = useContext(AppContext)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [timeRange, setTimeRange] = useState('month') // 'week', 'month', 'year'
  const [stats, setStats] = useState({
    totalDays: 0,
    workDays: 0,
    attendanceRate: 0,
    statusCounts: {},
    monthlyTrend: [],
    weekdayDistribution: {},
  })

  const getDateRange = useCallback((range) => {
    const now = new Date()
    const endDate = new Date(now)
    let startDate = new Date(now)

    // Get day of week outside switch
    const dayOfWeek = now.getDay() || 7 // Convert Sunday (0) to 7

    switch (range) {
      case 'week':
        // Start from beginning of current week (Monday)
        startDate.setDate(now.getDate() - dayOfWeek + 1) // Monday
        break
      case 'month':
        // Start from beginning of current month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        // Start from beginning of current year
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    // Reset hours to get full days
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    return { startDate, endDate }
  }, [])

  const getWeekNumber = useCallback((date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear =
      (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }, [])

  const calculateStats = useCallback(
    (statusData, startDate, endDate) => {
      // Initialize counters
      const statusCounts = {}
      const weekdayDistribution = {
        1: { total: 0, present: 0 }, // Monday
        2: { total: 0, present: 0 },
        3: { total: 0, present: 0 },
        4: { total: 0, present: 0 },
        5: { total: 0, present: 0 },
        6: { total: 0, present: 0 },
        7: { total: 0, present: 0 }, // Sunday
      }

      // Initialize monthly trend
      const monthlyTrend = []

      // Calculate total work days in the period (excluding weekends)
      let totalWorkDays = 0
      const currentDate = new Date(startDate)

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay() || 7 // Convert Sunday (0) to 7

        // Count weekdays (Monday to Friday) as work days
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          totalWorkDays++
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1)
      }

      // Process status data
      statusData.forEach((data) => {
        // Count by status
        const status = data.status || WORK_STATUS.CHUA_CAP_NHAT
        statusCounts[status] = (statusCounts[status] || 0) + 1

        // Weekday distribution
        const dayOfWeek = data.date.getDay() || 7 // Convert Sunday (0) to 7
        weekdayDistribution[dayOfWeek].total++

        // Count as present if status is DU_CONG
        if (status === WORK_STATUS.DU_CONG) {
          weekdayDistribution[dayOfWeek].present++
        }

        // Monthly trend (group by week)
        const weekNumber = getWeekNumber(data.date)
        const existingWeek = monthlyTrend.find((w) => w.week === weekNumber)

        if (existingWeek) {
          existingWeek.total++
          if (status === WORK_STATUS.DU_CONG) {
            existingWeek.present++
          }
        } else {
          monthlyTrend.push({
            week: weekNumber,
            total: 1,
            present: status === WORK_STATUS.DU_CONG ? 1 : 0,
          })
        }
      })

      // Sort monthly trend by week number
      monthlyTrend.sort((a, b) => a.week - b.week)

      // Calculate attendance rate
      const presentDays = statusCounts[WORK_STATUS.DU_CONG] || 0
      const attendanceRate =
        totalWorkDays > 0 ? (presentDays / totalWorkDays) * 100 : 0

      return {
        totalDays: totalWorkDays,
        workDays: statusData.length,
        attendanceRate: attendanceRate.toFixed(1),
        statusCounts,
        monthlyTrend,
        weekdayDistribution,
      }
    },
    [getWeekNumber]
  )

  const loadAttendanceStats = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)

    // Đánh dấu đang tải trong ref
    isLoadingRef.current = true

    try {
      console.log('[DEBUG] Bắt đầu tải dữ liệu thống kê chuyên cần...')

      // Get all keys from AsyncStorage
      const keys = await AsyncStorage.getAllKeys()
      const statusKeys = keys.filter((key) =>
        key.startsWith('dailyWorkStatus_')
      )

      console.log(
        `[DEBUG] Tìm thấy ${statusKeys.length} key trạng thái làm việc`
      )

      // Get date range based on selected time range
      const { startDate, endDate } = getDateRange(timeRange)
      console.log(
        `[DEBUG] Khoảng thời gian: ${formatDate(startDate)} - ${formatDate(
          endDate
        )}`
      )

      // Filter keys within the date range
      const filteredKeys = statusKeys.filter((key) => {
        const dateStr = key.replace('dailyWorkStatus_', '')
        const date = new Date(dateStr)
        return date >= startDate && date <= endDate
      })

      console.log(
        `[DEBUG] Lọc được ${filteredKeys.length} key trong khoảng thời gian`
      )

      // Giới hạn số lượng key để tránh quá tải
      const MAX_KEYS = 20
      const keysToProcess = filteredKeys.slice(0, MAX_KEYS)

      if (filteredKeys.length > MAX_KEYS) {
        console.log(
          `[DEBUG] Giới hạn số lượng key từ ${filteredKeys.length} xuống ${MAX_KEYS}`
        )
      }

      // Get all status data with timeout
      try {
        console.log(
          `[DEBUG] Đang lấy dữ liệu cho ${keysToProcess.length} key...`
        )

        // Tạo promise với timeout
        const multiGetPromise = AsyncStorage.multiGet(keysToProcess)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error('Lấy dữ liệu trạng thái làm việc quá thời gian'))
          }, 3000) // 3 giây timeout
        })

        // Đợi kết quả hoặc timeout
        const statusPairs = await Promise.race([
          multiGetPromise,
          timeoutPromise,
        ])

        console.log(`[DEBUG] Đã lấy được ${statusPairs.length} cặp key-value`)

        // Xử lý dữ liệu
        const statusData = []
        for (const [key, value] of statusPairs) {
          if (!value) continue

          try {
            const dateStr = key.replace('dailyWorkStatus_', '')
            const parsedValue = JSON.parse(value)
            statusData.push({
              date: new Date(dateStr),
              ...parsedValue,
            })
          } catch (parseError) {
            console.error(
              `[DEBUG] Lỗi khi phân tích dữ liệu cho key ${key}:`,
              parseError
            )
          }
        }

        console.log(
          `[DEBUG] Đã xử lý được ${statusData.length} bản ghi dữ liệu`
        )

        // Calculate statistics
        console.log('[DEBUG] Tính toán thống kê...')
        const calculatedStats = calculateStats(statusData, startDate, endDate)
        setStats(calculatedStats)
        console.log('[DEBUG] Đã cập nhật dữ liệu thống kê')
      } catch (innerError) {
        console.error('[DEBUG] Lỗi khi xử lý dữ liệu:', innerError)
        throw innerError // Ném lỗi để xử lý ở catch bên ngoài
      }
    } catch (error) {
      console.error('[DEBUG] Lỗi khi tải dữ liệu thống kê:', error)
      setLoadError(error.message || 'Lỗi khi tải dữ liệu thống kê')

      // Đặt dữ liệu mặc định để tránh màn hình trống
      setStats({
        totalDays: 0,
        workDays: 0,
        attendanceRate: 0,
        statusCounts: {},
        monthlyTrend: [],
        weekdayDistribution: {
          1: { total: 0, present: 0 }, // Monday
          2: { total: 0, present: 0 },
          3: { total: 0, present: 0 },
          4: { total: 0, present: 0 },
          5: { total: 0, present: 0 },
          6: { total: 0, present: 0 },
          7: { total: 0, present: 0 }, // Sunday
        },
      })
    } finally {
      // Đặt lại trạng thái loading trong cả state và ref
      setIsLoading(false)
      isLoadingRef.current = false
      console.log(
        '[DEBUG] Hoàn thành quá trình tải dữ liệu thống kê chuyên cần'
      )
    }
  }, [timeRange, calculateStats, getDateRange])

  // Tham chiếu để theo dõi thời gian tải dữ liệu gần nhất
  const lastLoadTimeRef = useRef(0)
  // Tham chiếu để theo dõi số lần thử lại liên tiếp
  const retryCountRef = useRef(0)
  // Tham chiếu để theo dõi trạng thái đang tải
  const isLoadingRef = useRef(false)

  // Tải dữ liệu khi component được mount lần đầu
  useEffect(() => {
    console.log(
      'AttendanceStatsScreen được mount lần đầu, tải dữ liệu thống kê'
    )
    loadAttendanceStats()
    lastLoadTimeRef.current = Date.now()
  }, [loadAttendanceStats])

  // Sử dụng useFocusEffect để kiểm soát việc tải lại dữ liệu khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      console.log('[DEBUG] AttendanceStatsScreen được focus')
      const now = Date.now()

      // Nếu đang tải, không thực hiện tải lại
      if (isLoadingRef.current) {
        console.log('[DEBUG] Đang tải dữ liệu, bỏ qua yêu cầu tải lại')
        return
      }

      // Chỉ tải lại dữ liệu nếu đã qua ít nhất 10 giây từ lần tải trước
      if (now - lastLoadTimeRef.current > 10000) {
        console.log('[DEBUG] Tải lại dữ liệu thống kê khi focus')

        // Đánh dấu đang tải
        isLoadingRef.current = true

        try {
          // Thực hiện tải dữ liệu với timeout
          const loadPromise = loadAttendanceStats()

          // Đặt timeout để tránh treo
          const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
              reject(new Error('Tải dữ liệu thống kê quá thời gian'))
            }, 5000) // 5 giây timeout
          })

          // Đợi kết quả hoặc timeout
          Promise.race([loadPromise, timeoutPromise])
            .then(() => {
              // Đặt lại số lần thử lại khi tải thành công
              retryCountRef.current = 0
              console.log('[DEBUG] Tải dữ liệu thành công khi focus')
            })
            .catch((error) => {
              console.error('[DEBUG] Lỗi khi tải dữ liệu khi focus:', error)
              // Tăng số lần thử lại
              retryCountRef.current++

              // Nếu thử lại quá 3 lần, hiển thị thông báo lỗi
              if (retryCountRef.current > 3) {
                setLoadError(
                  'Không thể tải dữ liệu thống kê sau nhiều lần thử lại'
                )
              }
            })
            .finally(() => {
              // Cập nhật thời gian tải gần nhất
              lastLoadTimeRef.current = Date.now()
              // Đánh dấu đã tải xong
              isLoadingRef.current = false
            })
        } catch (error) {
          console.error(
            '[DEBUG] Lỗi ngoài cùng khi tải dữ liệu khi focus:',
            error
          )
          // Đảm bảo đặt lại trạng thái loading
          isLoadingRef.current = false
          lastLoadTimeRef.current = Date.now()
        }
      } else {
        console.log(
          '[DEBUG] Bỏ qua tải lại dữ liệu thống kê do mới tải gần đây'
        )
      }

      return () => {
        // Cleanup khi component bị unfocus
        console.log('[DEBUG] AttendanceStatsScreen bị unfocus')
      }
    }, [loadAttendanceStats])
  )

  const getStatusName = (status) => {
    switch (status) {
      case WORK_STATUS.THIEU_LOG:
        return t('Thiếu chấm công')
      case WORK_STATUS.DU_CONG:
        return t('Đủ công')
      case WORK_STATUS.NGHI_PHEP:
        return t('Nghỉ phép')
      case WORK_STATUS.NGHI_BENH:
        return t('Nghỉ bệnh')
      case WORK_STATUS.NGHI_LE:
        return t('Nghỉ lễ')
      case WORK_STATUS.NGHI_THUONG:
        return t('Ngày nghỉ thông thường')
      case WORK_STATUS.VANG_MAT:
        return t('Vắng không lý do')
      case WORK_STATUS.DI_MUON:
        return t('Đi muộn')
      case WORK_STATUS.VE_SOM:
        return t('Về sớm')
      case WORK_STATUS.DI_MUON_VE_SOM:
        return t('Đi muộn & về sớm')
      case WORK_STATUS.NGAY_TUONG_LAI:
        return t('Ngày tương lai')
      case WORK_STATUS.QUEN_CHECK_OUT:
        return t('Quên check-out')
      default:
        return t('Chưa cập nhật')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case WORK_STATUS.THIEU_LOG:
        return '#e74c3c'
      case WORK_STATUS.DU_CONG:
        return '#27ae60'
      case WORK_STATUS.NGHI_PHEP:
        return '#3498db'
      case WORK_STATUS.NGHI_BENH:
        return '#9b59b6'
      case WORK_STATUS.NGHI_LE:
        return '#f39c12'
      case WORK_STATUS.VANG_MAT:
        return '#e74c3c'
      case WORK_STATUS.DI_MUON:
      case WORK_STATUS.VE_SOM:
      case WORK_STATUS.DI_MUON_VE_SOM:
        return '#f39c12'
      default:
        return '#95a5a6'
    }
  }

  const formatDateRange = () => {
    const { startDate, endDate } = getDateRange(timeRange)
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  const formatDate = (date) => {
    return `${date.getDate().toString().padStart(2, '0')}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`
  }

  const getWeekdayName = (day) => {
    const weekdays = [
      '',
      t('Monday'),
      t('Tuesday'),
      t('Wednesday'),
      t('Thursday'),
      t('Friday'),
      t('Saturday'),
      t('Sunday'),
    ]
    return weekdays[day]
  }

  // Render bar chart for status distribution
  const renderStatusDistribution = () => {
    const statuses = Object.keys(stats.statusCounts)
    const maxCount = Math.max(...Object.values(stats.statusCounts))

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, darkMode && styles.darkText]}>
          {t('Status Distribution')}
        </Text>

        {statuses.map((status) => {
          const count = stats.statusCounts[status]
          const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0

          return (
            <View key={status} style={styles.chartRow}>
              <View style={styles.chartLabelContainer}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: getStatusColor(status) },
                  ]}
                />
                <Text style={[styles.chartLabel, darkMode && styles.darkText]}>
                  {getStatusName(status)}
                </Text>
              </View>

              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${percentage}%`,
                      backgroundColor: getStatusColor(status),
                    },
                  ]}
                />
                <Text style={[styles.barValue, darkMode && styles.darkText]}>
                  {count}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    )
  }

  // Render weekly attendance trend
  const renderWeeklyTrend = () => {
    const maxValue = Math.max(
      ...stats.monthlyTrend.map((week) => week.total),
      5
    )

    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, darkMode && styles.darkText]}>
          {t('Weekly Trend')}
        </Text>

        <View style={styles.trendContainer}>
          {stats.monthlyTrend.map((week, index) => {
            const presentHeight = (week.present / maxValue) * 100
            const absentHeight = ((week.total - week.present) / maxValue) * 100

            return (
              <View key={index} style={styles.trendColumn}>
                <View style={styles.trendBars}>
                  <View style={styles.trendBarSpace} />

                  {/* Absent bar */}
                  {week.total - week.present > 0 && (
                    <View
                      style={[
                        styles.trendBar,
                        styles.absentBar,
                        { height: `${absentHeight}%` },
                      ]}
                    />
                  )}

                  {/* Present bar */}
                  {week.present > 0 && (
                    <View
                      style={[
                        styles.trendBar,
                        styles.presentBar,
                        { height: `${presentHeight}%` },
                      ]}
                    />
                  )}
                </View>

                <Text
                  style={[styles.trendLabel, darkMode && styles.darkSubtitle]}
                >
                  {t('W')} {week.week}
                </Text>
              </View>
            )
          })}
        </View>

        <View style={styles.trendLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#27ae60' }]} />
            <Text style={[styles.legendText, darkMode && styles.darkSubtitle]}>
              {t('Present')}
            </Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#e74c3c' }]} />
            <Text style={[styles.legendText, darkMode && styles.darkSubtitle]}>
              {t('Absent/Other')}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  // Render weekday distribution
  const renderWeekdayDistribution = () => {
    return (
      <View style={styles.chartContainer}>
        <Text style={[styles.chartTitle, darkMode && styles.darkText]}>
          {t('Weekday Distribution')}
        </Text>

        <View style={styles.weekdayContainer}>
          {Object.keys(stats.weekdayDistribution).map((day) => {
            const data = stats.weekdayDistribution[day]
            const percentage =
              data.total > 0 ? (data.present / data.total) * 100 : 0

            return (
              <View key={day} style={styles.weekdayItem}>
                <Text
                  style={[styles.weekdayLabel, darkMode && styles.darkText]}
                >
                  {getWeekdayName(day).substring(0, 3)}
                </Text>

                <View style={styles.weekdayBarContainer}>
                  <View
                    style={[
                      styles.weekdayBar,
                      {
                        height: `${percentage}%`,
                        backgroundColor:
                          percentage >= 80
                            ? '#27ae60'
                            : percentage >= 50
                            ? '#f39c12'
                            : '#e74c3c',
                      },
                    ]}
                  />
                </View>

                <Text
                  style={[
                    styles.weekdayPercentage,
                    darkMode && styles.darkSubtitle,
                  ]}
                >
                  {percentage.toFixed(0)}%
                </Text>
              </View>
            )
          })}
        </View>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Time Range Selector */}
      <View style={styles.timeRangeSelector}>
        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            timeRange === 'week' && styles.activeTimeRangeButton,
            darkMode && styles.darkTimeRangeButton,
            timeRange === 'week' &&
              darkMode &&
              styles.darkActiveTimeRangeButton,
          ]}
          onPress={() => setTimeRange('week')}
        >
          <Text
            style={[
              styles.timeRangeButtonText,
              timeRange === 'week' && styles.activeTimeRangeButtonText,
              darkMode && styles.darkText,
            ]}
          >
            {t('This Week')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            timeRange === 'month' && styles.activeTimeRangeButton,
            darkMode && styles.darkTimeRangeButton,
            timeRange === 'month' &&
              darkMode &&
              styles.darkActiveTimeRangeButton,
          ]}
          onPress={() => setTimeRange('month')}
        >
          <Text
            style={[
              styles.timeRangeButtonText,
              timeRange === 'month' && styles.activeTimeRangeButtonText,
              darkMode && styles.darkText,
            ]}
          >
            {t('This Month')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            timeRange === 'year' && styles.activeTimeRangeButton,
            darkMode && styles.darkTimeRangeButton,
            timeRange === 'year' &&
              darkMode &&
              styles.darkActiveTimeRangeButton,
          ]}
          onPress={() => setTimeRange('year')}
        >
          <Text
            style={[
              styles.timeRangeButtonText,
              timeRange === 'year' && styles.activeTimeRangeButtonText,
              darkMode && styles.darkText,
            ]}
          >
            {t('This Year')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Range */}
      <Text style={[styles.dateRange, darkMode && styles.darkText]}>
        {formatDateRange()}
      </Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8a56ff" />
          <Text style={[styles.loadingText, darkMode && styles.darkText]}>
            {t('Loading statistics...')}
          </Text>
        </View>
      ) : loadError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
          <Text style={[styles.errorText, darkMode && styles.darkText]}>
            {loadError}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              console.log('[DEBUG] Thử lại tải dữ liệu thống kê')

              // Kiểm tra trạng thái loading từ ref
              if (isLoadingRef.current) {
                console.log('[DEBUG] Đang tải dữ liệu, bỏ qua yêu cầu thử lại')
                return
              }

              // Đặt lại trạng thái
              setLoadError(null)
              retryCountRef.current = 0

              // Đánh dấu đang tải
              setIsLoading(true)
              isLoadingRef.current = true

              try {
                // Thực hiện tải dữ liệu với timeout
                const loadPromise = loadAttendanceStats()

                // Đặt timeout để tránh treo
                const timeoutPromise = new Promise((_, reject) => {
                  setTimeout(() => {
                    reject(new Error('Tải dữ liệu thống kê quá thời gian'))
                  }, 5000) // 5 giây timeout
                })

                // Đợi kết quả hoặc timeout
                Promise.race([loadPromise, timeoutPromise])
                  .catch((error) => {
                    console.error('[DEBUG] Lỗi khi thử lại tải dữ liệu:', error)
                    if (error.message.includes('thời gian')) {
                      setLoadError(
                        'Tải dữ liệu quá thời gian, vui lòng thử lại'
                      )
                    } else {
                      setLoadError(
                        'Không thể tải dữ liệu, vui lòng thử lại sau'
                      )
                    }
                  })
                  .finally(() => {
                    // Đảm bảo đặt lại trạng thái loading
                    isLoadingRef.current = false
                  })
              } catch (error) {
                console.error(
                  '[DEBUG] Lỗi ngoài cùng khi thử lại tải dữ liệu:',
                  error
                )
                // Đảm bảo đặt lại trạng thái loading
                setIsLoading(false)
                isLoadingRef.current = false
                setLoadError('Đã xảy ra lỗi không mong đợi, vui lòng thử lại')
              }
            }}
          >
            <Text style={styles.retryButtonText}>{t('Retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Summary Cards */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, darkMode && styles.darkCard]}>
              <Text style={[styles.summaryValue, styles.attendanceRateValue]}>
                {stats.attendanceRate}%
              </Text>
              <Text style={[styles.summaryLabel, darkMode && styles.darkText]}>
                {t('Attendance Rate')}
              </Text>
            </View>

            <View style={[styles.summaryCard, darkMode && styles.darkCard]}>
              <Text style={[styles.summaryValue, styles.workDaysValue]}>
                {stats.workDays}/{stats.totalDays}
              </Text>
              <Text style={[styles.summaryLabel, darkMode && styles.darkText]}>
                {t('Work Days')}
              </Text>
            </View>
          </View>

          {/* Status Distribution Chart */}
          <View style={[styles.card, darkMode && styles.darkCard]}>
            {renderStatusDistribution()}
          </View>

          {/* Weekly Trend Chart */}
          <View style={[styles.card, darkMode && styles.darkCard]}>
            {renderWeeklyTrend()}
          </View>

          {/* Weekday Distribution Chart */}
          <View style={[styles.card, darkMode && styles.darkCard]}>
            {renderWeekdayDistribution()}
          </View>
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  darkText: {
    color: '#fff',
  },
  darkSubtitle: {
    color: '#aaa',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#ddd',
    borderRadius: 8,
    padding: 4,
  },
  darkTimeRangeButton: {
    backgroundColor: '#2a2a2a',
  },
  darkActiveTimeRangeButton: {
    backgroundColor: '#8a56ff',
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTimeRangeButton: {
    backgroundColor: '#8a56ff',
  },
  timeRangeButtonText: {
    fontWeight: '500',
    color: '#333',
  },
  activeTimeRangeButtonText: {
    color: '#fff',
  },
  dateRange: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#8a56ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
  },
  darkCard: {
    backgroundColor: '#1e1e1e',
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  attendanceRateValue: {
    color: '#8a56ff',
  },
  workDaysValue: {
    color: '#3498db',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  chartContainer: {
    marginBottom: 8,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '40%',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  chartLabel: {
    fontSize: 14,
    color: '#333',
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
  },
  barValue: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  trendContainer: {
    flexDirection: 'row',
    height: 200,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  trendColumn: {
    flex: 1,
    alignItems: 'center',
  },
  trendBars: {
    width: 20,
    height: '100%',
    justifyContent: 'flex-end',
  },
  trendBarSpace: {
    height: '10%',
  },
  trendBar: {
    width: '100%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  presentBar: {
    backgroundColor: '#27ae60',
  },
  absentBar: {
    backgroundColor: '#e74c3c',
  },
  trendLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  trendLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  weekdayContainer: {
    flexDirection: 'row',
    height: 200,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  weekdayItem: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  weekdayLabel: {
    fontSize: 12,
    color: '#333',
    marginBottom: 8,
  },
  weekdayBarContainer: {
    width: 20,
    height: '70%',
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  weekdayBar: {
    width: '100%',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  weekdayPercentage: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
})

export default AttendanceStatsScreen

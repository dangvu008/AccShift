'use client'

import { useState, useEffect, useContext, useCallback, useRef } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  Platform,
  Alert,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Ionicons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import { formatDate } from '../utils/helpers'
import {
  formatShortWeekday,
  formatShortDate,
  formatDecimalHours,
  formatDuration,
} from '../utils/formatters'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { STORAGE_KEYS } from '../config/appConfig'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { WORK_STATUS } from '../components/WeeklyStatusGrid'

const StatisticsScreen = ({ navigation }) => {
  const { t, darkMode, shifts, attendanceLogs, language, theme } =
    useContext(AppContext)
  const [timeRange, setTimeRange] = useState('month') // 'week', 'month', 'year', 'custom'
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [stats, setStats] = useState({
    totalWorkTime: 0,
    overtime: 0,
    statusCounts: {},
    dailyData: [],
  })

  // Custom date range
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [customRangeModalVisible, setCustomRangeModalVisible] = useState(false)
  const [exportModalVisible, setExportModalVisible] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv') // 'csv', 'pdf', 'excel'
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)

  const getDateRange = useCallback(
    (range) => {
      const now = new Date()
      let rangeEnd = new Date(now)
      let rangeStart = new Date(now)

      // Get day of week outside switch
      const dayOfWeek = now.getDay() || 7 // Convert Sunday (0) to 7

      switch (range) {
        case 'week':
          // Start from beginning of current week (Monday)
          rangeStart.setDate(now.getDate() - dayOfWeek + 1) // Monday
          break
        case 'month':
          // Start from beginning of current month
          rangeStart = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        case 'year':
          // Start from beginning of current year
          rangeStart = new Date(now.getFullYear(), 0, 1)
          break
        case 'custom':
          // Use custom date range
          rangeStart = new Date(startDate)
          rangeEnd = new Date(endDate)
          break
      }

      // Reset hours to get full days
      rangeStart.setHours(0, 0, 0, 0)
      rangeEnd.setHours(23, 59, 59, 999)

      return { rangeStart, rangeEnd }
    },
    [startDate, endDate]
  )

  const loadDailyWorkStatuses = async (startDate, endDate) => {
    try {
      console.log('Bắt đầu tải dữ liệu trạng thái làm việc hàng ngày...')

      // Đặt timeout cho việc lấy tất cả keys
      const getAllKeysPromise = AsyncStorage.getAllKeys()
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout khi lấy danh sách keys từ AsyncStorage'))
        }, 3000) // 3 giây timeout
      })

      // Lấy tất cả keys với timeout
      let allKeys
      try {
        allKeys = await Promise.race([getAllKeysPromise, timeoutPromise])
        console.log(`Đã lấy ${allKeys.length} keys từ AsyncStorage`)
      } catch (keyError) {
        console.error('Lỗi khi lấy keys:', keyError)
        return [] // Trả về mảng rỗng nếu không thể lấy keys
      }

      // Lọc các keys liên quan đến trạng thái làm việc
      const statusKeys = allKeys.filter((key) =>
        key.startsWith(STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX)
      )
      console.log(`Tìm thấy ${statusKeys.length} keys trạng thái làm việc`)

      // Giới hạn số lượng ngày để tránh quá tải
      const MAX_DAYS = 90 // Giới hạn 90 ngày để tránh quá tải

      // Tính số ngày trong khoảng
      const daysDiff =
        Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      if (daysDiff > MAX_DAYS) {
        console.warn(
          `Khoảng thời gian quá lớn (${daysDiff} ngày), giới hạn xuống ${MAX_DAYS} ngày`
        )
        // Điều chỉnh ngày kết thúc
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + MAX_DAYS - 1)
      }

      // Filter keys within the date range
      const filteredStatusData = []
      const loadPromises = []
      const processedDates = []

      // For each day in the range, try to load status
      const currentDate = new Date(startDate)
      while (currentDate <= endDate) {
        const dateKey = formatDate(currentDate)
        processedDates.push(dateKey)
        const statusKey = `${STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX}${dateKey}`

        if (statusKeys.includes(statusKey)) {
          // Sử dụng Promise để tải dữ liệu song song thay vì tuần tự
          const loadPromise = (async () => {
            try {
              const statusJson = await AsyncStorage.getItem(statusKey)
              if (statusJson) {
                try {
                  const status = JSON.parse(statusJson)
                  // Thêm trường date nếu chưa có
                  if (!status.date) {
                    status.date = dateKey
                  }
                  return status
                } catch (parseError) {
                  console.error(
                    `Error parsing status for ${dateKey}:`,
                    parseError
                  )
                  return null
                }
              }
              return null
            } catch (error) {
              console.error(`Error loading status for ${dateKey}:`, error)
              return null
            }
          })()

          loadPromises.push(loadPromise)
        } else {
          // Thêm null cho ngày không có dữ liệu để giữ đúng thứ tự
          loadPromises.push(Promise.resolve(null))
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1)
      }

      console.log(`Đang tải dữ liệu cho ${loadPromises.length} ngày...`)

      // Đợi tất cả các promise hoàn thành với timeout
      const loadAllPromise = Promise.all(loadPromises)
      const loadTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout khi tải dữ liệu trạng thái làm việc'))
        }, 5000) // 5 giây timeout
      })

      let results
      try {
        results = await Promise.race([loadAllPromise, loadTimeoutPromise])
        console.log(`Đã tải xong dữ liệu cho ${results.length} ngày`)
      } catch (loadError) {
        console.error('Lỗi khi tải dữ liệu:', loadError)
        // Trả về mảng rỗng nếu timeout
        return []
      }

      // Lọc bỏ các giá trị null và thêm vào kết quả
      results.forEach((status, index) => {
        if (status) {
          filteredStatusData.push(status)
        }
      })

      console.log(`Đã lọc được ${filteredStatusData.length} bản ghi có dữ liệu`)
      return filteredStatusData
    } catch (error) {
      console.error('Error loading daily work statuses:', error)
      return []
    }
  }

  const processDayLogs = useCallback(
    (logs) => {
      // Initialize day stats
      const dayStats = {
        status: 'missingLog',
        workTime: 0,
        overtime: 0,
        checkIn: null,
        checkOut: null,
      }

      // Find check-in and check-out logs
      const checkInLog = logs.find((log) => log.type === 'check_in')
      const checkOutLog = logs.find((log) => log.type === 'check_out')

      if (checkInLog) {
        dayStats.checkIn = new Date(checkInLog.timestamp)
      }

      if (checkOutLog) {
        dayStats.checkOut = new Date(checkOutLog.timestamp)
      }

      // Calculate work time if both check-in and check-out exist
      if (dayStats.checkIn && dayStats.checkOut) {
        // Get shift for this log if available
        const shiftId = checkInLog.shiftId || checkOutLog.shiftId
        const shift = shifts.find((s) => s.id === shiftId)

        // Calculate work duration in minutes
        const workDurationMs =
          dayStats.checkOut.getTime() - dayStats.checkIn.getTime()
        const workDurationMinutes = Math.floor(workDurationMs / (1000 * 60))

        // Subtract break time if shift is available
        const breakTime = shift ? shift.breakTime || 0 : 0
        dayStats.workTime = Math.max(0, workDurationMinutes - breakTime)

        // Calculate overtime if shift is available
        if (shift) {
          // Parse shift times
          const [startHour, startMinute] = shift.startTime
            .split(':')
            .map(Number)
          const [endHour, endMinute] = shift.endTime.split(':').map(Number)

          // Create Date objects for shift times
          const shiftStart = new Date(dayStats.checkIn)
          shiftStart.setHours(startHour, startMinute, 0, 0)

          const shiftEnd = new Date(dayStats.checkIn)
          shiftEnd.setHours(endHour, endMinute, 0, 0)

          // If shift end is before shift start, it's an overnight shift
          if (shiftEnd < shiftStart) {
            shiftEnd.setDate(shiftEnd.getDate() + 1)
          }

          // Calculate regular shift duration in minutes
          const shiftDurationMs = shiftEnd.getTime() - shiftStart.getTime()
          const shiftDurationMinutes =
            Math.floor(shiftDurationMs / (1000 * 60)) - breakTime

          // Calculate overtime (work time exceeding shift duration)
          dayStats.overtime = Math.max(
            0,
            dayStats.workTime - shiftDurationMinutes
          )

          // Determine status based on check-in and check-out times
          const isLate = dayStats.checkIn > shiftStart
          const isEarlyLeave = dayStats.checkOut < shiftEnd

          if (isLate && isEarlyLeave) {
            dayStats.status = 'lateAndEarly'
          } else if (isLate) {
            dayStats.status = 'late'
          } else if (isEarlyLeave) {
            dayStats.status = 'earlyLeave'
          } else {
            dayStats.status = 'completed'
          }
        } else {
          // No shift information, just mark as completed
          dayStats.status = 'completed'
        }
      } else if (logs.some((log) => log.type === 'go_work')) {
        // Has go_work log but missing check-in or check-out
        dayStats.status = 'missingLog'
      }

      return dayStats
    },
    [shifts]
  )

  const calculateStatistics = useCallback(
    (workStatuses, startDate, endDate) => {
      console.log('Bắt đầu tính toán thống kê...')

      // Kiểm tra dữ liệu đầu vào
      if (!Array.isArray(workStatuses)) {
        console.error('workStatuses không phải là mảng')
        workStatuses = []
      }

      if (!startDate || !endDate) {
        console.error('startDate hoặc endDate không hợp lệ')
        startDate = new Date()
        endDate = new Date()
      }

      // Initialize statistics
      const stats = {
        totalWorkTime: 0,
        overtime: 0,
        standardHours: 0,
        otHours: 0,
        sundayHours: 0,
        nightHours: 0,
        statusCounts: {
          DU_CONG: 0,
          DI_MUON: 0,
          VE_SOM: 0,
          DI_MUON_VE_SOM: 0,
          THIEU_LOG: 0,
          NGHI_PHEP: 0,
          NGHI_BENH: 0,
          NGHI_LE: 0,
          NGHI_THUONG: 0,
          VANG_MAT: 0,
          CHUA_CAP_NHAT: 0,
        },
        dailyData: [],
      }

      // Tạo danh sách các ngày đã xử lý
      const processedDates = []

      // Process each day's work status
      workStatuses.forEach((status) => {
        try {
          if (!status || typeof status !== 'object') {
            console.warn('Bỏ qua bản ghi không hợp lệ:', status)
            return // Skip invalid entries
          }

          if (!status.date) {
            console.warn('Bỏ qua bản ghi không có ngày:', status)
            return // Skip entries without date
          }

          // Thêm vào danh sách ngày đã xử lý
          processedDates.push(status.date)

          // Format date for display
          let dateObj
          try {
            dateObj = new Date(status.date.split('-').join('/'))
            if (isNaN(dateObj.getTime())) {
              console.warn(`Ngày không hợp lệ: ${status.date}`)
              dateObj = new Date() // Sử dụng ngày hiện tại nếu không hợp lệ
            }
          } catch (dateError) {
            console.warn(`Lỗi khi chuyển đổi ngày ${status.date}:`, dateError)
            dateObj = new Date() // Sử dụng ngày hiện tại nếu có lỗi
          }

          const displayDate = formatShortDate(dateObj, language)

          // Get weekday
          const weekday = getWeekdayName(dateObj.getDay())

          // Add to total stats (convert from hours to minutes for consistency)
          // Kiểm tra và đảm bảo các giá trị là số
          const standardHours = parseFloat(status.standardHoursScheduled) || 0
          const otHours = parseFloat(status.otHoursScheduled) || 0
          const sundayHours = parseFloat(status.sundayHoursScheduled) || 0
          const nightHours = parseFloat(status.nightHoursScheduled) || 0

          stats.standardHours += standardHours
          stats.otHours += otHours
          stats.sundayHours += sundayHours
          stats.nightHours += nightHours
          stats.totalWorkTime += standardHours * 60
          stats.overtime += otHours * 60

          // Update status counts
          if (
            status.status &&
            stats.statusCounts.hasOwnProperty(status.status)
          ) {
            stats.statusCounts[status.status]++
          } else {
            stats.statusCounts.CHUA_CAP_NHAT++
          }

          // Add to daily data
          stats.dailyData.push({
            date: displayDate,
            weekday: weekday,
            checkIn: status.vaoLogTime || '--:--',
            checkOut: status.raLogTime || '--:--',
            standardHours: standardHours,
            otHours: otHours,
            sundayHours: sundayHours,
            nightHours: nightHours,
            totalHours: parseFloat(status.totalHoursScheduled) || 0,
            status: status.status || 'CHUA_CAP_NHAT',
            lateMinutes: parseInt(status.lateMinutes) || 0,
            earlyMinutes: parseInt(status.earlyMinutes) || 0,
          })
        } catch (itemError) {
          console.error('Lỗi khi xử lý bản ghi:', itemError, status)
          // Tiếp tục với bản ghi tiếp theo
        }
      })

      console.log(`Đã xử lý ${stats.dailyData.length} bản ghi`)

      // Check for missing days in the range and mark as not updated
      try {
        const currentDate = new Date(startDate)
        let daysAdded = 0
        const MAX_DAYS = 90 // Giới hạn số ngày để tránh quá tải

        while (currentDate <= endDate && daysAdded < MAX_DAYS) {
          const dateKey = formatDate(currentDate)

          if (!processedDates.includes(dateKey)) {
            // No status for this day, mark as not updated
            stats.statusCounts.CHUA_CAP_NHAT++

            // Format date for display
            const displayDate = formatShortDate(currentDate, language)

            // Get weekday
            const weekday = getWeekdayName(currentDate.getDay())

            stats.dailyData.push({
              date: displayDate,
              weekday: weekday,
              checkIn: '--:--',
              checkOut: '--:--',
              standardHours: 0,
              otHours: 0,
              sundayHours: 0,
              nightHours: 0,
              totalHours: 0,
              status: 'CHUA_CAP_NHAT',
              lateMinutes: 0,
              earlyMinutes: 0,
            })

            daysAdded++
          }

          // Move to next day
          currentDate.setDate(currentDate.getDate() + 1)
        }
      } catch (missingDaysError) {
        console.error('Lỗi khi xử lý các ngày thiếu:', missingDaysError)
      }

      // Sort daily data by date
      try {
        stats.dailyData.sort((a, b) => {
          try {
            const dateA = new Date(a.date.split('/').reverse().join('-'))
            const dateB = new Date(b.date.split('/').reverse().join('-'))
            return dateA - dateB
          } catch (sortError) {
            console.warn('Lỗi khi sắp xếp ngày:', sortError)
            return 0
          }
        })
      } catch (sortError) {
        console.error('Lỗi khi sắp xếp dữ liệu:', sortError)
      }

      console.log('Hoàn thành tính toán thống kê')
      return stats
    },
    [language]
  )

  const formatDateRange = () => {
    const { rangeStart, rangeEnd } = getDateRange(timeRange)
    return `${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`
  }

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false)
    if (selectedDate) {
      setStartDate(selectedDate)
    }
  }

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false)
    if (selectedDate) {
      setEndDate(selectedDate)
    }
  }

  const applyCustomDateRange = () => {
    setTimeRange('custom')
    setCustomRangeModalVisible(false)
  }

  const loadStatistics = useCallback(async () => {
    // Nếu đã đang tải, không thực hiện tải lại để tránh vòng lặp vô hạn
    if (isLoading) {
      console.log('Đã đang tải dữ liệu, bỏ qua yêu cầu tải lại')
      return
    }

    // Tạo biến để theo dõi nếu timeout đã xảy ra
    let isTimedOut = false
    let timeoutId = null

    setIsLoading(true)
    setLoadError(null)

    try {
      // Get date range
      const { rangeStart, rangeEnd } = getDateRange(timeRange)

      // Đặt timeout để tránh trường hợp hàm không bao giờ kết thúc
      timeoutId = setTimeout(() => {
        isTimedOut = true
        if (isMountedRef.current) {
          console.error('Tải dữ liệu quá thời gian')
          setLoadError('Tải dữ liệu quá thời gian, vui lòng thử lại')
          setIsLoading(false)
        }
      }, 8000) // 8 giây timeout

      // Load daily work statuses
      const workStatuses = await loadDailyWorkStatuses(rangeStart, rangeEnd)

      // Nếu đã timeout, không tiếp tục xử lý
      if (isTimedOut) return

      // Xóa timeout vì đã tải xong dữ liệu
      clearTimeout(timeoutId)

      // Kiểm tra nếu component đã unmounted
      if (!isMountedRef.current) return

      // Kiểm tra dữ liệu trước khi tính toán
      if (!Array.isArray(workStatuses)) {
        throw new Error('Dữ liệu không hợp lệ')
      }

      // Calculate statistics
      const calculatedStats = calculateStatistics(
        workStatuses,
        rangeStart,
        rangeEnd
      )

      // Kiểm tra nếu component vẫn mounted trước khi cập nhật state
      if (isMountedRef.current) {
        setStats(calculatedStats)
      }
    } catch (error) {
      // Xóa timeout nếu có lỗi
      if (timeoutId) clearTimeout(timeoutId)

      console.error('Error loading statistics:', error)

      // Kiểm tra nếu component vẫn mounted trước khi cập nhật state
      if (isMountedRef.current && !isTimedOut) {
        setLoadError(error.message || 'Lỗi khi tải dữ liệu thống kê')

        // Đặt dữ liệu mặc định để tránh màn hình trống
        setStats({
          totalWorkTime: 0,
          overtime: 0,
          standardHours: 0,
          otHours: 0,
          sundayHours: 0,
          nightHours: 0,
          statusCounts: {
            DU_CONG: 0,
            DI_MUON: 0,
            VE_SOM: 0,
            DI_MUON_VE_SOM: 0,
            THIEU_LOG: 0,
            NGHI_PHEP: 0,
            NGHI_BENH: 0,
            NGHI_LE: 0,
            NGHI_THUONG: 0,
            VANG_MAT: 0,
            CHUA_CAP_NHAT: 0,
          },
          dailyData: [],
        })
      }
    } finally {
      // Xóa timeout nếu vẫn còn
      if (timeoutId) clearTimeout(timeoutId)

      // Kiểm tra nếu component vẫn mounted và chưa timeout trước khi cập nhật state
      if (isMountedRef.current && !isTimedOut) {
        setIsLoading(false)
      }
    }
  }, [
    timeRange,
    calculateStatistics,
    getDateRange,
    loadDailyWorkStatuses,
    isLoading,
    isMountedRef,
  ])

  // Tham chiếu để theo dõi thời gian tải dữ liệu gần nhất
  const lastLoadTimeRef = useRef(0)
  // Tham chiếu để theo dõi số lần thử lại liên tiếp
  const retryCountRef = useRef(0)
  // Tham chiếu để theo dõi trạng thái đang tải
  const isLoadingRef = useRef(false)
  // Tham chiếu để theo dõi nếu component đã unmount
  const isMountedRef = useRef(true)

  // Tải dữ liệu khi component được mount lần đầu
  useEffect(() => {
    console.log('StatisticsScreen được mount lần đầu, tải dữ liệu thống kê')
    isMountedRef.current = true

    // Đặt timeout để tránh tải dữ liệu quá sớm khi màn hình đang render
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        loadStatistics()
        lastLoadTimeRef.current = Date.now()
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      isMountedRef.current = false
    }
  }, [loadStatistics])

  // Sử dụng useFocusEffect để kiểm soát việc tải lại dữ liệu khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      console.log('StatisticsScreen được focus')

      // Đánh dấu component đã mount
      isMountedRef.current = true

      // Biến để theo dõi timer
      let focusTimer = null

      // Hàm tải dữ liệu an toàn
      const safeLoadData = () => {
        // Nếu đang tải, không thực hiện tải lại
        if (isLoadingRef.current) {
          console.log('Đang tải dữ liệu, bỏ qua yêu cầu tải lại')
          return
        }

        const now = Date.now()

        // Chỉ tải lại dữ liệu nếu đã qua ít nhất 5 giây từ lần tải trước
        if (now - lastLoadTimeRef.current > 5000) {
          console.log('Tải lại dữ liệu thống kê')

          // Đánh dấu đang tải
          isLoadingRef.current = true

          // Thực hiện tải dữ liệu với xử lý lỗi
          try {
            loadStatistics()
              .then(() => {
                // Đặt lại số lần thử lại khi tải thành công
                if (isMountedRef.current) {
                  retryCountRef.current = 0
                  console.log('Tải dữ liệu thành công')
                }
              })
              .catch((error) => {
                if (!isMountedRef.current) return

                console.error('Lỗi khi tải dữ liệu thống kê:', error)

                // Tăng số lần thử lại
                retryCountRef.current++

                // Nếu thử lại quá 3 lần, hiển thị thông báo lỗi
                if (retryCountRef.current > 3 && isMountedRef.current) {
                  console.log(
                    'Đã thử lại quá nhiều lần, hiển thị thông báo lỗi'
                  )
                  setLoadError(
                    'Không thể tải dữ liệu thống kê sau nhiều lần thử lại'
                  )
                }
              })
              .finally(() => {
                if (!isMountedRef.current) return

                // Cập nhật thời gian tải gần nhất
                lastLoadTimeRef.current = Date.now()

                // Đánh dấu đã tải xong
                isLoadingRef.current = false
                console.log('Đã hoàn thành quá trình tải dữ liệu')
              })
          } catch (unexpectedError) {
            // Xử lý lỗi không mong đợi
            console.error(
              'Lỗi không mong đợi khi tải dữ liệu:',
              unexpectedError
            )

            if (isMountedRef.current) {
              setLoadError('Đã xảy ra lỗi không mong đợi, vui lòng thử lại')
              isLoadingRef.current = false
            }
          }
        } else {
          console.log('Bỏ qua tải lại dữ liệu thống kê do mới tải gần đây')
        }
      }

      // Đặt timeout để tránh tải dữ liệu quá sớm khi màn hình đang chuyển đổi
      focusTimer = setTimeout(safeLoadData, 500)

      // Cleanup khi component bị unfocus
      return () => {
        console.log('StatisticsScreen bị unfocus')

        // Xóa timer nếu có
        if (focusTimer) {
          clearTimeout(focusTimer)
        }

        // Đánh dấu component đã unmount
        isMountedRef.current = false
      }
    }, [loadStatistics])
  )

  const exportReport = async () => {
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Generate report content based on format
      let content = ''
      let fileName = ''

      if (exportFormat === 'csv') {
        content = generateCSVReport()
        fileName = `accshift_report_${formatDate(new Date()).replace(
          /\//g,
          '-'
        )}.csv`
      } else {
        // For now, we'll just use CSV for all formats
        content = generateCSVReport()
        fileName = `accshift_report_${formatDate(new Date()).replace(
          /\//g,
          '-'
        )}.${exportFormat}`
      }

      setExportProgress(50)

      // Save file
      const filePath = `${FileSystem.documentDirectory}${fileName}`
      await FileSystem.writeAsStringAsync(filePath, content)

      setExportProgress(80)

      // Share file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath)
        setExportProgress(100)
      } else {
        throw new Error('Sharing is not available on this device')
      }
    } catch (error) {
      console.error('Export error:', error)
      Alert.alert(
        t('Export Error'),
        t('An error occurred while exporting the report')
      )
    } finally {
      setIsExporting(false)
      setExportModalVisible(false)
    }
  }

  const generateCSVReport = () => {
    // CSV header
    let csv = `${t('Date')},${t('Weekday')},${t('Check In')},${t(
      'Check Out'
    )},${t('Work Hours')},${t('OT Hours')},${t('Status')}\n`

    // Add data rows
    stats.dailyData.forEach((day) => {
      const date = day.date
      const weekday = getWeekdayName(
        new Date(day.date.split('/').reverse().join('-')).getDay()
      )
      const checkIn = day.checkIn ? formatTime(day.checkIn) : '--:--'
      const checkOut = day.checkOut ? formatTime(day.checkOut) : '--:--'
      const workHours = formatDuration(day.workTime)
      const otHours = formatDuration(day.overtime)
      const status = t(getStatusTranslationKey(day.status))

      csv += `${date},${weekday},${checkIn},${checkOut},${workHours},${otHours},${status}\n`
    })

    return csv
  }

  const formatTime = (date) => {
    if (!date) return '--:--'
    return `${date.getHours().toString().padStart(2, '0')}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
  }

  const getWeekdayName = (day) => {
    // Sử dụng hàm formatShortWeekday để lấy tên viết tắt của thứ
    return formatShortWeekday(day, language)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DU_CONG':
        return '✅'
      case 'DI_MUON':
        return '⏰'
      case 'VE_SOM':
        return '🏃'
      case 'DI_MUON_VE_SOM':
        return 'RV'
      case 'THIEU_LOG':
        return '❌'
      case 'NGHI_PHEP':
        return 'P'
      case 'NGHI_BENH':
        return 'B'
      case 'NGHI_LE':
        return 'L'
      case 'NGHI_THUONG':
        return 'T'
      case 'VANG_MAT':
        return 'V'
      case 'QUEN_CHECK_OUT':
        return '❓'
      default:
        return '-'
    }
  }

  const getStatusTranslationKey = (status) => {
    switch (status) {
      case 'DU_CONG':
        return 'Completed'
      case 'DI_MUON':
        return 'Late'
      case 'VE_SOM':
        return 'Early Leave'
      case 'DI_MUON_VE_SOM':
        return 'Late & Early'
      case 'THIEU_LOG':
        return 'Missing Log'
      case 'NGHI_PHEP':
        return 'Leave'
      case 'NGHI_BENH':
        return 'Sick Leave'
      case 'NGHI_LE':
        return 'Holiday'
      case 'NGHI_THUONG':
        return 'Weekend'
      case 'VANG_MAT':
        return 'Absent'
      case 'QUEN_CHECK_OUT':
        return 'Forgot Check Out'
      default:
        return 'Not Updated'
    }
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      {/* Time Range Selector */}
      <View
        style={[
          styles.timeRangeSelector,
          { backgroundColor: theme.secondaryCardColor },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            { backgroundColor: theme.secondaryCardColor },
            timeRange === 'week' && { backgroundColor: '#8a56ff' },
          ]}
          onPress={() => setTimeRange('week')}
        >
          <Text
            style={[
              styles.timeRangeButtonText,
              { color: theme.subtextColor },
              timeRange === 'week' && styles.activeTimeRangeButtonText,
            ]}
          >
            {language === 'vi' ? 'Tuần này' : 'This week'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            { backgroundColor: theme.secondaryCardColor },
            timeRange === 'month' && { backgroundColor: '#8a56ff' },
          ]}
          onPress={() => setTimeRange('month')}
        >
          <Text
            style={[
              styles.timeRangeButtonText,
              { color: theme.subtextColor },
              timeRange === 'month' && styles.activeTimeRangeButtonText,
            ]}
          >
            {language === 'vi' ? 'Tháng này' : 'This month'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.timeRangeButton,
            { backgroundColor: theme.secondaryCardColor },
            timeRange === 'year' && { backgroundColor: '#8a56ff' },
          ]}
          onPress={() => setTimeRange('year')}
        >
          <Text
            style={[
              styles.timeRangeButtonText,
              { color: theme.subtextColor },
              timeRange === 'year' && styles.activeTimeRangeButtonText,
            ]}
          >
            {language === 'vi' ? 'Năm nay' : 'This year'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Range */}
      <View style={styles.dateRangeContainer}>
        <Text style={[styles.dateRange, { color: theme.subtextColor }]}>
          {formatDateRange()}
        </Text>
      </View>

      {/* Hiển thị loading indicator trong khi vẫn hiển thị dữ liệu cũ */}
      {isLoading && (
        <View style={styles.overlayLoadingContainer}>
          <View style={styles.loadingIndicatorContainer}>
            <ActivityIndicator size="large" color="#8a56ff" />
            <Text style={styles.loadingText}>{t('Đang tải thống kê...')}</Text>
          </View>
        </View>
      )}

      {loadError ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
          <Text style={[styles.errorText, { color: theme.textColor }]}>
            {loadError}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              // Đặt lại trạng thái lỗi và thử lại
              console.log('Thử lại tải dữ liệu thống kê')
              setLoadError(null)

              // Đặt lại số lần thử lại
              retryCountRef.current = 0

              // Đánh dấu đang tải
              setIsLoading(true)

              // Đặt timeout để tránh tải dữ liệu quá sớm
              setTimeout(() => {
                if (isMountedRef.current) {
                  loadStatistics()
                    .catch((error) => {
                      console.error('Lỗi khi thử lại:', error)
                      if (isMountedRef.current) {
                        setLoadError(
                          'Không thể tải dữ liệu, vui lòng thử lại sau'
                        )
                      }
                    })
                    .finally(() => {
                      if (isMountedRef.current) {
                        // Cập nhật thời gian tải gần nhất
                        lastLoadTimeRef.current = Date.now()
                      }
                    })
                }
              }, 300)
            }}
          >
            <Text style={styles.retryButtonText}>{t('Thử lại')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Tổng giờ làm */}
          <View style={[styles.statCard, { backgroundColor: theme.cardColor }]}>
            <Text style={[styles.statTitle, { color: theme.textColor }]}>
              {language === 'vi' ? 'Tổng giờ làm' : 'Total work hours'}
            </Text>
            <Text style={[styles.statValue, { color: '#8a56ff' }]}>
              {formatDecimalHours(stats.totalWorkTime)}
            </Text>
          </View>

          {/* Tổng giờ OT */}
          <View style={[styles.statCard, { backgroundColor: theme.cardColor }]}>
            <Text style={[styles.statTitle, { color: theme.textColor }]}>
              {language === 'vi' ? 'Tổng giờ OT' : 'Total OT hours'}
            </Text>
            <Text style={[styles.statValue, { color: '#3498db' }]}>
              {formatDecimalHours(stats.overtime)}
            </Text>
          </View>

          {/* Ngày làm việc */}
          <View style={[styles.statCard, { backgroundColor: theme.cardColor }]}>
            <Text style={[styles.statTitle, { color: theme.textColor }]}>
              {language === 'vi' ? 'Ngày làm việc' : 'Work days'}
            </Text>
            <Text style={[styles.statValue, { color: '#27ae60' }]}>
              {Object.values(stats.statusCounts).reduce((a, b) => a + b, 0)}
            </Text>
          </View>

          {/* Phân bố trạng thái */}
          <View style={[styles.statCard, { backgroundColor: theme.cardColor }]}>
            <Text style={[styles.statTitle, { color: theme.textColor }]}>
              {language === 'vi' ? 'Phân bố trạng thái' : 'Status distribution'}
            </Text>

            <View style={styles.statusGrid}>
              {/* Hoàn thành */}
              <View style={styles.statusItem}>
                <View style={[styles.statusBox, styles.completedBox]}>
                  <Text style={styles.statusBoxValue}>
                    {stats.statusCounts.completed || 0}
                  </Text>
                </View>
                <Text style={[styles.statusLabel, { color: theme.textColor }]}>
                  {language === 'vi' ? 'Hoàn thành' : 'Completed'}
                </Text>
              </View>

              {/* Đi muộn */}
              <View style={styles.statusItem}>
                <View style={[styles.statusBox, styles.lateBox]}>
                  <Text style={styles.statusBoxValue}>
                    {stats.statusCounts.late || 0}
                  </Text>
                </View>
                <Text style={[styles.statusLabel, { color: theme.textColor }]}>
                  {language === 'vi' ? 'Đi muộn' : 'Late'}
                </Text>
              </View>

              {/* Về sớm */}
              <View style={styles.statusItem}>
                <View style={[styles.statusBox, styles.earlyBox]}>
                  <Text style={styles.statusBoxValue}>
                    {stats.statusCounts.earlyLeave || 0}
                  </Text>
                </View>
                <Text style={[styles.statusLabel, { color: theme.textColor }]}>
                  {language === 'vi' ? 'Về sớm' : 'Early leave'}
                </Text>
              </View>

              {/* Muộn & sớm */}
              <View style={styles.statusItem}>
                <View style={[styles.statusBox, styles.lateEarlyBox]}>
                  <Text style={styles.statusBoxValue}>
                    {stats.statusCounts.lateAndEarly || 0}
                  </Text>
                </View>
                <Text style={[styles.statusLabel, { color: theme.textColor }]}>
                  {language === 'vi' ? 'Muộn & sớm' : 'Late & early'}
                </Text>
              </View>

              {/* Thiếu log */}
              <View style={styles.statusItem}>
                <View style={[styles.statusBox, styles.missingBox]}>
                  <Text style={styles.statusBoxValue}>
                    {stats.statusCounts.missingLog || 0}
                  </Text>
                </View>
                <Text style={[styles.statusLabel, { color: theme.textColor }]}>
                  {language === 'vi' ? 'Thiếu log' : 'Missing log'}
                </Text>
              </View>

              {/* Nghỉ phép */}
              <View style={styles.statusItem}>
                <View style={[styles.statusBox, styles.leaveBox]}>
                  <Text style={styles.statusBoxValue}>
                    {stats.statusCounts.leave || 0}
                  </Text>
                </View>
                <Text style={[styles.statusLabel, { color: theme.textColor }]}>
                  {language === 'vi' ? 'Nghỉ phép' : 'Leave'}
                </Text>
              </View>
            </View>
          </View>

          {/* Bảng chi tiết */}
          <View
            style={[
              styles.tableContainer,
              { backgroundColor: theme.cardColor },
            ]}
          >
            <View
              style={[
                styles.tableHeader,
                { backgroundColor: theme.secondaryCardColor },
              ]}
            >
              <Text
                style={[
                  styles.tableHeaderCell,
                  styles.dayCell,
                  { color: theme.textColor },
                ]}
              >
                {language === 'vi' ? 'Ngày' : 'Date'}
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  styles.weekdayCell,
                  { color: theme.textColor },
                ]}
              >
                {language === 'vi' ? 'Thứ' : 'Day'}
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  styles.timeCell,
                  { color: theme.textColor },
                ]}
              >
                {language === 'vi' ? 'Vào' : 'In'}
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  styles.timeCell,
                  { color: theme.textColor },
                ]}
              >
                {language === 'vi' ? 'Ra' : 'Out'}
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  styles.hoursCell,
                  { color: theme.textColor },
                ]}
              >
                {language === 'vi' ? 'Giờ HC' : 'Std hrs'}
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  styles.otCell,
                  { color: theme.textColor },
                ]}
              >
                {language === 'vi' ? 'OT' : 'OT'}
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  styles.otCell,
                  { color: theme.textColor },
                ]}
              >
                {language === 'vi' ? 'CN' : 'Sun'}
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  styles.otCell,
                  { color: theme.textColor },
                ]}
              >
                {language === 'vi' ? 'Đêm' : 'Night'}
              </Text>
              <Text
                style={[
                  styles.tableHeaderCell,
                  styles.statusCell,
                  { color: theme.textColor },
                ]}
              >
                {language === 'vi' ? 'TT' : 'Status'}
              </Text>
            </View>

            <View style={styles.tableBody}>
              {stats.dailyData.length > 0 ? (
                stats.dailyData.map((day, index) => {
                  return (
                    <View
                      key={index}
                      style={[
                        styles.tableRow,
                        { borderBottomColor: theme.borderColor },
                        index % 2 === 0 && {
                          backgroundColor: darkMode ? '#1a1a1a' : '#f5f5f5',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tableCell,
                          styles.dayCell,
                          { color: theme.textColor },
                        ]}
                      >
                        {day.date}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.weekdayCell,
                          { color: theme.textColor },
                        ]}
                      >
                        {day.weekday}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.timeCell,
                          { color: theme.textColor },
                        ]}
                      >
                        {day.checkIn || '--:--'}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.timeCell,
                          { color: theme.textColor },
                        ]}
                      >
                        {day.checkOut || '--:--'}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.hoursCell,
                          { color: theme.textColor },
                        ]}
                      >
                        {formatDecimalHours(day.standardHours * 60)}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.otCell,
                          { color: theme.textColor },
                        ]}
                      >
                        {formatDecimalHours(day.otHours * 60)}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.otCell,
                          { color: theme.textColor },
                        ]}
                      >
                        {formatDecimalHours(day.sundayHours * 60)}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.otCell,
                          { color: theme.textColor },
                        ]}
                      >
                        {formatDecimalHours(day.nightHours * 60)}
                      </Text>
                      <Text
                        style={[
                          styles.tableCell,
                          styles.statusCell,
                          { color: theme.textColor },
                        ]}
                      >
                        {getStatusIcon(day.status)}
                      </Text>
                    </View>
                  )
                })
              ) : (
                <Text
                  style={[styles.noDataText, { color: theme.subtextColor }]}
                >
                  {language === 'vi'
                    ? 'Không có dữ liệu trong khoảng thời gian này'
                    : 'No data available for this time range'}
                </Text>
              )}
            </View>
          </View>
        </>
      )}

      {/* Custom Date Range Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={customRangeModalVisible}
        onRequestClose={() => setCustomRangeModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.cardColor }]}
          >
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>
              {t('Select Date Range')}
            </Text>

            <View style={styles.datePickerContainer}>
              <Text
                style={[styles.datePickerLabel, { color: theme.textColor }]}
              >
                {t('Start Date')}
              </Text>
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  { backgroundColor: theme.secondaryCardColor },
                ]}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text
                  style={[
                    styles.datePickerButtonText,
                    { color: theme.textColor },
                  ]}
                >
                  {formatDate(startDate)}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.textColor}
                />
              </TouchableOpacity>

              {showStartDatePicker && (
                <DateTimePicker
                  value={startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleStartDateChange}
                />
              )}
            </View>

            <View style={styles.datePickerContainer}>
              <Text
                style={[styles.datePickerLabel, { color: theme.textColor }]}
              >
                {t('End Date')}
              </Text>
              <TouchableOpacity
                style={[
                  styles.datePickerButton,
                  { backgroundColor: theme.secondaryCardColor },
                ]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text
                  style={[
                    styles.datePickerButtonText,
                    { color: theme.textColor },
                  ]}
                >
                  {formatDate(endDate)}
                </Text>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={theme.textColor}
                />
              </TouchableOpacity>

              {showEndDatePicker && (
                <DateTimePicker
                  value={endDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleEndDateChange}
                />
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setCustomRangeModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#8a56ff' }]}
                onPress={applyCustomDateRange}
              >
                <Text style={styles.applyButtonText}>{t('Apply')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Export Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={exportModalVisible}
        onRequestClose={() => setExportModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.cardColor }]}
          >
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>
              {t('Export Report')}
            </Text>

            {isExporting ? (
              <View style={styles.exportProgressContainer}>
                <ActivityIndicator size="large" color="#8a56ff" />
                <Text
                  style={[
                    styles.exportProgressText,
                    { color: theme.textColor },
                  ]}
                >
                  {t('Exporting')}... {exportProgress}%
                </Text>
              </View>
            ) : (
              <>
                <Text
                  style={[styles.exportFormatLabel, { color: theme.textColor }]}
                >
                  {t('Select Format')}
                </Text>

                <View style={styles.exportFormatOptions}>
                  <TouchableOpacity
                    style={[
                      styles.exportFormatOption,
                      { backgroundColor: theme.secondaryCardColor },
                      exportFormat === 'csv' && {
                        backgroundColor: '#8a56ff',
                      },
                    ]}
                    onPress={() => setExportFormat('csv')}
                  >
                    <Text
                      style={[
                        styles.exportFormatText,
                        { color: theme.textColor },
                        exportFormat === 'csv' && { color: '#fff' },
                      ]}
                    >
                      CSV
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.exportFormatOption,
                      { backgroundColor: theme.secondaryCardColor },
                      exportFormat === 'pdf' && {
                        backgroundColor: '#8a56ff',
                      },
                    ]}
                    onPress={() => setExportFormat('pdf')}
                  >
                    <Text
                      style={[
                        styles.exportFormatText,
                        { color: theme.textColor },
                        exportFormat === 'pdf' && { color: '#fff' },
                      ]}
                    >
                      PDF
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.exportFormatOption,
                      { backgroundColor: theme.secondaryCardColor },
                      exportFormat === 'excel' && {
                        backgroundColor: '#8a56ff',
                      },
                    ]}
                    onPress={() => setExportFormat('excel')}
                  >
                    <Text
                      style={[
                        styles.exportFormatText,
                        { color: theme.textColor },
                        exportFormat === 'excel' && { color: '#fff' },
                      ]}
                    >
                      Excel
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setExportModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>{t('Cancel')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: '#8a56ff' }]}
                    onPress={exportReport}
                  >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                      {t('Export')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  activeTimeRangeButtonText: {
    color: '#fff',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  cancelButton: {
    backgroundColor: '#ddd',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  completedBox: {
    backgroundColor: '#27ae60',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  datePickerButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  datePickerButtonText: {
    fontSize: 16,
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  datePickerLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  dateRange: {
    fontSize: 16,
    textAlign: 'center',
  },
  dateRangeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dayCell: {
    flex: 1.5,
  },
  earlyBox: {
    backgroundColor: '#e67e22',
  },

  hoursCell: {
    flex: 1,
    textAlign: 'center',
  },
  lateBox: {
    backgroundColor: '#e74c3c',
  },
  lateEarlyBox: {
    backgroundColor: '#9b59b6',
  },
  leaveBox: {
    backgroundColor: '#34495e',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  // Overlay loading container để hiển thị loading indicator trên dữ liệu
  overlayLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingIndicatorContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    color: '#333',
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
  missingBox: {
    backgroundColor: '#f1c40f',
  },
  modalButton: {
    borderRadius: 8,
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    width: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  noDataText: {
    fontStyle: 'italic',
    padding: 20,
    textAlign: 'center',
  },
  otCell: {
    flex: 1,
    textAlign: 'center',
  },
  statusCell: {
    flex: 0.6,
    textAlign: 'center',
  },
  statCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
  },
  statTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statusBox: {
    alignItems: 'center',
    borderRadius: 8,
    height: 60,
    justifyContent: 'center',
    marginBottom: 4,
  },
  statusBoxValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  statusItem: {
    marginBottom: 12,
    width: '30%',
  },
  statusLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  tableBody: {
    padding: 8,
  },
  tableCell: {
    fontSize: 14,
  },
  tableContainer: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  tableHeaderCell: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tableRow: {
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 10,
  },
  timeCell: {
    flex: 1.5,
    textAlign: 'center',
  },
  timeRangeButton: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    paddingVertical: 8,
  },
  timeRangeButtonText: {
    fontWeight: '500',
  },
  timeRangeSelector: {
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 16,
    padding: 4,
  },
  weekdayCell: {
    flex: 1,
  },
  exportFormatOption: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
  },
  exportFormatOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  exportFormatText: {
    fontSize: 14,
    fontWeight: '500',
  },
  exportProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  exportProgressText: {
    fontSize: 16,
    marginTop: 12,
  },
})

export default StatisticsScreen

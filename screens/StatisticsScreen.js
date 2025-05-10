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
  FlatList,
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
  const [timeRange, setTimeRange] = useState('week') // 'week', 'month', 'year', 'custom'
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [stats, setStats] = useState({
    totalWorkTime: 0,
    overtime: 0,
    statusCounts: {},
    dailyData: [],
  })

  // Custom date range - Khởi tạo với ngày đầu tuần và cuối tuần hiện tại
  const getCurrentWeekDates = () => {
    const now = new Date()
    const dayOfWeek = now.getDay() || 7 // Convert Sunday (0) to 7

    // Tính ngày đầu tuần (thứ 2)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - dayOfWeek + 1)
    startOfWeek.setHours(0, 0, 0, 0)

    // Tính ngày cuối tuần (chủ nhật)
    const endOfWeek = new Date(now)
    endOfWeek.setDate(now.getDate() + (7 - dayOfWeek))
    endOfWeek.setHours(23, 59, 59, 999)

    return { startOfWeek, endOfWeek }
  }

  const { startOfWeek, endOfWeek } = getCurrentWeekDates()
  const [startDate, setStartDate] = useState(startOfWeek)
  const [endDate, setEndDate] = useState(endOfWeek)
  const [showStartDatePicker, setShowStartDatePicker] = useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = useState(false)
  const [customRangeModalVisible, setCustomRangeModalVisible] = useState(false)
  const [exportModalVisible, setExportModalVisible] = useState(false)
  const [exportFormat, setExportFormat] = useState('csv') // 'csv', 'pdf', 'excel'
  const [exportProgress, setExportProgress] = useState(0)
  const [isExporting, setIsExporting] = useState(false)
  const [visibleRecords, setVisibleRecords] = useState(15) // Số lượng bản ghi hiển thị ban đầu
  const [currentPage, setCurrentPage] = useState(1) // Trang hiện tại cho phân trang
  const [pageSize, setPageSize] = useState(30) // Kích thước trang (số bản ghi mỗi trang)

  const getDateRange = useCallback(
    (range) => {
      const now = new Date()
      let rangeEnd = new Date(now)
      let rangeStart = new Date(now)

      // Get day of week outside switch
      const dayOfWeek = now.getDay() || 7 // Convert Sunday (0) to 7

      console.log(
        `[DEBUG] getDateRange - range: ${range}, ngày hiện tại: ${formatDate(
          now
        )}, thứ: ${dayOfWeek}`
      )

      switch (range) {
        case 'week':
          // Start from beginning of current week (Monday)
          rangeStart.setDate(now.getDate() - dayOfWeek + 1) // Monday
          // End at end of current week (Sunday)
          rangeEnd.setDate(now.getDate() + (7 - dayOfWeek)) // Sunday
          break
        case 'month':
          // Start from beginning of current month
          rangeStart = new Date(now.getFullYear(), now.getMonth(), 1)
          // End at end of current month
          rangeEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
          break
        case 'year':
          // Start from beginning of current year
          rangeStart = new Date(now.getFullYear(), 0, 1)
          // End at end of current year
          rangeEnd = new Date(now.getFullYear(), 11, 31)
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

      console.log(
        `[DEBUG] getDateRange - kết quả: ${formatDate(
          rangeStart
        )} - ${formatDate(rangeEnd)}`
      )

      return { rangeStart, rangeEnd }
    },
    [startDate, endDate, formatDate]
  )

  // Lưu cache dữ liệu đã tải để tránh tải lại nhiều lần
  const workStatusCache = useRef({})

  const loadDailyWorkStatuses = useCallback(
    async (startDate, endDate) => {
      try {
        console.log(
          '[DEBUG] Bắt đầu tải dữ liệu trạng thái làm việc hàng ngày...'
        )
        console.log(
          `[DEBUG] Khoảng thời gian: ${formatDate(startDate)} - ${formatDate(
            endDate
          )}`
        )

        // Tạo cache key dựa trên khoảng thời gian
        const cacheKey = `${formatDate(startDate)}_${formatDate(endDate)}`

        // Kiểm tra cache trước khi tải dữ liệu mới
        if (workStatusCache.current[cacheKey]) {
          console.log('[DEBUG] Sử dụng dữ liệu từ cache')
          return workStatusCache.current[cacheKey]
        }

        // Giới hạn số lượng ngày để tránh quá tải
        let MAX_DAYS = 31 // Mặc định 31 ngày cho tab tuần và tháng

        // Điều chỉnh MAX_DAYS dựa trên timeRange
        if (
          formatDate(startDate).split('/')[2] !==
          formatDate(endDate).split('/')[2]
        ) {
          // Nếu năm khác nhau (tab Year), tăng giới hạn lên 366 ngày
          MAX_DAYS = 366
          console.log('[DEBUG] Đã tăng giới hạn ngày lên 366 cho tab Year')
        } else if (
          formatDate(startDate).split('/')[1] !==
          formatDate(endDate).split('/')[1]
        ) {
          // Nếu tháng khác nhau (tab Month), tăng giới hạn lên 62 ngày
          MAX_DAYS = 62
          console.log('[DEBUG] Đã tăng giới hạn ngày lên 62 cho tab Month')
        }

        // Tính số ngày trong khoảng
        const daysDiff =
          Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
        console.log(
          `[DEBUG] Số ngày cần xử lý: ${daysDiff}, giới hạn: ${MAX_DAYS}`
        )

        if (daysDiff > MAX_DAYS) {
          console.warn(
            `[DEBUG] Khoảng thời gian quá lớn (${daysDiff} ngày), giới hạn xuống ${MAX_DAYS} ngày`
          )
          // Điều chỉnh ngày kết thúc
          endDate = new Date(startDate)
          endDate.setDate(startDate.getDate() + MAX_DAYS - 1)
        }

        // Chuẩn bị danh sách các ngày cần xử lý
        const daysToProcess = []
        const currentDate = new Date(startDate)
        while (currentDate <= endDate) {
          daysToProcess.push(formatDate(currentDate))
          currentDate.setDate(currentDate.getDate() + 1)
        }
        console.log(`Cần xử lý ${daysToProcess.length} ngày`)

        // Tạo danh sách keys cần lấy trực tiếp từ ngày
        const keysToGet = daysToProcess.map(
          (dateKey) => `${STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX}${dateKey}`
        )

        console.log(`Đang lấy dữ liệu cho ${keysToGet.length} keys...`)

        if (keysToGet.length === 0) {
          console.log('Không có dữ liệu nào trong khoảng thời gian này')
          return { data: [], hasRealData: false, successRate: 0 }
        }

        // Chia nhỏ danh sách keys thành các batch để tránh quá tải
        const BATCH_SIZE = 5 // Tăng kích thước batch lên 5 để giảm số lần gọi AsyncStorage
        const batches = []
        for (let i = 0; i < keysToGet.length; i += BATCH_SIZE) {
          batches.push(keysToGet.slice(i, i + BATCH_SIZE))
        }

        console.log(
          `[DEBUG] Chia thành ${batches.length} batch, mỗi batch ${BATCH_SIZE} key`
        )

        // Lấy dữ liệu theo từng batch
        const filteredStatusData = []
        let successfulBatches = 0
        let failedBatches = 0
        let hasRealData = false

        // Xử lý tất cả các batch cùng lúc để tăng tốc độ
        const batchPromises = batches.map(async (batch, index) => {
          try {
            // Sử dụng Promise.race với timeout để tránh treo
            const statusPairs = await Promise.race([
              AsyncStorage.multiGet(batch),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Timeout')), 2000)
              ),
            ])

            // Xử lý dữ liệu trong batch
            const validItems = []
            for (const [key, value] of statusPairs) {
              if (!value) continue

              try {
                const dateKey = key.replace(
                  STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX,
                  ''
                )
                const status = JSON.parse(value)

                // Kiểm tra dữ liệu hợp lệ
                if (!status || typeof status !== 'object') continue

                // Thêm trường date nếu chưa có
                if (!status.date) status.date = dateKey

                // Kiểm tra các trường bắt buộc
                if (!status.status) status.status = 'CHUA_CAP_NHAT'

                validItems.push(status)
                hasRealData = true
              } catch (parseError) {
                // Bỏ qua các mục không hợp lệ
              }
            }

            successfulBatches++
            return validItems
          } catch (batchError) {
            failedBatches++
            return []
          }
        })

        // Đợi tất cả các batch hoàn thành
        const batchResults = await Promise.all(batchPromises)

        // Gộp kết quả từ tất cả các batch
        batchResults.forEach((items) => {
          filteredStatusData.push(...items)
        })

        console.log(
          `Đã lọc được ${filteredStatusData.length} bản ghi có dữ liệu`
        )
        console.log(
          `Batches thành công: ${successfulBatches}/${batches.length}, thất bại: ${failedBatches}/${batches.length}`
        )

        // Sắp xếp dữ liệu theo ngày để đảm bảo thứ tự đúng (mới nhất trước)
        filteredStatusData.sort((a, b) => {
          if (!a.date || !b.date) return 0
          return b.date.localeCompare(a.date) // Sắp xếp giảm dần (mới nhất trước)
        })

        const result = {
          data: filteredStatusData,
          hasRealData,
          successRate:
            batches.length > 0 ? successfulBatches / batches.length : 0,
        }

        // Lưu kết quả vào cache
        workStatusCache.current[cacheKey] = result

        return result
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu trạng thái làm việc:', error)
        return {
          data: [],
          hasRealData: false,
          successRate: 0,
        } // Trả về đối tượng với mảng rỗng trong trường hợp có lỗi
      }
    },
    [formatDate, STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX]
  )

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

  // Cache cho kết quả tính toán thống kê
  const statsCache = useRef({})

  const calculateStatistics = useCallback(
    (workStatuses, startDate, endDate) => {
      console.log('[DEBUG] Bắt đầu tính toán thống kê...')

      try {
        // Tạo cache key dựa trên khoảng thời gian và số lượng bản ghi
        const cacheKey = `${formatDate(startDate)}_${formatDate(endDate)}_${
          workStatuses.length
        }`

        // Kiểm tra cache trước khi tính toán lại
        if (statsCache.current[cacheKey]) {
          console.log('[DEBUG] Sử dụng kết quả tính toán từ cache')
          return statsCache.current[cacheKey]
        }

        // Kiểm tra dữ liệu đầu vào
        if (!Array.isArray(workStatuses)) {
          console.error('[DEBUG] workStatuses không phải là mảng')
          workStatuses = []
        }

        if (!startDate || !endDate) {
          console.error('[DEBUG] startDate hoặc endDate không hợp lệ')
          startDate = new Date()
          endDate = new Date()
        }

        // Khởi tạo thống kê
        const stats = getDefaultStats()

        // Tạo danh sách các ngày đã xử lý
        const processedDates = []

        // Giới hạn số lượng bản ghi để xử lý
        let MAX_RECORDS = 30 // Mặc định 30 bản ghi

        // Điều chỉnh MAX_RECORDS dựa trên khoảng thời gian
        const daysDiff =
          Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1

        if (daysDiff > 300) {
          // Nếu là tab Year
          MAX_RECORDS = 366
          console.log('[DEBUG] Đã tăng giới hạn bản ghi lên 366 cho tab Year')
        } else if (daysDiff > 30) {
          // Nếu là tab Month
          MAX_RECORDS = 62
          console.log('[DEBUG] Đã tăng giới hạn bản ghi lên 62 cho tab Month')
        }

        const recordsToProcess = workStatuses.slice(0, MAX_RECORDS)

        if (workStatuses.length > MAX_RECORDS) {
          console.warn(
            `[DEBUG] Giới hạn số lượng bản ghi từ ${workStatuses.length} xuống ${MAX_RECORDS}`
          )
        }

        // Xử lý tất cả các bản ghi cùng lúc để tăng tốc độ
        recordsToProcess.forEach((status) => {
          try {
            // Kiểm tra bản ghi hợp lệ
            if (!status || typeof status !== 'object' || !status.date) {
              return // Bỏ qua bản ghi không hợp lệ
            }

            // Thêm vào danh sách ngày đã xử lý
            processedDates.push(status.date)

            // Chuyển đổi ngày để hiển thị
            let dateObj
            try {
              dateObj = new Date(status.date.split('-').join('/'))
              if (isNaN(dateObj.getTime())) {
                return // Bỏ qua nếu ngày không hợp lệ
              }
            } catch (dateError) {
              return // Bỏ qua nếu không thể chuyển đổi ngày
            }

            const displayDate = formatShortDate(dateObj, language)
            const weekday = getWeekdayName(dateObj.getDay())

            // Log dữ liệu để debug
            console.log(
              `[DEBUG] Dữ liệu trạng thái cho ngày ${status.date}:`,
              JSON.stringify(status)
            )

            // Chuyển đổi và kiểm tra các giá trị số
            let standardHours = parseFloat(status.standardHoursScheduled) || 0
            let otHours = parseFloat(status.otHoursScheduled) || 0
            let sundayHours = parseFloat(status.sundayHoursScheduled) || 0
            let nightHours = parseFloat(status.nightHoursScheduled) || 0

            // Nếu trạng thái là DU_CONG nhưng không có giá trị giờ làm, đặt giá trị mặc định
            if (status.status === 'DU_CONG' && standardHours === 0) {
              // Đặt giá trị mặc định cho ngày đủ công (8 giờ làm việc chuẩn)
              standardHours = 8.0

              // Cập nhật lại tổng giờ làm
              const totalHours = standardHours + otHours + sundayHours

              console.log(
                `[DEBUG] Đặt giá trị mặc định cho ngày ${status.date} có trạng thái DU_CONG:`,
                {
                  standardHours,
                  otHours,
                  sundayHours,
                  nightHours,
                  totalHours,
                }
              )
            }

            console.log(`[DEBUG] Giá trị giờ làm cho ngày ${status.date}:`, {
              standardHours,
              otHours,
              sundayHours,
              nightHours,
              totalHours: parseFloat(status.totalHoursScheduled) || 0,
              status: status.status,
            })

            // Kiểm tra giá trị hợp lệ trước khi cộng dồn
            if (
              isNaN(standardHours) ||
              isNaN(otHours) ||
              isNaN(sundayHours) ||
              isNaN(nightHours)
            ) {
              console.log(
                `[DEBUG] Bỏ qua ngày ${status.date} do có giá trị không hợp lệ`
              )
              return // Bỏ qua nếu có giá trị không hợp lệ
            }

            // Tính tổng giờ làm
            const totalHours = standardHours + otHours + sundayHours

            // Cộng dồn vào tổng
            stats.standardHours += standardHours
            stats.otHours += otHours
            stats.sundayHours += sundayHours
            stats.nightHours += nightHours
            stats.totalWorkTime += standardHours * 60
            stats.overtime += otHours * 60

            console.log(`[DEBUG] Cộng dồn giờ làm cho ngày ${status.date}:`, {
              standardHours,
              otHours,
              sundayHours,
              nightHours,
              totalHours,
              runningTotal: {
                standardHours: stats.standardHours,
                otHours: stats.otHours,
                totalWorkTime: stats.totalWorkTime / 60,
                overtime: stats.overtime / 60,
              },
            })

            // Cập nhật số lượng theo trạng thái
            if (
              status.status &&
              stats.statusCounts.hasOwnProperty(status.status)
            ) {
              stats.statusCounts[status.status]++
            } else {
              stats.statusCounts.CHUA_CAP_NHAT++
            }

            // Thêm vào dữ liệu hàng ngày
            stats.dailyData.push({
              date: displayDate,
              weekday: weekday,
              checkIn: status.vaoLogTime || '--:--',
              checkOut: status.raLogTime || '--:--',
              standardHours: standardHours,
              otHours: otHours,
              sundayHours: sundayHours,
              nightHours: nightHours,
              totalHours: totalHours, // Sử dụng tổng giờ làm đã tính toán
              status: status.status || 'CHUA_CAP_NHAT',
              lateMinutes: parseInt(status.lateMinutes) || 0,
              earlyMinutes: parseInt(status.earlyMinutes) || 0,
            })
          } catch (itemError) {
            // Bỏ qua lỗi và tiếp tục với bản ghi tiếp theo
          }
        })

        // Thêm các ngày thiếu trong khoảng thời gian (giới hạn số ngày)
        let MAX_DAYS_TO_ADD = 15 // Mặc định 15 ngày

        // Điều chỉnh MAX_DAYS_TO_ADD dựa trên khoảng thời gian
        const daysDiff =
          Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1

        if (daysDiff > 300) {
          // Nếu là tab Year
          MAX_DAYS_TO_ADD = 366
          console.log(
            '[DEBUG] Đã tăng giới hạn ngày thêm vào lên 366 cho tab Year'
          )
        } else if (daysDiff > 30) {
          // Nếu là tab Month
          MAX_DAYS_TO_ADD = 62
          console.log(
            '[DEBUG] Đã tăng giới hạn ngày thêm vào lên 62 cho tab Month'
          )
        }

        let daysAdded = 0
        const currentDate = new Date(startDate)

        console.log(
          `[DEBUG] Bắt đầu thêm các ngày thiếu, giới hạn: ${MAX_DAYS_TO_ADD}`
        )

        while (currentDate <= endDate && daysAdded < MAX_DAYS_TO_ADD) {
          const dateKey = formatDate(currentDate)

          if (!processedDates.includes(dateKey)) {
            // Ngày chưa có trạng thái, đánh dấu là chưa cập nhật
            stats.statusCounts.CHUA_CAP_NHAT++

            // Định dạng ngày để hiển thị
            const displayDate = formatShortDate(currentDate, language)
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

          // Chuyển sang ngày tiếp theo
          currentDate.setDate(currentDate.getDate() + 1)
        }

        // Sắp xếp dữ liệu theo ngày (giới hạn số lượng bản ghi)
        let MAX_RECORDS_TO_DISPLAY = 100 // Mặc định 100 bản ghi

        // Điều chỉnh MAX_RECORDS_TO_DISPLAY dựa trên khoảng thời gian
        if (daysDiff > 300) {
          // Nếu là tab Year
          MAX_RECORDS_TO_DISPLAY = 366
          console.log(
            '[DEBUG] Đã tăng giới hạn bản ghi hiển thị lên 366 cho tab Year'
          )
        } else if (daysDiff > 30) {
          // Nếu là tab Month
          MAX_RECORDS_TO_DISPLAY = 100
          console.log(
            '[DEBUG] Đã tăng giới hạn bản ghi hiển thị lên 100 cho tab Month'
          )
        }

        console.log(
          `[DEBUG] Số bản ghi trước khi giới hạn: ${stats.dailyData.length}, giới hạn: ${MAX_RECORDS_TO_DISPLAY}`
        )

        if (stats.dailyData.length > MAX_RECORDS_TO_DISPLAY) {
          stats.dailyData = stats.dailyData.slice(0, MAX_RECORDS_TO_DISPLAY)
          console.log(
            `[DEBUG] Đã giới hạn số bản ghi xuống ${stats.dailyData.length}`
          )
        }

        // Sắp xếp dữ liệu theo ngày (mới nhất trước)
        stats.dailyData.sort((a, b) => {
          try {
            // Chuyển đổi định dạng ngày DD/MM/YYYY thành YYYY-MM-DD để so sánh
            const partsA = a.date.split('/')
            const partsB = b.date.split('/')

            if (partsA.length !== 3 || partsB.length !== 3) {
              return 0 // Không thể so sánh nếu định dạng không đúng
            }

            // Tạo chuỗi YYYY-MM-DD
            const dateStrA = `${partsA[2]}-${partsA[1]}-${partsA[0]}`
            const dateStrB = `${partsB[2]}-${partsB[1]}-${partsB[0]}`

            // Sắp xếp giảm dần (mới nhất trước)
            return dateStrB.localeCompare(dateStrA)
          } catch (sortError) {
            return 0
          }
        })

        // Lưu kết quả vào cache
        statsCache.current[cacheKey] = stats

        console.log('[DEBUG] Hoàn thành tính toán thống kê')
        return stats
      } catch (error) {
        console.error('[DEBUG] Lỗi trong quá trình tính toán thống kê:', error)
        // Trả về dữ liệu mặc định khi có lỗi
        return getDefaultStats()
      }
    },
    [language, formatDate]
  )

  const formatDateRange = () => {
    const { rangeStart, rangeEnd } = getDateRange(timeRange)
    return `${formatDate(rangeStart)} - ${formatDate(rangeEnd)}`
  }

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false)
    if (selectedDate) {
      // Đặt giờ, phút, giây, mili giây về 0 để lấy đầu ngày
      selectedDate.setHours(0, 0, 0, 0)
      console.log(`[DEBUG] Đã chọn ngày bắt đầu: ${formatDate(selectedDate)}`)
      setStartDate(selectedDate)
    }
  }

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false)
    if (selectedDate) {
      // Đặt giờ, phút, giây, mili giây về cuối ngày
      selectedDate.setHours(23, 59, 59, 999)
      console.log(`[DEBUG] Đã chọn ngày kết thúc: ${formatDate(selectedDate)}`)
      setEndDate(selectedDate)
    }
  }

  const applyCustomDateRange = () => {
    console.log(
      `[DEBUG] Áp dụng khoảng thời gian tùy chỉnh: ${formatDate(
        startDate
      )} - ${formatDate(endDate)}`
    )

    // Kiểm tra nếu ngày bắt đầu lớn hơn ngày kết thúc
    if (startDate > endDate) {
      // Đổi chỗ ngày bắt đầu và ngày kết thúc
      const temp = new Date(startDate)
      setStartDate(new Date(endDate))
      setEndDate(temp)
      console.log(
        `[DEBUG] Đã đổi chỗ ngày bắt đầu và ngày kết thúc: ${formatDate(
          endDate
        )} - ${formatDate(startDate)}`
      )
    }

    setTimeRange('custom')
    setCustomRangeModalVisible(false)

    // Xóa cache để đảm bảo dữ liệu mới được tải
    workStatusCache.current = {}
    loadStatisticsCache.current = {}
    // Đặt lại số lượng bản ghi hiển thị
    setVisibleRecords(15)

    // Tải dữ liệu mới trong background mà không chặn UI
    setTimeout(() => {
      if (isMountedRef.current) {
        loadStatistics()
      }
    }, 0)
  }

  // Lưu cache cho kết quả tải dữ liệu thống kê
  const loadStatisticsCache = useRef({})

  // Tham chiếu để theo dõi thời gian cập nhật dữ liệu gần nhất
  const lastUpdateTimeRef = useRef(0)

  const loadStatistics = useCallback(async () => {
    // Nếu đã đang tải, không thực hiện tải lại để tránh vòng lặp vô hạn
    if (isLoadingRef.current) {
      console.log('[DEBUG] Đã đang tải dữ liệu, bỏ qua yêu cầu tải lại')
      return
    }

    console.log(`[DEBUG] Bắt đầu tải dữ liệu thống kê cho tab: ${timeRange}...`)

    // Lấy khoảng thời gian
    const { rangeStart, rangeEnd } = getDateRange(timeRange)

    // Tạo cache key dựa trên khoảng thời gian
    const cacheKey = `${formatDate(rangeStart)}_${formatDate(rangeEnd)}`

    console.log(`[DEBUG] Cache key: ${cacheKey}, timeRange: ${timeRange}`)

    // Kiểm tra cache trước khi tải dữ liệu mới
    if (loadStatisticsCache.current[cacheKey]) {
      console.log(`[DEBUG] Sử dụng kết quả từ cache cho tab: ${timeRange}`)
      setStats(loadStatisticsCache.current[cacheKey])
      return
    }

    // Đánh dấu đang tải nhưng không xóa dữ liệu cũ
    setIsLoading(true)
    isLoadingRef.current = true
    setLoadError(null)

    // Tải dữ liệu trong background mà không chặn UI
    const loadDataInBackground = async () => {
      // Biến để theo dõi timeout
      let timeoutId = null

      try {
        console.log(
          `Khoảng thời gian: ${formatDate(rangeStart)} - ${formatDate(
            rangeEnd
          )}`
        )

        // Tải dữ liệu trạng thái làm việc
        console.log('Đang tải dữ liệu trạng thái làm việc...')

        let workStatusResult
        try {
          workStatusResult = await Promise.race([
            loadDailyWorkStatuses(rangeStart, rangeEnd),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Timeout')), 8000)
            ),
          ])
        } catch (error) {
          console.error('Lỗi khi tải dữ liệu trạng thái làm việc:', error)

          // Nếu component vẫn mounted, hiển thị lỗi nhưng giữ lại dữ liệu cũ
          if (isMountedRef.current) {
            setLoadError('Không thể tải dữ liệu, vui lòng thử lại')
            setIsLoading(false)
            isLoadingRef.current = false
          }
          return
        }

        // Kiểm tra nếu component đã unmounted
        if (!isMountedRef.current) return

        // Xử lý kết quả từ loadDailyWorkStatuses
        let workStatuses = []

        if (workStatusResult && typeof workStatusResult === 'object') {
          workStatuses = Array.isArray(workStatusResult.data)
            ? workStatusResult.data
            : []
        } else if (Array.isArray(workStatusResult)) {
          workStatuses = workStatusResult
        } else {
          // Nếu dữ liệu không hợp lệ, hiển thị lỗi nhưng giữ lại dữ liệu cũ
          if (isMountedRef.current) {
            setLoadError('Dữ liệu không hợp lệ')
            setIsLoading(false)
            isLoadingRef.current = false
          }
          return
        }

        // Nếu không có dữ liệu, hiển thị thông báo nhưng không xóa dữ liệu cũ
        if (workStatuses.length === 0) {
          if (isMountedRef.current) {
            setLoadError('Không có dữ liệu trong khoảng thời gian này')
            setIsLoading(false)
            isLoadingRef.current = false
          }
          return
        }

        // Giới hạn số lượng bản ghi để tính toán
        let MAX_RECORDS = 30 // Mặc định 30 bản ghi

        // Điều chỉnh MAX_RECORDS dựa trên timeRange
        if (timeRange === 'year') {
          MAX_RECORDS = 366 // Tăng lên cho tab Year
          console.log(
            `[DEBUG] Đã tăng giới hạn bản ghi lên ${MAX_RECORDS} cho tab Year`
          )
        } else if (timeRange === 'month') {
          MAX_RECORDS = 62 // Tăng lên cho tab Month
          console.log(
            `[DEBUG] Đã tăng giới hạn bản ghi lên ${MAX_RECORDS} cho tab Month`
          )
        }

        if (workStatuses.length > MAX_RECORDS) {
          console.log(
            `Giới hạn số lượng bản ghi từ ${workStatuses.length} xuống ${MAX_RECORDS}`
          )

          // Sắp xếp theo ngày trước khi cắt bớt
          workStatuses.sort((a, b) => {
            if (!a.date || !b.date) return 0
            return b.date.localeCompare(a.date) // Sắp xếp giảm dần (mới nhất trước)
          })

          workStatuses = workStatuses.slice(0, MAX_RECORDS)
        }

        // Tính toán thống kê trong background
        console.log('Đang tính toán thống kê...')

        let calculatedStats
        try {
          // Sử dụng requestAnimationFrame để tránh treo UI
          calculatedStats = await new Promise((resolve) => {
            requestAnimationFrame(() => {
              try {
                const stats = calculateStatistics(
                  workStatuses,
                  rangeStart,
                  rangeEnd
                )
                resolve(stats)
              } catch (error) {
                console.error('Lỗi khi tính toán thống kê:', error)
                resolve(null)
              }
            })
          })
        } catch (error) {
          console.error('Lỗi khi tính toán thống kê:', error)

          // Nếu component vẫn mounted, hiển thị lỗi nhưng giữ lại dữ liệu cũ
          if (isMountedRef.current) {
            setLoadError('Lỗi khi tính toán thống kê')
            setIsLoading(false)
            isLoadingRef.current = false
          }
          return
        }

        // Kiểm tra nếu component đã unmounted
        if (!isMountedRef.current) return

        // Kiểm tra kết quả tính toán
        if (!calculatedStats) {
          if (isMountedRef.current) {
            setLoadError('Lỗi khi tính toán thống kê')
            setIsLoading(false)
            isLoadingRef.current = false
          }
          return
        }

        // Lưu kết quả vào cache
        loadStatisticsCache.current[cacheKey] = calculatedStats

        // Cập nhật state với kết quả mới
        if (isMountedRef.current) {
          // Sử dụng requestAnimationFrame để cập nhật UI mượt mà
          requestAnimationFrame(() => {
            console.log(`[DEBUG] Cập nhật dữ liệu cho tab: ${timeRange}`)
            setStats(calculatedStats)
            setLoadError(null)
            setIsLoading(false)
            isLoadingRef.current = false
            lastUpdateTimeRef.current = Date.now()
            console.log(
              `[DEBUG] Đã hoàn thành cập nhật dữ liệu cho tab: ${timeRange}`
            )
          })
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu thống kê:', error)

        // Nếu component vẫn mounted, hiển thị lỗi nhưng giữ lại dữ liệu cũ
        if (isMountedRef.current) {
          // Hiển thị thông báo lỗi phù hợp
          if (
            error.message === 'Timeout' ||
            error.message === 'Tải dữ liệu quá thời gian'
          ) {
            setLoadError('Tải dữ liệu quá thời gian, vui lòng thử lại')
          } else {
            setLoadError('Đã xảy ra lỗi khi tải dữ liệu, vui lòng thử lại')
          }

          setIsLoading(false)
          isLoadingRef.current = false
        }
      } finally {
        // Xóa timeout nếu vẫn còn
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        // Đảm bảo luôn thoát khỏi trạng thái loading
        if (isMountedRef.current) {
          isLoadingRef.current = false
          setIsLoading(false)
        } else {
          isLoadingRef.current = false
        }
      }
    }

    // Bắt đầu tải dữ liệu trong background
    loadDataInBackground().catch((error) => {
      console.error('Lỗi không xử lý được khi tải dữ liệu:', error)

      // Đảm bảo luôn thoát khỏi trạng thái loading
      if (isMountedRef.current) {
        isLoadingRef.current = false
        setIsLoading(false)
        setLoadError('Đã xảy ra lỗi không mong đợi, vui lòng thử lại')
      }
    })
  }, [
    timeRange,
    calculateStatistics,
    getDateRange,
    loadDailyWorkStatuses,
    isMountedRef,
    formatDate,
  ])

  // Hàm trả về dữ liệu thống kê mặc định
  const getDefaultStats = () => ({
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

  // Tham chiếu để theo dõi thời gian tải dữ liệu gần nhất
  const lastLoadTimeRef = useRef(0)
  // Tham chiếu để theo dõi số lần thử lại liên tiếp
  const retryCountRef = useRef(0)
  // Tham chiếu để theo dõi trạng thái đang tải
  const isLoadingRef = useRef(false)
  // Tham chiếu để theo dõi nếu component đã unmount
  const isMountedRef = useRef(true)
  // Tham chiếu cho FlatList để có thể cuộn lên đầu danh sách
  const flatListRef = useRef(null)

  // Tải dữ liệu khi component được mount lần đầu
  useEffect(() => {
    console.log('StatisticsScreen được mount lần đầu, tải dữ liệu thống kê')
    isMountedRef.current = true

    // Đảm bảo timeRange được đặt là 'week' khi màn hình được tải lần đầu
    setTimeRange('week')
    console.log('[DEBUG] Đã đặt timeRange ban đầu là "week"')

    // Xóa cache để đảm bảo dữ liệu mới được tải
    workStatusCache.current = {}
    loadStatisticsCache.current = {}

    // Đặt timeout để tránh tải dữ liệu quá sớm khi màn hình đang render
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        console.log('[DEBUG] Bắt đầu tải dữ liệu ban đầu sau khi mount')
        loadStatistics()
        lastLoadTimeRef.current = Date.now()
      }
    }, 500) // Tăng thời gian chờ lên 500ms để đảm bảo component đã render hoàn toàn

    return () => {
      clearTimeout(timer)
      isMountedRef.current = false
      console.log('[DEBUG] StatisticsScreen đã unmount')
    }
  }, [loadStatistics])

  // Sử dụng useFocusEffect để kiểm soát việc tải lại dữ liệu khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      console.log('[DEBUG] StatisticsScreen được focus')

      // Đánh dấu component đã mount
      isMountedRef.current = true

      // Biến để theo dõi timer
      let focusTimer = null

      // Hàm tải dữ liệu an toàn
      const safeLoadData = () => {
        // Kiểm tra nếu component đã unmount
        if (!isMountedRef.current) {
          console.log('[DEBUG] Component đã unmount, không tải dữ liệu')
          return
        }

        // Kiểm tra trạng thái loading từ ref thay vì state để có thông tin chính xác hơn
        if (isLoadingRef.current) {
          console.log(
            '[DEBUG] Đang tải dữ liệu (theo ref), bỏ qua yêu cầu tải lại'
          )
          return
        }

        const now = Date.now()

        // Tăng thời gian chờ lên 10 giây để tránh tải lại quá thường xuyên
        if (now - lastLoadTimeRef.current > 10000) {
          console.log('[DEBUG] Tải lại dữ liệu thống kê khi focus')

          // Cập nhật thời gian tải gần nhất
          lastLoadTimeRef.current = now

          // Đánh dấu đang tải trong ref
          isLoadingRef.current = true

          try {
            // Gọi hàm tải dữ liệu (đã có xử lý lỗi bên trong)
            console.log(
              `[DEBUG] Gọi loadStatistics từ safeLoadData, timeRange: ${timeRange}`
            )
            loadStatistics()
              .then(() => {
                if (isMountedRef.current) {
                  console.log(
                    `[DEBUG] Tải dữ liệu thành công khi focus cho tab: ${timeRange}`
                  )
                  retryCountRef.current = 0
                }
              })
              .catch((error) => {
                console.error(
                  `[DEBUG] Lỗi khi tải dữ liệu khi focus cho tab ${timeRange}:`,
                  error
                )
                // Đảm bảo đặt lại trạng thái loading trong ref khi có lỗi
                isLoadingRef.current = false
              })
          } catch (error) {
            console.error(
              `[DEBUG] Lỗi ngoài cùng khi tải dữ liệu khi focus cho tab ${timeRange}:`,
              error
            )
            // Đảm bảo đặt lại trạng thái loading trong ref khi có lỗi
            isLoadingRef.current = false
          }
        } else {
          console.log(
            '[DEBUG] Bỏ qua tải lại dữ liệu thống kê do mới tải gần đây'
          )
        }
      }

      // Đặt timeout để tránh tải dữ liệu quá sớm khi màn hình đang chuyển đổi
      // Tăng thời gian chờ lên 1000ms để đảm bảo màn hình đã hiển thị hoàn toàn
      console.log(
        `[DEBUG] Đặt timer để tải dữ liệu khi focus, timeRange hiện tại: ${timeRange}`
      )
      focusTimer = setTimeout(safeLoadData, 1000)

      // Cleanup khi component bị unfocus
      return () => {
        console.log('[DEBUG] StatisticsScreen bị unfocus')

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

  const getWeekdayName = useCallback(
    (day) => {
      // Sử dụng hàm formatShortWeekday để lấy tên viết tắt của thứ
      return formatShortWeekday(day, language)
    },
    [language, formatShortWeekday]
  )

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
          onPress={() => {
            console.log('[DEBUG] Đã nhấn nút chuyển sang tab Tuần này')
            // Đặt timeRange trước
            setTimeRange('week')
            // Xóa cache để đảm bảo dữ liệu mới được tải
            workStatusCache.current = {}
            loadStatisticsCache.current = {}
            // Đặt lại số lượng bản ghi hiển thị
            setVisibleRecords(15)
            // Đặt lại trang hiện tại
            setCurrentPage(1)
            // Tải dữ liệu mới trong background mà không chặn UI
            setTimeout(() => {
              console.log('[DEBUG] Đang tải dữ liệu cho tab Tuần này')
              loadStatistics()
            }, 100)
          }}
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
          onPress={() => {
            console.log('[DEBUG] Đã nhấn nút chuyển sang tab Tháng này')
            // Đặt timeRange trước
            setTimeRange('month')
            // Xóa cache để đảm bảo dữ liệu mới được tải
            workStatusCache.current = {}
            loadStatisticsCache.current = {}
            // Đặt lại số lượng bản ghi hiển thị - tăng lên cho tab tháng
            setVisibleRecords(62)
            // Đặt lại trang hiện tại
            setCurrentPage(1)
            // Tải dữ liệu mới trong background mà không chặn UI
            setTimeout(() => {
              console.log('[DEBUG] Đang tải dữ liệu cho tab Tháng này')
              loadStatistics()
            }, 100)
          }}
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
          onPress={() => {
            console.log('[DEBUG] Đã nhấn nút chuyển sang tab Năm nay')
            // Đặt timeRange trước
            setTimeRange('year')
            // Xóa cache để đảm bảo dữ liệu mới được tải
            workStatusCache.current = {}
            loadStatisticsCache.current = {}
            // Đặt lại số lượng bản ghi hiển thị - giới hạn số lượng ban đầu để tránh treo máy
            setVisibleRecords(30) // Chỉ hiển thị 30 bản ghi đầu tiên
            // Đặt lại trang hiện tại
            setCurrentPage(1)
            // Tải dữ liệu mới trong background mà không chặn UI
            setTimeout(() => {
              console.log('[DEBUG] Đang tải dữ liệu cho tab Năm nay')
              loadStatistics()
            }, 100)
          }}
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

      {/* Hiển thị loading indicator nhỏ gọn ở góc màn hình */}
      {isLoading && (
        <View style={styles.cornerLoadingContainer}>
          <ActivityIndicator size="small" color="#8a56ff" />
          <Text style={styles.cornerLoadingText}>{t('Đang tải...')}</Text>
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
              console.log('[DEBUG] Thử lại tải dữ liệu thống kê')

              // Kiểm tra trạng thái loading từ ref thay vì state
              if (isLoadingRef.current) {
                console.log(
                  '[DEBUG] Đang tải dữ liệu (theo ref), bỏ qua yêu cầu thử lại'
                )
                return
              }

              // Đặt lại trạng thái
              setLoadError(null)
              retryCountRef.current = 0
              lastLoadTimeRef.current = Date.now()

              // Đánh dấu đang tải trong cả state và ref
              setIsLoading(true)
              isLoadingRef.current = true

              // Tải lại dữ liệu trong background mà không chặn UI
              setTimeout(() => {
                if (isMountedRef.current) {
                  console.log(
                    '[DEBUG] Thực hiện tải lại dữ liệu sau khi nhấn nút thử lại'
                  )
                  loadStatistics().catch((error) => {
                    console.error('[DEBUG] Lỗi khi thử lại tải dữ liệu:', error)

                    if (isMountedRef.current) {
                      setLoadError(
                        'Không thể tải dữ liệu, vui lòng thử lại sau'
                      )
                      isLoadingRef.current = false
                      setIsLoading(false)
                    }
                  })
                } else {
                  isLoadingRef.current = false
                }
              }, 0)
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
                <FlatList
                  ref={flatListRef}
                  data={
                    timeRange === 'year'
                      ? stats.dailyData.slice(
                          (currentPage - 1) * pageSize,
                          currentPage * pageSize
                        ) // Phân trang cho tab Year
                      : stats.dailyData.slice(0, visibleRecords) // Hiển thị số lượng bản ghi giới hạn cho các tab khác
                  }
                  keyExtractor={(item, index) => `day-${index}`}
                  initialNumToRender={
                    timeRange === 'year' ? 30 : timeRange === 'month' ? 50 : 15
                  } // Số dòng render ban đầu dựa trên tab
                  maxToRenderPerBatch={
                    timeRange === 'year' ? 20 : timeRange === 'month' ? 20 : 10
                  } // Số dòng render mỗi lần
                  windowSize={
                    timeRange === 'year' ? 20 : timeRange === 'month' ? 20 : 10
                  } // Kích thước cửa sổ
                  removeClippedSubviews={true} // Loại bỏ các view không hiển thị để tiết kiệm bộ nhớ
                  renderItem={({ item: day, index }) => {
                    // Log để debug
                    console.log(`[DEBUG] Dữ liệu ngày ${day.date}:`, {
                      standardHours: day.standardHours,
                      otHours: day.otHours,
                      sundayHours: day.sundayHours,
                      nightHours: day.nightHours,
                      status: day.status,
                      checkIn: day.checkIn,
                      checkOut: day.checkOut,
                      timeRange: timeRange,
                    })

                    // Hiển thị tất cả các dòng cho tab Month và Year
                    // Hoặc hiển thị các dòng có dữ liệu hoặc 15 dòng đầu tiên cho tab Week
                    if (
                      timeRange === 'month' ||
                      timeRange === 'year' ||
                      index < 15 ||
                      day.standardHours > 0 ||
                      day.otHours > 0 ||
                      day.sundayHours > 0 ||
                      day.nightHours > 0 ||
                      day.status === 'DU_CONG' ||
                      day.status === 'DI_MUON' ||
                      day.status === 'VE_SOM' ||
                      day.status === 'DI_MUON_VE_SOM' ||
                      day.status === 'THIEU_LOG'
                    ) {
                      return (
                        <View
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
                            {day.status === 'DU_CONG' && day.standardHours === 0
                              ? '8.0' // Giá trị mặc định cho DU_CONG nếu không có giá trị
                              : formatDecimalHours(day.standardHours * 60)}
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
                    }
                    return null
                  }}
                  ListEmptyComponent={null}
                  ListFooterComponent={
                    timeRange === 'year' ? (
                      // Hiển thị điều hướng phân trang cho tab Year
                      <View style={styles.paginationContainer}>
                        {/* Hiển thị thông tin trang */}
                        <Text
                          style={[
                            styles.paginationText,
                            { color: theme.textColor },
                          ]}
                        >
                          {language === 'vi'
                            ? `Trang ${currentPage}/${Math.ceil(
                                stats.dailyData.length / pageSize
                              )}`
                            : `Page ${currentPage}/${Math.ceil(
                                stats.dailyData.length / pageSize
                              )}`}
                        </Text>

                        {/* Nút điều hướng */}
                        <View style={styles.paginationButtons}>
                          {/* Nút Previous */}
                          <TouchableOpacity
                            style={[
                              styles.paginationButton,
                              currentPage === 1 &&
                                styles.paginationButtonDisabled,
                            ]}
                            onPress={() => {
                              if (currentPage > 1) {
                                setCurrentPage(currentPage - 1)
                                // Cuộn lên đầu danh sách
                                if (flatListRef.current) {
                                  flatListRef.current.scrollToOffset({
                                    offset: 0,
                                    animated: true,
                                  })
                                }
                              }
                            }}
                            disabled={currentPage === 1}
                          >
                            <Text style={styles.paginationButtonText}>
                              {language === 'vi' ? 'Trước' : 'Previous'}
                            </Text>
                          </TouchableOpacity>

                          {/* Nút Next */}
                          <TouchableOpacity
                            style={[
                              styles.paginationButton,
                              currentPage >=
                                Math.ceil(stats.dailyData.length / pageSize) &&
                                styles.paginationButtonDisabled,
                            ]}
                            onPress={() => {
                              if (
                                currentPage <
                                Math.ceil(stats.dailyData.length / pageSize)
                              ) {
                                setCurrentPage(currentPage + 1)
                                // Cuộn lên đầu danh sách
                                if (flatListRef.current) {
                                  flatListRef.current.scrollToOffset({
                                    offset: 0,
                                    animated: true,
                                  })
                                }
                              }
                            }}
                            disabled={
                              currentPage >=
                              Math.ceil(stats.dailyData.length / pageSize)
                            }
                          >
                            <Text style={styles.paginationButtonText}>
                              {language === 'vi' ? 'Tiếp' : 'Next'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : stats.dailyData.length > visibleRecords ? (
                      // Hiển thị nút "Xem thêm" cho các tab khác
                      <TouchableOpacity
                        style={styles.loadMoreButton}
                        onPress={() => {
                          // Tăng số lượng bản ghi hiển thị thêm 15 bản ghi
                          const newVisibleRecords = Math.min(
                            visibleRecords + 15,
                            stats.dailyData.length
                          )
                          setVisibleRecords(newVisibleRecords)
                        }}
                      >
                        <Text style={styles.loadMoreButtonText}>
                          {language === 'vi'
                            ? `Xem thêm (${
                                stats.dailyData.length - visibleRecords
                              } ngày khác)`
                            : `Load more (${
                                stats.dailyData.length - visibleRecords
                              } more days)`}
                        </Text>
                      </TouchableOpacity>
                    ) : null
                  }
                />
              ) : loadError ? (
                // Hiển thị thông báo lỗi trong bảng
                <View style={styles.tableErrorContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={32}
                    color="#e74c3c"
                  />
                  <Text
                    style={[styles.tableErrorText, { color: theme.textColor }]}
                  >
                    {loadError}
                  </Text>
                  <View style={styles.tableErrorButtonsContainer}>
                    <TouchableOpacity
                      style={styles.tableRetryButton}
                      onPress={() => {
                        // Đặt lại trạng thái và thử lại
                        setLoadError(null)
                        setIsLoading(true)
                        isLoadingRef.current = true

                        // Tải dữ liệu trong background mà không chặn UI
                        setTimeout(() => loadStatistics(), 0)
                      }}
                    >
                      <Text style={styles.tableButtonText}>{t('Thử lại')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // Hiển thị thông báo không có dữ liệu
                <View style={styles.noDataContainer}>
                  <Ionicons
                    name="information-circle-outline"
                    size={32}
                    color="#3498db"
                  />
                  <Text
                    style={[styles.noDataText, { color: theme.subtextColor }]}
                  >
                    {language === 'vi'
                      ? 'Không có dữ liệu trong khoảng thời gian này'
                      : 'No data available for this time range'}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.tableRetryButton,
                      { backgroundColor: '#3498db' },
                    ]}
                    onPress={() => {
                      // Đặt lại trạng thái
                      setLoadError(null)
                      setIsLoading(true)
                      isLoadingRef.current = true

                      // Tải lại dữ liệu thống kê
                      if (isMountedRef.current) {
                        setTimeout(() => loadStatistics(), 0)
                      }
                    }}
                  >
                    <Text style={styles.tableButtonText}>
                      {t('Làm mới dữ liệu')}
                    </Text>
                  </TouchableOpacity>
                </View>
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

  // Loading indicator nhỏ gọn ở góc màn hình
  cornerLoadingContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
    zIndex: 1000,
  },
  cornerLoadingText: {
    fontSize: 12,
    marginLeft: 5,
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
  moreDataText: {
    textAlign: 'center',
    padding: 10,
    fontStyle: 'italic',
    fontSize: 12,
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
  // Styles cho phân trang
  paginationContainer: {
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationText: {
    fontSize: 14,
    marginBottom: 8,
  },
  paginationButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  paginationButton: {
    backgroundColor: '#8a56ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    marginHorizontal: 8,
  },
  paginationButtonDisabled: {
    backgroundColor: '#cccccc',
    opacity: 0.5,
  },
  paginationButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
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
  // Styles mới cho hiển thị lỗi và không có dữ liệu trong bảng
  errorButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
  },

  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  tableErrorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
    borderRadius: 8,
    margin: 10,
  },
  tableErrorText: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
  },
  tableErrorButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  tableRetryButton: {
    backgroundColor: '#8a56ff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 5,
  },

  tableButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  loadMoreButton: {
    backgroundColor: '#8a56ff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginVertical: 15,
  },
  loadMoreButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
})

export default StatisticsScreen

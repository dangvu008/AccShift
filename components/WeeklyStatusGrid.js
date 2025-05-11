'use client'

import React, { useState, useContext, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native'
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import DateTimePicker from '@react-native-community/datetimepicker'

// Import WORK_STATUS từ appConfig
import { WORK_STATUS } from '../config/appConfig'

// Tên viết tắt các ngày trong tuần
const weekdayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

const WeeklyStatusGrid = () => {
  const {
    t,
    darkMode,
    attendanceLogs,
    buttonState,
    currentShift,
    notifyWorkStatusUpdate,
  } = useContext(AppContext)
  const [weekDays, setWeekDays] = useState([])
  const [dailyStatuses, setDailyStatuses] = useState({})
  const [selectedDay, setSelectedDay] = useState(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [statusModalVisible, setStatusModalVisible] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [updatingDay, setUpdatingDay] = useState(null)

  // State cho việc cập nhật thời gian check-in và check-out thủ công
  const [manualCheckInTime, setManualCheckInTime] = useState('')
  const [manualCheckOutTime, setManualCheckOutTime] = useState('')
  const [showCheckInTimePicker, setShowCheckInTimePicker] = useState(false)
  const [showCheckOutTimePicker, setShowCheckOutTimePicker] = useState(false)
  const [timePickerMode, setTimePickerMode] = useState('time')
  const [timePickerVisible, setTimePickerVisible] = useState(false)
  const [currentEditingTime, setCurrentEditingTime] = useState(null) // 'checkIn' hoặc 'checkOut'
  const [timeValidationError, setTimeValidationError] = useState('')

  // Format date to YYYY-MM-DD for storage key
  const formatDateKey = useCallback((date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(date.getDate()).padStart(2, '0')}`
  }, [])

  // Initialize week days and load statuses
  useEffect(() => {
    generateWeekDays()
    loadDailyStatuses()
  }, [generateWeekDays, loadDailyStatuses])

  // Thêm hàm refresh để làm mới dữ liệu
  const refreshData = useCallback(() => {
    loadDailyStatuses()
  }, [loadDailyStatuses])

  // Cập nhật trạng thái từ attendanceLogs
  const updateStatusFromAttendanceLogs = useCallback(async () => {
    if (!attendanceLogs || attendanceLogs.length === 0) return

    const today = new Date()
    const dateKey = formatDateKey(today)
    const existingStatus = dailyStatuses[dateKey] || {}

    // Kiểm tra nếu trạng thái đã được cập nhật thủ công thì không cập nhật lại
    if (existingStatus.isManuallyUpdated) {
      return
    }

    // Lấy thời gian chấm công từ attendanceLogs
    const goWorkLog = attendanceLogs.find((log) => log.type === 'go_work')
    const checkInLog = attendanceLogs.find((log) => log.type === 'check_in')
    const checkOutLog = attendanceLogs.find((log) => log.type === 'check_out')
    const completeLog = attendanceLogs.find((log) => log.type === 'complete')

    // Xác định trạng thái dựa trên các log
    let status = WORK_STATUS.CHUA_CAP_NHAT

    if (goWorkLog && !checkInLog && !checkOutLog) {
      // Chỉ có go_work, thiếu check_in và check_out
      status = WORK_STATUS.THIEU_LOG
    } else if (goWorkLog && checkInLog && !checkOutLog) {
      // Có go_work và check_in, thiếu check_out
      status = WORK_STATUS.THIEU_LOG
    } else if (goWorkLog && checkInLog && checkOutLog) {
      // Đủ các log cần thiết
      if (completeLog) {
        status = WORK_STATUS.DU_CONG
      } else {
        status = WORK_STATUS.THIEU_LOG
      }
    }

    // Cập nhật thời gian chấm công
    const updatedStatus = {
      ...existingStatus,
      status,
      updatedAt: new Date().toISOString(),
      isManuallyUpdated: false, // Đánh dấu là cập nhật tự động
    }

    // Lưu thời gian vào/ra (chỉ hiển thị đến phút)
    if (checkInLog) {
      const checkInTime = new Date(checkInLog.timestamp)
      updatedStatus.vaoLogTime = checkInTime.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    if (checkOutLog) {
      const checkOutTime = new Date(checkOutLog.timestamp)
      updatedStatus.raLogTime = checkOutTime.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    // Lưu thông tin ca làm việc nếu có
    if (currentShift) {
      updatedStatus.shiftName = currentShift.name
    }

    // Lưu vào AsyncStorage
    await AsyncStorage.setItem(
      `dailyWorkStatus_${dateKey}`,
      JSON.stringify(updatedStatus)
    )

    // Cập nhật state
    setDailyStatuses((prevStatuses) => ({
      ...prevStatuses,
      [dateKey]: updatedStatus,
    }))
  }, [attendanceLogs, currentShift, formatDateKey, dailyStatuses])

  // Cập nhật trạng thái khi người dùng bấm nút đi làm
  useEffect(() => {
    if (attendanceLogs && attendanceLogs.length > 0) {
      updateStatusFromAttendanceLogs()
    }
  }, [attendanceLogs, updateStatusFromAttendanceLogs])

  // Thêm useEffect để làm mới dữ liệu khi có thay đổi, nhưng với tần suất thấp hơn
  useEffect(() => {
    // Đăng ký sự kiện lắng nghe thay đổi trong AsyncStorage
    const refreshListener = () => {
      // Chỉ làm mới dữ liệu khi cần thiết
      const now = new Date()
      const lastRefreshKey = 'lastWeeklyStatusRefresh'

      AsyncStorage.getItem(lastRefreshKey)
        .then((lastRefreshTime) => {
          const shouldRefresh =
            !lastRefreshTime ||
            now.getTime() - parseInt(lastRefreshTime) > 300000 // Chỉ làm mới sau 5 phút

          if (shouldRefresh) {
            refreshData()
            AsyncStorage.setItem(lastRefreshKey, now.getTime().toString())
          }
        })
        .catch((err) => {
          console.error('Lỗi khi kiểm tra thời gian làm mới:', err)
        })
    }

    // Giả lập sự kiện lắng nghe với tần suất thấp hơn
    const refreshInterval = setInterval(refreshListener, 300000) // Làm mới mỗi 5 phút

    return () => {
      clearInterval(refreshInterval) // Dọn dẹp khi component unmount
    }
  }, [refreshData])

  // Generate array of days for the current week (Monday to Sunday)
  const generateWeekDays = useCallback(() => {
    const today = new Date()
    const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, ...
    const days = []

    // Calculate the date of Monday this week
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)

    // Sử dụng weekdayNames đã được định nghĩa ở trên

    // Generate 7 days starting from Monday
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      const dayIndex = (1 + i) % 7 // Chuyển đổi từ thứ 2-CN sang index 1-0
      days.push({
        date,
        dayOfMonth: date.getDate(),
        dayOfWeek: weekdayNames[dayIndex],
        isToday: date.toDateString() === today.toDateString(),
        isFuture: date > today,
      })
    }

    setWeekDays(days)
  }, [])

  // Load daily work statuses from AsyncStorage
  const loadDailyStatuses = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys()
      const statusKeys = keys.filter((key) =>
        key.startsWith('dailyWorkStatus_')
      )

      // Nếu không có thay đổi về số lượng key, không cần tải lại
      if (
        statusKeys.length === Object.keys(dailyStatuses).length &&
        Object.keys(dailyStatuses).length > 0
      ) {
        return
      }

      const statusPairs = await AsyncStorage.multiGet(statusKeys)

      const statuses = {}
      statusPairs.forEach(([key, value]) => {
        try {
          const dateStr = key.replace('dailyWorkStatus_', '')
          const parsedValue = JSON.parse(value)
          statuses[dateStr] = parsedValue
        } catch (parseError) {
          console.error(`Error parsing status for key ${key}:`, parseError)
        }
      })

      setDailyStatuses(statuses)
    } catch (error) {
      console.error('Error loading daily statuses:', error)
    }
  }, [dailyStatuses])

  // Hàm đã được khai báo ở trên

  // Get status for a specific day
  const getDayStatus = (day) => {
    const dateKey = formatDateKey(day.date)
    const status = dailyStatuses[dateKey]

    // Kiểm tra xem ngày có phải là ngày nghỉ thông thường không (thứ 7, chủ nhật)
    // dựa trên cài đặt của ca làm việc hiện tại
    const isRegularDayOff = () => {
      if (!currentShift || !currentShift.daysApplied) return false

      // Lấy thứ trong tuần của ngày (0 = CN, 1 = T2, ..., 6 = T7)
      const dayOfWeek = day.date.getDay()

      // Chuyển đổi thành định dạng T2, T3, ..., CN
      const dayCode = weekdayNames[dayOfWeek]

      // Kiểm tra xem ngày này có trong daysApplied của ca làm việc không
      return !currentShift.daysApplied.includes(dayCode)
    }

    // Kiểm tra xem ca làm việc có phải là ca qua đêm không
    const isOvernightShift = () => {
      if (!currentShift) return false

      // Kiểm tra xem ca có phải là ca qua đêm không
      const startTimeParts = currentShift.startTime.split(':').map(Number)
      const endTimeParts = currentShift.endTime.split(':').map(Number)

      // Ca qua đêm khi giờ kết thúc < giờ bắt đầu hoặc giờ bằng nhau nhưng phút kết thúc < phút bắt đầu
      return (
        endTimeParts[0] < startTimeParts[0] ||
        (endTimeParts[0] === startTimeParts[0] &&
          endTimeParts[1] < startTimeParts[1])
      )
    }

    // Kiểm tra xem ngày hiện tại có phải là ngày kết thúc của ca qua đêm bắt đầu từ ngày hôm trước không
    const isPreviousDayOvernightShiftEndDay = () => {
      if (!currentShift || !isOvernightShift()) return false

      // Lấy ngày hôm trước
      const previousDay = new Date(day.date)
      previousDay.setDate(previousDay.getDate() - 1)
      const previousDayKey = formatDateKey(previousDay)

      // Lấy trạng thái của ngày hôm trước
      const previousDayStatus = dailyStatuses[previousDayKey]

      // Kiểm tra xem ngày hôm trước có ca làm việc qua đêm không
      if (previousDayStatus && previousDayStatus.shiftId === currentShift.id) {
        // Lấy thứ trong tuần của ngày hôm trước
        const previousDayOfWeek = previousDay.getDay()
        const previousDayCode = weekdayNames[previousDayOfWeek]

        // Kiểm tra xem ngày hôm trước có trong daysApplied của ca làm việc không
        return currentShift.daysApplied.includes(previousDayCode)
      }

      return false
    }

    // Ngày tương lai luôn hiển thị NGAY_TUONG_LAI trừ khi đã được cập nhật thủ công
    if (day.isFuture) {
      // Nếu đã có trạng thái được cập nhật thủ công, hiển thị trạng thái đó
      if (status && status.isManuallyUpdated) {
        return status.status
      }

      // Nếu đã có trạng thái nghỉ phép, nghỉ bệnh, nghỉ lễ hoặc vắng mặt thì hiển thị trạng thái đó
      if (
        status &&
        (status.status === WORK_STATUS.NGHI_PHEP ||
          status.status === WORK_STATUS.NGHI_BENH ||
          status.status === WORK_STATUS.NGHI_LE ||
          status.status === WORK_STATUS.VANG_MAT)
      ) {
        return status.status
      }

      // Kiểm tra nếu là ngày nghỉ thông thường
      if (isRegularDayOff()) {
        return WORK_STATUS.NGHI_THUONG
      }

      return WORK_STATUS.NGAY_TUONG_LAI
    }

    // Ngày hiện tại hoặc quá khứ
    if (!status) {
      // Kiểm tra nếu là ngày nghỉ thông thường
      if (isRegularDayOff()) {
        return WORK_STATUS.NGHI_THUONG
      }

      // Kiểm tra xem ngày này có phải là ngày kết thúc của ca qua đêm không
      if (isPreviousDayOvernightShiftEndDay()) {
        // Nếu là ngày kết thúc của ca qua đêm, trạng thái sẽ được hiển thị ở ngày bắt đầu ca
        return WORK_STATUS.NGHI_THUONG
      }

      return WORK_STATUS.CHUA_CAP_NHAT
    }

    return status.status || WORK_STATUS.CHUA_CAP_NHAT
  }

  // Update status for a specific day
  const updateDayStatus = async (day, newStatus) => {
    try {
      // Kiểm tra tính hợp lệ của thời gian nếu có nhập thủ công
      if (manualCheckInTime || manualCheckOutTime) {
        const isValid = validateTimes(manualCheckInTime, manualCheckOutTime)
        if (!isValid) {
          // Nếu thời gian không hợp lệ, không tiếp tục cập nhật
          return
        }
      }

      // Đánh dấu đang cập nhật và lưu ngày đang cập nhật
      setUpdatingStatus(true)
      setUpdatingDay(formatDateKey(day.date))

      const dateKey = formatDateKey(day.date)
      const existingStatus = dailyStatuses[dateKey] || {}
      const now = new Date()
      const timeString = now.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })

      // Sử dụng currentShift từ props thay vì gọi useContext ở đây
      const updatedStatus = {
        ...existingStatus,
        status: newStatus,
        updatedAt: now.toISOString(),
        isManuallyUpdated: true, // Đánh dấu là đã cập nhật thủ công
        // Lưu thông tin ca làm việc nếu có
        shiftId: currentShift ? currentShift.id : existingStatus.shiftId,
        shiftName: currentShift ? currentShift.name : existingStatus.shiftName,
      }

      // Lưu thời gian chấm công thực tế
      if (
        newStatus === WORK_STATUS.DU_CONG ||
        newStatus === WORK_STATUS.THIEU_LOG ||
        newStatus === WORK_STATUS.DI_MUON ||
        newStatus === WORK_STATUS.VE_SOM ||
        newStatus === WORK_STATUS.DI_MUON_VE_SOM
      ) {
        // Sử dụng thời gian nhập thủ công nếu có
        if (manualCheckInTime) {
          updatedStatus.vaoLogTime = manualCheckInTime
        }
        // Nếu không có thời gian nhập thủ công và chưa có thời gian vào, lưu thời gian hiện tại
        else if (!updatedStatus.vaoLogTime) {
          updatedStatus.vaoLogTime = timeString
        }

        // Sử dụng thời gian nhập thủ công nếu có
        if (manualCheckOutTime) {
          updatedStatus.raLogTime = manualCheckOutTime
        }
        // Nếu không có thời gian nhập thủ công, đã có thời gian vào nhưng chưa có thời gian ra, lưu thời gian hiện tại
        else if (updatedStatus.vaoLogTime && !updatedStatus.raLogTime) {
          updatedStatus.raLogTime = timeString
        }
      }

      // Nếu trạng thái là DU_CONG, tính toán giờ làm dựa trên ca làm việc
      if (newStatus === WORK_STATUS.DU_CONG && currentShift) {
        try {
          // Tính toán giờ làm dựa trên ca làm việc
          const baseDate = new Date(day.date) // Sử dụng ngày được chọn

          // Tính toán thời gian làm việc theo lịch trình ca
          const calculateScheduledWorkTime = (shift, baseDate) => {
            if (!shift || !baseDate) {
              return {
                standardHoursScheduled: 0,
                otHoursScheduled: 0,
                sundayHoursScheduled: 0,
                nightHoursScheduled: 0,
                totalHoursScheduled: 0,
              }
            }

            // Kiểm tra xem ca làm việc có phải là ca qua đêm không
            const isOvernightShift = (startTime, endTime) => {
              if (!startTime || !endTime) return false

              const [startHour, startMinute] = startTime.split(':').map(Number)
              const [endHour, endMinute] = endTime.split(':').map(Number)

              return (
                endHour < startHour ||
                (endHour === startHour && endMinute < startMinute)
              )
            }

            const isOvernight = isOvernightShift(shift.startTime, shift.endTime)

            // Tính thời gian ca làm việc chuẩn (giờ)
            // Tính thời gian từ startTime đến officeEndTime
            const startTimeParts = shift.startTime.split(':').map(Number)
            const officeEndTimeParts = shift.officeEndTime
              .split(':')
              .map(Number)

            let standardHours = 0

            if (isOvernight) {
              // Nếu là ca qua đêm, tính toán đặc biệt
              if (officeEndTimeParts[0] < startTimeParts[0]) {
                // Kết thúc vào ngày hôm sau
                standardHours =
                  24 -
                  startTimeParts[0] +
                  officeEndTimeParts[0] +
                  (officeEndTimeParts[1] - startTimeParts[1]) / 60
              } else {
                // Kết thúc vào cùng ngày (hiếm gặp với ca qua đêm)
                standardHours =
                  officeEndTimeParts[0] -
                  startTimeParts[0] +
                  (officeEndTimeParts[1] - startTimeParts[1]) / 60
              }
            } else {
              // Ca thông thường
              standardHours =
                officeEndTimeParts[0] -
                startTimeParts[0] +
                (officeEndTimeParts[1] - startTimeParts[1]) / 60
            }

            // Trừ thời gian nghỉ
            const breakHours = (shift.breakMinutes || 0) / 60
            standardHours = Math.max(0, standardHours - breakHours)

            // Tính thời gian OT theo lịch trình (giờ)
            let otHours = 0
            if (shift.endTime && shift.endTime !== shift.officeEndTime) {
              const endTimeParts = shift.endTime.split(':').map(Number)

              if (isOvernight) {
                if (endTimeParts[0] < officeEndTimeParts[0]) {
                  // OT qua đêm, kết thúc vào ngày hôm sau
                  otHours =
                    24 -
                    officeEndTimeParts[0] +
                    endTimeParts[0] +
                    (endTimeParts[1] - officeEndTimeParts[1]) / 60
                } else {
                  // OT trong cùng ngày
                  otHours =
                    endTimeParts[0] -
                    officeEndTimeParts[0] +
                    (endTimeParts[1] - officeEndTimeParts[1]) / 60
                }
              } else {
                // OT thông thường
                otHours =
                  endTimeParts[0] -
                  officeEndTimeParts[0] +
                  (endTimeParts[1] - officeEndTimeParts[1]) / 60
              }
            }

            // Tính tổng thời gian làm việc theo lịch trình (giờ)
            const totalHours = standardHours + otHours

            // Tính giờ làm chủ nhật
            let sundayHours = 0
            if (baseDate.getDay() === 0) {
              // 0 là Chủ nhật
              sundayHours = totalHours
            }

            // Tính giờ làm đêm (22:00 - 05:00)
            const calculateNightHours = (shift, standardHours, otHours) => {
              // Mặc định thời gian làm đêm là 22:00 - 05:00
              const nightStartHour = 22
              const nightEndHour = 5

              let nightHours = 0

              // Kiểm tra ca làm việc có nằm trong khoảng thời gian làm đêm không
              const startHour = parseInt(shift.startTime.split(':')[0])
              const endHour = parseInt(shift.officeEndTime.split(':')[0])

              if (isOvernight) {
                // Ca qua đêm
                if (startHour >= nightStartHour) {
                  // Bắt đầu sau 22:00
                  nightHours += 24 - startHour + Math.min(nightEndHour, endHour)
                } else if (endHour <= nightEndHour) {
                  // Kết thúc trước 5:00
                  nightHours +=
                    Math.max(0, nightEndHour - endHour) +
                    Math.max(0, startHour - nightStartHour)
                } else {
                  // Trường hợp khác
                  nightHours += Math.max(0, 24 - nightStartHour) + nightEndHour
                }
              } else {
                // Ca thông thường
                if (startHour >= nightStartHour) {
                  // Bắt đầu sau 22:00
                  nightHours += endHour - startHour
                } else if (endHour <= nightEndHour) {
                  // Kết thúc trước 5:00
                  nightHours += endHour - 0
                } else if (
                  startHour < nightStartHour &&
                  endHour > nightEndHour
                ) {
                  // Ca bao gồm cả thời gian làm đêm
                  nightHours += 24 - nightStartHour + nightEndHour
                }
              }

              // Giới hạn giờ làm đêm không vượt quá tổng giờ làm
              nightHours = Math.min(nightHours, standardHours + otHours)

              return parseFloat(nightHours.toFixed(1))
            }

            // Tính giờ làm đêm
            const nightHours = calculateNightHours(
              shift,
              standardHours,
              otHours
            )

            return {
              standardHoursScheduled: parseFloat(standardHours.toFixed(1)),
              otHoursScheduled: parseFloat(otHours.toFixed(1)),
              sundayHoursScheduled: parseFloat(sundayHours.toFixed(1)),
              nightHoursScheduled: nightHours,
              totalHoursScheduled: parseFloat(totalHours.toFixed(1)),
            }
          }

          // Tính toán giờ làm
          const scheduledTimes = calculateScheduledWorkTime(
            currentShift,
            baseDate
          )

          // Cập nhật các giá trị giờ làm vào trạng thái
          updatedStatus.standardHoursScheduled =
            scheduledTimes.standardHoursScheduled
          updatedStatus.otHoursScheduled = scheduledTimes.otHoursScheduled
          updatedStatus.sundayHoursScheduled =
            scheduledTimes.sundayHoursScheduled
          updatedStatus.nightHoursScheduled = scheduledTimes.nightHoursScheduled
          updatedStatus.totalHoursScheduled = scheduledTimes.totalHoursScheduled

          console.log(
            `Đã tính toán giờ làm cho ngày ${dateKey}: `,
            scheduledTimes
          )
        } catch (calcError) {
          console.error('Lỗi khi tính toán giờ làm:', calcError)
        }
      }

      // Đóng modal ngay lập tức để cải thiện UX
      setStatusModalVisible(false)

      // Lưu vào AsyncStorage (có thể mất thời gian)
      await AsyncStorage.setItem(
        `dailyWorkStatus_${dateKey}`,
        JSON.stringify(updatedStatus)
      )

      // Cập nhật trạng thái local sau khi lưu thành công
      setDailyStatuses((prevStatuses) => ({
        ...prevStatuses,
        [dateKey]: updatedStatus,
      }))

      // Thông báo cho các thành phần khác về sự thay đổi trạng thái
      if (typeof notifyWorkStatusUpdate === 'function') {
        console.log('[DEBUG] Gọi hàm thông báo cập nhật trạng thái làm việc')
        notifyWorkStatusUpdate()
      }

      // Đánh dấu đã hoàn thành cập nhật
      setTimeout(() => {
        setUpdatingStatus(false)
        setUpdatingDay(null)
        // Làm mới dữ liệu sau khi cập nhật
        refreshData()
      }, 500) // Đợi 500ms để tránh nhấp nháy quá nhanh
    } catch (error) {
      console.error('Error updating day status:', error)
      // Đánh dấu đã hoàn thành cập nhật ngay cả khi có lỗi
      setUpdatingStatus(false)
      setUpdatingDay(null)
    }
  }

  // Get icon for status
  const getStatusIcon = (status) => {
    switch (status) {
      case WORK_STATUS.THIEU_LOG:
        return { name: 'warning-outline', color: '#e74c3c', type: 'ionicons' }
      case WORK_STATUS.DU_CONG:
        return { name: 'checkmark-circle', color: '#27ae60', type: 'ionicons' }
      case WORK_STATUS.NGHI_PHEP:
        return {
          name: 'document-text-outline',
          color: '#3498db',
          type: 'ionicons',
        }
      case WORK_STATUS.NGHI_BENH:
        return { name: 'fitness-outline', color: '#9b59b6', type: 'ionicons' }
      case WORK_STATUS.NGHI_LE:
        return { name: 'flag-outline', color: '#f39c12', type: 'ionicons' }
      case WORK_STATUS.NGHI_THUONG:
        return { name: 'cafe-outline', color: '#27ae60', type: 'ionicons' }
      case WORK_STATUS.VANG_MAT:
        return { name: 'close-circle', color: '#e74c3c', type: 'ionicons' }
      case WORK_STATUS.DI_MUON:
        return { name: 'alarm-outline', color: '#f39c12', type: 'ionicons' }
      case WORK_STATUS.VE_SOM:
        return { name: 'log-out-outline', color: '#f39c12', type: 'ionicons' }
      case WORK_STATUS.DI_MUON_VE_SOM:
        return { name: 'timer-outline', color: '#f39c12', type: 'ionicons' }
      case WORK_STATUS.NGAY_TUONG_LAI:
        return { name: 'calendar-outline', color: '#95a5a6', type: 'ionicons' }
      default:
        return {
          name: 'help-circle-outline',
          color: '#95a5a6',
          type: 'ionicons',
        }
    }
  }

  // Get status text
  const getStatusText = (status) => {
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

  // Get status abbreviation
  const getStatusAbbreviation = (status) => {
    switch (status) {
      case WORK_STATUS.THIEU_LOG:
        return '⚠️'
      case WORK_STATUS.DU_CONG:
        return '✓'
      case WORK_STATUS.NGHI_PHEP:
        return 'NP'
      case WORK_STATUS.NGHI_BENH:
        return 'NB'
      case WORK_STATUS.NGHI_LE:
        return 'NL'
      case WORK_STATUS.NGHI_THUONG:
        return 'NT'
      case WORK_STATUS.VANG_MAT:
        return '✗'
      case WORK_STATUS.DI_MUON:
        return 'DM'
      case WORK_STATUS.VE_SOM:
        return 'VS'
      case WORK_STATUS.DI_MUON_VE_SOM:
        return 'DV'
      case WORK_STATUS.NGAY_TUONG_LAI:
        return '--'
      case WORK_STATUS.QUEN_CHECK_OUT:
        return 'QC'
      default:
        return '?'
    }
  }

  // Handle day press - show details
  const handleDayPress = (day) => {
    setSelectedDay(day)
    setDetailModalVisible(true)
  }

  // Handle day long press - update status
  const handleDayLongPress = (day) => {
    // Cho phép cập nhật trạng thái cho tất cả các ngày
    // Nhưng sẽ giới hạn các trạng thái có thể chọn trong modal dựa vào ngày
    setSelectedDay(day)

    // Reset các giá trị thời gian thủ công và lỗi
    setTimeValidationError('')

    // Lấy thông tin trạng thái hiện tại của ngày được chọn
    const dateKey = formatDateKey(day.date)
    const currentStatus = dailyStatuses[dateKey] || {}

    // Đặt giá trị thời gian check-in và check-out từ trạng thái hiện tại (nếu có)
    setManualCheckInTime(currentStatus.vaoLogTime || '')
    setManualCheckOutTime(currentStatus.raLogTime || '')

    setStatusModalVisible(true)
  }

  // Xử lý khi người dùng muốn mở time picker
  const handleOpenTimePicker = (type) => {
    setCurrentEditingTime(type)
    setTimePickerVisible(true)
  }

  // Xử lý khi người dùng chọn thời gian
  const handleTimeChange = (event, selectedTime) => {
    if (selectedTime) {
      const formattedTime = selectedTime.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })

      if (currentEditingTime === 'checkIn') {
        setManualCheckInTime(formattedTime)
      } else if (currentEditingTime === 'checkOut') {
        setManualCheckOutTime(formattedTime)
      }

      // Kiểm tra tính hợp lệ của thời gian
      validateTimes(
        currentEditingTime === 'checkIn' ? formattedTime : manualCheckInTime,
        currentEditingTime === 'checkOut' ? formattedTime : manualCheckOutTime
      )
    }

    setTimePickerVisible(false)
  }

  // Kiểm tra tính hợp lệ của thời gian check-in và check-out
  const validateTimes = (checkInTime, checkOutTime) => {
    // Reset lỗi
    setTimeValidationError('')

    // Nếu một trong hai thời gian trống, không cần kiểm tra
    if (!checkInTime || !checkOutTime) return true

    // Chuyển đổi thời gian thành đối tượng Date để so sánh
    const today = new Date()
    const now = new Date()

    // Tạo đối tượng Date cho thời gian check-in
    const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number)
    const checkInDate = new Date(today)
    checkInDate.setHours(checkInHours, checkInMinutes, 0)

    // Tạo đối tượng Date cho thời gian check-out
    const [checkOutHours, checkOutMinutes] = checkOutTime.split(':').map(Number)
    const checkOutDate = new Date(today)
    checkOutDate.setHours(checkOutHours, checkOutMinutes, 0)

    // Kiểm tra thời gian trong tương lai
    if (selectedDay && selectedDay.isToday) {
      if (checkInDate > now) {
        setTimeValidationError('Thời gian check-in không thể trong tương lai')
        return false
      }

      if (checkOutDate > now) {
        setTimeValidationError('Thời gian check-out không thể trong tương lai')
        return false
      }
    }

    // Kiểm tra thời gian check-in phải trước thời gian check-out
    // Xử lý trường hợp ca qua đêm
    if (currentShift && currentShift.isOvernightShift) {
      // Với ca qua đêm, check-out có thể nhỏ hơn check-in
      return true
    } else {
      // Với ca thông thường, check-in phải trước check-out
      if (checkInDate >= checkOutDate) {
        setTimeValidationError(
          'Thời gian check-in phải trước thời gian check-out'
        )
        return false
      }
    }

    return true
  }

  // Render status icon
  const renderStatusIcon = (status, isInGrid = false, day = null) => {
    // Choose appropriate background style based on dark mode
    const backgroundStyle = isInGrid
      ? darkMode
        ? styles.darkIconBackground
        : styles.iconBackground
      : null

    // Kiểm tra xem ngày này có đang được cập nhật không
    const isUpdating = (dayObj) => {
      if (!updatingStatus || !updatingDay || !dayObj) return false
      const dateKey = formatDateKey(dayObj.date)
      return updatingDay === dateKey
    }

    // Nếu đang cập nhật và đang ở trong grid, hiển thị icon loading
    if (isInGrid && day && isUpdating(day)) {
      return (
        <View
          style={[
            backgroundStyle,
            { justifyContent: 'center', alignItems: 'center' },
          ]}
        >
          <Ionicons name="sync" size={18} color="#8a56ff" />
        </View>
      )
    }

    const iconConfig = getStatusIcon(status)
    // Use smaller size for grid view
    const gridSize = 18
    const modalSize = 24
    const size = isInGrid ? gridSize : modalSize
    const fontAwesomeSize = isInGrid ? gridSize - 2 : modalSize - 4

    // Đã khai báo ở trên

    if (iconConfig.type === 'ionicons') {
      return (
        <View style={backgroundStyle}>
          <Ionicons
            name={iconConfig.name}
            size={size}
            color={iconConfig.color}
          />
        </View>
      )
    } else if (iconConfig.type === 'material-community') {
      return (
        <View style={backgroundStyle}>
          <MaterialCommunityIcons
            name={iconConfig.name}
            size={size}
            color={iconConfig.color}
          />
        </View>
      )
    } else if (iconConfig.type === 'font-awesome') {
      return (
        <View style={backgroundStyle}>
          <FontAwesome5
            name={iconConfig.name}
            size={fontAwesomeSize}
            color={iconConfig.color}
          />
        </View>
      )
    }

    // Choose appropriate text background style based on dark mode
    const textBackgroundStyle = isInGrid
      ? darkMode
        ? styles.darkTextIconBackground
        : styles.textIconBackground
      : null

    return (
      <Text
        style={[
          { fontSize: isInGrid ? 14 : 18, color: iconConfig.color },
          textBackgroundStyle,
        ]}
      >
        {getStatusAbbreviation(status)}
      </Text>
    )
  }

  // Format date for display
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {weekDays.map((day) => {
          const status = getDayStatus(day)
          const isToday = day.isToday

          return (
            <TouchableOpacity
              key={day.dayOfWeek}
              style={[
                styles.dayCell,
                isToday && styles.todayCell,
                darkMode && styles.darkDayCell,
                isToday && darkMode && styles.darkTodayCell,
              ]}
              onPress={() => handleDayPress(day)}
              onLongPress={() => handleDayLongPress(day)}
              delayLongPress={500}
            >
              <Text
                style={[
                  styles.dayOfMonth,
                  isToday && styles.todayText,
                  darkMode && styles.darkText,
                  isToday && darkMode && styles.darkTodayText,
                ]}
              >
                {day.dayOfMonth}
              </Text>
              <Text
                style={[
                  styles.dayOfWeek,
                  isToday && styles.todayText,
                  darkMode && styles.darkText,
                  isToday && darkMode && styles.darkTodayText,
                ]}
              >
                {weekdayNames[new Date(day.date).getDay()]}
              </Text>
              <View style={styles.statusContainer}>
                {renderStatusIcon(status, true, day)}
              </View>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, darkMode && styles.darkModalContent]}
          >
            {selectedDay && (
              <>
                <View style={styles.modalHeader}>
                  <Text
                    style={[styles.modalTitle, darkMode && styles.darkText]}
                  >
                    {formatDate(selectedDay.date)} ({selectedDay.dayOfWeek})
                  </Text>
                  <TouchableOpacity
                    onPress={() => setDetailModalVisible(false)}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={darkMode ? '#fff' : '#000'}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.detailContainer}>
                  <View style={styles.detailRow}>
                    <Text
                      style={[styles.detailLabel, darkMode && styles.darkText]}
                    >
                      {t('Status')}:
                    </Text>
                    <Text
                      style={[styles.detailValue, darkMode && styles.darkText]}
                    >
                      {getStatusText(getDayStatus(selectedDay))}
                    </Text>
                  </View>

                  {/* Show check-in/out times if available */}
                  {dailyStatuses[formatDateKey(selectedDay.date)]
                    ?.vaoLogTime && (
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {t('Check In')}:
                      </Text>
                      <Text
                        style={[
                          styles.detailValue,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {
                          dailyStatuses[formatDateKey(selectedDay.date)]
                            .vaoLogTime
                        }
                      </Text>
                    </View>
                  )}

                  {dailyStatuses[formatDateKey(selectedDay.date)]
                    ?.raLogTime && (
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {t('Check Out')}:
                      </Text>
                      <Text
                        style={[
                          styles.detailValue,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {
                          dailyStatuses[formatDateKey(selectedDay.date)]
                            .raLogTime
                        }
                      </Text>
                    </View>
                  )}

                  {/* Show shift name if available */}
                  {dailyStatuses[formatDateKey(selectedDay.date)]
                    ?.shiftName && (
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {t('Shift')}:
                      </Text>
                      <Text
                        style={[
                          styles.detailValue,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {
                          dailyStatuses[formatDateKey(selectedDay.date)]
                            .shiftName
                        }
                      </Text>
                    </View>
                  )}

                  {/* Show standard work hours if available */}
                  {dailyStatuses[formatDateKey(selectedDay.date)]
                    ?.standardHoursScheduled > 0 && (
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {t('Work Hours')}:
                      </Text>
                      <Text
                        style={[
                          styles.detailValue,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {
                          dailyStatuses[formatDateKey(selectedDay.date)]
                            .standardHoursScheduled
                        }
                      </Text>
                    </View>
                  )}

                  {/* Show OT hours if available */}
                  {dailyStatuses[formatDateKey(selectedDay.date)]
                    ?.otHoursScheduled > 0 && (
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {t('OT Hours')}:
                      </Text>
                      <Text
                        style={[
                          styles.detailValue,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {
                          dailyStatuses[formatDateKey(selectedDay.date)]
                            .otHoursScheduled
                        }
                      </Text>
                    </View>
                  )}

                  {/* Show total hours if available */}
                  {dailyStatuses[formatDateKey(selectedDay.date)]
                    ?.totalHoursScheduled > 0 && (
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {t('Total Hours')}:
                      </Text>
                      <Text
                        style={[
                          styles.detailValue,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {
                          dailyStatuses[formatDateKey(selectedDay.date)]
                            .totalHoursScheduled
                        }
                      </Text>
                    </View>
                  )}

                  {/* Show notes if available */}
                  {dailyStatuses[formatDateKey(selectedDay.date)]?.notes && (
                    <View style={styles.detailRow}>
                      <Text
                        style={[
                          styles.detailLabel,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {t('Notes')}:
                      </Text>
                      <Text
                        style={[
                          styles.detailValue,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {dailyStatuses[formatDateKey(selectedDay.date)].notes}
                      </Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={() => {
                    setDetailModalVisible(false)
                    setStatusModalVisible(true)
                  }}
                >
                  <Text style={styles.updateButtonText}>
                    {t('Update Status')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Status Update Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={statusModalVisible}
        onRequestClose={() => setStatusModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, darkMode && styles.darkModalContent]}
          >
            {selectedDay && (
              <>
                <View style={styles.modalHeader}>
                  <Text
                    style={[styles.modalTitle, darkMode && styles.darkText]}
                  >
                    {t('Update Status')} - {formatDate(selectedDay.date)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setStatusModalVisible(false)}
                  >
                    <Ionicons
                      name="close"
                      size={24}
                      color={darkMode ? '#fff' : '#000'}
                    />
                  </TouchableOpacity>
                </View>

                {/* Phần nhập thời gian check-in và check-out thủ công */}
                {(!selectedDay.isFuture || selectedDay.isToday) && (
                  <View style={styles.timeInputContainer}>
                    <Text
                      style={[
                        styles.timeInputLabel,
                        darkMode && styles.darkText,
                      ]}
                    >
                      {t('Thời gian check-in/out thủ công')}
                    </Text>

                    <View style={styles.timeInputRow}>
                      <Text
                        style={[
                          styles.timeInputText,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {t('Check In:')}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.timeInput,
                          darkMode && styles.darkTimeInput,
                        ]}
                        onPress={() => handleOpenTimePicker('checkIn')}
                      >
                        <Text
                          style={[
                            styles.timeInputValue,
                            darkMode && styles.darkText,
                          ]}
                        >
                          {manualCheckInTime || t('Chọn giờ')}
                        </Text>
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color={darkMode ? '#fff' : '#333'}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.timeInputRow}>
                      <Text
                        style={[
                          styles.timeInputText,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {t('Check Out:')}
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.timeInput,
                          darkMode && styles.darkTimeInput,
                        ]}
                        onPress={() => handleOpenTimePicker('checkOut')}
                      >
                        <Text
                          style={[
                            styles.timeInputValue,
                            darkMode && styles.darkText,
                          ]}
                        >
                          {manualCheckOutTime || t('Chọn giờ')}
                        </Text>
                        <Ionicons
                          name="time-outline"
                          size={20}
                          color={darkMode ? '#fff' : '#333'}
                        />
                      </TouchableOpacity>
                    </View>

                    {timeValidationError ? (
                      <Text style={styles.errorText}>
                        {timeValidationError}
                      </Text>
                    ) : null}
                  </View>
                )}

                <ScrollView style={styles.statusList}>
                  {/* Hiển thị tất cả các tùy chọn cho ngày hiện tại và quá khứ */}
                  {(!selectedDay.isFuture || selectedDay.isToday) && (
                    <>
                      <TouchableOpacity
                        style={styles.statusOption}
                        onPress={() =>
                          updateDayStatus(selectedDay, WORK_STATUS.DU_CONG)
                        }
                      >
                        <View style={styles.statusIconContainer}>
                          {renderStatusIcon(WORK_STATUS.DU_CONG)}
                        </View>
                        <Text
                          style={[
                            styles.statusOptionText,
                            darkMode && styles.darkText,
                          ]}
                        >
                          {getStatusText(WORK_STATUS.DU_CONG)}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.statusOption}
                        onPress={() =>
                          updateDayStatus(selectedDay, WORK_STATUS.THIEU_LOG)
                        }
                      >
                        <View style={styles.statusIconContainer}>
                          {renderStatusIcon(WORK_STATUS.THIEU_LOG)}
                        </View>
                        <Text
                          style={[
                            styles.statusOptionText,
                            darkMode && styles.darkText,
                          ]}
                        >
                          {getStatusText(WORK_STATUS.THIEU_LOG)}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.statusOption}
                        onPress={() =>
                          updateDayStatus(selectedDay, WORK_STATUS.DI_MUON)
                        }
                      >
                        <View style={styles.statusIconContainer}>
                          {renderStatusIcon(WORK_STATUS.DI_MUON)}
                        </View>
                        <Text
                          style={[
                            styles.statusOptionText,
                            darkMode && styles.darkText,
                          ]}
                        >
                          {getStatusText(WORK_STATUS.DI_MUON)}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.statusOption}
                        onPress={() =>
                          updateDayStatus(selectedDay, WORK_STATUS.VE_SOM)
                        }
                      >
                        <View style={styles.statusIconContainer}>
                          {renderStatusIcon(WORK_STATUS.VE_SOM)}
                        </View>
                        <Text
                          style={[
                            styles.statusOptionText,
                            darkMode && styles.darkText,
                          ]}
                        >
                          {getStatusText(WORK_STATUS.VE_SOM)}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.statusOption}
                        onPress={() =>
                          updateDayStatus(
                            selectedDay,
                            WORK_STATUS.DI_MUON_VE_SOM
                          )
                        }
                      >
                        <View style={styles.statusIconContainer}>
                          {renderStatusIcon(WORK_STATUS.DI_MUON_VE_SOM)}
                        </View>
                        <Text
                          style={[
                            styles.statusOptionText,
                            darkMode && styles.darkText,
                          ]}
                        >
                          {getStatusText(WORK_STATUS.DI_MUON_VE_SOM)}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.statusOption}
                        onPress={() =>
                          updateDayStatus(selectedDay, WORK_STATUS.VANG_MAT)
                        }
                      >
                        <View style={styles.statusIconContainer}>
                          {renderStatusIcon(WORK_STATUS.VANG_MAT)}
                        </View>
                        <Text
                          style={[
                            styles.statusOptionText,
                            darkMode && styles.darkText,
                          ]}
                        >
                          {getStatusText(WORK_STATUS.VANG_MAT)}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Luôn hiển thị các tùy chọn này cho tất cả các ngày (bao gồm cả ngày tương lai) */}
                  <TouchableOpacity
                    style={styles.statusOption}
                    onPress={() =>
                      updateDayStatus(selectedDay, WORK_STATUS.NGHI_PHEP)
                    }
                  >
                    <View style={styles.statusIconContainer}>
                      {renderStatusIcon(WORK_STATUS.NGHI_PHEP)}
                    </View>
                    <Text
                      style={[
                        styles.statusOptionText,
                        darkMode && styles.darkText,
                      ]}
                    >
                      {getStatusText(WORK_STATUS.NGHI_PHEP)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.statusOption}
                    onPress={() =>
                      updateDayStatus(selectedDay, WORK_STATUS.NGHI_BENH)
                    }
                  >
                    <View style={styles.statusIconContainer}>
                      {renderStatusIcon(WORK_STATUS.NGHI_BENH)}
                    </View>
                    <Text
                      style={[
                        styles.statusOptionText,
                        darkMode && styles.darkText,
                      ]}
                    >
                      {getStatusText(WORK_STATUS.NGHI_BENH)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.statusOption}
                    onPress={() =>
                      updateDayStatus(selectedDay, WORK_STATUS.NGHI_LE)
                    }
                  >
                    <View style={styles.statusIconContainer}>
                      {renderStatusIcon(WORK_STATUS.NGHI_LE)}
                    </View>
                    <Text
                      style={[
                        styles.statusOptionText,
                        darkMode && styles.darkText,
                      ]}
                    >
                      {getStatusText(WORK_STATUS.NGHI_LE)}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.statusOption}
                    onPress={() =>
                      updateDayStatus(selectedDay, WORK_STATUS.NGHI_THUONG)
                    }
                  >
                    <View style={styles.statusIconContainer}>
                      {renderStatusIcon(WORK_STATUS.NGHI_THUONG)}
                    </View>
                    <Text
                      style={[
                        styles.statusOptionText,
                        darkMode && styles.darkText,
                      ]}
                    >
                      {getStatusText(WORK_STATUS.NGHI_THUONG)}
                    </Text>
                  </TouchableOpacity>

                  {/* Chỉ hiển thị tùy chọn "Chưa cập nhật" cho ngày hiện tại và quá khứ */}
                  {(!selectedDay.isFuture || selectedDay.isToday) && (
                    <TouchableOpacity
                      style={styles.statusOption}
                      onPress={() =>
                        updateDayStatus(selectedDay, WORK_STATUS.CHUA_CAP_NHAT)
                      }
                    >
                      <View style={styles.statusIconContainer}>
                        {renderStatusIcon(WORK_STATUS.CHUA_CAP_NHAT)}
                      </View>
                      <Text
                        style={[
                          styles.statusOptionText,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {getStatusText(WORK_STATUS.CHUA_CAP_NHAT)}
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* Chỉ hiển thị tùy chọn "Ngày tương lai" cho ngày tương lai */}
                  {selectedDay.isFuture && (
                    <TouchableOpacity
                      style={styles.statusOption}
                      onPress={() =>
                        updateDayStatus(selectedDay, WORK_STATUS.NGAY_TUONG_LAI)
                      }
                    >
                      <View style={styles.statusIconContainer}>
                        {renderStatusIcon(WORK_STATUS.NGAY_TUONG_LAI)}
                      </View>
                      <Text
                        style={[
                          styles.statusOptionText,
                          darkMode && styles.darkText,
                        ]}
                      >
                        {getStatusText(WORK_STATUS.NGAY_TUONG_LAI)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Time Picker */}
      {timePickerVisible && (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  dayCell: {
    width: '13%',
    aspectRatio: 0.8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  darkDayCell: {
    backgroundColor: '#2a2a2a',
  },
  todayCell: {
    backgroundColor: '#e6f7ff',
    borderWidth: 1,
    borderColor: '#8a56ff',
  },
  darkTodayCell: {
    backgroundColor: '#1a365d',
    borderColor: '#8a56ff',
  },
  dayOfMonth: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  dayOfWeek: {
    fontSize: 10,
    color: '#666',
  },
  darkText: {
    color: '#fff',
  },
  todayText: {
    color: '#8a56ff',
  },
  darkTodayText: {
    color: '#8a56ff',
  },
  statusContainer: {
    marginTop: 4,
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    width: '100%',
  },
  iconBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkIconBackground: {
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    borderRadius: 12,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textIconBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  darkTextIconBackground: {
    backgroundColor: 'rgba(50, 50, 50, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    overflow: 'hidden',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  darkModalContent: {
    backgroundColor: '#1e1e1e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  detailContainer: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    width: 100,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  updateButton: {
    backgroundColor: '#8a56ff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusList: {
    marginBottom: 16,
    maxHeight: 400,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statusIconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  statusOptionText: {
    fontSize: 16,
    color: '#333',
  },
  timeInputContainer: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  timeInputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeInputText: {
    fontSize: 15,
    color: '#333',
    width: '30%',
  },
  timeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    width: '65%',
  },
  darkTimeInput: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  timeInputValue: {
    fontSize: 15,
    color: '#333',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    marginTop: 5,
  },
})

// Bọc component trong React.memo để tránh render lại không cần thiết
export default React.memo(WeeklyStatusGrid)

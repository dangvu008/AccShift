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

// Import từ appConfig
import { WORK_STATUS, STORAGE_KEYS } from '../config/appConfig'

// Tên viết tắt các ngày trong tuần
const weekdayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

const WeeklyStatusGrid = () => {
  const {
    t,
    darkMode,
    attendanceLogs,
    buttonState,
    currentShift,
    shifts,
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

  // State cho dropdown và chức năng mới
  const [availableShifts, setAvailableShifts] = useState([])
  const [selectedShift, setSelectedShift] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState(null)
  const [showShiftDropdown, setShowShiftDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

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
    loadAvailableShifts()
  }, [generateWeekDays, loadDailyStatuses, loadAvailableShifts])

  // Tải danh sách ca làm việc từ context hoặc AsyncStorage
  const loadAvailableShifts = useCallback(async () => {
    try {
      // Tạo một mảng để lưu danh sách ca làm việc
      let shiftsToUse = []

      // Ưu tiên sử dụng danh sách từ context nếu có
      if (shifts && shifts.length > 0) {
        shiftsToUse = [...shifts]
      } else {
        // Nếu không có trong context, tải từ AsyncStorage
        try {
          const shiftsJson = await AsyncStorage.getItem(STORAGE_KEYS.SHIFT_LIST)
          if (shiftsJson) {
            const parsedShifts = JSON.parse(shiftsJson)
            if (Array.isArray(parsedShifts) && parsedShifts.length > 0) {
              shiftsToUse = parsedShifts
            }
          }
        } catch (storageError) {
          console.error(
            'Lỗi khi tải ca làm việc từ AsyncStorage:',
            storageError
          )
        }
      }

      // Nếu vẫn không có ca làm việc nào, tải từ database
      if (shiftsToUse.length === 0) {
        try {
          const { getShifts } = require('../utils/database')
          const dbShifts = await getShifts()
          if (dbShifts && dbShifts.length > 0) {
            shiftsToUse = dbShifts
          }
        } catch (dbError) {
          console.error('Lỗi khi tải ca làm việc từ database:', dbError)
        }
      }

      // Cập nhật state với danh sách ca làm việc đã tải
      setAvailableShifts(shiftsToUse)

      // Nếu có ca hiện tại, đặt nó làm ca được chọn mặc định
      if (currentShift && !selectedShift) {
        setSelectedShift(currentShift)
      } else if (shiftsToUse.length > 0 && !selectedShift) {
        // Nếu không có ca hiện tại nhưng có ca trong danh sách, chọn ca đầu tiên
        setSelectedShift(shiftsToUse[0])
      }

      console.log(`Đã tải ${shiftsToUse.length} ca làm việc`)
    } catch (error) {
      console.error('Lỗi khi tải danh sách ca làm việc:', error)
    }
  }, [shifts, currentShift, selectedShift])

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

  // Update status for a specific day - Cải thiện logic xử lý
  const updateDayStatus = async (day, newStatus) => {
    try {
      // Kiểm tra tính hợp lệ của thời gian nếu có nhập thủ công
      if (manualCheckInTime || manualCheckOutTime) {
        // Kiểm tra xem cả hai thời gian đã được nhập chưa
        if (
          newStatus === WORK_STATUS.DU_CONG &&
          (!manualCheckInTime || !manualCheckOutTime)
        ) {
          setTimeValidationError(
            t(
              'Cần nhập cả thời gian check-in và check-out khi trạng thái là Đủ công'
            )
          )
          return false
        }

        // Kiểm tra tính hợp lệ của thời gian
        const isValid = validateTimes(
          manualCheckInTime,
          manualCheckOutTime,
          selectedShift
        )
        if (!isValid) {
          // Nếu thời gian không hợp lệ, không tiếp tục cập nhật
          return false
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

      // Sử dụng ca làm việc được chọn từ dropdown
      const shiftToUse = selectedShift || currentShift

      // Kiểm tra xem có ca làm việc được chọn không
      if (
        !shiftToUse &&
        (newStatus === WORK_STATUS.DU_CONG ||
          newStatus === WORK_STATUS.DI_MUON ||
          newStatus === WORK_STATUS.VE_SOM ||
          newStatus === WORK_STATUS.DI_MUON_VE_SOM)
      ) {
        // Hiển thị thông báo lỗi nếu không có ca làm việc được chọn
        setTimeValidationError(
          t('Không thể cập nhật trạng thái: Không có ca làm việc được chọn')
        )
        console.error(
          'Không thể cập nhật trạng thái: Không có ca làm việc được chọn'
        )
        setUpdatingStatus(false)
        setUpdatingDay(null)
        return false
      }

      // Kiểm tra xem thời gian check-out có trước check-in không
      if (manualCheckInTime && manualCheckOutTime) {
        const [checkInHours, checkInMinutes] = manualCheckInTime
          .split(':')
          .map(Number)
        const [checkOutHours, checkOutMinutes] = manualCheckOutTime
          .split(':')
          .map(Number)

        const checkInMinutesTotal = checkInHours * 60 + checkInMinutes
        const checkOutMinutesTotal = checkOutHours * 60 + checkOutMinutes

        if (checkOutMinutesTotal <= checkInMinutesTotal) {
          setTimeValidationError(
            t('Thời gian check-out phải sau thời gian check-in')
          )
          setUpdatingStatus(false)
          setUpdatingDay(null)
          return false
        }
      }

      // Tạo đối tượng trạng thái cập nhật
      const updatedStatus = {
        ...existingStatus,
        date: dateKey,
        status: newStatus,
        updatedAt: now.toISOString(),
        isManuallyUpdated: true, // Đánh dấu là đã cập nhật thủ công
        // Lưu thông tin ca làm việc được chọn
        shiftId: shiftToUse ? shiftToUse.id : existingStatus.shiftId,
        shiftName: shiftToUse ? shiftToUse.name : existingStatus.shiftName,
      }

      // Lưu thời gian chấm công thực tế
      if (
        newStatus === WORK_STATUS.DU_CONG ||
        newStatus === WORK_STATUS.THIEU_LOG ||
        newStatus === WORK_STATUS.DI_MUON ||
        newStatus === WORK_STATUS.VE_SOM ||
        newStatus === WORK_STATUS.DI_MUON_VE_SOM ||
        newStatus === WORK_STATUS.QUEN_CHECK_OUT
      ) {
        // Sử dụng thời gian nhập thủ công nếu có
        if (manualCheckInTime) {
          updatedStatus.vaoLogTime = manualCheckInTime
        }
        // Nếu không có thời gian nhập thủ công và chưa có thời gian vào, sử dụng thời gian mặc định từ ca làm việc
        else if (!updatedStatus.vaoLogTime) {
          // Nếu có ca làm việc được chọn, sử dụng thời gian bắt đầu ca làm việc
          if (shiftToUse) {
            updatedStatus.vaoLogTime = shiftToUse.startTime
          } else {
            updatedStatus.vaoLogTime = timeString
          }
        }

        // Sử dụng thời gian nhập thủ công nếu có
        if (manualCheckOutTime) {
          updatedStatus.raLogTime = manualCheckOutTime
        }
        // Nếu không có thời gian nhập thủ công và chưa có thời gian ra, sử dụng thời gian mặc định từ ca làm việc
        else if (
          !updatedStatus.raLogTime &&
          newStatus !== WORK_STATUS.QUEN_CHECK_OUT
        ) {
          // Nếu có ca làm việc được chọn, sử dụng thời gian kết thúc ca làm việc
          if (shiftToUse) {
            updatedStatus.raLogTime =
              shiftToUse.endTime || shiftToUse.officeEndTime
          } else {
            updatedStatus.raLogTime = timeString
          }
        }

        // Kiểm tra lại tính hợp lệ của thời gian vào/ra
        if (updatedStatus.vaoLogTime && updatedStatus.raLogTime) {
          const [checkInHours, checkInMinutes] = updatedStatus.vaoLogTime
            .split(':')
            .map(Number)
          const [checkOutHours, checkOutMinutes] = updatedStatus.raLogTime
            .split(':')
            .map(Number)

          const checkInMinutesTotal = checkInHours * 60 + checkInMinutes
          const checkOutMinutesTotal = checkOutHours * 60 + checkOutMinutes

          // Nếu thời gian check-out <= check-in, đặt trạng thái thành LOI_DU_LIEU
          if (checkOutMinutesTotal <= checkInMinutesTotal) {
            console.warn('Phát hiện lỗi dữ liệu: Check-out trước Check-in')
            updatedStatus.status = WORK_STATUS.LOI_DU_LIEU || 'LOI_DU_LIEU'

            // Đặt giờ công về 0 khi có lỗi dữ liệu
            updatedStatus.standardHoursScheduled = 0
            updatedStatus.otHoursScheduled = 0
            updatedStatus.sundayHoursScheduled = 0
            updatedStatus.nightHoursScheduled = 0
            updatedStatus.totalHoursScheduled = 0
          }
        }
      }

      // Nếu trạng thái là DU_CONG, tính toán giờ làm dựa trên ca làm việc
      if (newStatus === WORK_STATUS.DU_CONG && shiftToUse) {
        try {
          // Import các hàm cần thiết từ timeIntervalUtils và workStatusCalculator
          const {
            isOvernightShift,
            createFullTimestamp,
            createShiftInterval,
          } = require('../utils/timeIntervalUtils')

          const {
            calculateScheduledWorkTime,
          } = require('../utils/workStatusCalculator')

          // Tính toán giờ làm dựa trên ca làm việc được chọn
          const baseDate = new Date(day.date) // Sử dụng ngày được chọn

          // Lấy cài đặt người dùng
          const userSettings = await storage.getUserSettings()

          // Tính toán giờ làm theo lịch trình ca
          // Sử dụng hàm calculateScheduledWorkTime từ workStatusCalculator
          const scheduledTimes = calculateScheduledWorkTime(
            shiftToUse,
            baseDate,
            userSettings
          )

          // Cập nhật các giá trị giờ làm vào trạng thái
          updatedStatus.standardHoursScheduled =
            scheduledTimes.standardHoursScheduled
          updatedStatus.otHoursScheduled = scheduledTimes.otHoursScheduled
          updatedStatus.sundayHoursScheduled =
            scheduledTimes.sundayHoursScheduled
          updatedStatus.nightHoursScheduled = scheduledTimes.nightHoursScheduled
          updatedStatus.totalHoursScheduled = scheduledTimes.totalHoursScheduled

          // Lưu thông tin về ca qua đêm
          updatedStatus.isOvernight = scheduledTimes.isOvernight

          // Lưu các timestamp đầy đủ
          if (scheduledTimes.scheduledStartTime) {
            updatedStatus.scheduledStartTime =
              scheduledTimes.scheduledStartTime.toISOString()
          }
          if (scheduledTimes.scheduledOfficeEndTime) {
            updatedStatus.scheduledOfficeEndTime =
              scheduledTimes.scheduledOfficeEndTime.toISOString()
          }
          if (scheduledTimes.scheduledEndTime) {
            updatedStatus.scheduledEndTime =
              scheduledTimes.scheduledEndTime.toISOString()
          }

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

      try {
        // Sử dụng workStatusCalculator để cập nhật trạng thái
        const {
          updateWorkStatusManually,
        } = require('../utils/workStatusCalculator')

        // Tạo dữ liệu bổ sung cho cập nhật
        const additionalData = {
          shiftId: updatedStatus.shiftId,
          shiftName: updatedStatus.shiftName,
          vaoLogTime: updatedStatus.vaoLogTime,
          raLogTime: updatedStatus.raLogTime,
        }

        // Nếu là trạng thái DU_CONG và có ca làm việc, tính toán giờ công
        if (newStatus === WORK_STATUS.DU_CONG && shiftToUse) {
          // Không cần tính toán giờ công ở đây vì đã tính toán ở trên
          // và đã lưu vào updatedStatus
          // Chỉ cần thêm các giá trị đã tính toán vào additionalData
          Object.assign(additionalData, {
            standardHoursScheduled: updatedStatus.standardHoursScheduled,
            otHoursScheduled: updatedStatus.otHoursScheduled,
            sundayHoursScheduled: updatedStatus.sundayHoursScheduled,
            nightHoursScheduled: updatedStatus.nightHoursScheduled,
            totalHoursScheduled: updatedStatus.totalHoursScheduled,
            isOvernight: updatedStatus.isOvernight,
            scheduledStartTime: updatedStatus.scheduledStartTime,
            scheduledOfficeEndTime: updatedStatus.scheduledOfficeEndTime,
            scheduledEndTime: updatedStatus.scheduledEndTime,
          })
        }

        // Cập nhật trạng thái sử dụng hàm từ workStatusCalculator
        const result = await updateWorkStatusManually(
          dateKey,
          newStatus,
          additionalData
        )

        if (result) {
          // Cập nhật trạng thái local sau khi lưu thành công
          setDailyStatuses((prevStatuses) => ({
            ...prevStatuses,
            [dateKey]: result,
          }))

          // Thông báo cho các thành phần khác về sự thay đổi trạng thái
          if (typeof notifyWorkStatusUpdate === 'function') {
            console.log(
              '[DEBUG] Gọi hàm thông báo cập nhật trạng thái làm việc'
            )
            notifyWorkStatusUpdate()
          }
        }
      } catch (updateError) {
        console.error('Lỗi khi cập nhật trạng thái làm việc:', updateError)

        // Nếu có lỗi khi sử dụng workStatusCalculator, sử dụng cách cũ
        await AsyncStorage.setItem(
          `dailyWorkStatus_${dateKey}`,
          JSON.stringify(updatedStatus)
        )

        // Cập nhật trạng thái local
        setDailyStatuses((prevStatuses) => ({
          ...prevStatuses,
          [dateKey]: updatedStatus,
        }))

        // Thông báo cho các thành phần khác
        if (typeof notifyWorkStatusUpdate === 'function') {
          notifyWorkStatusUpdate()
        }
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

  // Get icon for status - Cải thiện với màu sắc nhất quán
  const getStatusIcon = (status) => {
    // Sử dụng màu sắc từ theme để đảm bảo tính nhất quán
    const colors = {
      success: '#27ae60', // Xanh lá - thành công
      warning: '#f39c12', // Cam - cảnh báo
      error: '#e74c3c', // Đỏ - lỗi
      info: '#3498db', // Xanh dương - thông tin
      neutral: '#95a5a6', // Xám - trung tính
      primary: '#8a56ff', // Tím - màu chính của ứng dụng
    }

    switch (status) {
      case WORK_STATUS.THIEU_LOG:
        return {
          name: 'warning-outline',
          color: colors.error,
          type: 'ionicons',
        }
      case WORK_STATUS.DU_CONG:
        return {
          name: 'checkmark-circle',
          color: colors.success,
          type: 'ionicons',
        }
      case WORK_STATUS.NGHI_PHEP:
        return {
          name: 'document-text-outline',
          color: colors.info,
          type: 'ionicons',
        }
      case WORK_STATUS.NGHI_BENH:
        return { name: 'fitness-outline', color: colors.info, type: 'ionicons' }
      case WORK_STATUS.NGHI_LE:
        return { name: 'flag-outline', color: colors.warning, type: 'ionicons' }
      case WORK_STATUS.NGHI_THUONG:
        return { name: 'cafe-outline', color: colors.success, type: 'ionicons' }
      case WORK_STATUS.VANG_MAT:
        return { name: 'close-circle', color: colors.error, type: 'ionicons' }
      case WORK_STATUS.DI_MUON:
        return {
          name: 'alarm-outline',
          color: colors.warning,
          type: 'ionicons',
        }
      case WORK_STATUS.VE_SOM:
        return {
          name: 'log-out-outline',
          color: colors.warning,
          type: 'ionicons',
        }
      case WORK_STATUS.DI_MUON_VE_SOM:
        return {
          name: 'timer-outline',
          color: colors.warning,
          type: 'ionicons',
        }
      case WORK_STATUS.NGAY_TUONG_LAI:
        return {
          name: 'calendar-outline',
          color: colors.neutral,
          type: 'ionicons',
        }
      case WORK_STATUS.CHUA_CAP_NHAT:
        return {
          name: 'ellipsis-horizontal-circle-outline',
          color: colors.neutral,
          type: 'ionicons',
        }
      case WORK_STATUS.QUEN_CHECK_OUT:
        return {
          name: 'alert-outline',
          color: colors.warning,
          type: 'ionicons',
        }
      case WORK_STATUS.LOI_DU_LIEU:
        return {
          name: 'alert-circle',
          color: colors.error,
          type: 'ionicons',
        }
      case WORK_STATUS.DANG_LAM_VIEC:
        return {
          name: 'hourglass-outline',
          color: colors.info,
          type: 'ionicons',
        }
      default:
        return {
          name: 'help-circle-outline',
          color: colors.neutral,
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
      case WORK_STATUS.LOI_DU_LIEU:
        return t('Lỗi dữ liệu')
      case WORK_STATUS.DANG_LAM_VIEC:
        return t('Đang làm việc')
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
      case WORK_STATUS.LOI_DU_LIEU:
        return 'LD'
      case WORK_STATUS.DANG_LAM_VIEC:
        return 'DL'
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
  const handleDayLongPress = async (day) => {
    console.log(
      `[DEBUG] Mở modal cập nhật trạng thái cho ngày: ${formatDateKey(
        day.date
      )}`
    )

    // Cho phép cập nhật trạng thái cho tất cả các ngày
    // Nhưng sẽ giới hạn các trạng thái có thể chọn trong modal dựa vào ngày
    setSelectedDay(day)

    // Reset các giá trị thời gian thủ công và lỗi
    setTimeValidationError('')
    setManualCheckInTime('')
    setManualCheckOutTime('')

    // Đóng tất cả các dropdown
    setShowShiftDropdown(false)
    setShowStatusDropdown(false)

    // Lấy thông tin trạng thái hiện tại của ngày được chọn
    const dateKey = formatDateKey(day.date)

    // Tải lại dữ liệu trạng thái từ AsyncStorage để đảm bảo dữ liệu mới nhất
    try {
      const storage = require('../utils/storage').default
      const freshStatus = await storage.getDailyWorkStatus(dateKey)
      const currentStatus = freshStatus || dailyStatuses[dateKey] || {}

      console.log(
        `[DEBUG] Trạng thái hiện tại của ngày ${dateKey}:`,
        currentStatus.status || 'CHUA_CAP_NHAT'
      )

      // Tìm và đặt ca làm việc hiện tại
      let dayShift = null
      if (currentStatus.shiftId) {
        // Tải lại danh sách ca làm việc nếu cần
        if (availableShifts.length === 0) {
          await loadAvailableShifts()
        }

        dayShift = availableShifts.find(
          (shift) => shift.id === currentStatus.shiftId
        )
        console.log(
          `[DEBUG] Đã tìm thấy ca làm việc: ${
            dayShift ? dayShift.name : 'Không có'
          }`
        )
        setSelectedShift(dayShift || currentShift)
      } else {
        setSelectedShift(currentShift)
        dayShift = currentShift
        console.log(
          `[DEBUG] Sử dụng ca làm việc hiện tại: ${
            currentShift ? currentShift.name : 'Không có'
          }`
        )
      }

      // Đặt trạng thái làm việc hiện tại
      setSelectedStatus(currentStatus.status || WORK_STATUS.CHUA_CAP_NHAT)

      // Reset thời gian check-in và check-out trước khi tải dữ liệu mới
      setManualCheckInTime('')
      setManualCheckOutTime('')

      // 1. Kiểm tra xem ngày đã có dữ liệu lịch sử chấm công chưa
      const { checkInLog, checkOutLog } = await loadAttendanceLogsForDay(
        day.date
      )

      // Nếu đã có dữ liệu lịch sử chấm công trong trạng thái hiện tại, ưu tiên sử dụng
      if (currentStatus.vaoLogTime || currentStatus.raLogTime) {
        console.log('[DEBUG] Sử dụng thời gian từ trạng thái hiện tại')
        console.log(
          `[DEBUG] Check-in: ${currentStatus.vaoLogTime || 'Không có'}`
        )
        console.log(
          `[DEBUG] Check-out: ${currentStatus.raLogTime || 'Không có'}`
        )

        // Đảm bảo đặt cả hai giá trị, ngay cả khi một trong hai là null
        setManualCheckInTime(currentStatus.vaoLogTime || '')
        setManualCheckOutTime(currentStatus.raLogTime || '')
      }
      // Nếu có dữ liệu lịch sử chấm công từ logs, sử dụng
      else if (checkInLog || checkOutLog) {
        console.log('[DEBUG] Sử dụng thời gian từ lịch sử chấm công')
        // Thời gian đã được set trong hàm loadAttendanceLogsForDay
      }
      // Nếu chưa có dữ liệu lịch sử, sử dụng thời gian mặc định từ ca làm việc
      else if (dayShift) {
        console.log('[DEBUG] Sử dụng thời gian mặc định từ ca làm việc')
        setDefaultTimesFromShift(dayShift)
      }

      // Hiển thị modal cập nhật trạng thái
      setStatusModalVisible(true)
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu cho modal cập nhật trạng thái:', error)
      // Vẫn hiển thị modal với dữ liệu có sẵn
      setStatusModalVisible(true)
    }
  }

  // Xử lý khi người dùng muốn mở time picker
  const handleOpenTimePicker = (type) => {
    console.log(`[DEBUG] Mở time picker cho: ${type}`)

    // Đặt loại thời gian đang chỉnh sửa (checkIn hoặc checkOut)
    setCurrentEditingTime(type)

    // Đặt chế độ picker là time
    setTimePickerMode('time')

    // Hiển thị time picker
    setTimePickerVisible(true)

    console.log(`[DEBUG] Time picker đã được hiển thị cho: ${type}`)
    console.log(
      `[DEBUG] Giá trị hiện tại: ${
        type === 'checkIn' ? manualCheckInTime : manualCheckOutTime
      }`
    )
  }

  // Xử lý khi người dùng chọn thời gian
  const handleTimeChange = (event, selectedTime) => {
    console.log(
      `[DEBUG] handleTimeChange được gọi với event:`,
      event ? event.type : 'không có event',
      `và selectedTime:`,
      selectedTime
        ? `${selectedTime.getHours()}:${selectedTime.getMinutes()}`
        : 'null'
    )

    // Xử lý theo nền tảng
    if (Platform.OS === 'ios') {
      // Trên iOS, chỉ xử lý khi người dùng nhấn Done (event.type === 'set')
      if (event && event.type === 'set' && selectedTime) {
        // Định dạng thời gian đã chọn (chỉ giờ và phút)
        const formattedTime = selectedTime.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        })

        console.log(`[DEBUG] iOS - Thời gian đã chọn: ${formattedTime}`)

        // Cập nhật state tương ứng với loại thời gian đang chỉnh sửa
        if (currentEditingTime === 'checkIn') {
          setManualCheckInTime(formattedTime)
          console.log(
            `[DEBUG] Đã cập nhật thời gian check-in: ${formattedTime}`
          )
        } else if (currentEditingTime === 'checkOut') {
          setManualCheckOutTime(formattedTime)
          console.log(
            `[DEBUG] Đã cập nhật thời gian check-out: ${formattedTime}`
          )
        }

        // Kiểm tra tính hợp lệ của thời gian
        validateTimes(
          currentEditingTime === 'checkIn' ? formattedTime : manualCheckInTime,
          currentEditingTime === 'checkOut' ? formattedTime : manualCheckOutTime
        )
      }

      // Đóng time picker sau khi xử lý hoặc khi người dùng hủy
      setTimePickerVisible(false)
    } else {
      // Trên Android và các nền tảng khác
      if (selectedTime) {
        // Định dạng thời gian đã chọn (chỉ giờ và phút)
        const formattedTime = selectedTime.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        })

        console.log(`[DEBUG] Android - Thời gian đã chọn: ${formattedTime}`)

        // Cập nhật state tương ứng với loại thời gian đang chỉnh sửa
        if (currentEditingTime === 'checkIn') {
          setManualCheckInTime(formattedTime)
          console.log(
            `[DEBUG] Đã cập nhật thời gian check-in: ${formattedTime}`
          )
        } else if (currentEditingTime === 'checkOut') {
          setManualCheckOutTime(formattedTime)
          console.log(
            `[DEBUG] Đã cập nhật thời gian check-out: ${formattedTime}`
          )
        }

        // Kiểm tra tính hợp lệ của thời gian
        validateTimes(
          currentEditingTime === 'checkIn' ? formattedTime : manualCheckInTime,
          currentEditingTime === 'checkOut' ? formattedTime : manualCheckOutTime
        )
      }

      // Đóng time picker sau khi xử lý
      setTimePickerVisible(false)
    }
  }

  // Tải dữ liệu lịch sử chấm công cho ngày được chọn
  const loadAttendanceLogsForDay = async (date) => {
    try {
      if (!date) {
        console.error('Không thể tải dữ liệu: Ngày không hợp lệ')
        return { checkInLog: null, checkOutLog: null }
      }

      const dateKey = formatDateKey(date)
      console.log(`[DEBUG] Đang tải dữ liệu chấm công cho ngày: ${dateKey}`)

      // Tải dữ liệu từ AsyncStorage
      const storage = require('../utils/storage').default
      const logs = await storage.getAttendanceLogs(dateKey)

      console.log(
        `[DEBUG] Đã tải ${
          logs ? logs.length : 0
        } log chấm công cho ngày ${dateKey}`
      )

      if (!logs || logs.length === 0) {
        console.log(`[DEBUG] Không có dữ liệu chấm công cho ngày ${dateKey}`)
        return { checkInLog: null, checkOutLog: null }
      }

      // Tìm log check-in và check-out
      const checkInLog = logs.find((log) => log.type === 'check_in')
      const checkOutLog = logs.find((log) => log.type === 'check_out')

      console.log(
        `[DEBUG] Tìm thấy log check-in: ${checkInLog ? 'Có' : 'Không'}`
      )
      console.log(
        `[DEBUG] Tìm thấy log check-out: ${checkOutLog ? 'Có' : 'Không'}`
      )

      // Nếu có log check-in, lấy thời gian
      if (checkInLog && checkInLog.timestamp) {
        const checkInTime = new Date(checkInLog.timestamp)
        const formattedCheckInTime = checkInTime.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        })
        console.log(`[DEBUG] Thời gian check-in: ${formattedCheckInTime}`)
        setManualCheckInTime(formattedCheckInTime)
      } else {
        console.log('[DEBUG] Không có thời gian check-in hợp lệ')
      }

      // Nếu có log check-out, lấy thời gian
      if (checkOutLog && checkOutLog.timestamp) {
        const checkOutTime = new Date(checkOutLog.timestamp)
        const formattedCheckOutTime = checkOutTime.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        })
        console.log(`[DEBUG] Thời gian check-out: ${formattedCheckOutTime}`)
        setManualCheckOutTime(formattedCheckOutTime)
      } else {
        console.log('[DEBUG] Không có thời gian check-out hợp lệ')
      }

      return { checkInLog, checkOutLog }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu lịch sử chấm công:', error)
      return { checkInLog: null, checkOutLog: null }
    }
  }

  // Tự động điền thời gian mặc định từ ca làm việc
  const setDefaultTimesFromShift = (shift) => {
    if (!shift) return

    console.log(`[DEBUG] Đặt thời gian mặc định từ ca làm việc: ${shift.name}`)
    console.log(`[DEBUG] Thời gian bắt đầu ca: ${shift.startTime}`)
    console.log(
      `[DEBUG] Thời gian kết thúc ca: ${shift.endTime || shift.officeEndTime}`
    )

    // Thời gian check-in mặc định là thời gian bắt đầu ca
    setManualCheckInTime(shift.startTime)

    // Thời gian check-out mặc định là thời gian kết thúc ca
    setManualCheckOutTime(shift.endTime || shift.officeEndTime)
  }

  // Xử lý khi người dùng chọn ca làm việc từ dropdown
  const handleSelectShift = (shift) => {
    setSelectedShift(shift)
    setShowShiftDropdown(false)

    // Nếu chưa có thời gian check-in/check-out, đặt thời gian mặc định từ ca làm việc mới
    if (!manualCheckInTime && !manualCheckOutTime) {
      setDefaultTimesFromShift(shift)
    }
    // Nếu đã có thời gian, kiểm tra tính hợp lệ với ca mới
    else if (manualCheckInTime || manualCheckOutTime) {
      validateTimes(manualCheckInTime, manualCheckOutTime, shift)
    }
  }

  // Xử lý khi người dùng chọn trạng thái từ dropdown
  const handleSelectStatus = (status) => {
    setSelectedStatus(status)
    setShowStatusDropdown(false)
  }

  // Xử lý khi người dùng nhấn nút Lưu
  const handleSaveChanges = () => {
    // Kiểm tra tính hợp lệ của thời gian
    if (manualCheckInTime || manualCheckOutTime) {
      const isValid = validateTimes(
        manualCheckInTime,
        manualCheckOutTime,
        selectedShift
      )
      if (!isValid) return
    }

    // Hiển thị hộp thoại xác nhận
    setShowConfirmDialog(true)
  }

  // Xử lý khi người dùng xác nhận lưu thay đổi
  const handleConfirmSave = () => {
    // Đóng hộp thoại xác nhận
    setShowConfirmDialog(false)

    // Cập nhật trạng thái
    if (selectedDay && selectedStatus) {
      updateDayStatus(selectedDay, selectedStatus)
    }
  }

  // Hàm tính toán giờ công từ ca làm việc
  const calculateWorkHoursFromShift = (shift) => {
    if (!shift) return {}

    try {
      // Kiểm tra xem ca làm việc có phải là ca qua đêm không
      const isOvernight = (startTime, endTime) => {
        if (!startTime || !endTime) return false

        const [startHour, startMinute] = startTime.split(':').map(Number)
        const [endHour, endMinute] = endTime.split(':').map(Number)

        return (
          endHour < startHour ||
          (endHour === startHour && endMinute < startMinute)
        )
      }

      // Tính tổng thời gian làm việc (giờ)
      const calculateTotalHours = (startTime, endTime, breakMinutes = 0) => {
        if (!startTime || !endTime) return 0

        const [startHour, startMinute] = startTime.split(':').map(Number)
        const [endHour, endMinute] = endTime.split(':').map(Number)

        let totalMinutes
        if (isOvernight(startTime, endTime)) {
          // Ca qua đêm: Thời gian từ startTime đến 24:00 + từ 00:00 đến endTime
          totalMinutes =
            (24 - startHour) * 60 - startMinute + endHour * 60 + endMinute
        } else {
          // Ca thông thường
          totalMinutes = (endHour - startHour) * 60 + (endMinute - startMinute)
        }

        // Trừ thời gian nghỉ
        totalMinutes -= breakMinutes

        // Chuyển đổi sang giờ
        return Math.max(0, totalMinutes / 60)
      }

      // Tính toán giờ công
      const totalHours = calculateTotalHours(
        shift.startTime,
        shift.endTime,
        shift.breakMinutes || 0
      )

      // Mặc định tất cả giờ là giờ tiêu chuẩn
      const standardHours = totalHours

      return {
        standardHoursScheduled: standardHours,
        otHoursScheduled: 0, // Mặc định không có giờ OT
        sundayHoursScheduled: 0, // Mặc định không có giờ làm chủ nhật
        nightHoursScheduled: 0, // Mặc định không có giờ làm đêm
        totalHoursScheduled: totalHours,
      }
    } catch (error) {
      console.error('Lỗi khi tính toán giờ công từ ca làm việc:', error)
      return {}
    }
  }

  // Kiểm tra tính hợp lệ của thời gian check-in và check-out
  const validateTimes = (checkInTime, checkOutTime, shift = selectedShift) => {
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
        setTimeValidationError(
          t('Thời gian check-in không thể trong tương lai')
        )
        return false
      }

      if (checkOutDate > now) {
        setTimeValidationError(
          t('Thời gian check-out không thể trong tương lai')
        )
        return false
      }
    }

    // Kiểm tra check-out phải sau check-in (trước khi kiểm tra ca làm việc)
    // Đây là điều kiện tiên quyết cho tất cả các trường hợp
    if (checkOutDate <= checkInDate) {
      setTimeValidationError(
        t('Thời gian check-out phải sau thời gian check-in')
      )
      return false
    }

    // Nếu có ca làm việc được chọn, kiểm tra thời gian check-in/check-out có phù hợp không
    if (shift) {
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

      // Tạo đối tượng Date cho thời gian bắt đầu ca
      const [shiftStartHours, shiftStartMinutes] = shift.startTime
        .split(':')
        .map(Number)
      const shiftStartDate = new Date(today)
      shiftStartDate.setHours(shiftStartHours, shiftStartMinutes, 0)

      // Tạo đối tượng Date cho thời gian kết thúc ca
      const [shiftEndHours, shiftEndMinutes] = shift.endTime
        .split(':')
        .map(Number)
      const shiftEndDate = new Date(today)
      shiftEndDate.setHours(shiftEndHours, shiftEndMinutes, 0)

      // Nếu là ca qua đêm và thời gian kết thúc < thời gian bắt đầu, thêm 1 ngày vào thời gian kết thúc
      if (isOvernight && shiftEndDate < shiftStartDate) {
        shiftEndDate.setDate(shiftEndDate.getDate() + 1)
      }

      // Kiểm tra thời gian check-in có quá sớm so với thời gian bắt đầu ca không (cho phép sớm tối đa 1 giờ)
      const oneHourBeforeShiftStart = new Date(shiftStartDate)
      oneHourBeforeShiftStart.setHours(oneHourBeforeShiftStart.getHours() - 1)

      if (checkInDate < oneHourBeforeShiftStart) {
        setTimeValidationError(
          t(
            `Thời gian check-in quá sớm so với giờ bắt đầu ca (${shift.startTime})`
          )
        )
        return false
      }

      // Kiểm tra thời gian check-out có quá muộn so với thời gian kết thúc ca không (cho phép muộn tối đa 2 giờ)
      const twoHoursAfterShiftEnd = new Date(shiftEndDate)
      twoHoursAfterShiftEnd.setHours(twoHoursAfterShiftEnd.getHours() + 2)

      if (checkOutDate > twoHoursAfterShiftEnd) {
        setTimeValidationError(
          t(
            `Thời gian check-out quá muộn so với giờ kết thúc ca (${shift.endTime})`
          )
        )
        return false
      }
    }

    return true
  }

  // Render status icon for dropdown - Sử dụng lại cấu hình từ getStatusIcon
  const renderStatusIcon = (status) => {
    // Lấy cấu hình icon từ hàm getStatusIcon
    const iconConfig = getStatusIcon(status)
    const size = 24

    // Hiển thị icon dựa trên loại
    if (iconConfig.type === 'ionicons') {
      return (
        <Ionicons name={iconConfig.name} size={size} color={iconConfig.color} />
      )
    } else if (iconConfig.type === 'material-community') {
      return (
        <MaterialCommunityIcons
          name={iconConfig.name}
          size={size}
          color={iconConfig.color}
        />
      )
    } else if (iconConfig.type === 'font-awesome') {
      return (
        <FontAwesome5
          name={iconConfig.name}
          size={size}
          color={iconConfig.color}
        />
      )
    }

    // Mặc định nếu không có loại phù hợp
    return <Ionicons name="help-circle" size={size} color="#9e9e9e" />
  }

  // Render status icon in grid
  const renderStatusIconInGrid = (status, isInGrid = false, day = null) => {
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

  // Format time string to only show hours and minutes (HH:MM)
  const formatTimeString = (timeString) => {
    if (!timeString) return '--:--'

    // Nếu là chuỗi thời gian đầy đủ (HH:MM:SS), cắt bỏ phần giây
    if (
      timeString.length === 8 &&
      timeString.charAt(2) === ':' &&
      timeString.charAt(5) === ':'
    ) {
      return timeString.substring(0, 5)
    }

    // Nếu là chuỗi thời gian có định dạng khác, đảm bảo chỉ trả về HH:MM
    if (timeString.includes(':')) {
      const parts = timeString.split(':')
      if (parts.length >= 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
      }
    }

    return timeString
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
                {renderStatusIconInGrid(status, true, day)}
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
                        {formatTimeString(
                          dailyStatuses[formatDateKey(selectedDay.date)]
                            .vaoLogTime
                        )}
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
                        {formatTimeString(
                          dailyStatuses[formatDateKey(selectedDay.date)]
                            .raLogTime
                        )}
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
                    {t('Cập nhật trạng thái')} - {formatDate(selectedDay.date)}
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

                {/* Dropdown chọn ca làm việc */}
                <View style={styles.dropdownSection}>
                  <Text
                    style={[styles.dropdownLabel, darkMode && styles.darkText]}
                  >
                    {t('Ca làm việc')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdownButton,
                      darkMode && styles.darkDropdownButton,
                    ]}
                    onPress={() => {
                      setShowShiftDropdown(!showShiftDropdown)
                      setShowStatusDropdown(false)
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownButtonText,
                        darkMode && styles.darkText,
                      ]}
                    >
                      {selectedShift
                        ? selectedShift.name
                        : t('Chọn ca làm việc')}
                    </Text>
                    <Ionicons
                      name={showShiftDropdown ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={darkMode ? '#fff' : '#333'}
                    />
                  </TouchableOpacity>

                  {/* Dropdown menu cho ca làm việc */}
                  {showShiftDropdown && (
                    <View
                      style={[
                        styles.dropdownMenu,
                        darkMode && styles.darkDropdownMenu,
                      ]}
                    >
                      <ScrollView
                        style={styles.dropdownScrollView}
                        nestedScrollEnabled={true}
                      >
                        {availableShifts.map((shift) => (
                          <TouchableOpacity
                            key={shift.id}
                            style={[
                              styles.dropdownItem,
                              selectedShift &&
                                selectedShift.id === shift.id &&
                                styles.dropdownItemSelected,
                              darkMode && styles.darkDropdownItem,
                              selectedShift &&
                                selectedShift.id === shift.id &&
                                darkMode &&
                                styles.darkDropdownItemSelected,
                            ]}
                            onPress={() => handleSelectShift(shift)}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                darkMode && styles.darkText,
                                selectedShift &&
                                  selectedShift.id === shift.id &&
                                  styles.dropdownItemTextSelected,
                              ]}
                            >
                              {shift.name}
                            </Text>
                            {selectedShift && selectedShift.id === shift.id && (
                              <Ionicons
                                name="checkmark"
                                size={20}
                                color={darkMode ? '#fff' : '#8a56ff'}
                              />
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Dropdown chọn trạng thái */}
                <View style={styles.dropdownSection}>
                  <Text
                    style={[styles.dropdownLabel, darkMode && styles.darkText]}
                  >
                    {t('Trạng thái')}
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.dropdownButton,
                      darkMode && styles.darkDropdownButton,
                    ]}
                    onPress={() => {
                      setShowStatusDropdown(!showStatusDropdown)
                      setShowShiftDropdown(false)
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownButtonText,
                        darkMode && styles.darkText,
                      ]}
                    >
                      {selectedStatus
                        ? getStatusText(selectedStatus)
                        : t('Chọn trạng thái')}
                    </Text>
                    <Ionicons
                      name={showStatusDropdown ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={darkMode ? '#fff' : '#333'}
                    />
                  </TouchableOpacity>

                  {/* Dropdown menu cho trạng thái */}
                  {showStatusDropdown && (
                    <View
                      style={[
                        styles.dropdownMenu,
                        darkMode && styles.darkDropdownMenu,
                      ]}
                    >
                      <ScrollView
                        style={styles.dropdownScrollView}
                        nestedScrollEnabled={true}
                      >
                        {/* Hiển thị tất cả các tùy chọn cho ngày hiện tại và quá khứ */}
                        {(!selectedDay.isFuture || selectedDay.isToday) && (
                          <>
                            <TouchableOpacity
                              style={[
                                styles.dropdownItem,
                                selectedStatus === WORK_STATUS.DU_CONG &&
                                  styles.dropdownItemSelected,
                                darkMode && styles.darkDropdownItem,
                                selectedStatus === WORK_STATUS.DU_CONG &&
                                  darkMode &&
                                  styles.darkDropdownItemSelected,
                              ]}
                              onPress={() =>
                                handleSelectStatus(WORK_STATUS.DU_CONG)
                              }
                            >
                              <View style={styles.statusIconContainer}>
                                {renderStatusIcon(WORK_STATUS.DU_CONG)}
                              </View>
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  darkMode && styles.darkText,
                                  selectedStatus === WORK_STATUS.DU_CONG &&
                                    styles.dropdownItemTextSelected,
                                ]}
                              >
                                {getStatusText(WORK_STATUS.DU_CONG)}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.dropdownItem,
                                selectedStatus === WORK_STATUS.THIEU_LOG &&
                                  styles.dropdownItemSelected,
                                darkMode && styles.darkDropdownItem,
                                selectedStatus === WORK_STATUS.THIEU_LOG &&
                                  darkMode &&
                                  styles.darkDropdownItemSelected,
                              ]}
                              onPress={() =>
                                handleSelectStatus(WORK_STATUS.THIEU_LOG)
                              }
                            >
                              <View style={styles.statusIconContainer}>
                                {renderStatusIcon(WORK_STATUS.THIEU_LOG)}
                              </View>
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  darkMode && styles.darkText,
                                  selectedStatus === WORK_STATUS.THIEU_LOG &&
                                    styles.dropdownItemTextSelected,
                                ]}
                              >
                                {getStatusText(WORK_STATUS.THIEU_LOG)}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.dropdownItem,
                                selectedStatus === WORK_STATUS.DI_MUON &&
                                  styles.dropdownItemSelected,
                                darkMode && styles.darkDropdownItem,
                                selectedStatus === WORK_STATUS.DI_MUON &&
                                  darkMode &&
                                  styles.darkDropdownItemSelected,
                              ]}
                              onPress={() =>
                                handleSelectStatus(WORK_STATUS.DI_MUON)
                              }
                            >
                              <View style={styles.statusIconContainer}>
                                {renderStatusIcon(WORK_STATUS.DI_MUON)}
                              </View>
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  darkMode && styles.darkText,
                                  selectedStatus === WORK_STATUS.DI_MUON &&
                                    styles.dropdownItemTextSelected,
                                ]}
                              >
                                {getStatusText(WORK_STATUS.DI_MUON)}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.dropdownItem,
                                selectedStatus === WORK_STATUS.VE_SOM &&
                                  styles.dropdownItemSelected,
                                darkMode && styles.darkDropdownItem,
                                selectedStatus === WORK_STATUS.VE_SOM &&
                                  darkMode &&
                                  styles.darkDropdownItemSelected,
                              ]}
                              onPress={() =>
                                handleSelectStatus(WORK_STATUS.VE_SOM)
                              }
                            >
                              <View style={styles.statusIconContainer}>
                                {renderStatusIcon(WORK_STATUS.VE_SOM)}
                              </View>
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  darkMode && styles.darkText,
                                  selectedStatus === WORK_STATUS.VE_SOM &&
                                    styles.dropdownItemTextSelected,
                                ]}
                              >
                                {getStatusText(WORK_STATUS.VE_SOM)}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.dropdownItem,
                                selectedStatus === WORK_STATUS.DI_MUON_VE_SOM &&
                                  styles.dropdownItemSelected,
                                darkMode && styles.darkDropdownItem,
                                selectedStatus === WORK_STATUS.DI_MUON_VE_SOM &&
                                  darkMode &&
                                  styles.darkDropdownItemSelected,
                              ]}
                              onPress={() =>
                                handleSelectStatus(WORK_STATUS.DI_MUON_VE_SOM)
                              }
                            >
                              <View style={styles.statusIconContainer}>
                                {renderStatusIcon(WORK_STATUS.DI_MUON_VE_SOM)}
                              </View>
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  darkMode && styles.darkText,
                                  selectedStatus ===
                                    WORK_STATUS.DI_MUON_VE_SOM &&
                                    styles.dropdownItemTextSelected,
                                ]}
                              >
                                {getStatusText(WORK_STATUS.DI_MUON_VE_SOM)}
                              </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[
                                styles.dropdownItem,
                                selectedStatus === WORK_STATUS.VANG_MAT &&
                                  styles.dropdownItemSelected,
                                darkMode && styles.darkDropdownItem,
                                selectedStatus === WORK_STATUS.VANG_MAT &&
                                  darkMode &&
                                  styles.darkDropdownItemSelected,
                              ]}
                              onPress={() =>
                                handleSelectStatus(WORK_STATUS.VANG_MAT)
                              }
                            >
                              <View style={styles.statusIconContainer}>
                                {renderStatusIcon(WORK_STATUS.VANG_MAT)}
                              </View>
                              <Text
                                style={[
                                  styles.dropdownItemText,
                                  darkMode && styles.darkText,
                                  selectedStatus === WORK_STATUS.VANG_MAT &&
                                    styles.dropdownItemTextSelected,
                                ]}
                              >
                                {getStatusText(WORK_STATUS.VANG_MAT)}
                              </Text>
                            </TouchableOpacity>
                          </>
                        )}

                        {/* Luôn hiển thị các tùy chọn này cho tất cả các ngày */}
                        <TouchableOpacity
                          style={[
                            styles.dropdownItem,
                            selectedStatus === WORK_STATUS.NGHI_PHEP &&
                              styles.dropdownItemSelected,
                            darkMode && styles.darkDropdownItem,
                            selectedStatus === WORK_STATUS.NGHI_PHEP &&
                              darkMode &&
                              styles.darkDropdownItemSelected,
                          ]}
                          onPress={() =>
                            handleSelectStatus(WORK_STATUS.NGHI_PHEP)
                          }
                        >
                          <View style={styles.statusIconContainer}>
                            {renderStatusIcon(WORK_STATUS.NGHI_PHEP)}
                          </View>
                          <Text
                            style={[
                              styles.dropdownItemText,
                              darkMode && styles.darkText,
                              selectedStatus === WORK_STATUS.NGHI_PHEP &&
                                styles.dropdownItemTextSelected,
                            ]}
                          >
                            {getStatusText(WORK_STATUS.NGHI_PHEP)}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.dropdownItem,
                            selectedStatus === WORK_STATUS.NGHI_BENH &&
                              styles.dropdownItemSelected,
                            darkMode && styles.darkDropdownItem,
                            selectedStatus === WORK_STATUS.NGHI_BENH &&
                              darkMode &&
                              styles.darkDropdownItemSelected,
                          ]}
                          onPress={() =>
                            handleSelectStatus(WORK_STATUS.NGHI_BENH)
                          }
                        >
                          <View style={styles.statusIconContainer}>
                            {renderStatusIcon(WORK_STATUS.NGHI_BENH)}
                          </View>
                          <Text
                            style={[
                              styles.dropdownItemText,
                              darkMode && styles.darkText,
                              selectedStatus === WORK_STATUS.NGHI_BENH &&
                                styles.dropdownItemTextSelected,
                            ]}
                          >
                            {getStatusText(WORK_STATUS.NGHI_BENH)}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.dropdownItem,
                            selectedStatus === WORK_STATUS.NGHI_LE &&
                              styles.dropdownItemSelected,
                            darkMode && styles.darkDropdownItem,
                            selectedStatus === WORK_STATUS.NGHI_LE &&
                              darkMode &&
                              styles.darkDropdownItemSelected,
                          ]}
                          onPress={() =>
                            handleSelectStatus(WORK_STATUS.NGHI_LE)
                          }
                        >
                          <View style={styles.statusIconContainer}>
                            {renderStatusIcon(WORK_STATUS.NGHI_LE)}
                          </View>
                          <Text
                            style={[
                              styles.dropdownItemText,
                              darkMode && styles.darkText,
                              selectedStatus === WORK_STATUS.NGHI_LE &&
                                styles.dropdownItemTextSelected,
                            ]}
                          >
                            {getStatusText(WORK_STATUS.NGHI_LE)}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.dropdownItem,
                            selectedStatus === WORK_STATUS.NGHI_THUONG &&
                              styles.dropdownItemSelected,
                            darkMode && styles.darkDropdownItem,
                            selectedStatus === WORK_STATUS.NGHI_THUONG &&
                              darkMode &&
                              styles.darkDropdownItemSelected,
                          ]}
                          onPress={() =>
                            handleSelectStatus(WORK_STATUS.NGHI_THUONG)
                          }
                        >
                          <View style={styles.statusIconContainer}>
                            {renderStatusIcon(WORK_STATUS.NGHI_THUONG)}
                          </View>
                          <Text
                            style={[
                              styles.dropdownItemText,
                              darkMode && styles.darkText,
                              selectedStatus === WORK_STATUS.NGHI_THUONG &&
                                styles.dropdownItemTextSelected,
                            ]}
                          >
                            {getStatusText(WORK_STATUS.NGHI_THUONG)}
                          </Text>
                        </TouchableOpacity>

                        {/* Chỉ hiển thị tùy chọn "Chưa cập nhật" cho ngày hiện tại và quá khứ */}
                        {(!selectedDay.isFuture || selectedDay.isToday) && (
                          <TouchableOpacity
                            style={[
                              styles.dropdownItem,
                              selectedStatus === WORK_STATUS.CHUA_CAP_NHAT &&
                                styles.dropdownItemSelected,
                              darkMode && styles.darkDropdownItem,
                              selectedStatus === WORK_STATUS.CHUA_CAP_NHAT &&
                                darkMode &&
                                styles.darkDropdownItemSelected,
                            ]}
                            onPress={() =>
                              handleSelectStatus(WORK_STATUS.CHUA_CAP_NHAT)
                            }
                          >
                            <View style={styles.statusIconContainer}>
                              {renderStatusIcon(WORK_STATUS.CHUA_CAP_NHAT)}
                            </View>
                            <Text
                              style={[
                                styles.dropdownItemText,
                                darkMode && styles.darkText,
                                selectedStatus === WORK_STATUS.CHUA_CAP_NHAT &&
                                  styles.dropdownItemTextSelected,
                              ]}
                            >
                              {getStatusText(WORK_STATUS.CHUA_CAP_NHAT)}
                            </Text>
                          </TouchableOpacity>
                        )}

                        {/* Chỉ hiển thị tùy chọn "Ngày tương lai" cho ngày tương lai */}
                        {selectedDay.isFuture && (
                          <TouchableOpacity
                            style={[
                              styles.dropdownItem,
                              selectedStatus === WORK_STATUS.NGAY_TUONG_LAI &&
                                styles.dropdownItemSelected,
                              darkMode && styles.darkDropdownItem,
                              selectedStatus === WORK_STATUS.NGAY_TUONG_LAI &&
                                darkMode &&
                                styles.darkDropdownItemSelected,
                            ]}
                            onPress={() =>
                              handleSelectStatus(WORK_STATUS.NGAY_TUONG_LAI)
                            }
                          >
                            <View style={styles.statusIconContainer}>
                              {renderStatusIcon(WORK_STATUS.NGAY_TUONG_LAI)}
                            </View>
                            <Text
                              style={[
                                styles.dropdownItemText,
                                darkMode && styles.darkText,
                                selectedStatus === WORK_STATUS.NGAY_TUONG_LAI &&
                                  styles.dropdownItemTextSelected,
                              ]}
                            >
                              {getStatusText(WORK_STATUS.NGAY_TUONG_LAI)}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {/* Phần nhập thời gian check-in và check-out thủ công */}
                {(!selectedDay.isFuture || selectedDay.isToday) && (
                  <View
                    style={[
                      styles.timeInputContainer,
                      darkMode && styles.darkTimeInputContainer,
                    ]}
                  >
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

                {/* Nút Lưu (biểu tượng) */}
                <TouchableOpacity
                  style={styles.saveIconButton}
                  onPress={handleSaveChanges}
                  accessibilityLabel={t('Lưu thay đổi')}
                >
                  <Ionicons name="save-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Hộp thoại xác nhận */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showConfirmDialog}
        onRequestClose={() => setShowConfirmDialog(false)}
      >
        <View style={styles.modalContainer}>
          <View
            style={[styles.confirmDialog, darkMode && styles.darkModalContent]}
          >
            <Text style={[styles.confirmTitle, darkMode && styles.darkText]}>
              {t('Xác nhận')}
            </Text>
            <Text style={[styles.confirmMessage, darkMode && styles.darkText]}>
              {t('Bạn có chắc chắn muốn lưu thay đổi này không?')}
            </Text>
            <View style={styles.confirmButtonsContainer}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={() => setShowConfirmDialog(false)}
              >
                <Text
                  style={[
                    styles.confirmButtonText,
                    darkMode && styles.darkCancelButtonText,
                  ]}
                >
                  {t('Hủy')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmSaveButton]}
                onPress={handleConfirmSave}
              >
                <Text style={styles.confirmSaveButtonText}>
                  {t('Xác nhận')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker cho Android */}
      {Platform.OS === 'android' && timePickerVisible && (
        <DateTimePicker
          value={(() => {
            // Tạo thời gian mặc định dựa trên giá trị hiện tại hoặc thời gian hiện tại
            const defaultTime = new Date()

            try {
              // Nếu đang chỉnh sửa check-in và đã có giá trị
              if (currentEditingTime === 'checkIn' && manualCheckInTime) {
                const [hours, minutes] = manualCheckInTime
                  .split(':')
                  .map(Number)
                defaultTime.setHours(hours, minutes, 0, 0)
                console.log(
                  `[DEBUG] Android picker - Đặt thời gian mặc định cho check-in: ${hours}:${minutes}`
                )
              }
              // Nếu đang chỉnh sửa check-out và đã có giá trị
              else if (
                currentEditingTime === 'checkOut' &&
                manualCheckOutTime
              ) {
                const [hours, minutes] = manualCheckOutTime
                  .split(':')
                  .map(Number)
                defaultTime.setHours(hours, minutes, 0, 0)
                console.log(
                  `[DEBUG] Android picker - Đặt thời gian mặc định cho check-out: ${hours}:${minutes}`
                )
              } else {
                console.log(
                  `[DEBUG] Android picker - Sử dụng thời gian hiện tại: ${defaultTime.getHours()}:${defaultTime.getMinutes()}`
                )
              }
            } catch (error) {
              console.error(
                'Lỗi khi đặt thời gian mặc định cho Android picker:',
                error
              )
            }

            return defaultTime
          })()}
          mode="time"
          is24Hour={true}
          display="clock"
          onChange={handleTimeChange}
          themeVariant={darkMode ? 'dark' : 'light'}
        />
      )}

      {/* Time Picker cho iOS */}
      {Platform.OS === 'ios' && timePickerVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={timePickerVisible}
          onRequestClose={() => setTimePickerVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.modalContent,
                darkMode && styles.darkModalContent,
                { padding: 0 },
              ]}
            >
              <View
                style={{
                  backgroundColor: darkMode ? '#1e1e1e' : '#fff',
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <View style={styles.pickerHeader}>
                  <TouchableOpacity
                    onPress={() => setTimePickerVisible(false)}
                    style={styles.pickerButton}
                  >
                    <Text
                      style={[
                        styles.pickerButtonText,
                        darkMode && styles.darkText,
                      ]}
                    >
                      {t('Hủy')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      // Lấy thời gian hiện tại từ time picker
                      const selectedTime = new Date()

                      // Lấy giá trị từ time picker (sử dụng giá trị hiện tại nếu không có)
                      try {
                        const pickerElement =
                          document.querySelector('input[type="time"]')
                        if (pickerElement) {
                          const timeValue = pickerElement.value
                          if (timeValue) {
                            const [hours, minutes] = timeValue
                              .split(':')
                              .map(Number)
                            selectedTime.setHours(hours, minutes, 0, 0)
                            console.log(
                              `[DEBUG] iOS - Lấy giá trị từ picker: ${hours}:${minutes}`
                            )
                          }
                        }
                      } catch (error) {
                        console.error('Lỗi khi lấy giá trị từ picker:', error)
                      }

                      // Gọi hàm xử lý thời gian với sự kiện giả lập
                      handleTimeChange({ type: 'set' }, selectedTime)
                    }}
                    style={styles.pickerButton}
                  >
                    <Text
                      style={[
                        styles.pickerButtonText,
                        styles.doneButton,
                        darkMode && styles.darkText,
                      ]}
                    >
                      {t('Xong')}
                    </Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={(() => {
                    // Tạo thời gian mặc định dựa trên giá trị hiện tại hoặc thời gian hiện tại
                    const defaultTime = new Date()

                    try {
                      // Nếu đang chỉnh sửa check-in và đã có giá trị
                      if (
                        currentEditingTime === 'checkIn' &&
                        manualCheckInTime
                      ) {
                        const [hours, minutes] = manualCheckInTime
                          .split(':')
                          .map(Number)
                        defaultTime.setHours(hours, minutes, 0, 0)
                        console.log(
                          `[DEBUG] iOS picker - Đặt thời gian mặc định cho check-in: ${hours}:${minutes}`
                        )
                      }
                      // Nếu đang chỉnh sửa check-out và đã có giá trị
                      else if (
                        currentEditingTime === 'checkOut' &&
                        manualCheckOutTime
                      ) {
                        const [hours, minutes] = manualCheckOutTime
                          .split(':')
                          .map(Number)
                        defaultTime.setHours(hours, minutes, 0, 0)
                        console.log(
                          `[DEBUG] iOS picker - Đặt thời gian mặc định cho check-out: ${hours}:${minutes}`
                        )
                      } else {
                        console.log(
                          `[DEBUG] iOS picker - Sử dụng thời gian hiện tại: ${defaultTime.getHours()}:${defaultTime.getMinutes()}`
                        )
                      }
                    } catch (error) {
                      console.error(
                        'Lỗi khi đặt thời gian mặc định cho iOS picker:',
                        error
                      )
                    }

                    return defaultTime
                  })()}
                  mode="time"
                  is24Hour={true}
                  display="spinner"
                  onChange={handleTimeChange}
                  style={{ height: 200, width: '100%' }}
                  themeVariant={darkMode ? 'dark' : 'light'}
                  testID={`timePicker-${currentEditingTime}`}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Time Picker cho Web và các nền tảng khác */}
      {Platform.OS !== 'android' &&
        Platform.OS !== 'ios' &&
        timePickerVisible && (
          <Modal
            animationType="fade"
            transparent={true}
            visible={timePickerVisible}
            onRequestClose={() => setTimePickerVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View
                style={[
                  styles.modalContent,
                  darkMode && styles.darkModalContent,
                  { padding: 20 },
                ]}
              >
                <View style={styles.modalHeader}>
                  <Text
                    style={[styles.modalTitle, darkMode && styles.darkText]}
                  >
                    {t('Chọn thời gian')}
                  </Text>
                  <TouchableOpacity onPress={() => setTimePickerVisible(false)}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={darkMode ? '#fff' : '#000'}
                    />
                  </TouchableOpacity>
                </View>

                <View style={{ marginVertical: 20, alignItems: 'center' }}>
                  <DateTimePicker
                    value={(() => {
                      // Tạo thời gian mặc định dựa trên giá trị hiện tại hoặc thời gian hiện tại
                      const defaultTime = new Date()

                      try {
                        // Nếu đang chỉnh sửa check-in và đã có giá trị
                        if (
                          currentEditingTime === 'checkIn' &&
                          manualCheckInTime
                        ) {
                          const [hours, minutes] = manualCheckInTime
                            .split(':')
                            .map(Number)
                          defaultTime.setHours(hours, minutes, 0, 0)
                          console.log(
                            `[DEBUG] Web picker - Đặt thời gian mặc định cho check-in: ${hours}:${minutes}`
                          )
                        }
                        // Nếu đang chỉnh sửa check-out và đã có giá trị
                        else if (
                          currentEditingTime === 'checkOut' &&
                          manualCheckOutTime
                        ) {
                          const [hours, minutes] = manualCheckOutTime
                            .split(':')
                            .map(Number)
                          defaultTime.setHours(hours, minutes, 0, 0)
                          console.log(
                            `[DEBUG] Web picker - Đặt thời gian mặc định cho check-out: ${hours}:${minutes}`
                          )
                        } else {
                          console.log(
                            `[DEBUG] Web picker - Sử dụng thời gian hiện tại: ${defaultTime.getHours()}:${defaultTime.getMinutes()}`
                          )
                        }
                      } catch (error) {
                        console.error(
                          'Lỗi khi đặt thời gian mặc định cho Web picker:',
                          error
                        )
                      }

                      return defaultTime
                    })()}
                    mode="time"
                    is24Hour={true}
                    display="spinner"
                    onChange={handleTimeChange}
                    style={{ width: '100%' }}
                    testID={`webTimePicker-${currentEditingTime}`}
                  />
                </View>

                <View
                  style={{ flexDirection: 'row', justifyContent: 'flex-end' }}
                >
                  <TouchableOpacity
                    style={[styles.confirmButton, styles.confirmSaveButton]}
                    onPress={() => {
                      // Lấy thời gian hiện tại từ time picker
                      const selectedTime = new Date()

                      // Sử dụng giá trị hiện tại nếu có
                      if (
                        currentEditingTime === 'checkIn' &&
                        manualCheckInTime
                      ) {
                        const [hours, minutes] = manualCheckInTime
                          .split(':')
                          .map(Number)
                        selectedTime.setHours(hours, minutes, 0, 0)
                      } else if (
                        currentEditingTime === 'checkOut' &&
                        manualCheckOutTime
                      ) {
                        const [hours, minutes] = manualCheckOutTime
                          .split(':')
                          .map(Number)
                        selectedTime.setHours(hours, minutes, 0, 0)
                      }

                      // Gọi hàm xử lý thời gian với sự kiện giả lập
                      handleTimeChange({ type: 'set' }, selectedTime)
                    }}
                  >
                    <Text style={styles.confirmSaveButtonText}>
                      {t('Xác nhận')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
  statusIconContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  timeInputContainer: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  darkTimeInputContainer: {
    backgroundColor: '#2a2a2a',
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
  // Styles cho dropdown
  dropdownSection: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 4,
  },
  darkDropdownButton: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownMenu: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  darkDropdownMenu: {
    backgroundColor: '#2a2a2a',
    borderColor: '#444',
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkDropdownItem: {
    borderBottomColor: '#444',
  },
  dropdownItemSelected: {
    backgroundColor: '#f0f0ff',
  },
  darkDropdownItemSelected: {
    backgroundColor: '#3a3a5a',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownItemTextSelected: {
    color: '#8a56ff',
    fontWeight: 'bold',
  },
  dropdownIconContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 10,
  },
  // Styles cho nút Lưu (biểu tượng)
  saveIconButton: {
    backgroundColor: '#8a56ff',
    borderRadius: 50,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    alignSelf: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  // Styles cho hộp thoại xác nhận
  confirmDialog: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  confirmMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  confirmButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '48%',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmSaveButton: {
    backgroundColor: '#8a56ff',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  darkCancelButtonText: {
    color: '#fff',
  },
  confirmSaveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  // Styles cho iOS picker
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  pickerButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#8a56ff',
  },
  doneButton: {
    fontWeight: 'bold',
  },
})

// Bọc component trong React.memo để tránh render lại không cần thiết
export default React.memo(WeeklyStatusGrid)

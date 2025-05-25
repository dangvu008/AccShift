/**
 * Enhanced Alarm & Notification Management System
 * Hệ thống quản lý báo thức và thông báo nâng cao với:
 * - Smart scheduling based on shift patterns
 * - Adaptive reminder timing
 * - Conflict detection và resolution
 * - Offline notification support
 * - Advanced notification types
 */

import * as Notifications from 'expo-notifications'
// Mock Battery API since expo-battery is not available in Snack
const Battery = {
  isBatteryOptimizationEnabledAsync: async () => false,
}
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NOTIFICATION_CONFIG, API_CONFIG } from '../config/appConfig'
import { logNotification } from './notifications'
import { storage } from './storage'

// Kiểm tra môi trường web
const isWeb = Platform.OS === 'web'
const isSnack =
  isWeb &&
  typeof window !== 'undefined' &&
  window.location &&
  window.location.hostname.includes('snack.expo')

/**
 * Lớp quản lý báo thức với độ tin cậy cao
 * Cung cấp các phương thức để lên lịch, hủy và quản lý báo thức
 */
class AlarmManager {
  constructor() {
    this.hasPermission = false
    this.hasCriticalPermission = false
    this.hasBatteryOptimizationDisabled = false
    this.initialized = false
  }

  /**
   * Khởi tạo AlarmManager và kiểm tra các quyền cần thiết
   */
  async initialize() {
    if (this.initialized) return

    try {
      // Kiểm tra nếu đang chạy trên Snack
      if (isSnack) {
        console.log('Đang chạy trên Snack, sử dụng chế độ giả lập thông báo')
        this.hasPermission = true
        this.hasCriticalPermission = true
        this.hasBatteryOptimizationDisabled = true
        this.initialized = true
        return {
          hasPermission: true,
          hasCriticalPermission: true,
          hasBatteryOptimizationDisabled: true,
        }
      }

      // Kiểm tra quyền thông báo
      try {
        const { status } = await Notifications.getPermissionsAsync()
        this.hasPermission = status === 'granted'
      } catch (error) {
        console.warn('Lỗi khi kiểm tra quyền thông báo:', error)
        this.hasPermission = false
      }

      // Kiểm tra quyền thông báo quan trọng (iOS)
      if (Platform.OS === 'ios') {
        try {
          const settings = await Notifications.getPermissionsAsync()
          this.hasCriticalPermission =
            settings.ios?.allowsCriticalAlerts || false
        } catch (error) {
          console.warn('Lỗi khi kiểm tra quyền thông báo quan trọng:', error)
          this.hasCriticalPermission = false
        }
      }

      // Kiểm tra tối ưu hóa pin (Android)
      if (Platform.OS === 'android') {
        try {
          // Trên thiết bị thực, sử dụng thư viện như react-native-battery-optimization-check
          // Đây chỉ là mã giả để mô phỏng chức năng
          const batteryOptimizationStatus =
            await Battery.isBatteryOptimizationEnabledAsync()
          this.hasBatteryOptimizationDisabled = !batteryOptimizationStatus
        } catch (error) {
          console.warn('Không thể kiểm tra trạng thái tối ưu hóa pin:', error)
          this.hasBatteryOptimizationDisabled = false
        }
      }

      // Cấu hình kênh thông báo cho Android
      if (Platform.OS === 'android') {
        await this._setupNotificationChannels()
      }

      this.initialized = true
      return {
        hasPermission: this.hasPermission,
        hasCriticalPermission: this.hasCriticalPermission,
        hasBatteryOptimizationDisabled: this.hasBatteryOptimizationDisabled,
      }
    } catch (error) {
      console.error('Lỗi khi khởi tạo AlarmManager:', error)
      this.initialized = true // Đánh dấu là đã khởi tạo để tránh lặp lại
      return {
        hasPermission: false,
        hasCriticalPermission: false,
        hasBatteryOptimizationDisabled: false,
      }
    }
  }

  /**
   * Thiết lập các kênh thông báo cho Android
   * @private
   */
  async _setupNotificationChannels() {
    // Kênh báo thức chính
    await Notifications.setNotificationChannelAsync(
      NOTIFICATION_CONFIG.CHANNEL_ID,
      {
        name: NOTIFICATION_CONFIG.CHANNEL_NAME,
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: NOTIFICATION_CONFIG.VIBRATION_PATTERN,
        lightColor: NOTIFICATION_CONFIG.LIGHT_COLOR,
        sound: 'default',
        enableVibrate: true,
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true, // Bỏ qua chế độ Không làm phiền
      }
    )

    // Kênh nhắc nhở ca làm việc
    await Notifications.setNotificationChannelAsync('shift_reminders', {
      name: 'Nhắc nhở ca làm việc',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: NOTIFICATION_CONFIG.VIBRATION_PATTERN,
      lightColor: NOTIFICATION_CONFIG.LIGHT_COLOR,
      sound: 'default',
    })

    // Kênh nhắc nhở ghi chú
    await Notifications.setNotificationChannelAsync('note_reminders', {
      name: 'Nhắc nhở ghi chú',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: NOTIFICATION_CONFIG.VIBRATION_PATTERN,
      lightColor: NOTIFICATION_CONFIG.LIGHT_COLOR,
      sound: 'default',
    })
  }

  /**
   * Yêu cầu quyền thông báo
   * @returns {Promise<boolean>} Kết quả yêu cầu quyền
   */
  async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowAnnouncements: true,
          // Yêu cầu quyền thông báo quan trọng nếu có thể
          allowCriticalAlerts: true,
          provideAppNotificationSettings: true,
        },
      })

      this.hasPermission = status === 'granted'

      // Kiểm tra quyền thông báo quan trọng (iOS)
      if (Platform.OS === 'ios' && status === 'granted') {
        const settings = await Notifications.getPermissionsAsync()
        this.hasCriticalPermission = settings.ios?.allowsCriticalAlerts || false
      }

      return this.hasPermission
    } catch (error) {
      console.error('Lỗi khi yêu cầu quyền thông báo:', error)
      return false
    }
  }

  /**
   * Yêu cầu tắt tối ưu hóa pin (Android)
   * Trong ứng dụng thực tế, cần mở màn hình cài đặt để người dùng tắt thủ công
   * @returns {Promise<boolean>} Kết quả yêu cầu
   */
  async requestDisableBatteryOptimization() {
    if (Platform.OS !== 'android') return true

    try {
      // Trong ứng dụng thực tế, sử dụng thư viện như react-native-battery-optimization-check
      // để mở màn hình cài đặt tối ưu hóa pin
      console.log('Yêu cầu tắt tối ưu hóa pin')

      // Mã giả - trong ứng dụng thực tế, cần mở màn hình cài đặt
      this.hasBatteryOptimizationDisabled = true
      return true
    } catch (error) {
      console.error('Lỗi khi yêu cầu tắt tối ưu hóa pin:', error)
      return false
    }
  }

  /**
   * Lên lịch báo thức với độ tin cậy cao
   * @param {Object} options Tùy chọn báo thức
   * @param {string} options.title Tiêu đề báo thức
   * @param {string} options.body Nội dung báo thức
   * @param {Date} options.scheduledTime Thời gian lên lịch
   * @param {string} options.type Loại báo thức ('shift', 'note', 'check_in', 'check_out')
   * @param {string} options.id ID duy nhất cho báo thức
   * @param {Object} options.data Dữ liệu bổ sung
   * @param {boolean} options.repeats Có lặp lại không
   * @param {number} options.weekday Ngày trong tuần (1-7, nếu lặp lại)
   * @returns {Promise<string>} ID của thông báo đã lên lịch
   */
  async scheduleAlarm({
    title,
    body,
    scheduledTime,
    type,
    id,
    data = {},
    repeats = false,
    weekday = null,
  }) {
    try {
      if (!this.initialized) {
        await this.initialize()
      }

      // Kiểm tra nếu đang chạy trên Snack
      if (isSnack) {
        console.log('Đang chạy trên Snack, giả lập lên lịch báo thức:', {
          title,
          type,
          scheduledTime: scheduledTime?.toISOString(),
        })
        // Trả về ID giả lập
        const mockId = `mock_${id}_${Date.now()}`
        await this._saveScheduledAlarm({
          id: mockId,
          title,
          body,
          scheduledTime: scheduledTime?.toISOString(),
          type,
          data,
          repeats,
          weekday,
        })
        return mockId
      }

      if (!this.hasPermission) {
        try {
          const granted = await this.requestPermissions()
          if (!granted) {
            console.warn(
              'Không có quyền thông báo, không thể lên lịch báo thức'
            )
            return null
          }
        } catch (error) {
          console.error('Lỗi khi yêu cầu quyền thông báo:', error)
          return null
        }
      }

      // Xác định kênh thông báo dựa trên loại
      let channelId = NOTIFICATION_CONFIG.CHANNEL_ID
      if (type === 'shift') {
        channelId = 'shift_reminders'
      } else if (type === 'note') {
        channelId = 'note_reminders'
      }

      // Tạo nội dung thông báo
      const notificationContent = {
        title: this._formatAlarmTitle(title, type),
        body,
        data: {
          isAlarm: true,
          type,
          id,
          title,
          message: body,
          time: scheduledTime?.toISOString(),
          ...data,
        },
        sound: true,
        vibrate: true,
        priority: 'high',
        channelId,
      }

      // Tạo trigger
      let trigger = { date: scheduledTime }

      // Nếu lặp lại theo ngày trong tuần
      if (repeats && weekday) {
        trigger = {
          weekday,
          hour: scheduledTime.getHours(),
          minute: scheduledTime.getMinutes(),
          repeats: true,
        }
      }

      // Cấu hình đặc biệt cho Android
      if (Platform.OS === 'android') {
        // Sử dụng full-screen intent cho báo thức quan trọng
        if (type === 'check_in' || type === 'check_out') {
          notificationContent.android = {
            ...notificationContent.android,
            channelId: NOTIFICATION_CONFIG.CHANNEL_ID,
            priority: 'max',
            fullScreenIntent: true,
          }
        }
      }

      // Lên lịch thông báo
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger,
        identifier: id,
      })

      // Lưu thông tin báo thức để theo dõi
      await this._saveScheduledAlarm({
        id: notificationId,
        title,
        body,
        scheduledTime: scheduledTime?.toISOString(),
        type,
        data,
        repeats,
        weekday,
      })

      return notificationId
    } catch (error) {
      console.error('Lỗi khi lên lịch báo thức:', error)
      return null
    }
  }

  /**
   * Định dạng tiêu đề báo thức dựa trên loại
   * @param {string} title Tiêu đề gốc
   * @param {string} type Loại báo thức
   * @returns {string} Tiêu đề đã định dạng
   * @private
   */
  _formatAlarmTitle(title, type) {
    switch (type) {
      case 'check_in':
        return '⏰ CHECK-IN! ' + title
      case 'check_out':
        return '⏰ CHECK-OUT! ' + title
      case 'shift':
        return '⏰ ĐẾN GIỜ ĐI LÀM! ' + title
      case 'note':
        return '📝 NHẮC VIỆC! ' + title
      default:
        return '⏰ ' + title
    }
  }

  /**
   * Lưu thông tin báo thức đã lên lịch
   * @param {Object} alarm Thông tin báo thức
   * @private
   */
  async _saveScheduledAlarm(alarm) {
    try {
      const scheduledAlarmsJson = await AsyncStorage.getItem('scheduled_alarms')
      const scheduledAlarms = scheduledAlarmsJson
        ? JSON.parse(scheduledAlarmsJson)
        : []

      // Thêm báo thức mới
      scheduledAlarms.push(alarm)

      // Lưu danh sách báo thức
      await AsyncStorage.setItem(
        'scheduled_alarms',
        JSON.stringify(scheduledAlarms)
      )
    } catch (error) {
      console.error('Lỗi khi lưu thông tin báo thức:', error)
    }
  }

  /**
   * Xóa thông tin báo thức đã lên lịch
   * @param {string} alarmId ID báo thức
   * @private
   */
  async _removeScheduledAlarm(alarmId) {
    try {
      const scheduledAlarmsJson = await AsyncStorage.getItem('scheduled_alarms')
      if (!scheduledAlarmsJson) return

      let scheduledAlarms = JSON.parse(scheduledAlarmsJson)

      // Lọc bỏ báo thức cần xóa
      scheduledAlarms = scheduledAlarms.filter((alarm) => alarm.id !== alarmId)

      // Lưu danh sách báo thức
      await AsyncStorage.setItem(
        'scheduled_alarms',
        JSON.stringify(scheduledAlarms)
      )
    } catch (error) {
      console.error('Lỗi khi xóa thông tin báo thức:', error)
    }
  }

  /**
   * Hủy báo thức đã lên lịch
   * @param {string} alarmId ID báo thức
   * @returns {Promise<boolean>} Kết quả hủy báo thức
   */
  async cancelAlarm(alarmId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(alarmId)
      await this._removeScheduledAlarm(alarmId)
      return true
    } catch (error) {
      console.error('Lỗi khi hủy báo thức:', error)
      return false
    }
  }

  /**
   * Hủy tất cả báo thức có tiền tố ID nhất định
   * @param {string} idPrefix Tiền tố ID báo thức
   * @returns {Promise<boolean>} Kết quả hủy báo thức
   */
  async cancelAlarmsByPrefix(idPrefix) {
    try {
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync()

      // Lọc các thông báo có ID bắt đầu bằng tiền tố
      const matchingNotifications = scheduledNotifications.filter(
        (notification) => notification.identifier.startsWith(idPrefix)
      )

      // Hủy từng thông báo
      for (const notification of matchingNotifications) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        )
        await this._removeScheduledAlarm(notification.identifier)
      }

      return true
    } catch (error) {
      console.error('Lỗi khi hủy báo thức theo tiền tố:', error)
      return false
    }
  }

  /**
   * Lên lịch báo lại sau một khoảng thời gian
   * @param {Object} originalAlarm Thông tin báo thức gốc
   * @param {number} delayMinutes Số phút trì hoãn
   * @returns {Promise<string>} ID của báo thức mới
   */
  async snoozeAlarm(originalAlarm, delayMinutes = 5) {
    try {
      // Tính thời gian báo lại
      const now = new Date()
      const snoozeTime = new Date(now.getTime() + delayMinutes * 60 * 1000)

      // Tạo ID mới cho báo thức báo lại
      const snoozeId = `${originalAlarm.id}_snooze_${Date.now()}`

      // Lên lịch báo thức mới
      return await this.scheduleAlarm({
        title: originalAlarm.title,
        body: `[BÁO LẠI] ${originalAlarm.body}`,
        scheduledTime: snoozeTime,
        type: originalAlarm.type,
        id: snoozeId,
        data: originalAlarm.data,
      })
    } catch (error) {
      console.error('Lỗi khi báo lại báo thức:', error)
      return null
    }
  }

  /**
   * Lấy danh sách tất cả báo thức đã lên lịch
   * @returns {Promise<Array>} Danh sách báo thức
   */
  async getAllScheduledAlarms() {
    try {
      const scheduledNotifications =
        await Notifications.getAllScheduledNotificationsAsync()
      return scheduledNotifications.map((notification) => ({
        id: notification.identifier,
        title: notification.content.title,
        body: notification.content.body,
        data: notification.content.data,
        trigger: notification.trigger,
      }))
    } catch (error) {
      console.error('Lỗi khi lấy danh sách báo thức:', error)
      return []
    }
  }

  /**
   * Xử lý khi nhận thông báo báo thức
   * @param {Object} notification Thông báo
   */
  async handleAlarmNotification(notification) {
    try {
      const data = notification.request.content.data

      // Ghi log thông báo
      await logNotification(notification)

      // Xử lý theo loại báo thức
      if (data.isAlarm) {
        // Trong ứng dụng thực tế, có thể thực hiện các hành động bổ sung
        // như mở màn hình báo thức, phát âm thanh, v.v.
        console.log('Đã nhận báo thức:', data.type)
      }
    } catch (error) {
      console.error('Lỗi khi xử lý thông báo báo thức:', error)
    }
  }

  /**
   * Lên lịch báo thức check-in
   * @param {Object} shift Thông tin ca làm việc
   * @param {Date} scheduledTime Thời gian lên lịch
   * @returns {Promise<string>} ID của báo thức
   */
  async scheduleCheckInAlarm(shift, scheduledTime) {
    return this.scheduleAlarm({
      title: shift.name,
      body: `Đã đến giờ check-in ca ${shift.name} (${shift.startTime})`,
      scheduledTime,
      type: 'check_in',
      id: `check_in_${shift.id}_${Date.now()}`,
      data: { shiftId: shift.id, action: 'check_in' },
    })
  }

  /**
   * Lên lịch báo thức check-out
   * @param {Object} shift Thông tin ca làm việc
   * @param {Date} scheduledTime Thời gian lên lịch
   * @returns {Promise<string>} ID của báo thức
   */
  async scheduleCheckOutAlarm(shift, scheduledTime) {
    return this.scheduleAlarm({
      title: shift.name,
      body: `Đã đến giờ check-out ca ${shift.name} (${shift.endTime})`,
      scheduledTime,
      type: 'check_out',
      id: `check_out_${shift.id}_${Date.now()}`,
      data: { shiftId: shift.id, action: 'check_out' },
    })
  }

  /**
   * Smart scheduling - Lên lịch báo thức thông minh dựa trên ca làm việc
   * @param {Object} shift Thông tin ca làm việc
   * @param {Object} options Tùy chọn lên lịch
   */
  async scheduleSmartShiftAlarms(shift, options = {}) {
    try {
      console.log('[AlarmManager] Scheduling smart alarms for shift:', shift.name)

      const {
        checkInReminderMinutes = 15,
        checkOutReminderMinutes = 15,
        enableMissedCheckInAlert = true,
        enableOvertimeAlert = true,
        enableBreakReminder = true,
      } = options

      const results = []

      // Get user settings for alarm preferences
      const userSettings = await storage.getUserSettings() || {}
      const alarmEnabled = userSettings.alarmSoundEnabled !== false

      if (!alarmEnabled) {
        console.log('[AlarmManager] Alarms disabled in user settings')
        return { success: true, scheduled: 0, results: [] }
      }

      // Schedule check-in reminder
      if (checkInReminderMinutes > 0) {
        const checkInTime = this.parseShiftTime(shift.startTime)
        const reminderTime = new Date(checkInTime.getTime() - checkInReminderMinutes * 60 * 1000)

        if (reminderTime > new Date()) {
          const alarmId = await this.scheduleCheckInAlarm(shift, reminderTime)
          if (alarmId) {
            results.push({ type: 'check_in_reminder', alarmId, time: reminderTime })
          }
        }
      }

      // Schedule check-out reminder
      if (checkOutReminderMinutes > 0) {
        const checkOutTime = this.parseShiftTime(shift.endTime, shift.startTime)
        const reminderTime = new Date(checkOutTime.getTime() - checkOutReminderMinutes * 60 * 1000)

        if (reminderTime > new Date()) {
          const alarmId = await this.scheduleCheckOutAlarm(shift, reminderTime)
          if (alarmId) {
            results.push({ type: 'check_out_reminder', alarmId, time: reminderTime })
          }
        }
      }

      // Schedule missed check-in alert (30 minutes after shift start)
      if (enableMissedCheckInAlert) {
        const checkInTime = this.parseShiftTime(shift.startTime)
        const missedAlertTime = new Date(checkInTime.getTime() + 30 * 60 * 1000)

        if (missedAlertTime > new Date()) {
          const alarmId = await this.scheduleAlarm({
            title: 'Quên check-in?',
            body: `Bạn đã check-in ca ${shift.name} chưa?`,
            scheduledTime: missedAlertTime,
            type: 'missed_checkin',
            id: `missed_checkin_${shift.id}_${Date.now()}`,
            data: { shiftId: shift.id, action: 'missed_checkin_check' },
          })

          if (alarmId) {
            results.push({ type: 'missed_checkin_alert', alarmId, time: missedAlertTime })
          }
        }
      }

      // Schedule overtime alert (1 hour after shift end)
      if (enableOvertimeAlert) {
        const checkOutTime = this.parseShiftTime(shift.endTime, shift.startTime)
        const overtimeAlertTime = new Date(checkOutTime.getTime() + 60 * 60 * 1000)

        if (overtimeAlertTime > new Date()) {
          const alarmId = await this.scheduleAlarm({
            title: 'Làm thêm giờ',
            body: `Bạn đang làm thêm giờ. Nhớ check-out khi kết thúc!`,
            scheduledTime: overtimeAlertTime,
            type: 'overtime_alert',
            id: `overtime_${shift.id}_${Date.now()}`,
            data: { shiftId: shift.id, action: 'overtime_reminder' },
          })

          if (alarmId) {
            results.push({ type: 'overtime_alert', alarmId, time: overtimeAlertTime })
          }
        }
      }

      console.log(`[AlarmManager] Scheduled ${results.length} smart alarms for shift ${shift.name}`)
      return { success: true, scheduled: results.length, results }

    } catch (error) {
      console.error('[AlarmManager] Failed to schedule smart shift alarms:', error)
      return { success: false, error: error.message, results: [] }
    }
  }

  /**
   * Parse shift time string to Date object
   */
  parseShiftTime(timeString, startTimeString = null) {
    const [hours, minutes] = timeString.split(':').map(Number)
    const now = new Date()
    const shiftTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0)

    // Handle overnight shifts
    if (startTimeString) {
      const [startHours] = startTimeString.split(':').map(Number)
      if (hours < startHours) {
        // This is next day
        shiftTime.setDate(shiftTime.getDate() + 1)
      }
    }

    return shiftTime
  }

  /**
   * Cancel all alarms for a specific shift
   */
  async cancelShiftAlarms(shiftId) {
    try {
      console.log(`[AlarmManager] Canceling all alarms for shift: ${shiftId}`)

      const prefixes = [
        `check_in_${shiftId}`,
        `check_out_${shiftId}`,
        `missed_checkin_${shiftId}`,
        `overtime_${shiftId}`,
      ]

      let canceledCount = 0
      for (const prefix of prefixes) {
        const success = await this.cancelAlarmsByPrefix(prefix)
        if (success) canceledCount++
      }

      console.log(`[AlarmManager] Canceled alarms for ${canceledCount} categories`)
      return { success: true, canceled: canceledCount }

    } catch (error) {
      console.error('[AlarmManager] Failed to cancel shift alarms:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Adaptive reminder timing based on user behavior
   */
  async scheduleAdaptiveReminders(shift) {
    try {
      // Get user's historical check-in patterns
      const userSettings = await storage.getUserSettings() || {}
      const checkInHistory = userSettings.checkInHistory || []

      // Calculate average check-in time relative to shift start
      let avgEarlyMinutes = 15 // Default 15 minutes early

      if (checkInHistory.length > 0) {
        const earlyTimes = checkInHistory
          .filter(entry => entry.shiftId === shift.id)
          .map(entry => {
            const shiftStart = this.parseShiftTime(shift.startTime)
            const checkInTime = new Date(entry.timestamp)
            return (shiftStart.getTime() - checkInTime.getTime()) / (1000 * 60)
          })
          .filter(minutes => minutes > 0 && minutes < 120) // Filter reasonable values

        if (earlyTimes.length > 0) {
          avgEarlyMinutes = Math.round(earlyTimes.reduce((a, b) => a + b, 0) / earlyTimes.length)
          avgEarlyMinutes = Math.max(5, Math.min(60, avgEarlyMinutes)) // Clamp between 5-60 minutes
        }
      }

      console.log(`[AlarmManager] Using adaptive reminder: ${avgEarlyMinutes} minutes before shift`)

      // Schedule with adaptive timing
      return await this.scheduleSmartShiftAlarms(shift, {
        checkInReminderMinutes: avgEarlyMinutes,
        checkOutReminderMinutes: 15,
        enableMissedCheckInAlert: true,
        enableOvertimeAlert: true,
      })

    } catch (error) {
      console.error('[AlarmManager] Failed to schedule adaptive reminders:', error)
      // Fallback to default scheduling
      return await this.scheduleSmartShiftAlarms(shift)
    }
  }

  /**
   * Check for notification conflicts and resolve them
   */
  async detectAndResolveConflicts() {
    try {
      const scheduledAlarms = await this.getAllScheduledAlarms()
      const conflicts = []

      // Group alarms by time (within 5 minutes)
      const timeGroups = new Map()

      for (const alarm of scheduledAlarms) {
        if (!alarm.trigger?.date) continue

        const alarmTime = new Date(alarm.trigger.date)
        const timeKey = Math.floor(alarmTime.getTime() / (5 * 60 * 1000)) // 5-minute buckets

        if (!timeGroups.has(timeKey)) {
          timeGroups.set(timeKey, [])
        }
        timeGroups.get(timeKey).push(alarm)
      }

      // Find conflicts (more than 2 alarms in same time bucket)
      for (const [timeKey, alarms] of timeGroups) {
        if (alarms.length > 2) {
          conflicts.push({
            timeKey,
            time: new Date(timeKey * 5 * 60 * 1000),
            alarms,
            count: alarms.length
          })
        }
      }

      // Resolve conflicts by spacing them out
      for (const conflict of conflicts) {
        console.log(`[AlarmManager] Resolving conflict at ${conflict.time}: ${conflict.count} alarms`)

        // Keep the first alarm, reschedule others with 2-minute intervals
        for (let i = 1; i < conflict.alarms.length; i++) {
          const alarm = conflict.alarms[i]
          const newTime = new Date(conflict.time.getTime() + i * 2 * 60 * 1000)

          // Cancel old alarm
          await this.cancelAlarm(alarm.id)

          // Reschedule with new time
          await this.scheduleAlarm({
            title: alarm.title,
            body: alarm.body,
            scheduledTime: newTime,
            type: alarm.data?.type || 'general',
            id: `${alarm.id}_resolved`,
            data: alarm.data || {},
          })
        }
      }

      return { success: true, conflicts: conflicts.length, resolved: conflicts.length }

    } catch (error) {
      console.error('[AlarmManager] Failed to detect/resolve conflicts:', error)
      return { success: false, error: error.message }
    }
  }
}

// Tạo và xuất instance duy nhất
const alarmManager = new AlarmManager()
export default alarmManager

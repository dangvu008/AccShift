import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  ALARM_TYPES,
  REMINDER_TIMINGS,
  REMINDER_PRIORITIES,
  REMINDER_PATTERNS,
  STORAGE_KEYS,
  NOTIFICATION_CONFIG
} from './constants';
import { storage } from './storage';
import { formatTime, formatDate } from './helpers';

/**
 * ReminderManager - Hệ thống quản lý nhắc nhở toàn diện
 * Quản lý tất cả các loại nhắc nhở: đi làm, chấm công, ca làm việc, overtime, ghi chú, thời tiết
 */
class ReminderManager {
  constructor() {
    this.initialized = false;
    this.activeReminders = new Map();
    this.userSettings = null;
    this.currentShift = null;
  }

  /**
   * Khởi tạo ReminderManager
   */
  async initialize() {
    try {
      console.log('[ReminderManager] Initializing...');

      // Load user settings
      this.userSettings = await storage.getUserSettings() || {};

      // Load current shift
      this.currentShift = await storage.getActiveShift();

      // Setup notification channels
      await this.setupNotificationChannels();

      // Load existing reminders
      await this.loadActiveReminders();

      this.initialized = true;
      console.log('[ReminderManager] Initialized successfully');
    } catch (error) {
      console.error('[ReminderManager] Initialization failed:', error);
    }
  }

  /**
   * Thiết lập các kênh thông báo
   */
  async setupNotificationChannels() {
    if (Platform.OS !== 'android') return;

    try {
      // Kênh nhắc nhở đi làm (Priority: HIGH)
      await Notifications.setNotificationChannelAsync('work_reminders', {
        name: 'Nhắc nhở đi làm',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: NOTIFICATION_CONFIG.VIBRATION_PATTERN,
        lightColor: NOTIFICATION_CONFIG.LIGHT_COLOR,
        sound: 'default',
        description: 'Nhắc nhở về thời gian đi làm và chấm công',
      });

      // Kênh nhắc nhở khẩn cấp (Priority: MAX)
      await Notifications.setNotificationChannelAsync('urgent_reminders', {
        name: 'Nhắc nhở khẩn cấp',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 200, 500],
        lightColor: '#FF0000',
        sound: 'default',
        description: 'Nhắc nhở khẩn cấp về chấm công và ca làm việc',
      });

      // Kênh nhắc nhở overtime (Priority: HIGH)
      await Notifications.setNotificationChannelAsync('overtime_reminders', {
        name: 'Nhắc nhở làm thêm giờ',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: NOTIFICATION_CONFIG.VIBRATION_PATTERN,
        lightColor: '#FFA500',
        sound: 'default',
        description: 'Nhắc nhở về thời gian làm thêm giờ',
      });

      // Kênh nhắc nhở ghi chú (Priority: DEFAULT)
      await Notifications.setNotificationChannelAsync('note_reminders', {
        name: 'Nhắc nhở ghi chú',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: NOTIFICATION_CONFIG.LIGHT_COLOR,
        sound: 'default',
        description: 'Nhắc nhở về ghi chú và công việc',
      });

      // Kênh nhắc nhở thời tiết (Priority: DEFAULT)
      await Notifications.setNotificationChannelAsync('weather_reminders', {
        name: 'Nhắc nhở thời tiết',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200, 100, 200],
        lightColor: '#00BFFF',
        sound: 'default',
        description: 'Nhắc nhở về điều kiện thời tiết',
      });

    } catch (error) {
      console.error('[ReminderManager] Failed to setup notification channels:', error);
    }
  }

  /**
   * Lên lịch nhắc nhở đi làm
   */
  async scheduleDepartureReminder(shift, customMinutes = null) {
    try {
      if (!shift || !shift.departureTime) return null;

      const reminderMinutes = customMinutes || this.userSettings.departureReminderMinutes || REMINDER_TIMINGS.DEPARTURE.DEFAULT;
      const departureTime = this.parseTime(shift.departureTime);
      const reminderTime = new Date(departureTime.getTime() - reminderMinutes * 60 * 1000);

      if (reminderTime <= new Date()) return null;

      const reminderId = `departure_${shift.id}_${Date.now()}`;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚗 Đến giờ khởi hành!',
          body: `Chuẩn bị đi làm ca ${shift.name} lúc ${shift.departureTime}`,
          data: {
            type: ALARM_TYPES.DEPARTURE_REMINDER,
            shiftId: shift.id,
            reminderId,
            priority: REMINDER_PRIORITIES.HIGH,
          },
          sound: true,
          priority: 'high',
        },
        trigger: { date: reminderTime },
        identifier: reminderId,
      });

      // Lưu thông tin reminder
      await this.saveReminder({
        id: reminderId,
        notificationId,
        type: ALARM_TYPES.DEPARTURE_REMINDER,
        shiftId: shift.id,
        scheduledTime: reminderTime.toISOString(),
        title: 'Nhắc nhở khởi hành',
        isActive: true,
      });

      console.log(`[ReminderManager] Scheduled departure reminder for ${shift.name} at ${formatTime(reminderTime)}`);
      return reminderId;

    } catch (error) {
      console.error('[ReminderManager] Failed to schedule departure reminder:', error);
      return null;
    }
  }

  /**
   * Lên lịch nhắc nhở chấm công vào
   */
  async scheduleCheckInReminder(shift, customMinutes = null) {
    try {
      if (!shift || !shift.startTime) return null;

      const reminderMinutes = customMinutes || this.userSettings.checkInReminderMinutes || REMINDER_TIMINGS.CHECK_IN.DEFAULT;
      const shiftStartTime = this.parseTime(shift.startTime);
      const reminderTime = new Date(shiftStartTime.getTime() - reminderMinutes * 60 * 1000);

      if (reminderTime <= new Date()) return null;

      const reminderId = `check_in_${shift.id}_${Date.now()}`;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Đến giờ chấm công vào!',
          body: `Ca ${shift.name} bắt đầu lúc ${shift.startTime}. Nhớ chấm công!`,
          data: {
            type: ALARM_TYPES.CHECK_IN_REMINDER,
            shiftId: shift.id,
            reminderId,
            priority: REMINDER_PRIORITIES.HIGH,
            action: 'check_in',
          },
          sound: true,
          priority: 'high',
        },
        trigger: { date: reminderTime },
        identifier: reminderId,
      });

      // Lên lịch nhắc nhở khẩn cấp nếu chưa chấm công
      const urgentReminderId = await this.scheduleUrgentCheckInReminder(shift);

      await this.saveReminder({
        id: reminderId,
        notificationId,
        type: ALARM_TYPES.CHECK_IN_REMINDER,
        shiftId: shift.id,
        scheduledTime: reminderTime.toISOString(),
        title: 'Nhắc nhở chấm công vào',
        isActive: true,
        urgentReminderId,
      });

      console.log(`[ReminderManager] Scheduled check-in reminder for ${shift.name} at ${formatTime(reminderTime)}`);
      return reminderId;

    } catch (error) {
      console.error('[ReminderManager] Failed to schedule check-in reminder:', error);
      return null;
    }
  }

  /**
   * Lên lịch nhắc nhở chấm công vào khẩn cấp
   */
  async scheduleUrgentCheckInReminder(shift) {
    try {
      const urgentMinutes = REMINDER_TIMINGS.CHECK_IN.URGENT;
      const shiftStartTime = this.parseTime(shift.startTime);
      const urgentTime = new Date(shiftStartTime.getTime() - urgentMinutes * 60 * 1000);

      if (urgentTime <= new Date()) return null;

      const urgentReminderId = `check_in_urgent_${shift.id}_${Date.now()}`;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 KHẨN CẤP: Chấm công ngay!',
          body: `Ca ${shift.name} sắp bắt đầu trong ${urgentMinutes} phút!`,
          data: {
            type: ALARM_TYPES.CHECK_IN_URGENT,
            shiftId: shift.id,
            reminderId: urgentReminderId,
            priority: REMINDER_PRIORITIES.URGENT,
            action: 'check_in',
          },
          sound: true,
          priority: 'max',
        },
        trigger: { date: urgentTime },
        identifier: urgentReminderId,
      });

      await this.saveReminder({
        id: urgentReminderId,
        notificationId,
        type: ALARM_TYPES.CHECK_IN_URGENT,
        shiftId: shift.id,
        scheduledTime: urgentTime.toISOString(),
        title: 'Nhắc nhở chấm công khẩn cấp',
        isActive: true,
      });

      return urgentReminderId;

    } catch (error) {
      console.error('[ReminderManager] Failed to schedule urgent check-in reminder:', error);
      return null;
    }
  }

  /**
   * Parse time string to Date object for today
   */
  parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  /**
   * Lưu thông tin reminder
   */
  async saveReminder(reminder) {
    try {
      this.activeReminders.set(reminder.id, reminder);

      const reminders = Array.from(this.activeReminders.values());
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_REMINDERS || 'active_reminders', JSON.stringify(reminders));

    } catch (error) {
      console.error('[ReminderManager] Failed to save reminder:', error);
    }
  }

  /**
   * Lên lịch nhắc nhở chấm công ra
   */
  async scheduleCheckOutReminder(shift, customMinutes = null) {
    try {
      if (!shift || !shift.endTime) return null;

      const reminderMinutes = customMinutes || this.userSettings.checkOutReminderMinutes || REMINDER_TIMINGS.CHECK_OUT.DEFAULT;
      const shiftEndTime = this.parseTime(shift.endTime);
      const reminderTime = new Date(shiftEndTime.getTime() - reminderMinutes * 60 * 1000);

      if (reminderTime <= new Date()) return null;

      const reminderId = `check_out_${shift.id}_${Date.now()}`;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Đến giờ chấm công ra!',
          body: `Ca ${shift.name} kết thúc lúc ${shift.endTime}. Nhớ chấm công ra!`,
          data: {
            type: ALARM_TYPES.CHECK_OUT_REMINDER,
            shiftId: shift.id,
            reminderId,
            priority: REMINDER_PRIORITIES.HIGH,
            action: 'check_out',
          },
          sound: true,
          priority: 'high',
        },
        trigger: { date: reminderTime },
        identifier: reminderId,
      });

      await this.saveReminder({
        id: reminderId,
        notificationId,
        type: ALARM_TYPES.CHECK_OUT_REMINDER,
        shiftId: shift.id,
        scheduledTime: reminderTime.toISOString(),
        title: 'Nhắc nhở chấm công ra',
        isActive: true,
      });

      console.log(`[ReminderManager] Scheduled check-out reminder for ${shift.name} at ${formatTime(reminderTime)}`);
      return reminderId;

    } catch (error) {
      console.error('[ReminderManager] Failed to schedule check-out reminder:', error);
      return null;
    }
  }

  /**
   * Lên lịch nhắc nhở nghỉ giải lao
   */
  async scheduleBreakReminder(shift, breakStartTime) {
    try {
      if (!shift || !breakStartTime) return null;

      const reminderMinutes = this.userSettings.breakReminderMinutes || REMINDER_TIMINGS.BREAK.DEFAULT;
      const breakTime = this.parseTime(breakStartTime);
      const reminderTime = new Date(breakTime.getTime() - reminderMinutes * 60 * 1000);

      if (reminderTime <= new Date()) return null;

      const reminderId = `break_${shift.id}_${Date.now()}`;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '☕ Đến giờ nghỉ giải lao!',
          body: `Nghỉ giải lao ca ${shift.name} lúc ${breakStartTime}`,
          data: {
            type: ALARM_TYPES.SHIFT_BREAK,
            shiftId: shift.id,
            reminderId,
            priority: REMINDER_PRIORITIES.NORMAL,
          },
          sound: true,
          priority: 'default',
        },
        trigger: { date: reminderTime },
        identifier: reminderId,
      });

      await this.saveReminder({
        id: reminderId,
        notificationId,
        type: ALARM_TYPES.SHIFT_BREAK,
        shiftId: shift.id,
        scheduledTime: reminderTime.toISOString(),
        title: 'Nhắc nhở nghỉ giải lao',
        isActive: true,
      });

      return reminderId;

    } catch (error) {
      console.error('[ReminderManager] Failed to schedule break reminder:', error);
      return null;
    }
  }

  /**
   * Lên lịch nhắc nhở overtime
   */
  async scheduleOvertimeReminders(shift) {
    try {
      if (!shift || !shift.endTime) return [];

      const results = [];
      const shiftEndTime = this.parseTime(shift.endTime);

      // Nhắc nhở cảnh báo overtime (30 phút sau giờ tan ca)
      const overtimeWarningTime = new Date(shiftEndTime.getTime() + REMINDER_TIMINGS.OVERTIME.WARNING * 60 * 1000);

      if (overtimeWarningTime > new Date()) {
        const warningReminderId = `overtime_warning_${shift.id}_${Date.now()}`;

        const warningNotificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '⚠️ Cảnh báo làm thêm giờ!',
            body: `Bạn đã làm thêm ${REMINDER_TIMINGS.OVERTIME.WARNING} phút. Cân nhắc chấm công ra.`,
            data: {
              type: ALARM_TYPES.OVERTIME_WARNING,
              shiftId: shift.id,
              reminderId: warningReminderId,
              priority: REMINDER_PRIORITIES.HIGH,
            },
            sound: true,
            priority: 'high',
          },
          trigger: { date: overtimeWarningTime },
          identifier: warningReminderId,
        });

        await this.saveReminder({
          id: warningReminderId,
          notificationId: warningNotificationId,
          type: ALARM_TYPES.OVERTIME_WARNING,
          shiftId: shift.id,
          scheduledTime: overtimeWarningTime.toISOString(),
          title: 'Cảnh báo overtime',
          isActive: true,
        });

        results.push(warningReminderId);
      }

      // Nhắc nhở giới hạn overtime (60 phút sau giờ tan ca)
      const overtimeLimitTime = new Date(shiftEndTime.getTime() + REMINDER_TIMINGS.OVERTIME.LIMIT * 60 * 1000);

      if (overtimeLimitTime > new Date()) {
        const limitReminderId = `overtime_limit_${shift.id}_${Date.now()}`;

        const limitNotificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: '🚨 GIỚI HẠN OVERTIME!',
            body: `Bạn đã làm thêm ${REMINDER_TIMINGS.OVERTIME.LIMIT} phút. Hãy chấm công ra ngay!`,
            data: {
              type: ALARM_TYPES.OVERTIME_LIMIT,
              shiftId: shift.id,
              reminderId: limitReminderId,
              priority: REMINDER_PRIORITIES.URGENT,
            },
            sound: true,
            priority: 'max',
          },
          trigger: { date: overtimeLimitTime },
          identifier: limitReminderId,
        });

        await this.saveReminder({
          id: limitReminderId,
          notificationId: limitNotificationId,
          type: ALARM_TYPES.OVERTIME_LIMIT,
          shiftId: shift.id,
          scheduledTime: overtimeLimitTime.toISOString(),
          title: 'Giới hạn overtime',
          isActive: true,
        });

        results.push(limitReminderId);
      }

      console.log(`[ReminderManager] Scheduled ${results.length} overtime reminders for ${shift.name}`);
      return results;

    } catch (error) {
      console.error('[ReminderManager] Failed to schedule overtime reminders:', error);
      return [];
    }
  }

  /**
   * Lên lịch tất cả nhắc nhở cho một ca làm việc
   */
  async scheduleAllShiftReminders(shift, options = {}) {
    try {
      if (!shift) return { success: false, error: 'No shift provided' };

      console.log(`[ReminderManager] Scheduling all reminders for shift: ${shift.name}`);

      const results = {
        departure: null,
        checkIn: null,
        checkOut: null,
        overtime: [],
        break: null,
      };

      // Kiểm tra user settings
      if (!this.userSettings.alarmSoundEnabled) {
        console.log('[ReminderManager] Alarms disabled in user settings');
        return { success: true, message: 'Alarms disabled', results };
      }

      // Lên lịch nhắc nhở khởi hành
      if (shift.departureTime && this.userSettings.departureReminderEnabled !== false) {
        results.departure = await this.scheduleDepartureReminder(shift, options.departureMinutes);
      }

      // Lên lịch nhắc nhở chấm công vào
      if (shift.startTime && this.userSettings.checkInReminderEnabled !== false) {
        results.checkIn = await this.scheduleCheckInReminder(shift, options.checkInMinutes);
      }

      // Lên lịch nhắc nhở chấm công ra
      if (shift.endTime && this.userSettings.checkOutReminderEnabled !== false) {
        results.checkOut = await this.scheduleCheckOutReminder(shift, options.checkOutMinutes);
      }

      // Lên lịch nhắc nhở overtime
      if (this.userSettings.overtimeReminderEnabled !== false) {
        results.overtime = await this.scheduleOvertimeReminders(shift);
      }

      // Lên lịch nhắc nhở nghỉ giải lao (nếu có)
      if (shift.breakMinutes && shift.breakMinutes > 0 && this.userSettings.breakReminderEnabled !== false) {
        // Tính toán thời gian nghỉ (giữa ca)
        const shiftStart = this.parseTime(shift.startTime);
        const shiftEnd = this.parseTime(shift.endTime);
        const shiftDuration = (shiftEnd - shiftStart) / (1000 * 60); // minutes
        const breakStartMinutes = Math.floor(shiftDuration / 2); // Nghỉ giữa ca

        const breakStartTime = new Date(shiftStart.getTime() + breakStartMinutes * 60 * 1000);
        const breakTimeString = `${breakStartTime.getHours().toString().padStart(2, '0')}:${breakStartTime.getMinutes().toString().padStart(2, '0')}`;

        results.break = await this.scheduleBreakReminder(shift, breakTimeString);
      }

      const totalScheduled = Object.values(results).flat().filter(Boolean).length;
      console.log(`[ReminderManager] Scheduled ${totalScheduled} reminders for ${shift.name}`);

      return { success: true, results, totalScheduled };

    } catch (error) {
      console.error('[ReminderManager] Failed to schedule all shift reminders:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Hủy một nhắc nhở cụ thể
   */
  async cancelReminder(reminderId) {
    try {
      const reminder = this.activeReminders.get(reminderId);
      if (!reminder) {
        console.warn(`[ReminderManager] Reminder ${reminderId} not found`);
        return false;
      }

      // Hủy notification
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);

      // Xóa khỏi active reminders
      this.activeReminders.delete(reminderId);

      // Cập nhật storage
      await this.saveActiveReminders();

      console.log(`[ReminderManager] Cancelled reminder: ${reminderId}`);
      return true;

    } catch (error) {
      console.error(`[ReminderManager] Failed to cancel reminder ${reminderId}:`, error);
      return false;
    }
  }

  /**
   * Hủy tất cả nhắc nhở của một ca làm việc
   */
  async cancelShiftReminders(shiftId) {
    try {
      const shiftReminders = Array.from(this.activeReminders.values())
        .filter(reminder => reminder.shiftId === shiftId);

      let cancelledCount = 0;
      for (const reminder of shiftReminders) {
        const success = await this.cancelReminder(reminder.id);
        if (success) cancelledCount++;
      }

      console.log(`[ReminderManager] Cancelled ${cancelledCount} reminders for shift ${shiftId}`);
      return cancelledCount;

    } catch (error) {
      console.error(`[ReminderManager] Failed to cancel shift reminders for ${shiftId}:`, error);
      return 0;
    }
  }

  /**
   * Hủy tất cả nhắc nhở
   */
  async cancelAllReminders() {
    try {
      // Hủy tất cả scheduled notifications
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Xóa tất cả active reminders
      this.activeReminders.clear();

      // Cập nhật storage
      await this.saveActiveReminders();

      console.log('[ReminderManager] Cancelled all reminders');
      return true;

    } catch (error) {
      console.error('[ReminderManager] Failed to cancel all reminders:', error);
      return false;
    }
  }

  /**
   * Lấy danh sách nhắc nhở đang hoạt động
   */
  getActiveReminders(shiftId = null) {
    const reminders = Array.from(this.activeReminders.values());

    if (shiftId) {
      return reminders.filter(reminder => reminder.shiftId === shiftId);
    }

    return reminders;
  }

  /**
   * Cập nhật cài đặt người dùng
   */
  async updateUserSettings(newSettings) {
    try {
      this.userSettings = { ...this.userSettings, ...newSettings };
      await storage.updateUserSettings(newSettings);

      console.log('[ReminderManager] Updated user settings');
    } catch (error) {
      console.error('[ReminderManager] Failed to update user settings:', error);
    }
  }

  /**
   * Lưu active reminders vào storage
   */
  async saveActiveReminders() {
    try {
      const reminders = Array.from(this.activeReminders.values());
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_REMINDERS || 'active_reminders', JSON.stringify(reminders));
    } catch (error) {
      console.error('[ReminderManager] Failed to save active reminders:', error);
    }
  }

  /**
   * Load active reminders from storage
   */
  async loadActiveReminders() {
    try {
      const remindersData = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_REMINDERS || 'active_reminders');
      if (remindersData) {
        const reminders = JSON.parse(remindersData);
        reminders.forEach(reminder => {
          this.activeReminders.set(reminder.id, reminder);
        });
      }
    } catch (error) {
      console.error('[ReminderManager] Failed to load active reminders:', error);
    }
  }

  /**
   * Lên lịch nhắc nhở test
   */
  async scheduleTestReminder() {
    try {
      const testTime = new Date(Date.now() + 5000); // 5 giây sau
      const reminderId = `test_reminder_${Date.now()}`;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Test Reminder',
          body: 'This is a test notification from AccShift reminder system!',
          data: {
            type: 'test_reminder',
            reminderId,
            priority: REMINDER_PRIORITIES.NORMAL,
          },
          sound: true,
          priority: 'default',
        },
        trigger: { date: testTime },
        identifier: reminderId,
      });

      console.log('[ReminderManager] Scheduled test reminder');
      return reminderId;

    } catch (error) {
      console.error('[ReminderManager] Failed to schedule test reminder:', error);
      return null;
    }
  }

  /**
   * Lên lịch nhắc nhở thời tiết
   */
  async scheduleWeatherReminder(weatherData, shift) {
    try {
      if (!weatherData || !shift || !this.userSettings.weatherReminderEnabled) return null;

      const { condition, temperature, description } = weatherData;
      const departureTime = this.parseTime(shift.departureTime);
      const reminderTime = new Date(departureTime.getTime() - REMINDER_TIMINGS.WEATHER.PREPARATION * 60 * 1000);

      if (reminderTime <= new Date()) return null;

      let weatherIcon = '🌤️';
      let weatherMessage = 'Kiểm tra thời tiết trước khi đi làm';

      // Xác định icon và message dựa trên điều kiện thời tiết
      if (condition.includes('rain') || condition.includes('storm')) {
        weatherIcon = '🌧️';
        weatherMessage = 'Trời mưa! Nhớ mang ô và áo mưa';
      } else if (condition.includes('snow')) {
        weatherIcon = '❄️';
        weatherMessage = 'Trời tuyết! Mặc ấm và đi cẩn thận';
      } else if (condition.includes('hot') || temperature > 35) {
        weatherIcon = '🌡️';
        weatherMessage = 'Trời nóng! Nhớ mang nước và kem chống nắng';
      } else if (condition.includes('cold') || temperature < 10) {
        weatherIcon = '🧥';
        weatherMessage = 'Trời lạnh! Nhớ mặc ấm';
      }

      const reminderId = `weather_${shift.id}_${Date.now()}`;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${weatherIcon} Chuẩn bị thời tiết`,
          body: `${weatherMessage}. Nhiệt độ: ${temperature}°C`,
          data: {
            type: ALARM_TYPES.WEATHER_PREPARATION,
            shiftId: shift.id,
            reminderId,
            priority: REMINDER_PRIORITIES.NORMAL,
            weatherData,
          },
          sound: true,
          priority: 'default',
        },
        trigger: { date: reminderTime },
        identifier: reminderId,
      });

      await this.saveReminder({
        id: reminderId,
        notificationId,
        type: ALARM_TYPES.WEATHER_PREPARATION,
        shiftId: shift.id,
        scheduledTime: reminderTime.toISOString(),
        title: 'Nhắc nhở thời tiết',
        isActive: true,
        weatherData,
      });

      console.log(`[ReminderManager] Scheduled weather reminder for ${shift.name}`);
      return reminderId;

    } catch (error) {
      console.error('[ReminderManager] Failed to schedule weather reminder:', error);
      return null;
    }
  }

  /**
   * Lên lịch nhắc nhở ghi chú
   */
  async scheduleNoteReminder(note, reminderTime) {
    try {
      if (!note || !reminderTime) return null;

      const reminderId = `note_${note.id}_${Date.now()}`;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📝 Nhắc nhở ghi chú',
          body: note.content.substring(0, 100) + (note.content.length > 100 ? '...' : ''),
          data: {
            type: ALARM_TYPES.NOTE_REMINDER,
            noteId: note.id,
            reminderId,
            priority: REMINDER_PRIORITIES.NORMAL,
          },
          sound: true,
          priority: 'default',
        },
        trigger: { date: new Date(reminderTime) },
        identifier: reminderId,
      });

      await this.saveReminder({
        id: reminderId,
        notificationId,
        type: ALARM_TYPES.NOTE_REMINDER,
        noteId: note.id,
        scheduledTime: reminderTime,
        title: 'Nhắc nhở ghi chú',
        isActive: true,
      });

      console.log(`[ReminderManager] Scheduled note reminder`);
      return reminderId;

    } catch (error) {
      console.error('[ReminderManager] Failed to schedule note reminder:', error);
      return null;
    }
  }

  /**
   * Dọn dẹp nhắc nhở đã hết hạn
   */
  async cleanupExpiredReminders() {
    try {
      const now = new Date();
      const expiredReminders = Array.from(this.activeReminders.values())
        .filter(reminder => new Date(reminder.scheduledTime) < now);

      let cleanedCount = 0;
      for (const reminder of expiredReminders) {
        this.activeReminders.delete(reminder.id);
        cleanedCount++;
      }

      if (cleanedCount > 0) {
        await this.saveActiveReminders();
        console.log(`[ReminderManager] Cleaned up ${cleanedCount} expired reminders`);
      }

      return cleanedCount;

    } catch (error) {
      console.error('[ReminderManager] Failed to cleanup expired reminders:', error);
      return 0;
    }
  }

  /**
   * Lấy thống kê nhắc nhở
   */
  getReminderStats() {
    const reminders = Array.from(this.activeReminders.values());
    const now = new Date();

    const stats = {
      total: reminders.length,
      upcoming: reminders.filter(r => new Date(r.scheduledTime) > now).length,
      expired: reminders.filter(r => new Date(r.scheduledTime) <= now).length,
      byType: {},
    };

    // Thống kê theo loại
    reminders.forEach(reminder => {
      stats.byType[reminder.type] = (stats.byType[reminder.type] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
const reminderManager = new ReminderManager();
export default reminderManager;

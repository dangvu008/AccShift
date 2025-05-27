// Storage keys for AsyncStorage
export const STORAGE_KEYS = {
  SHIFT_LIST: 'accshift_shifts',
  CURRENT_SHIFT: 'accshift_current_shift',
  NOTES: 'accshift_notes',
  SETTINGS: 'accshift_settings',
  USER_PROFILE: 'accshift_user_profile',
  ATTENDANCE_RECORDS: 'accshift_attendance_records',
  THEME: 'accshift_theme',
  LANGUAGE: 'accshift_language',
  USER_SETTINGS: 'accshift_user_settings',
  DEVICE_ID: 'accshift_device_id',
  IS_WORKING: 'accshift_is_working',
  WORK_START_TIME: 'accshift_work_start_time',
}

// Notification configuration
export const NOTIFICATION_CONFIG = {
  CHANNEL_ID: 'accshift_notifications',
  CHANNEL_NAME: 'AccShift Notifications',
  VIBRATION_PATTERN: [0, 250, 250, 250],
  LIGHT_COLOR: '#8a56ff',
}

// Alarm types and configurations
export const ALARM_TYPES = {
  // Nhắc nhở đi làm
  GO_TO_WORK: 'go_to_work',
  DEPARTURE_REMINDER: 'departure_reminder',

  // Nhắc nhở chấm công
  CHECK_IN_REMINDER: 'check_in_reminder',
  CHECK_IN_URGENT: 'check_in_urgent',
  CHECK_OUT_REMINDER: 'check_out_reminder',
  CHECK_OUT_URGENT: 'check_out_urgent',

  // Nhắc nhở ca làm việc
  SHIFT_START: 'shift_start',
  SHIFT_END: 'shift_end',
  SHIFT_BREAK: 'shift_break',
  SHIFT_RETURN: 'shift_return',

  // Nhắc nhở làm thêm giờ
  OVERTIME_START: 'overtime_start',
  OVERTIME_WARNING: 'overtime_warning',
  OVERTIME_LIMIT: 'overtime_limit',

  // Nhắc nhở ghi chú và công việc
  NOTE_REMINDER: 'note_reminder',
  TASK_REMINDER: 'task_reminder',

  // Nhắc nhở thời tiết
  WEATHER_WARNING: 'weather_warning',
  WEATHER_PREPARATION: 'weather_preparation',

  // Nhắc nhở hệ thống
  MISSED_CHECK_IN: 'missed_check_in',
  MISSED_CHECK_OUT: 'missed_check_out',
  SHIFT_CHANGE: 'shift_change',
  WEEKLY_SUMMARY: 'weekly_summary',
}

// Reminder timing configurations
export const REMINDER_TIMINGS = {
  // Thời gian nhắc nhở trước sự kiện (phút)
  DEPARTURE: {
    DEFAULT: 30,
    MIN: 5,
    MAX: 120,
  },
  CHECK_IN: {
    DEFAULT: 15,
    URGENT: 5,
    MIN: 1,
    MAX: 60,
  },
  CHECK_OUT: {
    DEFAULT: 15,
    URGENT: 5,
    MIN: 1,
    MAX: 60,
  },
  BREAK: {
    DEFAULT: 5,
    MIN: 1,
    MAX: 30,
  },
  OVERTIME: {
    WARNING: 30, // Cảnh báo trước 30 phút
    LIMIT: 60,   // Cảnh báo giới hạn
  },
  WEATHER: {
    PREPARATION: 60, // Chuẩn bị thời tiết trước 1 giờ
    WARNING: 30,     // Cảnh báo thời tiết trước 30 phút
  },
}

// Reminder priorities
export const REMINDER_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical',
}

// Reminder repeat patterns
export const REMINDER_PATTERNS = {
  ONCE: 'once',
  DAILY: 'daily',
  WEEKDAYS: 'weekdays',
  WEEKLY: 'weekly',
  CUSTOM: 'custom',
}

// App constants
export const APP_CONSTANTS = {
  DEFAULT_BREAK_TIME: 60, // minutes
  DEFAULT_SHIFT_DURATION: 8, // hours
  MIN_SHIFT_DURATION: 1, // hours
  MAX_SHIFT_DURATION: 24, // hours
}

// Date and time formats
export const DATE_FORMATS = {
  DISPLAY_DATE: 'DD/MM/YYYY',
  DISPLAY_TIME: 'HH:mm',
  DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm',
  API_DATE: 'YYYY-MM-DD',
  API_TIME: 'HH:mm:ss',
  API_DATETIME: 'YYYY-MM-DDTHH:mm:ss',
}

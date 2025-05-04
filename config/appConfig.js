export const API_CONFIG = {
  WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
  CACHE_TTL: 3 * 60 * 60 * 1000, // 3 hours (giảm từ 24 giờ để cập nhật thường xuyên hơn)
  CACHE_TTL_FALLBACK: 7 * 24 * 60 * 60 * 1000, // 7 days (cache dự phòng khi không có mạng)
  KEY_USAGE_LIMIT_PER_MINUTE: 50, // Giảm từ 60 để tránh đạt giới hạn
  KEY_USAGE_RESET_INTERVAL: 60 * 1000, // 1 minute
  REQUEST_TIMEOUT: 15000, // 15 seconds timeout
  MAX_RETRY_COUNT: 3, // Số lần thử lại tối đa
  RETRY_DELAY: 1500, // 1.5 seconds delay giữa các lần thử lại
  DEFAULT_LOCATION: {
    lat: 21.0278,
    lon: 105.8342, // Hà Nội
  },
  // Thêm các API endpoints khác
  ENDPOINTS: {
    CURRENT_WEATHER: 'weather',
    FORECAST: 'forecast',
    ONECALL: 'onecall',
  },
}

export const SECURITY_CONFIG = {
  ENCRYPTION_KEY: 'AccShift_Encryption_Key_2025',
  SECURE_PREFIX: 'secure_',
  MASK_VISIBLE_CHARS: 4,
}

export const STORAGE_KEYS = {
  ATTENDANCE_LOGS_PREFIX: 'attendanceLogs_',
  NOTIFICATION_LOGS_PREFIX: 'notificationLogs_',
  DAILY_WORK_STATUS_PREFIX: 'dailyWorkStatus_',
  SHIFT_LIST: 'shifts',
  NOTES: 'notes',
  CURRENT_SHIFT_ID: 'currentShiftId',
  WEATHER_CACHE_PREFIX: 'weather_cache_',
  WEATHER_API_KEYS: 'weatherApiKeys',
  WEATHER_API_STATE: 'weatherApiState',
  WEATHER_ALERTS: 'weatherAlerts',
  DEVICE_ID: 'device_id',
  USER_SETTINGS: 'userSettings',
  ACTIVE_SHIFT_ID: 'activeShiftId',
  IS_WORKING: 'isWorking',
  WORK_START_TIME: 'workStartTime',
  LAST_AUTO_RESET_TIME: 'lastAutoResetTime',
}

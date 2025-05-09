export const WORK_STATUS = {
  THIEU_LOG: 'THIEU_LOG', // Đi làm nhưng thiếu chấm công
  DU_CONG: 'DU_CONG', // Đủ công
  CHUA_CAP_NHAT: 'CHUA_CAP_NHAT', // Chưa cập nhật
  NGHI_PHEP: 'NGHI_PHEP', // Nghỉ phép
  NGHI_BENH: 'NGHI_BENH', // Nghỉ bệnh
  NGHI_LE: 'NGHI_LE', // Nghỉ lễ
  NGHI_THUONG: 'NGHI_THUONG', // Ngày nghỉ thông thường (thứ 7, chủ nhật)
  VANG_MAT: 'VANG_MAT', // Vắng không lý do
  DI_MUON: 'DI_MUON', // Đi muộn
  VE_SOM: 'VE_SOM', // Về sớm
  DI_MUON_VE_SOM: 'DI_MUON_VE_SOM', // Đi muộn và về sớm
  NGAY_TUONG_LAI: 'NGAY_TUONG_LAI', // Ngày tương lai
  QUEN_CHECK_OUT: 'QUEN_CHECK_OUT', // Quên check-out
}

export const API_CONFIG = {
  // API URLs - Sử dụng API trực tiếp không qua proxy
  WEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',

  // Cấu hình cache
  CACHE_TTL: 20 * 60 * 1000, // 20 phút (giảm từ 30 phút để cập nhật thường xuyên hơn)
  CACHE_TTL_FALLBACK: 7 * 24 * 60 * 60 * 1000, // 7 ngày (cache dự phòng khi không có mạng)

  // Cấu hình API key
  KEY_USAGE_LIMIT_PER_MINUTE: 25, // Tăng từ 20 lên 25 để có thể sử dụng nhiều hơn
  KEY_USAGE_RESET_INTERVAL: 30 * 1000, // 30 giây (giảm từ 1 phút để reset nhanh hơn)

  // Cấu hình timeout và retry
  REQUEST_TIMEOUT: 10000, // 10 giây timeout (giảm từ 15 giây)
  MAX_RETRY_COUNT: 5, // Tăng số lần thử lại từ 3 lên 5
  RETRY_DELAY: 500, // 0.5 giây delay giữa các lần thử lại (giảm từ 1 giây)

  // Vị trí mặc định
  DEFAULT_LOCATION: {
    lat: 21.0278,
    lon: 105.8342, // Hà Nội
  },

  // Cấu hình API endpoints
  ENDPOINTS: {
    CURRENT_WEATHER: 'weather',
    FORECAST: 'forecast',
    ONECALL: 'onecall',
  },

  // Cấu hình cho môi trường web (snack.expo.dev)
  WEB_CONFIG: {
    USE_DIRECT_FETCH: true, // Luôn sử dụng fetch trực tiếp
    ENABLE_MOCK_DATA: true, // Cho phép sử dụng dữ liệu giả khi không thể kết nối
    USE_PROXY: false, // Không sử dụng proxy
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

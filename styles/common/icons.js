/**
 * Hệ thống icon thống nhất cho ứng dụng AccShift
 * Cung cấp icon mapping và sizing nhất quán
 */

import { DIMENSIONS } from './spacing';

// Icon mapping - Mapping các icon thường dùng
export const ICON_NAMES = {
  // Navigation icons
  HOME: 'home',
  HOME_OUTLINE: 'home-outline',
  SETTINGS: 'settings',
  SETTINGS_OUTLINE: 'settings-outline',
  BACK: 'arrow-back',
  FORWARD: 'arrow-forward',
  UP: 'arrow-up',
  DOWN: 'arrow-down',
  LEFT: 'arrow-back',
  RIGHT: 'arrow-forward',
  
  // Action icons
  ADD: 'add',
  ADD_CIRCLE: 'add-circle',
  REMOVE: 'remove',
  REMOVE_CIRCLE: 'remove-circle',
  EDIT: 'create',
  EDIT_OUTLINE: 'create-outline',
  DELETE: 'trash',
  DELETE_OUTLINE: 'trash-outline',
  SAVE: 'save',
  SAVE_OUTLINE: 'save-outline',
  COPY: 'copy',
  COPY_OUTLINE: 'copy-outline',
  SHARE: 'share',
  SHARE_OUTLINE: 'share-outline',
  
  // Status icons
  CHECK: 'checkmark',
  CHECK_CIRCLE: 'checkmark-circle',
  CLOSE: 'close',
  CLOSE_CIRCLE: 'close-circle',
  WARNING: 'warning',
  WARNING_OUTLINE: 'warning-outline',
  ERROR: 'alert-circle',
  ERROR_OUTLINE: 'alert-circle-outline',
  INFO: 'information-circle',
  INFO_OUTLINE: 'information-circle-outline',
  SUCCESS: 'checkmark-circle',
  SUCCESS_OUTLINE: 'checkmark-circle-outline',
  
  // UI icons
  MENU: 'menu',
  MENU_OUTLINE: 'menu-outline',
  SEARCH: 'search',
  SEARCH_OUTLINE: 'search-outline',
  FILTER: 'filter',
  FILTER_OUTLINE: 'filter-outline',
  SORT: 'swap-vertical',
  SORT_OUTLINE: 'swap-vertical-outline',
  REFRESH: 'refresh',
  REFRESH_OUTLINE: 'refresh-outline',
  
  // Content icons
  DOCUMENT: 'document',
  DOCUMENT_OUTLINE: 'document-outline',
  FOLDER: 'folder',
  FOLDER_OUTLINE: 'folder-outline',
  IMAGE: 'image',
  IMAGE_OUTLINE: 'image-outline',
  CAMERA: 'camera',
  CAMERA_OUTLINE: 'camera-outline',
  VIDEO: 'videocam',
  VIDEO_OUTLINE: 'videocam-outline',
  
  // Communication icons
  MAIL: 'mail',
  MAIL_OUTLINE: 'mail-outline',
  CALL: 'call',
  CALL_OUTLINE: 'call-outline',
  MESSAGE: 'chatbubble',
  MESSAGE_OUTLINE: 'chatbubble-outline',
  NOTIFICATION: 'notifications',
  NOTIFICATION_OUTLINE: 'notifications-outline',
  
  // Time and calendar icons
  TIME: 'time',
  TIME_OUTLINE: 'time-outline',
  CALENDAR: 'calendar',
  CALENDAR_OUTLINE: 'calendar-outline',
  CLOCK: 'alarm',
  CLOCK_OUTLINE: 'alarm-outline',
  TIMER: 'timer',
  TIMER_OUTLINE: 'timer-outline',
  
  // Location icons
  LOCATION: 'location',
  LOCATION_OUTLINE: 'location-outline',
  MAP: 'map',
  MAP_OUTLINE: 'map-outline',
  NAVIGATE: 'navigate',
  NAVIGATE_OUTLINE: 'navigate-outline',
  
  // Weather icons
  SUNNY: 'sunny',
  SUNNY_OUTLINE: 'sunny-outline',
  CLOUDY: 'cloudy',
  CLOUDY_OUTLINE: 'cloudy-outline',
  RAINY: 'rainy',
  RAINY_OUTLINE: 'rainy-outline',
  THUNDERSTORM: 'thunderstorm',
  THUNDERSTORM_OUTLINE: 'thunderstorm-outline',
  
  // Work and productivity icons
  BRIEFCASE: 'briefcase',
  BRIEFCASE_OUTLINE: 'briefcase-outline',
  BUSINESS: 'business',
  BUSINESS_OUTLINE: 'business-outline',
  CALCULATOR: 'calculator',
  CALCULATOR_OUTLINE: 'calculator-outline',
  CHART: 'bar-chart',
  CHART_OUTLINE: 'bar-chart-outline',
  STATS: 'stats-chart',
  STATS_OUTLINE: 'stats-chart-outline',
  
  // User and profile icons
  PERSON: 'person',
  PERSON_OUTLINE: 'person-outline',
  PEOPLE: 'people',
  PEOPLE_OUTLINE: 'people-outline',
  ACCOUNT: 'person-circle',
  ACCOUNT_OUTLINE: 'person-circle-outline',
  
  // System icons
  POWER: 'power',
  POWER_OUTLINE: 'power-outline',
  BATTERY: 'battery-full',
  BATTERY_OUTLINE: 'battery-full-outline',
  WIFI: 'wifi',
  WIFI_OUTLINE: 'wifi-outline',
  BLUETOOTH: 'bluetooth',
  BLUETOOTH_OUTLINE: 'bluetooth-outline',
  
  // Toggle icons
  EYE: 'eye',
  EYE_OFF: 'eye-off',
  HEART: 'heart',
  HEART_OUTLINE: 'heart-outline',
  STAR: 'star',
  STAR_OUTLINE: 'star-outline',
  BOOKMARK: 'bookmark',
  BOOKMARK_OUTLINE: 'bookmark-outline',
  
  // Media controls
  PLAY: 'play',
  PLAY_OUTLINE: 'play-outline',
  PAUSE: 'pause',
  PAUSE_OUTLINE: 'pause-outline',
  STOP: 'stop',
  STOP_OUTLINE: 'stop-outline',
  SKIP_FORWARD: 'play-skip-forward',
  SKIP_BACKWARD: 'play-skip-back',
  
  // Shift specific icons
  SHIFT_START: 'play-circle',
  SHIFT_END: 'stop-circle',
  SHIFT_BREAK: 'pause-circle',
  SHIFT_OVERTIME: 'time',
  SHIFT_SCHEDULE: 'calendar-clear',
  SHIFT_REPORT: 'document-text',
  SHIFT_ANALYTICS: 'analytics',
  SHIFT_NOTES: 'create',
  SHIFT_ALARM: 'alarm',
  SHIFT_REMINDER: 'notifications-circle',
};

// Icon sizes - Kích thước icon chuẩn
export const ICON_SIZES = {
  XS: DIMENSIONS.ICON.xs,     // 12px
  SM: DIMENSIONS.ICON.sm,     // 16px
  MD: DIMENSIONS.ICON.md,     // 20px
  LG: DIMENSIONS.ICON.lg,     // 24px
  XL: DIMENSIONS.ICON.xl,     // 32px
  XXL: DIMENSIONS.ICON.xxl,   // 40px
  XXXL: DIMENSIONS.ICON.xxxl, // 48px
};

// Icon categories - Phân loại icon theo chức năng
export const ICON_CATEGORIES = {
  NAVIGATION: [
    'HOME', 'HOME_OUTLINE', 'SETTINGS', 'SETTINGS_OUTLINE',
    'BACK', 'FORWARD', 'UP', 'DOWN', 'LEFT', 'RIGHT'
  ],
  
  ACTIONS: [
    'ADD', 'ADD_CIRCLE', 'REMOVE', 'REMOVE_CIRCLE',
    'EDIT', 'EDIT_OUTLINE', 'DELETE', 'DELETE_OUTLINE',
    'SAVE', 'SAVE_OUTLINE', 'COPY', 'COPY_OUTLINE',
    'SHARE', 'SHARE_OUTLINE'
  ],
  
  STATUS: [
    'CHECK', 'CHECK_CIRCLE', 'CLOSE', 'CLOSE_CIRCLE',
    'WARNING', 'WARNING_OUTLINE', 'ERROR', 'ERROR_OUTLINE',
    'INFO', 'INFO_OUTLINE', 'SUCCESS', 'SUCCESS_OUTLINE'
  ],
  
  SHIFT_MANAGEMENT: [
    'SHIFT_START', 'SHIFT_END', 'SHIFT_BREAK', 'SHIFT_OVERTIME',
    'SHIFT_SCHEDULE', 'SHIFT_REPORT', 'SHIFT_ANALYTICS',
    'SHIFT_NOTES', 'SHIFT_ALARM', 'SHIFT_REMINDER'
  ],
  
  WEATHER: [
    'SUNNY', 'SUNNY_OUTLINE', 'CLOUDY', 'CLOUDY_OUTLINE',
    'RAINY', 'RAINY_OUTLINE', 'THUNDERSTORM', 'THUNDERSTORM_OUTLINE'
  ],
  
  TIME: [
    'TIME', 'TIME_OUTLINE', 'CALENDAR', 'CALENDAR_OUTLINE',
    'CLOCK', 'CLOCK_OUTLINE', 'TIMER', 'TIMER_OUTLINE'
  ],
};

// Icon usage guidelines
export const ICON_GUIDELINES = {
  // Khi nào sử dụng outline vs filled
  USAGE: {
    FILLED: 'Sử dụng cho trạng thái active, selected, hoặc primary actions',
    OUTLINE: 'Sử dụng cho trạng thái inactive, secondary actions, hoặc subtle UI elements'
  },
  
  // Sizing guidelines
  SIZING: {
    XS: 'Chỉ dùng cho micro interactions hoặc inline text',
    SM: 'Dùng cho secondary actions trong compact UI',
    MD: 'Size mặc định cho hầu hết UI elements',
    LG: 'Dùng cho primary actions và navigation',
    XL: 'Dùng cho hero elements và main CTAs',
    XXL: 'Dùng cho large cards và feature highlights',
    XXXL: 'Dùng cho splash screens và empty states'
  },
  
  // Color guidelines
  COLORING: {
    PRIMARY: 'Sử dụng primary color cho main actions',
    SECONDARY: 'Sử dụng secondary/text color cho supporting elements',
    STATUS: 'Sử dụng semantic colors (success, warning, error) cho status indicators',
    NEUTRAL: 'Sử dụng neutral colors cho decorative elements'
  }
};

export default {
  ICON_NAMES,
  ICON_SIZES,
  ICON_CATEGORIES,
  ICON_GUIDELINES,
};

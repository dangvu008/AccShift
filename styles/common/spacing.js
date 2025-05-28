/**
 * Hệ thống spacing và layout cho ứng dụng AccShift
 * Cung cấp các giá trị spacing nhất quán và responsive cho toàn bộ ứng dụng
 */

// Base spacing unit - 8px system
const BASE_UNIT = 8;

// Spacing scale - Hệ thống spacing 8px
export const SPACING = {
  // Micro spacing - Cho các element nhỏ
  XXS: BASE_UNIT * 0.5,  // 4px
  XS: BASE_UNIT,         // 8px
  SM: BASE_UNIT * 1.5,   // 12px
  
  // Standard spacing - Cho layout thông thường
  MD: BASE_UNIT * 2,     // 16px
  LG: BASE_UNIT * 3,     // 24px
  XL: BASE_UNIT * 4,     // 32px
  
  // Large spacing - Cho sections và containers
  XXL: BASE_UNIT * 5,    // 40px
  XXXL: BASE_UNIT * 6,   // 48px
  XXXXL: BASE_UNIT * 8,  // 64px
  
  // Extra large spacing - Cho page layouts
  HUGE: BASE_UNIT * 10,  // 80px
  MASSIVE: BASE_UNIT * 12, // 96px
};

// Padding presets - Các preset padding thông dụng
export const PADDING = {
  // Container padding
  CONTAINER: {
    horizontal: SPACING.MD,
    vertical: SPACING.LG,
  },
  
  // Card padding
  CARD: {
    small: SPACING.SM,
    medium: SPACING.MD,
    large: SPACING.LG,
  },
  
  // Button padding
  BUTTON: {
    small: { horizontal: SPACING.SM, vertical: SPACING.XS },
    medium: { horizontal: SPACING.MD, vertical: SPACING.SM },
    large: { horizontal: SPACING.LG, vertical: SPACING.MD },
  },
  
  // Input padding
  INPUT: {
    horizontal: SPACING.MD,
    vertical: SPACING.SM,
  },
  
  // Modal padding
  MODAL: {
    horizontal: SPACING.LG,
    vertical: SPACING.XL,
  },
  
  // Screen padding
  SCREEN: {
    horizontal: SPACING.MD,
    vertical: SPACING.LG,
  },
};

// Margin presets - Các preset margin thông dụng
export const MARGIN = {
  // Element margins
  ELEMENT: {
    small: SPACING.XS,
    medium: SPACING.SM,
    large: SPACING.MD,
  },
  
  // Section margins
  SECTION: {
    small: SPACING.LG,
    medium: SPACING.XL,
    large: SPACING.XXL,
  },
  
  // Component margins
  COMPONENT: {
    between: SPACING.MD,
    group: SPACING.LG,
  },
};

// Border radius system - Hệ thống bo góc
export const BORDER_RADIUS = {
  NONE: 0,
  XS: 4,
  SM: 6,
  MD: 8,
  LG: 12,
  XL: 16,
  XXL: 20,
  XXXL: 24,
  ROUND: 50,  // Cho circular elements
  PILL: 999,  // Cho pill-shaped buttons
};

// Shadow system - Hệ thống đổ bóng
export const SHADOWS = {
  NONE: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  
  XS: {
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  SM: {
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  MD: {
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  
  LG: {
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  
  XL: {
    elevation: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  
  // Colored shadows
  PRIMARY: {
    elevation: 8,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  SUCCESS: {
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  ERROR: {
    elevation: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
};

// Layout dimensions - Kích thước layout
export const DIMENSIONS = {
  // Button dimensions
  BUTTON: {
    small: { height: 32, minWidth: 80 },
    medium: { height: 40, minWidth: 100 },
    large: { height: 48, minWidth: 120 },
    xlarge: { height: 56, minWidth: 140 },
  },
  
  // Input dimensions
  INPUT: {
    height: 48,
    minHeight: 40,
  },
  
  // Card dimensions
  CARD: {
    minHeight: 80,
    borderWidth: 1,
  },
  
  // Modal dimensions
  MODAL: {
    maxWidth: 400,
    minHeight: 200,
  },
  
  // Icon dimensions
  ICON: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
  },
  
  // Avatar dimensions
  AVATAR: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    xxl: 80,
  },
};

// Z-index system - Hệ thống layer
export const Z_INDEX = {
  BACKGROUND: -1,
  DEFAULT: 0,
  CONTENT: 1,
  HEADER: 10,
  OVERLAY: 100,
  MODAL: 1000,
  TOAST: 2000,
  TOOLTIP: 3000,
  DROPDOWN: 4000,
  LOADING: 9999,
};

// Opacity system - Hệ thống độ trong suốt
export const OPACITY = {
  TRANSPARENT: 0,
  SUBTLE: 0.1,
  LIGHT: 0.2,
  MEDIUM: 0.5,
  STRONG: 0.8,
  OPAQUE: 1,
};

export default {
  SPACING,
  PADDING,
  MARGIN,
  BORDER_RADIUS,
  SHADOWS,
  DIMENSIONS,
  Z_INDEX,
  OPACITY,
  BASE_UNIT,
};

/**
 * Hệ thống màu sắc và typography cho ứng dụng AccShift
 * Cung cấp các màu sắc và typography nhất quán cho toàn bộ ứng dụng
 */

// Import typography
import { TEXT_STYLES, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, LETTER_SPACING } from '../styles/common/typography.js';

// Màu sắc chính
export const COLORS = {
  // Màu chủ đạo
  PRIMARY: '#8a56ff',
  PRIMARY_DARK: '#7040e0',
  PRIMARY_LIGHT: '#a47aff',

  // Màu nền
  BACKGROUND_LIGHT: '#e8e8f0', // Màu nền sáng hơn với chút màu xanh
  BACKGROUND_DARK: '#121212',

  // Màu nền thẻ
  CARD_LIGHT: '#ffffff',
  CARD_DARK: '#1e1e1e',

  // Màu nền thẻ thứ cấp
  SECONDARY_CARD_LIGHT: '#e0e0f0', // Màu nền thẻ thứ cấp sáng hơn với chút màu xanh
  SECONDARY_CARD_DARK: '#2a2a2a',

  // Màu văn bản
  TEXT_LIGHT: '#222222', // Màu chữ đậm hơn để tăng độ tương phản
  TEXT_DARK: '#ffffff',

  // Màu văn bản phụ
  SUBTEXT_LIGHT: '#444444', // Màu chữ phụ đậm hơn để dễ đọc
  SUBTEXT_DARK: '#cccccc', // Màu chữ phụ sáng hơn trong dark mode

  // Màu đường viền
  BORDER_LIGHT: '#bbbbcc', // Màu đường viền đậm hơn với chút màu xanh
  BORDER_DARK: '#444444', // Màu đường viền sáng hơn trong dark mode

  // Màu trạng thái
  SUCCESS: '#1e8a4a', // Màu xanh lá đậm hơn
  WARNING: '#e67e00', // Màu cam đậm hơn
  ERROR: '#d62c1a', // Màu đỏ đậm hơn
  INFO: '#2980b9', // Màu xanh dương đậm hơn

  // Màu khác
  DISABLED_LIGHT: '#aaaaaa', // Màu disabled đậm hơn trong light mode
  DISABLED_DARK: '#666666', // Màu disabled sáng hơn trong dark mode
  TRANSPARENT: 'transparent',
}

/**
 * Lấy màu sắc dựa trên chế độ sáng/tối
 * @param {boolean} darkMode Chế độ tối
 * @returns {Object} Bảng màu
 */
export const getTheme = (darkMode) => {
  return {
    // Màu nền chính
    backgroundColor: darkMode ? COLORS.BACKGROUND_DARK : COLORS.BACKGROUND_LIGHT,

    // Màu nền thẻ
    cardColor: darkMode ? COLORS.CARD_DARK : COLORS.CARD_LIGHT,
    secondaryCardColor: darkMode ? COLORS.SECONDARY_CARD_DARK : COLORS.SECONDARY_CARD_LIGHT,

    // Màu văn bản
    textColor: darkMode ? COLORS.TEXT_DARK : COLORS.TEXT_LIGHT,
    subtextColor: darkMode ? COLORS.SUBTEXT_DARK : COLORS.SUBTEXT_LIGHT,

    // Màu đường viền
    borderColor: darkMode ? COLORS.BORDER_DARK : COLORS.BORDER_LIGHT,

    // Màu chủ đạo
    primaryColor: COLORS.PRIMARY,
    primaryDarkColor: COLORS.PRIMARY_DARK,
    primaryLightColor: COLORS.PRIMARY_LIGHT,

    // Màu trạng thái
    successColor: COLORS.SUCCESS,
    warningColor: COLORS.WARNING,
    errorColor: COLORS.ERROR,
    infoColor: COLORS.INFO,

    // Màu khác
    disabledColor: darkMode ? COLORS.DISABLED_DARK : COLORS.DISABLED_LIGHT,
    transparentColor: COLORS.TRANSPARENT,

    // Màu header
    headerBackgroundColor: COLORS.PRIMARY,
    headerTintColor: COLORS.TEXT_DARK,

    // Màu tab bar
    tabBarBackgroundColor: darkMode ? COLORS.BACKGROUND_DARK : COLORS.CARD_LIGHT,
    tabBarBorderColor: darkMode ? COLORS.BORDER_DARK : COLORS.BORDER_LIGHT,
    tabBarActiveColor: COLORS.PRIMARY,
    tabBarInactiveColor: darkMode ? COLORS.SUBTEXT_DARK : COLORS.SUBTEXT_LIGHT,

    // Typography
    textStyles: TEXT_STYLES,
    fontSizes: FONT_SIZES,
    fontWeights: FONT_WEIGHTS,
    lineHeights: LINE_HEIGHTS,
    letterSpacing: LETTER_SPACING,
  }
}

// Re-export typography constants for convenience
export { TEXT_STYLES, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, LETTER_SPACING };

export default {
  COLORS,
  getTheme,
  TEXT_STYLES,
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  LETTER_SPACING,
}

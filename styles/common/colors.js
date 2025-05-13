/**
 * Hệ thống màu sắc cho ứng dụng AccShift
 * Cung cấp các màu sắc nhất quán cho toàn bộ ứng dụng
 */

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
  SHADOW: '#000000',
}

export default COLORS;

/**
 * Hệ thống màu sắc hiện đại cho ứng dụng AccShift
 * Cung cấp các màu sắc nhất quán và ấn tượng cho toàn bộ ứng dụng
 */

// Màu sắc chính - Modern Color Palette
export const COLORS = {
  // Màu chủ đạo - Gradient Blue to Purple
  PRIMARY: '#6366f1', // Indigo-500 - Modern và professional
  PRIMARY_DARK: '#4f46e5', // Indigo-600 - Đậm hơn cho contrast
  PRIMARY_LIGHT: '#818cf8', // Indigo-400 - Sáng hơn cho highlights
  PRIMARY_GRADIENT_START: '#6366f1',
  PRIMARY_GRADIENT_END: '#8b5cf6', // Violet-500 - Tạo gradient đẹp

  // Màu accent
  ACCENT: '#f59e0b', // Amber-500 - Màu nhấn ấm áp
  ACCENT_LIGHT: '#fbbf24', // Amber-400
  ACCENT_DARK: '#d97706', // Amber-600

  // Màu nền - Cải thiện contrast và độ sáng
  BACKGROUND_LIGHT: '#f8fafc', // Slate-50 - Sáng và sạch sẽ
  BACKGROUND_DARK: '#0f172a', // Slate-900 - Đậm và sang trọng
  BACKGROUND_SECONDARY_LIGHT: '#f1f5f9', // Slate-100
  BACKGROUND_SECONDARY_DARK: '#1e293b', // Slate-800

  // Màu nền thẻ - Gradient và shadow effects
  CARD_LIGHT: '#ffffff',
  CARD_DARK: '#1e293b', // Slate-800 - Đậm hơn cho contrast tốt
  CARD_ELEVATED_LIGHT: '#ffffff', // Với shadow
  CARD_ELEVATED_DARK: '#334155', // Slate-700

  // Màu nền thẻ thứ cấp
  SECONDARY_CARD_LIGHT: '#f1f5f9', // Slate-100 - Nhẹ nhàng
  SECONDARY_CARD_DARK: '#334155', // Slate-700 - Cân bằng

  // Màu văn bản - Font đậm và rõ ràng
  TEXT_LIGHT: '#0f172a', // Slate-900 - Đậm tối đa cho readability
  TEXT_DARK: '#f8fafc', // Slate-50 - Sáng tối đa

  // Màu văn bản phụ - Cải thiện hierarchy
  SUBTEXT_LIGHT: '#475569', // Slate-600 - Đậm hơn nhưng vẫn readable
  SUBTEXT_DARK: '#cbd5e1', // Slate-300 - Sáng hơn trong dark mode

  // Màu đường viền - Modern borders
  BORDER_LIGHT: '#e2e8f0', // Slate-200 - Subtle và clean
  BORDER_DARK: '#475569', // Slate-600 - Visible trong dark mode
  BORDER_ACCENT_LIGHT: '#cbd5e1', // Slate-300 - Cho focus states
  BORDER_ACCENT_DARK: '#64748b', // Slate-500

  // Màu trạng thái - Vibrant và clear
  SUCCESS: '#10b981', // Emerald-500 - Xanh lá modern
  SUCCESS_LIGHT: '#34d399', // Emerald-400
  SUCCESS_DARK: '#059669', // Emerald-600

  WARNING: '#f59e0b', // Amber-500 - Vàng cam ấm áp
  WARNING_LIGHT: '#fbbf24', // Amber-400
  WARNING_DARK: '#d97706', // Amber-600

  ERROR: '#ef4444', // Red-500 - Đỏ rõ ràng
  ERROR_LIGHT: '#f87171', // Red-400
  ERROR_DARK: '#dc2626', // Red-600

  INFO: '#3b82f6', // Blue-500 - Xanh dương tin cậy
  INFO_LIGHT: '#60a5fa', // Blue-400
  INFO_DARK: '#2563eb', // Blue-600

  // Màu vô hiệu hóa - Better contrast
  DISABLED_LIGHT: '#d1d5db', // Gray-300
  DISABLED_DARK: '#6b7280', // Gray-500

  // Màu trong suốt và overlay
  TRANSPARENT: 'transparent',
  OVERLAY_LIGHT: 'rgba(0, 0, 0, 0.5)',
  OVERLAY_DARK: 'rgba(0, 0, 0, 0.7)',

  // Màu shadow - Enhanced depth
  SHADOW: '#000000',
  SHADOW_LIGHT: 'rgba(0, 0, 0, 0.1)',
  SHADOW_MEDIUM: 'rgba(0, 0, 0, 0.15)',
  SHADOW_HEAVY: 'rgba(0, 0, 0, 0.25)',

  // Màu gradient - Modern effects
  GRADIENT_PRIMARY: ['#6366f1', '#8b5cf6'],
  GRADIENT_ACCENT: ['#f59e0b', '#f97316'],
  GRADIENT_SUCCESS: ['#10b981', '#059669'],
  GRADIENT_CARD_LIGHT: ['#ffffff', '#f8fafc'],
  GRADIENT_CARD_DARK: ['#1e293b', '#0f172a'],
}

export default COLORS;

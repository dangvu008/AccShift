/**
 * Hệ thống màu sắc hiện đại cho ứng dụng AccShift
 * Cung cấp các màu sắc nhất quán và ấn tượng cho toàn bộ ứng dụng
 */

// Màu sắc chính - Analytics App Inspired Purple Theme
export const COLORS = {
  // Màu chủ đạo - Purple Gradient Theme (inspired by Analytics App)
  PRIMARY: '#6B46C1', // Purple-700 - Chính từ ảnh Analytics
  PRIMARY_DARK: '#553C9A', // Purple-800 - Đậm hơn cho contrast
  PRIMARY_LIGHT: '#8B5CF6', // Purple-500 - Sáng hơn cho highlights
  PRIMARY_GRADIENT_START: '#6B46C1', // Purple gradient start
  PRIMARY_GRADIENT_END: '#8B5CF6', // Purple gradient end

  // Gradient backgrounds cho cards (như trong ảnh)
  CARD_GRADIENT_START: '#7C3AED', // Purple-600
  CARD_GRADIENT_END: '#6B46C1', // Purple-700
  CARD_GRADIENT_SECONDARY_START: '#8B5CF6', // Purple-500
  CARD_GRADIENT_SECONDARY_END: '#7C3AED', // Purple-600

  // Màu accent - Orange/Amber như trong ảnh
  ACCENT: '#F59E0B', // Amber-500 - Màu cam/vàng từ ảnh
  ACCENT_LIGHT: '#FCD34D', // Amber-300 - Sáng hơn
  ACCENT_DARK: '#D97706', // Amber-600 - Đậm hơn

  // Màu nền - Analytics App Style với Purple Theme
  BACKGROUND_LIGHT: '#F8FAFC', // Slate-50 - Sáng và clean
  BACKGROUND_DARK: '#1E1B4B', // Indigo-900 - Purple dark background như ảnh
  BACKGROUND_SECONDARY_LIGHT: '#F1F5F9', // Slate-100
  BACKGROUND_SECONDARY_DARK: '#312E81', // Indigo-800 - Secondary purple background

  // Màu nền thẻ - Analytics App Card Style
  CARD_LIGHT: '#FFFFFF', // Trắng tinh khiết
  CARD_DARK: 'rgba(139, 92, 246, 0.15)', // Purple với opacity như trong ảnh
  CARD_ELEVATED_LIGHT: '#FFFFFF',
  CARD_ELEVATED_DARK: 'rgba(124, 58, 237, 0.2)', // Purple elevated với opacity cao hơn

  // Màu nền thẻ thứ cấp - Gradient cards
  SECONDARY_CARD_LIGHT: '#F8FAFC', // Slate-50
  SECONDARY_CARD_DARK: 'rgba(107, 70, 193, 0.25)', // Primary purple với opacity

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

  // Màu gradient - Analytics App Inspired
  GRADIENT_PRIMARY: ['#6B46C1', '#8B5CF6'], // Purple gradient chính
  GRADIENT_ACCENT: ['#F59E0B', '#FCD34D'], // Amber gradient
  GRADIENT_SUCCESS: ['#10B981', '#34D399'], // Emerald gradient
  GRADIENT_CARD_LIGHT: ['#FFFFFF', '#F8FAFC'], // Light card gradient
  GRADIENT_CARD_DARK: ['rgba(107, 70, 193, 0.3)', 'rgba(139, 92, 246, 0.1)'], // Purple card gradient

  // Gradient cho background chính (như trong ảnh Analytics)
  GRADIENT_BACKGROUND_DARK: ['#1E1B4B', '#312E81'], // Purple background gradient
  GRADIENT_BACKGROUND_LIGHT: ['#F8FAFC', '#F1F5F9'], // Light background gradient

  // Gradient cho các card đặc biệt
  GRADIENT_CARD_WATER: ['#3B82F6', '#1D4ED8'], // Blue gradient cho Water
  GRADIENT_CARD_HEATING: ['#EF4444', '#DC2626'], // Red gradient cho Heating
  GRADIENT_CARD_ELECTRICITY: ['#F59E0B', '#D97706'], // Orange gradient cho Electricity
  GRADIENT_CARD_INTERNET: ['#10B981', '#059669'], // Green gradient cho Internet
  GRADIENT_CARD_RENOVATION: ['#8B5CF6', '#7C3AED'], // Purple gradient cho Renovation
}

export default COLORS;

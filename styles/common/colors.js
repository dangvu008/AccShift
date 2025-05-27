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

  // Màu nền - Unified Background System
  BACKGROUND_LIGHT: '#F8FAFC', // Slate-50 - Sáng và clean
  BACKGROUND_DARK: '#0F0F23', // Darker purple - Đậm hơn để tránh conflict
  BACKGROUND_SECONDARY_LIGHT: '#F1F5F9', // Slate-100
  BACKGROUND_SECONDARY_DARK: '#1A1A2E', // Darker secondary - Đồng bộ hơn

  // Màu nền thẻ - Unified Card System
  CARD_LIGHT: '#FFFFFF', // Trắng tinh khiết
  CARD_DARK: '#16213E', // Solid dark card - Không dùng opacity để tránh chồng màu
  CARD_ELEVATED_LIGHT: '#FFFFFF',
  CARD_ELEVATED_DARK: '#1E3A8A', // Solid elevated dark - Đồng bộ với theme

  // Màu nền thẻ thứ cấp - Consistent Secondary Cards
  SECONDARY_CARD_LIGHT: '#F8FAFC', // Slate-50
  SECONDARY_CARD_DARK: '#0F172A', // Solid secondary dark - Không dùng opacity

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
  GRADIENT_CARD_DARK: ['#16213E', '#1E3A8A'], // Solid dark card gradient - Không dùng opacity

  // Gradient cho background chính - Unified System
  GRADIENT_BACKGROUND_DARK: ['#0F0F23', '#1A1A2E'], // Unified dark background gradient
  GRADIENT_BACKGROUND_LIGHT: ['#F8FAFC', '#F1F5F9'], // Light background gradient

  // Gradient cho các card đặc biệt
  GRADIENT_CARD_WATER: ['#3B82F6', '#1D4ED8'], // Blue gradient cho Water
  GRADIENT_CARD_HEATING: ['#EF4444', '#DC2626'], // Red gradient cho Heating
  GRADIENT_CARD_ELECTRICITY: ['#F59E0B', '#D97706'], // Orange gradient cho Electricity
  GRADIENT_CARD_INTERNET: ['#10B981', '#059669'], // Green gradient cho Internet
  GRADIENT_CARD_RENOVATION: ['#8B5CF6', '#7C3AED'], // Purple gradient cho Renovation
}

export default COLORS;

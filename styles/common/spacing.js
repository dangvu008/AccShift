/**
 * 📐 Enhanced Spacing System for AccShift
 * Comprehensive spacing scale based on 4px base unit for pixel-perfect layouts
 * Provides consistent spacing tokens for all UI elements and layouts
 */

// === BASE SPACING UNIT ===
// Using 4px base unit for more granular control
const BASE_UNIT = 4;

// === SPACING SCALE ===
// Comprehensive spacing scale from micro to macro layouts
export const SPACING = {
  // Micro Spacing (0-8px) - For fine-tuned adjustments
  NONE: 0,                    // 0px - No spacing
  MICRO: BASE_UNIT * 0.5,     // 2px - Hairline spacing
  TINY: BASE_UNIT,            // 4px - Minimal spacing

  // Small Spacing (8-16px) - For component internal spacing
  XXS: BASE_UNIT * 2,         // 8px - Very small spacing
  XS: BASE_UNIT * 3,          // 12px - Small spacing
  SM: BASE_UNIT * 4,          // 16px - Small-medium spacing

  // Medium Spacing (20-32px) - For standard component spacing
  MD: BASE_UNIT * 5,          // 20px - Medium spacing
  LG: BASE_UNIT * 6,          // 24px - Large spacing
  XL: BASE_UNIT * 8,          // 32px - Extra large spacing

  // Large Spacing (40-64px) - For section and layout spacing
  XXL: BASE_UNIT * 10,        // 40px - Very large spacing
  XXXL: BASE_UNIT * 12,       // 48px - Extra extra large spacing
  XXXXL: BASE_UNIT * 16,      // 64px - Maximum standard spacing

  // Macro Spacing (80px+) - For page-level layouts
  HUGE: BASE_UNIT * 20,       // 80px - Huge spacing
  MASSIVE: BASE_UNIT * 24,    // 96px - Massive spacing
  GIGANTIC: BASE_UNIT * 32,   // 128px - Gigantic spacing
};

// === PADDING PRESETS ===
// Semantic padding tokens for consistent component spacing
export const PADDING = {
  // Container Padding - For main layout containers
  CONTAINER: {
    tiny: { horizontal: SPACING.SM, vertical: SPACING.SM },
    small: { horizontal: SPACING.MD, vertical: SPACING.LG },
    medium: { horizontal: SPACING.LG, vertical: SPACING.XL },
    large: { horizontal: SPACING.XL, vertical: SPACING.XXL },
  },

  // Card Padding - For card components
  CARD: {
    tiny: SPACING.XS,           // 12px - Compact cards
    small: SPACING.SM,          // 16px - Small cards
    medium: SPACING.LG,         // 24px - Standard cards
    large: SPACING.XL,          // 32px - Large cards
    xlarge: SPACING.XXL,        // 40px - Extra large cards
  },

  // Button Padding - For interactive elements
  BUTTON: {
    tiny: { horizontal: SPACING.XS, vertical: SPACING.TINY },
    small: { horizontal: SPACING.SM, vertical: SPACING.XXS },
    medium: { horizontal: SPACING.LG, vertical: SPACING.XS },
    large: { horizontal: SPACING.XL, vertical: SPACING.SM },
    xlarge: { horizontal: SPACING.XXL, vertical: SPACING.MD },
  },

  // Input Padding - For form elements
  INPUT: {
    tiny: { horizontal: SPACING.XS, vertical: SPACING.XXS },
    small: { horizontal: SPACING.SM, vertical: SPACING.XS },
    medium: { horizontal: SPACING.MD, vertical: SPACING.SM },
    large: { horizontal: SPACING.LG, vertical: SPACING.MD },
  },

  // Modal Padding - For overlay components
  MODAL: {
    small: { horizontal: SPACING.LG, vertical: SPACING.XL },
    medium: { horizontal: SPACING.XL, vertical: SPACING.XXL },
    large: { horizontal: SPACING.XXL, vertical: SPACING.XXXL },
  },

  // Screen Padding - For screen-level layouts
  SCREEN: {
    horizontal: SPACING.MD,     // 20px - Standard screen padding
    vertical: SPACING.LG,       // 24px - Standard screen padding
    safe: SPACING.SM,           // 16px - Safe area padding
  },

  // Section Padding - For content sections
  SECTION: {
    small: { horizontal: SPACING.MD, vertical: SPACING.LG },
    medium: { horizontal: SPACING.LG, vertical: SPACING.XL },
    large: { horizontal: SPACING.XL, vertical: SPACING.XXL },
  },
};

// === MARGIN PRESETS ===
// Semantic margin tokens for consistent spacing between elements
export const MARGIN = {
  // Element Margins - For spacing between UI elements
  ELEMENT: {
    tiny: SPACING.TINY,         // 4px - Minimal element spacing
    small: SPACING.XXS,         // 8px - Small element spacing
    medium: SPACING.XS,         // 12px - Medium element spacing
    large: SPACING.SM,          // 16px - Large element spacing
    xlarge: SPACING.MD,         // 20px - Extra large element spacing
  },

  // Section Margins - For spacing between content sections
  SECTION: {
    small: SPACING.LG,          // 24px - Small section spacing
    medium: SPACING.XL,         // 32px - Medium section spacing
    large: SPACING.XXL,         // 40px - Large section spacing
    xlarge: SPACING.XXXL,       // 48px - Extra large section spacing
  },

  // Component Margins - For spacing between components
  COMPONENT: {
    between: SPACING.MD,        // 20px - Between related components
    group: SPACING.LG,          // 24px - Between component groups
    section: SPACING.XL,        // 32px - Between major sections
  },

  // List Margins - For list item spacing
  LIST: {
    item: SPACING.XS,           // 12px - Between list items
    group: SPACING.MD,          // 20px - Between list groups
    section: SPACING.LG,        // 24px - Between list sections
  },
};

// === BORDER RADIUS SYSTEM ===
// Comprehensive border radius scale for consistent rounded corners
export const BORDER_RADIUS = {
  NONE: 0,                      // 0px - No rounding
  TINY: BASE_UNIT * 0.5,        // 2px - Minimal rounding
  XS: BASE_UNIT,                // 4px - Extra small rounding
  SM: BASE_UNIT * 1.5,          // 6px - Small rounding
  MD: BASE_UNIT * 2,            // 8px - Medium rounding (default)
  LG: BASE_UNIT * 3,            // 12px - Large rounding
  XL: BASE_UNIT * 4,            // 16px - Extra large rounding
  XXL: BASE_UNIT * 5,           // 20px - Very large rounding
  XXXL: BASE_UNIT * 6,          // 24px - Extra extra large rounding
  HUGE: BASE_UNIT * 8,          // 32px - Huge rounding
  ROUND: 50,                    // 50px - Circular elements
  PILL: 999,                    // 999px - Pill-shaped elements
};

// === SHADOW SYSTEM ===
// Comprehensive shadow system for depth and elevation
export const SHADOWS = {
  // Basic Shadows
  NONE: {
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },

  // Subtle Shadows - For minimal elevation
  SUBTLE: {
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
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

  XXL: {
    elevation: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
  },

  // Colored Shadows - For brand and semantic emphasis
  PRIMARY: {
    elevation: 8,
    shadowColor: '#6B46C1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  SECONDARY: {
    elevation: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  SUCCESS: {
    elevation: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  WARNING: {
    elevation: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  ERROR: {
    elevation: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  INFO: {
    elevation: 8,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
};

// === DIMENSIONS SYSTEM ===
// Comprehensive dimension tokens for consistent sizing
export const DIMENSIONS = {
  // Button Dimensions - For interactive elements
  BUTTON: {
    tiny: { height: 28, minWidth: 60 },
    small: { height: 32, minWidth: 80 },
    medium: { height: 40, minWidth: 100 },
    large: { height: 48, minWidth: 120 },
    xlarge: { height: 56, minWidth: 140 },
    xxlarge: { height: 64, minWidth: 160 },
  },

  // Input Dimensions - For form elements
  INPUT: {
    tiny: { height: 32, minHeight: 28 },
    small: { height: 36, minHeight: 32 },
    medium: { height: 44, minHeight: 40 },
    large: { height: 52, minHeight: 48 },
    xlarge: { height: 60, minHeight: 56 },
  },

  // Card Dimensions - For card components
  CARD: {
    minHeight: 80,
    borderWidth: 1,
    maxWidth: 600,
  },

  // Modal Dimensions - For overlay components
  MODAL: {
    small: { maxWidth: 320, minHeight: 200 },
    medium: { maxWidth: 480, minHeight: 300 },
    large: { maxWidth: 640, minHeight: 400 },
    xlarge: { maxWidth: 800, minHeight: 500 },
  },

  // Icon Dimensions - For iconography
  ICON: {
    tiny: 10,
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
    xxxl: 40,
    huge: 48,
    massive: 64,
  },

  // Avatar Dimensions - For user profile images
  AVATAR: {
    tiny: 20,
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
    xxl: 64,
    xxxl: 80,
    huge: 96,
  },

  // Touch Target Dimensions - For accessibility
  TOUCH_TARGET: {
    minimum: 44,              // Minimum touch target size
    comfortable: 48,          // Comfortable touch target size
    large: 56,               // Large touch target size
  },

  // Layout Dimensions - For layout constraints
  LAYOUT: {
    maxContentWidth: 1200,    // Maximum content width
    sidebarWidth: 280,        // Sidebar width
    headerHeight: 64,         // Header height
    footerHeight: 80,         // Footer height
  },
};

// === Z-INDEX SYSTEM ===
// Comprehensive z-index scale for proper layering
export const Z_INDEX = {
  // Background Layers
  BACKGROUND: -1,             // Background elements
  DEFAULT: 0,                 // Default layer

  // Content Layers
  CONTENT: 1,                 // Main content
  ELEVATED: 10,               // Elevated content

  // Navigation Layers
  HEADER: 100,                // Header/navigation
  SIDEBAR: 150,               // Sidebar navigation

  // Interactive Layers
  DROPDOWN: 200,              // Dropdown menus
  STICKY: 300,                // Sticky elements
  FLOATING: 400,              // Floating action buttons

  // Overlay Layers
  OVERLAY: 500,               // Background overlays
  DRAWER: 600,                // Side drawers
  MODAL: 700,                 // Modal dialogs

  // Feedback Layers
  POPOVER: 800,               // Popovers
  TOOLTIP: 900,               // Tooltips
  TOAST: 1000,                // Toast notifications
  NOTIFICATION: 1100,         // System notifications

  // System Layers
  LOADING: 1200,              // Loading indicators
  DEBUG: 9000,                // Debug overlays
  MAXIMUM: 9999,              // Maximum z-index
};

// === OPACITY SYSTEM ===
// Comprehensive opacity scale for consistent transparency
export const OPACITY = {
  TRANSPARENT: 0,             // 0% - Completely transparent
  SUBTLE: 0.05,               // 5% - Very subtle
  LIGHT: 0.1,                 // 10% - Light transparency
  MEDIUM_LIGHT: 0.2,          // 20% - Medium light
  MEDIUM: 0.4,                // 40% - Medium transparency
  MEDIUM_STRONG: 0.6,         // 60% - Medium strong
  STRONG: 0.8,                // 80% - Strong opacity
  VERY_STRONG: 0.9,           // 90% - Very strong
  OPAQUE: 1,                  // 100% - Completely opaque
};

// === ANIMATION TIMING ===
// Consistent timing for animations and transitions
export const ANIMATION = {
  // Duration Tokens
  DURATION: {
    instant: 0,               // 0ms - Instant
    fast: 150,                // 150ms - Fast transitions
    normal: 250,              // 250ms - Normal transitions
    slow: 350,                // 350ms - Slow transitions
    slower: 500,              // 500ms - Very slow transitions
  },

  // Easing Functions
  EASING: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
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
  ANIMATION,
  BASE_UNIT,
};

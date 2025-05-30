/**
 * 🎨 Enhanced Color System for AccShift
 * Modern, accessible color palette with comprehensive semantic tokens
 * Supports both light and dark themes with optimal contrast ratios
 */

// === PRIMARY BRAND COLORS ===
export const COLORS = {
  // Core Brand Colors - Modern Blue/Teal Theme
  PRIMARY: '#0EA5E9',           // Sky-500 - Main brand color
  PRIMARY_50: '#F0F9FF',        // Lightest blue tint
  PRIMARY_100: '#E0F2FE',       // Very light blue
  PRIMARY_200: '#BAE6FD',       // Light blue
  PRIMARY_300: '#7DD3FC',       // Medium light blue
  PRIMARY_400: '#38BDF8',       // Medium blue
  PRIMARY_500: '#0EA5E9',       // Base blue (main)
  PRIMARY_600: '#0284C7',       // Medium dark blue
  PRIMARY_700: '#0369A1',       // Dark blue
  PRIMARY_800: '#075985',       // Darker blue
  PRIMARY_900: '#0C4A6E',       // Darkest blue

  // Secondary Brand Colors - Teal Accent
  SECONDARY: '#06B6D4',         // Cyan-500 - Secondary brand color
  SECONDARY_50: '#ECFEFF',      // Lightest teal tint
  SECONDARY_100: '#CFFAFE',     // Very light teal
  SECONDARY_200: '#A5F3FC',     // Light teal
  SECONDARY_300: '#67E8F9',     // Medium light teal
  SECONDARY_400: '#22D3EE',     // Medium teal
  SECONDARY_500: '#06B6D4',     // Base teal (main)
  SECONDARY_600: '#0891B2',     // Medium dark teal
  SECONDARY_700: '#0E7490',     // Dark teal
  SECONDARY_800: '#155E75',     // Darker teal
  SECONDARY_900: '#164E63',     // Darkest teal

  // === NEUTRAL COLORS ===
  // Gray Scale - Modern neutral palette
  GRAY_50: '#F8FAFC',           // Lightest gray
  GRAY_100: '#F1F5F9',          // Very light gray
  GRAY_200: '#E2E8F0',          // Light gray
  GRAY_300: '#CBD5E1',          // Medium light gray
  GRAY_400: '#94A3B8',          // Medium gray
  GRAY_500: '#64748B',          // Base gray
  GRAY_600: '#475569',          // Medium dark gray
  GRAY_700: '#334155',          // Dark gray
  GRAY_800: '#1E293B',          // Darker gray
  GRAY_900: '#0F172A',          // Darkest gray

  // === SEMANTIC COLORS ===
  // Success Colors - Green palette
  SUCCESS: '#10B981',           // Emerald-500 - Main success color
  SUCCESS_50: '#ECFDF5',        // Lightest success tint
  SUCCESS_100: '#D1FAE5',       // Very light success
  SUCCESS_200: '#A7F3D0',       // Light success
  SUCCESS_300: '#6EE7B7',       // Medium light success
  SUCCESS_400: '#34D399',       // Medium success
  SUCCESS_500: '#10B981',       // Base success (main)
  SUCCESS_600: '#059669',       // Medium dark success
  SUCCESS_700: '#047857',       // Dark success
  SUCCESS_800: '#065F46',       // Darker success
  SUCCESS_900: '#064E3B',       // Darkest success

  // Warning Colors - Amber palette
  WARNING: '#F59E0B',           // Amber-500 - Main warning color
  WARNING_50: '#FFFBEB',        // Lightest warning tint
  WARNING_100: '#FEF3C7',       // Very light warning
  WARNING_200: '#FDE68A',       // Light warning
  WARNING_300: '#FCD34D',       // Medium light warning
  WARNING_400: '#FBBF24',       // Medium warning
  WARNING_500: '#F59E0B',       // Base warning (main)
  WARNING_600: '#D97706',       // Medium dark warning
  WARNING_700: '#B45309',       // Dark warning
  WARNING_800: '#92400E',       // Darker warning
  WARNING_900: '#78350F',       // Darkest warning

  // Error Colors - Red palette
  ERROR: '#EF4444',             // Red-500 - Main error color
  ERROR_50: '#FEF2F2',          // Lightest error tint
  ERROR_100: '#FEE2E2',         // Very light error
  ERROR_200: '#FECACA',         // Light error
  ERROR_300: '#FCA5A5',         // Medium light error
  ERROR_400: '#F87171',         // Medium error
  ERROR_500: '#EF4444',         // Base error (main)
  ERROR_600: '#DC2626',         // Medium dark error
  ERROR_700: '#B91C1C',         // Dark error
  ERROR_800: '#991B1B',         // Darker error
  ERROR_900: '#7F1D1D',         // Darkest error

  // Info Colors - Blue palette
  INFO: '#3B82F6',              // Blue-500 - Main info color
  INFO_50: '#EFF6FF',           // Lightest info tint
  INFO_100: '#DBEAFE',          // Very light info
  INFO_200: '#BFDBFE',          // Light info
  INFO_300: '#93C5FD',          // Medium light info
  INFO_400: '#60A5FA',          // Medium info
  INFO_500: '#3B82F6',          // Base info (main)
  INFO_600: '#2563EB',          // Medium dark info
  INFO_700: '#1D4ED8',          // Dark info
  INFO_800: '#1E40AF',          // Darker info
  INFO_900: '#1E3A8A',          // Darkest info

  // === BACKGROUND COLORS ===
  // Light Theme Backgrounds
  BACKGROUND_LIGHT: '#FFFFFF',      // Pure white
  BACKGROUND_LIGHT_SECONDARY: '#F8FAFC',  // Slate-50 - Very light gray
  BACKGROUND_LIGHT_TERTIARY: '#F1F5F9',   // Slate-100 - Light gray

  // Dark Theme Backgrounds
  BACKGROUND_DARK: '#0F172A',       // Slate-900 - Very dark
  BACKGROUND_DARK_SECONDARY: '#1E293B',   // Slate-800 - Dark
  BACKGROUND_DARK_TERTIARY: '#334155',    // Slate-700 - Medium dark

  // === SURFACE COLORS ===
  // Card and Surface Colors
  SURFACE_LIGHT: '#FFFFFF',         // White cards in light mode
  SURFACE_LIGHT_ELEVATED: '#FFFFFF', // Elevated cards in light mode
  SURFACE_DARK: '#1E293B',          // Dark cards in dark mode
  SURFACE_DARK_ELEVATED: '#334155', // Elevated cards in dark mode

  // === TEXT COLORS ===
  // Light Theme Text
  TEXT_LIGHT_PRIMARY: '#0F172A',    // Slate-900 - Primary text
  TEXT_LIGHT_SECONDARY: '#475569',  // Slate-600 - Secondary text
  TEXT_LIGHT_TERTIARY: '#64748B',   // Slate-500 - Tertiary text
  TEXT_LIGHT_DISABLED: '#94A3B8',   // Slate-400 - Disabled text

  // Dark Theme Text
  TEXT_DARK_PRIMARY: '#F8FAFC',     // Slate-50 - Primary text
  TEXT_DARK_SECONDARY: '#CBD5E1',   // Slate-300 - Secondary text
  TEXT_DARK_TERTIARY: '#94A3B8',    // Slate-400 - Tertiary text
  TEXT_DARK_DISABLED: '#64748B',    // Slate-500 - Disabled text

  // === BORDER COLORS ===
  // Light Theme Borders
  BORDER_LIGHT: '#E2E8F0',          // Slate-200 - Default border
  BORDER_LIGHT_STRONG: '#CBD5E1',   // Slate-300 - Strong border
  BORDER_LIGHT_SUBTLE: '#F1F5F9',   // Slate-100 - Subtle border

  // Dark Theme Borders
  BORDER_DARK: '#334155',           // Slate-700 - Default border
  BORDER_DARK_STRONG: '#475569',    // Slate-600 - Strong border
  BORDER_DARK_SUBTLE: '#1E293B',    // Slate-800 - Subtle border

  // === UTILITY COLORS ===
  TRANSPARENT: 'transparent',
  WHITE: '#FFFFFF',
  BLACK: '#000000',

  // Overlay Colors
  OVERLAY_LIGHT: 'rgba(0, 0, 0, 0.5)',
  OVERLAY_DARK: 'rgba(0, 0, 0, 0.7)',
  OVERLAY_SUBTLE: 'rgba(0, 0, 0, 0.1)',

  // Shadow Colors
  SHADOW: '#000000',
  SHADOW_LIGHT: 'rgba(0, 0, 0, 0.1)',
  SHADOW_MEDIUM: 'rgba(0, 0, 0, 0.15)',
  SHADOW_HEAVY: 'rgba(0, 0, 0, 0.25)',

  // === GRADIENT COLORS ===
  // Primary Brand Gradients
  GRADIENT_PRIMARY: ['#0EA5E9', '#06B6D4'],           // Blue to Teal gradient
  GRADIENT_PRIMARY_REVERSE: ['#06B6D4', '#0EA5E9'],   // Reverse blue gradient
  GRADIENT_PRIMARY_SUBTLE: ['#F0F9FF', '#E0F2FE'],    // Subtle blue gradient

  // Secondary Brand Gradients
  GRADIENT_SECONDARY: ['#06B6D4', '#22D3EE'],         // Teal gradient
  GRADIENT_SECONDARY_REVERSE: ['#22D3EE', '#06B6D4'], // Reverse teal gradient
  GRADIENT_SECONDARY_SUBTLE: ['#ECFEFF', '#CFFAFE'],  // Subtle teal gradient

  // Semantic Gradients
  GRADIENT_SUCCESS: ['#10B981', '#34D399'],           // Success gradient
  GRADIENT_WARNING: ['#F59E0B', '#FBBF24'],           // Warning gradient
  GRADIENT_ERROR: ['#EF4444', '#F87171'],             // Error gradient
  GRADIENT_INFO: ['#3B82F6', '#60A5FA'],              // Info gradient

  // Background Gradients
  GRADIENT_BACKGROUND_LIGHT: ['#F8FAFC', '#E2E8F0', '#F1F5F9'],     // Light theme background
  GRADIENT_BACKGROUND_DARK: ['#0F172A', '#1E293B', '#334155'],      // Dark theme background

  // Surface Gradients
  GRADIENT_SURFACE_LIGHT: ['#FFFFFF', '#F8FAFC'],     // Light surface gradient
  GRADIENT_SURFACE_DARK: ['#1E293B', '#334155'],      // Dark surface gradient

  // Special Purpose Gradients
  GRADIENT_HERO: ['#0EA5E9', '#06B6D4', '#22D3EE'],   // Hero section gradient
  GRADIENT_CARD_PREMIUM: ['#0284C7', '#0EA5E9'],      // Premium card gradient
  GRADIENT_CARD_FEATURE: ['#0369A1', '#0284C7'],      // Feature card gradient

  // === SEMANTIC COLOR TOKENS ===
  // These provide theme-aware color tokens that automatically adapt to light/dark mode

  // Interactive States
  INTERACTIVE: {
    DEFAULT: '#0EA5E9',           // Primary interactive color
    HOVER: '#0284C7',             // Hover state
    ACTIVE: '#0369A1',            // Active/pressed state
    FOCUS: '#38BDF8',             // Focus state
    DISABLED: '#94A3B8',          // Disabled state
  },

  // Text Semantic Tokens
  TEXT: {
    PRIMARY: '#0F172A',           // Primary text (light mode)
    SECONDARY: '#475569',         // Secondary text (light mode)
    TERTIARY: '#64748B',          // Tertiary text (light mode)
    DISABLED: '#94A3B8',          // Disabled text
    INVERSE: '#FFFFFF',           // Inverse text (on dark backgrounds)
    LINK: '#3B82F6',              // Link text
    LINK_HOVER: '#2563EB',        // Link hover state
    SUCCESS: '#059669',           // Success text
    WARNING: '#D97706',           // Warning text
    ERROR: '#DC2626',             // Error text
    INFO: '#2563EB',              // Info text
  },

  // Border Semantic Tokens
  BORDER: {
    DEFAULT: '#E2E8F0',           // Default border
    STRONG: '#CBD5E1',            // Strong border
    SUBTLE: '#F1F5F9',            // Subtle border
    FOCUS: '#3B82F6',             // Focus border
    ERROR: '#EF4444',             // Error border
    SUCCESS: '#10B981',           // Success border
    WARNING: '#F59E0B',           // Warning border
    INFO: '#3B82F6',              // Info border
  },

  // Background Semantic Tokens
  BACKGROUND: {
    PRIMARY: '#FFFFFF',           // Primary background
    SECONDARY: '#F8FAFC',         // Secondary background
    TERTIARY: '#F1F5F9',          // Tertiary background
    ELEVATED: '#FFFFFF',          // Elevated surface
    OVERLAY: 'rgba(0, 0, 0, 0.5)', // Overlay background
    SUCCESS: '#ECFDF5',           // Success background
    WARNING: '#FFFBEB',           // Warning background
    ERROR: '#FEF2F2',             // Error background
    INFO: '#EFF6FF',              // Info background
  },

  // Surface Semantic Tokens
  SURFACE: {
    DEFAULT: '#FFFFFF',           // Default surface
    ELEVATED: '#FFFFFF',          // Elevated surface
    OVERLAY: 'rgba(255, 255, 255, 0.9)', // Overlay surface
    DISABLED: '#F1F5F9',          // Disabled surface
  },

  // === LEGACY COMPATIBILITY ===
  // Keep old color names for backward compatibility during migration
  PRIMARY_DARK: '#0284C7',
  PRIMARY_LIGHT: '#38BDF8',
  ACCENT: '#06B6D4',
  ACCENT_LIGHT: '#22D3EE',
  ACCENT_DARK: '#0891B2',
  SUCCESS_LIGHT: '#34D399',
  SUCCESS_DARK: '#059669',
  WARNING_LIGHT: '#FBBF24',
  WARNING_DARK: '#D97706',
  ERROR_LIGHT: '#F87171',
  ERROR_DARK: '#DC2626',
  INFO_LIGHT: '#60A5FA',
  INFO_DARK: '#2563EB',
  DISABLED_LIGHT: '#D1D5DB',
  DISABLED_DARK: '#6B7280',
}

export default COLORS;

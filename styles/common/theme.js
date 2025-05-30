import { COLORS } from './colors';
import { TEXT_STYLES, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, LETTER_SPACING } from './typography';
import { SPACING, PADDING, MARGIN, BORDER_RADIUS, SHADOWS, DIMENSIONS, Z_INDEX, OPACITY, ANIMATION } from './spacing';
import { ICON_NAMES, ICON_SIZES } from './icons';

/**
 * 🎨 Enhanced Theme System for AccShift
 * Modern theme system with comprehensive design tokens and semantic color mapping
 * @param {boolean} darkMode - Whether to use dark mode
 * @returns {Object} Complete theme object with all design tokens
 */
export const getTheme = (darkMode) => {
  return {
    // === BACKGROUND COLORS ===
    backgroundColor: darkMode ? COLORS.BACKGROUND_DARK : COLORS.BACKGROUND_LIGHT,
    backgroundSecondaryColor: darkMode ? COLORS.BACKGROUND_DARK_SECONDARY : COLORS.BACKGROUND_LIGHT_SECONDARY,
    backgroundTertiaryColor: darkMode ? COLORS.BACKGROUND_DARK_TERTIARY : COLORS.BACKGROUND_LIGHT_TERTIARY,

    // === SURFACE COLORS ===
    surfaceColor: darkMode ? COLORS.SURFACE_DARK : COLORS.SURFACE_LIGHT,
    surfaceElevatedColor: darkMode ? COLORS.SURFACE_DARK_ELEVATED : COLORS.SURFACE_LIGHT_ELEVATED,
    cardColor: darkMode ? COLORS.SURFACE_DARK : COLORS.SURFACE_LIGHT,
    cardElevatedColor: darkMode ? COLORS.SURFACE_DARK_ELEVATED : COLORS.SURFACE_LIGHT_ELEVATED,

    // === TEXT COLORS ===
    textPrimaryColor: darkMode ? COLORS.TEXT_DARK_PRIMARY : COLORS.TEXT_LIGHT_PRIMARY,
    textSecondaryColor: darkMode ? COLORS.TEXT_DARK_SECONDARY : COLORS.TEXT_LIGHT_SECONDARY,
    textTertiaryColor: darkMode ? COLORS.TEXT_DARK_TERTIARY : COLORS.TEXT_LIGHT_TERTIARY,
    textDisabledColor: darkMode ? COLORS.TEXT_DARK_DISABLED : COLORS.TEXT_LIGHT_DISABLED,
    textInverseColor: darkMode ? COLORS.TEXT_LIGHT_PRIMARY : COLORS.TEXT_DARK_PRIMARY,
    textLinkColor: COLORS.TEXT.LINK,
    textLinkHoverColor: COLORS.TEXT.LINK_HOVER,

    // === BORDER COLORS ===
    borderColor: darkMode ? COLORS.BORDER_DARK : COLORS.BORDER_LIGHT,
    borderStrongColor: darkMode ? COLORS.BORDER_DARK_STRONG : COLORS.BORDER_LIGHT_STRONG,
    borderSubtleColor: darkMode ? COLORS.BORDER_DARK_SUBTLE : COLORS.BORDER_LIGHT_SUBTLE,
    borderFocusColor: COLORS.BORDER.FOCUS,

    // === PRIMARY BRAND COLORS ===
    primaryColor: COLORS.PRIMARY_700,
    primaryHoverColor: COLORS.PRIMARY_800,
    primaryActiveColor: COLORS.PRIMARY_900,
    primarySubtleColor: COLORS.PRIMARY_50,
    primaryMutedColor: COLORS.PRIMARY_100,
    primaryLightColor: COLORS.PRIMARY_500,
    primaryDarkColor: COLORS.PRIMARY_800,

    // === SECONDARY BRAND COLORS ===
    secondaryColor: COLORS.SECONDARY_500,
    secondaryHoverColor: COLORS.SECONDARY_600,
    secondaryActiveColor: COLORS.SECONDARY_700,
    secondarySubtleColor: COLORS.SECONDARY_50,
    secondaryMutedColor: COLORS.SECONDARY_100,
    accentColor: COLORS.SECONDARY_500,
    accentLightColor: COLORS.SECONDARY_400,
    accentDarkColor: COLORS.SECONDARY_600,

    // === SEMANTIC COLORS ===
    // Success Colors
    successColor: COLORS.SUCCESS_500,
    successHoverColor: COLORS.SUCCESS_600,
    successActiveColor: COLORS.SUCCESS_700,
    successSubtleColor: COLORS.SUCCESS_50,
    successMutedColor: COLORS.SUCCESS_100,
    successLightColor: COLORS.SUCCESS_400,
    successDarkColor: COLORS.SUCCESS_600,

    // Warning Colors
    warningColor: COLORS.WARNING_500,
    warningHoverColor: COLORS.WARNING_600,
    warningActiveColor: COLORS.WARNING_700,
    warningSubtleColor: COLORS.WARNING_50,
    warningMutedColor: COLORS.WARNING_100,
    warningLightColor: COLORS.WARNING_400,
    warningDarkColor: COLORS.WARNING_600,

    // Error Colors
    errorColor: COLORS.ERROR_500,
    errorHoverColor: COLORS.ERROR_600,
    errorActiveColor: COLORS.ERROR_700,
    errorSubtleColor: COLORS.ERROR_50,
    errorMutedColor: COLORS.ERROR_100,
    errorLightColor: COLORS.ERROR_400,
    errorDarkColor: COLORS.ERROR_600,

    // Info Colors
    infoColor: COLORS.INFO_500,
    infoHoverColor: COLORS.INFO_600,
    infoActiveColor: COLORS.INFO_700,
    infoSubtleColor: COLORS.INFO_50,
    infoMutedColor: COLORS.INFO_100,
    infoLightColor: COLORS.INFO_400,
    infoDarkColor: COLORS.INFO_600,

    // === UTILITY COLORS ===
    disabledColor: COLORS.GRAY_400,
    transparentColor: COLORS.TRANSPARENT,
    overlayColor: darkMode ? COLORS.OVERLAY_DARK : COLORS.OVERLAY_LIGHT,
    overlaySubtleColor: COLORS.OVERLAY_SUBTLE,
    whiteColor: COLORS.WHITE,
    blackColor: COLORS.BLACK,

    // === NAVIGATION COLORS ===
    headerBackgroundColor: COLORS.PRIMARY_700,
    headerTintColor: COLORS.WHITE,
    headerBorderColor: darkMode ? COLORS.BORDER_DARK : COLORS.BORDER_LIGHT,

    // Tab Bar Colors
    tabBarBackgroundColor: darkMode ? COLORS.SURFACE_DARK_ELEVATED : COLORS.SURFACE_LIGHT_ELEVATED,
    tabBarBorderColor: darkMode ? COLORS.BORDER_DARK : COLORS.BORDER_LIGHT,
    tabBarActiveColor: COLORS.PRIMARY_700,
    tabBarInactiveColor: darkMode ? COLORS.TEXT_DARK_SECONDARY : COLORS.TEXT_LIGHT_SECONDARY,

    // === TYPOGRAPHY SYSTEM ===
    textStyles: TEXT_STYLES,
    fontSizes: FONT_SIZES,
    fontWeights: FONT_WEIGHTS,
    lineHeights: LINE_HEIGHTS,
    letterSpacing: LETTER_SPACING,

    // === SPACING SYSTEM ===
    spacing: SPACING,
    padding: PADDING,
    margin: MARGIN,
    borderRadius: BORDER_RADIUS,

    // === SHADOW SYSTEM ===
    shadows: SHADOWS,
    shadowLight: COLORS.SHADOW_LIGHT,
    shadowMedium: COLORS.SHADOW_MEDIUM,
    shadowHeavy: COLORS.SHADOW_HEAVY,

    // === DIMENSIONS SYSTEM ===
    dimensions: DIMENSIONS,

    // === LAYOUT SYSTEM ===
    zIndex: Z_INDEX,
    opacity: OPACITY,
    animation: ANIMATION,

    // === GRADIENT SYSTEM ===
    // Primary Gradients
    gradientPrimary: COLORS.GRADIENT_PRIMARY,
    gradientPrimaryReverse: COLORS.GRADIENT_PRIMARY_REVERSE,
    gradientPrimarySubtle: COLORS.GRADIENT_PRIMARY_SUBTLE,

    // Secondary Gradients
    gradientSecondary: COLORS.GRADIENT_SECONDARY,
    gradientSecondaryReverse: COLORS.GRADIENT_SECONDARY_REVERSE,
    gradientSecondarySubtle: COLORS.GRADIENT_SECONDARY_SUBTLE,

    // Semantic Gradients
    gradientSuccess: COLORS.GRADIENT_SUCCESS,
    gradientWarning: COLORS.GRADIENT_WARNING,
    gradientError: COLORS.GRADIENT_ERROR,
    gradientInfo: COLORS.GRADIENT_INFO,

    // Background Gradients
    gradientBackground: darkMode ? COLORS.GRADIENT_BACKGROUND_DARK : COLORS.GRADIENT_BACKGROUND_LIGHT,
    gradientSurface: darkMode ? COLORS.GRADIENT_SURFACE_DARK : COLORS.GRADIENT_SURFACE_LIGHT,

    // Pattern and Radial Backgrounds
    patternBackground: darkMode ? COLORS.GRADIENT_BACKGROUND_DARK : COLORS.GRADIENT_BACKGROUND_LIGHT,
    radialBackground: darkMode ? COLORS.GRADIENT_BACKGROUND_DARK : COLORS.GRADIENT_BACKGROUND_LIGHT,

    // Special Purpose Gradients
    gradientHero: COLORS.GRADIENT_HERO,
    gradientCardPremium: COLORS.GRADIENT_CARD_PREMIUM,
    gradientCardFeature: COLORS.GRADIENT_CARD_FEATURE,

    // === ICON SYSTEM ===
    iconNames: ICON_NAMES,
    iconSizes: ICON_SIZES,

    // === LEGACY COMPATIBILITY ===
    // Keep old property names for backward compatibility
    textColor: darkMode ? COLORS.TEXT_DARK_PRIMARY : COLORS.TEXT_LIGHT_PRIMARY,
    subtextColor: darkMode ? COLORS.TEXT_DARK_SECONDARY : COLORS.TEXT_LIGHT_SECONDARY,
    legacyBorderColor: darkMode ? COLORS.BORDER_DARK : COLORS.BORDER_LIGHT,
    primaryGradientStart: COLORS.GRADIENT_PRIMARY[0],
    primaryGradientEnd: COLORS.GRADIENT_PRIMARY[1],
  }
}

// === CONVENIENCE EXPORTS ===
// Re-export all design tokens for easy access
export { COLORS };
export { TEXT_STYLES, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, LETTER_SPACING };
export { SPACING, PADDING, MARGIN, BORDER_RADIUS, SHADOWS, DIMENSIONS, Z_INDEX, OPACITY, ANIMATION };
export { ICON_NAMES, ICON_SIZES };

// === THEME VARIANTS ===
// Pre-configured theme variants for common use cases
export const LIGHT_THEME = getTheme(false);
export const DARK_THEME = getTheme(true);

// === DEFAULT EXPORT ===
export default {
  getTheme,
  LIGHT_THEME,
  DARK_THEME,

  // Design Tokens
  COLORS,
  TEXT_STYLES,
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  LETTER_SPACING,
  SPACING,
  PADDING,
  MARGIN,
  BORDER_RADIUS,
  SHADOWS,
  DIMENSIONS,
  Z_INDEX,
  OPACITY,
  ANIMATION,
  ICON_NAMES,
  ICON_SIZES,
};

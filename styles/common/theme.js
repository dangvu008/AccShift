import { COLORS } from './colors';
import { TEXT_STYLES, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, LETTER_SPACING } from './typography';

/**
 * Lấy theme hiện đại với màu sắc và typography cải thiện dựa trên chế độ sáng/tối
 * @param {boolean} darkMode Chế độ tối
 * @returns {Object} Theme object với màu sắc, typography và effects
 */
export const getTheme = (darkMode) => {
  return {
    // Màu nền chính - Cải thiện với secondary backgrounds
    backgroundColor: darkMode ? COLORS.BACKGROUND_DARK : COLORS.BACKGROUND_LIGHT,
    backgroundSecondaryColor: darkMode ? COLORS.BACKGROUND_SECONDARY_DARK : COLORS.BACKGROUND_SECONDARY_LIGHT,

    // Màu nền thẻ - Thêm elevated cards
    cardColor: darkMode ? COLORS.CARD_DARK : COLORS.CARD_LIGHT,
    cardElevatedColor: darkMode ? COLORS.CARD_ELEVATED_DARK : COLORS.CARD_ELEVATED_LIGHT,
    secondaryCardColor: darkMode ? COLORS.SECONDARY_CARD_DARK : COLORS.SECONDARY_CARD_LIGHT,

    // Màu văn bản - Cải thiện contrast
    textColor: darkMode ? COLORS.TEXT_DARK : COLORS.TEXT_LIGHT,
    subtextColor: darkMode ? COLORS.SUBTEXT_DARK : COLORS.SUBTEXT_LIGHT,

    // Màu đường viền - Thêm accent borders
    borderColor: darkMode ? COLORS.BORDER_DARK : COLORS.BORDER_LIGHT,
    borderAccentColor: darkMode ? COLORS.BORDER_ACCENT_DARK : COLORS.BORDER_ACCENT_LIGHT,

    // Màu chủ đạo - Thêm gradient support
    primaryColor: COLORS.PRIMARY,
    primaryDarkColor: COLORS.PRIMARY_DARK,
    primaryLightColor: COLORS.PRIMARY_LIGHT,
    primaryGradientStart: COLORS.PRIMARY_GRADIENT_START,
    primaryGradientEnd: COLORS.PRIMARY_GRADIENT_END,

    // Màu accent - Mới thêm
    accentColor: COLORS.ACCENT,
    accentLightColor: COLORS.ACCENT_LIGHT,
    accentDarkColor: COLORS.ACCENT_DARK,

    // Màu trạng thái - Thêm light/dark variants
    successColor: COLORS.SUCCESS,
    successLightColor: COLORS.SUCCESS_LIGHT,
    successDarkColor: COLORS.SUCCESS_DARK,

    warningColor: COLORS.WARNING,
    warningLightColor: COLORS.WARNING_LIGHT,
    warningDarkColor: COLORS.WARNING_DARK,

    errorColor: COLORS.ERROR,
    errorLightColor: COLORS.ERROR_LIGHT,
    errorDarkColor: COLORS.ERROR_DARK,

    infoColor: COLORS.INFO,
    infoLightColor: COLORS.INFO_LIGHT,
    infoDarkColor: COLORS.INFO_DARK,

    // Màu khác - Thêm overlay support
    disabledColor: darkMode ? COLORS.DISABLED_DARK : COLORS.DISABLED_LIGHT,
    transparentColor: COLORS.TRANSPARENT,
    overlayColor: darkMode ? COLORS.OVERLAY_DARK : COLORS.OVERLAY_LIGHT,

    // Màu header - Sử dụng gradient
    headerBackgroundColor: COLORS.PRIMARY,
    headerTintColor: COLORS.TEXT_DARK,

    // Màu tab bar - Cải thiện với elevated background
    tabBarBackgroundColor: darkMode ? COLORS.CARD_ELEVATED_DARK : COLORS.CARD_ELEVATED_LIGHT,
    tabBarBorderColor: darkMode ? COLORS.BORDER_DARK : COLORS.BORDER_LIGHT,
    tabBarActiveColor: COLORS.PRIMARY,
    tabBarInactiveColor: darkMode ? COLORS.SUBTEXT_DARK : COLORS.SUBTEXT_LIGHT,

    // Typography - Thêm đầy đủ typography system
    textStyles: TEXT_STYLES,
    fontSizes: FONT_SIZES,
    fontWeights: FONT_WEIGHTS,
    lineHeights: LINE_HEIGHTS,
    letterSpacing: LETTER_SPACING,

    // Shadow effects - Thêm cho depth
    shadowLight: COLORS.SHADOW_LIGHT,
    shadowMedium: COLORS.SHADOW_MEDIUM,
    shadowHeavy: COLORS.SHADOW_HEAVY,

    // Gradient arrays - Analytics App Style
    gradientPrimary: COLORS.GRADIENT_PRIMARY,
    gradientAccent: COLORS.GRADIENT_ACCENT,
    gradientSuccess: COLORS.GRADIENT_SUCCESS,
    gradientCardLight: darkMode ? COLORS.GRADIENT_CARD_DARK : COLORS.GRADIENT_CARD_LIGHT,
    gradientCardDark: COLORS.GRADIENT_CARD_DARK,

    // Background gradients - Unified pattern system
    gradientBackground: darkMode ? COLORS.GRADIENT_BACKGROUND_DARK : COLORS.GRADIENT_BACKGROUND_LIGHT,
    patternBackground: darkMode ? COLORS.PATTERN_BACKGROUND_DARK : COLORS.PATTERN_BACKGROUND_LIGHT,
    radialBackground: darkMode ? COLORS.RADIAL_BACKGROUND_DARK : COLORS.RADIAL_BACKGROUND_LIGHT,

    // Card gradients đặc biệt - Cho các loại card khác nhau
    gradientCardWater: COLORS.GRADIENT_CARD_WATER,
    gradientCardHeating: COLORS.GRADIENT_CARD_HEATING,
    gradientCardElectricity: COLORS.GRADIENT_CARD_ELECTRICITY,
    gradientCardInternet: COLORS.GRADIENT_CARD_INTERNET,
    gradientCardRenovation: COLORS.GRADIENT_CARD_RENOVATION,
  }
}

// Re-export COLORS for convenience
export { COLORS };

export default {
  getTheme,
  COLORS,
  TEXT_STYLES,
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  LETTER_SPACING,
};

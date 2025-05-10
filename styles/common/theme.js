import { COLORS } from './colors';

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
  }
}

export default {
  getTheme,
};

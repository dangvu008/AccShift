import React, { useContext } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';
import BackgroundWrapper from './BackgroundWrapper';
import { COLORS } from '../styles/common/colors';

/**
 * CardWrapper - Component wrapper để đảm bảo tất cả card có background đồng nhất
 * Sử dụng BackgroundWrapper để tạo hình nền thống nhất và shadow effects
 */
const CardWrapper = ({
  children,
  style = {},
  cardStyle = {},
  backgroundType = 'gradient', // 'gradient', 'pattern', 'radial', 'solid'
  customColors = null,
  onPress = null,
  disabled = false,
  elevation = 8,
  borderRadius = 20,
  padding = 20,
  margin = 20,
  marginBottom = 20,
  overlay = false,
  overlayOpacity = 0.05,
  ...props
}) => {
  const { theme, darkMode } = useContext(AppContext);

  // Xác định card colors dựa trên backgroundType
  const getCardColors = () => {
    if (customColors) return customColors;

    switch (backgroundType) {
      case 'pattern':
        return theme.gradientCardLight; // Sử dụng card gradient cho pattern
      case 'radial':
        return theme.gradientCardLight;
      case 'solid':
        return [theme.cardColor, theme.cardColor];
      case 'gradient':
      default:
        return darkMode ? theme.gradientCardDark : theme.gradientCardLight;
    }
  };

  const cardColors = getCardColors();

  // Base card style với shadow effects
  const baseCardStyle = {
    borderRadius,
    marginBottom,
    // Enhanced shadow cho depth
    elevation,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: darkMode ? 0.4 : 0.3,
    shadowRadius: 8,
    overflow: 'hidden', // Để gradient không bị tràn
  };

  // Content style
  const contentStyle = {
    padding,
    borderRadius,
    ...cardStyle,
  };

  // Nếu có onPress, sử dụng TouchableOpacity
  const WrapperComponent = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? {
    onPress,
    disabled,
    activeOpacity: 0.8,
    ...props
  } : props;

  return (
    <WrapperComponent
      style={[baseCardStyle, style]}
      {...wrapperProps}
    >
      <BackgroundWrapper
        backgroundType={backgroundType}
        customColors={cardColors}
        style={contentStyle}
        overlay={overlay}
        overlayOpacity={overlayOpacity}
      >
        {children}
      </BackgroundWrapper>
    </WrapperComponent>
  );
};

export default CardWrapper;

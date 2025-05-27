import React, { useContext } from 'react';
import { View } from 'react-native';
import { AppContext } from '../context/AppContext';
import BackgroundWrapper from './BackgroundWrapper';

/**
 * ViewWrapper - Component wrapper cho các view nhỏ để đảm bảo tính đồng bộ màu nền
 * Sử dụng cho các component nhỏ như header, footer, section, etc.
 */
const ViewWrapper = ({ 
  children, 
  style = {},
  backgroundType = 'solid', // Mặc định solid cho view nhỏ
  customColors = null,
  useThemeBackground = true, // Sử dụng theme background color
  opacity = 1,
  overlay = false,
  overlayOpacity = 0.05,
  ...props 
}) => {
  const { theme, darkMode } = useContext(AppContext);

  // Xác định màu nền cho view nhỏ
  const getViewColors = () => {
    if (customColors) return customColors;
    
    if (!useThemeBackground) {
      return ['transparent', 'transparent'];
    }
    
    switch (backgroundType) {
      case 'pattern':
        return theme.patternBackground;
      case 'radial':
        return theme.radialBackground;
      case 'gradient':
        return theme.gradientBackground;
      case 'card':
        return [theme.cardColor, theme.cardColor];
      case 'secondary':
        return [theme.backgroundSecondaryColor, theme.backgroundSecondaryColor];
      case 'solid':
      default:
        return [theme.backgroundColor, theme.backgroundColor];
    }
  };

  const viewColors = getViewColors();

  // Nếu không sử dụng theme background, render View thông thường
  if (!useThemeBackground && !customColors) {
    return (
      <View style={[{ backgroundColor: 'transparent' }, style]} {...props}>
        {children}
      </View>
    );
  }

  return (
    <BackgroundWrapper
      backgroundType={backgroundType}
      customColors={viewColors}
      style={style}
      opacity={opacity}
      overlay={overlay}
      overlayOpacity={overlayOpacity}
      {...props}
    >
      {children}
    </BackgroundWrapper>
  );
};

export default ViewWrapper;

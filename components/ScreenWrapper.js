import React, { useContext } from 'react';
import { StatusBar } from 'react-native';
import { AppContext } from '../context/AppContext';
import BackgroundWrapper from './BackgroundWrapper';

/**
 * ScreenWrapper - Component wrapper để đảm bảo tất cả screen có background đồng nhất
 * Sử dụng BackgroundWrapper để tạo hình nền thống nhất và status bar phù hợp
 */
const ScreenWrapper = ({
  children,
  style = {},
  backgroundType = 'gradient', // 'gradient', 'pattern', 'radial', 'solid'
  customColors = null,
  statusBarStyle = null,
  overlay = false,
  overlayOpacity = 0.1,
  ...props
}) => {
  const { theme, darkMode } = useContext(AppContext);

  // Xác định màu status bar
  const statusBarStyleToUse = statusBarStyle || (darkMode ? 'light-content' : 'dark-content');

  // Xác định background color cho status bar
  const getStatusBarColor = () => {
    if (customColors) return customColors[0];

    switch (backgroundType) {
      case 'pattern':
        return theme.patternBackground[0];
      case 'radial':
        return theme.radialBackground[0];
      case 'solid':
        return theme.backgroundColor;
      case 'gradient':
      default:
        return theme.gradientBackground[0];
    }
  };

  return (
    <>
      <StatusBar
        barStyle={statusBarStyleToUse}
        backgroundColor={getStatusBarColor()}
        translucent={false}
      />
      <BackgroundWrapper
        backgroundType={backgroundType}
        customColors={customColors}
        style={style}
        overlay={overlay}
        overlayOpacity={overlayOpacity}
        {...props}
      >
        {children}
      </BackgroundWrapper>
    </>
  );
};

export default ScreenWrapper;

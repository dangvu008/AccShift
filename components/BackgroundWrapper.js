import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';
import PatternBackground from './PatternBackground';

/**
 * BackgroundWrapper - Component tạo hình nền thống nhất cho toàn bộ ứng dụng
 * Đảm bảo tính đồng bộ màu sắc từ view nhỏ nhất đến toàn bộ ứng dụng
 */
const BackgroundWrapper = ({
  children,
  style = {},
  backgroundType = 'gradient', // 'gradient', 'pattern', 'radial', 'solid'
  customColors = null,
  opacity = 1,
  overlay = false,
  overlayOpacity = 0.1,
  patternType = 'dots', // 'dots', 'grid', 'waves', 'hexagon'
  patternOpacity = 0.1,
  ...props
}) => {
  const { theme, darkMode } = useContext(AppContext);

  // Xác định loại background và màu sắc
  const getBackgroundColors = () => {
    if (customColors) return customColors;

    switch (backgroundType) {
      case 'pattern':
        return theme.patternBackground;
      case 'radial':
        return theme.radialBackground;
      case 'solid':
        return [theme.backgroundColor, theme.backgroundColor];
      case 'gradient':
      default:
        return theme.gradientBackground;
    }
  };

  const backgroundColors = getBackgroundColors();

  // Xác định gradient direction dựa trên backgroundType
  const getGradientProps = () => {
    switch (backgroundType) {
      case 'pattern':
        return {
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
          locations: [0, 0.3, 0.7, 1], // 4-stop gradient
        };
      case 'radial':
        return {
          start: { x: 0.5, y: 0.5 },
          end: { x: 1, y: 1 },
          locations: [0, 1],
        };
      case 'gradient':
      default:
        return {
          start: { x: 0, y: 0 },
          end: { x: 1, y: 1 },
          locations: backgroundColors.length === 3 ? [0, 0.5, 1] : [0, 1],
        };
    }
  };

  const gradientProps = getGradientProps();

  // Render pattern background
  if (backgroundType === 'pattern') {
    return (
      <PatternBackground
        style={[styles.container, { opacity }, style]}
        patternType={patternType}
        patternOpacity={patternOpacity}
        customColors={backgroundColors}
        gradientOverlay={overlay}
        {...props}
      >
        {children}
      </PatternBackground>
    );
  }

  // Render solid background
  if (backgroundType === 'solid') {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundColor, opacity }, style]} {...props}>
        {overlay && (
          <View style={[styles.overlay, { backgroundColor: darkMode ? 'rgba(0,0,0,' + overlayOpacity + ')' : 'rgba(255,255,255,' + overlayOpacity + ')' }]} />
        )}
        {children}
      </View>
    );
  }

  // Render gradient background
  return (
    <LinearGradient
      colors={backgroundColors}
      style={[styles.container, { opacity }, style]}
      start={gradientProps.start}
      end={gradientProps.end}
      locations={gradientProps.locations}
      {...props}
    >
      {overlay && (
        <View style={[styles.overlay, { backgroundColor: darkMode ? 'rgba(0,0,0,' + overlayOpacity + ')' : 'rgba(255,255,255,' + overlayOpacity + ')' }]} />
      )}
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});

export default BackgroundWrapper;

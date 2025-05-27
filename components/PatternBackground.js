import React, { useContext } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, Pattern, Rect, Circle, Path } from 'react-native-svg';
import { AppContext } from '../context/AppContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * PatternBackground - Component tạo hình nền với pattern đẹp mắt
 * Sử dụng SVG để tạo các pattern geometric hiện đại
 */
const PatternBackground = ({ 
  children, 
  style = {},
  patternType = 'dots', // 'dots', 'grid', 'waves', 'hexagon'
  patternOpacity = 0.1,
  gradientOverlay = true,
  customColors = null,
  ...props 
}) => {
  const { theme, darkMode } = useContext(AppContext);

  // Xác định màu sắc cho pattern
  const getPatternColors = () => {
    if (customColors) return customColors;
    return theme.patternBackground;
  };

  const patternColors = getPatternColors();
  const patternColor = darkMode ? 'rgba(255,255,255,' + patternOpacity + ')' : 'rgba(0,0,0,' + patternOpacity + ')';

  // Render pattern dựa trên type
  const renderPattern = () => {
    switch (patternType) {
      case 'dots':
        return (
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
            <Defs>
              <Pattern
                id="dots"
                patternUnits="userSpaceOnUse"
                width="40"
                height="40"
              >
                <Circle cx="20" cy="20" r="2" fill={patternColor} />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#dots)" />
          </Svg>
        );
      
      case 'grid':
        return (
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
            <Defs>
              <Pattern
                id="grid"
                patternUnits="userSpaceOnUse"
                width="30"
                height="30"
              >
                <Path d="M 30 0 L 0 0 0 30" fill="none" stroke={patternColor} strokeWidth="1"/>
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#grid)" />
          </Svg>
        );
      
      case 'waves':
        return (
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
            <Defs>
              <Pattern
                id="waves"
                patternUnits="userSpaceOnUse"
                width="60"
                height="30"
              >
                <Path 
                  d="M0,15 Q15,0 30,15 T60,15" 
                  fill="none" 
                  stroke={patternColor} 
                  strokeWidth="1"
                />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#waves)" />
          </Svg>
        );
      
      case 'hexagon':
        return (
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFillObject}>
            <Defs>
              <Pattern
                id="hexagon"
                patternUnits="userSpaceOnUse"
                width="50"
                height="43.3"
              >
                <Path 
                  d="M25,2 L37.5,10 L37.5,26 L25,34 L12.5,26 L12.5,10 Z" 
                  fill="none" 
                  stroke={patternColor} 
                  strokeWidth="1"
                />
              </Pattern>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#hexagon)" />
          </Svg>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, style]} {...props}>
      {/* Base gradient background */}
      <LinearGradient
        colors={patternColors}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={patternColors.length === 4 ? [0, 0.3, 0.7, 1] : [0, 0.5, 1]}
      />
      
      {/* Pattern overlay */}
      {renderPattern()}
      
      {/* Optional gradient overlay for depth */}
      {gradientOverlay && (
        <LinearGradient
          colors={[
            'transparent',
            darkMode ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
            'transparent'
          ]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      
      {/* Content */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PatternBackground;

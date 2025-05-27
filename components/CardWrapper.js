import React, { useContext } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';
import { COLORS } from '../styles/common/colors';

/**
 * CardWrapper - Component wrapper để đảm bảo tất cả card có background đồng nhất
 * Tự động áp dụng theme card colors và shadow effects
 */
const CardWrapper = ({ 
  children, 
  style = {},
  cardStyle = {},
  useGradient = false,
  gradientColors = null,
  onPress = null,
  disabled = false,
  elevation = 8,
  borderRadius = 20,
  padding = 20,
  margin = 20,
  marginBottom = 20,
  ...props 
}) => {
  const { theme, darkMode } = useContext(AppContext);

  // Xác định gradient colors
  const gradientColorsToUse = gradientColors || (darkMode ? theme.gradientCardDark : theme.gradientCardLight);
  
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

  if (useGradient) {
    return (
      <WrapperComponent 
        style={[baseCardStyle, style]} 
        {...wrapperProps}
      >
        <LinearGradient
          colors={gradientColorsToUse}
          style={contentStyle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      </WrapperComponent>
    );
  }

  return (
    <WrapperComponent 
      style={[
        baseCardStyle, 
        { backgroundColor: theme.cardColor },
        style
      ]} 
      {...wrapperProps}
    >
      <View style={contentStyle}>
        {children}
      </View>
    </WrapperComponent>
  );
};

export default CardWrapper;

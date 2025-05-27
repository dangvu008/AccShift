import React, { useContext } from 'react';
import { View, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from '../context/AppContext';

/**
 * ScreenWrapper - Component wrapper để đảm bảo tất cả screen có background đồng nhất
 * Tự động áp dụng theme background và status bar phù hợp
 */
const ScreenWrapper = ({ 
  children, 
  style = {}, 
  useGradient = true,
  gradientColors = null,
  statusBarStyle = null 
}) => {
  const { theme, darkMode } = useContext(AppContext);

  // Xác định màu status bar
  const statusBarStyleToUse = statusBarStyle || (darkMode ? 'light-content' : 'dark-content');
  
  // Xác định gradient colors
  const gradientColorsToUse = gradientColors || theme.gradientBackground;

  if (useGradient) {
    return (
      <>
        <StatusBar 
          barStyle={statusBarStyleToUse}
          backgroundColor={gradientColorsToUse[0]}
          translucent={false}
        />
        <LinearGradient
          colors={gradientColorsToUse}
          style={[{ flex: 1 }, style]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      </>
    );
  }

  return (
    <>
      <StatusBar 
        barStyle={statusBarStyleToUse}
        backgroundColor={theme.backgroundColor}
        translucent={false}
      />
      <View style={[{ flex: 1, backgroundColor: theme.backgroundColor }, style]}>
        {children}
      </View>
    </>
  );
};

export default ScreenWrapper;

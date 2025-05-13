// Mock implementation for react-native-safe-area-context
import React from 'react';
import { View } from 'react-native';

// Import TurboModuleRegistry mock
import './turbo-module-registry';

// SafeAreaProvider component
export const SafeAreaProvider = ({ children, style, ...props }) => {
  return (
    <View style={[{ flex: 1 }, style]} {...props}>
      {children}
    </View>
  );
};

// SafeAreaView component
export const SafeAreaView = ({ children, style, ...props }) => {
  return (
    <View style={[{ flex: 1 }, style]} {...props}>
      {children}
    </View>
  );
};

// SafeAreaInsetsContext
export const SafeAreaInsetsContext = React.createContext({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

// SafeAreaConsumer
export const SafeAreaConsumer = SafeAreaInsetsContext.Consumer;

// useSafeAreaInsets hook
export const useSafeAreaInsets = () => {
  return {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };
};

// useSafeAreaFrame hook
export const useSafeAreaFrame = () => {
  return {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
};

// initialWindowMetrics
export const initialWindowMetrics = {
  frame: { x: 0, y: 0, width: 0, height: 0 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

// Default export
export default {
  SafeAreaProvider,
  SafeAreaView,
  SafeAreaInsetsContext,
  SafeAreaConsumer,
  useSafeAreaInsets,
  useSafeAreaFrame,
  initialWindowMetrics,
};

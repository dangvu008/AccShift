// Mock implementation for react-native-reanimated
import React from 'react';
import { View, Text, Animated } from 'react-native';

// Import TurboModuleRegistry mock
import './turbo-module-registry';

// Mock Animated components
const createAnimatedComponent = (Component) => {
  return React.forwardRef((props, ref) => {
    return <Component {...props} ref={ref} />;
  });
};

// Create basic Animated components
const AnimatedView = createAnimatedComponent(View);
const AnimatedText = createAnimatedComponent(Text);

// Mock useSharedValue
const useSharedValue = (initialValue) => {
  const [value, setValue] = React.useState(initialValue);
  return {
    value,
    setValue,
  };
};

// Mock useAnimatedStyle
const useAnimatedStyle = (styleCallback) => {
  return styleCallback();
};

// Mock withTiming
const withTiming = (toValue, config, callback) => {
  if (callback) {
    setTimeout(() => callback(true), 0);
  }
  return toValue;
};

// Mock withSpring
const withSpring = (toValue, config, callback) => {
  if (callback) {
    setTimeout(() => callback(true), 0);
  }
  return toValue;
};

// Mock withDecay
const withDecay = (config, callback) => {
  if (callback) {
    setTimeout(() => callback(true), 0);
  }
  return 0;
};

// Mock useAnimatedGestureHandler
const useAnimatedGestureHandler = (handlers) => {
  return handlers;
};

// Mock interpolate
const interpolate = (value, inputRange, outputRange, extrapolate) => {
  return value;
};

// Mock Easing
const Easing = {
  linear: (t) => t,
  ease: (t) => t,
  quad: (t) => t * t,
  cubic: (t) => t * t * t,
  sin: Math.sin,
  circle: (t) => 1 - Math.sqrt(1 - t * t),
  exp: (t) => Math.exp(t),
  elastic: (t) => 1,
  bounce: (t) => 1,
  back: (t) => t,
  bezier: () => (t) => t,
  in: (easing) => easing,
  out: (easing) => easing,
  inOut: (easing) => easing,
};

// Export all mocked functions and components
export default {
  View: AnimatedView,
  Text: AnimatedText,
  createAnimatedComponent,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDecay,
  useAnimatedGestureHandler,
  interpolate,
  Easing,
};

// Named exports
export {
  AnimatedView as View,
  AnimatedText as Text,
  createAnimatedComponent,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDecay,
  useAnimatedGestureHandler,
  interpolate,
  Easing,
};

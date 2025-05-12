// Mock implementation for PlatformConstants
// This file provides a mock for the PlatformConstants module that's missing

// Check if NativeModules is defined
if (!global.NativeModules) {
  global.NativeModules = {};
}

// Add PlatformConstants to NativeModules
if (!global.NativeModules.PlatformConstants) {
  global.NativeModules.PlatformConstants = {
    // Add common properties that might be accessed
    isTesting: false,
    reactNativeVersion: {
      major: 0,
      minor: 79,
      patch: 0,
    },
    Version: 1,
    Release: "10",
    Model: "Mock Device",
    Manufacturer: "Mock Manufacturer",
    Brand: "Mock Brand",
    forceTouchAvailable: false,
    osVersion: "10.0",
    systemName: "Mock OS",
    interfaceIdiom: "Mock Idiom",
    uiMode: "normal",
    isDarkMode: false,
    isLowRamDevice: false,
    deviceType: "phone",
    // Add any other properties that might be needed
  };
}

// Export the mock module
export default global.NativeModules.PlatformConstants;

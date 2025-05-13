// Mock implementation for TurboModuleRegistry
// This file provides a mock for the TurboModuleRegistry module that's missing

// Đảm bảo global được định nghĩa
if (typeof global === 'undefined') {
  global = window || {};
}

// Đảm bảo NativeModules được định nghĩa
if (!global.NativeModules) {
  global.NativeModules = {};
}

// Đảm bảo PlatformConstants được định nghĩa
if (!global.NativeModules.PlatformConstants) {
  global.NativeModules.PlatformConstants = {
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
  };
}

// Đảm bảo RNCPicker được định nghĩa
if (!global.NativeModules.RNCPicker) {
  global.NativeModules.RNCPicker = {
    getDefaultDisplayMode: () => 'dialog',
    setMode: () => {},
  };
}

// Đảm bảo RNDateTimePicker được định nghĩa
if (!global.NativeModules.RNDateTimePicker) {
  global.NativeModules.RNDateTimePicker = {
    getDefaultDisplayMode: () => 'spinner',
    setMode: () => {},
  };
}

// Tạo mock cho TurboModuleRegistry
const TurboModuleRegistry = {
  get: (name) => {
    console.log(`TurboModuleRegistry.get('${name}')`);
    
    // Trả về các module đã được mock
    switch (name) {
      case 'PlatformConstants':
        return global.NativeModules.PlatformConstants;
      case 'RNCPicker':
        return global.NativeModules.RNCPicker;
      case 'RNDateTimePicker':
        return global.NativeModules.RNDateTimePicker;
      default:
        console.warn(`TurboModuleRegistry.get('${name}') - Module không được tìm thấy`);
        return null;
    }
  },
  
  getEnforcing: (name) => {
    console.log(`TurboModuleRegistry.getEnforcing('${name}')`);
    
    // Trả về các module đã được mock
    switch (name) {
      case 'PlatformConstants':
        return global.NativeModules.PlatformConstants;
      case 'RNCPicker':
        return global.NativeModules.RNCPicker;
      case 'RNDateTimePicker':
        return global.NativeModules.RNDateTimePicker;
      default:
        // Trả về một đối tượng rỗng thay vì ném lỗi
        console.warn(`TurboModuleRegistry.getEnforcing('${name}') - Trả về đối tượng rỗng để tránh lỗi`);
        return {};
    }
  }
};

// Gán mock vào global
global.TurboModuleRegistry = TurboModuleRegistry;

// Export mock
export default TurboModuleRegistry;

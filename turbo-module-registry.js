// Mock implementation for TurboModuleRegistry
// This file provides a mock for the TurboModuleRegistry module that's missing

// Đảm bảo global được định nghĩa
if (typeof global === 'undefined') {
  // eslint-disable-next-line no-global-assign
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

// Đảm bảo UIManager được định nghĩa
if (!global.UIManager) {
  global.UIManager = {
    getViewManagerConfig: () => ({}),
    hasViewManagerConfig: () => false,
    getConstantsForViewManager: () => ({}),
    createView: () => {},
    updateView: () => {},
    dispatchViewManagerCommand: () => {},
    measure: () => {},
    measureInWindow: () => {},
    viewIsDescendantOf: () => {},
    measureLayout: () => {},
    measureLayoutRelativeToParent: () => {},
    setJSResponder: () => {},
    clearJSResponder: () => {},
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
        return {};
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

// Đảm bảo __turboModuleProxy được định nghĩa
if (!global.__turboModuleProxy) {
  global.__turboModuleProxy = (name) => {
    console.log(`__turboModuleProxy('${name}')`);
    return TurboModuleRegistry.getEnforcing(name);
  };
}

// Export mock
export default TurboModuleRegistry;

// PlatformConstants.js
// Mock implementation for PlatformConstants module

// Đảm bảo global được định nghĩa
if (typeof global === 'undefined') {
  global = window || {};
}

// Đảm bảo NativeModules được định nghĩa
if (!global.NativeModules) {
  global.NativeModules = {};
}

// Tạo mock cho PlatformConstants
const PlatformConstants = {
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
  // Thêm các thuộc tính khác nếu cần
};

// Gán mock vào global.NativeModules
global.NativeModules.PlatformConstants = PlatformConstants;

// Export mock
export default PlatformConstants;

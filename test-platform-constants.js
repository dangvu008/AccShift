// Test file for platform-constants.js

// Define global object for Node.js environment
global.global = global;

// Initialize NativeModules if it doesn't exist
if (!global.NativeModules) {
  global.NativeModules = {};
}

// Import platform constants mock
require('./platform-constants');

// Test TurboModuleRegistry
console.log('Testing TurboModuleRegistry...');

// Check if TurboModuleRegistry exists
console.log('TurboModuleRegistry exists:', !!global.TurboModuleRegistry);

// Try to get PlatformConstants using TurboModuleRegistry.get
try {
  const platformConstants = global.TurboModuleRegistry.get('PlatformConstants');
  console.log('PlatformConstants from TurboModuleRegistry.get:', !!platformConstants);
  if (platformConstants) {
    console.log('PlatformConstants properties:', Object.keys(platformConstants));
  }
} catch (error) {
  console.error('Error when using TurboModuleRegistry.get:', error);
}

// Try to get PlatformConstants using TurboModuleRegistry.getEnforcing
try {
  const platformConstants = global.TurboModuleRegistry.getEnforcing('PlatformConstants');
  console.log('PlatformConstants from TurboModuleRegistry.getEnforcing:', !!platformConstants);
  if (platformConstants) {
    console.log('PlatformConstants properties:', Object.keys(platformConstants));
  }
} catch (error) {
  console.error('Error when using TurboModuleRegistry.getEnforcing:', error);
}

// Try to get a non-existent module using TurboModuleRegistry.getEnforcing
try {
  const nonExistentModule = global.TurboModuleRegistry.getEnforcing('NonExistentModule');
  console.log('NonExistentModule from TurboModuleRegistry.getEnforcing:', !!nonExistentModule);
} catch (error) {
  console.log('Expected error when using TurboModuleRegistry.getEnforcing for non-existent module:', error.message);
}

console.log('Test completed.');

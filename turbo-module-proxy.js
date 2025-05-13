// turbo-module-proxy.js
// Mock implementation for __turboModuleProxy

// Import TurboModuleRegistry mock
import TurboModuleRegistry from './turbo-module-registry';

// Đảm bảo global được định nghĩa
if (typeof global === 'undefined') {
  global = window || {};
}

// Tạo mock cho __turboModuleProxy
const turboModuleProxy = (name) => {
  console.log(`__turboModuleProxy('${name}')`);
  return TurboModuleRegistry.getEnforcing(name);
};

// Gán mock vào global
global.__turboModuleProxy = turboModuleProxy;

// Export mock
export default turboModuleProxy;

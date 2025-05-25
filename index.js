// Import TurboModuleRegistry mock first
import './turbo-module-registry'

// Import platform constants mock to fix TurboModuleRegistry errors
import './platform-constants'

import { registerRootComponent } from 'expo'
import App from './App'

// Đăng ký component gốc
registerRootComponent(App)

// Đảm bảo có default export
export default App

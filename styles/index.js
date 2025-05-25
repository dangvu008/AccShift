// Centralized styles export
// This file exports all styles from different modules for easier imports

// Common styles
export { default as colors } from './common/colors'
export { default as theme } from './common/theme'
export { default as typography } from './common/typography'

// Component styles
export { default as manualUpdateModalStyles } from './components/manualUpdateModal'
export { default as multiFunctionButtonStyles } from './components/multiFunctionButton'
export { default as noteFormModalStyles } from './components/noteFormModal'
export { default as weatherWidgetStyles } from './components/weatherWidget'
export { default as workNotesSectionStyles } from './components/workNotesSection'

// Screen styles
export { default as homeScreenStyles } from './screens/homeScreen'
export { default as weatherApiKeysScreenStyles } from './screens/weatherApiKeysScreen'

// Usage example:
// import { colors, homeScreenStyles, multiFunctionButtonStyles } from '../styles'
// instead of multiple imports from different files

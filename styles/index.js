// Centralized styles export
// This file exports all styles from different modules for easier imports

// === DESIGN SYSTEM EXPORTS ===
// Core design tokens
export { COLORS } from './common/colors'
export { default as colors } from './common/colors'
export { getTheme, COLORS as themeColors } from './common/theme'
export { default as theme } from './common/theme'
export {
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  LETTER_SPACING,
  TEXT_STYLES
} from './common/typography'
export { default as typography } from './common/typography'

// Layout and spacing
export {
  SPACING,
  PADDING,
  MARGIN,
  BORDER_RADIUS,
  SHADOWS,
  DIMENSIONS,
  Z_INDEX,
  OPACITY
} from './common/spacing'
export { default as spacing } from './common/spacing'

// Icons
export {
  ICON_NAMES,
  ICON_SIZES,
  ICON_CATEGORIES,
  ICON_GUIDELINES
} from './common/icons'
export { default as icons } from './common/icons'

// === LEGACY COMPONENT STYLES ===
// Component styles
export { default as manualUpdateModalStyles } from './components/manualUpdateModal'
export { default as multiFunctionButtonStyles } from './components/multiFunctionButton'
export { default as noteFormModalStyles } from './components/noteFormModal'
export { default as weatherWidgetStyles } from './components/weatherWidget'
export { default as workNotesSectionStyles } from './components/workNotesSection'

// Screen styles
export { default as homeScreenStyles } from './screens/homeScreen'
export { default as weatherApiKeysScreenStyles } from './screens/weatherApiKeysScreen'

// Usage examples:
// Design System:
// import { COLORS, SPACING, TEXT_STYLES, ICON_NAMES } from '../styles'
// import { getTheme, FONT_SIZES, BORDER_RADIUS } from '../styles'
//
// Legacy:
// import { colors, homeScreenStyles, multiFunctionButtonStyles } from '../styles'

// Centralized components export
// This file exports all components for easier imports

// === DESIGN SYSTEM COMPONENTS ===
// Core UI Components
export { default as Icon } from './Icon'
export {
  default as Button,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
  GradientButton as DSGradientButton,
  SuccessButton,
  WarningButton,
  ErrorButton,
  IconButton,
  FloatingActionButton
} from './Button'
export {
  default as Card,
  DefaultCard,
  ElevatedCard,
  OutlinedCard,
  FilledCard,
  GradientCard,
  GlassCard,
  SuccessCard,
  WarningCard,
  ErrorCard,
  InfoCard,
  InteractiveCard,
  PressableCard,
  ClickableCard,
  AnalyticsCard,
  StatusCard,
  FeatureCard,
  CompactCard,
  FullWidthCard,
  SectionCard,
  ActionCard
} from './Card'
export {
  default as Input,
  DefaultInput,
  OutlinedInput,
  FilledInput,
  UnderlinedInput,
  FloatingInput,
  SearchInput,
  PasswordInput,
  TextArea,
  EmailInput,
  PhoneInput,
  OTPInput,
  CurrencyInput,
  URLInput,
  DateInput,
  TimeInput
} from './Input'
export {
  default as Modal,
  ConfirmationModal,
  SelectionModal
} from './Modal'
export {
  default as Switch,
  BasicSwitch,
  SuccessSwitch,
  WarningSwitch,
  ErrorSwitch,
  SettingSwitch,
  NotificationSwitch,
  SecuritySwitch,
  PrivacySwitch
} from './Switch'
export { default as Dropdown } from './Dropdown'
export {
  default as DatePicker,
  DatePickerInput,
  TimePickerInput,
  DateTimePickerInput
} from './DatePicker'
export {
  useFadeIn,
  useScale,
  useSlide,
  useBounce,
  usePulse,
  FadeInView,
  ScaleInView,
  SlideInView,
  BounceView,
  PulseView,
  StaggeredView,
  createSpringAnimation,
  createTimingAnimation,
  createSequence,
  createParallel,
  createStagger
} from './AnimatedComponents'

// Icon Variants
export {
  NavigationIcon,
  ActionIcon,
  StatusIcon,
  ButtonIcon,
  HeaderIcon,
  TabIcon,
  BadgeIcon,
  LoadingIcon,
  IconGroup
} from './Icon'

// === LEGACY COMPONENTS ===
// Background and Wrapper Components
export { default as BackgroundWrapper } from './BackgroundWrapper'
export { default as PatternBackground } from './PatternBackground'
export { default as ScreenWrapper } from './ScreenWrapper'
export { default as CardWrapper } from './CardWrapper'
export { default as ViewWrapper } from './ViewWrapper'

// UI Components (Legacy)
export { default as GradientButton } from './GradientButton'
export { default as MultiFunctionButton } from './MultiFunctionButton'
export { default as WeatherWidget } from './WeatherWidget'
export { default as WeeklyStatusGrid } from './WeeklyStatusGrid'
export { default as WorkNotesSection } from './WorkNotesSection'

// Modal Components
export { default as ManualUpdateModal } from './ManualUpdateModal'
export { default as NoteFormModal } from './NoteFormModal'
export { default as TimePickerModal } from './TimePickerModal'

// Form Components
export { default as NoteForm } from './NoteForm'

// Settings Components
export { default as ShiftRotationSettings } from './ShiftRotationSettings'

// Usage examples:
// Design System Components:
// import { Button, Card, Input, Icon } from '../components'
// import { PrimaryButton, ElevatedCard, SearchInput } from '../components'
//
// Legacy Components:
// import { ScreenWrapper, CardWrapper, GradientButton } from '../components'

import React, { useState, forwardRef } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import Icon from './Icon';
import { COLORS } from '../styles/common/colors';
import { SPACING, PADDING, BORDER_RADIUS, DIMENSIONS, SHADOWS, ANIMATION } from '../styles/common/spacing';
import { TEXT_STYLES, FONT_SIZES } from '../styles/common/typography';

/**
 * 📝 Enhanced Input Component for AccShift
 * Modern, accessible input component with comprehensive variants and states
 * Supports the new enhanced design system with improved user experience
 *
 * @param {Object} props
 * @param {string} props.label - Label displayed above input
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Input value
 * @param {Function} props.onChangeText - Text change callback
 * @param {string} props.variant - Input variant: 'default', 'outlined', 'filled', 'underlined', 'floating'
 * @param {string} props.size - Input size: 'tiny', 'small', 'medium', 'large', 'xlarge'
 * @param {string} props.state - Input state: 'default', 'error', 'success', 'warning', 'disabled'
 * @param {string} props.leftIcon - Left icon name
 * @param {string} props.rightIcon - Right icon name
 * @param {Function} props.onRightIconPress - Right icon press callback
 * @param {Function} props.onLeftIconPress - Left icon press callback
 * @param {string} props.helperText - Helper text below input
 * @param {string} props.errorText - Error text (overrides helperText when present)
 * @param {string} props.successText - Success text (overrides helperText when present)
 * @param {boolean} props.required - Whether field is required (shows *)
 * @param {boolean} props.optional - Whether field is optional (shows "optional")
 * @param {boolean} props.multiline - Whether input supports multiple lines
 * @param {number} props.numberOfLines - Number of lines for multiline input
 * @param {number} props.maxLength - Maximum character length
 * @param {boolean} props.showCharCount - Whether to show character count
 * @param {boolean} props.fullWidth - Whether input should take full width
 * @param {Object} props.style - Custom container style
 * @param {Object} props.inputStyle - Custom TextInput style
 * @param {Object} props.labelStyle - Custom label style
 * @param {string} props.testID - Test ID for testing
 * @param {string} props.accessibilityLabel - Accessibility label
 * @param {string} props.accessibilityHint - Accessibility hint
 */
const Input = forwardRef(({
  label,
  placeholder,
  value,
  onChangeText,
  variant = 'default',
  size = 'medium',
  state = 'default',
  leftIcon,
  rightIcon,
  onRightIconPress,
  onLeftIconPress,
  helperText,
  errorText,
  successText,
  required = false,
  optional = false,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  showCharCount = false,
  fullWidth = false,
  style,
  inputStyle,
  labelStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  // === SIZE CONFIGURATIONS ===
  // Enhanced size system with comprehensive options
  const sizeConfig = {
    tiny: {
      height: DIMENSIONS.INPUT.tiny.height,
      paddingHorizontal: PADDING.INPUT.tiny.horizontal,
      paddingVertical: PADDING.INPUT.tiny.vertical,
      fontSize: FONT_SIZES.BODY_SMALL,
      iconSize: 'XS',
      borderRadius: BORDER_RADIUS.SM,
    },
    small: {
      height: DIMENSIONS.INPUT.small.height,
      paddingHorizontal: PADDING.INPUT.small.horizontal,
      paddingVertical: PADDING.INPUT.small.vertical,
      fontSize: FONT_SIZES.BODY_SMALL,
      iconSize: 'SM',
      borderRadius: BORDER_RADIUS.SM,
    },
    medium: {
      height: DIMENSIONS.INPUT.medium.height,
      paddingHorizontal: PADDING.INPUT.medium.horizontal,
      paddingVertical: PADDING.INPUT.medium.vertical,
      fontSize: FONT_SIZES.BODY_MEDIUM,
      iconSize: 'MD',
      borderRadius: BORDER_RADIUS.MD,
    },
    large: {
      height: DIMENSIONS.INPUT.large.height,
      paddingHorizontal: PADDING.INPUT.large.horizontal,
      paddingVertical: PADDING.INPUT.large.vertical,
      fontSize: FONT_SIZES.BODY_LARGE,
      iconSize: 'LG',
      borderRadius: BORDER_RADIUS.MD,
    },
    xlarge: {
      height: DIMENSIONS.INPUT.xlarge.height,
      paddingHorizontal: PADDING.INPUT.large.horizontal,
      paddingVertical: PADDING.INPUT.large.vertical,
      fontSize: FONT_SIZES.BODY_LARGE,
      iconSize: 'XL',
      borderRadius: BORDER_RADIUS.LG,
    },
  };

  // === STATE CONFIGURATIONS ===
  // Enhanced state system with comprehensive styling
  const stateConfig = {
    default: {
      borderColor: isFocused ? COLORS.BORDER.FOCUS : COLORS.BORDER_LIGHT,
      borderColorHover: COLORS.BORDER_LIGHT_STRONG,
      backgroundColor: COLORS.BACKGROUND.PRIMARY,
      textColor: COLORS.TEXT_LIGHT_PRIMARY,
      placeholderColor: COLORS.TEXT_LIGHT_TERTIARY,
      iconColor: COLORS.TEXT_LIGHT_SECONDARY,
      labelColor: COLORS.TEXT_LIGHT_SECONDARY,
      helperColor: COLORS.TEXT_LIGHT_TERTIARY,
    },
    error: {
      borderColor: COLORS.ERROR_500,
      borderColorHover: COLORS.ERROR_600,
      backgroundColor: COLORS.ERROR_50,
      textColor: COLORS.TEXT_LIGHT_PRIMARY,
      placeholderColor: COLORS.TEXT_LIGHT_TERTIARY,
      iconColor: COLORS.ERROR_500,
      labelColor: COLORS.ERROR_700,
      helperColor: COLORS.ERROR_600,
    },
    success: {
      borderColor: COLORS.SUCCESS_500,
      borderColorHover: COLORS.SUCCESS_600,
      backgroundColor: COLORS.SUCCESS_50,
      textColor: COLORS.TEXT_LIGHT_PRIMARY,
      placeholderColor: COLORS.TEXT_LIGHT_TERTIARY,
      iconColor: COLORS.SUCCESS_500,
      labelColor: COLORS.SUCCESS_700,
      helperColor: COLORS.SUCCESS_600,
    },
    warning: {
      borderColor: COLORS.WARNING_500,
      borderColorHover: COLORS.WARNING_600,
      backgroundColor: COLORS.WARNING_50,
      textColor: COLORS.TEXT_LIGHT_PRIMARY,
      placeholderColor: COLORS.TEXT_LIGHT_TERTIARY,
      iconColor: COLORS.WARNING_500,
      labelColor: COLORS.WARNING_700,
      helperColor: COLORS.WARNING_600,
    },
    disabled: {
      borderColor: COLORS.GRAY_300,
      borderColorHover: COLORS.GRAY_300,
      backgroundColor: COLORS.GRAY_100,
      textColor: COLORS.TEXT_LIGHT_DISABLED,
      placeholderColor: COLORS.TEXT_LIGHT_DISABLED,
      iconColor: COLORS.TEXT_LIGHT_DISABLED,
      labelColor: COLORS.TEXT_LIGHT_DISABLED,
      helperColor: COLORS.TEXT_LIGHT_DISABLED,
    },
  };

  const currentSize = sizeConfig[size];

  // === VARIANT CONFIGURATIONS ===
  // Enhanced variant system with comprehensive styling options
  const variantConfig = {
    default: {
      borderWidth: 1,
      borderRadius: currentSize.borderRadius,
      shadow: SHADOWS.NONE,
    },
    outlined: {
      borderWidth: 2,
      borderRadius: currentSize.borderRadius,
      shadow: SHADOWS.NONE,
    },
    filled: {
      borderWidth: 0,
      borderRadius: currentSize.borderRadius,
      backgroundColor: COLORS.GRAY_100,
      shadow: SHADOWS.SUBTLE,
    },
    underlined: {
      borderWidth: 0,
      borderBottomWidth: 2,
      borderRadius: 0,
      backgroundColor: 'transparent',
      shadow: SHADOWS.NONE,
    },
    floating: {
      borderWidth: 1,
      borderRadius: currentSize.borderRadius,
      shadow: SHADOWS.SM,
      elevation: 2,
    },
  };

  const currentState = stateConfig[state];
  const currentVariant = variantConfig[variant];

  // === STATE MANAGEMENT ===
  // Determine final state (error overrides others, then success)
  const finalState = errorText ? 'error' : successText ? 'success' : state;
  const finalStateConfig = stateConfig[finalState];
  const isDisabled = state === 'disabled';

  // === CONTAINER STYLE ===
  const containerStyle = {
    width: fullWidth ? '100%' : undefined,
    marginBottom: (helperText || errorText || successText || showCharCount) ? SPACING.SM : 0,
  };

  // === LABEL STYLE ===
  const baseLabelStyle = {
    ...TEXT_STYLES.labelMedium,
    color: finalStateConfig.labelColor,
    marginBottom: SPACING.XS,
  };

  // === INPUT CONTAINER STYLE ===
  const inputContainerStyle = {
    flexDirection: 'row',
    alignItems: multiline ? 'flex-start' : 'center',
    height: multiline ? undefined : currentSize.height,
    paddingHorizontal: currentSize.paddingHorizontal,
    paddingVertical: multiline ? currentSize.paddingVertical : 0,
    borderWidth: currentVariant.borderWidth,
    borderBottomWidth: currentVariant.borderBottomWidth || currentVariant.borderWidth,
    borderRadius: currentVariant.borderRadius,
    borderColor: finalStateConfig.borderColor,
    backgroundColor: currentVariant.backgroundColor || finalStateConfig.backgroundColor,
    // Apply shadow for floating variant
    ...(currentVariant.shadow && currentVariant.shadow),
    // Ensure minimum touch target for accessibility
    minHeight: Math.max(
      multiline ? currentSize.height * numberOfLines : currentSize.height,
      DIMENSIONS.TOUCH_TARGET.minimum
    ),
  };

  // === TEXT INPUT STYLE ===
  const baseInputStyle = {
    flex: 1,
    fontSize: currentSize.fontSize,
    color: finalStateConfig.textColor,
    textAlignVertical: multiline ? 'top' : 'center',
    paddingVertical: multiline ? SPACING.XS : 0,
    marginLeft: leftIcon ? SPACING.XS : 0,
    marginRight: rightIcon ? SPACING.XS : 0,
    // Ensure proper line height for readability
    lineHeight: currentSize.fontSize * 1.4,
  };

  // === HELPER TEXT STYLE ===
  const helperTextStyle = {
    ...TEXT_STYLES.caption,
    color: finalStateConfig.helperColor,
    marginTop: SPACING.XS,
    marginLeft: SPACING.XS,
  };

  // === CHARACTER COUNT STYLE ===
  const charCountStyle = {
    ...TEXT_STYLES.caption,
    color: finalStateConfig.helperColor,
    textAlign: 'right',
    marginTop: SPACING.XS,
    marginRight: SPACING.XS,
  };

  // === HELPER FUNCTIONS ===
  const getDisplayText = () => {
    if (errorText) return errorText;
    if (successText) return successText;
    return helperText;
  };

  const getCurrentCharCount = () => {
    return value ? value.length : 0;
  };

  const isCharLimitExceeded = () => {
    return maxLength && getCurrentCharCount() > maxLength;
  };

  return (
    <View style={[containerStyle, style]} testID={testID}>
      {/* === LABEL SECTION === */}
      {label && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.XS }}>
          <Text style={[baseLabelStyle, labelStyle]}>
            {label}
            {required && <Text style={{ color: COLORS.ERROR_500 }}> *</Text>}
            {optional && <Text style={{ color: finalStateConfig.helperColor }}> (optional)</Text>}
          </Text>
        </View>
      )}

      {/* === INPUT CONTAINER === */}
      <View style={inputContainerStyle}>
        {/* Left Icon */}
        {leftIcon && (
          <TouchableOpacity
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress || isDisabled}
            activeOpacity={0.7}
          >
            <Icon
              name={leftIcon}
              size={currentSize.iconSize}
              color={finalStateConfig.iconColor}
            />
          </TouchableOpacity>
        )}

        {/* TextInput */}
        <TextInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={finalStateConfig.placeholderColor}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          editable={!isDisabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[baseInputStyle, inputStyle]}
          testID={testID ? `${testID}-input` : undefined}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled: isDisabled }}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress || isDisabled}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`${rightIcon} button`}
          >
            <Icon
              name={rightIcon}
              size={currentSize.iconSize}
              color={finalStateConfig.iconColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* === FOOTER SECTION === */}
      {(getDisplayText() || showCharCount) && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
          {/* Helper/Error/Success Text */}
          {getDisplayText() && (
            <Text style={[helperTextStyle, { flex: 1 }]}>
              {getDisplayText()}
            </Text>
          )}

          {/* Character Count */}
          {showCharCount && maxLength && (
            <Text style={[
              charCountStyle,
              isCharLimitExceeded() && { color: COLORS.ERROR_500 }
            ]}>
              {getCurrentCharCount()}/{maxLength}
            </Text>
          )}
        </View>
      )}
    </View>
  );
});

// === PRESET INPUT COMPONENTS ===
// Convenient preset components for common input variants

// Basic Variants
export const DefaultInput = (props) => (
  <Input variant="default" {...props} />
);

export const OutlinedInput = (props) => (
  <Input variant="outlined" {...props} />
);

export const FilledInput = (props) => (
  <Input variant="filled" {...props} />
);

export const UnderlinedInput = (props) => (
  <Input variant="underlined" {...props} />
);

export const FloatingInput = (props) => (
  <Input variant="floating" {...props} />
);

// === SPECIALIZED INPUT COMPONENTS ===

// Search Input
export const SearchInput = (props) => (
  <Input
    leftIcon="SEARCH"
    placeholder="Tìm kiếm..."
    variant="filled"
    {...props}
  />
);

// Password Input with toggle visibility
export const PasswordInput = ({ showPassword, onTogglePassword, ...props }) => (
  <Input
    secureTextEntry={!showPassword}
    rightIcon={showPassword ? "EYE_OFF" : "EYE"}
    onRightIconPress={onTogglePassword}
    accessibilityHint={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
    {...props}
  />
);

// Text Area for multiline input
export const TextArea = (props) => (
  <Input
    multiline={true}
    numberOfLines={4}
    variant="outlined"
    showCharCount={true}
    {...props}
  />
);

// Email Input with validation
export const EmailInput = (props) => (
  <Input
    leftIcon="MAIL"
    keyboardType="email-address"
    autoCapitalize="none"
    autoCorrect={false}
    placeholder="email@example.com"
    {...props}
  />
);

// Phone Input
export const PhoneInput = (props) => (
  <Input
    leftIcon="CALL"
    keyboardType="phone-pad"
    placeholder="Số điện thoại"
    {...props}
  />
);

// === ENHANCED SPECIALIZED INPUTS ===

// OTP Input for verification codes
export const OTPInput = (props) => (
  <Input
    keyboardType="number-pad"
    maxLength={6}
    showCharCount={true}
    textAlign="center"
    variant="outlined"
    size="large"
    {...props}
  />
);

// Currency Input
export const CurrencyInput = (props) => (
  <Input
    leftIcon="CARD"
    keyboardType="numeric"
    placeholder="0"
    {...props}
  />
);

// URL Input
export const URLInput = (props) => (
  <Input
    leftIcon="LINK"
    keyboardType="url"
    autoCapitalize="none"
    autoCorrect={false}
    placeholder="https://example.com"
    {...props}
  />
);

// Date Input (for display purposes)
export const DateInput = (props) => (
  <Input
    leftIcon="CALENDAR"
    editable={false}
    rightIcon="CHEVRON_DOWN"
    {...props}
  />
);

// Time Input (for display purposes)
export const TimeInput = (props) => (
  <Input
    leftIcon="CLOCK"
    editable={false}
    rightIcon="CHEVRON_DOWN"
    {...props}
  />
);

Input.displayName = 'Input';

export default Input;

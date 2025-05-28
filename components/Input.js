import React, { useState, forwardRef } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import Icon from './Icon';
import { COLORS } from '../styles/common/colors';
import { SPACING, PADDING, BORDER_RADIUS, DIMENSIONS } from '../styles/common/spacing';
import { TEXT_STYLES, FONT_SIZES } from '../styles/common/typography';

/**
 * Input component thống nhất với design system
 * Hỗ trợ nhiều variants, states, và accessories
 * 
 * @param {Object} props
 * @param {string} props.label - Label hiển thị phía trên input
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.value - Giá trị input
 * @param {Function} props.onChangeText - Callback khi text thay đổi
 * @param {string} props.variant - Loại input: 'default', 'outlined', 'filled'
 * @param {string} props.size - Kích thước: 'small', 'medium', 'large'
 * @param {string} props.state - Trạng thái: 'default', 'error', 'success', 'disabled'
 * @param {string} props.leftIcon - Icon bên trái
 * @param {string} props.rightIcon - Icon bên phải
 * @param {Function} props.onRightIconPress - Callback khi nhấn right icon
 * @param {string} props.helperText - Text hướng dẫn phía dưới
 * @param {string} props.errorText - Text lỗi (override helperText khi có lỗi)
 * @param {boolean} props.required - Trường bắt buộc (hiển thị *)
 * @param {boolean} props.multiline - Input nhiều dòng
 * @param {number} props.numberOfLines - Số dòng cho multiline
 * @param {Object} props.style - Custom style cho container
 * @param {Object} props.inputStyle - Custom style cho TextInput
 * @param {Object} props.labelStyle - Custom style cho label
 * @param {string} props.testID - Test ID
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
  helperText,
  errorText,
  required = false,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  labelStyle,
  testID,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: {
      height: 36,
      paddingHorizontal: PADDING.INPUT.horizontal - 4,
      paddingVertical: PADDING.INPUT.vertical - 2,
      fontSize: FONT_SIZES.BODY_SMALL,
      iconSize: 'SM',
    },
    medium: {
      height: DIMENSIONS.INPUT.height,
      paddingHorizontal: PADDING.INPUT.horizontal,
      paddingVertical: PADDING.INPUT.vertical,
      fontSize: FONT_SIZES.BODY,
      iconSize: 'MD',
    },
    large: {
      height: 56,
      paddingHorizontal: PADDING.INPUT.horizontal + 4,
      paddingVertical: PADDING.INPUT.vertical + 2,
      fontSize: FONT_SIZES.BODY_LARGE,
      iconSize: 'LG',
    },
  };

  // State configurations
  const stateConfig = {
    default: {
      borderColor: isFocused ? COLORS.BORDER.FOCUS : COLORS.BORDER.DEFAULT,
      backgroundColor: COLORS.COMPONENT.BACKGROUND_PRIMARY,
      textColor: COLORS.TEXT.PRIMARY,
      placeholderColor: COLORS.TEXT.TERTIARY,
      iconColor: COLORS.TEXT.SECONDARY,
    },
    error: {
      borderColor: COLORS.BORDER.ERROR,
      backgroundColor: COLORS.FEEDBACK.ERROR_BG,
      textColor: COLORS.TEXT.PRIMARY,
      placeholderColor: COLORS.TEXT.TERTIARY,
      iconColor: COLORS.ERROR,
    },
    success: {
      borderColor: COLORS.BORDER.SUCCESS,
      backgroundColor: COLORS.FEEDBACK.SUCCESS_BG,
      textColor: COLORS.TEXT.PRIMARY,
      placeholderColor: COLORS.TEXT.TERTIARY,
      iconColor: COLORS.SUCCESS,
    },
    disabled: {
      borderColor: COLORS.BORDER.DEFAULT,
      backgroundColor: COLORS.COMPONENT.BACKGROUND_TERTIARY,
      textColor: COLORS.TEXT.DISABLED,
      placeholderColor: COLORS.TEXT.DISABLED,
      iconColor: COLORS.TEXT.DISABLED,
    },
  };

  // Variant configurations
  const variantConfig = {
    default: {
      borderWidth: 1,
      borderRadius: BORDER_RADIUS.MD,
    },
    outlined: {
      borderWidth: 2,
      borderRadius: BORDER_RADIUS.MD,
    },
    filled: {
      borderWidth: 0,
      borderRadius: BORDER_RADIUS.SM,
      backgroundColor: COLORS.COMPONENT.BACKGROUND_SECONDARY,
    },
  };

  const currentSize = sizeConfig[size];
  const currentState = stateConfig[state];
  const currentVariant = variantConfig[variant];

  // Determine final state (error overrides others)
  const finalState = errorText ? 'error' : state;
  const finalStateConfig = stateConfig[finalState];

  // Container style
  const containerStyle = {
    marginBottom: (helperText || errorText) ? SPACING.SM : 0,
  };

  // Label style
  const baseLabelStyle = {
    ...TEXT_STYLES.bodySmall,
    color: finalStateConfig.textColor,
    marginBottom: SPACING.XS,
  };

  // Input container style
  const inputContainerStyle = {
    flexDirection: 'row',
    alignItems: multiline ? 'flex-start' : 'center',
    height: multiline ? undefined : currentSize.height,
    minHeight: multiline ? currentSize.height * numberOfLines : currentSize.height,
    paddingHorizontal: currentSize.paddingHorizontal,
    paddingVertical: multiline ? currentSize.paddingVertical : 0,
    borderWidth: currentVariant.borderWidth,
    borderRadius: currentVariant.borderRadius,
    borderColor: finalStateConfig.borderColor,
    backgroundColor: currentVariant.backgroundColor || finalStateConfig.backgroundColor,
  };

  // TextInput style
  const baseInputStyle = {
    flex: 1,
    fontSize: currentSize.fontSize,
    color: finalStateConfig.textColor,
    textAlignVertical: multiline ? 'top' : 'center',
    paddingVertical: multiline ? SPACING.XS : 0,
    marginLeft: leftIcon ? SPACING.XS : 0,
    marginRight: rightIcon ? SPACING.XS : 0,
  };

  // Helper text style
  const helperTextStyle = {
    ...TEXT_STYLES.captionSmall,
    color: errorText ? COLORS.ERROR : COLORS.TEXT.SECONDARY,
    marginTop: SPACING.XS,
    marginLeft: SPACING.XS,
  };

  return (
    <View style={[containerStyle, style]} testID={testID}>
      {/* Label */}
      {label && (
        <Text style={[baseLabelStyle, labelStyle]}>
          {label}
          {required && <Text style={{ color: COLORS.ERROR }}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View style={inputContainerStyle}>
        {/* Left Icon */}
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={currentSize.iconSize}
            color={finalStateConfig.iconColor}
          />
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
          editable={state !== 'disabled'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[baseInputStyle, inputStyle]}
          testID={testID ? `${testID}-input` : undefined}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={!onRightIconPress || state === 'disabled'}
            activeOpacity={0.7}
          >
            <Icon
              name={rightIcon}
              size={currentSize.iconSize}
              color={finalStateConfig.iconColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Helper/Error Text */}
      {(helperText || errorText) && (
        <Text style={helperTextStyle}>
          {errorText || helperText}
        </Text>
      )}
    </View>
  );
});

// Preset input components
export const DefaultInput = (props) => (
  <Input variant="default" {...props} />
);

export const OutlinedInput = (props) => (
  <Input variant="outlined" {...props} />
);

export const FilledInput = (props) => (
  <Input variant="filled" {...props} />
);

// Specialized inputs
export const SearchInput = (props) => (
  <Input
    leftIcon="SEARCH"
    placeholder="Tìm kiếm..."
    variant="filled"
    {...props}
  />
);

export const PasswordInput = ({ showPassword, onTogglePassword, ...props }) => (
  <Input
    secureTextEntry={!showPassword}
    rightIcon={showPassword ? "EYE_OFF" : "EYE"}
    onRightIconPress={onTogglePassword}
    {...props}
  />
);

export const TextArea = (props) => (
  <Input
    multiline={true}
    numberOfLines={4}
    {...props}
  />
);

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

export const PhoneInput = (props) => (
  <Input
    leftIcon="CALL"
    keyboardType="phone-pad"
    placeholder="Số điện thoại"
    {...props}
  />
);

Input.displayName = 'Input';

export default Input;

import React from 'react';
import { Switch as RNSwitch, View, Text, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, TEXT_STYLES, BORDER_RADIUS } from '../styles';
import Icon from './Icon';

/**
 * 🔘 Enhanced Switch Component for AccShift
 * Modern, accessible switch component with comprehensive variants and states
 * Supports the new enhanced design system with improved user experience
 * 
 * @param {Object} props
 * @param {boolean} props.value - Switch value
 * @param {Function} props.onValueChange - Value change callback
 * @param {string} props.label - Switch label
 * @param {string} props.description - Switch description
 * @param {string} props.size - Switch size: 'small', 'medium', 'large'
 * @param {string} props.variant - Switch variant: 'default', 'success', 'warning', 'error'
 * @param {boolean} props.disabled - Whether switch is disabled
 * @param {string} props.leftIcon - Left icon name
 * @param {string} props.rightIcon - Right icon name
 * @param {Object} props.style - Custom container style
 * @param {Object} props.switchStyle - Custom switch style
 * @param {string} props.testID - Test ID for testing
 * @param {string} props.accessibilityLabel - Accessibility label
 * @param {string} props.accessibilityHint - Accessibility hint
 */
const Switch = ({
  value = false,
  onValueChange,
  label,
  description,
  size = 'medium',
  variant = 'default',
  disabled = false,
  leftIcon,
  rightIcon,
  style,
  switchStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  // === SIZE CONFIGURATIONS ===
  const sizeConfig = {
    small: {
      switchScale: 0.8,
      iconSize: 'SM',
      labelStyle: TEXT_STYLES.bodySmall,
      descriptionStyle: TEXT_STYLES.caption,
      spacing: SPACING.SM,
    },
    medium: {
      switchScale: 1,
      iconSize: 'MD',
      labelStyle: TEXT_STYLES.bodyMedium,
      descriptionStyle: TEXT_STYLES.bodySmall,
      spacing: SPACING.MD,
    },
    large: {
      switchScale: 1.2,
      iconSize: 'LG',
      labelStyle: TEXT_STYLES.bodyLarge,
      descriptionStyle: TEXT_STYLES.bodyMedium,
      spacing: SPACING.LG,
    },
  };

  // === VARIANT CONFIGURATIONS ===
  const variantConfig = {
    default: {
      trackColorFalse: COLORS.GRAY_300,
      trackColorTrue: COLORS.PRIMARY_500,
      thumbColor: value ? COLORS.WHITE : COLORS.GRAY_100,
      iconColor: COLORS.TEXT_LIGHT_SECONDARY,
    },
    success: {
      trackColorFalse: COLORS.GRAY_300,
      trackColorTrue: COLORS.SUCCESS_500,
      thumbColor: value ? COLORS.WHITE : COLORS.GRAY_100,
      iconColor: COLORS.SUCCESS_600,
    },
    warning: {
      trackColorFalse: COLORS.GRAY_300,
      trackColorTrue: COLORS.WARNING_500,
      thumbColor: value ? COLORS.WHITE : COLORS.GRAY_100,
      iconColor: COLORS.WARNING_600,
    },
    error: {
      trackColorFalse: COLORS.GRAY_300,
      trackColorTrue: COLORS.ERROR_500,
      thumbColor: value ? COLORS.WHITE : COLORS.GRAY_100,
      iconColor: COLORS.ERROR_600,
    },
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  // === CONTAINER STYLE ===
  const containerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    opacity: disabled ? 0.6 : 1,
  };

  // === CONTENT STYLE ===
  const contentStyle = {
    flex: 1,
    marginRight: currentSize.spacing,
  };

  // === SWITCH CONTAINER STYLE ===
  const switchContainerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.SM,
  };

  const handlePress = () => {
    if (!disabled && onValueChange) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      style={[containerStyle, style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={accessibilityHint}
      {...props}
    >
      {/* Left Icon */}
      {leftIcon && (
        <View style={{ marginRight: currentSize.spacing }}>
          <Icon
            name={leftIcon}
            size={currentSize.iconSize}
            color={disabled ? COLORS.TEXT_LIGHT_DISABLED : currentVariant.iconColor}
          />
        </View>
      )}

      {/* Content */}
      <View style={contentStyle}>
        {label && (
          <Text style={[
            currentSize.labelStyle,
            {
              color: disabled ? COLORS.TEXT_LIGHT_DISABLED : COLORS.TEXT_LIGHT_PRIMARY,
              marginBottom: description ? SPACING.TINY : 0,
            }
          ]}>
            {label}
          </Text>
        )}
        
        {description && (
          <Text style={[
            currentSize.descriptionStyle,
            {
              color: disabled ? COLORS.TEXT_LIGHT_DISABLED : COLORS.TEXT_LIGHT_SECONDARY,
            }
          ]}>
            {description}
          </Text>
        )}
      </View>

      {/* Switch Container */}
      <View style={switchContainerStyle}>
        {/* Right Icon */}
        {rightIcon && (
          <Icon
            name={rightIcon}
            size={currentSize.iconSize}
            color={disabled ? COLORS.TEXT_LIGHT_DISABLED : currentVariant.iconColor}
          />
        )}

        {/* Switch */}
        <RNSwitch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{
            false: disabled ? COLORS.GRAY_200 : currentVariant.trackColorFalse,
            true: disabled ? COLORS.GRAY_300 : currentVariant.trackColorTrue,
          }}
          thumbColor={disabled ? COLORS.GRAY_300 : currentVariant.thumbColor}
          style={[
            {
              transform: [{ scale: currentSize.switchScale }],
            },
            switchStyle
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

// === PRESET SWITCH COMPONENTS ===

// Basic Switch
export const BasicSwitch = (props) => (
  <Switch variant="default" {...props} />
);

// Success Switch
export const SuccessSwitch = (props) => (
  <Switch variant="success" {...props} />
);

// Warning Switch
export const WarningSwitch = (props) => (
  <Switch variant="warning" {...props} />
);

// Error Switch
export const ErrorSwitch = (props) => (
  <Switch variant="error" {...props} />
);

// Setting Switch (with icon)
export const SettingSwitch = ({ icon, ...props }) => (
  <Switch leftIcon={icon} size="medium" {...props} />
);

// Notification Switch
export const NotificationSwitch = (props) => (
  <Switch 
    leftIcon="NOTIFICATION" 
    variant="default" 
    {...props} 
  />
);

// Security Switch
export const SecuritySwitch = (props) => (
  <Switch 
    leftIcon="SHIELD" 
    variant="warning" 
    {...props} 
  />
);

// Privacy Switch
export const PrivacySwitch = (props) => (
  <Switch 
    leftIcon="EYE_OFF" 
    variant="default" 
    {...props} 
  />
);

export default Switch;

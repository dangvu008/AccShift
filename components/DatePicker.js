import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, TEXT_STYLES, BORDER_RADIUS } from '../styles';
import Icon from './Icon';
import Modal from './Modal';

/**
 * 📅 Enhanced DatePicker Component for AccShift
 * Modern, accessible date picker component with comprehensive variants and features
 * Supports the new enhanced design system with improved user experience
 * 
 * @param {Object} props
 * @param {Date} props.value - Selected date value
 * @param {Function} props.onChange - Date change callback
 * @param {string} props.mode - Picker mode: 'date', 'time', 'datetime'
 * @param {string} props.label - DatePicker label
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.size - DatePicker size: 'small', 'medium', 'large'
 * @param {string} props.variant - DatePicker variant: 'default', 'outlined', 'filled'
 * @param {string} props.state - DatePicker state: 'default', 'error', 'success', 'disabled'
 * @param {boolean} props.disabled - Whether picker is disabled
 * @param {string} props.leftIcon - Left icon name
 * @param {string} props.helperText - Helper text below picker
 * @param {string} props.errorText - Error text (overrides helperText)
 * @param {Date} props.minimumDate - Minimum selectable date
 * @param {Date} props.maximumDate - Maximum selectable date
 * @param {string} props.dateFormat - Date format string
 * @param {Object} props.style - Custom container style
 * @param {string} props.testID - Test ID for testing
 */
const DatePicker = ({
  value,
  onChange,
  mode = 'date',
  label,
  placeholder,
  size = 'medium',
  variant = 'default',
  state = 'default',
  disabled = false,
  leftIcon,
  helperText,
  errorText,
  minimumDate,
  maximumDate,
  dateFormat,
  style,
  testID,
  ...props
}) => {
  const [showPicker, setShowPicker] = useState(false);

  // === SIZE CONFIGURATIONS ===
  const sizeConfig = {
    small: {
      height: 40,
      paddingHorizontal: SPACING.SM,
      fontSize: TEXT_STYLES.bodySmall.fontSize,
      iconSize: 'SM',
    },
    medium: {
      height: 48,
      paddingHorizontal: SPACING.MD,
      fontSize: TEXT_STYLES.bodyMedium.fontSize,
      iconSize: 'MD',
    },
    large: {
      height: 56,
      paddingHorizontal: SPACING.LG,
      fontSize: TEXT_STYLES.bodyLarge.fontSize,
      iconSize: 'LG',
    },
  };

  // === STATE CONFIGURATIONS ===
  const stateConfig = {
    default: {
      borderColor: COLORS.BORDER_LIGHT,
      backgroundColor: COLORS.SURFACE_LIGHT,
      textColor: COLORS.TEXT_LIGHT_PRIMARY,
      placeholderColor: COLORS.TEXT_LIGHT_TERTIARY,
    },
    error: {
      borderColor: COLORS.ERROR_500,
      backgroundColor: COLORS.ERROR_50,
      textColor: COLORS.TEXT_LIGHT_PRIMARY,
      placeholderColor: COLORS.TEXT_LIGHT_TERTIARY,
    },
    success: {
      borderColor: COLORS.SUCCESS_500,
      backgroundColor: COLORS.SUCCESS_50,
      textColor: COLORS.TEXT_LIGHT_PRIMARY,
      placeholderColor: COLORS.TEXT_LIGHT_TERTIARY,
    },
    disabled: {
      borderColor: COLORS.GRAY_300,
      backgroundColor: COLORS.GRAY_100,
      textColor: COLORS.TEXT_LIGHT_DISABLED,
      placeholderColor: COLORS.TEXT_LIGHT_DISABLED,
    },
  };

  // === VARIANT CONFIGURATIONS ===
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
      borderRadius: BORDER_RADIUS.MD,
      backgroundColor: COLORS.GRAY_100,
    },
  };

  const currentSize = sizeConfig[size];
  const currentState = stateConfig[disabled ? 'disabled' : state];
  const currentVariant = variantConfig[variant];

  // === HELPER FUNCTIONS ===
  const formatDate = (date) => {
    if (!date) return '';
    
    if (dateFormat) {
      // Custom format logic would go here
      return date.toLocaleDateString();
    }

    switch (mode) {
      case 'date':
        return date.toLocaleDateString();
      case 'time':
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      case 'datetime':
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      default:
        return date.toLocaleDateString();
    }
  };

  const getDisplayText = () => {
    if (value) {
      return formatDate(value);
    }
    return placeholder || `Select ${mode}`;
  };

  const getIconName = () => {
    if (leftIcon) return leftIcon;
    switch (mode) {
      case 'date':
        return 'CALENDAR';
      case 'time':
        return 'CLOCK';
      case 'datetime':
        return 'CALENDAR';
      default:
        return 'CALENDAR';
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate && onChange) {
      onChange(selectedDate);
    }
  };

  const handlePress = () => {
    if (!disabled) {
      setShowPicker(true);
    }
  };

  // === CONTAINER STYLE ===
  const containerStyle = {
    marginBottom: (helperText || errorText) ? SPACING.SM : 0,
  };

  // === PICKER BUTTON STYLE ===
  const pickerButtonStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    height: currentSize.height,
    paddingHorizontal: currentSize.paddingHorizontal,
    borderWidth: currentVariant.borderWidth,
    borderRadius: currentVariant.borderRadius,
    borderColor: currentState.borderColor,
    backgroundColor: currentVariant.backgroundColor || currentState.backgroundColor,
    opacity: disabled ? 0.6 : 1,
  };

  // === HELPER TEXT STYLE ===
  const helperTextStyle = {
    ...TEXT_STYLES.caption,
    color: errorText ? COLORS.ERROR_600 : COLORS.TEXT_LIGHT_SECONDARY,
    marginTop: SPACING.XS,
    marginLeft: SPACING.XS,
  };

  return (
    <View style={[containerStyle, style]} testID={testID}>
      {/* Label */}
      {label && (
        <Text style={[
          TEXT_STYLES.labelMedium,
          {
            color: currentState.textColor,
            marginBottom: SPACING.XS,
          }
        ]}>
          {label}
        </Text>
      )}

      {/* Picker Button */}
      <TouchableOpacity
        style={pickerButtonStyle}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        accessibilityState={{ disabled }}
      >
        {/* Icon */}
        <Icon
          name={getIconName()}
          size={currentSize.iconSize}
          color={currentState.textColor}
          style={{ marginRight: SPACING.SM }}
        />

        {/* Display Text */}
        <Text
          style={[
            { fontSize: currentSize.fontSize },
            {
              color: value ? currentState.textColor : currentState.placeholderColor,
              flex: 1,
            }
          ]}
          numberOfLines={1}
        >
          {getDisplayText()}
        </Text>

        {/* Chevron Icon */}
        <Icon
          name="CHEVRON_DOWN"
          size={currentSize.iconSize}
          color={currentState.textColor}
        />
      </TouchableOpacity>

      {/* Helper/Error Text */}
      {(helperText || errorText) && (
        <Text style={helperTextStyle}>
          {errorText || helperText}
        </Text>
      )}

      {/* Date Picker */}
      {showPicker && (
        <>
          {Platform.OS === 'ios' ? (
            <Modal
              visible={showPicker}
              onClose={() => setShowPicker(false)}
              title={`Select ${mode}`}
              size="medium"
            >
              <DateTimePicker
                value={value || new Date()}
                mode={mode}
                display="spinner"
                onChange={handleDateChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                {...props}
              />
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: SPACING.LG,
                gap: SPACING.MD,
              }}>
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  style={{
                    paddingVertical: SPACING.SM,
                    paddingHorizontal: SPACING.MD,
                  }}
                >
                  <Text style={[
                    TEXT_STYLES.bodyMedium,
                    { color: COLORS.TEXT_LIGHT_SECONDARY }
                  ]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => setShowPicker(false)}
                  style={{
                    paddingVertical: SPACING.SM,
                    paddingHorizontal: SPACING.MD,
                    backgroundColor: COLORS.PRIMARY_500,
                    borderRadius: BORDER_RADIUS.MD,
                  }}
                >
                  <Text style={[
                    TEXT_STYLES.bodyMedium,
                    { color: COLORS.WHITE, fontWeight: '600' }
                  ]}>
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={value || new Date()}
              mode={mode}
              display="default"
              onChange={handleDateChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              {...props}
            />
          )}
        </>
      )}
    </View>
  );
};

// === PRESET DATEPICKER COMPONENTS ===

// Date Picker
export const DatePickerInput = (props) => (
  <DatePicker mode="date" {...props} />
);

// Time Picker
export const TimePickerInput = (props) => (
  <DatePicker mode="time" {...props} />
);

// DateTime Picker
export const DateTimePickerInput = (props) => (
  <DatePicker mode="datetime" {...props} />
);

export default DatePicker;

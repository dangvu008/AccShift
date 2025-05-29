import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, SPACING, TEXT_STYLES, BORDER_RADIUS, SHADOWS } from '../styles';
import Icon from './Icon';
import Modal from './Modal';

/**
 * 📋 Enhanced Dropdown Component for AccShift
 * Modern, accessible dropdown component with comprehensive variants and features
 * Supports the new enhanced design system with improved user experience
 * 
 * @param {Object} props
 * @param {Array} props.options - Dropdown options array
 * @param {string|number} props.value - Selected value
 * @param {Function} props.onSelect - Selection callback
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.label - Dropdown label
 * @param {string} props.size - Dropdown size: 'small', 'medium', 'large'
 * @param {string} props.variant - Dropdown variant: 'default', 'outlined', 'filled'
 * @param {string} props.state - Dropdown state: 'default', 'error', 'success', 'disabled'
 * @param {boolean} props.disabled - Whether dropdown is disabled
 * @param {string} props.leftIcon - Left icon name
 * @param {string} props.helperText - Helper text below dropdown
 * @param {string} props.errorText - Error text (overrides helperText)
 * @param {boolean} props.searchable - Whether dropdown is searchable
 * @param {boolean} props.multiSelect - Whether multiple selection is allowed
 * @param {Object} props.style - Custom container style
 * @param {string} props.testID - Test ID for testing
 */
const Dropdown = ({
  options = [],
  value,
  onSelect,
  placeholder = 'Select an option',
  label,
  size = 'medium',
  variant = 'default',
  state = 'default',
  disabled = false,
  leftIcon,
  helperText,
  errorText,
  searchable = false,
  multiSelect = false,
  style,
  testID,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
  const getDisplayText = () => {
    if (multiSelect && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option = options.find(opt => opt.value === value[0]);
        return option ? option.label : placeholder;
      }
      return `${value.length} items selected`;
    }
    
    const selectedOption = options.find(opt => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder;
  };

  const getFilteredOptions = () => {
    if (!searchable || !searchQuery) return options;
    return options.filter(option =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSelect = (optionValue) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue];
      onSelect(newValues);
    } else {
      onSelect(optionValue);
      setIsOpen(false);
    }
  };

  // === CONTAINER STYLE ===
  const containerStyle = {
    marginBottom: (helperText || errorText) ? SPACING.SM : 0,
  };

  // === DROPDOWN BUTTON STYLE ===
  const dropdownButtonStyle = {
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

      {/* Dropdown Button */}
      <TouchableOpacity
        style={dropdownButtonStyle}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        accessibilityState={{ disabled, expanded: isOpen }}
      >
        {/* Left Icon */}
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={currentSize.iconSize}
            color={currentState.textColor}
            style={{ marginRight: SPACING.SM }}
          />
        )}

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

        {/* Dropdown Icon */}
        <Icon
          name={isOpen ? "CHEVRON_UP" : "CHEVRON_DOWN"}
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

      {/* Dropdown Modal */}
      <Modal
        visible={isOpen}
        onClose={() => setIsOpen(false)}
        title={label || 'Select Option'}
        size="medium"
        variant="centered"
      >
        {/* Search Input */}
        {searchable && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: SPACING.MD,
            paddingVertical: SPACING.SM,
            backgroundColor: COLORS.GRAY_50,
            borderRadius: BORDER_RADIUS.MD,
            marginBottom: SPACING.MD,
          }}>
            <Icon
              name="SEARCH"
              size="SM"
              color={COLORS.TEXT_LIGHT_SECONDARY}
              style={{ marginRight: SPACING.SM }}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search options..."
              style={{
                flex: 1,
                fontSize: TEXT_STYLES.bodyMedium.fontSize,
                color: COLORS.TEXT_LIGHT_PRIMARY,
              }}
            />
          </View>
        )}

        {/* Options List */}
        <ScrollView showsVerticalScrollIndicator={false}>
          {getFilteredOptions().map((option, index) => {
            const isSelected = multiSelect
              ? Array.isArray(value) && value.includes(option.value)
              : value === option.value;

            return (
              <TouchableOpacity
                key={option.value || index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingVertical: SPACING.MD,
                  paddingHorizontal: SPACING.LG,
                  borderRadius: BORDER_RADIUS.MD,
                  backgroundColor: isSelected ? COLORS.PRIMARY_50 : 'transparent',
                  marginBottom: SPACING.XS,
                }}
                onPress={() => handleSelect(option.value)}
                activeOpacity={0.7}
              >
                <Text style={[
                  TEXT_STYLES.bodyMedium,
                  {
                    color: isSelected ? COLORS.PRIMARY_700 : COLORS.TEXT_LIGHT_PRIMARY,
                    fontWeight: isSelected ? '600' : '400',
                    flex: 1,
                  }
                ]}>
                  {option.label}
                </Text>

                {isSelected && (
                  <Icon
                    name="CHECK"
                    size="MD"
                    color={COLORS.PRIMARY_600}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Multi-select Actions */}
        {multiSelect && (
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: SPACING.MD,
            paddingTop: SPACING.MD,
            borderTopWidth: 1,
            borderTopColor: COLORS.BORDER_LIGHT,
          }}>
            <TouchableOpacity
              onPress={() => onSelect([])}
              style={{
                paddingVertical: SPACING.SM,
                paddingHorizontal: SPACING.MD,
              }}
            >
              <Text style={[
                TEXT_STYLES.bodyMedium,
                { color: COLORS.TEXT_LIGHT_SECONDARY }
              ]}>
                Clear All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsOpen(false)}
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
        )}
      </Modal>
    </View>
  );
};

export default Dropdown;

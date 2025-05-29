import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';
import { COLORS } from '../styles/common/colors';
import { SPACING, PADDING, BORDER_RADIUS, SHADOWS, DIMENSIONS, ANIMATION } from '../styles/common/spacing';
import { TEXT_STYLES, FONT_WEIGHTS } from '../styles/common/typography';

/**
 * 🔘 Enhanced Button Component for AccShift
 * Modern, accessible button component with comprehensive variants and states
 * Supports the new enhanced design system with improved accessibility
 *
 * @param {Object} props
 * @param {string} props.title - Text displayed on button
 * @param {string} props.variant - Button variant: 'primary', 'secondary', 'outline', 'ghost', 'gradient', 'success', 'warning', 'error', 'info'
 * @param {string} props.size - Button size: 'tiny', 'small', 'medium', 'large', 'xlarge', 'xxlarge'
 * @param {string} props.iconName - Icon name (from Icon component)
 * @param {string} props.iconPosition - Icon position: 'left', 'right', 'only'
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.fullWidth - Whether button should take full width
 * @param {Function} props.onPress - Press callback
 * @param {Function} props.onLongPress - Long press callback
 * @param {Object} props.style - Custom container style
 * @param {Object} props.buttonStyle - Custom button style
 * @param {Object} props.textStyle - Custom text style
 * @param {string} props.testID - Test ID for testing
 * @param {string} props.accessibilityLabel - Accessibility label
 * @param {string} props.accessibilityHint - Accessibility hint
 */
const Button = ({
  title,
  variant = 'primary',
  size = 'medium',
  iconName,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  onLongPress,
  style,
  buttonStyle,
  textStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
  ...props
}) => {
  // === SIZE CONFIGURATIONS ===
  // Enhanced size system with comprehensive options and accessibility
  const sizeConfig = {
    tiny: {
      height: DIMENSIONS.BUTTON.tiny.height,
      minWidth: DIMENSIONS.BUTTON.tiny.minWidth,
      paddingHorizontal: PADDING.BUTTON.tiny.horizontal,
      paddingVertical: PADDING.BUTTON.tiny.vertical,
      textStyle: TEXT_STYLES.buttonTiny,
      iconSize: 'XS',
      borderRadius: BORDER_RADIUS.SM,
      borderWidth: 1,
    },
    small: {
      height: DIMENSIONS.BUTTON.small.height,
      minWidth: DIMENSIONS.BUTTON.small.minWidth,
      paddingHorizontal: PADDING.BUTTON.small.horizontal,
      paddingVertical: PADDING.BUTTON.small.vertical,
      textStyle: TEXT_STYLES.buttonSmall,
      iconSize: 'SM',
      borderRadius: BORDER_RADIUS.MD,
      borderWidth: 1,
    },
    medium: {
      height: DIMENSIONS.BUTTON.medium.height,
      minWidth: DIMENSIONS.BUTTON.medium.minWidth,
      paddingHorizontal: PADDING.BUTTON.medium.horizontal,
      paddingVertical: PADDING.BUTTON.medium.vertical,
      textStyle: TEXT_STYLES.buttonMedium,
      iconSize: 'MD',
      borderRadius: BORDER_RADIUS.MD,
      borderWidth: 1,
    },
    large: {
      height: DIMENSIONS.BUTTON.large.height,
      minWidth: DIMENSIONS.BUTTON.large.minWidth,
      paddingHorizontal: PADDING.BUTTON.large.horizontal,
      paddingVertical: PADDING.BUTTON.large.vertical,
      textStyle: TEXT_STYLES.buttonLarge,
      iconSize: 'LG',
      borderRadius: BORDER_RADIUS.LG,
      borderWidth: 1,
    },
    xlarge: {
      height: DIMENSIONS.BUTTON.xlarge.height,
      minWidth: DIMENSIONS.BUTTON.xlarge.minWidth,
      paddingHorizontal: PADDING.BUTTON.xlarge.horizontal,
      paddingVertical: PADDING.BUTTON.xlarge.vertical,
      textStyle: TEXT_STYLES.buttonLarge,
      iconSize: 'XL',
      borderRadius: BORDER_RADIUS.LG,
      borderWidth: 1,
    },
    xxlarge: {
      height: DIMENSIONS.BUTTON.xxlarge.height,
      minWidth: DIMENSIONS.BUTTON.xxlarge.minWidth,
      paddingHorizontal: PADDING.BUTTON.xlarge.horizontal,
      paddingVertical: PADDING.BUTTON.xlarge.vertical,
      textStyle: { ...TEXT_STYLES.buttonLarge, fontSize: 20 },
      iconSize: 'XXL',
      borderRadius: BORDER_RADIUS.XL,
      borderWidth: 1,
    },
  };

  // === VARIANT CONFIGURATIONS ===
  // Enhanced variant system with comprehensive states and accessibility
  const variantConfig = {
    primary: {
      backgroundColor: COLORS.PRIMARY_700,
      backgroundColorHover: COLORS.PRIMARY_800,
      backgroundColorActive: COLORS.PRIMARY_900,
      textColor: COLORS.WHITE,
      borderColor: 'transparent',
      shadow: SHADOWS.MD,
    },
    secondary: {
      backgroundColor: COLORS.BACKGROUND.PRIMARY,
      backgroundColorHover: COLORS.GRAY_50,
      backgroundColorActive: COLORS.GRAY_100,
      textColor: COLORS.TEXT_LIGHT_PRIMARY,
      borderColor: COLORS.BORDER_LIGHT,
      shadow: SHADOWS.SM,
    },
    outline: {
      backgroundColor: 'transparent',
      backgroundColorHover: COLORS.PRIMARY_50,
      backgroundColorActive: COLORS.PRIMARY_100,
      textColor: COLORS.PRIMARY_700,
      borderColor: COLORS.PRIMARY_700,
      shadow: SHADOWS.NONE,
    },
    ghost: {
      backgroundColor: 'transparent',
      backgroundColorHover: COLORS.PRIMARY_50,
      backgroundColorActive: COLORS.PRIMARY_100,
      textColor: COLORS.PRIMARY_700,
      borderColor: 'transparent',
      shadow: SHADOWS.NONE,
    },
    gradient: {
      gradient: COLORS.GRADIENT_PRIMARY,
      textColor: COLORS.WHITE,
      borderColor: 'transparent',
      shadow: SHADOWS.PRIMARY,
    },
    success: {
      backgroundColor: COLORS.SUCCESS_500,
      backgroundColorHover: COLORS.SUCCESS_600,
      backgroundColorActive: COLORS.SUCCESS_700,
      textColor: COLORS.WHITE,
      borderColor: 'transparent',
      shadow: SHADOWS.SUCCESS,
    },
    warning: {
      backgroundColor: COLORS.WARNING_500,
      backgroundColorHover: COLORS.WARNING_600,
      backgroundColorActive: COLORS.WARNING_700,
      textColor: COLORS.WHITE,
      borderColor: 'transparent',
      shadow: SHADOWS.WARNING,
    },
    error: {
      backgroundColor: COLORS.ERROR_500,
      backgroundColorHover: COLORS.ERROR_600,
      backgroundColorActive: COLORS.ERROR_700,
      textColor: COLORS.WHITE,
      borderColor: 'transparent',
      shadow: SHADOWS.ERROR,
    },
    info: {
      backgroundColor: COLORS.INFO_500,
      backgroundColorHover: COLORS.INFO_600,
      backgroundColorActive: COLORS.INFO_700,
      textColor: COLORS.WHITE,
      borderColor: 'transparent',
      shadow: SHADOWS.INFO,
    },
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  // === STATE MANAGEMENT ===
  const isDisabled = disabled || loading;
  const finalTextColor = isDisabled ? COLORS.TEXT_LIGHT_DISABLED : currentVariant.textColor;
  const finalBackgroundColor = isDisabled ? COLORS.GRAY_300 : currentVariant.backgroundColor;
  const finalBorderColor = isDisabled ? COLORS.BORDER_LIGHT : currentVariant.borderColor;

  // === BASE BUTTON STYLE ===
  const baseButtonStyle = {
    height: currentSize.height,
    minWidth: fullWidth ? '100%' : currentSize.minWidth,
    width: fullWidth ? '100%' : undefined,
    paddingHorizontal: currentSize.paddingHorizontal,
    paddingVertical: currentSize.paddingVertical,
    borderRadius: currentSize.borderRadius,
    borderWidth: finalBorderColor !== 'transparent' ? currentSize.borderWidth : 0,
    borderColor: finalBorderColor,
    backgroundColor: finalBackgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Apply shadow only if not disabled and variant has shadow
    ...(!isDisabled && currentVariant.shadow && currentVariant.shadow),
    // Ensure minimum touch target for accessibility
    minHeight: Math.max(currentSize.height, DIMENSIONS.TOUCH_TARGET.minimum),
  };

  // Text style
  const baseTextStyle = {
    ...currentSize.textStyle,
    color: finalTextColor,
    textAlign: 'center',
  };

  // Render icon
  const renderIcon = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size={currentSize.iconSize === 'SM' ? 'small' : 'large'}
          color={finalTextColor}
          style={{ marginRight: title ? SPACING.XS : 0 }}
        />
      );
    }

    if (iconName && iconPosition !== 'only') {
      return (
        <Icon
          name={iconName}
          size={currentSize.iconSize}
          color={finalTextColor}
          style={{
            marginRight: iconPosition === 'left' && title ? SPACING.XS : 0,
            marginLeft: iconPosition === 'right' && title ? SPACING.XS : 0,
          }}
        />
      );
    }

    if (iconName && iconPosition === 'only') {
      return (
        <Icon
          name={iconName}
          size={currentSize.iconSize}
          color={finalTextColor}
        />
      );
    }

    return null;
  };

  // Render content
  const renderContent = () => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      {iconPosition === 'left' && renderIcon()}
      {title && iconPosition !== 'only' && (
        <Text style={[baseTextStyle, textStyle]} numberOfLines={1}>
          {title}
        </Text>
      )}
      {iconPosition === 'right' && renderIcon()}
      {iconPosition === 'only' && renderIcon()}
    </View>
  );

  // === GRADIENT BUTTON RENDERING ===
  if (variant === 'gradient' && !isDisabled) {
    return (
      <View style={style}>
        <TouchableOpacity
          onPress={onPress}
          onLongPress={onLongPress}
          disabled={isDisabled}
          activeOpacity={0.8}
          testID={testID}
          accessibilityLabel={accessibilityLabel || title}
          accessibilityHint={accessibilityHint}
          accessibilityRole="button"
          accessibilityState={{ disabled: isDisabled }}
          {...props}
        >
          <LinearGradient
            colors={currentVariant.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[baseButtonStyle, buttonStyle]}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  // === REGULAR BUTTON RENDERING ===
  return (
    <View style={style}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[baseButtonStyle, buttonStyle]}
        testID={testID}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        {...props}
      >
        {renderContent()}
      </TouchableOpacity>
    </View>
  );
};

// === PRESET BUTTON COMPONENTS ===
// Convenient preset components for common button variants

// Primary Variants
export const PrimaryButton = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton = (props) => (
  <Button variant="secondary" {...props} />
);

export const OutlineButton = (props) => (
  <Button variant="outline" {...props} />
);

export const GhostButton = (props) => (
  <Button variant="ghost" {...props} />
);

export const GradientButton = (props) => (
  <Button variant="gradient" {...props} />
);

// Semantic Variants
export const SuccessButton = (props) => (
  <Button variant="success" {...props} />
);

export const WarningButton = (props) => (
  <Button variant="warning" {...props} />
);

export const ErrorButton = (props) => (
  <Button variant="error" {...props} />
);

export const InfoButton = (props) => (
  <Button variant="info" {...props} />
);

// === SPECIALIZED BUTTON COMPONENTS ===

// Icon-only buttons
export const IconButton = ({ size = 'medium', ...props }) => (
  <Button iconPosition="only" size={size} {...props} />
);

// Floating Action Button
export const FloatingActionButton = (props) => (
  <Button
    variant="gradient"
    iconPosition="only"
    size="large"
    style={{
      position: 'absolute',
      bottom: SPACING.LG,
      right: SPACING.LG,
      borderRadius: BORDER_RADIUS.ROUND,
      ...SHADOWS.LG,
    }}
    buttonStyle={{
      borderRadius: BORDER_RADIUS.ROUND,
      width: 56,
      height: 56,
    }}
    {...props}
  />
);

// Full Width Button
export const FullWidthButton = (props) => (
  <Button fullWidth {...props} />
);

// Compact Button (for tight spaces)
export const CompactButton = (props) => (
  <Button size="tiny" {...props} />
);

// Large Call-to-Action Button
export const CTAButton = (props) => (
  <Button variant="gradient" size="xlarge" fullWidth {...props} />
);

export default Button;

import React from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from './Icon';
import { COLORS } from '../styles/common/colors';
import { SPACING, PADDING, BORDER_RADIUS, SHADOWS, DIMENSIONS } from '../styles/common/spacing';
import { TEXT_STYLES, FONT_WEIGHTS } from '../styles/common/typography';

/**
 * Button component thống nhất với design system
 * Hỗ trợ nhiều variants, sizes, và states
 * 
 * @param {Object} props
 * @param {string} props.title - Text hiển thị trên button
 * @param {string} props.variant - Loại button: 'primary', 'secondary', 'outline', 'ghost', 'gradient'
 * @param {string} props.size - Kích thước: 'small', 'medium', 'large', 'xlarge'
 * @param {string} props.iconName - Tên icon (từ Icon component)
 * @param {string} props.iconPosition - Vị trí icon: 'left', 'right', 'only'
 * @param {boolean} props.loading - Trạng thái loading
 * @param {boolean} props.disabled - Trạng thái disabled
 * @param {Function} props.onPress - Callback khi nhấn
 * @param {Object} props.style - Custom style cho container
 * @param {Object} props.buttonStyle - Custom style cho button
 * @param {Object} props.textStyle - Custom style cho text
 * @param {string} props.testID - Test ID
 */
const Button = ({
  title,
  variant = 'primary',
  size = 'medium',
  iconName,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  onPress,
  style,
  buttonStyle,
  textStyle,
  testID,
  ...props
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      height: DIMENSIONS.BUTTON.small.height,
      minWidth: DIMENSIONS.BUTTON.small.minWidth,
      paddingHorizontal: PADDING.BUTTON.small.horizontal,
      paddingVertical: PADDING.BUTTON.small.vertical,
      textStyle: TEXT_STYLES.buttonSmall,
      iconSize: 'SM',
      borderRadius: BORDER_RADIUS.SM,
    },
    medium: {
      height: DIMENSIONS.BUTTON.medium.height,
      minWidth: DIMENSIONS.BUTTON.medium.minWidth,
      paddingHorizontal: PADDING.BUTTON.medium.horizontal,
      paddingVertical: PADDING.BUTTON.medium.vertical,
      textStyle: TEXT_STYLES.button,
      iconSize: 'MD',
      borderRadius: BORDER_RADIUS.MD,
    },
    large: {
      height: DIMENSIONS.BUTTON.large.height,
      minWidth: DIMENSIONS.BUTTON.large.minWidth,
      paddingHorizontal: PADDING.BUTTON.large.horizontal,
      paddingVertical: PADDING.BUTTON.large.vertical,
      textStyle: TEXT_STYLES.buttonLarge,
      iconSize: 'LG',
      borderRadius: BORDER_RADIUS.LG,
    },
    xlarge: {
      height: DIMENSIONS.BUTTON.xlarge.height,
      minWidth: DIMENSIONS.BUTTON.xlarge.minWidth,
      paddingHorizontal: PADDING.BUTTON.large.horizontal,
      paddingVertical: PADDING.BUTTON.large.vertical,
      textStyle: { ...TEXT_STYLES.buttonLarge, fontSize: 20 },
      iconSize: 'XL',
      borderRadius: BORDER_RADIUS.LG,
    },
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      backgroundColor: COLORS.INTERACTIVE.DEFAULT,
      textColor: COLORS.TEXT.INVERSE,
      borderColor: 'transparent',
      shadow: SHADOWS.MD,
    },
    secondary: {
      backgroundColor: COLORS.COMPONENT.BACKGROUND_SECONDARY,
      textColor: COLORS.TEXT.PRIMARY,
      borderColor: COLORS.BORDER.DEFAULT,
      shadow: SHADOWS.SM,
    },
    outline: {
      backgroundColor: 'transparent',
      textColor: COLORS.INTERACTIVE.DEFAULT,
      borderColor: COLORS.INTERACTIVE.DEFAULT,
      shadow: SHADOWS.NONE,
    },
    ghost: {
      backgroundColor: 'transparent',
      textColor: COLORS.INTERACTIVE.DEFAULT,
      borderColor: 'transparent',
      shadow: SHADOWS.NONE,
    },
    gradient: {
      gradient: COLORS.GRADIENT_PRIMARY,
      textColor: COLORS.TEXT.INVERSE,
      borderColor: 'transparent',
      shadow: SHADOWS.LG,
    },
    success: {
      backgroundColor: COLORS.SUCCESS,
      textColor: COLORS.TEXT.INVERSE,
      borderColor: 'transparent',
      shadow: SHADOWS.MD,
    },
    warning: {
      backgroundColor: COLORS.WARNING,
      textColor: COLORS.TEXT.INVERSE,
      borderColor: 'transparent',
      shadow: SHADOWS.MD,
    },
    error: {
      backgroundColor: COLORS.ERROR,
      textColor: COLORS.TEXT.INVERSE,
      borderColor: 'transparent',
      shadow: SHADOWS.MD,
    },
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  // Disabled state overrides
  const isDisabled = disabled || loading;
  const finalTextColor = isDisabled ? COLORS.TEXT.DISABLED : currentVariant.textColor;
  const finalBackgroundColor = isDisabled ? COLORS.INTERACTIVE.DISABLED : currentVariant.backgroundColor;

  // Base button style
  const baseButtonStyle = {
    height: currentSize.height,
    minWidth: currentSize.minWidth,
    paddingHorizontal: currentSize.paddingHorizontal,
    paddingVertical: currentSize.paddingVertical,
    borderRadius: currentSize.borderRadius,
    borderWidth: currentVariant.borderColor !== 'transparent' ? 1 : 0,
    borderColor: isDisabled ? COLORS.BORDER.DEFAULT : currentVariant.borderColor,
    backgroundColor: finalBackgroundColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...(!isDisabled && currentVariant.shadow),
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

  // Gradient button
  if (variant === 'gradient' && !isDisabled) {
    return (
      <View style={style}>
        <TouchableOpacity
          onPress={onPress}
          disabled={isDisabled}
          activeOpacity={0.8}
          testID={testID}
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

  // Regular button
  return (
    <View style={style}>
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[baseButtonStyle, buttonStyle]}
        testID={testID}
        {...props}
      >
        {renderContent()}
      </TouchableOpacity>
    </View>
  );
};

// Preset button components
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

export const SuccessButton = (props) => (
  <Button variant="success" {...props} />
);

export const WarningButton = (props) => (
  <Button variant="warning" {...props} />
);

export const ErrorButton = (props) => (
  <Button variant="error" {...props} />
);

// Icon-only buttons
export const IconButton = ({ size = 'medium', ...props }) => (
  <Button iconPosition="only" size={size} {...props} />
);

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

export default Button;

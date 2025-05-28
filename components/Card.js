import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../styles/common/colors';
import { SPACING, PADDING, BORDER_RADIUS, SHADOWS, DIMENSIONS } from '../styles/common/spacing';

/**
 * Card component thống nhất với design system
 * Hỗ trợ nhiều variants, sizes, và interactive states
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Nội dung card
 * @param {string} props.variant - Loại card: 'default', 'elevated', 'outlined', 'gradient', 'glass'
 * @param {string} props.size - Kích thước padding: 'small', 'medium', 'large'
 * @param {boolean} props.interactive - Card có thể tương tác (TouchableOpacity)
 * @param {Function} props.onPress - Callback khi nhấn (chỉ khi interactive=true)
 * @param {boolean} props.disabled - Trạng thái disabled
 * @param {Array} props.gradientColors - Màu gradient (cho variant='gradient')
 * @param {Object} props.style - Custom style cho container
 * @param {Object} props.contentStyle - Custom style cho content area
 * @param {string} props.testID - Test ID
 * @param {boolean} props.darkMode - Chế độ tối (override theme)
 */
const Card = ({
  children,
  variant = 'default',
  size = 'medium',
  interactive = false,
  onPress,
  disabled = false,
  gradientColors,
  style,
  contentStyle,
  testID,
  darkMode = false,
  ...props
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      padding: PADDING.CARD.small,
      borderRadius: BORDER_RADIUS.SM,
    },
    medium: {
      padding: PADDING.CARD.medium,
      borderRadius: BORDER_RADIUS.MD,
    },
    large: {
      padding: PADDING.CARD.large,
      borderRadius: BORDER_RADIUS.LG,
    },
  };

  // Variant configurations
  const variantConfig = {
    default: {
      backgroundColor: darkMode ? COLORS.CARD_DARK : COLORS.CARD_LIGHT,
      borderColor: 'transparent',
      borderWidth: 0,
      shadow: SHADOWS.SM,
    },
    elevated: {
      backgroundColor: darkMode ? COLORS.CARD_ELEVATED_DARK : COLORS.CARD_ELEVATED_LIGHT,
      borderColor: 'transparent',
      borderWidth: 0,
      shadow: SHADOWS.MD,
    },
    outlined: {
      backgroundColor: darkMode ? COLORS.CARD_DARK : COLORS.CARD_LIGHT,
      borderColor: darkMode ? COLORS.BORDER_DARK : COLORS.BORDER_LIGHT,
      borderWidth: 1,
      shadow: SHADOWS.NONE,
    },
    gradient: {
      gradient: gradientColors || (darkMode ? COLORS.GRADIENT_CARD_DARK : COLORS.GRADIENT_CARD_LIGHT),
      borderColor: 'transparent',
      borderWidth: 0,
      shadow: SHADOWS.LG,
    },
    glass: {
      backgroundColor: darkMode 
        ? 'rgba(255, 255, 255, 0.1)' 
        : 'rgba(255, 255, 255, 0.8)',
      borderColor: darkMode 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'rgba(255, 255, 255, 0.3)',
      borderWidth: 1,
      shadow: SHADOWS.MD,
      backdropFilter: 'blur(10px)', // Note: Not supported in React Native, but kept for web
    },
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  // Base card style
  const baseCardStyle = {
    minHeight: DIMENSIONS.CARD.minHeight,
    borderRadius: currentSize.borderRadius,
    borderWidth: currentVariant.borderWidth,
    borderColor: currentVariant.borderColor,
    backgroundColor: currentVariant.backgroundColor,
    ...(!disabled && currentVariant.shadow),
    opacity: disabled ? 0.6 : 1,
  };

  // Content style
  const baseContentStyle = {
    padding: currentSize.padding,
    flex: 1,
  };

  // Render content
  const renderContent = () => (
    <View style={[baseContentStyle, contentStyle]}>
      {children}
    </View>
  );

  // Interactive card với TouchableOpacity
  if (interactive && onPress) {
    // Gradient interactive card
    if (variant === 'gradient') {
      return (
        <TouchableOpacity
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.8}
          style={style}
          testID={testID}
          {...props}
        >
          <LinearGradient
            colors={currentVariant.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[baseCardStyle, { backgroundColor: 'transparent' }]}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    // Regular interactive card
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[baseCardStyle, style]}
        testID={testID}
        {...props}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // Non-interactive card
  // Gradient non-interactive card
  if (variant === 'gradient') {
    return (
      <View style={style} testID={testID} {...props}>
        <LinearGradient
          colors={currentVariant.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[baseCardStyle, { backgroundColor: 'transparent' }]}
        >
          {renderContent()}
        </LinearGradient>
      </View>
    );
  }

  // Regular non-interactive card
  return (
    <View
      style={[baseCardStyle, style]}
      testID={testID}
      {...props}
    >
      {renderContent()}
    </View>
  );
};

// Preset card components
export const DefaultCard = (props) => (
  <Card variant="default" {...props} />
);

export const ElevatedCard = (props) => (
  <Card variant="elevated" {...props} />
);

export const OutlinedCard = (props) => (
  <Card variant="outlined" {...props} />
);

export const GradientCard = (props) => (
  <Card variant="gradient" {...props} />
);

export const GlassCard = (props) => (
  <Card variant="glass" {...props} />
);

// Interactive card presets
export const InteractiveCard = (props) => (
  <Card interactive={true} {...props} />
);

export const PressableCard = (props) => (
  <Card variant="elevated" interactive={true} {...props} />
);

// Specialized cards
export const AnalyticsCard = ({ gradientColors = COLORS.GRADIENT_PRIMARY, ...props }) => (
  <Card
    variant="gradient"
    size="large"
    gradientColors={gradientColors}
    {...props}
  />
);

export const StatusCard = ({ status = 'info', ...props }) => {
  const statusGradients = {
    success: COLORS.GRADIENT_SUCCESS,
    warning: [COLORS.WARNING_LIGHT, COLORS.WARNING],
    error: [COLORS.ERROR_LIGHT, COLORS.ERROR],
    info: [COLORS.INFO_LIGHT, COLORS.INFO],
  };

  return (
    <Card
      variant="gradient"
      gradientColors={statusGradients[status]}
      {...props}
    />
  );
};

// Card with header and footer sections
export const SectionCard = ({ 
  header, 
  footer, 
  children, 
  headerStyle,
  footerStyle,
  ...cardProps 
}) => {
  return (
    <Card {...cardProps} contentStyle={{ padding: 0 }}>
      {header && (
        <View style={[
          { 
            padding: PADDING.CARD.medium,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.BORDER.SUBTLE,
          },
          headerStyle
        ]}>
          {header}
        </View>
      )}
      
      <View style={{ padding: PADDING.CARD.medium, flex: 1 }}>
        {children}
      </View>
      
      {footer && (
        <View style={[
          { 
            padding: PADDING.CARD.medium,
            borderTopWidth: 1,
            borderTopColor: COLORS.BORDER.SUBTLE,
          },
          footerStyle
        ]}>
          {footer}
        </View>
      )}
    </Card>
  );
};

export default Card;

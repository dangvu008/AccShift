import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../styles/common/colors';
import { SPACING, PADDING, BORDER_RADIUS, SHADOWS, DIMENSIONS, ANIMATION, OPACITY } from '../styles/common/spacing';

/**
 * 🃏 Enhanced Card Component for AccShift
 * Modern, flexible card component with comprehensive variants and accessibility
 * Supports the new enhanced design system with improved visual hierarchy
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.variant - Card variant: 'default', 'elevated', 'outlined', 'filled', 'gradient', 'glass', 'success', 'warning', 'error', 'info'
 * @param {string} props.size - Padding size: 'tiny', 'small', 'medium', 'large', 'xlarge'
 * @param {string} props.elevation - Shadow elevation: 'none', 'subtle', 'low', 'medium', 'high', 'highest'
 * @param {boolean} props.interactive - Whether card is interactive (TouchableOpacity)
 * @param {Function} props.onPress - Press callback (only when interactive=true)
 * @param {Function} props.onLongPress - Long press callback
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.fullWidth - Whether card should take full width
 * @param {Array} props.gradientColors - Custom gradient colors (for variant='gradient')
 * @param {Object} props.style - Custom container style
 * @param {Object} props.contentStyle - Custom content area style
 * @param {string} props.testID - Test ID for testing
 * @param {string} props.accessibilityLabel - Accessibility label
 * @param {string} props.accessibilityHint - Accessibility hint
 * @param {boolean} props.darkMode - Dark mode override (for theme testing)
 */
const Card = ({
  children,
  variant = 'default',
  size = 'medium',
  elevation = 'medium',
  interactive = false,
  onPress,
  onLongPress,
  disabled = false,
  fullWidth = false,
  gradientColors,
  style,
  contentStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
  darkMode = false,
  ...props
}) => {
  // === SIZE CONFIGURATIONS ===
  // Enhanced size system with comprehensive padding and border radius options
  const sizeConfig = {
    tiny: {
      padding: PADDING.CARD.tiny,
      borderRadius: BORDER_RADIUS.SM,
      minHeight: 60,
    },
    small: {
      padding: PADDING.CARD.small,
      borderRadius: BORDER_RADIUS.MD,
      minHeight: 80,
    },
    medium: {
      padding: PADDING.CARD.medium,
      borderRadius: BORDER_RADIUS.MD,
      minHeight: 100,
    },
    large: {
      padding: PADDING.CARD.large,
      borderRadius: BORDER_RADIUS.LG,
      minHeight: 120,
    },
    xlarge: {
      padding: PADDING.CARD.xlarge,
      borderRadius: BORDER_RADIUS.XL,
      minHeight: 140,
    },
  };

  // === ELEVATION CONFIGURATIONS ===
  // Enhanced shadow system with multiple elevation levels
  const elevationConfig = {
    none: SHADOWS.NONE,
    subtle: SHADOWS.SUBTLE,
    low: SHADOWS.XS,
    medium: SHADOWS.SM,
    high: SHADOWS.MD,
    highest: SHADOWS.LG,
  };

  // === VARIANT CONFIGURATIONS ===
  // Enhanced variant system with comprehensive styling options
  const variantConfig = {
    default: {
      backgroundColor: darkMode ? COLORS.SURFACE_DARK : COLORS.SURFACE_LIGHT,
      backgroundColorHover: darkMode ? COLORS.GRAY_700 : COLORS.GRAY_50,
      borderColor: 'transparent',
      borderWidth: 0,
      textColor: darkMode ? COLORS.TEXT_DARK_PRIMARY : COLORS.TEXT_LIGHT_PRIMARY,
    },
    elevated: {
      backgroundColor: darkMode ? COLORS.SURFACE_DARK_ELEVATED : COLORS.SURFACE_LIGHT_ELEVATED,
      backgroundColorHover: darkMode ? COLORS.GRAY_600 : COLORS.GRAY_100,
      borderColor: 'transparent',
      borderWidth: 0,
      textColor: darkMode ? COLORS.TEXT_DARK_PRIMARY : COLORS.TEXT_LIGHT_PRIMARY,
    },
    outlined: {
      backgroundColor: darkMode ? COLORS.SURFACE_DARK : COLORS.SURFACE_LIGHT,
      backgroundColorHover: darkMode ? COLORS.GRAY_800 : COLORS.GRAY_50,
      borderColor: darkMode ? COLORS.BORDER_DARK : COLORS.BORDER_LIGHT,
      borderWidth: 1,
      textColor: darkMode ? COLORS.TEXT_DARK_PRIMARY : COLORS.TEXT_LIGHT_PRIMARY,
    },
    filled: {
      backgroundColor: darkMode ? COLORS.GRAY_800 : COLORS.GRAY_100,
      backgroundColorHover: darkMode ? COLORS.GRAY_700 : COLORS.GRAY_200,
      borderColor: 'transparent',
      borderWidth: 0,
      textColor: darkMode ? COLORS.TEXT_DARK_PRIMARY : COLORS.TEXT_LIGHT_PRIMARY,
    },
    gradient: {
      gradient: gradientColors || COLORS.GRADIENT_PRIMARY,
      textColor: COLORS.WHITE,
      borderColor: 'transparent',
      borderWidth: 0,
    },
    glass: {
      backgroundColor: darkMode
        ? `rgba(255, 255, 255, ${OPACITY.LIGHT})`
        : `rgba(255, 255, 255, ${OPACITY.STRONG})`,
      backgroundColorHover: darkMode
        ? `rgba(255, 255, 255, ${OPACITY.MEDIUM_LIGHT})`
        : `rgba(255, 255, 255, ${OPACITY.VERY_STRONG})`,
      borderColor: darkMode
        ? `rgba(255, 255, 255, ${OPACITY.MEDIUM_LIGHT})`
        : `rgba(255, 255, 255, ${OPACITY.MEDIUM})`,
      borderWidth: 1,
      textColor: darkMode ? COLORS.TEXT_DARK_PRIMARY : COLORS.TEXT_LIGHT_PRIMARY,
    },
    // Semantic Variants
    success: {
      backgroundColor: COLORS.SUCCESS_50,
      backgroundColorHover: COLORS.SUCCESS_100,
      borderColor: COLORS.SUCCESS_200,
      borderWidth: 1,
      textColor: COLORS.SUCCESS_800,
    },
    warning: {
      backgroundColor: COLORS.WARNING_50,
      backgroundColorHover: COLORS.WARNING_100,
      borderColor: COLORS.WARNING_200,
      borderWidth: 1,
      textColor: COLORS.WARNING_800,
    },
    error: {
      backgroundColor: COLORS.ERROR_50,
      backgroundColorHover: COLORS.ERROR_100,
      borderColor: COLORS.ERROR_200,
      borderWidth: 1,
      textColor: COLORS.ERROR_800,
    },
    info: {
      backgroundColor: COLORS.INFO_50,
      backgroundColorHover: COLORS.INFO_100,
      borderColor: COLORS.INFO_200,
      borderWidth: 1,
      textColor: COLORS.INFO_800,
    },
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];
  const currentElevation = elevationConfig[elevation];

  // === STATE MANAGEMENT ===
  const isDisabled = disabled;
  const isInteractive = interactive && onPress && !isDisabled;

  // === BASE CARD STYLE ===
  const baseCardStyle = {
    minHeight: currentSize.minHeight,
    width: fullWidth ? '100%' : undefined,
    borderRadius: currentSize.borderRadius,
    borderWidth: currentVariant.borderWidth,
    borderColor: currentVariant.borderColor,
    backgroundColor: currentVariant.backgroundColor,
    // Apply elevation shadow
    ...(!isDisabled && currentElevation),
    // Disabled state styling
    opacity: isDisabled ? 0.6 : 1,
    // Ensure proper overflow for rounded corners
    overflow: 'hidden',
  };

  // === CONTENT STYLE ===
  const baseContentStyle = {
    padding: currentSize.padding,
    flex: 1,
    // Apply text color for semantic variants
    ...(currentVariant.textColor && { color: currentVariant.textColor }),
  };

  // === RENDER CONTENT ===
  const renderContent = () => (
    <View style={[baseContentStyle, contentStyle]}>
      {children}
    </View>
  );

  // === INTERACTIVE CARD RENDERING ===
  if (isInteractive) {
    // Gradient interactive card
    if (variant === 'gradient') {
      return (
        <TouchableOpacity
          onPress={onPress}
          onLongPress={onLongPress}
          disabled={isDisabled}
          activeOpacity={0.8}
          style={style}
          testID={testID}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole="button"
          accessibilityState={{ disabled: isDisabled }}
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
        onLongPress={onLongPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[baseCardStyle, style]}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        {...props}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // === NON-INTERACTIVE CARD RENDERING ===
  // Gradient non-interactive card
  if (variant === 'gradient') {
    return (
      <View
        style={style}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
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
      </View>
    );
  }

  // Regular non-interactive card
  return (
    <View
      style={[baseCardStyle, style]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      {...props}
    >
      {renderContent()}
    </View>
  );
};

// === PRESET CARD COMPONENTS ===
// Convenient preset components for common card variants

// Basic Variants
export const DefaultCard = (props) => (
  <Card variant="default" {...props} />
);

export const ElevatedCard = (props) => (
  <Card variant="elevated" elevation="high" {...props} />
);

export const OutlinedCard = (props) => (
  <Card variant="outlined" {...props} />
);

export const FilledCard = (props) => (
  <Card variant="filled" {...props} />
);

export const GradientCard = (props) => (
  <Card variant="gradient" elevation="high" {...props} />
);

export const GlassCard = (props) => (
  <Card variant="glass" elevation="medium" {...props} />
);

// Semantic Variants
export const SuccessCard = (props) => (
  <Card variant="success" {...props} />
);

export const WarningCard = (props) => (
  <Card variant="warning" {...props} />
);

export const ErrorCard = (props) => (
  <Card variant="error" {...props} />
);

export const InfoCard = (props) => (
  <Card variant="info" {...props} />
);

// Interactive Variants
export const InteractiveCard = (props) => (
  <Card interactive={true} {...props} />
);

export const PressableCard = (props) => (
  <Card variant="elevated" interactive={true} elevation="high" {...props} />
);

export const ClickableCard = (props) => (
  <Card variant="outlined" interactive={true} {...props} />
);

// === SPECIALIZED CARD COMPONENTS ===

// Analytics Dashboard Card
export const AnalyticsCard = ({ gradientColors = COLORS.GRADIENT_PRIMARY, ...props }) => (
  <Card
    variant="gradient"
    size="large"
    elevation="high"
    gradientColors={gradientColors}
    {...props}
  />
);

// Status Card with semantic variants
export const StatusCard = ({ status = 'info', ...props }) => {
  const statusVariants = {
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info',
  };

  return (
    <Card
      variant={statusVariants[status]}
      elevation="low"
      {...props}
    />
  );
};

// Feature Card for highlighting features
export const FeatureCard = (props) => (
  <Card
    variant="gradient"
    gradientColors={COLORS.GRADIENT_CARD_FEATURE}
    size="large"
    elevation="high"
    {...props}
  />
);

// Compact Card for tight spaces
export const CompactCard = (props) => (
  <Card
    variant="outlined"
    size="tiny"
    elevation="none"
    {...props}
  />
);

// Full Width Card
export const FullWidthCard = (props) => (
  <Card
    fullWidth
    {...props}
  />
);

// === COMPLEX CARD COMPONENTS ===

// Card with header and footer sections
export const SectionCard = ({
  header,
  footer,
  children,
  headerStyle,
  footerStyle,
  size = 'medium',
  ...cardProps
}) => {
  const cardSize = size;
  const borderColor = cardProps.darkMode ? COLORS.BORDER_DARK : COLORS.BORDER_LIGHT;

  return (
    <Card {...cardProps} size={cardSize} contentStyle={{ padding: 0 }}>
      {header && (
        <View style={[
          {
            padding: PADDING.CARD[cardSize],
            borderBottomWidth: 1,
            borderBottomColor: borderColor,
          },
          headerStyle
        ]}>
          {header}
        </View>
      )}

      <View style={{
        padding: PADDING.CARD[cardSize],
        flex: 1
      }}>
        {children}
      </View>

      {footer && (
        <View style={[
          {
            padding: PADDING.CARD[cardSize],
            borderTopWidth: 1,
            borderTopColor: borderColor,
          },
          footerStyle
        ]}>
          {footer}
        </View>
      )}
    </Card>
  );
};

// Card with action buttons
export const ActionCard = ({
  title,
  description,
  actions,
  children,
  ...cardProps
}) => (
  <SectionCard
    header={
      <View>
        {title && (
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            marginBottom: description ? SPACING.XS : 0,
          }}>
            {title}
          </Text>
        )}
        {description && (
          <Text style={{
            fontSize: 14,
            opacity: 0.7,
          }}>
            {description}
          </Text>
        )}
      </View>
    }
    footer={actions && (
      <View style={{
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: SPACING.SM,
      }}>
        {actions}
      </View>
    )}
    {...cardProps}
  >
    {children}
  </SectionCard>
);

export default Card;

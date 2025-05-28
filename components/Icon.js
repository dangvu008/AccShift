import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ICON_NAMES, ICON_SIZES } from '../styles/common/icons';
import { COLORS } from '../styles/common/colors';

/**
 * Icon component thống nhất cho toàn bộ ứng dụng
 * Sử dụng Expo Vector Icons với design system nhất quán
 * 
 * @param {Object} props
 * @param {string} props.name - Tên icon từ ICON_NAMES hoặc tên Ionicons trực tiếp
 * @param {string|number} props.size - Kích thước icon (XS, SM, MD, LG, XL, XXL, XXXL hoặc số)
 * @param {string} props.color - Màu icon (hex, rgba, hoặc từ COLORS)
 * @param {Object} props.style - Custom style
 * @param {Function} props.onPress - Callback khi nhấn (tự động wrap trong TouchableOpacity)
 * @param {boolean} props.disabled - Trạng thái disabled
 * @param {string} props.testID - Test ID cho testing
 */
const Icon = ({
  name,
  size = 'MD',
  color = COLORS.TEXT.PRIMARY,
  style,
  onPress,
  disabled = false,
  testID,
  ...props
}) => {
  // Resolve icon name từ ICON_NAMES mapping hoặc sử dụng trực tiếp
  const iconName = ICON_NAMES[name] || name;
  
  // Resolve size từ ICON_SIZES hoặc sử dụng trực tiếp
  const iconSize = typeof size === 'string' ? ICON_SIZES[size] || ICON_SIZES.MD : size;
  
  // Resolve color - có thể là string color hoặc từ COLORS object
  const iconColor = disabled ? COLORS.TEXT.DISABLED : color;
  
  // Base icon component
  const IconComponent = (
    <Ionicons
      name={iconName}
      size={iconSize}
      color={iconColor}
      style={[
        style,
        disabled && { opacity: 0.5 }
      ]}
      testID={testID}
      {...props}
    />
  );
  
  // Nếu có onPress, wrap trong TouchableOpacity
  if (onPress) {
    const { TouchableOpacity } = require('react-native');
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
        testID={testID ? `${testID}-touchable` : undefined}
      >
        {IconComponent}
      </TouchableOpacity>
    );
  }
  
  return IconComponent;
};

// Preset icon components cho các use cases thường gặp
export const NavigationIcon = (props) => (
  <Icon size="LG" color={COLORS.TEXT.PRIMARY} {...props} />
);

export const ActionIcon = (props) => (
  <Icon size="MD" color={COLORS.INTERACTIVE.DEFAULT} {...props} />
);

export const StatusIcon = ({ status = 'info', ...props }) => {
  const statusColors = {
    success: COLORS.SUCCESS,
    warning: COLORS.WARNING,
    error: COLORS.ERROR,
    info: COLORS.INFO,
  };
  
  return (
    <Icon 
      size="MD" 
      color={statusColors[status] || COLORS.INFO} 
      {...props} 
    />
  );
};

export const ButtonIcon = (props) => (
  <Icon size="SM" color={COLORS.TEXT.INVERSE} {...props} />
);

export const HeaderIcon = (props) => (
  <Icon size="LG" color={COLORS.TEXT.INVERSE} {...props} />
);

export const TabIcon = ({ focused, ...props }) => (
  <Icon 
    size="MD" 
    color={focused ? COLORS.INTERACTIVE.DEFAULT : COLORS.TEXT.SECONDARY} 
    {...props} 
  />
);

// Icon với badge (cho notifications, counts, etc.)
export const BadgeIcon = ({ 
  badgeCount, 
  badgeColor = COLORS.ERROR, 
  badgeTextColor = COLORS.TEXT.INVERSE,
  showBadge = true,
  ...iconProps 
}) => {
  const { View, Text } = require('react-native');
  const { SPACING, BORDER_RADIUS } = require('../styles/common/spacing');
  const { FONT_SIZES, FONT_WEIGHTS } = require('../styles/common/typography');
  
  return (
    <View style={{ position: 'relative' }}>
      <Icon {...iconProps} />
      {showBadge && badgeCount > 0 && (
        <View
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            backgroundColor: badgeColor,
            borderRadius: BORDER_RADIUS.ROUND,
            minWidth: 16,
            height: 16,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: SPACING.XXS,
          }}
        >
          <Text
            style={{
              color: badgeTextColor,
              fontSize: FONT_SIZES.CAPTION_SMALL,
              fontWeight: FONT_WEIGHTS.BOLD,
              textAlign: 'center',
            }}
          >
            {badgeCount > 99 ? '99+' : badgeCount.toString()}
          </Text>
        </View>
      )}
    </View>
  );
};

// Icon với loading state
export const LoadingIcon = ({ loading = false, loadingColor, ...iconProps }) => {
  if (loading) {
    const { ActivityIndicator } = require('react-native');
    const iconSize = typeof iconProps.size === 'string' 
      ? ICON_SIZES[iconProps.size] || ICON_SIZES.MD 
      : iconProps.size || ICON_SIZES.MD;
    
    return (
      <ActivityIndicator
        size={iconSize > 24 ? 'large' : 'small'}
        color={loadingColor || iconProps.color || COLORS.INTERACTIVE.DEFAULT}
        style={iconProps.style}
      />
    );
  }
  
  return <Icon {...iconProps} />;
};

// Icon group - Hiển thị nhiều icons cùng lúc
export const IconGroup = ({ 
  icons = [], 
  spacing = SPACING.SM, 
  direction = 'row',
  style,
  ...props 
}) => {
  const { View } = require('react-native');
  const { SPACING } = require('../styles/common/spacing');
  
  return (
    <View
      style={[
        {
          flexDirection: direction,
          alignItems: 'center',
          gap: spacing,
        },
        style
      ]}
      {...props}
    >
      {icons.map((iconProps, index) => (
        <Icon key={index} {...iconProps} />
      ))}
    </View>
  );
};

export default Icon;

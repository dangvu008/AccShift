import React from 'react'
import { TouchableOpacity, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '../styles/common/colors'
import { FONT_SIZES, FONT_WEIGHTS } from '../styles/common/typography'

/**
 * GradientButton - Modern button component với gradient background
 * @param {Object} props
 * @param {string} props.title - Text hiển thị trên button
 * @param {string} props.iconName - Tên icon từ Ionicons
 * @param {number} props.iconSize - Kích thước icon (default: 32)
 * @param {Array} props.gradientColors - Mảng màu gradient (default: primary gradient)
 * @param {Function} props.onPress - Callback khi nhấn button
 * @param {boolean} props.disabled - Trạng thái disabled
 * @param {Object} props.style - Custom style cho container
 * @param {Object} props.buttonStyle - Custom style cho button
 * @param {Object} props.textStyle - Custom style cho text
 * @param {string} props.description - Mô tả hiển thị dưới title
 * @param {React.ReactNode} props.children - Custom content thay thế icon và text
 */
const GradientButton = ({
  title,
  iconName,
  iconSize = 32,
  gradientColors = COLORS.GRADIENT_PRIMARY,
  onPress,
  disabled = false,
  style,
  buttonStyle,
  textStyle,
  description,
  children,
  ...props
}) => {
  const defaultButtonStyle = {
    width: 180, // Tăng kích thước như Analytics App
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    // Enhanced shadow effects như Analytics App
    elevation: 12,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  }

  const defaultTextStyle = {
    color: COLORS.TEXT_DARK,
    fontSize: FONT_SIZES.BUTTON,
    fontWeight: FONT_WEIGHTS.BOLD,
    marginTop: 10,
    textAlign: 'center',
    letterSpacing: 0.5,
  }

  const defaultDescriptionStyle = {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: FONT_SIZES.CAPTION_SMALL,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
    lineHeight: FONT_SIZES.CAPTION_SMALL * 1.3,
  }

  return (
    <View style={style}>
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        {...props}
      >
        <LinearGradient
          colors={disabled ? [COLORS.DISABLED_LIGHT, COLORS.DISABLED_DARK] : gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            defaultButtonStyle,
            buttonStyle,
            disabled && { opacity: 0.6 }
          ]}
        >
          {children ? (
            children
          ) : (
            <>
              {iconName && (
                <Ionicons
                  name={iconName}
                  size={iconSize}
                  color={COLORS.TEXT_DARK}
                />
              )}
              {title && (
                <Text style={[defaultTextStyle, textStyle]}>
                  {title}
                </Text>
              )}
              {description && (
                <Text style={defaultDescriptionStyle}>
                  {description}
                </Text>
              )}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  )
}

export default GradientButton

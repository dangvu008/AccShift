import React, { useContext } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import { COLORS } from '../styles/common/colors'
import { FONT_SIZES, FONT_WEIGHTS } from '../styles/common/typography'

const { width } = Dimensions.get('window')

/**
 * AnalyticsCard - Component card theo style Analytics App
 * @param {string} title - Tiêu đề card
 * @param {string} value - Giá trị chính
 * @param {string} unit - Đơn vị
 * @param {string} iconName - Tên icon Ionicons
 * @param {Array} gradientColors - Màu gradient [start, end]
 * @param {Function} onPress - Hàm xử lý khi nhấn
 * @param {string} size - Kích thước card: 'small', 'medium', 'large'
 * @param {Object} style - Style tùy chỉnh
 */
const AnalyticsCard = ({
  title,
  value,
  unit,
  iconName,
  gradientColors = COLORS.GRADIENT_PRIMARY,
  onPress,
  size = 'medium',
  style,
  ...props
}) => {
  const { darkMode } = useContext(AppContext)

  // Xác định kích thước card
  const getCardSize = () => {
    const cardWidth = (width - 48) / 2 // 2 cards per row với margin
    
    switch (size) {
      case 'small':
        return {
          width: cardWidth,
          height: 120,
        }
      case 'large':
        return {
          width: width - 32, // Full width
          height: 140,
        }
      case 'medium':
      default:
        return {
          width: cardWidth,
          height: 140,
        }
    }
  }

  const cardSize = getCardSize()

  return (
    <TouchableOpacity
      style={[
        styles.container,
        cardSize,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      {...props}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, cardSize]}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons
            name={iconName}
            size={24}
            color={COLORS.TEXT_DARK}
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{value}</Text>
            {unit && <Text style={styles.unit}>{unit}</Text>}
          </View>
        </View>

        {/* Decorative elements */}
        <View style={styles.decorativeContainer}>
          <View style={styles.decorativeDot} />
          <View style={[styles.decorativeDot, styles.decorativeDotSecond]} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    marginBottom: 16,
    // Shadow effects
    elevation: 8,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  iconContainer: {
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: FONT_SIZES.BODY_SMALL,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_DARK,
    marginBottom: 4,
    opacity: 0.9,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: FONT_SIZES.HEADER_2,
    fontWeight: FONT_WEIGHTS.EXTRA_BOLD,
    color: COLORS.TEXT_DARK,
  },
  unit: {
    fontSize: FONT_SIZES.CAPTION,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    color: COLORS.TEXT_DARK,
    marginLeft: 4,
    opacity: 0.8,
  },
  decorativeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
  },
  decorativeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 4,
  },
  decorativeDotSecond: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
})

export default AnalyticsCard

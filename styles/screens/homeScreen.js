import { StyleSheet } from 'react-native'
import { COLORS } from '../common/colors'
import { FONT_SIZES, FONT_WEIGHTS } from '../common/typography'

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20, // Tăng từ 16
  },
  dateTimeContainer: {
    alignItems: 'flex-start',
  },
  timeText: {
    fontSize: FONT_SIZES.HEADER_1, // Sử dụng typography system
    fontWeight: FONT_WEIGHTS.EXTRA_BOLD,
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: FONT_SIZES.BODY_SMALL,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    marginTop: 4,
  },
  shiftEditIcon: {
    position: 'absolute',
    right: 12, // Tăng từ 10
    top: '50%',
    marginTop: -12, // Điều chỉnh cho icon lớn hơn
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 44, // Tăng từ 40
    height: 44, // Tăng từ 40
    borderRadius: 22, // Tăng từ 20
    backgroundColor: `rgba(${COLORS.PRIMARY.replace('#', '')}, 0.15)`, // Sử dụng primary color
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10, // Tăng từ 8
    // Thêm shadow effects
    elevation: 2,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  // Analytics App Style Cards
  card: {
    borderRadius: 20, // Tăng border radius như trong ảnh
    marginBottom: 20,
    // Enhanced shadow cho depth
    elevation: 8,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    overflow: 'hidden', // Để gradient không bị tràn
  },
  cardGradient: {
    padding: 20,
    borderRadius: 20,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitleWhite: {
    fontSize: FONT_SIZES.BODY_LARGE,
    fontWeight: FONT_WEIGHTS.BOLD,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSubtitleWhite: {
    fontSize: FONT_SIZES.BODY_SMALL,
    fontWeight: FONT_WEIGHTS.MEDIUM,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  cardArrow: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  cardActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  workingIconContainer: {
    marginRight: 16,
  },
  cardTitle: {
    fontSize: FONT_SIZES.HEADER_3,
    fontWeight: FONT_WEIGHTS.BOLD,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: FONT_SIZES.BODY_SMALL,
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
})

export default styles

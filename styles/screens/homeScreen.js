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
  // Thêm styles cho card components
  card: {
    borderRadius: 16, // Tăng từ 12
    padding: 20, // Tăng từ 16
    marginBottom: 20, // Tăng từ 16
    // Enhanced shadow
    elevation: 4,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Border subtle
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
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

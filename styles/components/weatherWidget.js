import { StyleSheet } from 'react-native';
import { COLORS } from '../common/colors';
import { FONT_SIZES, FONT_WEIGHTS } from '../common/typography';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.CARD_LIGHT, // Sử dụng card color thay vì background
    borderRadius: 20, // Tăng border radius từ 16
    padding: 20, // Tăng padding từ 16
    marginBottom: 20, // Tăng margin từ 16
    // Enhanced shadow effects
    elevation: 6, // Tăng từ 2
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 3 }, // Tăng từ 1
    shadowOpacity: 0.15, // Giảm từ 0.2 để subtle hơn
    shadowRadius: 6, // Tăng từ 2
    // Thêm border subtle
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
  },
  currentWeatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // Tăng từ 12
  },
  weatherIconContainer: {
    marginRight: 20, // Tăng từ 16
    alignItems: 'center',
    justifyContent: 'center',
    // Thêm background cho icon
    backgroundColor: 'rgba(99, 102, 241, 0.1)', // Primary color với opacity
    borderRadius: 16,
    padding: 12,
  },
  weatherInfoContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: FONT_SIZES.HEADER_1, // Sử dụng typography system
    fontWeight: FONT_WEIGHTS.EXTRA_BOLD, // Tăng font weight
    marginBottom: 4, // Tăng từ 2
    letterSpacing: -0.5,
  },
  weatherDescription: {
    fontSize: FONT_SIZES.BODY, // Sử dụng typography system
    fontWeight: FONT_WEIGHTS.MEDIUM, // Thêm font weight
    textTransform: 'capitalize',
    marginBottom: 4, // Tăng từ 2
  },
  locationName: {
    fontSize: FONT_SIZES.BODY_SMALL, // Sử dụng typography system
    fontWeight: FONT_WEIGHTS.REGULAR,
  },
  refreshButton: {
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forecastSection: {
    marginBottom: 12,
    marginTop: 4,
  },
  forecastScrollView: {
    marginBottom: 8,
  },
  forecastContainer: {
    paddingVertical: 4,
  },
  forecastItem: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    minWidth: 85,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  forecastTime: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  forecastDesc: {
    fontSize: 12,
    textTransform: 'capitalize',
    marginTop: 4,
  },
  alertContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  alertIconContainer: {
    marginRight: 12,
  },
  alertText: {
    color: COLORS.TEXT_DARK,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});

export default styles;

import { StyleSheet } from 'react-native';
import { COLORS } from '../common/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.BACKGROUND_LIGHT, // Sẽ được ghi đè bởi theme.cardColor
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  currentWeatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  weatherIconContainer: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weatherInfoContainer: {
    flex: 1,
  },
  temperature: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  weatherDescription: {
    fontSize: 16,
    textTransform: 'capitalize',
    marginBottom: 2,
  },
  locationName: {
    fontSize: 14,
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

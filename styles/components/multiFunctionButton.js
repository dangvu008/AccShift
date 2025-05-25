import { StyleSheet } from 'react-native';
import { COLORS } from '../common/colors';
import { FONT_SIZES, FONT_WEIGHTS, TEXT_STYLES } from '../common/typography';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 24, // Tăng spacing
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 16, // Tăng spacing
  },
  mainButton: {
    width: 160, // Tăng kích thước từ 140
    height: 160, // Tăng kích thước từ 140
    borderRadius: 80, // Tăng border radius
    justifyContent: 'center',
    alignItems: 'center',
    // Enhanced shadow effects
    elevation: 8, // Tăng từ 5
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 }, // Tăng từ 2
    shadowOpacity: 0.3, // Tăng từ 0.25
    shadowRadius: 6, // Tăng từ 3.84
    padding: 12, // Tăng padding
    // Gradient background sẽ được thêm qua LinearGradient component
  },
  darkButton: {
    shadowColor: COLORS.TEXT_DARK,
    shadowOpacity: 0.4,
  },
  disabledButton: {
    opacity: 0.6, // Giảm từ 0.7 để rõ ràng hơn
  },
  mainButtonText: {
    color: COLORS.TEXT_DARK,
    fontSize: FONT_SIZES.BUTTON, // Sử dụng typography system
    fontWeight: FONT_WEIGHTS.BOLD,
    marginTop: 10, // Tăng từ 8
    textAlign: 'center',
    letterSpacing: 0.5, // Thêm letter spacing
  },
  buttonDescription: {
    color: 'rgba(255, 255, 255, 0.9)', // Tăng opacity từ 0.8
    fontSize: FONT_SIZES.CAPTION_SMALL,
    fontWeight: FONT_WEIGHTS.MEDIUM, // Thêm font weight
    textAlign: 'center',
    marginTop: 6, // Tăng từ 4
    paddingHorizontal: 8, // Tăng từ 5
    lineHeight: FONT_SIZES.CAPTION_SMALL * 1.3, // Thêm line height
  },
  resetButton: {
    position: 'absolute',
    top: 12, // Tăng từ 10
    right: 12, // Tăng từ 10
    width: 28, // Tăng từ 24
    height: 28, // Tăng từ 24
    borderRadius: 14, // Tăng từ 12
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Tăng opacity từ 0.3
    justifyContent: 'center',
    alignItems: 'center',
    // Thêm shadow cho reset button
    elevation: 2,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  punchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ERROR,
    paddingVertical: 12, // Tăng từ 8
    paddingHorizontal: 20, // Tăng từ 16
    borderRadius: 25, // Tăng từ 20
    marginTop: 12, // Tăng từ 10
    // Thêm shadow cho punch button
    elevation: 4,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  punchButtonText: {
    color: COLORS.TEXT_DARK,
    fontSize: FONT_SIZES.BUTTON_SMALL,
    fontWeight: FONT_WEIGHTS.SEMI_BOLD,
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  logsContainer: {
    width: '100%',
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  darkLogsContainer: {
    backgroundColor: COLORS.CARD_DARK,
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.TEXT_LIGHT,
  },
  darkText: {
    color: COLORS.TEXT_DARK,
  },
  darkSubtitle: {
    color: COLORS.SUBTEXT_DARK,
  },
  timelineContainer: {
    marginTop: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  timelineConnector: {
    position: 'absolute',
    left: 12,
    top: 24,
    width: 2,
    height: '100%',
    backgroundColor: COLORS.INFO,
  },
  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.INFO,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.INFO,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.TEXT_LIGHT,
  },
  logTime: {
    fontSize: 12,
    color: COLORS.SUBTEXT_LIGHT,
  },
  logDescription: {
    fontSize: 12,
    color: COLORS.SUBTEXT_LIGHT,
    marginTop: 4,
  },
});

export default styles;

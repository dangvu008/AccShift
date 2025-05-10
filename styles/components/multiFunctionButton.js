import { StyleSheet } from 'react-native';
import { COLORS } from '../common/colors';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  mainButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 10,
  },
  darkButton: {
    shadowColor: '#fff',
  },
  disabledButton: {
    opacity: 0.7,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 5,
  },
  resetButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  punchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.ERROR,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 10,
  },
  punchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
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

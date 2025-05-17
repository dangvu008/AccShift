import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../common/colors';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxHeight: height * 0.8,
    backgroundColor: COLORS.CARD_LIGHT,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkModalContainer: {
    backgroundColor: COLORS.CARD_DARK,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
    paddingBottom: 12,
  },
  darkModalHeader: {
    borderBottomColor: COLORS.BORDER_DARK,
  },
  modalContent: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_LIGHT,
    flex: 1,
  },
  darkText: {
    color: COLORS.TEXT_DARK,
  },
  closeIcon: {
    padding: 4,
  },
});

export default styles;

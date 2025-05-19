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
  dateInfo: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 8,
  },
  darkDateInfo: {
    backgroundColor: COLORS.BACKGROUND_DARK,
  },
  dateText: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
    fontWeight: 'bold',
  },
  statusOptionsContainer: {
    marginBottom: 16,
  },
  statusOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_LIGHT,
    marginBottom: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  darkStatusOption: {
    backgroundColor: COLORS.BACKGROUND_DARK,
  },
  selectedStatusOption: {
    backgroundColor: 'rgba(138, 86, 255, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  darkSelectedStatusOption: {
    backgroundColor: 'rgba(138, 86, 255, 0.2)',
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  statusIcon: {
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
    flex: 1,
  },
  notesContainer: {
    marginBottom: 16,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_LIGHT,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 8,
    padding: 12,
    color: COLORS.TEXT_LIGHT,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  darkNotesInput: {
    backgroundColor: COLORS.BACKGROUND_DARK,
    color: COLORS.TEXT_DARK,
  },
  timeInputContainer: {
    marginBottom: 16,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeInputLabel: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
    width: 80,
  },
  timeInput: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 8,
    padding: 12,
    flex: 1,
    color: COLORS.TEXT_LIGHT,
  },
  darkTimeInput: {
    backgroundColor: COLORS.BACKGROUND_DARK,
    color: COLORS.TEXT_DARK,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    marginRight: 8,
    alignItems: 'center',
  },
  darkCancelButton: {
    backgroundColor: COLORS.BACKGROUND_DARK,
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: COLORS.PRIMARY,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default styles;

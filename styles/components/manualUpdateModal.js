import { StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../common/colors';

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: width > 600 ? 500 : width - 40,
    backgroundColor: COLORS.CARD_LIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  darkModalContainer: {
    backgroundColor: COLORS.CARD_DARK,
    borderWidth: 1,
    borderColor: COLORS.BORDER_DARK,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
    backgroundColor: COLORS.CARD_LIGHT,
  },
  darkModalHeader: {
    borderBottomColor: COLORS.BORDER_DARK,
    backgroundColor: COLORS.CARD_DARK,
  },
  modalContent: {
    flex: 1,
    maxHeight: height * 0.6,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 10,
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
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    alignItems: 'center',
  },
  darkDateInfo: {
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderColor: COLORS.BORDER_DARK,
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderWidth: 2,
    borderColor: COLORS.BORDER_LIGHT,
    minHeight: 56,
  },
  darkStatusOption: {
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderColor: COLORS.BORDER_DARK,
    borderWidth: 2,
  },
  selectedStatusOption: {
    backgroundColor: 'rgba(138, 86, 255, 0.15)',
    borderWidth: 3,
    borderColor: COLORS.PRIMARY,
    transform: [{ scale: 1.02 }],
  },
  darkSelectedStatusOption: {
    backgroundColor: 'rgba(138, 86, 255, 0.25)',
    borderWidth: 3,
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
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    fontSize: 16,
  },
  darkNotesInput: {
    backgroundColor: COLORS.BACKGROUND_DARK,
    color: COLORS.TEXT_DARK,
    borderColor: COLORS.BORDER_DARK,
    borderWidth: 1, // Thêm viền để tăng độ tương phản trong chế độ tối
  },
  timeInputContainer: {
    marginBottom: 16,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeInputLabel: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
    width: 60,
    fontWeight: '500',
  },
  timeInput: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flex: 1,
    marginLeft: 12,
    borderWidth: 2,
    borderColor: COLORS.BORDER_LIGHT,
    minHeight: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  darkTimeInput: {
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderColor: COLORS.BORDER_DARK,
  },
  timeInputText: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
    fontWeight: '500',
  },
  placeholderText: {
    color: '#999',
    fontWeight: 'normal',
  },
  timeIcon: {
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER_LIGHT,
    backgroundColor: COLORS.CARD_LIGHT,
  },
  darkButtonContainer: {
    borderTopColor: COLORS.BORDER_DARK,
    backgroundColor: COLORS.CARD_DARK,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.BORDER_LIGHT,
    minHeight: 52,
    justifyContent: 'center',
  },
  darkCancelButton: {
    backgroundColor: COLORS.BACKGROUND_DARK,
    borderColor: COLORS.BORDER_DARK,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    marginLeft: 10,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cancelButtonText: {
    color: COLORS.TEXT_LIGHT,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Picker styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: COLORS.CARD_LIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  darkPickerContainer: {
    backgroundColor: COLORS.CARD_DARK,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_LIGHT,
  },
  pickerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pickerButtonText: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
  },
  doneButton: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  picker: {
    height: 200,
  },
});

export default styles;

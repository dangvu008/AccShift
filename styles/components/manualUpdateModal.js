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
    padding: 16,
    paddingTop: 40,
    paddingBottom: 40,
  },
  modalContainer: {
    width: '100%',
    maxWidth: width > 600 ? 500 : width - 40,
    minHeight: height * 0.5,
    maxHeight: height * 0.9,
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
    backgroundColor: COLORS.CARD_ELEVATED_DARK, // Sử dụng elevated card cho depth tốt hơn
    borderWidth: 1,
    borderColor: COLORS.BORDER_ACCENT_DARK, // Sử dụng accent border cho contrast tốt hơn
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 16,
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
    borderBottomColor: COLORS.BORDER_ACCENT_DARK, // Sử dụng accent border cho contrast tốt hơn
    backgroundColor: COLORS.CARD_ELEVATED_DARK, // Đồng bộ với modal container
  },
  modalContent: {
    flex: 1,
    minHeight: 200,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 20,
    flexGrow: 1,
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
    backgroundColor: COLORS.BACKGROUND_SECONDARY_DARK, // Sử dụng secondary background cho hierarchy tốt hơn
    borderColor: COLORS.BORDER_ACCENT_DARK, // Accent border cho contrast
  },
  dateText: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
    fontWeight: 'bold',
  },
  futureNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  darkFutureNotice: {
    backgroundColor: COLORS.INFO_DARK, // Sử dụng màu info từ color palette
    borderColor: COLORS.INFO_LIGHT, // Accent border cho consistency
  },
  futureNoticeIcon: {
    marginRight: 8,
  },
  futureNoticeText: {
    fontSize: 14,
    color: '#1976D2',
    flex: 1,
    fontWeight: '500',
  },
  darkFutureNoticeText: {
    color: '#64B5F6',
  },
  statusOptionsContainer: {
    marginBottom: 16,
  },
  statusDropdownContainer: {
    marginBottom: 16,
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.BORDER_LIGHT,
    marginTop: 8,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkDropdownButton: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY_DARK, // Sử dụng secondary background cho depth
    borderColor: COLORS.BORDER_ACCENT_DARK, // Accent border cho contrast tốt hơn
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  dropdownButtonActive: {
    borderColor: COLORS.PRIMARY,
    borderWidth: 2,
  },
  dropdownButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 32,
  },
  selectedStatusDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownIcon: {
    marginRight: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
    flex: 1,
  },
  dropdownArrow: {
    marginLeft: 8,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 999,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.BORDER_LIGHT,
    marginTop: 4,
    maxHeight: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1001,
  },
  darkDropdownList: {
    backgroundColor: COLORS.CARD_ELEVATED_DARK, // Sử dụng elevated card cho dropdown
    borderColor: COLORS.BORDER_ACCENT_DARK, // Accent border cho contrast
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
    minHeight: 50,
  },
  darkDropdownItem: {
    borderBottomColor: COLORS.BORDER_ACCENT_DARK, // Accent border cho consistency
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  dropdownItemIcon: {
    marginRight: 12,
  },
  dropdownItemText: {
    fontSize: 16,
    color: COLORS.TEXT_LIGHT,
    flex: 1,
  },
  statusOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.TEXT_LIGHT,
    marginBottom: 8,
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
    paddingVertical: 18,
    paddingHorizontal: 16,
    flex: 1,
    marginLeft: 12,
    borderWidth: 2,
    borderColor: COLORS.BORDER_LIGHT,
    minHeight: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkTimeInput: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY_DARK, // Secondary background cho depth
    borderColor: COLORS.BORDER_ACCENT_DARK, // Accent border cho contrast
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
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
  darkPlaceholderText: {
    color: COLORS.SUBTEXT_DARK, // Sử dụng subtext color cho consistency
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
    borderTopColor: COLORS.BORDER_ACCENT_DARK, // Accent border cho consistency
    backgroundColor: COLORS.CARD_ELEVATED_DARK, // Đồng bộ với modal container
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.BORDER_LIGHT,
    minHeight: 56,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkCancelButton: {
    backgroundColor: COLORS.BACKGROUND_SECONDARY_DARK, // Secondary background cho depth
    borderColor: COLORS.BORDER_ACCENT_DARK, // Accent border cho contrast
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: COLORS.PRIMARY,
    marginLeft: 10,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
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
    zIndex: 9999, // Ensure time picker is above everything
  },
  pickerContainer: {
    backgroundColor: COLORS.CARD_LIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    zIndex: 10000, // Ensure picker container is above overlay
  },
  darkPickerContainer: {
    backgroundColor: COLORS.CARD_ELEVATED_DARK, // Elevated card cho consistency
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
    backgroundColor: COLORS.CARD_LIGHT,
    position: 'relative',
  },
  darkPickerHeader: {
    backgroundColor: COLORS.CARD_ELEVATED_DARK, // Elevated card cho consistency
    borderBottomColor: COLORS.BORDER_ACCENT_DARK, // Accent border cho contrast
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_LIGHT,
    flex: 1,
    textAlign: 'center',
  },
  pickerCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 16,
    top: 12,
    zIndex: 1,
  },
  darkPickerCloseButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  picker: {
    height: 200,
  },
});

export default styles;

import React from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { COLORS } from '../styles/common/colors'

const TimePickerModal = ({ 
  visible, 
  value, 
  onTimeChange, 
  onClose, 
  title, 
  darkMode = false 
}) => {
  if (!visible) return null

  const handleTimeChange = (event, selectedTime) => {
    console.log('[TimePickerModal] Time change:', { event: event?.type, selectedTime })
    
    // Đóng picker trên Android ngay lập tức
    if (Platform.OS === 'android') {
      onClose()
    }
    
    // Gọi callback với event và time
    if (onTimeChange) {
      onTimeChange(event, selectedTime)
    }
    
    // Đóng picker trên iOS khi dismissed
    if (Platform.OS === 'ios' && event?.type === 'dismissed') {
      onClose()
    }
  }

  const handleBackdropPress = () => {
    console.log('[TimePickerModal] Backdrop pressed')
    onClose()
  }

  const handleConfirm = () => {
    console.log('[TimePickerModal] Confirm pressed')
    onClose()
  }

  return (
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent={false}
      presentationStyle="overFullScreen"
      hardwareAccelerated={true}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity 
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleBackdropPress}
        >
          <TouchableOpacity 
            style={[
              styles.container,
              darkMode && styles.darkContainer
            ]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={[
              styles.header,
              darkMode && styles.darkHeader
            ]}>
              <Text style={[
                styles.title,
                darkMode && styles.darkText
              ]}>
                {title}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={darkMode ? COLORS.TEXT_DARK : COLORS.TEXT_LIGHT}
                />
              </TouchableOpacity>
            </View>

            {/* Time Picker */}
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={value || new Date()}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
                themeVariant={darkMode ? 'dark' : 'light'}
                style={styles.picker}
              />
            </View>

            {/* Confirm Button for iOS */}
            {Platform.OS === 'ios' && (
              <View style={[
                styles.buttonContainer,
                darkMode && styles.darkButtonContainer
              ]}>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleConfirm}
                  activeOpacity={0.7}
                >
                  <Text style={styles.confirmButtonText}>
                    Xác nhận
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  )
}

const styles = {
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
    zIndex: 99999,
  },
  container: {
    backgroundColor: COLORS.CARD_LIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '50%',
    zIndex: 100000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 20,
  },
  darkContainer: {
    backgroundColor: COLORS.CARD_DARK,
    borderWidth: 1,
    borderColor: COLORS.BORDER_DARK,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
    backgroundColor: COLORS.CARD_LIGHT,
  },
  darkHeader: {
    borderBottomColor: COLORS.BORDER_DARK,
    backgroundColor: COLORS.CARD_DARK,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_LIGHT,
    flex: 1,
  },
  darkText: {
    color: COLORS.TEXT_DARK,
  },
  closeButton: {
    padding: 4,
  },
  pickerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  picker: {
    height: 200,
    width: '100%',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER_LIGHT,
  },
  darkButtonContainer: {
    borderTopColor: COLORS.BORDER_DARK,
  },
  confirmButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}

export default TimePickerModal

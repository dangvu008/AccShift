'use client'

import React, { useState, useContext, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { AppContext } from '../context/AppContext'
import { WORK_STATUS } from '../config/appConfig'
import styles from '../styles/components/manualUpdateModal'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const ManualUpdateModal = ({ visible, onClose, selectedDay, onStatusUpdated }) => {
  const { t, darkMode } = useContext(AppContext)

  // State cho form
  const [selectedStatus, setSelectedStatus] = useState('')
  const [checkInTime, setCheckInTime] = useState('')
  const [checkOutTime, setCheckOutTime] = useState('')
  const [showCheckInPicker, setShowCheckInPicker] = useState(false)
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false)
  const [loading, setLoading] = useState(false)

  // Debug logs
  useEffect(() => {
    console.log('[ManualUpdateModal] Component mounted, visible:', visible)
    console.log('[ManualUpdateModal] Screen dimensions:', { screenWidth, screenHeight })
    console.log('[ManualUpdateModal] Dark mode:', darkMode)
  }, [visible, darkMode])

  useEffect(() => {
    console.log('[ManualUpdateModal] Selected status changed:', selectedStatus)
    console.log('[ManualUpdateModal] Requires time input:', requiresTimeInput())
  }, [selectedStatus])

  // Danh sách trạng thái có thể chọn
  const statusOptions = [
    {
      key: WORK_STATUS.DU_CONG,
      label: t('Đủ công'),
      icon: 'checkmark-circle',
      color: '#4CAF50',
      requiresTime: true,
    },
    {
      key: WORK_STATUS.DI_MUON,
      label: t('Đi muộn'),
      icon: 'time',
      color: '#FF9800',
      requiresTime: true,
    },
    {
      key: WORK_STATUS.VE_SOM,
      label: t('Về sớm'),
      icon: 'exit',
      color: '#FF9800',
      requiresTime: true,
    },
    {
      key: WORK_STATUS.DI_MUON_VE_SOM,
      label: t('Đi muộn & về sớm'),
      icon: 'swap-horizontal',
      color: '#FF5722',
      requiresTime: true,
    },
    {
      key: WORK_STATUS.THIEU_LOG,
      label: t('Thiếu chấm công'),
      icon: 'warning',
      color: '#FF9800',
      requiresTime: false,
    },
    {
      key: WORK_STATUS.NGHI_PHEP,
      label: t('Nghỉ phép'),
      icon: 'calendar',
      color: '#2196F3',
      requiresTime: false,
    },
    {
      key: WORK_STATUS.NGHI_BENH,
      label: t('Nghỉ bệnh'),
      icon: 'medical',
      color: '#9C27B0',
      requiresTime: false,
    },
    {
      key: WORK_STATUS.NGHI_LE,
      label: t('Nghỉ lễ'),
      icon: 'gift',
      color: '#E91E63',
      requiresTime: false,
    },
    {
      key: WORK_STATUS.VANG_MAT,
      label: t('Vắng không lý do'),
      icon: 'close-circle',
      color: '#F44336',
      requiresTime: false,
    },
  ]

  // Reset form khi modal mở
  useEffect(() => {
    if (visible && selectedDay) {
      console.log('[ManualUpdateModal] Resetting form for day:', selectedDay)
      const currentStatus = selectedDay.status || {}
      setSelectedStatus(currentStatus.status || '')
      setCheckInTime(currentStatus.vaoLogTime || '')
      setCheckOutTime(currentStatus.raLogTime || '')

      // Reset time pickers
      setShowCheckInPicker(false)
      setShowCheckOutPicker(false)
      setLoading(false)
    }
  }, [visible, selectedDay])

  // Kiểm tra xem trạng thái có cần thời gian không
  const requiresTimeInput = () => {
    const option = statusOptions.find(opt => opt.key === selectedStatus)
    return option?.requiresTime || false
  }

  // Format ngày hiển thị
  const formatDisplayDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Xử lý thay đổi thời gian check-in
  const handleCheckInTimeChange = (event, selectedTime) => {
    console.log('[ManualUpdateModal] Check-in time change:', { event: event?.type, selectedTime })

    if (Platform.OS === 'android') {
      setShowCheckInPicker(false)
    }

    if (selectedTime && event?.type !== 'dismissed') {
      const timeString = selectedTime.toTimeString().slice(0, 5)
      console.log('[ManualUpdateModal] Setting check-in time:', timeString)
      setCheckInTime(timeString)
    }

    if (Platform.OS === 'ios' && event?.type === 'dismissed') {
      setShowCheckInPicker(false)
    }
  }

  // Xử lý thay đổi thời gian check-out
  const handleCheckOutTimeChange = (event, selectedTime) => {
    console.log('[ManualUpdateModal] Check-out time change:', { event: event?.type, selectedTime })

    if (Platform.OS === 'android') {
      setShowCheckOutPicker(false)
    }

    if (selectedTime && event?.type !== 'dismissed') {
      const timeString = selectedTime.toTimeString().slice(0, 5)
      console.log('[ManualUpdateModal] Setting check-out time:', timeString)
      setCheckOutTime(timeString)
    }

    if (Platform.OS === 'ios' && event?.type === 'dismissed') {
      setShowCheckOutPicker(false)
    }
  }

  // Tạo Date object từ time string
  const createTimeDate = (timeString) => {
    if (!timeString) return new Date()
    const [hours, minutes] = timeString.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  // Validate form
  const validateForm = () => {
    if (!selectedStatus) {
      Alert.alert(t('Lỗi'), t('Vui lòng chọn trạng thái'))
      return false
    }

    if (requiresTimeInput()) {
      if (!checkInTime) {
        Alert.alert(t('Lỗi'), t('Vui lòng nhập thời gian check-in'))
        return false
      }
      if (!checkOutTime) {
        Alert.alert(t('Lỗi'), t('Vui lòng nhập thời gian check-out'))
        return false
      }

      // Kiểm tra thời gian hợp lệ
      const checkIn = createTimeDate(checkInTime)
      const checkOut = createTimeDate(checkOutTime)

      if (checkOut <= checkIn) {
        Alert.alert(t('Lỗi'), t('Thời gian check-out phải sau thời gian check-in'))
        return false
      }
    }

    return true
  }

  // Xử lý lưu
  const handleSave = async () => {
    console.log('[ManualUpdateModal] Save button pressed')
    console.log('[ManualUpdateModal] Form data:', {
      selectedStatus,
      checkInTime,
      checkOutTime,
      requiresTimeInput: requiresTimeInput()
    })

    if (!validateForm()) return

    setLoading(true)
    try {
      // Import workStatusCalculator
      const { updateWorkStatusManually } = require('../utils/workStatusCalculator')

      // Chuẩn bị dữ liệu
      const dateKey = selectedDay.date.toISOString().split('T')[0]
      const additionalData = {
        vaoLogTime: requiresTimeInput() ? checkInTime : null,
        raLogTime: requiresTimeInput() ? checkOutTime : null,
      }

      console.log('[ManualUpdateModal] Updating status:', { dateKey, selectedStatus, additionalData })

      // Cập nhật trạng thái
      const result = await updateWorkStatusManually(dateKey, selectedStatus, additionalData)

      if (result) {
        console.log('[ManualUpdateModal] Update successful:', result)
        // Thông báo thành công
        Alert.alert(t('Thành công'), t('Đã cập nhật trạng thái làm việc'), [
          {
            text: t('OK'),
            onPress: () => {
              onStatusUpdated && onStatusUpdated(result)
              onClose()
            }
          }
        ])
      } else {
        console.log('[ManualUpdateModal] Update failed: no result')
        Alert.alert(t('Lỗi'), t('Không thể cập nhật trạng thái'))
      }
    } catch (error) {
      console.error('[ManualUpdateModal] Error updating status:', error)
      Alert.alert(t('Lỗi'), t('Đã xảy ra lỗi khi cập nhật trạng thái'))
    } finally {
      setLoading(false)
    }
  }

  if (!visible || !selectedDay) {
    console.log('[ManualUpdateModal] Not rendering - visible:', visible, 'selectedDay:', !!selectedDay)
    return null
  }

  console.log('[ManualUpdateModal] Rendering modal')

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={false}
      presentationStyle="overFullScreen"
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.overlay}>
            <View style={[
              styles.modalContainer,
              darkMode && styles.darkModalContainer,
              { maxHeight: screenHeight * 0.9 }
            ]}>
              {/* Header */}
              <View style={[
                styles.modalHeader,
                darkMode && styles.darkModalHeader
              ]}>
                <Text style={[styles.title, darkMode && styles.darkText]}>
                  {t('Cập nhật trạng thái')}
                </Text>
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeIcon}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={darkMode ? '#fff' : '#000'}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalContent}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={false}
                keyboardShouldPersistTaps="handled"
              >
              {/* Thông tin ngày */}
              <View style={[
                styles.dateInfo,
                darkMode && styles.darkDateInfo
              ]}>
                <Text style={[styles.dateText, darkMode && styles.darkText]}>
                  {formatDisplayDate(selectedDay.date)}
                </Text>
              </View>

              {/* Chọn trạng thái */}
              <View style={styles.statusOptionsContainer}>
                <Text style={[
                  styles.statusOptionTitle,
                  darkMode && styles.darkText
                ]}>
                  {t('Chọn trạng thái')}
                </Text>

                {statusOptions.map((option, index) => {
                  const isSelected = selectedStatus === option.key
                  console.log(`[ManualUpdateModal] Rendering status option ${index}:`, option.key, 'selected:', isSelected)

                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.statusOption,
                        darkMode && styles.darkStatusOption,
                        isSelected && styles.selectedStatusOption,
                        isSelected && darkMode && styles.darkSelectedStatusOption,
                      ]}
                      onPress={() => {
                        console.log('[ManualUpdateModal] Status option pressed:', option.key)
                        setSelectedStatus(option.key)
                      }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
                    >
                      <Ionicons
                        name={option.icon}
                        size={22}
                        color={isSelected ? option.color : (darkMode ? '#fff' : '#666')}
                        style={styles.statusIcon}
                      />
                      <Text style={[
                        styles.statusText,
                        darkMode && styles.darkText,
                        isSelected && { color: option.color, fontWeight: '600' }
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>

              {/* Thời gian check-in/check-out */}
              {requiresTimeInput() && (
                <View style={styles.timeInputContainer}>
                  <Text style={[
                    styles.statusOptionTitle,
                    darkMode && styles.darkText
                  ]}>
                    {t('Thời gian chấm công')}
                  </Text>

                  {/* Check-in time */}
                  <View style={styles.timeInputRow}>
                    <Text style={[
                      styles.timeInputLabel,
                      darkMode && styles.darkText
                    ]}>
                      {t('Vào:')}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.timeInput,
                        darkMode && styles.darkTimeInput
                      ]}
                      onPress={() => {
                        console.log('[ManualUpdateModal] Check-in time input pressed')
                        setShowCheckInPicker(true)
                      }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={[
                        styles.timeInputText,
                        darkMode && styles.darkText,
                        !checkInTime && styles.placeholderText
                      ]}>
                        {checkInTime || t('Chọn thời gian')}
                      </Text>
                      <Ionicons
                        name="time-outline"
                        size={20}
                        color={darkMode ? '#fff' : '#666'}
                        style={styles.timeIcon}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Check-out time */}
                  <View style={styles.timeInputRow}>
                    <Text style={[
                      styles.timeInputLabel,
                      darkMode && styles.darkText
                    ]}>
                      {t('Ra:')}
                    </Text>
                    <TouchableOpacity
                      style={[
                        styles.timeInput,
                        darkMode && styles.darkTimeInput
                      ]}
                      onPress={() => {
                        console.log('[ManualUpdateModal] Check-out time input pressed')
                        setShowCheckOutPicker(true)
                      }}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text style={[
                        styles.timeInputText,
                        darkMode && styles.darkText,
                        !checkOutTime && styles.placeholderText
                      ]}>
                        {checkOutTime || t('Chọn thời gian')}
                      </Text>
                      <Ionicons
                        name="time-outline"
                        size={20}
                        color={darkMode ? '#fff' : '#666'}
                        style={styles.timeIcon}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              </ScrollView>

              {/* Buttons - Fixed at bottom */}
              <View style={[
                styles.buttonContainer,
                darkMode && styles.darkButtonContainer
              ]}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    darkMode && styles.darkCancelButton
                  ]}
                  onPress={() => {
                    console.log('[ManualUpdateModal] Cancel button pressed')
                    onClose()
                  }}
                  disabled={loading}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[
                    styles.cancelButtonText,
                    darkMode && styles.darkText
                  ]}>
                    {t('Hủy')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    loading && styles.disabledButton
                  ]}
                  onPress={handleSave}
                  disabled={loading}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? t('Đang lưu...') : t('Lưu')}
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Time Pickers - Separate modals for better mobile support */}
      {showCheckInPicker && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showCheckInPicker}
          onRequestClose={() => setShowCheckInPicker(false)}
        >
          <View style={styles.pickerOverlay}>
            <View style={[styles.pickerContainer, darkMode && styles.darkPickerContainer]}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity
                  onPress={() => setShowCheckInPicker(false)}
                  style={styles.pickerButton}
                >
                  <Text style={[styles.pickerButtonText, darkMode && styles.darkText]}>
                    {t('Hủy')}
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.pickerTitle, darkMode && styles.darkText]}>
                  {t('Chọn giờ vào')}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCheckInPicker(false)}
                  style={styles.pickerButton}
                >
                  <Text style={[styles.pickerButtonText, styles.doneButton]}>
                    {t('Xong')}
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={createTimeDate(checkInTime)}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={handleCheckInTimeChange}
                themeVariant={darkMode ? 'dark' : 'light'}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}

      {showCheckOutPicker && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={showCheckOutPicker}
          onRequestClose={() => setShowCheckOutPicker(false)}
        >
          <View style={styles.pickerOverlay}>
            <View style={[styles.pickerContainer, darkMode && styles.darkPickerContainer]}>
              <View style={styles.pickerHeader}>
                <TouchableOpacity
                  onPress={() => setShowCheckOutPicker(false)}
                  style={styles.pickerButton}
                >
                  <Text style={[styles.pickerButtonText, darkMode && styles.darkText]}>
                    {t('Hủy')}
                  </Text>
                </TouchableOpacity>
                <Text style={[styles.pickerTitle, darkMode && styles.darkText]}>
                  {t('Chọn giờ ra')}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowCheckOutPicker(false)}
                  style={styles.pickerButton}
                >
                  <Text style={[styles.pickerButtonText, styles.doneButton]}>
                    {t('Xong')}
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={createTimeDate(checkOutTime)}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={handleCheckOutTimeChange}
                themeVariant={darkMode ? 'dark' : 'light'}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  )
}

export default ManualUpdateModal

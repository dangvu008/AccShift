'use client'

import React, { useState, useContext, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { AppContext } from '../context/AppContext'
import { WORK_STATUS } from '../config/appConfig'
import styles from '../styles/components/manualUpdateModal'

const ManualUpdateModal = ({ visible, onClose, selectedDay, onStatusUpdated }) => {
  const { t, darkMode } = useContext(AppContext)

  // State cho form
  const [selectedStatus, setSelectedStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [checkInTime, setCheckInTime] = useState('')
  const [checkOutTime, setCheckOutTime] = useState('')
  const [showCheckInPicker, setShowCheckInPicker] = useState(false)
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false)
  const [loading, setLoading] = useState(false)

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
      const currentStatus = selectedDay.status || {}
      setSelectedStatus(currentStatus.status || '')
      setNotes(currentStatus.notes || '')
      setCheckInTime(currentStatus.vaoLogTime || '')
      setCheckOutTime(currentStatus.raLogTime || '')
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
    if (Platform.OS === 'android') {
      setShowCheckInPicker(false)
    }

    if (selectedTime) {
      const timeString = selectedTime.toTimeString().slice(0, 5)
      setCheckInTime(timeString)
    }
  }

  // Xử lý thay đổi thời gian check-out
  const handleCheckOutTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowCheckOutPicker(false)
    }

    if (selectedTime) {
      const timeString = selectedTime.toTimeString().slice(0, 5)
      setCheckOutTime(timeString)
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
    if (!validateForm()) return

    setLoading(true)
    try {
      // Import workStatusCalculator
      const { updateWorkStatusManually } = require('../utils/workStatusCalculator')

      // Chuẩn bị dữ liệu
      const dateKey = selectedDay.date.toISOString().split('T')[0]
      const additionalData = {
        notes,
        vaoLogTime: requiresTimeInput() ? checkInTime : null,
        raLogTime: requiresTimeInput() ? checkOutTime : null,
      }

      // Cập nhật trạng thái
      const result = await updateWorkStatusManually(dateKey, selectedStatus, additionalData)

      if (result) {
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
        Alert.alert(t('Lỗi'), t('Không thể cập nhật trạng thái'))
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái:', error)
      Alert.alert(t('Lỗi'), t('Đã xảy ra lỗi khi cập nhật trạng thái'))
    } finally {
      setLoading(false)
    }
  }

  if (!visible || !selectedDay) return null

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.overlay}>
          <View style={[
            styles.modalContainer,
            darkMode && styles.darkModalContainer
          ]}>
            {/* Header */}
            <View style={[
              styles.modalHeader,
              darkMode && styles.darkModalHeader
            ]}>
              <Text style={[styles.title, darkMode && styles.darkText]}>
                {t('Cập nhật trạng thái')}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                <Ionicons
                  name="close"
                  size={24}
                  color={darkMode ? '#fff' : '#000'}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
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

                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.key}
                    style={[
                      styles.statusOption,
                      darkMode && styles.darkStatusOption,
                      selectedStatus === option.key && styles.selectedStatusOption,
                      selectedStatus === option.key && darkMode && styles.darkSelectedStatusOption,
                    ]}
                    onPress={() => setSelectedStatus(option.key)}
                  >
                    <Ionicons
                      name={option.icon}
                      size={20}
                      color={selectedStatus === option.key ? option.color : (darkMode ? '#fff' : '#666')}
                      style={styles.statusIcon}
                    />
                    <Text style={[
                      styles.statusText,
                      darkMode && styles.darkText,
                      selectedStatus === option.key && { color: option.color }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
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
                      onPress={() => setShowCheckInPicker(true)}
                    >
                      <Text style={[
                        styles.statusText,
                        darkMode && styles.darkText
                      ]}>
                        {checkInTime || t('Chọn thời gian')}
                      </Text>
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
                      onPress={() => setShowCheckOutPicker(true)}
                    >
                      <Text style={[
                        styles.statusText,
                        darkMode && styles.darkText
                      ]}>
                        {checkOutTime || t('Chọn thời gian')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Ghi chú */}
              <View style={styles.notesContainer}>
                <Text style={[
                  styles.notesLabel,
                  darkMode && styles.darkText
                ]}>
                  {t('Ghi chú')}
                </Text>
                <TextInput
                  style={[
                    styles.notesInput,
                    darkMode && styles.darkNotesInput
                  ]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={t('Nhập ghi chú (tùy chọn)')}
                  placeholderTextColor={darkMode ? '#888' : '#666'}
                  multiline
                  numberOfLines={4}
                />
              </View>

              {/* Buttons */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    darkMode && styles.darkCancelButton
                  ]}
                  onPress={onClose}
                  disabled={loading}
                >
                  <Text style={[
                    styles.cancelButtonText,
                    darkMode && styles.darkText
                  ]}>
                    {t('Hủy')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? t('Đang lưu...') : t('Lưu')}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Time Pickers */}
            {showCheckInPicker && (
              <DateTimePicker
                value={createTimeDate(checkInTime)}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleCheckInTimeChange}
                themeVariant={darkMode ? 'dark' : 'light'}
              />
            )}

            {showCheckOutPicker && (
              <DateTimePicker
                value={createTimeDate(checkOutTime)}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleCheckOutTimeChange}
                themeVariant={darkMode ? 'dark' : 'light'}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export default ManualUpdateModal

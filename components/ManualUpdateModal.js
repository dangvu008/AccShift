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
  SafeAreaView,
} from 'react-native'

import { Ionicons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import { WORK_STATUS } from '../config/appConfig'
import styles from '../styles/components/manualUpdateModal'
import TimePickerModal from './TimePickerModal'

// Screen dimensions available if needed
// const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const ManualUpdateModal = ({ visible, onClose, selectedDay, onStatusUpdated }) => {
  const { t, darkMode } = useContext(AppContext)

  // State cho form
  const [selectedStatus, setSelectedStatus] = useState('')
  const [checkInTime, setCheckInTime] = useState('')
  const [checkOutTime, setCheckOutTime] = useState('')
  const [showCheckInPicker, setShowCheckInPicker] = useState(true)
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(true)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [loading, setLoading] = useState(false)

  // Component lifecycle tracking
  useEffect(() => {
    if (visible && selectedDay) {
      // Component is now visible with selected day
    }
  }, [visible, selectedDay])

  // Kiểm tra xem ngày được chọn có phải là ngày trong tương lai không
  const isFutureDate = () => {
    if (!selectedDay?.date) return false

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const selectedDate = new Date(selectedDay.date)
    selectedDate.setHours(0, 0, 0, 0)

    return selectedDate > today
  }

  // Danh sách tất cả trạng thái có thể chọn
  const allStatusOptions = [
    {
      key: WORK_STATUS.DU_CONG,
      label: t('Đủ công'),
      icon: 'checkmark-circle',
      color: '#4CAF50',
      requiresTime: true,
      allowedForFuture: false, // Không cho phép cho ngày tương lai
    },
    {
      key: WORK_STATUS.DI_MUON,
      label: t('Đi muộn'),
      icon: 'time',
      color: '#FF9800',
      requiresTime: true,
      allowedForFuture: false, // Không cho phép cho ngày tương lai
    },
    {
      key: WORK_STATUS.VE_SOM,
      label: t('Về sớm'),
      icon: 'exit',
      color: '#FF9800',
      requiresTime: true,
      allowedForFuture: false, // Không cho phép cho ngày tương lai
    },
    {
      key: WORK_STATUS.DI_MUON_VE_SOM,
      label: t('Đi muộn & về sớm'),
      icon: 'swap-horizontal',
      color: '#FF5722',
      requiresTime: true,
      allowedForFuture: false, // Không cho phép cho ngày tương lai
    },
    {
      key: WORK_STATUS.THIEU_LOG,
      label: t('Thiếu chấm công'),
      icon: 'warning',
      color: '#FF9800',
      requiresTime: false,
      allowedForFuture: false, // Không cho phép cho ngày tương lai
    },
    {
      key: WORK_STATUS.NGHI_PHEP,
      label: t('Nghỉ phép'),
      icon: 'calendar',
      color: '#2196F3',
      requiresTime: false,
      allowedForFuture: true, // Cho phép cho ngày tương lai
    },
    {
      key: WORK_STATUS.NGHI_BENH,
      label: t('Nghỉ bệnh'),
      icon: 'medical',
      color: '#9C27B0',
      requiresTime: false,
      allowedForFuture: true, // Cho phép cho ngày tương lai
    },
    {
      key: WORK_STATUS.NGHI_LE,
      label: t('Nghỉ lễ'),
      icon: 'gift',
      color: '#E91E63',
      requiresTime: false,
      allowedForFuture: true, // Cho phép cho ngày tương lai
    },
    {
      key: WORK_STATUS.VANG_MAT,
      label: t('Vắng không lý do'),
      icon: 'close-circle',
      color: '#F44336',
      requiresTime: false,
      allowedForFuture: true, // Cho phép cho ngày tương lai
    },
  ]

  // Lọc trạng thái dựa trên ngày được chọn
  const statusOptions = allStatusOptions.filter(option => {
    if (isFutureDate()) {
      // Nếu là ngày tương lai, chỉ hiển thị các trạng thái nghỉ
      return option.allowedForFuture
    }
    // Nếu không phải ngày tương lai, hiển thị tất cả trạng thái
    return true
  })

  // Debug log
  console.log(`[ManualUpdateModal] Ngày tương lai: ${isFutureDate()}, Trạng thái có thể chọn: ${statusOptions.length}/${allStatusOptions.length}`)

  // Reset form khi modal mở
  useEffect(() => {
    if (visible && selectedDay) {
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
    // Chỉ hiển thị time input khi đã chọn trạng thái và trạng thái đó cần thời gian
    if (!selectedStatus) return false

    const option = statusOptions.find(opt => opt.key === selectedStatus)
    return option?.requiresTime || false
  }

  // Kiểm tra xem có nên hiển thị time input container không
  const shouldShowTimeInput = () => {
    return selectedStatus && requiresTimeInput()
  }

  // Track selected status changes for time input requirements
  useEffect(() => {
    const handleStatusChange = async () => {
      // Khi thay đổi trạng thái, reset thời gian nếu không cần thiết
      if (!requiresTimeInput()) {
        setCheckInTime('')
        setCheckOutTime('')
        setShowCheckInPicker(false)
        setShowCheckOutPicker(false)
      } else if (selectedStatus === WORK_STATUS.DU_CONG && selectedDay) {
        // Nếu chọn "Đủ công", tự động điền thời gian ca làm việc cho ngày được chọn
        try {
          const shiftForDay = await getShiftForSelectedDay()

          if (shiftForDay) {
            console.log('[ManualUpdateModal] Auto-filling shift times for DU_CONG:', shiftForDay)
            setCheckInTime(shiftForDay.startTime || '08:00')
            setCheckOutTime(shiftForDay.officeEndTime || shiftForDay.endTime || '17:00')
          } else {
            // Fallback nếu không có ca làm việc cho ngày này
            console.log('[ManualUpdateModal] No shift found for selected day, using default times')
            setCheckInTime('08:00')
            setCheckOutTime('17:00')
          }
        } catch (error) {
          console.error('[ManualUpdateModal] Error getting shift for selected day:', error)
          // Fallback với thời gian mặc định
          setCheckInTime('08:00')
          setCheckOutTime('17:00')
        }
      }
    }

    handleStatusChange()
  }, [selectedStatus, requiresTimeInput, selectedDay])

  /**
   * Format ngày hiển thị theo định dạng tiếng Việt
   * @param {Date|string} date - Ngày cần format
   * @returns {string} Chuỗi ngày đã format
   */
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

  /**
   * Xử lý thay đổi thời gian check-in
   * @param {Object} event - Event từ DateTimePicker
   * @param {Date} selectedTime - Thời gian được chọn
   */
  const handleCheckInTimeChange = (event, selectedTime) => {
    console.log('[ManualUpdateModal] Check-in time change:', { event: event?.type, selectedTime })

    if (selectedTime && event?.type !== 'dismissed') {
      const timeString = selectedTime.toTimeString().slice(0, 5)
      console.log('[ManualUpdateModal] Setting check-in time:', timeString)
      setCheckInTime(timeString)
    }
  }

  /**
   * Xử lý thay đổi thời gian check-out
   * @param {Object} event - Event từ DateTimePicker
   * @param {Date} selectedTime - Thời gian được chọn
   */
  const handleCheckOutTimeChange = (event, selectedTime) => {
    console.log('[ManualUpdateModal] Check-out time change:', { event: event?.type, selectedTime })

    if (selectedTime && event?.type !== 'dismissed') {
      const timeString = selectedTime.toTimeString().slice(0, 5)
      console.log('[ManualUpdateModal] Setting check-out time:', timeString)
      setCheckOutTime(timeString)
    }
  }

  /**
   * Tạo Date object từ time string
   * @param {string} timeString - Chuỗi thời gian dạng HH:MM
   * @returns {Date} Date object
   */
  const createTimeDate = (timeString) => {
    if (!timeString) return new Date()
    const [hours, minutes] = timeString.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  // Lấy ca làm việc cho ngày được chọn
  const getShiftForSelectedDay = async () => {
    try {
      if (!selectedDay || !selectedDay.date) return null

      const { getCurrentShift } = require('../utils/database')
      const currentShift = await getCurrentShift()

      if (!currentShift) return null

      // Kiểm tra xem ca làm việc có áp dụng cho ngày được chọn không
      const dayOfWeek = selectedDay.date.getDay() // 0: CN, 1: T2, ..., 6: T7
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
      const dayCode = dayNames[dayOfWeek]

      // Kiểm tra daysApplied của ca làm việc
      if (currentShift.daysApplied && currentShift.daysApplied.includes(dayCode)) {
        return currentShift
      }

      // Nếu ca hiện tại không áp dụng cho ngày này, trả về null
      return null
    } catch (error) {
      console.error('[ManualUpdateModal] Error getting shift for selected day:', error)
      return null
    }
  }

  // Validate form
  const validateForm = async () => {
    if (!selectedStatus) {
      Alert.alert(t('Lỗi'), t('Vui lòng chọn trạng thái'))
      return false
    }

    if (shouldShowTimeInput()) {
      if (!checkInTime) {
        Alert.alert(t('Lỗi'), t('Vui lòng nhập thời gian check-in'))
        return false
      }
      if (!checkOutTime) {
        Alert.alert(t('Lỗi'), t('Vui lòng nhập thời gian check-out'))
        return false
      }

      // Kiểm tra định dạng thời gian hợp lệ
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(checkInTime)) {
        Alert.alert(t('Lỗi'), t('Định dạng thời gian check-in không hợp lệ'))
        return false
      }
      if (!timeRegex.test(checkOutTime)) {
        Alert.alert(t('Lỗi'), t('Định dạng thời gian check-out không hợp lệ'))
        return false
      }

      // Kiểm tra thời gian hợp lệ
      const checkIn = createTimeDate(checkInTime)
      const checkOut = createTimeDate(checkOutTime)

      if (checkOut <= checkIn) {
        Alert.alert(t('Lỗi'), t('Thời gian check-out phải sau thời gian check-in'))
        return false
      }

      // Kiểm tra khoảng cách thời gian hợp lý (ít nhất 30 phút)
      const timeDiffMinutes = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60)
      if (timeDiffMinutes < 30) {
        Alert.alert(t('Lỗi'), t('Khoảng cách giữa check-in và check-out phải ít nhất 30 phút'))
        return false
      }

      // Kiểm tra thời gian không quá 24 giờ
      if (timeDiffMinutes > 24 * 60) {
        Alert.alert(t('Lỗi'), t('Khoảng cách giữa check-in và check-out không được quá 24 giờ'))
        return false
      }

      // Kiểm tra thời gian có phù hợp với ca làm việc không
      const shiftForDay = await getShiftForSelectedDay()
      if (shiftForDay) {
        const shiftStartTime = createTimeDate(shiftForDay.startTime)
        const shiftEndTime = createTimeDate(shiftForDay.endTime || shiftForDay.officeEndTime)

        // Xử lý ca qua đêm
        if (shiftEndTime <= shiftStartTime) {
          shiftEndTime.setDate(shiftEndTime.getDate() + 1)
        }

        // Cho phép linh hoạt 2 giờ trước và sau ca làm việc
        const flexibleStartTime = new Date(shiftStartTime.getTime() - 2 * 60 * 60 * 1000)
        const flexibleEndTime = new Date(shiftEndTime.getTime() + 2 * 60 * 60 * 1000)

        // Kiểm tra thời gian check-in quá sớm
        if (checkIn < flexibleStartTime) {
          Alert.alert(
            t('Cảnh báo'),
            t(`Thời gian check-in (${checkInTime}) quá sớm so với ca làm việc (${shiftForDay.startTime}). Thời gian hợp lệ từ ${shiftForDay.startTime} (có thể sớm hơn 2 giờ).`)
          )
          return false
        }

        // Kiểm tra thời gian check-out quá muộn
        if (checkOut > flexibleEndTime) {
          Alert.alert(
            t('Cảnh báo'),
            t(`Thời gian check-out (${checkOutTime}) quá muộn so với ca làm việc (${shiftForDay.endTime || shiftForDay.officeEndTime}). Thời gian hợp lệ đến ${shiftForDay.endTime || shiftForDay.officeEndTime} (có thể muộn hơn 2 giờ).`)
          )
          return false
        }
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

    const isValid = await validateForm()
    if (!isValid) return

    setLoading(true)
    try {
      // Import workStatusCalculator
      const { updateWorkStatusManually } = require('../utils/workStatusCalculator')

      // Chuẩn bị dữ liệu
      const dateKey = selectedDay.date.toISOString().split('T')[0]
      const additionalData = {
        vaoLogTime: shouldShowTimeInput() ? checkInTime : null,
        raLogTime: shouldShowTimeInput() ? checkOutTime : null,
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

  console.log('[ManualUpdateModal] Rendering modal with data:', {
    visible,
    selectedDay: selectedDay?.date,
    selectedStatus,
    statusOptionsCount: statusOptions.length,
    requiresTime: requiresTimeInput(),
    checkInTime,
    checkOutTime,
    darkMode
  })

  return (
    <>
      <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={false}
      presentationStyle="overFullScreen"
      hardwareAccelerated={true}
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
                  {isFutureDate() && (
                    <View style={[
                      styles.futureNotice,
                      darkMode && styles.darkFutureNotice
                    ]}>
                      <Ionicons
                        name="information-circle"
                        size={16}
                        color={darkMode ? '#64B5F6' : '#2196F3'}
                        style={styles.futureNoticeIcon}
                      />
                      <Text style={[
                        styles.futureNoticeText,
                        darkMode && styles.darkFutureNoticeText
                      ]}>
                        {t('Ngày tương lai chỉ có thể cập nhật thành trạng thái nghỉ')}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Chọn trạng thái */}
                <View style={styles.statusDropdownContainer}>
                  <Text style={[
                    styles.statusOptionTitle,
                    darkMode && styles.darkText
                  ]}>
                    {t('Chọn trạng thái')}
                  </Text>

                  {/* Custom Dropdown */}
                  <TouchableOpacity
                    style={[
                      styles.dropdownButton,
                      darkMode && styles.darkDropdownButton,
                      showStatusDropdown && styles.dropdownButtonActive
                    ]}
                    onPress={() => {
                      console.log('[ManualUpdateModal] Dropdown button pressed')
                      setShowStatusDropdown(!showStatusDropdown)
                    }}
                    activeOpacity={0.7}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <View style={styles.dropdownButtonContent}>
                      {selectedStatus ? (
                        <View style={styles.selectedStatusDisplay}>
                          {(() => {
                            const selectedOption = statusOptions.find(opt => opt.key === selectedStatus)
                            return selectedOption ? (
                              <>
                                <Ionicons
                                  name={selectedOption.icon}
                                  size={20}
                                  color={selectedOption.color}
                                  style={styles.dropdownIcon}
                                />
                                <Text style={[
                                  styles.dropdownButtonText,
                                  darkMode && styles.darkText,
                                  { color: selectedOption.color }
                                ]}>
                                  {selectedOption.label}
                                </Text>
                              </>
                            ) : null
                          })()}
                        </View>
                      ) : (
                        <Text style={[
                          styles.dropdownButtonText,
                          styles.placeholderText,
                          darkMode && styles.darkPlaceholderText
                        ]}>
                          {t('-- Chọn trạng thái --')}
                        </Text>
                      )}
                      <Ionicons
                        name={showStatusDropdown ? "chevron-up" : "chevron-down"}
                        size={20}
                        color={darkMode ? '#fff' : '#666'}
                        style={styles.dropdownArrow}
                      />
                    </View>
                  </TouchableOpacity>

                  {/* Dropdown List */}
                  {showStatusDropdown && (
                    <>
                      {/* Overlay để đóng dropdown khi click bên ngoài */}
                      <TouchableOpacity
                        style={styles.dropdownOverlay}
                        onPress={() => setShowStatusDropdown(false)}
                        activeOpacity={1}
                      />
                      <View style={[
                        styles.dropdownList,
                        darkMode && styles.darkDropdownList
                      ]}>
                        {statusOptions.map((option, index) => (
                          <TouchableOpacity
                            key={option.key}
                            style={[
                              styles.dropdownItem,
                              darkMode && styles.darkDropdownItem,
                              index === statusOptions.length - 1 && styles.lastDropdownItem
                            ]}
                            onPress={() => {
                              console.log('[ManualUpdateModal] Status selected:', option.key)
                              setSelectedStatus(option.key)
                              setShowStatusDropdown(false)
                            }}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={option.icon}
                              size={20}
                              color={option.color}
                              style={styles.dropdownItemIcon}
                            />
                            <Text style={[
                              styles.dropdownItemText,
                              darkMode && styles.darkText
                            ]}>
                              {option.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </>
                  )}
                </View>

                {/* Thời gian check-in/check-out */}
                {shouldShowTimeInput() && (
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
                          console.log('[ManualUpdateModal] Check-in time button pressed')
                          setShowCheckInPicker(true)
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.timeInputText,
                          darkMode && styles.darkText,
                          !checkInTime && styles.placeholderText
                        ]}>
                          {checkInTime || t('Chọn thời gian')}
                        </Text>
                        <Ionicons
                          name="time"
                          size={20}
                          color={darkMode ? '#fff' : '#666'}
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
                          console.log('[ManualUpdateModal] Check-out time button pressed')
                          setShowCheckOutPicker(true)
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.timeInputText,
                          darkMode && styles.darkText,
                          !checkOutTime && styles.placeholderText
                        ]}>
                          {checkOutTime || t('Chọn thời gian')}
                        </Text>
                        <Ionicons
                          name="time"
                          size={20}
                          color={darkMode ? '#fff' : '#666'}
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
      </Modal>

    {/* Time Pickers - Render outside main modal with higher z-index */}
    <TimePickerModal
      visible={showCheckInPicker}
      value={createTimeDate(checkInTime)}
      onTimeChange={handleCheckInTimeChange}
      onClose={() => setShowCheckInPicker(false)}
      title={t('Chọn thời gian vào')}
      darkMode={darkMode}
    />

    <TimePickerModal
      visible={showCheckOutPicker}
      value={createTimeDate(checkOutTime)}
      onTimeChange={handleCheckOutTimeChange}
      onClose={() => setShowCheckOutPicker(false)}
      title={t('Chọn thời gian ra')}
      darkMode={darkMode}
    />
    </>
  )
}

export default ManualUpdateModal

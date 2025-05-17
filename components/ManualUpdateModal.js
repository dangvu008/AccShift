import React, { useState, useContext, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import { WORK_STATUS, STORAGE_KEYS } from '../config/appConfig'
import { COLORS } from '../styles/common/colors'
import { TEXT_STYLES } from '../styles/common/typography'
import DateTimePicker from '@react-native-community/datetimepicker'
import NoteFormModal from './NoteFormModal'
import { Picker } from '@react-native-picker/picker'

// Hàm định dạng thời gian
const formatTimeString = (hours, minutes) => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const ManualUpdateModal = ({ visible, onClose, selectedDay, onStatusUpdated }) => {
  const { t, darkMode, shifts, currentShift } = useContext(AppContext)

  // State cho trạng thái và ca làm việc
  const [selectedStatus, setSelectedStatus] = useState(WORK_STATUS.CHUA_CAP_NHAT)
  const [availableShifts, setAvailableShifts] = useState([])
  const [selectedShift, setSelectedShift] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // State cho thời gian check-in/check-out
  const [checkInTime, setCheckInTime] = useState(new Date())
  const [checkOutTime, setCheckOutTime] = useState(new Date())
  const [showCheckInPicker, setShowCheckInPicker] = useState(false)
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false)

  // State cho ghi chú
  const [notes, setNotes] = useState('')

  // Định dạng thời gian hiển thị
  const [checkInTimeString, setCheckInTimeString] = useState('08:00')
  const [checkOutTimeString, setCheckOutTimeString] = useState('17:00')

  // Tải dữ liệu khi modal hiển thị
  useEffect(() => {
    if (visible && selectedDay) {
      loadData()
    }
  }, [visible, selectedDay])

  // Tải danh sách ca làm việc
  useEffect(() => {
    if (shifts && shifts.length > 0) {
      setAvailableShifts(shifts)
    } else {
      loadShifts()
    }
  }, [shifts])

  // Tải dữ liệu cho ngày được chọn
  const loadData = useCallback(async () => {
    if (!selectedDay) return

    setIsLoading(true)
    try {
      console.log(`[DEBUG] Tải dữ liệu cho ngày: ${selectedDay.date}`)

      // Tải trạng thái hiện tại
      const storage = require('../utils/storage').default
      const currentStatus = await storage.getDailyWorkStatus(selectedDay.date)

      if (currentStatus) {
        console.log(`[DEBUG] Đã tải trạng thái: ${currentStatus.status}`)
        setSelectedStatus(currentStatus.status)

        // Tải ca làm việc
        if (currentStatus.shiftId) {
          const shift = await storage.getShiftById(currentStatus.shiftId)
          if (shift) {
            setSelectedShift(shift)
          } else if (currentShift) {
            setSelectedShift(currentShift)
          }
        } else if (currentShift) {
          setSelectedShift(currentShift)
        }

        // Tải thời gian check-in/check-out
        if (currentStatus.vaoLogTime) {
          setCheckInTimeString(currentStatus.vaoLogTime)
          const [hours, minutes] = currentStatus.vaoLogTime.split(':').map(Number)
          const date = new Date()
          date.setHours(hours, minutes, 0, 0)
          setCheckInTime(date)
        }

        if (currentStatus.raLogTime) {
          setCheckOutTimeString(currentStatus.raLogTime)
          const [hours, minutes] = currentStatus.raLogTime.split(':').map(Number)
          const date = new Date()
          date.setHours(hours, minutes, 0, 0)
          setCheckOutTime(date)
        }

        // Tải ghi chú
        if (currentStatus.notes) {
          setNotes(currentStatus.notes)
        }
      } else {
        // Nếu không có trạng thái, sử dụng ca làm việc hiện tại
        setSelectedStatus(WORK_STATUS.CHUA_CAP_NHAT)
        if (currentShift) {
          setSelectedShift(currentShift)

          // Đặt thời gian mặc định từ ca làm việc
          if (currentShift.startTime) {
            setCheckInTimeString(currentShift.startTime)
            const [hours, minutes] = currentShift.startTime.split(':').map(Number)
            const date = new Date()
            date.setHours(hours, minutes, 0, 0)
            setCheckInTime(date)
          }

          if (currentShift.endTime) {
            setCheckOutTimeString(currentShift.endTime)
            const [hours, minutes] = currentShift.endTime.split(':').map(Number)
            const date = new Date()
            date.setHours(hours, minutes, 0, 0)
            setCheckOutTime(date)
          }
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedDay, currentShift])

  // Tải danh sách ca làm việc
  const loadShifts = useCallback(async () => {
    try {
      const storage = require('../utils/storage').default
      const shifts = await storage.getShifts()
      if (shifts && shifts.length > 0) {
        setAvailableShifts(shifts)

        // Nếu chưa có ca làm việc được chọn, sử dụng ca đầu tiên
        if (!selectedShift) {
          setSelectedShift(shifts[0])
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách ca làm việc:', error)
    }
  }, [selectedShift])

  // Xử lý khi thay đổi thời gian check-in
  const handleCheckInTimeChange = (event, selectedDate) => {
    setShowCheckInPicker(Platform.OS === 'ios')
    if (selectedDate) {
      setCheckInTime(selectedDate)
      setCheckInTimeString(formatTimeString(selectedDate.getHours(), selectedDate.getMinutes()))
    }
  }

  // Xử lý khi thay đổi thời gian check-out
  const handleCheckOutTimeChange = (event, selectedDate) => {
    setShowCheckOutPicker(Platform.OS === 'ios')
    if (selectedDate) {
      setCheckOutTime(selectedDate)
      setCheckOutTimeString(formatTimeString(selectedDate.getHours(), selectedDate.getMinutes()))
    }
  }

  // Lưu trạng thái
  const handleSave = async () => {
    if (!selectedDay || !selectedStatus) return

    setIsSaving(true)
    try {
      console.log(`[DEBUG] Lưu trạng thái: ${selectedStatus} cho ngày ${selectedDay.date}`)

      // Tạo dữ liệu bổ sung
      const additionalData = {
        shiftId: selectedShift?.id,
        shiftName: selectedShift?.name,
        vaoLogTime: checkInTimeString,
        raLogTime: checkOutTimeString,
        notes: notes,
      }

      // Cập nhật trạng thái
      const { updateWorkStatusManually } = require('../utils/workStatusCalculator')
      const updatedStatus = await updateWorkStatusManually(
        selectedDay.date,
        selectedStatus,
        additionalData
      )

      if (updatedStatus) {
        console.log(`[DEBUG] Đã cập nhật trạng thái thành công`)

        // Thông báo cho component cha
        if (typeof onStatusUpdated === 'function') {
          onStatusUpdated(updatedStatus)
        }

        // Đóng modal
        onClose()
      }
    } catch (error) {
      console.error('Lỗi khi lưu trạng thái:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Render danh sách trạng thái
  const renderStatusOptions = () => {
    const statusOptions = [
      { value: WORK_STATUS.DU_CONG, label: t('Đủ công') },
      { value: WORK_STATUS.DI_MUON, label: t('Đi muộn') },
      { value: WORK_STATUS.VE_SOM, label: t('Về sớm') },
      { value: WORK_STATUS.DI_MUON_VE_SOM, label: t('Đi muộn và về sớm') },
      { value: WORK_STATUS.THIEU_LOG, label: t('Thiếu log') },
      { value: WORK_STATUS.QUEN_CHECK_OUT, label: t('Quên check-out') },
      { value: WORK_STATUS.NGHI_PHEP, label: t('Nghỉ phép') },
      { value: WORK_STATUS.NGHI_BENH, label: t('Nghỉ bệnh') },
      { value: WORK_STATUS.NGHI_LE, label: t('Nghỉ lễ') },
      { value: WORK_STATUS.NGHI_THUONG, label: t('Nghỉ thường') },
      { value: WORK_STATUS.VANG_MAT, label: t('Vắng mặt') },
      { value: WORK_STATUS.CHUA_CAP_NHAT, label: t('Chưa cập nhật') },
    ]

    return (
      <Picker
        selectedValue={selectedStatus}
        onValueChange={(value) => setSelectedStatus(value)}
        style={[styles.picker, darkMode && styles.darkPicker]}
        dropdownIconColor={darkMode ? COLORS.TEXT_DARK : COLORS.TEXT_LIGHT}
      >
        {statusOptions.map((option) => (
          <Picker.Item
            key={option.value}
            label={option.label}
            value={option.value}
            style={[styles.pickerItem, darkMode && styles.darkPickerItem]}
          />
        ))}
      </Picker>
    )
  }

  // Render danh sách ca làm việc
  const renderShiftOptions = () => {
    if (!availableShifts || availableShifts.length === 0) {
      return (
        <View style={styles.noShiftsContainer}>
          <Text style={[styles.noShiftsText, darkMode && styles.darkText]}>
            {t('Không có ca làm việc')}
          </Text>
        </View>
      )
    }

    return (
      <Picker
        selectedValue={selectedShift?.id}
        onValueChange={(value) => {
          const shift = availableShifts.find((s) => s.id === value)
          setSelectedShift(shift)
        }}
        style={[styles.picker, darkMode && styles.darkPicker]}
        dropdownIconColor={darkMode ? COLORS.TEXT_DARK : COLORS.TEXT_LIGHT}
      >
        {availableShifts.map((shift) => (
          <Picker.Item
            key={shift.id}
            label={shift.name}
            value={shift.id}
            style={[styles.pickerItem, darkMode && styles.darkPickerItem]}
          />
        ))}
      </Picker>
    )
  }

  return (
    <NoteFormModal
      visible={visible}
      onClose={onClose}
      title={selectedDay ? `${t('Cập nhật trạng thái')} - ${selectedDay.date}` : t('Cập nhật trạng thái')}
    >
      <ScrollView style={styles.scrollView}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={darkMode ? COLORS.PRIMARY_DARK : COLORS.PRIMARY} />
            <Text style={[styles.loadingText, darkMode && styles.darkText]}>
              {t('Đang tải dữ liệu...')}
            </Text>
          </View>
        ) : (
          <View style={styles.formContainer}>
            {/* Trạng thái */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, darkMode && styles.darkText]}>
                {t('Trạng thái')}
              </Text>
              {renderStatusOptions()}
            </View>

            {/* Ca làm việc */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, darkMode && styles.darkText]}>
                {t('Ca làm việc')}
              </Text>
              {renderShiftOptions()}
            </View>

            {/* Thời gian check-in */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, darkMode && styles.darkText]}>
                {t('Thời gian vào')}
              </Text>
              <TouchableOpacity
                style={[styles.timeInput, darkMode && styles.darkTimeInput]}
                onPress={() => setShowCheckInPicker(true)}
              >
                <Text style={[styles.timeText, darkMode && styles.darkText]}>
                  {checkInTimeString}
                </Text>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={24}
                  color={darkMode ? COLORS.TEXT_DARK : COLORS.TEXT_LIGHT}
                />
              </TouchableOpacity>
              {showCheckInPicker && (
                <DateTimePicker
                  value={checkInTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleCheckInTimeChange}
                />
              )}
            </View>

            {/* Thời gian check-out */}
            <View style={styles.formGroup}>
              <Text style={[styles.label, darkMode && styles.darkText]}>
                {t('Thời gian ra')}
              </Text>
              <TouchableOpacity
                style={[styles.timeInput, darkMode && styles.darkTimeInput]}
                onPress={() => setShowCheckOutPicker(true)}
              >
                <Text style={[styles.timeText, darkMode && styles.darkText]}>
                  {checkOutTimeString}
                </Text>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={24}
                  color={darkMode ? COLORS.TEXT_DARK : COLORS.TEXT_LIGHT}
                />
              </TouchableOpacity>
              {showCheckOutPicker && (
                <DateTimePicker
                  value={checkOutTime}
                  mode="time"
                  is24Hour={true}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleCheckOutTimeChange}
                />
              )}
            </View>

            {/* Nút lưu */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.disabledButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>{t('Lưu')}</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.cancelButton, darkMode && styles.darkCancelButton]}
                onPress={onClose}
                disabled={isSaving}
              >
                <Text style={[styles.cancelButtonText, darkMode && styles.darkCancelButtonText]}>
                  {t('Hủy')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </NoteFormModal>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    ...TEXT_STYLES.body,
    color: COLORS.TEXT_LIGHT,
  },
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    ...TEXT_STYLES.bodyLarge,
    fontWeight: 'bold',
    marginBottom: 8,
    color: COLORS.TEXT_LIGHT,
  },
  picker: {
    backgroundColor: COLORS.SECONDARY_CARD_LIGHT,
    borderRadius: 8,
    color: COLORS.TEXT_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
    fontWeight: 'bold',
  },
  darkPicker: {
    backgroundColor: COLORS.SECONDARY_CARD_DARK,
    color: COLORS.TEXT_DARK,
    borderColor: COLORS.BORDER_DARK,
    fontWeight: 'bold',
  },
  pickerItem: {
    ...TEXT_STYLES.body,
    color: COLORS.TEXT_LIGHT,
    fontWeight: 'bold',
  },
  darkPickerItem: {
    color: COLORS.TEXT_DARK,
    fontWeight: 'bold',
  },
  timeInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.SECONDARY_CARD_LIGHT,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
  },
  darkTimeInput: {
    backgroundColor: COLORS.SECONDARY_CARD_DARK,
    borderColor: COLORS.BORDER_DARK,
  },
  timeText: {
    ...TEXT_STYLES.body,
    color: COLORS.TEXT_LIGHT,
    fontWeight: 'bold',
  },
  darkText: {
    color: COLORS.TEXT_DARK,
  },
  noShiftsContainer: {
    padding: 12,
    backgroundColor: COLORS.SECONDARY_CARD_LIGHT,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
  },
  noShiftsText: {
    ...TEXT_STYLES.body,
    color: COLORS.TEXT_LIGHT,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  saveButton: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginRight: 8,
    elevation: 2,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    ...TEXT_STYLES.button,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.CARD_LIGHT,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: COLORS.BORDER_LIGHT,
  },
  darkCancelButton: {
    backgroundColor: COLORS.CARD_DARK,
    borderColor: COLORS.BORDER_DARK,
  },
  cancelButtonText: {
    color: COLORS.TEXT_LIGHT,
    ...TEXT_STYLES.button,
  },
  darkCancelButtonText: {
    color: COLORS.TEXT_DARK,
  },
})

export default ManualUpdateModal

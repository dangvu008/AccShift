'use client'

import React, { useState, useContext, useEffect } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  FlatList,
} from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import { WORK_STATUS } from '../config/appConfig'

// Import storage và workStatusCalculator
import storage from '../utils/storage'
import { updateWorkStatusManually } from '../utils/workStatusCalculator'

// Thành phần SelectDropdown thay thế cho Picker
const SelectDropdown = ({
  items,
  selectedValue,
  onValueChange,
  placeholder,
  darkMode,
}) => {
  // Sử dụng Picker thay vì custom dropdown để tránh lỗi
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return (
      <View style={[styles.dropdownContainer, darkMode && styles.darkDropdownContainer]}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={[styles.picker, darkMode && styles.darkPicker]}
          itemStyle={[styles.pickerItem, darkMode && styles.darkPickerItem]}
        >
          <Picker.Item label={placeholder || 'Chọn...'} value="" />
          {items.map((item) => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
    )
  }

  // Fallback to custom dropdown for web or other platforms
  const [visible, setVisible] = useState(false)

  // Tìm item được chọn
  const selectedItem = items.find((item) => item.value === selectedValue) || {
    label: placeholder || 'Chọn...',
  }

  return (
    <View style={styles.dropdownContainer}>
      <TouchableOpacity
        style={[styles.dropdownButton, darkMode && styles.darkDropdownButton]}
        onPress={() => setVisible(true)}
      >
        <Text style={[styles.dropdownButtonText, darkMode && styles.darkText]}>
          {selectedItem.label}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={darkMode ? '#fff' : '#000'}
        />
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View
            style={[
              styles.dropdownListContainer,
              darkMode && styles.darkDropdownListContainer,
            ]}
          >
            <FlatList
              data={items}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.dropdownItem,
                    selectedValue === item.value && styles.selectedItem,
                  ]}
                  onPress={() => {
                    onValueChange(item.value)
                    setVisible(false)
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      darkMode && styles.darkText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const ManualUpdateModal = ({
  visible,
  onClose,
  selectedDay,
  onStatusUpdated,
}) => {
  const { t, darkMode, shifts, notifyWorkStatusUpdate } = useContext(AppContext)

  // State cho form
  const [checkInTime, setCheckInTime] = useState(null)
  const [checkOutTime, setCheckOutTime] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedShiftId, setSelectedShiftId] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [dayStatus, setDayStatus] = useState(null)
  const [availableShifts, setAvailableShifts] = useState([])

  // State cho time picker
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [timePickerMode, setTimePickerMode] = useState('time')
  const [currentEditingTime, setCurrentEditingTime] = useState(null) // 'checkIn' hoặc 'checkOut'
  const [timePickerValue, setTimePickerValue] = useState(new Date())

  // Định dạng ngày tháng
  const formatDateKey = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(d.getDate()).padStart(2, '0')}`
  }

  // Tải dữ liệu khi modal mở
  useEffect(() => {
    if (visible && selectedDay) {
      loadDayData()
    }
  }, [visible, selectedDay])

  // Tải dữ liệu ngày
  const loadDayData = async () => {
    if (!selectedDay) return

    setIsLoading(true)
    try {
      const dateKey = formatDateKey(selectedDay.date)

      // Tải trạng thái làm việc
      const status = await storage.getDailyWorkStatus(dateKey)
      setDayStatus(status || {})

      // Thiết lập giá trị mặc định
      if (status) {
        setSelectedStatus(status.status || WORK_STATUS.CHUA_CAP_NHAT)
        setSelectedShiftId(status.shiftId || '')
        setNotes(status.notes || '')

        // Thiết lập thời gian check-in/check-out
        if (status.vaoLogTime) {
          setCheckInTime(status.vaoLogTime)
        }
        if (status.raLogTime) {
          setCheckOutTime(status.raLogTime)
        }
      } else {
        resetForm()
      }

      // Tải danh sách ca làm việc
      await loadAvailableShifts()
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu ngày:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Tải danh sách ca làm việc
  const loadAvailableShifts = async () => {
    try {
      // Lấy danh sách ca làm việc từ storage
      const allShifts = await storage.getShifts()
      setAvailableShifts(allShifts || [])

      // Nếu chưa có ca được chọn và có ca làm việc
      if (!selectedShiftId && allShifts && allShifts.length > 0) {
        // Tìm ca làm việc đang áp dụng
        const activeShift = await storage.getActiveShift()
        if (activeShift) {
          setSelectedShiftId(activeShift.id)
        } else if (allShifts.length > 0) {
          setSelectedShiftId(allShifts[0].id)
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách ca làm việc:', error)
    }
  }

  // Reset form
  const resetForm = () => {
    setCheckInTime(null)
    setCheckOutTime(null)
    setSelectedStatus(WORK_STATUS.CHUA_CAP_NHAT)
    setSelectedShiftId('')
    setNotes('')
  }

  // Xử lý khi người dùng muốn mở time picker
  const handleOpenTimePicker = (type) => {
    // Đặt loại thời gian đang chỉnh sửa (checkIn hoặc checkOut)
    setCurrentEditingTime(type)

    // Đặt chế độ picker là time
    setTimePickerMode('time')

    // Thiết lập giá trị mặc định cho time picker
    const now = new Date()
    let timeValue = new Date()

    if (type === 'checkIn' && checkInTime) {
      // Nếu đã có giá trị check-in, sử dụng giá trị đó
      const [hours, minutes] = checkInTime.split(':').map(Number)
      timeValue.setHours(hours, minutes, 0, 0)
    } else if (type === 'checkOut' && checkOutTime) {
      // Nếu đã có giá trị check-out, sử dụng giá trị đó
      const [hours, minutes] = checkOutTime.split(':').map(Number)
      timeValue.setHours(hours, minutes, 0, 0)
    } else {
      // Nếu chưa có giá trị, sử dụng thời gian hiện tại
      timeValue = now
    }

    setTimePickerValue(timeValue)

    // Hiển thị time picker
    setShowTimePicker(true)
  }

  // Xử lý khi người dùng chọn thời gian
  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false)
    }

    if (event.type === 'dismissed') {
      return
    }

    if (selectedTime) {
      // Định dạng thời gian (HH:MM)
      const hours = selectedTime.getHours().toString().padStart(2, '0')
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0')
      const formattedTime = `${hours}:${minutes}`

      // Cập nhật state tương ứng
      if (currentEditingTime === 'checkIn') {
        setCheckInTime(formattedTime)
      } else if (currentEditingTime === 'checkOut') {
        setCheckOutTime(formattedTime)
      }
    }
  }

  // Xử lý khi người dùng xóa thời gian
  const handleClearTime = (type) => {
    if (type === 'checkIn') {
      setCheckInTime(null)
    } else if (type === 'checkOut') {
      setCheckOutTime(null)
    }
  }

  // Xử lý khi người dùng lưu thay đổi
  const handleSaveChanges = async () => {
    if (!selectedDay) return

    // Kiểm tra dữ liệu
    if (
      selectedStatus === WORK_STATUS.DU_CONG &&
      (!checkInTime || !checkOutTime)
    ) {
      Alert.alert(
        t('Lỗi'),
        t(
          'Bạn cần nhập đủ thời gian check-in và check-out khi chọn trạng thái Đủ công'
        )
      )
      return
    }

    // Kiểm tra thời gian check-out có sau check-in không
    if (checkInTime && checkOutTime) {
      const [inHours, inMinutes] = checkInTime.split(':').map(Number)
      const [outHours, outMinutes] = checkOutTime.split(':').map(Number)

      // Tạo đối tượng Date để so sánh
      const inDate = new Date()
      inDate.setHours(inHours, inMinutes, 0, 0)

      const outDate = new Date()
      outDate.setHours(outHours, outMinutes, 0, 0)

      // Nếu check-out trước check-in (không phải ca qua đêm)
      if (outDate <= inDate) {
        // Hiển thị cảnh báo
        Alert.alert(
          t('Cảnh báo'),
          t(
            'Thời gian check-out phải sau thời gian check-in. Bạn có muốn tiếp tục?'
          ),
          [
            {
              text: t('Hủy'),
              style: 'cancel',
            },
            {
              text: t('Tiếp tục'),
              onPress: () => saveWorkStatus(),
            },
          ]
        )
        return
      }
    }

    // Lưu trạng thái làm việc
    saveWorkStatus()
  }

  // Lưu trạng thái làm việc
  const saveWorkStatus = async () => {
    if (!selectedDay) return

    setIsLoading(true)
    try {
      const dateKey = formatDateKey(selectedDay.date)

      // Chuẩn bị dữ liệu bổ sung
      const additionalData = {
        shiftId: selectedShiftId,
        vaoLogTime: checkInTime,
        raLogTime: checkOutTime,
        notes: notes,
      }

      // Cập nhật trạng thái làm việc
      const result = await updateWorkStatusManually(
        dateKey,
        selectedStatus,
        additionalData
      )

      if (result) {
        // Thông báo cho các thành phần khác về sự thay đổi trạng thái
        if (typeof notifyWorkStatusUpdate === 'function') {
          notifyWorkStatusUpdate()
        }

        // Gọi callback
        if (typeof onStatusUpdated === 'function') {
          onStatusUpdated(result)
        }

        // Đóng modal
        onClose()
      }
    } catch (error) {
      console.error('Lỗi khi lưu trạng thái làm việc:', error)
      Alert.alert(t('Lỗi'), t('Đã xảy ra lỗi khi lưu trạng thái làm việc'))
    } finally {
      setIsLoading(false)
    }
  }

  // Render danh sách trạng thái
  const renderStatusOptions = () => {
    const statuses = [
      { value: WORK_STATUS.CHUA_CAP_NHAT, label: t('Tính theo Giờ Chấm công') },
      { value: WORK_STATUS.DU_CONG, label: t('Đủ công') },
      { value: WORK_STATUS.NGHI_PHEP, label: t('Nghỉ Phép') },
      { value: WORK_STATUS.NGHI_BENH, label: t('Nghỉ Bệnh') },
      { value: WORK_STATUS.NGHI_LE, label: t('Nghỉ Lễ') },
      { value: WORK_STATUS.VANG_MAT, label: t('Vắng Mặt') },
      { value: WORK_STATUS.NGHI_THUONG, label: t('Ngày nghỉ thông thường') },
    ]

    return statuses
  }

  // Render danh sách ca làm việc
  const renderShiftOptions = () => {
    if (!availableShifts || availableShifts.length === 0) {
      return [{ value: '', label: t('Không có ca làm việc') }]
    }

    return availableShifts.map((shift) => ({
      value: shift.id,
      label: shift.name,
    }))
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.modalContainer}>
          <View
            style={[styles.modalContent, darkMode && styles.darkModalContent]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, darkMode && styles.darkText]}>
                {t('Cập nhật trạng thái')} -{' '}
                {selectedDay ? formatDateKey(selectedDay.date) : ''}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons
                  name="close"
                  size={24}
                  color={darkMode ? '#fff' : '#000'}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Ca làm việc */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, darkMode && styles.darkText]}>
                  {t('Ca làm việc')}
                </Text>
                <SelectDropdown
                  items={renderShiftOptions()}
                  selectedValue={selectedShiftId}
                  onValueChange={(itemValue) => setSelectedShiftId(itemValue)}
                  placeholder={t('Chọn ca làm việc')}
                  darkMode={darkMode}
                />
              </View>

              {/* Trạng thái */}
              <View style={styles.formGroup}>
                <Text style={[styles.label, darkMode && styles.darkText]}>
                  {t('Trạng thái')}
                </Text>
                <SelectDropdown
                  items={renderStatusOptions()}
                  selectedValue={selectedStatus}
                  onValueChange={(itemValue) => setSelectedStatus(itemValue)}
                  placeholder={t('Chọn trạng thái')}
                  darkMode={darkMode}
                />
              </View>

              {/* Thời gian check-in/check-out */}
              {(selectedStatus === WORK_STATUS.CHUA_CAP_NHAT ||
                selectedStatus === WORK_STATUS.DU_CONG ||
                selectedStatus === WORK_STATUS.THIEU_LOG ||
                selectedStatus === WORK_STATUS.DI_MUON ||
                selectedStatus === WORK_STATUS.VE_SOM ||
                selectedStatus === WORK_STATUS.DI_MUON_VE_SOM) && (
                <>
                  {/* Check-in time */}
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, darkMode && styles.darkText]}>
                      {t('Check In:')}
                    </Text>
                    <View style={styles.timeInputContainer}>
                      <TouchableOpacity
                        style={[
                          styles.timeInput,
                          darkMode && styles.darkTimeInput,
                        ]}
                        onPress={() => handleOpenTimePicker('checkIn')}
                      >
                        <Text
                          style={[
                            styles.timeInputText,
                            darkMode && styles.darkTimeInputText,
                          ]}
                        >
                          {checkInTime || t('Chọn giờ')}
                        </Text>
                      </TouchableOpacity>
                      {checkInTime && (
                        <TouchableOpacity
                          style={styles.clearButton}
                          onPress={() => handleClearTime('checkIn')}
                        >
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color={darkMode ? '#fff' : '#000'}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Check-out time */}
                  <View style={styles.formGroup}>
                    <Text style={[styles.label, darkMode && styles.darkText]}>
                      {t('Check Out:')}
                    </Text>
                    <View style={styles.timeInputContainer}>
                      <TouchableOpacity
                        style={[
                          styles.timeInput,
                          darkMode && styles.darkTimeInput,
                        ]}
                        onPress={() => handleOpenTimePicker('checkOut')}
                      >
                        <Text
                          style={[
                            styles.timeInputText,
                            darkMode && styles.darkTimeInputText,
                          ]}
                        >
                          {checkOutTime || t('Chọn giờ')}
                        </Text>
                      </TouchableOpacity>
                      {checkOutTime && (
                        <TouchableOpacity
                          style={styles.clearButton}
                          onPress={() => handleClearTime('checkOut')}
                        >
                          <Ionicons
                            name="close-circle"
                            size={24}
                            color={darkMode ? '#fff' : '#000'}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, styles.cancelButtonText]}>
                  {t('Hủy')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveChanges}
                disabled={isLoading}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  {isLoading ? t('Đang lưu...') : t('Lưu thay đổi')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Time Picker cho Android */}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={timePickerValue}
          mode={timePickerMode}
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}

      {/* Time Picker cho iOS */}
      {Platform.OS === 'ios' && showTimePicker && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showTimePicker}
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.pickerModalContent,
                darkMode && styles.darkPickerModalContent,
              ]}
            >
              <View style={styles.pickerHeader}>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(false)}
                  style={styles.pickerButton}
                >
                  <Text style={styles.pickerButtonText}>{t('Hủy')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(false)}
                  style={styles.pickerButton}
                >
                  <Text style={[styles.pickerButtonText, styles.doneButton]}>
                    {t('Xong')}
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={timePickerValue}
                mode={timePickerMode}
                is24Hour={true}
                display="spinner"
                onChange={handleTimeChange}
                style={styles.iosPicker}
                themeVariant={darkMode ? 'dark' : 'light'}
              />
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  )
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkModalContent: {
    backgroundColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  darkText: {
    color: '#fff',
  },
  modalBody: {
    maxHeight: '70%',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  dropdownContainer: {
    marginBottom: 10,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  darkDropdownButton: {
    borderColor: '#555',
  },
  dropdownButtonText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdownListContainer: {
    width: '80%',
    maxHeight: '50%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkDropdownListContainer: {
    backgroundColor: '#333',
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedItem: {
    backgroundColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  darkTimeInput: {
    borderColor: '#555',
  },
  timeInputText: {
    fontSize: 16,
  },
  darkTimeInputText: {
    color: '#fff',
  },
  clearButton: {
    marginLeft: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#8a56ff',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#333',
  },
  saveButtonText: {
    color: '#fff',
  },
  pickerModalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    position: 'absolute',
    bottom: 0,
  },
  darkPickerModalContent: {
    backgroundColor: '#333',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  pickerButton: {
    paddingHorizontal: 10,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  doneButton: {
    fontWeight: 'bold',
  },
  iosPicker: {
    height: 200,
  },
  picker: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  darkPicker: {
    borderColor: '#555',
  },
  pickerItem: {
    fontSize: 16,
  },
  darkPickerItem: {
    color: '#fff',
  },
  dropdownContainer: {
    marginBottom: 10,
  },
  darkDropdownContainer: {
    borderColor: '#555',
  },
})

export default ManualUpdateModal

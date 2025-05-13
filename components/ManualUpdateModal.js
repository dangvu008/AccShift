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
import AsyncStorage from '@react-native-async-storage/async-storage'
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

  // Cập nhật khi ngôn ngữ hoặc chế độ tối/sáng thay đổi
  useEffect(() => {
    if (visible) {
      console.log('[DEBUG] Ngôn ngữ hoặc chế độ tối/sáng thay đổi, cập nhật giao diện')
      // Cập nhật lại các tùy chọn để đảm bảo ngôn ngữ được cập nhật
      const statusOptions = renderStatusOptions()
      const shiftOptions = renderShiftOptions()
    }
  }, [t, darkMode, visible])

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

      // Kiểm tra nếu có ca làm việc từ storage
      if (allShifts && allShifts.length > 0) {
        console.log(`[DEBUG] Đã tải ${allShifts.length} ca làm việc từ storage`)
        setAvailableShifts(allShifts)
      }
      // Nếu không có ca làm việc từ storage, thử lấy từ context
      else if (shifts && shifts.length > 0) {
        console.log(`[DEBUG] Sử dụng ${shifts.length} ca làm việc từ context`)
        setAvailableShifts(shifts)
      }
      // Nếu vẫn không có, thử lấy trực tiếp từ AsyncStorage
      else {
        try {
          console.log('[DEBUG] Thử lấy ca làm việc trực tiếp từ AsyncStorage')
          const shiftsJson = await AsyncStorage.getItem(STORAGE_KEYS.SHIFT_LIST)
          if (shiftsJson) {
            const parsedShifts = JSON.parse(shiftsJson)
            if (Array.isArray(parsedShifts) && parsedShifts.length > 0) {
              console.log(`[DEBUG] Đã tải ${parsedShifts.length} ca làm việc từ AsyncStorage`)
              setAvailableShifts(parsedShifts)
            }
          }
        } catch (asyncError) {
          console.error('Lỗi khi tải ca làm việc từ AsyncStorage:', asyncError)
        }
      }

      // Nếu chưa có ca được chọn và có ca làm việc
      const shiftsToUse = availableShifts.length > 0 ? availableShifts : (shifts || [])
      if (!selectedShiftId && shiftsToUse.length > 0) {
        // Tìm ca làm việc đang áp dụng
        const activeShift = await storage.getActiveShift()
        if (activeShift) {
          setSelectedShiftId(activeShift.id)
        } else if (shiftsToUse.length > 0) {
          setSelectedShiftId(shiftsToUse[0].id)
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách ca làm việc:', error)

      // Tạo ca làm việc mặc định nếu không thể tải dữ liệu
      if (availableShifts.length === 0) {
        const defaultShifts = [
          {
            id: 'default_shift',
            name: 'Ca mặc định',
            startTime: '08:00',
            endTime: '17:00',
            breakMinutes: 60,
          }
        ]
        console.log('[DEBUG] Sử dụng ca làm việc mặc định do không thể tải dữ liệu')
        setAvailableShifts(defaultShifts)
        setSelectedShiftId('default_shift')
      }
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

      // Kiểm tra xem có phải ca qua đêm không
      const isOvernightShift = outHours < inHours || (outHours === inHours && outMinutes < inMinutes)

      // Nếu check-out trước check-in và không phải ca qua đêm
      if (outDate <= inDate && !isOvernightShift) {
        // Hiển thị cảnh báo
        Alert.alert(
          t('Cảnh báo'),
          t(
            'Thời gian check-out phải sau thời gian check-in. Bạn có muốn tiếp tục với ca qua đêm?'
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

      // Kiểm tra xem có phải ca qua đêm không
      let isOvernightShift = false;
      if (checkInTime && checkOutTime) {
        const [inHours, inMinutes] = checkInTime.split(':').map(Number)
        const [outHours, outMinutes] = checkOutTime.split(':').map(Number)
        isOvernightShift = outHours < inHours || (outHours === inHours && outMinutes < inMinutes)
      }

      // Chuẩn bị dữ liệu bổ sung
      const additionalData = {
        shiftId: selectedShiftId,
        vaoLogTime: checkInTime,
        raLogTime: checkOutTime,
        notes: notes,
        isOvernight: isOvernightShift, // Thêm thông tin về ca qua đêm
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

        // Hiển thị thông báo thành công
        Alert.alert(
          t('Thành công'),
          t('Đã cập nhật trạng thái làm việc thành công'),
          [
            {
              text: t('OK'),
              onPress: () => onClose() // Đóng modal sau khi người dùng nhấn OK
            }
          ]
        )
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
    // Sử dụng t() để đảm bảo cập nhật khi ngôn ngữ thay đổi
    const statuses = [
      { value: WORK_STATUS.CHUA_CAP_NHAT, label: t('Tính theo Giờ Chấm công') },
      { value: WORK_STATUS.DU_CONG, label: t('Đủ công ✅') },
      { value: WORK_STATUS.NGHI_PHEP, label: t('Nghỉ Phép 📝') },
      { value: WORK_STATUS.NGHI_BENH, label: t('Nghỉ Bệnh 🏥') },
      { value: WORK_STATUS.NGHI_LE, label: t('Nghỉ Lễ 🎉') },
      { value: WORK_STATUS.VANG_MAT, label: t('Vắng Mặt ❓') },
      { value: WORK_STATUS.NGHI_THUONG, label: t('Ngày nghỉ thông thường 🏠') },
    ]

    console.log('[DEBUG] Đã cập nhật danh sách trạng thái với ngôn ngữ hiện tại')
    return statuses
  }

  // Render danh sách ca làm việc
  const renderShiftOptions = () => {
    if (!availableShifts || availableShifts.length === 0) {
      // Sử dụng t() để đảm bảo cập nhật khi ngôn ngữ thay đổi
      return [{ value: '', label: t('Không có ca làm việc') }]
    }

    // Tạo danh sách tùy chọn từ ca làm việc có sẵn
    const options = availableShifts.map((shift) => ({
      value: shift.id,
      label: `${shift.name} (${shift.startTime}-${shift.endTime})`,
    }))

    console.log(`[DEBUG] Đã cập nhật danh sách ${options.length} ca làm việc`)
    return options
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
                {t('Cập nhật trạng thái')} 📝{' '}
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
                          {checkInTime ? `${checkInTime} ⏱️` : t('Chọn giờ')}
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
                          {checkOutTime ? `${checkOutTime} ⏱️` : t('Chọn giờ')}
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
                  {t('Hủy bỏ')} ❌
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveChanges}
                disabled={isLoading}
              >
                <Text style={[styles.buttonText, styles.saveButtonText]}>
                  {isLoading ? t('Đang lưu...') : t('Lưu thay đổi')} ✅
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Tăng độ mờ của nền
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#e0e0e0', // Màu nền đậm hơn cho chế độ sáng
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3, // Tăng độ đậm của bóng
    shadowRadius: 4,
    elevation: 6, // Tăng độ nổi
  },
  darkModalContent: {
    backgroundColor: '#1a1a1a', // Màu nền đậm hơn cho chế độ tối
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
    fontSize: 20, // Tăng kích thước font
    fontWeight: '900', // Font chữ đậm hơn cho tiêu đề
  },
  darkText: {
    color: '#ffffff', // Màu trắng sáng hơn cho chế độ tối
  },
  modalBody: {
    maxHeight: '70%',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8, // Tăng khoảng cách
    fontWeight: '700', // Font chữ đậm hơn cho label
    letterSpacing: 0.3, // Tăng khoảng cách giữa các chữ
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
    borderColor: '#bbb', // Màu viền đậm hơn
    borderRadius: 8, // Bo góc nhiều hơn
    paddingHorizontal: 12, // Padding lớn hơn
    backgroundColor: '#f8f8f8', // Thêm màu nền nhẹ
  },
  darkDropdownButton: {
    borderColor: '#666', // Màu viền đậm hơn cho chế độ tối
    backgroundColor: '#2a2a2a', // Màu nền đậm hơn cho chế độ tối
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '600', // Font chữ đậm hơn cho text trong dropdown
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
    fontWeight: '500', // Font chữ đậm hơn cho text trong dropdown item
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
    fontWeight: '500', // Font chữ đậm hơn cho text trong time input
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
    borderRadius: 8, // Bo góc nhiều hơn
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3, // Thêm đổ bóng cho nút
  },
  cancelButton: {
    backgroundColor: '#e53935', // Màu đỏ đậm hơn cho nút hủy
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#43a047', // Màu xanh lá cây đậm hơn cho nút lưu
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5, // Tăng khoảng cách giữa các chữ
  },
  cancelButtonText: {
    color: '#ffffff', // Màu trắng cho chữ trên nút hủy
  },
  saveButtonText: {
    color: '#ffffff',
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

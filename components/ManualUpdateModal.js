'use client'

import React, { useState, useContext, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import { WORK_STATUS } from '../config/appConfig'
import { updateWorkStatusManually } from '../utils/workStatusCalculator'
import styles from '../styles/components/manualUpdateModal'
// Import thêm các utility cần thiết
import { formatDate as formatDateUtil } from '../utils/helpers'

const ManualUpdateModal = ({ visible, onClose, selectedDay, onStatusUpdated }) => {
  const { t, darkMode } = useContext(AppContext)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [checkInTime, setCheckInTime] = useState('')
  const [checkOutTime, setCheckOutTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Khởi tạo dữ liệu khi modal mở
  useEffect(() => {
    if (visible && selectedDay) {
      resetForm()
    }
  }, [visible, selectedDay])

  // Reset form
  const resetForm = () => {
    setSelectedStatus('')
    setNotes('')
    setCheckInTime('')
    setCheckOutTime('')
    setIsLoading(false)
  }

  // Xử lý khi người dùng chọn trạng thái
  const handleSelectStatus = (status) => {
    setSelectedStatus(status)
  }

  // Xử lý khi người dùng lưu trạng thái
  const handleSave = async () => {
    if (!selectedDay || !selectedStatus) {
      console.log('[DEBUG] Không thể lưu: Ngày hoặc trạng thái không được chọn');
      return;
    }

    try {
      setIsLoading(true);
      console.log(`[DEBUG] Bắt đầu lưu trạng thái: ${selectedStatus} cho ngày ${selectedDay.date}`);

      // Chuẩn bị dữ liệu bổ sung
      const additionalData = {
        notes: notes,
      };

      // Thêm thời gian check-in/check-out nếu có
      if (checkInTime) {
        additionalData.vaoLogTime = checkInTime;
        console.log(`[DEBUG] Thêm thời gian check-in: ${checkInTime}`);
      }

      if (checkOutTime) {
        additionalData.raLogTime = checkOutTime;
        console.log(`[DEBUG] Thêm thời gian check-out: ${checkOutTime}`);
      }

      // Định dạng ngày thành YYYY-MM-DD
      const dateKey = formatDateKey(selectedDay.date);
      if (!dateKey) {
        console.error('[ERROR] Không thể định dạng ngày:', selectedDay.date);
        throw new Error('Ngày không hợp lệ');
      }
      console.log(`[DEBUG] Cập nhật trạng thái cho ngày: ${dateKey}`);

      // Cập nhật trạng thái
      const updatedStatus = await updateWorkStatusManually(
        dateKey,
        selectedStatus,
        additionalData
      );

      if (!updatedStatus) {
        console.error('[ERROR] Không nhận được trạng thái cập nhật từ updateWorkStatusManually');
        throw new Error('Không thể cập nhật trạng thái');
      }

      console.log(`[DEBUG] Cập nhật thành công trạng thái: ${updatedStatus.status}`);

      // Gọi callback để thông báo cập nhật thành công
      if (onStatusUpdated && typeof onStatusUpdated === 'function') {
        onStatusUpdated(updatedStatus);
        console.log('[DEBUG] Đã gọi callback onStatusUpdated');
      }

      // Đóng modal
      onClose();
      console.log('[DEBUG] Đã đóng modal sau khi cập nhật thành công');
    } catch (error) {
      console.error('[ERROR] Lỗi khi cập nhật trạng thái:', error);
      // Hiển thị thông báo lỗi cho người dùng nếu cần
    } finally {
      setIsLoading(false);
    }
  }

  // Định dạng ngày thành YYYY-MM-DD
  const formatDateKey = (date) => {
    if (!date) {
      console.error('[ERROR] Ngày không hợp lệ trong formatDateKey:', date);
      return '';
    }
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) {
        console.error('[ERROR] Ngày không hợp lệ sau khi chuyển đổi:', date);
        return '';
      }
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`
    } catch (error) {
      console.error('[ERROR] Lỗi khi định dạng ngày:', error);
      return '';
    }
  }

  // Định dạng ngày hiển thị
  const formatDate = (date) => {
    if (!date) return ''
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) {
        return '';
      }
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
    } catch (error) {
      console.error('[ERROR] Lỗi khi định dạng ngày hiển thị:', error);
      return '';
    }
  }

  // Render icon cho trạng thái
  const renderStatusIcon = (status) => {
    switch (status) {
      case WORK_STATUS.DU_CONG:
        return <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      case WORK_STATUS.THIEU_LOG:
        return <Ionicons name="alert-circle" size={24} color="#FF9800" />
      case WORK_STATUS.NGHI_PHEP:
        return <FontAwesome5 name="calendar-minus" size={20} color="#2196F3" />
      case WORK_STATUS.NGHI_BENH:
        return <FontAwesome5 name="briefcase-medical" size={20} color="#F44336" />
      case WORK_STATUS.NGHI_LE:
        return <FontAwesome5 name="calendar-day" size={20} color="#9C27B0" />
      case WORK_STATUS.NGHI_THUONG:
        return <FontAwesome5 name="calendar" size={20} color="#607D8B" />
      case WORK_STATUS.VANG_MAT:
        return <Ionicons name="close-circle" size={24} color="#F44336" />
      case WORK_STATUS.DI_MUON:
        return <Ionicons name="time" size={24} color="#FF9800" />
      case WORK_STATUS.VE_SOM:
        return <Ionicons name="time-outline" size={24} color="#FF9800" />
      case WORK_STATUS.DI_MUON_VE_SOM:
        return <MaterialCommunityIcons name="clock-alert" size={24} color="#FF9800" />
      default:
        return <Ionicons name="help-circle" size={24} color="#9E9E9E" />
    }
  }

  // Lấy text cho trạng thái
  const getStatusText = (status) => {
    switch (status) {
      case WORK_STATUS.THIEU_LOG:
        return t('Thiếu chấm công')
      case WORK_STATUS.DU_CONG:
        return t('Đủ công')
      case WORK_STATUS.NGHI_PHEP:
        return t('Nghỉ phép')
      case WORK_STATUS.NGHI_BENH:
        return t('Nghỉ bệnh')
      case WORK_STATUS.NGHI_LE:
        return t('Nghỉ lễ')
      case WORK_STATUS.NGHI_THUONG:
        return t('Ngày nghỉ thông thường')
      case WORK_STATUS.VANG_MAT:
        return t('Vắng không lý do')
      case WORK_STATUS.DI_MUON:
        return t('Đi muộn')
      case WORK_STATUS.VE_SOM:
        return t('Về sớm')
      case WORK_STATUS.DI_MUON_VE_SOM:
        return t('Đi muộn & về sớm')
      default:
        return t('Không xác định')
    }
  }

  // Danh sách trạng thái có thể chọn
  const statusOptions = [
    WORK_STATUS.DU_CONG,
    WORK_STATUS.THIEU_LOG,
    WORK_STATUS.NGHI_PHEP,
    WORK_STATUS.NGHI_BENH,
    WORK_STATUS.NGHI_LE,
    WORK_STATUS.NGHI_THUONG,
    WORK_STATUS.VANG_MAT,
    WORK_STATUS.DI_MUON,
    WORK_STATUS.VE_SOM,
    WORK_STATUS.DI_MUON_VE_SOM,
  ]

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
          <View
            style={[
              styles.modalContainer,
              darkMode && styles.darkModalContainer,
              { width: '95%' }
            ]}
          >
            <View
              style={[styles.modalHeader, darkMode && styles.darkModalHeader]}
            >
              <Text style={[styles.title, darkMode && styles.darkText]}>
                {t('Cập nhật trạng thái làm việc')}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={[
                  styles.closeIcon,
                  { backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: 20, padding: 6 }
                ]}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={darkMode ? '#fff' : '#000'}
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} contentContainerStyle={{ paddingBottom: 20 }}>
              {selectedDay ? (
                <>
                  {/* Thông tin ngày */}
                  <View style={[styles.dateInfo, darkMode && styles.darkDateInfo]}>
                    <Text style={[styles.dateText, darkMode && styles.darkText]}>
                      {formatDate(selectedDay.date)} ({selectedDay.dayOfWeek || ''})
                    </Text>
                  </View>

                  {/* Các tùy chọn trạng thái */}
                  <View style={styles.statusOptionsContainer}>
                    <Text style={[styles.statusOptionTitle, darkMode && styles.darkText]}>
                      {t('Chọn trạng thái')}:
                    </Text>
                    {statusOptions.map((status) => (
                      <TouchableOpacity
                        key={status}
                        style={[
                          styles.statusOption,
                          darkMode && styles.darkStatusOption,
                          selectedStatus === status && styles.selectedStatusOption,
                          selectedStatus === status && darkMode && styles.darkSelectedStatusOption,
                        ]}
                        onPress={() => handleSelectStatus(status)}
                        testID={`status-option-${status}`}
                      >
                        <View style={styles.statusIcon}>{renderStatusIcon(status)}</View>
                        <Text style={[styles.statusText, darkMode && styles.darkText]}>
                          {getStatusText(status)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Thời gian check-in/check-out */}
                  <View style={styles.timeInputContainer}>
                    <Text style={[styles.statusOptionTitle, darkMode && styles.darkText]}>
                      {t('Thời gian chấm công')}:
                    </Text>
                    <View style={styles.timeInputRow}>
                      <Text style={[styles.timeInputLabel, darkMode && styles.darkText]}>
                        {t('Check-in')}:
                      </Text>
                      <TextInput
                        style={[styles.timeInput, darkMode && styles.darkTimeInput]}
                        placeholder="HH:MM"
                        placeholderTextColor={darkMode ? '#666' : '#999'}
                        value={checkInTime}
                        onChangeText={setCheckInTime}
                        testID="check-in-input"
                      />
                    </View>
                    <View style={styles.timeInputRow}>
                      <Text style={[styles.timeInputLabel, darkMode && styles.darkText]}>
                        {t('Check-out')}:
                      </Text>
                      <TextInput
                        style={[styles.timeInput, darkMode && styles.darkTimeInput]}
                        placeholder="HH:MM"
                        placeholderTextColor={darkMode ? '#666' : '#999'}
                        value={checkOutTime}
                        onChangeText={setCheckOutTime}
                        testID="check-out-input"
                      />
                    </View>
                  </View>

                  {/* Ghi chú */}
                  <View style={styles.notesContainer}>
                    <Text style={[styles.notesLabel, darkMode && styles.darkText]}>
                      {t('Ghi chú')}:
                    </Text>
                    <TextInput
                      style={[styles.notesInput, darkMode && styles.darkNotesInput]}
                      placeholder={t('Nhập ghi chú (nếu có)...')}
                      placeholderTextColor={darkMode ? '#666' : '#999'}
                      multiline
                      value={notes}
                      onChangeText={setNotes}
                      testID="notes-input"
                    />
                  </View>

                  {/* Nút lưu/hủy */}
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={[styles.cancelButton, darkMode && styles.darkCancelButton]}
                      onPress={onClose}
                      testID="cancel-button"
                    >
                      <Text style={[styles.cancelButtonText, darkMode && styles.darkText]}>
                        {t('Hủy')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        (!selectedStatus || isLoading) && { opacity: 0.7 }
                      ]}
                      onPress={handleSave}
                      disabled={!selectedStatus || isLoading}
                      testID="save-button"
                    >
                      <Text style={styles.saveButtonText}>
                        {isLoading ? t('Đang lưu...') : t('Lưu')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                // Hiển thị thông báo nếu không có ngày được chọn
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={[{ fontSize: 16, textAlign: 'center' }, darkMode && styles.darkText]}>
                    {t('Không có ngày được chọn. Vui lòng thử lại.')}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export default ManualUpdateModal

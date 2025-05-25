import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from './constants'

/**
 * Reset và tạo lại dữ liệu ca làm việc với thời gian nghỉ đúng
 */
export const resetShiftDataWithBreakTime = async () => {
  try {
    console.log('[DEBUG] Bắt đầu reset dữ liệu ca làm việc...')
    
    // Xóa dữ liệu ca làm việc cũ
    await AsyncStorage.removeItem(STORAGE_KEYS.SHIFT_LIST)
    console.log('[DEBUG] Đã xóa dữ liệu ca làm việc cũ')
    
    // Tạo ca làm việc mới với breakMinutes
    const newShifts = [
      {
        id: '1',
        name: 'Ca Sáng',
        startTime: '08:00',
        endTime: '12:00',
        officeEndTime: '12:00',
        departureTime: '07:30',
        daysApplied: ['T2', 'T3', 'T4', 'T5', 'T6'],
        reminderBefore: 15,
        reminderAfter: 15,
        breakTime: 60,
        breakMinutes: 60, // Thời gian nghỉ 1 giờ
        roundUpMinutes: 30,
        showCheckInButton: true,
        showCheckInButtonWhileWorking: true,
        isActive: false,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Ca Chiều',
        startTime: '13:00',
        endTime: '17:00',
        officeEndTime: '17:00',
        departureTime: '12:30',
        daysApplied: ['T2', 'T3', 'T4', 'T5', 'T6'],
        reminderBefore: 15,
        reminderAfter: 15,
        breakTime: 60,
        breakMinutes: 60, // Thời gian nghỉ 1 giờ
        roundUpMinutes: 30,
        showCheckInButton: true,
        showCheckInButtonWhileWorking: true,
        isActive: false,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        name: 'Ca Tối',
        startTime: '18:00',
        endTime: '22:00',
        officeEndTime: '22:00',
        departureTime: '17:30',
        daysApplied: ['T2', 'T3', 'T4', 'T5', 'T6'],
        reminderBefore: 15,
        reminderAfter: 15,
        breakTime: 60,
        breakMinutes: 60, // Thời gian nghỉ 1 giờ
        roundUpMinutes: 30,
        showCheckInButton: true,
        showCheckInButtonWhileWorking: true,
        isActive: false,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        name: 'Ca Hành Chính',
        startTime: '08:00',
        endTime: '17:00',
        officeEndTime: '17:00',
        departureTime: '07:30',
        daysApplied: ['T2', 'T3', 'T4', 'T5', 'T6'],
        reminderBefore: 15,
        reminderAfter: 15,
        breakTime: 60,
        breakMinutes: 60, // Thời gian nghỉ 1 giờ
        roundUpMinutes: 30,
        showCheckInButton: true,
        showCheckInButtonWhileWorking: true,
        isActive: true,
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
    
    // Lưu ca làm việc mới
    await AsyncStorage.setItem(STORAGE_KEYS.SHIFT_LIST, JSON.stringify(newShifts))
    console.log('[DEBUG] Đã tạo ca làm việc mới với breakMinutes')
    
    // Đặt ca hành chính làm ca hiện tại
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_SHIFT, '4')
    console.log('[DEBUG] Đã đặt Ca Hành Chính làm ca hiện tại')
    
    // Kiểm tra kết quả
    const savedShifts = await AsyncStorage.getItem(STORAGE_KEYS.SHIFT_LIST)
    if (savedShifts) {
      const shifts = JSON.parse(savedShifts)
      console.log('[DEBUG] Xác nhận đã lưu thành công:', shifts.length, 'ca làm việc')
      
      // Kiểm tra ca hành chính
      const adminShift = shifts.find(s => s.id === '4')
      if (adminShift) {
        console.log('[DEBUG] Ca Hành Chính:', {
          name: adminShift.name,
          startTime: adminShift.startTime,
          endTime: adminShift.endTime,
          officeEndTime: adminShift.officeEndTime,
          breakMinutes: adminShift.breakMinutes,
          breakTime: adminShift.breakTime,
          isDefault: adminShift.isDefault,
          isActive: adminShift.isActive
        })
        
        // Tính toán giờ làm việc thực tế
        const startHour = parseInt(adminShift.startTime.split(':')[0])
        const endHour = parseInt(adminShift.officeEndTime.split(':')[0])
        const totalHours = endHour - startHour // 17 - 8 = 9 giờ
        const breakHours = adminShift.breakMinutes / 60 // 60/60 = 1 giờ
        const actualWorkHours = totalHours - breakHours // 9 - 1 = 8 giờ
        
        console.log('[DEBUG] Tính toán giờ làm việc:')
        console.log('  - Tổng thời gian ca:', totalHours, 'giờ')
        console.log('  - Thời gian nghỉ:', breakHours, 'giờ')
        console.log('  - Thời gian làm việc thực tế:', actualWorkHours, 'giờ')
        
        if (actualWorkHours === 8) {
          console.log('✅ Logic tính toán thời gian nghỉ ĐÚNG')
        } else {
          console.log('❌ Logic tính toán thời gian nghỉ SAI')
        }
      }
    }
    
    return true
  } catch (error) {
    console.error('[DEBUG] Lỗi khi reset dữ liệu ca làm việc:', error)
    return false
  }
}

/**
 * Xóa tất cả dữ liệu trạng thái làm việc để test lại
 */
export const clearAllWorkStatusData = async () => {
  try {
    console.log('[DEBUG] Bắt đầu xóa tất cả dữ liệu trạng thái làm việc...')
    
    // Lấy tất cả keys
    const allKeys = await AsyncStorage.getAllKeys()
    
    // Tìm các keys liên quan đến trạng thái làm việc
    const workStatusKeys = allKeys.filter(key => 
      key.startsWith(STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX)
    )
    
    console.log('[DEBUG] Tìm thấy', workStatusKeys.length, 'keys trạng thái làm việc')
    
    // Xóa tất cả
    if (workStatusKeys.length > 0) {
      await AsyncStorage.multiRemove(workStatusKeys)
      console.log('[DEBUG] Đã xóa tất cả dữ liệu trạng thái làm việc')
    }
    
    return true
  } catch (error) {
    console.error('[DEBUG] Lỗi khi xóa dữ liệu trạng thái làm việc:', error)
    return false
  }
}

/**
 * Reset toàn bộ dữ liệu để test
 */
export const resetAllDataForTesting = async () => {
  try {
    console.log('[DEBUG] === BẮT ĐẦU RESET TOÀN BỘ DỮ LIỆU ===')
    
    // 1. Reset ca làm việc
    const shiftResult = await resetShiftDataWithBreakTime()
    if (!shiftResult) {
      throw new Error('Không thể reset dữ liệu ca làm việc')
    }
    
    // 2. Xóa dữ liệu trạng thái làm việc
    const statusResult = await clearAllWorkStatusData()
    if (!statusResult) {
      throw new Error('Không thể xóa dữ liệu trạng thái làm việc')
    }
    
    console.log('[DEBUG] === HOÀN THÀNH RESET DỮ LIỆU ===')
    console.log('[DEBUG] Bây giờ bạn có thể:')
    console.log('[DEBUG] 1. Tạo dữ liệu mẫu mới bằng cách bấm nút trong ứng dụng')
    console.log('[DEBUG] 2. Kiểm tra tab "This Week" để xem dữ liệu có hiển thị đúng không')
    console.log('[DEBUG] 3. Kiểm tra xem thời gian nghỉ có được trừ đúng không')
    
    return true
  } catch (error) {
    console.error('[DEBUG] Lỗi khi reset toàn bộ dữ liệu:', error)
    return false
  }
}

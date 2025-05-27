/**
 * Script để reset dữ liệu ca làm việc với thông tin đầy đủ
 * Đảm bảo tất cả ca đều có departureTime để logic hiển thị nút hoạt động đúng
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

const resetShiftData = async () => {
  try {
    console.log('Bắt đầu reset dữ liệu ca làm việc...');
    
    // Xóa dữ liệu ca làm việc hiện tại
    await AsyncStorage.removeItem(STORAGE_KEYS.SHIFT_LIST);
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_SHIFT);
    
    // Tạo dữ liệu ca làm việc mới với thông tin đầy đủ
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
        breakMinutes: 60,
        roundUpMinutes: 30,
        showCheckInButton: true,
        showCheckInButtonWhileWorking: true,
        isActive: true,
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
        breakMinutes: 60,
        roundUpMinutes: 30,
        showCheckInButton: true,
        showCheckInButtonWhileWorking: true,
        isActive: true,
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
        breakMinutes: 60,
        roundUpMinutes: 30,
        showCheckInButton: true,
        showCheckInButtonWhileWorking: true,
        isActive: true,
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
        departureTime: '07:30', // Đảm bảo có departureTime
        daysApplied: ['T2', 'T3', 'T4', 'T5', 'T6'],
        reminderBefore: 15,
        reminderAfter: 15,
        breakTime: 60,
        breakMinutes: 60,
        roundUpMinutes: 30,
        showCheckInButton: true,
        showCheckInButtonWhileWorking: true,
        isActive: true,
        isDefault: true, // Đặt làm ca mặc định
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Lưu dữ liệu mới
    await AsyncStorage.setItem(STORAGE_KEYS.SHIFT_LIST, JSON.stringify(newShifts));
    
    // Đặt ca hành chính làm ca hiện tại
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_SHIFT, '4');
    
    console.log('Đã reset dữ liệu ca làm việc thành công');
    console.log(`Đã tạo ${newShifts.length} ca làm việc:`);
    newShifts.forEach((shift, index) => {
      console.log(`${index + 1}. ${shift.name}: ${shift.startTime} - ${shift.endTime} (Departure: ${shift.departureTime})`);
    });
    
    return newShifts;
  } catch (error) {
    console.error('Lỗi khi reset dữ liệu ca làm việc:', error);
    return [];
  }
};

export default resetShiftData;

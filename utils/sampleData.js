import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

/**
 * Tạo dữ liệu mẫu ca làm việc
 * @returns {Promise<Array>} Danh sách ca làm việc đã tạo
 */
export const createSampleShifts = async () => {
  try {
    console.log('Bắt đầu tạo dữ liệu mẫu ca làm việc...');
    
    // Tạo danh sách ca làm việc mẫu
    const sampleShifts = [
      {
        id: 'shift_1',
        name: 'Ca 1',
        startTime: '06:00',
        officeEndTime: '14:30',
        endTime: '14:30',
        departureTime: '05:30',
        daysApplied: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        remindBeforeStart: 15,
        remindAfterEnd: 15,
        breakMinutes: 30,
        showPunch: true,
        showCheckInButtonWhileWorking: true,
        isActive: true,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'shift_2',
        name: 'Ca 2',
        startTime: '14:00',
        officeEndTime: '22:30',
        endTime: '22:30',
        departureTime: '13:30',
        daysApplied: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        remindBeforeStart: 15,
        remindAfterEnd: 15,
        breakMinutes: 30,
        showPunch: true,
        showCheckInButtonWhileWorking: true,
        isActive: true,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'shift_3',
        name: 'Ca 3',
        startTime: '22:00',
        officeEndTime: '06:30',
        endTime: '06:30',
        departureTime: '21:30',
        daysApplied: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        remindBeforeStart: 15,
        remindAfterEnd: 15,
        breakMinutes: 30,
        showPunch: true,
        showCheckInButtonWhileWorking: true,
        isActive: true,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'shift_4',
        name: 'Ca hành chính',
        startTime: '08:00',
        officeEndTime: '17:00',
        endTime: '17:00',
        departureTime: '07:30',
        daysApplied: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        remindBeforeStart: 15,
        remindAfterEnd: 15,
        breakMinutes: 60,
        showPunch: true,
        showCheckInButtonWhileWorking: true,
        isActive: true,
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'shift_5',
        name: 'Ca ngày',
        startTime: '08:00',
        officeEndTime: '17:00',
        endTime: '20:00',
        departureTime: '07:30',
        daysApplied: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        remindBeforeStart: 15,
        remindAfterEnd: 15,
        breakMinutes: 60,
        showPunch: true,
        showCheckInButtonWhileWorking: true,
        isActive: true,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'shift_6',
        name: 'Ca đêm',
        startTime: '20:00',
        officeEndTime: '05:00',
        endTime: '05:00',
        departureTime: '19:30',
        daysApplied: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        remindBeforeStart: 15,
        remindAfterEnd: 15,
        breakMinutes: 60,
        showPunch: true,
        showCheckInButtonWhileWorking: true,
        isActive: true,
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Lưu dữ liệu mẫu vào AsyncStorage
    await AsyncStorage.setItem(
      STORAGE_KEYS.SHIFT_LIST,
      JSON.stringify(sampleShifts)
    );
    console.log('Đã lưu dữ liệu mẫu ca làm việc thành công');

    return sampleShifts;
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu mẫu ca làm việc:', error);
    return [];
  }
};

/**
 * Tạo dữ liệu mẫu
 * @returns {Promise<Object>} Kết quả tạo dữ liệu mẫu
 */
export const createSampleData = async () => {
  try {
    // Tạo dữ liệu mẫu ca làm việc
    const shifts = await createSampleShifts();
    
    return {
      success: true,
      shifts,
    };
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu mẫu:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  createSampleShifts,
  createSampleData,
};

// Script để kiểm tra dữ liệu trong AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './config/appConfig';

const checkAsyncStorage = async () => {
  try {
    console.log('Bắt đầu kiểm tra AsyncStorage...');
    
    // Lấy tất cả các key
    const keys = await AsyncStorage.getAllKeys();
    console.log(`Tổng số key: ${keys.length}`);
    
    // Lọc các key liên quan đến trạng thái làm việc hàng ngày
    const statusKeys = keys.filter(key => 
      key.startsWith(STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX)
    );
    console.log(`Số key trạng thái làm việc: ${statusKeys.length}`);
    
    if (statusKeys.length > 0) {
      // Lấy dữ liệu từ AsyncStorage
      const statusPairs = await AsyncStorage.multiGet(statusKeys);
      
      // Hiển thị dữ liệu
      console.log('Chi tiết trạng thái làm việc:');
      statusPairs.forEach(([key, value]) => {
        const dateStr = key.replace(STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX, '');
        try {
          const data = JSON.parse(value);
          console.log(`\n--- Ngày ${dateStr} ---`);
          console.log(`Status: ${data.status}`);
          console.log(`Giờ chuẩn: ${data.standardHoursScheduled}`);
          console.log(`Giờ OT: ${data.otHoursScheduled}`);
          console.log(`Tổng giờ: ${data.totalHoursScheduled}`);
          console.log(`Vào: ${data.vaoLogTime}, Ra: ${data.raLogTime}`);
          console.log(`Chế độ đơn giản: ${data.isSimpleMode}`);
        } catch (error) {
          console.error(`Lỗi khi phân tích dữ liệu cho ngày ${dateStr}:`, error);
        }
      });
    } else {
      console.log('Không tìm thấy dữ liệu trạng thái làm việc.');
    }
    
    // Kiểm tra cài đặt người dùng
    const userSettingsStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
    if (userSettingsStr) {
      try {
        const userSettings = JSON.parse(userSettingsStr);
        console.log('\n--- Cài đặt người dùng ---');
        console.log(`Chế độ nút: ${userSettings.multiButtonMode}`);
        console.log(`Ngôn ngữ: ${userSettings.language}`);
      } catch (error) {
        console.error('Lỗi khi phân tích dữ liệu cài đặt người dùng:', error);
      }
    } else {
      console.log('Không tìm thấy dữ liệu cài đặt người dùng.');
    }
    
    // Kiểm tra ca làm việc hiện tại
    const activeShiftId = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_SHIFT_ID);
    console.log(`\nCa làm việc hiện tại: ${activeShiftId || 'Không có'}`);
    
    if (activeShiftId) {
      // Lấy danh sách ca làm việc
      const shiftsStr = await AsyncStorage.getItem(STORAGE_KEYS.SHIFT_LIST);
      if (shiftsStr) {
        try {
          const shifts = JSON.parse(shiftsStr);
          const activeShift = shifts.find(shift => shift.id === activeShiftId);
          if (activeShift) {
            console.log('\n--- Chi tiết ca làm việc hiện tại ---');
            console.log(`Tên: ${activeShift.name}`);
            console.log(`Giờ bắt đầu: ${activeShift.startTime}`);
            console.log(`Giờ kết thúc HC: ${activeShift.officeEndTime}`);
            console.log(`Giờ kết thúc: ${activeShift.endTime}`);
            console.log(`Thời gian nghỉ: ${activeShift.breakMinutes} phút`);
          } else {
            console.log(`Không tìm thấy thông tin ca làm việc với ID: ${activeShiftId}`);
          }
        } catch (error) {
          console.error('Lỗi khi phân tích dữ liệu ca làm việc:', error);
        }
      } else {
        console.log('Không tìm thấy danh sách ca làm việc.');
      }
    }
    
    console.log('\nHoàn thành kiểm tra AsyncStorage.');
  } catch (error) {
    console.error('Lỗi khi kiểm tra AsyncStorage:', error);
  }
};

// Thực thi hàm kiểm tra
checkAsyncStorage();

export default checkAsyncStorage;

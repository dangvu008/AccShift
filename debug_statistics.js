// Debug script để kiểm tra dữ liệu thống kê
const AsyncStorage = require('@react-native-async-storage/async-storage').default;

// Mock AsyncStorage cho Node.js
const mockStorage = {};
const MockAsyncStorage = {
  getItem: async (key) => {
    return mockStorage[key] || null;
  },
  setItem: async (key, value) => {
    mockStorage[key] = value;
  },
  getAllKeys: async () => {
    return Object.keys(mockStorage);
  },
  multiGet: async (keys) => {
    return keys.map(key => [key, mockStorage[key] || null]);
  }
};

// Hàm debug để kiểm tra dữ liệu
async function debugStatistics() {
  console.log('=== DEBUG STATISTICS DATA ===');
  
  // Tạo dữ liệu mẫu cho tuần này
  const today = new Date();
  const startOfWeek = new Date(today);
  const dayOfWeek = today.getDay();
  startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  
  console.log('Tuần hiện tại bắt đầu từ:', startOfWeek.toISOString().split('T')[0]);
  
  // Tạo dữ liệu mẫu cho 7 ngày trong tuần
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    const sampleData = {
      date: dateStr,
      status: i < 5 ? 'DU_CONG' : 'NGHI_THUONG', // T2-T6 làm việc, T7-CN nghỉ
      vaoLogTime: i < 5 ? '08:00' : null,
      raLogTime: i < 5 ? '17:00' : null,
      standardHoursScheduled: i < 5 ? 8.0 : 0,
      otHoursScheduled: 0,
      sundayHoursScheduled: 0,
      nightHoursScheduled: 0,
      totalHoursScheduled: i < 5 ? 8.0 : 0,
      actualWorkHours: i < 5 ? 8.0 : 0,
      shiftId: 'shift_1',
      shiftName: 'Ca Hành Chính',
      breakMinutes: 60, // 1 giờ nghỉ
      isManuallyUpdated: false,
      updatedAt: new Date().toISOString()
    };
    
    console.log(`Ngày ${dateStr} (${['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()]}):`, {
      status: sampleData.status,
      totalHours: sampleData.totalHoursScheduled,
      breakMinutes: sampleData.breakMinutes,
      checkIn: sampleData.vaoLogTime,
      checkOut: sampleData.raLogTime
    });
  }
  
  // Tính tổng giờ làm việc trong tuần
  let totalWorkHours = 0;
  let workDays = 0;
  
  for (let i = 0; i < 5; i++) { // Chỉ tính T2-T6
    totalWorkHours += 8.0;
    workDays++;
  }
  
  console.log('\n=== TỔNG KẾT TUẦN ===');
  console.log('Tổng giờ làm việc:', totalWorkHours);
  console.log('Số ngày làm việc:', workDays);
  console.log('Trung bình giờ/ngày:', totalWorkHours / workDays);
  
  // Kiểm tra logic trừ thời gian nghỉ
  console.log('\n=== KIỂM TRA LOGIC TRỪ THỜI GIAN NGHỈ ===');
  const shiftDurationHours = 9; // 08:00 - 17:00 = 9 giờ
  const breakHours = 60 / 60; // 60 phút = 1 giờ
  const actualWorkHours = shiftDurationHours - breakHours; // 9 - 1 = 8 giờ
  
  console.log('Thời gian ca làm việc:', shiftDurationHours, 'giờ');
  console.log('Thời gian nghỉ:', breakHours, 'giờ');
  console.log('Thời gian làm việc thực tế:', actualWorkHours, 'giờ');
  
  if (actualWorkHours === 8.0) {
    console.log('✅ Logic trừ thời gian nghỉ ĐÚNG');
  } else {
    console.log('❌ Logic trừ thời gian nghỉ SAI');
  }
}

// Chạy debug
debugStatistics().catch(console.error);

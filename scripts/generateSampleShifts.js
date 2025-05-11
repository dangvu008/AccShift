import { createSampleShifts } from '../utils/createSampleShifts';

/**
 * Script để tạo dữ liệu mẫu ca làm việc
 */
const generateSampleShifts = async () => {
  try {
    console.log('Bắt đầu tạo dữ liệu mẫu ca làm việc...');
    
    // Tạo dữ liệu mẫu
    const shifts = await createSampleShifts();
    
    console.log(`Đã tạo ${shifts.length} ca làm việc mẫu:`);
    shifts.forEach((shift, index) => {
      console.log(`${index + 1}. ${shift.name}: ${shift.startTime} - ${shift.endTime} (Nghỉ: ${shift.breakMinutes} phút)`);
    });
    
    console.log('Hoàn thành tạo dữ liệu mẫu ca làm việc.');
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu mẫu ca làm việc:', error);
  }
};

// Thực thi hàm tạo dữ liệu mẫu
generateSampleShifts();

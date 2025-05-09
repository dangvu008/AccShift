import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../config/appConfig'
import { WORK_STATUS } from '../components/WeeklyStatusGrid'

/**
 * Tạo dữ liệu mẫu cho trạng thái làm việc hàng ngày
 * @param {number} days Số ngày cần tạo dữ liệu (mặc định: 30)
 * @param {Date} endDate Ngày kết thúc (mặc định: ngày hiện tại)
 * @returns {Promise<boolean>} Kết quả tạo dữ liệu
 */
export const generateSampleWorkStatus = async (days = 30, endDate = new Date()) => {
  try {
    console.log(`Bắt đầu tạo dữ liệu mẫu cho ${days} ngày...`)
    
    // Danh sách trạng thái có thể có
    const statuses = [
      WORK_STATUS.DU_CONG,
      WORK_STATUS.DI_MUON,
      WORK_STATUS.VE_SOM,
      WORK_STATUS.DI_MUON_VE_SOM,
      WORK_STATUS.THIEU_LOG,
      WORK_STATUS.NGHI_PHEP,
      WORK_STATUS.NGHI_BENH,
      WORK_STATUS.NGHI_LE,
      WORK_STATUS.NGHI_THUONG,
      WORK_STATUS.VANG_MAT,
    ]
    
    // Danh sách ca làm việc mẫu
    const sampleShifts = [
      {
        id: 'shift_1',
        name: 'Ca Hành Chính',
        startTime: '08:00',
        officeEndTime: '17:00',
        endTime: '17:30',
        breakMinutes: 60,
      },
      {
        id: 'shift_2',
        name: 'Ca Sáng',
        startTime: '06:00',
        officeEndTime: '14:00',
        endTime: '14:30',
        breakMinutes: 30,
      },
      {
        id: 'shift_3',
        name: 'Ca Chiều',
        startTime: '14:00',
        officeEndTime: '22:00',
        endTime: '22:30',
        breakMinutes: 30,
      },
    ]
    
    // Tạo dữ liệu cho từng ngày
    const endDateTime = new Date(endDate)
    endDateTime.setHours(0, 0, 0, 0)
    
    const sampleData = []
    
    for (let i = 0; i < days; i++) {
      const date = new Date(endDateTime)
      date.setDate(date.getDate() - i)
      
      // Định dạng ngày thành YYYY-MM-DD
      const dateString = date.toISOString().split('T')[0]
      
      // Chọn ngẫu nhiên trạng thái và ca làm việc
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      const randomShift = sampleShifts[Math.floor(Math.random() * sampleShifts.length)]
      
      // Tạo thời gian vào/ra ngẫu nhiên dựa trên ca làm việc
      const [startHour, startMinute] = randomShift.startTime.split(':').map(Number)
      const [endHour, endMinute] = randomShift.endTime.split(':').map(Number)
      
      // Tính toán thời gian vào/ra với độ lệch ngẫu nhiên
      let vaoHour = startHour
      let vaoMinute = startMinute
      let raHour = endHour
      let raMinute = endMinute
      
      // Thêm độ lệch ngẫu nhiên cho thời gian vào/ra
      if (randomStatus === WORK_STATUS.DI_MUON || randomStatus === WORK_STATUS.DI_MUON_VE_SOM) {
        // Đi muộn 5-30 phút
        const lateMinutes = Math.floor(Math.random() * 26) + 5
        vaoMinute += lateMinutes
        if (vaoMinute >= 60) {
          vaoHour += Math.floor(vaoMinute / 60)
          vaoMinute %= 60
        }
      }
      
      if (randomStatus === WORK_STATUS.VE_SOM || randomStatus === WORK_STATUS.DI_MUON_VE_SOM) {
        // Về sớm 5-30 phút
        const earlyMinutes = Math.floor(Math.random() * 26) + 5
        raMinute -= earlyMinutes
        if (raMinute < 0) {
          raHour -= 1
          raMinute += 60
        }
      }
      
      // Định dạng thời gian vào/ra
      const vaoLogTime = `${vaoHour.toString().padStart(2, '0')}:${vaoMinute.toString().padStart(2, '0')}`
      const raLogTime = `${raHour.toString().padStart(2, '0')}:${raMinute.toString().padStart(2, '0')}`
      
      // Tính toán số giờ làm việc
      let workMinutes = (raHour * 60 + raMinute) - (vaoHour * 60 + vaoMinute)
      if (workMinutes < 0) {
        workMinutes += 24 * 60 // Ca qua đêm
      }
      
      // Trừ thời gian nghỉ
      workMinutes -= randomShift.breakMinutes
      
      // Tính toán giờ làm việc tiêu chuẩn và OT
      const standardWorkMinutes = 8 * 60 // 8 giờ tiêu chuẩn
      const otMinutes = Math.max(0, workMinutes - standardWorkMinutes)
      
      // Tính toán giờ làm đêm (22:00 - 06:00)
      let nightMinutes = 0
      if (vaoHour >= 22 || vaoHour < 6 || raHour >= 22 || raHour < 6) {
        // Đơn giản hóa: nếu thời gian vào hoặc ra nằm trong khoảng làm đêm, tính 2 giờ làm đêm
        nightMinutes = 120
      }
      
      // Tính toán giờ làm chủ nhật
      let sundayMinutes = 0
      if (date.getDay() === 0) { // 0 là Chủ nhật
        sundayMinutes = workMinutes
      }
      
      // Tạo dữ liệu mẫu cho ngày này
      const workStatus = {
        date: dateString,
        status: randomStatus,
        shiftId: randomShift.id,
        shiftName: randomShift.name,
        vaoLogTime: randomStatus === WORK_STATUS.THIEU_LOG ? null : vaoLogTime,
        raLogTime: randomStatus === WORK_STATUS.THIEU_LOG ? null : raLogTime,
        standardHoursScheduled: (standardWorkMinutes - otMinutes) / 60,
        otHoursScheduled: otMinutes / 60,
        sundayHoursScheduled: sundayMinutes / 60,
        nightHoursScheduled: nightMinutes / 60,
        totalHoursScheduled: workMinutes / 60,
        workMinutes,
        breakMinutes: randomShift.breakMinutes,
        otMinutes,
        lateMinutes: randomStatus === WORK_STATUS.DI_MUON || randomStatus === WORK_STATUS.DI_MUON_VE_SOM ? Math.floor(Math.random() * 26) + 5 : 0,
        earlyMinutes: randomStatus === WORK_STATUS.VE_SOM || randomStatus === WORK_STATUS.DI_MUON_VE_SOM ? Math.floor(Math.random() * 26) + 5 : 0,
        isHolidayWork: false,
        isManuallyUpdated: false,
        calculatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      sampleData.push({ key: `${STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX}${dateString}`, value: JSON.stringify(workStatus) })
    }
    
    // Lưu dữ liệu vào AsyncStorage
    console.log(`Lưu ${sampleData.length} bản ghi vào AsyncStorage...`)
    await AsyncStorage.multiSet(sampleData.map(item => [item.key, item.value]))
    
    console.log('Đã tạo xong dữ liệu mẫu')
    return true
  } catch (error) {
    console.error('Lỗi khi tạo dữ liệu mẫu:', error)
    return false
  }
}

/**
 * Xóa tất cả dữ liệu trạng thái làm việc hàng ngày
 * @returns {Promise<boolean>} Kết quả xóa dữ liệu
 */
export const clearAllWorkStatusData = async () => {
  try {
    console.log('Bắt đầu xóa tất cả dữ liệu trạng thái làm việc...')
    
    // Lấy tất cả các key trong AsyncStorage
    const keys = await AsyncStorage.getAllKeys()
    
    // Lọc ra các key liên quan đến trạng thái làm việc
    const workStatusKeys = keys.filter(key => key.startsWith(STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX))
    
    if (workStatusKeys.length === 0) {
      console.log('Không có dữ liệu trạng thái làm việc để xóa')
      return true
    }
    
    // Xóa tất cả các key đã lọc
    console.log(`Xóa ${workStatusKeys.length} bản ghi trạng thái làm việc...`)
    await AsyncStorage.multiRemove(workStatusKeys)
    
    console.log('Đã xóa xong dữ liệu trạng thái làm việc')
    return true
  } catch (error) {
    console.error('Lỗi khi xóa dữ liệu trạng thái làm việc:', error)
    return false
  }
}

export default {
  generateSampleWorkStatus,
  clearAllWorkStatusData,
}

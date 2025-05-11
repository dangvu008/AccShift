# Các trường hợp đặc biệt trong tính toán giờ làm việc

## 1. Xử lý ca làm việc qua đêm

### Định nghĩa ca qua đêm
Ca làm việc qua đêm là ca có thời gian kết thúc nhỏ hơn thời gian bắt đầu (ví dụ: 22:00-06:00).

### Cách xử lý
1. **Xác định ca qua đêm**:
   ```javascript
   const isOvernightShift = (startTime, endTime) => {
     if (!startTime || !endTime) return false
     
     const startHour = parseInt(startTime.split(':')[0], 10)
     const endHour = parseInt(endTime.split(':')[0], 10)
     
     return endHour < startHour
   }
   ```

2. **Tạo timestamp đầy đủ**:
   ```javascript
   const createFullTimestamp = (baseDate, timeString, isNextDay = false) => {
     if (!baseDate || !timeString) return null
     
     const [hours, minutes] = timeString.split(':').map(Number)
     const timestamp = new Date(baseDate)
     timestamp.setHours(hours, minutes, 0, 0)
     
     // Nếu là ngày tiếp theo, tăng ngày lên 1
     if (isNextDay) {
       timestamp.setDate(timestamp.getDate() + 1)
     }
     
     return timestamp
   }
   ```

3. **Tạo khoảng thời gian ca làm việc**:
   ```javascript
   const createShiftInterval = (workdayDate, startTime, endTime) => {
     // Kiểm tra xem có phải ca qua đêm không
     const isOvernight = isOvernightShift(startTime, endTime)
     
     // Tạo timestamp đầy đủ cho thời gian bắt đầu và kết thúc
     const shiftStart = createFullTimestamp(workdayDate, startTime, false)
     const shiftEnd = createFullTimestamp(workdayDate, endTime, isOvernight)
     
     return { start: shiftStart, end: shiftEnd }
   }
   ```

4. **Tính giờ đêm**:
   ```javascript
   const calculateNightHours = (shiftInterval) => {
     // Tạo khoảng thời gian đêm cho ngày bắt đầu ca
     const nightStart = createFullTimestamp(
       new Date(shiftInterval.start),
       '22:00',
       false
     )
     const nightEnd = createFullTimestamp(
       new Date(shiftInterval.start),
       '05:00',
       true
     )
     
     const nightInterval = { start: nightStart, end: nightEnd }
     
     // Tính giao của khoảng thời gian ca và khoảng thời gian đêm
     const nightWorkIntervals = intersection(shiftInterval, nightInterval)
     
     return sumDurationInHours(nightWorkIntervals)
   }
   ```

5. **Quy tắc tính giờ công**:
   - Tất cả giờ công được tính cho ngày bắt đầu ca
   - Giờ đêm được tính trong khoảng 22:00-05:00

## 2. Xử lý "Bấm Nhanh" (Quick Punch)

### Định nghĩa Bấm Nhanh
"Bấm Nhanh" là khi người dùng bấm check-in và check-out trong khoảng thời gian rất ngắn (thường < 60 giây), thường là do nhầm lẫn hoặc để xác nhận đã hoàn thành ca làm việc.

### Cách xử lý
1. **Phát hiện Bấm Nhanh**:
   ```javascript
   // Kiểm tra xem có phải bấm nhanh không
   const isQuickPunch = (checkInTime, checkOutTime) => {
     if (!checkInTime || !checkOutTime) return false
     
     const durationMs = checkOutTime.getTime() - checkInTime.getTime()
     return durationMs < 60 * 1000 // Dưới 60 giây
   }
   ```

2. **Xử lý khi phát hiện Bấm Nhanh**:
   - Nếu phát hiện Bấm Nhanh, status = "DU_CONG"
   - Giờ công được tính theo lịch trình ca, không phụ thuộc vào thời gian bấm nút thực tế
   - Không tính lateMinutes và earlyMinutes

## 3. Xử lý thiếu log chấm công

### Các trường hợp thiếu log
1. **Chỉ có check-in, không có check-out**:
   - Nếu thời gian từ check-in đến hiện tại > 16 giờ: status = "QUEN_CHECK_OUT"
   - Nếu thời gian từ check-in đến hiện tại <= 16 giờ: status = "THIEU_LOG"

2. **Chỉ có go_work, không có check-in/check-out** (trong chế độ Full):
   - status = "THIEU_LOG"

3. **Không có log nào**:
   - status = "CHUA_CAP_NHAT"

### Cách xử lý
1. **Kiểm tra log**:
   ```javascript
   // Kiểm tra log chấm công
   if (!logs || logs.length === 0) {
     return {
       date,
       status: WORK_STATUS.CHUA_CAP_NHAT,
       // Các trường khác với giá trị mặc định...
     }
   }
   
   // Tìm log check-in và check-out
   const checkInLog = logs.find(log => log.type === 'check_in')
   const checkOutLog = logs.find(log => log.type === 'check_out')
   
   // Nếu chỉ có check-in mà không có check-out
   if (checkInTime && !checkOutTime) {
     // Kiểm tra xem đã qua thời gian dài chưa (> 16 giờ)
     const now = new Date()
     const timeSinceCheckIn = now.getTime() - checkInTime.getTime()
     const hoursSinceCheckIn = timeSinceCheckIn / (1000 * 60 * 60)
     
     if (hoursSinceCheckIn > 16) {
       // Đã qua 16 giờ, có thể quên check-out
       status = WORK_STATUS.QUEN_CHECK_OUT
     } else {
       // Chưa qua 16 giờ, thiếu log
       status = WORK_STATUS.THIEU_LOG
     }
   }
   ```

2. **Tính giờ công khi thiếu log**:
   - Khi status = "THIEU_LOG" hoặc "QUEN_CHECK_OUT", giờ công = 0
   - Không tính lateMinutes và earlyMinutes

## 4. Xử lý ngày nghỉ

### Các loại ngày nghỉ
1. **Nghỉ phép** (NGHI_PHEP): Nghỉ có phép
2. **Nghỉ bệnh** (NGHI_BENH): Nghỉ do ốm đau
3. **Nghỉ lễ** (NGHI_LE): Nghỉ ngày lễ
4. **Nghỉ thường** (NGHI_THUONG): Ngày nghỉ thông thường (thứ 7, chủ nhật)
5. **Vắng mặt** (VANG_MAT): Vắng không lý do

### Cách xử lý
1. **Cập nhật trạng thái thủ công**:
   ```javascript
   const updateWorkStatusManually = async (date, newStatus, notes = '') => {
     try {
       // Lấy trạng thái hiện tại
       const currentStatus = await storage.getDailyWorkStatus(date)
       
       // Tạo trạng thái mới
       const updatedStatus = {
         ...currentStatus,
         status: newStatus,
         notes: notes,
         isManuallyUpdated: true,
         updatedAt: new Date().toISOString(),
       }
       
       // Nếu là ngày nghỉ, đặt giờ công = 0
       if (
         newStatus === WORK_STATUS.NGHI_PHEP ||
         newStatus === WORK_STATUS.NGHI_BENH ||
         newStatus === WORK_STATUS.NGHI_LE ||
         newStatus === WORK_STATUS.NGHI_THUONG ||
         newStatus === WORK_STATUS.VANG_MAT
       ) {
         updatedStatus.standardHoursScheduled = 0
         updatedStatus.otHoursScheduled = 0
         updatedStatus.sundayHoursScheduled = 0
         updatedStatus.nightHoursScheduled = 0
         updatedStatus.totalHoursScheduled = 0
       }
       
       // Lưu trạng thái mới
       await storage.setDailyWorkStatus(date, updatedStatus)
       
       return updatedStatus
     } catch (error) {
       console.error('Lỗi khi cập nhật trạng thái thủ công:', error)
       return null
     }
   }
   ```

2. **Tính toán thống kê**:
   - Các ngày nghỉ có totalHoursScheduled = 0
   - Không được tính vào số ngày làm việc (workDays)

## 5. Xử lý ngày làm việc chủ nhật và ngày lễ

### Định nghĩa
1. **Ngày chủ nhật**: Ngày trong tuần có dayOfWeek = 0
2. **Ngày lễ**: Ngày được đánh dấu trong danh sách ngày lễ (publicHolidays)

### Cách xử lý
1. **Xác định loại ngày**:
   ```javascript
   // Xác định loại ngày (thường, thứ 7, chủ nhật, lễ)
   const dayOfWeek = baseDate.getDay() // 0: CN, 1-5: T2-T6, 6: T7
   const isSunday = dayOfWeek === 0
   const isHoliday = publicHolidays.some(
     holiday => formatDate(new Date(holiday.date)) === formatDate(baseDate)
   )
   const isHolidayWork = isHoliday
   ```

2. **Tính giờ chủ nhật**:
   ```javascript
   // Tính giờ chủ nhật
   const sundayHoursScheduled = isSunday ? totalHoursScheduled : 0
   ```

3. **Tính giờ ngày lễ**:
   - Đánh dấu isHolidayWork = true
   - Giờ công vẫn được tính bình thường

## 6. Xử lý đi muộn và về sớm

### Định nghĩa
1. **Đi muộn**: Thời gian check-in > (thời gian bắt đầu ca + lateThresholdMinutes)
2. **Về sớm**: Thời gian check-out < thời gian kết thúc giờ hành chính

### Cách xử lý
1. **Tính thời gian đi muộn/về sớm**:
   ```javascript
   // Tính thời gian đi muộn
   const lateMinutes = Math.max(
     0,
     Math.floor(
       (checkInTime.getTime() - scheduledStartTime.getTime()) / (1000 * 60)
     )
   )
   
   // Tính thời gian về sớm
   const earlyMinutes = Math.max(
     0,
     Math.floor(
       (scheduledOfficeEndTime.getTime() - checkOutTime.getTime()) / (1000 * 60)
     )
   )
   ```

2. **Xác định trạng thái**:
   ```javascript
   // Xác định trạng thái dựa trên đi muộn/về sớm
   if (lateMinutes > 0 && earlyMinutes > 0) {
     status = WORK_STATUS.DI_MUON_VE_SOM
   } else if (lateMinutes > 0) {
     status = WORK_STATUS.DI_MUON
   } else if (earlyMinutes > 0) {
     status = WORK_STATUS.VE_SOM
   } else {
     status = WORK_STATUS.DU_CONG
   }
   ```

3. **Tính giờ công**:
   - Giờ công vẫn được tính theo lịch trình ca, không bị ảnh hưởng bởi việc đi muộn/về sớm
   - Thông tin lateMinutes và earlyMinutes được lưu để tham khảo

## 7. Xử lý ngày tương lai

### Định nghĩa
Ngày tương lai là ngày có thời gian lớn hơn ngày hiện tại.

### Cách xử lý
```javascript
// Kiểm tra ngày tương lai
const today = new Date()
today.setHours(0, 0, 0, 0)

const checkDate = new Date(date)
checkDate.setHours(0, 0, 0, 0)

// Nếu là ngày trong tương lai, trả về trạng thái NGAY_TUONG_LAI
if (checkDate > today) {
  return {
    date,
    status: WORK_STATUS.NGAY_TUONG_LAI,
    // Các trường khác với giá trị mặc định...
  }
}
```

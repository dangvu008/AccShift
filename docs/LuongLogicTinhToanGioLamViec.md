# Luồng Logic Tính toán & Thống kê Giờ Làm Việc

## 1. Tổng quan về luồng logic

Luồng logic tính toán và thống kê giờ làm việc trong ứng dụng AccShift được chia thành 3 giai đoạn chính:

1. **Ghi nhận hành động người dùng**: Người dùng bấm nút trên màn hình chính (Đi Làm, Chấm Công Vào, Chấm Công Ra, Ký Công)
2. **Tính toán trạng thái làm việc**: Hệ thống tự động tính toán trạng thái làm việc (dailyWorkStatus) dựa trên logs và ca làm việc
3. **Hiển thị thống kê**: Dữ liệu được tổng hợp và hiển thị trên màn hình Thống kê (StatisticsScreen)

## 2. Cấu trúc dữ liệu chính

### 2.1. Cấu trúc ca làm việc (shift)

```javascript
{
  id: 'shift_1',
  name: 'Ca Hành Chính',
  startTime: '08:00',           // Thời gian bắt đầu ca (HH:MM)
  officeEndTime: '17:00',       // Thời gian kết thúc giờ hành chính (HH:MM)
  endTime: '17:30',             // Thời gian kết thúc ca (bao gồm OT) (HH:MM)
  departureTime: '07:30',       // Thời gian khởi hành (HH:MM)
  daysApplied: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], // Các ngày áp dụng
  breakMinutes: 60,             // Thời gian nghỉ giữa ca (phút)
  showPunch: false,             // Hiển thị nút Ký Công hay không
  // Các thông tin khác...
}
```

### 2.2. Cấu trúc log chấm công (attendanceLogs)

```javascript
[
  {
    id: 'log_1684123456789',
    type: 'go_work',            // Loại log: go_work, check_in, check_out, punch, complete
    timestamp: '2023-05-15T08:05:00Z', // Thời điểm bấm nút
    shiftId: 'shift_1'          // ID ca làm việc
  },
  // Các log khác...
]
```

### 2.3. Cấu trúc trạng thái làm việc (dailyWorkStatus)

```javascript
{
  date: '2023-05-15',           // Ngày (YYYY-MM-DD)
  status: 'DU_CONG',            // Trạng thái: DU_CONG, DI_MUON, VE_SOM, THIEU_LOG...
  shiftId: 'shift_1',           // ID ca làm việc
  shiftName: 'Ca Hành Chính',   // Tên ca làm việc
  
  // Thời gian check-in/check-out thực tế (ISO string)
  checkInTime: '2023-05-15T08:05:00Z',
  checkOutTime: '2023-05-15T17:10:00Z',
  
  // Thời gian vào/ra hiển thị (HH:MM)
  vaoLogTime: '08:05',
  raLogTime: '17:10',
  
  // Giờ công theo lịch trình (giờ)
  standardHoursScheduled: 8.0,  // Giờ hành chính
  otHoursScheduled: 0.5,        // Giờ tăng ca
  sundayHoursScheduled: 0.0,    // Giờ làm chủ nhật
  nightHoursScheduled: 0.0,     // Giờ làm đêm (22:00-05:00)
  totalHoursScheduled: 8.5,     // Tổng giờ làm
  
  // Thông tin phụ (phút)
  workMinutes: 480,             // Phút làm việc hành chính
  breakMinutes: 60,             // Phút nghỉ giữa ca
  otMinutes: 30,                // Phút tăng ca
  lateMinutes: 5,               // Phút đi muộn
  earlyMinutes: 0,              // Phút về sớm
  
  // Thông tin khác
  isHolidayWork: false,         // Có phải ngày lễ không
  isManuallyUpdated: false,     // Đã cập nhật thủ công chưa
  calculatedAt: '2023-05-15T17:10:30Z' // Thời điểm tính toán
}
```

## 3. Các bước tính toán chi tiết

### 3.1. Bước 1: Người dùng bấm nút xác nhận

Khi người dùng bấm một trong các nút trên Nút Đa Năng (MultiFunctionButton):

1. **Ghi log**: Hệ thống tạo một log mới với timestamp hiện tại (làm tròn về đầu phút) và lưu vào `attendanceLogs` cho ngày hiện tại.
2. **Cập nhật UI**: Nút Đa Năng thay đổi trạng thái/văn bản/icon sang bước tiếp theo.
3. **Kích hoạt tính toán**: Gọi hàm `calculateTodayWorkStatus()` để tính toán trạng thái làm việc.

```javascript
// Trong AppContext.js
const handleMultiFunctionButton = async () => {
  // Tạo log mới
  const now = new Date()
  const today = formatDate(now)
  
  const newLog = {
    id: Date.now().toString(),
    type: actionType, // go_work, check_in, check_out, complete
    timestamp: now.toISOString(),
    shiftId: currentShift ? currentShift.id : null,
  }
  
  // Lưu log vào AsyncStorage
  const updatedLogs = [...attendanceLogs, newLog]
  setAttendanceLogs(updatedLogs)
  await AsyncStorage.setItem(`attendanceLogs_${today}`, JSON.stringify(updatedLogs))
  
  // Kích hoạt tính toán trạng thái làm việc
  await calculateWorkStatus()
}
```

### 3.2. Bước 2: Tính toán trạng thái làm việc (dailyWorkStatus)

Hàm `calculateDailyWorkStatus()` trong `workStatusCalculator.js` thực hiện các bước sau:

1. **Thu thập dữ liệu đầu vào**:
   - Đọc tất cả logs trong `attendanceLogs` của ngày đang xét
   - Lấy thông tin ca làm việc đang áp dụng (activeShift)
   - Lấy các cài đặt liên quan từ userSettings (multiButtonMode, lateThresholdMinutes...)

2. **Kiểm tra điều kiện ban đầu**:
   - Nếu có trạng thái nghỉ được đặt thủ công (Nghỉ phép...) -> Giữ nguyên, không tính toán thêm
   - Xác định chế độ (userSettings.multiButtonMode: 'simple' hoặc 'full')

3. **Xử lý theo chế độ**:

   a. **Chế độ Simple** (Chỉ bấm "Đi Làm"):
   - Kiểm tra có log `go_work` không
   - Nếu có:
     - status = "DU_CONG"
     - vaoLogTime = thời gian log go_work
     - Tính giờ theo lịch trình ca (xem Bước 4)

   b. **Chế độ Full** (Bấm đầy đủ Check-in/Check-out):
   - Kiểm tra có đủ log `check_in` và `check_out` không
   - Nếu thiếu -> status = "THIEU_LOG", dừng tính giờ
   - Lấy firstCheckInTime và lastCheckOutTime từ logs
   - Kiểm tra điều kiện "Bấm Nhanh" (lastCheckOutTime - firstCheckInTime < 60 giây)
   - Nếu Bấm Nhanh:
     - status = "DU_CONG"
     - Tính giờ theo lịch trình ca (xem Bước 4)
   - Nếu Bấm Bình thường:
     - Xác định Status dựa trên giờ bấm nút thực tế:
       - isLate = firstCheckInTime > (scheduledStartTime + lateThresholdMinutes)
       - isEarly = lastCheckOutTime < scheduledOfficeEndTime
       - Gán status = "DU_CONG", "DI_MUON", "VE_SOM", hoặc "DI_MUON_VE_SOM"
     - Tính giờ theo lịch trình ca (xem Bước 4)

### 3.3. Bước 4: Tính giờ theo lịch trình ca

Hàm `calculateScheduledWorkTime()` thực hiện các bước sau:

1. **Lấy thông tin thời gian từ ca làm việc**:
   - scheduledStartTime = Thời gian bắt đầu ca (đã chuyển thành timestamp đầy đủ)
   - scheduledOfficeEndTime = Thời gian kết thúc giờ hành chính
   - scheduledEndTime = Thời gian kết thúc ca (bao gồm OT)
   - breakMinutes = Thời gian nghỉ giữa ca

2. **Tính toán các loại giờ**:
   - standardHoursScheduled = max(0, duration(scheduledStartTime, scheduledOfficeEndTime)) - (breakMinutes / 60)
   - otHoursScheduled = max(0, duration(scheduledOfficeEndTime, scheduledEndTime))
   - totalHoursScheduled = standardHoursScheduled + otHoursScheduled
   - sundayHoursScheduled: Nếu ngày làm việc là Chủ Nhật, sundayHoursScheduled = totalHoursScheduled. Ngược lại là 0.
   - nightHoursScheduled: Tính tổng thời gian giao nhau của khoảng lịch trình [scheduledStartTime, scheduledEndTime] và khung giờ đêm [22:00, 05:00+1day]

3. **Xử lý ca qua đêm**:
   - Nếu ca làm việc qua đêm (endTime < startTime), tính toán đặc biệt cho các khoảng thời gian
   - Sử dụng các hàm trong timeIntervalUtils.js để tính toán chính xác

4. **Lưu kết quả vào dailyWorkStatus**:
   - Cập nhật các trường giờ công theo lịch trình
   - Lưu vào AsyncStorage với key `dailyWorkStatus_${date}`

### 3.4. Điểm quan trọng về tính toán giờ công

- **Khi status = "DU_CONG"**: Giờ công LUÔN được tính theo lịch trình ca, không phụ thuộc vào thời gian bấm nút thực tế
- **Khi status khác "DU_CONG"**: Giờ công vẫn được tính theo lịch trình ca, nhưng status sẽ phản ánh việc đi muộn/về sớm
- **Thời gian check-in/check-out thực tế**: Chỉ dùng để xác định status, không ảnh hưởng đến số giờ công được tính

## 4. Hiển thị trên màn hình thống kê (StatisticsScreen)

### 4.1. Tải và xử lý dữ liệu

1. **Xác định khoảng thời gian**:
   - Người dùng chọn "Tuần này", "Tháng này", hoặc "Năm này"
   - Hệ thống tính toán startDate và endDate tương ứng

2. **Tải dữ liệu**:
   - Đọc tất cả các bản ghi dailyWorkStatus từ AsyncStorage
   - Lọc theo khoảng thời gian đã chọn

3. **Xử lý dữ liệu**:
   - Với mỗi ngày trong khoảng, lấy bản ghi dailyWorkStatus tương ứng
   - Nếu không có, tạo bản ghi trống (giờ = 0, status = "-")
   - Định dạng dữ liệu để hiển thị (ngày DD/MM, thứ viết tắt, giờ HH:MM)

4. **Tính toán dữ liệu tổng hợp**:
   - totalWorkHours = Tổng standardHoursScheduled của tất cả các ngày
   - totalOtHours = Tổng otHoursScheduled của tất cả các ngày
   - workDays = Số ngày có status không phải nghỉ và totalHoursScheduled > 0
   - statusDistribution = Phân bố các loại status

### 4.2. Hiển thị dữ liệu

1. **Hiển thị tóm tắt**:
   - Tổng giờ làm việc
   - Tổng giờ tăng ca
   - Số ngày làm việc

2. **Hiển thị bảng chi tiết**:
   - Ngày (DD/MM)
   - Thứ (viết tắt theo ngôn ngữ)
   - CheckIn (Giờ bấm nút thực tế - vaoLogTime)
   - CheckOut (Giờ bấm nút thực tế - raLogTime)
   - Giờ HC (standardHoursScheduled)
   - Giờ OT (otHoursScheduled)
   - Giờ CN (sundayHoursScheduled)
   - Giờ Đêm (nightHoursScheduled)
   - Tổng Giờ (totalHoursScheduled)
   - Status (Icon/Text từ status)

## 5. Ví dụ minh họa

### Ví dụ 1: Chế độ Simple, bấm "Đi Làm" đúng giờ

1. **Người dùng bấm "Đi Làm" lúc 08:05**:
   - Tạo log: `{ type: 'go_work', timestamp: '2023-05-15T08:05:00Z' }`
   - Kích hoạt tính toán dailyWorkStatus

2. **Tính toán dailyWorkStatus**:
   - Ca làm việc: 08:00-17:00 (giờ hành chính), 17:00-17:30 (OT), nghỉ 60 phút
   - Chế độ Simple -> status = "DU_CONG"
   - standardHoursScheduled = (17:00 - 08:00) - 1 = 8 giờ
   - otHoursScheduled = (17:30 - 17:00) = 0.5 giờ
   - totalHoursScheduled = 8.5 giờ
   - vaoLogTime = "08:05"

3. **Hiển thị trên màn hình thống kê**:
   - Ngày: 15/05
   - CheckIn: 08:05
   - CheckOut: -
   - Giờ HC: 8.0
   - Giờ OT: 0.5
   - Tổng Giờ: 8.5
   - Status: "Đủ công"

### Ví dụ 2: Chế độ Full, đi muộn 15 phút, về đúng giờ

1. **Người dùng bấm "Check-in" lúc 08:15, "Check-out" lúc 17:30**:
   - Tạo logs: 
     - `{ type: 'check_in', timestamp: '2023-05-15T08:15:00Z' }`
     - `{ type: 'check_out', timestamp: '2023-05-15T17:30:00Z' }`
   - Kích hoạt tính toán dailyWorkStatus

2. **Tính toán dailyWorkStatus**:
   - Ca làm việc: 08:00-17:00 (giờ hành chính), 17:00-17:30 (OT), nghỉ 60 phút
   - Chế độ Full, đi muộn 15 phút -> status = "DI_MUON"
   - standardHoursScheduled = (17:00 - 08:00) - 1 = 8 giờ
   - otHoursScheduled = (17:30 - 17:00) = 0.5 giờ
   - totalHoursScheduled = 8.5 giờ
   - vaoLogTime = "08:15", raLogTime = "17:30"
   - lateMinutes = 15

3. **Hiển thị trên màn hình thống kê**:
   - Ngày: 15/05
   - CheckIn: 08:15
   - CheckOut: 17:30
   - Giờ HC: 8.0
   - Giờ OT: 0.5
   - Tổng Giờ: 8.5
   - Status: "Đi muộn"

# Ví dụ cụ thể về tính toán giờ làm việc

## Ví dụ 1: Ca làm việc hành chính (08:00-17:00)

### Thông tin ca làm việc
```javascript
{
  id: 'shift_1',
  name: 'Ca Hành Chính',
  startTime: '08:00',           // Thời gian bắt đầu ca
  officeEndTime: '17:00',       // Thời gian kết thúc giờ hành chính
  endTime: '17:30',             // Thời gian kết thúc ca (bao gồm OT)
  breakMinutes: 60,             // Thời gian nghỉ giữa ca (phút)
}
```

### Tình huống 1: Chế độ Simple - Bấm "Đi Làm" đúng giờ
1. **Hành động người dùng**:
   - Bấm nút "Đi Làm" lúc 08:00
   - Hệ thống tạo log: `{ type: 'go_work', timestamp: '2023-05-15T08:00:00Z' }`

2. **Tính toán trạng thái**:
   - Chế độ Simple -> status = "DU_CONG"
   - standardHoursScheduled = (17:00 - 08:00) - 1 = 8 giờ
   - otHoursScheduled = (17:30 - 17:00) = 0.5 giờ
   - totalHoursScheduled = 8.5 giờ
   - vaoLogTime = "08:00"

3. **Kết quả hiển thị trên màn hình thống kê**:
   - Ngày: 15/05
   - CheckIn: 08:00
   - CheckOut: -
   - Giờ HC: 8.0
   - Giờ OT: 0.5
   - Tổng Giờ: 8.5
   - Status: "Đủ công"

### Tình huống 2: Chế độ Full - Đi đúng giờ, về đúng giờ
1. **Hành động người dùng**:
   - Bấm nút "Check-in" lúc 08:00
   - Bấm nút "Check-out" lúc 17:30
   - Hệ thống tạo logs:
     - `{ type: 'check_in', timestamp: '2023-05-15T08:00:00Z' }`
     - `{ type: 'check_out', timestamp: '2023-05-15T17:30:00Z' }`

2. **Tính toán trạng thái**:
   - Chế độ Full, đi đúng giờ, về đúng giờ -> status = "DU_CONG"
   - standardHoursScheduled = (17:00 - 08:00) - 1 = 8 giờ
   - otHoursScheduled = (17:30 - 17:00) = 0.5 giờ
   - totalHoursScheduled = 8.5 giờ
   - vaoLogTime = "08:00", raLogTime = "17:30"

3. **Kết quả hiển thị trên màn hình thống kê**:
   - Ngày: 15/05
   - CheckIn: 08:00
   - CheckOut: 17:30
   - Giờ HC: 8.0
   - Giờ OT: 0.5
   - Tổng Giờ: 8.5
   - Status: "Đủ công"

### Tình huống 3: Chế độ Full - Đi muộn 15 phút, về đúng giờ
1. **Hành động người dùng**:
   - Bấm nút "Check-in" lúc 08:15
   - Bấm nút "Check-out" lúc 17:30
   - Hệ thống tạo logs:
     - `{ type: 'check_in', timestamp: '2023-05-15T08:15:00Z' }`
     - `{ type: 'check_out', timestamp: '2023-05-15T17:30:00Z' }`

2. **Tính toán trạng thái**:
   - Chế độ Full, đi muộn 15 phút -> status = "DI_MUON"
   - standardHoursScheduled = (17:00 - 08:00) - 1 = 8 giờ (vẫn tính theo lịch trình)
   - otHoursScheduled = (17:30 - 17:00) = 0.5 giờ
   - totalHoursScheduled = 8.5 giờ
   - vaoLogTime = "08:15", raLogTime = "17:30"
   - lateMinutes = 15

3. **Kết quả hiển thị trên màn hình thống kê**:
   - Ngày: 15/05
   - CheckIn: 08:15
   - CheckOut: 17:30
   - Giờ HC: 8.0
   - Giờ OT: 0.5
   - Tổng Giờ: 8.5
   - Status: "Đi muộn"

### Tình huống 4: Chế độ Full - Đi đúng giờ, về sớm 15 phút
1. **Hành động người dùng**:
   - Bấm nút "Check-in" lúc 08:00
   - Bấm nút "Check-out" lúc 17:15
   - Hệ thống tạo logs:
     - `{ type: 'check_in', timestamp: '2023-05-15T08:00:00Z' }`
     - `{ type: 'check_out', timestamp: '2023-05-15T17:15:00Z' }`

2. **Tính toán trạng thái**:
   - Chế độ Full, về sớm 15 phút -> status = "VE_SOM"
   - standardHoursScheduled = (17:00 - 08:00) - 1 = 8 giờ (vẫn tính theo lịch trình)
   - otHoursScheduled = (17:30 - 17:00) = 0.5 giờ
   - totalHoursScheduled = 8.5 giờ
   - vaoLogTime = "08:00", raLogTime = "17:15"
   - earlyMinutes = 15

3. **Kết quả hiển thị trên màn hình thống kê**:
   - Ngày: 15/05
   - CheckIn: 08:00
   - CheckOut: 17:15
   - Giờ HC: 8.0
   - Giờ OT: 0.5
   - Tổng Giờ: 8.5
   - Status: "Về sớm"

## Ví dụ 2: Ca làm việc qua đêm (22:00-06:00)

### Thông tin ca làm việc
```javascript
{
  id: 'shift_2',
  name: 'Ca Đêm',
  startTime: '22:00',           // Thời gian bắt đầu ca
  officeEndTime: '06:00',       // Thời gian kết thúc giờ hành chính (qua ngày hôm sau)
  endTime: '06:30',             // Thời gian kết thúc ca (bao gồm OT)
  breakMinutes: 30,             // Thời gian nghỉ giữa ca (phút)
}
```

### Tình huống 1: Chế độ Simple - Bấm "Đi Làm" đúng giờ
1. **Hành động người dùng**:
   - Bấm nút "Đi Làm" lúc 22:00 ngày 15/05
   - Hệ thống tạo log: `{ type: 'go_work', timestamp: '2023-05-15T22:00:00Z' }`

2. **Tính toán trạng thái**:
   - Chế độ Simple -> status = "DU_CONG"
   - standardHoursScheduled = (06:00 - 22:00) - 0.5 = 7.5 giờ
   - otHoursScheduled = (06:30 - 06:00) = 0.5 giờ
   - totalHoursScheduled = 8.0 giờ
   - nightHoursScheduled = 8.0 giờ (toàn bộ ca nằm trong khung giờ đêm 22:00-05:00)
   - vaoLogTime = "22:00"

3. **Kết quả hiển thị trên màn hình thống kê**:
   - Ngày: 15/05 (ngày bắt đầu ca)
   - CheckIn: 22:00
   - CheckOut: -
   - Giờ HC: 7.5
   - Giờ OT: 0.5
   - Giờ Đêm: 8.0
   - Tổng Giờ: 8.0
   - Status: "Đủ công"

### Tình huống 2: Chế độ Full - Đi đúng giờ, về đúng giờ
1. **Hành động người dùng**:
   - Bấm nút "Check-in" lúc 22:00 ngày 15/05
   - Bấm nút "Check-out" lúc 06:30 ngày 16/05
   - Hệ thống tạo logs:
     - `{ type: 'check_in', timestamp: '2023-05-15T22:00:00Z' }`
     - `{ type: 'check_out', timestamp: '2023-05-16T06:30:00Z' }`

2. **Tính toán trạng thái**:
   - Chế độ Full, đi đúng giờ, về đúng giờ -> status = "DU_CONG"
   - standardHoursScheduled = (06:00 - 22:00) - 0.5 = 7.5 giờ
   - otHoursScheduled = (06:30 - 06:00) = 0.5 giờ
   - totalHoursScheduled = 8.0 giờ
   - nightHoursScheduled = 7.0 giờ (từ 22:00-05:00)
   - vaoLogTime = "22:00", raLogTime = "06:30"

3. **Kết quả hiển thị trên màn hình thống kê**:
   - Ngày: 15/05 (ngày bắt đầu ca)
   - CheckIn: 22:00
   - CheckOut: 06:30
   - Giờ HC: 7.5
   - Giờ OT: 0.5
   - Giờ Đêm: 7.0
   - Tổng Giờ: 8.0
   - Status: "Đủ công"

## Ví dụ 3: Tổng hợp thống kê tuần

### Dữ liệu đầu vào (dailyWorkStatus của 5 ngày)
```javascript
[
  {
    date: '2023-05-15',
    status: 'DU_CONG',
    standardHoursScheduled: 8.0,
    otHoursScheduled: 0.5,
    totalHoursScheduled: 8.5,
    vaoLogTime: '08:00',
    raLogTime: '17:30'
  },
  {
    date: '2023-05-16',
    status: 'DI_MUON',
    standardHoursScheduled: 8.0,
    otHoursScheduled: 0.0,
    totalHoursScheduled: 8.0,
    vaoLogTime: '08:15',
    raLogTime: '17:00'
  },
  {
    date: '2023-05-17',
    status: 'VE_SOM',
    standardHoursScheduled: 8.0,
    otHoursScheduled: 0.0,
    totalHoursScheduled: 8.0,
    vaoLogTime: '08:00',
    raLogTime: '16:45'
  },
  {
    date: '2023-05-18',
    status: 'NGHI_PHEP',
    standardHoursScheduled: 0.0,
    otHoursScheduled: 0.0,
    totalHoursScheduled: 0.0,
    vaoLogTime: null,
    raLogTime: null
  },
  {
    date: '2023-05-19',
    status: 'DU_CONG',
    standardHoursScheduled: 8.0,
    otHoursScheduled: 1.0,
    totalHoursScheduled: 9.0,
    vaoLogTime: '08:00',
    raLogTime: '18:00'
  }
]
```

### Tính toán dữ liệu tổng hợp
```javascript
const summaryData = {
  totalWorkHours: 8.0 + 8.0 + 8.0 + 0.0 + 8.0 = 32.0,
  totalOtHours: 0.5 + 0.0 + 0.0 + 0.0 + 1.0 = 1.5,
  workDays: 4, // Không tính ngày nghỉ phép
  statusDistribution: {
    'DU_CONG': 2,
    'DI_MUON': 1,
    'VE_SOM': 1,
    'NGHI_PHEP': 1
  }
}
```

### Kết quả hiển thị trên màn hình thống kê
| Ngày   | Thứ | CheckIn | CheckOut | Giờ HC | Giờ OT | Tổng Giờ | Status    |
|--------|-----|---------|----------|--------|--------|----------|-----------|
| 15/05  | T2  | 08:00   | 17:30    | 8.0    | 0.5    | 8.5      | Đủ công   |
| 16/05  | T3  | 08:15   | 17:00    | 8.0    | 0.0    | 8.0      | Đi muộn   |
| 17/05  | T4  | 08:00   | 16:45    | 8.0    | 0.0    | 8.0      | Về sớm    |
| 18/05  | T5  | -       | -        | 0.0    | 0.0    | 0.0      | Nghỉ phép |
| 19/05  | T6  | 08:00   | 18:00    | 8.0    | 1.0    | 9.0      | Đủ công   |
| **Tổng** |   |         |          | **32.0** | **1.5** | **33.5** |         |

## Lưu ý quan trọng

1. **Giờ công luôn tính theo lịch trình ca làm việc**:
   - Khi status = "DU_CONG", giờ công = thời gian theo lịch trình ca
   - Khi status = "DI_MUON" hoặc "VE_SOM", giờ công vẫn = thời gian theo lịch trình ca
   - Thời gian check-in/check-out thực tế chỉ ảnh hưởng đến status, không ảnh hưởng đến số giờ công

2. **Ca làm việc qua đêm**:
   - Tất cả giờ công được tính cho ngày bắt đầu ca
   - Giờ đêm được tính trong khoảng 22:00-05:00

3. **Ngày nghỉ**:
   - Các ngày có status = "NGHI_PHEP", "NGHI_BENH", "NGHI_LE", "VANG_MAT" có totalHoursScheduled = 0
   - Không được tính vào số ngày làm việc (workDays)

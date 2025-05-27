# Hệ Thống Nhắc Nhở Báo Thức - AccShift

## Tổng Quan

Hệ thống nhắc nhở báo thức toàn diện được thiết kế để giúp người dùng không bao giờ bỏ lỡ các sự kiện quan trọng trong ca làm việc. Hệ thống tự động lên lịch và quản lý các loại nhắc nhở khác nhau dựa trên ca làm việc và hành vi người dùng.

## Các Loại Nhắc Nhở

### 1. Nhắc Nhở Đi Làm
- **Departure Reminder**: Nhắc nhở khởi hành đi làm
- **Go to Work**: Nhắc nhở bắt đầu hành trình đi làm

### 2. Nhắc Nhở Chấm Công
- **Check-in Reminder**: Nhắc nhở chấm công vào (15 phút trước ca)
- **Check-in Urgent**: Nhắc nhở khẩn cấp chấm công vào (5 phút trước ca)
- **Check-out Reminder**: Nhắc nhở chấm công ra (15 phút trước kết thúc ca)
- **Check-out Urgent**: Nhắc nhở khẩn cấp chấm công ra (5 phút trước kết thúc ca)

### 3. Nhắc Nhở Ca Làm Việc
- **Shift Start**: Nhắc nhở bắt đầu ca làm việc
- **Shift End**: Nhắc nhở kết thúc ca làm việc
- **Shift Break**: Nhắc nhở nghỉ giải lao
- **Shift Return**: Nhắc nhở quay lại làm việc sau giải lao

### 4. Nhắc Nhở Overtime
- **Overtime Warning**: Cảnh báo làm thêm giờ (30 phút sau giờ tan ca)
- **Overtime Limit**: Cảnh báo giới hạn overtime (60 phút sau giờ tan ca)

### 5. Nhắc Nhở Thời Tiết
- **Weather Preparation**: Chuẩn bị thời tiết (60 phút trước khởi hành)
- **Weather Warning**: Cảnh báo thời tiết xấu (30 phút trước khởi hành)

### 6. Nhắc Nhở Ghi Chú
- **Note Reminder**: Nhắc nhở về ghi chú quan trọng
- **Task Reminder**: Nhắc nhở về công việc cần làm

## Cấu Trúc Hệ Thống

### ReminderManager
Class chính quản lý tất cả nhắc nhở:

```javascript
import reminderManager from '../utils/reminderManager';

// Khởi tạo
await reminderManager.initialize();

// Lên lịch nhắc nhở cho ca làm việc
await reminderManager.scheduleAllShiftReminders(shift);

// Hủy nhắc nhở
await reminderManager.cancelReminder(reminderId);
```

### Notification Channels
Hệ thống sử dụng các kênh thông báo khác nhau:

- **work_reminders**: Nhắc nhở đi làm (Priority: HIGH)
- **urgent_reminders**: Nhắc nhở khẩn cấp (Priority: MAX)
- **overtime_reminders**: Nhắc nhở overtime (Priority: HIGH)
- **note_reminders**: Nhắc nhở ghi chú (Priority: DEFAULT)
- **weather_reminders**: Nhắc nhở thời tiết (Priority: DEFAULT)

## Cài Đặt Nhắc Nhở

### ReminderSettingsScreen
Màn hình cài đặt cho phép người dùng:

- Bật/tắt từng loại nhắc nhở
- Điều chỉnh thời gian nhắc nhở (phút trước sự kiện)
- Cài đặt âm thanh và rung
- Test thông báo
- Xóa tất cả nhắc nhở

### Cài Đặt Mặc Định

```javascript
const defaultSettings = {
  // Thời gian nhắc nhở (phút)
  departureReminderMinutes: 30,
  checkInReminderMinutes: 15,
  checkOutReminderMinutes: 15,
  breakReminderMinutes: 5,
  
  // Bật/tắt nhắc nhở
  alarmSoundEnabled: true,
  departureReminderEnabled: true,
  checkInReminderEnabled: true,
  checkOutReminderEnabled: true,
  overtimeReminderEnabled: true,
  breakReminderEnabled: true,
  weatherReminderEnabled: true,
  
  // Cài đặt nâng cao
  urgentRemindersEnabled: true,
  weekendRemindersEnabled: false,
  vibrationEnabled: true,
};
```

## Quản Lý Nhắc Nhở

### EnhancedAlarmScreen
Màn hình quản lý nhắc nhở hiển thị:

- Danh sách nhắc nhở đang hoạt động
- Thống kê nhắc nhở (tổng, sắp tới, đã hết hạn)
- Thời gian còn lại cho mỗi nhắc nhở
- Khả năng hủy từng nhắc nhở
- Refresh tự động mỗi 30 giây

### Tích Hợp với MultiFunctionButton
Hệ thống tự động:

- Lên lịch nhắc nhở khi chọn ca làm việc
- Hủy nhắc nhở khi hoàn thành hành động
- Cập nhật trạng thái nhắc nhở theo button state

## API Reference

### ReminderManager Methods

#### Khởi tạo
```javascript
await reminderManager.initialize()
```

#### Lên lịch nhắc nhở
```javascript
// Nhắc nhở khởi hành
await reminderManager.scheduleDepartureReminder(shift, customMinutes)

// Nhắc nhở chấm công vào
await reminderManager.scheduleCheckInReminder(shift, customMinutes)

// Nhắc nhở chấm công ra
await reminderManager.scheduleCheckOutReminder(shift, customMinutes)

// Nhắc nhở overtime
await reminderManager.scheduleOvertimeReminders(shift)

// Nhắc nhở thời tiết
await reminderManager.scheduleWeatherReminder(weatherData, shift)

// Tất cả nhắc nhở cho ca
await reminderManager.scheduleAllShiftReminders(shift, options)
```

#### Quản lý nhắc nhở
```javascript
// Hủy một nhắc nhở
await reminderManager.cancelReminder(reminderId)

// Hủy tất cả nhắc nhở của ca
await reminderManager.cancelShiftReminders(shiftId)

// Hủy tất cả nhắc nhở
await reminderManager.cancelAllReminders()

// Lấy danh sách nhắc nhở
const reminders = reminderManager.getActiveReminders(shiftId)

// Thống kê nhắc nhở
const stats = reminderManager.getReminderStats()
```

#### Cài đặt
```javascript
// Cập nhật cài đặt người dùng
await reminderManager.updateUserSettings(newSettings)

// Dọn dẹp nhắc nhở hết hạn
await reminderManager.cleanupExpiredReminders()
```

## Workflow Tự Động

### Khi Chọn Ca Làm Việc
1. Hệ thống tự động lên lịch tất cả nhắc nhở cho ca
2. Tính toán thời gian dựa trên cài đặt người dùng
3. Tạo notification channels phù hợp
4. Lưu trữ thông tin nhắc nhở

### Khi Thực Hiện Hành Động
1. **Check-in**: Hủy nhắc nhở check-in
2. **Check-out**: Hủy nhắc nhở check-out
3. **Complete**: Hủy tất cả nhắc nhở của ca
4. **Reset**: Lên lịch lại nhắc nhở mới

### Quản Lý Thông Minh
- Tự động dọn dẹp nhắc nhở hết hạn
- Kiểm tra xung đột thời gian
- Ưu tiên nhắc nhở khẩn cấp
- Tích hợp với thời tiết và ghi chú

## Best Practices

### Performance
- Sử dụng singleton pattern cho ReminderManager
- Cleanup nhắc nhở hết hạn định kỳ
- Batch operations khi có thể
- Lazy loading cho danh sách nhắc nhở

### User Experience
- Thông báo rõ ràng và có ý nghĩa
- Icon và màu sắc phù hợp với loại nhắc nhở
- Countdown timer cho nhắc nhở sắp tới
- Khả năng test thông báo

### Error Handling
- Graceful fallback khi notification permission bị từ chối
- Retry logic cho failed notifications
- Logging chi tiết cho debugging
- Validation input trước khi lên lịch

## Troubleshooting

### Nhắc Nhở Không Hoạt Động
1. Kiểm tra notification permissions
2. Verify user settings
3. Check notification channels (Android)
4. Validate shift data

### Performance Issues
1. Cleanup expired reminders
2. Reduce notification frequency
3. Optimize storage operations
4. Check memory usage

### Notification Không Hiển Thị
1. Check device notification settings
2. Verify app notification permissions
3. Test with simple notification
4. Check notification channel configuration

## Migration và Updates

### Từ Hệ Thống Cũ
- Import existing alarm settings
- Convert old notification format
- Migrate user preferences
- Update storage schema

### Version Updates
- Backward compatibility cho settings
- Database migration scripts
- Feature flag cho new features
- Gradual rollout strategy

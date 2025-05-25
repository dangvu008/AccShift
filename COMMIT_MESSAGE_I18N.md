# 🌐 Cập nhật đồng bộ ngôn ngữ cho ManualUpdateModal

## Mô tả:
Bổ sung các key dịch thuật còn thiếu cho component ManualUpdateModal để đảm bảo đồng bộ ngôn ngữ hoàn toàn với hệ thống dịch thuật của ứng dụng.

## Thay đổi chính:

### 1. Bổ sung key dịch thuật mới:
- `"-- Chọn trạng thái --"` / `"-- Select Status --"`
- `"Thời gian chấm công"` / `"Attendance Time"`
- `"Vào:"` / `"In:"`
- `"Ra:"` / `"Out:"`
- `"Chọn thời gian"` / `"Select Time"`
- `"Chọn giờ vào"` / `"Select Check-in Time"`
- `"Chọn giờ ra"` / `"Select Check-out Time"`
- `"Hủy"` / `"Cancel"`
- `"Lưu"` / `"Save"`
- `"Đang lưu..."` / `"Saving..."`

### 2. Bổ sung key validation và thông báo:
- `"Vui lòng chọn trạng thái"` / `"Please select a status"`
- `"Vui lòng nhập thời gian check-in"` / `"Please enter check-in time"`
- `"Vui lòng nhập thời gian check-out"` / `"Please enter check-out time"`
- `"Thời gian check-out phải sau thời gian check-in"` / `"Check-out time must be after check-in time"`

### 3. Bổ sung key thông báo kết quả:
- `"Thành công"` / `"Success"`
- `"Đã cập nhật trạng thái làm việc"` / `"Work status updated successfully"`
- `"Không thể cập nhật trạng thái"` / `"Unable to update status"`
- `"Đã xảy ra lỗi khi cập nhật trạng thái"` / `"An error occurred while updating status"`

### 4. Bổ sung key trạng thái làm việc:
- `"Đi muộn"` / `"Late"`
- `"Về sớm"` / `"Early leave"`
- `"Đi muộn & về sớm"` / `"Late & Early leave"`
- `"Thiếu chấm công"` / `"Missing attendance"`
- `"Nghỉ phép"` / `"Leave"`
- `"Nghỉ bệnh"` / `"Sick leave"`
- `"Nghỉ lễ"` / `"Holiday"`
- `"Vắng không lý do"` / `"Absent without reason"`
- `"Ngày tương lai"` / `"Future date"`
- `"Chưa cập nhật"` / `"Not updated"`

### 5. Dọn dẹp và tối ưu hóa:
- Xóa các key trùng lặp trong file translations.js
- Sắp xếp lại thứ tự các key theo logic
- Đảm bảo đồng bộ giữa tiếng Việt và tiếng Anh

## Kết quả:
- ✅ Form cập nhật trạng thái hiện tại đã đồng bộ hoàn toàn với hệ thống ngôn ngữ
- ✅ Tất cả text trong ManualUpdateModal đều được dịch thuật
- ✅ Hỗ trợ chuyển đổi ngôn ngữ mượt mà
- ✅ Thông báo lỗi và validation đều có bản dịch
- ✅ Trạng thái làm việc hiển thị đúng ngôn ngữ được chọn

## Hướng dẫn test:
1. Mở WorkStatusUpdateScreen
2. Chọn một ngày bất kỳ để mở modal
3. Kiểm tra hiển thị các controls:
   - Status picker options với ngôn ngữ đúng
   - Time input fields (khi cần) với label đã dịch
   - Cancel và Save buttons với text đã dịch
4. Test validation messages với ngôn ngữ đúng
5. Test success/error messages với ngôn ngữ đúng
6. Thử chuyển đổi ngôn ngữ trong Settings và kiểm tra modal

## Files đã thay đổi:
- `utils/translations.js` - Bổ sung key dịch thuật cho ManualUpdateModal

## Commit type: 🌐 i18n
## Scope: translations/modal
## Breaking changes: None

# Câu hỏi thường gặp về tính toán giờ làm việc

## 1. Câu hỏi về cách tính giờ công

### Q: Tại sao giờ công vẫn được tính đầy đủ khi tôi đi muộn hoặc về sớm?
**A:** Giờ công trong AccShift luôn được tính dựa trên lịch trình ca làm việc đã đăng ký, không phụ thuộc vào thời gian bấm nút thực tế. Thời gian bấm nút chỉ ảnh hưởng đến trạng thái (status) như "Đi muộn", "Về sớm", nhưng không làm giảm số giờ công được tính. Điều này giúp đảm bảo tính nhất quán trong báo cáo và thống kê.

### Q: Làm thế nào để phân biệt giữa giờ hành chính và giờ tăng ca?
**A:** Giờ hành chính (standardHoursScheduled) được tính từ thời gian bắt đầu ca (startTime) đến thời gian kết thúc giờ hành chính (officeEndTime), trừ đi thời gian nghỉ (breakMinutes). Giờ tăng ca (otHoursScheduled) được tính từ thời gian kết thúc giờ hành chính (officeEndTime) đến thời gian kết thúc ca (endTime).

### Q: Giờ đêm được tính như thế nào?
**A:** Giờ đêm (nightHoursScheduled) được tính là tổng thời gian làm việc nằm trong khung giờ đêm từ 22:00 đến 05:00 sáng hôm sau. Hệ thống sẽ tính giao của khoảng thời gian ca làm việc và khung giờ đêm để xác định chính xác số giờ làm đêm.

### Q: Tại sao tổng giờ làm việc của tôi hiển thị là 0 khi tôi đã bấm nút "Đi Làm"?
**A:** Có thể do một trong các nguyên nhân sau:
1. Chưa có ca làm việc nào được áp dụng (activeShift = null)
2. Trạng thái làm việc chưa được tính toán lại sau khi bấm nút
3. Có lỗi trong quá trình tính toán

Hãy kiểm tra xem bạn đã áp dụng ca làm việc chưa và thử bấm nút "Làm mới dữ liệu" trên màn hình Thống kê.

## 2. Câu hỏi về chế độ nút

### Q: Sự khác biệt giữa chế độ Simple và chế độ Full là gì?
**A:** 
- **Chế độ Simple (Đơn giản)**: Chỉ cần bấm một nút "Đi Làm" để bắt đầu ca làm việc. Hệ thống sẽ tự động tính giờ công theo lịch trình ca.
- **Chế độ Full (Đầy đủ)**: Cần bấm đầy đủ các nút "Check-in" khi bắt đầu làm việc và "Check-out" khi kết thúc. Hệ thống sẽ kiểm tra thời gian bấm nút thực tế để xác định trạng thái (đi muộn, về sớm...) nhưng vẫn tính giờ công theo lịch trình ca.

### Q: Khi nào nên sử dụng chế độ Simple và khi nào nên sử dụng chế độ Full?
**A:**
- Sử dụng chế độ **Simple** khi:
  - Bạn làm việc theo ca cố định và không cần theo dõi chính xác thời gian vào/ra
  - Bạn muốn đơn giản hóa quy trình chấm công
  - Công ty không yêu cầu ghi nhận chính xác thời gian vào/ra

- Sử dụng chế độ **Full** khi:
  - Bạn cần theo dõi chính xác thời gian vào/ra
  - Công ty yêu cầu ghi nhận đi muộn/về sớm
  - Bạn muốn có dữ liệu chi tiết hơn về thời gian làm việc thực tế

### Q: "Bấm Nhanh" là gì và khi nào nó xảy ra?
**A:** "Bấm Nhanh" (Quick Punch) là khi bạn bấm nút "Check-in" và "Check-out" trong khoảng thời gian rất ngắn (dưới 60 giây). Hệ thống sẽ hiểu rằng bạn không thực sự làm việc trong khoảng thời gian đó, mà chỉ đang xác nhận rằng bạn đã hoàn thành ca làm việc. Trong trường hợp này, hệ thống sẽ tự động đặt trạng thái là "DU_CONG" và tính giờ công theo lịch trình ca.

## 3. Câu hỏi về trạng thái làm việc

### Q: Các trạng thái làm việc (status) có ý nghĩa gì?
**A:**
- **DU_CONG**: Đủ công, đã hoàn thành ca làm việc đúng giờ
- **DI_MUON**: Đi làm muộn so với giờ bắt đầu ca
- **VE_SOM**: Về sớm so với giờ kết thúc ca
- **DI_MUON_VE_SOM**: Vừa đi muộn vừa về sớm
- **THIEU_LOG**: Thiếu log chấm công (chỉ có check-in mà không có check-out)
- **QUEN_CHECK_OUT**: Quên check-out (đã check-in nhưng không check-out sau 16 giờ)
- **NGHI_PHEP**: Nghỉ có phép
- **NGHI_BENH**: Nghỉ do ốm đau
- **NGHI_LE**: Nghỉ ngày lễ
- **NGHI_THUONG**: Ngày nghỉ thông thường (thứ 7, chủ nhật)
- **VANG_MAT**: Vắng không lý do
- **CHUA_CAP_NHAT**: Chưa có dữ liệu chấm công
- **NGAY_TUONG_LAI**: Ngày trong tương lai

### Q: Làm thế nào để thay đổi trạng thái làm việc thủ công?
**A:** Bạn có thể thay đổi trạng thái làm việc thủ công bằng cách:
1. Mở màn hình chính (HomeScreen)
2. Nhấn vào ô ngày tương ứng trên lưới trạng thái tuần
3. Chọn trạng thái mới từ danh sách (ví dụ: Nghỉ phép, Nghỉ bệnh...)
4. Nhấn "Lưu" để cập nhật

### Q: Tại sao trạng thái của tôi là "THIEU_LOG" dù tôi đã bấm nút "Đi Làm"?
**A:** Trong chế độ Full, khi bạn chỉ bấm "Đi Làm" mà không bấm "Check-in" và "Check-out", hệ thống sẽ đánh dấu là "THIEU_LOG". Để khắc phục, bạn có thể:
1. Chuyển sang chế độ Simple trong cài đặt
2. Hoặc bấm đầy đủ các nút "Check-in" và "Check-out"
3. Hoặc cập nhật trạng thái thủ công thành "DU_CONG"

## 4. Câu hỏi về thống kê

### Q: Làm thế nào để xem thống kê giờ làm việc?
**A:** Để xem thống kê giờ làm việc:
1. Mở ứng dụng AccShift
2. Chuyển đến tab "Thống kê"
3. Chọn khoảng thời gian muốn xem (Tuần này, Tháng này, Năm này)
4. Xem dữ liệu tổng hợp ở phần trên và chi tiết từng ngày ở bảng bên dưới

### Q: Tại sao số giờ công trên màn hình thống kê khác với thời gian tôi thực sự làm việc?
**A:** Số giờ công trên màn hình thống kê luôn được tính dựa trên lịch trình ca làm việc đã đăng ký, không phụ thuộc vào thời gian bấm nút thực tế. Điều này đảm bảo tính nhất quán trong báo cáo và thống kê, đồng thời phù hợp với cách tính công của nhiều tổ chức.

### Q: Làm thế nào để tính tổng giờ làm việc trong một tháng?
**A:** Để tính tổng giờ làm việc trong một tháng:
1. Mở màn hình Thống kê
2. Chọn "Tháng này" từ các tùy chọn khoảng thời gian
3. Tổng giờ làm việc sẽ được hiển thị ở phần tóm tắt phía trên
4. Bạn cũng có thể xem chi tiết giờ làm việc của từng ngày trong bảng bên dưới

### Q: Làm thế nào để phân biệt giữa ngày làm việc và ngày nghỉ trong thống kê?
**A:** Trong bảng thống kê:
- Ngày làm việc sẽ có giá trị totalHoursScheduled > 0 và status không phải là các trạng thái nghỉ
- Ngày nghỉ sẽ có giá trị totalHoursScheduled = 0 và status là một trong các trạng thái nghỉ (NGHI_PHEP, NGHI_BENH, NGHI_LE, NGHI_THUONG, VANG_MAT)
- Số ngày làm việc thực tế (workDays) được hiển thị trong phần tóm tắt

## 5. Câu hỏi về ca làm việc

### Q: Làm thế nào để tạo và áp dụng ca làm việc mới?
**A:** Để tạo và áp dụng ca làm việc mới:
1. Mở tab "Ca làm việc"
2. Nhấn nút "+" để tạo ca mới
3. Điền thông tin ca làm việc (tên, thời gian bắt đầu, thời gian kết thúc...)
4. Lưu ca làm việc
5. Để áp dụng ca, nhấn vào ca làm việc và chọn "Áp dụng"

### Q: Làm thế nào để thiết lập ca làm việc qua đêm?
**A:** Để thiết lập ca làm việc qua đêm:
1. Mở tab "Ca làm việc"
2. Tạo ca mới hoặc chỉnh sửa ca hiện có
3. Đặt thời gian bắt đầu (startTime) lớn hơn thời gian kết thúc (endTime)
   Ví dụ: startTime = "22:00", endTime = "06:00"
4. Lưu ca làm việc

Hệ thống sẽ tự động nhận diện đây là ca qua đêm và tính toán giờ công phù hợp.

### Q: Tôi có thể có nhiều ca làm việc khác nhau trong một tuần không?
**A:** Có, bạn có thể tạo nhiều ca làm việc khác nhau và áp dụng chúng cho các ngày khác nhau trong tuần. Khi tạo ca làm việc, bạn có thể chọn các ngày áp dụng (daysApplied) để chỉ định ca làm việc cho những ngày cụ thể trong tuần.

## 6. Câu hỏi khác

### Q: Làm thế nào để xóa log chấm công nếu tôi bấm nhầm?
**A:** Để xóa log chấm công:
1. Trên màn hình chính, nhấn nút "Làm mới" (biểu tượng làm mới) ở góc nút đa năng
2. Xác nhận việc xóa tất cả log chấm công của ngày hiện tại
3. Sau khi xóa, bạn có thể bấm lại các nút chấm công từ đầu

### Q: Dữ liệu chấm công của tôi có được sao lưu không?
**A:** Dữ liệu chấm công được lưu trữ cục bộ trong thiết bị của bạn sử dụng AsyncStorage. Để sao lưu dữ liệu:
1. Mở tab "Cài đặt"
2. Tìm tùy chọn "Sao lưu & Khôi phục"
3. Nhấn "Sao lưu dữ liệu" để tạo bản sao lưu
4. Bạn có thể khôi phục dữ liệu từ bản sao lưu này sau này nếu cần

### Q: Tại sao ứng dụng không ghi nhận giờ làm việc thực tế của tôi?
**A:** AccShift được thiết kế để tính giờ công theo lịch trình ca làm việc đã đăng ký, không phụ thuộc vào thời gian bấm nút thực tế. Điều này phù hợp với cách tính công của nhiều tổ chức, nơi nhân viên được tính công đầy đủ theo ca làm việc đã đăng ký, miễn là họ có mặt và hoàn thành công việc.

Nếu bạn muốn theo dõi thời gian làm việc thực tế, bạn có thể xem thông tin vaoLogTime và raLogTime trong bảng thống kê, đây là thời gian bạn thực sự bấm nút check-in và check-out.

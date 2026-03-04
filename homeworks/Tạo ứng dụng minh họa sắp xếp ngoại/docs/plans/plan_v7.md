# Kế hoạch Phiên bản 7: Cập nhật luồng xử lý File Nhị phân
- Phản biện v6: Xử lý file nhị phân trong python đôi khi dễ lỗi nếu không quản lý tốt context manager.
- Kỹ thuật: Sử dụng cú pháp `with open(...)` cho tất cả các thao tác đọc/ghi.
- Định dạng: Số thực 8 bytes tương ứng với kiểu `double` trong C. Trong Python `struct`, sử dụng format string `'>d'` (Big-endian) hoặc `'<d'` (Little-endian). Cần nhất quán sử dụng Little-endian `'<d'`.
- Chú ý rác file tạm: Ứng dụng phải xóa các file `chunk_i.bin` sau khi trộn xong để gọn gàng.

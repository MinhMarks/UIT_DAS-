# Kế hoạch Phiên bản 9: Rà soát Edge Cases
- Phản biện v8: Các trường hợp lỗi cần xử lý?
- File không tồn tại hoặc không phải quyền đọc/ghi.
- Kích thước bộ nhớ gõ vào không phải số nguyên hoặc quá nhỏ (<=1).
- File nhị phân bị thiếu byte ở cuối (file size không chia hết cho 8). Cần try-except và hiện thông báo lỗi lên GUI bằng `messagebox`.
- Xử lý mượt mà khi người dùng bấm "Dừng" (cần thêm cờ `stop_flag`). Bổ sung tính năng dừng quá trình.

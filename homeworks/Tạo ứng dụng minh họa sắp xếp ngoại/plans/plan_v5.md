# Kế hoạch Phiên bản 5: Quản lý Luồng (Threading) & Hiệu năng
- Phản biện v4: Khẳng định ứng dụng có thể đơ UI.
- Giải pháp: Chạy tiến trình External Sort trên một luồng riêng (`threading.Thread`).
- Giao tiếp UI: Sử dụng `queue.Queue` hoặc gọi `window.after()` để luồng phụ gửi log cập nhật lên luồng UI chính một cách an toàn.
- Dữ liệu: Do là "minh họa với tập tin nhỏ", có thể thêm tùy chọn làm chậm quá trình (thêm `time.sleep`) để người dùng kịp quan sát log hiển thị.

# Đồ án: Minh họa Sắp xếp Ngoại (External Sort)

Đây là bài tập mô phỏng quá trình **Sắp xếp ngoại (External Sort)** bằng thuật toán **Trộn K-Đường (K-Way Merge Sort)**. Yêu cầu đặc biệt của đồ án là kiểm soát chặt chẽ giới hạn bộ nhớ (RAM) và thao tác với tệp nhị phân trên đĩa từ (Disk I/O).

## 🚀 Tính năng Nổi bật (Phiên bản Vibecode Plus)
Nhằm mang lại trải nghiệm trực quan đỉnh cao trên nền tảng Web, đồ án không dừng lại ở mức giao diện thông thường mà được trang bị các tính năng "Premium":
- **100% Client-side Web App**: Không cần cài đặt Python hay thư viện phức tạp. Chỉ cần mở trình duyệt.
- **Xử lý File Nhị phân Thực tế**: Đọc và ghi trực tiếp File Binary (`.bin`) Float64 (8-bytes/số) bằng File API, xử lý ép kiểu mảng qua `Float64Array`.
- **Console Terminal Trace**: Hộp thoại log ghi nhận chi tiết thao tác I/O mảng.
- **Web Audio FX**: Phát thanh âm tương tác với các sự kiện vào lô, push pop và trộn.
- **Trình điều khiển Thời gian thực (Playback)**: Nút Tạm Dừng / Bước Kế / Tiếp tục cho phép User điều khiển nhịp độ hoạt cảnh mượt mà.

## 📂 Tổ chức mã Nguồn
Cấu trúc thư mục đã được tổ chức lại để chuẩn hóa:

- `web_app/`: **THƯ MỤC TRUNG TÂM.** Mở `index.html` trong đây để chạy Ứng dụng mô phỏng. (Chứa HTML/CSS/JS).
- `docs/`: Chứa các tài liệu đặc tả, đề bài (`debai.txt`), và hướng dẫn sử dụng báo cáo bằng LaTeX (`HuongDanSuDung.tex`).
- `legacy_python/`: Chứa các kịch bản python thô được code từ các chặng trước đó của quá trình phát triển (để làm tư liệu tham khảo cơ bản).
- `data/`: Chứa dữ liệu `.bin` kết xuất ra trong quá trình test.

## 💻 Hướng dẫn Chạy Nhanh
1. Khởi chạy file `web_app/index.html` bằng Chrome/Edge.
2. Tại Box điều khiển, bấm **Tạo & Tải Về Mẫu**. Hệ thống sẽ tải về tệp tin nhị phân mẫu.
3. Upload tệp nhị phân vừa tải.
4. Điều chỉnh **năng lực của RAM (Chunk Size)** tại thanh công cụ (vd: 5).
5. Bấm **Bắt đầu** và chiêm ngưỡng hệ thống xử lý bộ nhớ. Mở loa để trải nghiệm âm thanh.

## 🛠 Tác giả
Bài tập môn học DSA++ (Cấu trúc Dữ liệu và Giải thuật Máy tính Nâng cao).

# Đồ án: Cài đặt cây Đỏ-Đen (Red-Black Tree)

Thư mục này chứa kết quả của bài tập Cấu trúc dữ liệu và giải thuật nâng cao (DSA++): Triển khai mã nguồn cấu trúc tự cân bằng Cây Đỏ-Đen hoàn toàn bằng Python với tương tác giao diện Console (CLI).

## 🔥 Cách tiếp cận Phát triển Lặp (Iterative Development)
Nhằm minh hoạ sát sao khả năng tăng tiến chất lượng cấu trúc và tư duy refactor như các dự án mã nguồn mở, quá trình giải quyết bài tập không chỉ dừng lại tại 1 file code, mà được dàn trải ra **10 phiên bản** độc lập. Mỗi phiên bản (`V1` đến `V10`) giải quyết và bổ sung dần một tính năng mới của Cây đỏ đen, kế thừa trực tiếp chất liệu từ bản trước đó.

Hành trình xây dựng cấu trúc 10 Phiên bản:
- **`rbt_v1.py`**: Phiên bản 1, chỉ cài đặt khung Cây Nhị phân Tìm kiếm (BST) chưa có màu đỏ đen.
- **`rbt_v2.py`**: Định nghĩa Màu sắc lá ảo (TNULL) và Phép Xoay cây (Rotations).
- **`rbt_v3.py`**: Thi hành thuật toán hạt nhân: Khắc phục lỗi màu (Insert Fixup).
- **`rbt_v4.py`**: Thiết kế hàm truy vấn/tìm kiếm Binary Search (Search Tree).
- **`rbt_v5.py`**: Gán tính năng duyệt cây In cấu trúc ra text Console thô ráp.
- **`rbt_v6.py`**: Giao diện Console UI: Nâng cấp hàm in thành dạng cấu trúc cây thư mục cực đẹp.
- **`rbt_v7.py`**: Khai báo module tạo/chèn nút hàng loạt (Bulk Insert array).
- **`rbt_v8.py`**: Cấu hình Menu tương tác thời gian thực với lệnh `While True` (REPL).
- **`rbt_v9.py`**: Hiệu ứng thị giác: Các nút đỏ và đen thực sự phát sáng nhờ mã escape ANSI Terminal!
- **`rbt_v10.py`**: **Final Polish.** Bản phát hành chính thức. Trang bị Docstrings (Sphinx/Google), Type Hints nghiêm ngặt, Try-Catch bắt lỗi toàn diện để chống dump console.

## 🚀 Hướng dẫn Sử dụng (Chạy phiên bản hoàn hảo nhất)

Để trải nghiệm toàn bộ sức mạnh phần mềm, bạn chỉ cần mở Terminal/Command Prompt lên và chạy tệp v10:

```bash
python rbt_v10.py
```

Lúc này, bạn sẽ nhận được một Menu Console tương tác toàn lực:
1. Nhập lựa chọn `4` và truyền chuỗi `10, 18, 7, 15, 16, 30, 25, 40, 60, 2, 1, 70` để tự động hóa tạo cây khổng lồ.
2. Nhập lựa chọn `3` để in chiêm ngưỡng cái cây được rẽ nhánh trực tiếp bằng đồ họa ASCII tích hợp màu.
3. Nhập lựa chọn `2` để thử tìm kiếm một số bất kì.
4. Lựa chọn `0` để thoát chương trình.

## ⚠️ Yêu cầu hệ thống
* Trình thông dịch Python 3.6+ trở lên (hỗ trợ Type hints).
* Terminal hỗ trợ dãy thoát ANSI (Mặc định trong CMD Win 10+, PowerShell, MacOS Terminal, Linux Bash).

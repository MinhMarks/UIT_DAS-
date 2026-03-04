import os

plan_dir = r"d:\UIT\Subjects\DSA++\homeworks\Tạo ứng dụng minh họa sắp xếp ngoại\plans"
os.makedirs(plan_dir, exist_ok=True)

plans = [
    """# Kế hoạch Phiên bản 1: Ý tưởng cơ bản
- Ngôn ngữ: Python.
- Giải thuật: Thay thế lựa chọn (Replacement Selection) hoặc Sắp xếp trộn K-đường (K-way Merge Sort).
- Giao diện: Dòng lệnh (CLI).
- Yêu cầu: Đọc file nhị phân (số thực 8 bytes), sắp xếp và ghi ra file mới.
""",
    """# Kế hoạch Phiên bản 2: Cải tiến Giao diện (GUI)
- Phản biện v1: CLI khó minh họa quá trình sắp xếp cho người dùng.
- Thay đổi: Sử dụng Tkinter để tạo giao diện đồ họa.
- Tính năng: Thêm nút chọn file, nút bắt đầu sắp xếp, và một khung văn bản (Text widget) để ghi log quá trình (chia chunk, merge).
- Xử lý file: Sử dụng thư viện `struct` để đọc/ghi số thực 8 bytes (`'d'`).
""",
    """# Kế hoạch Phiên bản 3: Chi tiết hóa giải thuật External Sort
- Phản biện v2: Cần làm rõ cách minh họa với file kích thước nhỏ.
- Thuật toán lõi: K-way Merge Sort.
  1. Giai đoạn phân chia (Distribution): Đọc từng phần (chunk) dữ liệu vừa đủ bộ nhớ RAM (đối với minh họa, set chunk size nhỏ, ví dụ 100 số), sắp xếp trong RAM bằng Introspective Sort (hàm `sort` của Python), ghi ra các file tạm `chunk_i.bin`.
  2. Giai đoạn trộn (Merge): Dùng cấu trúc Min-Heap (`heapq` trong Python) để trộn K file tạm thành file kết quả `output.bin`.
""",
    """# Kế hoạch Phiên bản 4: Trực quan hóa quá trình (Illustration)
- Phản biện v3: Làm sao để thể hiện rõ quá trình minh họa sắp xếp?
- Giao diện: Cần thêm tính năng "Sinh file dữ liệu mẫu" để người dùng dễ thử nghiệm.
- Minh họa: Móc nối log trực tiếp vào UI. Khi đọc chunk 1, in ra "Đang xử lý chunk 1: [chi tiết byte...]". Khi trộn, in ra "Đang trộn các file tạm...".
- Cảnh báo: Việc cập nhật UI có thể làm đơ ứng dụng nếu chạy trên luồng chính. Cần dùng `threading`.
""",
    """# Kế hoạch Phiên bản 5: Quản lý Luồng (Threading) & Hiệu năng
- Phản biện v4: Khẳng định ứng dụng có thể đơ UI.
- Giải pháp: Chạy tiến trình External Sort trên một luồng riêng (`threading.Thread`).
- Giao tiếp UI: Sử dụng `queue.Queue` hoặc gọi `window.after()` để luồng phụ gửi log cập nhật lên luồng UI chính một cách an toàn.
- Dữ liệu: Do là "minh họa với tập tin nhỏ", có thể thêm tùy chọn làm chậm quá trình (thêm `time.sleep`) để người dùng kịp quan sát log hiển thị.
""",
    """# Kế hoạch Phiên bản 6: Chuẩn hóa File Hướng dẫn (LaTeX)
- Phản biện v5: Đề bài yêu cầu file hướng dẫn bằng LaTeX, không đạo văn và dùng đoạn văn hoàn chỉnh.
- Cấu trúc LaTeX:
  1. Giới thiệu ứng dụng & Kiến trúc tổng quan.
  2. Hướng dẫn cài đặt & Chạy ứng dụng.
  3. Minh họa giải thuật Sắp xếp ngoại trên ứng dụng.
- Ràng buộc: Tuyệt đối không dùng list (`itemize`/`enumerate`) sơ sài. Mọi thứ phải viết thành đoạn văn, giải thích cặn kẽ ý nghĩa các tính năng.
""",
    """# Kế hoạch Phiên bản 7: Cập nhật luồng xử lý File Nhị phân
- Phản biện v6: Xử lý file nhị phân trong python đôi khi dễ lỗi nếu không quản lý tốt context manager.
- Kỹ thuật: Sử dụng cú pháp `with open(...)` cho tất cả các thao tác đọc/ghi.
- Định dạng: Số thực 8 bytes tương ứng với kiểu `double` trong C. Trong Python `struct`, sử dụng format string `'>d'` (Big-endian) hoặc `'<d'` (Little-endian). Cần nhất quán sử dụng Little-endian `'<d'`.
- Chú ý rác file tạm: Ứng dụng phải xóa các file `chunk_i.bin` sau khi trộn xong để gọn gàng.
""",
    """# Kế hoạch Phiên bản 8: Giao diện Trực quan và Linh hoạt
- Phản biện v7: Làm sao thay đổi kích thước bộ nhớ giả lập?
- Cải tiến tính năng: Thêm một ô nhập liệu (Entry) cho phép người dùng tự cấu hình "Memory Size" (số lượng phần tử tối đa đọc vào RAM cùng lúc). Ví dụ nhập 10, ứng dụng sẽ cắt file thành từng khúc 10 số. Như vậy việc minh họa trên file nhỏ sẽ rất rõ ràng.
- Giao diện tổng thể: Title "Minh Họa Sắp Xếp Ngoại (External Sort) - DSA++".
""",
    """# Kế hoạch Phiên bản 9: Rà soát Edge Cases
- Phản biện v8: Các trường hợp lỗi cần xử lý?
- File không tồn tại hoặc không phải quyền đọc/ghi.
- Kích thước bộ nhớ gõ vào không phải số nguyên hoặc quá nhỏ (<=1).
- File nhị phân bị thiếu byte ở cuối (file size không chia hết cho 8). Cần try-except và hiện thông báo lỗi lên GUI bằng `messagebox`.
- Xử lý mượt mà khi người dùng bấm "Dừng" (cần thêm cờ `stop_flag`). Bổ sung tính năng dừng quá trình.
""",
    """# Kế hoạch Phiên bản 10: Kiến trúc Hoàn hảo & Chốt phương án
- Lõi thuật toán (External Sort Module): Tách file `external_sort.py`.
- Giao diện UI (Tkinter GUI Module): Tách file `app.py`.
- Sinh file mẫu (Data Generator): Tích hợp vào UI hoặc riêng.
- File Hướng dẫn: `HuongDanSuDung.tex` - Viết hoàn toàn bằng tiếng Việt, giải thích toàn bộ cách ứng dụng đọc file, ghi file tạm, và trộn bằng Heap. Không dùng gạch đầu dòng hời hợt, giải thích từng biến số và cấu trúc màn hình.
- Chốt: Bắt đầu triển khai codebase dựa trên kiến trúc này.
"""
]

for i, plan in enumerate(plans):
    with open(os.path.join(plan_dir, f"plan_v{i+1}.md"), "w", encoding="utf-8") as f:
        f.write(plan)

print(f"Generated 10 refinement plans in {plan_dir}")

# Kế hoạch Phiên bản 3: Chi tiết hóa giải thuật External Sort
- Phản biện v2: Cần làm rõ cách minh họa với file kích thước nhỏ.
- Thuật toán lõi: K-way Merge Sort.
  1. Giai đoạn phân chia (Distribution): Đọc từng phần (chunk) dữ liệu vừa đủ bộ nhớ RAM (đối với minh họa, set chunk size nhỏ, ví dụ 100 số), sắp xếp trong RAM bằng Introspective Sort (hàm `sort` của Python), ghi ra các file tạm `chunk_i.bin`.
  2. Giai đoạn trộn (Merge): Dùng cấu trúc Min-Heap (`heapq` trong Python) để trộn K file tạm thành file kết quả `output.bin`.

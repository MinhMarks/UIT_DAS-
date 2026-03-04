import os
import struct
import heapq
import time

def generate_sample_file(filename, count, log_callback=None):
    import random
    if log_callback:
        log_callback(f"Bắt đầu sinh tệp mẫu '{filename}' với {count} số thực (double)...")
    with open(filename, 'wb') as f:
        for _ in range(count):
            val = random.uniform(-1000.0, 1000.0)
            f.write(struct.pack('<d', val))
    if log_callback:
        log_callback(f"Hoàn thành sinh tệp mẫu.")

def external_sort(input_filename, output_filename, chunk_size, log_callback=None):
    if not os.path.exists(input_filename):
        if log_callback:
            log_callback(f"Lỗi: Không tìm thấy tệp {input_filename}")
        return False
        
    if chunk_size < 1:
        if log_callback:
            log_callback(f"Lỗi: Kích thước khối (chunk size) phải >= 1")
        return False

    temp_files = []
    
    # Phase 1: Split and Sort Chunks
    if log_callback:
        log_callback("=== GIAI ĐOẠN 1: PHÂN CHIA VÀ SẮP XẾP CỤC BỘ ===")
        log_callback(f"Đọc tệp {input_filename} với kích thước khối = {chunk_size} phần tử.")
        
    file_handles_to_close = []
    try:
        with open(input_filename, 'rb') as f:
            chunk_idx = 0
            while True:
                # Read chunk_size * 8 bytes
                bytes_read = f.read(chunk_size * 8)
                if not bytes_read:
                    break
                
                # Unpack
                num_elements = len(bytes_read) // 8
                elements = list(struct.unpack(f'<{num_elements}d', bytes_read))
                
                # Sort in memory
                elements.sort()
                
                # Write to temp file
                temp_filename = f"temp_chunk_{chunk_idx}.bin"
                with open(temp_filename, 'wb') as temp_f:
                    for val in elements:
                        temp_f.write(struct.pack('<d', val))
                
                temp_files.append(temp_filename)
                if log_callback:
                    log_callback(f" - Đã đọc khối {chunk_idx + 1} ({num_elements} phần tử), sắp xếp và lưu vào '{temp_filename}'.")
                
                chunk_idx += 1
                time.sleep(0.1) # Add slight delay for illustration purposes
                
        if len(temp_files) == 0:
            if log_callback:
                log_callback("Tệp nguồn trống rỗng.")
            return True
        
        # Phase 2: K-Way Merge
        if log_callback:
            log_callback("\n=== GIAI ĐOẠN 2: TRỘN K-ĐƯỜNG (K-WAY MERGE) ===")
            log_callback(f"Bắt đầu trộn {len(temp_files)} tệp tạm...")
            
        file_handles_to_close = [open(tf, 'rb') for tf in temp_files]
        min_heap = []
        
        # Initialize heap with the first element from each chunk
        for i, fh in enumerate(file_handles_to_close):
            bytes_read = fh.read(8)
            if bytes_read:
                val = struct.unpack('<d', bytes_read)[0]
                heapq.heappush(min_heap, (val, i))
                
        with open(output_filename, 'wb') as f_out:
            elements_merged = 0
            while min_heap:
                # Get smallest
                val, file_idx = heapq.heappop(min_heap)
                
                # Write to output
                f_out.write(struct.pack('<d', val))
                elements_merged += 1
                
                # Read next from the same file
                bytes_read = file_handles_to_close[file_idx].read(8)
                if bytes_read:
                    next_val = struct.unpack('<d', bytes_read)[0]
                    heapq.heappush(min_heap, (next_val, file_idx))
                
        if log_callback:
            log_callback(f"Đã trộn xong tổng cộng {elements_merged} phần tử vào '{output_filename}'.")
            
    except Exception as e:
        if log_callback:
            log_callback(f"Lỗi trong quá trình xử lý: {e}")
        return False
    finally:
        # Cleanup
        if log_callback:
            log_callback("\n=== DỌN DẸP ===")
        try:
            for fh in file_handles_to_close:
                try:
                    fh.close()
                except:
                    pass
            for tf in temp_files:
                if os.path.exists(tf):
                    os.remove(tf)
                    if log_callback:
                        log_callback(f" - Đã xóa tệp tạm '{tf}'.")
        except:
            pass
            
    if log_callback:
        log_callback(f"\n=> HOÀN TẤT SẮP XẾP NGOẠI THÀNH CÔNG.\n")
    return True

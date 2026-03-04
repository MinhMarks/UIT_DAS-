import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import threading
import external_sort
import os

class ExternalSortApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Minh Họa Sắp Xếp Ngoại (External Sort) - DSA++")
        self.root.geometry("800x600")
        
        # Styles
        style = ttk.Style()
        style.theme_use('clam')
        
        main_frame = ttk.Frame(root, padding=10)
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # --- Frame 1: Generate Sample Data ---
        frame_gen = ttk.LabelFrame(main_frame, text="1. Sinh Dữ Liệu Mẫu", padding=(10, 5))
        frame_gen.pack(fill=tk.X, pady=5)
        
        ttk.Label(frame_gen, text="Số lượng phần tử (double):").pack(side=tk.LEFT, padx=5)
        self.sample_count_var = tk.StringVar(value="50")
        ttk.Entry(frame_gen, textvariable=self.sample_count_var, width=10).pack(side=tk.LEFT, padx=5)
        
        ttk.Button(frame_gen, text="Sinh tệp mẫu (sample.bin)", command=self.generate_sample).pack(side=tk.LEFT, padx=10)
        
        # --- Frame 2: Algorithm Configuration ---
        frame_config = ttk.LabelFrame(main_frame, text="2. Cấu Hình Sắp Xếp Ngoại", padding=(10, 5))
        frame_config.pack(fill=tk.X, pady=5)
        
        ttk.Label(frame_config, text="Tệp đầu vào:").grid(row=0, column=0, sticky=tk.W, padx=5, pady=5)
        self.input_file_var = tk.StringVar()
        ttk.Entry(frame_config, textvariable=self.input_file_var, width=60).grid(row=0, column=1, padx=5, pady=5)
        ttk.Button(frame_config, text="Chọn...", command=self.select_input_file).grid(row=0, column=2, padx=5, pady=5)
        
        ttk.Label(frame_config, text="Tệp đầu ra:").grid(row=1, column=0, sticky=tk.W, padx=5, pady=5)
        self.output_file_var = tk.StringVar(value="sorted_output.bin")
        ttk.Entry(frame_config, textvariable=self.output_file_var, width=60).grid(row=1, column=1, padx=5, pady=5)
        ttk.Button(frame_config, text="Chọn...", command=self.select_output_file).grid(row=1, column=2, padx=5, pady=5)
        
        ttk.Label(frame_config, text="Kích thước RAM giả lập (số phần tử / chunk):").grid(row=2, column=0, sticky=tk.W, padx=5, pady=5)
        self.chunk_size_var = tk.StringVar(value="10")
        ttk.Entry(frame_config, textvariable=self.chunk_size_var, width=15).grid(row=2, column=1, sticky=tk.W, padx=5, pady=5)
        
        # --- Frame 3: Controls ---
        frame_controls = ttk.Frame(main_frame, padding=(0, 5))
        frame_controls.pack(fill=tk.X)
        
        self.btn_sort = ttk.Button(frame_controls, text="Bắt đầu Sắp Xếp Ngoại", command=self.start_sorting)
        self.btn_sort.pack(side=tk.LEFT, pady=10)
        
        # --- Frame 4: Log Output ---
        frame_log = ttk.LabelFrame(main_frame, text="3. Minh họa Quá trình Sắp Xếp", padding=(10, 5))
        frame_log.pack(fill=tk.BOTH, expand=True, pady=5)
        
        self.log_text = tk.Text(frame_log, wrap=tk.WORD, state=tk.DISABLED, bg="#1e1e1e", fg="#d4d4d4", font=("Consolas", 10))
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        scrollbar = ttk.Scrollbar(frame_log, command=self.log_text.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.log_text.config(yscrollcommand=scrollbar.set)
        
        self.log("Sẵn sàng. Vui lòng sinh dữ liệu mẫu hoặc chọn tệp đầu vào.")

    def log(self, message):
        self.log_text.config(state=tk.NORMAL)
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.log_text.config(state=tk.DISABLED)

    def thread_safe_log(self, message):
        self.root.after(0, self.log, message)

    def generate_sample(self):
        try:
            count = int(self.sample_count_var.get())
            if count <= 0: raise ValueError
        except:
            messagebox.showerror("Lỗi", "Số lượng phần tử phải là số nguyên dương.")
            return
            
        filename = "sample.bin"
        self.input_file_var.set(os.path.abspath(filename))
        
        def run_gen():
            self.root.after(0, lambda: self.btn_sort.config(state=tk.DISABLED))
            external_sort.generate_sample_file(filename, count, self.thread_safe_log)
            self.root.after(0, lambda: self.btn_sort.config(state=tk.NORMAL))
            
        threading.Thread(target=run_gen, daemon=True).start()

    def select_input_file(self):
        filename = filedialog.askopenfilename(title="Chọn tệp nhị phân đầu vào", filetypes=[("Binary Files", "*.bin"), ("All Files", "*.*")])
        if filename:
            self.input_file_var.set(filename)

    def select_output_file(self):
        filename = filedialog.asksaveasfilename(title="Lưu tệp đầu ra", defaultextension=".bin", filetypes=[("Binary Files", "*.bin"), ("All Files", "*.*")])
        if filename:
            self.output_file_var.set(filename)

    def start_sorting(self):
        input_file = self.input_file_var.get()
        output_file = self.output_file_var.get()
        
        try:
            chunk_size = int(self.chunk_size_var.get())
            if chunk_size <= 0: raise ValueError
        except:
            messagebox.showerror("Lỗi", "Kích thước giả lập RAM phải là số nguyên dương (ví dụ: 10).")
            return
            
        if not input_file or not os.path.exists(input_file):
            messagebox.showerror("Lỗi", "Vui lòng chọn một tệp đầu vào hợp lệ.")
            return
            
        if not output_file:
            messagebox.showerror("Lỗi", "Vui lòng chỉ định tệp đầu ra.")
            return

        self.btn_sort.config(state=tk.DISABLED)
        self.log("\n" + "="*50)
        
        def run_sort():
            success = external_sort.external_sort(input_file, output_file, chunk_size, self.thread_safe_log)
            self.root.after(0, lambda: self.btn_sort.config(state=tk.NORMAL))
            if success:
                self.thread_safe_log("Bạn có thể dùng công cụ Hex Editor hoặc viết code để kiểm tra tệp đầu ra.")
                
        threading.Thread(target=run_sort, daemon=True).start()

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(current_dir)
    root = tk.Tk()
    app = ExternalSortApp(root)
    root.mainloop()


# Môn học: Cấu trúc Dữ liệu và Giải thuật Máy tính Nâng cao
# Bài tập: Cài đặt cây Đỏ-Đen
# Phiên bản 8: Giao diện Console tương tác (Interactive REPL)
#
# Ý nghĩa: Đề bài yêu cầu "thực hiện các thao tác trên cây đỏ đen với giao diện console".
# Vì thế, một vòng lặp (REPL) cho phép người dùng nhập lệnh liên tục 
# (như Thêm, In, Tìm kiếm) là bắt buộc.

import sys

class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.parent = None
        self.color = 1 

class RedBlackTreeV8:
    def __init__(self):
        self.TNULL = Node(0)
        self.TNULL.color = 0
        self.root = self.TNULL
        
    # --- CÁC HÀM CỐT LÕI (Từ V7) ---
    def left_rotate(self, x):
        y = x.right
        x.right = y.left
        if y.left != self.TNULL:
            y.left.parent = x
        y.parent = x.parent
        if x.parent == None:
            self.root = y
        elif x == x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y
        y.left = x
        x.parent = y

    def right_rotate(self, x):
        y = x.left
        x.left = y.right
        if y.right != self.TNULL:
            y.right.parent = x
        y.parent = x.parent
        if x.parent == None:
            self.root = y
        elif x == x.parent.right:
            x.parent.right = y
        else:
            x.parent.left = y
        y.right = x
        x.parent = y

    def insert_fixup(self, k):
        while k.parent != None and k.parent.color == 1:
            if k.parent == k.parent.parent.right:
                u = k.parent.parent.left 
                if u.color == 1:
                    u.color = 0
                    k.parent.color = 0
                    k.parent.parent.color = 1
                    k = k.parent.parent
                else:
                    if k == k.parent.left:
                        k = k.parent
                        self.right_rotate(k)
                    k.parent.color = 0
                    k.parent.parent.color = 1
                    self.left_rotate(k.parent.parent)
            else:
                u = k.parent.parent.right
                if u.color == 1:
                    u.color = 0
                    k.parent.color = 0
                    k.parent.parent.color = 1
                    k = k.parent.parent
                else:
                    if k == k.parent.right:
                        k = k.parent
                        self.left_rotate(k)
                    k.parent.color = 0
                    k.parent.parent.color = 1
                    self.right_rotate(k.parent.parent)
            if k == self.root:
                break
        self.root.color = 0

    def insert(self, key):
        new_node = Node(key)
        new_node.left = self.TNULL
        new_node.right = self.TNULL
        y = None
        x = self.root
        while x != self.TNULL:
            y = x
            if new_node.key < x.key:
                x = x.left
            else:
                x = x.right
        new_node.parent = y
        if y == None:
            self.root = new_node
        elif new_node.key < y.key:
            y.left = new_node
        else:
            y.right = new_node
        new_node.color = 1
        self.insert_fixup(new_node)

    def search_tree(self, k):
        return self._search_tree_helper(self.root, k)

    def _search_tree_helper(self, node, key):
        if node == self.TNULL or key == node.key:
            return node
        if key < node.key:
            return self._search_tree_helper(node.left, key)
        return self._search_tree_helper(node.right, key)

    def print_tree(self):
        print("\n🎄 CẤU TRÚC DIRECTORY TREE 🎄")
        if self.root == self.TNULL:
            print("(Cây rỗng)")
        else:
            self._print_helper(self.root, "", True)
        print("-----------------------------------\n")

    def _print_helper(self, curr_ptr, indent, last):
        if curr_ptr != self.TNULL:
            sys.stdout.write(indent)
            if last:
                sys.stdout.write("└── ")
                indent += "    "
            else:
                sys.stdout.write("├── ")
                indent += "│   "

            s_color = "ĐỎ" if curr_ptr.color == 1 else "ĐEN"
            print(f"{curr_ptr.key} ({s_color})")
            
            self._print_helper(curr_ptr.left, indent, False)
            self._print_helper(curr_ptr.right, indent, True)
            
    def build_from_list(self, keys):
        for k in keys:
            self.insert(k)

# --- TÍNH NĂNG MỚI (V8) ---
def run_console_app():
    tree = RedBlackTreeV8()
    
    while True:
        print("====== MENU RED-BLACK TREE ======")
        print("1. Thêm khóa (Insert) thủ công")
        print("2. Tìm kiếm khóa (Search)")
        print("3. In cây (Print Directory Tree)")
        print("4. Tạo cây từ mảng nhập sẵn")
        print("0. Thoát")
        
        choice = input("Vui lòng chọn chức năng (0-4): ")
        
        if choice == '1':
            val = input("Nhập số cần thêm: ")
            try:
                val = int(val)
                tree.insert(val)
                print(f"-> Đã thêm thành công {val}.")
            except ValueError:
                print("Lỗi: Vui lòng nhập số nguyên hợp lệ!")
                
        elif choice == '2':
            val = input("Nhập khoá cần tìm: ")
            try:
                val = int(val)
                result = tree.search_tree(val)
                if result != tree.TNULL:
                    print(f"-> TÌM THẤY! Khóa {val} có màu {'ĐỎ' if result.color == 1 else 'ĐEN'}.")
                else:
                    print(f"-> KHÔNG TÌM THẤY khóa {val} trong cây.")
            except ValueError:
                print("Lỗi: Vui lòng nhập số nguyên hợp lệ!")
                
        elif choice == '3':
            tree.print_tree()
            
        elif choice == '4':
            arr_str = input("Nhập mảng số nguyên (cách nhau bởi dấu phẩy, VD: 10,20,30): ")
            try:
                arr = [int(x.strip()) for x in arr_str.split(",")]
                tree.build_from_list(arr)
                print(f"-> Đã tạo cây thành công từ mảng {arr}.")
            except ValueError:
                print("Lỗi: Định dạng mảng không hợp lệ!")
                
        elif choice == '0':
            print("Thoát chương trình. Tạm biệt!")
            break
        else:
            print("Lỗi: Chức năng không hợp lệ. Vui lòng chọn lại!")

if __name__ == "__main__":
    run_console_app()

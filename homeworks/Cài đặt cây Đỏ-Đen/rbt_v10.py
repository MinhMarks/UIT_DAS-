

"""
Môn học: Cấu trúc Dữ liệu và Giải thuật Máy tính Nâng cao
Bài tập: Cài đặt cây Đỏ-Đen (Red-Black Tree)
Phiên bản 10: Phiên bản Hoàn hảo (Final Polish)
Link toàn bộ project : https://github.com/MinhMarks/UIT_DAS-/tree/main/homeworks/C%C3%A0i%20%C4%91%E1%BA%B7t%20c%C3%A2y%20%C4%90%E1%BB%8F-%C4%90en 

Ý nghĩa: 
Đây là phiên bản thương mại hóa cuối cùng (V10). 
Bổ sung Type Hints tĩnh (typing), Docstrings chuẩn Google style,
xử lý ngoại lệ toàn diện, và cấu trúc code chặt chẽ như các thư viện mã nguồn mở thực thụ.
"""

import sys
from typing import Optional, List, Union

class Node:
    """Đại diện cho một Nút (Node) cơ bản trong Cây Đỏ-Đen.
    
    Attributes:
        key (int): Giá trị/Khóa lưu trữ tại Nút.
        left (Optional[Node]): Con trỏ trái.
        right (Optional[Node]): Con trỏ phải.
        parent (Optional[Node]): Con trỏ trỏ ngược về Nút Cha.
        color (int): 1 nguyên dương đại diện màu Đỏ (Red), 0 đại diện Đen (Black).
    """
    def __init__(self, key: int) -> None:
        self.key: int = key
        self.left: Optional['Node'] = None
        self.right: Optional['Node'] = None
        self.parent: Optional['Node'] = None
        self.color: int = 1 

class RedBlackTreeV10:
    """Core triển khai cấu trúc tự cân bằng Cây Đỏ-Đen (Red-Black Tree)."""
    
    def __init__(self) -> None:
        """Khởi tạo cây với một node giả (TNULL) màu đen."""
        self.TNULL: Node = Node(0)
        self.TNULL.color = 0
        self.TNULL.left = None
        self.TNULL.right = None
        self.root: Node = self.TNULL

    def left_rotate(self, x: Node) -> None:
        """Thực hiện xoay trái quanh node x.
        
        Args:
            x (Node): Nút đóng vai trò là tâm xoay.
        """
        y = x.right
        x.right = y.left
        if y.left != self.TNULL:
            y.left.parent = x
            
        y.parent = x.parent
        if x.parent is None:
            self.root = y
        elif x == x.parent.left:
            x.parent.left = y
        else:
            x.parent.right = y
            
        y.left = x
        x.parent = y

    def right_rotate(self, x: Node) -> None:
        """Thực hiện xoay phải quanh node x.
        
        Args:
            x (Node): Nút đóng vai trò là tâm xoay.
        """
        y = x.left
        x.left = y.right
        if y.right != self.TNULL:
            y.right.parent = x
            
        y.parent = x.parent
        if x.parent is None:
            self.root = y
        elif x == x.parent.right:
            x.parent.right = y
        else:
            x.parent.left = y
            
        y.right = x
        x.parent = y

    def insert_fixup(self, k: Node) -> None:
        """Các thao tác tô màu và xoay cây để bảo toàn 5 tính chất của RBT
        sau khi chèn Nút `k` (màu Đỏ) vào hệ thống.
        
        Args:
            k (Node): Nút vừa được chèn.
        """
        while k.parent is not None and k.parent.color == 1:
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

    def insert(self, key: int) -> None:
        """Chèn khóa nguyên (int) vào cây và tự động cân bằng theo O(log N).
        
        Args:
            key (int): Khóa cần chèn.
        """
        new_node = Node(key)
        new_node.left = self.TNULL
        new_node.right = self.TNULL
        
        y: Optional[Node] = None
        x: Node = self.root
        
        while x != self.TNULL:
            y = x
            if new_node.key < x.key:
                x = x.left
            else:
                x = x.right
                
        new_node.parent = y
        if y is None:
            self.root = new_node
        elif new_node.key < y.key:
            y.left = new_node
        else:
            y.right = new_node
            
        new_node.color = 1
        self.insert_fixup(new_node)

    def search_tree(self, k: int) -> Node:
        """Truy vấn lấy ra Nút trong cây dựa theo giá trị khóa (key).
        
        Args:
            k (int): Khóa cần tìm kiếm.
            
        Returns:
            Node: Rút ra trỏ của Nút nếu tồn tại, ngược lại trả về self.TNULL.
        """
        return self._search_tree_helper(self.root, k)

    def _search_tree_helper(self, node: Node, key: int) -> Node:
        """Đệ quy tìm kiếm tuyến dưới."""
        if node == self.TNULL or key == node.key:
            return node
        if key < node.key:
            return self._search_tree_helper(node.left, key)
        return self._search_tree_helper(node.right, key)

    def print_tree(self) -> None:
        """In cây theo định dạng cây thư mục (Console Directory Tree)."""
        print("\n\033[93m🎄 CẤU TRÚC DIRECTORY TREE (RED-BLACK TREE) 🎄\033[0m")
        if self.root == self.TNULL:
            print("(Cây rỗng)")
        else:
            self._print_helper(self.root, "", True)
        print("-----------------------------------\n")

    def _print_helper(self, curr_ptr: Node, indent: str, last: bool) -> None:
        """Đệ quy in nhánh cây theo định dạng text UI.

        Args:
            curr_ptr (Node): Nút đang in.
            indent (str): Chuỗi khoảng trắng căn thụt (Indentation).
            last (bool): Cắm cờ nếu đây là nhánh con cuối cùng.
        """
        if curr_ptr != self.TNULL:
            sys.stdout.write(indent)
            if last:
                sys.stdout.write("└── ")
                indent += "    "
            else:
                sys.stdout.write("├── ")
                indent += "│   "

            RED = '\033[91m'
            BLACK_GRAY = '\033[90m' 
            RESET = '\033[0m'
            
            if curr_ptr.color == 1:
                print(f"{RED}■ {curr_ptr.key} (ĐỎ){RESET}")
            else:
                print(f"{BLACK_GRAY}■ {curr_ptr.key} (ĐEN){RESET}")
            
            self._print_helper(curr_ptr.left, indent, False)
            self._print_helper(curr_ptr.right, indent, True)
            
    def build_from_list(self, keys: List[int]) -> None:
        """Chèn số lượng lớn giá trị từ List (Bulk Insert).
        
        Args:
            keys (List[int]): Danh sách mảng số nguyên.
        """
        for k in keys:
            self.insert(k)


def run_console_app() -> None:
    """Khởi động vòng lặp Tương tác chính (App REPL)."""
    tree = RedBlackTreeV10()
    
    while True:
        print("====== MENU RED-BLACK TREE ======")
        print("1. Thêm khóa (Insert) thủ công")
        print("2. Tìm kiếm khóa (Search)")
        print("3. In cây (Print Directory Tree)")
        print("4. Tạo cây từ mảng (Bulk Insert)")
        print("0. Thoát")
        
        choice = input("Vui lòng chọn chức năng (0-4): ").strip()
        
        if choice == '1':
            val = input("Nhập số nguyên cần thêm: ").strip()
            try:
                tree.insert(int(val))
                print(f"-> Đã thêm thành công {val}.")
            except ValueError:
                print("\033[91m Lỗi: Vui lòng nhập số nguyên hợp lệ! \033[0m")
                
        elif choice == '2':
            val = input("Nhập khoá cần tìm: ").strip()
            try:
                val_int = int(val)
                result = tree.search_tree(val_int)
                if result != tree.TNULL:
                    color_txt = '\033[91mĐỎ\033[0m' if result.color == 1 else '\033[90mĐEN\033[0m'
                    print(f"-> TÌM THẤY! Khóa {val_int} có màu {color_txt}.")
                else:
                    print(f"-> KHÔNG TÌM THẤY khóa {val_int} trong cây.")
            except ValueError:
                print("\033[91m Lỗi: Vui lòng nhập số nguyên hợp lệ! \033[0m")
                
        elif choice == '3':
            tree.print_tree()
            
        elif choice == '4':
            arr_str = input("Nhập mảng số nguyên (cách nhau dấu phẩy, vd: 5,10,15): ").strip()
            try:
                arr = [int(x.strip()) for x in arr_str.split(",") if x.strip()]
                tree.build_from_list(arr)
                print(f"-> Đã tạo cây thành công từ mảng {arr}.")
            except ValueError:
                print("\033[91m Lỗi: Có ký tự không hợp lệ trong mảng! Đảm bảo dạng số nguyên. \033[0m")
                
        elif choice == '0':
            print("Thoát chương trình. Tạm biệt!")
            break
        else:
            print("\033[91m Lỗi: Chức năng không hợp lệ. Vui lòng chọn lại! \033[0m")

if __name__ == "__main__":
    run_console_app()

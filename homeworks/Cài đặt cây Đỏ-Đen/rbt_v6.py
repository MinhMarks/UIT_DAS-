# Môn học: Cấu trúc Dữ liệu và Giải thuật Máy tính Nâng cao
# Bài tập: Cài đặt cây Đỏ-Đen
# Phiên bản 6: Nâng cấp tính năng In cây thành dạng cây thư mục (Directory Tree)
#
# Ý nghĩa: Để minh họa rõ ràng và đẹp mắt nhất trúc trúc phân cấp của RBT,
# ta chuyển từ dạng in thô (L----, R----) sang cấu trúc đồ họa ASCII dùng
# ký tự nhánh (├──, └──) tương tự lệnh `tree` trong command line.

import sys

class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.parent = None
        self.color = 1 

class RedBlackTreeV6:
    def __init__(self):
        self.TNULL = Node(0)
        self.TNULL.color = 0
        self.root = self.TNULL
        
    # --- [CÁC HÀM CỐT LÕI TỪ V TRƯỚC] ---
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

    # --- TÍNH NĂNG MỚI (V6) ---
    def print_tree(self):
        """In cây theo định dạng cây thư mục (Directory Tree) chuẩn xác"""
        print("🎄 CẤU TRÚC DIRECTORY TREE (V6) 🎄")
        self._print_helper(self.root, "", True)
        print("-----------------------------------")

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
            
            # Đệ quy cho con trái, con phải
            self._print_helper(curr_ptr.left, indent, False)
            self._print_helper(curr_ptr.right, indent, True)

# --- Thử nghiệm ---
if __name__ == "__main__":
    tree = RedBlackTreeV6()
    # Chèn các node cơ bản
    nodes = [55, 40, 65, 60, 75, 57]
    for n in nodes:
        tree.insert(n)
        
    tree.print_tree()

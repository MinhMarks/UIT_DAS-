# Môn học: Cấu trúc Dữ liệu và Giải thuật Máy tính Nâng cao
# Bài tập: Cài đặt cây Đỏ-Đen
# Phiên bản 4: Bổ sung tính năng Tìm kiếm (Search)
#
# Ý nghĩa: Sau khi đã xây dựng thành công bộ khung tự cân bằng (V3), 
# ta cần trang bị khả năng truy vấn dữ liệu cốt lõi nhất của mọi cây tìm kiếm:
# tính năng Tìm kiếm. Thuật toán này tận dụng tính chất BST: 
# đi sang trái nếu khoá nhỏ hơn, sang phải nếu lớn hơn.

class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.parent = None
        self.color = 1 # 1: Đỏ, 0: Đen

class RedBlackTreeV4:
    def __init__(self):
        self.TNULL = Node(0)
        self.TNULL.color = 0
        self.root = self.TNULL
        
    # [COPY TỪ V3] Các hàm left_rotate, right_rotate, insert_fixup, insert...
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

    # --- TÍNH NĂNG MỚI (V4) ---
    def search_tree(self, k):
        """Hàm bọc (wrapper) để gọi tìm kiếm từ gốc"""
        return self._search_tree_helper(self.root, k)

    def _search_tree_helper(self, node, key):
        """Hàm đệ quy tìm kiếm trong cây ngầm định"""
        if node == self.TNULL or key == node.key:
            return node

        if key < node.key:
            return self._search_tree_helper(node.left, key)
        return self._search_tree_helper(node.right, key)

# --- Thử nghiệm ---
if __name__ == "__main__":
    tree = RedBlackTreeV4()
    tree.insert(55)
    tree.insert(40)
    tree.insert(65)
    
    # Thử nghiệm tính năng cấp 4
    result = tree.search_tree(40)
    if result != tree.TNULL:
        print("[V4] Đã tìm thấy khóa:", result.key)
    else:
        print("[V4] Không tìm thấy khóa.")

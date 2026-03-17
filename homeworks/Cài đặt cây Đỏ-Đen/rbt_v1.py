# Môn học: Cấu trúc Dữ liệu và Giải thuật Máy tính Nâng cao
# Bài tập: Cài đặt cây Đỏ-Đen
# Phiên bản 1: Cấu trúc Node cơ bản phần Cây Nhị phân Tìm kiếm (BST)
# 
# Ý nghĩa: Trước khi xây dựng Cây Đỏ-Đen phức tạp, ta cần một nền tảng 
# vững chắc là cấu trúc của một Cây Nhị Phân Tìm Kiếm (Binary Search Tree - BST).
# Phiên bản này vạch ra cấu trúc Node cơ bản với các con trỏ left, right, parent.

class Node:
    """Đại diện cho một Nút (Node) cơ bản trong cấu trúc cây."""
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.parent = None

class RedBlackTreeV1:
    """Lớp quản lý cây, tạm thời ở phiên bản 1 chỉ triển khai thao tác chèn chuẩn BST."""
    def __init__(self):
        # Tạm thời gốc (root) được khởi tạo là None
        self.root = None
    
    def insert(self, key):
        """Thao tác chèn chuẩn của Cây nhị phân tìm kiếm (chưa có quy tắc màu Đỏ-Đen)"""
        new_node = Node(key)
        
        y = None
        x = self.root
        
        # Duyệt tìm vị trí thích hợp để chèn (nhỏ sang trái, lớn sang phải)
        while x is not None:
            y = x
            if new_node.key < x.key:
                x = x.left
            else:
                x = x.right
                
        # Liên kết parent cho node mới
        new_node.parent = y
        
        # Chèn node mới vào cây
        if y is None:
            self.root = new_node  # Cây rỗng, node mới làm gốc
        elif new_node.key < y.key:
            y.left = new_node
        else:
            y.right = new_node

# --- Thử nghiệm ---
if __name__ == "__main__":
    tree = RedBlackTreeV1()
    tree.insert(10)
    tree.insert(20)
    tree.insert(5)
    print("[V1] Đã khởi tạo thành công khung BST cơ bản.")

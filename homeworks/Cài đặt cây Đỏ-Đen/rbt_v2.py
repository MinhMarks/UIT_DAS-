# Môn học: Cấu trúc Dữ liệu và Giải thuật Máy tính Nâng cao
# Bài tập: Cài đặt cây Đỏ-Đen
# Phiên bản 2: Bổ sung Màu sắc và Phép xoay (Rotations)
#
# Ý nghĩa: Cây Đỏ-Đen khác BST thông thường ở chỗ mỗi Node có thêm một trạng thái Màu (Đỏ hoặc Đen).
# Đồng thời, để duy trì tính cân bằng, ta cần định nghĩa các phép Xoay Trái (Left Rotate)
# và Xoay Phải (Right Rotate) làm công cụ tái cấu trúc nhánh cây mà không làm hỏng tính chất BST.

class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.parent = None
        # Quy ước: 1 đại diện cho màu Đỏ (Red), 0 đại diện cho màu Đen (Black)
        # Bất kì node nào mới tạo ra cũng mang màu Đỏ theo quy tắc.
        self.color = 1 

class RedBlackTreeV2:
    def __init__(self):
        # Đặc thù Cây Đỏ-Đen: TNULL (lá ảo) luôn mang màu đen để chặn các đường đi xuống lá.
        self.TNULL = Node(0)
        self.TNULL.color = 0
        self.TNULL.left = None
        self.TNULL.right = None
        
        # Khởi tạo cây rỗng thì gốc trỏ vào TNULL
        self.root = self.TNULL
    
    def left_rotate(self, x):
        """
        Phép xoay trái quanh node x. Mục đích để cân bằng lại độ cao cây.
        Kéo node con phải của x (y) lên thay thế x, đẩy x xuống làm con trái của y.
        """
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
        """
        Phép xoay phải quanh node x. 
        Kéo node con trái của x (y) lên thay thế x, đẩy x xuống làm con phải của y.
        """
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

# --- Thử nghiệm ---
if __name__ == "__main__":
    tree = RedBlackTreeV2()
    print("[V2] Đã định nghĩa được cấu trúc lá ảo TNULL, thuộc tính color và các phép xoay Rotations.")

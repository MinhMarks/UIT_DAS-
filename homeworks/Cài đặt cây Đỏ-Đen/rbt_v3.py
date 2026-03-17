# Môn học: Cấu trúc Dữ liệu và Giải thuật Máy tính Nâng cao
# Bài tập: Cài đặt cây Đỏ-Đen
# Phiên bản 3: Tích hợp thuật toán Sửa lỗi sau khi thêm (Insert Fixup)
#
# Ý nghĩa: Đây là trái tim của cấu trúc Cây Đỏ-Đen. Khi chèn một Nút màu đỏ mới 
# (giống như thao tác insert của V1), ta có thể vi phạm quy tắc khắt khe: 
# "Không thể có 2 Nút Đỏ nằm liên tiếp nhau (cha đỏ - con đỏ)".
# Tính năng `insert_fixup` sẽ tự động dùng phép Đổi Màu (Recolor) và Xoay (Rotate từ V2)
# để khôi phục lại 5 tính chất chuẩn mực thiêng liêng cốt lõi của Cây Đỏ-Đen.

class Node:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.parent = None
        self.color = 1 # 1: Đỏ, 0: Đen

class RedBlackTreeV3:
    def __init__(self):
        self.TNULL = Node(0)
        self.TNULL.color = 0
        self.root = self.TNULL

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
        """Khắc phục các vi phạm cây đỏ đen xảy ra sau khi chèn một node đỏ"""
        while k.parent != None and k.parent.color == 1:
            if k.parent == k.parent.parent.right:
                u = k.parent.parent.left # Chú (uncle) của k
                
                if u.color == 1:
                    # Trường hợp 1: Chú màu đỏ -> Đổi màu cha và chú thành Đen, ông nội thành Đỏ
                    u.color = 0
                    k.parent.color = 0
                    k.parent.parent.color = 1
                    k = k.parent.parent
                else:
                    if k == k.parent.left:
                        # Trường hợp 2: Chú màu đen, k là con trái -> Xoay phải cha
                        k = k.parent
                        self.right_rotate(k)
                    # Trường hợp 3: Chú màu đen, k là con phải -> Xoay trái ông nội
                    k.parent.color = 0
                    k.parent.parent.color = 1
                    self.left_rotate(k.parent.parent)
            else:
                # Đối xứng với khối kiểm tra phía trên (khi cha của k là con trái của ông nội)
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
                
        # Bắt buộc: Gốc bao giờ cũng phải là màu Đen
        self.root.color = 0

    def insert(self, key):
        """Chèn khóa mới và gọi hàm cân bằng"""
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
            
        # Nút mới bao giờ cũng là đỏ
        new_node.color = 1
        
        # Sửa cấu trúc cây nếu vi phạm
        self.insert_fixup(new_node)

# --- Thử nghiệm ---
if __name__ == "__main__":
    tree = RedBlackTreeV3()
    # Chèn dữ liệu sẽ tự động cân bằng
    tree.insert(55)
    tree.insert(40)
    tree.insert(65)
    print("[V3] Đã cài đặt hoàn chỉnh thao tác Thêm (Insert) của Cây Đỏ-Đen.")

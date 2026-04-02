/**
 * btree.js — B-Tree Core Engine (Reactive Split)
 * Môn: DSA++ | UIT
 *
 * Thuật toán: REACTIVE approach
 * - Chèn vào leaf trước, sau đó fix overflow từ dưới lên trên.
 * - Split xảy ra khi node có M keys (tràn), không phải M-1 keys.
 * - midIdx = Math.floor(m/2) trên node có m keys → Left và Right đều ≥ 1 key.
 *
 * Ví dụ m=3: node tràn có [K0,K1,K2] → midIdx=1 → Left=[K0], Up=K1, Right=[K2] ✓
 */

"use strict";

// ─── Node ────────────────────────────────────────────────────────────────────

class BTreeNode {
  constructor(isLeaf = true) {
    this.keys = [];
    this.children = [];
    this.isLeaf = isLeaf;
    this.id = BTreeNode._counter++;
  }

  clone() {
    const n = new BTreeNode(this.isLeaf);
    n.id = this.id;
    n.keys = [...this.keys];
    n.children = this.children.map(c => c.clone());
    return n;
  }
}
BTreeNode._counter = 0;

// ─── BTree ───────────────────────────────────────────────────────────────────

class BTree {
  constructor(m = 3) {
    this.m = m;
    this.root = new BTreeNode(true);
    this.studentMap = new Map();
    this._frames = [];
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  insert(mssv, data) {
    this._frames = [];

    if (this.studentMap.has(mssv)) {
      this._addFrame('error', [mssv], `❌ MSSV ${mssv} đã tồn tại trong hệ thống.`);
      return [...this._frames];
    }

    this.studentMap.set(mssv, { mssv, ...data });
    this._addFrame('start', [], `📥 Bắt đầu chèn MSSV: ${mssv} vào B-Tree (bậc m=${this.m})`);

    // Đệ quy chèn, trả về {midKey, rightNode} nếu root bị overflow
    const overflow = this._insertRec(this.root, mssv, 0);

    if (overflow) {
      // Root bị tràn → tạo root mới
      const newRoot = new BTreeNode(false);
      newRoot.keys = [overflow.midKey];
      newRoot.children = [this.root, overflow.rightNode];
      this.root = newRoot;
      this._addFrame('split', [overflow.midKey],
        `✂️ Root bị tách! "${overflow.midKey}" trở thành root mới. Cây tăng một tầng.`);
    }

    this._addFrame('done', [mssv], `✅ Đã chèn MSSV ${mssv} thành công!`);
    return [...this._frames];
  }

  search(mssv) {
    this._frames = [];
    this._addFrame('start', [], `🔍 Bắt đầu tìm kiếm MSSV: ${mssv}`);
    const result = this._searchNode(this.root, mssv, 0);
    if (!result.found) {
      this._addFrame('not-found', [mssv], `❌ Không tìm thấy MSSV ${mssv} trong B-Tree.`);
    }
    return [...this._frames];
  }

  searchByName(name) {
    this._frames = [];
    this._addFrame('start', [], `🔍 Tìm theo tên: "${name}" — Không có index → phải duyệt toàn bộ cây...`);
    const found = [];
    this._scanAll(this.root, name.toLowerCase(), found);
    if (found.length === 0) {
      this._addFrame('not-found', [], `❌ Không tìm thấy sinh viên tên "${name}".`);
    } else {
      this._addFrame('found', found.map(s => s.mssv),
        `✅ Tìm thấy ${found.length} sinh viên tên "${name}": ${found.map(s => s.mssv).join(', ')}`);
    }
    return [...this._frames];
  }

  delete(mssv) {
    this._frames = [];
    if (!this.studentMap.has(mssv)) {
      this._addFrame('error', [mssv], `❌ MSSV ${mssv} không tồn tại trong hệ thống.`);
      return [...this._frames];
    }

    this._addFrame('start', [], `🗑️ Bắt đầu xóa MSSV: ${mssv} khỏi B-Tree`);
    this._delete(this.root, mssv);
    this.studentMap.delete(mssv);

    if (this.root.keys.length === 0 && !this.root.isLeaf) {
      this.root = this.root.children[0];
      this._addFrame('shrink', [], '⬆️ Root rỗng → cây co lại, con trở thành root mới.');
    }

    this._addFrame('done', [], `✅ Đã xóa MSSV ${mssv} thành công!`);
    return [...this._frames];
  }

  getAllStudents() { return [...this.studentMap.values()]; }
  getTreeSnapshot() { return this.root.clone(); }

  // ── Private: Insert (Reactive) ─────────────────────────────────────────────

  /**
   * Đệ quy chèn mssv vào cây gốc tại `node`.
   * Trả về null (không tràn) hoặc { midKey, rightNode } (node bị tràn, push lên cha).
   */
  _insertRec(node, mssv, level) {
    if (node.isLeaf) {
      // Chèn vào đúng vị trí trong leaf (giữ thứ tự)
      const pos = node.keys.findIndex(k => k > mssv);
      if (pos === -1) node.keys.push(mssv);
      else node.keys.splice(pos, 0, mssv);

      this._addFrame('insert-leaf', [mssv],
        `📍 Chèn ${mssv} vào node lá (level ${level}).`);

      if (node.keys.length >= this.m) {
        // Tràn! Node có m keys → split
        this._addFrame('overflow', [...node.keys],
          `⚠️ Node lá tràn (${node.keys.length} keys ≥ m=${this.m}). Thực hiện Split!`);
        return this._doSplit(node);
      }
      return null;
    }

    // Node nội: tìm child phù hợp
    let ci = node.keys.findIndex(k => mssv < k);
    if (ci === -1) ci = node.keys.length;

    this._addFrame('traverse',
      [...node.keys],  // toàn bộ keys của node đang xét → visualizer tô màu border node
      `➡️ Level ${level}: ${mssv} → đi vào nhánh P${ci}.`);

    const overflow = this._insertRec(node.children[ci], mssv, level + 1);

    if (overflow) {
      // Con bị tràn → chèn midKey vào node hiện tại
      node.keys.splice(ci, 0, overflow.midKey);
      node.children.splice(ci + 1, 0, overflow.rightNode);

      this._addFrame('split', [overflow.midKey],
        `✂️ Tách: "${overflow.midKey}" được đẩy lên node cha (level ${level}).`);

      if (node.keys.length >= this.m) {
        // Node nội cũng tràn → tiếp tục split lên trên
        this._addFrame('overflow', [...node.keys],
          `⚠️ Node nội tràn (${node.keys.length} keys). Tiếp tục Split lên trên!`);
        return this._doSplit(node);
      }
    }
    return null;
  }

  /**
   * Tách một node ĐANG TRÀN (có m keys) thành hai.
   * midIdx = Math.floor(m/2)
   *   m=3: [K0,K1,K2] → Left=[K0], Up=K1, Right=[K2]  ✓
   *   m=4: [K0..K3]   → Left=[K0], Up=K1, Right=[K2,K3] ✓
   *   m=5: [K0..K4]   → Left=[K0,K1], Up=K2, Right=[K3,K4] ✓
   * Trả về { midKey, rightNode }; node gốc TRỞ THÀNH left child (đã sửa in-place).
   */
  _doSplit(node) {
    const midIdx = Math.floor(node.keys.length / 2);
    const midKey = node.keys[midIdx];

    const rightNode = new BTreeNode(node.isLeaf);
    rightNode.keys = node.keys.splice(midIdx + 1);  // keys sau midKey
    node.keys.splice(midIdx, 1);                     // xóa midKey khỏi node (left)
    // node.keys bây giờ = keys trước midKey

    if (!node.isLeaf) {
      rightNode.children = node.children.splice(midIdx + 1);
    }

    return { midKey, rightNode };
  }

  // ── Private: Search ────────────────────────────────────────────────────────

  _searchNode(node, mssv, level) {
    let lo = 0, hi = node.keys.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      this._addFrame('compare', [node.keys[mid]],
        `🔎 Level ${level}: So sánh ${mssv} với ${node.keys[mid]}...`);
      if (mssv === node.keys[mid]) {
        const student = this.studentMap.get(mssv);
        this._addFrame('found', [mssv],
          `✅ Tìm thấy! MSSV ${mssv} → ${student.hoTen}`);
        return { found: true, student };
      } else if (mssv < node.keys[mid]) {
        hi = mid - 1;
      } else {
        lo = mid + 1;
      }
    }
    const ci = lo;
    if (node.isLeaf) return { found: false };

    this._addFrame('traverse', [...node.keys],
      `➡️ ${mssv} nằm ở nhánh P${ci}, đi sâu xuống level ${level + 1}.`);
    return this._searchNode(node.children[ci], mssv, level + 1);
  }

  _scanAll(node, nameLower, found) {
    for (let i = 0; i < node.keys.length; i++) {
      const s = this.studentMap.get(node.keys[i]);
      this._addFrame('scan', [node.keys[i]],
        `👁️ Đang xét MSSV ${node.keys[i]} — ${s ? s.hoTen : '?'}...`);
      if (s && s.hoTen.toLowerCase().includes(nameLower)) {
        found.push(s);
        this._addFrame('found', [node.keys[i]], `✅ Khớp! ${s.hoTen} (${node.keys[i]})`);
      }
      if (!node.isLeaf) this._scanAll(node.children[i], nameLower, found);
    }
    if (!node.isLeaf) this._scanAll(node.children[node.keys.length], nameLower, found);
  }

  // ── Private: Delete ────────────────────────────────────────────────────────

  _minKeys() { return Math.ceil(this.m / 2) - 1; }

  _delete(node, mssv) {
    const t = this._minKeys();
    const i = node.keys.findIndex(k => k === mssv);

    if (i !== -1) {
      if (node.isLeaf) {
        node.keys.splice(i, 1);
        this._addFrame('delete-leaf', [mssv], `🗑️ Xóa ${mssv} khỏi node lá.`);
        return;
      }

      const leftChild  = node.children[i];
      const rightChild = node.children[i + 1];

      if (leftChild.keys.length >= t + 1) {
        const pred = this._getPredecessor(leftChild);
        this._addFrame('borrow-left', [pred, mssv],
          `🔄 Lấy predecessor "${pred}" thay thế cho "${mssv}".`);
        node.keys[i] = pred;
        this._delete(leftChild, pred);
        return;
      }

      if (rightChild.keys.length >= t + 1) {
        const succ = this._getSuccessor(rightChild);
        this._addFrame('borrow-right', [succ, mssv],
          `🔄 Lấy successor "${succ}" thay thế cho "${mssv}".`);
        node.keys[i] = succ;
        this._delete(rightChild, succ);
        return;
      }

      this._addFrame('merge-trigger', [mssv],
        `🔀 Cả hai node con đều có ${t} keys. Merge trước khi xóa.`);
      this._merge(node, i);
      this._delete(node.children[i], mssv);

    } else {
      if (node.isLeaf) return;

      let ci = node.keys.findIndex(k => mssv < k);
      if (ci === -1) ci = node.keys.length;

      this._addFrame('traverse', [...node.keys],
        `➡️ ${mssv} không ở node này, đi xuống nhánh P${ci}.`);

      if (node.children[ci].keys.length === t) {
        this._fixChild(node, ci);
        ci = node.keys.findIndex(k => mssv < k);
        if (ci === -1) ci = node.keys.length;
      }
      this._delete(node.children[ci], mssv);
    }
  }

  _getPredecessor(node) {
    while (!node.isLeaf) node = node.children[node.children.length - 1];
    return node.keys[node.keys.length - 1];
  }

  _getSuccessor(node) {
    while (!node.isLeaf) node = node.children[0];
    return node.keys[0];
  }

  _merge(parent, i) {
    const left = parent.children[i];
    const right = parent.children[i + 1];
    const midKey = parent.keys[i];

    this._addFrame('merge', [midKey, ...left.keys, ...right.keys],
      `🔀 Merge: "${midKey}" rơi xuống. [${left.keys}] + "${midKey}" + [${right.keys}] → một node.`);

    left.keys.push(midKey, ...right.keys);
    if (!left.isLeaf) left.children.push(...right.children);
    parent.keys.splice(i, 1);
    parent.children.splice(i + 1, 1);
  }

  _fixChild(parent, i) {
    const t = this._minKeys();
    const left  = i > 0                            ? parent.children[i - 1] : null;
    const right = i < parent.children.length - 1  ? parent.children[i + 1] : null;

    if (left && left.keys.length >= t + 1) {
      const child = parent.children[i];
      child.keys.unshift(parent.keys[i - 1]);
      parent.keys[i - 1] = left.keys.pop();
      if (!left.isLeaf) child.children.unshift(left.children.pop());
      this._addFrame('borrow-sibling', [parent.keys[i - 1]],
        `🔄 Mượn từ anh trái: "${parent.keys[i - 1]}" xoay qua cha → node hiện tại.`);
      return;
    }

    if (right && right.keys.length >= t + 1) {
      const child = parent.children[i];
      child.keys.push(parent.keys[i]);
      parent.keys[i] = right.keys.shift();
      if (!right.isLeaf) child.children.push(right.children.shift());
      this._addFrame('borrow-sibling', [parent.keys[i]],
        `🔄 Mượn từ anh phải: "${parent.keys[i]}" xoay qua cha → node hiện tại.`);
      return;
    }

    if (left) this._merge(parent, i - 1);
    else       this._merge(parent, i);
  }

  // ── Frame helper ───────────────────────────────────────────────────────────

  _addFrame(type, highlightKeys, message) {
    this._frames.push({
      type,
      treeSnapshot: this.root.clone(),
      highlightKeys: [...highlightKeys],
      message,
      timestamp: Date.now(),
    });
  }
}

window.BTree = BTree;
window.BTreeNode = BTreeNode;

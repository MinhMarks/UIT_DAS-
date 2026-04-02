/**
 * app.js — Main Application Controller
 * Môn: DSA++ | UIT
 */

"use strict";

// ─── State ────────────────────────────────────────────────────────────────────

let tree = null;  // Sẽ được khởi tạo trong DOMContentLoaded sau khi đọc dropdown
let viz = null;
let currentFrames = [];
let currentFrameIdx = 0;
let autoPlayInterval = null;

// Sample data để demo
const SAMPLE_STUDENTS = [
  { mssv: '22521000', hoTen: 'Nguyễn Văn An', gioiTinh: 'Nam', ngaySinh: '2004-01-15', gpa: '3.5', lop: 'SE110' },
  { mssv: '22521234', hoTen: 'Trần Thị Bình', gioiTinh: 'Nữ', ngaySinh: '2004-03-20', gpa: '3.8', lop: 'SE110' },
  { mssv: '22520500', hoTen: 'Lê Minh Cường', gioiTinh: 'Nam', ngaySinh: '2004-07-01', gpa: '3.2', lop: 'CS110' },
  { mssv: '22521500', hoTen: 'Phạm Thu Dung', gioiTinh: 'Nữ', ngaySinh: '2004-05-12', gpa: '3.9', lop: 'IS110' },
  { mssv: '22520750', hoTen: 'Hoàng Văn Em', gioiTinh: 'Nam', ngaySinh: '2004-09-08', gpa: '3.1', lop: 'CS110' },
  { mssv: '22521750', hoTen: 'Vũ Thị Fang', gioiTinh: 'Nữ', ngaySinh: '2004-11-25', gpa: '3.7', lop: 'SE110' },
  { mssv: '22520250', hoTen: 'Đặng Quốc Gia', gioiTinh: 'Nam', ngaySinh: '2004-02-14', gpa: '2.9', lop: 'IS110' },
];

// ─── Init ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Khởi tạo cây VỚI giá trị m từ dropdown hiện tại
  // (Browser có thể restore giá trị cũ từ session trước)
  const initialM = parseInt(document.getElementById('order-select').value) || 3;
  tree = new BTree(initialM);

  viz = new BTreeVisualizer('tree-canvas');

  // Set up key click handler
  window.onKeyClick = (key) => {
    showStudentPopup(key);
  };

  // Gắn event handlers
  setupEventHandlers();

  // Load sample data
  loadSampleData();

  // Render initial state
  renderTree([]);
  refreshTable();

  log(`🎉 Ứng dụng B-Tree Simulator đã sẵn sàng! Cây bậc m=${tree.m}`, 'info');
  log('👆 Click vào bất kỳ khóa nào trên cây để xem thông tin sinh viên.', 'info');
});

// ─── Event Handlers ───────────────────────────────────────────────────────────

function setupEventHandlers() {
  // Order selector
  document.getElementById('order-select').addEventListener('change', (e) => {
    const newM = parseInt(e.target.value);
    if (confirm(`Thay đổi bậc cây thành m=${newM}?\nLưu ý: Cây sẽ được xây dựng lại từ đầu với toàn bộ dữ liệu hiện tại.`)) {
      rebuildTree(newM);
    } else {
      e.target.value = tree.m;
    }
  });

  // Add student — chỉ dùng form submit để tránh double-fire (click + submit)
  document.getElementById('form-add').addEventListener('submit', (e) => {
    e.preventDefault();
    handleAdd();
  });

  // Delete student
  document.getElementById('btn-delete').addEventListener('click', () => {
    const mssv = document.getElementById('input-delete').value.trim();
    if (!mssv) { showToast('Vui lòng nhập MSSV cần xóa.', 'warn'); return; }
    handleDelete(mssv);
  });
  document.getElementById('input-delete').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-delete').click();
  });

  // Search by MSSV
  document.getElementById('btn-search-id').addEventListener('click', () => {
    const mssv = document.getElementById('input-search-id').value.trim();
    if (!mssv) { showToast('Vui lòng nhập MSSV cần tìm.', 'warn'); return; }
    handleSearchById(mssv);
  });
  document.getElementById('input-search-id').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-search-id').click();
  });

  // Search by name
  document.getElementById('btn-search-name').addEventListener('click', () => {
    const name = document.getElementById('input-search-name').value.trim();
    if (!name) { showToast('Vui lòng nhập tên cần tìm.', 'warn'); return; }
    handleSearchByName(name);
  });
  document.getElementById('input-search-name').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-search-name').click();
  });

  // Step controls
  document.getElementById('btn-prev').addEventListener('click', stepPrev);
  document.getElementById('btn-next').addEventListener('click', stepNext);
  document.getElementById('btn-play').addEventListener('click', togglePlay);
  document.getElementById('btn-reset-view').addEventListener('click', () => {
    if (currentFrames.length > 0) {
      currentFrameIdx = currentFrames.length - 1;
      renderFrame(currentFrames[currentFrameIdx]);
      updateStepUI();
    } else {
      renderTree([]);
    }
    log('🔄 Đã nhảy đến trạng thái cuối.', 'info');
  });

  // Load sample
  document.getElementById('btn-sample').addEventListener('click', () => {
    if (confirm('Tải dữ liệu mẫu? Cây hiện tại sẽ bị xóa.')) {
      tree = new BTree(parseInt(document.getElementById('order-select').value) || 3);
      loadSampleData();
      renderTree([]);
      refreshTable();
      clearLog();
      log('📦 Đã tải dữ liệu mẫu thành công!', 'success');
    }
  });

  // Clear all
  document.getElementById('btn-clear').addEventListener('click', () => {
    if (confirm('Xóa toàn bộ dữ liệu?')) {
      tree = new BTree(parseInt(document.getElementById('order-select').value) || 3);
      renderTree([]);
      refreshTable();
      clearLog();
      currentFrames = [];
      updateStepUI();
      log('🧹 Đã xóa toàn bộ dữ liệu.', 'warn');
    }
  });

  // Close popup
  document.getElementById('popup-close').addEventListener('click', () => {
    document.getElementById('student-popup').classList.add('hidden');
  });
  document.getElementById('student-popup').addEventListener('click', (e) => {
    if (e.target === document.getElementById('student-popup')) {
      document.getElementById('student-popup').classList.add('hidden');
    }
  });

  // Speed slider
  document.getElementById('speed-slider').addEventListener('input', (e) => {
    document.getElementById('speed-label').textContent = e.target.value + 'ms';
  });
}

// ─── Core Handlers ────────────────────────────────────────────────────────────

function handleAdd() {
  const mssv = document.getElementById('input-mssv').value.trim();
  const hoTen = document.getElementById('input-hoten').value.trim();
  const gioiTinh = document.getElementById('input-gioitinh').value;
  const ngaySinh = document.getElementById('input-ngaysinh').value;
  const gpa = document.getElementById('input-gpa').value.trim();
  const lop = document.getElementById('input-lop').value.trim();

  if (!mssv || !hoTen) {
    showToast('MSSV và Họ tên là bắt buộc!', 'error');
    return;
  }
  if (!/^\d{8}$/.test(mssv)) {
    showToast('MSSV phải có đúng 8 chữ số!', 'error');
    return;
  }

  const frames = tree.insert(mssv, { hoTen, gioiTinh, ngaySinh, gpa, lop });
  log(`➕ Thực hiện thêm sinh viên: ${mssv} - ${hoTen}`, 'action');

  // Clear form TRƯỚC khi startAnimation để tránh race nếu user bấm nhanh
  document.getElementById('input-mssv').value = '';
  document.getElementById('input-hoten').value = '';

  startAnimation(frames);  // refreshTable() được gọi bên trong startAnimation
}

function handleDelete(mssv) {
  const frames = tree.delete(mssv);
  log(`➖ Thực hiện xóa sinh viên: ${mssv}`, 'action');
  startAnimation(frames);  // refreshTable() được gọi bên trong startAnimation
}

function handleSearchById(mssv) {
  const frames = tree.search(mssv);
  startAnimation(frames);
  log(`🔍 Tìm kiếm theo MSSV: ${mssv}`, 'action');
}

function handleSearchByName(name) {
  const frames = tree.searchByName(name);
  startAnimation(frames);
  log(`🔍 Tìm kiếm theo tên: "${name}" (Full-scan — không có index theo tên)`, 'action');
}

// ─── Animation Control ────────────────────────────────────────────────────────

function startAnimation(frames) {
  stopPlay();
  currentFrames = frames;
  currentFrameIdx = 0;
  updateStepUI();

  // Luôn refresh bảng ngay tại đây — studentMap đã được cập nhật đồng bộ
  // trước khi startAnimation được gọi (trong tree.insert / tree.delete)
  refreshTable();

  if (frames.length > 0) {
    renderFrame(frames[0]);
  }
}

function renderFrame(frame) {
  if (!frame) return;

  viz.renderAnimated(frame.treeSnapshot, frame.highlightKeys, frame.type, 500);
  logFrame(frame);
  updateFrameCounter();
}

function stepNext() {
  if (currentFrameIdx < currentFrames.length - 1) {
    currentFrameIdx++;
    renderFrame(currentFrames[currentFrameIdx]);
    updateStepUI();
  }
}

function stepPrev() {
  if (currentFrameIdx > 0) {
    currentFrameIdx--;
    renderFrame(currentFrames[currentFrameIdx]);
    updateStepUI();
  }
}

function togglePlay() {
  if (autoPlayInterval) {
    stopPlay();
  } else {
    startPlay();
  }
}

function startPlay() {
  const speed = parseInt(document.getElementById('speed-slider').value) || 800;
  const btn = document.getElementById('btn-play');
  btn.innerHTML = '<span class="icon">⏸</span> Dừng';
  btn.classList.add('playing');

  autoPlayInterval = setInterval(() => {
    if (currentFrameIdx < currentFrames.length - 1) {
      stepNext();
    } else {
      stopPlay();
    }
  }, speed);
}

function stopPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
    const btn = document.getElementById('btn-play');
    btn.innerHTML = '<span class="icon">▶</span> Tự động';
    btn.classList.remove('playing');
  }
}

function updateStepUI() {
  const hasPrev = currentFrameIdx > 0;
  const hasNext = currentFrameIdx < currentFrames.length - 1;
  document.getElementById('btn-prev').disabled = !hasPrev;
  document.getElementById('btn-next').disabled = !hasNext;
  document.getElementById('btn-play').disabled = currentFrames.length === 0;

  updateFrameCounter();
}

function updateFrameCounter() {
  const el = document.getElementById('frame-counter');
  if (currentFrames.length > 0) {
    el.textContent = `Bước ${currentFrameIdx + 1} / ${currentFrames.length}`;
  } else {
    el.textContent = 'Không có bước nào';
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────

function renderTree(highlightKeys) {
  if (viz) {
    viz.render(tree.root, highlightKeys, 'default');
  }
}

function refreshTable() {
  const students = tree.getAllStudents();
  const tbody = document.getElementById('student-tbody');
  tbody.innerHTML = '';

  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-row">Chưa có dữ liệu</td></tr>';
    return;
  }

  students.sort((a, b) => a.mssv.localeCompare(b.mssv));
  for (const s of students) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="td-mssv" onclick="showStudentPopup('${s.mssv}')" title="Click để xem chi tiết">${s.mssv}</td>
      <td>${s.hoTen}</td>
      <td>${s.gioiTinh || '—'}</td>
      <td>${s.ngaySinh || '—'}</td>
      <td class="td-gpa ${parseFloat(s.gpa) >= 3.5 ? 'gpa-high' : parseFloat(s.gpa) >= 3.0 ? 'gpa-mid' : 'gpa-low'}">${s.gpa || '—'}</td>
      <td>${s.lop || '—'}</td>
    `;
    tr.addEventListener('click', () => showStudentPopup(s.mssv));
    tbody.appendChild(tr);
  }

  document.getElementById('table-count').textContent = students.length + ' sinh viên';
}

// ─── Student Popup ────────────────────────────────────────────────────────────

function showStudentPopup(mssv) {
  const students = tree.getAllStudents();
  const s = students.find(x => x.mssv === mssv);
  if (!s) {
    showToast(`Không tìm thấy MSSV: ${mssv}`, 'error');
    return;
  }

  document.getElementById('popup-mssv').textContent = s.mssv;
  document.getElementById('popup-hoten').textContent = s.hoTen;
  document.getElementById('popup-gioitinh').textContent = s.gioiTinh || '—';
  document.getElementById('popup-ngaysinh').textContent = s.ngaySinh || '—';
  document.getElementById('popup-gpa').textContent = s.gpa || '—';
  document.getElementById('popup-lop').textContent = s.lop || '—';

  // GPA badge
  const gpa = parseFloat(s.gpa);
  const badge = document.getElementById('popup-gpa-badge');
  if (gpa >= 3.6) { badge.textContent = 'Xuất sắc'; badge.className = 'gpa-badge excellent'; }
  else if (gpa >= 3.2) { badge.textContent = 'Giỏi'; badge.className = 'gpa-badge good'; }
  else if (gpa >= 2.5) { badge.textContent = 'Khá'; badge.className = 'gpa-badge fair'; }
  else { badge.textContent = 'Trung bình'; badge.className = 'gpa-badge average'; }

  document.getElementById('student-popup').classList.remove('hidden');
}

// ─── Logging ──────────────────────────────────────────────────────────────────

function log(message, type = 'info') {
  const console = document.getElementById('log-console');
  const entry = document.createElement('div');
  entry.className = `log-entry log-${type}`;
  const time = new Date().toLocaleTimeString('vi-VN');
  entry.innerHTML = `<span class="log-time">[${time}]</span> ${message}`;
  console.appendChild(entry);
  console.scrollTop = console.scrollHeight;
}

function logFrame(frame) {
  if (!frame) return;
  const typeMap = {
    'start': 'info', 'done': 'success', 'error': 'error', 'found': 'success',
    'not-found': 'error', 'split': 'highlight', 'merge': 'highlight',
    'overflow': 'warn', 'traverse': 'info', 'compare': 'info',
    'insert-leaf': 'success', 'delete-leaf': 'warn', 'scan': 'info',
    'borrow-sibling': 'highlight', 'borrow-left': 'highlight', 'borrow-right': 'highlight',
    'merge-trigger': 'warn', 'shrink': 'warn',
  };
  log(frame.message, typeMap[frame.type] || 'info');
}

function clearLog() {
  document.getElementById('log-console').innerHTML = '';
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function loadSampleData() {
  for (const s of SAMPLE_STUDENTS) {
    tree.insert(s.mssv, { hoTen: s.hoTen, gioiTinh: s.gioiTinh, ngaySinh: s.ngaySinh, gpa: s.gpa, lop: s.lop });
  }
}

function rebuildTree(newM) {
  const allStudents = tree.getAllStudents();
  tree = new BTree(newM);
  for (const s of allStudents) {
    tree.insert(s.mssv, { hoTen: s.hoTen, gioiTinh: s.gioiTinh, ngaySinh: s.ngaySinh, gpa: s.gpa, lop: s.lop });
  }
  renderTree([]);
  refreshTable();
  currentFrames = [];
  updateStepUI();
  log(`🔧 Đã xây dựng lại cây với bậc m=${newM}. Tổng ${allStudents.length} sinh viên.`, 'info');
}

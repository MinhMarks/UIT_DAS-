// --- DOM Elements ---
const elNumElements = document.getElementById('numElements');
const elChunkSize = document.getElementById('chunkSize');
const elAnimSpeed = document.getElementById('animSpeed');
const fileInput = document.getElementById('fileInput');

const btnGenerate = document.getElementById('btnGenerate');
const btnSort = document.getElementById('btnSort');
const btnReset = document.getElementById('btnReset');
const statusText = document.getElementById('statusText');

const inputContainer = document.getElementById('inputContainer');
const ramContainer = document.getElementById('ramContainer');
const tempFilesContainer = document.getElementById('tempFilesContainer');
const outputContainer = document.getElementById('outputContainer');
const ramBadge = document.getElementById('ramBage');
const outputBadge = document.getElementById('outputBadge');

// --- State ---
let rawData = [];
let chunkCount = 0;
let tempArrays = [];
let isSorting = false;

// --- Helper Functions ---
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getDelay() {
    return parseInt(elAnimSpeed.value) || 500;
}

function updateStatus(text) {
    statusText.innerText = text;
}

function createBlock(value, customClass = '') {
    const div = document.createElement('div');
    div.className = `number-block ${customClass}`;
    div.innerText = value;
    return div;
}

// Generate Random Data
btnGenerate.addEventListener('click', () => {
    if (isSorting) return;

    const count = parseInt(elNumElements.value);
    if (count < 5 || count > 200) {
        alert("Vui lòng nhập số từ 5 đến 200");
        return;
    }

    const float64Array = new Float64Array(count);
    for (let i = 0; i < count; i++) {
        // Gen random double-like number with 1 decimal
        float64Array[i] = parseFloat((Math.random() * 200 - 100).toFixed(1));
    }

    // Create File Blob & Download
    const blob = new Blob([float64Array.buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sample_N${count}.bin`;
    a.click();
    URL.revokeObjectURL(url);

    updateStatus(`Đã tạo và tải xuống tệp sample_N${count}.bin. Hãy TẢI LÊN tệp này ở mục (1) để bắt đầu.`);
});

// Upload Binary File 
fileInput.addEventListener('change', (e) => {
    if (isSorting) return;
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
        const arrayBuffer = evt.target.result;
        if (arrayBuffer.byteLength % 8 !== 0) {
            alert('File không hợp lệ. Kích thước file nhị phân (double) phải chia hết cho 8 bytes.');
            fileInput.value = "";
            return;
        }

        const floatArray = new Float64Array(arrayBuffer);

        inputContainer.innerHTML = '';
        ramContainer.innerHTML = '';
        tempFilesContainer.innerHTML = '';
        outputContainer.innerHTML = '';
        rawData = [];

        // Max visual limit
        const displayLimit = Math.min(floatArray.length, 300);

        for (let i = 0; i < displayLimit; i++) {
            let val = floatArray[i];
            rawData.push(val);
            inputContainer.appendChild(createBlock(val.toFixed(1)));
        }

        if (floatArray.length > 300) {
            alert("File quá lớn. Ứng dụng web hiển thị minh họa giới hạn ở 300 phần tử đầu tiên.");
        }

        tempArrays = [];
        ramBadge.innerText = `0 / ${elChunkSize.value}`;
        outputBadge.innerText = `Hoàn thành: 0`;
        updateStatus(`Đã tải lên tệp: ${file.name} (${rawData.length} số thực). Sẵn sàng bắt đầu!`);
        btnSort.disabled = false;
    };
    reader.readAsArrayBuffer(file);
});

btnReset.addEventListener('click', () => {
    if (isSorting) {
        alert("Đang phân tích, làm mới trang nếu muốn ép buộc thoát.");
        return;
    }
    inputContainer.innerHTML = '';
    ramContainer.innerHTML = '';
    tempFilesContainer.innerHTML = '';
    outputContainer.innerHTML = '';
    btnSort.disabled = true;
    fileInput.value = "";
    updateStatus("Đã reset.");
});



// --- The Core Visualized Algorithm ---
btnSort.addEventListener('click', async () => {
    if (isSorting) return;
    if (rawData.length === 0) return;

    btnGenerate.disabled = true;
    btnSort.disabled = true;
    btnReset.disabled = true;
    elNumElements.disabled = true;
    elChunkSize.disabled = true;
    isSorting = true;

    const chunkSize = parseInt(elChunkSize.value);
    let totalElements = rawData.length;
    let elementsProcessed = 0;

    // --- PHASE 1: SPLIT AND LOCAL SORT ---
    updateStatus("GIAI ĐOẠN 1: Đọc tuần tự, phân mảnh và sắp xếp cục bộ trong RAM...");

    // Convert DOM nodes to array for easier manipulation
    let inputNodes = Array.from(inputContainer.children);
    tempFilesContainer.innerHTML = '';
    tempArrays = [];
    let currentChunkId = 0;

    for (let i = 0; i < inputNodes.length; i += chunkSize) {
        ramContainer.innerHTML = ''; // clear ram
        let currentChunkVals = [];
        let currentChunkNodes = [];

        // Load into RAM
        const endIdx = Math.min(i + chunkSize, inputNodes.length);
        for (let j = i; j < endIdx; j++) {
            let node = inputNodes[j];
            node.style.opacity = '0'; // hide from disk

            let val = parseFloat(node.innerText);
            currentChunkVals.push(val);

            let ramNode = createBlock(val, 'active');
            ramContainer.appendChild(ramNode);
            currentChunkNodes.push(ramNode);

            ramBadge.innerText = `${currentChunkNodes.length} / ${chunkSize}`;
            await sleep(getDelay() / 2);
        }

        updateStatus(`Sắp xếp Khối ${currentChunkId + 1} trong RAM (Timsort/Quicksort)...`);
        await sleep(getDelay());

        // Sort Data in RAM
        currentChunkVals.sort((a, b) => a - b);

        // Re-render sorted RAM
        ramContainer.innerHTML = '';
        const sortedRamNodes = [];
        for (let v of currentChunkVals) {
            const sortedNode = createBlock(v, 'sorted');
            ramContainer.appendChild(sortedNode);
            sortedRamNodes.push(sortedNode);
        }
        await sleep(getDelay());

        // Write to Temp Disk
        updateStatus(`Ghi khối ${currentChunkId + 1} đã sắp xếp ra Đĩa (File Tạm)...`);

        // Create Temp File Column
        const tempCol = document.createElement('div');
        tempCol.className = 'temp-file-column';
        tempCol.id = `temp-chunk-${currentChunkId}`;
        const tempTitle = document.createElement('div');
        tempTitle.className = 'temp-file-column-title';
        tempTitle.innerText = `chunk_${currentChunkId}.bin`;
        tempCol.appendChild(tempTitle);
        tempFilesContainer.appendChild(tempCol);

        // Move nodes from RAM to Temp Form
        for (let v of currentChunkVals) {
            ramContainer.firstChild.remove(); // pop ram node
            tempCol.appendChild(createBlock(v));
            ramBadge.innerText = `${ramContainer.children.length} / ${chunkSize}`;
            await sleep(getDelay() / 3);
        }

        // Store the array logic representation
        tempArrays.push({
            id: currentChunkId,
            data: currentChunkVals,
            domBox: tempCol
        });

        currentChunkId++;
        await sleep(getDelay());
    }

    ramBadge.innerText = `0 / ${chunkSize}`;

    // --- PHASE 2: K-WAY MERGE ---
    updateStatus(`GIAI ĐOẠN 2: Bắt đầu Trộn ${tempArrays.length}-đường (K-Way Merge) bằng Min-Heap ảo...`);
    await sleep(getDelay() * 2);

    // K-Way Merge Logic
    // In our RAM we maintain an array representing the current heads of all K files.
    // Each object : {val, chunkId}

    let heapInRam = [];
    ramContainer.innerHTML = '';

    // Step 2.1: Initialize Heap - Read 1 element from each temp file
    updateStatus(`Nạp 1 phần tử đầu tiên từ mỗi Tệp Tạm vào RAM...`);
    for (let i = 0; i < tempArrays.length; i++) {
        if (tempArrays[i].data.length > 0) {
            let val = tempArrays[i].data.shift(); // pop from temp logic

            // Pop from DOM
            let tempNode = tempArrays[i].domBox.querySelectorAll('.number-block')[0];
            tempNode.remove();

            // Push to RAM DOM
            let ramNode = createBlock(val, 'active');
            ramNode.dataset.chunkId = i; // Map back to origin chunk
            ramContainer.appendChild(ramNode);

            ramBadge.innerText = `${ramContainer.children.length} / K=${tempArrays.length}`;

            heapInRam.push({ val: val, chunkId: i, domNode: ramNode });
            await sleep(getDelay() / 2);
        }
    }

    await sleep(getDelay());

    let mergedCount = 0;

    // Step 2.2: Continuous Merge
    while (heapInRam.length > 0) {
        updateStatus("Đang so sánh để tìm phần tử nhỏ nhất trong RAM...");

        // Highlight all for comparison
        heapInRam.forEach(item => item.domNode.classList.add('comparing'));
        await sleep(getDelay());

        // Find Minimum
        let minIdx = 0;
        for (let i = 1; i < heapInRam.length; i++) {
            if (heapInRam[i].val < heapInRam[minIdx].val) {
                minIdx = i;
            }
        }

        let minItem = heapInRam[minIdx];
        let originChunkId = minItem.chunkId;

        // Keep min highlighted, un-highlight others
        heapInRam.forEach((item, idx) => {
            if (idx !== minIdx) {
                item.domNode.classList.remove('comparing');
                item.domNode.classList.remove('active');
            }
        });

        updateStatus(`Phần tử nhỏ nhất là: ${minItem.val}. Đẩy ra Đĩa Kết Quả...`);
        await sleep(getDelay());

        // Remove from RAM DOM
        minItem.domNode.remove();
        heapInRam.splice(minIdx, 1); // remove from array logic

        // Add to Output DOM
        outputContainer.appendChild(createBlock(minItem.val, 'sorted'));
        mergedCount++;
        outputBadge.innerText = `Hoàn thành: ${mergedCount} / ${totalElements}`;

        await sleep(getDelay() / 2);

        // Fetch Next from the Same Chunk
        let sourceArray = tempArrays.find(t => t.id === originChunkId);
        if (sourceArray && sourceArray.data.length > 0) {
            updateStatus(`Đọc phần tử tiếp theo từ chunk_${originChunkId}.bin vào RAM...`);
            let nextVal = sourceArray.data.shift();

            // Remove from Temp DOM
            let tempNode = sourceArray.domBox.querySelectorAll('.number-block')[0];
            tempNode.remove();

            // Add to RAM DOM
            let newRamNode = createBlock(nextVal, 'active');
            newRamNode.dataset.chunkId = originChunkId;
            ramContainer.appendChild(newRamNode);

            heapInRam.push({ val: nextVal, chunkId: originChunkId, domNode: newRamNode });
            await sleep(getDelay() / 2);
        } else {
            // Source chunk is dry
            if (sourceArray) {
                sourceArray.domBox.style.opacity = '0.3'; // Mark file as EOF
            }
        }
    }

    updateStatus("Chuẩn bị trích xuất và lưu mảng kết quả ra tệp nhị phân...");
    await sleep(getDelay());

    // Generate output.bin
    const outNodes = outputContainer.querySelectorAll('.number-block');
    const sortedArray = new Float64Array(outNodes.length);
    for (let i = 0; i < outNodes.length; i++) {
        sortedArray[i] = parseFloat(outNodes[i].innerText);
    }

    const blob = new Blob([sortedArray.buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sorted_output.bin`;
    a.click();
    URL.revokeObjectURL(url);

    updateStatus("✅ HOÀN TẤT: Sắp xếp kết thúc. Đã tự động lưu file kết quả (sorted_output.bin)!");

    // Unlock buttons
    btnGenerate.disabled = false;
    btnSort.disabled = false;
    btnReset.disabled = false;
    elNumElements.disabled = false;
    elChunkSize.disabled = false;
    fileInput.value = "";
    isSorting = false;
});

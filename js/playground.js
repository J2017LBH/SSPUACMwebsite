/* 
 * Interactive Algorithm Visualizer (Playground)
 * Author: Antigravity
 */

// Visualizer State
let array = [];
let arraySize = 15;
let animationSpeed = 300; // Delay in milliseconds
let isPlaying = false;
let isPaused = false;
let currentAlgo = 'bubble'; // 'bubble' or 'selection'
let animationTimeout = null;

// DOM Elements (will be fetched when DOM is ready)
let canvasWrapper, codeBlock, explanationEl;
let startBtn, pauseBtn, resetBtn, sizeRange, speedRange;
let algoBubbleBtn, algoSelectBtn;

// Code Snippets for Algorithm Display
const codeTemplates = {
    bubble: `
<div class="code-line" id="line-1">for (int i = 0; i &lt; n-1; i++) {</div>
<div class="code-line" id="line-2">&nbsp;&nbsp;for (int j = 0; j &lt; n-i-1; j++) {</div>
<div class="code-line" id="line-3">&nbsp;&nbsp;&nbsp;&nbsp;if (arr[j] &gt; arr[j+1]) {</div>
<div class="code-line" id="line-4">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;swap(arr[j], arr[j+1]);</div>
<div class="code-line" id="line-5">&nbsp;&nbsp;&nbsp;&nbsp;}</div>
<div class="code-line" id="line-6">&nbsp;&nbsp;}</div>
<div class="code-line" id="line-7">}</div>
`,
    selection: `
<div class="code-line" id="line-1">for (int i = 0; i &lt; n-1; i++) {</div>
<div class="code-line" id="line-2">&nbsp;&nbsp;int min_idx = i;</div>
<div class="code-line" id="line-3">&nbsp;&nbsp;for (int j = i+1; j &lt; n; j++) {</div>
<div class="code-line" id="line-4">&nbsp;&nbsp;&nbsp;&nbsp;if (arr[j] &lt; arr[min_idx]) {</div>
<div class="code-line" id="line-5">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;min_idx = j;</div>
<div class="code-line" id="line-6">&nbsp;&nbsp;&nbsp;&nbsp;}</div>
<div class="code-line" id="line-7">&nbsp;&nbsp;}</div>
<div class="code-line" id="line-8">&nbsp;&nbsp;swap(arr[i], arr[min_idx]);</div>
<div class="code-line" id="line-9">}</div>
`
};

const explanations = {
    bubble: {
        init: "准备开始冒泡排序：通过相邻元素的比较和交换，使较大的元素逐渐“浮”到数组末尾。",
        outer: "外层循环：第 {i} 轮，将确定倒数第 {i} 个元素的位置。",
        inner: "内层循环：比较相邻的元素 arr[{j}]({val1}) 和 arr[{j1}]({val2})。",
        swap: "发现 arr[{j}] > arr[{j1}]，执行交换，将较大值移到右侧！",
        noswap: "无需交换，保持原序。",
        sorted: "本轮排序完成，第 {i} 大的元素已就位！",
        done: "冒泡排序全部完成！数组现在完全有序。"
    },
    selection: {
        init: "准备开始选择排序：每一轮在未排序区间找到最小的元素，存放到已排序区间的末尾。",
        outer: "外层循环：当前需要确定索引 {i} 处的元素。初始化最小元素索引 min_idx = {i}。",
        inner: "内层循环：扫描未排序区间，比较元素 arr[{j}]({val}) 和当前最小值 arr[min_idx]({minVal})。",
        newmin: "找到更小的值！更新最小索引 min_idx = {j}。",
        swap: "内层循环结束，交换 arr[{i}]({val1}) 与最小值 arr[min_idx]({val2})，归位！",
        noswap: "最小值已经在正确的位置 {i}，无需交换。",
        done: "选择排序全部完成！数组现在完全有序。"
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Wait for dynamic injection to complete
    setTimeout(() => {
        initVisualizerDOM();
    }, 100);
});

function initVisualizerDOM() {
    canvasWrapper = document.getElementById('visualizer-canvas');
    codeBlock = document.getElementById('code-block');
    explanationEl = document.getElementById('explanation');
    
    startBtn = document.getElementById('btn-start');
    pauseBtn = document.getElementById('btn-pause');
    resetBtn = document.getElementById('btn-reset');
    sizeRange = document.getElementById('range-size');
    speedRange = document.getElementById('range-speed');
    
    algoBubbleBtn = document.getElementById('algo-bubble');
    algoSelectBtn = document.getElementById('algo-selection');

    if (!canvasWrapper) return; // Only run on pages containing visualizer

    // Bind Event Listeners
    startBtn.addEventListener('click', startSorting);
    pauseBtn.addEventListener('click', togglePause);
    resetBtn.addEventListener('click', resetVisualizer);
    
    sizeRange.addEventListener('input', (e) => {
        arraySize = parseInt(e.target.value, 10);
        resetVisualizer();
    });
    
    speedRange.addEventListener('input', (e) => {
        // Map 1-100 range to delay: slider 100 (fast) -> 20ms delay, slider 1 (slow) -> 1000ms delay
        const val = parseInt(e.target.value, 10);
        animationSpeed = Math.max(10, 1010 - val * 10);
    });

    algoBubbleBtn.addEventListener('click', () => switchAlgorithm('bubble'));
    algoSelectBtn.addEventListener('click', () => switchAlgorithm('selection'));

    // Initialize Layout
    switchAlgorithm('bubble');
}

// Switch Algorithm
function switchAlgorithm(algo) {
    if (isPlaying) {
        alert("排序正在运行中，请先重置后再切换算法。");
        return;
    }
    currentAlgo = algo;
    
    // Toggle Active Class on buttons
    if (algo === 'bubble') {
        algoBubbleBtn.classList.add('active');
        algoSelectBtn.classList.remove('active');
    } else {
        algoBubbleBtn.classList.remove('active');
        algoSelectBtn.classList.add('active');
    }

    // Load Code Snippet
    codeBlock.innerHTML = codeTemplates[algo];
    explanationEl.textContent = explanations[algo].init;
    
    resetVisualizer();
}

// Generate Random Array
function generateRandomArray() {
    array = [];
    for (let i = 0; i < arraySize; i++) {
        // Value between 10 and 100 representing percentage height
        array.push(Math.floor(Math.random() * 85) + 15);
    }
}

// Render Bars
function renderBars(activeIndices = [], compareIndices = []) {
    canvasWrapper.innerHTML = '';
    
    array.forEach((val, idx) => {
        const bar = document.createElement('div');
        bar.className = 'visualizer-bar';
        bar.style.height = `${val}%`;
        
        // Label the height on the bar
        bar.textContent = val;
        
        // Highlight states
        if (activeIndices.includes(idx)) {
            bar.classList.add('active'); // green (selected/finished)
        } else if (compareIndices.includes(idx)) {
            bar.classList.add('comparing'); // red (comparing)
        }
        
        canvasWrapper.appendChild(bar);
    });
}

// Highlight Code Lines
function highlightLine(lineNum) {
    // Remove all highlights
    document.querySelectorAll('.code-line').forEach(line => {
        line.classList.remove('highlight');
    });
    
    // Add highlight
    const line = document.getElementById(`line-${lineNum}`);
    if (line) {
        line.classList.add('highlight');
    }
}

// Reset Visualizer
function resetVisualizer() {
    isPlaying = false;
    isPaused = false;
    pauseBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停';
    pauseBtn.disabled = true;
    startBtn.disabled = false;
    sizeRange.disabled = false;
    
    generateRandomArray();
    renderBars();
    
    // Reset code highlights
    document.querySelectorAll('.code-line').forEach(line => {
        line.classList.remove('highlight');
    });
    
    explanationEl.textContent = explanations[currentAlgo].init;
}

// Sleep utility that respects pause state
function sleep() {
    return new Promise(resolve => {
        const check = () => {
            if (!isPlaying) {
                // If reset was clicked while sleeping
                resolve(false);
            } else if (isPaused) {
                // Check again in 100ms if paused
                setTimeout(check, 100);
            } else {
                setTimeout(() => resolve(true), animationSpeed);
            }
        };
        check();
    });
}

// Toggle Pause State
function togglePause() {
    if (!isPlaying) return;
    
    isPaused = !isPaused;
    if (isPaused) {
        pauseBtn.innerHTML = '<i class="fas fa-play"></i> 继续';
        explanationEl.textContent = "已暂停。";
    } else {
        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停';
    }
}

// Start Sorting
async function startSorting() {
    isPlaying = true;
    isPaused = false;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    sizeRange.disabled = true;

    let success = false;
    if (currentAlgo === 'bubble') {
        success = await bubbleSort();
    } else {
        success = await selectionSort();
    }

    if (success) {
        // Mark all as active/sorted
        const allIndices = Array.from({length: arraySize}, (_, i) => i);
        renderBars(allIndices);
        highlightLine(0); // Clear highlight
        explanationEl.textContent = explanations[currentAlgo].done;
        isPlaying = false;
        pauseBtn.disabled = true;
    }
}

// 1. Bubble Sort Implementation
async function bubbleSort() {
    const n = array.length;
    
    highlightLine(1);
    explanationEl.textContent = explanations.bubble.outer.replace(/{i}/g, "1");
    if (!await sleep()) return false;

    for (let i = 0; i < n - 1; i++) {
        highlightLine(1);
        explanationEl.textContent = explanations.bubble.outer.replace(/{i}/g, i + 1);
        if (!await sleep()) return false;

        for (let j = 0; j < n - i - 1; j++) {
            highlightLine(2);
            explanationEl.textContent = explanations.bubble.inner
                .replace(/{j}/g, j)
                .replace(/{j1}/g, j + 1)
                .replace(/{val1}/g, array[j])
                .replace(/{val2}/g, array[j+1]);
            
            renderBars([], [j, j + 1]);
            if (!await sleep()) return false;

            highlightLine(3);
            if (!await sleep()) return false;

            if (array[j] > array[j + 1]) {
                // Swap
                highlightLine(4);
                explanationEl.textContent = explanations.bubble.swap
                    .replace(/{j}/g, j)
                    .replace(/{j1}/g, j + 1);
                
                let temp = array[j];
                array[j] = array[j + 1];
                array[j + 1] = temp;
                
                renderBars([], [j, j + 1]);
                if (!await sleep()) return false;
            } else {
                explanationEl.textContent = explanations.bubble.noswap;
                if (!await sleep()) return false;
            }
        }
        
        // End of round: element n-i-1 is sorted
        explanationEl.textContent = explanations.bubble.sorted.replace(/{i}/g, i + 1);
        renderBars([n - i - 1]);
        if (!await sleep()) return false;
    }
    
    return true;
}

// 2. Selection Sort Implementation
async function selectionSort() {
    const n = array.length;
    
    for (let i = 0; i < n - 1; i++) {
        highlightLine(1);
        explanationEl.textContent = explanations.selection.outer.replace(/{i}/g, i);
        if (!await sleep()) return false;
        
        let min_idx = i;
        highlightLine(2);
        renderBars([i], [min_idx]);
        if (!await sleep()) return false;

        for (let j = i + 1; j < n; j++) {
            highlightLine(3);
            explanationEl.textContent = explanations.selection.inner
                .replace(/{j}/g, j)
                .replace(/{val}/g, array[j])
                .replace(/{minVal}/g, array[min_idx]);
            
            renderBars([i], [j, min_idx]);
            if (!await sleep()) return false;

            highlightLine(4);
            if (!await sleep()) return false;

            if (array[j] < array[min_idx]) {
                min_idx = j;
                highlightLine(5);
                explanationEl.textContent = explanations.selection.newmin.replace(/{j}/g, j);
                renderBars([i], [min_idx]);
                if (!await sleep()) return false;
            }
        }

        // Swap if min_idx is different
        highlightLine(8);
        if (min_idx !== i) {
            explanationEl.textContent = explanations.selection.swap
                .replace(/{i}/g, i)
                .replace(/{val1}/g, array[i])
                .replace(/{val2}/g, array[min_idx]);
                
            let temp = array[i];
            array[i] = array[min_idx];
            array[min_idx] = temp;
            
            renderBars([i], [i, min_idx]);
            if (!await sleep()) return false;
        } else {
            explanationEl.textContent = explanations.selection.noswap.replace(/{i}/g, i);
            if (!await sleep()) return false;
        }
    }
    
    return true;
}

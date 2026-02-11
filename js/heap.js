// heap.js - Heap (Priority Queue) visualizer

class Heap {
    constructor(isMax = true) {
        this.heap = [];
        this.isMax = isMax;
    }

    insert(value) {
        this.heap.push(value);
        this._heapifyUp(this.heap.length - 1);
    }

    delete() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const root = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._heapifyDown(0);
        return root;
    }

    _heapifyUp(index) {
        const parentIndex = Math.floor((index - 1) / 2);
        if (parentIndex >= 0 && this._compare(this.heap[index], this.heap[parentIndex])) {
            [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
            this._heapifyUp(parentIndex);
        }
    }

    _heapifyDown(index) {
        const leftChild = 2 * index + 1;
        const rightChild = 2 * index + 2;
        let largest = index;

        if (leftChild < this.heap.length && this._compare(this.heap[leftChild], this.heap[largest])) {
            largest = leftChild;
        }
        if (rightChild < this.heap.length && this._compare(this.heap[rightChild], this.heap[largest])) {
            largest = rightChild;
        }

        if (largest !== index) {
            [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
            this._heapifyDown(largest);
        }
    }

    _compare(a, b) {
        return this.isMax ? a > b : a < b;
    }

    size() {
        return this.heap.length;
    }

    isEmpty() {
        return this.heap.length === 0;
    }
}

class HeapVisualizer {
    static init(visualizationArea, operationsDiv, timeComplexityP, spaceComplexityP, animationSpeed) {
        this.heap = new Heap(true); // Start with Max Heap
        this.visualizationArea = visualizationArea;
        this.operationsDiv = operationsDiv;
        this.timeComplexityP = timeComplexityP;
        this.spaceComplexityP = spaceComplexityP;
        this.animationSpeed = animationSpeed;

        this.setupUI();
        this.updateVisualization();
        this.updateComplexity();
    }

    static setupUI() {
        this.operationsDiv.innerHTML = `
            <h3>Heap (Priority Queue) Operations</h3>
            <select id="heap-type">
                <option value="max">Max Heap</option>
                <option value="min">Min Heap</option>
            </select>
            <input type="number" id="heap-value" placeholder="Enter number">
            <button id="heap-insert-btn" class="tooltip">Insert
                <span class="tooltiptext">O(log n)</span>
            </button>
            <button id="heap-delete-btn" class="tooltip">Delete Root
                <span class="tooltiptext">O(log n)</span>
            </button>
        `;

        document.getElementById('heap-type').addEventListener('change', (e) => this.changeType(e.target.value));
        document.getElementById('heap-insert-btn').addEventListener('click', () => this.insert());
        document.getElementById('heap-delete-btn').addEventListener('click', () => this.delete());
    }

    static changeType(type) {
        const isMax = type === 'max';
        this.heap = new Heap(isMax);
        this.updateVisualization();
        this.updateComplexity();
    }

    static async insert() {
        const value = parseInt(document.getElementById('heap-value').value);
        if (isNaN(value)) return;
        this.heap.insert(value);
        await this.updateVisualization();
        this.updateComplexity();
        document.getElementById('heap-value').value = '';
    }

    static async delete() {
        if (this.heap.isEmpty()) {
            alert('Heap is empty!');
            return;
        }
        const deleted = this.heap.delete();
        await this.updateVisualization();
        this.updateComplexity();
        alert(`Deleted: ${deleted}`);
    }

    static async updateVisualization() {
        this.visualizationArea.innerHTML = '<div class="heap"></div>';
        const heapDiv = this.visualizationArea.querySelector('.heap');

        if (this.heap.heap.length > 0) {
            this.drawHeap(heapDiv, 0, 400, 50, 150);
        }
    }

    static drawHeap(container, index, x, y, offset) {
        if (index >= this.heap.heap.length) return;

        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'heap-node';
        nodeDiv.textContent = this.heap.heap[index];
        nodeDiv.style.left = `${x - 25}px`;
        nodeDiv.style.top = `${y}px`;
        container.appendChild(nodeDiv);

        const leftIndex = 2 * index + 1;
        const rightIndex = 2 * index + 2;

        if (leftIndex < this.heap.heap.length) {
            this.drawLine(container, x, y + 25, x - offset, y + 75);
            this.drawHeap(container, leftIndex, x - offset, y + 100, offset / 2);
        }
        if (rightIndex < this.heap.heap.length) {
            this.drawLine(container, x, y + 25, x + offset, y + 75);
            this.drawHeap(container, rightIndex, x + offset, y + 100, offset / 2);
        }
    }

    static drawLine(container, x1, y1, x2, y2) {
        const line = document.createElement('div');
        line.style.position = 'absolute';
        line.style.left = `${x1}px`;
        line.style.top = `${y1}px`;
        line.style.width = `${Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)}px`;
        line.style.height = '1px';
        line.style.backgroundColor = 'var(--text-color)';
        line.style.transformOrigin = '0 0';
        line.style.transform = `rotate(${Math.atan2(y2 - y1, x2 - x1)}rad)`;
        container.appendChild(line);
    }

    static updateComplexity() {
        this.timeComplexityP.textContent = 'Time Complexity: O(log n) for Insert/Delete';
        this.spaceComplexityP.textContent = 'Space Complexity: O(n)';
    }
}
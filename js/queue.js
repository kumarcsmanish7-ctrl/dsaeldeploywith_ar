// queue.js - Queue and Circular Queue visualizer

class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(element) {
        this.items.push(element);
    }

    dequeue() {
        if (this.isEmpty()) return null;
        return this.items.shift();
    }

    front() {
        if (this.isEmpty()) return null;
        return this.items[0];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    size() {
        return this.items.length;
    }

    clear() {
        this.items = [];
    }
}

class CircularQueue {
    constructor(size) {
        this.size = size;
        this.items = new Array(size);
        this.front = -1;
        this.rear = -1;
    }

    enqueue(element) {
        if (this.isFull()) return false;
        if (this.front === -1) this.front = 0;
        this.rear = (this.rear + 1) % this.size;
        this.items[this.rear] = element;
        return true;
    }

    dequeue() {
        if (this.isEmpty()) return null;
        const element = this.items[this.front];
        if (this.front === this.rear) {
            this.front = -1;
            this.rear = -1;
        } else {
            this.front = (this.front + 1) % this.size;
        }
        return element;
    }

    front() {
        if (this.isEmpty()) return null;
        return this.items[this.front];
    }

    isEmpty() {
        return this.front === -1;
    }

    isFull() {
        return (this.rear + 1) % this.size === this.front;
    }

    clear() {
        this.items = new Array(this.size);
        this.front = -1;
        this.rear = -1;
    }
}

class QueueVisualizer {
    static init(visualizationArea, operationsDiv, timeComplexityP, spaceComplexityP, animationSpeed) {
        this.queue = new Queue();
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
            <h3>Queue Operations</h3>
            <input type="text" id="queue-input" placeholder="Enter value">
            <button id="enqueue-btn" class="tooltip">Enqueue
                <span class="tooltiptext">Add element to rear of queue - O(1)</span>
            </button>
            <button id="dequeue-btn" class="tooltip">Dequeue
                <span class="tooltiptext">Remove element from front of queue - O(1)</span>
            </button>
            <button id="front-btn" class="tooltip">Front
                <span class="tooltiptext">View front element - O(1)</span>
            </button>
        `;

        document.getElementById('enqueue-btn').addEventListener('click', () => this.enqueue());
        document.getElementById('dequeue-btn').addEventListener('click', () => this.dequeue());
        document.getElementById('front-btn').addEventListener('click', () => this.front());
    }

    static enqueue() {
        const input = document.getElementById('queue-input');
        const value = input.value.trim();
        if (value === '') return;

        this.queue.enqueue(value);
        input.value = '';  // Clear input after enqueue
        this.updateVisualization();
        this.updateComplexity();
    }

    static async dequeue() {
        if (this.queue.isEmpty()) {
            alert('Queue is empty!');
            return;
        }

        const dequeuedElement = this.queue.dequeue();
        await this.updateVisualization();
        this.updateComplexity();
        alert(`Dequeued: ${dequeuedElement}`);
    }

    static front() {
        const frontElement = this.queue.front();
        if (frontElement === null) {
            alert('Queue is empty!');
        } else {
            alert(`Front element: ${frontElement}`);
        }
        this.updateComplexity();
    }

    static async updateVisualization() {
        this.visualizationArea.innerHTML = '<div class="queue"></div>';
        const queueDiv = this.visualizationArea.querySelector('.queue');

        for (let item of this.queue.items) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'queue-item';
            itemDiv.textContent = item;
            queueDiv.appendChild(itemDiv);
        }
    }

    static updateComplexity() {
        this.timeComplexityP.textContent = 'Time Complexity: O(1) for Enqueue, Dequeue, Front';
        this.spaceComplexityP.textContent = 'Space Complexity: O(n)';
    }
}

class CircularQueueVisualizer {
    static init(visualizationArea, operationsDiv, timeComplexityP, spaceComplexityP, animationSpeed) {
        this.queue = new CircularQueue(5); // Fixed size for visualization
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
            <h3>Circular Queue Operations</h3>
            <p>Size: 5</p>
            <input type="text" id="cqueue-input" placeholder="Enter value">
            <button id="cenqueue-btn" class="tooltip">Enqueue
                <span class="tooltiptext">Add element to rear - O(1)</span>
            </button>
            <button id="cdequeue-btn" class="tooltip">Dequeue
                <span class="tooltiptext">Remove element from front - O(1)</span>
            </button>
            <button id="cfront-btn" class="tooltip">Front
                <span class="tooltiptext">View front element - O(1)</span>
            </button>
        `;

        document.getElementById('cenqueue-btn').addEventListener('click', () => this.enqueue());
        document.getElementById('cdequeue-btn').addEventListener('click', () => this.dequeue());
        document.getElementById('cfront-btn').addEventListener('click', () => this.front());
    }

    static async enqueue() {
        const input = document.getElementById('cqueue-input');
        const value = input.value.trim();
        if (value === '') return;

        if (!this.queue.enqueue(value)) {
            alert('Queue is full!');
            return;
        }

        await this.updateVisualization();
        this.updateComplexity();
        input.value = '';
    }

    static async dequeue() {
        if (this.queue.isEmpty()) {
            alert('Queue is empty!');
            return;
        }

        const dequeuedElement = this.queue.dequeue();
        await this.updateVisualization();
        this.updateComplexity();
        alert(`Dequeued: ${dequeuedElement}`);
    }

    static front() {
        const frontElement = this.queue.front();
        if (frontElement === null) {
            alert('Queue is empty!');
        } else {
            alert(`Front element: ${frontElement}`);
        }
        this.updateComplexity();
    }

    static updateVisualization() {
        this.visualizationArea.innerHTML = '<div class="queue"></div>';
        const queueDiv = this.visualizationArea.querySelector('.queue');

        for (let i = 0; i < this.queue.size; i++) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'queue-item';
            
            // Check if this position is part of the active queue
            let isActive = false;
            if (!this.queue.isEmpty()) {
                if (this.queue.front <= this.queue.rear) {
                    // Normal case: front <= rear
                    isActive = (i >= this.queue.front && i <= this.queue.rear);
                } else {
                    // Wrapped case: front > rear
                    isActive = (i >= this.queue.front || i <= this.queue.rear);
                }
            }
            
            if (isActive && this.queue.items[i] !== undefined) {
                itemDiv.textContent = this.queue.items[i];
            } else {
                itemDiv.textContent = '';
                itemDiv.style.backgroundColor = 'transparent';
                itemDiv.style.border = '1px dashed var(--border-color)';
            }
            queueDiv.appendChild(itemDiv);
        }

        // Add front and rear pointers
        const items = queueDiv.querySelectorAll('.queue-item');
        if (!this.queue.isEmpty()) {
            items[this.queue.front].style.borderColor = 'green';
            items[this.queue.front].style.borderWidth = '3px';
            items[this.queue.rear].style.borderColor = 'red';
            items[this.queue.rear].style.borderWidth = '3px';
        }
    }

    static updateComplexity() {
        this.timeComplexityP.textContent = 'Time Complexity: O(1) for Enqueue, Dequeue, Front';
        this.spaceComplexityP.textContent = 'Space Complexity: O(n)';
    }
}
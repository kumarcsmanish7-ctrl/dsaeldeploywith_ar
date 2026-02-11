// scheduler.js - Smart Task Scheduling & Execution Visualizer

class Task {
    constructor(id, name, priority, expression) {
        this.id = id;
        this.name = name;
        this.priority = priority;
        this.expression = expression;
        this.status = 'pending'; // pending, executing, completed
        this.executionTime = 0;
        this.result = null;
    }
}

class TaskScheduler {
    static init(visualizationArea, operationsDiv, timeComplexityP, spaceComplexityP, animationSpeed) {
        this.visualizationArea = visualizationArea;
        this.operationsDiv = operationsDiv;
        this.timeComplexityP = timeComplexityP;
        this.spaceComplexityP = spaceComplexityP;
        this.animationSpeed = animationSpeed;

        // Initialize data structures
        this.taskQueue = new Queue();
        this.circularQueue = new CircularQueue(5);
        this.priorityHeap = new Heap(true); // Max heap for priority
        this.activeTasks = new LinkedList(false); // Singly linked list
        this.completedTasks = new LinkedList(true); // Doubly linked list
        this.taskBST = new BST(); // For analysis

        this.tasks = [];
        this.currentTask = null;
        this.isPlaying = false;
        this.stepMode = false;

        this.setupUI();
        this.updateVisualization();
        this.updateComplexity();
    }

    static setupUI() {
        this.operationsDiv.innerHTML = `
            <h3>Smart Task Scheduling & Execution Visualizer</h3>
            <div id="task-creation">
                <h4>Create New Task</h4>
                <input type="text" id="task-id" placeholder="Task ID">
                <input type="text" id="task-name" placeholder="Task Name">
                <input type="number" id="task-priority" placeholder="Priority (1-10)" min="1" max="10">
                <input type="text" id="task-expression" placeholder="Expression (e.g., 2+3*4)">
                <button id="create-task-btn">Create Task</button>
            </div>
            <div id="execution-controls">
                <h4>Execution Controls</h4>
                <button id="execute-step-btn" class="tooltip">Execute Step
                    <span class="tooltiptext">Execute one step at a time</span>
                </button>
                <button id="execute-all-btn" class="tooltip">Execute All
                    <span class="tooltiptext">Execute all pending tasks</span>
                </button>
                <button id="play-pause-btn" class="tooltip">Play/Pause
                    <span class="tooltiptext">Toggle automatic execution</span>
                </button>
                <button id="reset-scheduler-btn">Reset</button>
                <button id="clear-scheduler-btn">Clear All</button>
            </div>
            <div id="execution-log">
                <h4>Execution Log</h4>
                <div id="log-content"></div>
            </div>
        `;

        document.getElementById('create-task-btn').addEventListener('click', () => this.createTask());
        document.getElementById('execute-step-btn').addEventListener('click', () => this.executeStep());
        document.getElementById('execute-all-btn').addEventListener('click', () => this.executeAll());
        document.getElementById('play-pause-btn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('reset-scheduler-btn').addEventListener('click', () => this.reset());
        document.getElementById('clear-scheduler-btn').addEventListener('click', () => this.clearAll());
    }

    static createTask() {
        const id = document.getElementById('task-id').value.trim();
        const name = document.getElementById('task-name').value.trim();
        const priority = parseInt(document.getElementById('task-priority').value);
        const expression = document.getElementById('task-expression').value.trim();

        if (!id || !name || isNaN(priority) || !expression) {
            alert('Please fill all fields correctly!');
            return;
        }

        const task = new Task(id, name, priority, expression);
        this.tasks.push(task);

        // Add to queue and priority heap
        this.taskQueue.enqueue(task);
        this.priorityHeap.insert({ task: task, priority: priority });

        this.log(`Task ${id} (${name}) created with priority ${priority}`);
        this.updateVisualization();
        this.updateComplexity();

        // Clear inputs
        document.getElementById('task-id').value = '';
        document.getElementById('task-name').value = '';
        document.getElementById('task-priority').value = '';
        document.getElementById('task-expression').value = '';
    }

    static executeStep() {
        if (this.tasks.length === 0) {
            alert('No tasks to execute!');
            return;
        }

        // Get highest priority task
        const priorityItem = this.priorityHeap.delete();
        if (priorityItem) {
            const task = priorityItem.task;
            this.executeTask(task);
        } else {
            // Fallback to queue if heap is empty
            const task = this.taskQueue.dequeue();
            if (task) {
                this.executeTask(task);
            }
        }
    }

    static executeTask(task) {
        task.status = 'executing';
        this.currentTask = task;
        this.log(`Executing task ${task.id} (${task.name})`);

        // Convert infix to postfix using stack
        const postfix = this.infixToPostfix(task.expression);
        this.log(`Converted ${task.expression} to postfix: ${postfix}`);

        // Evaluate postfix expression
        const result = this.evaluatePostfix(postfix);
        task.result = result;
        task.status = 'completed';
        task.executionTime = Date.now();

        // Move to completed tasks
        this.completedTasks.insertAtEnd(task);

        // Add to BST for analysis
        this.taskBST.insert(task.executionTime);

        this.log(`Task ${task.id} completed with result: ${result}`);
        this.updateVisualization();
        this.updateComplexity();
    }

    static executeAll() {
        while (this.tasks.some(t => t.status === 'pending')) {
            this.executeStep();
        }
    }

    static togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.autoExecute();
        }
    }

    static async autoExecute() {
        while (this.isPlaying && this.tasks.some(t => t.status === 'pending')) {
            this.executeStep();
            await Animations.sleep(this.animationSpeed);
        }
        this.isPlaying = false;
    }

    static reset() {
        this.tasks.forEach(task => {
            task.status = 'pending';
            task.result = null;
            task.executionTime = 0;
        });
        this.taskQueue = new Queue();
        this.priorityHeap = new Heap(true);
        this.activeTasks = new LinkedList(false);
        this.completedTasks = new LinkedList(true);
        this.taskBST = new BST();
        this.currentTask = null;
        this.isPlaying = false;

        // Re-queue all tasks
        this.tasks.forEach(task => {
            this.taskQueue.enqueue(task);
            this.priorityHeap.insert({ task: task, priority: task.priority });
        });

        this.log('Scheduler reset');
        this.updateVisualization();
        this.updateComplexity();
    }

    static clearAll() {
        this.tasks = [];
        this.taskQueue = new Queue();
        this.priorityHeap = new Heap(true);
        this.activeTasks = new LinkedList(false);
        this.completedTasks = new LinkedList(true);
        this.taskBST = new BST();
        this.currentTask = null;
        this.isPlaying = false;
        document.getElementById('log-content').innerHTML = '';
        this.updateVisualization();
        this.updateComplexity();
    }

    static infixToPostfix(infix) {
        const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
        const stack = [];
        let postfix = '';

        for (let char of infix) {
            if (char.match(/[0-9]/)) {
                postfix += char;
            } else if (char === '(') {
                stack.push(char);
            } else if (char === ')') {
                while (stack.length && stack[stack.length - 1] !== '(') {
                    postfix += stack.pop();
                }
                stack.pop();
            } else {
                while (stack.length && precedence[char] <= precedence[stack[stack.length - 1]]) {
                    postfix += stack.pop();
                }
                stack.push(char);
            }
        }

        while (stack.length) {
            postfix += stack.pop();
        }

        return postfix;
    }

    static evaluatePostfix(postfix) {
        const stack = [];

        for (let char of postfix) {
            if (char.match(/[0-9]/)) {
                stack.push(parseInt(char));
            } else {
                const b = stack.pop();
                const a = stack.pop();
                switch (char) {
                    case '+': stack.push(a + b); break;
                    case '-': stack.push(a - b); break;
                    case '*': stack.push(a * b); break;
                    case '/': stack.push(Math.floor(a / b)); break;
                    case '^': stack.push(Math.pow(a, b)); break;
                }
            }
        }

        return stack.pop();
    }

    static log(message) {
        const logContent = document.getElementById('log-content');
        const logEntry = document.createElement('p');
        logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight;
    }

    static updateVisualization() {
        this.visualizationArea.innerHTML = `
            <div class="scheduler-dashboard">
                <div class="scheduler-section">
                    <h4>Task Queue (FIFO)</h4>
                    <div class="queue" id="task-queue-viz"></div>
                </div>
                <div class="scheduler-section">
                    <h4>Priority Heap</h4>
                    <div class="heap" id="priority-heap-viz"></div>
                </div>
                <div class="scheduler-section">
                    <h4>Active Tasks (Linked List)</h4>
                    <div class="linked-list" id="active-tasks-viz"></div>
                </div>
                <div class="scheduler-section">
                    <h4>Completed Tasks (Doubly Linked List)</h4>
                    <div class="doubly-linked-list" id="completed-tasks-viz"></div>
                </div>
                <div class="scheduler-section">
                    <h4>Task Analysis (BST)</h4>
                    <div class="tree" id="task-analysis-viz"></div>
                </div>
            </div>
        `;

        // Visualize queue
        const queueViz = document.getElementById('task-queue-viz');
        this.taskQueue.items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'queue-item';
            itemDiv.textContent = `${item.id} (${item.priority})`;
            if (item.status === 'executing') itemDiv.classList.add('highlight');
            queueViz.appendChild(itemDiv);
        });

        // Visualize priority heap (simplified)
        const heapViz = document.getElementById('priority-heap-viz');
        if (this.priorityHeap.heap.length > 0) {
            this.drawHeap(heapViz, 0, 200, 50, 100);
        }

        // Visualize active tasks
        const activeViz = document.getElementById('active-tasks-viz');
        this.tasks.filter(t => t.status === 'pending').forEach(task => {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'list-node';
            nodeDiv.textContent = task.id;
            activeViz.appendChild(nodeDiv);
        });

        // Visualize completed tasks
        const completedViz = document.getElementById('completed-tasks-viz');
        this.completedTasks.toArray().forEach(task => {
            const nodeDiv = document.createElement('div');
            nodeDiv.className = 'doubly-list-node';
            nodeDiv.textContent = `${task.id}=${task.result}`;
            completedViz.appendChild(nodeDiv);
        });

        // Visualize BST
        const bstViz = document.getElementById('task-analysis-viz');
        if (this.taskBST.root) {
            this.drawTree(bstViz, this.taskBST.root, 200, 50, 100);
        }
    }

    static drawHeap(container, index, x, y, offset) {
        if (index >= this.priorityHeap.heap.length) return;

        const item = this.priorityHeap.heap[index];
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'heap-node';
        nodeDiv.textContent = item ? `${item.task.id}(${item.priority})` : '';
        nodeDiv.style.left = `${x - 25}px`;
        nodeDiv.style.top = `${y}px`;
        container.appendChild(nodeDiv);

        const leftIndex = 2 * index + 1;
        const rightIndex = 2 * index + 2;

        if (leftIndex < this.priorityHeap.heap.length) {
            this.drawLine(container, x, y + 25, x - offset, y + 75);
            this.drawHeap(container, leftIndex, x - offset, y + 100, offset / 2);
        }
        if (rightIndex < this.priorityHeap.heap.length) {
            this.drawLine(container, x, y + 25, x + offset, y + 75);
            this.drawHeap(container, rightIndex, x + offset, y + 100, offset / 2);
        }
    }

    static drawTree(container, node, x, y, offset) {
        if (!node) return;

        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'tree-node';
        nodeDiv.textContent = node.data;
        nodeDiv.style.left = `${x - 25}px`;
        nodeDiv.style.top = `${y}px`;
        container.appendChild(nodeDiv);

        if (node.left) {
            this.drawLine(container, x, y + 25, x - offset, y + 75);
            this.drawTree(container, node.left, x - offset, y + 100, offset / 2);
        }
        if (node.right) {
            this.drawLine(container, x, y + 25, x + offset, y + 75);
            this.drawTree(container, node.right, x + offset, y + 100, offset / 2);
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
        this.timeComplexityP.textContent = 'Time Complexity: Varies by operation (O(1) to O(log n))';
        this.spaceComplexityP.textContent = 'Space Complexity: O(n) for all structures';
    }
}
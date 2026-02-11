// linkedlist.js - Linked List visualizer

class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
        this.prev = null;
    }
}

class LinkedList {
    constructor(isDoubly = false) {
        this.head = null;
        this.isDoubly = isDoubly;
    }

    insertAtBeginning(data) {
        const newNode = new Node(data);
        if (this.isDoubly) {
            newNode.next = this.head;
            if (this.head) this.head.prev = newNode;
        } else {
            newNode.next = this.head;
        }
        this.head = newNode;
    }

    insertAtEnd(data) {
        const newNode = new Node(data);
        if (!this.head) {
            this.head = newNode;
            return;
        }
        let current = this.head;
        while (current.next) {
            current = current.next;
        }
        current.next = newNode;
        if (this.isDoubly) newNode.prev = current;
    }

    insertAtPosition(data, position) {
        if (position === 0) {
            this.insertAtBeginning(data);
            return;
        }
        const newNode = new Node(data);
        let current = this.head;
        let index = 0;
        while (current && index < position - 1) {
            current = current.next;
            index++;
        }
        if (!current) return;
        newNode.next = current.next;
        current.next = newNode;
        if (this.isDoubly) {
            if (newNode.next) newNode.next.prev = newNode;
            newNode.prev = current;
        }
    }

    deleteFromBeginning() {
        if (!this.head) return null;
        const deleted = this.head;
        this.head = this.head.next;
        if (this.isDoubly && this.head) this.head.prev = null;
        return deleted.data;
    }

    deleteFromEnd() {
        if (!this.head) return null;
        if (!this.head.next) {
            const deleted = this.head;
            this.head = null;
            return deleted.data;
        }
        let current = this.head;
        while (current.next.next) {
            current = current.next;
        }
        const deleted = current.next;
        current.next = null;
        if (this.isDoubly) deleted.prev = null;
        return deleted.data;
    }

    deleteAtPosition(position) {
        if (position === 0) return this.deleteFromBeginning();
        let current = this.head;
        let index = 0;
        while (current && index < position - 1) {
            current = current.next;
            index++;
        }
        if (!current || !current.next) return null;
        const deleted = current.next;
        current.next = deleted.next;
        if (this.isDoubly) {
            if (deleted.next) deleted.next.prev = current;
        }
        return deleted.data;
    }

    search(data) {
        let current = this.head;
        let position = 0;
        while (current) {
            if (current.data == data) return position;
            current = current.next;
            position++;
        }
        return -1;
    }

    toArray() {
        const arr = [];
        let current = this.head;
        while (current) {
            arr.push(current.data);
            current = current.next;
        }
        return arr;
    }
}

class LinkedListVisualizer {
    static init(visualizationArea, operationsDiv, timeComplexityP, spaceComplexityP, animationSpeed, isDoubly) {
        this.list = new LinkedList(isDoubly);
        this.visualizationArea = visualizationArea;
        this.operationsDiv = operationsDiv;
        this.timeComplexityP = timeComplexityP;
        this.spaceComplexityP = spaceComplexityP;
        this.animationSpeed = animationSpeed;
        this.isDoubly = isDoubly;
        this.highlightedNode = null;

        this.setupUI();
        this.updateVisualization();
        this.updateComplexity();
    }

    static setupUI() {
        const listType = this.isDoubly ? 'Doubly' : 'Singly';
        this.operationsDiv.innerHTML = `
            <h3>${listType} Linked List Operations</h3>
            <div class="input-group">
                <input type="text" id="list-value" placeholder="Enter value">
                <input type="number" id="list-position" placeholder="Position (0-based)" min="0">
            </div>
            <div class="button-group">
                <button id="insert-begin" class="tooltip">Insert at Beginning
                    <span class="tooltiptext">Add to start - O(1)</span>
                </button>
                <button id="insert-end" class="tooltip">Insert at End
                    <span class="tooltiptext">Add to end - O(n)</span>
                </button>
                <button id="insert-pos" class="tooltip">Insert at Position
                    <span class="tooltiptext">Add at index - O(n)</span>
                </button>
            </div>
            <div class="button-group">
                <button id="delete-begin" class="tooltip">Delete from Beginning
                    <span class="tooltiptext">Remove from start - O(1)</span>
                </button>
                <button id="delete-end" class="tooltip">Delete from End
                    <span class="tooltiptext">Remove from end - O(n)</span>
                </button>
                <button id="delete-pos" class="tooltip">Delete at Position
                    <span class="tooltiptext">Remove at index - O(n)</span>
                </button>
            </div>
            <div class="button-group">
                <button id="search-btn" class="tooltip">Search
                    <span class="tooltiptext">Find element - O(n)</span>
                </button>
                <button id="traverse-btn" class="tooltip">Traverse
                    <span class="tooltiptext">Highlight all nodes</span>
                </button>
            </div>
        `;

        document.getElementById('insert-begin').addEventListener('click', () => this.insertAtBeginning());
        document.getElementById('insert-end').addEventListener('click', () => this.insertAtEnd());
        document.getElementById('insert-pos').addEventListener('click', () => this.insertAtPosition());
        document.getElementById('delete-begin').addEventListener('click', () => this.deleteFromBeginning());
        document.getElementById('delete-end').addEventListener('click', () => this.deleteFromEnd());
        document.getElementById('delete-pos').addEventListener('click', () => this.deleteAtPosition());
        document.getElementById('search-btn').addEventListener('click', () => this.search());
        document.getElementById('traverse-btn').addEventListener('click', () => this.traverse());
    }

    static insertAtBeginning() {
        const value = document.getElementById('list-value').value.trim();
        if (value === '') {
            alert('Please enter a value');
            return;
        }
        this.list.insertAtBeginning(value);
        this.updateVisualization();
        this.updateComplexity();
        document.getElementById('list-value').value = '';
    }

    static insertAtEnd() {
        const value = document.getElementById('list-value').value.trim();
        if (value === '') {
            alert('Please enter a value');
            return;
        }
        this.list.insertAtEnd(value);
        this.updateVisualization();
        this.updateComplexity();
        document.getElementById('list-value').value = '';
    }

    static insertAtPosition() {
        const value = document.getElementById('list-value').value.trim();
        const position = parseInt(document.getElementById('list-position').value);
        if (value === '' || isNaN(position)) {
            alert('Please enter both value and position');
            return;
        }
        this.list.insertAtPosition(value, position);
        this.updateVisualization();
        this.updateComplexity();
        document.getElementById('list-value').value = '';
        document.getElementById('list-position').value = '';
    }

    static deleteFromBeginning() {
        const deleted = this.list.deleteFromBeginning();
        if (deleted === null) {
            alert('List is empty!');
            return;
        }
        this.updateVisualization();
        this.updateComplexity();
        alert(`Deleted: ${deleted}`);
    }

    static deleteFromEnd() {
        const deleted = this.list.deleteFromEnd();
        if (deleted === null) {
            alert('List is empty!');
            return;
        }
        this.updateVisualization();
        this.updateComplexity();
        alert(`Deleted: ${deleted}`);
    }

    static deleteAtPosition() {
        const position = parseInt(document.getElementById('list-position').value);
        if (isNaN(position)) {
            alert('Please enter a position');
            return;
        }
        const deleted = this.list.deleteAtPosition(position);
        if (deleted === null) {
            alert('Invalid position or list is empty!');
            return;
        }
        this.updateVisualization();
        this.updateComplexity();
        alert(`Deleted: ${deleted}`);
        document.getElementById('list-position').value = '';
    }

    static search() {
        const value = document.getElementById('list-value').value.trim();
        if (value === '') {
            alert('Please enter a value to search');
            return;
        }
        const position = this.list.search(value);
        if (position === -1) {
            alert(`"${value}" not found in the list`);
        } else {
            alert(`"${value}" found at position ${position}`);
            this.highlightNode(position);
        }
        this.updateComplexity();
    }

    static async traverse() {
        if (!this.list.head) {
            alert('List is empty!');
            return;
        }
        let current = this.list.head;
        let position = 0;
        while (current) {
            this.highlightNode(position);
            await new Promise(resolve => setTimeout(resolve, this.animationSpeed));
            position++;
            current = current.next;
        }
        this.highlightNode(-1);
    }

    static highlightNode(position) {
        const nodes = document.querySelectorAll('.node-box');
        nodes.forEach((node, index) => {
            if (index === position) {
                node.classList.add('highlighted');
            } else {
                node.classList.remove('highlighted');
            }
        });
    }

    static updateVisualization() {
        this.visualizationArea.innerHTML = '<div class="linked-list-container"></div>';
        const container = this.visualizationArea.querySelector('.linked-list-container');

        if (!this.list.head) {
            container.innerHTML = '<p class="empty-message">List is empty. Add some values!</p>';
            return;
        }

        const nodesContainer = document.createElement('div');
        nodesContainer.className = 'nodes-container';

        let current = this.list.head;
        let position = 0;

        while (current) {
            const nodeWrapper = document.createElement('div');
            nodeWrapper.className = 'node-wrapper';

            // Create node box
            const nodeBox = document.createElement('div');
            nodeBox.className = 'node-box';

            if (this.isDoubly) {
                nodeBox.innerHTML = `
                    <div class="node-content">
                        <div class="node-section prev-section">
                            <span class="section-label">prev</span>
                            <span class="pointer-value">${current.prev ? '◄' : 'null'}</span>
                        </div>
                        <div class="node-section data-section">
                            <span class="section-label">data</span>
                            <span class="data-value">${current.data}</span>
                        </div>
                        <div class="node-section next-section">
                            <span class="section-label">next</span>
                            <span class="pointer-value">${current.next ? '►' : 'null'}</span>
                        </div>
                    </div>
                `;
            } else {
                nodeBox.innerHTML = `
                    <div class="node-content">
                        <div class="node-section data-section">
                            <span class="section-label">data</span>
                            <span class="data-value">${current.data}</span>
                        </div>
                        <div class="node-section next-section">
                            <span class="section-label">next</span>
                            <span class="pointer-value">${current.next ? '→' : 'null'}</span>
                        </div>
                    </div>
                `;
            }

            nodeWrapper.appendChild(nodeBox);

            // Add arrow if there's a next node
            if (current.next) {
                const arrow = document.createElement('div');
                arrow.className = this.isDoubly ? 'double-arrow' : 'arrow';
                arrow.innerHTML = this.isDoubly ? '⇄' : '→';
                nodeWrapper.appendChild(arrow);
            }

            nodesContainer.appendChild(nodeWrapper);
            current = current.next;
            position++;
        }

        container.appendChild(nodesContainer);
    }

    static updateComplexity() {
        this.timeComplexityP.textContent = 'Time Complexity: Varies by operation (O(1) to O(n))';
        this.spaceComplexityP.textContent = 'Space Complexity: O(n)';
    }
}
// tree.js - Binary Search Tree visualizer

class TreeNode {
    constructor(data) {
        this.data = data;
        this.left = null;
        this.right = null;
    }
}

class BST {
    constructor() {
        this.root = null;
    }

    insert(data) {
        this.root = this._insertRec(this.root, data);
    }

    _insertRec(node, data) {
        if (node === null) return new TreeNode(data);
        if (data < node.data) {
            node.left = this._insertRec(node.left, data);
        } else if (data > node.data) {
            node.right = this._insertRec(node.right, data);
        }
        return node;
    }

    delete(data) {
        this.root = this._deleteRec(this.root, data);
    }

    _deleteRec(node, data) {
        if (node === null) return node;
        if (data < node.data) {
            node.left = this._deleteRec(node.left, data);
        } else if (data > node.data) {
            node.right = this._deleteRec(node.right, data);
        } else {
            if (node.left === null) return node.right;
            if (node.right === null) return node.left;
            node.data = this._minValue(node.right);
            node.right = this._deleteRec(node.right, node.data);
        }
        return node;
    }

    _minValue(node) {
        let minv = node.data;
        while (node.left !== null) {
            minv = node.left.data;
            node = node.left;
        }
        return minv;
    }

    inorder(callback) {
        this._inorderRec(this.root, callback);
    }

    _inorderRec(node, callback) {
        if (node !== null) {
            this._inorderRec(node.left, callback);
            callback(node);
            this._inorderRec(node.right, callback);
        }
    }

    preorder(callback) {
        this._preorderRec(this.root, callback);
    }

    _preorderRec(node, callback) {
        if (node !== null) {
            callback(node);
            this._preorderRec(node.left, callback);
            this._preorderRec(node.right, callback);
        }
    }

    postorder(callback) {
        this._postorderRec(this.root, callback);
    }

    _postorderRec(node, callback) {
        if (node !== null) {
            this._postorderRec(node.left, callback);
            this._postorderRec(node.right, callback);
            callback(node);
        }
    }
}

class TreeVisualizer {
    static init(visualizationArea, operationsDiv, timeComplexityP, spaceComplexityP, animationSpeed) {
        this.tree = new BST();
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
            <h3>Binary Search Tree Operations</h3>
            <input type="number" id="tree-value" placeholder="Enter number">
            <button id="insert-btn" class="tooltip">Insert
                <span class="tooltiptext">O(h) where h is height</span>
            </button>
            <button id="delete-btn" class="tooltip">Delete
                <span class="tooltiptext">O(h) where h is height</span>
            </button>
            <h4>Traversals</h4>
            <button id="inorder-btn" class="tooltip">Inorder
                <span class="tooltiptext">O(n)</span>
            </button>
            <button id="preorder-btn" class="tooltip">Preorder
                <span class="tooltiptext">O(n)</span>
            </button>
            <button id="postorder-btn" class="tooltip">Postorder
                <span class="tooltiptext">O(n)</span>
            </button>
            <p id="traversal-result"></p>
        `;

        document.getElementById('insert-btn').addEventListener('click', () => this.insert());
        document.getElementById('delete-btn').addEventListener('click', () => this.delete());
        document.getElementById('inorder-btn').addEventListener('click', () => this.traverse('inorder'));
        document.getElementById('preorder-btn').addEventListener('click', () => this.traverse('preorder'));
        document.getElementById('postorder-btn').addEventListener('click', () => this.traverse('postorder'));
    }

    static async insert() {
        const value = parseInt(document.getElementById('tree-value').value);
        if (isNaN(value)) return;
        this.tree.insert(value);
        await this.updateVisualization();
        this.updateComplexity();
        document.getElementById('tree-value').value = '';
    }

    static async delete() {
        const value = parseInt(document.getElementById('tree-value').value);
        if (isNaN(value)) return;
        this.tree.delete(value);
        await this.updateVisualization();
        this.updateComplexity();
        document.getElementById('tree-value').value = '';
    }

    static async traverse(type) {
        const result = [];
        const callback = (node) => result.push(node.data);
        this.tree[type](callback);
        document.getElementById('traversal-result').textContent = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${result.join(' ')}`;
        await this.animateTraversal(type);
    }

    static async animateTraversal(type) {
        const nodes = this.visualizationArea.querySelectorAll('.tree-node');
        const order = this.getTraversalOrder(type);

        for (let data of order) {
            const node = Array.from(nodes).find(n => n.textContent == data);
            if (node) {
                await Animations.highlightElement(node, this.animationSpeed);
            }
        }
    }

    static getTraversalOrder(type) {
        const result = [];
        const callback = (node) => result.push(node.data);
        this.tree[type](callback);
        return result;
    }

    static async updateVisualization() {
        this.visualizationArea.innerHTML = '<div class="tree"></div>';
        const treeDiv = this.visualizationArea.querySelector('.tree');

        if (this.tree.root) {
            this.drawTree(treeDiv, this.tree.root, 400, 50, 200);
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
        this.timeComplexityP.textContent = 'Time Complexity: O(h) for insert/delete, O(n) for traversals';
        this.spaceComplexityP.textContent = 'Space Complexity: O(n)';
    }
}
// stack.js - Stack visualizer and operations

class Stack {
    constructor() {
        this.items = [];
    }

    push(element) {
        this.items.push(element);
    }

    pop() {
        if (this.isEmpty()) return null;
        return this.items.pop();
    }

    peek() {
        if (this.isEmpty()) return null;
        return this.items[this.items.length - 1];
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

class StackVisualizer {
    static init(visualizationArea, operationsDiv, timeComplexityP, spaceComplexityP, animationSpeed) {
        this.stack = new Stack();
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
            <h3>Stack Operations</h3>
            <input type="text" id="stack-input" placeholder="Enter value">
            <button id="push-btn" class="tooltip">Push
                <span class="tooltiptext">Add element to top of stack - O(1)</span>
            </button>
            <button id="pop-btn" class="tooltip">Pop
                <span class="tooltiptext">Remove element from top of stack - O(1)</span>
            </button>
            <button id="peek-btn" class="tooltip">Peek
                <span class="tooltiptext">View top element without removing - O(1)</span>
            </button>
            <h4>Infix to Postfix/Prefix</h4>
            <input type="text" id="infix-input" placeholder="Enter infix expression (e.g., A+B*C)">
            <button id="to-postfix-btn">Convert to Postfix</button>
            <button id="to-prefix-btn">Convert to Prefix</button>
            <p id="conversion-result"></p>
        `;

        document.getElementById('push-btn').addEventListener('click', () => this.push());
        document.getElementById('pop-btn').addEventListener('click', () => this.pop());
        document.getElementById('peek-btn').addEventListener('click', () => this.peek());
        document.getElementById('to-postfix-btn').addEventListener('click', () => this.convertToPostfix());
        document.getElementById('to-prefix-btn').addEventListener('click', () => this.convertToPrefix());
    }

    static async push() {
        const input = document.getElementById('stack-input');
        const value = input.value.trim();
        if (value === '') return;

        this.stack.push(value);
        await this.updateVisualization();
        this.updateComplexity();
        input.value = '';
    }

    static async pop() {
        if (this.stack.isEmpty()) {
            alert('Stack is empty!');
            return;
        }

        const poppedElement = this.stack.pop();
        await this.updateVisualization();
        this.updateComplexity();
        alert(`Popped: ${poppedElement}`);
    }

    static peek() {
        const top = this.stack.peek();
        if (top === null) {
            alert('Stack is empty!');
        } else {
            alert(`Top element: ${top}`);
        }
        this.updateComplexity();
    }

    static async updateVisualization() {
        this.visualizationArea.innerHTML = '<div class="stack"></div>';
        const stackDiv = this.visualizationArea.querySelector('.stack');

        // DEBUG: Expose data globally for AR
        window.dsaData = this.stack.items;
        console.log("Stack updated, exposed to window.dsaData:", window.dsaData);

        for (let i = 0; i < this.stack.items.length; i++) {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'stack-item';
            itemDiv.textContent = this.stack.items[i];
            stackDiv.appendChild(itemDiv);
            await Animations.animateStackPush(itemDiv, this.animationSpeed);
        }
    }

    static updateComplexity() {
        this.timeComplexityP.textContent = 'Time Complexity: O(1) for Push, Pop, Peek';
        this.spaceComplexityP.textContent = 'Space Complexity: O(n)';
    }

    static convertToPostfix() {
        const infix = document.getElementById('infix-input').value.trim();
        if (infix === '') return;

        const postfix = this.infixToPostfix(infix);
        document.getElementById('conversion-result').textContent = `Postfix: ${postfix}`;
        this.animateConversion(infix, postfix, 'postfix');
    }

    static convertToPrefix() {
        const infix = document.getElementById('infix-input').value.trim();
        if (infix === '') return;

        const prefix = this.infixToPrefix(infix);
        document.getElementById('conversion-result').textContent = `Prefix: ${prefix}`;
        this.animateConversion(infix, prefix, 'prefix');
    }

    static infixToPostfix(infix) {
        const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3 };
        const stack = [];
        let postfix = '';

        for (let char of infix) {
            if (char.match(/[a-zA-Z0-9]/)) {
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

    static infixToPrefix(infix) {
        // Reverse the infix expression
        let reversed = infix.split('').reverse().join('');
        // Replace ( with ) and vice versa
        reversed = reversed.replace(/\(/g, '#').replace(/\)/g, '(').replace(/#/g, ')');
        // Get postfix of reversed expression
        const postfix = this.infixToPostfix(reversed);
        // Reverse the postfix to get prefix
        return postfix.split('').reverse().join('');
    }

    static async animateConversion(infix, result, type) {
        // Simple animation showing the conversion process
        // For brevity, just highlight the result
        const resultP = document.getElementById('conversion-result');
        await Animations.highlightElement(resultP, this.animationSpeed);
    }
}
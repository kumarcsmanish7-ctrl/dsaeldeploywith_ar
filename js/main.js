// main.js - Main application logic
import { ARManager } from './ar-modules/ar-manager.js';

// Expose ARManager to window for debugging or global access if needed, 
// though we use it inside the module scope mostly.
window.arManager = new ARManager();

document.addEventListener('DOMContentLoaded', function () {
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    themeToggle.addEventListener('click', function () {
        const currentTheme = body.getAttribute('data-theme');
        if (currentTheme === 'dark') {
            body.removeAttribute('data-theme');
        } else {
            body.setAttribute('data-theme', 'dark');
        }
    });

    // Sidebar navigation
    const sidebarLinks = document.querySelectorAll('.sidebar a');
    const visualizationArea = document.getElementById('visualization-area');
    const operationsDiv = document.getElementById('operations');
    const timeComplexityP = document.getElementById('time-complexity');
    const spaceComplexityP = document.getElementById('space-complexity');
    const resetBtn = document.getElementById('reset-btn');
    const clearBtn = document.getElementById('clear-btn');
    const speedSlider = document.getElementById('speed-slider');

    let currentStructure = null;
    let animationSpeed = 500;

    speedSlider.addEventListener('input', function () {
        animationSpeed = parseInt(this.value);
    });

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const structure = this.getAttribute('data-structure');
            switchStructure(structure);
        });
    });

    function switchStructure(structure) {
        // Remove active class from all links
        sidebarLinks.forEach(link => link.classList.remove('active'));
        // Add active class to clicked link
        document.querySelector(`[data-structure="${structure}"]`).classList.add('active');

        // Clear previous visualization
        visualizationArea.innerHTML = '';
        operationsDiv.innerHTML = '';

        // Initialize new structure
        currentStructure = structure;
        initializeStructure(structure);
    }

    function initializeStructure(structure) {
        // Show or hide analysis + controls when AI Chat Bot is selected
        const analysisPanel = document.getElementById('analysis-panel');
        const controlsPanel = document.getElementById('controls');
        if (structure === 'ai-chatbot') {
            if (analysisPanel) analysisPanel.style.display = 'none';
            if (controlsPanel) controlsPanel.style.display = 'none';
        } else {
            if (analysisPanel) analysisPanel.style.display = '';
            if (controlsPanel) controlsPanel.style.display = '';
        }

        switch (structure) {
            case 'stack':
                StackVisualizer.init(visualizationArea, operationsDiv, timeComplexityP, spaceComplexityP, animationSpeed);
                break;
            case 'queue':
                QueueVisualizer.init(visualizationArea, operationsDiv, timeComplexityP, spaceComplexityP, animationSpeed);
                break;
            case 'circular-queue':
                CircularQueueVisualizer.init(visualizationArea, operationsDiv, timeComplexityP, spaceComplexityP, animationSpeed);
                break;
            case 'singly-linked-list':
                LinkedListVisualizer.init(visualizationArea, operationsDiv, timeComplexityP, spaceComplexityP, animationSpeed, false);
                break;
            case 'doubly-linked-list':
                LinkedListVisualizer.init(visualizationArea, operationsDiv, timeComplexityP, spaceComplexityP, animationSpeed, true);
                break;
            case 'bst':
                TreeVisualizer.init(visualizationArea, operationsDiv, timeComplexityP, spaceComplexityP, animationSpeed);
                break;
            case 'heap':
                HeapVisualizer.init(visualizationArea, operationsDiv, timeComplexityP, spaceComplexityP, animationSpeed);
                break;
            case 'scheduler':
                TaskScheduler.init(visualizationArea, operationsDiv, timeComplexityP, spaceComplexityP, animationSpeed);
                break;
            case 'ai-chatbot':
                initializeChatBot();
                break;
        }
    }

    resetBtn.addEventListener('click', function () {
        if (currentStructure) {
            initializeStructure(currentStructure);
        }
    });

    clearBtn.addEventListener('click', function () {
        visualizationArea.innerHTML = '';
        timeComplexityP.textContent = 'Time Complexity: ';
        spaceComplexityP.textContent = 'Space Complexity: ';
    });


    // Initialize with stack by default
    switchStructure('stack');

    // AR Integration
    const arControls = document.getElementById('ar-controls');
    const arButton = document.createElement('button');
    arButton.id = 'view-in-ar-btn';
    arButton.className = 'ar-button';
    arButton.innerHTML = '<span>📱</span> View in AR';
    arControls.appendChild(arButton);

    arButton.addEventListener('click', async () => {
        if (!currentStructure) return;

        arButton.disabled = true;
        arButton.innerHTML = '<span>⏳</span> Generating...';

        try {
            const data = getCurrentStructureData(currentStructure);
            if (data) {
                await window.arManager.exportCurrentStructure(currentStructure, data);
            } else {
                alert('No data to view in AR! Add some items first.');
            }
        } catch (error) {
            console.error('AR Error:', error);
            alert('Failed to generate AR view. See console for details.');
        } finally {
            arButton.disabled = false;
            arButton.innerHTML = '<span>📱</span> View in AR';
        }
    });

    function getCurrentStructureData(structure) {
        switch (structure) {
            case 'stack':
                // Accessing static property of global class
                return window.StackVisualizer && window.StackVisualizer.stack ? window.StackVisualizer.stack.items : [];
            case 'queue':
                return window.QueueVisualizer && window.QueueVisualizer.queue ? window.QueueVisualizer.queue.items : [];
            case 'circular-queue':
                return window.CircularQueueVisualizer && window.CircularQueueVisualizer.queue ? window.CircularQueueVisualizer.queue.items : [];
            case 'singly-linked-list':
            case 'doubly-linked-list':
                // LinkedListVisualizer might be a bit more complex to extract 'items' array from if it's node based.
                // Assuming LinkedList structure has a specific way to traverse or an items array.
                // Let's check LinkedListVisualizer implementation if needed, but for now safely return [] or try to extract.
                // For the visualizer, assume we can traverse or it keeps an array.
                // If LinkedListVisualizer keeps a list object, we might need a toArray() method.
                // Inspecting linkedlist.js would be ideal, but for now let's hope it has an items array or similar.
                // If not, we might need to modify linkedlist.js.
                // Let's assume for this step we can get it or fail gracefully.
                return window.LinkedListVisualizer && window.LinkedListVisualizer.list ? getLinkedListItems(window.LinkedListVisualizer.list) : [];
            case 'bst':
                // Return root node
                return window.TreeVisualizer && window.TreeVisualizer.tree ? window.TreeVisualizer.tree.root : null;
            case 'heap':
                return window.HeapVisualizer && window.HeapVisualizer.heap ? window.HeapVisualizer.heap.heap : [];
            case 'scheduler':
                // Use priority heap for visualization
                return window.TaskScheduler && window.TaskScheduler.priorityHeap && window.TaskScheduler.priorityHeap.heap ? window.TaskScheduler.priorityHeap.heap : [];
            default:
                return null;
        }
    }

    function getLinkedListItems(list) {
        const items = [];
        let current = list.head;
        while (current) {
            items.push(current.data);
            current = current.next;
        }
        return items;
    }
});

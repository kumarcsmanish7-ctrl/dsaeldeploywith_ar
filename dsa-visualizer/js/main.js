// main.js - Main application logic

document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    themeToggle.addEventListener('click', function() {
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

    speedSlider.addEventListener('input', function() {
        animationSpeed = parseInt(this.value);
    });

    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
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

    resetBtn.addEventListener('click', function() {
        if (currentStructure) {
            initializeStructure(currentStructure);
        }
    });

    clearBtn.addEventListener('click', function() {
        visualizationArea.innerHTML = '';
        timeComplexityP.textContent = 'Time Complexity: ';
        spaceComplexityP.textContent = 'Space Complexity: ';
    });

    // Initialize with stack by default
    switchStructure('stack');
});
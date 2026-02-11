// =============================================
// AI Chat Bot - Google Gemini API Integration
// =============================================

// ⚠️ IMPORTANT: PASTE YOUR GOOGLE API KEY BELOW ⚠️
const GEMINI_API_KEY = "AIzaSyCv7ukBTRMxxPms2DY4roP1hXzepn8fjPY";
const GEMINI_MODEL = "gemini-3-flash-preview";
const getGeminiApiUrl = () => `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

class AIChatBot {
    constructor() {
        this.messages = [];
        this.isLoading = false;
        this.init();
    }

    init() {
        this.createChatInterface();
        this.attachEventListeners();
    }

    createChatInterface() {
        // Create chat container
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chatbot-container';
        chatContainer.innerHTML = `
            <div id="chat-header">
                <h2>🤖 AI Chat Bot</h2>
                <p class="subtitle">Ask questions about Data Structures & Algorithms</p>
            </div>
            <div id="chat-messages"></div>
            <div id="chat-input-area">
                <textarea 
                    id="chat-input" 
                    placeholder="Ask me anything about DSA..." 
                    rows="3"
                ></textarea>
                <button id="send-btn">Send 📤</button>
            </div>
        `;

        document.getElementById('visualization-area').innerHTML = '';
        document.getElementById('visualization-area').appendChild(chatContainer);
    }

    attachEventListeners() {
        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');

        sendBtn.addEventListener('click', () => this.sendMessage());
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        if (GEMINI_API_KEY === "YOUR_GOOGLE_API_KEY_HERE") {
            alert("❌ Please set your Google API key first!\n\nSteps:\n1. Get API key from: https://aistudio.google.com/app/apikey\n2. Open chatbot.js\n3. Replace 'YOUR_GOOGLE_API_KEY_HERE' on line 6 with your key");
            return;
        }

        const chatInput = document.getElementById('chat-input');
        const userMessage = chatInput.value.trim();

        if (!userMessage) return;

        // Add user message to UI
        this.addMessageToChat('user', userMessage);
        chatInput.value = '';

        // Show loading indicator
        this.isLoading = true;
        this.addMessageToChat('bot', 'Thinking...', true);

        try {
            const response = await fetch(getGeminiApiUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: userMessage }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.9,
                        topK: 40,
                    }
                }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const botMessage = data.candidates[0].content.parts[0].text;

            // Remove loading message
            this.removeLastMessage();

            // Add bot response
            this.addMessageToChat('bot', botMessage);
        } catch (error) {
            console.error('Error:', error);
            this.removeLastMessage();
            this.addMessageToChat('bot', `❌ Error: ${error.message}\n\nMake sure you have a valid API key set!`);
        }

        this.isLoading = false;
    }

    addMessageToChat(sender, message, isLoading = false) {
        const messagesContainer = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        if (isLoading) messageDiv.classList.add('loading');

        const icon = sender === 'user' ? '👤' : '🤖';
        messageDiv.innerHTML = `
            <div class="message-content">
                <span class="message-icon">${icon}</span>
                <span class="message-text">${this.escapeHtml(message)}</span>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    removeLastMessage() {
        const messagesContainer = document.getElementById('chat-messages');
        const lastMessage = messagesContainer.lastChild;
        if (lastMessage) {
            lastMessage.remove();
        }
    }

    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
}

// Initialize chatbot when main.js calls it
let chatbot = null;

function initializeChatBot() {
    chatbot = new AIChatBot();
}

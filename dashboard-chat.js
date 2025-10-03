// Interactive Conversational Symptom Gathering with Gemini 2.5 Flash
// Natural conversation powered by Google's Gemini AI

const conversationState = {
    messages: [],
    conversationHistory: [], // For Gemini context
    userSymptoms: {},
    conversationPhase: 'active',
    geminiApiKey: '', // User needs to add their API key
    apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'
};

// System prompt for Gemini to act as a medical assistant
const SYSTEM_PROMPT = `You are CureMind AI, a compassionate and intelligent medical assistant. Your role is to:

1. Have a natural, empathetic conversation with the patient
2. Ask relevant follow-up questions about their symptoms to gather comprehensive information
3. Ask about: location, severity (1-10), duration, triggers, associated symptoms, what makes it better/worse
4. Be concise but thorough - keep responses to 2-3 sentences
5. After gathering sufficient information (4-5 exchanges), tell the user: "Thank you for sharing all these details. I now have enough information to provide you with an analysis. Please click the 'Get Final Analysis' button below."
6. Be warm, professional, and reassuring
7. Never provide a diagnosis - only gather information

Remember: You're gathering information for analysis, not diagnosing. Keep the conversation natural and doctor-like.`;

// Initialize chat system
function initializeChatSystem() {
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const getDiagnosisBtn = document.getElementById('getDiagnosisBtn');
    
    // Check for API key
    checkApiKey();
    
    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);
    
    // Send message on Enter key
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea
    chatInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Clear chat
    clearChatBtn.addEventListener('click', resetChat);
    
    // Get final diagnosis
    getDiagnosisBtn.addEventListener('click', getFinalAnalysis);
}

// Check if API key is configured
function checkApiKey() {
    // Try to load from localStorage
    const storedKey = localStorage.getItem('geminiApiKey');
    if (storedKey) {
        conversationState.geminiApiKey = storedKey;
    } else {
        // Prompt user for API key
        setTimeout(() => {
            showApiKeyPrompt();
        }, 1000);
    }
}

// Show API key configuration prompt
function showApiKeyPrompt() {
    const apiKeyModal = document.createElement('div');
    apiKeyModal.className = 'modal active';
    apiKeyModal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <i class="fas fa-key"></i>
                <h2>Configure Gemini API Key</h2>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 1rem; color: #cbd5e1;">To use the AI chat feature, please enter your Google Gemini API key:</p>
                <input type="text" id="apiKeyInput" placeholder="Enter your Gemini API key" 
                    style="width: 100%; padding: 1rem; background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.2); 
                    border-radius: 8px; color: white; margin-bottom: 1rem;">
                <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 1rem;">
                    Get your free API key from: 
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" 
                        style="color: #8b5cf6; text-decoration: underline;">Google AI Studio</a>
                </p>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button onclick="skipApiKey()" style="padding: 0.8rem 1.5rem; background: rgba(255,255,255,0.1); 
                        border: 2px solid rgba(255,255,255,0.2); border-radius: 8px; color: white; cursor: pointer;">
                        Use Demo Mode
                    </button>
                    <button onclick="saveApiKey()" style="padding: 0.8rem 1.5rem; 
                        background: linear-gradient(135deg, #8b5cf6, #ec4899); border: none; 
                        border-radius: 8px; color: white; cursor: pointer; font-weight: 600;">
                        Save & Continue
                    </button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(apiKeyModal);
}

// Save API key
window.saveApiKey = function() {
    const apiKey = document.getElementById('apiKeyInput').value.trim();
    if (apiKey) {
        conversationState.geminiApiKey = apiKey;
        localStorage.setItem('geminiApiKey', apiKey);
        document.querySelector('.modal.active').remove();
        showNotification('API key saved successfully! You can now use the AI chat.', 'success');
    } else {
        showNotification('Please enter a valid API key', 'error');
    }
};

// Skip API key (demo mode)
window.skipApiKey = function() {
    conversationState.geminiApiKey = 'demo';
    document.querySelector('.modal.active').remove();
    showNotification('Running in demo mode with simulated responses', 'info');
};

// Send user message
async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Store message in conversation state
    conversationState.messages.push({
        role: 'user',
        content: message
    });
    
    conversationState.conversationHistory.push({
        role: 'user',
        parts: [{ text: message }]
    });
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Disable send button temporarily
    document.getElementById('sendBtn').disabled = true;
    
    // Show typing indicator
    showTypingIndicator();
    
    // Get AI response from Gemini
    try {
        const aiResponse = await getGeminiResponse(message);
        hideTypingIndicator();
        
        // Add AI response to chat
        addMessageToChat('ai', aiResponse);
        
        // Store AI message
        conversationState.messages.push({
            role: 'ai',
            content: aiResponse
        });
        
        conversationState.conversationHistory.push({
            role: 'model',
            parts: [{ text: aiResponse }]
        });
        
        // Check if AI is ready for analysis
        if (aiResponse.toLowerCase().includes('get final analysis') || 
            aiResponse.toLowerCase().includes('click') && aiResponse.toLowerCase().includes('button')) {
            document.getElementById('getDiagnosisBtn').style.display = 'flex';
        }
        
    } catch (error) {
        hideTypingIndicator();
        console.error('Error getting AI response:', error);
        
        // Fallback to demo mode
        const fallbackResponse = generateDemoResponse(message);
        addMessageToChat('ai', fallbackResponse);
        
        conversationState.messages.push({
            role: 'ai',
            content: fallbackResponse
        });
    }
    
    document.getElementById('sendBtn').disabled = false;
}

// Get response from Gemini 2.0 Flash API
async function getGeminiResponse(userMessage) {
    // Check if using demo mode
    if (conversationState.geminiApiKey === 'demo' || !conversationState.geminiApiKey) {
        return generateDemoResponse(userMessage);
    }
    
    try {
        // Prepare conversation history for context
        const contents = [];
        
        // Add system instruction as first message
        contents.push({
            role: 'user',
            parts: [{ text: SYSTEM_PROMPT }]
        });
        
        contents.push({
            role: 'model',
            parts: [{ text: "I understand. I'm CureMind AI, and I'm here to help gather information about your symptoms through a natural conversation. I'll ask relevant follow-up questions and be concise. How can I help you today?" }]
        });
        
        // Add conversation history
        conversationState.conversationHistory.forEach(msg => {
            contents.push(msg);
        });
        
        // API endpoint for Gemini 2.0 Flash
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${conversationState.geminiApiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: contents,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 200,
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_HATE_SPEECH",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    },
                    {
                        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Gemini API Error:', errorData);
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates.length > 0) {
            const aiText = data.candidates[0].content.parts[0].text;
            return aiText;
        } else {
            throw new Error('No response from Gemini');
        }
        
    } catch (error) {
        console.error('Gemini API call failed:', error);
        // Show error notification
        showNotification('API error. Falling back to demo mode. Check your API key in console.', 'warning');
        // Fallback to demo mode
        throw error;
    }
}

// Demo response generator (fallback)
function generateDemoResponse(userMessage) {
    const messageCount = conversationState.messages.filter(m => m.role === 'user').length;
    
    // Simple keyword-based responses for demo
    const lowerMessage = userMessage.toLowerCase();
    
    if (messageCount === 1) {
        if (lowerMessage.includes('headache') || lowerMessage.includes('head')) {
            return "I'm sorry to hear about your headache. Can you tell me where exactly you feel the pain? Is it on one side, both sides, or all over your head?";
        } else if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
            return "I understand you have a fever. Have you measured your temperature? If yes, what was the reading?";
        } else if (lowerMessage.includes('cough')) {
            return "Tell me more about your cough. Is it a dry cough or are you bringing up phlegm?";
        } else if (lowerMessage.includes('stomach') || lowerMessage.includes('pain')) {
            return "I see you're experiencing discomfort. Can you describe the pain? Is it sharp, dull, cramping, or burning?";
        } else {
            return "Thank you for sharing that. Can you tell me when these symptoms first started?";
        }
    } else if (messageCount === 2) {
        return "I see. On a scale of 1-10, how would you rate the severity of your symptoms?";
    } else if (messageCount === 3) {
        return "Have you taken any medications or tried any remedies for this? If so, did they help?";
    } else if (messageCount >= 4) {
        return "Thank you for sharing all these details. I now have enough information to provide you with an analysis. Please click the 'Get Final Analysis' button below to see my recommendations.";
    }
    
    return "Thank you for that information. Can you tell me more about any other symptoms you're experiencing?";
}

// Add message to chat interface
function addMessageToChat(role, content) {
    const chatMessages = document.getElementById('chatMessages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `${role}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.innerHTML = role === 'ai' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Parse content with line breaks
    const paragraphs = content.split('\n').filter(p => p.trim());
    paragraphs.forEach(paragraph => {
        const p = document.createElement('p');
        p.textContent = paragraph;
        messageContent.appendChild(p);
    });
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(messageContent);
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    
    const typingDiv = document.createElement('div');
    typingDiv.className = 'ai-message typing-message';
    typingDiv.id = 'typingIndicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// Reset chat conversation
function resetChat() {
    // Clear messages
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
        <div class="ai-message">
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <p>Hello! I'm your AI Health Assistant. 👋</p>
                <p>To help you better, please describe your main concern. For example: "I have a bad headache" or "I'm feeling nauseous"</p>
            </div>
        </div>
    `;
    
    // Reset state
    conversationState.messages = [];
    conversationState.conversationHistory = [];
    conversationState.userSymptoms = {};
    conversationState.conversationPhase = 'active';
    
    // Hide diagnosis button
    document.getElementById('getDiagnosisBtn').style.display = 'none';
    
    // Hide results section
    document.getElementById('resultsSection').style.display = 'none';
    
    // Clear input
    document.getElementById('chatInput').value = '';
}

// Get final analysis based on conversation
function getFinalAnalysis() {
    // Show loading
    document.getElementById('loadingOverlay').classList.add('active');
    
    // Combine all conversation messages into a comprehensive description
    let comprehensiveSymptoms = '';
    conversationState.messages.forEach(msg => {
        if (msg.role === 'user') {
            comprehensiveSymptoms += msg.content + '. ';
        }
    });
    
    // Simulate AI analysis (2-3 seconds)
    setTimeout(() => {
        const analysis = performAIAnalysis(comprehensiveSymptoms);
        displayResults(analysis);
        document.getElementById('loadingOverlay').classList.remove('active');
        
        // Get main complaint
        const mainComplaint = conversationState.messages.find(m => m.role === 'user')?.content || 'Health consultation';
        
        // Save to history
        saveToHistory(mainComplaint, analysis);
        
        // Scroll to results
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
        
        // Add confirmation message to chat
        addMessageToChat('ai', '✅ Your analysis is ready! Please review the results below for your personalized health recommendations.');
    }, 2500);
}

// Initialize chat system when document loads
document.addEventListener('DOMContentLoaded', function() {
    // Check session first
    if (!checkSession()) {
        return;
    }
    
    initializeDashboard();
    setupEventListeners();
    initializeChatSystem(); // Initialize chat system
});

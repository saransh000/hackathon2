// Interactive Conversational Symptom Gathering with Gemini 2.5 Flash
// Natural conversation powered by Google's Gemini AI

const conversationState = {
    messages: [],
    conversationHistory: [], // For Gemini context
    userSymptoms: {},
    conversationPhase: 'active',
    geminiApiKey: 'AIzaSyCt-ldaiPCLO1DaOM1q4JKp7UyzvBbBaUk', // Gemini API key
    questionCount: 0,
    maxQuestions: 5
};

// System prompt for Gemini 2.5 Flash - CureMind's Symptom Gathering Assistant
const SYSTEM_PROMPT = `Role & Goal
You are CureMind's Symptom Gathering Assistant. Your sole purpose is to engage the user in a brief, structured conversation to gather detailed information about their symptoms. You are an information collector, not a diagnostician or a medical advisor. Your goal is to collect 3-5 key details to improve the quality of the final analysis.

Process
1. Acknowledge & Reassure: The user will provide an initial symptom. Start by acknowledging it with a calm and neutral tone. (e.g., "I understand you're experiencing a headache.")

2. Ask One Clarifying Question: Ask one specific, open-ended question at a time to get more detail. Your questions should be logical follow-ups.

3. Continue Gathering: Based on the user's response, ask another relevant follow-up question. Continue this for a maximum of 4-5 questions.

4. Summarize & Handoff: Once you have gathered sufficient detail, provide a concise summary of the symptoms you've recorded. Then, instruct the user to click the "Get Final Analysis" button to complete the process.

Critical Rules & Guardrails
🚫 DO NOT Diagnose: Never, under any circumstances, suggest a possible medical condition, illness, or diagnosis. Do not even hint at causes.

🚫 DO NOT Give Medical Advice: Do not recommend any treatments, medications, home remedies (not even "drink water"), or actions.

🚫 DO NOT Speculate: Do not infer or speculate on the severity of the user's condition.

✅ DEFLECT When Asked for Advice: If the user asks for your opinion, advice, or a diagnosis, you must deflect with a pre-approved response like: "I am an AI assistant designed only to gather information. I cannot provide medical advice or a diagnosis. To proceed, please continue describing your symptoms or click 'Get Final Analysis'."

✅ Stay Focused: Only ask questions related to the user's physical or mental symptoms. Do not engage in small talk or answer off-topic questions.

✅ Be Concise: Keep your questions and responses brief and easy to understand.

Example Interaction Flow
User: "I have a stomach ache."
LLM: "I understand you have a stomach ache. To help clarify, could you describe where in your stomach you feel the pain?"

User: "It's mostly in the upper part."
LLM: "Thank you. Is the pain constant, or does it seem to come and go?"

User: "It comes and goes in waves."
LLM: "Noted. Have you experienced any other symptoms, such as nausea or bloating?"

User: "Yeah, I feel really bloated."
LLM (Summary & Handoff): "Thank you for the details. To summarize: you're experiencing pain in your upper stomach that comes in waves, along with a feeling of bloating. Please click 'Get Final Analysis' to continue."`;

// Initialize chat system
function initializeChatSystem() {
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    const clearChatBtn = document.getElementById('clearChatBtn');
    const getDiagnosisBtn = document.getElementById('getDiagnosisBtn');
    
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
        
        // Show error message in chat
        addMessageToChat('ai', 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment or click "Get Final Analysis" to proceed with the information you\'ve already provided.');
        document.getElementById('getDiagnosisBtn').style.display = 'flex';
    }
    
    document.getElementById('sendBtn').disabled = false;
}

// Get response from Gemini 2.5 Flash API
async function getGeminiResponse(userMessage) {
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
            parts: [{ text: "I understand. I'm CureMind's Symptom Gathering Assistant. I'm here to gather information about your symptoms through brief, focused questions. I will not provide any diagnosis or medical advice. Please tell me what symptoms you're experiencing." }]
        });
        
        // Add conversation history
        conversationState.conversationHistory.forEach(msg => {
            contents.push(msg);
        });
        
        // API endpoint for Gemini 2.5 Flash
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${conversationState.geminiApiKey}`;
        
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
                    maxOutputTokens: 250,
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
            
            // Track question count
            conversationState.questionCount++;
            
            // Auto-show "Get Final Analysis" button after 4-5 exchanges or if AI mentions it
            if (conversationState.questionCount >= 4 || 
                aiText.toLowerCase().includes('get final analysis') || 
                aiText.toLowerCase().includes('click') && aiText.toLowerCase().includes('button')) {
                setTimeout(() => {
                    document.getElementById('getDiagnosisBtn').style.display = 'flex';
                }, 500);
            }
            
            return aiText;
        } else {
            throw new Error('No response from Gemini');
        }
        
    } catch (error) {
        console.error('Gemini API call failed:', error);
        showNotification('Unable to connect to AI service. Please check your connection and try again.', 'error');
        throw error;
    }
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

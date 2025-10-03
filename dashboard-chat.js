// Interactive Conversational Symptom Gathering
// This creates a doctor-like conversational experience

const conversationState = {
    messages: [],
    userSymptoms: {},
    conversationPhase: 'initial', // initial, gathering, complete
    questionCount: 0,
    maxQuestions: 5
};

// AI Conversation Logic
const symptomQuestions = {
    headache: [
        "I'm sorry to hear about your headache. Can you tell me where exactly do you feel the pain? (e.g., all over, one side, behind eyes, back of head)",
        "Is it a sharp pain or a dull ache?",
        "Have you experienced any other symptoms along with the headache? (e.g., nausea, sensitivity to light, vision changes)"
    ],
    fever: [
        "I understand you have a fever. Have you measured your temperature? If yes, what was it?",
        "How long have you had this fever?",
        "Are you experiencing any other symptoms like chills, sweating, or body aches?"
    ],
    cough: [
        "Tell me more about your cough. Is it a dry cough or are you bringing up phlegm?",
        "How long have you been coughing?",
        "Do you have any chest pain or difficulty breathing when you cough?"
    ],
    stomach: [
        "I see you're having stomach issues. Can you describe the discomfort? (e.g., pain, cramping, burning)",
        "Where exactly in your abdomen do you feel this?",
        "Have you experienced any nausea, vomiting, or changes in bowel movements?"
    ],
    pain: [
        "Help me understand your pain better. On a scale of 1-10, how would you rate it?",
        "Is the pain constant or does it come and go?",
        "Does anything make it better or worse?"
    ],
    general: [
        "Thank you for sharing that. Can you tell me when these symptoms started?",
        "Have you taken any medications or tried any remedies for this?",
        "Is there anything else you'd like me to know about how you're feeling?"
    ]
};

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
function sendMessage() {
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
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = 'auto';
    
    // Disable send button temporarily
    document.getElementById('sendBtn').disabled = true;
    
    // Show typing indicator
    showTypingIndicator();
    
    // Generate AI response after a delay
    setTimeout(() => {
        generateAIResponse(message);
        hideTypingIndicator();
        document.getElementById('sendBtn').disabled = false;
    }, 1500 + Math.random() * 1000); // 1.5-2.5 seconds
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

// Generate AI response based on user input
function generateAIResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    conversationState.questionCount++;
    
    let response = '';
    let category = detectSymptomCategory(lowerMessage);
    
    // First interaction - gather initial symptoms
    if (conversationState.conversationPhase === 'initial') {
        conversationState.conversationPhase = 'gathering';
        conversationState.userSymptoms.mainComplaint = userMessage;
        
        // Get first follow-up question based on detected symptoms
        if (category && symptomQuestions[category]) {
            response = symptomQuestions[category][0];
        } else {
            response = symptomQuestions.general[0];
        }
    }
    // Continue gathering information
    else if (conversationState.conversationPhase === 'gathering') {
        // Store the answer
        conversationState.userSymptoms[`detail_${conversationState.questionCount}`] = userMessage;
        
        // Decide what to ask next
        if (conversationState.questionCount < 3) {
            // Ask follow-up questions
            response = getNextQuestion(category, conversationState.questionCount);
        } else if (conversationState.questionCount === 3) {
            // Ask about duration
            response = "Thank you for providing those details. How long have you been experiencing these symptoms?";
        } else if (conversationState.questionCount === 4) {
            // Ask about medications
            response = "Have you taken any medications or tried any home remedies for these symptoms?";
        } else {
            // Final question - wrap up
            response = "Is there anything else you'd like me to know about your condition? For example, any recent travel, exposure to illness, or changes in your routine?";
            conversationState.conversationPhase = 'complete';
        }
    }
    // Conversation complete
    else if (conversationState.conversationPhase === 'complete') {
        conversationState.userSymptoms[`additional_${conversationState.questionCount}`] = userMessage;
        response = "Thank you for providing all this information. I now have a comprehensive understanding of your symptoms. Click the 'Get Final Analysis' button below to receive your personalized health assessment and recommendations.";
        
        // Show the diagnosis button
        document.getElementById('getDiagnosisBtn').style.display = 'flex';
    }
    
    // Add AI response to chat
    addMessageToChat('ai', response);
    
    // Store AI message
    conversationState.messages.push({
        role: 'ai',
        content: response
    });
}

// Detect symptom category from user message
function detectSymptomCategory(message) {
    const categories = {
        headache: ['headache', 'head pain', 'migraine', 'head ache', 'head hurt'],
        fever: ['fever', 'temperature', 'hot', 'chills', 'sweating'],
        cough: ['cough', 'coughing', 'throat', 'phlegm'],
        stomach: ['stomach', 'abdomen', 'belly', 'nausea', 'vomit', 'diarrhea'],
        pain: ['pain', 'ache', 'hurt', 'sore', 'discomfort']
    };
    
    for (let category in categories) {
        if (categories[category].some(keyword => message.includes(keyword))) {
            return category;
        }
    }
    
    return 'general';
}

// Get next question based on category
function getNextQuestion(category, questionIndex) {
    if (category && symptomQuestions[category] && symptomQuestions[category][questionIndex]) {
        return symptomQuestions[category][questionIndex];
    }
    
    // Fallback to general questions
    if (symptomQuestions.general[questionIndex]) {
        return symptomQuestions.general[questionIndex];
    }
    
    return "Can you tell me more about what you're experiencing?";
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
    conversationState.userSymptoms = {};
    conversationState.conversationPhase = 'initial';
    conversationState.questionCount = 0;
    
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
    
    // Combine all symptoms into a comprehensive description
    let comprehensiveSymptoms = conversationState.userSymptoms.mainComplaint + '. ';
    for (let key in conversationState.userSymptoms) {
        if (key !== 'mainComplaint') {
            comprehensiveSymptoms += conversationState.userSymptoms[key] + '. ';
        }
    }
    
    // Simulate AI analysis (2-3 seconds)
    setTimeout(() => {
        const analysis = performAIAnalysis(comprehensiveSymptoms);
        displayResults(analysis);
        document.getElementById('loadingOverlay').classList.remove('active');
        
        // Save to history
        saveToHistory(conversationState.userSymptoms.mainComplaint, analysis);
        
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

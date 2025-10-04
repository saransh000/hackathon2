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

// System prompt for Final Analysis
const ANALYSIS_PROMPT = `Role & Goal
You are CureMind's Medical Analysis AI. Your purpose is to analyze the symptom information gathered during the conversation and provide a structured medical assessment. You will review the conversation history and provide:
1. A list of 3-5 possible health conditions with probability assessments
2. A severity level (Emergency, Doctor Visit, or Home Care)
3. Specific, actionable recommendations

You are an analytical tool, NOT a licensed medical professional. Your analysis is for informational purposes only and should never replace professional medical advice.

Input
You will receive a complete conversation history between the user and the symptom gathering assistant. This conversation contains detailed information about the user's symptoms, including location, severity, duration, triggers, and associated symptoms.

Output Format
You must provide your response in STRICT JSON format with the following structure:

{
  "severity": "emergency" | "doctor" | "home",
  "conditions": [
    {
      "name": "Condition Name",
      "probability": "High Risk" | "Moderate" | "Likely" | "Possible"
    }
  ],
  "recommendations": {
    "title": "Severity-appropriate title",
    "type": "emergency" | "doctor-visit" | "home-remedy",
    "actions": [
      "Specific action item 1",
      "Specific action item 2",
      "Specific action item 3",
      "Specific action item 4",
      "Specific action item 5"
    ]
  }
}

Severity Guidelines

🚨 EMERGENCY (severity: "emergency")
Use when symptoms suggest immediate medical attention is needed:
- Severe chest pain, pressure, or tightness
- Difficulty breathing or shortness of breath
- Sudden severe headache (worst headache of life)
- Confusion, loss of consciousness, or altered mental state
- Severe bleeding or trauma
- Signs of stroke (facial drooping, arm weakness, speech difficulty)
- Severe allergic reactions
- High fever (>103°F/39.4°C) with confusion or stiff neck

Response must include:
- Title: "🚨 SEEK IMMEDIATE MEDICAL ATTENTION"
- Actions: Call 108, go to ER, do not drive yourself, etc.

👨‍⚕️ DOCTOR VISIT (severity: "doctor")
Use when symptoms warrant professional evaluation but are not immediately life-threatening:
- Persistent fever lasting more than 3 days
- Moderate to severe pain that doesn't improve
- Symptoms significantly affecting daily activities
- Respiratory symptoms with concerning features (productive cough, wheezing)
- Digestive issues lasting more than a few days
- Unexplained weight loss or fatigue
- Symptoms that are worsening despite home care

Response must include:
- Title: "👨‍⚕️ Schedule a Doctor Visit"
- Actions: Schedule appointment within 24-48 hours, monitor symptoms, prepare symptom list, etc.

🏠 HOME CARE (severity: "home")
Use when symptoms appear mild and self-limiting:
- Common cold symptoms (mild)
- Minor headaches
- Mild fatigue or stress
- Minor digestive discomfort
- Mild muscle aches
- Minor allergies

Response must include:
- Title: "🏠 Home Care Recommendations"
- Actions: Rest, hydration, OTC medications, monitor for changes, when to seek help, etc.

Condition Probability Levels
- "High Risk": Strong indicators present, urgent evaluation recommended
- "Moderate": Moderate indicators present, professional evaluation advised
- "Likely": Common presentation matching described symptoms
- "Possible": Could be considered based on symptoms, but less likely

Critical Rules & Guardrails

🚫 DO NOT Diagnose: Never state definitively "You have X condition." Always use phrases like "Possible," "May indicate," "Consistent with."

🚫 DO NOT Recommend Specific Medications: Do not name specific prescription drugs. For home care, you may mention general categories like "over-the-counter pain relievers" or "antihistamines" without brand names.

🚫 DO NOT Provide False Reassurance: If symptoms are concerning, do not minimize them. Err on the side of caution.

✅ BE CONTEXT-AWARE: Consider the full conversation. If the user mentioned severity, duration, or concerning features, factor these into your assessment.

✅ PROVIDE ACTIONABLE ADVICE: Recommendations should be specific and actionable, not vague.

✅ ALWAYS Include Disclaimer Context: Your recommendations should assume the disclaimer "This is not a medical diagnosis" is visible to the user.

Example Analysis

Conversation Summary: User reports headache on left side for 2 days, throbbing pain rated 7/10, sensitivity to light, nausea, took ibuprofen with minimal relief.

Response:
{
  "severity": "doctor",
  "conditions": [
    {
      "name": "Migraine Headache",
      "probability": "Likely"
    },
    {
      "name": "Tension Headache",
      "probability": "Possible"
    },
    {
      "name": "Cluster Headache",
      "probability": "Possible"
    }
  ],
  "recommendations": {
    "title": "👨‍⚕️ Schedule a Doctor Visit",
    "type": "doctor-visit",
    "actions": [
      "Schedule an appointment with your primary care physician within 24-48 hours",
      "Keep a headache diary noting triggers, duration, and severity",
      "Rest in a dark, quiet room when pain occurs",
      "Stay hydrated and maintain regular meal times",
      "If pain becomes severe or you experience vision changes, seek immediate care"
    ]
  }
}

Remember
- You are analyzing information, not practicing medicine
- Your output must be valid JSON that can be parsed programmatically
- Base your assessment on the conversation details provided
- When in doubt about severity, recommend professional evaluation
- Be thorough but concise in your recommendations`;

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
                    maxOutputTokens: 500,
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
        console.log('Gemini Response:', data); // Debug log
        console.log('Candidates:', data.candidates); // Debug candidates
        
        // Check for blocked content or max tokens
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            
            // Handle MAX_TOKENS finish reason
            if (candidate.finishReason === 'MAX_TOKENS') {
                console.warn('Response truncated due to MAX_TOKENS');
                // Try to extract any partial content
                if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                    const partialText = candidate.content.parts[0].text;
                    if (partialText && partialText.trim()) {
                        return partialText;
                    }
                }
                // If no content, ask user to continue
                throw new Error('Response was too long. Please continue with your symptoms.');
            }
            
            // Handle SAFETY blocks
            if (candidate.finishReason === 'SAFETY') {
                console.error('Content blocked by safety filters:', data);
                throw new Error('Response blocked by safety filters. Please rephrase your symptoms.');
            }
        }
        
        // Check for various response structures
        if (data.candidates && data.candidates.length > 0) {
            const candidate = data.candidates[0];
            console.log('First candidate:', candidate); // Debug first candidate
            console.log('Candidate content:', candidate.content); // Debug content
            console.log('Candidate parts:', candidate.content?.parts); // Debug parts
            
            // Try to get text from different possible structures
            let aiText = null;
            
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
                const part = candidate.content.parts[0];
                if (part && part.text) {
                    aiText = part.text;
                    console.log('✅ Found text in standard structure:', aiText);
                }
            } else if (candidate.text) {
                aiText = candidate.text;
                console.log('✅ Found text in candidate.text:', aiText);
            } else if (candidate.output) {
                aiText = candidate.output;
                console.log('✅ Found text in candidate.output:', aiText);
            }
            
            // If no text found, check finish reason
            if (!aiText || aiText.trim() === '') {
                console.error('❌ No text content found');
                console.error('Finish Reason:', candidate.finishReason);
                console.error('Candidate keys:', Object.keys(candidate));
                console.error('Full candidate:', JSON.stringify(candidate, null, 2));
                
                // Provide helpful error based on finish reason
                if (candidate.finishReason === 'MAX_TOKENS') {
                    throw new Error('The AI response was incomplete. Please continue describing your symptoms.');
                } else if (candidate.finishReason === 'STOP') {
                    throw new Error('The AI couldn\'t generate a proper response. Please try rephrasing your message.');
                } else {
                    throw new Error('No response content received. Please try again.');
                }
            }
            
            if (aiText) {
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
            }
        }
        
        // If we got here, response structure is unexpected
        console.error('Unexpected response structure:', JSON.stringify(data, null, 2));
        
        // Check if there's an error message in the response
        if (data.error) {
            throw new Error(`Gemini API Error: ${data.error.message}`);
        }
        
        throw new Error('No valid response from Gemini. Response: ' + JSON.stringify(data));
        
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
async function getFinalAnalysis() {
    // Show loading
    document.getElementById('loadingOverlay').classList.add('active');
    
    try {
        // Get AI-powered analysis from Gemini
        const analysis = await getGeminiAnalysis();
        
        // Display results
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
        
    } catch (error) {
        console.error('Analysis failed:', error);
        document.getElementById('loadingOverlay').classList.remove('active');
        
        // Fallback to basic analysis if API fails
        showNotification('Unable to get AI analysis. Showing basic assessment.', 'warning');
        
        let comprehensiveSymptoms = '';
        conversationState.messages.forEach(msg => {
            if (msg.role === 'user') {
                comprehensiveSymptoms += msg.content + '. ';
            }
        });
        
        const fallbackAnalysis = performAIAnalysis(comprehensiveSymptoms);
        displayResults(fallbackAnalysis);
        
        const mainComplaint = conversationState.messages.find(m => m.role === 'user')?.content || 'Health consultation';
        saveToHistory(mainComplaint, fallbackAnalysis);
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }
}

// Get analysis from Gemini 2.5 Flash API
async function getGeminiAnalysis() {
    try {
        // Prepare conversation summary for analysis
        let conversationSummary = "Complete Conversation History:\n\n";
        
        conversationState.messages.forEach((msg, index) => {
            if (msg.role === 'user') {
                conversationSummary += `User: ${msg.content}\n`;
            } else if (msg.role === 'ai') {
                conversationSummary += `Assistant: ${msg.content}\n`;
            }
        });
        
        conversationSummary += "\n\nBased on this conversation, provide a comprehensive medical analysis in the required JSON format.";
        
        // API call to Gemini
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${conversationState.geminiApiKey}`;
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: ANALYSIS_PROMPT }]
                    },
                    {
                        role: 'model',
                        parts: [{ text: "I understand. I will analyze the conversation history and provide a structured medical assessment in strict JSON format following all the guidelines provided." }]
                    },
                    {
                        role: 'user',
                        parts: [{ text: conversationSummary }]
                    }
                ],
                generationConfig: {
                    temperature: 0.3,  // Lower temperature for more consistent JSON output
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1000,
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
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Gemini Analysis Response:', data); // Debug log
        
        if (data.candidates && data.candidates.length > 0 && 
            data.candidates[0].content && 
            data.candidates[0].content.parts && 
            data.candidates[0].content.parts.length > 0) {
            
            const analysisText = data.candidates[0].content.parts[0].text;
            console.log('Analysis Text:', analysisText); // Debug log
            
            // Extract JSON from the response (in case there's extra text)
            let jsonMatch = analysisText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                console.error('No JSON found in response:', analysisText);
                throw new Error('No valid JSON found in response');
            }
            
            const analysisJson = JSON.parse(jsonMatch[0]);
            
            // Validate the structure
            if (!analysisJson.severity || !analysisJson.conditions || !analysisJson.recommendations) {
                console.error('Invalid structure:', analysisJson);
                throw new Error('Invalid analysis structure');
            }
            
            return analysisJson;
            
        } else {
            console.error('Unexpected analysis response structure:', data);
            throw new Error('No analysis returned from Gemini - check console for details');
        }
        
    } catch (error) {
        console.error('Gemini Analysis failed:', error);
        throw error;
    }
}

// Initialize chat system when document loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the chat system after dashboard is ready
    initializeChatSystem();
});

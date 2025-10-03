// Voice Input Module using Web Speech API
// Supports multiple languages including Hindi, Tamil, Bengali, and more

class VoiceInputManager {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.language = 'en-US'; // Default language
        this.finalTranscript = '';
        this.interimTranscript = '';
        
        // Available languages
        this.languages = {
            'en-US': 'English (US)',
            'en-GB': 'English (UK)',
            'hi-IN': 'Hindi',
            'ta-IN': 'Tamil',
            'te-IN': 'Telugu',
            'mr-IN': 'Marathi',
            'bn-IN': 'Bengali',
            'gu-IN': 'Gujarati',
            'kn-IN': 'Kannada',
            'ml-IN': 'Malayalam',
            'pa-IN': 'Punjabi'
        };
        
        this.initializeSpeechRecognition();
    }

    initializeSpeechRecognition() {
        // Check browser support
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Speech recognition not supported in this browser');
            this.showNotification('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.', 'error');
            return false;
        }

        // Initialize recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure recognition
        this.recognition.continuous = true; // Keep listening
        this.recognition.interimResults = true; // Show real-time results
        this.recognition.maxAlternatives = 1;
        this.recognition.lang = this.language;

        // Set up event handlers
        this.setupEventHandlers();
        
        return true;
    }

    setupEventHandlers() {
        if (!this.recognition) return;

        // When speech is recognized
        this.recognition.onresult = (event) => {
            this.interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                
                if (event.results[i].isFinal) {
                    this.finalTranscript += transcript + ' ';
                } else {
                    this.interimTranscript += transcript;
                }
            }
            
            // Update the input field with recognized text
            this.updateInputField();
        };

        // When recognition starts
        this.recognition.onstart = () => {
            console.log('Voice recognition started');
            this.isListening = true;
            this.updateUI(true);
        };

        // When recognition ends
        this.recognition.onend = () => {
            console.log('Voice recognition ended');
            this.isListening = false;
            this.updateUI(false);
            
            // If there's text, trigger final update
            if (this.finalTranscript.trim()) {
                this.finalizeTranscript();
            }
        };

        // Error handling
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.updateUI(false);
            
            let errorMessage = 'Voice input error: ';
            switch(event.error) {
                case 'no-speech':
                    errorMessage += 'No speech detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage += 'No microphone found or permission denied.';
                    break;
                case 'not-allowed':
                    errorMessage += 'Microphone permission denied. Please allow microphone access.';
                    break;
                case 'network':
                    errorMessage += 'Network error. Please check your internet connection.';
                    break;
                default:
                    errorMessage += event.error;
            }
            
            this.showNotification(errorMessage, 'error');
        };
    }

    startListening() {
        if (!this.recognition) {
            this.showNotification('Voice recognition is not available', 'error');
            return;
        }

        if (this.isListening) {
            this.stopListening();
            return;
        }

        try {
            this.finalTranscript = '';
            this.interimTranscript = '';
            this.recognition.lang = this.language;
            this.recognition.start();
            this.showNotification('Listening... Speak now', 'info');
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.showNotification('Failed to start voice input', 'error');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
    }

    updateInputField() {
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            // Show interim results in real-time
            const fullText = this.finalTranscript + this.interimTranscript;
            chatInput.value = fullText;
            
            // Auto-resize textarea
            chatInput.style.height = 'auto';
            chatInput.style.height = chatInput.scrollHeight + 'px';
        }
    }

    finalizeTranscript() {
        const chatInput = document.getElementById('chatInput');
        if (chatInput && this.finalTranscript.trim()) {
            chatInput.value = this.finalTranscript.trim();
            
            // Show success notification
            this.showNotification('Voice input captured successfully!', 'success');
            
            // Focus on input
            chatInput.focus();
        }
    }

    updateUI(listening) {
        const voiceBtn = document.getElementById('voiceBtn');
        const voiceStatus = document.getElementById('voiceStatus');
        
        if (voiceBtn) {
            if (listening) {
                voiceBtn.classList.add('listening');
                voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
                voiceBtn.title = 'Stop listening';
            } else {
                voiceBtn.classList.remove('listening');
                voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                voiceBtn.title = 'Voice input';
            }
        }
        
        if (voiceStatus) {
            voiceStatus.style.display = listening ? 'block' : 'none';
        }
    }

    setLanguage(langCode) {
        if (this.languages[langCode]) {
            this.language = langCode;
            if (this.recognition) {
                this.recognition.lang = langCode;
            }
            console.log(`Language changed to: ${this.languages[langCode]}`);
        }
    }

    showNotification(message, type = 'info') {
        // Use existing notification system if available
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    getAvailableLanguages() {
        return this.languages;
    }
}

// Initialize voice input manager when DOM is loaded
let voiceManager = null;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize voice manager
    voiceManager = new VoiceInputManager();
    
    // Voice button click handler
    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', function() {
            if (voiceManager) {
                voiceManager.startListening();
            }
        });
    }
    
    // Stop voice button handler
    const stopVoiceBtn = document.getElementById('stopVoiceBtn');
    if (stopVoiceBtn) {
        stopVoiceBtn.addEventListener('click', function() {
            if (voiceManager) {
                voiceManager.stopListening();
            }
        });
    }
    
    // Add language selector if needed
    addLanguageSelector();
});

// Add language selector to dashboard
function addLanguageSelector() {
    if (!voiceManager) return;
    
    const chatActions = document.querySelector('.chat-actions');
    if (!chatActions) return;
    
    // Check if language selector already exists
    if (document.getElementById('languageSelector')) return;
    
    // Create language selector dropdown
    const languageContainer = document.createElement('div');
    languageContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        background: rgba(139, 92, 246, 0.1);
        border: 1px solid rgba(139, 92, 246, 0.3);
        border-radius: 8px;
        font-size: 0.9rem;
    `;
    
    const label = document.createElement('label');
    label.htmlFor = 'languageSelector';
    label.textContent = '🗣️ Voice Language:';
    label.style.color = 'rgba(255, 255, 255, 0.8)';
    
    const select = document.createElement('select');
    select.id = 'languageSelector';
    select.style.cssText = `
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.9rem;
        font-weight: 600;
    `;
    
    // Add language options
    const languages = voiceManager.getAvailableLanguages();
    for (const [code, name] of Object.entries(languages)) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = name;
        if (code === 'en-US') option.selected = true;
        select.appendChild(option);
    }
    
    // Language change handler
    select.addEventListener('change', function() {
        voiceManager.setLanguage(this.value);
        voiceManager.showNotification(`Voice language changed to ${languages[this.value]}`, 'success');
    });
    
    languageContainer.appendChild(label);
    languageContainer.appendChild(select);
    
    // Insert before the first button
    chatActions.insertBefore(languageContainer, chatActions.firstChild);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceInputManager;
}

// User Data
let userData = {
    name: 'John Doe',
    firstName: 'John',
    age: 32,
    gender: 'Male'
};

// Session Protection - Check if user is logged in
function checkSession() {
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');
    
    // If no session or user is admin, redirect to login
    if (!userRole || !username) {
        alert('Please log in to access the dashboard');
        window.location.href = 'index.html';
        return false;
    }
    
    // If admin tries to access user dashboard, redirect to admin dashboard
    if (userRole === 'admin') {
        window.location.href = 'admin.html';
        return false;
    }
    
    return true;
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check session before initializing
    if (!checkSession()) {
        return;
    }
    
    initializeDashboard();
    setupEventListeners();
});

function initializeDashboard() {
    // Get logged in username
    const username = localStorage.getItem('username');
    
    // Set user name from session
    if (username) {
        userData.name = username;
        userData.firstName = username.split(' ')[0] || username;
    }
    
    // Set user name
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('greetingName').textContent = userData.firstName;
    
    // Load user data from localStorage if available
    const savedUser = localStorage.getItem('curemindUser');
    if (savedUser) {
        userData = JSON.parse(savedUser);
        updateUserDisplay();
    }
}

function updateUserDisplay() {
    document.getElementById('userName').textContent = userData.name;
    document.getElementById('greetingName').textContent = userData.firstName;
    document.querySelector('.user-age').textContent = `Age: ${userData.age}, ${userData.gender}`;
}

function setupEventListeners() {
    // Profile dropdown toggle
    const profileBtn = document.getElementById('profileBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    
    profileBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function() {
        dropdownMenu.classList.remove('active');
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        // Clear session
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        // Redirect to login
        showNotification('Logging out...', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });

    // Clear button (only if it exists - for old textarea interface)
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            document.getElementById('symptomsInput').value = '';
            document.getElementById('resultsSection').style.display = 'none';
        });
    }

    // Analyze button (only if it exists - for old textarea interface)
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', analyzeSymptoms);
    }

    // Emergency button
    document.getElementById('emergencyBtn').addEventListener('click', function() {
        document.getElementById('emergencyModal').classList.add('active');
    });

    // Close emergency modal
    document.getElementById('closeEmergencyModal').addEventListener('click', function() {
        document.getElementById('emergencyModal').classList.remove('active');
    });

    // Doctor button
    document.getElementById('doctorBtn').addEventListener('click', function() {
        showNotification('Connecting you with nearby healthcare providers...', 'info');
        setTimeout(() => {
            showNotification('Feature coming soon! You will be able to book appointments.', 'info');
        }, 1500);
    });

    // Pharmacy button
    document.getElementById('pharmacyBtn').addEventListener('click', function() {
        showNotification('Searching for nearby pharmacies...', 'info');
        setTimeout(() => {
            showNotification('Feature coming soon! You will see nearby pharmacies on a map.', 'info');
        }, 1500);
    });

    // View details buttons
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            showNotification('Loading consultation details...', 'info');
        });
    });

    // Enter key to submit (only if symptomsInput exists - for old textarea interface)
    const symptomsInput = document.getElementById('symptomsInput');
    if (symptomsInput) {
        symptomsInput.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'Enter') {
                analyzeSymptoms();
            }
        });
    }
}

// Main Analysis Function
function analyzeSymptoms() {
    const symptomsText = document.getElementById('symptomsInput').value.trim();
    
    if (!symptomsText) {
        showNotification('Please describe your symptoms before analyzing.', 'error');
        return;
    }

    // Show loading
    document.getElementById('loadingOverlay').classList.add('active');
    
    // Simulate AI analysis (2-3 seconds)
    setTimeout(() => {
        const analysis = performAIAnalysis(symptomsText);
        displayResults(analysis);
        document.getElementById('loadingOverlay').classList.remove('active');
        
        // Save to history
        saveToHistory(symptomsText, analysis);
        
        // Scroll to results
        document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    }, 2500);
}

// Simulate AI Analysis (This would call your actual AI API)
function performAIAnalysis(symptoms) {
    const lowerSymptoms = symptoms.toLowerCase();
    
    // Simple keyword-based analysis (replace with actual AI API call)
    let severity = 'home';
    let conditions = [];
    
    // Check for emergency keywords
    if (lowerSymptoms.includes('chest pain') || 
        lowerSymptoms.includes('can\'t breathe') || 
        lowerSymptoms.includes('severe bleeding') ||
        lowerSymptoms.includes('unconscious')) {
        severity = 'emergency';
        conditions = [
            { name: 'Cardiac Event', probability: 'High Risk' },
            { name: 'Respiratory Distress', probability: 'High Risk' }
        ];
    }
    // Check for doctor visit keywords
    else if (lowerSymptoms.includes('persistent') || 
             lowerSymptoms.includes('fever') && lowerSymptoms.includes('days') ||
             lowerSymptoms.includes('severe pain')) {
        severity = 'doctor';
        conditions = [
            { name: 'Viral Infection', probability: 'Moderate' },
            { name: 'Bacterial Infection', probability: 'Possible' },
            { name: 'Inflammatory Condition', probability: 'Possible' }
        ];
    }
    // Home remedy
    else {
        severity = 'home';
        conditions = [
            { name: 'Common Cold', probability: 'Likely' },
            { name: 'Mild Fatigue', probability: 'Possible' },
            { name: 'Minor Discomfort', probability: 'Possible' }
        ];
    }
    
    return {
        severity: severity,
        conditions: conditions,
        recommendations: getRecommendations(severity, conditions)
    };
}

function getRecommendations(severity, conditions) {
    switch(severity) {
        case 'emergency':
            return {
                title: '🚨 SEEK IMMEDIATE MEDICAL ATTENTION',
                type: 'emergency',
                actions: [
                    'Call 108 or go to the nearest emergency room immediately',
                    'Do not drive yourself - call an ambulance',
                    'If possible, have someone stay with you',
                    'Bring a list of current medications'
                ]
            };
        case 'doctor':
            return {
                title: '👨‍⚕️ Schedule a Doctor Visit',
                type: 'doctor-visit',
                actions: [
                    'Schedule an appointment with your primary care physician within 24-48 hours',
                    'Monitor your symptoms and note any changes',
                    'Keep track of your temperature if you have a fever',
                    'Prepare a list of all symptoms and their duration',
                    'Avoid strenuous activities until consultation'
                ]
            };
        case 'home':
        default:
            return {
                title: '🏠 Home Care Recommendations',
                type: 'home-remedy',
                actions: [
                    'Get plenty of rest and stay hydrated',
                    'Use over-the-counter medications as needed (follow package directions)',
                    'Monitor your symptoms for any worsening',
                    'Maintain a healthy diet with plenty of fluids',
                    'If symptoms persist beyond 3-5 days, consider seeing a doctor'
                ]
            };
    }
}

function displayResults(analysis) {
    const resultsSection = document.getElementById('resultsSection');
    const conditionsList = document.getElementById('conditionsList');
    const recommendationCard = document.getElementById('recommendationCard');
    const recommendationContent = document.getElementById('recommendationContent');
    
    // Clear previous results
    conditionsList.innerHTML = '';
    recommendationContent.innerHTML = '';
    
    // Display conditions
    analysis.conditions.forEach(condition => {
        const conditionItem = document.createElement('div');
        conditionItem.className = 'condition-item';
        conditionItem.innerHTML = `
            <div class="condition-name">${condition.name}</div>
            <div class="condition-probability">Probability: ${condition.probability}</div>
        `;
        conditionsList.appendChild(conditionItem);
    });
    
    // Display recommendations
    recommendationContent.className = `recommendation-content ${analysis.recommendations.type}`;
    
    let actionsHTML = '<ul>';
    analysis.recommendations.actions.forEach(action => {
        actionsHTML += `<li>${action}</li>`;
    });
    actionsHTML += '</ul>';
    
    recommendationContent.innerHTML = `
        <h3>${analysis.recommendations.title}</h3>
        ${actionsHTML}
    `;
    
    // Show results section with animation
    resultsSection.style.display = 'block';
}

function saveToHistory(symptoms, analysis) {
    const historyContainer = document.getElementById('historyContainer');
    
    // Create new history item
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    const date = new Date().toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    let badgeClass = 'badge-home';
    let badgeText = 'Home Remedy';
    
    if (analysis.severity === 'doctor') {
        badgeClass = 'badge-doctor';
        badgeText = 'Doctor Visit';
    } else if (analysis.severity === 'emergency') {
        badgeClass = 'badge-emergency';
        badgeText = 'Emergency';
    }
    
    historyItem.innerHTML = `
        <div class="history-header">
            <span class="history-date"><i class="fas fa-calendar"></i> ${date}</span>
            <span class="history-badge ${badgeClass}">${badgeText}</span>
        </div>
        <p class="history-symptoms">${symptoms.substring(0, 100)}${symptoms.length > 100 ? '...' : ''}</p>
        <button class="view-details-btn">View Details</button>
    `;
    
    // Add to beginning of history
    historyContainer.insertBefore(historyItem, historyContainer.firstChild);
    
    // Add event listener to new button
    historyItem.querySelector('.view-details-btn').addEventListener('click', function() {
        showNotification('Loading consultation details...', 'info');
    });
}

// Notification System
function showNotification(message, type) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 400px;
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #4caf50, #8bc34a)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #f44336, #e91e63)';
            break;
        case 'info':
            notification.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            break;
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

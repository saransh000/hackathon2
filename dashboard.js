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
    const authToken = getAuthToken();
    
    // If no session or user is admin, redirect to login
    if (!userRole || !username || !authToken) {
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

// Load user data from backend
async function loadUserData() {
    try {
        const response = await makeAPICall(API_CONFIG.ENDPOINTS.ME);
        if (response.success) {
            const user = response.data.user;
            userData = {
                name: user.profile?.firstName && user.profile?.lastName ? 
                      `${user.profile.firstName} ${user.profile.lastName}` : user.username,
                firstName: user.profile?.firstName || user.username,
                age: user.profile?.age || 'N/A',
                gender: user.profile?.gender || 'N/A',
                email: user.email,
                username: user.username
            };
            updateUserDisplay();
            return true;
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to stored data
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            const parsedData = JSON.parse(storedUserData);
            userData.name = parsedData.username;
            userData.firstName = parsedData.username;
            updateUserDisplay();
        }
        return false;
    }
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', async function() {
    // Check session before initializing
    if (!checkSession()) {
        return;
    }
    
    await initializeDashboard();
    setupEventListeners();
});

async function initializeDashboard() {
    // Show loading state
    const userName = document.getElementById('userName');
    const greetingName = document.getElementById('greetingName');
    
    userName.textContent = 'Loading...';
    greetingName.textContent = 'Loading...';
    
    // Load user data from backend
    await loadUserData();
    
    // Load user history
    await loadAnalysisHistory();
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
    document.getElementById('logoutBtn').addEventListener('click', async function(e) {
        e.preventDefault();
        
        try {
            // Call logout API
            await makeAPICall(API_CONFIG.ENDPOINTS.LOGOUT, {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout API error:', error);
            // Continue with local logout even if API fails
        }
        
        // Clear all session data
        clearAuthToken();
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        localStorage.removeItem('userId');
        localStorage.removeItem('userData');
        
        // Redirect to login
        showNotification('Logging out...', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    });

    // My Profile button
    const myProfileBtn = document.getElementById('myProfileBtn');
    if (myProfileBtn) {
        myProfileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showProfileModal();
        });
    }

    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showSettingsModal();
        });
    }

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
        showDoctorModal();
    });

    // Appointment button
    document.getElementById('appointmentBtn').addEventListener('click', function() {
        openAppointmentModal();
    });

    // Pharmacy button
    document.getElementById('pharmacyBtn').addEventListener('click', function() {
        openPharmacyFinder();
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
async function analyzeSymptoms() {
    const symptomsText = document.getElementById('symptomsInput').value.trim();
    
    if (!symptomsText) {
        showNotification('Please describe your symptoms before analyzing.', 'error');
        return;
    }

    // Show loading
    document.getElementById('loadingOverlay').classList.add('active');
    
    try {
        // Call backend API for symptom analysis
        const response = await makeAPICall(API_CONFIG.ENDPOINTS.ANALYZE, {
            method: 'POST',
            body: JSON.stringify({
                symptoms: symptomsText
            })
        });
        
        if (response.success) {
            const analysis = {
                severity: response.data.analysis.severity,
                conditions: response.data.analysis.conditions,
                recommendations: response.data.analysis.recommendations,
                sessionId: response.data.sessionId,
                processingTime: response.data.processingTime
            };
            
            displayResults(analysis);
            
            // Scroll to results
            document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
            
            // Reload history to show new analysis
            await loadAnalysisHistory();
        }
    } catch (error) {
        const errorMessage = handleAPIError(error, 'Failed to analyze symptoms. Please try again.');
        showNotification(errorMessage, 'error');
        console.error('Analysis error:', error);
    } finally {
        document.getElementById('loadingOverlay').classList.remove('active');
    }
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

// Load Analysis History from Backend
async function loadAnalysisHistory() {
    try {
        const response = await makeAPICall(API_CONFIG.ENDPOINTS.HISTORY + '?limit=10');
        
        if (response.success && response.data.analyses) {
            const historyContainer = document.getElementById('historyContainer');
            
            // Clear existing items except the sample ones (keep last 3 for demo)
            const existingItems = historyContainer.querySelectorAll('.history-item');
            if (existingItems.length > 3) {
                // Remove items beyond the last 3
                for (let i = 0; i < existingItems.length - 3; i++) {
                    existingItems[i].remove();
                }
            }
            
            // Add new analyses to history
            response.data.analyses.forEach(analysis => {
                const historyItem = document.createElement('div');
                historyItem.className = 'history-item';
                
                const date = new Date(analysis.timestamp).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                });
                
                let badgeClass = 'badge-home';
                let badgeText = 'Home Remedy';
                
                if (analysis.analysis.severity === 'doctor') {
                    badgeClass = 'badge-doctor';
                    badgeText = 'Doctor Visit';
                } else if (analysis.analysis.severity === 'emergency') {
                    badgeClass = 'badge-emergency';
                    badgeText = 'Emergency';
                }
                
                historyItem.innerHTML = `
                    <div class="history-header">
                        <span class="history-date"><i class="fas fa-calendar"></i> ${date}</span>
                        <span class="history-badge ${badgeClass}">${badgeText}</span>
                    </div>
                    <p class="history-symptoms">${analysis.symptoms.substring(0, 100)}${analysis.symptoms.length > 100 ? '...' : ''}</p>
                    <button class="view-details-btn" data-analysis-id="${analysis._id}">View Details</button>
                `;
                
                // Insert at the beginning (most recent first)
                historyContainer.insertBefore(historyItem, historyContainer.firstChild);
                
                // Add event listener
                historyItem.querySelector('.view-details-btn').addEventListener('click', function() {
                    viewAnalysisDetails(analysis._id);
                });
            });
        }
    } catch (error) {
        console.error('Error loading analysis history:', error);
        // Fail silently for history loading
    }
}

// View analysis details function
async function viewAnalysisDetails(analysisId) {
    try {
        showNotification('Loading analysis details...', 'info');
        const response = await makeAPICall(`/analysis/${analysisId}`);
        
        if (response.success) {
            const analysis = response.data;
            // Display the analysis results
            displayResults({
                severity: analysis.analysis.severity,
                conditions: analysis.analysis.conditions,
                recommendations: analysis.analysis.recommendations
            });
            
            // Scroll to results
            document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        const errorMessage = handleAPIError(error, 'Failed to load analysis details.');
        showNotification(errorMessage, 'error');
    }
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

// ==================== APPOINTMENT BOOKING SYSTEM ====================

let selectedTimeSlot = null;
let selectedDate = null;

// Open appointment modal
function openAppointmentModal() {
    const modal = document.getElementById('appointmentModal');
    modal.style.display = 'flex';
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').setAttribute('min', today);
    
    // Load user's appointments
    loadUserAppointments();
}

// Close appointment modal
document.getElementById('closeAppointmentModal')?.addEventListener('click', function() {
    document.getElementById('appointmentModal').style.display = 'none';
    document.getElementById('appointmentForm').reset();
    selectedTimeSlot = null;
    selectedDate = null;
});

// Handle consultation type selection
document.querySelectorAll('.radio-card').forEach(card => {
    card.addEventListener('click', function() {
        const radio = this.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
            document.querySelectorAll('.radio-card').forEach(c => {
                c.style.borderColor = '#e0e0e0';
                c.style.background = 'white';
            });
            this.style.borderColor = '#667eea';
            this.style.background = 'rgba(102, 126, 234, 0.1)';
        }
    });
});

// Handle date change
document.getElementById('appointmentDate')?.addEventListener('change', async function(e) {
    selectedDate = e.target.value;
    const doctor = document.getElementById('doctorSelect').value.split('|')[0];
    
    if (!doctor) {
        showNotification('Please select a doctor first', 'info');
        return;
    }
    
    await loadAvailableTimeSlots(selectedDate, doctor);
});

// Load available time slots
async function loadAvailableTimeSlots(date, doctor) {
    try {
        const response = await makeAPICall(
            `${API_CONFIG.ENDPOINTS.AVAILABLE_SLOTS}?date=${date}&doctor=${encodeURIComponent(doctor)}`,
            { method: 'GET' }
        );
        
        const data = await response.json();
        const timeSlotsContainer = document.getElementById('timeSlots');
        const selectedTimeDisplay = document.getElementById('selectedTimeDisplay');
        timeSlotsContainer.innerHTML = '';
        
        if (data.success && data.availableSlots.length > 0) {
            data.availableSlots.forEach(slot => {
                const slotBtn = document.createElement('button');
                slotBtn.type = 'button';
                slotBtn.className = 'time-slot';
                slotBtn.textContent = slot;
                slotBtn.addEventListener('click', function() {
                    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
                    this.classList.add('selected');
                    selectedTimeSlot = slot;
                    
                    // Update the selected time display
                    if (selectedTimeDisplay) {
                        selectedTimeDisplay.innerHTML = `<i class="fas fa-check-circle" style="color: #4caf50; margin-right: 6px;"></i> <strong>${slot}</strong>`;
                        selectedTimeDisplay.style.color = '#2c3e50';
                        selectedTimeDisplay.style.background = '#e8f5e9';
                        selectedTimeDisplay.style.borderColor = '#4caf50';
                    }
                });
                timeSlotsContainer.appendChild(slotBtn);
            });
        } else {
            timeSlotsContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: #e74c3c; display: flex; align-items: center; justify-content: center; gap: 8px; margin: 10px 0;"><i class="fas fa-exclamation-circle"></i> No available slots for this date</p>';
        }
        
    } catch (error) {
        console.error('Error loading time slots:', error);
        showNotification('Failed to load available time slots', 'error');
    }
}

// Handle appointment form submission
document.getElementById('appointmentForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const doctorValue = document.getElementById('doctorSelect').value;
    if (!doctorValue) {
        showNotification('Please select a doctor', 'error');
        return;
    }
    
    if (!selectedDate) {
        showNotification('Please select a date', 'error');
        return;
    }
    
    if (!selectedTimeSlot) {
        showNotification('Please select a time slot', 'error');
        return;
    }
    
    const [doctorName, doctorSpecialty] = doctorValue.split('|');
    const consultationType = document.querySelector('input[name="consultationType"]:checked').value;
    const symptoms = document.getElementById('appointmentSymptoms').value;
    const additionalNotes = document.getElementById('appointmentNotes').value;
    
    const appointmentData = {
        doctorName: doctorName.trim(),
        doctorSpecialty: doctorSpecialty.trim(),
        appointmentDate: selectedDate,
        appointmentTime: selectedTimeSlot,
        consultationType,
        symptoms,
        additionalNotes
    };
    
    const btn = document.getElementById('bookAppointmentBtn');
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';
    
    try {
        const response = await makeAPICall(API_CONFIG.ENDPOINTS.BOOK_APPOINTMENT, {
            method: 'POST',
            body: JSON.stringify(appointmentData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Appointment booked successfully! Awaiting confirmation.', 'success');
            document.getElementById('appointmentForm').reset();
            selectedTimeSlot = null;
            selectedDate = null;
            loadUserAppointments();
        } else {
            showNotification(data.message || 'Failed to book appointment', 'error');
        }
        
    } catch (error) {
        console.error('Booking error:', error);
        showNotification('Failed to book appointment. Please try again.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
    }
});

// Load user's appointments
async function loadUserAppointments() {
    try {
        const response = await makeAPICall(API_CONFIG.ENDPOINTS.MY_APPOINTMENTS, {
            method: 'GET'
        });
        
        const data = await response.json();
        const appointmentsList = document.getElementById('appointmentsList');
        
        if (data.success && data.appointments.all.length > 0) {
            appointmentsList.innerHTML = '';
            
            // Show upcoming appointments first
            if (data.appointments.upcoming.length > 0) {
                const upcomingSection = document.createElement('div');
                upcomingSection.innerHTML = '<h4 style="margin: 0 0 10px 0; color: #667eea;">Upcoming</h4>';
                data.appointments.upcoming.forEach(apt => {
                    upcomingSection.appendChild(createAppointmentCard(apt));
                });
                appointmentsList.appendChild(upcomingSection);
            }
            
            // Show past appointments
            if (data.appointments.past.length > 0) {
                const pastSection = document.createElement('div');
                pastSection.style.marginTop = '20px';
                pastSection.innerHTML = '<h4 style="margin: 0 0 10px 0; color: #999;">Past</h4>';
                data.appointments.past.slice(0, 3).forEach(apt => {
                    pastSection.appendChild(createAppointmentCard(apt));
                });
                appointmentsList.appendChild(pastSection);
            }
            
        } else {
            appointmentsList.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #999;">
                    <i class="fas fa-calendar" style="font-size: 48px; opacity: 0.3; margin-bottom: 10px; display: block;"></i>
                    <p>No appointments yet. Book your first appointment!</p>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error loading appointments:', error);
        document.getElementById('appointmentsList').innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #f44336;">
                <p>Failed to load appointments</p>
            </div>
        `;
    }
}

// Create appointment card
function createAppointmentCard(appointment) {
    const card = document.createElement('div');
    card.className = 'appointment-card';
    
    const date = new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    const statusClass = appointment.status.toLowerCase();
    const statusText = appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1);
    
    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <h4 style="margin: 0; color: #333; font-size: 15px;">${appointment.doctorName}</h4>
            <span class="appointment-status ${statusClass}">${statusText}</span>
        </div>
        <p style="margin: 5px 0; color: #666; font-size: 13px;">
            <i class="fas fa-stethoscope"></i> ${appointment.doctorSpecialty}
        </p>
        <p style="margin: 5px 0; color: #666; font-size: 13px;">
            <i class="fas fa-calendar"></i> ${date} at ${appointment.appointmentTime}
        </p>
        <p style="margin: 5px 0; color: #666; font-size: 13px;">
            <i class="fas fa-${appointment.consultationType === 'video' ? 'video' : appointment.consultationType === 'phone' ? 'phone' : 'hospital'}"></i> 
            ${appointment.consultationType.charAt(0).toUpperCase() + appointment.consultationType.slice(1)} Consultation
        </p>
        ${appointment.status === 'pending' ? `
            <button onclick="cancelAppointment('${appointment._id}')" 
                    style="margin-top: 10px; padding: 6px 12px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                <i class="fas fa-times"></i> Cancel
            </button>
        ` : ''}
    `;
    
    return card;
}

// Cancel appointment
async function cancelAppointment(appointmentId) {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
        return;
    }
    
    try {
        const response = await makeAPICall(
            API_CONFIG.ENDPOINTS.CANCEL_APPOINTMENT.replace(':id', appointmentId),
            { method: 'PATCH' }
        );
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Appointment cancelled successfully', 'success');
            loadUserAppointments();
        } else {
            showNotification(data.message || 'Failed to cancel appointment', 'error');
        }
        
    } catch (error) {
        console.error('Cancel error:', error);
        showNotification('Failed to cancel appointment', 'error');
    }
}

// Make cancelAppointment available globally
window.cancelAppointment = cancelAppointment;

// ==================== OPENSTREETMAP PHARMACY FINDER ====================

let pharmacyMap = null;
let userLocation = null;
let pharmacyMarkers = [];
let userMarker = null;

// Open Pharmacy Finder Modal
function openPharmacyFinder() {
    const modal = document.getElementById('pharmacyModal');
    modal.style.display = 'flex';
    
    // Initialize map if not already initialized
    if (!pharmacyMap && window.L) {
        setTimeout(() => initPharmacyMap(), 100);
    } else if (!window.L) {
        showNotification('Map is loading... Please wait and try again.', 'info');
        setTimeout(() => {
            if (window.L) {
                initPharmacyMap();
            }
        }, 1000);
    }
}

// Close Pharmacy Finder Modal
document.getElementById('closePharmacyModal')?.addEventListener('click', function() {
    document.getElementById('pharmacyModal').style.display = 'none';
});

// Initialize the pharmacy map with OpenStreetMap
function initPharmacyMap() {
    try {
        const mapDiv = document.getElementById('pharmacyMap');
        if (!mapDiv) return;

        // Clear any existing map
        mapDiv.innerHTML = '';

        // Default location (New York City)
        const defaultLocation = [40.7128, -74.0060];

        // Create map with OpenStreetMap
        pharmacyMap = L.map('pharmacyMap').setView(defaultLocation, 13);

        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(pharmacyMap);

        // Try to get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = [position.coords.latitude, position.coords.longitude];
                    
                    pharmacyMap.setView(userLocation, 14);
                    
                    // Add marker for user location (blue circle)
                    userMarker = L.circleMarker(userLocation, {
                        radius: 10,
                        fillColor: '#4285F4',
                        color: '#ffffff',
                        weight: 3,
                        opacity: 1,
                        fillOpacity: 1
                    }).addTo(pharmacyMap);
                    
                    userMarker.bindPopup('<b>📍 Your Location</b>').openPopup();

                    showNotification('Location detected! Searching for nearby pharmacies...', 'success');
                    
                    // Automatically search for nearby pharmacies
                    setTimeout(() => {
                        autoSearchPharmacies();
                    }, 500);
                },
                () => {
                    showNotification('Location access denied. Using default location.', 'info');
                    // Still search for pharmacies using default location
                    setTimeout(() => {
                        autoSearchPharmacies();
                    }, 500);
                }
            );
        } else {
            // No geolocation support, use default location
            setTimeout(() => {
                autoSearchPharmacies();
            }, 500);
        }

    } catch (error) {
        console.error('Map initialization error:', error);
        showNotification('Failed to initialize map. Please refresh and try again.', 'error');
    }
}

// Automatic pharmacy search using Overpass API (OpenStreetMap)
async function autoSearchPharmacies() {
    console.log('autoSearchPharmacies called');
    console.log('pharmacyMap exists:', !!pharmacyMap);
    console.log('userLocation:', userLocation);
    
    if (!pharmacyMap) {
        console.log('Map not ready for auto-search');
        return;
    }

    const location = userLocation || [40.7128, -74.0060];
    const radius = 10000; // Increased to 10km radius for better results

    console.log('Starting pharmacy search with location:', location, 'radius:', radius);
    await searchPharmacies(location, radius);
}

// Search for pharmacies using Overpass API
async function searchPharmacies(location, radius) {
    try {
        console.log('Searching for pharmacies at:', location, 'within', radius, 'meters');
        
        // Expanded Overpass API query for pharmacies and medical stores
        const query = `
            [out:json][timeout:25];
            (
                node["amenity"="pharmacy"](around:${radius},${location[0]},${location[1]});
                way["amenity"="pharmacy"](around:${radius},${location[0]},${location[1]});
                node["shop"="chemist"](around:${radius},${location[0]},${location[1]});
                way["shop"="chemist"](around:${radius},${location[0]},${location[1]});
                node["shop"="pharmacy"](around:${radius},${location[0]},${location[1]});
                way["shop"="pharmacy"](around:${radius},${location[0]},${location[1]});
                node["healthcare"="pharmacy"](around:${radius},${location[0]},${location[1]});
                way["healthcare"="pharmacy"](around:${radius},${location[0]},${location[1]});
                node["name"~"pharmacy|chemist|medical|drug",i](around:${radius},${location[0]},${location[1]});
                way["name"~"pharmacy|chemist|medical|drug",i](around:${radius},${location[0]},${location[1]});
            );
            out center;
        `;

        console.log('Overpass query:', query);

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
        });

        console.log('Overpass response status:', response.status);

        const data = await response.json();
        console.log('Overpass data received:', data);
        
        if (data.elements && data.elements.length > 0) {
            console.log('Found', data.elements.length, 'pharmacies');
            displayPharmacies(data.elements);
            showNotification(`Found ${data.elements.length} nearby pharmacies!`, 'success');
        } else {
            console.log('No pharmacies found in OpenStreetMap');
            
            // Show helpful message with sample data
            const pharmacyList = document.getElementById('pharmacyList');
            if (pharmacyList) {
                pharmacyList.innerHTML = `
                    <div style="padding: 20px; text-align: center;">
                        <i class="fas fa-info-circle" style="font-size: 48px; color: #ff9800; margin-bottom: 15px;"></i>
                        <h3 style="margin: 10px 0; color: #333;">No Pharmacies Found in OpenStreetMap</h3>
                        <p style="color: #666; margin: 10px 0;">This could mean:</p>
                        <ul style="text-align: left; color: #666; max-width: 400px; margin: 15px auto;">
                            <li>Your local pharmacies aren't in OpenStreetMap database yet</li>
                            <li>Try increasing the search radius to 10-20km</li>
                            <li>The pharmacy might be listed under a different name</li>
                        </ul>
                        <div style="margin-top: 20px; padding: 15px; background: #f0f8ff; border-radius: 8px;">
                            <p style="margin: 5px 0; color: #333;"><strong>💡 Tip:</strong> You can add your local pharmacy to OpenStreetMap!</p>
                            <a href="https://www.openstreetmap.org" target="_blank" 
                               style="display: inline-block; margin-top: 10px; padding: 8px 15px; background: #4285F4; color: white; text-decoration: none; border-radius: 4px;">
                                Visit OpenStreetMap
                            </a>
                        </div>
                        <button onclick="showSamplePharmacies()" 
                                style="margin-top: 15px; padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
                            📍 Show Sample Pharmacies (Demo)
                        </button>
                    </div>
                `;
            }
            document.getElementById('pharmacyCount').textContent = '0 pharmacies found';
            showNotification('No pharmacies found. OpenStreetMap may not have data for your area.', 'info');
        }

    } catch (error) {
        console.error('Pharmacy search error:', error);
        showNotification('Failed to search for pharmacies. Please try again.', 'error');
    }
}

// Find Nearby Pharmacies button handler
document.getElementById('findNearbyBtn')?.addEventListener('click', async function() {
    if (!pharmacyMap) {
        showNotification('Map not ready. Please wait...', 'error');
        return;
    }

    const btn = this;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    btn.disabled = true;

    try {
        const location = userLocation || [40.7128, -74.0060];
        const radius = parseInt(document.getElementById('radiusSelect').value);

        await searchPharmacies(location, radius);

    } catch (error) {
        showNotification('Search failed. Please try again.', 'error');
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
});

// Search Pharmacies by Name
document.getElementById('searchPharmacyBtn')?.addEventListener('click', async function() {
    if (!pharmacyMap) {
        showNotification('Map not ready. Please wait...', 'error');
        return;
    }

    const searchQuery = document.getElementById('pharmacySearch').value.trim();
    if (!searchQuery) {
        showNotification('Please enter a pharmacy name to search.', 'error');
        return;
    }

    const btn = this;
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    btn.disabled = true;

    try {
        const location = userLocation || [40.7128, -74.0060];
        const radius = parseInt(document.getElementById('radiusSelect').value);

        // Search and filter by name
        const query = `
            [out:json];
            (
                node["amenity"="pharmacy"]["name"~"${searchQuery}",i](around:${radius},${location[0]},${location[1]});
                way["amenity"="pharmacy"]["name"~"${searchQuery}",i](around:${radius},${location[0]},${location[1]});
            );
            out center;
        `;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: query
        });

        const data = await response.json();
        
        if (data.elements && data.elements.length > 0) {
            displayPharmacies(data.elements);
            showNotification(`Found ${data.elements.length} results for "${searchQuery}"`, 'success');
        } else {
            showNotification('No results found. Try a different search term.', 'info');
        }

    } catch (error) {
        showNotification('Search failed. Please try again.', 'error');
    } finally {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
});

// Display pharmacies on map and list
function displayPharmacies(pharmacies) {
    // Clear existing markers
    pharmacyMarkers.forEach(marker => pharmacyMap.removeLayer(marker));
    pharmacyMarkers = [];

    // Clear list
    const pharmacyList = document.getElementById('pharmacyList');
    pharmacyList.innerHTML = '';

    // Update count
    document.getElementById('pharmacyCount').textContent = `${pharmacies.length} pharmacies found`;

    // Create bounds to fit all markers
    const bounds = L.latLngBounds();
    if (userLocation) {
        bounds.extend(userLocation);
    }

    pharmacies.forEach((pharmacy) => {
        const lat = pharmacy.lat || pharmacy.center.lat;
        const lon = pharmacy.lon || pharmacy.center.lon;
        const name = pharmacy.tags?.name || 'Unnamed Pharmacy';
        const address = pharmacy.tags?.['addr:street'] || pharmacy.tags?.['addr:full'] || 'Address not available';
        const phone = pharmacy.tags?.phone || 'N/A';
        const openingHours = pharmacy.tags?.opening_hours || 'Hours not available';

        // Add marker to map
        const marker = L.marker([lat, lon], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }).addTo(pharmacyMap);

        bounds.extend([lat, lon]);

        // Create popup content
        const popupContent = `
            <div style="max-width: 250px; font-family: Arial;">
                <h3 style="margin: 0 0 10px 0; font-size: 16px;">${name}</h3>
                <p style="margin: 5px 0; font-size: 13px;"><strong>📍 Address:</strong> ${address}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>📞 Phone:</strong> ${phone}</p>
                <p style="margin: 5px 0; font-size: 13px;"><strong>🕒 Hours:</strong> ${openingHours}</p>
                <button onclick="getDirections(${lat}, ${lon})" 
                        style="margin-top: 10px; background: #4285F4; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; width: 100%;">
                    🚗 Get Directions
                </button>
            </div>
        `;

        marker.bindPopup(popupContent);
        pharmacyMarkers.push(marker);

        // Add to list
        const listItem = document.createElement('div');
        listItem.style.cssText = 'padding: 15px; border-bottom: 1px solid #eee; cursor: pointer; transition: background 0.2s;';
        listItem.innerHTML = `
            <h4 style="margin: 0 0 5px 0; color: #333; font-size: 16px;">${name}</h4>
            <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">📍 ${address}</p>
            <p style="margin: 0; font-size: 12px; color: #888;">📞 ${phone}</p>
        `;

        listItem.addEventListener('mouseenter', () => {
            listItem.style.backgroundColor = '#f0f8ff';
        });

        listItem.addEventListener('mouseleave', () => {
            listItem.style.backgroundColor = 'white';
        });

        listItem.addEventListener('click', () => {
            pharmacyMap.setView([lat, lon], 16);
            marker.openPopup();
        });

        pharmacyList.appendChild(listItem);
    });

    // Fit map to show all markers
    if (pharmacies.length > 0 && bounds.isValid()) {
        pharmacyMap.fitBounds(bounds, { padding: [50, 50] });
    }
}

// Get directions to pharmacy
function getDirections(lat, lon) {
    if (!userLocation) {
        // Open Google Maps in new tab
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
    } else {
        // Open Google Maps with directions from user location
        window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${lat},${lon}`, '_blank');
    }
}

// Search on Enter key
document.getElementById('pharmacySearch')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('searchPharmacyBtn').click();
    }
});

// Close modal on background click
document.getElementById('pharmacyModal')?.addEventListener('click', function(e) {
    if (e.target === this) {
        this.style.display = 'none';
    }
});

// Show sample pharmacies for demo purposes
function showSamplePharmacies() {
    const location = userLocation || [40.7128, -74.0060];
    
    // Create sample pharmacy data around user's location
    const samplePharmacies = [
        {
            lat: location[0] + 0.01,
            lon: location[1] + 0.01,
            tags: {
                name: "Sample Pharmacy 1",
                "addr:street": "123 Main Street",
                phone: "+1-555-0101",
                opening_hours: "Mon-Fri 9:00-18:00"
            }
        },
        {
            lat: location[0] - 0.01,
            lon: location[1] + 0.01,
            tags: {
                name: "Sample Pharmacy 2",
                "addr:street": "456 Oak Avenue",
                phone: "+1-555-0102",
                opening_hours: "Mon-Sun 8:00-20:00"
            }
        },
        {
            lat: location[0] + 0.01,
            lon: location[1] - 0.01,
            tags: {
                name: "Sample Pharmacy 3",
                "addr:street": "789 Pine Road",
                phone: "+1-555-0103",
                opening_hours: "Mon-Sat 10:00-19:00"
            }
        }
    ];
    
    displayPharmacies(samplePharmacies);
    showNotification('Showing 3 sample pharmacies for demonstration', 'info');
}

console.log('Pharmacy finder module loaded successfully (OpenStreetMap)');

// Doctor Modal Function
function showDoctorModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'doctorModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="
            background: rgba(30, 27, 62, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 25px;
            padding: 40px;
            max-width: 550px;
            width: 90%;
            border: 1px solid rgba(139, 92, 246, 0.3);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.3s ease;
        ">
            <div style="text-align: center; margin-bottom: 30px;">
                <i class="fas fa-user-md" style="font-size: 64px; color: #8b5cf6; margin-bottom: 15px;"></i>
                <h2 style="color: white; margin-bottom: 10px; font-size: 28px;">Connect with a Doctor</h2>
                <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px;">Choose your preferred consultation method</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 25px;">
                <button onclick="startVideoCall()" style="
                    padding: 20px;
                    background: linear-gradient(135deg, #8b5cf6, #ec4899);
                    border: none;
                    border-radius: 15px;
                    color: white;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 10px 30px rgba(139, 92, 246, 0.5)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    <i class="fas fa-video"></i>
                    Video Call
                </button>

                <button onclick="startVoiceCall()" style="
                    padding: 20px;
                    background: rgba(139, 92, 246, 0.2);
                    border: 2px solid rgba(139, 92, 246, 0.4);
                    border-radius: 15px;
                    color: white;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(139, 92, 246, 0.3)'; this.style.transform='translateY(-3px)';" onmouseout="this.style.background='rgba(139, 92, 246, 0.2)'; this.style.transform='translateY(0)';">
                    <i class="fas fa-phone"></i>
                    Voice Call
                </button>

                <button onclick="startMessageChat()" style="
                    padding: 20px;
                    background: rgba(139, 92, 246, 0.2);
                    border: 2px solid rgba(139, 92, 246, 0.4);
                    border-radius: 15px;
                    color: white;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(139, 92, 246, 0.3)'; this.style.transform='translateY(-3px)';" onmouseout="this.style.background='rgba(139, 92, 246, 0.2)'; this.style.transform='translateY(0)';">
                    <i class="fas fa-comments"></i>
                    Message
                </button>

                <button onclick="bookAppointment()" style="
                    padding: 20px;
                    background: rgba(139, 92, 246, 0.2);
                    border: 2px solid rgba(139, 92, 246, 0.4);
                    border-radius: 15px;
                    color: white;
                    font-size: 18px;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(139, 92, 246, 0.3)'; this.style.transform='translateY(-3px)';" onmouseout="this.style.background='rgba(139, 92, 246, 0.2)'; this.style.transform='translateY(0)';">
                    <i class="fas fa-calendar-check"></i>
                    Book Appointment
                </button>
            </div>

            <button onclick="closeDoctorModal()" style="
                width: 100%;
                padding: 15px;
                background: transparent;
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                color: rgba(255, 255, 255, 0.7);
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.05)'; this.style.color='white';" onmouseout="this.style.background='transparent'; this.style.color='rgba(255, 255, 255, 0.7)';">
                Cancel
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeDoctorModal() {
    const modal = document.getElementById('doctorModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }
}

function startVideoCall() {
    closeDoctorModal();
    showNotification('Starting video call...', 'info');
    setTimeout(() => {
        window.location.href = 'video-call.html';
    }, 500);
}

function startVoiceCall() {
    closeDoctorModal();
    showNotification('Starting voice call...', 'info');
    setTimeout(() => {
        window.location.href = 'video-call.html?audioOnly=true';
    }, 500);
}

function startMessageChat() {
    closeDoctorModal();
    showNotification('Opening message chat...', 'info');
    setTimeout(() => {
        showNotification('Message feature coming soon! For now, use the AI chat below.', 'info');
    }, 1000);
}

function bookAppointment() {
    closeDoctorModal();
    showNotification('Opening appointment booking...', 'info');
    setTimeout(() => {
        // Check if appointment modal exists
        const appointmentBtn = document.getElementById('appointmentBtn');
        if (appointmentBtn) {
            appointmentBtn.click();
        } else {
            showNotification('Appointment booking feature coming soon!', 'info');
        }
    }, 500);
}

// Profile Modal Function
function showProfileModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'profileModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="
            background: rgba(30, 27, 62, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 25px;
            padding: 40px;
            max-width: 600px;
            width: 90%;
            border: 1px solid rgba(139, 92, 246, 0.3);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.3s ease;
            max-height: 80vh;
            overflow-y: auto;
        ">
            <div style="text-align: center; margin-bottom: 30px;">
                <i class="fas fa-user-circle" style="font-size: 80px; color: #8b5cf6; margin-bottom: 15px;"></i>
                <h2 style="color: white; margin-bottom: 10px; font-size: 28px;">My Profile</h2>
                <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px;">Your personal information</p>
            </div>

            <div style="background: rgba(255, 255, 255, 0.05); border-radius: 15px; padding: 25px; margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 15px; color: white;">
                    <div style="font-weight: 600; color: rgba(255, 255, 255, 0.7);">Name:</div>
                    <div id="profileName">${userData.name || 'N/A'}</div>
                    
                    <div style="font-weight: 600; color: rgba(255, 255, 255, 0.7);">Username:</div>
                    <div id="profileUsername">${userData.username || 'N/A'}</div>
                    
                    <div style="font-weight: 600; color: rgba(255, 255, 255, 0.7);">Email:</div>
                    <div id="profileEmail">${userData.email || 'N/A'}</div>
                    
                    <div style="font-weight: 600; color: rgba(255, 255, 255, 0.7);">Age:</div>
                    <div id="profileAge">${userData.age || 'N/A'}</div>
                    
                    <div style="font-weight: 600; color: rgba(255, 255, 255, 0.7);">Gender:</div>
                    <div id="profileGender">${userData.gender || 'N/A'}</div>
                </div>
            </div>

            <div style="display: flex; gap: 15px;">
                <button onclick="editProfile()" style="
                    flex: 1;
                    padding: 15px;
                    background: linear-gradient(135deg, #8b5cf6, #ec4899);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 20px rgba(139, 92, 246, 0.5)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
                    <i class="fas fa-edit"></i> Edit Profile
                </button>
                <button onclick="closeProfileModal()" style="
                    flex: 1;
                    padding: 15px;
                    background: transparent;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    border-radius: 12px;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.borderColor='rgba(255, 255, 255, 0.5)';" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(255, 255, 255, 0.3)';">
                    Close
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeProfileModal() {
    const modal = document.getElementById('profileModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }
}

function editProfile() {
    closeProfileModal();
    showNotification('Profile editing feature coming soon!', 'info');
}

// Settings Modal Function
function showSettingsModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.id = 'settingsModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(10px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    `;

    modal.innerHTML = `
        <div style="
            background: rgba(30, 27, 62, 0.95);
            backdrop-filter: blur(20px);
            border-radius: 25px;
            padding: 40px;
            max-width: 600px;
            width: 90%;
            border: 1px solid rgba(139, 92, 246, 0.3);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            animation: slideUp 0.3s ease;
            max-height: 80vh;
            overflow-y: auto;
        ">
            <div style="text-align: center; margin-bottom: 30px;">
                <i class="fas fa-cog" style="font-size: 80px; color: #8b5cf6; margin-bottom: 15px;"></i>
                <h2 style="color: white; margin-bottom: 10px; font-size: 28px;">Settings</h2>
                <p style="color: rgba(255, 255, 255, 0.7); font-size: 16px;">Customize your experience</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 20px;">
                <!-- Notifications -->
                <div style="
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div>
                        <div style="color: white; font-weight: 600; margin-bottom: 5px;">
                            <i class="fas fa-bell"></i> Notifications
                        </div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                            Receive health reminders and updates
                        </div>
                    </div>
                    <label style="position: relative; display: inline-block; width: 60px; height: 34px;">
                        <input type="checkbox" id="notificationsToggle" checked style="opacity: 0; width: 0; height: 0;">
                        <span style="
                            position: absolute;
                            cursor: pointer;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background-color: #8b5cf6;
                            transition: 0.4s;
                            border-radius: 34px;
                        " onclick="this.parentElement.querySelector('input').click()"></span>
                    </label>
                </div>

                <!-- Dark Mode -->
                <div style="
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div>
                        <div style="color: white; font-weight: 600; margin-bottom: 5px;">
                            <i class="fas fa-moon"></i> Dark Mode
                        </div>
                        <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                            Currently enabled
                        </div>
                    </div>
                    <label style="position: relative; display: inline-block; width: 60px; height: 34px;">
                        <input type="checkbox" id="darkModeToggle" checked style="opacity: 0; width: 0; height: 0;">
                        <span style="
                            position: absolute;
                            cursor: pointer;
                            top: 0;
                            left: 0;
                            right: 0;
                            bottom: 0;
                            background-color: #8b5cf6;
                            transition: 0.4s;
                            border-radius: 34px;
                        " onclick="this.parentElement.querySelector('input').click()"></span>
                    </label>
                </div>

                <!-- Privacy -->
                <div style="
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'">
                    <div style="color: white; font-weight: 600; margin-bottom: 5px;">
                        <i class="fas fa-lock"></i> Privacy & Security
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                        Manage your data and security settings
                    </div>
                </div>

                <!-- Language -->
                <div style="
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'">
                    <div style="color: white; font-weight: 600; margin-bottom: 5px;">
                        <i class="fas fa-language"></i> Language
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                        English (US)
                    </div>
                </div>

                <!-- Help & Support -->
                <div style="
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 15px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'">
                    <div style="color: white; font-weight: 600; margin-bottom: 5px;">
                        <i class="fas fa-question-circle"></i> Help & Support
                    </div>
                    <div style="color: rgba(255, 255, 255, 0.6); font-size: 14px;">
                        Get help and contact support
                    </div>
                </div>
            </div>

            <button onclick="closeSettingsModal()" style="
                width: 100%;
                margin-top: 25px;
                padding: 15px;
                background: transparent;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-radius: 12px;
                color: rgba(255, 255, 255, 0.8);
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.1)'; this.style.borderColor='rgba(255, 255, 255, 0.5)';" onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(255, 255, 255, 0.3)';">
                Close
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }
}

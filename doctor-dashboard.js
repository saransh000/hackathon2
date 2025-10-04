// Initialize dashboard
let isAvailable = true;
let consultationQueue = [];
let currentRoomId = null;

// Load doctor info on page load
window.addEventListener('load', function() {
    loadDoctorInfo();
    loadConsultationQueue();
    loadTodayAppointments();
    loadRecentHistory();
    updateStats();
    
    // Check for consultation requests every 5 seconds
    setInterval(checkForNewConsultations, 5000);
});

// Load doctor information
function loadDoctorInfo() {
    const doctorName = localStorage.getItem('doctorName') || 'Doctor';
    const specialization = localStorage.getItem('doctorSpecialization') || 'General';
    
    document.getElementById('doctorName').textContent = doctorName;
    document.getElementById('doctorSpec').textContent = specialization.charAt(0).toUpperCase() + specialization.slice(1);
}

// Toggle availability status
function toggleAvailability() {
    isAvailable = !isAvailable;
    const statusToggle = document.getElementById('statusToggle');
    const statusText = document.getElementById('statusText');
    
    if (isAvailable) {
        statusToggle.classList.remove('offline');
        statusText.textContent = 'Available';
        showNotification('You are now available for consultations', 'success');
    } else {
        statusToggle.classList.add('offline');
        statusText.textContent = 'Offline';
        showNotification('You are now offline', 'info');
    }
}

// Load consultation queue from localStorage
function loadConsultationQueue() {
    const queue = localStorage.getItem('consultationQueue');
    consultationQueue = queue ? JSON.parse(queue) : [];
    
    // Add demo patients if queue is empty (for testing)
    if (consultationQueue.length === 0) {
        consultationQueue = [
            {
                id: Date.now() + 1,
                patientName: 'John Smith',
                age: 45,
                symptoms: 'Persistent headache, dizziness, and nausea for the past 3 days',
                urgency: 'high',
                waitTime: '5 min',
                roomId: `consultation-${Date.now() + 1}`
            },
            {
                id: Date.now() + 2,
                patientName: 'Emily Davis',
                age: 32,
                symptoms: 'Fever and sore throat',
                urgency: 'medium',
                waitTime: '12 min',
                roomId: `consultation-${Date.now() + 2}`
            }
        ];
    }
    
    renderQueue();
}

// Render patient queue
function renderQueue() {
    const container = document.getElementById('queueContainer');
    
    if (consultationQueue.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-clock"></i>
                <p>No patients in queue</p>
                <small>Patients requesting consultations will appear here</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = consultationQueue.map(patient => `
        <div class="patient-card" data-patient-id="${patient.id}">
            <div class="patient-header">
                <div class="patient-info">
                    <div class="patient-name">${patient.patientName}</div>
                    <div class="patient-age">${patient.age} years old</div>
                </div>
                <span class="urgency-badge urgency-${patient.urgency}">
                    ${patient.urgency.toUpperCase()}
                </span>
            </div>
            
            <div class="patient-symptoms">
                <h4>Symptoms:</h4>
                <p>${patient.symptoms}</p>
            </div>
            
            <div class="patient-meta">
                <span><i class="fas fa-clock"></i> Waiting: ${patient.waitTime}</span>
                <span><i class="fas fa-video"></i> Video Call Requested</span>
            </div>
            
            <div class="patient-actions">
                <button class="btn-join" onclick="joinConsultation('${patient.roomId}', '${patient.id}')">
                    <i class="fas fa-video"></i> Join Video Call
                </button>
                <button class="btn-skip" onclick="skipPatient('${patient.id}')">
                    <i class="fas fa-forward"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Join consultation video call
function joinConsultation(roomId, patientId) {
    currentRoomId = roomId;
    
    // Store room ID in localStorage so video-call.html can use it
    localStorage.setItem('currentConsultationRoom', roomId);
    localStorage.setItem('isDoctor', 'true');
    
    showNotification('Starting video consultation...', 'info');
    
    // Remove patient from queue
    consultationQueue = consultationQueue.filter(p => p.id !== patientId);
    localStorage.setItem('consultationQueue', JSON.stringify(consultationQueue));
    
    // Redirect to video call page
    setTimeout(() => {
        window.location.href = 'video-call.html';
    }, 500);
}

// Skip patient in queue
function skipPatient(patientId) {
    if (confirm('Are you sure you want to skip this patient?')) {
        consultationQueue = consultationQueue.filter(p => p.id !== patientId);
        localStorage.setItem('consultationQueue', JSON.stringify(consultationQueue));
        renderQueue();
        updateStats();
        showNotification('Patient moved to end of queue', 'info');
    }
}

// Check for new consultation requests
function checkForNewConsultations() {
    // In a real app, this would poll the backend API
    // For demo, we'll check localStorage
    const queue = localStorage.getItem('consultationQueue');
    if (queue) {
        const newQueue = JSON.parse(queue);
        if (newQueue.length > consultationQueue.length) {
            consultationQueue = newQueue;
            renderQueue();
            updateStats();
            showNotification('New patient added to queue!', 'success');
            
            // Play notification sound (optional)
            playNotificationSound();
        }
    }
}

// Load today's appointments
function loadTodayAppointments() {
    const container = document.getElementById('appointmentsContainer');
    
    // Demo appointments
    const appointments = [
        {
            id: 1,
            time: '10:00 AM',
            patientName: 'Sarah Johnson',
            type: 'Follow-up Consultation'
        },
        {
            id: 2,
            time: '2:30 PM',
            patientName: 'Michael Brown',
            type: 'Initial Checkup'
        }
    ];
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-times"></i>
                <p>No appointments scheduled for today</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appointments.map(apt => `
        <div class="appointment-card">
            <div class="appointment-time">
                <div class="time-badge">
                    <div class="hour">${apt.time.split(':')[0]}:${apt.time.split(':')[1].split(' ')[0]}</div>
                    <div class="period">${apt.time.split(' ')[1]}</div>
                </div>
                <div class="appointment-details">
                    <h4>${apt.patientName}</h4>
                    <p>${apt.type}</p>
                </div>
            </div>
            <div class="appointment-actions">
                <button onclick="startAppointment(${apt.id})">
                    <i class="fas fa-video"></i> Start Call
                </button>
                <button onclick="viewPatientDetails(${apt.id})">
                    <i class="fas fa-file-medical"></i> View Details
                </button>
            </div>
        </div>
    `).join('');
    
    document.getElementById('todayAppointments').textContent = appointments.length;
}

// Load recent consultation history
function loadRecentHistory() {
    const container = document.getElementById('historyContainer');
    
    // Demo history
    const history = [
        {
            id: 1,
            patientName: 'David Wilson',
            date: 'Today, 9:00 AM',
            duration: '15 min',
            diagnosis: 'Common Cold'
        },
        {
            id: 2,
            patientName: 'Lisa Anderson',
            date: 'Yesterday, 3:30 PM',
            duration: '20 min',
            diagnosis: 'Migraine'
        }
    ];
    
    if (history.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>No consultation history</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = history.map(item => `
        <div class="history-card">
            <div class="history-info">
                <h4>${item.patientName}</h4>
                <div class="history-meta">
                    <span><i class="fas fa-calendar"></i> ${item.date}</span>
                    <span><i class="fas fa-clock"></i> ${item.duration}</span>
                    <span><i class="fas fa-notes-medical"></i> ${item.diagnosis}</span>
                </div>
            </div>
            <button onclick="viewConsultationDetails(${item.id})" style="padding: 10px 20px; background: rgba(139, 92, 246, 0.2); border: 1px solid rgba(139, 92, 246, 0.4); border-radius: 10px; color: white; font-weight: 600; cursor: pointer;">
                View Details
            </button>
        </div>
    `).join('');
}

// Update statistics
function updateStats() {
    document.getElementById('activeCalls').textContent = '0';
    document.getElementById('waitingPatients').textContent = consultationQueue.length;
    document.getElementById('totalMinutes').textContent = '180';
}

// Refresh queue
function refreshQueue() {
    loadConsultationQueue();
    showNotification('Queue refreshed', 'success');
}

// View all appointments
function viewAllAppointments() {
    showNotification('Opening appointments manager...', 'info');
    // Could redirect to a dedicated appointments page
}

// Start appointment
function startAppointment(aptId) {
    const roomId = `appointment-${aptId}-${Date.now()}`;
    localStorage.setItem('currentConsultationRoom', roomId);
    localStorage.setItem('isDoctor', 'true');
    
    showNotification('Starting scheduled appointment...', 'info');
    setTimeout(() => {
        window.location.href = 'video-call.html';
    }, 500);
}

// View patient details
function viewPatientDetails(patientId) {
    showNotification('Loading patient details...', 'info');
}

// View consultation details
function viewConsultationDetails(consultationId) {
    showNotification('Loading consultation history...', 'info');
}

// Close modal
function closeModal() {
    document.getElementById('consultationModal').style.display = 'none';
}

// Accept consultation
function acceptConsultation() {
    showNotification('Starting consultation...', 'success');
    closeModal();
}

// Decline consultation
function declineConsultation() {
    showNotification('Consultation declined', 'info');
    closeModal();
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('doctorId');
        localStorage.removeItem('doctorName');
        localStorage.removeItem('doctorSpecialization');
        localStorage.removeItem('isDoctor');
        window.location.href = 'doctor-login.html';
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        max-width: 350px;
    `;

    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #8b5cf6, #ec4899)';
    }

    notification.textContent = message;
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

// Play notification sound (optional)
function playNotificationSound() {
    // You can add an audio element here for notification sounds
    console.log('🔔 New patient notification');
}

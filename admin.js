// Initialize Dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    setupNavigation();
    setupEventListeners();
    updateLastUpdatedTime();
    startRealTimeUpdates();
});

// Navigation
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));
            
            // Show selected section
            const sectionId = this.getAttribute('data-section');
            document.getElementById(sectionId).classList.add('active');
            
            // Update page title
            const pageTitle = this.querySelector('span').textContent;
            document.getElementById('pageTitle').textContent = pageTitle;
        });
    });
}

// Event Listeners
function setupEventListeners() {
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', function() {
        this.querySelector('i').style.animation = 'spin 1s linear';
        setTimeout(() => {
            this.querySelector('i').style.animation = '';
            showNotification('Data refreshed successfully', 'success');
            refreshMetrics();
        }, 1000);
    });

    // Time filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateUserActivityChart(this.getAttribute('data-period'));
        });
    });

    // Editor tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadRecommendationContent(this.textContent);
        });
    });

    // User search
    document.getElementById('userSearch').addEventListener('input', function(e) {
        filterUsers(e.target.value);
    });

    // Add animation to refresh icon
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize Charts
function initializeCharts() {
    // Overview Chart
    const overviewCtx = document.getElementById('overviewChart').getContext('2d');
    new Chart(overviewCtx, {
        type: 'line',
        data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'],
            datasets: [{
                label: 'Active Users',
                data: [320, 280, 450, 890, 1120, 980, 760],
                borderColor: 'rgb(102, 126, 234)',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }, {
                label: 'Triage Analyses',
                data: [180, 220, 380, 650, 890, 720, 580],
                borderColor: 'rgb(118, 75, 162)',
                backgroundColor: 'rgba(118, 75, 162, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // User Activity Chart
    const activityCtx = document.getElementById('userActivityChart').getContext('2d');
    window.userActivityChart = new Chart(activityCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Active Users',
                data: [1200, 1350, 1100, 1450, 1600, 980, 850],
                backgroundColor: 'rgba(102, 126, 234, 0.8)',
            }, {
                label: 'New Sign-ups',
                data: [120, 145, 98, 167, 189, 112, 95],
                backgroundColor: 'rgba(76, 175, 80, 0.8)',
            }, {
                label: 'Triage Analyses',
                data: [2400, 2650, 2200, 2890, 3200, 1960, 1700],
                backgroundColor: 'rgba(33, 150, 243, 0.8)',
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Recommendation Distribution Chart
    const recommendationCtx = document.getElementById('recommendationChart').getContext('2d');
    new Chart(recommendationCtx, {
        type: 'doughnut',
        data: {
            labels: ['Home Remedy', 'Doctor Visit', 'Emergency'],
            datasets: [{
                data: [65, 28, 7],
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',
                    'rgba(255, 152, 0, 0.8)',
                    'rgba(244, 67, 54, 0.8)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}

// Update User Activity Chart based on period
function updateUserActivityChart(period) {
    let labels, data1, data2, data3;
    
    switch(period) {
        case 'day':
            labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'];
            data1 = [320, 280, 450, 890, 1120, 980, 760];
            data2 = [30, 28, 45, 89, 112, 98, 76];
            data3 = [640, 560, 900, 1780, 2240, 1960, 1520];
            break;
        case 'week':
            labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            data1 = [1200, 1350, 1100, 1450, 1600, 980, 850];
            data2 = [120, 145, 98, 167, 189, 112, 95];
            data3 = [2400, 2650, 2200, 2890, 3200, 1960, 1700];
            break;
        case 'month':
            labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
            data1 = [8500, 9200, 8800, 9600];
            data2 = [850, 920, 880, 960];
            data3 = [17000, 18400, 17600, 19200];
            break;
    }
    
    window.userActivityChart.data.labels = labels;
    window.userActivityChart.data.datasets[0].data = data1;
    window.userActivityChart.data.datasets[1].data = data2;
    window.userActivityChart.data.datasets[2].data = data3;
    window.userActivityChart.update();
}

// Refresh Metrics
function refreshMetrics() {
    // Simulate data refresh with slight variations
    const activeUsers = document.getElementById('activeUsers');
    const newSignups = document.getElementById('newSignups');
    const triageAnalyses = document.getElementById('triageAnalyses');
    const emergencyAlerts = document.getElementById('emergencyAlerts');
    
    activeUsers.textContent = Math.floor(1200 + Math.random() * 100);
    newSignups.textContent = Math.floor(140 + Math.random() * 20);
    triageAnalyses.textContent = Math.floor(2800 + Math.random() * 100);
    emergencyAlerts.textContent = Math.floor(30 + Math.random() * 10);
    
    updateLastUpdatedTime();
}

// Update Last Updated Time
function updateLastUpdatedTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    document.getElementById('lastUpdated').textContent = timeString;
}

// Real-time Updates (every 30 seconds)
function startRealTimeUpdates() {
    setInterval(() => {
        updateLastUpdatedTime();
        // You can add more real-time update logic here
    }, 30000);
}

// Load Recommendation Content
function loadRecommendationContent(type) {
    const textarea = document.querySelector('.editor-textarea');
    
    switch(type) {
        case 'Home Remedy':
            textarea.value = `• Get plenty of rest and stay hydrated
• Use over-the-counter medications as needed (follow package directions)
• Monitor your symptoms for any worsening
• Maintain a healthy diet with plenty of fluids
• If symptoms persist beyond 3-5 days, consider seeing a doctor`;
            break;
        case 'Doctor Visit':
            textarea.value = `• Schedule an appointment with your primary care physician within 24-48 hours
• Monitor your symptoms and note any changes
• Keep track of your temperature if you have a fever
• Prepare a list of all symptoms and their duration
• Avoid strenuous activities until consultation`;
            break;
        case 'Emergency':
            textarea.value = `• Call 911 or go to the nearest emergency room immediately
• Do not drive yourself - call an ambulance
• If possible, have someone stay with you
• Bring a list of current medications
• This is a potentially life-threatening situation requiring immediate medical attention`;
            break;
    }
}

// Filter Users
function filterUsers(searchTerm) {
    const rows = document.querySelectorAll('.user-table tbody tr');
    searchTerm = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
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
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #4caf50, #8bc34a)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #f44336, #e91e63)';
            break;
        case 'info':
            notification.style.background = 'linear-gradient(135deg, #2196f3, #03a9f4)';
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

// Button Actions
document.addEventListener('click', function(e) {
    // Add Entry Button
    if (e.target.closest('.add-btn')) {
        showNotification('Add new entry feature coming soon!', 'info');
    }
    
    // Edit Button
    if (e.target.closest('.edit-btn')) {
        showNotification('Edit feature coming soon!', 'info');
    }
    
    // Delete Button
    if (e.target.closest('.delete-btn')) {
        if (confirm('Are you sure you want to delete this entry?')) {
            showNotification('Entry deleted successfully', 'success');
        }
    }
    
    // Save Button
    if (e.target.closest('.save-btn')) {
        showNotification('Changes saved successfully!', 'success');
    }
    
    // Alert Action Button
    if (e.target.closest('.alert-action')) {
        showNotification('Loading alert details...', 'info');
    }
    
    // User Action Buttons
    if (e.target.closest('.action-btn-sm')) {
        const btn = e.target.closest('.action-btn-sm');
        if (btn.title === 'View Details') {
            showNotification('Loading user details...', 'info');
        } else if (btn.title === 'Reset Password') {
            showNotification('Password reset email sent', 'success');
        } else if (btn.title === 'Deactivate') {
            if (confirm('Are you sure you want to deactivate this user?')) {
                showNotification('User deactivated successfully', 'success');
            }
        }
    }
    
    // Export Button
    if (e.target.closest('.export-btn')) {
        showNotification('Exporting user data...', 'info');
        setTimeout(() => {
            showNotification('Export completed successfully', 'success');
        }, 2000);
    }
    
    // Settings Buttons
    if (e.target.closest('.settings-btn')) {
        showNotification('Feature coming soon!', 'info');
    }
});

console.log('CureMind Admin Dashboard initialized successfully');

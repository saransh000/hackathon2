// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Basic validation
    if (username.trim() === '' || password.trim() === '') {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Show loading
    showNotification('Logging in...', 'info');
    
    try {
        // Make API call to login endpoint
        const response = await makeAPICall(API_CONFIG.ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({
                username: username.trim(),
                password: password
            })
        });
        
        if (response.success) {
            // Store authentication data
            setAuthToken(response.data.token);
            localStorage.setItem('userRole', response.data.user.role);
            localStorage.setItem('username', response.data.user.username);
            localStorage.setItem('userId', response.data.user.id);
            
            // Store user data for the app
            localStorage.setItem('userData', JSON.stringify(response.data.user));
            
            if (remember) {
                localStorage.setItem('rememberedUser', username);
            }
            
            // Success notification
            const userRole = response.data.user.role;
            const redirectMessage = userRole === 'admin' ? 
                'Admin login successful! Redirecting to Admin Dashboard...' : 
                'Login successful! Redirecting to Dashboard...';
            
            showNotification(redirectMessage, 'success');
            
            // Redirect based on user role
            setTimeout(() => {
                if (userRole === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1500);
        }
        
    } catch (error) {
        const errorMessage = handleAPIError(error, 'Login failed. Please check your credentials.');
        showNotification(errorMessage, 'error');
        console.error('Login error:', error);
    }
});

// Notification System
function showNotification(message, type) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    // Set background color based on type
    switch(type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #f093fb, #f5576c)';
            break;
        case 'info':
            notification.style.background = 'linear-gradient(135deg, #4facfe, #00f2fe)';
            break;
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
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

// Check for remembered user on page load
window.addEventListener('load', () => {
    const rememberedUser = localStorage.getItem('rememberedUser');
    if (rememberedUser) {
        document.getElementById('username').value = rememberedUser;
        document.getElementById('remember').checked = true;
    }
});

// Forgot Password Handler
document.querySelector('.forgot-password').addEventListener('click', function(e) {
    e.preventDefault();
    showNotification('Password reset link will be sent to your email', 'info');
});

// Add input animations
const inputs = document.querySelectorAll('.input-group input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'translateY(-2px)';
        this.parentElement.style.transition = 'transform 0.3s ease';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'translateY(0)';
    });
});

// Add floating animation variance to shapes
document.addEventListener('DOMContentLoaded', () => {
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        const rotation = Math.random() * 360;
        shape.style.setProperty('--rotation', `${rotation}deg`);
    });
});

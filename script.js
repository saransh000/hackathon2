// Admin Credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
    // You can add more admin accounts here
    // username2: 'admin2',
    // password2: 'admin456'
};

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Basic validation
    if (username.trim() === '' || password.trim() === '') {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    // Simulate login process
    showNotification('Logging in...', 'info');
    
    // Check credentials and route accordingly
    setTimeout(() => {
        // Check if admin credentials
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            // Admin login
            showNotification('Admin login successful! Redirecting to Admin Dashboard...', 'success');
            
            // Store admin session
            localStorage.setItem('userRole', 'admin');
            localStorage.setItem('username', username);
            
            if (remember) {
                localStorage.setItem('rememberedUser', username);
            }
            
            // Redirect to admin dashboard
            setTimeout(() => {
                window.location.href = 'admin.html';
                console.log('Redirecting to admin dashboard...');
            }, 1500);
        } else {
            // Regular user login (any other username/password combination)
            showNotification('Login successful! Redirecting to Dashboard...', 'success');
            
            // Store user session
            localStorage.setItem('userRole', 'user');
            localStorage.setItem('username', username);
            
            if (remember) {
                localStorage.setItem('rememberedUser', username);
            }
            
            // Redirect to user dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
                console.log('Redirecting to user dashboard...');
            }, 1500);
        }
    }, 1000);
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

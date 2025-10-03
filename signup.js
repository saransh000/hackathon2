// Password Toggle Functionality
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    confirmPasswordInput.setAttribute('type', type);
    this.classList.toggle('fa-eye');
    this.classList.toggle('fa-eye-slash');
});

// Password Strength Checker
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 15;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 15;
    
    // Contains numbers
    if (/[0-9]/.test(password)) strength += 10;
    
    // Contains special characters
    if (/[^A-Za-z0-9]/.test(password)) strength += 10;
    
    // Update strength bar
    strengthFill.style.width = strength + '%';
    
    // Update color and text
    if (strength < 30) {
        strengthFill.style.background = '#f87171';
        strengthText.textContent = 'Weak Password';
        strengthText.style.color = '#f87171';
    } else if (strength < 60) {
        strengthFill.style.background = '#fbbf24';
        strengthText.textContent = 'Medium Password';
        strengthText.style.color = '#fbbf24';
    } else if (strength < 85) {
        strengthFill.style.background = '#60a5fa';
        strengthText.textContent = 'Strong Password';
        strengthText.style.color = '#60a5fa';
    } else {
        strengthFill.style.background = '#4ade80';
        strengthText.textContent = 'Very Strong Password';
        strengthText.style.color = '#4ade80';
    }
    
    if (password === '') {
        strengthFill.style.width = '0%';
        strengthText.textContent = 'Password Strength';
        strengthText.style.color = 'rgba(255, 255, 255, 0.7)';
    }
});

// Form Submission Handler
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const age = parseInt(document.getElementById('age').value);
    const gender = document.getElementById('gender').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAccepted = document.getElementById('terms').checked;
    
    // Validation
    if (!firstName || !lastName || !username || !email || !age || !gender || !password) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
    }
    
    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
    if (!termsAccepted) {
        showNotification('Please accept the Terms & Conditions', 'error');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    // Age validation
    if (age < 1 || age > 120) {
        showNotification('Please enter a valid age', 'error');
        return;
    }
    
    // Show loading
    showNotification('Creating your account...', 'info');
    
    try {
        // Make API call to register endpoint
        const response = await makeAPICall(API_CONFIG.ENDPOINTS.REGISTER, {
            method: 'POST',
            body: JSON.stringify({
                username: username,
                password: password,
                email: email,
                firstName: firstName,
                lastName: lastName,
                age: age,
                gender: gender
            })
        });
        
        if (response.success) {
            showNotification('Account created successfully! Redirecting to login...', 'success');
            
            // Store username for auto-fill on login page
            localStorage.setItem('newUsername', username);
            
            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
        
    } catch (error) {
        const errorMessage = handleAPIError(error, 'Registration failed. Please try again.');
        showNotification(errorMessage, 'error');
        console.error('Registration error:', error);
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
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 400px;
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
    
    // Remove notification after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
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

// Add input animations
const inputs = document.querySelectorAll('.input-group input, .input-group select');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'translateY(-2px)';
        this.parentElement.style.transition = 'transform 0.3s ease';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'translateY(0)';
    });
});

// Auto-fill username if coming from successful registration
window.addEventListener('load', () => {
    const newUsername = localStorage.getItem('newUsername');
    if (newUsername) {
        // This is for if user returns to signup page
        localStorage.removeItem('newUsername');
    }
});

// Real-time username validation (check if available - optional)
let usernameTimeout;
document.getElementById('username').addEventListener('input', function() {
    clearTimeout(usernameTimeout);
    const username = this.value.trim();
    
    if (username.length >= 3) {
        usernameTimeout = setTimeout(() => {
            // Add visual feedback for username
            if (/^[a-zA-Z0-9_]+$/.test(username)) {
                this.style.borderColor = 'rgba(74, 222, 128, 0.5)';
            } else {
                this.style.borderColor = 'rgba(248, 113, 113, 0.5)';
            }
        }, 500);
    } else {
        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }
});

// Email validation feedback
document.getElementById('email').addEventListener('blur', function() {
    const email = this.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        this.style.borderColor = 'rgba(248, 113, 113, 0.5)';
        showNotification('Please enter a valid email address', 'error');
    } else if (email) {
        this.style.borderColor = 'rgba(74, 222, 128, 0.5)';
    }
});

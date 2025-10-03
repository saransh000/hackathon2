// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    ENDPOINTS: {
        // Auth endpoints
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        VERIFY: '/auth/verify',
        ME: '/auth/me',
        
        // User endpoints
        PROFILE: '/users/profile',
        STATS: '/users/stats',
        PASSWORD: '/users/password',
        
        // Analysis endpoints
        ANALYZE: '/analysis/analyze',
        HISTORY: '/analysis/history',
        FEEDBACK: '/analysis/:id/feedback',
        
        // Appointment endpoints
        BOOK_APPOINTMENT: '/appointments/book',
        MY_APPOINTMENTS: '/appointments/my-appointments',
        ALL_APPOINTMENTS: '/appointments/all',
        APPOINTMENT_BY_ID: '/appointments/:id',
        CANCEL_APPOINTMENT: '/appointments/:id/cancel',
        UPDATE_APPOINTMENT_STATUS: '/appointments/:id/status',
        AVAILABLE_SLOTS: '/appointments/available-slots',
        
        // Admin endpoints
        ADMIN_OVERVIEW: '/admin/overview',
        
        // Health check
        HEALTH: '/health'
    }
};

// Helper function to make API calls
async function makeAPICall(endpoint, options = {}) {
    const url = API_CONFIG.BASE_URL + endpoint;
    const token = localStorage.getItem('authToken');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };
    
    try {
        const response = await fetch(url, finalOptions);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }
        
        return data;
    } catch (error) {
        console.error('API Call Error:', error);
        throw error;
    }
}

// Helper function to handle API errors
function handleAPIError(error, fallbackMessage = 'An error occurred') {
    console.error('API Error:', error);
    
    if (error.message.includes('Failed to fetch')) {
        return 'Unable to connect to server. Please check your connection.';
    }
    
    return error.message || fallbackMessage;
}

// Helper function to store auth token
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

// Helper function to remove auth token
function clearAuthToken() {
    localStorage.removeItem('authToken');
}

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('authToken');
}
# CureMind Backend API Documentation

## Overview
The CureMind Backend API provides comprehensive healthcare triage services with AI-powered symptom analysis, user management, and administrative features.

**Base URL:** `http://localhost:5000/api`

## Authentication
The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this structure:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {...}, // Response data (optional)
  "timestamp": "ISO timestamp"
}
```

---

## Authentication Endpoints

### POST /auth/login
Login user and receive JWT token.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "username": "admin",
      "role": "admin|user",
      "profile": {...},
      "lastActive": "2025-10-03T..."
    }
  }
}
```

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "age": 32,
    "gender": "Male"
  }
}
```

### GET /auth/me
Get current user information. Requires authentication.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "john_doe",
      "email": "john@example.com",
      "role": "user",
      "profile": {...}
    }
  }
}
```

### POST /auth/logout
Logout user. Requires authentication.

### GET /auth/verify
Verify JWT token validity. Requires authentication.

---

## Symptom Analysis Endpoints

### POST /analysis/analyze
Analyze symptoms using AI. Requires authentication.

**Request Body:**
```json
{
  "symptoms": "I have been experiencing severe chest pain and difficulty breathing for the past hour.",
  "sessionId": "optional_session_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Symptom analysis completed",
  "data": {
    "sessionId": "session_12345",
    "analysis": {
      "severity": "emergency",
      "confidence": 95,
      "conditions": [
        {
          "name": "Medical Emergency",
          "probability": "High Risk",
          "description": "Immediate medical attention required"
        }
      ],
      "recommendations": {
        "title": "🚨 SEEK IMMEDIATE MEDICAL ATTENTION",
        "type": "emergency",
        "actions": [
          "Call 911 or go to the nearest emergency room immediately",
          "Do not drive yourself - call an ambulance"
        ]
      }
    },
    "processingTime": 2150,
    "timestamp": "2025-10-03T..."
  }
}
```

### GET /analysis/history
Get user's symptom analysis history. Requires authentication.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `severity`: Filter by severity (home|doctor|emergency)

**Response:**
```json
{
  "success": true,
  "data": {
    "analyses": [...],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 47
    }
  }
}
```

### GET /analysis/:id
Get specific analysis by ID. Requires authentication.

### POST /analysis/:id/feedback
Submit feedback for an analysis. Requires authentication.

**Request Body:**
```json
{
  "helpful": true,
  "rating": 5,
  "comment": "Very accurate and helpful analysis"
}
```

---

## User Management Endpoints

### GET /users/profile
Get current user's profile. Requires authentication.

### PUT /users/profile
Update user profile. Requires authentication.

**Request Body:**
```json
{
  "profile": {
    "firstName": "John",
    "lastName": "Doe",
    "age": 33,
    "phoneNumber": "+1234567890"
  },
  "medicalHistory": {
    "allergies": ["Penicillin", "Peanuts"],
    "medications": ["Aspirin 81mg daily"],
    "conditions": ["Hypertension"],
    "bloodType": "O+"
  },
  "preferences": {
    "notifications": true,
    "privacyLevel": "private"
  }
}
```

### GET /users/stats
Get user statistics. Requires authentication.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAnalyses": 15,
    "recentAnalyses": 3,
    "severityBreakdown": {
      "home": 10,
      "doctor": 4,
      "emergency": 1
    },
    "lastAnalyses": [...],
    "memberSince": "2025-09-01T...",
    "lastActive": "2025-10-03T..."
  }
}
```

### PUT /users/password
Change user password. Requires authentication.

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

### DELETE /users/account
Delete user account. Requires authentication.

**Request Body:**
```json
{
  "password": "currentpassword123"
}
```

---

## Admin Endpoints (Admin Role Required)

### GET /admin/overview
Get dashboard overview statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1250,
      "active": 89,
      "newThisMonth": 156,
      "growth": [...]
    },
    "analyses": {
      "total": 5420,
      "thisMonth": 234,
      "today": 15,
      "severityBreakdown": {
        "home": 180,
        "doctor": 45,
        "emergency": 9
      }
    },
    "insights": {
      "commonConditions": [...],
      "emergencyRate": 3.85
    },
    "system": {
      "averageProcessingTime": 2150,
      "uptime": 86400,
      "memoryUsage": {...}
    }
  }
}
```

### GET /admin/users
Get user analytics with pagination and filtering.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search by username/email
- `status`: Filter by status (active|inactive)

### GET /admin/analyses
Get analysis analytics with filtering.

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `severity`: Filter by severity
- `dateFrom`: Start date filter
- `dateTo`: End date filter
- `userId`: Filter by user ID

### GET /admin/system
Get system performance metrics.

### GET /admin/reports
Generate various reports.

**Query Parameters:**
- `type`: Report type (summary|users|health)
- `dateFrom`: Start date
- `dateTo`: End date

---

## Error Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request - Invalid input data
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `422`: Unprocessable Entity - Validation errors
- `429`: Too Many Requests - Rate limit exceeded
- `500`: Internal Server Error

## Rate Limiting
The API implements rate limiting:
- **Limit:** 100 requests per 15 minutes per IP
- **Response Header:** `X-RateLimit-*` headers included

## Frontend Integration Guide

### 1. Install Dependencies
For frontend integration, you'll need to modify the existing JavaScript files to make API calls:

```javascript
// Example API service function
const API_BASE = 'http://localhost:5000/api';

async function makeAPICall(endpoint, method = 'GET', data = null) {
  const token = localStorage.getItem('authToken');
  
  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API request failed');
    }
    
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

### 2. Update Login Function (script.js)

Replace the existing login function with:

```javascript
async function loginUser(username, password) {
  try {
    const result = await makeAPICall('/auth/login', 'POST', {
      username,
      password
    });
    
    // Store token
    localStorage.setItem('authToken', result.data.token);
    localStorage.setItem('userRole', result.data.user.role);
    localStorage.setItem('username', result.data.user.username);
    
    return result.data;
  } catch (error) {
    throw error;
  }
}
```

### 3. Update Symptom Analysis (dashboard.js)

Replace the `analyzeSymptoms` function with:

```javascript
async function analyzeSymptoms() {
  const symptomsText = document.getElementById('symptomsInput').value.trim();
  
  if (!symptomsText) {
    showNotification('Please describe your symptoms before analyzing.', 'error');
    return;
  }

  document.getElementById('loadingOverlay').classList.add('active');
  
  try {
    const result = await makeAPICall('/analysis/analyze', 'POST', {
      symptoms: symptomsText
    });
    
    displayResults(result.data.analysis);
    document.getElementById('loadingOverlay').classList.remove('active');
    
    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    
  } catch (error) {
    document.getElementById('loadingOverlay').classList.remove('active');
    showNotification('Error analyzing symptoms: ' + error.message, 'error');
  }
}
```

### 4. Update Admin Dashboard (admin.js)

Add API calls for admin data:

```javascript
async function loadDashboardData() {
  try {
    const overview = await makeAPICall('/admin/overview');
    updateDashboardMetrics(overview.data);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

async function loadUserAnalytics() {
  try {
    const users = await makeAPICall('/admin/users');
    updateUserTable(users.data);
  } catch (error) {
    console.error('Error loading user analytics:', error);
  }
}
```

## Development Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env` and update values as needed.

### 3. Database Setup
```bash
# Make sure MongoDB is running
npm run init-db
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Test API
```bash
curl http://localhost:5000/api/health
```

## Production Deployment

### Environment Variables
Ensure these are set in production:
- `NODE_ENV=production`
- `JWT_SECRET=<strong-secret>`
- `MONGODB_URI=<production-mongodb-uri>`
- `FRONTEND_URL=<production-frontend-url>`

### Security Considerations
- Use HTTPS in production
- Set strong JWT secrets
- Configure proper CORS origins
- Enable rate limiting
- Use environment variables for sensitive data
- Implement proper logging and monitoring

---

*Last updated: October 3, 2025*
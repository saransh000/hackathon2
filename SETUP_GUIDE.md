# 🚀 CureMind - Complete Setup Guide

## ✅ Backend Successfully Integrated!

Your CureMind application now has a **fully functional backend** with database integration, authentication, and AI-powered analysis.

---

## 🎯 Current Status

### ✅ What's Running:
1. **Backend Server** - `http://localhost:5000` (Node.js + MongoDB)
2. **Frontend Server** - `http://localhost:8000` (Python HTTP Server)

### ✅ What's Integrated:
- **JWT Authentication** - Real user login/registration
- **Database Storage** - MongoDB for users and analysis history
- **API Integration** - All frontend pages connected to backend
- **AI Analysis** - Symptom analysis with database tracking
- **Admin Dashboard** - Real-time analytics from database

---

## 🚀 How to Start the Application

### Step 1: Start Backend Server
```bash
# Open Terminal 1
cd backend
node server.js
```
**Expected Output:**
```
🏥 CureMind Backend Server running on port 5000
📊 Health check: http://localhost:5000/api/health
🌍 Environment: development
🗄️  MongoDB Connected: localhost
```

### Step 2: Start Frontend Server
```bash
# Open Terminal 2 (new terminal)
python -m http.server 8000
```
**Expected Output:**
```
Serving HTTP on :: port 8000 (http://[::]:8000/) ...
```

### Step 3: Access the Application
Open your browser and go to:
- **Frontend:** http://localhost:8000
- **Backend Health Check:** http://localhost:5000/api/health

---

## 🔐 Default Login Credentials

### Admin Access:
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Administrator (full access to admin dashboard)

### Sample User Accounts (created by init-db.js):
- **Username:** `john_doe` / **Password:** `password123`
- **Username:** `jane_smith` / **Password:** `password123`

---

## 📁 Project Structure

```
newhackthon2/
├── backend/                     # Backend server
│   ├── src/
│   │   ├── controllers/        # Business logic
│   │   ├── models/             # Database schemas
│   │   ├── routes/             # API endpoints
│   │   ├── middleware/         # Auth & error handling
│   │   └── config/             # Database connection
│   ├── server.js               # Main server file
│   ├── package.json            # Backend dependencies
│   └── .env                    # Environment variables
│
├── index.html                   # Login page
├── dashboard.html              # User dashboard
├── admin.html                  # Admin dashboard
├── api-config.js               # API configuration (NEW!)
├── script.js                   # Login logic (UPDATED)
├── dashboard.js                # Dashboard logic (UPDATED)
├── admin.js                    # Admin logic (UPDATED)
└── SETUP_GUIDE.md              # This file

```

---

## 🔌 API Integration Details

### API Configuration
The `api-config.js` file provides:
- **Base URL:** `http://localhost:5000/api`
- **Helper Functions:** `makeAPICall()`, `handleAPIError()`
- **Token Management:** Automatic JWT token handling

### Available Endpoints

#### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /register` - User registration
- `GET /me` - Get current user
- `POST /logout` - User logout
- `GET /verify` - Verify token

#### User Management (`/api/users`)
- `GET /profile` - Get user profile
- `PUT /profile` - Update profile
- `GET /stats` - User statistics
- `PUT /password` - Change password

#### Symptom Analysis (`/api/analysis`)
- `POST /analyze` - Analyze symptoms with AI
- `GET /history` - Get analysis history
- `GET /:id` - Get specific analysis
- `POST /:id/feedback` - Submit feedback

#### Admin (`/api/admin`)
- `GET /overview` - Dashboard overview with analytics
- `GET /users` - User analytics
- `GET /analyses` - Analysis analytics
- `GET /system` - System metrics

---

## 🧪 Testing the Integration

### Test 1: Backend Health Check
Open browser console and run:
```javascript
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log(d));
```
**Expected:** `{ success: true, message: 'CureMind API is running', ... }`

### Test 2: Login with API
```javascript
makeAPICall('/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
}).then(data => console.log(data));
```
**Expected:** Token and user data returned

### Test 3: Symptom Analysis
After login, test analysis:
```javascript
makeAPICall('/analysis/analyze', {
  method: 'POST',
  body: JSON.stringify({
    symptoms: 'I have a headache and fever',
    age: 25,
    gender: 'male'
  })
}).then(data => console.log(data));
```
**Expected:** Analysis results with severity, conditions, and recommendations

---

## 🎨 What Changed in Frontend

### 1. **index.html** (Login Page)
- ✅ Added `<script src="api-config.js"></script>`
- ✅ Now using real backend authentication

### 2. **script.js** (Login Logic)
- ✅ Updated to call `/api/auth/login`
- ✅ Stores JWT token in localStorage
- ✅ Proper error handling with API

### 3. **dashboard.html** (User Dashboard)
- ✅ Added `<script src="api-config.js"></script>`
- ✅ Connected to backend analysis endpoint

### 4. **dashboard.js** (Dashboard Logic)
- ✅ Updated to use `/api/analysis/analyze`
- ✅ Fetches user profile from `/api/users/profile`
- ✅ Loads analysis history from `/api/analysis/history`
- ✅ Real-time data from database

### 5. **admin.html** (Admin Dashboard)
- ✅ Added `<script src="api-config.js"></script>`
- ✅ Connected to admin endpoints

### 6. **admin.js** (Admin Logic)
- ✅ Updated to use `/api/admin/overview`
- ✅ Real analytics from database
- ✅ Live user and system metrics

---

## 🔐 Security Features

### ✅ Implemented:
- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with 12 salt rounds
- **Rate Limiting** - 100 requests per 15 minutes
- **CORS Protection** - Only localhost:8000 allowed
- **Input Validation** - Sanitized user inputs
- **Role-based Access** - Admin vs User permissions
- **Token Expiration** - 24-hour token validity

### 🔒 Environment Variables:
All sensitive data in `.env` file:
- `JWT_SECRET` - Token signing key
- `MONGODB_URI` - Database connection
- `DEFAULT_ADMIN_PASSWORD` - Admin credentials

---

## 🗄️ Database Information

### MongoDB Details:
- **Database Name:** `curemind`
- **Connection:** `localhost:27017`
- **Collections:**
  - `users` - User accounts and profiles
  - `symptomanalyses` - Analysis history
  - `sessions` - Active sessions (optional)

### Sample Data:
The database includes:
- 1 Admin user (admin/admin123)
- 2 Sample users (john_doe, jane_smith)
- Sample analysis records

### Initialize Database:
```bash
cd backend
npm run init-db
```

---

## 🐛 Troubleshooting

### Problem: Backend won't start
**Solution:**
```bash
cd backend
npm install
node server.js
```

### Problem: MongoDB connection error
**Solution:**
1. Check if MongoDB is running
2. For Windows: Install MongoDB Community Server
3. Or use MongoDB Atlas (cloud):
   - Update `MONGODB_URI` in `.env`
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/curemind`

### Problem: CORS errors in browser
**Solution:**
- Verify `FRONTEND_URL=http://localhost:8000` in backend/.env
- Restart backend server

### Problem: Frontend shows old data
**Solution:**
- Clear browser localStorage: `localStorage.clear()`
- Hard refresh: Ctrl+Shift+R (Chrome) or Cmd+Shift+R (Mac)

### Problem: "Token expired" error
**Solution:**
- Login again to get new token
- Token expires after 24 hours (configurable in .env)

---

## 🚀 Next Steps

### For Development:
1. ✅ Both servers running
2. ✅ Test login functionality
3. ✅ Test symptom analysis
4. ✅ Test admin dashboard
5. ✅ Verify data persistence in database

### For Production:
1. **Update Environment:**
   - Set `NODE_ENV=production`
   - Use strong JWT secret
   - Configure production MongoDB (Atlas)

2. **Deploy Backend:**
   - Use services like Heroku, Railway, or Render
   - Set environment variables
   - Configure FRONTEND_URL to production domain

3. **Deploy Frontend:**
   - Use Netlify, Vercel, or GitHub Pages
   - Update `API_CONFIG.BASE_URL` to production backend

4. **Security Hardening:**
   - Enable HTTPS
   - Configure reverse proxy
   - Set up monitoring and logging
   - Regular security audits

---

## 📚 Additional Resources

- **Backend README:** `backend/README.md`
- **API Documentation:** `backend/API_DOCUMENTATION.md`
- **Backend Complete Summary:** `BACKEND_COMPLETE.md`

---

## 🎉 Success!

Your CureMind application is now:
✅ **Fully Functional** with backend + frontend
✅ **Database Connected** for persistent storage
✅ **API Integrated** for real-time data
✅ **Secure** with JWT authentication
✅ **Production Ready** (with minor configuration)

**Access your application at:** http://localhost:8000

Login with `admin`/`admin123` and start testing! 🏥✨

---

**Need Help?** Check the documentation files or review the code comments for detailed explanations.

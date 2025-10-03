# 🚀 CureMind Deployment Guide for Render

This guide will help you deploy the CureMind healthcare platform on Render.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be on GitHub
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **MongoDB Atlas Account** - Free tier at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

---

## 🗄️ Step 1: Setup MongoDB Atlas (Free Cloud Database)

### 1.1 Create MongoDB Atlas Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up/Login
3. Click **"Create a New Cluster"**
4. Select **FREE tier (M0)**
5. Choose a cloud provider and region (close to your users)
6. Click **"Create Cluster"** (takes 5-10 minutes)

### 1.2 Create Database User

1. Go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `curemind_user`
5. Password: Generate a strong password (save it!)
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### 1.3 Whitelist IP Addresses

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### 1.4 Get Connection String

1. Go to **Database** → **Connect**
2. Choose **"Connect your application"**
3. Copy the connection string
4. It looks like: `mongodb+srv://curemind_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Replace `<password>` with your actual password
6. Add database name: `mongodb+srv://curemind_user:yourpassword@cluster0.xxxxx.mongodb.net/curemind?retryWrites=true&w=majority`

---

## 🌐 Step 2: Deploy Backend on Render

### 2.1 Push Code to GitHub

```bash
# If not already on GitHub
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2.2 Create Backend Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the `hackathon2` repository

### 2.3 Configure Backend Service

**Basic Settings:**
- **Name:** `curemind-backend`
- **Region:** Choose closest to you (e.g., Oregon)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** `Free`

**Environment Variables** (Click "Add Environment Variable"):

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://curemind_user:yourpassword@cluster0.xxxxx.mongodb.net/curemind?retryWrites=true&w=majority
DB_NAME=curemind
JWT_SECRET=your_super_secret_random_64_character_string_here_make_it_very_secure
JWT_EXPIRES_IN=24h
FRONTEND_URL=https://your-frontend-name.onrender.com
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_PASSWORD=your_secure_admin_password_123
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
LOG_LEVEL=info
```

**Important:** 
- Generate a strong JWT_SECRET (64+ random characters)
- Change DEFAULT_ADMIN_PASSWORD to something secure
- Update FRONTEND_URL after deploying frontend (Step 3)

4. Click **"Create Web Service"**
5. Wait for deployment (5-10 minutes)
6. Once deployed, copy the URL: `https://curemind-backend.onrender.com`

---

## 🎨 Step 3: Deploy Frontend on Render

### 3.1 Update api-config.js

The `api-config.js` already has auto-detection, but update the production URL:

```javascript
BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://curemind-backend.onrender.com/api', // Your actual backend URL
```

Commit the change:
```bash
git add api-config.js
git commit -m "Update production API URL"
git push origin main
```

### 3.2 Create Frontend Static Site

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Static Site"**
3. Connect your GitHub repository
4. Select the `hackathon2` repository

### 3.3 Configure Frontend Service

**Basic Settings:**
- **Name:** `curemind-frontend`
- **Region:** Same as backend
- **Branch:** `main`
- **Root Directory:** Leave empty (root of repo)
- **Build Command:** Leave empty or `echo "Static site"`
- **Publish Directory:** `.` (current directory)

**Custom Headers** (Optional but recommended):
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
```

4. Click **"Create Static Site"**
5. Wait for deployment (2-5 minutes)
6. Once deployed, copy the URL: `https://curemind-frontend.onrender.com`

---

## 🔧 Step 4: Update Configuration

### 4.1 Update Backend FRONTEND_URL

1. Go to backend service on Render
2. Go to **Environment** tab
3. Update `FRONTEND_URL` to your frontend URL: `https://curemind-frontend.onrender.com`
4. Click **"Save Changes"**
5. Service will automatically redeploy

### 4.2 Test Your Deployment

1. Visit your frontend URL: `https://curemind-frontend.onrender.com/index.html`
2. Try logging in with default admin credentials
3. Test the signup flow
4. Test the AI chat feature
5. Check if all features work

---

## 📝 Step 5: Initialize Database

The database will be automatically initialized on first backend startup. The init script runs automatically and creates:
- Admin user
- Sample users (john_doe, jane_smith)
- Database collections

---

## 🔐 Security Checklist

- ✅ Change default admin password
- ✅ Use strong JWT_SECRET (64+ characters)
- ✅ MongoDB connection string is secure
- ✅ Environment variables are not in GitHub
- ✅ CORS is configured correctly
- ✅ Rate limiting is enabled

---

## 🐛 Troubleshooting

### Backend Issues

**"Application failed to respond"**
- Check logs in Render dashboard
- Verify MongoDB connection string
- Ensure PORT is set to 10000

**"MongoDB connection failed"**
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Verify connection string format
- Check username/password

**CORS Errors**
- Ensure FRONTEND_URL matches your actual frontend URL
- Check backend logs for CORS errors

### Frontend Issues

**"Failed to fetch"**
- Verify api-config.js has correct backend URL
- Check backend is running on Render
- Open browser console for detailed errors

**"Login not working"**
- Check backend logs
- Verify MongoDB is connected
- Try with default credentials first

### Free Tier Limitations

- Render free tier spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- Upgrade to paid tier for always-on service

---

## 🎯 Important URLs to Save

- **Frontend**: `https://curemind-frontend.onrender.com`
- **Backend API**: `https://curemind-backend.onrender.com/api`
- **Health Check**: `https://curemind-backend.onrender.com/api/health`
- **MongoDB Atlas**: `https://cloud.mongodb.com`

---

## 🚀 Going Live Checklist

1. ✅ MongoDB Atlas cluster created
2. ✅ Backend deployed on Render
3. ✅ Frontend deployed on Render
4. ✅ Environment variables configured
5. ✅ FRONTEND_URL updated in backend
6. ✅ api-config.js has correct backend URL
7. ✅ Admin password changed
8. ✅ All features tested
9. ✅ Login/Signup working
10. ✅ AI chat working
11. ✅ Voice input working
12. ✅ Video call working

---

## 📞 Support

If you encounter issues:
1. Check Render logs (Dashboard → Service → Logs)
2. Check browser console (F12 → Console tab)
3. Verify all environment variables
4. Review MongoDB Atlas connection

---

## 🎉 Congratulations!

Your CureMind platform is now live! Share your URL with others:
**https://curemind-frontend.onrender.com**

---

## 📌 Optional: Custom Domain

To use a custom domain (e.g., curemind.com):

1. Buy a domain from Namecheap, GoDaddy, etc.
2. In Render → Frontend Service → Settings → Custom Domain
3. Add your domain
4. Update DNS records as instructed
5. Wait for DNS propagation (24-48 hours)

---

**Made with ❤️ by CureMind Team**

# 🚀 Quick Deploy to Render - CureMind

## Step 1: MongoDB Atlas (5 minutes)
1. Go to mongodb.com/cloud/atlas
2. Create FREE cluster (M0)
3. Create user: `curemind_user` with password
4. Whitelist IP: 0.0.0.0/0
5. Get connection string: `mongodb+srv://curemind_user:password@cluster0.xxxxx.mongodb.net/curemind`

## Step 2: Deploy Backend (5 minutes)
1. Go to render.com
2. New Web Service
3. Connect GitHub: `saransh000/hackathon2`
4. Settings:
   - Name: `curemind-backend`
   - Root Directory: `backend`
   - Build: `npm install`
   - Start: `npm start`
   - Add Environment Variables:
     ```
     NODE_ENV=production
     PORT=10000
     MONGODB_URI=<your_mongodb_connection_string>
     JWT_SECRET=<generate_random_64_chars>
     FRONTEND_URL=https://curemind-frontend.onrender.com
     DEFAULT_ADMIN_PASSWORD=<change_this>
     ```
5. Deploy!
6. Copy backend URL: `https://curemind-backend.onrender.com`

## Step 3: Update Frontend Config (1 minute)
1. Edit `api-config.js` line 4:
   ```javascript
   : 'https://curemind-backend.onrender.com/api',
   ```
2. Commit: `git add api-config.js && git commit -m "Update API URL" && git push`

## Step 4: Deploy Frontend (3 minutes)
1. Render.com → New Static Site
2. Connect GitHub: `saransh000/hackathon2`
3. Settings:
   - Name: `curemind-frontend`
   - Build: Leave empty
   - Publish: `.`
4. Deploy!
5. Copy URL: `https://curemind-frontend.onrender.com`

## Step 5: Update Backend FRONTEND_URL (1 minute)
1. Go to backend service on Render
2. Environment tab
3. Update `FRONTEND_URL` to your frontend URL
4. Save (auto-redeploys)

## 🎉 Done!
Visit: https://curemind-frontend.onrender.com/index.html

### Default Login:
- Admin: `admin` / `<your_password>`
- User: `john_doe` / `password123`

### Important Notes:
- Free tier spins down after 15 min inactivity
- First request after spin-down = 30-60 sec delay
- Upgrade to paid for always-on ($7/month)

### Troubleshooting:
- Check logs in Render dashboard
- Verify MongoDB connection
- Check browser console (F12)
- See DEPLOYMENT_GUIDE.md for details

# Quick Start - Deploy DMO to Cloud

## ✅ What's Done
- ✅ Git repository initialized
- ✅ Initial commit created
- ✅ PostgreSQL support added
- ✅ Deployment files created

## 🚀 Next Steps (15 minutes)

### 1. Create GitHub Repository (2 min)
1. Go to https://github.com/new
2. Repository name: `DMO`
3. Keep it Public (or Private)
4. **DON'T** check any initialization boxes
5. Click "Create repository"
6. Copy the commands shown, but replace with these:

```powershell
cd C:\Users\lpcoo\OneDrive\Desktop\WebGames\DMO
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/DMO.git
git push -u origin main
```

### 2. Deploy Backend to Render (5 min)
1. Go to https://render.com → Sign up with GitHub
2. Click "New +" → "Web Service"
3. Click "Connect" next to your DMO repository
4. Fill in:
   - Name: `dmo-backend`
   - Root Directory: `server`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Instance Type: `Free`

5. Click "Advanced" → Add Environment Variables:
   ```
   GOOGLE_API_KEY = your_google_api_key_here
   JWT_SECRET = super-secret-change-this-in-production-12345
   PORT = 3001
   CLIENT_URL = https://yourapp.vercel.app
   ```
   (We'll update CLIENT_URL later)

6. Click "Create Web Service"
7. **COPY YOUR BACKEND URL** (like https://dmo-backend.onrender.com)

### 3. Create Database on Render (3 min)
1. In Render, click "New +" → "PostgreSQL"
2. Name: `dmo-database`
3. Database: `dmo`
4. User: `dmo_user`
5. Region: Same as your backend
6. Instance Type: `Free`
7. Click "Create Database"
8. On the database page, **COPY "External Database URL"**
9. Go back to your backend service → "Environment"
10. Add new variable:
    ```
    DATABASE_URL = (paste the External Database URL)
    ```

### 4. Setup Database Tables (2 min)
1. In Render backend service, click "Shell" tab (wait for it to connect)
2. Run:
```bash
npm install -g node-pg-migrate
psql $DATABASE_URL -f database/schema-postgresql.sql
```

### 5. Deploy Frontend to Vercel (3 min)
1. Go to https://vercel.com → Sign up with GitHub
2. Click "Add New..." → "Project"
3. Import your DMO repository
4. Configure:
   - Framework Preset: `Next.js`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: Leave default
   
5. Environment Variables:
   ```
   NEXT_PUBLIC_API_URL = (paste your Render backend URL from Step 2)
   ```

6. Click "Deploy"
7. **COPY YOUR VERCEL URL** (like https://dmo.vercel.app)

### 6. Update Backend CORS (1 min)
1. Go back to Render → Your backend service → "Environment"
2. Update `CLIENT_URL` with your Vercel URL from Step 5
3. Click "Save Changes" (it will redeploy)

## 🎉 Done!

Your game is live! Share your Vercel URL with friends!

## 📝 Notes

- **First load**: Takes 30-50 seconds (free tier cold start)
- **After that**: Fast!
- **Database**: 1GB free storage
- **Backend**: Sleeps after 15 min of inactivity

## 🐛 Troubleshooting

**Can't connect to backend?**
- Check Render logs for errors
- Verify DATABASE_URL is set correctly
- Make sure all environment variables are saved

**Frontend errors?**
- Check Vercel deployment logs
- Verify NEXT_PUBLIC_API_URL matches your Render URL
- Try redeploying

**Database errors?**
- Make sure you ran the schema-postgresql.sql file
- Check External Database URL is correct

Need help? The full guide is in DEPLOYMENT.md

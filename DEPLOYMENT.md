# DMO Deployment Guide

## Prerequisites
1. GitHub account
2. Vercel account (sign up at vercel.com with GitHub)
3. Render account (sign up at render.com with GitHub)

## Step 1: Push to GitHub

1. Go to https://github.com/new
2. Create a new repository named "DMO" (make it private if you want)
3. Don't initialize with README (we already have one)
4. Run these commands in PowerShell:

```powershell
cd C:\Users\lpcoo\OneDrive\Desktop\WebGames\DMO
git add .
git commit -m "Initial commit - DMO game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/DMO.git
git push -u origin main
```

## Step 2: Deploy Backend to Render

1. Go to https://dashboard.render.com/
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: dmo-backend
   - **Root Directory**: server
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

5. Add Environment Variables:
   - `DATABASE_URL`: (will get from Step 3)
   - `JWT_SECRET`: (generate a random string)
   - `GOOGLE_API_KEY`: your_google_api_key_here
   - `CLIENT_URL`: (will update after frontend deployment)
   - `PORT`: 3001

6. Click "Create Web Service"
7. **Copy the service URL** (like https://dmo-backend.onrender.com)

## Step 3: Create PostgreSQL Database on Render

1. In Render dashboard, click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: dmo-database
   - **Plan**: Free
3. Click "Create Database"
4. **Copy the "External Database URL"** from the database page
5. Go back to your backend service → Environment
6. Update `DATABASE_URL` with the copied connection string

## Step 4: Update Database Connection

Since Render uses PostgreSQL, you'll need to:
1. Update `server/package.json` to use `pg` instead of `mysql2`
2. Update `server/database/connection.js` to use PostgreSQL

I'll provide these changes next.

## Step 5: Deploy Frontend to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: client
   - **Build Command**: `npm run build`
   - **Output Directory**: .next
   
4. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: (paste your Render backend URL from Step 2)

5. Click "Deploy"
6. **Copy your Vercel URL** (like https://dmo.vercel.app)

## Step 6: Update Backend CORS

1. Go back to Render backend service → Environment
2. Update `CLIENT_URL` to your Vercel URL from Step 5
3. Service will auto-redeploy

## Step 7: Run Database Migrations

1. In Render, go to your Web Service
2. Click "Shell" tab
3. Run your database setup SQL files

## Done!

Your game is now live! Share the Vercel URL with friends.

**Note**: Free tier limitations:
- Render: Service spins down after 15 min of inactivity (30 sec startup time)
- PostgreSQL: 1GB storage limit
- First load might be slow, but subsequent loads are fast

## Troubleshooting

If you get errors:
1. Check Render logs for backend errors
2. Check Vercel deployment logs for frontend errors
3. Verify all environment variables are set correctly
4. Make sure DATABASE_URL is the "External Database URL" from Render

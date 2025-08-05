# 🚀 Quick Deploy to zentrahub.pro

## Step 1: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `zentra-app`
3. Keep it public or private (your choice)
4. Don't initialize with README

## Step 2: Push Code to GitHub

Open terminal in the project folder and run:

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Deploy Zentra to zentrahub.pro"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/zentra-app.git

# Push to GitHub
git push -u origin main
```

## Step 3: Deploy to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click on **Pages** in the sidebar
3. Click **Create a project**
4. Click **Connect to Git**
5. Authorize GitHub and select your `zentra-app` repository
6. Configure build settings:
   - **Project name**: `zentra-app`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
7. Click **Save and Deploy**

## Step 4: Add Custom Domain

1. After deployment, go to your project in Cloudflare Pages
2. Go to **Custom domains** tab
3. Click **Set up a custom domain**
4. Enter `zentrahub.pro`
5. Click **Continue** → **Activate domain**
6. Repeat for `www.zentrahub.pro`

## Step 5: Deploy API (Choose One)

### Option A: Use Cloudflare Workers (Quick)
```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create worker
wrangler init zentra-api

# Copy api-worker.js content to src/index.js

# Deploy
wrangler deploy

# Add custom domain api.zentrahub.pro in Cloudflare dashboard
```

### Option B: Deploy to Render.com (Free)
1. Go to [Render](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Name**: `zentra-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables from `.env`
6. Deploy

Then update `api.zentrahub.pro` DNS to point to Render URL.

## Step 6: Update Frontend API URLs

If API is deployed separately, update the build script to use your API URL:
```javascript
// In build.js, update this line:
content = content.replace(/http:\/\/localhost:3000/g, 'https://api.zentrahub.pro');
```

Then rebuild and redeploy:
```bash
npm run build
git add .
git commit -m "Update API URLs"
git push
```

## ✅ Verification Checklist

- [ ] Visit https://zentrahub.pro - Site loads
- [ ] Check HTTPS padlock - Secure connection
- [ ] Test navigation - All pages work
- [ ] Check console - No errors
- [ ] Test responsive - Mobile friendly

## 🎉 Done!

Your site is now live at:
- 🌐 Main: https://zentrahub.pro
- 🌐 WWW: https://www.zentrahub.pro
- 🔧 API: https://api.zentrahub.pro (when configured)

## 📱 Next Steps

1. **Monitor**: Check Cloudflare Analytics
2. **Optimize**: Enable Cloudflare optimizations
3. **Secure**: Review security settings
4. **Scale**: Upgrade plans as needed

---

**Need help?** Check `DEPLOYMENT.md` for detailed instructions.
# 🚀 Deployment Guide - ShonoWave

This guide will help you deploy ShonoWave to Vercel successfully.

## 📋 Prerequisites

- A GitHub account
- A Vercel account (free at [vercel.com](https://vercel.com))
- Node.js 18+ installed locally (for testing)

## 🎯 Deployment Steps

### 1. Prepare Your Repository

Make sure your repository is pushed to GitHub with all the latest changes.

### 2. Deploy to Vercel

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Your Project**
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose your ShonoWave repository

3. **Configure Build Settings**
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

4. **Environment Variables** (Optional)
   - Add any environment variables if needed
   - For this project, no environment variables are required

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### 3. Verify Deployment

Once deployed, Vercel will provide you with:
- **Production URL**: `https://shono-wave.vercel.app`
- **Preview URLs**: For each pull request

## 🔧 Configuration Files

The following files are configured for Vercel deployment:

### `vercel.json`
```json
{
  "version": 2,
  "name": "shonowave",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/public",
        "buildCommand": "npm run vercel-build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### `package.json` Scripts
```json
{
  "scripts": {
    "vercel-build": "vite build"
  }
}
```

## 🌐 API Integration

ShonoWave now uses the RadioBrowser API directly from the client-side, eliminating the need for server-side API routes. This approach:

- ✅ Reduces deployment complexity
- ✅ Improves performance (no serverless function cold starts)
- ✅ Reduces costs (no API function invocations)
- ✅ Simplifies maintenance

### API Endpoints Used
- `https://de1.api.radio-browser.info`
- `https://nl1.api.radio-browser.info`
- `https://at1.api.radio-browser.info`

## 🐛 Troubleshooting

### Build Errors

1. **Node.js Version**
   - Ensure your local Node.js version matches Vercel's (18+)
   - Add `.nvmrc` file if needed

2. **Dependencies**
   - Run `npm install` locally to ensure all dependencies are installed
   - Check for any missing peer dependencies

3. **Build Command**
   - Verify `npm run vercel-build` works locally
   - Check the build output for any errors

### Runtime Errors

1. **CORS Issues**
   - The app now uses direct API calls, so CORS should not be an issue
   - If you see CORS errors, check the RadioBrowser API status

2. **API Failures**
   - The app has fallback mirrors for the RadioBrowser API
   - Check the browser console for specific error messages

## 🔄 Continuous Deployment

Once deployed, Vercel will automatically:
- Deploy new versions when you push to the main branch
- Create preview deployments for pull requests
- Provide automatic HTTPS and CDN distribution

## 📱 PWA Features

After deployment, your app will be available as a PWA:
- Installable on mobile and desktop
- Offline capabilities (favorites, cached assets)
- Native app-like experience

## 🎉 Success!

Your ShonoWave app should now be live and accessible worldwide! 

**Next Steps:**
- Test all features on the deployed version
- Share the URL with users
- Monitor performance and usage
- Set up custom domain if desired

---

**Need Help?**
- Check Vercel's [documentation](https://vercel.com/docs)
- Review the [README.md](README.md) for project details
- Open an issue on GitHub for project-specific problems

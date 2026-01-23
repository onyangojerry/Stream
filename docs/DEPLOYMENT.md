# 🚀 Deployment Guide

## Netlify Deployment

This guide will help you deploy the Striim video streaming platform to Netlify.

### Prerequisites

- ✅ Node.js 18+ installed
- ✅ Git repository set up
- ✅ Code pushed to GitHub/GitLab/Bitbucket

### Quick Deploy

#### Option 1: One-Click Deploy (Easiest)

1. **Click the deploy button below:**
   [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/YOUR_USERNAME/YOUR_REPO_NAME)

2. **Connect your repository**
3. **Set build settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Click "Deploy site"**

#### Option 2: Manual Deploy

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Go to Netlify:**
   - Visit [netlify.com](https://netlify.com)
   - Sign up/Login with your GitHub account

3. **Create new site:**
   - Click "New site from Git"
   - Choose your repository
   - Set build settings:
     - **Build command:** `npm run build`
     - **Publish directory:** `dist`
   - Click "Deploy site"

#### Option 3: CLI Deploy

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   # Build first
   npm run build
   
   # Deploy to Netlify
   netlify deploy --prod
   ```

### Configuration Files

The project includes these deployment configuration files:

- `netlify.toml` - Netlify configuration
- `public/_redirects` - SPA routing support
- `deploy.sh` - Deployment script

### Environment Variables

If you need to add environment variables:

1. Go to your Netlify site dashboard
2. Navigate to Site settings > Environment variables
3. Add any required variables

### Post-Deployment

After successful deployment:

1. **Test the application:**
   - Visit your Netlify URL
   - Test all features (login, signup, video calls)
   - Check mobile responsiveness

2. **Custom domain (optional):**
   - Go to Site settings > Domain management
   - Add your custom domain

3. **Analytics (optional):**
   - Enable Netlify Analytics in Site settings

### Troubleshooting

#### Build Fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check for TypeScript errors: `npm run build`

#### Routing Issues
- Ensure `netlify.toml` and `public/_redirects` are present
- Check that SPA routing is working

#### Performance Issues
- Enable Netlify's asset optimization
- Consider enabling compression
- Monitor bundle size

### Support

If you encounter issues:
1. Check the build logs in Netlify dashboard
2. Verify your repository is public or Netlify has access
3. Ensure all files are committed and pushed

---

**Happy Deploying! 🎉**

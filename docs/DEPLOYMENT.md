# Deployment Guide - Cloudflare Pages

## Quick Deploy (One-Time Setup)

### Option 1: Manual Deploy (Fastest)

1. **Install Wrangler CLI:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Deploy:**
   ```bash
   ./deploy-manual.sh
   ```

Your site will be live at: `https://sinister-dexter.pages.dev`

### Option 2: GitHub Auto-Deploy (Recommended)

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/sindex.git
   git push -u origin main
   ```

2. **Connect to Cloudflare Pages:**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com)
   - Click "Create a project"
   - Connect your GitHub account
   - Select the `sindex` repository
   - Configure build settings:
     - Build command: `npm run build`
     - Build output directory: `public`
   - Click "Save and Deploy"

3. **Add GitHub Secrets (for Actions):**
   - Go to your GitHub repo Settings → Secrets
   - Add these secrets:
     - `CLOUDFLARE_API_TOKEN` - [Create here](https://dash.cloudflare.com/profile/api-tokens)
     - `CLOUDFLARE_ACCOUNT_ID` - Find in Cloudflare dashboard

## Custom Domain Setup

1. **In Cloudflare Pages:**
   - Go to your project → Custom domains
   - Add `sinisterdexter.net` and `www.sinisterdexter.net`

2. **Update DNS (if not using Cloudflare DNS):**
   ```
   sinisterdexter.net    CNAME  sinister-dexter.pages.dev
   www.sinisterdexter.net CNAME sinister-dexter.pages.dev
   ```

3. **If using Cloudflare DNS:**
   - It will be configured automatically
   - SSL certificates are automatic

## Updating Content

### Shows/Events
1. Edit `public/data/shows.json`
2. Commit and push (auto-deploys)
   ```bash
   git add public/data/shows.json
   git commit -m "Update shows"
   git push
   ```

### Photos
1. Add images to `photos/` directory
2. Process and deploy:
   ```bash
   npm run build
   git add .
   git commit -m "Add new photos"
   git push
   ```

### Quick Updates (No Build Needed)
For text/show updates that don't need image processing:
```bash
npx wrangler pages deploy public --project-name=sinister-dexter
```

## Environment Variables

If you need to add API keys later (for mailing list, etc.):

1. **Cloudflare Dashboard:**
   - Project → Settings → Environment variables
   - Add variables for production/preview

2. **Local Development:**
   Create `.env` file:
   ```
   MAILCHIMP_API_KEY=your_key_here
   ```

## Preview Deployments

Every pull request automatically creates a preview URL:
- Format: `https://[hash].sinister-dexter.pages.dev`
- Perfect for testing changes before going live

## Monitoring

- **Analytics:** Free in Cloudflare Pages dashboard
- **Performance:** Real User Metrics (RUM) included
- **Errors:** Check Functions tab (if using serverless later)

## Rollback

If something goes wrong:
1. Go to Cloudflare Pages dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Find a previous good deployment
5. Click "Rollback to this deployment"

## Support

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Discord Community](https://discord.cloudflare.com)
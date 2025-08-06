# Setup Guide for Sinister Dexter Website

## GitHub Actions Setup

To enable automated deployments, you need to configure the following GitHub secrets:

### Required Secrets

1. **CLOUDFLARE_API_TOKEN**
   - Go to Cloudflare Dashboard → My Profile → API Tokens
   - Create a new token with these permissions:
     - Account: Cloudflare Pages:Edit
     - Zone: Page Rules:Edit (for your domain)
   - Copy the token

2. **CLOUDFLARE_ACCOUNT_ID**
   - Found in Cloudflare Dashboard → Right sidebar
   - Copy your Account ID

### Adding Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the exact names above

## Automated Deployment Flow

Once configured, the site will automatically:

- **Pull Requests**: Deploy to `https://preview-{PR-NUMBER}.sinister-dexter.pages.dev/`
- **Merge to main**: Deploy to production at `https://www-new.sinisterdexter.net/`

## Manual Deployment (Backup)

If GitHub Actions is unavailable:

```bash
# Deploy to staging
./deploy.sh staging

# Deploy to production
./deploy.sh prod
```

## Domain Configuration

The domain `sinister-dexter.com` is configured as follows:

- **Registrar**: NameCheap (owned by David Weekly)
- **DNS**: Cloudflare (proxied)
- **CDN**: `cdn.sinister-dexter.com` → Cloudflare R2 bucket

## Cloudflare Pages Configuration

In Cloudflare Pages settings for `sinister-dexter` project:

1. **Custom domains**:
   - `www-new.sinisterdexter.net` (production)
   - `*.sinister-dexter.pages.dev` (preview branches)

2. **Branch deployments**:
   - `production` branch → Production environment
   - `main` branch → Staging environment
   - `preview-*` branches → PR previews

## Local Development

```bash
# Install dependencies
npm install

# Start local server
npm run serve

# Build HTML from templates
npm run build:html

# Process images
npm run build:images
```

## Support

For domain or DNS issues: Contact David Weekly
For deployment issues: Check GitHub Actions logs
For site content: See CLAUDE.md for update instructions
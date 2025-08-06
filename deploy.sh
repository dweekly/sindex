#!/bin/bash

# Unified deployment script for Sinister Dexter website
# Usage: ./deploy.sh [staging|production|ftp]

set -e  # Exit on error

echo "🎸 Sinister Dexter Site Deployment"
echo "=================================="

# Build the site first
echo "🏗️  Building site..."
npm run build:html

# Function to deploy to Cloudflare Pages (staging)
deploy_staging() {
    echo ""
    echo "☁️  Deploying to STAGING..."
    npx wrangler pages deploy public \
        --project-name=sinister-dexter \
        --branch=main \
        --commit-dirty=true
    echo "✅ Staging deployment complete!"
    echo "   URL: https://main.sinister-dexter.pages.dev/"
}

# Function to deploy to Cloudflare Pages (production)
deploy_production() {
    echo ""
    echo "🚀 Deploying to PRODUCTION..."
    echo "⚠️  This will go LIVE on https://www-new.sinisterdexter.net/"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npx wrangler pages deploy public \
            --project-name=sinister-dexter \
            --branch=production \
            --commit-dirty=true
        echo "✅ PRODUCTION deployment complete!"
        echo "   LIVE at: https://www-new.sinisterdexter.net/"
    else
        echo "❌ Production deployment cancelled"
    fi
}

# Function to deploy to FTP (if needed)
deploy_ftp() {
    echo ""
    echo "📡 Deploying to FTP server..."
    echo "⚠️  FTP deployment not yet configured"
    echo "   To set up: Add FTP credentials and lftp commands"
}

# Main deployment logic
case "${1:-staging}" in
    staging)
        deploy_staging
        ;;
    production|prod)
        deploy_production
        ;;
    ftp)
        deploy_ftp
        ;;
    *)
        echo "Usage: $0 [staging|production|ftp]"
        echo "  staging    - Deploy to staging environment (default)"
        echo "  production - Deploy to PRODUCTION (live site!)"
        echo "  prod       - Shorthand for production"
        echo "  ftp        - Deploy to FTP server"
        echo ""
        echo "Examples:"
        echo "  ./deploy.sh           # Deploy to staging"
        echo "  ./deploy.sh prod      # Deploy to PRODUCTION (with confirmation)"
        exit 1
        ;;
esac

echo ""
echo "🎵 Deployment complete!"
echo "📝 Note: MP3 files are served from R2 at https://cdn.sinister-dexter.com/"
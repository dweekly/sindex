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
    
    # Load environment variables if .env exists
    if [ -f .env ]; then
        export $(grep -v '^#' .env | xargs)
    else
        echo "❌ Error: .env file not found"
        echo "   Please create .env with FTP_HOST, FTP_USER, FTP_PASS, and FTP_REMOTE_DIR"
        exit 1
    fi
    
    # Check if required variables are set
    if [ -z "$FTP_HOST" ] || [ -z "$FTP_USER" ] || [ -z "$FTP_PASS" ] || [ -z "$FTP_REMOTE_DIR" ]; then
        echo "❌ Error: Missing FTP credentials in .env"
        echo "   Required: FTP_HOST, FTP_USER, FTP_PASS, FTP_REMOTE_DIR"
        exit 1
    fi
    
    echo "   Host: $FTP_HOST"
    echo "   Remote dir: $FTP_REMOTE_DIR"
    echo ""
    
    # Use lftp to sync the public directory to FTP
    echo "🔄 Syncing files..."
    lftp -c "
        set ssl:verify-certificate no
        open -u $FTP_USER,$FTP_PASS $FTP_HOST
        mirror --reverse --delete --verbose \
               --exclude .DS_Store \
               --exclude .git/ \
               --exclude node_modules/ \
               --exclude _headers \
               --exclude _redirects \
               public/ $FTP_REMOTE_DIR
        bye
    "
    
    if [ $? -eq 0 ]; then
        echo "✅ FTP deployment complete!"
        echo "   Files uploaded to: $FTP_HOST/$FTP_REMOTE_DIR"
    else
        echo "❌ FTP deployment failed"
        exit 1
    fi
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
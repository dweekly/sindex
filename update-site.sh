#!/bin/bash

# Weekly update script for Sinister Dexter website
# Can be run as a cron job: 0 2 * * 1 /path/to/update-site.sh

echo "🔄 Updating Sinister Dexter website..."
echo "Date: $(date)"
echo "================================"

# Navigate to project directory
cd "$(dirname "$0")"

# Pull latest changes from git (if any)
echo "📥 Pulling latest changes..."
git pull

# Process any new images
echo "🖼️  Processing images..."
npm run build:images

# Rebuild static HTML with latest data
echo "🏗️  Building static HTML..."
npm run build:html

# Optional: Deploy to Cloudflare Pages
if [ "$1" == "--deploy" ]; then
    echo "☁️  Deploying to Cloudflare Pages..."
    npx wrangler pages deploy public --project-name=sinister-dexter --branch=main --commit-dirty=true
fi

echo "✅ Update complete!"
echo ""

# To add this as a weekly cron job (runs every Monday at 2 AM):
# Run: crontab -e
# Add: 0 2 * * 1 /Users/dew/dev/sindex/update-site.sh --deploy
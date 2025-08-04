#!/bin/bash

# Manual deployment script for Cloudflare Pages
# Use this if you want to deploy without GitHub

echo "🚀 Deploying Sinister Dexter to Cloudflare Pages"
echo "================================================"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "Installing Wrangler CLI..."
    npm install -g wrangler
fi

# Build the site
echo "📦 Building site..."
npm run build

# Deploy to Cloudflare Pages
echo "☁️  Deploying to Cloudflare Pages..."
npx wrangler pages deploy public \
    --project-name=sinister-dexter \
    --branch=main

echo "✅ Deployment complete!"
echo "Your site will be available at:"
echo "  https://sinister-dexter.pages.dev"
echo "  or your custom domain once configured"
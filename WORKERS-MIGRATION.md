# Cloudflare Workers Migration Guide

## Overview
This site has been migrated from Cloudflare Pages to Cloudflare Workers to take advantage of the unified Workers platform and have more control over request handling.

## Architecture Changes

### Previous (Pages)
- Static site served directly from Cloudflare Pages
- Headers controlled via `_headers` file
- Redirects via `_redirects` file
- Automatic asset optimization

### New (Workers)
- Static assets served via Worker with KV storage
- Headers controlled programmatically in worker
- Full control over request/response pipeline
- Custom caching strategies per file type
- Better error handling and 404 pages

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Site
```bash
npm run build:html
```

### 3. Test Locally
```bash
npm run worker:dev
```
This will start a local development server at `http://localhost:8787`

### 4. Deploy to Staging
```bash
npm run deploy:staging
```

### 5. Deploy to Production
```bash
npm run deploy
```

## Worker Features

### Intelligent Caching
- **Images**: 1 year cache (immutable)
- **CSS/JS**: 1 week cache
- **HTML**: 5 minute cache with revalidation
- **JSON data**: 1 hour cache
- **Fonts**: 1 year cache (immutable)

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy: Restrictive policy

### Asset Handling
- Automatic index.html serving for directories
- Proper 404 handling with custom 404.html
- WebP image support with fallbacks
- CORS headers for API endpoints

## File Structure
```
/
├── src/
│   └── index.js         # Worker entry point
├── public/              # Static assets
│   ├── index.html       # Main site
│   ├── 404.html         # 404 page
│   ├── images/          # Image assets
│   └── data/            # JSON data
├── wrangler.toml        # Worker configuration
└── package.json         # Dependencies and scripts
```

## Deployment Commands

### Development
- `npm run preview` - Build and preview locally
- `npm run worker:dev` - Run worker development server

### Production
- `npm run deploy` - Deploy to production
- `npm run deploy:staging` - Deploy to staging environment

## Configuration

### Custom Domain Setup
1. Uncomment the route configuration in `wrangler.toml`:
```toml
route = { pattern = "sinisterdexter.net/*", zone_name = "sinisterdexter.net" }
```

2. Ensure DNS is configured in Cloudflare dashboard

### Environment Variables
Environment-specific variables are configured in `wrangler.toml`:
- `production` - Production environment
- `staging` - Staging environment  
- `preview` - Preview/development environment

## Monitoring

### View Logs
```bash
wrangler tail
```

### View Metrics
Access via Cloudflare Dashboard → Workers → Analytics

## Rollback

To rollback to a previous version:
```bash
wrangler rollback
```

## Troubleshooting

### Common Issues

1. **Assets not loading**
   - Ensure `npm run build:html` was run before deployment
   - Check that all assets are in the `public/` directory

2. **404 errors**
   - Verify paths in HTML are relative
   - Check worker logs for asset resolution issues

3. **Cache not updating**
   - Use cache busting for CSS/JS files
   - Consider reducing cache times during active development

## Benefits of Workers vs Pages

1. **More Control**: Full programmatic control over requests and responses
2. **Better Performance**: Custom caching strategies per file type
3. **Enhanced Security**: Programmatic security headers
4. **Flexibility**: Can add API endpoints, authentication, etc.
5. **Unified Platform**: Part of the Workers ecosystem with access to KV, Durable Objects, etc.

## Future Enhancements

- Add edge-side includes for dynamic content
- Implement A/B testing at the edge
- Add analytics tracking
- Implement geo-based content delivery
- Add WebP detection and automatic serving

---

Last updated: 2025-08-04
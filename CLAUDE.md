# CLAUDE.md - Project Context for AI Assistants

## Project Overview
Sinister Dexter band website - A static site generator for a San Francisco Bay Area funk/soul band.

## CRITICAL RULES
⚠️ **NEVER EDIT public/index.html DIRECTLY** - It is a generated file and will be overwritten!
- Always edit the source files (build-static.js, templates, or data files)
- Run `npm run build:html` to regenerate index.html after making changes

## Project Structure
```
/
├── build-static.js      # Main build script 
├── template/
│   └── index.html      # HTML template (EDIT THIS for structure changes)
│                       # Future: CSS and JS can be separated here
├── public/
│   ├── index.html      # GENERATED OUTPUT - DO NOT EDIT!
│   ├── data/
│   │   └── shows.json  # Shows data (edit this for show updates)
│   └── images/         # Processed images
└── photos/             # Source photos for processing
```

## Key Commands
- `npm run build:html` - Regenerate index.html from templates
- `npm run build:images` - Process photos into web-optimized formats
- `npm run optimize:images` - Further optimize existing images
- `npm run serve` - Start local development server
- `./deploy.sh staging` - Deploy to staging (https://main.sinister-dexter.pages.dev/)
- `./deploy.sh prod` - Deploy to production (https://www-new.sinisterdexter.net/)

## Architecture
1. **Static Site Generation**: build-static.js reads template HTML and injects data
2. **Image Processing**: Automated WebP/JPEG generation with thumbnails
3. **Data-Driven**: Shows and gallery pulled from JSON/manifest files

## Common Tasks

### Update Shows
Edit `public/data/shows.json` then run `npm run build:html`

### Change Site Structure/Layout
Edit `template/index.html` then run `npm run build:html`

### Add New Photos
1. Add photos to `photos/` directory
2. Run `npm run build:images`
3. Run `npm run build:html`

### Fix JavaScript Errors
Edit the JavaScript in `template/index.html` (not in the generated public/index.html)

## Current Tech Stack
- Node.js build system
- Tailwind CSS (currently via CDN, production setup available)
- Vanilla JavaScript
- Sharp for image processing
- Static HTML generation

## SEO & Metadata
- Schema.org structured data for MusicGroup, MusicEvent, VideoObject
- Open Graph and Twitter Card meta tags
- Accessibility features (ARIA labels, semantic HTML)

## Important URLs
- Staging: https://main.sinister-dexter.pages.dev/
- Production: https://www-new.sinisterdexter.net/
- MP3 CDN: https://music.primapaper.co/
- Email Subscription: mailto:gigs-subscribe@sinisterdexter.net

## Deployment Best Practices
⚠️ **ALWAYS TEST IN STAGING FIRST**
1. Build locally: `npm run build:html`
2. Deploy to staging: `./deploy.sh staging`
3. Test at https://main.sinister-dexter.pages.dev/
4. Only after verification, deploy to production: `./deploy.sh prod`

## Music Player
- 21 tracks hosted on Cloudflare R2 CDN
- Track numbers are explicit in metadata (not array indices)
- Bottom player with MediaSession API support
- Tracks maintain consistent numbering (1-21) across all UI states

## Known Issues & Notes
- Font flash issue has been addressed with preloading and proper fallbacks
- CORS warnings for manifest.json only appear when opening file:// locally
- Multiple duplicate elements were cleaned up in the template
- MP3 files removed from git repo (now on R2 CDN)

## Contact
For bookings: booking@sinisterdexter.net

---
Last updated: 2025-08-06
# CLAUDE.md - Project Context for AI Assistants

## Project Overview
Sinister Dexter band website - A static site generator for a San Francisco Bay Area funk/soul band.

## Domain & Infrastructure
- **Domain**: sinister-dexter.com (registered by David Weekly on NameCheap.com)
- **DNS**: Managed by Cloudflare
- **Hosting**: Cloudflare Pages
- **CDN**: Cloudflare R2 at cdn.sinister-dexter.com
- **Repository**: GitHub (main branch)

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

### 📅 Update Shows
1. Edit `public/data/shows.json`
2. Add show details in this format:
```json
{
  "date": "2025-03-15",
  "venue": "The Fillmore",
  "location": "San Francisco, CA",
  "time": "8:00 PM - 11:00 PM",
  "description": "Special St. Patrick's weekend show",
  "link": "https://thefillmore.com/",
  "featured": true  // Optional: highlights the show
}
```
3. Run `npm run build:html`
4. Deploy: `./deploy.sh staging` then `./deploy.sh prod`

### 👥 Update Band Members
1. Edit the band members section in `template/index.html` (search for "BAND MEMBERS SECTION")
2. To add a member:
   - Add their photo to `photos/` directory
   - Run `npm run build:images` to process the photo
   - Add member HTML in template:
```html
<div class="text-center">
  <img src="images/member-name.jpg" alt="Member Name" class="w-32 h-32 rounded-full mx-auto mb-4 object-cover">
  <h3 class="font-bold text-lg">Member Name</h3>
  <p class="text-purple-400">Instrument</p>
  </div>
```
3. Run `npm run build:html`
4. Deploy changes

### 🎵 Manage Music Tracks
1. Edit the tracks array in `template/index.html` (search for "tracks = [")
2. To add a track:
   - Upload MP3 to Cloudflare R2 (cdn.sinister-dexter.com/music/)
   - Add to tracks array:
```javascript
{ 
  num: 22,  // Next number in sequence
  title: "Song Title",
  artist: "Sinister Dexter",
  duration: "4:32",
  src: "https://cdn.sinister-dexter.com/music/filename.mp3"
}
```
3. To remove: Delete the track object from array
4. Run `npm run build:html` and deploy

### 🎨 Change Site Structure/Layout
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
- MP3 CDN: https://cdn.sinister-dexter.com/
- Email Subscription: mailto:gigs-subscribe@sinisterdexter.net

## Deployment

### Manual Deployment
⚠️ **ALWAYS TEST IN STAGING FIRST**
1. Build locally: `npm run build:html`
2. Deploy to staging: `./deploy.sh staging`
3. Test at https://main.sinister-dexter.pages.dev/
4. Only after verification, deploy to production: `./deploy.sh prod`

### Automated CI/CD (To Be Implemented)
**Goal**: Automatic builds and deployments via GitHub Actions
- **Pull Requests**: Auto-deploy to staging environment for preview
- **Main branch merge**: Auto-deploy to production

#### Required GitHub Actions Workflow:
1. Create `.github/workflows/deploy.yml`
2. Set up Cloudflare API tokens as GitHub secrets
3. Workflow triggers:
   - On PR: Build and deploy to staging with preview URL
   - On merge to main: Build and deploy to production
   
#### Benefits:
- No manual deployment needed
- Automatic preview for every PR
- Production updates on merge
- Build validation before deployment

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

## Quick Reference

### Most Common Updates:
1. **Add a show**: Edit `public/data/shows.json` → build → deploy
2. **Update band photo**: Add to `photos/` → `npm run build:images` → build → deploy
3. **Add/remove song**: Edit tracks array in `template/index.html` → build → deploy
4. **Update band member**: Edit template/index.html → build → deploy

### Build & Deploy Commands:
```bash
# Local development
npm run serve          # Start local server

# Build
npm run build:html     # Rebuild site
npm run build:images  # Process new photos

# Deploy
./deploy.sh staging    # Deploy to staging
./deploy.sh prod       # Deploy to production (with confirmation)
```

---
Last updated: 2025-08-06


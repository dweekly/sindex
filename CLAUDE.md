# CLAUDE.md - Project Context for AI Assistants

## Project Overview
Sinister Dexter band website - A modular, data-driven static site generator for a San Francisco Bay Area funk/soul band using Handlebars templates and rich microformats.

## Domain & Infrastructure
- **Domain**: sinister-dexter.com (registered by David Weekly on NameCheap.com)
- **DNS**: Managed by Cloudflare
- **Hosting**: Cloudflare Pages
- **CDN**: Cloudflare R2 at cdn.sinister-dexter.com
- **Repository**: GitHub (main branch)

## CRITICAL RULES
⚠️ **NEVER EDIT public/index.html DIRECTLY** - It is a generated file and will be overwritten!
- Always edit the source files (templates, partials, or data files)
- Content updates should be made in JSON data files, not in templates
- Run `npm run build:html` or `node build-modular.js` to regenerate HTML after making changes

## Project Structure
```
/
├── build-static.js      # Legacy monolithic build script
├── build-modular.js     # NEW: Modular Handlebars build system
├── template/
│   ├── index.html      # Legacy monolithic template
│   └── partials/       # NEW: Modular template components
│       ├── head/
│       │   ├── meta.hbs           # SEO and meta tags
│       │   ├── styles.hbs         # CSS and font loading
│       │   └── structured-data.hbs # JSON-LD structured data
│       ├── sections/
│       │   ├── hero.hbs          # Hero landing section
│       │   ├── shows.hbs         # Events with microformats
│       │   ├── members.hbs       # Band members with Person schema
│       │   └── ...               # Additional sections
│       └── components/
│           ├── navigation.hbs    # Main navigation
│           └── ...              # Reusable components
├── public/
│   ├── index.html      # GENERATED OUTPUT - DO NOT EDIT!
│   ├── data/           # Structured data (EDIT THESE for content)
│   │   ├── shows.json            # Legacy shows format
│   │   ├── shows-enhanced.json  # NEW: Rich event data
│   │   ├── members.json          # Legacy members format  
│   │   ├── members-enhanced.json # NEW: Rich member profiles
│   │   ├── venues.json          # NEW: Venue details
│   │   └── tracks.json          # Music track data
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

### Modular System (NEW - Recommended)
1. **Template Engine**: Handlebars compiles modular templates with partials
2. **Rich Microformats**: Automatic generation of Schema.org structured data
3. **Component-Based**: Reusable template partials for maintainability
4. **Enhanced Data**: Rich JSON schemas with social links, geo data, etc.

### Legacy System (Still Supported)
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
  "city": "San Francisco, CA",
  "dayOfWeek": "SAT",
  "time": "8:00 PM - 11:00 PM",
  "description": "Special St. Patrick's weekend show",
  "link": "https://thefillmore.com/",
  "tickets": "https://www.ticketmaster.com/event/123456",
  "featured": true  // Optional: highlights the show
}
```
- `link` - Event info page (optional)
- `tickets` - Ticket purchase page (optional, shows "Buy Tickets" button)
3. Run `npm run build:html`
4. Deploy: `./deploy.sh staging` then `./deploy.sh prod`

### 👥 Update Band Members

#### Modular System (Recommended)
1. Edit `public/data/members-enhanced.json`
2. Add member with rich data:
```json
{
  "id": "member-id",
  "name": "Member Name",
  "role": "Instrument",
  "image": "filename",
  "bio": "Full biography...",
  "emoji": "🎸",
  "yearsWithBand": "2020-present",
  "instruments": ["Guitar", "Vocals"],
  "socialLinks": {
    "instagram": "handle",
    "website": "https://..."
  },
  "founding": false
}
```
3. Add photo to `photos/members/` directory
4. Run `npm run build:images` to process photos
5. Run `node build-modular.js`
6. Deploy changes

#### Legacy System
1. Edit template/index.html directly
2. Run `npm run build:html`

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
- **Handlebars** template engine (NEW)
- Tailwind CSS (currently via CDN, production setup available)
- Vanilla JavaScript
- Sharp for image processing
- Static HTML generation with minification

## SEO & Metadata
- **Enhanced Schema.org** structured data:
  - MusicGroup with full member profiles
  - MusicEvent with venue geo-coordinates
  - Person schema for each band member
  - VideoObject for performances
  - BreadcrumbList for navigation
- **Rich Microformats** embedded in HTML
- Open Graph and Twitter Card meta tags
- Accessibility features (ARIA labels, semantic HTML, skip navigation)

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

## Modular Build System Benefits

### For Developers
- **Maintainability**: 15+ small files instead of 1 huge 1900+ line file
- **Reusability**: Share components across pages
- **Testing**: Test individual components
- **Version Control**: Better diffs, easier reviews

### For Content Editors
- **Semantic Updates**: Edit JSON files, not HTML
- **Rich Data**: Add social links, bios, venue details
- **Validation**: JSON schema ensures data quality
- **No HTML Knowledge Required**: Pure data editing

### For SEO
- **Rich Snippets**: Enhanced search results
- **Event Cards**: Shows appear in Google Events
- **Knowledge Graph**: Band and member profiles
- **Local SEO**: Venue geo-coordinates

---
Last updated: 2025-08-14
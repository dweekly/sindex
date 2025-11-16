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
- Run `npm run build:html` to regenerate HTML after making changes

⚠️ **NEVER FABRICATE INFORMATION** - Do not make up data about the band, members, or events!
- Only use information that exists in the source files or is explicitly provided by the user
- Leave fields empty, use "TODO" comments, or placeholder text rather than inventing details
- This especially applies to: band member bios, years with band, venues played, show dates, etc.

## Project Structure
```
/
├── build.js            # Modular Handlebars build system
├── template/
│   └── partials/       # Modular template components
│       ├── head/
│       │   ├── meta.hbs           # SEO and meta tags
│       │   ├── styles.hbs         # CSS and font loading
│       │   └── structured-data.hbs # JSON-LD structured data
│       ├── sections/
│       │   ├── hero.hbs          # Hero landing section
│       │   ├── shows.hbs         # Events with microformats
│       │   ├── members.hbs       # Band members with Person schema
│       │   ├── music.hbs         # Track listing
│       │   ├── videos.hbs        # YouTube videos
│       │   ├── gallery.hbs       # Photo gallery
│       │   ├── about.hbs         # Band history
│       │   ├── pull-quote.hbs    # Press quote
│       │   ├── venues.hbs        # Notable venues
│       │   └── connect.hbs       # Social links & contact
│       └── components/
│           ├── navigation.hbs    # Main navigation
│           ├── footer.hbs        # Page footer
│           ├── music-player.hbs  # Bottom audio player
│           └── scripts.hbs       # JavaScript
├── public/
│   ├── index.html      # GENERATED OUTPUT - DO NOT EDIT!
│   ├── index.php       # GENERATED OUTPUT - DO NOT EDIT!
│   ├── data/           # Structured data (EDIT THESE for content)
│   │   ├── shows.json            # Show/event data
│   │   ├── members.json          # Band member profiles  
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
1. **Template Engine**: Handlebars compiles modular templates with partials
2. **Rich Microformats**: Automatic generation of Schema.org structured data
3. **Component-Based**: Reusable template partials for maintainability
4. **Data-Driven**: Content stored in JSON files, templates handle presentation
5. **Image Processing**: Automated WebP/JPEG generation with thumbnails
6. **HTML Minification**: Aggressive minification while preserving functionality

## Common Tasks

### 📅 Update Shows
1. Edit `template/data/shows.json`
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

### 📸 Add Media to Past Shows
Past shows can include optional media (pictures, vertical videos, horizontal videos):
1. Edit `template/data/shows.json`
2. Add a `media` array to any past show:
```json
{
  "date": "2025-11-14",
  "venue": "Club Fox",
  "city": "Redwood City, CA",
  "time": "7:00 PM - 11:00 PM",
  "link": "https://clubfoxrwc.com/",
  "media": [
    {
      "type": "image",
      "url": "https://cdn.sinister-dexter.com/photos/show-photo.jpg",
      "alt": "Band performing at Club Fox"
    },
    {
      "type": "video-vertical",
      "platform": "tiktok",
      "videoId": "7573064485842242871",
      "username": "@sindex_band",
      "caption": "From our Nov 14, 2025 show at Club Fox!"
    },
    {
      "type": "video-horizontal",
      "platform": "youtube",
      "videoId": "xyz789"
    }
  ]
}
```
**Media Types:**
- `image` - Photos from the show (displayed as square thumbnails)
- `video-vertical` - TikTok videos (uses official TikTok embed)
- `video-horizontal` - YouTube videos (iframe embed)

**Required Fields by Type:**

**Images:**
- `type`: "image"
- `url`: Direct image URL
- `alt`: Alt text for accessibility

**TikTok Videos:**
- `type`: "video-vertical"
- `videoId`: TikTok video ID (the numeric ID from the URL)
- `username`: TikTok username (optional, defaults to @sindex_band)
- `caption`: Caption text (optional)
- `url`: Full TikTok URL (optional, auto-generated from videoId)

**YouTube Videos:**
- `type`: "video-horizontal"
- `videoId`: YouTube video ID (the part after `v=` or in shorts URL)

3. Run `npm run build:html`
4. Deploy changes

**Note:** The TikTok embed component is located at `template/partials/components/tiktok-embed.hbs` and can be reused anywhere in templates with:
```handlebars
{{> components/tiktok-embed videoId="7573064485842242871" username="@sindex_band" caption="Optional caption"}}
```

### 👥 Update Band Members
1. Edit `public/data/members.json`
2. Add member data:
```json
{
  "id": "member-id",
  "name": "Member Name",
  "role": "Instrument",
  "image": "filename",
  "bio": "Full biography text here...",
  "emoji": "🎸",
  "founding": false,
  "yearsWithBand": "2020-present"  // Optional, only if confirmed
}
```
3. Add photo to `photos/members/` directory
4. Run `npm run build:images` to process photos
5. Run `npm run build:html`
6. Deploy changes

### 🎵 Manage Music Tracks
1. Edit `public/data/tracks.json`
2. To add a track:
   - Upload MP3 to Cloudflare R2 (cdn.sinister-dexter.com/music/)
   - Add to tracks.json:
```json
{ 
  "num": 22,
  "title": "Song Title",
  "artist": "Sinister Dexter",
  "duration": "4:32",
  "filename": "filename.mp3"
}
```
3. To remove: Delete the track object from array
4. Run `npm run build:html` and deploy

### 🎨 Change Site Structure/Layout
Edit the appropriate template partial in `template/partials/` then run `npm run build:html`

### Add New Photos
1. Add photos to `photos/` directory
2. Run `npm run build:images`
3. Run `npm run build:html`

### Fix JavaScript Errors
Edit the JavaScript in `template/partials/components/scripts.hbs`

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
3. **Add/remove song**: Edit `public/data/tracks.json` → build → deploy
4. **Update band member**: Edit `public/data/members.json` → build → deploy

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
Last updated: 2025-08-15
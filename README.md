# Sinister Dexter Website

A modern, minimalist website for the San Francisco Bay Area funk & soul band Sinister Dexter with automated image processing.

## Features

- **Responsive Design** - Mobile-first approach, works on all devices
- **Automated Image Processing** - Drop images in `photos/`, they're automatically resized and optimized
- **Dynamic Content** - Shows and gallery loaded from JSON/processed images
- **Hero Section** - Eye-catching landing with band tagline
- **Shows Section** - Upcoming performances loaded from `shows.json`
- **Music Streaming** - Embedded Spotify and Apple Music players
- **Photo Gallery** - Lightbox-enabled gallery with multiple image sizes
- **Social Links** - Instagram, X, Facebook, YouTube (coming soon)
- **Mailing List** - Email signup form (ready for integration)
- **Merch Section** - Placeholder for future merchandise store

## Tech Stack

- HTML5
- Tailwind CSS (via CDN)
- Vanilla JavaScript
- Node.js for image processing (Sharp)
- Font Awesome icons
- Google Fonts (Bebas Neue & Inter)

## File Structure

```
/sindex
├── photos/             # Drop original images here (JPG, HEIC, PNG)
├── public/             # All static website files
│   ├── index.html      # Main website
│   ├── data/
│   │   └── shows.json  # Show data
│   └── images/         # Auto-generated image sizes
│       ├── thumbnail/  # 400x400
│       ├── small/      # 640x480
│       ├── medium/     # 1024x768
│       ├── large/      # 1920x1080
│       ├── original/   # 2560x1440
│       └── manifest.json
├── process-images.js   # Image processing script
├── convert-heic.sh     # HEIC to JPG converter
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## Quick Start

```bash
# Install dependencies
npm install

# Process all images and start local server
npm run dev

# Or step by step:
npm run convert-heic    # Convert HEIC files to JPG
npm run process-images  # Process all images
npm run serve          # Start local server

# Watch for new images (auto-process when added)
npm run watch-images
```

## How to Update

### Shows/Events
Edit `public/data/shows.json` to add or modify upcoming shows:
```json
{
  "date": "2024-03-15",
  "dayOfWeek": "FRI",
  "venue": "The Independent",
  "city": "San Francisco, CA",
  "time": "9:00 PM",
  "ticketUrl": "https://www.theindependentsf.com",
  "featured": true
}
```

### Photos
Simply drop new images into the `photos/` directory and run:
```bash
npm run process-images     # Process only new/changed images
npm run process-images:force # Force reprocess all images
npm run watch-images       # Auto-process on file changes
```

Images are automatically:
- **Smart cached** - Only new/changed files are processed
- Converted from HEIC to JPG (on macOS using `convert-heic.sh`)
- Resized to multiple sizes (thumbnail, small, medium, large, original)
- Optimized in both WebP and JPG formats
- Added to the gallery automatically

**Note on HEIC files:** If you see HEIC errors, run `./convert-heic.sh` first to convert them to JPG.

### Social Links
Update URLs in the Connect section as new profiles are created.

## To-Do List

- [ ] Create YouTube channel for the band
- [ ] Add real band photos to gallery
- [ ] Integrate mailing list with service (Mailchimp/ConvertKit)
- [ ] Connect shows.json to dynamically load shows
- [ ] Add Google Analytics or similar
- [ ] Set up custom domain
- [ ] Design and add merchandise when available

## Deployment

The site is configured for **Cloudflare Pages** deployment:

### Quick Deploy
```bash
# One-time setup
npm install -g wrangler
wrangler login

# Deploy
./deploy-manual.sh
```

Your site will be live at: `https://sinister-dexter.pages.dev`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions including:
- GitHub auto-deployment setup
- Custom domain configuration
- Content updates workflow
- Rollback procedures

## Color Scheme

- Purple (`#9333ea`) - Primary brand color
- Amber (`#f59e0b`) - Accent color
- Black & grays - Background and text
- Gradient combinations for visual interest

## Contact

For bookings and inquiries: booking@sinisterdexter.net

## Social Media

- Instagram: [@sindex_band](https://www.instagram.com/sindex_band)
- X/Twitter: [@sindexband](https://x.com/sindexband)
- Facebook: [SinDex.Band](https://facebook.com/SinDex.Band/)
- Apple Music: [Artist Page](https://music.apple.com/us/artist/sinister-dexter/30663361)
- Spotify: [Artist Page](https://open.spotify.com/artist/06ZpJFLW4Kz4EAlUorzrFu)
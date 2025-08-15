# Template Data

Source JSON data files for the website. These files are read during the build process.

## Data Files

### members.json
Band member information including names, roles, bios, and profile image references.

### shows.json
Upcoming and past show listings with dates, venues, and ticketing information.

### tracks.json
Music track listing with titles, durations, and CDN URLs for the music player.

### videos.json
YouTube video IDs and metadata for the video gallery section.

## Editing

Edit these files directly to update website content, then run:
```bash
npm run build:html
```

## Important Notes

- Use valid JSON syntax (validate at jsonlint.com if unsure)
- Dates should be in ISO format (YYYY-MM-DD)
- DO NOT edit files in `public/data/` - those are deprecated
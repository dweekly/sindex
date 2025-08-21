# Sinister Dexter Internal Archive

A password-protected internal site for accessing unreleased recordings, photos, and videos.

## Features

- Password protection (password: 'piss')
- Completely blocked from search engines and crawlers
- Per-track MP3/WAV streaming and downloads
- Internal notes for each track
- Responsive design
- Session-based authentication

## Structure

```
internal-site/
├── public/
│   ├── index.html          # Main page with auth and player
│   └── robots.txt          # Deny all crawlers
├── shows-internal.json     # Show and track data
├── data-schema.json        # Data structure documentation
├── wrangler.toml          # Cloudflare Pages config
└── README.md              # This file
```

## Data Architecture

The system supports:
- **Shows**: Individual performance events
- **Tracks**: Audio recordings (MP3 + WAV)
- **Photos**: Performance and behind-the-scenes images
- **Videos**: Performance footage
- **Internal Notes**: Private notes for each item
- **Publication Status**: Control what gets published to main site

## R2 Bucket Structure

Files are stored in Cloudflare R2 at:
```
sinister-dexter-music/
└── unreleased/
    └── 2025-08-20-Music-In-The-Park/
        ├── *.mp3              # Compressed audio
        ├── *.wav              # Original audio
        ├── photos/            # Future: show photos
        └── videos/            # Future: show videos
```

## Deployment

1. **Set up domain**: Configure `internal.sinisterdexter.com` in Cloudflare
2. **Deploy site**: 
   ```bash
   cd internal-site
   wrangler pages deploy public --project-name sinister-dexter-internal
   ```
3. **Configure DNS**: Point `internal.sinisterdexter.com` to the Pages deployment

## Music Processing Workflow

1. **Convert WAV to MP3**: 
   ```bash
   ./scripts/convert-to-mp3.sh ~/Downloads/music/unreleased/SHOW-FOLDER/ ./mp3_output/
   ```

2. **Upload to R2**:
   ```bash
   ./scripts/upload-to-r2.sh ./mp3_output/ unreleased/SHOW-FOLDER/
   ```

3. **Update data**: Edit `shows-internal.json` with new show/track info

4. **Deploy**: Push changes to trigger deployment

## Future Enhancements (TODO)

- [ ] Admin UI for managing published/unpublished status
- [ ] Batch editing of internal notes
- [ ] Photo/video upload and management
- [ ] User access controls (multiple passwords/users)
- [ ] Activity logging
- [ ] Mobile app for field recording management

## Security Notes

- Password is client-side only (sufficient for basic access control)
- All content is blocked from search engines via robots.txt
- R2 bucket URLs are direct but not indexed
- Session storage used for auth persistence
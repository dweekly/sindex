# Sinister Dexter Website Roadmap

## Future Enhancements

### YouTube Video Metadata Automation
**Priority: High**
**Effort: Medium**

Instead of manually maintaining video metadata in `template/data/videos.json`, implement an automated system that:
1. Stores only YouTube video IDs or URLs in the JSON file
2. During the build process (`npm run build:html`), fetches metadata directly from YouTube API:
   - Video title
   - Upload date (with proper timezone)
   - Description
   - Duration
   - Thumbnail URL
3. Validates that all video URLs are still accessible
4. Caches the fetched metadata to avoid repeated API calls
5. Falls back to cached data if YouTube API is unavailable

**Benefits:**
- Always up-to-date metadata
- Automatic validation of video availability
- Proper datetime formatting with timezones
- Reduced manual maintenance
- Single source of truth (YouTube)

**Implementation Notes:**
- Would require YouTube Data API v3 key
- Add to `scripts/build.js` as a pre-processing step
- Store cache in `.cache/youtube-metadata.json`
- Include rate limiting to respect API quotas

### Other Planned Improvements

- Integrate mailing list with email service provider
- Add real-time show ticket availability checking
- Implement band member bios and equipment listings
- Create press kit download section
- Add music streaming analytics dashboard
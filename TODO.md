# TODO

## Project Structure Improvements

### Asset Organization
- [ ] Move all source imagery out of root directory
  - `favicon-source.png`
  - `sindex-artist.png`
  - Other source images
  - Create `src/assets/images/` directory

- [ ] Move all source sounds out of root directory
  - Create `src/assets/audio/` if needed

- [ ] Move all icon sources out of root directory
  - Create `src/assets/icons/` directory

### Data Architecture
- [ ] Move source metadata out of public/ directory
  - Move `public/data/*.json` to `src/data/`
  - Make `public/` output-only (generated files only)
  - Update build scripts to read from `src/data/` and output to `public/`
  - Ensures clean separation between source and distribution

### Data File Simplification
- [ ] Rename `members-enhanced.json` back to `members.json`
  - No need for separate enhanced version
  - Single source of truth for member data

- [ ] Rename `shows-enhanced.json` back to `shows.json`
  - Consolidate into single shows data file
  - Include all rich metadata in main file

- [ ] Remove `venues.json` requirement
  - Embed venue data directly in shows.json
  - Avoid maintaining separate venue database
  - Reduce data duplication and maintenance burden

### Media Management

#### YouTube Videos
- [ ] Create `videos.json` configuration file
  - Move hardcoded YouTube video data to JSON
  - Include: video ID, title, description, upload date
  - Make it easy to add/remove/reorder videos
  - Structure:
    ```json
    {
      "videos": [
        {
          "id": "D9gIdE7IJsY",
          "title": "Son of a Preacher Man",
          "description": "Redwood City Music In The Park, 2012",
          "uploadDate": "2012-08-15",
          "duration": "PT3M30S"
        }
      ]
    }
    ```

#### MP3 Validation System
- [ ] Create Cloudflare R2 bucket validation tool
  - Pull list of MP3 files from R2 bucket
  - Verify each file is accessible and streamable
  - Check file sizes and metadata
  - Validate against tracks.json
  - Only update available songs after verification

- [ ] Implement automated health checks for MP3s
  - Regular validation of CDN availability
  - Alert on missing or corrupted files
  - Ensure all tracks in playlist are playable

## Build System Enhancements

- [ ] Update build scripts for new source structure
  - Read from `src/` directories
  - Output only to `public/`
  - Clear separation of concerns

- [ ] Create watch mode for development
  - Auto-rebuild on source file changes
  - Live reload capability

## Future Enhancements

- [ ] Consider moving to a static site generator
  - Evaluate: Eleventy, Astro, or similar
  - Maintain current performance metrics
  - Improve developer experience

- [ ] Add CMS integration
  - Headless CMS for non-technical updates
  - Netlify CMS or similar
  - JSON file generation from CMS

## Completed

- [x] Create enhanced data schemas for members and events
- [x] Set up template engine (Handlebars)
- [x] Create modular template directory structure
- [x] Extract head section into partials
- [x] Extract main sections into partials
- [x] Create component generators with microformats
- [x] Update build script for modular system
- [x] Test and validate output (100% quality score)
- [x] Update documentation for modular system
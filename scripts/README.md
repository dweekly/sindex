# Scripts

Build scripts and utilities for the Sinister Dexter website.

## Core Scripts

### Build Scripts
- `build.js` - Main build script that compiles templates and generates HTML
- `process-images.js` - Processes gallery photos into web-optimized formats
- `process-members.js` - Processes band member profile photos
- `process-favicon.js` - Generates favicon variants from source image
- `generate-sitemap.js` - Creates sitemap.xml for SEO

### Testing
- `test-site.js` - Basic site validation tests
- `test-advanced.js` - Comprehensive testing suite

## Usage

All scripts are run via npm commands defined in package.json:

```bash
npm run build:html    # Run build.js
npm run build:images  # Run process-images.js
npm run test          # Run test-site.js
```

## Data Flow

1. Scripts read source data from `template/data/`
2. Process images from `template/gallery/` and `template/profiles/`
3. Compile templates from `template/partials/`
4. Output to `public/` directory
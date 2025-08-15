# Gallery Photos

Source photos for the website gallery section.

## Adding Photos

1. Add high-resolution photos to this directory
2. Run image processing: `npm run build:images`
3. Rebuild site: `npm run build:html`

## Photo Requirements

- **Format**: JPEG or PNG
- **Resolution**: At least 1920px on longest edge
- **File size**: Under 10MB per photo
- **Naming**: Use descriptive names (e.g., `band-at-fillmore-2024.jpg`)

## Processing

The build script will:
- Generate WebP versions for modern browsers
- Create thumbnail versions (400px wide)
- Create large versions (1920px wide)
- Optimize file sizes
- Output to `public/images/`

## Current Photos

Photos should showcase the band performing live, band members, and behind-the-scenes moments.
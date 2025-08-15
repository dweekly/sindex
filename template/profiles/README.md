# Band Member Profile Photos

Individual photos of band members for the Band section.

## Photo Requirements

- **Format**: JPEG or PNG
- **Aspect Ratio**: Square (1:1) preferred
- **Resolution**: At least 800x800px
- **File naming**: Match the member ID in members.json
  - Example: `rebecca-lipon.jpg` for member with id "rebecca-lipon"

## Processing

Run `npm run build:images` to process photos. The script will:
- Crop to square if needed
- Generate WebP versions
- Create optimized sizes
- Output to `public/images/members/`

## Adding New Members

1. Add photo to this directory
2. Update `template/data/members.json` with member info
3. Run `npm run build:images`
4. Run `npm run build:html`
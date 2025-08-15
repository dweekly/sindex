# Template Directory

Source files for the Sinister Dexter website.

## Structure

```
template/
├── data/          # JSON data files (members, shows, tracks, videos)
├── gallery/       # Source photos for gallery
├── profiles/      # Band member profile photos
├── partials/      # Handlebars template components
│   ├── components/  # Reusable UI components
│   ├── head/        # HTML head elements
│   └── sections/    # Page sections
└── styles.css     # Source Tailwind CSS
```

## Workflow

1. **Update Content**: Edit JSON files in `data/`
2. **Add Photos**: Place in `gallery/` or `profiles/`
3. **Modify Layout**: Edit Handlebars templates in `partials/`
4. **Style Changes**: Update `styles.css`
5. **Build**: Run `npm run build:html`

## Key Files

- `partials/sections/hero.hbs` - Hero section with band photo
- `partials/sections/shows.hbs` - Upcoming shows listing
- `partials/sections/music.hbs` - Music player section
- `partials/components/navigation.hbs` - Site navigation

## Template Engine

Uses Handlebars for templating with custom helpers defined in the build script.
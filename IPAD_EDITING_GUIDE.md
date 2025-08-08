# iPad Editing Guide for Sinister Dexter Website

## Quick Start: Editing from Your iPad

### Option 1: GitHub.dev (Recommended - No Setup Required!)

1. **Open Safari** on your iPad
2. **Go to**: `github.dev/dweekly/sindex`
   - Or go to the repo and press `.` (period key)
3. **Sign in** to GitHub
4. **Edit files** directly in the browser
5. **Commit changes** - they'll automatically deploy!

## What You Can Edit

All content is in simple JSON files that are easy to edit:

### 📅 Edit Shows
**File**: `public/data/shows.json`

```json
{
  "date": "2025-03-15",
  "venue": "The Fillmore",
  "city": "San Francisco, CA", 
  "dayOfWeek": "SAT",
  "time": "8:00 PM - 11:00 PM",
  "description": "Special St. Patrick's weekend show",
  "link": "https://thefillmore.com/",
  "tickets": "https://www.ticketmaster.com/event/1234567",
  "featured": true
}
```

Tips:
- Set `featured: true` to highlight important shows
- Dates are YYYY-MM-DD format
- Shows move to "past" automatically 2 days after the date
- `link` is for event info page (optional)
- `tickets` is for ticket purchase page (optional)
- You can have both, either, or neither link

### 👥 Edit Band Members
**File**: `public/data/members.json`

```json
{
  "name": "Rebecca Lipon",
  "role": "Lead Vocals",
  "image": "rebecca",
  "bio": "Powerhouse vocalist",
  "founding": true
}
```

Tips:
- `image` is just the filename (no extension)
- Set `founding: true` to show the "F" badge
- Bio is optional

### 🎵 Edit Music Tracks
**File**: `public/data/tracks.json`

```json
{
  "num": 22,
  "title": "New Song Title",
  "artist": "Sinister Dexter",
  "duration": "4:32",
  "filename": "Sinister_Dexter-New_Song.mp3"
}
```

Tips:
- Keep track numbers in order
- Duration format is "M:SS"
- MP3 files must be uploaded to R2 separately

## Step-by-Step Editing

### To Add a New Show:

1. Open `github.dev/dweekly/sindex`
2. Navigate to `public/data/shows.json`
3. Click the edit button (pencil icon)
4. Add your show to the `upcomingShows` array:
```json
{
  "date": "2025-04-01",
  "venue": "Great American Music Hall",
  "city": "San Francisco, CA",
  "dayOfWeek": "TUE",
  "time": "7:30 PM - 10:30 PM",
  "description": "April Fools funk explosion!",
  "link": "https://gamh.com",
  "tickets": "https://www.eventbrite.com/e/sinister-dexter-tickets-123456"
}
```
5. Click "Commit changes..."
6. Add message: "Add Great American Music Hall show"
7. Select "Commit directly to the main branch"
8. Click "Commit changes"

The site will automatically rebuild and deploy in ~2 minutes!

### To Update a Band Member:

1. Open `public/data/members.json`
2. Find the member in the appropriate section
3. Edit their info:
```json
{
  "name": "New Member",
  "role": "Saxophone",
  "image": "newmember",
  "bio": "Jazz and funk specialist"
}
```
4. Commit with message like "Update saxophone player"

### To Add a New Track:

1. Open `public/data/tracks.json`
2. Add to the `tracks` array:
```json
{
  "num": 22,
  "title": "Funky New Tune",
  "artist": "Sinister Dexter",
  "duration": "3:45",
  "filename": "Sinister_Dexter-Funky_New_Tune.mp3"
}
```
3. Commit with message like "Add Funky New Tune to playlist"

## JSON Editing Tips for iPad

### Use These Keyboard Shortcuts:
- **Cmd+S**: Save file
- **Cmd+Z**: Undo
- **Cmd+Shift+Z**: Redo
- **Cmd+F**: Find text
- **Cmd+K, Cmd+0**: Fold all sections
- **Cmd+K, Cmd+J**: Unfold all

### Common JSON Rules:
- Always use double quotes `"` not single quotes `'`
- No comma after the last item in an array or object
- Dates are strings: `"2025-03-15"`
- Booleans are lowercase: `true` or `false`
- Check for matching brackets `{}` and `[]`

### Validate Your JSON:
If you're unsure, paste your JSON into: https://jsonlint.com

## Alternative iPad Apps

### Working Copy (Recommended - $20)
- Full Git client for iPad
- Clone the repo
- Edit with syntax highlighting
- Push directly to GitHub

### Textastic ($10)
- Code editor with Git support
- Good for quick edits
- Nice syntax highlighting

## Deployment

After committing changes:
1. Changes trigger automatic deployment
2. Check build status at: github.com/dweekly/sindex/actions
3. Site updates in ~2 minutes
4. View at: https://sinister-dexter.com

## Need Help?

- **Build failed?** Check the Actions tab on GitHub
- **JSON error?** Validate at jsonlint.com
- **Can't edit?** Make sure you're signed into GitHub

## Quick Links

- **Edit Shows**: [github.dev/dweekly/sindex/blob/main/public/data/shows.json](https://github.dev/dweekly/sindex/blob/main/public/data/shows.json)
- **Edit Members**: [github.dev/dweekly/sindex/blob/main/public/data/members.json](https://github.dev/dweekly/sindex/blob/main/public/data/members.json)
- **Edit Tracks**: [github.dev/dweekly/sindex/blob/main/public/data/tracks.json](https://github.dev/dweekly/sindex/blob/main/public/data/tracks.json)
- **View Site**: [sinister-dexter.com](https://sinister-dexter.com)
- **Check Builds**: [github.com/dweekly/sindex/actions](https://github.com/dweekly/sindex/actions)

---

*Pro tip: Bookmark this guide on your iPad for quick reference!*
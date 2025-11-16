#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');
const { minify } = require('html-minifier-terser');
const { format, parseISO, formatISO, parse } = require('date-fns');
const { toZonedTime, fromZonedTime, formatInTimeZone } = require('date-fns-tz');

// Register Handlebars helpers
// Helper for current year
Handlebars.registerHelper('currentYear', () => new Date().getFullYear());

Handlebars.registerHelper('math', (a, operator, b) => {
    const ops = {
        '+': (x, y) => x + y,
        '-': (x, y) => x - y,
        '*': (x, y) => x * y,
        '/': (x, y) => x / y,
    };
    return ops[operator](a, b);
});

Handlebars.registerHelper('subtract', (a, b) => a - b);

Handlebars.registerHelper('limit', (array, limit) => {
    return array ? array.slice(0, limit) : [];
});

Handlebars.registerHelper('slice', (array, start, end) => {
    return array ? array.slice(start, end) : [];
});

Handlebars.registerHelper('gt', (a, b) => a > b);

Handlebars.registerHelper('eq', (a, b) => a === b);

Handlebars.registerHelper('startsWith', (str, prefix) => {
    return str && typeof str === 'string' && str.startsWith(prefix);
});

// Helper to lookup nested array values
Handlebars.registerHelper('lookup', (array, index, property) => {
    if (!array || !array[index]) return '';
    return property ? array[index][property] : array[index];
});

// Helper to output JSON
Handlebars.registerHelper('json', (context) => {
    return JSON.stringify(context);
});

Handlebars.registerHelper('truncate', (str, length) => {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
});

Handlebars.registerHelper('formatDate', (dateStr, formatStr) => {
    if (!dateStr) return '';
    
    // Parse the date string and format it in Pacific timezone
    const timeZone = 'America/Los_Angeles';
    
    // Parse the date string directly (YYYY-MM-DD format)
    const [year, month, day] = dateStr.split('-').map(Number);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    switch(formatStr) {
        case 'MMM DD':
            return `${months[month - 1]} ${day}`;
        case 'MMM DD, YYYY':
            return `${months[month - 1]} ${day}, ${year}`;
        case 'Month DD, YYYY':
            return `${monthsFull[month - 1]} ${day}, ${year}`;
        default:
            return dateStr;
    }
});

Handlebars.registerHelper('formatTime', (timeStr) => {
    if (!timeStr) return '';
    // If time already has AM/PM, clean it up to be concise
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
        // Just return the time as-is for now (will be handled by formatTimeRange)
        return timeStr;
    }
    // Otherwise format it (assuming 24-hour input)
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
});

Handlebars.registerHelper('formatTimeRange', (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    
    // Extract hours and meridians from both times
    const extractTime = (timeStr) => {
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return null;
        return {
            hour: parseInt(match[1]),
            minute: match[2],
            meridian: match[3].toUpperCase()
        };
    };
    
    const start = extractTime(startTime);
    const end = extractTime(endTime);
    
    if (!start || !end) return `${startTime} - ${endTime}`;
    
    // If both times have the same meridian, combine them
    if (start.meridian === end.meridian) {
        // If minutes are :00, just show hours
        if (start.minute === '00' && end.minute === '00') {
            return `${start.hour} - ${end.hour}${end.meridian.toLowerCase()}`;
        }
        // Otherwise show full times but share meridian
        return `${start.hour}:${start.minute} - ${end.hour}:${end.minute}${end.meridian.toLowerCase()}`;
    }
    
    // Different meridians - show both but concise
    if (start.minute === '00' && end.minute === '00') {
        return `${start.hour}${start.meridian.toLowerCase()} - ${end.hour}${end.meridian.toLowerCase()}`;
    }
    return `${start.hour}:${start.minute}${start.meridian.toLowerCase()} - ${end.hour}:${end.minute}${end.meridian.toLowerCase()}`;
});

Handlebars.registerHelper('getStartYear', (yearsWithBand) => {
    if (!yearsWithBand) return '';
    const match = yearsWithBand.match(/(\d{4})/);
    return match ? match[1] : '';
});

Handlebars.registerHelper('getTimezoneOffset', (timezone) => {
    // For Pacific Time
    return '-08:00';
});

Handlebars.registerHelper('extractPrice', (admission) => {
    if (!admission) return null;
    if (admission.toLowerCase() === 'free') return null;
    const match = admission.match(/\$(\d+)/);
    return match ? match[1] : null;
});

// Helper function to parse address string into components
function parseAddress(addressString) {
    if (!addressString) {
        return {
            streetAddress: '',
            addressLocality: '',
            addressRegion: '',
            postalCode: '',
            addressCountry: 'US'
        };
    }
    
    // Handle object addresses (backwards compatibility)
    if (typeof addressString === 'object') {
        return {
            streetAddress: addressString.streetAddress || '',
            addressLocality: addressString.addressLocality || '',
            addressRegion: addressString.addressRegion || '',
            postalCode: addressString.postalCode || '',
            addressCountry: addressString.addressCountry || 'US'
        };
    }
    
    // Parse string address format: "123 Main St, City, State ZIP"
    const parts = addressString.split(',').map(p => p.trim());
    
    if (parts.length >= 3) {
        // Extract state and zip from the last part
        const stateZipMatch = parts[parts.length - 1].match(/([A-Z]{2})\s*(\d{5})?/);
        
        return {
            streetAddress: parts[0] || '',
            addressLocality: parts[1] || '',
            addressRegion: stateZipMatch ? stateZipMatch[1] : parts[2] || '',
            postalCode: stateZipMatch && stateZipMatch[2] ? stateZipMatch[2] : '',
            addressCountry: 'US'
        };
    }
    
    // Fallback for incomplete addresses
    return {
        streetAddress: parts[0] || '',
        addressLocality: parts[1] || '',
        addressRegion: parts[2] || '',
        postalCode: '',
        addressCountry: 'US'
    };
}

Handlebars.registerHelper('encodeURIComponent', (str) => {
    return encodeURIComponent(str || '');
});

Handlebars.registerHelper('toISO8601DateTime', (date, timeStr) => {
    if (!date || !timeStr) return '';
    
    const timeZone = 'America/Los_Angeles';
    
    // Parse the date and time together
    // date is like "2025-09-28", timeStr is like "6:00 PM"
    const dateTime = parse(`${date} ${timeStr}`, 'yyyy-MM-dd h:mm a', new Date());
    
    // fromZonedTime converts a date in a specific timezone to UTC
    const utcDate = fromZonedTime(dateTime, timeZone);
    
    // Format as ISO 8601 which includes timezone offset
    return formatISO(utcDate);
});

async function loadPartials() {
    const partialsDir = path.join(__dirname, '..', 'template', 'partials');
    
    // Recursively load all .hbs files in partials directory
    async function loadPartialsFromDir(dir, prefix = '') {
        const items = await fs.readdir(dir, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            
            if (item.isDirectory()) {
                await loadPartialsFromDir(fullPath, prefix + item.name + '/');
            } else if (item.name.endsWith('.hbs')) {
                const partialName = prefix + item.name.replace('.hbs', '');
                const content = await fs.readFile(fullPath, 'utf8');
                Handlebars.registerPartial(partialName, content);
                console.log(`  📦 Loaded partial: ${partialName}`);
            }
        }
    }
    
    await loadPartialsFromDir(partialsDir);
}

async function loadData() {
    console.log('📊 Loading data files...\n');
    
    const dataFiles = {
        members: 'members.json',
        shows: 'shows.json',
        tracks: 'tracks.json',
        videos: 'videos.json'
    };
    
    const data = {};
    
    for (const [key, filename] of Object.entries(dataFiles)) {
        try {
            const filePath = path.join(__dirname, '..', 'template', 'data', filename);
            const content = await fs.readFile(filePath, 'utf8');
            data[key] = JSON.parse(content);
            console.log(`  ✅ Loaded ${filename}`);
        } catch (error) {
            console.log(`  ⚠️  Could not load ${filename}: ${error.message}`);
        }
    }
    
    // Check for YouTube API key and fetch metadata
    if (data.videos) {
        try {
            const { fetchAllVideoMetadata, getApiKey } = require('./fetch-youtube-metadata');
            const apiKey = getApiKey();
            
            if (!apiKey) {
                console.error('\n❌ ERROR: YOUTUBE_API_KEY is required but not found!');
                console.error('\n📝 To fix this:');
                console.error('   1. Copy .env.example to .env if you haven\'t already');
                console.error('   2. Add your YouTube Data API v3 key to the .env file:');
                console.error('      YOUTUBE_API_KEY=your_api_key_here');
                console.error('\n   Get an API key at: https://console.cloud.google.com/apis/credentials');
                console.error('   Enable YouTube Data API v3 at: https://console.cloud.google.com/apis/library');
                console.error('\n   For CI/CD, add YOUTUBE_API_KEY to your GitHub Secrets or environment variables.\n');
                process.exit(1);
            }
            
            console.log('\n📹 Fetching YouTube metadata...');
            // Pass the videos array directly - it now supports both strings and objects with overrides
            const videos = data.videos.videos || data.videos;
            const metadata = await fetchAllVideoMetadata(videos, apiKey);
            
            // Replace videos data with fetched metadata
            data.videos = { videos: metadata };
        } catch (error) {
            console.error(`\n❌ Error loading YouTube metadata: ${error.message}`);
            process.exit(1);
        }
    }
    
    // Load images manifest
    try {
        const manifestPath = path.join(__dirname, '..', 'public', 'images', 'manifest.json');
        const manifestContent = await fs.readFile(manifestPath, 'utf8');
        data.images = JSON.parse(manifestContent);
        console.log('  ✅ Loaded images manifest');
    } catch (error) {
        console.log('  ⚠️  No images manifest found');
        data.images = { thumbnail: [], large: [] };
    }
    
    return data;
}

function prepareTemplateData(data) {
    console.log('\n🔧 Preparing template data...');
    
    // Site configuration
    const site = {
        title: 'Sinister Dexter',
        tagline: 'The Right to Be Funky',
        description: 'San Francisco Soul & Funk Band',
        metaDescription: 'Sinister Dexter is an 11-piece soul machine bringing the unique sound of great funk horn bands to the San Francisco Bay Area. Featuring vocalist Rebecca Lipon.',
        shortDescription: '11-piece soul machine bringing high-energy funk to the Bay Area',
        heroDescription: '11-piece soul machine bringing the unique sound of great funk horn bands to the San Francisco Bay Area',
        url: 'https://sinisterdexter.net',
        bookingEmail: 'booking@sinisterdexter.net',
        keywords: ['Sinister Dexter', 'funk band', 'soul music', 'San Francisco', 'Bay Area', 'Rebecca Lipon', 'live music', 'horn section'],
        social: {
            instagram: 'sindex_band',
            twitter: 'sindexband',
            facebook: 'SinDex.Band',
            youtube: 'SinDexBand',
            tiktok: 'sindex_band',
            bandsintown: '444053',
            songkick: '463129',
            spotifyId: '06ZpJFLW4Kz4EAlUorzrFu',
            appleMusicId: '30663361'
        }
    };
    
    // Band information
    const band = {
        foundingYear: '1998',
        genres: ['Funk', 'Soul', 'R&B', 'Blues']
    };
    
    // Navigation structure
    const navigation = {
        main: [
            { label: 'Shows', anchor: 'shows' },
            { label: 'Music', anchor: 'music-library' },
            { label: 'Videos', anchor: 'videos' },
            { label: 'Gallery', anchor: 'gallery' },
            { label: 'About', anchor: 'about' },
            { label: 'Band', anchor: 'band-members' },
            { label: 'Connect', anchor: 'connect' }
        ]
    };
    
    // Hero section
    const hero = {
        image: 'sindex-full',
        cta: [
            {
                text: 'SEE UPCOMING SHOWS',
                href: '#shows',
                classes: 'bg-purple-600 hover:bg-purple-700'
            },
            {
                text: 'JOIN MAILING LIST',
                href: '#connect',
                classes: 'border-2 border-amber-500 hover:bg-amber-500 hover:text-black'
            }
        ]
    };
    
    /**
     * Gets the day of the week for a date string in a specific timezone.
     * @param {string} dateStr - The date in 'YYYY-MM-DD' format.
     * @param {string} timeZone - An IANA timezone name (e.g., 'America/Los_Angeles').
     * @returns {string} The three-letter abbreviation of the day (e.g., 'SUN').
     */
    function getDayOfWeek(dateStr) {
        // Parse as UTC to avoid timezone issues
        const date = new Date(dateStr);
        const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
        return days[date.getUTCDay()];
    }
    
    // Process shows data
    const now = new Date();
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    let upcomingShows = [];
    let pastShows = [];
    
    if (data.shows) {
        // Process upcoming shows
        if (data.shows.upcomingShows) {
            data.shows.upcomingShows.forEach(show => {
                // Parse date at end of day to ensure shows on current date are still considered upcoming
                const showDate = new Date(show.date + 'T23:59:59');
                // Parse the address string into components
                const parsedAddress = parseAddress(show.address);
                
                // Convert simple show format to enhanced format for template
                const enhancedShow = {
                    ...show,
                    id: show.date + '-' + (show.venue || '').toLowerCase().replace(/\s+/g, '-'),
                    name: show.name || show.venue, // Use name if provided, otherwise fallback to venue
                    dayOfWeek: show.dayOfWeek || getDayOfWeek(show.date), // Calculate if not provided
                    startTime: show.time ? show.time.split(' - ')[0] : '',
                    endTime: show.time ? show.time.split(' - ')[1] : '',
                    venue: {
                        name: show.venue,
                        address: {
                            streetAddress: parsedAddress.streetAddress,
                            addressLocality: parsedAddress.addressLocality,
                            addressRegion: parsedAddress.addressRegion,
                            postalCode: parsedAddress.postalCode,
                            addressCountry: parsedAddress.addressCountry,
                            city: parsedAddress.addressLocality, // For backwards compatibility
                            state: parsedAddress.addressRegion   // For backwards compatibility
                        }
                    },
                    ticketing: {
                        link: show.link,
                        ticketUrl: show.tickets,
                        admission: show.admission || (show.description && show.description.includes('Free') ? 'Free' : ''),
                        price: show.price || (show.admission && !show.admission.toLowerCase().includes('free') ? 
                                (show.admission.match(/\$(\d+)/) ? show.admission.match(/\$(\d+)/)[1] : null) : null),
                        ageRestriction: show.ageRestriction || show.note
                    },
                    isFree: !show.price && (!show.admission || show.admission.toLowerCase().includes('free') || 
                            (show.description && show.description.toLowerCase().includes('free'))),
                    specialNotes: show.specialNotes
                };
                
                if (showDate >= twoDaysAgo) {
                    upcomingShows.push(enhancedShow);
                } else {
                    pastShows.push(enhancedShow);
                }
            });
        }
        
        // Process past shows - keep all of them!
        if (data.shows.pastShows) {
            data.shows.pastShows.forEach(show => {
                const enhancedShow = {
                    ...show,
                    id: show.date + '-' + (show.venue || '').toLowerCase().replace(/\s+/g, '-'),
                    venue: {
                        name: show.venue,
                        link: show.link,
                        address: {
                            city: show.city
                        }
                    },
                    time: show.time,
                    performanceNotes: show.performanceNotes
                };
                pastShows.push(enhancedShow);
            });
        }
        
        // Sort shows
        upcomingShows.sort((a, b) => a.date.localeCompare(b.date));
        pastShows.sort((a, b) => b.date.localeCompare(a.date));
    }
    
    // Process members data
    let members = [];
    if (data.members) {
        members = data.members.members || data.members;
    }
    
    // Process videos data - already has full metadata from YouTube API
    let videos = [];
    if (data.videos) {
        videos = data.videos.videos || data.videos;
        // No need to compute URLs - they're already fetched from YouTube API
    }
    
    // Process tracks data - add full src URLs and index numbers
    let tracks = [];
    if (data.tracks) {
        const cdnBaseUrl = data.tracks.cdnBaseUrl || 'https://cdn.sinister-dexter.com/music/';
        tracks = (data.tracks.tracks || data.tracks).map((track, index) => ({
            ...track,
            num: index + 1,  // Add 1-based index number
            src: track.src || `${cdnBaseUrl}${track.filename}`
        }));
    }
    
    console.log(`  📅 ${upcomingShows.length} upcoming shows`);
    console.log(`  📜 ${pastShows.length} past shows`);
    console.log(`  👥 ${members.length} band members`);
    console.log(`  🎬 ${videos.length} videos`);
    console.log(`  🎵 ${tracks.length} tracks`);
    console.log(`  🖼️  ${data.images.thumbnail ? data.images.thumbnail.length : 0} gallery images`);
    
    // Filter out private events for structured data (SEO)
    const publicShows = upcomingShows.filter(show => !show.private);

    return {
        site,
        band,
        navigation,
        hero,
        members,
        upcomingShows,
        publicShows,
        pastShows,
        videos,
        images: data.images,
        tracks,
        bandMembersCount: members.length,
        currentYear: new Date().getFullYear()
    };
}

async function buildModularSite() {
    console.log('🏗️  Building modular static site...\n');
    
    try {
        // Load all partials
        console.log('📦 Loading template partials...\n');
        await loadPartials();
        
        // Load data
        const data = await loadData();
        
        // Prepare template data
        const templateData = prepareTemplateData(data);
        
        // Create main template
        console.log('\n🎨 Compiling main template...');
        
        const mainTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-NJQVBL6T');</script>
    <!-- End Google Tag Manager -->
    
    {{> head/meta}}
    {{> head/styles}}
    {{> head/structured-data}}
</head>

<body class="bg-black text-white font-sans">
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-NJQVBL6T"
    height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->
    
    <!-- Skip Navigation -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-lg z-[60]">
        Skip to main content
    </a>
    
    {{> components/navigation}}
    
    <main id="main-content" role="main">
        
        {{> sections/hero}}
        {{> sections/shows}}
        {{> sections/music}}
        {{> sections/videos}}
        {{> sections/gallery}}
        {{> sections/about}}
        {{> sections/pull-quote}}
        {{> sections/members}}
        {{> sections/connect}}
    </main>
    
    {{> components/footer}}
    {{> components/music-player}}
    
    <!-- JavaScript -->
    {{> components/scripts}}
</body>
</html>`;
        
        // Compile template
        const template = Handlebars.compile(mainTemplate);
        const html = template(templateData);
        
        // Minify HTML - aggressive settings for single-line output
        console.log('\n🗜️  Minifying HTML...');
        const minifiedHtml = await minify(html, {
            collapseWhitespace: true,
            conservativeCollapse: true, // Preserve at least one space between elements
            removeComments: true,
            removeRedundantAttributes: true,
            removeScriptTypeAttributes: true,
            removeStyleLinkTypeAttributes: true,
            useShortDoctype: true,
            minifyCSS: true,
            minifyJS: true,
            keepClosingSlash: false,
            removeAttributeQuotes: false, // Keep quotes to avoid breaking selectors
            preserveLineBreaks: false,
            sortAttributes: true,
            sortClassName: true,
            removeEmptyAttributes: true,
            processConditionalComments: true,
            collapseInlineTagWhitespace: false, // Don't collapse whitespace around inline elements like <a>
            collapseBooleanAttributes: true,
            removeOptionalTags: false,
            html5: true,
            decodeEntities: true,
            continueOnParseError: true
        });
        
        // Write output file
        const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
        
        await fs.writeFile(htmlPath, minifiedHtml);
        
        // Calculate size reduction
        const originalSize = Buffer.byteLength(html, 'utf8');
        const minifiedSize = Buffer.byteLength(minifiedHtml, 'utf8');
        const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        console.log('\n✅ Site generated successfully!');
        console.log(`📄 Output: ${htmlPath}`);
        console.log(`📉 HTML minified: ${(originalSize / 1024).toFixed(1)}KB → ${(minifiedSize / 1024).toFixed(1)}KB (-${reduction}%)`);
        
    } catch (error) {
        console.error('❌ Error building modular site:', error);
        process.exit(1);
    }
}

// Run the build
buildModularSite();
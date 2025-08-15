#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');
const { minify } = require('html-minifier-terser');

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

Handlebars.registerHelper('formatDate', (dateStr, format) => {
    const date = new Date(dateStr);
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthsFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    switch(format) {
        case 'MMM DD':
            return `${months[date.getMonth()]} ${date.getDate()}`;
        case 'MMM DD, YYYY':
            return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        case 'Month DD, YYYY':
            return `${monthsFull[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
        default:
            return dateStr;
    }
});

Handlebars.registerHelper('formatTime', (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
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
    if (!admission) return '0';
    if (admission.toLowerCase() === 'free') return '0';
    const match = admission.match(/\$(\d+)/);
    return match ? match[1] : '0';
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
            spotifyId: '06ZpJFLW4Kz4EAlUorzrFu',
            appleMusicId: '30663361'
        }
    };
    
    // Band information
    const band = {
        foundingYear: '1998',
        genres: ['Funk', 'Soul', 'R&B', 'Blues'],
        notableVenues: ['Club Fox', 'Lost & Found Saloon', 'Quarter Note', 'Blue Chalk Cafe']
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
            { label: 'Venues', anchor: 'notable-venues' },
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
                const showDate = new Date(show.date);
                // Convert simple show format to enhanced format for template
                const enhancedShow = {
                    ...show,
                    id: show.date + '-' + (show.venue || '').toLowerCase().replace(/\s+/g, '-'),
                    startTime: show.time ? show.time.split(' - ')[0] : '',
                    endTime: show.time ? show.time.split(' - ')[1] : '',
                    venue: {
                        name: show.venue,
                        address: {
                            city: show.city,
                            state: show.city ? show.city.split(', ')[1] : ''
                        }
                    },
                    ticketing: {
                        link: show.link,
                        ticketUrl: show.tickets,
                        admission: show.admission || (show.description && show.description.includes('Free') ? 'Free' : ''),
                        ageRestriction: show.ageRestriction || show.note
                    },
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
    
    // Process videos data - add computed YouTube URLs
    let videos = [];
    if (data.videos) {
        videos = (data.videos.videos || data.videos).map(video => ({
            ...video,
            thumbnail: `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`,
            url: `https://www.youtube.com/watch?v=${video.id}`,
            embedUrl: `https://www.youtube.com/embed/${video.id}`
        }));
    }
    
    // Process tracks data - add full src URLs
    let tracks = [];
    if (data.tracks) {
        const cdnBaseUrl = data.tracks.cdnBaseUrl || 'https://cdn.sinister-dexter.com/music/';
        tracks = (data.tracks.tracks || data.tracks).map(track => ({
            ...track,
            src: track.src || `${cdnBaseUrl}${track.filename}`
        }));
    }
    
    console.log(`  📅 ${upcomingShows.length} upcoming shows`);
    console.log(`  📜 ${pastShows.length} past shows`);
    console.log(`  👥 ${members.length} band members`);
    console.log(`  🎬 ${videos.length} videos`);
    console.log(`  🎵 ${tracks.length} tracks`);
    console.log(`  🖼️  ${data.images.thumbnail ? data.images.thumbnail.length : 0} gallery images`);
    
    return {
        site,
        band,
        navigation,
        hero,
        members,
        upcomingShows,
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
    
    <main id="main-content" role="main" itemscope itemtype="https://schema.org/MusicGroup">
        <meta itemprop="url" content="{{site.url}}">
        
        {{> sections/hero}}
        {{> sections/shows}}
        {{> sections/music}}
        {{> sections/videos}}
        {{> sections/gallery}}
        {{> sections/about}}
        {{> sections/pull-quote}}
        {{> sections/members}}
        {{> sections/venues}}
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
        
        // Write output files
        const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
        const phpPath = path.join(__dirname, '..', 'public', 'index.php');
        
        await Promise.all([
            fs.writeFile(htmlPath, minifiedHtml),
            fs.writeFile(phpPath, minifiedHtml)
        ]);
        
        // Calculate size reduction
        const originalSize = Buffer.byteLength(html, 'utf8');
        const minifiedSize = Buffer.byteLength(minifiedHtml, 'utf8');
        const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        console.log('\n✅ Modular site generated successfully!');
        console.log(`📄 Output: ${htmlPath}`);
        console.log(`📄 Output: ${phpPath}`);
        console.log(`📉 HTML minified: ${(originalSize / 1024).toFixed(1)}KB → ${(minifiedSize / 1024).toFixed(1)}KB (-${reduction}%)`);
        
    } catch (error) {
        console.error('❌ Error building modular site:', error);
        process.exit(1);
    }
}

// Run the build
buildModularSite();
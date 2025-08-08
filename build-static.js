#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { minify } = require('html-minifier-terser');

async function buildStaticSite() {
  console.log('🏗️  Building static site...\n');
  
  try {
    // Read the template HTML (from template/index.html, NOT the output file!)
    const templatePath = path.join(__dirname, 'template', 'index.html');
    let html = await fs.readFile(templatePath, 'utf8');
    
    // Read all data files
    const showsData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'public', 'data', 'shows.json'), 'utf8')
    );
    
    const membersData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'public', 'data', 'members.json'), 'utf8')
    );
    
    const tracksData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'public', 'data', 'tracks.json'), 'utf8')
    );
    
    // Read images manifest
    let imagesManifest = { thumbnail: [], large: [] };
    try {
      imagesManifest = JSON.parse(
        await fs.readFile(path.join(__dirname, 'public', 'images', 'manifest.json'), 'utf8')
      );
    } catch (error) {
      console.log('⚠️  No images manifest found, gallery will be empty');
    }
    
    // Automatically categorize shows based on current date
    // Shows remain in "upcoming" for 2 days after the event date
    // This gives a grace period for recent shows
    const now = new Date();
    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    // Combine all shows and sort by date
    const allShows = [
      ...(showsData.upcomingShows || []).map(show => ({...show, wasUpcoming: true})),
      ...(showsData.pastShows || []).map(show => ({...show, wasUpcoming: false}))
    ];
    
    // Separate into upcoming and past based on date
    const categorizedShows = allShows.reduce((acc, show) => {
      const [year, monthNum, dayNum] = show.date.split('-').map(Number);
      const showDate = new Date(year, monthNum - 1, dayNum, 23, 59, 59); // End of show day
      
      if (showDate >= twoDaysAgo) {
        acc.upcoming.push(show);
      } else {
        acc.past.push(show);
      }
      return acc;
    }, { upcoming: [], past: [] });
    
    // Sort upcoming shows by date (ascending)
    categorizedShows.upcoming.sort((a, b) => a.date.localeCompare(b.date));
    
    // Sort past shows by date (descending - most recent first)
    categorizedShows.past.sort((a, b) => b.date.localeCompare(a.date));
    
    // Generate upcoming shows HTML
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    let upcomingShowsHtml = '';
    
    if (categorizedShows.upcoming.length > 0) {
      categorizedShows.upcoming.forEach(show => {
        // Parse date in Pacific Time (noon to avoid DST issues)
        const [year, monthNum, dayNum] = show.date.split('-').map(Number);
        const showDate = new Date(year, monthNum - 1, dayNum, 12, 0, 0);
        const month = monthNames[showDate.getMonth()];
        const day = showDate.getDate();
        
        upcomingShowsHtml += `
          <div class="bg-gray-900/50 rounded-lg p-6 border border-purple-500/30${show.featured ? ' ring-2 ring-purple-500' : ''}">
            ${show.featured ? '<div class="text-xs text-purple-400 font-bold mb-2">FEATURED</div>' : ''}
            <div class="text-amber-500 font-bold mb-2">${show.dayOfWeek || ''}, ${month} ${day}</div>
            <h3 class="text-xl font-bold mb-2">${show.venue}</h3>
            <p class="text-gray-400 mb-2">${show.city || ''}</p>
            <p class="text-gray-300 mb-4">${show.time}</p>
            ${show.description ? `<p class="text-sm text-gray-400 mb-4">${show.description}</p>` : ''}
            ${show.link ? 
              `<a href="${show.link}" target="_blank" class="text-purple-400 hover:text-purple-300">Learn More →</a>` : 
              ''
            }
          </div>`;
      });
    } else {
      upcomingShowsHtml = '<div class="col-span-full text-center text-gray-400">No upcoming shows at this time. Check back soon!</div>';
    }
    
    // Generate past shows HTML - show only 3 initially
    let pastShowsHtml = '';
    
    if (categorizedShows.past.length > 0) {
      const visibleShows = categorizedShows.past.slice(0, 3);
      const hiddenShows = categorizedShows.past.slice(3);
      
      pastShowsHtml = '<div class="space-y-3">';
      
      // Visible shows
      visibleShows.forEach(show => {
        // Parse date in Pacific Time
        const [year, monthNum, dayNum] = show.date.split('-').map(Number);
        const showDate = new Date(year, monthNum - 1, dayNum, 12, 0, 0);
        const month = monthNames[showDate.getMonth()];
        const day = showDate.getDate();
        
        pastShowsHtml += `
          <div class="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-800 last:border-0">
            <div class="flex-1">
              <span class="text-amber-500 text-sm font-semibold">${month} ${day}, ${year}</span>
              <span class="text-gray-400 mx-2">•</span>
              ${show.link ? 
                `<a href="${show.link}" target="_blank" class="text-gray-300 hover:text-purple-400 transition-colors">
                  ${show.venue} <i class="fas fa-external-link-alt text-xs ml-1"></i>
                </a>` : 
                `<span class="text-gray-300">${show.venue}</span>`
              }
              <span class="text-gray-500 text-sm ml-2">${show.city}</span>
              ${show.note ? `<span class="text-purple-400 text-sm ml-2">(${show.note})</span>` : ''}
            </div>
            <div class="text-gray-500 text-sm mt-1 sm:mt-0">${show.time}</div>
          </div>`;
      });
      
      // Hidden shows (if any)
      if (hiddenShows.length > 0) {
        pastShowsHtml += `
          <div id="hidden-past-shows" class="hidden space-y-3">`;
        
        hiddenShows.forEach(show => {
          // Parse date in Pacific Time
          const [year, monthNum, dayNum] = show.date.split('-').map(Number);
          const showDate = new Date(year, monthNum - 1, dayNum, 12, 0, 0);
          const month = monthNames[showDate.getMonth()];
          const day = showDate.getDate();
          
          pastShowsHtml += `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-800 last:border-0">
              <div class="flex-1">
                <span class="text-amber-500 text-sm font-semibold">${month} ${day}, ${year}</span>
                <span class="text-gray-400 mx-2">•</span>
                ${show.link ? 
                  `<a href="${show.link}" target="_blank" class="text-gray-300 hover:text-purple-400 transition-colors">
                    ${show.venue} <i class="fas fa-external-link-alt text-xs ml-1"></i>
                  </a>` : 
                  `<span class="text-gray-300">${show.venue}</span>`
                }
                <span class="text-gray-500 text-sm ml-2">${show.city}</span>
                ${show.note ? `<span class="text-purple-400 text-sm ml-2">(${show.note})</span>` : ''}
              </div>
              <div class="text-gray-500 text-sm mt-1 sm:mt-0">${show.time}</div>
            </div>`;
        });
        
        pastShowsHtml += '</div>';
        
        // Add expand/collapse button
        pastShowsHtml += `
          <button id="toggle-past-shows" 
                  onclick="togglePastShows()" 
                  class="mt-2 text-gray-600 hover:text-gray-500 transition-colors text-xs opacity-70 hover:opacity-100">
            <span id="toggle-text" class="text-[10px] uppercase tracking-wider">${hiddenShows.length} more</span>
            <svg id="toggle-icon" class="inline-block w-2.5 h-2.5 ml-0.5 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
          <script>
            function togglePastShows() {
              const hiddenShows = document.getElementById('hidden-past-shows');
              const toggleText = document.getElementById('toggle-text');
              const toggleIcon = document.getElementById('toggle-icon');
              
              if (hiddenShows.classList.contains('hidden')) {
                hiddenShows.classList.remove('hidden');
                toggleText.textContent = 'less';
                toggleIcon.style.transform = 'rotate(180deg)';
              } else {
                hiddenShows.classList.add('hidden');
                toggleText.textContent = '${hiddenShows.length} more';
                toggleIcon.style.transform = 'rotate(0deg)';
              }
            }
          </script>`;
      }
      
      pastShowsHtml += '</div>';
    } else {
      pastShowsHtml = '<p class="text-gray-400 text-center">No past shows listed</p>';
    }
    
    // Generate gallery HTML with relative paths
    let galleryHtml = '';
    const thumbnails = imagesManifest.thumbnail || [];
    
    if (thumbnails.length > 0) {
      thumbnails.forEach((img, index) => {
        // Use relative paths for local viewing
        const thumbPath = img.jpg.replace('/images/', 'images/');
        const thumbWebp = img.webp.replace('/images/', 'images/');
        
        galleryHtml += `
          <div class="gallery-item aspect-square bg-gray-800 rounded-lg overflow-hidden cursor-pointer" 
               onclick="openLightbox(${index})" 
               role="button" 
               tabindex="0" 
               aria-label="View larger image ${index + 1} of ${thumbnails.length}"
               onkeypress="if(event.key==='Enter' || event.key===' ') openLightbox(${index})">
            <picture>
              <source srcset="${thumbWebp}" type="image/webp">
              <img src="${thumbPath}" 
                   alt="Sinister Dexter performing live - Image ${index + 1} of ${thumbnails.length}" 
                   class="w-full h-full object-cover transition-transform hover:scale-110"
                   loading="lazy">
            </picture>
          </div>`;
      });
    } else {
      galleryHtml = `
        <div class="col-span-full text-center py-8">
          <p class="text-gray-400">Gallery photos coming soon!</p>
        </div>`;
    }
    
    // Generate gallery images array for lightbox with relative paths
    const galleryImagesForScript = (imagesManifest.large || imagesManifest.thumbnail || []).map(img => ({
      jpg: img.jpg.replace('/images/', 'images/'),
      webp: img.webp.replace('/images/', 'images/'),
      name: img.name
    }));
    
    const galleryImagesScript = `
      const galleryImages = ${JSON.stringify(galleryImagesForScript)};
      let currentImageIndex = 0;
    `;
    
    // Replace placeholders in HTML
    html = html.replace(
      '<!-- Shows will be dynamically loaded here -->',
      upcomingShowsHtml
    );
    
    html = html.replace(
      '<div id="shows-loading" class="text-center py-8">\n                <p class="text-gray-400">Loading shows...</p>\n            </div>',
      ''
    );
    
    html = html.replace(
      '<!-- Past shows will be dynamically loaded here -->',
      pastShowsHtml
    );
    
    html = html.replace(
      '<!-- Images will be dynamically loaded here -->',
      galleryHtml
    );
    
    html = html.replace(
      '<div id="gallery-loading" class="text-center py-8">\n                <p class="text-gray-400">Loading gallery...</p>\n            </div>',
      ''
    );
    
    // Fix the video embed URLs and titles
    html = html.replace(
      'https://www.youtube.com/embed/G_AchkgGsaI',
      'https://www.youtube.com/embed/D9gIdE7IJsY'
    );
    
    html = html.replace(
      'title="Son of a Preacher Man - Sinister Dexter"',
      'title="Son of a Preacher Man - Sinister Dexter"'
    );
    
    html = html.replace(
      '<p class="text-sm text-gray-400">Live at Club Fox, 2012</p>',
      '<p class="text-sm text-gray-400">Redwood City Music In The Park, 2012</p>'
    );
    
    // Fix duplicate allowfullscreen attributes
    html = html.replace(/allow="([^"]+)" allowfullscreen/g, 'allow="$1; fullscreen" allowfullscreen');
    
    // Fix favicon and manifest paths to be relative
    html = html.replace(/href="\/favicon/g, 'href="favicon');
    html = html.replace(/href="\/apple/g, 'href="apple');
    html = html.replace(/href="\/manifest/g, 'href="manifest');
    
    // Fix image paths to be relative
    html = html.replace(/srcset="\/images\//g, 'srcset="images/');
    html = html.replace(/src="\/images\//g, 'src="images/');
    
    // Remove leftover loadGallery and loadShows calls
    html = html.replace(/\s*loadGallery\(\);/g, '');
    html = html.replace(/\s*loadShows\(\);/g, '');
    
    // Update the gallery images array in the existing script
    const scriptRegex = /const galleryImages = \[.*?\];/s;
    const newGalleryArray = `const galleryImages = ${JSON.stringify(galleryImagesForScript)};`;
    html = html.replace(scriptRegex, newGalleryArray);
    
    // Generate band members HTML
    let membersHtml = '';
    membersData.sections.forEach(section => {
      membersHtml += `
        <div class="mb-12">
          <h3 class="text-2xl font-bold text-purple-400 mb-6 text-center">${section.title}</h3>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${section.members.length <= 3 ? section.members.length : 4} gap-8 justify-items-center">
            ${section.members.map(member => `
              <div class="text-center">
                <div class="mb-3 relative inline-block">
                  <picture>
                    <source srcset="images/members/${member.image}.webp" type="image/webp">
                    <img src="images/members/${member.image}.jpg" 
                         alt="${member.name}" 
                         class="w-32 h-32 rounded-full mx-auto object-cover border-2 border-purple-500">
                  </picture>
                  ${member.founding ? `
                  <div class="absolute top-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white shadow-md cursor-help" title="Founding Member">
                    <span>F</span>
                  </div>` : ''}
                </div>
                <h4 class="font-bold text-lg">${member.name}</h4>
                <p class="text-purple-400">${member.role}</p>
                ${member.bio ? `<p class="text-sm text-gray-400 mt-2 max-w-xs mx-auto">${member.bio}</p>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });
    
    // Replace band members section - find the band members grid
    const bandMembersRegex = /<!-- Band Members Grid -->.*?<\/div>\s*<\/div>\s*<\/div>/s;
    const bandMembersReplacement = `<!-- Band Members Grid -->\n${membersHtml}`;
    html = html.replace(bandMembersRegex, bandMembersReplacement);
    
    // Generate tracks JavaScript array
    const tracksArray = tracksData.tracks.map(track => ({
      num: track.num,
      title: track.title,
      artist: track.artist,
      duration: track.duration,
      src: `${tracksData.cdnBaseUrl}${track.filename}`
    }));
    
    // Replace tracks array in the JavaScript
    const tracksRegex = /const musicTracks = \[.*?\];/s;
    const newTracksArray = `const musicTracks = ${JSON.stringify(tracksArray, null, 16)};`;
    html = html.replace(tracksRegex, newTracksArray);
    
    // Add comment about Tailwind CDN (only if not already present)
    if (!html.includes('<!-- Note: Tailwind CDN')) {
      html = html.replace(
        '<script src="https://cdn.tailwindcss.com"></script>',
        '<!-- Note: Tailwind CDN is used for development. For production, use PostCSS or Tailwind CLI -->\n    <script src="https://cdn.tailwindcss.com"></script>'
      );
    }
    
    // Minify the HTML for production
    console.log('🗜️  Minifying HTML...');
    const minifiedHtml = await minify(html, {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      minifyCSS: true,
      minifyJS: true,
      // Keep important attributes
      keepClosingSlash: true,
      // Don't remove quotes from attributes (needed for some)
      removeAttributeQuotes: false,
      // Preserve line breaks in pre/textarea
      preserveLineBreaks: false,
      // Additional optimizations
      sortAttributes: true,
      sortClassName: true,
      removeEmptyAttributes: true,
      // Keep data attributes
      customAttrSurround: [],
      // Process conditional comments
      processConditionalComments: true
    });
    
    // Write the minified HTML file
    const outputPath = path.join(__dirname, 'public', 'index.html');
    await fs.writeFile(outputPath, minifiedHtml);
    
    // Calculate size reduction
    const originalSize = Buffer.byteLength(html, 'utf8');
    const minifiedSize = Buffer.byteLength(minifiedHtml, 'utf8');
    const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
    
    console.log('✅ Static HTML generated successfully!');
    console.log(`📄 Output: ${outputPath}`);
    console.log(`🎭 ${categorizedShows.upcoming.length} upcoming shows (auto-categorized)`);
    console.log(`📜 ${categorizedShows.past.length} past shows (auto-categorized)`);
    console.log(`🖼️  ${thumbnails.length} gallery images`);
    console.log(`👥 ${membersData.sections.reduce((acc, s) => acc + s.members.length, 0)} band members`);
    console.log(`🎵 ${tracksData.tracks.length} music tracks`);
    console.log(`📉 HTML minified: ${(originalSize / 1024).toFixed(1)}KB → ${(minifiedSize / 1024).toFixed(1)}KB (-${reduction}%)`);
    
  } catch (error) {
    console.error('❌ Error building static site:', error);
    process.exit(1);
  }
}

// Run the build
buildStaticSite();
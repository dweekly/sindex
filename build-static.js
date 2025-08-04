#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const { minify } = require('html-minifier-terser');

async function buildStaticSite() {
  console.log('🏗️  Building static site...\n');
  
  try {
    // Read the template HTML (from src/template.html, NOT the output file!)
    const templatePath = path.join(__dirname, 'src', 'template.html');
    let html = await fs.readFile(templatePath, 'utf8');
    
    // Read shows data
    const showsData = JSON.parse(
      await fs.readFile(path.join(__dirname, 'public', 'data', 'shows.json'), 'utf8')
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
    
    // Generate upcoming shows HTML
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    let upcomingShowsHtml = '';
    
    if (showsData.upcomingShows && showsData.upcomingShows.length > 0) {
      showsData.upcomingShows.forEach(show => {
        const showDate = new Date(show.date);
        const month = monthNames[showDate.getMonth()];
        const day = showDate.getDate();
        
        upcomingShowsHtml += `
          <div class="bg-gray-900/50 rounded-lg p-6 border border-purple-500/30${show.featured ? ' ring-2 ring-purple-500' : ''}">
            ${show.featured ? '<div class="text-xs text-purple-400 font-bold mb-2">FEATURED</div>' : ''}
            <div class="text-amber-500 font-bold mb-2">${show.dayOfWeek}, ${month} ${day}</div>
            <h3 class="text-xl font-bold mb-2">${show.venue}</h3>
            <p class="text-gray-400 mb-2">${show.city}</p>
            <p class="text-gray-300 mb-4">${show.time}</p>
            ${show.description ? `<p class="text-sm text-gray-400 mb-4">${show.description}</p>` : ''}
            ${show.ticketUrl !== '#' ? 
              `<a href="${show.ticketUrl}" target="_blank" class="text-purple-400 hover:text-purple-300">Get Tickets →</a>` : 
              '<span class="text-purple-400">Free Event!</span>'
            }
          </div>`;
      });
    } else {
      upcomingShowsHtml = '<div class="col-span-full text-center text-gray-400">No upcoming shows at this time. Check back soon!</div>';
    }
    
    // Generate past shows HTML
    let pastShowsHtml = '';
    
    if (showsData.pastShows && showsData.pastShows.length > 0) {
      pastShowsHtml = '<div class="space-y-3">';
      
      showsData.pastShows.forEach(show => {
        const showDate = new Date(show.date);
        const month = monthNames[showDate.getMonth()];
        const day = showDate.getDate();
        const year = showDate.getFullYear();
        
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
    console.log(`🎭 ${showsData.upcomingShows?.length || 0} upcoming shows`);
    console.log(`📜 ${showsData.pastShows?.length || 0} past shows`);
    console.log(`🖼️  ${thumbnails.length} gallery images`);
    console.log(`📉 HTML minified: ${(originalSize / 1024).toFixed(1)}KB → ${(minifiedSize / 1024).toFixed(1)}KB (-${reduction}%)`);
    
  } catch (error) {
    console.error('❌ Error building static site:', error);
    process.exit(1);
  }
}

// Run the build
buildStaticSite();
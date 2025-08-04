#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function buildStaticSite() {
  console.log('🏗️  Building static site...\n');
  
  try {
    // Read the template HTML
    const templatePath = path.join(__dirname, 'public', 'index.html');
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
               onclick="openLightbox(${index})">
            <picture>
              <source srcset="${thumbWebp}" type="image/webp">
              <img src="${thumbPath}" alt="Sinister Dexter band photo" 
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
    
    // Replace the script section to remove fetch calls and add static data
    const scriptStart = html.indexOf('// Gallery functionality');
    const scriptEnd = html.indexOf('// Keyboard controls for lightbox');
    
    if (scriptStart !== -1 && scriptEnd !== -1) {
      const beforeScript = html.substring(0, scriptStart);
      // Find the end of the keyboard controls section - look for the closing }); of the event listener
      const keyboardEnd = html.indexOf('});', scriptEnd);
      const afterScript = keyboardEnd !== -1 ? html.substring(keyboardEnd + 3) : '';
      
      const newScript = `// Gallery functionality
        ${galleryImagesScript}
        
        function openLightbox(index) {
            currentImageIndex = index;
            const lightbox = document.getElementById('lightbox');
            const img = document.getElementById('lightbox-image');
            const image = galleryImages[index];
            
            if (image) {
                img.src = image.jpg;
                lightbox.classList.remove('hidden');
                lightbox.classList.add('flex');
            }
        }
        
        function closeLightbox() {
            const lightbox = document.getElementById('lightbox');
            lightbox.classList.add('hidden');
            lightbox.classList.remove('flex');
        }
        
        function nextImage() {
            if (galleryImages.length === 0) return;
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            document.getElementById('lightbox-image').src = galleryImages[currentImageIndex].jpg;
        }
        
        function prevImage() {
            if (galleryImages.length === 0) return;
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            document.getElementById('lightbox-image').src = galleryImages[currentImageIndex].jpg;
        }
        
        // Lightbox controls
        if (document.getElementById('lightbox-close')) {
            document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
            document.getElementById('lightbox-next').addEventListener('click', nextImage);
            document.getElementById('lightbox-prev').addEventListener('click', prevImage);
            document.getElementById('lightbox').addEventListener('click', (e) => {
                if (e.target.id === 'lightbox') closeLightbox();
            });
        }
        
        // Keyboard controls for lightbox
        document.addEventListener('keydown', (e) => {
            const lightbox = document.getElementById('lightbox');
            if (lightbox && !lightbox.classList.contains('hidden')) {
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowRight') nextImage();
                if (e.key === 'ArrowLeft') prevImage();
            }
        });`;
      
      html = beforeScript + newScript + afterScript;
    }
    
    // Add comment about Tailwind CDN (only if not already present)
    if (!html.includes('<!-- Note: Tailwind CDN')) {
      html = html.replace(
        '<script src="https://cdn.tailwindcss.com"></script>',
        '<!-- Note: Tailwind CDN is used for development. For production, use PostCSS or Tailwind CLI -->\n    <script src="https://cdn.tailwindcss.com"></script>'
      );
    }
    
    // Write the static HTML file
    const outputPath = path.join(__dirname, 'public', 'index.html');
    await fs.writeFile(outputPath, html);
    
    console.log('✅ Static HTML generated successfully!');
    console.log(`📄 Output: ${outputPath}`);
    console.log(`🎭 ${showsData.upcomingShows?.length || 0} upcoming shows`);
    console.log(`📜 ${showsData.pastShows?.length || 0} past shows`);
    console.log(`🖼️  ${thumbnails.length} gallery images`);
    
  } catch (error) {
    console.error('❌ Error building static site:', error);
    process.exit(1);
  }
}

// Run the build
buildStaticSite();
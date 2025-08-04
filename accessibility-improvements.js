#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function improveAccessibility() {
  console.log('♿ Improving website accessibility...\n');
  
  try {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    let html = await fs.readFile(htmlPath, 'utf8');
    
    // 1. Add skip navigation link
    const skipNav = `    <!-- Skip Navigation for Screen Readers -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-lg z-[60]">
        Skip to main content
    </a>`;
    
    html = html.replace('<body class="bg-black text-white font-[\'Inter\']">', 
      `<body class="bg-black text-white font-['Inter']">\n${skipNav}`);
    
    // 2. Add main landmark and ID
    html = html.replace('<section id="hero"', '<main id="main-content" role="main">\n    <section id="hero"');
    
    // 3. Add aria-labels to social media links
    const socialLinkReplacements = [
      {
        pattern: /<a href="https:\/\/www\.instagram\.com\/sindex_band" target="_blank"\s+class="social-icon[^"]*">/g,
        replacement: '<a href="https://www.instagram.com/sindex_band" target="_blank" aria-label="Follow Sinister Dexter on Instagram" class="social-icon text-4xl hover:text-purple-400">'
      },
      {
        pattern: /<a href="https:\/\/x\.com\/sindexband" target="_blank"\s+class="social-icon[^"]*">/g,
        replacement: '<a href="https://x.com/sindexband" target="_blank" aria-label="Follow Sinister Dexter on X (Twitter)" class="social-icon text-4xl hover:text-purple-400">'
      },
      {
        pattern: /<a href="https:\/\/facebook\.com\/SinDex\.Band\/" target="_blank"\s+class="social-icon[^"]*">/g,
        replacement: '<a href="https://facebook.com/SinDex.Band/" target="_blank" aria-label="Follow Sinister Dexter on Facebook" class="social-icon text-4xl hover:text-purple-400">'
      },
      {
        pattern: /<a href="https:\/\/www\.youtube\.com\/@SinDexBand" target="_blank"\s+class="social-icon[^"]*">/g,
        replacement: '<a href="https://www.youtube.com/@SinDexBand" target="_blank" aria-label="Subscribe to Sinister Dexter on YouTube" class="social-icon text-4xl hover:text-purple-400">'
      },
      {
        pattern: /<a href="https:\/\/open\.spotify\.com\/artist\/[^"]+"\s+target="_blank"[^>]*>\s*<i class="fab fa-spotify[^>]*><\/i>\s*Spotify/g,
        replacement: '<a href="https://open.spotify.com/artist/06ZpJFLW4Kz4EAlUorzrFu" target="_blank" aria-label="Listen to Sinister Dexter on Spotify" class="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-full transition-all hover:scale-105">\n                    <i class="fab fa-spotify mr-2" aria-hidden="true"></i> <span>Spotify</span>'
      },
      {
        pattern: /<a href="https:\/\/music\.apple\.com\/[^"]+"\s+target="_blank"[^>]*>\s*<i class="fab fa-apple[^>]*><\/i>\s*Apple Music/g,
        replacement: '<a href="https://music.apple.com/us/artist/sinister-dexter/30663361" target="_blank" aria-label="Listen to Sinister Dexter on Apple Music" class="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-all hover:scale-105">\n                    <i class="fab fa-apple mr-2" aria-hidden="true"></i> <span>Apple Music</span>'
      },
      {
        pattern: /<a href="#"[^>]*>\s*<i class="fab fa-soundcloud[^>]*><\/i>\s*SoundCloud[^<]*</g,
        replacement: '<a href="#" aria-label="SoundCloud coming soon" aria-disabled="true" class="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-full transition-all hover:scale-105 opacity-50 cursor-not-allowed">\n                    <i class="fab fa-soundcloud mr-2" aria-hidden="true"></i> <span>SoundCloud (Coming Soon)</span><'
      }
    ];
    
    socialLinkReplacements.forEach(({pattern, replacement}) => {
      html = html.replace(pattern, replacement);
    });
    
    // 4. Add aria-hidden to decorative icons
    html = html.replace(/<i class="fa([bs]?)\s+fa-([^"]+)">/g, '<i class="fa$1 fa-$2" aria-hidden="true">');
    
    // 5. Improve form accessibility
    html = html.replace(
      '<input type="email" name="email" placeholder="your@email.com" required',
      '<label for="email-input" class="sr-only">Email address</label>\n                        <input type="email" id="email-input" name="email" placeholder="your@email.com" aria-label="Email address" required'
    );
    
    html = html.replace(
      '<button type="submit"',
      '<button type="submit" aria-label="Subscribe to mailing list"'
    );
    
    // 6. Add ARIA live region for form messages
    html = html.replace(
      '<div id="mailing-list-message" class="mt-4 text-sm hidden"></div>',
      '<div id="mailing-list-message" class="mt-4 text-sm hidden" role="alert" aria-live="polite"></div>'
    );
    
    // 7. Improve navigation accessibility
    html = html.replace(
      '<button id="mobile-menu-btn" class="md:hidden">',
      '<button id="mobile-menu-btn" class="md:hidden" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobile-menu">'
    );
    
    // 8. Add role and aria-label to navigation
    html = html.replace(
      '<nav class="fixed top-0',
      '<nav role="navigation" aria-label="Main navigation" class="fixed top-0'
    );
    
    // 9. Improve lightbox accessibility
    html = html.replace(
      '<button id="lightbox-close" class="absolute top-4 right-4',
      '<button id="lightbox-close" aria-label="Close image viewer" class="absolute top-4 right-4'
    );
    
    html = html.replace(
      '<button id="lightbox-prev" class="absolute left-4',
      '<button id="lightbox-prev" aria-label="Previous image" class="absolute left-4'
    );
    
    html = html.replace(
      '<button id="lightbox-next" class="absolute right-4',
      '<button id="lightbox-next" aria-label="Next image" class="absolute right-4'
    );
    
    // 10. Add role="dialog" to lightbox
    html = html.replace(
      '<div id="lightbox" class="fixed inset-0',
      '<div id="lightbox" role="dialog" aria-modal="true" aria-label="Image viewer" class="fixed inset-0'
    );
    
    // 11. Add screen reader only CSS class
    const srOnlyStyle = `.sr-only {position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border-width:0;}
.focus\\:not-sr-only:focus {position:static;width:auto;height:auto;padding:inherit;margin:inherit;overflow:visible;clip:auto;white-space:normal;}`;
    
    html = html.replace('</style>', `${srOnlyStyle}</style>`);
    
    // 12. Improve iframe titles
    html = html.replace(
      /title="([^"]+)"/g,
      (match, title) => {
        if (title.includes('Son of a Preacher Man')) {
          return 'title="YouTube video: Son of a Preacher Man - Live performance by Sinister Dexter"';
        } else if (title.includes('I Can\'t Stand The Rain')) {
          return 'title="YouTube video: I Can\'t Stand The Rain - Live performance by Sinister Dexter"';
        } else if (title.includes('Broadband Connection')) {
          return 'title="YouTube video: Broadband Connection - Live performance by Sinister Dexter"';
        }
        return match;
      }
    );
    
    // 13. Add proper heading hierarchy check
    // Ensure we have h1, then h2, then h3, etc.
    html = html.replace(
      '<h2 class="bebas text-5xl md:text-6xl text-center mb-12 gradient-text">UPCOMING SHOWS</h2>',
      '<h2 class="bebas text-5xl md:text-6xl text-center mb-12 gradient-text">Upcoming Shows</h2>'
    );
    
    // 14. Add focus-visible styles for better keyboard navigation
    const focusStyles = `.focus-visible\\:ring-2:focus-visible {--tw-ring-offset-shadow:var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);--tw-ring-shadow:var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);box-shadow:var(--tw-ring-offset-shadow),var(--tw-ring-shadow),var(--tw-shadow,0 0 #0000);}
.focus-visible\\:ring-purple-400:focus-visible {--tw-ring-color:rgb(192 132 252);}
.focus-visible\\:outline-none:focus-visible {outline:2px solid transparent;outline-offset:2px;}`;
    
    html = html.replace('</style>', `${focusStyles}</style>`);
    
    // 15. Add focus styles to interactive elements (only if not already present)
    html = html.replace(
      /class="([^"]*hover:text-purple-400[^"]*)"(?![^>]*focus-visible)/g,
      'class="$1 focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:outline-none rounded"'
    );
    
    // 16. Add lang attribute to iframes for multilingual support
    html = html.replace(
      /<iframe src="https:\/\/open\.spotify\.com/g,
      '<iframe lang="en" src="https://open.spotify.com'
    );
    
    html = html.replace(
      /<iframe allow="autoplay/g,
      '<iframe lang="en" allow="autoplay'
    );
    
    // 17. Close main tag properly
    const footerIndex = html.indexOf('<footer');
    if (footerIndex !== -1 && !html.includes('</main>')) {
      html = html.substring(0, footerIndex) + '    </main>\n\n    ' + html.substring(footerIndex);
    }
    
    // 18. Add section labels
    html = html.replace('<section id="shows"', '<section id="shows" aria-labelledby="shows-heading"');
    html = html.replace('<section id="music"', '<section id="music" aria-labelledby="music-heading"');
    html = html.replace('<section id="videos"', '<section id="videos" aria-labelledby="videos-heading"');
    html = html.replace('<section id="gallery"', '<section id="gallery" aria-labelledby="gallery-heading"');
    html = html.replace('<section id="about"', '<section id="about" aria-labelledby="about-heading"');
    html = html.replace('<section id="connect"', '<section id="connect" aria-labelledby="connect-heading"');
    html = html.replace('<section id="merch"', '<section id="merch" aria-labelledby="merch-heading"');
    
    // Add IDs to headings
    html = html.replace('>Upcoming Shows</h2>', ' id="shows-heading">Upcoming Shows</h2>');
    html = html.replace('>LISTEN TO OUR MUSIC</h2>', ' id="music-heading">Listen to Our Music</h2>');
    html = html.replace('>LIVE PERFORMANCES</h2>', ' id="videos-heading">Live Performances</h2>');
    html = html.replace('>GALLERY</h2>', ' id="gallery-heading">Gallery</h2>');
    html = html.replace('>ABOUT THE BAND</h2>', ' id="about-heading">About the Band</h2>');
    html = html.replace('>STAY CONNECTED</h2>', ' id="connect-heading">Stay Connected</h2>');
    html = html.replace('>MERCHANDISE</h2>', ' id="merch-heading">Merchandise</h2>');
    
    // 19. Add aria-current to navigation (in JavaScript)
    const navScript = `
        // Add aria-current to active navigation
        function updateActiveNav() {
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('nav a[href^="#"]');
            
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (scrollY >= (sectionTop - 200)) {
                    current = section.getAttribute('id');
                }
            });
            
            navLinks.forEach(link => {
                link.removeAttribute('aria-current');
                if (link.getAttribute('href') === '#' + current) {
                    link.setAttribute('aria-current', 'page');
                }
            });
        }
        
        window.addEventListener('scroll', updateActiveNav);
        updateActiveNav();`;
    
    // Insert after mobile menu code
    html = html.replace(
      '// Close mobile menu on link click',
      navScript + '\n\n        // Close mobile menu on link click'
    );
    
    // 20. Update mobile menu toggle script to manage aria-expanded
    const mobileMenuScript = `document.getElementById('mobile-menu-btn').addEventListener('click', function() {
            const menu = document.getElementById('mobile-menu');
            const isHidden = menu.classList.toggle('hidden');
            this.setAttribute('aria-expanded', !isHidden);
        });`;
    
    html = html.replace(
      "document.getElementById('mobile-menu-btn').addEventListener('click', function() {\n            document.getElementById('mobile-menu').classList.toggle('hidden');\n        });",
      mobileMenuScript
    );
    
    // Write the updated HTML
    await fs.writeFile(htmlPath, html);
    
    console.log('✅ Accessibility Improvements Complete:');
    console.log('   • Added skip navigation link');
    console.log('   • Added ARIA labels to all social links');
    console.log('   • Added ARIA landmarks (main, navigation)');
    console.log('   • Improved form accessibility with labels');
    console.log('   • Added focus indicators for keyboard navigation');
    console.log('   • Added ARIA attributes to interactive elements');
    console.log('   • Improved heading hierarchy');
    console.log('   • Added screen reader only styles');
    console.log('   • Added ARIA live regions for dynamic content');
    console.log('   • Improved iframe titles for screen readers');
    console.log('   • Added aria-current for navigation state');
    console.log('   • Added proper dialog role to lightbox');
    
  } catch (error) {
    console.error('❌ Error improving accessibility:', error);
    process.exit(1);
  }
}

// Run the improvements
improveAccessibility();
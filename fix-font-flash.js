#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function fixFontFlash() {
  console.log('🔤 Fixing font flash issue...\n');
  
  try {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    let html = await fs.readFile(htmlPath, 'utf8');
    
    // 1. Fix the Google Fonts link to use font-display:swap
    html = html.replace(
      'href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap"',
      'href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap"'
    );
    
    // 2. Add preload links for critical fonts (add right after meta tags)
    const preloadLinks = `    <!-- Preload critical fonts to prevent FOUT -->
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&display=swap" as="style">
    <link rel="preload" href="https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg69CK48gW7PXoo9Wlhyw.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2" as="font" type="font/woff2" crossorigin>`;
    
    // Insert preload links before the first stylesheet
    if (!html.includes('Preload critical fonts')) {
      html = html.replace(
        '    <!-- Note: Tailwind CDN',
        preloadLinks + '\n\n    <!-- Note: Tailwind CDN'
      );
    }
    
    // 3. Fix the CSS font-family declarations with better fallbacks
    // The problem: 'cursive' is a terrible fallback for Bebas Neue (which is condensed sans-serif)
    // Better fallbacks: Impact, Haettenschweiler, Arial Narrow, sans-serif
    html = html.replace(
      ".bebas {font-family:'Bebas Neue',cursive;}",
      ".bebas {font-family:'Bebas Neue',Impact,Haettenschweiler,'Franklin Gothic Bold','Arial Black','sans-serif';font-weight:400;letter-spacing:0.02em;}"
    );
    
    // Also check for any non-minified version
    html = html.replace(
      ".bebas { font-family: 'Bebas Neue', cursive; }",
      ".bebas { font-family: 'Bebas Neue', Impact, Haettenschweiler, 'Franklin Gothic Bold', 'Arial Black', 'sans-serif'; font-weight: 400; letter-spacing: 0.02em; }"
    );
    
    // 4. Add critical inline CSS to prevent layout shift
    const criticalCSS = `    <!-- Critical inline CSS to prevent FOUT -->
    <style>
        /* Temporary styles while fonts load */
        .bebas:not(.font-loaded) {
            font-family: Impact, Haettenschweiler, 'Franklin Gothic Bold', 'Arial Black', sans-serif;
            font-weight: 400;
            letter-spacing: 0.02em;
            /* Slightly scale down fallback fonts as they're wider than Bebas */
            font-size: 95%;
        }
        /* Hide content briefly to prevent FOUT - optional, may cause slight delay */
        /* .bebas { visibility: hidden; } */
        /* .font-loaded .bebas { visibility: visible; } */
    </style>`;
    
    // Add critical CSS right after the title tag
    if (!html.includes('Critical inline CSS')) {
      html = html.replace(
        '</title>',
        '</title>\n' + criticalCSS
      );
    }
    
    // 5. Add font loading detection script
    const fontLoadScript = `
        // Font loading detection to prevent FOUT
        if ('fonts' in document) {
            Promise.all([
                document.fonts.load('400 1em Bebas Neue'),
                document.fonts.load('400 1em Inter')
            ]).then(() => {
                document.documentElement.classList.add('fonts-loaded');
                document.querySelectorAll('.bebas').forEach(el => el.classList.add('font-loaded'));
            });
        }`;
    
    // Add this right after the opening script tag
    html = html.replace(
      '    <script>\n        // Mobile menu toggle',
      '    <script>' + fontLoadScript + '\n\n        // Mobile menu toggle'
    );
    
    // 6. Add a CSS transition for smooth font swap (optional, can be smoother)
    html = html.replace(
      '.bebas {font-family:',
      '.bebas {transition:font-size 0.1s ease;font-family:'
    );
    
    // Write the updated HTML
    await fs.writeFile(htmlPath, html);
    
    console.log('✅ Font flash fixes applied:');
    console.log('   • Added font preloading for Bebas Neue and Inter');
    console.log('   • Fixed font fallback stack (removed cursive)');
    console.log('   • Added Impact and Arial Black as proper fallbacks');
    console.log('   • Added font loading detection');
    console.log('   • Added critical CSS for smoother transition');
    console.log('\n💡 The "cursive" fallback was causing the issue!');
    console.log('   Bebas Neue is a condensed sans-serif, not cursive.');
    console.log('   Now using Impact/Arial Black as fallbacks.\n');
    
  } catch (error) {
    console.error('❌ Error fixing font flash:', error);
    process.exit(1);
  }
}

// Run the fix
fixFontFlash();
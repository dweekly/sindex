#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function optimizeHTML() {
  console.log('🔧 Optimizing HTML...\n');
  
  try {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    let html = await fs.readFile(htmlPath, 'utf8');
    
    // 1. Remove duplicate Tailwind CDN comments
    html = html.replace(/(\s*<!-- Note: Tailwind CDN[^>]+-->\n){2,}/g, 
      '    <!-- Note: Tailwind CDN is used for development. For production, consider PostCSS or Tailwind CLI -->\n');
    
    // 2. Fix duplicate "No newline at end of file" markers
    html = html.replace(/(\s*No newline at end of file\n?)+/g, '');
    
    // 3. Clean up video iframe attributes (remove duplicate allowfullscreen)
    html = html.replace(/allowfullscreen\s+allowfullscreen/g, 'allowfullscreen');
    
    // 4. Optimize meta tags for SEO
    const seoOptimizations = {
      // Add canonical URL
      afterPattern: /<meta property="og:url"[^>]+>/,
      insert: '\n    <link rel="canonical" href="https://sinisterdexter.net/">'
    };
    
    // 5. Add structured data for better SEO
    const structuredData = `
    <!-- Structured Data for SEO -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "MusicGroup",
      "name": "Sinister Dexter",
      "description": "11-piece soul machine bringing the unique sound of great funk horn bands to the San Francisco Bay Area",
      "url": "https://sinisterdexter.net",
      "genre": ["Funk", "Soul", "R&B"],
      "foundingDate": "1999",
      "foundingLocation": {
        "@type": "Place",
        "name": "San Francisco Bay Area, California"
      },
      "member": [
        {
          "@type": "Person",
          "name": "Rebecca Lipon",
          "roleName": "Lead Vocals"
        }
      ],
      "sameAs": [
        "https://www.instagram.com/sindex_band",
        "https://x.com/sindexband",
        "https://facebook.com/SinDex.Band/",
        "https://www.youtube.com/@SinDexBand",
        "https://open.spotify.com/artist/06ZpJFLW4Kz4EAlUorzrFu",
        "https://music.apple.com/us/artist/sinister-dexter/30663361"
      ]
    }
    </script>`;
    
    // Insert structured data before closing </head> (only if not already present)
    if (!html.includes('"@type": "MusicGroup"')) {
      html = html.replace('</head>', structuredData + '\n</head>');
    }
    
    // 6. Add canonical URL if not present
    if (!html.includes('rel="canonical"')) {
      html = html.replace(
        '<meta property="og:url" content="https://sinisterdexter.net">',
        '<meta property="og:url" content="https://sinisterdexter.net">\n    <link rel="canonical" href="https://sinisterdexter.net/">'
      );
    }
    
    // 7. Optimize image loading - add width/height to prevent layout shift
    html = html.replace(
      /<img src="images\/thumbnail\/([^"]+)" alt="([^"]+)"\s+class="([^"]+)"\s+loading="lazy">/g,
      '<img src="images/thumbnail/$1" alt="$2" class="$3" loading="lazy" width="400" height="400">'
    );
    
    // 8. Add missing meta descriptions
    if (!html.includes('meta name="robots"')) {
      html = html.replace(
        '<meta name="description"',
        '<meta name="robots" content="index, follow">\n    <meta name="description"'
      );
    }
    
    // 9. Optimize viewport meta
    html = html.replace(
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">'
    );
    
    // 10. Add preconnect for external resources
    const preconnects = `    <!-- Preconnect to external origins for performance -->
    <link rel="preconnect" href="https://cdn.tailwindcss.com">
    <link rel="preconnect" href="https://cdnjs.cloudflare.com">
    <link rel="preconnect" href="https://open.spotify.com">
    <link rel="preconnect" href="https://embed.music.apple.com">
    <link rel="preconnect" href="https://www.youtube.com">`;
    
    if (!html.includes('cdn.tailwindcss.com">')) {
      html = html.replace(
        '    <link rel="preconnect" href="https://fonts.googleapis.com">',
        preconnects + '\n    <link rel="preconnect" href="https://fonts.googleapis.com">'
      );
    }
    
    // 11. Minify inline styles
    const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
    if (styleMatch) {
      let styles = styleMatch[1];
      // Basic minification - remove excess whitespace
      styles = styles
        .replace(/\s+/g, ' ')
        .replace(/:\s+/g, ':')
        .replace(/;\s+/g, ';')
        .replace(/\{\s+/g, '{')
        .replace(/\}\s+/g, '}')
        .replace(/,\s+/g, ',');
      html = html.replace(styleMatch[0], `<style>${styles}</style>`);
    }
    
    // 12. Clean up script indentation
    html = html.replace(/^\s{8}const galleryImages/m, '        const galleryImages');
    html = html.replace(/^\s{8}let currentImageIndex/m, '        let currentImageIndex');
    
    // 13. Remove empty lines and normalize spacing
    html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // 14. Add lang attribute if missing
    html = html.replace('<html>', '<html lang="en">');
    
    // 15. Fix the broken Tailwind comment (on same line as theme-color)
    html = html.replace(
      '<meta name="theme-color" content="#9333ea">    <!-- Note: Tailwind CDN',
      '<meta name="theme-color" content="#9333ea">\n    \n    <!-- Note: Tailwind CDN'
    );
    
    // 16. Remove duplicate structured data
    const structDataCount = (html.match(/<!-- Structured Data for SEO -->/g) || []).length;
    if (structDataCount > 1) {
      // Keep only the first occurrence
      const firstIndex = html.indexOf('<!-- Structured Data for SEO -->');
      const secondIndex = html.indexOf('<!-- Structured Data for SEO -->', firstIndex + 1);
      if (secondIndex !== -1) {
        const endOfSecond = html.indexOf('</script>', secondIndex) + 9;
        html = html.substring(0, secondIndex) + html.substring(endOfSecond);
      }
    }
    
    // 17. Fix broken script structure
    html = html.replace(/\n\s*No newline at end of file\s*\n?/g, '');
    
    // Remove duplicate </html> tags
    html = html.replace(/<\/html>\s*<\/html>/g, '</html>');
    
    // 17. Ensure proper closing
    if (!html.endsWith('</html>')) {
      html = html.trimEnd() + '\n</html>';
    }
    
    // 18. Add newline at end of file
    if (!html.endsWith('\n')) {
      html += '\n';
    }
    
    // Write optimized HTML
    await fs.writeFile(htmlPath, html);
    
    // Report optimizations
    console.log('✅ HTML Optimizations Complete:');
    console.log('   • Removed duplicate comments');
    console.log('   • Fixed iframe attributes');
    console.log('   • Added structured data for SEO');
    console.log('   • Added canonical URL');
    console.log('   • Optimized meta tags');
    console.log('   • Added image dimensions');
    console.log('   • Added preconnect hints');
    console.log('   • Minified inline styles');
    console.log('   • Cleaned up formatting');
    
    // Calculate size reduction
    const originalSize = Buffer.byteLength(html, 'utf8');
    const optimizedHtml = await fs.readFile(htmlPath, 'utf8');
    const newSize = Buffer.byteLength(optimizedHtml, 'utf8');
    const reduction = originalSize - newSize;
    
    console.log(`\n📊 Size: ${(newSize / 1024).toFixed(2)} KB`);
    if (reduction > 0) {
      console.log(`   Reduced by ${reduction} bytes (${((reduction/originalSize)*100).toFixed(1)}%)`);
    }
    
  } catch (error) {
    console.error('❌ Error optimizing HTML:', error);
    process.exit(1);
  }
}

// Run the optimizer
optimizeHTML();
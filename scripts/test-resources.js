#!/usr/bin/env node

/**
 * Resource Loading Test
 * Verifies all resources referenced in HTML actually exist
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function checkResourceExists(resourcePath, baseDir) {
  // Remove any query strings or fragments
  const cleanPath = resourcePath.split('?')[0].split('#')[0];
  
  // Skip external URLs
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://') || cleanPath.startsWith('//')) {
    return { path: resourcePath, exists: 'external', type: 'external' };
  }
  
  // Skip mailto links
  if (cleanPath.startsWith('mailto:')) {
    return { path: resourcePath, exists: 'mailto', type: 'mailto' };
  }
  
  // Skip data URLs
  if (cleanPath.startsWith('data:')) {
    return { path: resourcePath, exists: 'data', type: 'data' };
  }
  
  // Remove leading slash for relative paths
  const relativePath = cleanPath.startsWith('/') ? cleanPath.slice(1) : cleanPath;
  
  // Construct full path
  const fullPath = path.join(baseDir, relativePath);
  
  try {
    await fs.access(fullPath);
    return { path: resourcePath, exists: true, type: 'local' };
  } catch {
    return { path: resourcePath, exists: false, type: 'local' };
  }
}

async function testResources() {
  log('\n============================================================', 'bright');
  log('🔍 RESOURCE LOADING TEST', 'bright');
  log('============================================================', 'bright');
  
  const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
  const publicDir = path.join(__dirname, '..', 'public');
  
  try {
    // Load HTML
    const html = await fs.readFile(htmlPath, 'utf8');
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    const resources = [];
    const results = {
      images: { found: [], missing: [], external: [] },
      styles: { found: [], missing: [], external: [] },
      scripts: { found: [], missing: [], external: [] },
      links: { found: [], missing: [], external: [] },
      media: { found: [], missing: [], external: [] }
    };
    
    // Check images
    log('\n📸 Checking Images...', 'cyan');
    const images = document.querySelectorAll('img[src], source[srcset]');
    for (const img of images) {
      const src = img.getAttribute('src') || img.getAttribute('srcset')?.split(' ')[0];
      if (src) {
        const result = await checkResourceExists(src, publicDir);
        if (result.type === 'external') {
          results.images.external.push(result.path);
        } else if (result.exists === true) {
          results.images.found.push(result.path);
          log(`  ✅ ${src}`, 'green');
        } else if (result.exists === false) {
          results.images.missing.push(result.path);
          log(`  ❌ ${src}`, 'red');
        }
      }
    }
    
    // Check stylesheets
    log('\n🎨 Checking Stylesheets...', 'cyan');
    const styles = document.querySelectorAll('link[rel="stylesheet"][href]');
    for (const style of styles) {
      const href = style.getAttribute('href');
      if (href) {
        const result = await checkResourceExists(href, publicDir);
        if (result.type === 'external') {
          results.styles.external.push(result.path);
          log(`  ⬇️  ${href} (external)`, 'blue');
        } else if (result.exists === true) {
          results.styles.found.push(result.path);
          log(`  ✅ ${href}`, 'green');
        } else if (result.exists === false) {
          results.styles.missing.push(result.path);
          log(`  ❌ ${href}`, 'red');
        }
      }
    }
    
    // Check scripts
    log('\n📜 Checking Scripts...', 'cyan');
    const scripts = document.querySelectorAll('script[src]');
    for (const script of scripts) {
      const src = script.getAttribute('src');
      if (src) {
        const result = await checkResourceExists(src, publicDir);
        if (result.type === 'external') {
          results.scripts.external.push(result.path);
          log(`  ⬇️  ${src} (external)`, 'blue');
        } else if (result.exists === true) {
          results.scripts.found.push(result.path);
          log(`  ✅ ${src}`, 'green');
        } else if (result.exists === false) {
          results.scripts.missing.push(result.path);
          log(`  ❌ ${src}`, 'red');
        }
      }
    }
    
    // Check other links (favicons, manifests, etc)
    log('\n🔗 Checking Other Resources...', 'cyan');
    const links = document.querySelectorAll('link[href]:not([rel="stylesheet"])');
    for (const link of links) {
      const href = link.getAttribute('href');
      const rel = link.getAttribute('rel');
      if (href && ['icon', 'apple-touch-icon', 'manifest'].includes(rel)) {
        const result = await checkResourceExists(href, publicDir);
        if (result.exists === true) {
          results.links.found.push(result.path);
          log(`  ✅ ${href} (${rel})`, 'green');
        } else if (result.exists === false) {
          results.links.missing.push(result.path);
          log(`  ❌ ${href} (${rel})`, 'red');
        }
      }
    }
    
    // Check audio/video sources
    log('\n🎵 Checking Media Files...', 'cyan');
    const media = document.querySelectorAll('audio source[src], video source[src]');
    for (const source of media) {
      const src = source.getAttribute('src');
      if (src) {
        const result = await checkResourceExists(src, publicDir);
        if (result.type === 'external') {
          results.media.external.push(result.path);
          log(`  ⬇️  ${src} (external CDN)`, 'blue');
        } else if (result.exists === true) {
          results.media.found.push(result.path);
          log(`  ✅ ${src}`, 'green');
        } else if (result.exists === false) {
          results.media.missing.push(result.path);
          log(`  ❌ ${src}`, 'red');
        }
      }
    }
    
    // Summary
    log('\n============================================================', 'bright');
    log('📊 RESOURCE LOADING SUMMARY', 'bright');
    log('============================================================', 'bright');
    
    const totalMissing = 
      results.images.missing.length + 
      results.styles.missing.length + 
      results.scripts.missing.length + 
      results.links.missing.length + 
      results.media.missing.length;
    
    const totalFound = 
      results.images.found.length + 
      results.styles.found.length + 
      results.scripts.found.length + 
      results.links.found.length + 
      results.media.found.length;
    
    const totalExternal = 
      results.images.external.length + 
      results.styles.external.length + 
      results.scripts.external.length + 
      results.media.external.length;
    
    log(`\n📸 Images: ${results.images.found.length} found, ${results.images.missing.length} missing, ${results.images.external.length} external`);
    log(`🎨 Styles: ${results.styles.found.length} found, ${results.styles.missing.length} missing, ${results.styles.external.length} external`);
    log(`📜 Scripts: ${results.scripts.found.length} found, ${results.scripts.missing.length} missing, ${results.scripts.external.length} external`);
    log(`🔗 Links: ${results.links.found.length} found, ${results.links.missing.length} missing`);
    log(`🎵 Media: ${results.media.found.length} found, ${results.media.missing.length} missing, ${results.media.external.length} external`);
    
    log('\n' + '='.repeat(60));
    if (totalMissing === 0) {
      log(`✅ All local resources loaded successfully!`, 'green');
      log(`   ${totalFound} local resources found`, 'green');
      log(`   ${totalExternal} external resources (CDN/remote)`, 'blue');
    } else {
      log(`❌ ${totalMissing} resources are missing (404)!`, 'red');
      log(`   ${totalFound} local resources found`, 'green');
      log(`   ${totalExternal} external resources`, 'blue');
      
      // List missing resources
      if (totalMissing > 0) {
        log('\n⚠️  Missing Resources:', 'yellow');
        const allMissing = [
          ...results.images.missing,
          ...results.styles.missing,
          ...results.scripts.missing,
          ...results.links.missing,
          ...results.media.missing
        ];
        allMissing.forEach(resource => {
          log(`   - ${resource}`, 'red');
        });
      }
    }
    
    log('='.repeat(60) + '\n');
    
    // Exit with error if resources are missing
    if (totalMissing > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the test
testResources();
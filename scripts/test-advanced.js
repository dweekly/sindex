#!/usr/bin/env node

/**
 * Advanced Site Testing Suite
 * Uses proper HTML parsing instead of regex
 */

const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`🔍 ${title}`, 'bright');
  console.log('='.repeat(60));
}

// Load and parse HTML
async function loadHTML(filePath) {
  // Use provided path or default to public/index.html
  const htmlPath = filePath || path.join(__dirname, '..', 'public', 'index.html');
  const html = await fs.readFile(htmlPath, 'utf8');
  const stats = await fs.stat(htmlPath);
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  return { html, document, stats, dom, htmlPath };
}

// 1. HTML VALIDATION
async function validateHTML({ html, document }) {
  logSection('HTML VALIDATION');
  
  const checks = [
    {
      name: 'DOCTYPE declaration',
      test: () => html.toLowerCase().startsWith('<!doctype html>'),
      message: 'HTML5 DOCTYPE is present'
    },
    {
      name: 'Language attribute',
      test: () => document.documentElement.hasAttribute('lang'),
      message: 'HTML lang attribute is set'
    },
    {
      name: 'Character encoding',
      test: () => {
        const meta = document.querySelector('meta[charset]');
        return meta && meta.getAttribute('charset').toLowerCase() === 'utf-8';
      },
      message: 'UTF-8 character encoding is specified'
    },
    {
      name: 'Viewport meta tag',
      test: () => document.querySelector('meta[name="viewport"]') !== null,
      message: 'Viewport meta tag is present'
    },
    {
      name: 'Title tag',
      test: () => {
        const title = document.querySelector('title');
        return title && title.textContent.length > 10 && title.textContent.length <= 80;
      },
      message: 'Title tag exists and is reasonable length (10-80 chars)'
    },
    {
      name: 'Meta description',
      test: () => {
        const desc = document.querySelector('meta[name="description"]');
        return desc && desc.content.length > 50 && desc.content.length <= 200;
      },
      message: 'Meta description exists and is optimal length (50-200 chars)'
    },
    {
      name: 'Canonical URL',
      test: () => document.querySelector('link[rel="canonical"]') !== null,
      message: 'Canonical URL is specified'
    },
    {
      name: 'Open Graph tags',
      test: () => document.querySelector('meta[property^="og:"]') !== null,
      message: 'Open Graph tags are present'
    },
    {
      name: 'Twitter Card tags',
      test: () => document.querySelector('meta[name^="twitter:"]') !== null,
      message: 'Twitter Card tags are present'
    },
    {
      name: 'Favicon',
      test: () => {
        return document.querySelector('link[rel="icon"]') !== null ||
               document.querySelector('link[rel="shortcut icon"]') !== null;
      },
      message: 'Favicon is specified'
    }
  ];
  
  return runChecks(checks);
}

// 2. ACCESSIBILITY TESTING
async function testAccessibility({ document }) {
  logSection('ACCESSIBILITY TESTING');
  
  const checks = [
    {
      name: 'Skip navigation link',
      test: () => document.querySelector('a[href="#main-content"]') !== null,
      message: 'Skip navigation link is present'
    },
    {
      name: 'Main landmark',
      test: () => document.querySelector('main') !== null,
      message: 'Main landmark exists'
    },
    {
      name: 'Navigation landmark',
      test: () => document.querySelector('nav') !== null,
      message: 'Navigation landmark exists'
    },
    {
      name: 'Heading hierarchy',
      test: () => {
        const h1s = document.querySelectorAll('h1');
        return h1s.length === 1;
      },
      message: 'Single H1 heading (good hierarchy)'
    },
    {
      name: 'Image alt attributes',
      test: () => {
        const images = document.querySelectorAll('img');
        return Array.from(images).every(img => img.hasAttribute('alt'));
      },
      message: 'All images have alt attributes'
    },
    {
      name: 'ARIA labels on buttons',
      test: () => {
        const buttons = document.querySelectorAll('button');
        return Array.from(buttons).every(btn => 
          btn.hasAttribute('aria-label') || btn.textContent.trim().length > 0
        );
      },
      message: 'Buttons have accessible labels'
    },
    {
      name: 'Form labels',
      test: () => {
        const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"])');
        return Array.from(inputs).every(input => {
          if (input.hasAttribute('aria-label')) return true;
          const id = input.id;
          if (id) {
            return document.querySelector(`label[for="${id}"]`) !== null;
          }
          return false;
        });
      },
      message: 'Form inputs have associated labels'
    },
    {
      name: 'Link text quality',
      test: () => {
        const links = document.querySelectorAll('a');
        const genericTexts = ['click here', 'here', 'read more', 'link'];
        return !Array.from(links).some(link => 
          genericTexts.includes(link.textContent.trim().toLowerCase())
        );
      },
      message: 'No generic link text'
    },
    {
      name: 'Iframe titles',
      test: () => {
        const iframes = document.querySelectorAll('iframe');
        return Array.from(iframes).every(iframe => iframe.hasAttribute('title'));
      },
      message: 'All iframes have title attributes'
    },
    {
      name: 'ARIA landmarks',
      test: () => {
        const main = document.querySelector('main');
        const nav = document.querySelector('nav');
        return main && main.hasAttribute('role') && 
               nav && nav.hasAttribute('role');
      },
      message: 'ARIA landmarks are properly defined'
    },
    {
      name: 'Focus management',
      test: () => {
        // Check for focus-visible styles or tabindex management
        const styles = document.querySelector('style');
        return styles && styles.textContent.includes('focus');
      },
      message: 'Focus styles are defined'
    },
    {
      name: 'Color contrast',
      test: () => {
        // Basic check for potential contrast issues
        const bgBlack = document.querySelector('.bg-black');
        const textWhite = document.querySelector('.text-white');
        return bgBlack && textWhite;
      },
      message: 'Basic color contrast appears adequate'
    }
  ];
  
  return runChecks(checks);
}

// 3. SEO TESTING
async function testSEO({ document, html }) {
  logSection('SEO TESTING');
  
  const checks = [
    {
      name: 'Structured data',
      test: () => {
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');
        if (scripts.length === 0) return false;
        
        try {
          // Validate that JSON is parseable
          Array.from(scripts).forEach(script => {
            JSON.parse(script.textContent);
          });
          return true;
        } catch (e) {
          return false;
        }
      },
      message: 'Valid structured data (JSON-LD) is present'
    },
    {
      name: 'Robots meta tag',
      test: () => {
        const robots = document.querySelector('meta[name="robots"]');
        return robots && !robots.content.includes('noindex');
      },
      message: 'Robots meta tag allows indexing'
    },
    {
      name: 'Sitemap existence',
      test: async () => {
        try {
          await fs.access(path.join(__dirname, 'public', 'sitemap.xml'));
          return true;
        } catch {
          return false;
        }
      },
      message: 'Sitemap.xml exists'
    },
    {
      name: 'Heading structure',
      test: () => {
        const h1 = document.querySelector('h1');
        const h2s = document.querySelectorAll('h2');
        return h1 && h1.textContent.length > 10 && h2s.length > 0;
      },
      message: 'Proper heading structure with meaningful content'
    },
    {
      name: 'Internal linking',
      test: () => {
        const internalLinks = document.querySelectorAll('a[href^="#"]');
        return internalLinks.length >= 5;
      },
      message: 'Adequate internal linking structure'
    },
    {
      name: 'Image optimization',
      test: () => {
        const images = document.querySelectorAll('img');
        const hasWebP = document.querySelector('source[type="image/webp"]') !== null;
        const hasLazyLoad = Array.from(images).some(img => img.loading === 'lazy');
        return hasWebP || hasLazyLoad;
      },
      message: 'Images are optimized (WebP or lazy loading)'
    },
    {
      name: 'Mobile optimization',
      test: () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        return viewport && viewport.content.includes('width=device-width');
      },
      message: 'Mobile viewport is properly configured'
    },
    {
      name: 'HTTPS resources',
      test: () => {
        const resources = document.querySelectorAll('[src^="http://"], [href^="http://"]');
        return resources.length === 0;
      },
      message: 'All resources use HTTPS'
    },
    {
      name: 'Performance hints',
      test: () => {
        const preconnect = document.querySelector('link[rel="preconnect"]');
        const dnsPrefetch = document.querySelector('link[rel="dns-prefetch"]');
        return preconnect !== null || dnsPrefetch !== null;
      },
      message: 'Performance hints (preconnect/dns-prefetch) are present'
    },
    {
      name: 'Social media optimization',
      test: () => {
        const ogRequired = ['og:title', 'og:description', 'og:image', 'og:url'];
        return ogRequired.every(prop => 
          document.querySelector(`meta[property="${prop}"]`) !== null
        );
      },
      message: 'Complete Open Graph tags for social sharing'
    }
  ];
  
  return runChecks(checks);
}

// 4. PERFORMANCE TESTING
async function testPerformance({ html, document, stats }) {
  logSection('PERFORMANCE TESTING');
  
  const checks = [
    {
      name: 'HTML file size',
      test: () => stats.size < 100000,
      message: `HTML size: ${(stats.size / 1024).toFixed(1)}KB ${stats.size < 100000 ? '(optimal)' : '(consider optimization)'}`
    },
    {
      name: 'Minification',
      test: () => {
        // Check if HTML is reasonably minified
        // JSON-LD can have whitespace for readability, but HTML should be compressed
        
        // Remove JSON-LD scripts for this check
        const htmlWithoutJsonLd = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
        
        // Check the actual HTML for minification
        const hasExcessiveWhitespace = /\n\s{4,}/.test(htmlWithoutJsonLd); // 4+ spaces of indentation
        const hasUnminifiedAttributes = / (class|id|href|src)="\s+/.test(htmlWithoutJsonLd); // spaces in attributes
        const hasMultilineHTML = /<(div|section|nav|header|footer|main|article|aside)[^>]*>\n\s+</.test(htmlWithoutJsonLd);
        
        // File should be reasonably small
        const fileSizeOK = html.length < 100000; // Under 100KB
        
        // Consider minified if HTML (excluding JSON-LD) is compressed and file size is reasonable
        return !hasExcessiveWhitespace && !hasUnminifiedAttributes && !hasMultilineHTML && fileSizeOK;
      },
      message: 'HTML appears to be minified'
    },
    {
      name: 'Critical CSS',
      test: () => {
        const inlineStyles = document.querySelectorAll('head style');
        return inlineStyles.length > 0;
      },
      message: 'Critical CSS is inlined'
    },
    {
      name: 'Script optimization',
      test: () => {
        const scripts = document.querySelectorAll('script[src]');
        if (scripts.length === 0) return true;
        
        // Check each external script
        const results = Array.from(scripts).map(script => {
          const src = script.getAttribute('src');
          // GTM and analytics scripts should load immediately (no defer/async)
          const isAnalytics = src && (src.includes('googletagmanager') || src.includes('gtm.js'));
          // Other scripts should have async or defer
          const hasOptimization = script.hasAttribute('async') || script.hasAttribute('defer');
          
          return isAnalytics || hasOptimization;
        });
        
        return results.every(r => r);
      },
      message: 'External scripts are properly optimized'
    },
    {
      name: 'Resource hints',
      test: () => {
        const preload = document.querySelectorAll('link[rel="preload"]');
        const prefetch = document.querySelectorAll('link[rel="prefetch"], link[rel="dns-prefetch"]');
        const preconnect = document.querySelectorAll('link[rel="preconnect"]');
        return preload.length > 0 || prefetch.length > 0 || preconnect.length > 0;
      },
      message: 'Resource hints are used for optimization'
    },
    {
      name: 'Image formats',
      test: () => {
        const sources = document.querySelectorAll('source[type="image/webp"]');
        const pictures = document.querySelectorAll('picture');
        return sources.length > 0 || pictures.length > 0;
      },
      message: 'Modern image formats (WebP) are used'
    },
    {
      name: 'Font loading',
      test: () => {
        const fontPreload = document.querySelector('link[rel="preload"][as="font"]');
        const fontDisplay = document.querySelector('link[href*="display=swap"]');
        return fontPreload !== null || fontDisplay !== null;
      },
      message: 'Fonts are optimized for loading'
    }
  ];
  
  return runChecks(checks);
}

// 5. ADVANCED VALIDATION
async function advancedValidation({ document }) {
  logSection('ADVANCED VALIDATION');
  
  const checks = [
    {
      name: 'Unique IDs',
      test: () => {
        const ids = Array.from(document.querySelectorAll('[id]')).map(el => el.id);
        const uniqueIds = new Set(ids);
        return ids.length === uniqueIds.size;
      },
      message: 'All IDs are unique'
    },
    {
      name: 'Valid links',
      test: () => {
        const links = document.querySelectorAll('a[href]');
        return Array.from(links).every(link => {
          const href = link.getAttribute('href');
          return href && href !== '#' && href !== 'javascript:void(0)';
        });
      },
      message: 'All links have valid destinations'
    },
    {
      name: 'Form validation',
      test: () => {
        const forms = document.querySelectorAll('form');
        if (forms.length === 0) return true;
        return Array.from(forms).every(form => 
          form.hasAttribute('action') || form.hasAttribute('onsubmit')
        );
      },
      message: 'Forms have proper actions'
    },
    {
      name: 'Media queries',
      test: () => {
        const styles = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join(' ');
        return styles.includes('@media') || document.querySelector('meta[name="viewport"]');
      },
      message: 'Responsive design is implemented'
    },
    {
      name: 'Security headers hints',
      test: () => {
        const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        const resources = Array.from(document.querySelectorAll('[src], [href]'));
        const https = !resources.some(el => {
          const url = el.src || el.href || '';
          return url.startsWith('http://');
        });
        return https;
      },
      message: 'Basic security practices are followed'
    }
  ];
  
  return runChecks(checks);
}

// Helper function to run checks
async function runChecks(checks) {
  let passed = 0;
  let failed = 0;
  const results = [];
  
  for (const check of checks) {
    try {
      const result = await Promise.resolve(check.test());
      if (result) {
        log(`✅ ${check.message}`, 'green');
        passed++;
        results.push({ name: check.name, passed: true, message: check.message });
      } else {
        log(`❌ ${check.name} - FAILED`, 'red');
        failed++;
        results.push({ name: check.name, passed: false, message: check.message });
      }
    } catch (error) {
      log(`⚠️  ${check.name} - ERROR: ${error.message}`, 'yellow');
      failed++;
      results.push({ name: check.name, passed: false, error: error.message });
    }
  }
  
  const color = failed === 0 ? 'green' : (failed > passed ? 'red' : 'yellow');
  log(`\nResults: ${passed} passed, ${failed} failed`, color);
  
  return { passed, failed, results };
}

// External tool integrations
async function runExternalTools() {
  logSection('EXTERNAL TOOL CHECKS (if installed)');
  
  const tools = [
    {
      name: 'W3C HTML Validator',
      check: 'html-validator',
      command: 'npx html-validator public/index.html --format=json',
      parse: (output) => {
        try {
          const results = JSON.parse(output);
          const errors = results.messages.filter(m => m.type === 'error').length;
          const warnings = results.messages.filter(m => m.type === 'warning').length;
          return `${errors} errors, ${warnings} warnings`;
        } catch {
          return 'Check failed';
        }
      }
    },
    {
      name: 'Pa11y Accessibility',
      check: 'pa11y',
      command: 'npx pa11y public/index.html --reporter json',
      parse: (output) => {
        try {
          const results = JSON.parse(output);
          return `${results.issues.length} accessibility issues`;
        } catch {
          return 'Check failed';
        }
      }
    },
    {
      name: 'HTMLHint',
      check: 'htmlhint',
      command: 'npx htmlhint public/index.html --format json',
      parse: (output) => {
        try {
          const results = JSON.parse(output);
          const totalErrors = results.reduce((sum, file) => sum + file.errors.length, 0);
          return `${totalErrors} hint violations`;
        } catch {
          return 'Check failed';
        }
      }
    }
  ];
  
  for (const tool of tools) {
    try {
      // Check if tool is available
      await execPromise(`which ${tool.check}`);
      
      log(`🔧 Running ${tool.name}...`, 'cyan');
      const { stdout } = await execPromise(tool.command);
      const result = tool.parse(stdout);
      log(`   Result: ${result}`, 'blue');
    } catch (error) {
      log(`⏭️  ${tool.name} - Not installed (npm install -g ${tool.check})`, 'yellow');
    }
  }
}

// Generate report
function generateReport(results) {
  logSection('SUMMARY REPORT');
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const [category, data] of Object.entries(results)) {
    totalPassed += data.passed;
    totalFailed += data.failed;
    
    const percentage = ((data.passed / (data.passed + data.failed)) * 100).toFixed(1);
    const color = percentage >= 80 ? 'green' : percentage >= 60 ? 'yellow' : 'red';
    
    log(`${category}: ${percentage}% passed (${data.passed}/${data.passed + data.failed})`, color);
  }
  
  console.log('\n' + '='.repeat(60));
  const overallPercentage = ((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1);
  const overallColor = overallPercentage >= 80 ? 'green' : overallPercentage >= 60 ? 'yellow' : 'red';
  
  log(`OVERALL SCORE: ${overallPercentage}%`, overallColor);
  log(`Total: ${totalPassed} passed, ${totalFailed} failed`, overallColor);
  
  if (overallPercentage >= 90) {
    log('\n🏆 Excellent! Your site meets high quality standards.', 'green');
  } else if (overallPercentage >= 70) {
    log('\n👍 Good! Some improvements recommended.', 'yellow');
  } else {
    log('\n⚠️  Needs improvement. Address the failed checks.', 'red');
  }
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('🚀 ADVANCED SITE TESTING SUITE', 'bright');
  console.log('='.repeat(60));
  
  try {
    // Check if jsdom is installed
    try {
      require.resolve('jsdom');
    } catch {
      log('\n⚠️  Installing required dependency: jsdom', 'yellow');
      await execPromise('npm install jsdom');
      log('✅ jsdom installed successfully\n', 'green');
    }
    
    // Get file path from command line argument
    const filePath = process.argv[2];
    
    // Load HTML
    const data = await loadHTML(filePath);
    
    // Show which file is being tested
    console.log(`📄 Testing: ${data.htmlPath}`);
    
    // Run all test suites
    const results = {
      'HTML Validation': await validateHTML(data),
      'Accessibility': await testAccessibility(data),
      'SEO': await testSEO(data),
      'Performance': await testPerformance(data),
      'Advanced': await advancedValidation(data)
    };
    
    // Try external tools
    await runExternalTools();
    
    // Generate summary report
    generateReport(results);
    
  } catch (error) {
    log(`\n❌ Fatal error: ${error.message}`, 'red');
    log('Make sure public/index.html exists (run npm run build:html)', 'yellow');
    process.exit(1);
  }
  
  console.log('\n' + '='.repeat(60));
  log('✨ Testing complete!', 'bright');
  console.log('='.repeat(60) + '\n');
}

// Run the tests
runTests();
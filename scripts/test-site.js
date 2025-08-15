#!/usr/bin/env node

/**
 * Comprehensive Site Testing Suite
 * Tests HTML validity, accessibility, SEO, and performance
 */

const fs = require('fs').promises;
const path = require('path');
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

async function checkDependency(command, packageName, installCmd) {
  try {
    await execPromise(`which ${command}`);
    return true;
  } catch {
    log(`⚠️  ${packageName} not found. Install with: ${installCmd}`, 'yellow');
    return false;
  }
}

// 1. HTML VALIDATION
async function validateHTML() {
  logSection('HTML VALIDATION');
  
  const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
  
  // Check for common HTML issues
  try {
    const html = await fs.readFile(htmlPath, 'utf8');
    
    const checks = [
      {
        name: 'DOCTYPE declaration',
        test: () => html.toLowerCase().startsWith('<!doctype html>'),
        message: 'HTML5 DOCTYPE is present'
      },
      {
        name: 'Language attribute',
        test: () => /<html[^>]+lang="[^"]+"/i.test(html),
        message: 'HTML lang attribute is set'
      },
      {
        name: 'Character encoding',
        test: () => /<meta[^>]+charset="utf-8"/i.test(html),
        message: 'UTF-8 character encoding is specified'
      },
      {
        name: 'Viewport meta tag',
        test: () => /<meta[^>]+name="viewport"/i.test(html),
        message: 'Viewport meta tag is present'
      },
      {
        name: 'Title tag',
        test: () => {
          const match = html.match(/<title>([^<]+)<\/title>/i);
          return match && match[1].length > 10 && match[1].length <= 80;
        },
        message: 'Title tag exists and is reasonable length (10-80 chars)'
      },
      {
        name: 'Meta description',
        test: () => {
          const match = html.match(/<meta[^>]+content="([^"]+)"[^>]+name="description"/i) || 
                       html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
          return match && match[1].length > 50 && match[1].length <= 200;
        },
        message: 'Meta description exists and is optimal length (50-200 chars)'
      },
      {
        name: 'Canonical URL',
        test: () => /<link[^>]+rel="canonical"/i.test(html),
        message: 'Canonical URL is specified'
      },
      {
        name: 'Open Graph tags',
        test: () => /<meta[^>]+property="og:/i.test(html),
        message: 'Open Graph tags are present'
      },
      {
        name: 'Twitter Card tags',
        test: () => /<meta[^>]+name="twitter:/i.test(html),
        message: 'Twitter Card tags are present'
      },
      {
        name: 'Favicon',
        test: () => /<link[^>]+rel="icon"/i.test(html) || /<link[^>]+rel="shortcut icon"/i.test(html),
        message: 'Favicon is specified'
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const check of checks) {
      if (check.test()) {
        log(`✅ ${check.message}`, 'green');
        passed++;
      } else {
        log(`❌ ${check.name} - FAILED`, 'red');
        failed++;
      }
    }
    
    log(`\nHTML Validation: ${passed} passed, ${failed} failed`, failed > 0 ? 'yellow' : 'green');
    
  } catch (error) {
    log(`❌ Error reading HTML file: ${error.message}`, 'red');
  }
}

// 2. ACCESSIBILITY TESTING
async function testAccessibility() {
  logSection('ACCESSIBILITY TESTING');
  
  const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
  
  try {
    const html = await fs.readFile(htmlPath, 'utf8');
    
    const checks = [
      {
        name: 'Skip navigation link',
        test: () => /href="#main-content"/i.test(html),
        message: 'Skip navigation link is present'
      },
      {
        name: 'Main landmark',
        test: () => /<main[^>]*>/i.test(html),
        message: 'Main landmark exists'
      },
      {
        name: 'Navigation landmark',
        test: () => /<nav[^>]*>/i.test(html),
        message: 'Navigation landmark exists'
      },
      {
        name: 'Heading hierarchy',
        test: () => {
          const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
          return h1Count === 1;
        },
        message: 'Single H1 heading (good hierarchy)'
      },
      {
        name: 'Image alt attributes',
        test: () => {
          const images = html.match(/<img[^>]+>/gi) || [];
          const imagesWithAlt = images.filter(img => /alt="/i.test(img));
          return images.length === 0 || imagesWithAlt.length === images.length;
        },
        message: 'All images have alt attributes'
      },
      {
        name: 'ARIA labels on buttons',
        test: () => {
          const buttons = html.match(/<button[^>]*>/gi) || [];
          const buttonsWithLabel = buttons.filter(btn => 
            /aria-label="/i.test(btn) || />[\s\S]*?[A-Za-z][\s\S]*?<\/button>/i.test(btn)
          );
          return buttons.length === 0 || buttonsWithLabel.length > 0;
        },
        message: 'Buttons have accessible labels'
      },
      {
        name: 'Form labels',
        test: () => {
          const inputs = html.match(/<input[^>]+type="(?!hidden|submit|button)[^"]*"/gi) || [];
          if (inputs.length === 0) return true;
          const hasLabels = inputs.every(input => {
            const id = input.match(/id="([^"]+)"/i);
            if (!id) return /aria-label="/i.test(input);
            return new RegExp(`<label[^>]+for="${id[1]}"`, 'i').test(html);
          });
          return hasLabels;
        },
        message: 'Form inputs have associated labels'
      },
      {
        name: 'Link text',
        test: () => {
          // Check for "click here" or "read more" without context
          return !/(>click here<|>read more<|>here<)/i.test(html);
        },
        message: 'No generic link text (click here, read more)'
      },
      {
        name: 'Language attributes on iframes',
        test: () => {
          const iframes = html.match(/<iframe[^>]*>/gi) || [];
          if (iframes.length === 0) return true;
          return iframes.every(iframe => /title="/i.test(iframe));
        },
        message: 'Iframes have title attributes'
      },
      {
        name: 'Focus indicators CSS',
        test: () => /focus-visible|focus:/i.test(html),
        message: 'Focus indicator styles are defined'
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const check of checks) {
      if (check.test()) {
        log(`✅ ${check.message}`, 'green');
        passed++;
      } else {
        log(`❌ ${check.name} - FAILED`, 'red');
        failed++;
      }
    }
    
    log(`\nAccessibility: ${passed} passed, ${failed} failed`, failed > 0 ? 'yellow' : 'green');
    
  } catch (error) {
    log(`❌ Error testing accessibility: ${error.message}`, 'red');
  }
}

// 3. SEO TESTING
async function testSEO() {
  logSection('SEO TESTING');
  
  const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
  
  try {
    const html = await fs.readFile(htmlPath, 'utf8');
    
    const checks = [
      {
        name: 'Structured data',
        test: () => /<script[^>]+type="application\/ld\+json"/i.test(html),
        message: 'Structured data (JSON-LD) is present'
      },
      {
        name: 'Robots meta tag',
        test: () => {
          const robots = html.match(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/i);
          return robots && !robots[1].includes('noindex');
        },
        message: 'Robots meta tag allows indexing'
      },
      {
        name: 'Sitemap reference',
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
        name: 'Heading keywords',
        test: () => {
          const h1 = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
          return h1 && h1[1].length > 10;
        },
        message: 'H1 contains meaningful content'
      },
      {
        name: 'Internal linking',
        test: () => {
          const internalLinks = html.match(/href="#[^"]+"/gi) || [];
          return internalLinks.length > 5;
        },
        message: 'Adequate internal linking structure'
      },
      {
        name: 'Image optimization',
        test: () => {
          // Check for WebP images and lazy loading
          return /\.webp/i.test(html) && /loading="lazy"/i.test(html);
        },
        message: 'Images use WebP format and lazy loading'
      },
      {
        name: 'Mobile-friendly',
        test: () => /viewport-fit=cover/i.test(html),
        message: 'Mobile viewport optimization'
      },
      {
        name: 'HTTPS resources',
        test: () => {
          const httpResources = html.match(/(?:src|href)="http:\/\//gi) || [];
          return httpResources.length === 0;
        },
        message: 'All resources use HTTPS'
      },
      {
        name: 'Preconnect hints',
        test: () => /<link[^>]+rel="preconnect"/i.test(html),
        message: 'Preconnect hints for external resources'
      },
      {
        name: 'Social media tags complete',
        test: () => {
          const ogTags = ['og:title', 'og:description', 'og:image', 'og:url'];
          return ogTags.every(tag => new RegExp(`property="${tag}"`, 'i').test(html));
        },
        message: 'Complete Open Graph tags for social sharing'
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const check of checks) {
      const result = typeof check.test === 'function' 
        ? await check.test() 
        : check.test;
      
      if (result) {
        log(`✅ ${check.message}`, 'green');
        passed++;
      } else {
        log(`❌ ${check.name} - FAILED`, 'red');
        failed++;
      }
    }
    
    log(`\nSEO: ${passed} passed, ${failed} failed`, failed > 0 ? 'yellow' : 'green');
    
  } catch (error) {
    log(`❌ Error testing SEO: ${error.message}`, 'red');
  }
}

// 4. PERFORMANCE TESTING
async function testPerformance() {
  logSection('PERFORMANCE TESTING');
  
  const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
  
  try {
    const html = await fs.readFile(htmlPath, 'utf8');
    const stats = await fs.stat(htmlPath);
    
    const checks = [
      {
        name: 'HTML file size',
        test: () => stats.size < 100000, // Less than 100KB
        message: `HTML size: ${(stats.size / 1024).toFixed(1)}KB ${stats.size < 100000 ? '(optimal)' : '(consider optimization)'}`
      },
      {
        name: 'Minification',
        test: () => {
          // Check if HTML appears to be minified (no excessive whitespace)
          const lines = html.split('\n');
          return lines.length < 100 || html.length / lines.length > 500;
        },
        message: 'HTML appears to be minified'
      },
      {
        name: 'Inline critical CSS',
        test: () => /<style[^>]*>[\s\S]+<\/style>/i.test(html.substring(0, 10000)),
        message: 'Critical CSS is inlined'
      },
      {
        name: 'Async/defer scripts',
        test: () => {
          const scripts = html.match(/<script[^>]+src=/gi) || [];
          if (scripts.length === 0) return true;
          const optimized = scripts.filter(s => /async|defer/i.test(s));
          return optimized.length === scripts.length;
        },
        message: 'External scripts use async or defer'
      },
      {
        name: 'Font preloading',
        test: () => /<link[^>]+rel="preload"[^>]+as="font"/i.test(html),
        message: 'Fonts are preloaded'
      },
      {
        name: 'DNS prefetch',
        test: () => /<link[^>]+rel="dns-prefetch"/i.test(html),
        message: 'DNS prefetch for external domains'
      }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const check of checks) {
      if (check.test()) {
        log(`✅ ${check.message}`, 'green');
        passed++;
      } else {
        log(`❌ ${check.name} - FAILED`, 'red');
        failed++;
      }
    }
    
    log(`\nPerformance: ${passed} passed, ${failed} failed`, failed > 0 ? 'yellow' : 'green');
    
  } catch (error) {
    log(`❌ Error testing performance: ${error.message}`, 'red');
  }
}

// 5. EXTERNAL TOOL RECOMMENDATIONS
async function recommendTools() {
  logSection('RECOMMENDED EXTERNAL TOOLS');
  
  log('For comprehensive testing, consider these tools:\n', 'cyan');
  
  const tools = [
    {
      name: 'W3C Validator',
      command: 'npm install -g html-validator-cli',
      usage: 'html-validator public/index.html',
      description: 'Official W3C HTML validation'
    },
    {
      name: 'Pa11y (Accessibility)',
      command: 'npm install -g pa11y',
      usage: 'pa11y public/index.html',
      description: 'Automated accessibility testing'
    },
    {
      name: 'Lighthouse CI',
      command: 'npm install -g @lhci/cli',
      usage: 'lhci autorun',
      description: 'Google Lighthouse for performance, accessibility, SEO'
    },
    {
      name: 'axe DevTools CLI',
      command: 'npm install -g @axe-core/cli',
      usage: 'axe public/index.html',
      description: 'Accessibility testing engine'
    },
    {
      name: 'HTMLHint',
      command: 'npm install -g htmlhint',
      usage: 'htmlhint public/index.html',
      description: 'Static code analysis for HTML'
    }
  ];
  
  for (const tool of tools) {
    log(`📦 ${tool.name}`, 'bright');
    log(`   Install: ${tool.command}`, 'blue');
    log(`   Usage:   ${tool.usage}`, 'blue');
    log(`   Purpose: ${tool.description}\n`, 'gray');
  }
  
  log('Online Tools:', 'bright');
  log('🌐 Google PageSpeed Insights: https://pagespeed.web.dev/', 'blue');
  log('🌐 GTmetrix: https://gtmetrix.com/', 'blue');
  log('🌐 WAVE (WebAIM): https://wave.webaim.org/', 'blue');
  log('🌐 Schema.org Validator: https://validator.schema.org/', 'blue');
  log('🌐 Meta Tags Checker: https://metatags.io/', 'blue');
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('🚀 SINISTER DEXTER SITE TESTING SUITE', 'bright');
  console.log('='.repeat(60));
  
  // Check if HTML file exists
  const htmlPath = path.join(__dirname, '..', 'public', 'index.html');
  try {
    await fs.access(htmlPath);
  } catch {
    log('❌ Error: ../public/index.html not found. Run npm run build:html first.', 'red');
    process.exit(1);
  }
  
  // Run all tests
  await validateHTML();
  await testAccessibility();
  await testSEO();
  await testPerformance();
  await recommendTools();
  
  console.log('\n' + '='.repeat(60));
  log('✨ Testing complete!', 'bright');
  console.log('='.repeat(60) + '\n');
}

// Run the tests
runTests().catch(error => {
  log(`❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
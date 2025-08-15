#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...\n');
  
  const baseUrl = 'https://sinisterdexter.net';
  const today = new Date().toISOString().split('T')[0];
  
  // Define pages with their change frequency and priority
  const pages = [
    { url: '/', changefreq: 'weekly', priority: '1.0' },
    { url: '/#shows', changefreq: 'weekly', priority: '0.9' },
    { url: '/#music', changefreq: 'monthly', priority: '0.8' },
    { url: '/#videos', changefreq: 'monthly', priority: '0.8' },
    { url: '/#gallery', changefreq: 'weekly', priority: '0.7' },
    { url: '/#about', changefreq: 'monthly', priority: '0.6' },
    { url: '/#connect', changefreq: 'monthly', priority: '0.7' },
    { url: '/#merch', changefreq: 'weekly', priority: '0.5' }
  ];
  
  // Generate XML sitemap
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;
  
  for (const page of pages) {
    sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>`;
    
    // Add image information for the homepage
    if (page.url === '/') {
      sitemap += `
    <image:image>
      <image:loc>${baseUrl}/images/large/sindex-full.jpg</image:loc>
      <image:title>Sinister Dexter Band - Full Band Photo</image:title>
      <image:caption>Sinister Dexter performing live in the San Francisco Bay Area</image:caption>
    </image:image>`;
    }
    
    sitemap += `
  </url>`;
  }
  
  sitemap += `
</urlset>`;
  
  // Write sitemap to file
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  await fs.writeFile(sitemapPath, sitemap);
  
  console.log('✅ Sitemap generated successfully!');
  console.log(`📄 Output: ${sitemapPath}`);
  console.log(`🔗 ${pages.length} URLs included`);
  
  // Also generate a simple text sitemap for compatibility
  const textSitemap = pages.map(page => `${baseUrl}${page.url}`).join('\n');
  const textSitemapPath = path.join(__dirname, '..', 'public', 'sitemap.txt');
  await fs.writeFile(textSitemapPath, textSitemap);
  
  console.log(`📄 Text sitemap: ${textSitemapPath}`);
}

// Run the generator
generateSitemap().catch(console.error);
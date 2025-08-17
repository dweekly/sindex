#!/usr/bin/env node

const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

async function optimizeHeroImage() {
  console.log('🖼️  Optimizing hero background image with aggressive compression...\n');
  
  const imageName = 'sindex-full';
  const sizes = {
    // For hero background, we only need the large size
    // Since it's behind overlays, we can use much lower quality
    large: { 
      width: 1920, 
      height: 1080,
      webpQuality: 50,  // Much lower for background with overlays
      jpegQuality: 60   // Lower JPEG quality too
    },
    // Keep medium for tablets
    medium: {
      width: 1024,
      height: 768,
      webpQuality: 45,
      jpegQuality: 55
    },
    // Small for mobile
    small: {
      width: 640,
      height: 480,
      webpQuality: 40,
      jpegQuality: 50
    }
  };
  
  // Find the source image
  const possibleSources = [
    `./photos/${imageName}.jpg`,
    `./photos/${imageName}.JPG`,
    `./photos/${imageName}.jpeg`,
    `./photos/${imageName}.JPEG`,
    `./photos/${imageName}.png`,
    `./photos/${imageName}.PNG`,
    `./public/images/original/${imageName}.jpg`,
    `./public/images/original/${imageName}.webp`
  ];
  
  let sourceImage = null;
  for (const source of possibleSources) {
    try {
      await fs.access(source);
      sourceImage = source;
      console.log(`  📁 Found source: ${source}`);
      break;
    } catch {
      // Continue searching
    }
  }
  
  if (!sourceImage) {
    console.error('❌ Could not find source image for sindex-full');
    return;
  }
  
  // Get original file sizes for comparison
  const originalSizes = {};
  for (const [sizeName] of Object.entries(sizes)) {
    try {
      const webpPath = `./public/images/${sizeName}/${imageName}.webp`;
      const jpgPath = `./public/images/${sizeName}/${imageName}.jpg`;
      const webpStats = await fs.stat(webpPath);
      const jpgStats = await fs.stat(jpgPath);
      originalSizes[sizeName] = {
        webp: webpStats.size,
        jpg: jpgStats.size
      };
    } catch {
      // File doesn't exist yet
    }
  }
  
  // Process each size
  for (const [sizeName, config] of Object.entries(sizes)) {
    console.log(`\n  📐 Processing ${sizeName} (${config.width}x${config.height}):`);
    
    const outputDir = `./public/images/${sizeName}`;
    await fs.mkdir(outputDir, { recursive: true });
    
    // WebP version with aggressive compression
    const webpPath = path.join(outputDir, `${imageName}.webp`);
    await sharp(sourceImage)
      .resize(config.width, config.height, {
        fit: 'cover',  // Cover for hero images
        position: 'center'
      })
      .webp({ 
        quality: config.webpQuality,
        effort: 6,  // Max compression effort
        smartSubsample: true,
        alphaQuality: 60  // If there's transparency
      })
      .toFile(webpPath);
    
    // JPEG version as fallback
    const jpgPath = path.join(outputDir, `${imageName}.jpg`);
    await sharp(sourceImage)
      .resize(config.width, config.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ 
        quality: config.jpegQuality,
        progressive: true,
        mozjpeg: true  // Use mozjpeg encoder for better compression
      })
      .toFile(jpgPath);
    
    // Show size reduction
    const webpStats = await fs.stat(webpPath);
    const jpgStats = await fs.stat(jpgPath);
    
    if (originalSizes[sizeName]) {
      const webpReduction = ((originalSizes[sizeName].webp - webpStats.size) / originalSizes[sizeName].webp * 100).toFixed(1);
      const jpgReduction = ((originalSizes[sizeName].jpg - jpgStats.size) / originalSizes[sizeName].jpg * 100).toFixed(1);
      
      console.log(`    WebP: ${(originalSizes[sizeName].webp / 1024).toFixed(0)}KB → ${(webpStats.size / 1024).toFixed(0)}KB (-${webpReduction}%)`);
      console.log(`    JPEG: ${(originalSizes[sizeName].jpg / 1024).toFixed(0)}KB → ${(jpgStats.size / 1024).toFixed(0)}KB (-${jpgReduction}%)`);
    } else {
      console.log(`    WebP: ${(webpStats.size / 1024).toFixed(0)}KB`);
      console.log(`    JPEG: ${(jpgStats.size / 1024).toFixed(0)}KB`);
    }
  }
  
  console.log('\n✅ Hero image optimization complete!');
  console.log('\n💡 The reduced quality is perfect for background images with overlays.');
  console.log('   The dark overlay (60% opacity) and gradient overlays will hide any compression artifacts.\n');
}

// Run the optimization
optimizeHeroImage().catch(console.error);
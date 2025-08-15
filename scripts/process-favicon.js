const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const FAVICON_SIZES = [16, 32, 48, 64, 128, 180, 192, 512];

async function processFavicon() {
  const inputPath = './favicon-source.png';
  const outputDir = './public';
  
  console.log('🎨 Processing favicon...');
  
  try {
    // Generate multiple favicon sizes
    for (const size of FAVICON_SIZES) {
      const outputPath = path.join(outputDir, `favicon-${size}x${size}.png`);
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Created ${size}x${size} favicon`);
    }
    
    // Create main favicon.ico (32x32)
    await sharp(inputPath)
      .resize(32, 32)
      .toFile(path.join(outputDir, 'favicon.ico'));
    console.log('✓ Created favicon.ico');
    
    // Create Apple Touch Icon
    await sharp(inputPath)
      .resize(180, 180)
      .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('✓ Created apple-touch-icon.png');
    
  } catch (error) {
    console.error('Error processing favicon:', error);
  }
}

async function processOGImage() {
  const inputPath = './photos/sindex-full.jpeg';
  const outputPath = './public/og-image.jpg';
  
  console.log('\n📸 Processing Open Graph image...');
  
  try {
    // Create Open Graph image (1200x630 recommended)
    await sharp(inputPath)
      .resize(1200, 630, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85, progressive: true })
      .toFile(outputPath);
    console.log('✓ Created Open Graph image (1200x630)');
    
    // Also create a Twitter card image (1200x600)
    await sharp(inputPath)
      .resize(1200, 600, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85, progressive: true })
      .toFile('./public/twitter-card.jpg');
    console.log('✓ Created Twitter card image (1200x600)');
    
  } catch (error) {
    console.error('Error processing OG image:', error);
  }
}

async function main() {
  await processFavicon();
  await processOGImage();
  console.log('\n✨ Done processing favicon and social images!');
}

main().catch(console.error);
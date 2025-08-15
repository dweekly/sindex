const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function processMemberPhotos() {
  const sourceDir = path.join(__dirname, '..', 'photos', 'members');
  const outputDir = path.join(__dirname, '..', 'public', 'images', 'members');

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  // Get all jpg files in the members directory
  const files = await fs.readdir(sourceDir);
  const jpgFiles = files.filter(file => file.toLowerCase().endsWith('.jpg'));

  console.log(`Processing ${jpgFiles.length} member photos...`);

  for (const file of jpgFiles) {
    const inputPath = path.join(sourceDir, file);
    const baseName = path.basename(file, '.jpg');
    
    try {
      // Create square crop (for circular display)
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      
      const size = Math.min(metadata.width, metadata.height);
      const left = Math.floor((metadata.width - size) / 2);
      const top = Math.floor((metadata.height - size) / 2);
      
      // Generate WebP version
      await image
        .extract({ left, top, width: size, height: size })
        .resize(400, 400)
        .webp({ quality: 85 })
        .toFile(path.join(outputDir, `${baseName}.webp`));
      
      // Generate JPEG version
      await sharp(inputPath)
        .extract({ left, top, width: size, height: size })
        .resize(400, 400)
        .jpeg({ quality: 85 })
        .toFile(path.join(outputDir, `${baseName}.jpg`));
      
      console.log(`✅ Processed ${baseName}`);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }
  
  console.log('✨ Member photos processed successfully!');
}

processMemberPhotos().catch(console.error);